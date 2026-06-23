# 0006 - 데이터 형식 (JSON / YAML / TS const)

## 상태

**Accepted** (2026-06-24)

## 컨텍스트

단어/문장/스테이지/미션 데이터를 어떤 형식으로 저장할지 결정.

**요건**:
- 코퍼스: 단어 1000+, 문장 100+ (각 언어)
- 메타: 스테이지 정의, 미션 정의
- 사람이 읽고 편집 가능
- TypeScript와 잘 통합

## 옵션 비교

| 옵션 | 장점 | 단점 | 비고 |
| --- | --- | --- | --- |
| **JSON** | 표준, JS와 자연 통합, 도구 풍부 | 주석 불가, trailing comma 불가 | **추천** |
| JSON5 / JSONC | 주석 가능, trailing comma | 표준 아님, 도구 제한 | |
| YAML | 주석 가능, 사람이 읽기 쉬움 | 파서 의존성, 들여쓰기 민감 | |
| TypeScript const | 타입 안정성, IDE 자동완성 | 빌드 단계 필요, 비개발자 편집 어려움 | |
| TOML | 명시적, 단순 | 표현력 제한 | |
| Markdown table | 사람이 가장 읽기 쉬움 | 파싱 복잡 | |

## 결정

**TypeScript const** (동적 import)

- 데이터: `.json` 파일
- 스키마: `JSON Schema` (선택적 검증)
- TS 타입 자동 생성 (json-schema-to-typescript)

또는

**JSON5** (코퍼스 작성을 사람이 직접 하는 경우)

## 이유

1. **표준**: JSON은 어디서나 지원
2. **JS 통합**: fetch 또는 import 시 자연 로드
3. **도구**: VSCode, jq, json-schema 모두 지원
4. **확장성**: Phase 7에서 서버 백엔드 추가 시 JSON 그대로 사용

## 결과 / 영향

### 긍정적
- 빌드 단계 없이 직접 import (`import data from './data/en_words.json'`)
- 디버깅 쉬움 (브라우저에서 객체 그대로 보임)
- 표준 도구로 검증 가능

### 부정적 / 트레이드오프
- 주석 불가 → 별도 메타데이터는 `meta.json` 분리 또는 README
- 큰 파일은 트리쉐이킹 어려움 → 언어별 분리

### 제약
- 코퍼스 편집 도구 필요 (VSCode OK, 비개발자는 어려움)
- 한글/일본어/스페인어는 UTF-8로 인코딩 필수

## 열린 질문

- [ ] 코퍼스 검수 워크플로우 (PR 기반? 전용 도구?)
- [ ] JSON5 채택 여부 (주석이 필요한 경우)
- [ ] 외부 API/사전 연동 (Phase 7+)

## 다음 단계

- ✅ `prototype/src/data/` (TypeScript const, 동적 import) 구현 완료