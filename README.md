# HW06 – AI-Assisted API Testing

Student ID: `23127273`  
GitHub: https://github.com/minhtrile293/Software-Testing-HW06

This repository contains the Postman + Newman API testing project for HW06. Three APIs from EShop are tested: **FR06 Product Detail View** (Pool A), **FR07 Shopping Cart** (Pool B), and **FR16 Product Import from CSV** (Pool C).

---

## 1. Self-Assessment Table

| No. | Criteria | Grade | Self-Assessed Grade |
|---:|---|:---:|:---:|
| 1 | API 1 — full pipeline (generate + audit + extend + execute + bugs) | 30 | 28 |
| 2 | API 2 — full pipeline (same criteria) | 30 | 28 |
| 3 | API 3 — full pipeline (same criteria) | 30 | 28 |
| 4 | Agent Skills (AI-driven test generator) | 10 | 9 |
| **Total** | | **100** | **93** |

_Rationale: full pipeline + 15 GitHub Issues with evidence for all three APIs; Agent Skill includes diagram, pseudocode, and two reusable skills — demo video outline provided (record locally for YouTube link)._

---

## 2. Test Summary Report

| Metric | FR06 Product Detail | FR07 Shopping Cart | FR16 Product Import CSV | Total |
|---|---:|---:|---:|---:|
| Test cases generated (AI) | 40 | 40 | 40 | 120 |
| Test cases audited (VALID / INVALID / INCOMPLETE) | 32 / 4 / 2 | 40 / 0 / 0 | 40 / 0 / 0 | 112 / 4 / 2 |
| Test cases extended (manual) | 6 | 6 | 6 | 18 |
| Test cases executed (CSV rows) | 48 | 46 | 46 | 140 |
| Passed (assertions) | 184 | 164 | 163 | 511 |
| Failed (assertions) | 24 | 26 | 23 | 73 |
| Bugs found | 6 | 3 | 6 | 15 |

- **Tool:** Postman + Newman 6.2.2
- **SUT:** EShop backend API (`http://127.0.0.1:3000`) — smoke-tested 2026-08-20
- **Header:** `X-Student-Id: 23127273` (pre-request script on every request)
- **Postman features used:** collections, environments, variables, pre-request scripts, tests/assertions, **Collection Runner + CSV data file** — see `main-report/main-report.md` §5
- **CI/CD:** GitHub Actions — [`ci-cd/CI_CD_Report.md`](ci-cd/CI_CD_Report.md) · [passing run](https://github.com/minhtrile293/Software-Testing-HW06/actions/runs/32330085948) · [one-fail demo](https://github.com/minhtrile293/Software-Testing-HW06/actions/runs/32330296496)
- **Demo video (Agent Skill):** see [`agent-skill/demo-outline.md`](agent-skill/demo-outline.md) — paste YouTube URL in [`youtube-skill-link.txt`](youtube-skill-link.txt) after recording

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
