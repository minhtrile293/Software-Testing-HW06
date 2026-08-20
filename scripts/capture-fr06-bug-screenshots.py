#!/usr/bin/env python3
"""Capture FR06 API bug evidence as SVG (no external deps)."""
import html
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "bugs" / "screenshots"
BASE = "http://127.0.0.1:3000"
STUDENT = "23127273"

BUGS = [
    {
        "id": "FR06-BUG-001",
        "slug": "silent-not-found-200-empty",
        "title": "GET /api/products/99999",
        "cmd": ["curl", "-s", "-i", f"{BASE}/api/products/99999", "-H", f"X-Student-Id: {STUDENT}"],
        "note": "Expected: 404 Not Found | Actual: 200 OK + {}",
    },
    {
        "id": "FR06-BUG-002",
        "slug": "price-type-parity",
        "title": "GET /api/products/1 vs /api/products/2",
        "multi": [
            ["curl", "-s", f"{BASE}/api/products/1", "-H", f"X-Student-Id: {STUDENT}"],
            ["curl", "-s", f"{BASE}/api/products/2", "-H", f"X-Student-Id: {STUDENT}"],
        ],
        "note": "Expected: price always number | Actual: odd=number, even=string",
    },
    {
        "id": "FR06-BUG-003",
        "slug": "unauthenticated-put",
        "title": "PUT /api/products/5 (no Authorization)",
        "cmd": [
            "curl", "-s", "-i", "-X", "PUT", f"{BASE}/api/products/5",
            "-H", "Content-Type: application/json",
            "-H", f"X-Student-Id: {STUDENT}",
            "-d", '{"name":"Keychron Q1","price":4000000,"description":"test","imageUrl":"http://x","category_id":3}',
        ],
        "note": "Expected: 401/403 | Actual: 200 Product updated",
    },
    {
        "id": "FR06-BUG-004",
        "slug": "unauthenticated-delete",
        "title": "DELETE /api/products/99997 (no Authorization)",
        "cmd": [
            "curl", "-s", "-i", "-X", "DELETE", f"{BASE}/api/products/99997",
            "-H", f"X-Student-Id: {STUDENT}",
        ],
        "note": "Expected: 401/403 | Actual: 200 Product deleted",
    },
    {
        "id": "FR06-BUG-005",
        "slug": "trailing-slash-list",
        "title": "GET /api/products/ (trailing slash)",
        "cmd": ["curl", "-s", "-i", f"{BASE}/api/products/", "-H", f"X-Student-Id: {STUDENT}"],
        "note": "Expected: detail 404 | Actual: 200 JSON array (list route)",
    },
    {
        "id": "FR06-BUG-006",
        "slug": "no-rate-limit-sec07",
        "title": "GET /api/products/1 burst (SEC07)",
        "cmd": None,
        "note": "Expected: 429 after abuse | Actual: all 200 (no rate limiting)",
        "multi": [
            ["curl", "-s", "-o", "/dev/null", "-w", "req1 HTTP:%{http_code}\n", f"{BASE}/api/products/1", "-H", f"X-Student-Id: {STUDENT}"],
            ["curl", "-s", "-o", "/dev/null", "-w", "req2 HTTP:%{http_code}\n", f"{BASE}/api/products/1", "-H", f"X-Student-Id: {STUDENT}"],
            ["curl", "-s", "-o", "/dev/null", "-w", "req3 HTTP:%{http_code}\n", f"{BASE}/api/products/1", "-H", f"X-Student-Id: {STUDENT}"],
        ],
    },
]


def run_cmd(cmd):
    return subprocess.check_output(cmd, text=True)


def body_for(bug):
    if bug.get("multi"):
        parts = []
        for i, cmd in enumerate(bug["multi"], 1):
            raw = run_cmd(cmd)
            if bug["id"] == "FR06-BUG-002":
                j = json.loads(raw)
                parts.append(f"Request {i}: {' '.join(cmd[2:4])}")
                parts.append(json.dumps(j, ensure_ascii=False, indent=2))
                parts.append(f"typeof price = {type(j.get('price')).__name__}")
            else:
                parts.append(raw.strip())
        return "\n\n".join(parts)
    return run_cmd(bug["cmd"])


def render_svg(bug, body, out_path):
    lines = [f"{bug['id']} — {bug['title']}", bug["note"], "─" * 56, body[:2800]]
    flat = []
    for line in lines:
        flat.extend(line.split("\n"))

    line_h = 16
    pad = 20
    w = 960
    h = pad * 2 + line_h * len(flat)
    tspans = []
    y = pad + 12
    for i, line in enumerate(flat):
        fill = "#78c8ff" if i == 0 else "#ffb464" if i == 1 else "#e0e0e0"
        safe = html.escape(line)
        tspans.append(f'<tspan x="{pad}" y="{y}" fill="{fill}">{safe}</tspan>')
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
        body = body_for(bug)
        out = OUT / f"{bug['id']}-{bug['slug']}.svg"
        render_svg(bug, body, out)
        print("Wrote", out)


if __name__ == "__main__":
    main()
