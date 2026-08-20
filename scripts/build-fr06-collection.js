#!/usr/bin/env node
/** FR06 — all test data in postman/data/fr06-product-detail-data.csv */
const { row, setupItem, buildAndWrite } = require("./lib/data-driven");

const JSON_H = [{ key: "Content-Type", value: "application/json" }];
const PUT_BODY = '{"name":"Keychron Q1","price":4000000,"description":"test","imageUrl":"http://x","category_id":3}';

const setup = [
  setupItem("Setup — Login test user", "POST", "/api/login", [
    "pm.test('Login test user', () => pm.response.to.have.status(200));",
    "pm.environment.set('authToken', pm.response.json().token);",
  ], { headers: JSON_H, body: { mode: "raw", raw: '{"email":"test@eshop.com","password":"Test1234!"}' } }),
  setupItem("Setup — Login admin", "POST", "/api/login", [
    "pm.test('Login admin', () => pm.response.to.have.status(200));",
    "pm.environment.set('adminToken', pm.response.json().token);",
  ], { headers: JSON_H, body: { mode: "raw", raw: '{"email":"admin@eshop.com","password":"Admin123!"}' } }),
];

const rows = [
  row("FR06-TC-001", "Valid product odd ID", "GET", "/api/products/1", "fr06_s200_schema_full"),
  row("FR06-TC-002", "Valid product even ID", "GET", "/api/products/2", "fr06_s200_price_num"),
  row("FR06-TC-003", "Valid last seeded product", "GET", "/api/products/5", "fr06_s200_keychron"),
  row("FR06-TC-004", "Valid category 2", "GET", "/api/products/3", "fr06_s200_cat2"),
  row("FR06-TC-005", "Non-existent ID", "GET", "/api/products/99999", "status_404"),
  row("FR06-TC-006", "ID zero", "GET", "/api/products/0", "status_404"),
  row("FR06-TC-007", "Negative ID", "GET", "/api/products/-1", "status_400"),
  row("FR06-TC-008", "Non-numeric ID", "GET", "/api/products/abc", "status_400"),
  row("FR06-TC-009", "Decimal ID", "GET", "/api/products/1.5", "status_400"),
  row("FR06-TC-010", "Very large non-existent ID", "GET", "/api/products/2147483647", "status_404"),
  row("FR06-TC-011", "Empty ID segment (detail)", "GET", "/api/products/", "fr06_detail_not_array"),
  row("FR06-TC-012", "Leading-zero ID invalid format", "GET", "/api/products/01", "status_400"),
  row("FR06-TC-013", "Schema id field", "GET", "/api/products/1", "fr06_schema_id"),
  row("FR06-TC-014", "Schema name string", "GET", "/api/products/1", "fr06_schema_name"),
  row("FR06-TC-015", "Schema price number", "GET", "/api/products/1", "fr06_s200_price_num"),
  row("FR06-TC-016", "Schema description", "GET", "/api/products/1", "fr06_schema_desc"),
  row("FR06-TC-017", "Schema imageUrl", "GET", "/api/products/1", "fr06_schema_img"),
  row("FR06-TC-018", "Schema category_id", "GET", "/api/products/1", "fr06_schema_cat"),
  row("FR06-TC-019", "No extra top-level keys", "GET", "/api/products/1", "fr06_schema_keys"),
  row("FR06-TC-020", "Missing product error response", "GET", "/api/products/88888", "status_404"),
  row("FR06-TC-021", "Public read without Authorization", "GET", "/api/products/1", "fr06_public_200", { auth_mode: "none" }),
  row("FR06-TC-022", "Invalid Bearer on public read", "GET", "/api/products/1", "fr06_public_200", { auth_mode: "invalid_garbage" }),
  row("FR06-TC-023", "SQLi OR 1=1 rejected", "GET", "/api/products/1'%20OR%20'1'='1", "fr06_sqli_reject"),
  row("FR06-TC-024", "SQLi DROP rejected + DB intact", "GET", "/api/products/1%3BDROP%20TABLE%20products--", "fr06_sqli_db_intact"),
  row("FR06-TC-025", "XSS path rejected", "GET", "/api/products/%3Cscript%3Ealert(1)%3C/script%3E", "fr06_xss_reject"),
  row("FR06-TC-026", "Public catalog with user token", "GET", "/api/products/1", "fr06_public_200", { auth_mode: "user" }),
  row("FR06-TC-027", "Public read without admin role", "GET", "/api/products/1", "status_200", { auth_mode: "inherit" }),
  row("FR06-TC-028", "POST not allowed on detail URL", "POST", "/api/products/1", "status_404_or_405", { auth_mode: "none", content_type: "application/json", body: "{}" }),
  row("FR06-TC-029", "PUT without auth rejected", "PUT", "/api/products/5", "status_401_403", { auth_mode: "none", content_type: "application/json", body: PUT_BODY }),
  row("FR06-TC-030", "DELETE without auth rejected", "DELETE", "/api/products/99997", "status_401_403", { auth_mode: "none" }),
  row("FR06-TC-031", "Content-Type JSON", "GET", "/api/products/1", "fr06_content_type"),
  row("FR06-TC-032", "Response time SLA", "GET", "/api/products/1", "fr06_response_time"),
  row("FR06-TC-033", "Idempotent read pass 1", "GET", "/api/products/1", "fr06_idempotent_p1"),
  row("FR06-TC-033", "Idempotent read pass 2", "GET", "/api/products/1", "fr06_idempotent_p2"),
  row("FR06-TC-034", "Unicode id rejected", "GET", "/api/products/%E4%B8%AD", "status_400"),
  row("FR06-TC-035", "Whitespace-padded id rejected", "GET", "/api/products/%2001%20", "status_400"),
  row("FR06-TC-036", "Null byte id rejected", "GET", "/api/products/1%00", "status_400"),
  row("FR06-TC-037", "Float id rejected", "GET", "/api/products/2.0", "status_404"),
  row("FR06-TC-038", "List then detail integration", "GET", "/api/products", "fr06_chain_list_detail"),
  row("FR06-TC-039", "CORS preflight OPTIONS", "OPTIONS", "/api/products/1", "status_204", { extra_headers: JSON.stringify({ Origin: "http://localhost:5173" }) }),
  row("FR06-TC-040", "Rate limit (SEC07)", "GET", "/api/products/1", "status_429"),
  row("FR06-TC-EXT-001", "Even ID price must be number", "GET", "/api/products/2", "fr06_s200_price_num"),
  row("FR06-TC-EXT-002", "Missing ID must 404", "GET", "/api/products/77777", "status_404"),
  row("FR06-TC-EXT-003", "Trailing slash must not return list", "GET", "/api/products/", "fr06_not_array_only"),
  row("FR06-TC-EXT-004", "Leading-zero ID rejected", "GET", "/api/products/01", "status_400"),
  row("FR06-TC-EXT-005", "Public read with garbage Bearer", "GET", "/api/products/1", "status_200", { auth_mode: "garbage" }),
  row("FR06-TC-EXT-006", "Schema parity id=1", "GET", "/api/products/1", "fr06_parity_p1"),
  row("FR06-TC-EXT-006", "Schema parity id=2", "GET", "/api/products/2", "fr06_parity_p2"),
];

buildAndWrite({
  name: "HW06_FR06_ProductDetail",
  description: "FR06 Product Detail — spec-based assertions",
  setupItems: setup,
  rows,
  csvName: "fr06-product-detail-data.csv",
  collectionName: "HW06_FR06_ProductDetail.postman_collection.json",
});
