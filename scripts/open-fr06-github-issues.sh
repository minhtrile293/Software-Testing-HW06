#!/usr/bin/env bash
# Capture FR06 bug screenshots and open GitHub Issues (run after: git push && gh auth login).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="minhtrile293/Software-Testing-HW06"
BASE="https://raw.githubusercontent.com/${REPO}/main/bugs/screenshots"

cd "$ROOT"
python3 scripts/capture-fr06-bug-screenshots.py

create_issue() {
  local title="$1"
  local body="$2"
  gh issue create --repo "$REPO" --title "$title" --body "$body"
}

create_issue "FR06-BUG-001: Missing product returns 200 {} instead of 404" "$(cat <<EOF
## Related test
FR06-TC-005, FR06-TC-EXT-002

## Expected
\`GET /api/products/99999\` → **404 Not Found** with error message.

## Actual
**200 OK** with empty JSON object \`{}\`.

## Steps
1. Start EShop backend on \`http://127.0.0.1:3000\`
2. \`curl -i http://127.0.0.1:3000/api/products/99999 -H "X-Student-Id: 23127273"\`

## Screenshot
![Silent not-found](${BASE}/FR06-BUG-001-silent-not-found-200-empty.svg)

## Source
\`server.js\`: \`if (!row) return res.status(200).json({});\`
EOF
)"

create_issue "FR06-BUG-002: price field type inconsistent (odd=number, even=string)" "$(cat <<EOF
## Related test
FR06-TC-002, FR06-TC-EXT-001, FR06-TC-EXT-006

## Expected
\`price\` is always a **number** in JSON response (consistent schema).

## Actual
- \`GET /api/products/1\` → \`price\` is **number**
- \`GET /api/products/2\` → \`price\` is **string** \`"28000000"\`

## Steps
1. \`curl -s http://127.0.0.1:3000/api/products/1\`
2. \`curl -s http://127.0.0.1:3000/api/products/2\`
3. Compare \`typeof price\`

## Screenshot
![Price parity bug](${BASE}/FR06-BUG-002-price-type-parity.svg)

## Source
\`server.js\`: \`if (row.id % 2 === 0) row.price = row.price.toString();\`
EOF
)"

create_issue "FR06-BUG-003: Unauthenticated PUT /api/products/:id succeeds" "$(cat <<EOF
## Related test
FR06-TC-029

## Expected
Updating a product requires **admin authentication** → 401/403 without token.

## Actual
\`PUT /api/products/:id\` returns **200** \`{"message":"Product updated"}\` with **no Authorization header**.

## Steps
1. \`curl -i -X PUT http://127.0.0.1:3000/api/products/5 -H "Content-Type: application/json" -d '{"name":"x","price":1,"description":"","imageUrl":"","category_id":1}'\`

## Screenshot
![Unauthenticated PUT](${BASE}/FR06-BUG-003-unauthenticated-put.svg)

## Source
\`app.put("/api/products/:id", ...)\` — no \`authenticateToken\` middleware.
EOF
)"

create_issue "FR06-BUG-004: Unauthenticated DELETE /api/products/:id succeeds" "$(cat <<EOF
## Related test
FR06-TC-030

## Expected
Deleting a product requires **admin authentication** → 401/403 without token.

## Actual
\`DELETE /api/products/:id\` returns **200** \`{"message":"Product deleted"}\` with **no Authorization header**.

## Steps
1. \`curl -i -X DELETE http://127.0.0.1:3000/api/products/99997 -H "X-Student-Id: 23127273"\`

## Screenshot
![Unauthenticated DELETE](${BASE}/FR06-BUG-004-unauthenticated-delete.svg)

## Source
\`app.delete("/api/products/:id", ...)\` — no \`authenticateToken\` middleware.
EOF
)"

create_issue "FR06-BUG-005: GET /api/products/ returns list array (routing)" "$(cat <<EOF
## Related test
FR06-TC-011, FR06-TC-EXT-003

## Expected
\`GET /api/products/{id}\` detail with invalid/missing id → 404 or single-object error.

## Actual
\`GET /api/products/\` (trailing slash) returns **200** with JSON **array** of all products (list route).

## Steps
1. \`curl -i http://127.0.0.1:3000/api/products/ -H "X-Student-Id: 23127273"\`

## Screenshot
![Trailing slash list](${BASE}/FR06-BUG-005-trailing-slash-list.svg)

## Source
Express routing: trailing slash matches \`GET /api/products\` list handler.
EOF
)"

echo "Done. List issues:"
gh issue list --repo "$REPO" --limit 10
