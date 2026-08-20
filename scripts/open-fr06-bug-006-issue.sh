#!/usr/bin/env bash
set -euo pipefail
REPO="minhtrile293/Software-Testing-HW06"
BASE="https://raw.githubusercontent.com/${REPO}/main/bugs/screenshots"

gh issue create --repo "$REPO" --title "FR06-BUG-006: No rate limiting on product detail API (SEC07)" --body "$(cat <<EOF
## Related test
FR06-TC-040

## Expected
Per SEC07, abusive burst traffic to \`GET /api/products/:id\` should eventually return **429 Too Many Requests**.

## Actual
Repeated requests all return **200 OK** — no rate limiting middleware in SUT.

## Steps
1. \`for i in 1 2 3 4 5; do curl -s -o /dev/null -w "HTTP:%{http_code}\n" http://127.0.0.1:3000/api/products/1 -H "X-Student-Id: 23127273"; done\`
2. Newman TC-040: expect 429 → **FAIL** (got 200)

## Screenshot
![No rate limit](${BASE}/FR06-BUG-006-no-rate-limit-sec07.svg)

## Source
No rate-limit middleware in \`server.js\`.
EOF
)"
