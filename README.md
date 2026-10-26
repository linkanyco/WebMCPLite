# WebMCPLite

사람과 AI가 같은 웹페이지에서 함께 작업하도록 만드는 가벼운 WebMCP 개발 규칙, 연결 코드와 실행 예제 모음.

Lightweight conventions, glue, and runnable examples for humans and AI working together on a website, built on the WebMCP draft API.

**[브라우저에서 예제 실행](https://linkanyco.github.io/WebMCPLite/)** — GitHub Pages에 마지막으로 성공 배포된 `main` 상태입니다.

## 현재 상태

2026-10-25: 작은 연결 코드, 소비 사이트 하네스와 여섯 가지 공유 편집 예제를 제공합니다. 정식 표준·전체 브라우저 호환을 주장하지 않습니다.

Node 22 이상에서 `npm start`를 실행하고 표시된 로컬 주소를 엽니다. 설치·빌드 단계는 없습니다. `npm test`로 계약 테스트를 실행합니다. [예제 사용법](examples/README.md)에 페이지별 흐름과 실제 호출 예시가 있습니다. 저장은 탭 메모리만 갱신하며 새로고침하면 초기화됩니다.
- [검증 범위와 한계](docs/verification.md), [독립 리뷰 기록](docs/reviews/README.md), [진행 인덱스](https://github.com/linkanyco/WebMCPLite/issues/1).
- [PLANS.md](PLANS.md): 명시된 휴먼 의도, 리서치, 에이전트 제안과 실행 범위.
- [소비 사이트 하네스](docs/consumer-AGENTS.md)와 [예제 계약](docs/contracts.md).
- [AGENTS.md](AGENTS.md): 이 저장소에서 작업하는 개발 AI의 실행·검증·리뷰 규칙.

WebMCP 규격 초안을 활용하는 독립 프로젝트입니다. WebMCP 또는 nekuda WebMCP Kit의 공식 하위 프로젝트를 뜻하지 않습니다.

제품 내부에 별도 챗봇·모델 서비스를 넣지 않고도, 사이트가 자신의 기능과 사용법을 외부 AI에게 설명하고 사람이 보며 함께 편집할 수 있게 하는 방식을 탐색합니다. 이 저장소의 개발용 AGENTS.md와, 실행 중인 사이트가 AI에게 제공하는 매뉴얼은 서로 다른 역할입니다.

## 출발점

- 편집 대상별 `getBoard` / `setBoard`, `getProduct` / `setProduct` 같은 단순한 읽기·편집 함수.
- 필요한 사이트·페이지 안내와 명시적인 저장·취소 동작.
- UI와 AI가 공유하는 앱 상태와 검증, 눈으로 확인할 수 있는 AI 변경 표시.
- 지원 환경에서는 WebMCP 도구 등록. 지원 여부와 실제 테스트 범위는 구현 후 따로 명시합니다.

세부 함수 계약과 기술 선택은 PLANS.md에서 에이전트 제안(AP)으로 구분합니다. 제품·벌크·라인시트·보드·안내와 이동·비동기 저장 예제가 같은 공유 동작 경로를 사용합니다.

## 호환성과 라이선스

Codex 내장 브라우저에서 실제 페이지 도구 발견·호출·UI 반영을 확인했습니다. 브라우저 엔진 버전과 일반 Chrome·Edge·Safari/외부 AI 지원은 확인하지 않았습니다. API가 없을 때의 unsupported 처리는 별도의 Node stub 테스트입니다. [상세 검증](docs/verification.md)을 참조하세요.

현재 공개 소스이지만 사용 허락 라이선스는 아직 선택하지 않았습니다. 외부 재배포·패키지 발행 권한을 부여한 것으로 해석하지 마세요. 실제 고객 코드·데이터는 포함하지 않았습니다.

## 예제 자동 게시

main에 반영되면 GitHub Actions가 테스트 후 정적 예제를 Pages에 게시합니다. PR에서는 검증만 하며 공개 배포하지 않습니다. 반영에는 잠깐 시간이 걸리고, 실패하면 직전 성공 버전이 계속 보입니다. 화면 아래 **게시 버전** 링크 또는 [version.json](https://linkanyco.github.io/WebMCPLite/version.json)의 커밋을 main과 대조할 수 있습니다.

`npm run build:site`는 실행에 필요한 정적 파일만 `dist/`에 만듭니다. 설치/번들러 없이 동작하며 저장소 문서·테스트·로컬 설정은 게시 산출물에 넣지 않습니다. 첫 공개 게시 결과는 [#16](https://github.com/linkanyco/WebMCPLite/issues/16)에서 추적합니다.
