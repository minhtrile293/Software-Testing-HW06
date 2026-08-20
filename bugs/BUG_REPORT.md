# Bug Report — HW06 API Testing

| Bug ID | API | Title | Expected | Actual | GitHub Issue | Severity |
|---|---|---|---|---|---|---|
| FR06-BUG-001 | FR06 | Missing product returns 200 `{}` | 404 Not Found | 200 + empty JSON object | [#1](https://github.com/minhtrile293/Software-Testing-HW06/issues/1) | Medium |
| FR06-BUG-002 | FR06 | Inconsistent `price` type by id parity | `price` always number | Odd id: number; even id: string | [#2](https://github.com/minhtrile293/Software-Testing-HW06/issues/2) | Medium |
| FR06-BUG-003 | FR06 | Unauthenticated product update | 401/403 | PUT `/api/products/:id` → 200 | [#3](https://github.com/minhtrile293/Software-Testing-HW06/issues/3) | High |
| FR06-BUG-004 | FR06 | Unauthenticated product delete | 401/403 | DELETE `/api/products/:id` → 200 | [#4](https://github.com/minhtrile293/Software-Testing-HW06/issues/4) | High |
| FR06-BUG-005 | FR06 | Trailing slash routing | Detail 404 or single product | `GET /api/products/` → array (list) | [#5](https://github.com/minhtrile293/Software-Testing-HW06/issues/5) | Low |

## Screenshots

| Bug ID | File |
|---|---|
| FR06-BUG-001 | `bugs/screenshots/FR06-BUG-001-silent-not-found-200-empty.svg` |
| FR06-BUG-002 | `bugs/screenshots/FR06-BUG-002-price-type-parity.svg` |
| FR06-BUG-003 | `bugs/screenshots/FR06-BUG-003-unauthenticated-put.svg` |
| FR06-BUG-004 | `bugs/screenshots/FR06-BUG-004-unauthenticated-delete.svg` |
| FR06-BUG-005 | `bugs/screenshots/FR06-BUG-005-trailing-slash-list.svg` |

## Automation

After identifying bugs from Newman/API runs:

```bash
python3 scripts/capture-fr06-bug-screenshots.py   # refresh evidence SVG
bash scripts/open-fr06-github-issues.sh          # create issues (idempotent: skip if already open)
```

## Evidence

- Newman reports: `results/newman/fr06-report.html`
- Postman collection: `postman/collections/HW06_FR06_ProductDetail.postman_collection.json`
- Source: `eshop-sut-main/backend/server.js` L159–165 (detail), L179–196 (PUT/DELETE)
