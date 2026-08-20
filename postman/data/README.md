# Postman Data Files (Collection Runner + Newman `-d`)

All test **input data** for HW06 lives here. Collections read rows via `pm.iterationData` — no hardcoded bodies in request JSON.

## Files

| File | API | Rows | Collection |
|---|---|---:|---|
| `fr06-product-detail-data.csv` | FR06 Product Detail | 48 | `HW06_FR06_ProductDetail.postman_collection.json` |
| `fr07-shopping-cart-data.csv` | FR07 Shopping Cart | 46 | `HW06_FR07_ShoppingCart.postman_collection.json` |
| `fr16-product-import-data.csv` | FR16 Product Import | 46 | `HW06_FR16_ProductImportCSV.postman_collection.json` |
| `fr*-ci-smoke-pass.csv` | CI smoke (all pass) | 5 each | Used by GitHub Actions default profile |
| `fr06-ci-smoke-one-fail.csv` | CI fail demo | 4 | 1 intentional failure (FR06-TC-005) |

Regenerate CSV + collection after edits:

```bash
node scripts/build-fr06-collection.js
node scripts/build-fr07-collection.js
node scripts/build-fr16-collection.js
```

## CSV columns

| Column | Description |
|---|---|
| `tc_id` | Test case ID (e.g. `FR07-TC-011`) |
| `description` | Human-readable summary |
| `method` | HTTP method |
| `path` | URL path (appended to `{{baseUrl}}`) |
| `body` | Request body (JSON string, empty for GET) |
| `auth_mode` | `none`, `user`, `admin`, `cartFresh`, `invalid`, `garbage`, `inherit`, `lowercase` |
| `content_type` | e.g. `application/json` (empty = no Content-Type header) |
| `extra_headers` | JSON object of extra headers |
| `assertion_profile` | Key for `[SPEC]` assertions in collection test script |
| `expected_status` | Optional fallback expected HTTP status |
| `pre_steps` | JSON array of prior requests (chained setup), e.g. POST before GET |
| `notes` | Free text |

## Run with Newman

```bash
newman run postman/collections/HW06_FR07_ShoppingCart.postman_collection.json \
  -e postman/environments/HW06_local.postman_environment.json \
  -d postman/data/fr07-shopping-cart-data.csv \
  -r cli,htmlextra --reporter-htmlextra-export results/newman/fr07-report.html
```

## Postman GUI (Collection Runner)

1. Import collection + environment
2. Open collection → **Run**
3. Select **Select File** → choose the matching CSV from `postman/data/`
4. Run — each CSV row = one iteration of Setup + data-driven request
