#!/usr/bin/env node
/**
 * Generates HW06_FR06_ProductDetail Postman collection from audited test cases.
 */
const fs = require("fs");
const path = require("path");

const prerequest = [
  "pm.request.headers.upsert({ key: 'X-Student-Id', value: pm.environment.get('studentId') || '23127273' });",
  "console.log('X-Student-Id:', pm.environment.get('studentId') || '23127273');",
];

function item(name, method, urlPath, testLines, extra = {}) {
  const url = urlPath.startsWith("http")
    ? urlPath
    : `{{baseUrl}}${urlPath}`;
  const parts = url.replace("{{baseUrl}}", "").split("/").filter(Boolean);
  const req = {
    name,
    request: {
      method,
      header: extra.headers || [],
      url: url.startsWith("http")
        ? url
        : {
            raw: url,
            host: ["{{baseUrl}}"],
            path: parts,
          },
      ...(extra.body ? { body: extra.body } : {}),
    },
    event: [
      {
        listen: "test",
        script: { type: "text/javascript", exec: testLines },
      },
    ],
  };
  if (extra.prerequest) {
    req.event.unshift({
      listen: "prerequest",
      script: { type: "text/javascript", exec: extra.prerequest },
    });
  }
  return req;
}

const setup = [
  item(
    "Setup — Login test user",
    "POST",
    "/api/login",
    [
      "pm.test('Login test user', () => pm.response.to.have.status(200));",
      "const j = pm.response.json();",
      "pm.environment.set('authToken', j.token);",
    ],
    {
      headers: [{ key: "Content-Type", value: "application/json" }],
      body: {
        mode: "raw",
        raw: '{"email":"test@eshop.com","password":"Test1234!"}',
      },
    },
  ),
  item(
    "Setup — Login admin",
    "POST",
    "/api/login",
    [
      "pm.test('Login admin', () => pm.response.to.have.status(200));",
      "pm.environment.set('adminToken', pm.response.json().token);",
    ],
    {
      headers: [{ key: "Content-Type", value: "application/json" }],
      body: {
        mode: "raw",
        raw: '{"email":"admin@eshop.com","password":"Admin123!"}',
      },
    },
  ),
];

const tests = [
  item("FR06-TC-001 Valid product odd ID", "GET", "/api/products/1", [
    "pm.test('Status 200', () => pm.response.to.have.status(200));",
    "const b = pm.response.json();",
    "pm.test('Has required fields', () => {",
    "  ['id','name','price','description','imageUrl','category_id'].forEach(k => pm.expect(b).to.have.property(k));",
    "});",
    "pm.test('Price is number for odd id', () => pm.expect(typeof b.price).to.eql('number'));",
  ]),
  item("FR06-TC-002 Valid product even ID", "GET", "/api/products/2", [
    "pm.test('Status 200', () => pm.response.to.have.status(200));",
    "pm.test('Price is string for even id (SUT behavior)', () => pm.expect(typeof pm.response.json().price).to.eql('string'));",
  ]),
  item("FR06-TC-003 Valid last seeded product", "GET", "/api/products/5", [
    "pm.test('Status 200', () => pm.response.to.have.status(200));",
    "pm.test('Name contains Keychron', () => pm.expect(pm.response.json().name).to.include('Keychron'));",
  ]),
  item("FR06-TC-004 Valid category 2", "GET", "/api/products/3", [
    "pm.test('Status 200', () => pm.response.to.have.status(200));",
    "pm.test('category_id is 2', () => pm.expect(pm.response.json().category_id).to.eql(2));",
  ]),
  item("FR06-TC-005 Non-existent ID", "GET", "/api/products/99999", [
    "pm.test('Status 200 (SUT bug: should be 404)', () => pm.response.to.have.status(200));",
    "pm.test('Empty object body', () => pm.expect(pm.response.json()).to.eql({}));",
  ]),
  item("FR06-TC-006 ID zero", "GET", "/api/products/0", [
    "pm.test('Status 200', () => pm.response.to.have.status(200));",
    "pm.test('Empty object', () => pm.expect(pm.response.json()).to.eql({}));",
  ]),
  item("FR06-TC-007 Negative ID", "GET", "/api/products/-1", [
    "pm.test('Status 200', () => pm.response.to.have.status(200));",
    "pm.test('Empty object', () => pm.expect(pm.response.json()).to.eql({}));",
  ]),
  item("FR06-TC-008 Non-numeric ID", "GET", "/api/products/abc", [
    "pm.test('Status 200', () => pm.response.to.have.status(200));",
    "pm.test('Empty object', () => pm.expect(pm.response.json()).to.eql({}));",
  ]),
  item("FR06-TC-009 Decimal ID", "GET", "/api/products/1.5", [
    "pm.test('Status 200', () => pm.response.to.have.status(200));",
    "pm.test('Empty object', () => pm.expect(pm.response.json()).to.eql({}));",
  ]),
  item("FR06-TC-010 Very large ID", "GET", "/api/products/2147483647", [
    "pm.test('Status 200', () => pm.response.to.have.status(200));",
    "pm.test('Empty object', () => pm.expect(pm.response.json()).to.eql({}));",
  ]),
  item("FR06-TC-011 Trailing slash list route", "GET", "/api/products/", [
    "pm.test('Status 200', () => pm.response.to.have.status(200));",
    "pm.test('Response is array (list route)', () => pm.expect(pm.response.json()).to.be.an('array'));",
  ]),
  item("FR06-TC-012 Leading-zero ID", "GET", "/api/products/01", [
    "pm.test('Status 200', () => pm.response.to.have.status(200));",
    "pm.test('Resolves to product id 1', () => pm.expect(pm.response.json().id).to.eql(1));",
  ]),
  item("FR06-TC-013 Schema id field", "GET", "/api/products/1", [
    "pm.test('id === 1', () => pm.expect(pm.response.json().id).to.eql(1));",
  ]),
  item("FR06-TC-014 Schema name string", "GET", "/api/products/1", [
    "const n = pm.response.json().name;",
    "pm.test('name is non-empty string', () => { pm.expect(typeof n).to.eql('string'); pm.expect(n.length).to.be.above(0); });",
  ]),
  item("FR06-TC-015 Schema price number odd", "GET", "/api/products/1", [
    "pm.test('price is number', () => pm.expect(typeof pm.response.json().price).to.eql('number'));",
  ]),
  item("FR06-TC-016 Schema description", "GET", "/api/products/1", [
    "pm.test('description is string', () => pm.expect(typeof pm.response.json().description).to.eql('string'));",
  ]),
  item("FR06-TC-017 Schema imageUrl", "GET", "/api/products/1", [
    "pm.test('imageUrl starts with http', () => pm.expect(pm.response.json().imageUrl).to.match(/^http/));",
  ]),
  item("FR06-TC-018 Schema category_id", "GET", "/api/products/1", [
    "pm.test('category_id in 1-3', () => pm.expect(pm.response.json().category_id).to.be.oneOf([1,2,3]));",
  ]),
  item("FR06-TC-019 No extra keys", "GET", "/api/products/1", [
    "const keys = Object.keys(pm.response.json()).sort();",
    "pm.test('Only expected keys', () => pm.expect(keys).to.eql(['category_id','description','id','imageUrl','name','price'].sort()));",
  ]),
  item("FR06-TC-020 Missing product schema", "GET", "/api/products/88888", [
    "pm.test('Status 200 empty object', () => { pm.response.to.have.status(200); pm.expect(pm.response.json()).to.eql({}); });",
  ]),
  item("FR06-TC-021 No Authorization header", "GET", "/api/products/1", [
    "pm.test('Public read without auth', () => pm.response.to.have.status(200));",
    "pm.test('Returns product', () => pm.expect(pm.response.json().id).to.eql(1));",
  ], {
    prerequest: ["pm.request.headers.remove('Authorization');"],
  }),
  item("FR06-TC-022 Invalid Bearer token", "GET", "/api/products/1", [
    "pm.test('Still 200 with invalid token', () => pm.response.to.have.status(200));",
  ], {
    headers: [{ key: "Authorization", value: "Bearer invalid-token-garbage" }],
  }),
  item("FR06-TC-023 SQLi OR 1=1", "GET", "/api/products/1'%20OR%20'1'='1", [
    "pm.test('Status 200', () => pm.response.to.have.status(200));",
    "pm.test('Empty or safe response', () => pm.expect(pm.response.json()).to.eql({}));",
  ]),
  item("FR06-TC-024 SQLi DROP encoded + list intact", "GET", "/api/products/1%3BDROP%20TABLE%20products--", [
    "pm.test('SQLi path returns 200 {}', () => { pm.response.to.have.status(200); pm.expect(pm.response.json()).to.eql({}); });",
    "pm.sendRequest({ url: pm.environment.get('baseUrl') + '/api/products', method: 'GET', header: { 'X-Student-Id': pm.environment.get('studentId') } }, (err, res) => {",
    "  pm.test('Products list still available', () => { pm.expect(err).to.be.null; pm.expect(res.code).to.eql(200); pm.expect(JSON.parse(res.stream.toString())).to.be.an('array').that.is.not.empty; });",
    "});",
  ]),
  item("FR06-TC-025 XSS in path", "GET", "/api/products/%3Cscript%3Ealert(1)%3C/script%3E", [
    "pm.test('Status 404 (Express no route match)', () => pm.response.to.have.status(404));",
    "pm.test('No script in body', () => pm.expect(pm.response.text()).to.not.include('<script>'));",
  ]),
  item("FR06-TC-026 IDOR with user token", "GET", "/api/products/1", [
    "pm.test('Public data with user token', () => pm.response.to.have.status(200));",
  ], {
    headers: [{ key: "Authorization", value: "Bearer {{authToken}}" }],
  }),
  item("FR06-TC-027 No admin required", "GET", "/api/products/1", [
    "pm.test('Public without admin', () => pm.response.to.have.status(200));",
  ]),
  item("FR06-TC-028 POST not allowed on detail", "POST", "/api/products/1", [
    "pm.test('POST returns 404', () => pm.response.to.have.status(404));",
  ], {
    headers: [{ key: "Content-Type", value: "application/json" }],
    body: { mode: "raw", raw: "{}" },
  }),
  item("FR06-TC-029 PUT on detail URL", "PUT", "/api/products/4", [
    "pm.test('PUT returns 200 (SUT allows unauthenticated update — bug)', () => pm.response.to.have.status(200));",
  ], {
    headers: [{ key: "Content-Type", value: "application/json" }],
    body: {
      mode: "raw",
      raw: '{"name":"Tai nghe AirPods Pro 2","price":6000000,"description":"Chống ồn","imageUrl":"https://placehold.co/300x300/png?text=AirPods+Pro","category_id":3}',
    },
  }),
  item("FR06-TC-030 DELETE without auth", "DELETE", "/api/products/99998", [
    "pm.test('DELETE returns 200 (SUT allows unauthenticated delete — bug)', () => pm.response.to.have.status(200));",
  ]),
  item("FR06-TC-031 Content-Type JSON", "GET", "/api/products/1", [
    "pm.test('Content-Type includes json', () => pm.expect(pm.response.headers.get('Content-Type')).to.include('json'));",
  ]),
  item("FR06-TC-032 Response time SLA", "GET", "/api/products/1", [
    "pm.test('Status 200', () => pm.response.to.have.status(200));",
    "pm.test('Response < 2000ms', () => pm.expect(pm.response.responseTime).to.be.below(2000));",
  ]),
  item("FR06-TC-033 Idempotent read pass 1", "GET", "/api/products/1", [
    "pm.test('Pass 1 status 200', () => pm.response.to.have.status(200));",
    "pm.collectionVariables.set('fr06_tc033_body', pm.response.text());",
  ]),
  item("FR06-TC-033 Idempotent read pass 2", "GET", "/api/products/1", [
    "pm.test('Pass 2 identical body', () => pm.expect(pm.response.text()).to.eql(pm.collectionVariables.get('fr06_tc033_body')));",
  ]),
  item("FR06-TC-034 Unicode id", "GET", "/api/products/%E4%B8%AD", [
    "pm.test('Status 200', () => pm.response.to.have.status(200));",
    "pm.test('Empty object', () => pm.expect(pm.response.json()).to.eql({}));",
  ]),
  item("FR06-TC-035 Whitespace id", "GET", "/api/products/%2001%20", [
    "pm.test('Status 200', () => pm.response.to.have.status(200));",
  ]),
  item("FR06-TC-036 Null byte id", "GET", "/api/products/1%00", [
    "pm.test('Status 200', () => pm.response.to.have.status(200));",
  ]),
  item("FR06-TC-037 Float string id", "GET", "/api/products/2.0", [
    "pm.test('Status 200 — SQLite coerces 2.0 to product 2', () => pm.response.to.have.status(200));",
    "pm.test('Returns product id 2', () => pm.expect(pm.response.json().id).to.eql(2));",
  ]),
  item("FR06-TC-038 List then detail integration", "GET", "/api/products", [
    "pm.test('List 200', () => pm.response.to.have.status(200));",
    "const list = pm.response.json();",
    "pm.test('List contains id 1', () => pm.expect(list.some(p => p.id === 1)).to.be.true);",
    "pm.sendRequest({ url: pm.environment.get('baseUrl') + '/api/products/1', method: 'GET', header: { 'X-Student-Id': pm.environment.get('studentId') } }, (err, res) => {",
    "  pm.test('Detail id 1 matches list', () => { pm.expect(err).to.be.null; pm.expect(JSON.parse(res.stream.toString()).id).to.eql(1); });",
    "});",
  ]),
  item("FR06-TC-039 CORS preflight OPTIONS", "OPTIONS", "/api/products/1", [
    "pm.test('OPTIONS 204', () => pm.response.to.have.status(204));",
  ], {
    headers: [{ key: "Origin", value: "http://localhost:5173" }],
  }),
  item("FR06-TC-040 No rate limiting", "GET", "/api/products/1", [
    "pm.test('Single request 200 (no 429 in SUT)', () => pm.response.to.have.status(200));",
  ]),
  item("FR06-TC-EXT-001 Price string even id", "GET", "/api/products/2", [
    "pm.test('Extended: price typeof string', () => pm.expect(typeof pm.response.json().price).to.eql('string'));",
  ]),
  item("FR06-TC-EXT-002 Silent not-found", "GET", "/api/products/77777", [
    "pm.test('Extended: 200 + {}', () => { pm.response.to.have.status(200); pm.expect(pm.response.json()).to.eql({}); });",
  ]),
  item("FR06-TC-EXT-003 Trailing slash list", "GET", "/api/products/", [
    "pm.test('Extended: array response', () => pm.expect(pm.response.json()).to.be.an('array'));",
  ]),
  item("FR06-TC-EXT-004 Leading zero", "GET", "/api/products/01", [
    "pm.test('Extended: id resolves to 1', () => pm.expect(pm.response.json().id).to.eql(1));",
  ]),
  item("FR06-TC-EXT-005 Invalid bearer public read", "GET", "/api/products/1", [
    "pm.test('Extended: 200 with garbage bearer', () => pm.response.to.have.status(200));",
  ], {
    headers: [{ key: "Authorization", value: "Bearer garbage" }],
  }),
  item("FR06-TC-EXT-006 Parity id=1 number", "GET", "/api/products/1", [
    "pm.test('Extended: odd id price number', () => pm.expect(typeof pm.response.json().price).to.eql('number'));",
    "pm.collectionVariables.set('fr06_ext006_odd', typeof pm.response.json().price);",
  ]),
  item("FR06-TC-EXT-006 Parity id=2 string", "GET", "/api/products/2", [
    "pm.test('Extended: even id price string', () => pm.expect(typeof pm.response.json().price).to.eql('string'));",
    "pm.test('Extended: inconsistent types across parity', () => {",
    "  pm.expect(pm.collectionVariables.get('fr06_ext006_odd')).to.eql('number');",
    "  pm.expect(typeof pm.response.json().price).to.eql('string');",
    "});",
  ]),
];

const collection = {
  info: {
    name: "HW06_FR06_ProductDetail",
    description:
      "FR06 Product Detail View — 40 generated + 6 extended test cases. X-Student-Id on every request.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [{ key: "fr06_tc033_body", value: "" }, { key: "fr06_ext006_odd", value: "" }],
  event: [
    {
      listen: "prerequest",
      script: { type: "text/javascript", exec: prerequest },
    },
  ],
  item: [
    { name: "00 Setup", item: setup },
    { name: "01 Domain & Schema", item: tests.slice(0, 20) },
    { name: "02 Security & HTTP", item: tests.slice(20, 32) },
    { name: "03 Performance & Edge", item: tests.slice(32, 40) },
    { name: "04 Extended", item: tests.slice(40) },
  ],
};

const out = path.join(
  __dirname,
  "../postman/collections/HW06_FR06_ProductDetail.postman_collection.json",
);
fs.writeFileSync(out, JSON.stringify(collection, null, 2));
console.log("Wrote", out, "—", tests.length, "requests +", setup.length, "setup");
