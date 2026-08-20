# Skill: AI-Driven API Test Generator

## Purpose

Given an EShop API specification, guide the AI step-by-step to produce API test cases (not a single generic prompt). Output is reviewed by the student before execution.

## When to use

- HW06 Task: Generate test cases for FR06, FR07, or FR16
- Need ≥ 35 cases per API covering domain partitions, state transitions, security, schema validation

## Workflow

1. **Load spec** — Provide the relevant section of `api_specification.md` for one endpoint group only.
2. **Domain partitions** — Prompt AI to list partitions per parameter; ask for a table with TC ID, input, expected status/body.
3. **State transitions** — For cart/order APIs, prompt for valid and invalid state sequences separately.
4. **Security** — Prompt explicitly for SEC01–SEC07 scenarios (SQLi, IDOR, role escalation); do not assume AI will add them unprompted.
5. **Schema** — Prompt for response field assertions against the spec.
6. **Audit** — Label each row VALID / INVALID / INCOMPLETE; fix before export to Postman.
7. **Extend** — Add ≥ 5 cases the AI missed; document why (prompt gap, model limit, API-specific behavior).

## Anti-patterns

- Single prompt: "generate all API tests from the spec"
- Executing raw AI output without audit
- Skipping security because the happy-path list looks complete

## Output format

Markdown tables compatible with `main-report/main-report.md` sections 2–4.
