# Independent reviews in fresh contexts

Each review used a new session (`fork_turns: none`) without inheriting the author's conversation. Reviewers read actual repository instructions, PLANS, human/research sources, and the final diff. These are agent reviews, not human GitHub approvals or standards certification.

## Historical initial reviews

| Scope | Final reviewed commit | Decision and trace |
|---|---|---|
| Bootstrap | `894d1d6759b347824b44b7b8c474e1c562425bf3` | No defect blocking public push. Checked H/R/AP, H29, public-source boundaries, and direction. Re-reviewed in another fresh session after correcting the BrowserMCP factual error. |
| Contracts/harness | `b0fffc5056d75451b204333b1515d62c1278d7d6` | Four final document diffs checked against sources; no important defect. [PR #12 record](https://github.com/linkanyco/WebMCPLite/pull/12#issuecomment-6407509183) |
| Helper | `73c9d4c8113d0d555425f3390259514b3a546cf1` | Five tests and registration/cancellation boundaries checked; no important defect. Re-reviewed after removing a nonexistent start command. [PR #13 record](https://github.com/linkanyco/WebMCPLite/pull/13#issuecomment-6407509428) |
| Six examples | `3947fa66e3311e9a05e019b46f93b4a63d023ead` | Full 13-file diff, 14 tests, and IAB reload/back guard verified; no important defect. [PR #14 record](https://github.com/linkanyco/WebMCPLite/pull/14#issuecomment-6407509653) |
| Verification/handoff documents | Final head recorded on [PR #15](https://github.com/linkanyco/WebMCPLite/pull/15) | Reviewed SHA, CI, and decision are in the PR comments; no self-hash follow-up commits. |

An earlier gallery review on `28b6b43` reproduced all six workflows in its own IAB tab. After the author reported reload/history issues, the reviewer checked them and requested fixes; another fresh session reviewed the complete corrected `3947fa6` commit. A trailing CSS blank line was nonblocking and removed in the final documentation PR.

The direction review recognized that shared editing and app-action reuse already appear in WebMCP and Kit. The practical value here is readable conventions and examples covering marks, review, and failure recovery. The helper does not own app state, validation, or a server. No basis was found for a hosted model or general framework.

Limits: reviews did not reconstruct the entire original conversation, audit every historical source, or establish universal browser compatibility. See [verification](../verification.md).

## H32 entry-point correction

Initial approvals concern the implementation at that time, not a permanent mandate for every AP. H32 retired the parallel marker/global API. The final-SHA fresh-context review, checks, and public-site observations are tracked in [issue #18](https://github.com/linkanyco/WebMCPLite/issues/18) and [PR #19](https://github.com/linkanyco/WebMCPLite/pull/19).

## H33 follow-up

The English redesign and removal of the example revision mechanism require their own review. [Issue #20](https://github.com/linkanyco/WebMCPLite/issues/20) and its linked PR record the exact reviewed final commit, findings, checks, and decision. Earlier approvals are not approvals of this new implementation. After any fix changes the commit, a new fresh-context review must cover that final SHA.
