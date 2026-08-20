# Execution evidence — HW06 (anti-cheat §11)

All Newman runs target `http://127.0.0.1:3000`. Header `X-Student-Id: 23127273` is set in each collection pre-request script.

| API | Console log | HTML report |
|---|---|---|
| FR06 Product Detail | [`../newman/fr06-console.txt`](../newman/fr06-console.txt) | [`../newman/fr06-report.html`](../newman/fr06-report.html) |
| FR07 Shopping Cart | [`../newman/fr07-console.txt`](../newman/fr07-console.txt) | [`../newman/fr07-report.html`](../newman/fr07-report.html) |
| FR16 Product Import | [`../newman/fr16-console.txt`](../newman/fr16-console.txt) | [`../newman/fr16-report.html`](../newman/fr16-report.html) |

Search any console log for `X-Student-Id: 23127273` and `127.0.0.1:3000`.

**Postman GUI screenshot:** optional — Collection Runner with CSV attached if TA requires GUI evidence.

**CI evidence:** GitHub Actions logs show the same hostname and header grep step in [workflow run #32330085948](https://github.com/minhtrile293/Software-Testing-HW06/actions/runs/32330085948).
