#!/usr/bin/env node
/** FR16 — all test data in postman/data/fr16-product-import-data.csv */
const { row, setupItem, buildAndWrite } = require("./lib/data-driven");

const JSON_H = [{ key: "Content-Type", value: "application/json" }];
const IMP = (name, price = 10000) => JSON.stringify({ products: [{ name, price, description: "d", imageUrl: "", category_id: 1 }] });
const LONG_NAME = "A".repeat(500);
const BULK10 = JSON.stringify({
  products: Array.from({ length: 10 }, (_, i) => ({ name: `Bulk${i}`, price: 1000 + i, category_id: 1 })),
});

const setup = [
  setupItem("Setup — Login admin", "POST", "/api/login", [
    "pm.test('Login admin', () => pm.response.to.have.status(200));",
    "pm.environment.set('adminToken', pm.response.json().token);",
  ], { headers: JSON_H, body: { mode: "raw", raw: '{"email":"admin@eshop.com","password":"Admin123!"}' } }),
  setupItem("Setup — Login test user", "POST", "/api/login", [
    "pm.test('Login user', () => pm.response.to.have.status(200));",
    "pm.environment.set('authToken', pm.response.json().token);",
  ], { headers: JSON_H, body: { mode: "raw", raw: '{"email":"test@eshop.com","password":"Test1234!"}' } }),
];

const rows = [
  row("FR16-TC-001", "No auth", "POST", "/api/admin/import-products", "status_401_403", { auth_mode: "none", content_type: "application/json", body: IMP("NoAuth") }),
  row("FR16-TC-002", "User token not admin", "POST", "/api/admin/import-products", "status_403", { auth_mode: "user", content_type: "application/json", body: IMP("UserImport") }),
  row("FR16-TC-003", "Admin valid import", "POST", "/api/admin/import-products", "fr16_s200_import_ok", { auth_mode: "admin", content_type: "application/json", body: IMP("ValidImport") }),
  row("FR16-TC-004", "Empty products array", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: '{"products":[]}' }),
  row("FR16-TC-005", "Missing products key", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: "{}" }),
  row("FR16-TC-006", "products not array", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: '{"products":"not-array"}' }),
  row("FR16-TC-007", "Missing product name", "POST", "/api/admin/import-products", "fr16_missing_name_ok", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"price":1000,"category_id":1}]}' }),
  row("FR16-TC-008", "Price zero rejected", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: IMP("ZeroPrice", 0) }),
  row("FR16-TC-009", "Price negative rejected", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: IMP("NegPrice", -100) }),
  row("FR16-TC-010", "Price non-numeric rejected", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"Bad","price":"abc","category_id":1}]}' }),
  row("FR16-TC-011", "Price missing rejected", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"NoPrice","category_id":1}]}' }),
  row("FR16-TC-012", "Empty name rejected", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"","price":1000,"category_id":1}]}' }),
  row("FR16-TC-013", "Partial failure rollback all", "POST", "/api/admin/import-products", "fr16_rollback", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"Good","price":1000,"category_id":1},{"price":500,"category_id":1}]}' }),
  row("FR16-TC-014", "Response schema fields", "POST", "/api/admin/import-products", "fr16_schema_fields", { auth_mode: "admin", content_type: "application/json", body: IMP("SchemaCheck") }),
  row("FR16-TC-015", "inserted matches count", "POST", "/api/admin/import-products", "fr16_inserted_1", { auth_mode: "admin", content_type: "application/json", body: IMP("CountCheck") }),
  row("FR16-TC-016", "Invalid token", "POST", "/api/admin/import-products", "status_403", { auth_mode: "garbage", content_type: "application/json", body: IMP("X") }),
  row("FR16-TC-017", "GET method not allowed", "GET", "/api/admin/import-products", "status_404_or_405", { auth_mode: "admin" }),
  row("FR16-TC-018", "PUT not allowed", "PUT", "/api/admin/import-products", "status_404_or_405", { auth_mode: "admin", content_type: "application/json", body: "{}" }),
  row("FR16-TC-019", "SQLi in product name", "POST", "/api/admin/import-products", "status_200_or_400", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"1;DROP TABLE products--","price":1000,"category_id":1}]}' }),
  row("FR16-TC-020", "XSS name not reflected", "POST", "/api/admin/import-products", "fr16_no_script", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"<script>x</script>","price":1000,"category_id":1}]}' }),
  row("FR16-TC-021", "category_id missing defaults valid", "POST", "/api/admin/import-products", "status_200", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"NoCat","price":1000}]}' }),
  row("FR16-TC-022", "category_id invalid", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"BadCat","price":1000,"category_id":99999}]}' }),
  row("FR16-TC-023", "Batch multiple valid", "POST", "/api/admin/import-products", "fr16_inserted_2", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"BatchA","price":1000,"category_id":1},{"name":"BatchB","price":2000,"category_id":2}]}' }),
  row("FR16-TC-024", "Null products", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: '{"products":null}' }),
  row("FR16-TC-025", "Empty object in array", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{}]}' }),
  row("FR16-TC-026", "Price float rejected", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"Float","price":10.5,"category_id":1}]}' }),
  row("FR16-TC-027", "Very long name", "POST", "/api/admin/import-products", "status_200_or_400", { auth_mode: "admin", content_type: "application/json", body: JSON.stringify({ products: [{ name: LONG_NAME, price: 1000, category_id: 1 }] }) }),
  row("FR16-TC-028", "Duplicate names in batch", "POST", "/api/admin/import-products", "status_200", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"Dup","price":1000,"category_id":1},{"name":"Dup","price":1000,"category_id":1}]}' }),
  row("FR16-TC-029", "Rate limit SEC07", "POST", "/api/admin/import-products", "status_429", { auth_mode: "admin", content_type: "application/json", body: IMP("Rate") }),
  row("FR16-TC-030", "Content-Type required", "POST", "/api/admin/import-products", "status_400_or_415", { auth_mode: "admin", body: "not-json" }),
  row("FR16-TC-031", "description optional", "POST", "/api/admin/import-products", "status_200", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"NoDesc","price":1000,"category_id":1}]}' }),
  row("FR16-TC-032", "imageUrl optional", "POST", "/api/admin/import-products", "status_200", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"NoImg","price":1000,"category_id":1}]}' }),
  row("FR16-TC-033", "Negative category_id", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"NegCat","price":1000,"category_id":-1}]}' }),
  row("FR16-TC-034", "Extra fields ignored", "POST", "/api/admin/import-products", "status_200", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"Extra","price":1000,"category_id":1,"foo":"bar"}]}' }),
  row("FR16-TC-035", "Admin role required explicit", "POST", "/api/admin/import-products", "status_403", { auth_mode: "user", content_type: "application/json", body: IMP("RoleCheck") }),
  row("FR16-TC-036", "Price string number", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"StrNum","price":"1000","category_id":1}]}' }),
  row("FR16-TC-037", "Empty array element", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: '{"products":[null]}' }),
  row("FR16-TC-038", "Response time", "POST", "/api/admin/import-products", "fr16_response_time", { auth_mode: "admin", content_type: "application/json", body: IMP("Perf") }),
  row("FR16-TC-039", "Name whitespace only", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"   ","price":1000,"category_id":1}]}' }),
  row("FR16-TC-040", "Large batch 10 items", "POST", "/api/admin/import-products", "fr16_inserted_10", { auth_mode: "admin", content_type: "application/json", body: BULK10 }),
  row("FR16-TC-EXT-001", "Role escalation user import", "POST", "/api/admin/import-products", "status_403", { auth_mode: "user", content_type: "application/json", body: IMP("Escalation") }),
  row("FR16-TC-EXT-002", "No price validation zero", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: IMP("ExtZero", 0) }),
  row("FR16-TC-EXT-003", "Partial insert no rollback", "POST", "/api/admin/import-products", "fr16_rollback", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"name":"Ok","price":1000,"category_id":1},{"name":"","price":1000,"category_id":1}]}' }),
  row("FR16-TC-EXT-004", "Missing name reject batch", "POST", "/api/admin/import-products", "fr16_rollback", { auth_mode: "admin", content_type: "application/json", body: '{"products":[{"price":1000,"category_id":1}]}' }),
  row("FR16-TC-EXT-005", "Negative price check", "POST", "/api/admin/import-products", "status_400", { auth_mode: "admin", content_type: "application/json", body: IMP("ExtNeg", -1) }),
  row("FR16-TC-EXT-006", "Admin middleware missing", "POST", "/api/admin/import-products", "status_403", { auth_mode: "user", content_type: "application/json", body: IMP("NoRoleCheck") }),
];

buildAndWrite({
  name: "HW06_FR16_ProductImportCSV",
  description: "FR16 Product Import CSV — spec-based assertions",
  setupItems: setup,
  rows,
  csvName: "fr16-product-import-data.csv",
  collectionName: "HW06_FR16_ProductImportCSV.postman_collection.json",
});
