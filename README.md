# WebMCPLite

사람과 AI가 같은 웹페이지에서 함께 작업하도록 만드는 가벼운 WebMCP 개발 규칙, 연결 코드와 실행 예제 모음.

Lightweight conventions, glue, and runnable examples for humans and AI working together on a website, built on the WebMCP draft API.

## 현재 상태

2026-10-25: 프로젝트 방향과 실행 인계를 담은 문서 부트스트랩 단계입니다. 런타임 구현·예제·브라우저 호환 검증은 아직 제공되지 않습니다.

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

세부 함수 계약, 패키지 구성과 여섯 가지 예제의 선정은 PLANS.md의 제안 및 후속 이슈에서 검증합니다.
