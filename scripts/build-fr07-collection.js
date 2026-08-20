#!/usr/bin/env node
/** FR07 — all test data in postman/data/fr07-shopping-cart-data.csv */
const { row, setupItem, buildAndWrite } = require("./lib/data-driven");

const JSON_H = [{ key: "Content-Type", value: "application/json" }];
const CART = (q) => JSON.stringify({ id: 1, name: "iPhone 15 Pro Max", price: 30000000, quantity: q });
const step = (method, path, body, auth_mode = "cartFresh") =>
  JSON.stringify([{ method, path, body, auth_mode, content_type: body ? "application/json" : "" }]);

const setup = [
  setupItem("Setup — Login test user", "POST", "/api/login", [
    "pm.test('Login OK', () => pm.response.to.have.status(200));",
    "pm.environment.set('authToken', pm.response.json().token);",
  ], { headers: JSON_H, body: { mode: "raw", raw: '{"email":"test@eshop.com","password":"Test1234!"}' } }),
  setupItem("Setup — Register fresh cart user", "POST", "/api/register", [
    "pm.test('Register OK', () => pm.response.to.have.status(200));",
    "const email = pm.environment.get('cartFreshEmail');",
    "pm.sendRequest({ url: pm.environment.get('baseUrl')+'/api/login', method:'POST',",
    "  header:{'Content-Type':'application/json','X-Student-Id':pm.environment.get('studentId')},",
    "  body:{mode:'raw', raw: JSON.stringify({email, password:'Test1234!'})}",
    "}, (e,r)=>{ pm.environment.set('cartFreshToken', JSON.parse(r.stream.toString()).token); });",
  ], {
    headers: JSON_H,
    prerequest: [
      "pm.environment.set('cartFreshEmail', 'cartfresh_' + Date.now() + '@eshop.com');",
      "pm.request.body.raw = JSON.stringify({name:'Cart Fresh', email: pm.environment.get('cartFreshEmail'), password:'Test1234!'});",
    ],
    body: { mode: "raw", raw: "{}" },
  }),
];

const dupPre = JSON.stringify([
  { method: "POST", path: "/api/cart", body: CART(1), auth_mode: "cartFresh", content_type: "application/json" },
  { method: "POST", path: "/api/cart", body: CART(1), auth_mode: "cartFresh", content_type: "application/json" },
]);

const rows = [
  row("FR07-TC-001", "GET cart no token", "GET", "/api/cart", "status_401_403", { auth_mode: "none" }),
  row("FR07-TC-002", "POST cart no token", "POST", "/api/cart", "status_401_403", { auth_mode: "none", content_type: "application/json", body: CART(1) }),
  row("FR07-TC-003", "GET cart invalid token", "GET", "/api/cart", "status_403", { auth_mode: "invalid" }),
  row("FR07-TC-004", "POST cart invalid token", "POST", "/api/cart", "status_403", { auth_mode: "invalid", content_type: "application/json", body: CART(1) }),
  row("FR07-TC-005", "GET empty cart fresh user", "GET", "/api/cart", "fr07_s200_empty_cart", { auth_mode: "cartFresh" }),
  row("FR07-TC-006", "GET cart returns array", "GET", "/api/cart", "fr07_s200_array", { auth_mode: "user" }),
  row("FR07-TC-007", "GET cart Content-Type json", "GET", "/api/cart", "fr07_content_type", { auth_mode: "user" }),
  row("FR07-TC-008", "POST valid item", "POST", "/api/cart", "fr07_s200_added", { auth_mode: "user", content_type: "application/json", body: CART(2) }),
  row("FR07-TC-009", "POST quantity 1 boundary", "POST", "/api/cart", "status_200", { auth_mode: "cartFresh", content_type: "application/json", body: CART(1) }),
  row("FR07-TC-010", "GET cart reflects added item", "GET", "/api/cart", "fr07_cart_has_item", { auth_mode: "cartFresh", pre_steps: step("POST", "/api/cart", CART(1)) }),
  row("FR07-TC-011", "POST quantity zero", "POST", "/api/cart", "status_400", { auth_mode: "cartFresh", content_type: "application/json", body: CART(0) }),
  row("FR07-TC-012", "POST quantity negative", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: CART(-1) }),
  row("FR07-TC-013", "POST quantity decimal", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: JSON.stringify({ id: 1, name: "X", price: 30000000, quantity: 1.5 }) }),
  row("FR07-TC-014", "POST missing id", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: '{"name":"X","price":100,"quantity":1}' }),
  row("FR07-TC-015", "POST missing name", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: '{"id":1,"price":100,"quantity":1}' }),
  row("FR07-TC-016", "POST missing price", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: '{"id":1,"name":"X","quantity":1}' }),
  row("FR07-TC-017", "POST missing quantity", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: '{"id":1,"name":"X","price":100}' }),
  row("FR07-TC-018", "POST price zero", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: '{"id":1,"name":"X","price":0,"quantity":1}' }),
  row("FR07-TC-019", "POST price negative", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: '{"id":1,"name":"X","price":-100,"quantity":1}' }),
  row("FR07-TC-020", "POST empty body", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: "{}" }),
  row("FR07-TC-021", "POST name empty string", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: '{"id":1,"name":"","price":100,"quantity":1}' }),
  row("FR07-TC-022", "POST quantity string", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: '{"id":1,"name":"X","price":100,"quantity":"abc"}' }),
  row("FR07-TC-023", "POST price string", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: '{"id":1,"name":"X","price":"abc","quantity":1}' }),
  row("FR07-TC-024", "Cart item price is number", "GET", "/api/cart", "fr07_price_number", { auth_mode: "cartFresh", pre_steps: step("POST", "/api/cart", CART(1)) }),
  row("FR07-TC-025", "Cart item quantity is number", "GET", "/api/cart", "fr07_qty_number", { auth_mode: "cartFresh", pre_steps: step("POST", "/api/cart", CART(1)) }),
  row("FR07-TC-026", "SQLi in product name", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: '{"id":1,"name":"1; DROP TABLE products--","price":100,"quantity":1}' }),
  row("FR07-TC-027", "XSS in name not reflected", "POST", "/api/cart", "fr07_xss", { auth_mode: "user", content_type: "application/json", body: '{"id":3,"name":"<script>alert(1)</script>","price":100,"quantity":1}' }),
  row("FR07-TC-028", "Duplicate product merges quantity", "GET", "/api/cart", "fr07_duplicate_merge", { auth_mode: "cartFresh", pre_steps: dupPre }),
  row("FR07-TC-029", "Add two different products", "POST", "/api/cart", "status_200", { auth_mode: "cartFresh", content_type: "application/json", body: '{"id":2,"name":"Samsung","price":28000000,"quantity":1}', pre_steps: step("POST", "/api/cart", CART(1)) }),
  row("FR07-TC-030", "PUT cart not allowed", "PUT", "/api/cart", "status_404_or_405", { auth_mode: "user", content_type: "application/json", body: "{}" }),
  row("FR07-TC-031", "DELETE cart not allowed", "DELETE", "/api/cart", "status_404_or_405", { auth_mode: "user" }),
  row("FR07-TC-032", "Response time", "GET", "/api/cart", "fr07_response_time", { auth_mode: "user" }),
  row("FR07-TC-033", "Cart isolated per user", "GET", "/api/cart", "status_200", { auth_mode: "user" }),
  row("FR07-TC-034", "POST oversized quantity", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: CART(999999) }),
  row("FR07-TC-035", "POST null fields", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: '{"id":null,"name":null,"price":null,"quantity":null}' }),
  row("FR07-TC-036", "GET after POST schema", "GET", "/api/cart", "fr07_schema_all_keys", { auth_mode: "cartFresh", pre_steps: step("POST", "/api/cart", CART(1)) }),
  row("FR07-TC-037", "POST id zero", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: '{"id":0,"name":"X","price":100,"quantity":1}' }),
  row("FR07-TC-038", "POST id negative", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: '{"id":-1,"name":"X","price":100,"quantity":1}' }),
  row("FR07-TC-039", "Rate limit SEC07", "GET", "/api/cart", "status_429", { auth_mode: "user" }),
  row("FR07-TC-040", "Array body rejected", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: '[{"id":1,"name":"X","price":100,"quantity":1}]' }),
  row("FR07-TC-EXT-001", "No validation quantity zero", "POST", "/api/cart", "status_400", { auth_mode: "cartFresh", content_type: "application/json", body: CART(0) }),
  row("FR07-TC-EXT-002", "Duplicate rows not merged", "GET", "/api/cart", "fr07_dup_at_most_one", { auth_mode: "cartFresh", pre_steps: dupPre }),
  row("FR07-TC-EXT-003", "push raw body unvalidated", "POST", "/api/cart", "status_400", { auth_mode: "user", content_type: "application/json", body: '{"id":1,"name":"Hack","price":-999,"quantity":0}' }),
  row("FR07-TC-EXT-004", "Cart persists in memory", "GET", "/api/cart", "fr07_cart_not_empty", { auth_mode: "user" }),
  row("FR07-TC-EXT-005", "Missing Authorization case sensitive", "GET", "/api/cart", "status_401_403", { auth_mode: "lowercase" }),
  row("FR07-TC-EXT-006", "Fresh user cart count after adds", "GET", "/api/cart", "fr07_multi_items", { auth_mode: "cartFresh", pre_steps: JSON.stringify([
    { method: "POST", path: "/api/cart", body: CART(1), auth_mode: "cartFresh", content_type: "application/json" },
    { method: "POST", path: "/api/cart", body: '{"id":2,"name":"Samsung","price":28000000,"quantity":1}', auth_mode: "cartFresh", content_type: "application/json" },
  ]) }),
];

buildAndWrite({
  name: "HW06_FR07_ShoppingCart",
  description: "FR07 Shopping Cart — spec-based assertions",
  setupItems: setup,
  rows,
  csvName: "fr07-shopping-cart-data.csv",
  collectionName: "HW06_FR07_ShoppingCart.postman_collection.json",
});
