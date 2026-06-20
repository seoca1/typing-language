#!/usr/bin/env python3
"""
Migrate WordEntry `meaning` to `meanings: { en, ko, ja, es }`.

The original corpus has `meaning: <text>` in mixed languages:
- EN corpus: Korean meanings (안녕, 부디, 미안)
- JP corpus: English meanings (hello, good morning)
- ES corpus: Korean meanings (안녕, 고마워)
- KR corpus: English meanings (hello, thank you)

This script:
1. Detects each meaning's language (heuristic: Korean chars = ko, etc.)
2. Converts to `meanings: { <lang>: <text> }` map
3. Adds English meanings to entries that have only Korean ones
   (using a small manual dictionary for common words)
4. Adds the new field to the corpus
"""

import re
from pathlib import Path
import sys

CORPUS_PATH = Path(__file__).parent.parent / "prototype" / "src" / "data" / "corpus.ts"

# ============================================================================
# Comprehensive 4-language dictionary (Phase G expansion)
# Keys are lowercase display values from corpus.ts
# Values provide meanings in all 4 native languages
# ============================================================================

COMMON_DICT = {
    # === GREETINGS ===
    "hello": {
        "en": "hello (greeting)",
        "ko": "안녕 (인사)",
        "ja": "こんにちは (挨拶)",
        "es": "hola (saludo)",
    },
    "hi": {
        "en": "hi (casual greeting)",
        "ko": "안녕 (캐주얼)",
        "ja": "やあ (カジュアル)",
        "es": "hola (informal)",
    },
    "goodbye": {
        "en": "goodbye",
        "ko": "안녕히 가세요",
        "ja": "さようなら",
        "es": "adiós",
    },
    "bye": {
        "en": "bye (casual)",
        "ko": "잘 가 (캐주얼)",
        "ja": "バイバイ",
        "es": "chao",
    },
    "thanks": {
        "en": "thanks",
        "ko": "고마워",
        "ja": "ありがとう",
        "es": "gracias",
    },
    "thank": {
        "en": "thank you",
        "ko": "감사합니다",
        "ja": "ありがとうございます",
        "es": "gracias",
    },
    "please": {
        "en": "please",
        "ko": "부디 / 제발",
        "ja": "お願いします",
        "es": "por favor",
    },
    "sorry": {
        "en": "sorry",
        "ko": "미안합니다",
        "ja": "ごめんなさい",
        "es": "lo siento",
    },
    "yes": {
        "en": "yes",
        "ko": "네",
        "ja": "はい",
        "es": "sí",
    },
    "no": {
        "en": "no",
        "ko": "아니오",
        "ja": "いいえ",
        "es": "no",
    },
    "welcome": {
        "en": "welcome",
        "ko": "환영합니다",
        "ja": "ようこそ",
        "es": "bienvenido",
    },
    "good night": {
        "en": "good night",
        "ko": "안녕히 주무세요",
        "ja": "おやすみなさい",
        "es": "buenas noches",
    },
    "good morning": {
        "en": "good morning",
        "ko": "좋은 아침",
        "ja": "おはようございます",
        "es": "buenos días",
    },
    "good evening": {
        "en": "good evening",
        "ko": "좋은 저녁",
        "ja": "こんばんは",
        "es": "buenas tardes",
    },
    "good afternoon": {
        "en": "good afternoon",
        "ko": "좋은 오후",
        "ja": "こんにちは",
        "es": "buenas tardes",
    },
    "see you": {
        "en": "see you",
        "ko": "또 봐",
        "ja": "またね",
        "es": "hasta luego",
    },
    "nice to meet you": {
        "en": "nice to meet you",
        "ko": "만나서 반가워요",
        "ja": "はじめまして",
        "es": "mucho gusto",
    },

    # === BASIC ===
    "okay": {
        "en": "okay / alright",
        "ko": "괜찮아",
        "ja": "大丈夫",
        "es": "está bien",
    },
    "ok": {
        "en": "OK / alright",
        "ko": "괜찮아",
        "ja": "OK",
        "es": "OK",
    },
    "maybe": {
        "en": "maybe",
        "ko": "아마",
        "ja": "たぶん",
        "es": "tal vez",
    },
    "really": {
        "en": "really",
        "ko": "정말",
        "ja": "本当に",
        "es": "de verdad",
    },
    "what": {
        "en": "what",
        "ko": "무엇",
        "ja": "何",
        "es": "qué",
    },
    "where": {
        "en": "where",
        "ko": "어디",
        "ja": "どこ",
        "es": "dónde",
    },
    "when": {
        "en": "when",
        "ko": "언제",
        "ja": "いつ",
        "es": "cuándo",
    },
    "who": {
        "en": "who",
        "ko": "누구",
        "ja": "誰",
        "es": "quién",
    },
    "why": {
        "en": "why",
        "ko": "왜",
        "ja": "なぜ",
        "es": "por qué",
    },
    "how": {
        "en": "how",
        "ko": "어떻게",
        "ja": "どのように",
        "es": "cómo",
    },

    # === NUMBERS ===
    "one": {"en": "one", "ko": "하나", "ja": "一 (いち)", "es": "uno"},
    "two": {"en": "two", "ko": "둘", "ja": "二 (に)", "es": "dos"},
    "three": {"en": "three", "ko": "셋", "ja": "三 (さん)", "es": "tres"},
    "four": {"en": "four", "ko": "넷", "ja": "四 (よん/し)", "es": "cuatro"},
    "five": {"en": "five", "ko": "다섯", "ja": "五 (ご)", "es": "cinco"},
    "six": {"en": "six", "ko": "여섯", "ja": "六 (ろく)", "es": "seis"},
    "seven": {"en": "seven", "ko": "일곱", "ja": "七 (なな)", "es": "siete"},
    "eight": {"en": "eight", "ko": "여덟", "ja": "八 (はち)", "es": "ocho"},
    "nine": {"en": "nine", "ko": "아홉", "ja": "九 (きゅう)", "es": "nueve"},
    "ten": {"en": "ten", "ko": "열", "ja": "十 (じゅう)", "es": "diez"},
    "hundred": {"en": "hundred", "ko": "백", "ja": "百 (ひゃく)", "es": "cien"},
    "thousand": {"en": "thousand", "ko": "천", "ja": "千 (せん)", "es": "mil"},
    "zero": {"en": "zero", "ko": "영", "ja": "零 (ゼロ)", "es": "cero"},

    # === COLORS ===
    "red": {"en": "red", "ko": "빨강", "ja": "赤 (あか)", "es": "rojo"},
    "blue": {"en": "blue", "ko": "파랑", "ja": "青 (あお)", "es": "azul"},
    "green": {"en": "green", "ko": "초록", "ja": "緑 (みどり)", "es": "verde"},
    "yellow": {"en": "yellow", "ko": "노랑", "ja": "黄 (き)", "es": "amarillo"},
    "white": {"en": "white", "ko": "하양", "ja": "白 (しろ)", "es": "blanco"},
    "black": {"en": "black", "ko": "검정", "ja": "黒 (くろ)", "es": "negro"},
    "pink": {"en": "pink", "ko": "분홍", "ja": "ピンク", "es": "rosa"},
    "purple": {"en": "purple", "ko": "보라", "ja": "紫 (むらさき)", "es": "morado"},

    # === ANIMALS ===
    "cat": {"en": "cat", "ko": "고양이", "ja": "猫 (ねこ)", "es": "gato"},
    "dog": {"en": "dog", "ko": "개", "ja": "犬 (いぬ)", "es": "perro"},
    "fish": {"en": "fish", "ko": "물고기", "ja": "魚 (さかな)", "es": "pez"},
    "bird": {"en": "bird", "ko": "새", "ja": "鳥 (とり)", "es": "pájaro"},
    "horse": {"en": "horse", "ko": "말", "ja": "馬 (うま)", "es": "caballo"},

    # === OBJECTS ===
    "book": {"en": "book", "ko": "책", "ja": "本 (ほん)", "es": "libro"},
    "water": {"en": "water", "ko": "물", "ja": "水 (みず)", "es": "agua"},
    "bread": {"en": "bread", "ko": "빵", "ja": "パン", "es": "pan"},
    "rice": {"en": "rice", "ko": "밥", "ja": "ご飯 (ごはん)", "es": "arroz"},
    "tea": {"en": "tea", "ko": "차", "ja": "お茶 (おちゃ)", "es": "té"},
    "coffee": {"en": "coffee", "ko": "커피", "ja": "コーヒー", "es": "café"},
    "beer": {"en": "beer", "ko": "맥주", "ja": "ビール", "es": "cerveza"},
    "wine": {"en": "wine", "ko": "와인", "ja": "ワイン", "es": "vino"},
    "phone": {"en": "phone", "ko": "전화", "ja": "電話 (でんわ)", "es": "teléfono"},
    "computer": {"en": "computer", "ko": "컴퓨터", "ja": "コンピュータ", "es": "computadora"},
    "house": {"en": "house", "ko": "집", "ja": "家 (いえ)", "es": "casa"},
    "car": {"en": "car", "ko": "자동차", "ja": "車 (くるま)", "es": "coche"},
    "school": {"en": "school", "ko": "학교", "ja": "学校 (がっこう)", "es": "escuela"},
    "store": {"en": "store / shop", "ko": "가게", "ja": "店 (みせ)", "es": "tienda"},
    "restaurant": {"en": "restaurant", "ko": "식당", "ja": "レストラン", "es": "restaurante"},
    "hospital": {"en": "hospital", "ko": "병원", "ja": "病院 (びょういん)", "es": "hospital"},
    "airport": {"en": "airport", "ko": "공항", "ja": "空港 (くうこう)", "es": "aeropuerto"},
    "hotel": {"en": "hotel", "ko": "호텔", "ja": "ホテル", "es": "hotel"},
    "station": {"en": "station", "ko": "역", "ja": "駅 (えき)", "es": "estación"},

    # === TIME ===
    "today": {"en": "today", "ko": "오늘", "ja": "今日 (きょう)", "es": "hoy"},
    "tomorrow": {"en": "tomorrow", "ko": "내일", "ja": "明日 (あした)", "es": "mañana"},
    "yesterday": {"en": "yesterday", "ko": "어제", "ja": "昨日 (きのう)", "es": "ayer"},
    "today": {"en": "today", "ko": "오늘", "ja": "今日 (きょう)", "es": "hoy"},
    "morning": {"en": "morning", "ko": "아침", "ja": "朝 (あさ)", "es": "mañana"},
    "afternoon": {"en": "afternoon", "ko": "오후", "ja": "午後 (ごご)", "es": "tarde"},
    "evening": {"en": "evening", "ko": "저녁", "ja": "夕方 (ゆうがた)", "es": "noche"},
    "night": {"en": "night", "ko": "밤", "ja": "夜 (よる)", "es": "noche"},
    "week": {"en": "week", "ko": "주", "ja": "週 (しゅう)", "es": "semana"},
    "month": {"en": "month", "ko": "달", "ja": "月 (つき)", "es": "mes"},
    "year": {"en": "year", "ko": "년", "ja": "年 (ねん)", "es": "año"},
    "now": {"en": "now", "ko": "지금", "ja": "今 (いま)", "es": "ahora"},
    "later": {"en": "later", "ko": "나중에", "ja": "後で (あとで)", "es": "más tarde"},
    "always": {"en": "always", "ko": "항상", "ja": "いつも", "es": "siempre"},
    "never": {"en": "never", "ko": "절대", "ja": "決して", "es": "nunca"},
    "often": {"en": "often", "ko": "자주", "ja": "よく", "es": "a menudo"},

    # === FAMILY ===
    "mother": {"en": "mother", "ko": "어머니", "ja": "母 (はは)", "es": "madre"},
    "father": {"en": "father", "ko": "아버지", "ja": "父 (ちち)", "es": "padre"},
    "sister": {"en": "sister", "ko": "여자 형제", "ja": "姉妹 (しまい)", "es": "hermana"},
    "brother": {"en": "brother", "ko": "남자 형제", "ja": "兄弟 (きょうだい)", "es": "hermano"},
    "family": {"en": "family", "ko": "가족", "ja": "家族 (かぞく)", "es": "familia"},
    "friend": {"en": "friend", "ko": "친구", "ja": "友達 (ともだち)", "es": "amigo"},
    "boyfriend": {"en": "boyfriend", "ko": "남자친구", "ja": "彼氏 (かれし)", "es": "novio"},
    "girlfriend": {"en": "girlfriend", "ko": "여자친구", "ja": "彼女 (かのじょ)", "es": "novia"},
    "husband": {"en": "husband", "ko": "남편", "ja": "夫 (おっと)", "es": "esposo"},
    "wife": {"en": "wife", "ko": "아내", "ja": "妻 (つま)", "es": "esposa"},

    # === ROMANCE / EMOTIONS ===
    "love": {"en": "love", "ko": "사랑", "ja": "愛 (あい)", "es": "amor"},
    "like": {"en": "like", "ko": "좋아하다", "ja": "好き (すき)", "es": "gustar"},
    "kiss": {"en": "kiss", "ko": "키스", "ja": "キス", "es": "beso"},
    "hug": {"en": "hug", "ko": "포옹", "ja": "抱擁 (ほうよう)", "es": "abrazo"},
    "date": {"en": "date", "ko": "데이트", "ja": "デート", "es": "cita"},
    "beautiful": {"en": "beautiful", "ko": "아름다운", "ja": "美しい (うつくしい)", "es": "hermoso/a"},
    "pretty": {"en": "pretty", "ko": "예쁜", "ja": "可愛い (かわいい)", "es": "lindo/a"},
    "cute": {"en": "cute", "ko": "귀여운", "ja": "可愛い (かわいい)", "es": "lindo/a"},
    "handsome": {"en": "handsome", "ko": "잘생긴", "ja": "ハンサム / かっこいい", "es": "guapo"},
    "lovely": {"en": "lovely", "ko": "사랑스러운", "ja": " lovely (ラブリー)", "es": "encantador/a"},
    "cute": {"en": "cute", "ko": "귀여운", "ja": "可愛い (かわいい)", "es": "lindo"},
    "sweet": {"en": "sweet", "ko": "달콤한", "ja": "甘い (あまい)", "es": "dulce"},
    "happy": {"en": "happy", "ko": "행복한", "ja": "幸せ (しあわせ)", "es": "feliz"},
    "sad": {"en": "sad", "ko": "슬픈", "ja": "悲しい (かなしい)", "es": "triste"},
    "angry": {"en": "angry", "ko": "화난", "ja": "怒る (おこる)", "es": "enojado"},
    "tired": {"en": "tired", "ko": "피곤한", "ja": "疲れた (つかれた)", "es": "cansado"},
    "hungry": {"en": "hungry", "ko": "배고픈", "ja": "お腹が空いた", "es": "hambriento"},

    # === FOOD ===
    "delicious": {"en": "delicious", "ko": "맛있는", "ja": "美味しい (おいしい)", "es": "delicioso"},
    "spicy": {"en": "spicy", "ko": "매운", "ja": "辛い (からい)", "es": "picante"},
    "sweet": {"en": "sweet", "ko": "단", "ja": "甘い (あまい)", "es": "dulce"},
    "sour": {"en": "sour", "ko": "신", "ja": "酸っぱい (すっぱい)", "es": "agrio"},
    "salty": {"en": "salty", "ko": "짠", "ja": "塩辛い (しおからい)", "es": "salado"},

    # === ADJECTIVES ===
    "big": {"en": "big", "ko": "큰", "ja": "大きい (おおきい)", "es": "grande"},
    "small": {"en": "small", "ko": "작은", "ja": "小さい (ちいさい)", "es": "pequeño"},
    "hot": {"en": "hot", "ko": "더운 / 뜨거운", "ja": "暑い (あつい) / 熱い (あつい)", "es": "caliente"},
    "cold": {"en": "cold", "ko": "추운 / 차가운", "ja": "寒い (さむい) / 冷たい (つめたい)", "es": "frío"},
    "new": {"en": "new", "ko": "새로운", "ja": "新しい (あたらしい)", "es": "nuevo"},
    "old": {"en": "old", "ko": "오래된", "ja": "古い (ふるい)", "es": "viejo"},
    "good": {"en": "good", "ko": "좋은", "ja": "良い (よい)", "es": "bueno"},
    "bad": {"en": "bad", "ko": "나쁜", "ja": "悪い (わるい)", "es": "malo"},
    "great": {"en": "great", "ko": "훌륭한", "ja": "素晴らしい (すばらしい)", "es": "genial"},
    "kind": {"en": "kind", "ko": "친절한", "ja": "優しい (やさしい)", "es": "amable"},
    "funny": {"en": "funny", "ko": "재미있는", "ja": "面白い (おもしろい)", "es": "gracioso"},
    "interesting": {"en": "interesting", "ko": "흥미로운", "ja": "興味深い (きょうみぶかい)", "es": "interesante"},
    "expensive": {"en": "expensive", "ko": "비싼", "ja": "高い (たかい)", "es": "caro"},
    "cheap": {"en": "cheap", "ko": "싼", "ja": "安い (やすい)", "es": "barato"},

    # === TRAVEL ===
    "passport": {"en": "passport", "ko": "여권", "ja": "パスポート", "es": "pasaporte"},
    "ticket": {"en": "ticket", "ko": "표", "ja": "切符 (きっぷ)", "es": "boleto"},
    "map": {"en": "map", "ko": "지도", "ja": "地図 (ちず)", "es": "mapa"},
    "taxi": {"en": "taxi", "ko": "택시", "ja": "タクシー", "es": "taxi"},
    "train": {"en": "train", "ko": "기차", "ja": "電車 (でんしゃ)", "es": "tren"},
    "bus": {"en": "bus", "ko": "버스", "ja": "バス", "es": "autobús"},
    "subway": {"en": "subway", "ko": "지하철", "ja": "地下鉄 (ちかてつ)", "es": "metro"},
    "left": {"en": "left", "ko": "왼쪽", "ja": "左 (ひだり)", "es": "izquierda"},
    "right": {"en": "right", "ko": "오른쪽", "ja": "右 (みぎ)", "es": "derecha"},
    "straight": {"en": "straight", "ko": "직진", "ja": "まっすぐ", "es": "recto"},
    "near": {"en": "near", "ko": "가까이", "ja": "近く (ちかく)", "es": "cerca"},
    "far": {"en": "far", "ko": "멀리", "ja": "遠く (とおく)", "es": "lejos"},

    # === COMMON VERBS ===
    "go": {"en": "go", "ko": "가다", "ja": "行く (いく)", "es": "ir"},
    "come": {"en": "come", "ko": "오다", "ja": "来る (くる)", "es": "venir"},
    "eat": {"en": "eat", "ko": "먹다", "ja": "食べる (たべる)", "es": "comer"},
    "drink": {"en": "drink", "ko": "마시다", "ja": "飲む (のむ)", "es": "beber"},
    "sleep": {"en": "sleep", "ko": "자다", "ja": "寝る (ねる)", "es": "dormir"},
    "wake": {"en": "wake", "ko": "일어나다", "ja": "起きる (おきる)", "es": "despertar"},
    "work": {"en": "work", "ko": "일하다", "ja": "働く (はたらく)", "es": "trabajar"},
    "play": {"en": "play", "ko": "놀다", "ja": "遊ぶ (あそぶ)", "es": "jugar"},
    "read": {"en": "read", "ko": "읽다", "ja": "読む (よむ)", "es": "leer"},
    "write": {"en": "write", "ko": "쓰다", "ja": "書く (かく)", "es": "escribir"},
    "listen": {"en": "listen", "ko": "듣다", "ja": "聞く (きく)", "es": "escuchar"},
    "look": {"en": "look", "ko": "보다", "ja": "見る (みる)", "es": "mirar"},
    "want": {"en": "want", "ko": "원하다", "ja": "欲しい (ほしい)", "es": "querer"},
    "have": {"en": "have", "ko": "가지다", "ja": "持つ (もつ)", "es": "tener"},
    "do": {"en": "do", "ko": "하다", "ja": "する", "es": "hacer"},
    "make": {"en": "make", "ko": "만들다", "ja": "作る (つくる)", "es": "hacer"},
    "give": {"en": "give", "ko": "주다", "ja": "与える (あたえる)", "es": "dar"},
    "get": {"en": "get", "ko": "얻다", "ja": "得る (える)", "es": "obtener"},
    "know": {"en": "know", "ko": "알다", "ja": "知る (しる)", "es": "saber"},
    "think": {"en": "think", "ko": "생각하다", "ja": "考える (かんがえる)", "es": "pensar"},
    "see": {"en": "see", "ko": "보다", "ja": "見る (みる)", "es": "ver"},
    "say": {"en": "say", "ko": "말하다", "ja": "言う (いう)", "es": "decir"},
    "tell": {"en": "tell", "ko": "알리다", "ja": "伝える (つたえる)", "es": "contar"},
    "ask": {"en": "ask", "ko": "묻다", "ja": "聞く (きく)", "es": "preguntar"},
    "want to meet": {"en": "want to meet", "ko": "만나고 싶다", "ja": "会いたい (あいたい)", "es": "quiero verte"},
    "like you": {"en": "I like you", "ko": "당신을 좋아해요", "ja": "好きです (すきです)", "es": "me gustas"},
    "love you": {"en": "I love you", "ko": "사랑해요", "ja": "愛してる (あいしてる)", "es": "te amo"},

    # === PRONOUNS ===
    "i": {"en": "I (1st person)", "ko": "나", "ja": "私 (わたし)", "es": "yo"},
    "you": {"en": "you", "ko": "당신", "ja": "あなた", "es": "tú"},
    "he": {"en": "he", "ko": "그", "ja": "彼 (かれ)", "es": "él"},
    "she": {"en": "she", "ko": "그녀", "ja": "彼女 (かのじょ)", "es": "ella"},
    "we": {"en": "we", "ko": "우리", "ja": "私たち (わたしたち)", "es": "nosotros"},
    "they": {"en": "they", "ko": "그들", "ja": "彼ら (かれら)", "es": "ellos"},

    # === JP SPECIFIC (often appears in EN/JP/ES corpora) ===
    "kawaii": {"en": "cute", "ko": "귀여운", "ja": "可愛い (かわいい)", "es": "lindo"},
    "kirei": {"en": "beautiful", "ko": "아름다운", "ja": "綺麗 (きれい)", "es": "hermoso"},
    "suki": {"en": "like", "ko": "좋아함", "ja": "好き (すき)", "es": "gustar"},
    "yasashii": {"en": "kind / gentle", "ko": "친절한", "ja": "優しい (やさしい)", "es": "amable"},
    "omoshiroi": {"en": "interesting / funny", "ko": "재미있는", "ja": "面白い (おもしろい)", "es": "interesante"},
    "kakkoii": {"en": "cool / handsome", "ko": "멋진", "ja": "格好いい (かっこいい)", "es": "guay / genial"},
    "arigatou": {"en": "thank you", "ko": "고마워", "ja": "ありがとう", "es": "gracias"},
    "sumimasen": {"en": "excuse me / sorry", "ko": "미안합니다 / 실례합니다", "ja": "すみません", "es": "disculpe"},
    "konnichiwa": {"en": "hello", "ko": "안녕", "ja": "こんにちは", "es": "hola"},
    "ohayou": {"en": "good morning", "ko": "좋은 아침", "ja": "おはよう", "es": "buenos días"},
    "konbanwa": {"en": "good evening", "ko": "좋은 저녁", "ja": "こんばんは", "es": "buenas tardes"},
    "deeto": {"en": "date", "ko": "데이트", "ja": "デート", "es": "cita"},
    "koibito": {"en": "lover", "ko": "연인", "ja": "恋人 (こいびと)", "es": "amante"},
    "kanojo": {"en": "girlfriend / she", "ko": "여자친구 / 그녀", "ja": "彼女 (かのじょ)", "es": "novia"},
    "kareshi": {"en": "boyfriend / he", "ko": "남자친구 / 그", "ja": "彼氏 (かれし)", "es": "novio"},
    "shumi": {"en": "hobby", "ko": "취미", "ja": "趣味 (しゅみ)", "es": "afición"},
    "namae": {"en": "name", "ko": "이름", "ja": "名前 (なまえ)", "es": "nombre"},
    "kawaii": {"en": "cute", "ko": "귀여운", "ja": "可愛い (かわいい)", "es": "lindo"},

    # === KR SPECIFIC (often appears in EN/JP/ES corpora) ===
    "annyeonghaseyo": {"en": "hello (polite)", "ko": "안녕하세요", "ja": "こんにちは", "es": "hola"},
    "annyeong": {"en": "hello (casual)", "ko": "안녕", "ja": "やあ", "es": "hola"},
    "gamsahamnida": {"en": "thank you (polite)", "ko": "감사합니다", "ja": "ありがとうございます", "es": "gracias"},
    "joesonghamnida": {"en": "sorry (polite)", "ko": "죄송합니다", "ja": "申し訳ありません", "es": "lo siento"},
    "mianhamnida": {"en": "sorry (polite)", "ko": "미안합니다", "ja": "ごめんなさい", "es": "lo siento"},
    "saranghae": {"en": "I love you (casual)", "ko": "사랑해", "ja": "愛してる", "es": "te amo"},
    "joha": {"en": "I like you", "ko": "좋아해", "ja": "好きだよ", "es": "me gustas"},
    "sarang": {"en": "love", "ko": "사랑", "ja": "愛 (あい)", "es": "amor"},
    "chingu": {"en": "friend", "ko": "친구", "ja": "友達 (ともだち)", "es": "amigo"},

    # === ES SPECIFIC ===
    "hola": {"en": "hello", "ko": "안녕", "ja": "こんにちは", "es": "hola"},
    "gracias": {"en": "thank you", "ko": "고마워", "ja": "ありがとう", "es": "gracias"},
    "por favor": {"en": "please", "ko": "부디", "ja": "お願いします", "es": "por favor"},
    "adiós": {"en": "goodbye", "ko": "안녕히 가세요", "ja": "さようなら", "es": "adiós"},
    "buenos días": {"en": "good morning", "ko": "좋은 아침", "ja": "おはよう", "es": "buenos días"},
    "buenas noches": {"en": "good night", "ko": "안녕히 주무세요", "ja": "おやすみなさい", "es": "buenas noches"},
    "amor": {"en": "love", "ko": "사랑", "ja": "愛 (あい)", "es": "amor"},
    "bonita": {"en": "pretty (fem)", "ko": "예쁜", "ja": "可愛い (かわいい)", "es": "bonita"},
    "bonito": {"en": "pretty (masc)", "ko": "예쁜", "ja": "可愛い (かわいい)", "es": "bonito"},
    "guapo": {"en": "handsome", "ko": "잘생긴", "ja": "ハンサム", "es": "guapo"},
    "guapa": {"en": "pretty woman", "ko": "예쁜 여자", "ja": "美人 (びじん)", "es": "guapa"},
    "encantador": {"en": "charming", "ko": "매력적인", "ja": "魅力的 (みりょくてき)", "es": "encantador"},
    "beso": {"en": "kiss", "ko": "키스", "ja": "キス", "es": "beso"},
    "cita": {"en": "date", "ko": "데이트", "ja": "デート", "es": "cita"},
}


def detect_meaning_lang(text: str) -> str:
    """Detect language of a meaning string."""
    if not text:
        return "en"
    if re.search(r"[\uAC00-\uD7AF]", text):
        return "ko"
    if re.search(r"[\u3040-\u30FF]", text):
        return "ja"
    if re.search(r"[ñ¿¡áéíóú]", text, re.IGNORECASE):
        return "es"
    return "en"


def migrate_entry(entry_text: str) -> str:
    """Convert a single corpus entry line to use meanings map."""
    match = re.search(r"meaning:\s*'([^']*)'", entry_text)
    if not match:
        return entry_text

    meaning = match.group(1)
    detected_lang = detect_meaning_lang(meaning)

    display_match = re.search(r"display:\s*'([^']*)'", entry_text)
    display = display_match.group(1) if display_match else ""

    meanings = {detected_lang: meaning}

    # Try lookup with display key
    dict_meanings = COMMON_DICT.get(display.lower(), {})
    for lang in ["en", "ko", "ja", "es"]:
        if lang not in meanings and lang in dict_meanings:
            meanings[lang] = dict_meanings[lang]

    parts = [f"{lang}: '{m}'" for lang, m in sorted(meanings.items())]
    meanings_str = "{ " + ", ".join(parts) + " }"

    new_text = re.sub(
        r"meaning:\s*'[^']*'(,\s*)?",
        f"meanings: {meanings_str}, meaningLang: '{detected_lang}'\\1",
        entry_text,
        count=1,
    )

    return new_text


def main():
    if not CORPUS_PATH.exists():
        print(f"Error: corpus not found: {CORPUS_PATH}")
        sys.exit(1)

    text = CORPUS_PATH.read_text(encoding="utf-8")
    lines = text.splitlines()

    new_lines = []
    migrated_count = 0
    skipped_count = 0
    already_migrated = 0
    enriched_count = 0  # entries that got extra meanings from dict

    for line in lines:
        # Only process word entry lines (have id, display, meaning)
        is_entry_line = (
            "meaning:" in line
            and "display:" in line
            and "id:" in line
        )

        if not is_entry_line:
            new_lines.append(line)
            continue

        if "meanings:" in line:
            already_migrated += 1
            new_lines.append(line)
            continue

        # Migrate this entry
        new_line = migrate_entry(line)
        if new_line != line:
            migrated_count += 1
            # Check if enriched (3+ langs)
            m = re.search(r"meanings:\s*\{([^}]+)\}", new_line)
            if m:
                lang_count = sum(
                    1 for lang in ["en", "ko", "ja", "es"]
                    if f"{lang}: '" in m.group(1)
                )
                if lang_count >= 3:
                    enriched_count += 1
        else:
            skipped_count += 1

        new_lines.append(new_line)

    new_text = "\n".join(new_lines)
    CORPUS_PATH.write_text(new_text, encoding="utf-8")

    print(f"=== Migration Summary ===")
    print(f"Migrated: {migrated_count} entries")
    print(f"  - Enriched (3+ langs from dict): {enriched_count}")
    print(f"Already migrated: {already_migrated} entries")
    print(f"Skipped: {skipped_count} entries")
    print(f"Output: {CORPUS_PATH}")


if __name__ == "__main__":
    main()