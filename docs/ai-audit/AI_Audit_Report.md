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

Audited all 40 rows against `server.js` L159–165 and smoke tests. Labels: 14 VALID, 19 INVALID, 7 INCOMPLETE. Corrected expectations (e.g. missing id → 200 `{}`, even id → string price). Added 6 extended cases from code inspection. See `main-report.md` §2.2–§2.3.

---

_(Add one section per subsequent AI session — FR07, FR16, Postman generation, CI/CD.)_
