#!/usr/bin/env python3
"""Draw agent-skill/diagram.png — self-designed architecture (HW06 §7)."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "agent-skill" / "diagram.png"

W, H = 1200, 720
BG = (248, 250, 252)
BOX = (255, 255, 255)
BORDER = (30, 64, 175)
TEXT = (15, 23, 42)
ARROW = (71, 85, 105)
ACCENT = (37, 99, 235)


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def box(draw, xy, wh, title, lines, fill=BOX):
    x, y = xy
    w, h = wh
    draw.rounded_rectangle([x, y, x + w, y + h], radius=12, fill=fill, outline=BORDER, width=2)
    draw.text((x + 14, y + 10), title, fill=ACCENT, font=font(15, True))
    ty = y + 36
    for line in lines:
        draw.text((x + 14, ty), line, fill=TEXT, font=font(12))
        ty += 18


def arrow(draw, x1, y1, x2, y2):
    draw.line([x1, y1, x2, y2], fill=ARROW, width=2)
    if x2 > x1:
        draw.polygon([(x2, y2), (x2 - 10, y2 - 5), (x2 - 10, y2 + 5)], fill=ARROW)
    elif y2 > y1:
        draw.polygon([(x2, y2), (x2 - 5, y2 - 10), (x2 + 5, y2 - 10)], fill=ARROW)


def main():
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw.text((40, 18), "HW06 — AI-Driven API Test Generator (23127273)", fill=TEXT, font=font(20, True))
    draw.text((40, 48), "Design: step-by-step prompts + mandatory human audit before Newman", fill=ARROW, font=font(13))

    box(draw, (40, 90), (220, 110), "INPUT", [
        "api_specification.md",
        "Endpoint + auth rules",
        "SEC01–SEC07 checklist",
    ])
    box(draw, (320, 90), (240, 130), "STEP 1–2 PARSE + DOMAIN", [
        "Extract params & schema",
        "Valid / invalid / boundary",
        "Email, price>0, required fields",
    ])
    box(draw, (620, 90), (240, 130), "STEP 3 STATE", [
        "Cart / order sequences",
        "Invalid transitions",
        "N/A for read-only FR06",
    ])
    box(draw, (920, 90), (240, 130), "STEP 4 SECURITY", [
        "SQLi, XSS, IDOR",
        "Role escalation (admin)",
        "Rate limit SEC07",
    ])

    for x in (260, 560, 860):
        arrow(draw, x, 145, x + 60, 145)

    box(draw, (180, 280), (280, 100), "STEP 5 SCHEMA", [
        "Response fields & types",
        "Required keys vs spec",
        "Content-Type / SLA",
    ])
    box(draw, (520, 280), (280, 100), "STEP 6 OUTPUT TABLE", [
        "≥35 TC rows per API",
        "Markdown for main-report",
        "Optional CSV for Newman",
    ])
    box(draw, (860, 280), (280, 100), "HUMAN AUDIT", [
        "VALID / INVALID / INCOMPLETE",
        "Fix test design only",
        "Never lower expectations",
    ])

    arrow(draw, 460, 330, 520, 330)
    arrow(draw, 800, 330, 860, 330)

    box(draw, (120, 450), (300, 120), "EXTEND (≥5 manual TCs)", [
        "Code review server.js gaps",
        "Role middleware missing",
        "In-memory cart merge rules",
    ], fill=(239, 246, 255))
    box(draw, (460, 450), (300, 120), "POSTMAN + NEWMAN", [
        "Data-driven CSV (-d)",
        "X-Student-Id pre-request",
        "[SPEC] assertions",
    ], fill=(239, 246, 255))
    box(draw, (800, 450), (300, 120), "BUG REPORT", [
        "FAIL = SUT defect",
        "GitHub Issues + SVG",
        "bugs/BUG_REPORT.md",
    ], fill=(239, 246, 255))

    arrow(draw, 420, 510, 460, 510)
    arrow(draw, 760, 510, 800, 510)
    arrow(draw, 270, 400, 270, 450)
    arrow(draw, 610, 380, 610, 450)
    arrow(draw, 1000, 380, 950, 450)

    draw.text((40, 640), "Reusable Agent Skills: api-test-generator-skill.md · api-bug-report-skill.md", fill=TEXT, font=font(12))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
