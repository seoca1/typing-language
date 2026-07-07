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
        "pose": CharacterPrompt(
            character_id="en-emily",
            name="Emily",
            pose="pose",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, stylish pose,,
            blonde hair, long wavy hair, blue eyes,,
            confident smile, hand on hip, model pose,,
            casual outfit, hoodie, jeans, sneakers,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            fashion pose, confident attitude
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "spin": CharacterPrompt(
            character_id="en-emily",
            name="Emily",
            pose="spin",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, spinning motion,,
            blonde hair, long wavy hair spinning around, blue eyes,,
            playful smile, arms out for balance,,
            casual outfit, hoodie, jeans, sneakers,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic spinning pose, motion blur effect
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "clap": CharacterPrompt(
            character_id="en-emily",
            name="Emily",
            pose="clap",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, standing,,
            blonde hair, long wavy hair, blue eyes,,
            clapping hands, joyful smile, excited expression,,
            casual outfit, hoodie, jeans, sneakers,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic pose, celebration gesture
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
        "pose": CharacterPrompt(
            character_id="jp-sakura",
            name="Sakura",
            pose="pose",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, elegant traditional pose,,
            black hair, long straight hair with hair ornament, brown eyes,,
            gentle smile, graceful posture,,
            pink kimono with floral pattern, traditional Japanese clothing,,
            white background, simple background,,
            anime style, clean lines, soft pastel colors,,
            elegant pose, serene traditional expression
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "dance": CharacterPrompt(
            character_id="jp-sakura",
            name="Sakura",
            pose="dance",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, traditional Japanese dance,,
            black hair, long straight hair with hair ornament, brown eyes,,
            elegant traditional dance expression,,
            pink kimono with floral pattern, traditional Japanese clothing,,
            white background, simple background,,
            anime style, clean lines, soft pastel colors,,
            traditional dance pose, graceful movement
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "spin": CharacterPrompt(
            character_id="jp-sakura",
            name="Sakura",
            pose="spin",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, spinning gracefully,,
            black hair, long straight hair with hair ornament, brown eyes,,
            graceful smile, elegant spin,,
            pink kimono with floral pattern, traditional Japanese clothing,,
            white background, simple background,,
            anime style, clean lines, soft pastel colors,,
            elegant spinning pose, cherry blossom petals swirling
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "clap": CharacterPrompt(
            character_id="jp-sakura",
            name="Sakura",
            pose="clap",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, standing,,
            black hair, long straight hair with hair ornament, brown eyes,,
            clapping hands, joyful smile,,
            pink kimono with floral pattern, traditional Japanese clothing,,
            white background, simple background,,
            anime style, clean lines, soft pastel colors,,
            dynamic pose, happy applause, cherry blossom petals
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "jump": CharacterPrompt(
            character_id="jp-sakura",
            name="Sakura",
            pose="jump",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, jumping in air,,
            black hair, long straight hair with hair ornament, brown eyes,,
            happy excited expression, arms up,,
            pink kimono with floral pattern, traditional Japanese clothing,,
            white background, simple background,,
            anime style, clean lines, soft pastel colors,,
            dynamic jump pose, cherry blossom petals floating
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
    },
    "en-oliver": {
        "idle": CharacterPrompt(
            character_id="en-oliver",
            name="Oliver",
            pose="idle",
            prompt="""
masterpiece, best quality, highly detailed,
1boy, solo, full body, standing,
brown hair, short neat hair, green eyes,
calm smile, gentle expression,
formal outfit, vest, dress shirt, tie, slacks, dress shoes,
white background, simple background,
anime style, clean lines, sophisticated colors,
elegant posture, refined appearance
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "wave": CharacterPrompt(
            character_id="en-oliver",
            name="Oliver",
            pose="wave",
            prompt="""
masterpiece, best quality, highly detailed,
1boy, solo, full body, standing,
brown hair, short neat hair, green eyes,
polite wave, friendly smile,
formal outfit, vest, dress shirt, tie, slacks, dress shoes,
white background, simple background,
anime style, clean lines, sophisticated colors,
courteous gesture, gentleman pose
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "jump": CharacterPrompt(
            character_id="en-oliver",
            name="Oliver",
            pose="jump",
            prompt="""
masterpiece, best quality, highly detailed,
1boy, solo, full body, jumping in air,
brown hair, short neat hair, green eyes,
surprised expression, both arms slightly raised,
formal outfit, vest, dress shirt, tie, slacks, dress shoes,
white background, simple background,
anime style, clean lines, sophisticated colors,
dynamic mid-air pose
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "pose": CharacterPrompt(
            character_id="en-oliver",
            name="Oliver",
            pose="pose",
            prompt="""
masterpiece, best quality, highly detailed,
1boy, solo, full body, standing,
brown hair, short neat hair, green eyes,
confident smile, hands in pockets,
formal outfit, vest, dress shirt, tie, slacks, dress shoes,
white background, simple background,
anime style, clean lines, sophisticated colors,
stylish relaxed pose
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "dance": CharacterPrompt(
            character_id="en-oliver",
            name="Oliver",
            pose="dance",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1boy, solo, full body, dancing,,
            brown hair, short neat hair, green eyes,,
            happy dancing expression, rhythmic movement,,
            smart casual outfit, blazer, trousers, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dance move, rhythmic pose
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "spin": CharacterPrompt(
            character_id="en-oliver",
            name="Oliver",
            pose="spin",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1boy, solo, full body, spinning motion,,
            brown hair, short neat hair, green eyes,,
            playful smile, arms out for balance,,
            smart casual outfit, blazer, trousers, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic spinning pose, energetic motion
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "clap": CharacterPrompt(
            character_id="en-oliver",
            name="Oliver",
            pose="clap",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1boy, solo, full body, standing,,
            brown hair, short neat hair, green eyes,,
            clapping hands, cheerful smile,,
            smart casual outfit, blazer, trousers, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic pose, applause gesture
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
    },
    "en-sophia": {
        "idle": CharacterPrompt(
            character_id="en-sophia",
            name="Sophia",
            pose="idle",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
purple hair, short bob cut, gray eyes, glasses,
neutral expression, cool and calm,
modern outfit, tech jacket, t-shirt, cargo pants, boots,
white background, simple background,
anime style, clean lines, tech-inspired colors,
professional pose, modern aesthetic
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "wave": CharacterPrompt(
            character_id="en-sophia",
            name="Sophia",
            pose="wave",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
purple hair, short bob cut, gray eyes, glasses,
friendly wave, slight smile,
modern outfit, tech jacket, t-shirt, cargo pants, boots,
white background, simple background,
anime style, clean lines, tech-inspired colors,
tech-savvy pose
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "jump": CharacterPrompt(
            character_id="en-sophia",
            name="Sophia",
            pose="jump",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, jumping,
purple hair, short bob cut flying, gray eyes, glasses,
excited expression, victorious pose,
modern outfit, tech jacket, t-shirt, cargo pants, boots,
white background, simple background,
anime style, clean lines, tech-inspired colors,
dynamic jump, energetic movement
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "pose": CharacterPrompt(
            character_id="en-sophia",
            name="Sophia",
            pose="pose",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
purple hair, short bob cut, gray eyes, glasses,
confident smile, thumbs up,
modern outfit, tech jacket, t-shirt, cargo pants, boots,
white background, simple background,
anime style, clean lines, tech-inspired colors,
victory pose, tech aesthetic
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "dance": CharacterPrompt(
            character_id="en-sophia",
            name="Sophia",
            pose="dance",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, dancing happily,,
            dark hair, long straight hair, glasses, hazel eyes,,
            happy dance expression, rhythmic movement,,
            tech style outfit, hoodie, jeans, sneakers,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dance move, energetic rhythm
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "spin": CharacterPrompt(
            character_id="en-sophia",
            name="Sophia",
            pose="spin",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, spinning motion,,
            dark hair, long straight hair, glasses, hazel eyes,,
            playful smile, arms out,,
            tech style outfit, hoodie, jeans, sneakers,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic spinning pose, energetic motion
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "clap": CharacterPrompt(
            character_id="en-sophia",
            name="Sophia",
            pose="clap",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, standing,,
            dark hair, long straight hair, glasses, hazel eyes,,
            clapping hands, excited smile,,
            tech style outfit, hoodie, jeans, sneakers,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic pose, excited applause
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
    },
    "jp-yuki": {
        "idle": CharacterPrompt(
            character_id="jp-yuki",
            name="Yuki",
            pose="idle",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
brown hair, twin tails with ribbons, bright eyes,
cheerful smile, energetic expression,
school uniform, sailor uniform, pleated skirt, knee socks, loafers,
white background, simple background,
anime style, clean lines, vibrant colors,
cute pose, youthful appearance
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "wave": CharacterPrompt(
            character_id="jp-yuki",
            name="Yuki",
            pose="wave",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
brown hair, twin tails with ribbons, bright eyes,
big smile, enthusiastic wave,
school uniform, sailor uniform, pleated skirt, knee socks, loafers,
white background, simple background,
anime style, clean lines, vibrant colors,
energetic gesture, kawaii style
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "jump": CharacterPrompt(
            character_id="jp-yuki",
            name="Yuki",
            pose="jump",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, jumping high,
brown hair, twin tails flying up, bright eyes,
excited expression, arms raised,
school uniform, sailor uniform, pleated skirt, knee socks, loafers,
white background, simple background,
anime style, clean lines, vibrant colors,
dynamic jump pose, playful movement
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "dance": CharacterPrompt(
            character_id="jp-yuki",
            name="Yuki",
            pose="dance",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, dancing pose,
brown hair, twin tails flowing, bright eyes,
happy expression, arms in dance position,
school uniform, sailor uniform, pleated skirt, knee socks, loafers,
white background, simple background,
anime style, clean lines, vibrant colors,
cheerful dance movement
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "pose": CharacterPrompt(
            character_id="jp-yuki",
            name="Yuki",
            pose="pose",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, cute pose,,
            brown hair, medium hair with hairclip, brown eyes,,
            cute smile, peace sign,,
            school uniform, sailor outfit, skirt, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            cute pose, cheerful expression
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "spin": CharacterPrompt(
            character_id="jp-yuki",
            name="Yuki",
            pose="spin",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, spinning motion,,
            brown hair, medium hair with hairclip, brown eyes,,
            playful smile, arms out for balance,,
            school uniform, sailor outfit, skirt, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic spinning pose, energetic motion
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "clap": CharacterPrompt(
            character_id="jp-yuki",
            name="Yuki",
            pose="clap",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, standing,,
            brown hair, medium hair with hairclip, brown eyes,,
            clapping hands, cheerful smile,,
            school uniform, sailor outfit, skirt, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic pose, happy applause
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
    },
    "jp-kaito": {
        "idle": CharacterPrompt(
            character_id="jp-kaito",
            name="Kaito",
            pose="idle",
            prompt="""
masterpiece, best quality, highly detailed,
1boy, solo, full body, standing,
black hair, messy short hair, dark eyes,
cool expression, slight smirk,
casual Japanese style, hoodie, jeans, sneakers,
white background, simple background,
anime style, clean lines, cool colors,
confident posture, modern Japanese youth
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "wave": CharacterPrompt(
            character_id="jp-kaito",
            name="Kaito",
            pose="wave",
            prompt="""
masterpiece, best quality, highly detailed,
1boy, solo, full body, standing,
black hair, messy short hair, dark eyes,
friendly wave, confident smile,
casual Japanese style, hoodie, jeans, sneakers,
white background, simple background,
anime style, clean lines, cool colors,
casual pose, charming gesture
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "jump": CharacterPrompt(
            character_id="jp-kaito",
            name="Kaito",
            pose="jump",
            prompt="""
masterpiece, best quality, highly detailed,
1boy, solo, full body, jumping,
black hair, messy short hair flying, dark eyes,
excited expression, arms raised,
casual Japanese style, hoodie, jeans, sneakers,
white background, simple background,
anime style, clean lines, cool colors,
dynamic action pose
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "pose": CharacterPrompt(
            character_id="jp-kaito",
            name="Kaito",
            pose="pose",
            prompt="""
masterpiece, best quality, highly detailed,
1boy, solo, full body, victory pose,
black hair, messy short hair, dark eyes,
confident smile, peace sign gesture,
casual Japanese style, hoodie, jeans, sneakers,
white background, simple background,
anime style, clean lines, cool colors,
stylish pose, charismatic appearance
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "dance": CharacterPrompt(
            character_id="jp-kaito",
            name="Kaito",
            pose="dance",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1boy, solo, full body, dancing,,
            dark blue hair, messy hair, blue eyes,,
            cool dance expression, rhythmic movement,,
            casual outfit, jacket, jeans, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dance move, cool rhythm
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "spin": CharacterPrompt(
            character_id="jp-kaito",
            name="Kaito",
            pose="spin",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1boy, solo, full body, spinning motion,,
            dark blue hair, messy hair, blue eyes,,
            confident smile, arms out for balance,,
            casual outfit, jacket, jeans, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic spinning pose, cool motion
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "clap": CharacterPrompt(
            character_id="jp-kaito",
            name="Kaito",
            pose="clap",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1boy, solo, full body, standing,,
            dark blue hair, messy hair, blue eyes,,
            clapping hands, cheerful smile,,
            casual outfit, jacket, jeans, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic pose, applause gesture
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
    },
    "es-isabella": {
        "idle": CharacterPrompt(
            character_id="es-isabella",
            name="Isabella",
            pose="idle",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
dark brown hair, long wavy hair with red rose, brown eyes,
passionate expression, confident smile,
traditional flamenco dress, red ruffled dress, Spanish style,
white background, simple background,
anime style, clean lines, warm vibrant colors,
elegant posture, Spanish beauty,
flamenco theme
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "wave": CharacterPrompt(
            character_id="es-isabella",
            name="Isabella",
            pose="wave",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
dark brown hair, long wavy hair with red rose, brown eyes,
graceful wave, elegant smile,
traditional flamenco dress, red ruffled dress, Spanish style,
white background, simple background,
anime style, clean lines, warm vibrant colors,
flamenco gesture, Spanish elegance
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "dance": CharacterPrompt(
            character_id="es-isabella",
            name="Isabella",
            pose="dance",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, flamenco dance pose,
dark brown hair, long wavy hair flowing with red rose, brown eyes,
intense expression, passionate eyes,
traditional flamenco dress, red ruffled dress flowing, Spanish style,
white background, simple background,
anime style, clean lines, warm vibrant colors,
dynamic flamenco pose, arms raised gracefully,
dress swirling, traditional Spanish dance
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "clap": CharacterPrompt(
            character_id="es-isabella",
            name="Isabella",
            pose="clap",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
dark brown hair, long wavy hair with red rose, brown eyes,
excited expression, clapping hands above head,
traditional flamenco dress, red ruffled dress, Spanish style,
white background, simple background,
anime style, clean lines, warm vibrant colors,
celebratory pose, rhythmic gesture
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "pose": CharacterPrompt(
            character_id="es-isabella",
            name="Isabella",
            pose="pose",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, elegant flamenco pose,,
            dark hair, long curly hair with flower, brown eyes,,
            confident smile, dramatic pose,,
            flamenco dancer outfit, red dress, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            elegant flamenco pose, dramatic expression
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "spin": CharacterPrompt(
            character_id="es-isabella",
            name="Isabella",
            pose="spin",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, flamenco spin,,
            dark hair, long curly hair with flower, brown eyes,,
            flamenco dance expression, arms extended,,
            flamenco dancer outfit, red dress, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            flamenco spin pose, dramatic motion
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "jump": CharacterPrompt(
            character_id="es-isabella",
            name="Isabella",
            pose="jump",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, jumping with castanets,,
            dark hair, long curly hair with flower, brown eyes,,
            excited joyful expression, arms up,,
            flamenco dancer outfit, red dress, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic flamenco jump pose, energetic motion
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
    },
    "es-carlos": {
        "idle": CharacterPrompt(
            character_id="es-carlos",
            name="Carlos",
            pose="idle",
            prompt="""
masterpiece, best quality, highly detailed,
1boy, solo, full body, standing,
dark hair, short curly hair, brown eyes,
friendly smile, warm expression,
casual sporty outfit, soccer jersey, shorts, athletic shoes,
white background, simple background,
anime style, clean lines, energetic colors,
athletic build, relaxed posture
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "wave": CharacterPrompt(
            character_id="es-carlos",
            name="Carlos",
            pose="wave",
            prompt="""
masterpiece, best quality, highly detailed,
1boy, solo, full body, standing,
dark hair, short curly hair, brown eyes,
bright smile, enthusiastic wave,
casual sporty outfit, soccer jersey, shorts, athletic shoes,
white background, simple background,
anime style, clean lines, energetic colors,
friendly gesture, sporty appearance
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "jump": CharacterPrompt(
            character_id="es-carlos",
            name="Carlos",
            pose="jump",
            prompt="""
masterpiece, best quality, highly detailed,
1boy, solo, full body, jumping celebration,
dark hair, short curly hair, brown eyes,
victorious expression, fist pump,
casual sporty outfit, soccer jersey, shorts, athletic shoes,
white background, simple background,
anime style, clean lines, energetic colors,
athletic jump, celebrating pose
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "pose": CharacterPrompt(
            character_id="es-carlos",
            name="Carlos",
            pose="pose",
            prompt="""
masterpiece, best quality, highly detailed,
1boy, solo, full body, victory pose,
dark hair, short curly hair, brown eyes,
proud smile, arms crossed confidently,
casual sporty outfit, soccer jersey, shorts, athletic shoes,
white background, simple background,
anime style, clean lines, energetic colors,
confident athletic pose
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "dance": CharacterPrompt(
            character_id="es-carlos",
            name="Carlos",
            pose="dance",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1boy, solo, full body, dancing,,
            brown hair, short hair, brown eyes,,
            happy dance expression, rhythmic movement,,
            casual outfit, t-shirt, jeans, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dance move, Spanish rhythm
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "spin": CharacterPrompt(
            character_id="es-carlos",
            name="Carlos",
            pose="spin",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1boy, solo, full body, spinning motion,,
            brown hair, short hair, brown eyes,,
            playful smile, arms out for balance,,
            casual outfit, t-shirt, jeans, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic spinning pose, energetic motion
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "clap": CharacterPrompt(
            character_id="es-carlos",
            name="Carlos",
            pose="clap",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1boy, solo, full body, standing,,
            brown hair, short hair, brown eyes,,
            clapping hands, cheerful smile,,
            casual outfit, t-shirt, jeans, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic pose, happy applause
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
    },
    "es-luna": {
        "idle": CharacterPrompt(
            character_id="es-luna",
            name="Luna",
            pose="idle",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
auburn hair, messy bun with paintbrush, hazel eyes,
thoughtful expression, artistic vibe,
bohemian outfit, beret, painter's smock, casual pants, boots,
white background, simple background,
anime style, clean lines, artistic colors,
creative posture, painter aesthetic,
colorful paint splashes accent
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "wave": CharacterPrompt(
            character_id="es-luna",
            name="Luna",
            pose="wave",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
auburn hair, messy bun with paintbrush, hazel eyes,
bright smile, friendly wave,
bohemian outfit, beret, painter's smock, casual pants, boots,
white background, simple background,
anime style, clean lines, artistic colors,
artistic gesture, creative pose
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "jump": CharacterPrompt(
            character_id="es-luna",
            name="Luna",
            pose="jump",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, jumping,
auburn hair, messy bun with paintbrush flying, hazel eyes,
excited expression, arms raised,
bohemian outfit, beret, painter's smock, casual pants, boots,
white background, simple background,
anime style, clean lines, artistic colors,
artistic celebration, creative energy
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "pose": CharacterPrompt(
            character_id="es-luna",
            name="Luna",
            pose="pose",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, artistic pose,
auburn hair, messy bun with paintbrush, hazel eyes,
inspired expression, holding palette,
bohemian outfit, beret, painter's smock, casual pants, boots,
white background, simple background,
anime style, clean lines, artistic colors,
creative gesture, artistic flair
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "dance": CharacterPrompt(
            character_id="es-luna",
            name="Luna",
            pose="dance",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, artistic dancing,,
            blonde hair, long wavy hair, blue eyes,,
            artistic dance expression, graceful movement,,
            artist outfit, casual artistic clothes, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dance move, artistic rhythm
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "spin": CharacterPrompt(
            character_id="es-luna",
            name="Luna",
            pose="spin",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, spinning motion,,
            blonde hair, long wavy hair, blue eyes,,
            playful smile, arms gracefully positioned,,
            artist outfit, casual artistic clothes, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic spinning pose, artistic motion
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "clap": CharacterPrompt(
            character_id="es-luna",
            name="Luna",
            pose="clap",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, standing,,
            blonde hair, long wavy hair, blue eyes,,
            clapping hands, artistic smile,,
            artist outfit, casual artistic clothes, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic pose, creative applause
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
        "wave": CharacterPrompt(
            character_id="kr-hana",
            name="Hana",
            pose="wave",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
black hair, long straight hair with traditional Korean hair pin (binyeo),
shy smile, gentle wave with both hands,
traditional Korean hanbok, pink and white jeogori, flowing chima,
white background, simple background,
anime style, clean lines, elegant pastel colors,
modest gesture, traditional Korean etiquette,
flowing hanbok sleeves
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "dance": CharacterPrompt(
            character_id="kr-hana",
            name="Hana",
            pose="dance",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, traditional Korean dance pose,
black hair, long straight hair flowing with traditional Korean hair pin (binyeo),
serene expression, graceful smile,
traditional Korean hanbok, pink and white jeogori, flowing chima,
white background, simple background,
anime style, clean lines, elegant pastel colors,
elegant dance movement, traditional Korean fan dance,
flowing hanbok, traditional Korean choreography
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "clap": CharacterPrompt(
            character_id="kr-hana",
            name="Hana",
            pose="clap",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
black hair, long straight hair with traditional Korean hair pin (binyeo),
joyful expression, clapping hands gently,
traditional Korean hanbok, pink and white jeogori, flowing chima,
white background, simple background,
anime style, clean lines, elegant pastel colors,
celebratory pose, refined gesture
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "pose": CharacterPrompt(
            character_id="kr-hana",
            name="Hana",
            pose="pose",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, elegant traditional pose,,
            black hair, long hair with traditional accessory, dark eyes,,
            gentle traditional smile, graceful posture,,
            traditional Korean hanbok, vibrant colors, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            elegant traditional pose, serene hanbok expression
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "spin": CharacterPrompt(
            character_id="kr-hana",
            name="Hana",
            pose="spin",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, spinning with hanbok,,
            black hair, long hair with traditional accessory, dark eyes,,
            graceful smile, elegant spin,,
            traditional Korean hanbok, vibrant colors, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            elegant spinning pose, graceful hanbok motion
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "jump": CharacterPrompt(
            character_id="kr-hana",
            name="Hana",
            pose="jump",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, jumping with hanbok,,
            black hair, long hair with traditional accessory, dark eyes,,
            joyful excited expression, arms up,,
            traditional Korean hanbok, vibrant colors, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic jump pose, joyful hanbok motion
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
    },
    "kr-minho": {
        "idle": CharacterPrompt(
            character_id="kr-minho",
            name="Minho",
            pose="idle",
            prompt="""
masterpiece, best quality, highly detailed,
1boy, solo, full body, standing,
dyed hair, stylish short hair with highlights, sharp eyes,
cool expression, charismatic gaze,
K-pop idol outfit, stylish jacket, skinny jeans, designer sneakers,
white background, simple background,
anime style, clean lines, trendy colors,
confident posture, idol aesthetic,
modern Korean fashion
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "wave": CharacterPrompt(
            character_id="kr-minho",
            name="Minho",
            pose="wave",
            prompt="""
masterpiece, best quality, highly detailed,
1boy, solo, full body, standing,
dyed hair, stylish short hair with highlights, sharp eyes,
charming smile, finger heart gesture (Korean),
K-pop idol outfit, stylish jacket, skinny jeans, designer sneakers,
white background, simple background,
anime style, clean lines, trendy colors,
idol pose, fan service gesture,
sparkle effects
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "dance": CharacterPrompt(
            character_id="kr-minho",
            name="Minho",
            pose="dance",
            prompt="""
masterpiece, best quality, highly detailed,
1boy, solo, full body, dynamic dance pose,
dyed hair, stylish short hair moving with highlights, sharp eyes,
intense expression, focused eyes,
K-pop idol outfit, stylish jacket, skinny jeans, designer sneakers,
white background, simple background,
anime style, clean lines, trendy colors,
powerful dance move, K-pop choreography,
dynamic motion
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "pose": CharacterPrompt(
            character_id="kr-minho",
            name="Minho",
            pose="pose",
            prompt="""
masterpiece, best quality, highly detailed,
1boy, solo, full body, victory pose,
dyed hair, stylish short hair with highlights, sharp eyes,
confident smile, peace sign,
K-pop idol outfit, stylish jacket, skinny jeans, designer sneakers,
white background, simple background,
anime style, clean lines, trendy colors,
stylish pose, idol charm
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "spin": CharacterPrompt(
            character_id="kr-minho",
            name="Minho",
            pose="spin",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1boy, solo, full body, spinning with idol style,,
            blonde hair, styled idol hair, dark eyes,,
            confident smile, arms out for balance,,
            K-pop idol style outfit, stylish clothes, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic spinning pose, cool idol motion
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "clap": CharacterPrompt(
            character_id="kr-minho",
            name="Minho",
            pose="clap",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1boy, solo, full body, standing,,
            blonde hair, styled idol hair, dark eyes,,
            clapping hands, cheerful smile,,
            K-pop idol style outfit, stylish clothes, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic pose, idol applause gesture
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "jump": CharacterPrompt(
            character_id="kr-minho",
            name="Minho",
            pose="jump",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1boy, solo, full body, jumping with idol style,,
            blonde hair, styled idol hair, dark eyes,,
            excited joyful expression, arms up,,
            K-pop idol style outfit, stylish clothes, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic idol jump pose, energetic motion
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
    },
    "kr-jiwoo": {
        "idle": CharacterPrompt(
            character_id="kr-jiwoo",
            name="Jiwoo",
            pose="idle",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
dyed pastel pink hair, short bob cut, cute eyes,
cheerful expression, gamer aesthetic,
casual Korean fashion, oversized hoodie, shorts, thigh-high socks, sneakers,
white background, simple background,
anime style, clean lines, cute pastel colors,
relaxed posture, modern Korean youth,
gaming headphones around neck
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "wave": CharacterPrompt(
            character_id="kr-jiwoo",
            name="Jiwoo",
            pose="wave",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, standing,
dyed pastel pink hair, short bob cut, cute eyes,
bright smile, enthusiastic wave,
casual Korean fashion, oversized hoodie, shorts, thigh-high socks, sneakers,
white background, simple background,
anime style, clean lines, cute pastel colors,
energetic gesture, kawaii Korean style,
gaming headphones around neck
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "jump": CharacterPrompt(
            character_id="kr-jiwoo",
            name="Jiwoo",
            pose="jump",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, jumping excitedly,
dyed pastel pink hair, short bob cut flying, cute eyes,
excited expression, victory gesture,
casual Korean fashion, oversized hoodie, shorts, thigh-high socks, sneakers,
white background, simple background,
anime style, clean lines, cute pastel colors,
playful jump, gamer celebration,
gaming headphones around neck
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "pose": CharacterPrompt(
            character_id="kr-jiwoo",
            name="Jiwoo",
            pose="pose",
            prompt="""
masterpiece, best quality, highly detailed,
1girl, solo, full body, victory pose,
dyed pastel pink hair, short bob cut, cute eyes,
proud smile, double peace sign,
casual Korean fashion, oversized hoodie, shorts, thigh-high socks, sneakers,
white background, simple background,
anime style, clean lines, cute pastel colors,
cute pose, modern Korean gamer aesthetic,
            gaming headphones around neck
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "dance": CharacterPrompt(
            character_id="kr-jiwoo",
            name="Jiwoo",
            pose="dance",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, dancing gamer style,,
            dark hair, short hair with gaming headset, dark eyes,,
            happy dance expression, rhythmic movement,,
            gamer style outfit, hoodie, casual clothes, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dance move, gamer energy rhythm
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "spin": CharacterPrompt(
            character_id="kr-jiwoo",
            name="Jiwoo",
            pose="spin",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, spinning motion,,
            dark hair, short hair with gaming headset, dark eyes,,
            playful smile, arms out for balance,,
            gamer style outfit, hoodie, casual clothes, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic spinning pose, playful gamer motion
""".strip(),
            negative_prompt=NEGATIVE_PROMPT,
        ),
        "clap": CharacterPrompt(
            character_id="kr-jiwoo",
            name="Jiwoo",
            pose="clap",
            prompt="""
            masterpiece, best quality, highly detailed,,
            1girl, solo, full body, standing,,
            dark hair, short hair with gaming headset, dark eyes,,
            clapping hands, excited gamer smile,,
            gamer style outfit, hoodie, casual clothes, shoes,,
            white background, simple background,,
            anime style, clean lines, vibrant colors,,
            dynamic pose, excited gamer applause
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


class OpenAIAPI:
    """OpenAI DALL-E / GPT Image Generation API 백엔드"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://api.openai.com/v1/images/generations"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    def check_connection(self) -> bool:
        """API 연결 확인"""
        try:
            response = requests.get(
                "https://api.openai.com/v1/models",
                headers=self.headers,
                timeout=10
            )
            return response.status_code == 200
        except:
            return False

    def generate(self, prompt: CharacterPrompt) -> Optional[bytes]:
        """이미지 생성"""
        payload = {
            "model": "gpt-image-1",
            "prompt": prompt.prompt,
            "n": 1,
            "size": "1024x1024",
            "quality": "medium",
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
                result = response.json()
                if result.get("data") and result["data"][0].get("b64_json"):
                    image_data = base64.b64decode(
                        result["data"][0]["b64_json"]
                    )
                    print(f"  ✓ 생성 완료: {len(image_data)} bytes")
                    return image_data
                elif result.get("data") and result["data"][0].get("url"):
                    image_resp = requests.get(result["data"][0]["url"])
                    print(f"  ✓ 생성 완료: {len(image_resp.content)} bytes")
                    return image_resp.content
                else:
                    print(f"  ✗ 생성 실패: 이미지 데이터 없음")
                    return None
            else:
                error = response.json()
                print(f"  ✗ 생성 실패: {error}")
                return None

        except Exception as e:
            print(f"  ✗ 에러: {e}")
            return None


class MiniMaxAPI:
    """MiniMax Image Generation API 백엔드"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://api.minimaxi.com/v1/image_generation"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    def check_connection(self) -> bool:
        """API 연결 확인"""
        return bool(self.api_key) and len(self.api_key) > 10

    def generate(self, prompt: CharacterPrompt) -> Optional[bytes]:
        """이미지 생성"""
        payload = {
            "model": "image-01-live",
            "prompt": prompt.prompt,
            "style": {
                "style_type": "漫画",
                "style_weight": 0.8
            },
            "aspect_ratio": "2:3",
            "n": 1,
            "response_format": "base64",
            "prompt_optimizer": True,
        }

        try:
            print(f"  생성 중: {prompt.name} - {prompt.pose}...")

            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload,
                timeout=60
            )

            if response.status_code == 200:
                result = response.json()
                if result.get("data", {}).get("image_base64"):
                    image_data = base64.b64decode(
                        result["data"]["image_base64"][0]
                    )
                    print(f"  ✓ 생성 완료: {len(image_data)} bytes")
                    return image_data
                else:
                    print(f"  ✗ 생성 실패: 이미지 데이터 없음")
                    return None
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
    elif backend == "minimax":
        if not api_token:
            print("✗ MiniMax API 토큰이 필요합니다: --token 옵션 사용")
            return
        client = MiniMaxAPI(api_token)
        print("MiniMax API 연결 중...")
    elif backend == "openai":
        if not api_token:
            print("✗ OpenAI API 토큰이 필요합니다: --token 옵션 사용")
            return
        client = OpenAIAPI(api_token)
        print("OpenAI API 연결 중...")
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
        choices=["webui", "replicate", "huggingface", "minimax", "openai"],
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
        default=Path("../../prototype/public/characters"),
        help="출력 디렉토리 (기본: ../../prototype/public/characters)",
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
