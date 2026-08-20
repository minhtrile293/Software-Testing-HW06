#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="minhtrile293/Software-Testing-HW06"
BASE="https://raw.githubusercontent.com/${REPO}/main/bugs/screenshots"
cd "$ROOT"
python3 scripts/capture-fr16-bug-screenshots.py

create_issue() { gh issue create --repo "$REPO" --title "$1" --body "$2"; }

create_issue "FR16-BUG-001: Non-admin user can import products (role escalation)" "$(cat <<EOF
## Related tests
FR16-TC-002, TC-035, EXT-001, EXT-006

## Expected
\`POST /api/admin/import-products\` requires **admin role** → **403** for regular user token.

## Actual
Any authenticated user can import → **200** with products inserted.

## Screenshot
![Role escalation](${BASE}/FR16-BUG-001-user-role-escalation-import.svg)

## Source
\`server.js\` L199: only \`authenticateToken\`, no admin role check.
EOF
)"

create_issue "FR16-BUG-002: No price validation on product import" "$(cat <<EOF
## Related tests
FR16-TC-008–011, TC-026, TC-036, EXT-002, EXT-005

## Expected
Reject price=0, negative, missing, non-numeric, string → **400**.

## Actual
All accepted → **200** \`inserted: 1\`.

## Screenshot
![No price validation](${BASE}/FR16-BUG-002-no-price-validation.svg)
EOF
)"

create_issue "FR16-BUG-003: Partial import without transaction rollback" "$(cat <<EOF
## Related tests
FR16-TC-013, EXT-003, EXT-004

## Expected
Mixed valid/invalid batch → **400**, **zero rows inserted** (all-or-nothing).

## Actual
**200** with \`inserted: 1\` and \`errors\` array — valid rows committed, invalid skipped.

## Screenshot
![Partial import](${BASE}/FR16-BUG-003-partial-import-no-rollback.svg)
EOF
)"

create_issue "FR16-BUG-004: Invalid category_id accepted on import" "$(cat <<EOF
## Related tests
FR16-TC-022, TC-033

## Expected
Non-existent or negative \`category_id\` → **400**.

## Actual
**200** — row inserted (SQLite may not enforce FK).

## Screenshot
![Invalid category](${BASE}/FR16-BUG-004-invalid-category-accepted.svg)
EOF
)"

create_issue "FR16-BUG-005: No rate limiting on import API (SEC07)" "$(cat <<EOF
## Related test
FR16-TC-029

## Expected
**429** after burst | Actual: all **200**.

## Screenshot
![No rate limit](${BASE}/FR16-BUG-005-no-rate-limit-sec07.svg)
EOF
)"

create_issue "FR16-BUG-006: Malformed import body returns 500 instead of 400" "$(cat <<EOF
## Related tests
FR16-TC-030, TC-037

## Expected
Non-JSON or \`products:[null]\` → **400/415**.

## Actual
**500 Internal Server Error** (unhandled parse/destructure).

## Screenshot
![500 on bad body](${BASE}/FR16-BUG-006-malformed-body-500.svg)
EOF
)"

echo "Done."
gh issue list --repo "$REPO" --limit 20
