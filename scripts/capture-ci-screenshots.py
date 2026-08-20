#!/usr/bin/env python3
"""Generate CI/CD evidence SVG from local Newman smoke runs."""
import html
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "ci-cd" / "screenshots"


def run(cmd):
    return subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)


def render(title, subtitle, body, path):
    lines = [title, subtitle, "─" * 56, body]
    flat = []
    for line in lines:
        flat.extend(line.split("\n"))
    lh, pad = 16, 20
    w, h = 960, pad * 2 + lh * len(flat)
    tspans, y = [], pad + 12
    for i, line in enumerate(flat):
        fill = "#78c8ff" if i == 0 else "#ffb464" if i == 1 else "#e0e0e0"
        tspans.append(f'<tspan x="{pad}" y="{y}" fill="{fill}">{html.escape(line)}</tspan>')
        y += lh
    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}">
  <rect width="100%" height="100%" fill="#181818"/>
  <text font-family="Menlo, Monaco, monospace" font-size="13">{''.join(tspans)}</text>
</svg>"""
    path.write_text(svg, encoding="utf-8")
    print("Wrote", path)


def newman_summary(profile):
    p = run(["bash", "scripts/ci-run-newman.sh", profile])
    tail = "\n".join((p.stdout + p.stderr).splitlines()[-25:])
    return tail, p.returncode


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    body, code = newman_summary("ci-smoke-pass")
    render(
        "GitHub Actions — Sample Run ALL PASSING",
        f"Profile: ci-smoke-pass | exit={code} | localhost:3000 | X-Student-Id: 23127273",
        body,
        OUT / "ci-all-passing.svg",
    )
    body, code = newman_summary("ci-smoke-one-fail")
    render(
        "GitHub Actions — Sample Run ONE FAILING",
        f"Profile: ci-smoke-one-fail | exit={code} | FR06-TC-005 expects 404",
        body,
        OUT / "ci-one-failing.svg",
    )


if __name__ == "__main__":
    main()
