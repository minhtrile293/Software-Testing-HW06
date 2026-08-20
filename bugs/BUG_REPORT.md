# Bug Report — HW06 API Testing

> Bugs are identified by **Newman test failures** against **spec-based assertions** (`[SPEC]` prefix in collection).

| Bug ID | API | Title | Expected | Actual | Failing tests | GitHub Issue | Severity |
|---|---|---|---|---|---|---|---|
| FR06-BUG-001 | FR06 | Missing/invalid id returns 200 `{}` | 404 or 400 | 200 + `{}` | TC-005,006,010,020,023,024,034–037, EXT-002 | [#1](https://github.com/minhtrile293/Software-Testing-HW06/issues/1) | Medium |
| FR06-BUG-002 | FR06 | `price` not always number | number | string on even id | TC-002, EXT-001, EXT-006 | [#2](https://github.com/minhtrile293/Software-Testing-HW06/issues/2) | Medium |
| FR06-BUG-003 | FR06 | PUT without auth | 401/403 | 200 | TC-029 | [#3](https://github.com/minhtrile293/Software-Testing-HW06/issues/3) | High |
| FR06-BUG-004 | FR06 | DELETE without auth | 401/403 | 200 | TC-030 | [#4](https://github.com/minhtrile293/Software-Testing-HW06/issues/4) | High |
| FR06-BUG-005 | FR06 | Trailing slash returns list | single object | JSON array | TC-011, EXT-003 | [#5](https://github.com/minhtrile293/Software-Testing-HW06/issues/5) | Low |
| FR06-BUG-006 | FR06 | No rate limiting (SEC07) | 429 after burst | all 200 | TC-040 | [#6](https://github.com/minhtrile293/Software-Testing-HW06/issues/6) | Medium |

## Screenshots

| Bug ID | File |
|---|---|
| FR06-BUG-001 | `bugs/screenshots/FR06-BUG-001-silent-not-found-200-empty.svg` |
| FR06-BUG-002 | `bugs/screenshots/FR06-BUG-002-price-type-parity.svg` |
| FR06-BUG-003 | `bugs/screenshots/FR06-BUG-003-unauthenticated-put.svg` |
| FR06-BUG-004 | `bugs/screenshots/FR06-BUG-004-unauthenticated-delete.svg` |
| FR06-BUG-005 | `bugs/screenshots/FR06-BUG-005-trailing-slash-list.svg` |
| FR06-BUG-006 | `bugs/screenshots/FR06-BUG-006-no-rate-limit-sec07.svg` |

## Automation

```bash
node scripts/build-fr06-collection.js
newman run postman/collections/HW06_FR06_ProductDetail.postman_collection.json \
  -e postman/environments/HW06_local.postman_environment.json \
  -r cli,htmlextra --reporter-htmlextra-export results/newman/fr06-report.html
python3 scripts/capture-fr06-bug-screenshots.py
bash scripts/open-fr06-github-issues.sh   # first time only
```

## Evidence

- Newman: `results/newman/fr06-report.html` — **24 failed assertions**
- Console: `results/newman/fr06-console.txt`
