# CI/CD Report — HW06 API Testing

## 1. Pipeline Configuration

- **Workflow file:** `.github/workflows/api-tests.yml`
- **Trigger:** _(e.g. push to main, pull_request)_
- **Runner:** `ubuntu-latest`
- **Steps:** checkout → setup Node → install Newman → start SUT → run collections → upload report

## 2. Sample Run — All Passing

| Field | Value |
|---|---|
| Commit SHA | |
| Commit message | |
| Pipeline URL | |
| Result | All tests passed |

![All-passing run](screenshots/ci-all-passing.png)

## 3. Sample Run — One Failing

| Field | Value |
|---|---|
| Commit SHA | |
| Commit message | |
| Pipeline URL | |
| Result | 1 test failed (intentionally) |

![One-failing run](screenshots/ci-one-failing.png)

## 4. Notes

- Newman runs against `http://127.0.0.1:3000` (localhost accepted per §11 anti-cheat).
- Every request carries `X-Student-Id: 23127273` via collection pre-request script.
