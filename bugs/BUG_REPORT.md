# Bug Report — HW06 API Testing

> Bugs are identified by **Newman test failures** against **spec-based assertions** (`[SPEC]` prefix in collection).

## FR06 — Product Detail

| Bug ID | Title | Expected | Actual | Failing tests | GitHub Issue | Severity |
|---|---|---|---|---|---|---|
| FR06-BUG-001 | Missing/invalid id returns 200 `{}` | 404 or 400 | 200 + `{}` | TC-005,006,010,020,023,024,034–037, EXT-002 | [#1](https://github.com/minhtrile293/Software-Testing-HW06/issues/1) | Medium |
| FR06-BUG-002 | `price` not always number | number | string on even id | TC-002, EXT-001, EXT-006 | [#2](https://github.com/minhtrile293/Software-Testing-HW06/issues/2) | Medium |
| FR06-BUG-003 | PUT without auth | 401/403 | 200 | TC-029 | [#3](https://github.com/minhtrile293/Software-Testing-HW06/issues/3) | High |
| FR06-BUG-004 | DELETE without auth | 401/403 | 200 | TC-030 | [#4](https://github.com/minhtrile293/Software-Testing-HW06/issues/4) | High |
| FR06-BUG-005 | Trailing slash returns list | single object | JSON array | TC-011, EXT-003 | [#5](https://github.com/minhtrile293/Software-Testing-HW06/issues/5) | Low |
| FR06-BUG-006 | No rate limiting (SEC07) | 429 after burst | all 200 | TC-040 | [#6](https://github.com/minhtrile293/Software-Testing-HW06/issues/6) | Medium |

## FR07 — Shopping Cart

| Bug ID | Title | Expected | Actual | Failing tests | GitHub Issue | Severity |
|---|---|---|---|---|---|---|
| FR07-BUG-001 | No input validation on POST `/api/cart` | 400 on invalid body | 200 Added to cart | TC-011–023,026,034–035,037–038,040, EXT-001,003 | [#7](https://github.com/minhtrile293/Software-Testing-HW06/issues/7) | High |
| FR07-BUG-002 | Duplicate product_id not merged | 1 row, qty summed | multiple rows | TC-028c, EXT-002 | [#8](https://github.com/minhtrile293/Software-Testing-HW06/issues/8) | Medium |
| FR07-BUG-003 | No rate limiting (SEC07) | 429 | all 200 | TC-039 | [#9](https://github.com/minhtrile293/Software-Testing-HW06/issues/9) | Medium |

## FR16 — Product Import CSV

| Bug ID | Title | Expected | Actual | Failing tests | GitHub Issue | Severity |
|---|---|---|---|---|---|---|
| FR16-BUG-001 | Non-admin can import | 403 | 200 inserted | TC-002, TC-035, EXT-001, EXT-006 | [#10](https://github.com/minhtrile293/Software-Testing-HW06/issues/10) | Critical |
| FR16-BUG-002 | No price validation | 400 | 200 inserted | TC-008–012,026,036, EXT-002,005 | [#11](https://github.com/minhtrile293/Software-Testing-HW06/issues/11) | High |
| FR16-BUG-003 | Partial import no rollback | 400, inserted=0 | 200 partial | TC-013, EXT-003, EXT-004 | [#12](https://github.com/minhtrile293/Software-Testing-HW06/issues/12) | High |
| FR16-BUG-004 | Invalid category_id accepted | 400 | 200 inserted | TC-022, TC-033 | [#13](https://github.com/minhtrile293/Software-Testing-HW06/issues/13) | Medium |
| FR16-BUG-005 | No rate limiting (SEC07) | 429 | all 200 | TC-029 | [#14](https://github.com/minhtrile293/Software-Testing-HW06/issues/14) | Medium |
| FR16-BUG-006 | Malformed body → 500 | 400/415 | 500 | TC-030, TC-037 | [#15](https://github.com/minhtrile293/Software-Testing-HW06/issues/15) | Medium |

## Screenshots

| Bug ID | File |
|---|---|
| FR06-BUG-001 | `bugs/screenshots/FR06-BUG-001-silent-not-found-200-empty.svg` |
| FR06-BUG-002 | `bugs/screenshots/FR06-BUG-002-price-type-parity.svg` |
| FR06-BUG-003 | `bugs/screenshots/FR06-BUG-003-unauthenticated-put.svg` |
| FR06-BUG-004 | `bugs/screenshots/FR06-BUG-004-unauthenticated-delete.svg` |
| FR06-BUG-005 | `bugs/screenshots/FR06-BUG-005-trailing-slash-list.svg` |
| FR06-BUG-006 | `bugs/screenshots/FR06-BUG-006-no-rate-limit-sec07.svg` |
| FR07-BUG-001 | `bugs/screenshots/FR07-BUG-001-no-cart-input-validation.svg` |
| FR07-BUG-002 | `bugs/screenshots/FR07-BUG-002-duplicate-rows-not-merged.svg` |
| FR07-BUG-003 | `bugs/screenshots/FR07-BUG-003-no-rate-limit-sec07.svg` |
| FR16-BUG-001 | `bugs/screenshots/FR16-BUG-001-user-role-escalation-import.svg` |
| FR16-BUG-002 | `bugs/screenshots/FR16-BUG-002-no-price-validation.svg` |
| FR16-BUG-003 | `bugs/screenshots/FR16-BUG-003-partial-import-no-rollback.svg` |
| FR16-BUG-004 | `bugs/screenshots/FR16-BUG-004-invalid-category-accepted.svg` |
| FR16-BUG-005 | `bugs/screenshots/FR16-BUG-005-no-rate-limit-sec07.svg` |
| FR16-BUG-006 | `bugs/screenshots/FR16-BUG-006-malformed-body-500.svg` |

## Automation

```bash
# Build collections + CSV from scripts/data definitions
node scripts/build-fr06-collection.js
node scripts/build-fr07-collection.js
node scripts/build-fr16-collection.js

# Run Newman (data-driven — MUST use -d)
newman run postman/collections/HW06_FR06_ProductDetail.postman_collection.json \
  -e postman/environments/HW06_local.postman_environment.json \
  -d postman/data/fr06-product-detail-data.csv \
  -r cli,htmlextra --reporter-htmlextra-export results/newman/fr06-report.html

newman run postman/collections/HW06_FR07_ShoppingCart.postman_collection.json \
  -e postman/environments/HW06_local.postman_environment.json \
  -d postman/data/fr07-shopping-cart-data.csv \
  -r cli,htmlextra --reporter-htmlextra-export results/newman/fr07-report.html

newman run postman/collections/HW06_FR16_ProductImportCSV.postman_collection.json \
  -e postman/environments/HW06_local.postman_environment.json \
  -d postman/data/fr16-product-import-data.csv \
  -r cli,htmlextra --reporter-htmlextra-export results/newman/fr16-report.html

# Bug evidence + GitHub issues
python3 scripts/capture-fr07-bug-screenshots.py
python3 scripts/capture-fr16-bug-screenshots.py
bash scripts/open-fr07-github-issues.sh   # issues #7–9
bash scripts/open-fr16-github-issues.sh   # issues #10–15
```

## Evidence

| API | Newman report | Failed assertions |
|---|---|---:|
| FR06 | `results/newman/fr06-report.html` | 24 |
| FR07 | `results/newman/fr07-report.html` | 26 |
| FR16 | `results/newman/fr16-report.html` | 23 |
| **Total** | | **73** |
