#!/usr/bin/env python3
"""
캐릭터 이미지 자동 생성 스크립트

지원하는 AI 백엔드:
1. Stable Diffusion WebUI API (로컬)
2. Replicate API (클라우드)
3. Hugging Face Inference API (클라우드)

사용법:
    python generate_characters.py --backend webui --character en-emily
    python generate_characters.py --backend replicate --all
    python generate_characters.py --backend huggingface --language jp
"""

import os
import json
import base64
import argparse
import requests
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
from time import sleep

# ===== 프롬프트 정의 =====

@dataclass
class CharacterPrompt:
    """캐릭터 프롬프트 데이터"""
    character_id: str
    name: str
    pose: str
    prompt: str
    negative_prompt: str
    width: int = 512
    height: int = 768

# 공통 네거티브 프롬프트
NEGATIVE_PROMPT = """
lowres, bad anatomy, bad hands, text, error, missing fingers,
extra digit, fewer digits, cropped, worst quality, low quality,
normal quality, jpeg artifacts, signature, watermark, username,
blurry, artist name, multiple views, multiple angles, split screen
""".strip()

# 캐릭터 프롬프트 데이터베이스
CHARACTER_PROMPTS: Dict[str, Dict[str, CharacterPrompt]] = {
    "en-emily": {
        "idle": CharacterPrompt(
            character_id="en-emily",
            name="Emily",
            pose="idle",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
blonde hair, long wavy hair, blue eyes,
smiling, friendly expression,
casual outfit, hoodie, jeans, sneakers,
white background, simple background,
anime style, clean lines, vibrant colors,
professional illustration
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "wave": CharacterPrompt(
            character_id="en-emily",
            name="Emily",
            pose="wave",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
blonde hair, long wavy hair, blue eyes,
waving hand, cheerful smile, energetic pose,
casual outfit, hoodie, jeans, sneakers,
white background, simple background,
anime style, clean lines, vibrant colors,
dynamic pose, friendly gesture
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "jump": CharacterPrompt(
            character_id="en-emily",
            name="Emily",
            pose="jump",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, jumping in air,
blonde hair, long wavy hair flowing, blue eyes,
excited expression, both arms raised,
casual outfit, hoodie, jeans, sneakers,
white background, simple background,
anime style, clean lines, vibrant colors,
dynamic action pose, mid-air jump
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "dance": CharacterPrompt(
            character_id="en-emily",
            name="Emily",
            pose="dance",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, dancing pose,
blonde hair, long wavy hair flowing, blue eyes,
happy expression, arms outstretched,
casual outfit, hoodie, jeans, sneakers,
white background, simple background,
anime style, clean lines, vibrant colors,
graceful dance pose, joyful movement
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
    },
    "jp-sakura": {
        "idle": CharacterPrompt(
            character_id="jp-sakura",
            name="Sakura",
            pose="idle",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
black hair, long straight hair with hair ornament, brown eyes,
gentle smile, serene expression,
pink kimono with floral pattern, traditional Japanese clothing,
white background, simple background,
anime style, clean lines, soft pastel colors,
graceful posture, traditional beauty,
cherry blossom motif
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "wave": CharacterPrompt(
            character_id="jp-sakura",
            name="Sakura",
            pose="wave",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
black hair, long straight hair with hair ornament, brown eyes,
shy smile, waving hand gently,
pink kimono with floral pattern, traditional Japanese clothing,
white background, simple background,
anime style, clean lines, soft pastel colors,
delicate gesture, modest pose,
cherry blossom petals falling
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
    },
    "kr-hana": {
        "idle": CharacterPrompt(
            character_id="kr-hana",
            name="Hana",
            pose="idle",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
black hair, long straight hair with traditional Korean hair pin (binyeo),
gentle smile, graceful expression,
traditional Korean hanbok, pink and white jeogori, flowing chima,
white background, simple background,
anime style, clean lines, elegant pastel colors,
refined posture, traditional Korean beauty,
Korean traditional motifs
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
    },
}

# ===== AI 백엔드 =====

class StableDiffusionWebUI:
    """Stable Diffusion WebUI API 백엔드"""
    
    def __init__(self, api_url: str = "http://127.0.0.1:7860"):
        self.api_url = api_url
        self.txt2img_url = f"{api_url}/sdapi/v1/txt2img"
        
    def check_connection(self) -> bool:
        """API 연결 확인"""
        try:
            response = requests.get(f"{self.api_url}/sdapi/v1/sd-models", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def generate(self, prompt: CharacterPrompt) -> Optional[bytes]:
        """이미지 생성"""
        payload = {
            "prompt": prompt.prompt,
            "negative_prompt": prompt.negative_prompt,
            "steps": 30,
            "width": prompt.width,
            "height": prompt.height,
            "cfg_scale": 7,
            "sampler_name": "DPM++ 2M Karras",
            "seed": -1,
        }
        
        try:
            print(f"  생성 중: {prompt.name} - {prompt.pose}...")
            response = requests.post(self.txt2img_url, json=payload, timeout=120)
            response.raise_for_status()
            
            result = response.json()
            if "images" in result and len(result["images"]) > 0:
                # Base64 디코딩
                image_data = base64.b64decode(result["images"][0])
                print(f"  ✓ 생성 완료: {len(image_data)} bytes")
                return image_data
            else:
                print(f"  ✗ 생성 실패: 응답에 이미지 없음")
                return None
                
        except requests.exceptions.Timeout:
            print(f"  ✗ 타임아웃: 120초 초과")
            return None
        except Exception as e:
            print(f"  ✗ 에러: {e}")
            return None


class ReplicateAPI:
    """Replicate API 백엔드 (클라우드)"""
    
    def __init__(self, api_token: str):
        self.api_token = api_token
        self.headers = {
            "Authorization": f"Token {api_token}",
            "Content-Type": "application/json",
        }
        self.api_url = "https://api.replicate.com/v1/predictions"
        
    def check_connection(self) -> bool:
        """API 연결 확인"""
        try:
            response = requests.get(
                "https://api.replicate.com/v1/models",
                headers=self.headers,
                timeout=5
            )
            return response.status_code == 200
        except:
            return False
    
    def generate(self, prompt: CharacterPrompt) -> Optional[bytes]:
        """이미지 생성"""
        # Stable Diffusion 모델 사용
        model_version = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
        
        payload = {
            "version": model_version,
            "input": {
                "prompt": prompt.prompt,
                "negative_prompt": prompt.negative_prompt,
                "width": prompt.width,
                "height": prompt.height,
                "num_outputs": 1,
            }
        }
        
        try:
            print(f"  생성 요청: {prompt.name} - {prompt.pose}...")
            
            # 예측 생성
            response = requests.post(self.api_url, headers=self.headers, json=payload)
            response.raise_for_status()
            prediction = response.json()
            
            # 완료 대기
            prediction_url = prediction["urls"]["get"]
            max_wait = 60
            waited = 0
            
            while waited < max_wait:
                sleep(2)
                waited += 2
                
                response = requests.get(prediction_url, headers=self.headers)
                prediction = response.json()
                
                status = prediction["status"]
                print(f"  상태: {status} ({waited}s)")
                
                if status == "succeeded":
                    output_url = prediction["output"][0]
                    image_response = requests.get(output_url)
                    print(f"  ✓ 생성 완료: {len(image_response.content)} bytes")
                    return image_response.content
                elif status == "failed":
                    print(f"  ✗ 생성 실패: {prediction.get('error', 'Unknown error')}")
                    return None
            
            print(f"  ✗ 타임아웃: {max_wait}초 초과")
            return None
            
        except Exception as e:
            print(f"  ✗ 에러: {e}")
            return None


class HuggingFaceAPI:
    """Hugging Face Inference API 백엔드"""
    
    def __init__(self, api_token: str):
        self.api_token = api_token
        self.headers = {"Authorization": f"Bearer {api_token}"}
        # 무료 Stable Diffusion 모델
        self.api_url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
        
    def check_connection(self) -> bool:
        """API 연결 확인"""
        try:
            response = requests.get(
                "https://huggingface.co/api/whoami",
                headers=self.headers,
                timeout=5
            )
            return response.status_code == 200
        except:
            return False
    
    def generate(self, prompt: CharacterPrompt) -> Optional[bytes]:
        """이미지 생성"""
        payload = {
            "inputs": prompt.prompt,
            "parameters": {
                "negative_prompt": prompt.negative_prompt,
                "width": prompt.width,
                "height": prompt.height,
            }
        }
        
        try:
            print(f"  생성 중: {prompt.name} - {prompt.pose}...")
            
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload,
                timeout=120
            )
            
            if response.status_code == 200:
                print(f"  ✓ 생성 완료: {len(response.content)} bytes")
                return response.content
            else:
                error = response.json()
                print(f"  ✗ 생성 실패: {error}")
                return None
                
        except Exception as e:
            print(f"  ✗ 에러: {e}")
            return None


# ===== 메인 로직 =====

def ensure_directory(path: Path):
    """디렉토리 생성"""
    path.mkdir(parents=True, exist_ok=True)


def save_image(image_data: bytes, output_path: Path):
    """이미지 저장"""
    with open(output_path, "wb") as f:
        f.write(image_data)
    print(f"  → 저장: {output_path}")


def generate_character_images(
    backend: str,
    character_ids: List[str],
    output_dir: Path,
    api_token: Optional[str] = None,
    api_url: Optional[str] = None,
):
    """캐릭터 이미지 생성"""
    
    # 백엔드 초기화
    if backend == "webui":
        url = api_url or "http://127.0.0.1:7860"
        client = StableDiffusionWebUI(url)
        print(f"Stable Diffusion WebUI 연결 중: {url}")
    elif backend == "replicate":
        if not api_token:
            print("✗ Replicate API 토큰이 필요합니다: --token 옵션 사용")
            return
        client = ReplicateAPI(api_token)
        print("Replicate API 연결 중...")
    elif backend == "huggingface":
        if not api_token:
            print("✗ Hugging Face API 토큰이 필요합니다: --token 옵션 사용")
            return
        client = HuggingFaceAPI(api_token)
        print("Hugging Face API 연결 중...")
    else:
        print(f"✗ 지원하지 않는 백엔드: {backend}")
        return
    
    # 연결 확인
    if not client.check_connection():
        print(f"✗ API 연결 실패")
        if backend == "webui":
            print("  Stable Diffusion WebUI가 실행 중인지 확인하세요.")
            print("  실행 명령: ./webui.sh --api")
        return
    
    print(f"✓ API 연결 성공\n")
    
    # 이미지 생성
    total = 0
    success = 0
    
    for char_id in character_ids:
        if char_id not in CHARACTER_PROMPTS:
            print(f"⚠ 캐릭터를 찾을 수 없습니다: {char_id}")
            continue
        
        prompts = CHARACTER_PROMPTS[char_id]
        print(f"\n{'='*60}")
        print(f"캐릭터: {char_id} ({len(prompts)} 포즈)")
        print('='*60)
        
        # 출력 디렉토리 생성
        # char_id 형식: "en-emily" → "en/emily"
        parts = char_id.split('-')
        if len(parts) == 2:
            lang, name = parts
            char_dir = output_dir / lang / name
        else:
            char_dir = output_dir / char_id
        
        ensure_directory(char_dir)
        
        for pose_name, prompt in prompts.items():
            total += 1
            output_path = char_dir / f"{pose_name}.png"
            
            # 이미 존재하면 스킵
            if output_path.exists():
                print(f"⊙ 스킵 (이미 존재): {output_path}")
                success += 1
                continue
            
            # 생성
            image_data = client.generate(prompt)
            
            if image_data:
                save_image(image_data, output_path)
                success += 1
            else:
                print(f"  ✗ 생성 실패: {char_id} - {pose_name}")
            
            # 요청 간 대기 (API 제한 방지)
            if backend != "webui":
                sleep(1)
    
    # 결과
    print(f"\n{'='*60}")
    print(f"완료: {success}/{total} 성공")
    print('='*60)


def main():
    parser = argparse.ArgumentParser(description="캐릭터 이미지 자동 생성")
    
    parser.add_argument(
        "--backend",
        choices=["webui", "replicate", "huggingface"],
        default="webui",
        help="AI 백엔드 선택 (기본: webui)",
    )
    
    parser.add_argument(
        "--character",
        help="생성할 캐릭터 ID (예: en-emily)",
    )
    
    parser.add_argument(
        "--language",
        help="언어별 모든 캐릭터 생성 (예: en)",
    )
    
    parser.add_argument(
        "--all",
        action="store_true",
        help="모든 캐릭터 생성",
    )
    
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("../prototype/public/characters"),
        help="출력 디렉토리 (기본: ../prototype/public/characters)",
    )
    
    parser.add_argument(
        "--token",
        help="API 토큰 (Replicate/HuggingFace)",
    )
    
    parser.add_argument(
        "--url",
        help="WebUI API URL (기본: http://127.0.0.1:7860)",
    )
    
    args = parser.parse_args()
    
    # 캐릭터 ID 목록 결정
    if args.all:
        character_ids = list(CHARACTER_PROMPTS.keys())
    elif args.language:
        character_ids = [
            cid for cid in CHARACTER_PROMPTS.keys()
            if cid.startswith(f"{args.language}-")
        ]
    elif args.character:
        character_ids = [args.character]
    else:
        print("✗ --character, --language, 또는 --all 중 하나를 지정하세요")
        parser.print_help()
        return
    
    if not character_ids:
        print("✗ 생성할 캐릭터가 없습니다")
        return
    
    print(f"생성 대상: {', '.join(character_ids)}\n")
    
    # 생성 실행
    generate_character_images(
        backend=args.backend,
        character_ids=character_ids,
        output_dir=args.output,
        api_token=args.token,
        api_url=args.url,
    )


if __name__ == "__main__":
    main()
