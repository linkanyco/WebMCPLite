# 여섯 가지 실행 예제

[공개 예제](https://linkanyco.github.io/WebMCPLite/)는 설치 없이 열 수 있습니다. main의 마지막 성공 배포를 보여주며 화면 아래 게시 버전으로 확인합니다.

로컬에서는 저장소 루트에서 Node 22 이상으로 `npm start`를 실행하고 표시된 로컬 주소를 엽니다. 설치·빌드 단계는 없습니다. 기본 포트는 4173이며 이미 사용 중이면 `PORT=4187 npm start`처럼 변경합니다. 파일을 직접 여는 file:// 실행은 지원하지 않습니다.

모든 데이터는 독립적으로 만든 가상 데이터입니다. 저장은 **현재 탭 메모리의 기준값 갱신**이며 새로고침하면 초기화됩니다. 제품/벌크는 같은 카탈로그를 공유하고 라인시트는 그 카탈로그를 읽습니다. 비동기 저장 예제는 격리된 가상 제품을 씁니다.

| 페이지 | 해볼 흐름 | 읽기 / 편집 |
|---|---|---|
| `?page=product` | AI 예시 → 이름 직접 수정 → 가격 표시 유지 → 저장/취소 | getProduct / setProduct (p1 편집) |
| `?page=bulk` | 두 제품 가격 수정 → 잘못된 한 행이 포함된 요청은 전체 거부 | getProducts / setProducts |
| `?page=sheet` | getProduct로 styleB·소재 조회 → numberType B와 rows 수정 → 순서 직접 변경 | getSheet / setSheet, getProduct |
| `?page=board` | 제목·메모의 get/set → 사람이 이어서 입력 | getBoard / setBoard |
| `?page=guide` | 두 번째 폼 변경 → 전역/개별 미저장 비교 → 이동 차단 → 취소 후 이동 | getNotes / setNote, 매뉴얼·사이트맵 |
| `?page=async` | AI 예시 → 저장 실패 → 초안 확인 → 실패 스위치 끄기 → 재시도 | getProduct / setProduct, save/cancel |

각 페이지 오른쪽 도구 선택기는 페이지 안의 `document.modelContext.getTools`와 `executeTool`을 사용할 수 있을 때 실제 입력 계약과 호출 예시를 보여줍니다. 미지원 환경에서는 AI 예시·도구 호출이 비활성화되고 일반 UI로 편집·저장·취소할 수 있습니다. 도구 등록 상태와 페이지 안 JS 조회·호출 지원 상태는 따로 표시합니다. 저장/취소 예시는 생성 시점의 revision이므로 중간에 편집했으면 도구를 다시 선택하거나 getter의 최신 revision을 입력하세요. 모든 setter는 초안만 바꿉니다.

AI의 진입점은 `document.modelContext`에 등록된 도구입니다. `site_map`으로 페이지를 찾고 `site_manual`로 공통 규칙, `page_manual`로 현재 페이지의 계약을 읽습니다. 별도 HTML 표식이나 JS 전역 객체를 읽는 절차는 없습니다. 이 세 이름은 예제의 도구 이름이며 공식 WebMCP 필수 이름은 아닙니다.

브라우저 에이전트는 등록된 도구와 스키마를 브라우저 내부 경로로 발견하고 호출합니다. 페이지 전환 뒤에는 다시 발견하세요. 브라우저가 표시용 이름에 접미사를 붙일 수 있습니다. 페이지 안 JS 실행이 허용되고 `getTools`와 `executeTool`이 구현된 환경에서는 아래처럼 같은 등록 도구를 사용합니다. 등록 지원만으로 이 JS 경로나 모든 AI의 호출 가능성을 보장하지는 않습니다. [공식 초안의 두 경로 설명](https://webmachinelearning.github.io/webmcp/#modelcontext-interface)과 실제 지원 검증을 구분합니다.

```js
// ?page=product에서, 앱의 도구 등록이 끝난 뒤 실행합니다.
const context = document.modelContext;
if (typeof context?.getTools !== 'function' || typeof context?.executeTool !== 'function') {
  throw new Error('이 브라우저는 페이지 안 WebMCP 조회·호출을 지원하지 않습니다.');
}
async function invoke(name, input = {}) {
  const tools = await context.getTools();
  const tool = tools.find(t => t.name === name && t.window === window);
  if (!tool) throw new Error(`현재 페이지에 등록된 도구가 없습니다: ${name}`);
  const result = JSON.parse(await context.executeTool(tool, input));
  if (result.ok === false) throw new Error(result.error.message);
  return result;
}
await invoke('page_manual');
const current = await invoke('getProduct', { id: 'p1' });
await invoke('setProduct', {
  id: 'p1', patch: { name: 'Shared shirt' }, expectedRevision: current.revision
});
// 초안을 검토한 다음 명시적으로 저장
const edited = await invoke('getProduct', { id: 'p1' });
await invoke('save', { form: 'catalog', expectedRevision: edited.revision });
```

조회한 `RegisteredTool`은 실행에 그대로 전달합니다. `window` 같은 호스트 객체가 포함되므로 도구 객체 전체를 JSON으로 직렬화하지 않습니다. 목록을 표시하려면 `name`, `description`, `inputSchema` 등 필요한 필드만 선택합니다. `page_manual`의 도구 목록도 등록 정의의 메타데이터로 만들어집니다. 호출 오류 뒤에는 getter로 현재 상태를 다시 확인합니다.

핵심 재사용 코드는 [src/connect.js](../src/connect.js)뿐입니다. [workspace.js](workspace.js)는 예제 앱의 상태·검증, [tools.js](tools.js)는 도구 정의, [app.js](app.js)는 UI·이동입니다. 소비 앱은 자신의 상태와 서버 동작을 연결하며 예제 상태 엔진을 채택할 필요가 없습니다.
