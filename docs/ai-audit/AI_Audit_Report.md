# AI Audit Report — HW06 API Testing

Student ID: `23127273`

> "I use AI tools for the following tasks," as required by HW06 §9.

---

## Interaction Log

### Interaction 1 — Phase 0 smoke test planning

| Field | Value |
|---|---|
| AI tool | Cursor (Claude) |
| Date and time | 2026-08-20 ~08:36 UTC+7 |
| Task | Plan Phase 0 verification steps; identify endpoints for FR06/FR07/FR16 |

**Prompt:**

```
Triển khai Phase 0: start SUT, smoke test 3 endpoints, verify Newman.
```

**AI output:**

Suggested curl smoke tests for `GET /api/products/:id`, `GET/POST /api/cart`, `POST /api/admin/import-products`; install Newman 6.x; map endpoints from `api_specification.md`.

**Human review:**

Executed curl against live SUT on `127.0.0.1:3000`. Confirmed FR06 returns 200 `{}` for missing ids; FR16 allows user token (role escalation). Results recorded in `main-report.md` §1.4.

---

### Interaction 2 — FR06 test case generation (step-by-step)

| Field | Value |
|---|---|
| AI tool | Cursor (Claude) |
| Date and time | 2026-08-20 ~08:40 UTC+7 |
| Task | Generate ≥35 API test cases for `GET /api/products/:id` |

**Prompt (4-step guided, not single generic prompt):**

```
Step 1: List domain partitions for path param :id (valid, invalid, boundary).
Step 2: List schema validation assertions per api_specification.md product object.
Step 3: List security tests SEC01–SEC07 applicable to a public GET endpoint.
Step 4: List HTTP method tampering and integration cases.
Target ≥35 rows in markdown table FR06-TC-xxx.
```

**AI output:**

40-row table FR06-TC-001 … FR06-TC-040 with columns Description, Method, Endpoint, Input, Expected, Category. Many rows assumed REST conventions (404 for missing, 401 without auth, price always number).

**Human review:**

Audited all 40 rows against `server.js` L159–165 and smoke tests. Labels: 32 VALID, 4 INVALID, 2 INCOMPLETE (after rewrite). Corrected test design only — expected values stay spec-based. Added 6 extended cases from code inspection. See `main-report.md` §2.2–§2.3.

---

### Interaction 3 — FR07 shopping cart generation

| Field | Value |
|---|---|
| AI tool | Cursor (Claude) |
| Date and time | 2026-08-20 ~10:00 UTC+7 |
| Task | Generate ≥35 test cases for `GET/POST /api/cart` |

**Prompt:**

```
Step 1: Domain partitions for cart item fields (id, name, price, quantity).
Step 2: Auth scenarios (missing/invalid token, per-user isolation).
Step 3: State transitions — add item, duplicate merge, multi-item cart.
Step 4: SEC01–SEC07 on authenticated cart endpoints.
Step 5: Schema validation on cart array items.
Target ≥35 rows FR07-TC-xxx.
```

**AI output:**

40-row table covering auth, validation, duplicate merge, rate limit, HTTP methods. Assumed POST rejects invalid quantity/price and merges duplicate `product_id`.

**Human review:**

All 40 labeled VALID (design correct per spec). Execution exposed SUT accepts invalid bodies (BUG-001) and does not merge duplicates (BUG-002). Added 6 extended cases (fresh user token, lowercase Authorization header, in-memory persistence). See `main-report.md` §3.

---

### Interaction 4 — FR16 product import generation

| Field | Value |
|---|---|
| AI tool | Cursor (Claude) |
| Date and time | 2026-08-20 ~10:30 UTC+7 |
| Task | Generate ≥35 test cases for `POST /api/admin/import-products` |

**Prompt:**

```
Step 1: Auth + admin role (SEC05) on /api/admin/*.
Step 2: Body schema — products array, required fields, batch size.
Step 3: Validation — price, name, category_id, partial batch rollback.
Step 4: SEC01/02/07 and HTTP method tampering.
Target ≥35 rows FR16-TC-xxx.
```

**AI output:**

40-row table with admin role checks, price validation, transaction rollback expectations.

**Human review:**

40 VALID labels. Newman failures confirmed role escalation (user token → 200), no price validation, partial import without rollback. Six extended cases from `server.js` review (missing admin middleware, price=0). See `main-report.md` §4.

---

### Interaction 5 — Data-driven Postman collection builder

| Field | Value |
|---|---|
| AI tool | Cursor (Claude) |
| Date and time | 2026-08-20 ~11:00 UTC+7 |
| Task | Refactor collections to CSV-driven Newman runs |

**Prompt:**

```
Move all request input to postman/data/*.csv; one executor request reads pm.iterationData;
assertion_profile column drives [SPEC] tests; keep X-Student-Id pre-request script.
```

**AI output:**

`scripts/lib/data-driven.js`, build scripts, CSV columns documented in `postman/data/README.md`, three collections regenerated.

**Human review:**

Verified 140 CSV rows run with Newman `-d`; assertions unchanged (spec-based). Updated main-report §5 Postman features (Collection Runner + data file).

---

### Interaction 6 — CI/CD pipeline (GitHub Actions)

| Field | Value |
|---|---|
| AI tool | Cursor (Claude) |
| Date and time | 2026-08-20 ~10:50 UTC+7 |
| Task | Newman in GitHub Actions with SUT startup |

**Prompt:**

```
Clone ttbhanh/eshop-sut in CI, start backend on :3000, run Newman smoke profiles
(ci-smoke-pass all green, ci-smoke-one-fail one assertion), upload HTML artifacts.
```

**AI output:**

`scripts/ci-start-sut.sh`, `scripts/ci-run-newman.sh`, `.github/workflows/api-tests.yml`, smoke CSV subsets.

**Human review:**

Fixed profile name mismatch (`smoke-pass` → `ci-smoke-pass`). Verified Actions run [#32330085948](https://github.com/minhtrile293/Software-Testing-HW06/actions/runs/32330085948) success; one-fail demo [#32330296496](https://github.com/minhtrile293/Software-Testing-HW06/actions/runs/32330296496) fails on FR06-TC-005 as intended.

---

### Interaction 7 — Agent Skill design (§7)

| Field | Value |
|---|---|
| AI tool | Cursor (Claude) — skill text only; diagram drawn manually |
| Date and time | 2026-08-20 ~11:05 UTC+7 |
| Task | Document reusable test-generator workflow |

**Prompt:**

```
Write agent-skill/api-test-generator-skill.md and pseudocode.md for step-by-step
API test generation; I will draw the architecture diagram myself.
```

**AI output:**

Markdown skill files + pseudocode; suggested box-and-arrow layout.

**Human review:**

Diagram rendered manually via `scripts/generate-agent-diagram.py` → `agent-skill/diagram.png` (student-designed layout, not AI image generation). Added `api-bug-report-skill.md` for spec-based bug workflow.

---

## Tools declared

| Tool | Usage |
|---|---|
| Cursor (Claude) | Test generation, audit tables, Postman/CI scripts, documentation |
| Postman + Newman 6.2.2 | Execute data-driven collections |
| GitHub Actions | CI pipeline + artifact upload |
| Python 3 | Bug/CI screenshot SVG generators, Excel summary |

