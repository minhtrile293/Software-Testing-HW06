#!/usr/bin/env node
/**
 * HW06 FR06 Postman collection — assertions follow API spec / REST expectations.
 * Newman FAIL = SUT defect (bug).
 */
const fs = require("fs");
const path = require("path");

const prerequest = [
  "pm.request.headers.upsert({ key: 'X-Student-Id', value: pm.environment.get('studentId') || '23127273' });",
  "console.log('X-Student-Id:', pm.environment.get('studentId') || '23127273');",
];

function item(name, method, urlPath, testLines, extra = {}) {
  const url = urlPath.startsWith("http") ? urlPath : `{{baseUrl}}${urlPath}`;
  const parts = url.replace("{{baseUrl}}", "").split("/").filter(Boolean);
  return {
    name,
    request: {
      method,
      header: extra.headers || [],
      url: url.startsWith("http")
        ? url
        : { raw: url, host: ["{{baseUrl}}"], path: parts },
      ...(extra.body ? { body: extra.body } : {}),
    },
    event: [
      ...(extra.prerequest
        ? [{ listen: "prerequest", script: { type: "text/javascript", exec: extra.prerequest } }]
        : []),
      { listen: "test", script: { type: "text/javascript", exec: testLines } },
    ],
  };
}

const S404 = ["pm.test('[SPEC] status 404 Not Found', () => pm.response.to.have.status(404));"];
const S400 = ["pm.test('[SPEC] status 400 Bad Request', () => pm.response.to.have.status(400));"];
const AUTH = [
  "pm.test('[SPEC] requires authentication', () => pm.expect(pm.response.code).to.be.oneOf([401, 403]));",
];
const PRICE_NUM = [
  "pm.test('[SPEC] price is number', () => pm.expect(typeof pm.response.json().price).to.eql('number'));",
];

const setup = [
  item("Setup — Login test user", "POST", "/api/login", [
    "pm.test('Login test user', () => pm.response.to.have.status(200));",
    "pm.environment.set('authToken', pm.response.json().token);",
  ], {
    headers: [{ key: "Content-Type", value: "application/json" }],
    body: { mode: "raw", raw: '{"email":"test@eshop.com","password":"Test1234!"}' },
  }),
  item("Setup — Login admin", "POST", "/api/login", [
    "pm.test('Login admin', () => pm.response.to.have.status(200));",
    "pm.environment.set('adminToken', pm.response.json().token);",
  ], {
    headers: [{ key: "Content-Type", value: "application/json" }],
    body: { mode: "raw", raw: '{"email":"admin@eshop.com","password":"Admin123!"}' },
  }),
];

const tests = [
  // --- Domain valid ---
  item("FR06-TC-001 Valid product odd ID", "GET", "/api/products/1", [
    "pm.test('[SPEC] status 200', () => pm.response.to.have.status(200));",
    "const b = pm.response.json();",
    "pm.test('[SPEC] required fields present', () => {",
    "  ['id','name','price','description','imageUrl','category_id'].forEach(k => pm.expect(b).to.have.property(k));",
    "});",
    ...PRICE_NUM,
  ]),
  item("FR06-TC-002 Valid product even ID", "GET", "/api/products/2", [
    "pm.test('[SPEC] status 200', () => pm.response.to.have.status(200));",
    "pm.test('[SPEC] full product object', () => {",
    "  const b = pm.response.json();",
    "  pm.expect(b).to.have.property('id', 2);",
    "  pm.expect(b).to.have.property('name');",
    "});",
    ...PRICE_NUM,
  ]),
  item("FR06-TC-003 Valid last seeded product", "GET", "/api/products/5", [
    "pm.test('[SPEC] status 200', () => pm.response.to.have.status(200));",
    "pm.test('[SPEC] name contains Keychron', () => pm.expect(pm.response.json().name).to.include('Keychron'));",
  ]),
  item("FR06-TC-004 Valid category 2", "GET", "/api/products/3", [
    "pm.test('[SPEC] status 200', () => pm.response.to.have.status(200));",
    "pm.test('[SPEC] category_id is 2', () => pm.expect(pm.response.json().category_id).to.eql(2));",
  ]),

  // --- Domain invalid (spec / REST) ---
  item("FR06-TC-005 Non-existent ID", "GET", "/api/products/99999", S404),
  item("FR06-TC-006 ID zero", "GET", "/api/products/0", S404),
  item("FR06-TC-007 Negative ID", "GET", "/api/products/-1", S400),
  item("FR06-TC-008 Non-numeric ID", "GET", "/api/products/abc", S400),
  item("FR06-TC-009 Decimal ID", "GET", "/api/products/1.5", S400),
  item("FR06-TC-010 Very large non-existent ID", "GET", "/api/products/2147483647", S404),
  item("FR06-TC-011 Empty ID segment (detail)", "GET", "/api/products/", [
    "pm.test('[SPEC] detail endpoint returns single object, not list', () => {",
    "  pm.response.to.have.status(200);",
    "  const b = pm.response.json();",
    "  pm.expect(b).to.be.an('object');",
    "  pm.expect(b).to.not.be.an('array');",
    "  pm.expect(b).to.have.property('id');",
    "});",
  ]),
  item("FR06-TC-012 Leading-zero ID invalid format", "GET", "/api/products/01", S400),

  // --- Schema ---
  item("FR06-TC-013 Schema id field", "GET", "/api/products/1", [
    "pm.test('[SPEC] id === 1', () => pm.expect(pm.response.json().id).to.eql(1));",
  ]),
  item("FR06-TC-014 Schema name string", "GET", "/api/products/1", [
    "const n = pm.response.json().name;",
    "pm.test('[SPEC] name non-empty string', () => { pm.expect(typeof n).to.eql('string'); pm.expect(n.length).to.be.above(0); });",
  ]),
  item("FR06-TC-015 Schema price number", "GET", "/api/products/1", PRICE_NUM),
  item("FR06-TC-016 Schema description", "GET", "/api/products/1", [
    "pm.test('[SPEC] description is string', () => pm.expect(typeof pm.response.json().description).to.eql('string'));",
  ]),
  item("FR06-TC-017 Schema imageUrl", "GET", "/api/products/1", [
    "pm.test('[SPEC] imageUrl is URL string', () => pm.expect(pm.response.json().imageUrl).to.match(/^http/));",
  ]),
  item("FR06-TC-018 Schema category_id", "GET", "/api/products/1", [
    "pm.test('[SPEC] category_id integer 1-3', () => pm.expect(pm.response.json().category_id).to.be.oneOf([1,2,3]));",
  ]),
  item("FR06-TC-019 No extra top-level keys", "GET", "/api/products/1", [
    "const keys = Object.keys(pm.response.json()).sort();",
    "pm.test('[SPEC] only expected keys', () => pm.expect(keys).to.eql(['category_id','description','id','imageUrl','name','price'].sort()));",
  ]),
  item("FR06-TC-020 Missing product error response", "GET", "/api/products/88888", S404),

  // --- Security: public read (positive — spec: no auth for GET detail) ---
  item("FR06-TC-021 Public read without Authorization", "GET", "/api/products/1", [
    "pm.test('[SPEC] public read status 200', () => pm.response.to.have.status(200));",
    "pm.test('[SPEC] returns product', () => pm.expect(pm.response.json().id).to.eql(1));",
  ], { prerequest: ["pm.request.headers.remove('Authorization');"] }),

  item("FR06-TC-022 Invalid Bearer on public read", "GET", "/api/products/1", [
    "pm.test('[SPEC] public read still 200', () => pm.response.to.have.status(200));",
    "pm.test('[SPEC] returns product', () => pm.expect(pm.response.json().id).to.eql(1));",
  ], { headers: [{ key: "Authorization", value: "Bearer invalid-token-garbage" }] }),

  item("FR06-TC-023 SQLi OR 1=1 rejected", "GET", "/api/products/1'%20OR%20'1'='1", [
    "pm.test('[SPEC] rejects malformed/suspicious id (400 or 404)', () => pm.expect(pm.response.code).to.be.oneOf([400, 404]));",
  ]),
  item("FR06-TC-024 SQLi DROP rejected + DB intact", "GET", "/api/products/1%3BDROP%20TABLE%20products--", [
    "pm.test('[SPEC] rejects SQLi path (400 or 404)', () => pm.expect(pm.response.code).to.be.oneOf([400, 404]));",
    "pm.sendRequest({ url: pm.environment.get('baseUrl') + '/api/products', method: 'GET', header: { 'X-Student-Id': pm.environment.get('studentId') } }, (err, res) => {",
    "  pm.test('[SPEC] products table intact', () => { pm.expect(err).to.be.null; pm.expect(res.code).to.eql(200); pm.expect(JSON.parse(res.stream.toString())).to.be.an('array').that.is.not.empty; });",
    "});",
  ]),
  item("FR06-TC-025 XSS path rejected", "GET", "/api/products/%3Cscript%3Ealert(1)%3C/script%3E", [
    "pm.test('[SPEC] rejects XSS path (400 or 404)', () => pm.expect(pm.response.code).to.be.oneOf([400, 404]));",
    "pm.test('[SPEC] no script reflected', () => pm.expect(pm.response.text()).to.not.include('<script>'));",
  ]),
  item("FR06-TC-026 Public catalog with user token", "GET", "/api/products/1", [
    "pm.test('[SPEC] authenticated user can read public catalog', () => pm.response.to.have.status(200));",
    "pm.test('[SPEC] returns product data', () => pm.expect(pm.response.json().id).to.eql(1));",
  ], { headers: [{ key: "Authorization", value: "Bearer {{authToken}}" }] }),
  item("FR06-TC-027 Public read without admin role", "GET", "/api/products/1", [
    "pm.test('[SPEC] no admin required for read', () => pm.response.to.have.status(200));",
  ]),

  // --- HTTP method / auth on mutations (admin per spec §3.3) ---
  item("FR06-TC-028 POST not allowed on detail URL", "POST", "/api/products/1", [
    "pm.test('[SPEC] POST on /:id not allowed (404 or 405)', () => pm.expect(pm.response.code).to.be.oneOf([404, 405]));",
  ], {
    headers: [{ key: "Content-Type", value: "application/json" }],
    body: { mode: "raw", raw: "{}" },
    prerequest: ["pm.request.headers.remove('Authorization');"],
  }),
  item("FR06-TC-029 PUT without auth rejected", "PUT", "/api/products/5", [
    ...AUTH,
  ], {
    headers: [{ key: "Content-Type", value: "application/json" }],
    body: {
      mode: "raw",
      raw: '{"name":"Keychron Q1","price":4000000,"description":"test","imageUrl":"http://x","category_id":3}',
    },
    prerequest: ["pm.request.headers.remove('Authorization');"],
  }),
  item("FR06-TC-030 DELETE without auth rejected", "DELETE", "/api/products/99997", [
    ...AUTH,
  ], { prerequest: ["pm.request.headers.remove('Authorization');"] }),

  item("FR06-TC-031 Content-Type JSON", "GET", "/api/products/1", [
    "pm.test('[SPEC] Content-Type includes json', () => pm.expect(pm.response.headers.get('Content-Type')).to.include('json'));",
  ]),
  item("FR06-TC-032 Response time SLA", "GET", "/api/products/1", [
    "pm.test('[SPEC] status 200', () => pm.response.to.have.status(200));",
    "pm.test('[SPEC] response < 2000ms', () => pm.expect(pm.response.responseTime).to.be.below(2000));",
  ]),
  item("FR06-TC-033 Idempotent read pass 1", "GET", "/api/products/1", [
    "pm.test('[SPEC] pass 1 status 200', () => pm.response.to.have.status(200));",
    "pm.collectionVariables.set('fr06_tc033_body', pm.response.text());",
  ]),
  item("FR06-TC-033 Idempotent read pass 2", "GET", "/api/products/1", [
    "pm.test('[SPEC] pass 2 identical body', () => pm.expect(pm.response.text()).to.eql(pm.collectionVariables.get('fr06_tc033_body')));",
  ]),
  item("FR06-TC-034 Unicode id rejected", "GET", "/api/products/%E4%B8%AD", S400),
  item("FR06-TC-035 Whitespace-padded id rejected", "GET", "/api/products/%2001%20", S400),
  item("FR06-TC-036 Null byte id rejected", "GET", "/api/products/1%00", S400),
  item("FR06-TC-037 Float id rejected", "GET", "/api/products/2.0", S404),
  item("FR06-TC-038 List then detail integration", "GET", "/api/products", [
    "pm.test('[SPEC] list 200', () => pm.response.to.have.status(200));",
    "const list = pm.response.json();",
    "pm.test('[SPEC] list contains id 1', () => pm.expect(list.some(p => p.id === 1)).to.be.true);",
    "pm.sendRequest({ url: pm.environment.get('baseUrl') + '/api/products/1', method: 'GET', header: { 'X-Student-Id': pm.environment.get('studentId') } }, (err, res) => {",
    "  pm.test('[SPEC] detail matches list', () => { pm.expect(err).to.be.null; pm.expect(JSON.parse(res.stream.toString()).id).to.eql(1); });",
    "});",
  ]),
  item("FR06-TC-039 CORS preflight OPTIONS", "OPTIONS", "/api/products/1", [
    "pm.test('[SPEC] OPTIONS 204', () => pm.response.to.have.status(204));",
  ], { headers: [{ key: "Origin", value: "http://localhost:5173" }] }),
  item("FR06-TC-040 Rate limit (SEC07)", "GET", "/api/products/1", [
    "pm.test('[SPEC] SEC07 rate limiting present (429 after abuse)', () => {",
    "  pm.expect(pm.response.code).to.eql(429);",
    "});",
  ]),

  // --- Extended (spec-based; AI missed edge cases) ---
  item("FR06-TC-EXT-001 Even ID price must be number", "GET", "/api/products/2", PRICE_NUM),
  item("FR06-TC-EXT-002 Missing ID must 404", "GET", "/api/products/77777", S404),
  item("FR06-TC-EXT-003 Trailing slash must not return list", "GET", "/api/products/", [
    "pm.test('[SPEC] must not return array for detail route', () => {",
    "  pm.expect(pm.response.json()).to.not.be.an('array');",
    "});",
  ]),
  item("FR06-TC-EXT-004 Leading-zero ID rejected", "GET", "/api/products/01", S400),
  item("FR06-TC-EXT-005 Public read with garbage Bearer", "GET", "/api/products/1", [
    "pm.test('[SPEC] public read 200 despite invalid token', () => pm.response.to.have.status(200));",
  ], { headers: [{ key: "Authorization", value: "Bearer garbage" }] }),
  item("FR06-TC-EXT-006 Schema parity — both prices number", "GET", "/api/products/1", [
    ...PRICE_NUM,
    "pm.collectionVariables.set('fr06_ext006_p1', typeof pm.response.json().price);",
  ]),
  item("FR06-TC-EXT-006 Schema parity — id=2", "GET", "/api/products/2", [
    "pm.test('[SPEC] id=2 price is number (consistent schema)', () => pm.expect(typeof pm.response.json().price).to.eql('number'));",
    "pm.test('[SPEC] same type as id=1', () => pm.expect(pm.collectionVariables.get('fr06_ext006_p1')).to.eql('number'));",
  ]),
];

const collection = {
  info: {
    name: "HW06_FR06_ProductDetail",
    description:
      "FR06 Product Detail — spec-based assertions. Newman FAIL indicates SUT bug.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "fr06_tc033_body", value: "" },
    { key: "fr06_ext006_p1", value: "" },
  ],
  event: [{ listen: "prerequest", script: { type: "text/javascript", exec: prerequest } }],
  item: [
    { name: "00 Setup", item: setup },
    { name: "01 Domain & Schema", item: tests.slice(0, 20) },
    { name: "02 Security & HTTP", item: tests.slice(20, 32) },
    { name: "03 Performance & Edge", item: tests.slice(32, 40) },
    { name: "04 Extended", item: tests.slice(40) },
  ],
};

const out = path.join(__dirname, "../postman/collections/HW06_FR06_ProductDetail.postman_collection.json");
fs.writeFileSync(out, JSON.stringify(collection, null, 2));
console.log("Wrote", out);
