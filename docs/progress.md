# 작업 기록

기준일: 2026-10-25 (America/Los_Angeles).

H01–H29와 리서치를 보존하고 H29를 PLANS에 반영했습니다. 공개 전 독립 리뷰에서 BrowserMCP 사실 오류를 수정했습니다. 초기 문서 이후 계약·연결 코드·여섯 예제를 PR로 검토하고 머지했습니다. 현재 문서는 최종 검증/인계 기록 PR의 산출물이며, 그 PR의 머지 상태와 최종 SHA 판정은 GitHub에서 확인합니다.

| 이슈 | 산출물 | 구현 PR |
|---|---|---|
| [#2](https://github.com/linkanyco/WebMCPLite/issues/2), [#3](https://github.com/linkanyco/WebMCPLite/issues/3) | 최소 계약·소비 사이트 AGENTS 하네스 | [#12](https://github.com/linkanyco/WebMCPLite/pull/12), 머지 |
| [#4](https://github.com/linkanyco/WebMCPLite/issues/4) | 47줄 연결 코드·등록/실패/해제·JS 대안 | [#13](https://github.com/linkanyco/WebMCPLite/pull/13), 머지 |
| [#5](https://github.com/linkanyco/WebMCPLite/issues/5)–[#10](https://github.com/linkanyco/WebMCPLite/issues/10) | 제품·벌크·라인시트·보드·안내/이동·비동기 복구 | [#14](https://github.com/linkanyco/WebMCPLite/pull/14), 머지 |
| [#11](https://github.com/linkanyco/WebMCPLite/issues/11) | 브라우저 관측·검증 한계·최종 방향 리뷰·인계 | 이 문서를 포함한 최종 기록 PR |

[진행 인덱스 #1](https://github.com/linkanyco/WebMCPLite/issues/1)에서 완료 상태·의존 관계·마지막 PR을 추적합니다. [리뷰 기록](reviews/README.md)에는 실제 검토 SHA가, [검증 기록](verification.md)에는 자동 테스트와 실제 브라우저 관측의 경계가 있습니다. 각 생성 이슈는 인계된 관련 휴먼 발화 전체를 보존하고 에이전트 제안을 구별했으며 게시 후 본문을 대조했습니다.

초기 산출물: 제품 철학/PLANS, 저장소 개발 규칙, 소비 하네스, 작은 연결 코드, 6개 실행 예제, 14개 계약 테스트와 CI. 실제 IAB 도구 발견·호출·공동 편집도 관측했습니다. [실행법](../examples/README.md)대로 설치/빌드 없이 로컬에서 열 수 있습니다.

남은 한계는 새 필수 작업으로 숨기지 않습니다. 실제 서버 권한·영속 저장·서비스 배포·npm 발행은 이번 범위에 포함하지 않았습니다. 일반 브라우저/외부 AI 호환과 라이선스 선택은 미확인/미결입니다. 고급 검색·PDF 처리·자체 챗봇은 장래 항목입니다. 기존 요청 범위에 필요한 미완료 구현은 없으며 새로운 요청은 이 채팅과 기존 인덱스를 확인해 이어갑니다.

## 후속: GitHub Pages 예제 게시

H30/H31에 따라 [#16](https://github.com/linkanyco/WebMCPLite/issues/16)에서 main의 마지막 성공 배포를 보여주는 공개 예제를 추가합니다. 초기 배포 제외는 이 후속 명시 요청으로 Pages 가상 예제에 한해 변경됐습니다. 경로 수정·정적 산출물 허용 목록·main 전용 배포·게시 SHA를 제공하며, 실제 첫 게시/공개 주소 확인은 해당 이슈와 PR에 남깁니다. 자동 테스트는 정적 산출물/하위 경로 회귀 검증을 포함해 15개입니다.
