#!/usr/bin/env python3
"""Capture FR16 API bug evidence as SVG."""
import html
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "bugs" / "screenshots"
BASE = "http://127.0.0.1:3000"
STUDENT = "23127273"


def token(email, password):
    raw = subprocess.check_output(
        [
            "curl", "-s", "-X", "POST", f"{BASE}/api/login",
            "-H", "Content-Type: application/json",
            "-H", f"X-Student-Id: {STUDENT}",
            "-d", json.dumps({"email": email, "password": password}),
        ],
        text=True,
    )
    return json.loads(raw)["token"]


def run_cmd(cmd):
    return subprocess.check_output(cmd, text=True)


BUGS = [
    {
        "id": "FR16-BUG-001",
        "slug": "user-role-escalation-import",
        "title": "POST /api/admin/import-products with user token",
        "note": "Expected: 403 Forbidden | Actual: 200 import succeeds",
        "cmd": lambda: [
            "curl", "-s", "-i", "-X", "POST", f"{BASE}/api/admin/import-products",
            "-H", "Content-Type: application/json",
            "-H", f"Authorization: Bearer {token('test@eshop.com', 'Test1234!')}",
            "-H", f"X-Student-Id: {STUDENT}",
            "-d", '{"products":[{"name":"EscalationBug","price":1000,"category_id":1}]}',
        ],
    },
    {
        "id": "FR16-BUG-002",
        "slug": "no-price-validation",
        "title": "Import accepts price=0",
        "note": "Expected: 400 | Actual: 200 inserted=1",
        "cmd": lambda: [
            "curl", "-s", "-i", "-X", "POST", f"{BASE}/api/admin/import-products",
            "-H", "Content-Type: application/json",
            "-H", f"Authorization: Bearer {token('admin@eshop.com', 'Admin123!')}",
            "-H", f"X-Student-Id: {STUDENT}",
            "-d", '{"products":[{"name":"ZeroPrice","price":0,"category_id":1}]}',
        ],
    },
    {
        "id": "FR16-BUG-003",
        "slug": "partial-import-no-rollback",
        "title": "Mixed batch partial insert",
        "note": "Expected: 400 all-or-nothing | Actual: 200 inserted=1 errors>0",
        "cmd": lambda: [
            "curl", "-s", "-i", "-X", "POST", f"{BASE}/api/admin/import-products",
            "-H", "Content-Type: application/json",
            "-H", f"Authorization: Bearer {token('admin@eshop.com', 'Admin123!')}",
            "-H", f"X-Student-Id: {STUDENT}",
            "-d", '{"products":[{"name":"OkRow","price":1000,"category_id":1},{"price":500,"category_id":1}]}',
        ],
    },
    {
        "id": "FR16-BUG-004",
        "slug": "invalid-category-accepted",
        "title": "Import category_id=99999 accepted",
        "note": "Expected: 400 FK violation | Actual: 200 inserted=1",
        "cmd": lambda: [
            "curl", "-s", "-i", "-X", "POST", f"{BASE}/api/admin/import-products",
            "-H", "Content-Type: application/json",
            "-H", f"Authorization: Bearer {token('admin@eshop.com', 'Admin123!')}",
            "-H", f"X-Student-Id: {STUDENT}",
            "-d", '{"products":[{"name":"BadCat","price":1000,"category_id":99999}]}',
        ],
    },
    {
        "id": "FR16-BUG-005",
        "slug": "no-rate-limit-sec07",
        "title": "POST import — no rate limiting",
        "note": "Expected: 429 | Actual: 200",
        "multi": lambda: [
            [
                "curl", "-s", "-o", "/dev/null", "-w", f"req{i} HTTP:%{{http_code}}\n",
                f"{BASE}/api/admin/import-products",
                "-H", "Content-Type: application/json",
                "-H", f"Authorization: Bearer {token('admin@eshop.com', 'Admin123!')}",
                "-H", f"X-Student-Id: {STUDENT}",
                "-d", '{"products":[{"name":"Rate' + str(i) + '","price":1000,"category_id":1}]}',
            ]
            for i in range(1, 4)
        ],
    },
    {
        "id": "FR16-BUG-006",
        "slug": "malformed-body-500",
        "title": "Non-JSON body returns 500",
        "note": "Expected: 400/415 | Actual: 500 Internal Server Error",
        "cmd": lambda: [
            "curl", "-s", "-i", "-X", "POST", f"{BASE}/api/admin/import-products",
            "-H", f"Authorization: Bearer {token('admin@eshop.com', 'Admin123!')}",
            "-H", f"X-Student-Id: {STUDENT}",
            "-d", "not-json",
        ],
    },
]


def body_for(bug):
    if bug.get("multi"):
        return "\n\n".join(run_cmd(c).strip() for c in bug["multi"]())
    return run_cmd(bug["cmd"]())


def render_svg(bug, body, out_path):
    lines = [f"{bug['id']} — {bug['title']}", bug["note"], "─" * 56, body[:2800]]
    flat = []
    for line in lines:
        flat.extend(line.split("\n"))
    line_h, pad = 16, 20
    w, h = 960, pad * 2 + line_h * len(flat)
    tspans, y = [], pad + 12
    for i, line in enumerate(flat):
        fill = "#78c8ff" if i == 0 else "#ffb464" if i == 1 else "#e0e0e0"
        tspans.append(f'<tspan x="{pad}" y="{y}" fill="{fill}">{html.escape(line)}</tspan>')
        y += line_h
    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}">
  <rect width="100%" height="100%" fill="#181818"/>
  <text font-family="Menlo, Monaco, monospace" font-size="13">{''.join(tspans)}</text>
</svg>"""
    out_path.write_text(svg, encoding="utf-8")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for bug in BUGS:
        out = OUT / f"{bug['id']}-{bug['slug']}.svg"
        render_svg(bug, body_for(bug), out)
        print("Wrote", out)


if __name__ == "__main__":
    main()
