# WebMCPLite: evidence of explicit human intent

> This source packet preserves user messages visible in the original discussion and the human-authored supplemental comment requested for promotion into the main text. It is evidence, not proof of repository state or completed implementation. Korean quotations remain verbatim in text blocks; English titles, status labels, and summaries are agent explanations, not rewritten human speech.
>
> Provenance: H01–H28 were visible user messages in the original discussion. Permanent message URLs, IDs, and individual timestamps were not supplied, so stable H identifiers and opening words serve as locators. H29 is the human-authored supplemental comment checked during handoff. H30–H31 and H33 are follow-up messages in this execution chat; H32 was forwarded here from the original planning chat.

> H34–H37 are later execution-chat requests. H36/H37 distinguish the example site from portable development guidance and prioritize ordinary app-action reuse with a small edit-versus-save instruction. Their source locators are the section IDs and verbatim opening words; stable turn URLs were not supplied.

## Reading and authority boundaries

- Direct quotations are the human's words. The status distinguishes questions, hypotheses, preferences, and authorization.
- Agent summaries explain meaning without creating new human decisions.
- Patch semantics, batch atomicity, snapshots, schema/library choices, and the former revision mechanism were AP unless explicitly specified later.
- Direct merge authority applies only to WebMCPLite. H31 separately permits its fictional GitHub Pages examples; no other server, customer-data, or package authority follows.
- H32 supersedes the parallel metadata/global entry-point proposal. H33 supersedes revision counters, fashion-specific samples, and Korean current site/documentation. Original evidence is retained.
- Repository state, current API support, and outside research require separate verification.

## H01 — An AI-friendly website

Status: Initial problem statement and idea.

```text
잠깐, 쉬어가는 브레인스토밍 코너,  사실그냥 어찌보면 패러다임인데, MCP가 솔직히 AI가 쓰기 좋은 API인거잖아?
AI가 쓰기 좋은 웹사이트 규약같은건 없을까?
간단하게 걍 웹사이트인데 메타에 AI에게 쓰는 편지 (너는 뭘 해주면 사용자가 좋아한다) 이런거
```

Agent summary: Provide a small, discoverable description so AI can understand and use an existing website. The starting point is better usability, not a new hosted AI service.

## H02 — Human and AI editing the same page

Status: Explicit target workflow and problem.

```text
목적은 반은 그거야. 솔직히 ERP가 쉬운 툴이 아니잖아. 지금 특히나 라인시트 만드는데, 이게 영 좋은 UX가 안나오는데, 이걸 말로 명령을 내리면 좋을거 같아. 복잡하게 UI로 프리셋같은걸 만들어주기보단, 챗봇에게 시켜서 바로바로 입력해주는게 좋을꺼 같기도한데, 한마디로 AI랑 나랑 웹사이트 같이 쓰는 편집하는 상황을 가정했을때 (지금 딱 이게 쉽지 않은게 코덱스도 브라우저 컨트롤하면 속도가 느리때문에 같이 작업못해 왜냐면 코덱스도 분석해야하거든 그리고 본인도 분석하는데 시간이 걸리고) 정말 둘이서 팀뷰어 켜놓은 상태에서 내가 해볼께 네가해 이런식으로 (가능하면 보이스로) 하는 상황이 나오면 좋겠단거지
그러기 위해선 html이나 js 볼것도 없이 $("#llms").text() 만 읽으면 그냥 바로 이페이지가 뭐하는건지 지금 얘가 넣을 수 있는 데이타의 name이나 id가 뭐가 있는지 쫘라락 알 수 있으면 좋겠다는거지
```

Agent summary: The central goal is shared editing and quick handoffs. Voice is a preference when possible, not a requirement to build voice infrastructure. Clear page guidance and editable data should reduce repeated DOM interpretation. The historical DOM-marker idea is superseded by H32.

## H03 — Calling functions in the browser

Status: Technical hypothesis and feasibility question.

```text
그 예로 개발자가 디버깅하면서 콘설창에 자바스크립트 써서 원하는 데이타 뽑아내거나 테스트하는것처럼 코덱스도 브라우저 컨트롤이나 옆탭에 띄워놓으면 해당 형식으로 작업을 할 수 있지?
```

Agent summary: The human imagines AI calling page functions rather than relying only on screen coordinates. This question is not proof every browser-agent product permits arbitrary JavaScript.

## H04 — Simple getters/setters and manuals

Status: Explicit design direction and illustration, not a final API contract.

```text
내가 제이쿼리에 익숙해서 제이쿼리 쓰는거지 당연히 자바스크립트도 가능하지.
간단하게 즉, ai한테 메뉴얼 제공해주는거에 다음과 같은 식으로 제공하는거지 
라인시트 정보 가져오는 함수 get_sheet(index=-1) -1인경우 전부 리턴 json
그리고 set_sheet(index,json)하면 전부 수정가능하게 해놓고, ai한테 이거 쓰는법 오픈
ai 는 사실상 브라우저 거의 신경도 안쓰고 js명령어만으로 컨트롤 가능 어때?
```

Agent summary: jQuery reflects familiarity, not a required dependency. Expose a small number of domain getters/setters with clear instructions. The function names and -1 value illustrate the original sheet idea rather than prescribe a universal API.

## H05 — Existing browser agents first

Status: Intended access channel and future flexibility.

```text
ㅇㅇ 이걸 그냥 코덱스 브라우저 유즈 기능을 이용해서 쓰게해도 되고, 아님 나중에 챗봇을 붙여줘도 어렵지 않게 챗봇이 작업하게 할 수도 있고.. 이거 30분만에 만든 아이디어 치고는 너무 강력한데?
```

Agent summary: Existing AI browser tools should be usable, and a later chatbot could use the same functions. A custom chatbot is not a prerequisite.

## H06 — Short site/page guidance and small connecting code

Status: Repeated simplification questions.

```text
아 그럼 우리가 이야기한거랑 상당히 컨셉이 같은거네? 근데 이게 예로 사실 아까 이야기한것처럼 솔직히 이야기해서 이페이지에서 ai에게 필요한 메뉴얼은 어디야 혹은 이사이트의 메뉴얼은 어디고 url에 따라서 뭘 더 봐 이런식으로만 해주고 그냥 도구만 제공해주면 되는거지, 커먼js가 있어야하고 논문급으로 써야하나? 하긴 논문도 아이디어 하나 듣기만해도 이해할만한걸 가지고서 검증한다고 몇페이지씩 말을 키우긴한다만
```

```text
ㅇㅇ 그러니깐 "도구를 발견하고 호출하는 공통 형식" 이 복잡할 필요가 있냐는거야 내말은 사이트가 말이 길어보여서 컨셉이 사실 간단한데, (하긴 뭐 상황이 여러 상황이 있을 수 있는거 다 설명해주는걸 수도 있지만) 아직 정식이된것도 아닌데 따라가면 구지 무거워지는게 아닌가 싶기도해서
```

Agent summary: Keep discovery, invocation, and guidance small. Distinguish site-wide and URL-specific guidance. The human does not prohibit documentation or common code, but questions complexity without practical value.

## H07 — Align with WebMCP while staying small

Status: Explicit agreement at that point, later clarified by H26.

```text
어 난 그걸 물어본거야. 기왕할꺼 맞출까? 아님 득보다 실이 많고 진짜 나중에 표준이되면 그때 변경해도 어렵지 않을꺼 같다 싶으면 걍 가고 솔직히 일은 니가 하는거니깐 좀 무겁더라도 정리가 잘된게 더 좋을 ㅜㅅ도 있어 내가 이야기하는걸로 구체화하기 어려울 수도 있잖아
```

```text
어 형식에 맞춰서 한다 정도로하자 그정도로도 충분할테고 솔직히 1년된 프로젝트가 커밋이 150개면 그건 죽은프로젝트야 ㅋㅋㅋㅋ
```

Agent summary: A tidy structure is compatible with lightweight scope. The remarks about project age, commit count, and activity are the human's opinion at that time, not researched facts about the current specification or project.

## H08 — Original product-entry use cases

Status: Historical domain and priority explanation, generalized under H33.

```text
어 이게 지금 솔직히 필요한게 라인시트쪽이 젤 필요하고, 제품쪽은 지들 업체 자체 데이타랑 연동시에 좋은거 같아. 
예로 제품 등록시 스타일넘버만 똭 입력해 놓고 제품 pdf 를 ai한테 던져주고 입력해줘 이런 느낌정도로 쓰이는거지 대화 핑퐁하면서 쓸건 라인시트쪽이 확실히 강해
```

Agent summary: The original need involved sheet editing and entering product data from company material or PDFs. This did not request PDF extraction models or external integrations in WebMCPLite. Current examples use neutral SKU/product-code data under H33.

## H09 — Complex searches without a sprawling UI

Status: Future possibility, explicitly outside the current examples under H16.

```text
ㅇㅇ 근데 양쪽 다 마찮가지긴해. 제품쪽도 예로 쇼피파이가 복잡한 형태로 검색이 가능하잖아? 그거 누가해 개발자나하지. 근데 그걸 구지 지저분하게 ui로 제공을 안하더라도 webmcp로 제공하면 원하는 제품만 똭 찾을 수도 있는거지
```

Agent summary: Authorized tools could expose detailed search conditions not all represented in the UI. This does not authorize hidden data access or a permission bypass.

## H10 — A B2B setting where guidance is possible

Status: Explicit audience and adoption context.

```text
아 참고로 난 b2b니깐 고객을 계몽할 수 있는 상황이야
```

Agent summary: The human can teach customers a defined AI workflow. There is no requirement for zero-setup compatibility with every consumer or AI.

## H11 — Rules and examples before a packaging decision

Status: Architecture question, not a final packaging requirement.

```text
흠...어찌할까? webmcp처럼 완전 별도 번들로 만들어버릴까? 아님 가볍게 컴포넌트 수준으로만 만들까?
`get_sheet` / `set_sheet` 형태로 각각 만드는건 제품 아키텍트에 룰 심어놓고 그러게 가는게 해야겠고.
흠.. 아니 사실 거의 그게 다인가? 이게 개발 룰이지 컴포넌트가 아닌가
여튼, 컴포넌트 예제 페이지 만든것처럼 예제 페이지 몇개 만들긴해야할꺼 같아. 일단 라인시트랑 비슷한 테이블 수정하기 이런 느낌으로라도
```

Agent summary: Use development rules to encourage consistent getters/setters and show real editable examples. A large framework, specific UI library, or single-script distribution was not chosen here. H33 later selects the gallery UI stack.

## H12 — Using customers' existing AI and browser tools

Status: Idea and feasibility question.

```text
근데 진짜 오픈마인드 아니냐? 첨엔 고객이 ai 잘 쓰는거에대한 두려움이 있었는데, 내가 적극 권유하는 상황이네.
그냥 고객한테 챗지피티 걍 스킬에 "브라우저탭으로 대군 사이트 열어줘, 내가 이후에 뭔가 이야기하면 메타 데이타중 agentsmd 읽고 네가 할 수 있는 작업 해줘" 이런식으로 만 박고 챗방 하나 열고 스킬한번 써줌되는거 아냐?
```

Agent summary: Let the customer's existing AI open the site and read guidance. Actual skill distribution, tab permissions, and product support require separate verification. The historical agentsmd runtime-marker idea is superseded by H32.

## H13 — No required hosted chatbot or model service

Status: Explicit direction and documentation requirement.

```text
어 구지 챗봇 필요없지 어휴 이번에 오픈웨이트 모델 이런거보니, 직접 호스팅은할게 아니고, 남에 호스팅 가져다 쓰는건 무섭고 

이슈 만들어줘 나도 한번 읽어보게 한글로 작성해주고, 내가 이야기한거랑 너가 덧붙인거(내 의중이 불확실한거) 잘 나눠지게해줘
```

Agent summary: A custom chatbot or model service is not the goal. Clearly separate the human's words from uncertain agent additions. External AI use remains consistent with H05/H12. H33 supersedes the earlier request for Korean current documentation.

## H14 — Original authorized scope

Status: Explicit scope definition.

```text
아 작ㅇㅂ 범위는 "제품 철학+ 개발 규칙 + 작은 공통 연결 코드 + 실행 가능한 예제" 정도 작성이야
```

Agent summary: Deliver product principles, development conventions, small connecting code, and runnable examples. Do not expand to a general agent platform or hosted model service.

## H15 — Visible AI edits and a display toggle

Status: Explicit feature requirement; the control's shape is illustrative.

```text
아 추가할 만한 아이디어가 있어 난 진짜 ux 개발자가 되었어도 먹고 살만 했을듯,
ai가 뭔가 set하는 경우엔 변경된 값은 어떠한 형태로 하이라이트 되야해. 이게 좀 보기 거슬릴 수 있으면 리모콘 같은걸로 하이라이트 끌 수 있게 해주는 식으로 해줘도 좋고
```

Agent summary: People must be able to see values AI changed. A way to hide the marks is also explicitly suggested. The remote-control metaphor does not request a separate remote-control product.

## H16 — Promoting supplemental ideas into issue text

Status: Historical issue-editing request; the retrieved relevant comment is H29.

```text
내가 어제 코덱스 접근이 안되서 아이디어 보완부분을 이슈에 코멘트로 추가했거든 확인해줘
```

```text
해당 내용을 본문으로 정제해서 승격시키고 유사한 컨셉으로 좀 깊이있게 아이디어 이야기할게 있나? 아. 검색에서 어찌보면 히든 복잡한 필터가 있을 수 있는거 같은거 내용이 좀 부족했던거 같아서 넣고, 대신 이번 예제 범위는 아니고, 그냥 나중에 있을 수 있다 정도
흠 액션에 관한 부분도 뭔가 있어야할까? 서밋이나 캔슬 버튼은 js 함수로 처리해서 ai가 쉽게 누를 수 있게하고, 리스트에서 goto item detail 뭐 이런건 어짜피 링크 이동이니깐 그냥 링크이동은 따로 함수 제공안해도 알아서 할 수 있겠지 
ajax로 뭐하는 경우도 많을테니 그런것도 대부분 함수 단위로 이쁘게 해서 (이게 노드가 기본적으로 그렇게 하는지는 모르겠지만) ai가 호출하기 좋게하는 코드 디자인으로 가면 좋겠는데 어때?
```

Agent summary: Fold supplemental ideas into the issue while keeping complex hidden filters as future possibilities outside the examples. Make submit/cancel and AJAX actions easy to call. The early view that links need no extra action is supplemented by H23's request for major navigation actions.

## H17 — Scope of unsaved-state checks

Status: Proposed common interface and explicit meaning of page-wide scope.

```text
아 그럼 미저장 변경 확인 절차 이런건, 거의 전 서버에 동일 함수로 체크하게 할까? isUnsavedContents(specific form = null) 널 일경우 전역 
```

```text
여기서 전역은 : 그냥 내가 페이지를 뒤로 가기 눌렀을때 체크할 모든 부분이지
저장 결과 확인 필요 > 이건 ajax 통신상태라 그런거야? 아님 다른 예가 있어?
```

Agent summary: With form=null, global means every editing area checked when leaving the current page through browser back. It does not mean the whole server, other tabs, or all companies. Exact argument and return contracts remain implementation choices.

## H18 — Understandable save failures

Status: Concern about save experience and request to inspect existing practices; no fixed solution.

```text
자 그럼 다시 이야기하자 "여러 저장 작업 중 일부만 성공한 경우" 이게 사용자에겐 너무 애매한거라. 지금 이미지 뭐 이런 이슈를 떠나서 뭐 어떻게든 있을 수도 있는거고 사실 requirement 다 지켰는데 저장에 실패하면 사용자 입장에서 뭐 어찌해야해? 싶어서 이런 경우 다른 서비스의 경우 처리를 어떻게하는지 부터 일단 살짝 잡아줘 (이것도 좀 옆길로 샌 내용이네)
```

Agent summary: Avoid leaving a user unsure how to interpret or recover from failure after satisfying requirements. This does not authorize global transactions, rollback, or automatic retries for all actions. Examples can clarify outcomes, dirty state, and retry.

## H19 — Runnable single-product and bulk editors

Status: Explicit example request.

```text
지금 우리가 생각이 많이 정리가 되었나? 이거 컴포넌트 예제 만들듯이 제품 편집페이지랑, 임의로 벌크 제품 편집페이지 만들어서 걔들 수정하게하는 예제를 만들 수 있을까?
```

Agent summary: Single-product editing and arbitrary fictional bulk editing are concrete requested examples. This is not permission to change live ERP records.

## H20 — A public, approachable project

Status: Public-project direction and a differentiation question.

```text
내가 그냥 임의로 퍼블릭 깃헙 프로젝트로 만들려고 하는데... 우리가 만드는게 webMCP란것과 차별점이 있을까? 일단 좀 더 캐주얼할꺼 같긴해
```

Agent summary: The human expects an approachable independent GitHub project and asks how it overlaps WebMCP. Do not convert the question into a claim of novelty.

## H21 — Site map and site manuals as tools

Status: Explicit direction; AJAX is an illustrative delivery method.

```text
어 그리고 site_map 이라던지 몇몇 전 사이트 메뉴얼 같은 기능들에 대해선 쉽게 호출할 수 있게 기본함수로 제공해주려고 이건 당연히 함수 호출하면 그냥 ajax로 뿌려주는데 일단 기능을 제공해주는게 좋은거고, 해당 데이타도 ai가 읽기 좋게해주는거고
```

Agent summary: Provide easy-to-call site-map and common guidance functions with AI-readable data. Exact site_manual/page_manual names, parameters, and formats are agent proposals.

## H22 — Enable existing AI to use B2B sites

Status: Human judgment about product direction.

```text
어. 요즘 B2B 사이트에 AI를 붙이기 위해 노력하는데, 내부에 AI 모델 서비스하는거보다 이게 맞는거 같아. 
```

Agent summary: Favor the customer's existing AI using the website over running an internal model service. This is not an empirical claim that the approach is best for every B2B company.

## H23 — Major actions and varying automation levels

Status: Follow-up scope and importance of shared work.

```text
아 그리고 저장이라던지 페이지 이동등 주요한 기능도 제공해주면 좋아. 그럼 경우에 따라서 자동화 수준을 높게 할 수도 있거든.
여튼 완전 100% AI에게 작업을 맡기는 상황이 아닌이상 휴먼이랑 협업하는건 필요할꺼라고봐. 

이게 사실 이 틈새를 메꿔주는거 같은 서비스에 제일 "그거 금방 쓰레기 된다" 같은게 ADE라고 해야하나? 커서 같은 IDE에 붙은 AI 인데, 코딩은 너무나 빠르게, AI가 휴먼을 대처했다고 생각해. 
근데 이게 코딩쪽이 특히 그런거고 UI는 아직도 같이보면서 작업해야하고. 
이런저런 컴퓨터밖 일이랑 접점이 많은 ERP 같은건 특히나 이런 기능이 꽤 오래 필요할거라고 생각해
```

Agent summary: Expose save and navigation to allow more automation where appropriate, while keeping human–AI shared use valuable. A callable function does not grant blanket permission for unattended execution. This follow-up supplements H16's earlier navigation view. Statements about coding AI and the industry are the human's perspective, not verified statistics.

## H24 — Distinguish WebMCP from WebMCP Kit

Status: Explicit research and accuracy question.

```text
잠깐 네가 말한 webMCP kit이랑 https://webmachinelearning.github.io/webmcp/ 이거랑 다른 프로젝트네?
```

```text
두개가 연관이 있는건가?
```

Agent summary: Do not confuse the official draft with a separate SDK/development project. Keep researched relationships separate from evidence of human intent.

## H25 — Simple getBoard/setBoard tools

Status: Explicit design preference.

```text
근데 물론 어떻게 쓰냐에 따라 다르겠지만 WebMCP Kit 같은건 renameBoard 함수들을 제공한다고? 우린 좀 더 쉽게 가자 setBoard, getBoard 이런식으로, 
```

Agent summary: Prefer understandable reads/edits over many per-field action verbs. Board is illustrative, not a forced entity across all domains. Patch versus replacement, validation, batching, and saving are not fixed here. The question about Kit's renameBoard is not a factual claim about a required Kit API.

## H26 — Name, alignment, harness, and examples

Status: Explicit project composition and a discovery question.

```text
내 생각으로도 그냥 WebMCP 규격을 맞추고 WebMCP Lite 이런 이름으로 가는게 좋을꺼 같아. 내가 쓰기 좋게 가볍게 가는거고, 

깃헙에 올리는건 대충. 1 WebMCP Lite 기능을 넣기 위해. "AGENTS.md에 추가되는 하네스에도 집중하고"

2.  WebMCP Lite에서 사용하는 규칙들

3. 5~6가지 예제

아 근데 그럼 다른 WebMCP는 처음에.. 나는 메타데이타에 프롬프트 넣자 이런식으로 했잖아. 

뭐든 비슷하게 진입점이 있어야할듯한데 공식 WebMCP는 그게 뭐야? 솔직히 규격의 99%는 이부분인거 같거든
```

Agent summary: Use a lightweight WebMCP-aligned project called WebMCP Lite. Its three deliverables are a development AGENTS.md harness, conventions, and 5–6 runnable examples. The 99% phrase expresses the importance of discovery, not a measured proportion of the specification. The source UI's &#x20; references were rendered as paragraph spaces when this quotation was first preserved; wording and function names were not changed.

## H27 — Execution request and limited merge authority

Status: Explicit execution request and repository-scoped authority.

```text
내가 WebMCPLite 라고 만들었는데, 논의 내용 정리해서 해당 프로젝트 진행해줘, 깃헙부터 PLANS.md 이런거 만들어서 이거 대화 내용의 대부분 "명시된 휴먼 의도"랑 네가 리서치한거 포함해서 넣어놔
옆 채팅방에 PLANS.md 읽고 프로젝트 계획 이슈 잔뜩 만들고, PR 로 처리하게 시켜, WebMCPLite에 한해선 직접 머지해도 좋아. 지속적으로 새 세션으로 리뷰하고 방향성에 대해서도 계속 의심하면서 진행하게해 
```

Agent summary: Continue the existing WebMCPLite project, prepare GitHub/PLANS with most explicit human intent and researched facts kept separate, and implement through planning issues and PRs. The request authorized creating and briefing a separate user-owned execution chat at that point. Direct merge permission is limited to WebMCPLite, not other projects or ERP data. Use genuine fresh-session reviews and question direction. Issue count, remaining example details, package/license/deployment/version policies were not fixed here.

## H28 — The project already exists in Codex

Status: Explicit locator information.

```text
WebMCPLite 라고 코덱스에 프로젝트 넣어놨어
```

Agent summary: Reuse the already registered WebMCPLite project; do not create another project with an invented name. Resolve the actual repository/path from project context.

## H29 — Related data and shared UI/tool actions

Status: Human-authored supplemental intent promoted into the main record.

Source: human-authored supplemental comment requested for promotion in the original discussion, 2026-10-21T09:04:22Z; verbatim content checked during handoff.

```text
휴먼 코멘트 - 부가적인 정보가 있다면 기본 ui 정보 뿐만아니라 오브젝트 정보도 알고 있어야한다. 예로 아마 라인시트의 경우 제품 정보를 다 표시하지 못하고 프리뷰 팝업이나 페이지 이동등으로 제품 상세정보를 보겠지만 ai가 볼 수 있게 get_product 같은것도 존재해야한다. 
예로 제품넘버 타입이 여러개 일때 제품넘버b타입으로 표시해주ㅓ 하면 바로 작업해 줄 수 있게

get_product 같은 경우는 아마 twig나 리퀴드 같은곳에서 var produt = {% products| json %} (문법 앟아서 보고) 이런 형식으로 하면되니 어렵지 않을듯하고, 노드에선 모르겠다. 기본적으로 set_sheet의 경우엔 예로 값 받아왔을때 쓰는 함수를 그대로 이용가능하게 포장할 수 있는지 혹은 한쪽이 wrapper로 한번 감싸는등으로 최대한 재활용이 가능하게, 초기부터 코드 디자인을 이런식으로 간다 (요게 이번 작업을 미리해야하는 주요 이유)
```

Agent summary: Allow authorized related-object reads beyond the current preview and support switching between multiple product identifiers. Reuse the UI's value-application functions, directly or through wrappers, from the beginning; do not create duplicate UI/AI state. Twig/Liquid and JSON snippets are illustrative ideas, not required technologies or confirmed syntax. Original typos stay in the quotation. H33 now expresses identifiers as SKU/productCode.

## H30 — Running repository examples at a public URL

Status: Follow-up question after initial implementation.

```text
아 근데 깃헙에 파일 넣어놓은걸로 거기서 바로 예제 돌릴 수 는 없나? 아.. 흠 예전에 구글페이지 서비스를 깃헙 파일을 끌어와서 올릴 수 있게? 이런거 있었던거 같은데 비슷한 느낌으로
```

Agent summary: The human asks how to use repository examples without local installation. This question alone does not establish that a provider deployment has occurred.

## H31 — Publish with GitHub Pages and show main

Status: Explicit publishing request after the Pages explanation.

```text
어 일단 게시해봐봐 게시하면 마지막 메인 상태로 볼 수 있나?
```

Agent summary: Authorize publishing this repository's fictional examples through the described GitHub Pages approach. Main deployment and a commit display are agent choices to answer whether the latest main can be seen. Authority does not extend to other services, real customer data, or npm publishing.

## H32 — One runtime entry point: document.modelContext

Status: Human correction forwarded from the original planning chat into this execution chat.

```text
`document.modelContext` 를 읽는게 webmcp 규칙이라며 우린 그것도 쓰고 `#agentsmd` 이것도 쓰는거야? `#agentsmd`이걸 지금 우리 내부 규칙으로 삼았어? 그냥 `document.modelContext`만 읽게하는게 맞는거 같은데
```

Agent summary: Use document.modelContext as the single runtime entry point. Retire the initial metadata idea and dual-entry AP from current guidance while retaining their historical record. Do not imply the human originally chose a second protocol. The correction does not remove registered manuals or development AGENTS.md.

## H33 — Follow WebMCP, simplify contracts, and renew the English gallery

Status: Explicit follow-up implementation request in this execution chat.

```text
webmcp 규격에 어긋나지 말아줘. 깃헙 리드미에도 애초에 내가 필요해서 개발 시작했는데 이미 정리된게 있어서 저거 규격에 맞춰서 나처럼 쉽게 쓰려는 사람들을 위한 프로젝트다란 식으로 표현해줘.

리비전은 빼줘 구지 필요없을꺼 같아. 

그리고 흠.. 아 사이트나 문서 영문으로 해주고, 그리고 지금 너 인터페이스 엄청 구린데 그냥 ant design 에서 lobehub theme으로 아예 새로 만들어줘, 그리고 구지 패션쪽으로 자꾸 치우쳐저 있는데 패션쪽 다 빼줘 스타일 이런거 빼고 SKU나 product code이런식으로 해주고
이후에 테스트할께 
```

Agent summary: Follow the existing WebMCP specification and describe the personal motivation and practical companion purpose in README. Remove revision counters, make the site and current documentation English, rebuild the UI using Ant Design with the LobeHub theme, and replace fashion-specific examples with generic SKU/product-code data. The human will test after delivery. This supersedes the historical revision API, fashion presentation, Korean current documentation/site copy, and no-build gallery AP; it does not erase earlier quotations or authorize unrelated systems.

## Historical classifications and unresolved choices

These are agent classifications, not human quotations.

1. **Detailed set semantics:** partial patches, full replacement, batch atomicity, snapshots, and the former revision checks were not specified in the original discussion. H33 now explicitly removes the revision mechanism from examples.
2. **Save authority:** exposing save/cancel/navigation and permitting this repository's PR merges does not authorize every real data write without confirmation or permit changes in another project.
3. **Voice:** desired when possible; custom speech recognition, TTS, or a voice-agent server were not requested.
4. **Hosting/transport:** AJAX was an example for delivering manuals, not a requirement for a proxy, backend, remote model, or separate MCP server.
5. **Discovery:** metadata/agentsmd/#llms were early ideas, later superseded by H32. They must not reappear as parallel current guidance.
6. **Naming:** the discussion moved from WebMCP Lite to the registered WebMCPLite project. Package, domain, and trademark availability are not established.
7. **Example selection:** single-product, bulk, and sheet-style editing came from the discussion; the remaining examples are AP. Advanced hidden search stays future scope. H33 generalizes the example domain.
8. **Two manual audiences:** the explicit distinction between developer harness and runtime manuals is agent synthesis of H12/H21/H26.
9. **Overlap:** exposing tools and manuals is not itself a unique invention. Keep comparison evidence separate and validate whether examples make adoption easier.
10. **Stopping reviews:** repeated fresh-context review means substantive independent review, not endless reviews, issues, or unsupported redesign.

## Excluded side topics and source limits

- Product create/import API ownership, base-variant creation, marketplace image ordering, and image/product transactions were split into a separate discussion. They are not WebMCPLite API policy. H18 preserves only the concern about confusing partial-save outcomes.
- H29 was the relevant supplemental comment retrieved during handoff. This public packet omits private repository addresses and identifiers while preserving the checked timestamp and provenance description. Do not claim other unverified comments were read.
- Prior agent answers and research are not direct human evidence. Official WebMCP, nekuda WebMCP Kit, FrontMCP, SiteMCP, and BrowserMCP observations belong in research with URLs, dates, and limitations.
- The packet contains public project intent, not operational records, secrets, credentials, or private user files.

## H34 — Administrator tutorials and landing page

Human request (verbatim)

### Administrator storytelling
```text
각 페이지마다. 스토리 텔링해봐줘. 나도 급하게 진행시키느라 이걸 안했네 아니 거의 너한테 맡겨서 그렇지. 스토리텔링부터 해서 사용자들이 오 이런 기능이?할 수 있어야하는데 이게 좀 적었네, 사실 프로덕트 리스에선 거의 검색쪽이랑 간단한 기능만 하면 좋은데, 이건 네가 바이어 입장이랑 b2b 입장이랑 섞었네. 
일단 퍼소나를 만든다던지해서 그냥 일반 이커머스 입장 관리자 페이지에서 하는걸로 해서 시나리오 잡아줘
아 플래닝 보드는 어떤걸 생각하는거야?

그리고 Tool playground 이런건 구지 일단 드러나게 하지 말고 탭으로 가리는게 좋을꺼 같은데, 그전에 뭐하는 기능인지 설명해줘
```

### Product reuse
```text
아 사용 시나리오중에 이런거 어때?  제품 추가하는데 사이트에 듀플리케이트 기능이 없어. 새로 탭하나 열어서 동일한 제품 만들어줘. 이러면 그냥 get product 하고 그 데이타 ai가 들고 새탭에 new product 페이지 열고 set product 하면 되잖아
```

### Storefront source editing and duplication limits
```text
아니뭐 그건 프롬프트 나름이고 중복 제한이 걸리는건 duplicate가 자동으로 체크되는게 일반 사이트겠지, 우린 예제니깐 그거 필요없고.

**Planning board → 스토어 공지** - 이건 좀 약해.
창위아래로 나눠, 위에 storefront Custom TextArea에 div 로된 뭔가가 있고 preview 버튼 있고 밑레 preview 화면이 있어.&#x20;
대충 카테고리 명 위에 있고 아래 사진 있는거 3개가 나열되어 있는 레이어야.
프롬프트는 해당 배너?(명칭이 뭐지) 수정해줘, 카테고리명이 이미지 중앙에 오도록 하게 잘보이게 하얀색 쉐도우(맞나?)를 넣어줘&#x20;
이런식으로&#x20;
AI 안쓰면 일반인은 힘든 작업을 시키는거지
```

### Light project information
```text
Guides & navigation → 이건 그냥 좀 chill하게 가자. 예제 프롬프트는 "이거 사이트 너무 맘에 드는데, 어디서 자세한 정보를 얻을 수 있지?" 하면 일단 가이드에 당연히 사이트 자세한 정보는 링크 뭐다라고 알려줘 놓고, 해당 링크엔 가볍게 깃헙 링크 달랑 있고 프로젝트는 여기서 확인해줘 이런거 넣자

Save & recovery 이건 어찌보면 아까 이야기한 듀플레케이션 처리가 이걸 대신하는거네
```
```text
아니 듀플리케이트 작업 자체가 어찌보면 Save & recovery랑 비슷한 내용이야. 근데 내용에 Memory and Reuse 이런식으로 바뀌는거 뿐이지
```

### Search followed by read-only context
```text
아.. 재고를 그냥 그렇게 하면 안되겠지만 좀 스토리텔링이, 임의의 제품 검색을 하게할꺼잖아? SKU에 KEY가 포함된 제품중에 가격이 $20 이하인걸 찾아줘. 이런식으로 하고, 지금 검색된 제품중에 재고가 5개 이하인 제품들 있어? 이런식으로

멀티 검색했을 시에 이어지는 프롬프트로..
괜찮을꺼 같지? 그럼 이런식으로 해서 시나리오 잡고 다시 전체 시나리오들 표로 정리해줘
```

### Final tutorial and landing layout
```text
**Product editor**  이부분은 영문 디스크립션, 한국어 디스크립션 두개 칸 놔두고 영문쪽에 오타 작렬 저렴한 말투로 디스크립션 써놓고서,
프롬프트는 "디스크립션 다듬어주고, 번역해서 한국어 디스크립션도 기입해줘" 이정도
Bulk editor는 좀 많아야하니 - 이 두 상품의 가격을 각각 10% 내려줘. 아직 저장하지 말고 보여줘 라기보단 이것도 KEY-1로 시작하는 제품들 다 10% 내려줘 이런식으로 말을 바꾸자.&#x20;

그리고, 랜딩페이지?에 "WebMCP 인식 못하는 AI에게 인식시키는 프롬프트"랑
어느 상황이든 "WebMCP 인식 후, 지금페이지에서 WebMCP로 할 수 있는일이 뭐야?" 라고 물어보라고.
"그리고 메뉴에서 각 페이지로 이동해 튜토리얼을 수행해봐" 이런말&#x20;
나머진 웹페이지 하나보고 컴퓨터 캐릭터랑 사람 캐릭터랑 같이 토론하는 느낌의  카툰 느낌 배너
첫페이지는 뭐 당연히 기본 공통 함수인 site map(명칭이 달랐나?) 정도겠지만.
아 그리고 기본적으로 수정사항 하이라이트 되게 하는건 디폴트로 On하고, 별도로 하이라이트 Off는 Ai에게 시켜서 할 수 있게 하는정도로해 UI에 넣지 말고,

랜딩 페이지 제외는  프롬프트가 가장 상단에 약간 카툰 느낌으로 이런 프롬프트 하고&#x20;
밑에 구역 확 나눠지게 하고서 밑에는 그냥 정상 웹사이트 처럼만 보이고 자잘한 설명 넣지 마

이정도면 다음 작업 진행할 수 있지? 아 깃 정리 안되어 있음 한번 정리하고 가자.
```

## H35 — Optional Korean interface, English default

Human request (verbatim):

```text
아참 내 이해를 도울겸 정채성을 들어낼겸 사이트 한/영 버튼 넣어줘 디폴트론 영문으로 하고
```

## H36 — Ordinary app actions first, minimal runtime guidance

Status: Explicit direction correction in the execution chat, 2026-10-28 (America/Los_Angeles). This changes development guidance; the remarks about removing example UI are not a request to remove the gallery in this documentation task.

Human request (verbatim):

```text
아 탭 메모리? 개발자 도구같은거? 그건 그냥 예제고 좀 없앨껀데 예제로써도 가치가 없어보여. 기존 저장·재조회·복구는 기본적으로 AI가 하지 않을까?. AI가 바꾼걸 초기화? ctrl+z 버튼을 만들자는것도 잇는건가? 구지 필요없을꺼 같아

AI 제안과 사용자 저장 확인의 연결 - set product()와 save()를 따로 구부하면돼 그리고  save는 명시적으로 저장해와 같은 단어를 썼을때만 진행하고, 수정해줘 바꿔줘 이런단어로 물어봣을때는 set..() 까지만 작업하는걸로 하게 가이드를 줘야해

사실 내 입장에선, "기존 화면에 연결하는 구체적인 과정"은 별로 필요가 없는게, 기존 화면이 별로 없거든, 그냥 "신규 화면 개설시 WebMCP Friendly structure 만들기" 정도만 나오면 될꺼야.  

아 참고로 set product() get product()는 예로 제품 로드할때는 api로 호출하고 화면에 set product() 를 쓴다던지, post 하기전에 get product()를 해서 json변수로 만들고 그걸 api post/put한다던지, save 버튼을 클릭시 save()를 호출하게 한다던지 즉, webMCP를 위한 함수를 따로 만들지 말고, 기존의 행동을 위한 함수를 webMCP가 재사용하게 할 수 있게하는 구조화가 중요한거야. 추후 webMCP만의 복잡한 기능을 추가로 제공할 수도 잇지만, 1차적으론 거의 get/set 같은 느낌이니깐, 그 말한것처럼, 예로 ai한테 제품 리스트화면에서 제품 디테일까지 다 확인할 수 있게 정보를 준다던지 하잖아? 이건 복잡하지 않게 그냥 var product_json_data[] 를 봐라고 하는게 좋을까? 아니면 get_product_json_data() 를 사용해 라고 할지는 선택사항, get_product_json_data()이 더 좋지만 product_json_data[]는 빠르게 적용할 수 잇지, 그리고 애초에 ai가 좀만 분석해도 product_json_data[]에 쉽게 접근할 수 있기 때문에 이걸 구지 get_product_json_data()로 wrapping 할 이유는 없는거 같아 좀 방향이 잡히나
```

Agent summary: Structure ordinary app data and actions for reuse by UI, API load/save and WebMCP. Prioritize new screens. Editing requests stop at setters; persistence requires an explicit user request and the host's authority. An additional app getter around existing authorized data is optional. Do not add undo or a general recovery framework solely for WebMCP. H32's standard runtime entry point remains; an existing variable is not itself a registered tool.

## H37 — Portable developer guidelines as a primary deliverable

Status: Explicit request to review and improve developer guidelines in this repository. A downstream copy is an intended use, not a completed integration.

Human request (verbatim):

```text
어 지금 애초에 그래서 지금여기 프로젝트란게 "예제 사이트", "개발 가이드라인" 두가지거든, 뭐 "개발 가이드라인"에 좀더 "복잡하고 다양한 개발용 예제" 가 포함되야할 수도 있어. 
여튼 "개발 가이드라인"이 지금 잘 정리가 되어있어서 이거보면, 아 우리 제품쪽 이렇게 수정하면 되겠네 싶어하게 하면 될꺼 같아 그래서 그냥 "개발 가이드라인".md 같은거 대군에 압축?해서 복사해 넣고, 워커나 리뷰어가 이 가이드 라인에 따라서 작업을 하게 하자. 그리고 자보자. 결국 구조잡고 함수화 + 프롬프트인데, 프롬프트는 일단 심플하게 가는걸로 프롬프트는 미래에 쉽게 바꿀 수 있는거라, 그부분까지 고민하고 가는건 초기 기회비용이 너무 커.. 이부분은 대군에 이식할때 내용이긴하고 
여튼 "개발 가이드라인" 검토하고 부족하면 채우자
```

Agent summary: The example site and development guidelines are separate deliverables. Make the guidelines usable by downstream workers and reviewers, with development examples where useful. Keep runtime prompts simple and replaceable. The current task improves WebMCPLite guidance; target-repository integration is a later activity.

## H38 — README handoff, WebMCP alignment and the meaning of Lite

Status: Explicit documentation request and a direction question in the execution chat, 2026-10-28 (America/Los_Angeles).

Human request (verbatim excerpts):

The message opens by naming README and linking the development guide through a local workspace URL. That local path is not published here. The first excerpt begins immediately after that link; the wording and literal Markdown/HTML escapes below are preserved. These are excerpts, not a reproduction of the entire message.

```text
이거 맞춰서 개발하라고 하면 돼\~ 이런 말 넣어놓고&#x20;
아 WebMCP 쪽도 링크해주고, 내가 필요해서 만들다보니 이미 규약이 있어서 이거 따라서 만들었다. 추가적으로 기능을 확장하려면 해당 규측을 확인하고 유사한 내용이 있으면 따르자 이런 이야기도 넣고..

음.. 지금, 근데 우리께 확실히 Lite하긴 한가?
```

Agent summary: Tell development AI/workers/reviewers to follow the development guide. Link WebMCP, retain the personal motivation and discovery of an existing specification, and check for equivalent standard behavior before extending functionality. Assess Lite honestly. AP assessment: the optional connector and app adoption scope are small; the React/UI gallery has separate dependencies and is not a minimal-bundle example. This question does not request replacing the human-selected UI stack.
