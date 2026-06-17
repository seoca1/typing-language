#!/usr/bin/env python3
"""
AI API 연결 테스트 스크립트

사용법:
    python test_api.py webui
    python test_api.py replicate --token r8_xxx
    python test_api.py huggingface --token hf_xxx
"""

import sys
import argparse
import requests


def test_webui(url="http://127.0.0.1:7860"):
    """Stable Diffusion WebUI 연결 테스트"""
    print(f"Testing Stable Diffusion WebUI: {url}")
    print("-" * 60)
    
    try:
        # 1. Models 체크
        print("1. Checking models...")
        response = requests.get(f"{url}/sdapi/v1/sd-models", timeout=5)
        if response.status_code == 200:
            models = response.json()
            print(f"   ✓ Found {len(models)} model(s)")
            if models:
                print(f"   Current model: {models[0].get('model_name', 'Unknown')}")
        else:
            print(f"   ✗ Failed: {response.status_code}")
            return False
        
        # 2. Options 체크
        print("\n2. Checking options...")
        response = requests.get(f"{url}/sdapi/v1/options", timeout=5)
        if response.status_code == 200:
            print("   ✓ Options accessible")
        else:
            print(f"   ✗ Failed: {response.status_code}")
        
        # 3. 간단한 생성 테스트
        print("\n3. Testing image generation (quick test)...")
        payload = {
            "prompt": "a simple circle, white background",
            "negative_prompt": "",
            "steps": 5,
            "width": 128,
            "height": 128,
        }
        response = requests.post(f"{url}/sdapi/v1/txt2img", json=payload, timeout=60)
        if response.status_code == 200:
            result = response.json()
            if "images" in result and len(result["images"]) > 0:
                print("   ✓ Image generation working!")
            else:
                print("   ✗ No images in response")
        else:
            print(f"   ✗ Failed: {response.status_code}")
        
        print("\n" + "=" * 60)
        print("✓ Stable Diffusion WebUI is ready!")
        print("=" * 60)
        return True
        
    except requests.exceptions.ConnectionError:
        print("\n✗ Connection failed!")
        print("  Make sure WebUI is running with --api flag:")
        print("  ./webui.sh --api")
        return False
    except requests.exceptions.Timeout:
        print("\n✗ Timeout!")
        print("  WebUI might be starting up. Try again in a minute.")
        return False
    except Exception as e:
        print(f"\n✗ Error: {e}")
        return False


def test_replicate(token):
    """Replicate API 연결 테스트"""
    print("Testing Replicate API")
    print("-" * 60)
    
    if not token:
        print("✗ API token required!")
        print("  Get your token from: https://replicate.com/account/api-tokens")
        return False
    
    headers = {
        "Authorization": f"Token {token}",
    }
    
    try:
        print("1. Checking authentication...")
        response = requests.get(
            "https://api.replicate.com/v1/models",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            print("   ✓ Authentication successful")
        elif response.status_code == 401:
            print("   ✗ Invalid token!")
            return False
        else:
            print(f"   ✗ Failed: {response.status_code}")
            return False
        
        print("\n" + "=" * 60)
        print("✓ Replicate API is ready!")
        print("  Note: Actual generation will cost ~$0.05 per image")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        return False


def test_huggingface(token):
    """Hugging Face API 연결 테스트"""
    print("Testing Hugging Face API")
    print("-" * 60)
    
    if not token:
        print("✗ API token required!")
        print("  Get your token from: https://huggingface.co/settings/tokens")
        return False
    
    headers = {
        "Authorization": f"Bearer {token}",
    }
    
    try:
        print("1. Checking authentication...")
        response = requests.get(
            "https://huggingface.co/api/whoami",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            user = response.json()
            print(f"   ✓ Authenticated as: {user.get('name', 'Unknown')}")
        elif response.status_code == 401:
            print("   ✗ Invalid token!")
            return False
        else:
            print(f"   ✗ Failed: {response.status_code}")
            return False
        
        print("\n" + "=" * 60)
        print("✓ Hugging Face API is ready!")
        print("  Note: Free tier might be slow or have rate limits")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Test AI API connections")
    parser.add_argument(
        "backend",
        choices=["webui", "replicate", "huggingface"],
        help="Backend to test"
    )
    parser.add_argument("--token", help="API token (for cloud backends)")
    parser.add_argument("--url", help="WebUI URL", default="http://127.0.0.1:7860")
    
    args = parser.parse_args()
    
    if args.backend == "webui":
        success = test_webui(args.url)
    elif args.backend == "replicate":
        success = test_replicate(args.token)
    elif args.backend == "huggingface":
        success = test_huggingface(args.token)
    else:
        print(f"Unknown backend: {args.backend}")
        return 1
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
