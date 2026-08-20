#!/usr/bin/env python3
"""Capture FR07 API bug evidence as SVG."""
import html
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "bugs" / "screenshots"
BASE = "http://127.0.0.1:3000"
STUDENT = "23127273"


def login(email="test@eshop.com", password="Test1234!"):
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
        "id": "FR07-BUG-001",
        "slug": "no-cart-input-validation",
        "title": "POST /api/cart accepts invalid body (quantity=0)",
        "note": "Expected: 400 Bad Request | Actual: 200 Added to cart",
        "setup": login,
        "cmd": lambda tok: [
            "curl", "-s", "-i", "-X", "POST", f"{BASE}/api/cart",
            "-H", "Content-Type: application/json",
            "-H", f"Authorization: Bearer {tok}",
            "-H", f"X-Student-Id: {STUDENT}",
            "-d", '{"id":1,"name":"X","price":100,"quantity":0}',
        ],
    },
    {
        "id": "FR07-BUG-002",
        "slug": "duplicate-rows-not-merged",
        "title": "POST /api/cart duplicate product_id",
        "note": "Expected: 1 row qty=2 | Actual: multiple rows same id",
        "setup": login,
        "multi": lambda tok: [
            [
                "curl", "-s", "-X", "POST", f"{BASE}/api/cart",
                "-H", "Content-Type: application/json",
                "-H", f"Authorization: Bearer {tok}",
                "-H", f"X-Student-Id: {STUDENT}",
                "-d", '{"id":99,"name":"Dup","price":100,"quantity":1}',
            ],
            [
                "curl", "-s", "-X", "POST", f"{BASE}/api/cart",
                "-H", "Content-Type: application/json",
                "-H", f"Authorization: Bearer {tok}",
                "-H", f"X-Student-Id: {STUDENT}",
                "-d", '{"id":99,"name":"Dup","price":100,"quantity":1}',
            ],
            [
                "curl", "-s", f"{BASE}/api/cart",
                "-H", f"Authorization: Bearer {tok}",
                "-H", f"X-Student-Id: {STUDENT}",
            ],
        ],
    },
    {
        "id": "FR07-BUG-003",
        "slug": "no-rate-limit-sec07",
        "title": "GET /api/cart — no rate limiting (SEC07)",
        "note": "Expected: 429 after abuse | Actual: all 200",
        "setup": login,
        "multi": lambda tok: [
            [
                "curl", "-s", "-o", "/dev/null", "-w", f"req{i} HTTP:%{{http_code}}\n",
                f"{BASE}/api/cart",
                "-H", f"Authorization: Bearer {tok}",
                "-H", f"X-Student-Id: {STUDENT}",
            ]
            for i in range(1, 4)
        ],
    },
]


def body_for(bug):
    tok = bug["setup"]()
    if bug.get("multi"):
        parts = []
        for cmd in bug["multi"](tok):
            parts.append(run_cmd(cmd).strip())
        return "\n\n".join(parts)
    return run_cmd(bug["cmd"](tok))


def render_svg(bug, body, out_path):
    lines = [f"{bug['id']} — {bug['title']}", bug["note"], "─" * 56, body[:2800]]
    flat = []
    for line in lines:
        flat.extend(line.split("\n"))
    line_h = 16
    pad = 20
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
