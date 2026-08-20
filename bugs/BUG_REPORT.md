# Bug Report — HW06 API Testing

| Bug ID | API | Title | Expected | Actual | GitHub Issue | Severity |
|---|---|---|---|---|---|---|
| FR06-BUG-001 | FR06 | Missing product returns 200 `{}` | 404 Not Found | 200 + empty JSON object | _(pending)_ | Medium |
| FR06-BUG-002 | FR06 | Inconsistent `price` type by id parity | `price` always number | Odd id: number; even id: string | _(pending)_ | Medium |
| FR06-BUG-003 | FR06 | Unauthenticated product update | 401/403 | PUT `/api/products/:id` → 200 | _(pending)_ | High |
| FR06-BUG-004 | FR06 | Unauthenticated product delete | 401/403 | DELETE `/api/products/:id` → 200 | _(pending)_ | High |
| FR06-BUG-005 | FR06 | Trailing slash routing | Detail 404 or single product | `GET /api/products/` → array (list) | _(pending)_ | Low |

## Screenshots

| Bug ID | File |
|---|---|
| FR06 (execution) | `results/newman/fr06-console.txt` — `X-Student-Id: 23127273` on each request |
| FR06 (report) | `results/newman/fr06-report.html` |

## Evidence

- Newman reports: `results/newman/fr06-report.html`
- Postman collection: `postman/collections/HW06_FR06_ProductDetail.postman_collection.json`
- Source: `eshop-sut-main/backend/server.js` L159–165 (detail), L179–196 (PUT/DELETE)
