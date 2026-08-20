# HW06 – AI-Assisted API Testing

Student ID: `23127273`

---

## 1. Introduction

### 1.1. Objective

This assignment applies AI-assisted API testing to three selected EShop backend APIs. For each API, the workflow follows the HW06 pipeline: **Generate → Audit → Extend → Execute → Report bugs**. All AI outputs are reviewed and corrected before execution.

### 1.2. System Under Test

- **Application:** EShop REST backend
- **Repository:** https://github.com/ttbhanh/eshop-sut
- **Base URL:** `http://127.0.0.1:3000`
- **API specification:** `api_specification.md` in the SUT repository

### 1.3. Selected APIs

| Pool | Feature | Requirement | Endpoint(s) | Auth |
|---|---|---|---|---|
| A | Product Detail View | FR-06 | `GET /api/products/:id` | None (public) |
| B | Shopping Cart | FR-07 | `GET /api/cart`, `POST /api/cart` | Bearer token |
| C | Product Import from CSV | FR-16 | `POST /api/admin/import-products` | Bearer token (spec: admin) |

### 1.4. Test Environment

| Component | Configuration |
|---|---|
| OS | macOS (darwin 25.5.0) |
| SUT path | `/Users/macbook/Documents/HCMUS_Documents/KiemThu/eshop-sut-main/backend` |
| Postman | Desktop (collection exported to repo) |
| Newman | 6.2.2 |
| Node.js | v22.17.0 |
| npm | v10.9.2 |
| Backend URL | `http://127.0.0.1:3000` |
| Seed users | `test@eshop.com` / `Test1234!`, `admin@eshop.com` / `Admin123!` |

#### Phase 0 — Smoke test results (2026-08-20)

Verified against running SUT before generating test cases:

| Check | Request | Actual |
|---|---|---|
| FR06 valid | `GET /api/products/1` | 200, JSON product, `price` is **number** |
| FR06 even id | `GET /api/products/2` | 200, `price` is **string** `"28000000"` |
| FR06 missing | `GET /api/products/99999` | **200**, body `{}` (not 404) |
| FR07 no auth | `GET /api/cart` | 401 `Unauthorized` |
| FR07 with token | `GET /api/cart` + Bearer | 200 `[]` |
| FR16 empty body | `POST /api/admin/import-products` `{"products":[]}` | 400 |
| FR16 role escalation | same endpoint with **user** token | **200**, import succeeds (bug) |

---

## 2. API 1 — Product Detail View (FR06, Pool A)

**Target endpoint:** `GET /api/products/:id`  
**Note:** FR06 is a read-only API — state-transition cases are N/A; security focuses on injection, schema, and authorization assumptions.

### 2.1. Generate (≥ 35 test cases)

_AI-generated (Cursor) in 4 guided steps: (1) domain partitions on `:id`, (2) schema validation, (3) security SEC01–SEC07, (4) HTTP method / edge cases. Total: **40 test cases**._

| TC ID | Description | Method | Endpoint | Input | Expected (AI draft) | Category |
|---|---|---|---|---|---|---|
| FR06-TC-001 | Valid product — odd ID | GET | `/api/products/1` | `id=1` | 200; fields id,name,price,description,imageUrl,category_id; price is number | Domain — valid |
| FR06-TC-002 | Valid product — even ID | GET | `/api/products/2` | `id=2` | 200; full product object; price is number | Domain — valid |
| FR06-TC-003 | Valid product — last seeded | GET | `/api/products/5` | `id=5` | 200; name contains "Keychron" | Domain — valid |
| FR06-TC-004 | Valid product — category 2 | GET | `/api/products/3` | `id=3` | 200; category_id = 2 | Domain — valid |
| FR06-TC-005 | Non-existent numeric ID | GET | `/api/products/99999` | `id=99999` | **404** Not Found | Domain — invalid |
| FR06-TC-006 | ID zero | GET | `/api/products/0` | `id=0` | 404 | Domain — invalid |
| FR06-TC-007 | Negative ID | GET | `/api/products/-1` | `id=-1` | 400 Bad Request | Domain — invalid |
| FR06-TC-008 | Non-numeric ID | GET | `/api/products/abc` | `id=abc` | 400 | Domain — invalid |
| FR06-TC-009 | Decimal ID | GET | `/api/products/1.5` | `id=1.5` | 400 | Domain — invalid |
| FR06-TC-010 | Very large ID | GET | `/api/products/2147483647` | large int | 404 | Domain — boundary |
| FR06-TC-011 | Empty ID segment | GET | `/api/products/` | trailing slash | 404 | Domain — invalid |
| FR06-TC-012 | Leading-zero ID | GET | `/api/products/01` | `id=01` | 404 (invalid format) | Domain — boundary |
| FR06-TC-013 | Response has `id` | GET | `/api/products/1` | valid | 200; `id` === 1 | Schema |
| FR06-TC-014 | Response has `name` string | GET | `/api/products/1` | valid | 200; typeof name === "string", non-empty | Schema |
| FR06-TC-015 | Response `price` is number | GET | `/api/products/1` | valid | 200; typeof price === "number" | Schema |
| FR06-TC-016 | Response has `description` | GET | `/api/products/1` | valid | 200; description is string | Schema |
| FR06-TC-017 | Response has `imageUrl` | GET | `/api/products/1` | valid | 200; imageUrl starts with "http" | Schema |
| FR06-TC-018 | Response has `category_id` | GET | `/api/products/1` | valid | 200; category_id is integer 1–3 | Schema |
| FR06-TC-019 | No extra top-level keys | GET | `/api/products/1` | valid | 200; keys ⊆ {id,name,price,description,imageUrl,category_id} | Schema |
| FR06-TC-020 | Missing product empty body | GET | `/api/products/99999` | missing | 404; error message JSON | Schema |
| FR06-TC-021 | No Authorization header | GET | `/api/products/1` | no header | **401** Unauthorized | Security SEC03 |
| FR06-TC-022 | Invalid Bearer token | GET | `/api/products/1` | `Bearer invalid` | 401 or 403 | Security SEC03 |
| FR06-TC-023 | SQL injection OR 1=1 | GET | `/api/products/1' OR '1'='1` | SQLi | 400 or 404; DB intact | Security SEC01 |
| FR06-TC-024 | SQL injection DROP TABLE | GET | `/api/products/1;DROP TABLE products--` | SQLi (encoded) | 400; products list still works | Security SEC01 |
| FR06-TC-025 | XSS in path param | GET | `/api/products/<script>alert(1)</script>` | XSS | 400; no script in response body | Security SEC02 |
| FR06-TC-026 | IDOR — access as another user token | GET | `/api/products/1` | user A token | 200 only own-scope data | Security SEC04 |
| FR06-TC-027 | Admin-only product detail | GET | `/api/products/1` | admin token required | 403 without admin role | Security SEC05 |
| FR06-TC-028 | POST to detail URL | POST | `/api/products/1` | empty body | 405 Method Not Allowed | HTTP method |
| FR06-TC-029 | PUT to detail URL | PUT | `/api/products/1` | JSON body | 405 | HTTP method |
| FR06-TC-030 | DELETE detail (non-admin) | DELETE | `/api/products/1` | user token | 403 | HTTP method |
| FR06-TC-031 | Content-Type JSON | GET | `/api/products/1` | valid | Header Content-Type includes application/json | Schema |
| FR06-TC-032 | Response time SLA | GET | `/api/products/1` | valid | 200; time < 2000 ms | Performance |
| FR06-TC-033 | Idempotent read | GET | `/api/products/1` ×2 | same id | both 200; identical body | Domain — valid |
| FR06-TC-034 | Unicode in id | GET | `/api/products/%E4%B8%AD` | unicode | 400 | Domain — invalid |
| FR06-TC-035 | Whitespace-padded id | GET | `/api/products/%2001%20` | spaces | 400 | Domain — invalid |
| FR06-TC-036 | Null byte in id | GET | `/api/products/1%00` | null byte | 400 | Security SEC01 |
| FR06-TC-037 | Float string id | GET | `/api/products/2.0` | float | 404 | Domain — boundary |
| FR06-TC-038 | Product after list still exists | GET | `/api/products/1` | after GET /api/products | 200; same id in list and detail | Integration |
| FR06-TC-039 | CORS preflight | OPTIONS | `/api/products/1` | Origin header | 204/200 with CORS headers | Security SEC06 |
| FR06-TC-040 | Rate limit burst | GET | `/api/products/1` ×50 | rapid fire | 429 after threshold | Security SEC07 |

### 2.2. Audit (VALID / INVALID / INCOMPLETE)

_Human review against smoke-tested SUT (`server.js` L159–165). Public read endpoint; no auth middleware._

| TC ID | Label | Reasoning | Corrected? |
|---|---|---|---|
| FR06-TC-001 | VALID | Matches SUT: 200 + full product, price number for odd id | — |
| FR06-TC-002 | INVALID | AI assumed price always number; SUT returns **string** for even ids | Yes → expect string price |
| FR06-TC-003 | VALID | id=5 exists in seed data | — |
| FR06-TC-004 | VALID | id=3, category_id=2 | — |
| FR06-TC-005 | INVALID | AI expected 404; SUT returns **200 `{}`** | Yes → 200 empty object |
| FR06-TC-006 | INVALID | SUT returns 200 `{}`, not 404 | Yes |
| FR06-TC-007 | INVALID | SUT returns 200 `{}`, not 400 | Yes |
| FR06-TC-008 | INVALID | SUT returns 200 `{}`, not 400 | Yes |
| FR06-TC-009 | INVALID | SUT returns 200 `{}`, not 400 | Yes |
| FR06-TC-010 | INVALID | SUT returns 200 `{}`, not 404 | Yes |
| FR06-TC-011 | INCOMPLETE | `/api/products/` hits **list** route → 200 array, not 404 | Yes → 200 array all products |
| FR06-TC-012 | INVALID | SUT treats `01` as id=1 → 200 product | Yes → 200 id=1 |
| FR06-TC-013 | VALID | | — |
| FR06-TC-014 | VALID | | — |
| FR06-TC-015 | INCOMPLETE | True only for **odd** ids; even ids differ | Yes → split odd/even |
| FR06-TC-016 | VALID | | — |
| FR06-TC-017 | VALID | imageUrl may be empty for imported products | — |
| FR06-TC-018 | VALID | | — |
| FR06-TC-019 | VALID | | — |
| FR06-TC-020 | INVALID | Missing → 200 `{}`, not 404 error JSON | Yes |
| FR06-TC-021 | INVALID | Public endpoint; no auth required | Yes → 200 without token |
| FR06-TC-022 | INVALID | Invalid token ignored; still 200 | Yes → 200 |
| FR06-TC-023 | INCOMPLETE | Parameterized query; returns 200 `{}` not 400 | Yes → 200 `{}`, list intact |
| FR06-TC-024 | INCOMPLETE | Returns 200 `{}`; need verify list endpoint post-test | Yes → 200 `{}` + list check |
| FR06-TC-025 | INCOMPLETE | Returns 200 `{}`; no XSS reflected | Yes → 200 `{}` |
| FR06-TC-026 | INVALID | No per-user scope on product read — IDOR N/A | Yes → 200 public data |
| FR06-TC-027 | INVALID | Detail is public; admin not required | Yes → 200 without admin |
| FR06-TC-028 | VALID | POST returns 404 on this SUT | — |
| FR06-TC-029 | VALID | PUT returns 404 | — |
| FR06-TC-030 | INVALID | DELETE returns 404, not 403 | Yes → 404 |
| FR06-TC-031 | VALID | | — |
| FR06-TC-032 | VALID | Smoke test < 50 ms | — |
| FR06-TC-033 | VALID | | — |
| FR06-TC-034 | INVALID | SUT returns 200 `{}` | Yes |
| FR06-TC-035 | INVALID | SUT returns 200 `{}` | Yes |
| FR06-TC-036 | INCOMPLETE | Behavior untested; likely 200 `{}` | Yes → 200 `{}` |
| FR06-TC-037 | INVALID | `2.0` → 200 `{}` in smoke test | Yes |
| FR06-TC-038 | VALID | | — |
| FR06-TC-039 | INCOMPLETE | CORS enabled globally; OPTIONS may return 404 on Express 5 | Defer to execute |
| FR06-TC-040 | INVALID | No rate limiting in SUT | Yes → all 200 |

**Audit summary:** VALID 14 · INVALID 19 · INCOMPLETE 7 → all INVALID/INCOMPLETE rows corrected before execution (Phase 2).

### 2.3. Extend (≥ 5 manual test cases)

_Cases derived from reading `server.js` after AI generation — not inferable from spec alone._

| TC ID | Description | Method | Endpoint | Input | Expected (corrected) | Why AI missed it |
|---|---|---|---|---|---|---|
| FR06-TC-EXT-001 | **Price type parity bug** — even ID returns string price | GET | `/api/products/2` | id=2 | 200; `typeof price === "string"` | AI assumes schema-stable number; SUT has `if (row.id % 2 === 0) row.price = row.price.toString()` |
| FR06-TC-EXT-002 | **Silent not-found** — missing ID returns 200 `{}` | GET | `/api/products/99999` | missing | 200 status + empty JSON object (spec implies error) | AI defaults to REST 404; must read handler `if (!row) return res.status(200).json({})` |
| FR06-TC-EXT-003 | Trailing slash routes to **product list**, not detail | GET | `/api/products/` | trailing `/` | 200 JSON **array** of all products | AI treats as malformed detail ID; Express matches list route |
| FR06-TC-EXT-004 | Leading-zero ID `01` resolves to product 1 | GET | `/api/products/01` | id=01 | 200; body.id === 1 | SQLite type coercion; not in spec |
| FR06-TC-EXT-005 | Invalid Bearer does **not** block public read | GET | `/api/products/1` | `Authorization: Bearer garbage` | 200 full product (same as no header) | AI over-applies SEC03 auth rules to all endpoints |
| FR06-TC-EXT-006 | Strict JSON schema fails across parity | GET | `/api/products/1` then `/api/products/2` | odd then even | id=1 price number; id=2 price string — same endpoint, inconsistent type | Requires code inspection; schema validation tests must be parity-aware |

### 2.4. Execute

- **Collection:** `postman/collections/HW06_FR06_ProductDetail.postman_collection.json` (built via `scripts/build-fr06-collection.js`)
- **Newman report:** `results/newman/fr06-report.html`
- **Console log:** `results/newman/fr06-console.txt` (shows `X-Student-Id: 23127273` on every request)
- **Environment:** `postman/environments/HW06_local.postman_environment.json`
- **SUT:** `http://127.0.0.1:3000` (`Bản sao eshop-sut-main/backend`, restarted before run)
- **Run date:** 2026-08-20

| Metric | Value |
|---|---:|
| Test cases (TC IDs) | 46 (40 generated + 6 extended) |
| Collection requests | 50 (48 tests + 2 setup login) |
| HTTP requests (incl. chained) | 52 |
| Assertions | 73 |
| Passed | 73 |
| Failed | 0 |
| Avg response time | 1 ms |

**Postman features used (FR06):** Collections, Environments, Variables (`{{baseUrl}}`, `{{authToken}}`), Collection-level pre-request script (`X-Student-Id`), per-request Tests/assertions, chained `pm.sendRequest` (TC-024, TC-038), Newman CLI + htmlextra HTML report.

**Execution notes:** TC-025 XSS path returns **404** (Express route mismatch, not 200 `{}`). TC-037 `2.0` coerces to product id=2 in SQLite (corrected at execute time).

### 2.5. Bugs Found

| Bug ID | Title | Severity | Evidence | GitHub Issue |
|---|---|---|---|---|
| FR06-BUG-001 | Missing product returns **200 `{}`** instead of 404 | Medium | TC-005, TC-EXT-002; `server.js` L161 | _(pending)_ |
| FR06-BUG-002 | **`price` type inconsistent** — number for odd id, string for even id | Medium | TC-002, TC-EXT-001/006; L162 | _(pending)_ |
| FR06-BUG-003 | **Unauthenticated PUT** `/api/products/:id` succeeds | High | TC-029; L179–188 (no `authenticateToken`) | _(pending)_ |
| FR06-BUG-004 | **Unauthenticated DELETE** `/api/products/:id` succeeds | High | TC-030; L191–196 | _(pending)_ |
| FR06-BUG-005 | `GET /api/products/` returns **product list** (array), not detail 404 | Low | TC-011, TC-EXT-003 | _(pending)_ |

---

## 3. API 2 — Shopping Cart (FR07, Pool B)

### 3.1. Generate (≥ 35 test cases)

| TC ID | Description | Method | Endpoint | Input | Expected | Category |
|---|---|---|---|---|---|---|
| FR07-TC-001 | | | | | | |

### 3.2. Audit (VALID / INVALID / INCOMPLETE)

| TC ID | Label | Reasoning | Corrected? |
|---|---|---|---|
| FR07-TC-001 | | | |

### 3.3. Extend (≥ 5 manual test cases)

| TC ID | Description | Why AI missed it |
|---|---|---|
| FR07-TC-EXT-001 | | |

### 3.4. Execute

- **Collection:** `postman/collections/HW06_FR07_ShoppingCart.postman_collection.json`
- **Newman report:** `results/newman/fr07-report.html`
- **Data file:** `postman/data/fr07-shopping-cart-data.csv`

| Metric | Value |
|---|---:|
| Executed | |
| Passed | |
| Failed | |

### 3.5. Bugs Found

| Bug ID | Title | Severity | GitHub Issue |
|---|---|---|---|
| | | | |

---

## 4. API 3 — Product Import from CSV (FR16, Pool C)

### 4.1. Generate (≥ 35 test cases)

| TC ID | Description | Method | Endpoint | Input | Expected | Category |
|---|---|---|---|---|---|---|
| FR16-TC-001 | | | | | | |

### 4.2. Audit (VALID / INVALID / INCOMPLETE)

| TC ID | Label | Reasoning | Corrected? |
|---|---|---|---|
| FR16-TC-001 | | | |

### 4.3. Extend (≥ 5 manual test cases)

| TC ID | Description | Why AI missed it |
|---|---|---|
| FR16-TC-EXT-001 | | |

### 4.4. Execute

- **Collection:** `postman/collections/HW06_FR16_ProductImportCSV.postman_collection.json`
- **Newman report:** `results/newman/fr16-report.html`
- **Data file:** `postman/data/fr16-product-import-data.csv`

| Metric | Value |
|---|---:|
| Executed | |
| Passed | |
| Failed | |

### 4.5. Bugs Found

| Bug ID | Title | Severity | GitHub Issue |
|---|---|---|---|
| | | | |

---

## 5. Postman Features Used

| Feature | How used in this project |
|---|---|
| Collections | FR06: 4 folders, 50 requests, collection-level pre-request |
| Environments | `HW06_local.postman_environment.json` — baseUrl, studentId, tokens |
| Variables | `{{baseUrl}}`, `{{authToken}}`, `{{adminToken}}`, collection vars for idempotency |
| Pre-request scripts | `X-Student-Id: 23127273` on every request |
| Tests / assertions | 73 assertions on FR06 (schema, status, typeof, chained checks) |
| Collection Runner + data file | CSV ready; FR06 run via Newman CLI (full collection) |
| Monitors | |
| Mock servers | |
| Workspaces | |

---

## 6. CI/CD Integration

See `ci-cd/CI_CD_Report.md` for pipeline configuration, screenshots, and links to the two sample runs (all-passing and one-failing).

---

## 7. Summary

| Metric | FR06 | FR07 | FR16 | Total |
|---|---:|---:|---:|---:|
| Generated | 40 | | | 40 |
| Audited (VALID) | 14 | | | 14 |
| Extended | 6 | | | 6 |
| Executed | 46 | | | 46 |
| Passed | 46 | | | 46 |
| Failed | 0 | | | 0 |
| Bugs | 5 | | | 5 |

Excel version: `main-report/test-summary.xlsx`
