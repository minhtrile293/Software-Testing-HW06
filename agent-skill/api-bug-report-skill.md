# Agent Skill — API Bug Report (HW06)

## Rule (critical)

**Assertions must follow API spec / REST expectations — NOT current SUT behavior.**

- Newman **PASS** = SUT matches spec  
- Newman **FAIL** = SUT bug → log in `BUG_REPORT.md` + GitHub Issue + screenshot  

**Never** change expected status/body in Postman tests to match a buggy SUT so tests pass.

## Audit vs Execute

| Phase | Fix what |
|---|---|
| **Audit** | INVALID test design (wrong endpoint, auth on public API) |
| **Execute** | Run spec-based assertions; failures = evidence |

## After Newman run

1. Map each **failed** `[SPEC]` assertion to a bug (merge same root cause)
2. `python3 scripts/capture-fr06-bug-screenshots.py`
3. `bash scripts/open-fr06-github-issues.sh` (if issues not yet open)
4. Update `bugs/BUG_REPORT.md` and `main-report.md` §2.5

## Severity

- **High** — auth bypass (PUT/DELETE without token)
- **Medium** — wrong status code, schema inconsistency
- **Low** — routing ambiguity (trailing slash)
