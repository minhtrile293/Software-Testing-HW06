# Agent Skill — Demo Recording Outline (HW06 §7)

Record ~3–5 minutes showing **Skill 01** generating tests for **one API** (suggested: FR06).

## Setup

1. Open Cursor with this repo and SUT spec (`api_specification.md` from eshop-sut).
2. Open `agent-skill/api-test-generator-skill.md` in split view.

## Script

1. **Intro (15 s)** — Show diagram.png: INPUT → domain → security → schema → human audit → Newman.
2. **Load spec (30 s)** — Paste FR06 endpoint section only (not whole file).
3. **Step 1 prompt (45 s)** — Ask AI for domain partitions on `:id`; show table output.
4. **Step 3–4 prompt (45 s)** — Ask for SEC01–SEC07 + schema rows; show combined table.
5. **Audit (45 s)** — Label 2–3 rows VALID/INVALID with reasoning (e.g. public GET ≠ 401).
6. **Extend (30 s)** — Add one manual TC from `server.js` (even-id price type).
7. **Execute (30 s)** — Run `newman run ... -d postman/data/fr06-ci-smoke-pass.csv`; show `X-Student-Id` in console.
8. **Outro (15 s)** — Point to GitHub Issues #1–#6 as bug evidence.

Upload to YouTube (unlisted OK) and save URL to `youtube-skill-link.txt`.
