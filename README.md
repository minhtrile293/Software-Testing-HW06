# HW06 – AI-Assisted API Testing

Student ID: `23127273`

This repository contains the Postman + Newman API testing project for HW06. Three APIs from EShop are tested: **FR06 Product Detail View** (Pool A), **FR07 Shopping Cart** (Pool B), and **FR16 Product Import from CSV** (Pool C).

---

## 1. Self-Assessment Table

| No. | Criteria | Grade | Self-Assessed Grade |
|---:|---|:---:|:---:|
| 1 | API 1 — full pipeline (generate + audit + extend + execute + bugs) | 30 | |
| 2 | API 2 — full pipeline (same criteria) | 30 | |
| 3 | API 3 — full pipeline (same criteria) | 30 | |
| 4 | Agent Skills (AI-driven test generator) | 10 | |
| **Total** | | **100** | |

---

## 2. Test Summary Report

| Metric | FR06 Product Detail | FR07 Shopping Cart | FR16 Product Import CSV | Total |
|---|---:|---:|---:|---:|
| Test cases generated (AI) | 40 | | | 40 |
| Test cases audited (VALID / INVALID / INCOMPLETE) | 14 / 19 / 7 | | | |
| Test cases extended (manual) | 6 | | | 6 |
| Test cases executed | 48 | | | 48 |
| Passed (assertions) | 41 | | | 41 |
| Failed (assertions) | 24 | | | 24 |
| Bugs found | 6 | | | 6 |

- **Tool:** Postman + Newman 6.2.2
- **SUT:** EShop backend API (`http://127.0.0.1:3000`) — smoke-tested 2026-08-20
- **Header:** `X-Student-Id: 23127273` (pre-request script on every request)
- **Postman features used:** _(list in `main-report/main-report.md` §5)_
- **CI/CD:** GitHub Actions — [`ci-cd/CI_CD_Report.md`](ci-cd/CI_CD_Report.md) · workflow [`api-tests.yml`](.github/workflows/api-tests.yml)
- **Demo video (Agent Skill):** _(add link when recorded)_

---

## 3. Evidence Paths

| Type | Path |
|---|---|
| Main report | `main-report/main-report.md` |
| Excel test summary | `main-report/test-summary.xlsx` |
| Postman collections | `postman/collections/` |
| Postman environment | `postman/environments/HW06_local.postman_environment.json` |
| Data-driven CSV files | `postman/data/` |
| Newman HTML reports | `results/newman/` |
| Execution screenshots | `results/screenshots/` |
| Bug report | `bugs/BUG_REPORT.md` |
| CI/CD report | `ci-cd/CI_CD_Report.md` |
| AI Audit Report | `docs/ai-audit/AI_Audit_Report.md` |
| AI Critique | `docs/ai-critique/AI_Critique.md` |
| Git commit log | `docs/git-log/git-commit-log.txt` |
| Agent Skills | `agent-skill/` |

---

## 4. Repository Structure

```text
Software-Testing-HW06/
├── README.md
├── requirement/
├── main-report/
├── postman/
├── results/
├── bugs/
├── ci-cd/
├── agent-skill/
├── docs/
└── .github/workflows/
```

---

## 5. Key Documents

| Document | Path |
|---|---|
| Main report | `main-report/main-report.md` |
| Bug report | `bugs/BUG_REPORT.md` |
| CI/CD report | `ci-cd/CI_CD_Report.md` |
| AI Audit Report | `docs/ai-audit/AI_Audit_Report.md` |
| AI Critique | `docs/ai-critique/AI_Critique.md` |
| Git commit log | `docs/git-log/git-commit-log.txt` |
| Agent Skills | `agent-skill/` |
