# AI-Driven API Test Generator — Pseudocode

> Self-drawn design for HW06 §7. Diagram: `diagram.png` (add manually).

```
INPUT: api_specification.md (endpoint, method, params, response schema, SEC rules)

STEP 1: PARSE SPEC
  FOR each endpoint in spec:
    EXTRACT method, path, request params, response schema, auth requirements

STEP 2: DOMAIN PARTITIONS
  FOR each parameter:
    GENERATE valid / invalid / boundary test values
    (email format, password complexity, price > 0, required fields, etc.)

STEP 3: STATE TRANSITIONS
  IF endpoint affects order/cart state (FR10):
    GENERATE sequences: pending → confirmed → shipping → delivered
    GENERATE invalid transitions and cancel rules

STEP 4: SECURITY (SEC01–SEC07)
  GENERATE tests for:
    - SQL injection payloads in string params
    - IDOR (access other user's resource by ID)
    - Role escalation (user token on admin endpoint)
    - Missing / invalid auth token

STEP 5: SCHEMA VALIDATION
  FOR each success response:
    ASSERT response shape matches spec (fields, types, required keys)

STEP 6: OUTPUT
  EMIT test case table (≥ 35 per API)
  EMIT Postman collection JSON (optional)

OUTPUT: test cases + metadata for audit (VALID / INVALID / INCOMPLETE labels by human)
```

Human review is mandatory after STEP 6 (HW06 §6 ¶2).
