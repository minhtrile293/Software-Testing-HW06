#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="minhtrile293/Software-Testing-HW06"
BASE="https://raw.githubusercontent.com/${REPO}/main/bugs/screenshots"
cd "$ROOT"
python3 scripts/capture-fr07-bug-screenshots.py

create_issue() { gh issue create --repo "$REPO" --title "$1" --body "$2"; }

create_issue "FR07-BUG-001: POST /api/cart accepts invalid input without validation" "$(cat <<EOF
## Related tests
FR07-TC-011–023, TC-026, TC-034–035, TC-037–038, TC-040, EXT-001, EXT-003

## Expected
\`POST /api/cart\` must validate body: quantity > 0, required fields, positive price → **400 Bad Request** on invalid input.

## Actual
Server **blindly pushes \`req.body\`** to cart array → **200** \`{"message":"Added to cart"}\` for quantity=0, negative price, missing fields, etc.

## Steps
1. Login → get Bearer token
2. \`curl -i -X POST http://127.0.0.1:3000/api/cart -H "Authorization: Bearer \$TOKEN" -H "Content-Type: application/json" -d '{"id":1,"name":"X","price":100,"quantity":0}'\`

## Screenshot
![No validation](${BASE}/FR07-BUG-001-no-cart-input-validation.svg)

## Source
\`server.js\` L290–294: \`userCarts[userId].push(req.body)\` — no validation.
EOF
)"

create_issue "FR07-BUG-002: Duplicate product_id creates multiple cart rows (no merge)" "$(cat <<EOF
## Related tests
FR07-TC-028c, EXT-002

## Expected
Adding same \`product_id\` twice → **one row** with merged \`quantity\` (e.g. qty=2).

## Actual
Each POST creates a **new row** — cart has multiple entries with same \`id\`.

## Steps
1. POST same product twice with qty=1
2. GET /api/cart → filter id=99 → expect 1 row qty=2, got 2 rows qty=1

## Screenshot
![Duplicate rows](${BASE}/FR07-BUG-002-duplicate-rows-not-merged.svg)

## Source
\`server.js\` L293: always \`.push()\`, no dedup/merge logic.
EOF
)"

create_issue "FR07-BUG-003: No rate limiting on cart API (SEC07)" "$(cat <<EOF
## Related test
FR07-TC-039

## Expected
Burst requests → **429 Too Many Requests** (SEC07).

## Actual
All requests return **200** — no rate limit middleware.

## Screenshot
![No rate limit](${BASE}/FR07-BUG-003-no-rate-limit-sec07.svg)
EOF
)"

echo "Done."
gh issue list --repo "$REPO" --limit 15
