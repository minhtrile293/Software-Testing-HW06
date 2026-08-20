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
- **Data file:** `postman/data/fr06-product-detail-data.csv` — **all request input** (48 rows); Collection Runner / Newman `-d`
- **Newman report:** `results/newman/fr06-report.html`
- **Console log:** `results/newman/fr06-console.txt`
- **Approach:** Assertions prefixed `[SPEC]` — **fail = SUT bug**; `assertion_profile` column drives test script
- **Run date:** 2026-08-20 (data-driven refactor)

| Metric | Value |
|---|---:|
| CSV data rows | 48 |
| Iterations (Newman `-d`) | 48 |
| Setup requests per iteration | 2 |
| Assertions | 208 |
| **Passed** | **184** |
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

**Endpoints:** `GET /api/cart`, `POST /api/cart` — both require `Authorization: Bearer` token.

### 3.1. Generate (≥ 35 test cases)

_AI-generated (Cursor) in 4 steps: (1) auth partitions, (2) GET cart schema, (3) POST validation & business rules, (4) security SEC01–SEC07 + HTTP methods. Total: **40 test cases**._

| TC ID | Description | Method | Endpoint | Input | Expected (spec) | Category |
|---|---|---|---|---|---|---|
| FR07-TC-001 | GET cart no token | GET | `/api/cart` | no Authorization | 401/403 | Security SEC03 |
| FR07-TC-002 | POST cart no token | POST | `/api/cart` | no Authorization | 401/403 | Security SEC03 |
| FR07-TC-003 | GET invalid token | GET | `/api/cart` | `Bearer invalid` | 403 | Security SEC03 |
| FR07-TC-004 | POST invalid token | POST | `/api/cart` | `Bearer invalid` | 403 | Security SEC03 |
| FR07-TC-005 | GET empty cart (fresh user) | GET | `/api/cart` | new user token | 200 `[]` | Domain — valid |
| FR07-TC-006 | GET cart is array | GET | `/api/cart` | valid token | 200; response is array | Schema |
| FR07-TC-007 | GET Content-Type JSON | GET | `/api/cart` | valid token | Content-Type includes json | Schema |
| FR07-TC-008 | POST valid item | POST | `/api/cart` | id,name,price,qty | 200; message Added | Domain — valid |
| FR07-TC-009 | POST quantity=1 boundary | POST | `/api/cart` | qty=1 | 200 | Domain — boundary |
| FR07-TC-010 | GET reflects added item | GET | `/api/cart` | after POST | 200; item has id,name,price,quantity | Integration |
| FR07-TC-011 | POST quantity zero | POST | `/api/cart` | qty=0 | **400** | Domain — invalid |
| FR07-TC-012 | POST quantity negative | POST | `/api/cart` | qty=-1 | **400** | Domain — invalid |
| FR07-TC-013 | POST quantity decimal | POST | `/api/cart` | qty=1.5 | **400** | Domain — invalid |
| FR07-TC-014 | POST missing id | POST | `/api/cart` | no id field | **400** | Schema |
| FR07-TC-015 | POST missing name | POST | `/api/cart` | no name | **400** | Schema |
| FR07-TC-016 | POST missing price | POST | `/api/cart` | no price | **400** | Schema |
| FR07-TC-017 | POST missing quantity | POST | `/api/cart` | no quantity | **400** | Schema |
| FR07-TC-018 | POST price zero | POST | `/api/cart` | price=0 | **400** | Domain — invalid |
| FR07-TC-019 | POST price negative | POST | `/api/cart` | price=-100 | **400** | Domain — invalid |
| FR07-TC-020 | POST empty body | POST | `/api/cart` | `{}` | **400** | Schema |
| FR07-TC-021 | POST name empty string | POST | `/api/cart` | name="" | **400** | Domain — invalid |
| FR07-TC-022 | POST quantity string | POST | `/api/cart` | qty="abc" | **400** | Schema |
| FR07-TC-023 | POST price string | POST | `/api/cart` | price="abc" | **400** | Schema |
| FR07-TC-024 | Cart item price is number | GET | `/api/cart` | after add | typeof price === number | Schema |
| FR07-TC-025 | Cart item quantity is number | GET | `/api/cart` | after add | typeof quantity === number | Schema |
| FR07-TC-026 | SQLi in product name | POST | `/api/cart` | SQLi name | **400** | Security SEC01 |
| FR07-TC-027 | XSS in name | POST | `/api/cart` | `<script>` | 200/400; no script in response | Security SEC02 |
| FR07-TC-028 | Duplicate product merge qty | POST×2 + GET | `/api/cart` | same id twice | 1 row; qty=2 | Business logic |
| FR07-TC-029 | Add different product | POST | `/api/cart` | id=2 | 200 | Domain — valid |
| FR07-TC-030 | PUT not allowed | PUT | `/api/cart` | any | 404/405 | HTTP method |
| FR07-TC-031 | DELETE not allowed | DELETE | `/api/cart` | any | 404/405 | HTTP method |
| FR07-TC-032 | Response time SLA | GET | `/api/cart` | valid | 200; < 2000 ms | Performance |
| FR07-TC-033 | Cart isolated per user | GET | `/api/cart` | user A vs fresh user B | independent carts | Security SEC04 |
| FR07-TC-034 | Oversized quantity | POST | `/api/cart` | qty=999999 | **400** or cap | Domain — boundary |
| FR07-TC-035 | Null fields | POST | `/api/cart` | all null | **400** | Schema |
| FR07-TC-036 | GET schema all keys | GET | `/api/cart` | after adds | each item has id,name,price,quantity | Schema |
| FR07-TC-037 | POST id zero | POST | `/api/cart` | id=0 | **400** | Domain — invalid |
| FR07-TC-038 | POST id negative | POST | `/api/cart` | id=-1 | **400** | Domain — invalid |
| FR07-TC-039 | Rate limit burst | GET | `/api/cart` | rapid fire | **429** | Security SEC07 |
| FR07-TC-040 | Array body rejected | POST | `/api/cart` | JSON array body | **400** | Schema |

### 3.2. Audit (VALID / INVALID / INCOMPLETE)

| TC ID | Label | Reasoning | Action |
|---|---|---|---|
| FR07-TC-001 – 004 | VALID | Auth required on cart endpoints | Keep |
| FR07-TC-005 – 010 | VALID | Positive path + schema | Keep |
| FR07-TC-011 – 023 | VALID | Input validation per REST/spec | Keep — SUT accepts all → **FAIL** |
| FR07-TC-024 – 025 | VALID | Type consistency in cart items | Keep — pass (client-sent types preserved) |
| FR07-TC-026 | VALID | SQLi must be rejected | Keep — **FAIL** (200) |
| FR07-TC-027 | VALID | XSS handling | Keep — pass |
| FR07-TC-028 | VALID | Merge duplicate product_id | Keep — **FAIL** (multiple rows) |
| FR07-TC-029 – 033 | VALID | HTTP methods, perf, isolation | Keep |
| FR07-TC-034 – 040 | VALID | Edge + SEC07 | Keep — most **FAIL** (no validation / no rate limit) |

**Audit summary:** VALID 40 · INVALID 0 · INCOMPLETE 0

### 3.3. Extend (≥ 5 manual test cases)

| TC ID | Description | Method | Endpoint | Expected (spec) | Why AI missed it |
|---|---|---|---|---|---|
| FR07-TC-EXT-001 | quantity=0 must reject | POST | `/api/cart` | 400 | Requires reading `push(req.body)` in server.js |
| FR07-TC-EXT-002 | At most one row per product id | GET | `/api/cart` | filter id=1 → length ≤ 1 | Merge logic not in AI draft |
| FR07-TC-EXT-003 | Combined invalid payload | POST | `/api/cart` | 400 (price<0, qty=0) | Compound invalid case |
| FR07-TC-EXT-004 | Cart persists in memory | GET | `/api/cart` | non-empty after prior adds | In-memory `userCarts` design |
| FR07-TC-EXT-005 | Lowercase `authorization` header | GET | `/api/cart` | 401/403 | HTTP header case sensitivity |
| FR07-TC-EXT-006 | Fresh user multi-item cart | GET | `/api/cart` | ≥2 distinct items after adds | Chained state with fresh user |

### 3.4. Execute

- **Collection:** `postman/collections/HW06_FR07_ShoppingCart.postman_collection.json` (`scripts/build-fr07-collection.js`)
- **Data file:** `postman/data/fr07-shopping-cart-data.csv` — **all request input** (46 rows)
- **Newman report:** `results/newman/fr07-report.html`
- **Console log:** `results/newman/fr07-console.txt`
- **Approach:** Data-driven via CSV + `[SPEC]` assertions
- **Run date:** 2026-08-20

| Metric | Value |
|---|---:|
| CSV data rows | 46 |
| Iterations (Newman `-d`) | 46 |
| Assertions | 190 |
| **Passed** | **164** |
| **Failed** | **26** |
| Avg response time | ~2 ms |

| Failing TC (sample) | Newman result | Bug |
|---|---|---|
| TC-011 – 023, TC-026, TC-034–035, TC-037–038, TC-040, EXT-001, EXT-003 | expected 400, got 200 | BUG-001 |
| TC-028c, EXT-002 | expected 1 row qty=2, got multiple rows | BUG-002 |
| TC-039 | expected 429, got 200 | BUG-003 |

### 3.5. Bugs Found (from Newman failures)

| Bug ID | Title | Severity | Failing tests | GitHub Issue |
|---|---|---|---|---|
| FR07-BUG-001 | **No input validation** on POST `/api/cart` (accepts qty=0, missing fields, etc.) | High | TC-011–023,026,034–035,037–038,040, EXT-001,003 | [#7](https://github.com/minhtrile293/Software-Testing-HW06/issues/7) |
| FR07-BUG-002 | **Duplicate product_id not merged** — multiple cart rows | Medium | TC-028c, EXT-002 | [#8](https://github.com/minhtrile293/Software-Testing-HW06/issues/8) |
| FR07-BUG-003 | **No rate limiting** on cart API (SEC07) | Medium | TC-039 | [#9](https://github.com/minhtrile293/Software-Testing-HW06/issues/9) |

---

## 4. API 3 — Product Import from CSV (FR16, Pool C)

**Endpoint:** `POST /api/admin/import-products` — admin-only; body `{ products: [{ name, price, ... }] }`.

### 4.1. Generate (≥ 35 test cases)

_AI-generated in 4 steps: (1) auth & role, (2) empty/missing body, (3) row validation & rollback, (4) security + batch edge cases. Total: **40 test cases**._

| TC ID | Description | Method | Endpoint | Input | Expected (spec) | Category |
|---|---|---|---|---|---|---|
| FR16-TC-001 | No auth | POST | `/api/admin/import-products` | no token | 401/403 | Security SEC03 |
| FR16-TC-002 | User token (non-admin) | POST | same | user Bearer | **403** | Security SEC05 |
| FR16-TC-003 | Admin valid import | POST | same | valid product | 200; inserted≥1; errors=[] | Domain — valid |
| FR16-TC-004 | Empty products array | POST | same | `products:[]` | **400** | Domain — invalid |
| FR16-TC-005 | Missing products key | POST | same | `{}` | **400** | Schema |
| FR16-TC-006 | products not array | POST | same | string | **400** | Schema |
| FR16-TC-007 | Missing product name | POST | same | no name field | 400 or inserted=0 | Validation |
| FR16-TC-008 | Price zero rejected | POST | same | price=0 | **400** | Domain — invalid |
| FR16-TC-009 | Price negative | POST | same | price=-100 | **400** | Domain — invalid |
| FR16-TC-010 | Price non-numeric | POST | same | price="abc" | **400** | Schema |
| FR16-TC-011 | Price missing | POST | same | no price | **400** | Schema |
| FR16-TC-012 | Empty name | POST | same | name="" | **400** | Domain — invalid |
| FR16-TC-013 | Partial batch rollback | POST | same | mixed valid/invalid | **400**; inserted=0 | Business logic |
| FR16-TC-014 | Response schema | POST | same | valid | message, inserted, errors | Schema |
| FR16-TC-015 | inserted count | POST | same | 1 row | inserted=1 | Schema |
| FR16-TC-016 | Invalid token | POST | same | garbage Bearer | **403** | Security SEC03 |
| FR16-TC-017 | GET not allowed | GET | same | — | 404/405 | HTTP method |
| FR16-TC-018 | PUT not allowed | PUT | same | — | 404/405 | HTTP method |
| FR16-TC-019 | SQLi in name | POST | same | DROP TABLE | 200/400; DB intact | Security SEC01 |
| FR16-TC-020 | XSS in name | POST | same | `<script>` | no script in response | Security SEC02 |
| FR16-TC-021 | category_id optional default | POST | same | omit category_id | 200; default cat | Domain — valid |
| FR16-TC-022 | Invalid category_id | POST | same | category_id=99999 | **400** | Domain — invalid |
| FR16-TC-023 | Batch 2 valid rows | POST | same | 2 products | inserted=2 | Domain — valid |
| FR16-TC-024 | products null | POST | same | null | **400** | Schema |
| FR16-TC-025 | Empty object in array | POST | same | `[{}]` | **400** | Validation |
| FR16-TC-026 | Float price | POST | same | price=10.5 | **400** | Domain — invalid |
| FR16-TC-027 | Very long name | POST | same | 500 chars | 200/400 | Domain — boundary |
| FR16-TC-028 | Duplicate names in batch | POST | same | same name ×2 | 200 | Domain — valid |
| FR16-TC-029 | Rate limit SEC07 | POST | same | burst | **429** | Security SEC07 |
| FR16-TC-030 | Content-Type required | POST | same | non-JSON body | **400/415** | Schema |
| FR16-TC-031 | description optional | POST | same | omit | 200 | Schema |
| FR16-TC-032 | imageUrl optional | POST | same | omit | 200 | Schema |
| FR16-TC-033 | Negative category_id | POST | same | -1 | **400** | Domain — invalid |
| FR16-TC-034 | Extra fields ignored | POST | same | foo=bar | 200 | Schema |
| FR16-TC-035 | Admin role explicit | POST | same | user token | **403** | Security SEC05 |
| FR16-TC-036 | Price string number | POST | same | price="1000" | **400** | Schema |
| FR16-TC-037 | Null array element | POST | same | `[null]` | **400** | Schema |
| FR16-TC-038 | Response time | POST | same | valid | < 2000 ms | Performance |
| FR16-TC-039 | Whitespace-only name | POST | same | name="   " | **400** | Domain — invalid |
| FR16-TC-040 | Large batch 10 items | POST | same | 10 rows | inserted=10 | Domain — valid |

### 4.2. Audit (VALID / INVALID / INCOMPLETE)

| TC ID | Label | Reasoning | Action |
|---|---|---|---|
| FR16-TC-001 | VALID | Auth required | Keep — pass |
| FR16-TC-002, TC-035 | VALID | Admin role required on `/admin/*` | Keep — **FAIL** (200) |
| FR16-TC-003 – 006 | VALID | Body structure checks | Keep — pass on 004–006 |
| FR16-TC-007 | VALID | Missing name → reject or 0 insert | Keep — pass (inserted=0 + errors) |
| FR16-TC-008 – 012 | VALID | Price/name validation | Keep — **FAIL** |
| FR16-TC-013 | VALID | All-or-nothing transaction | Keep — **FAIL** (partial insert) |
| FR16-TC-014 – 018 | VALID | Schema + HTTP methods | Keep |
| FR16-TC-019 – 021 | VALID | Security + defaults | Keep — pass |
| FR16-TC-022 – 040 | VALID | Category, batch, SEC07, edge | Keep — many **FAIL** |

**Audit summary:** VALID 40 · INVALID 0 · INCOMPLETE 0

### 4.3. Extend (≥ 5 manual test cases)

| TC ID | Description | Expected (spec) | Why AI missed it |
|---|---|---|---|
| FR16-TC-EXT-001 | User role escalation | 403 | Only `authenticateToken`, no role middleware |
| FR16-TC-EXT-002 | price=0 accepted | 400 | No server-side price check in loop |
| FR16-TC-EXT-003 | Partial insert no rollback | 400 on mixed batch | No DB transaction |
| FR16-TC-EXT-004 | Missing name returns 200 | 400 reject batch | Errors array instead of HTTP 400 |
| FR16-TC-EXT-005 | Negative price | 400 | Same as EXT-002 |
| FR16-TC-EXT-006 | Admin middleware missing | 403 for user | Code review of L199 |

### 4.4. Execute

- **Collection:** `postman/collections/HW06_FR16_ProductImportCSV.postman_collection.json` (`scripts/build-fr16-collection.js`)
- **Data file:** `postman/data/fr16-product-import-data.csv` — **all request input** (46 rows)
- **Newman report:** `results/newman/fr16-report.html`
- **Console log:** `results/newman/fr16-console.txt`
- **Run date:** 2026-08-20

| Metric | Value |
|---|---:|
| CSV data rows | 46 |
| Iterations (Newman `-d`) | 46 |
| Assertions | 186 |
| **Passed** | **163** |
| **Failed** | **23** |
| Avg response time | ~2 ms |

| Failing TC (sample) | Newman result | Bug |
|---|---|---|
| TC-002, TC-035, EXT-001, EXT-006 | expected 403, got 200 | BUG-001 |
| TC-008–012, TC-026, TC-036, EXT-002, EXT-005 | expected 400, got 200 | BUG-002 |
| TC-013, EXT-003, EXT-004 | expected 400 rollback, got 200 partial | BUG-003 |
| TC-022, TC-033 | expected 400 invalid category | BUG-004 |
| TC-029 | expected 429 | BUG-005 |
| TC-030, TC-037 | expected 400/415, got 500 | BUG-006 |

### 4.5. Bugs Found (from Newman failures)

| Bug ID | Title | Severity | Failing tests | GitHub Issue |
|---|---|---|---|---|
| FR16-BUG-001 | **Non-admin can import** (role escalation) | Critical | TC-002, TC-035, EXT-001, EXT-006 | [#10](https://github.com/minhtrile293/Software-Testing-HW06/issues/10) |
| FR16-BUG-002 | **No price validation** (0, negative, string, float) | High | TC-008–012,026,036, EXT-002,005 | [#11](https://github.com/minhtrile293/Software-Testing-HW06/issues/11) |
| FR16-BUG-003 | **Partial import without rollback** | High | TC-013, EXT-003, EXT-004 | [#12](https://github.com/minhtrile293/Software-Testing-HW06/issues/12) |
| FR16-BUG-004 | **Invalid category_id accepted** | Medium | TC-022, TC-033 | [#13](https://github.com/minhtrile293/Software-Testing-HW06/issues/13) |
| FR16-BUG-005 | **No rate limiting** (SEC07) | Medium | TC-029 | [#14](https://github.com/minhtrile293/Software-Testing-HW06/issues/14) |
| FR16-BUG-006 | **Malformed body returns 500** not 400 | Medium | TC-030, TC-037 | [#15](https://github.com/minhtrile293/Software-Testing-HW06/issues/15) |

---

## 5. Postman Features Used

| Feature | How used in this project |
|---|---|
| Collections | FR06/07/16: Setup folder + **one data-driven executor** per API |
| Environments | `HW06_local.postman_environment.json` — baseUrl, studentId, tokens |
| Variables | CSV columns → `pm.iterationData`; env: `{{authToken}}`, `{{adminToken}}`, `{{cartFreshToken}}` |
| Pre-request scripts | `X-Student-Id: 23127273`; executor applies method/path/body/auth from CSV row |
| Tests / assertions | `assertion_profile` column → `[SPEC]` switch (584 assertions total with `-d`) |
| **Collection Runner + data file** | **`postman/data/fr06|fr07|fr16-*.csv`** — 140 rows; Newman `-d` required |
| Monitors | |
| Mock servers | |
| Workspaces | |

---

## 6. CI/CD Integration

GitHub Actions workflow: [`.github/workflows/api-tests.yml`](../.github/workflows/api-tests.yml)

| Item | Detail |
|---|---|
| SUT in CI | Clone `ttbhanh/eshop-sut` → start `backend/server.js` on port 3000 |
| Newman | Data-driven `-d postman/data/*.csv` for FR06, FR07, FR16 |
| Default profile | `ci-smoke-pass` (all assertions green) |
| Fail demo profile | `ci-smoke-one-fail` (1 failure: FR06-TC-005 / BUG-001) |
| Full regression | `full` profile — 73 failed assertions (expected SUT bugs) |
| Reports | Uploaded as Actions artifacts; HTML in `results/newman/` |

Full write-up, screenshots, and two-sample-commit instructions: [`ci-cd/CI_CD_Report.md`](../ci-cd/CI_CD_Report.md)

---

## 7. Summary

| Metric | FR06 | FR07 | FR16 | Total |
|---|---:|---:|---:|---:|
| Generated | 40 | 40 | 40 | 120 |
| Audited (VALID) | 32 | 40 | 40 | 112 |
| Extended | 6 | 6 | 6 | 18 |
| Executed (requests) | 48 | 48 | 46 | 142 |
| Passed (assertions) | 184 | 164 | 163 | 511 |
| Failed (assertions) | 24 | 26 | 23 | 73 |
| Bugs (from failures) | 6 | 3 | 6 | 15 |

Excel version: `main-report/test-summary.xlsx`
