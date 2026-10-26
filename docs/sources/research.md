# WebMCPLite 리서치 인계

기준일: 2026-10-25. 이 문서는 공개 자료의 확인 결과와 설계 제안을 구분한다. 기존 제품과의 차이는 실행 예제로 검증할 가설이며, 신규성·브라우저 보급·성능 우위를 주장하지 않는다.

## 1. 공식 WebMCP: 이번에 재확인한 사실

- 확인한 문서는 **2026-10-20 Draft Community Group Report**다. Web Machine Learning Community Group의 규격 초안이며, W3C Standard 또는 Standards Track 문서가 아니다.
- 현재 API 진입점은 `document.modelContext`다. 사이트는 `registerTool()`에 `name`, `description`, `execute`와 선택적인 `title`, `inputSchema`, `annotations`를 등록한다.
- `getTools()`는 페이지 안의 JavaScript 에이전트가 접근 가능한 도구를 조회하는 API다. **브라우저 에이전트는 별도 내부 메커니즘으로 도구를 발견한다.** 모든 외부 AI가 `getTools()`를 호출해야 한다는 설명은 부정확하다.
- 등록 수명은 `AbortSignal`로 관리할 수 있다. `execute` 콜백은 JSON으로 직렬화 가능한 값을 반환하고, 플랫폼의 `executeTool()`가 그 결과를 JSON 문자열로 반환한다. 콜백에서 미리 JSON.stringify를 하면 이중 직렬화될 수 있다. 구현 시 입력·반환·오류 계약을 현재 초안과 실제 지원 브라우저에서 확인해야 한다.
- 공식 진입점은 등록된 도구와 그 메타데이터다. `#agentsmd`, `site_manual()`, `page_manual()`, `site_map()`을 필수 진입점으로 지정하지 않는다. 해당 이름을 사용한다면 **WebMCPLite의 관례**로 문서화한다.
- 같은 화면에서 사람과 AI가 협업하고 기존 앱 로직을 공유하는 목적도 공식 소개에 포함된다. 그 목적 자체를 WebMCPLite만의 발명으로 설명하지 않는다.
- 힌트·설명은 실제 권한 검증이나 사용자 승인 절차를 대체하지 않는다. 브라우저·에이전트별 실제 지원은 별도 검증 대상이다.

출처: [WebMCP 초안과 API](https://webmachinelearning.github.io/webmcp/), 특히 §§1, 4.2, 4.2.1, 4.2.3, 6.2.

## 2. nekuda WebMCP Kit: 이번에 재확인한 사실

- WebMCP 규격을 활용하는 별도 개발 도구·SDK다. 사이트 분석, 도구 계획, 코드 연결, 브라우저 검증을 돕는다. 공식 규격 팀의 공식 구현이라는 근거는 확인하지 못했다.
- `renameBoard`는 Kit가 강제하는 API 스타일이 아니라 **보드 예제 앱의 공유 액션 함수**다. `getBoard`/`setBoard` 설계도 가능하다. 구체적 동작 함수와 get/set은 사용성을 비교할 선택지다.
- 폼과 AI 도구가 같은 앱 함수를 호출한다. 입력 검증, 상태 변경, 서버 권한 검사를 그 함수와 기존 서버 경계에 유지한다.
- SDK는 선택 사항이다. 소수 도구는 브라우저 API에 직접 등록할 수 있다. SDK는 라우트 범위·해제 수명을 돕지만 입력 런타임 검증, 브라우저 polyfill, 서버 MCP transport를 제공하지 않는다. 미지원 브라우저에서 등록은 `unsupported`를 반환한다.
- 제한적인 사용 텔레메트리가 기본 활성화다. 기본 수집에는 원시 입력·결과와 영속 방문자 ID가 포함되지 않는다고 문서화돼 있다. `telemetry: false` 또는 로드 전 전역 설정으로 끌 수 있다. 입력·결과를 포함할 수 있는 `tracking`은 별도 opt-in이다.
- SDK의 “런타임 의존성 없음”은 문서상의 설명이다. 이 인계에서는 배포물 크기나 SDK 런타임 소스를 독립 측정·감사하지 않았다.

출처: [Kit 소개](https://docs.nekuda.ai/), [SDK와 텔레메트리](https://docs.nekuda.ai/sdk), [보드 검증 예제](https://docs.nekuda.ai/verification-example).

## 3. 인접 프로젝트와 겹치는 부분

### FrontMCP

**이번 공식 문서 확인:** `@frontmcp/react`는 React 앱 안에 서버를 두고 컴포넌트 수명의 도구·리소스를 등록한다. 상태 store 연결도 제공한다. 따라서 “백엔드 MCP만 제공한다”는 비교는 틀리다.

**앞선 대화에서 소스를 확인한 관찰:** WebMCP 플러그인, 상태/액션·라우터 연동이 존재했다. 자체 챗봇을 반드시 호스팅해야 하는 구조로 단정하지 않는다. 공유 초안, 변경 출처 표시, 실제 변경내용 검토·저장 UX가 범용 기능으로 완성됐는지는 별도 검증이 필요하다. 당시 확인한 소스 범위에서 없었다는 관찰을 전체 제품에 없는 기능이라는 주장으로 확대하지 않는다. 번들 크기는 독립 측정하지 않았다.

출처: [React 공식 문서](https://frontmcp.dev/reference/react), [앞서 확인한 공개 소스](https://github.com/agentfront/frontmcp/tree/fcf760fec0dc293a599cb5499fe43db923342df6/libs/react), [WebMCP 플러그인 소스](https://github.com/agentfront/frontmcp/tree/fcf760fec0dc293a599cb5499fe43db923342df6/plugins/plugin-webmcp).

### SiteMCP

**앞선 대화의 소스 관찰, 이번 재검증 없음:** `ryoppippi/sitemcp`는 URL을 크롤링해 문서를 Markdown으로 만들고, 목록/문서 조회용 MCP 도구를 제공하는 CLI였다. 실행 중인 앱과 초안을 공유하는 편집 브리지와 목적이 다르다. 같은 이름의 다른 서비스를 혼동하지 않는다. 커밋 수나 오래된 릴리스만으로 프로젝트 생존 여부를 평가하지 않는다.

출처: [SiteMCP](https://github.com/ryoppippi/sitemcp), [서버 구현](https://github.com/ryoppippi/sitemcp/blob/main/src/server.ts), [수집 구현](https://github.com/ryoppippi/sitemcp/blob/main/src/fetch-site.ts).

### BrowserMCP

**실행 채팅 재확인(2026-10-25):** 브라우저 탐색·폼 입력을 위한 MCP 서버와 확장입니다. [공식 변경 기록](https://browsermcp.io/changelog/)은 2026-10-18 v1.4.0을, [설정 안내](https://browsermcp.io/docs/setup-extension/)는 Connect 버튼으로 현재 탭을 연결하는 방식을 설명합니다. 인계 자료가 기재했던 “현재 2.0·팝업 허용·AI 앱별 그룹 탭”은 이번 재확인 자료가 지지하지 않아 정정했습니다.

**확인 한계:** 과거 공개 core 0.1.3 관찰이나 현재 안내 일부만으로 현재 전체 도구 목록·JS 실행 지원·구조를 단정하지 않습니다.

출처: [BrowserMCP 홈](https://browsermcp.io/), [공식 사용 문서](https://browsermcp.io/docs/), 위 변경 기록과 설정 안내.

## 4. 위 사실에서 도출한 제안 — 휴먼 확정 의도와 별도

- WebMCPLite를 새로운 통신 규격으로 확장하기보다 **공식 WebMCP를 적용하는 작은 개발 규칙·하네스·실행 예제**로 시작한다. 이름에 Lite가 붙어도 공식 하위 프로젝트처럼 설명하지 않는다.
- 핵심 가설은 “사용자가 보는 초안을 AI도 같은 함수로 편집하고, 변경을 알아보고, 이어받을 수 있는 예제가 도입을 쉽게 한다”다. 기본 JS 도구 노출·매뉴얼 제공 자체는 이미 겹친다.
- 개발 AI가 읽는 `AGENTS.md`와 사이트를 사용하는 AI가 읽는 런타임 안내를 구분한다. 안내가 같은 도구·데이터 계약에서 벗어나지 않게 검증한다.
- 간단한 get/set을 기본으로 삼되, patch인지 전체 교체인지·null/누락 필드·배열 대상·서버 저장 여부를 명시한다. `set`이 무엇을 의미하는지 모호해지면 단순한 이름이 오히려 불편해진다.
- 편집·저장·제출·이동은 결과 의미를 구분한다. 저장 여부를 단지 HTTP 성공으로 추정하지 말고 앱의 확정 상태로 돌려준다. 업무별 승인 수준을 공통 SDK가 임의로 확대하지 않는다.
- 첫 진입 안내, get/set, 변경 표시, 사람의 이어받기, 미저장 이동, 재시도·오래된 revision 처리를 예제로 검증한다. 모든 사이트에 복잡한 충돌 엔진·워크플로 엔진을 강제할 이유는 아직 없다.
- 브라우저 미지원 시 직접 JS 호출을 제공한다면 독자 fallback으로 분명히 설명한다. 이를 공식 WebMCP 지원이나 모든 AI와의 자동 호환으로 광고하지 않는다.
- 새 세션 리뷰는 동작뿐 아니라 “이 추상화가 아직 필요한가, 기존 SDK를 쓰면 더 쉬운가, 매뉴얼이 실제 계약과 일치하는가”도 계속 확인한다.

## 5. 인계 한계

공식 웹 문서 재확인은 위에 명시한 범위다. GitHub 링크는 앞선 소스 관찰을 추적하는 출처이며 이번에 GitHub 플랫폼 접근을 다시 수행한 것은 아니다. 경쟁 프로젝트의 현재 전체 코드·지원 브라우저·성능·라이선스 적합성·상표/패키지명 가용성은 이 문서로 보증하지 않는다. 외부 사실을 README나 비교표에 확정적으로 싣기 전 필요한 범위만 다시 확인한다. 비공개 제품 코드·고객 데이터·내부 작업 링크는 이 공개 인계에 포함하지 않았다.

## 6. 실행 채팅 재확인 (2026-10-25)

- [공식 초안](https://webmachinelearning.github.io/webmcp/#modelcontext-interface) §§4.2, 4.2.1: registerTool은 Promise, execute 콜백은 Promise<any>, executeTool은 플랫폼이 직렬화한 문자열을 반환합니다. 브리지에서는 콜백에 객체를 그대로 반환합니다. AbortSignal 해제와 등록 거부도 처리합니다. 구형 navigator API는 이 초안과 별개이며 초기 브리지에서 지원을 주장하지 않습니다.
- [Kit 구현 안내](https://docs.nekuda.ai/skills/implement)도 방문자 작업에 맞춘 도구와 기존 앱 동작 연결을 다룹니다. 인계의 `ask_site` 관찰은 해당 공개 안내 페이지에서 세부 원문을 재확인한 사실이 아닙니다. 따라서 사이트 안내 도구를 Lite 고유 기능이라고 주장하지 않습니다.

## 후속 H32 정정과 자료의 적용 범위

이 자료의 초기 JS 대안·메타 진입점 제안은 당시 AP 기록입니다. [H32](human-intent.md)의 document.modelContext 단일 진입점 정정이 우선하며 별도 공개 fallback으로 구현하거나 권하지 않습니다. 공식 초안의 getTools/executeTool 소비와 브라우저 에이전트 내부 발견은 계속 구별합니다. 당시 리서치 사실·원 제안은 삭제하거나 휴먼 결정으로 소급하지 않습니다.
