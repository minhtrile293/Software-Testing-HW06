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

_Audit fixes **test design only** — never change expected results to match SUT bugs. Expected values stay per **API spec / REST**. Newman **FAIL** = SUT defect._

| TC ID | Label | Reasoning | Action |
|---|---|---|---|
| FR06-TC-001 | VALID | Correct positive test | Keep — expect 200 + schema |
| FR06-TC-002 | VALID | Spec: price is number for all products | Keep — expect number (fail on SUT = BUG-002) |
| FR06-TC-003 | VALID | | Keep |
| FR06-TC-004 | VALID | | Keep |
| FR06-TC-005 | VALID | AI draft correct: 404 for missing id | Keep — SUT returns 200 `{}` → **FAIL** |
| FR06-TC-006 | VALID | 404 for id=0 | Keep |
| FR06-TC-007 | VALID | 400 for negative id | Keep |
| FR06-TC-008 | VALID | 400 for non-numeric id | Keep |
| FR06-TC-009 | VALID | 400 for decimal id | Keep |
| FR06-TC-010 | VALID | 404 for non-existent large id | Keep |
| FR06-TC-011 | VALID | Detail route must not return list array | Keep — **FAIL** → BUG-005 |
| FR06-TC-012 | VALID | 400 for leading-zero malformed id | Keep |
| FR06-TC-013 – 019 | VALID | Schema tests on valid product | Keep |
| FR06-TC-020 | VALID | Duplicate missing-id 404 check | Keep |
| FR06-TC-021 | **INVALID** | AI expected 401 on **public** read endpoint | **Rewritten** → expect 200 (public catalog) |
| FR06-TC-022 | **INVALID** | AI expected 401 for invalid token on public API | **Rewritten** → expect 200 |
| FR06-TC-023 | VALID | Must reject SQLi (400/404) | Keep — SUT returns 200 `{}` → **FAIL** |
| FR06-TC-024 | VALID | SQLi rejected + DB intact | Keep |
| FR06-TC-025 | VALID | XSS path 400/404 | Keep — passes (404) |
| FR06-TC-026 | **INVALID** | IDOR N/A — public catalog | **Rewritten** → user token can read |
| FR06-TC-027 | **INVALID** | Admin not required for public read | **Rewritten** → expect 200 |
| FR06-TC-028 | VALID | POST on /:id → 404/405 | Keep |
| FR06-TC-029 | **INCOMPLETE** | AI expected 405; spec §3.3 requires **admin auth** on PUT | **Rewritten** → expect 401/403 without token |
| FR06-TC-030 | **INCOMPLETE** | AI expected 403 with user token; spec requires auth on DELETE | **Rewritten** → expect 401/403 without token |
| FR06-TC-031 – 033 | VALID | | Keep |
| FR06-TC-034 – 037 | VALID | Malformed ids → 400/404 per REST | Keep — most **FAIL** (SUT returns 200) |
| FR06-TC-038 – 039 | VALID | Integration + CORS | Keep |
| FR06-TC-040 | VALID | SEC07 rate limit → 429 | Keep — **FAIL** (no rate limit in SUT) |

**Audit summary:** VALID 32 · INVALID 4 (rewritten) · INCOMPLETE 2 (rewritten) · **Expected values never lowered to match SUT.**

### 2.3. Extend (≥ 5 manual test cases)

_Spec-based expectations. Failures during execute confirm bugs._

| TC ID | Description | Method | Endpoint | Expected (spec) | Why AI missed it |
|---|---|---|---|---|---|
| FR06-TC-EXT-001 | Even ID price must be number | GET | `/api/products/2` | 200; `typeof price === "number"` | AI did not inspect parity code in `server.js` |
| FR06-TC-EXT-002 | Missing ID must 404 | GET | `/api/products/77777` | 404 | AI assumed REST 404; same as TC-005 |
| FR06-TC-EXT-003 | Trailing slash must not return list | GET | `/api/products/` | Response is **not** an array | Routing ambiguity |
| FR06-TC-EXT-004 | Leading-zero ID rejected | GET | `/api/products/01` | 400 Bad Request | SQLite coercion not in spec |
| FR06-TC-EXT-005 | Public read with garbage Bearer | GET | `/api/products/1` | 200 (public endpoint) | AI over-applied SEC03 |
| FR06-TC-EXT-006 | Consistent price type across ids | GET | `/api/products/1` + `/2` | Both `price` number | Requires code/schema analysis |

### 2.4. Execute

- **Collection:** `postman/collections/HW06_FR06_ProductDetail.postman_collection.json` (`scripts/build-fr06-collection.js`)
- **Newman report:** `results/newman/fr06-report.html`
- **Console log:** `results/newman/fr06-console.txt`
- **Approach:** Assertions prefixed `[SPEC]` — **fail = SUT bug**
- **Run date:** 2026-08-20 (re-run after methodology fix)

| Metric | Value |
|---|---:|
| Test case requests | 48 (+ 2 setup) |
| Assertions | 65 |
| **Passed** | **41** |
| **Failed** | **24** |
| Avg response time | ~1 ms |

**Failed tests → bugs:** Newman failures directly drive bug report (§2.5). Multiple failures may share one root cause (e.g. TC-005/006/010/020/EXT-002 all expose BUG-001).

| Failing TC (sample) | Newman result | Bug |
|---|---|---|
| TC-005, TC-020, EXT-002 | expected 404, got 200 | BUG-001 |
| TC-002, EXT-001, EXT-006 | price expected number, got string | BUG-002 |
| TC-029 | expected 401/403, got 200 | BUG-003 |
| TC-030 | expected 401/403, got 200 | BUG-004 |
| TC-011, EXT-003 | expected object, got array | BUG-005 |
| TC-040 | expected 429, got 200 | BUG-006 |

### 2.5. Bugs Found (from Newman failures)

| Bug ID | Title | Severity | Failing tests | GitHub Issue |
|---|---|---|---|---|
| FR06-BUG-001 | Missing/invalid id returns **200 `{}`** instead of 404/400 | Medium | TC-005,006,010,020,023,024,034–037, EXT-002 | [#1](https://github.com/minhtrile293/Software-Testing-HW06/issues/1) |
| FR06-BUG-002 | **`price` type inconsistent** (even id → string) | Medium | TC-002, EXT-001, EXT-006 | [#2](https://github.com/minhtrile293/Software-Testing-HW06/issues/2) |
| FR06-BUG-003 | **Unauthenticated PUT** `/api/products/:id` | High | TC-029 | [#3](https://github.com/minhtrile293/Software-Testing-HW06/issues/3) |
| FR06-BUG-004 | **Unauthenticated DELETE** `/api/products/:id` | High | TC-030 | [#4](https://github.com/minhtrile293/Software-Testing-HW06/issues/4) |
| FR06-BUG-005 | `GET /api/products/` returns **list array** | Low | TC-011, EXT-003 | [#5](https://github.com/minhtrile293/Software-Testing-HW06/issues/5) |
| FR06-BUG-006 | **No rate limiting** on product detail (SEC07) | Medium | TC-040 | [#6](https://github.com/minhtrile293/Software-Testing-HW06/issues/6) |

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
| Executed | 48 | | | 48 |
| Passed (assertions) | 41 | | | 41 |
| Failed (assertions) | 24 | | | 24 |
| Bugs (from failures) | 6 | | | 6 |

Excel version: `main-report/test-summary.xlsx`
