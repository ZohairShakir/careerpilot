#!/usr/bin/env python3
"""Generate the CareerPilot Planner Series as branded, fillable A4 PDFs."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Iterable

from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
OUTPUT.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = A4
MARGIN_X = 18 * mm
TOP = PAGE_H - 18 * mm
BOTTOM = 16 * mm

IVORY = HexColor("#F6F1E8")
PAPER = HexColor("#FBFAF7")
GREEN = HexColor("#365846")
DEEP = HexColor("#17382B")
INK = HexColor("#171916")
MUTED = HexColor("#676A64")
LINE = HexColor("#CDD6CF")
PALE = HexColor("#E8EEE9")
SAGE = HexColor("#B9C9BD")
WARM = HexColor("#E9DDD0")
CORAL = HexColor("#B8664F")
WHITE_70 = Color(1, 1, 1, alpha=0.70)

FONT_DIR = Path("/System/Library/Fonts/Supplemental")
pdfmetrics.registerFont(TTFont("Georgia", str(FONT_DIR / "Georgia.ttf")))
pdfmetrics.registerFont(TTFont("Georgia-Italic", str(FONT_DIR / "Georgia Italic.ttf")))
pdfmetrics.registerFont(TTFont("Georgia-Bold", str(FONT_DIR / "Georgia Bold.ttf")))
pdfmetrics.registerFont(TTFont("Arial", str(FONT_DIR / "Arial.ttf")))
pdfmetrics.registerFont(TTFont("Arial-Bold", str(FONT_DIR / "Arial Bold.ttf")))


def safe_name(value: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_]+", "_", value).strip("_").lower()


def wrap_lines(text: str, font: str, size: float, width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if not current or pdfmetrics.stringWidth(candidate, font, size) <= width:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


class PlannerPDF:
    def __init__(self, filename: str, title: str, short_title: str, volume: str):
        self.path = OUTPUT / filename
        self.title = title
        self.short_title = short_title
        self.volume = volume
        self.page = 0
        self.field_counter = 0
        self.c = canvas.Canvas(str(self.path), pagesize=A4, pageCompression=1)
        self.c.setTitle(title)
        self.c.setAuthor("CareerPilot")
        self.c.setSubject("Career planning and professional development")
        self.c.setCreator("CareerPilot Planner Series")

    def next_field(self, label: str) -> str:
        self.field_counter += 1
        return f"{safe_name(self.short_title)}_{self.field_counter:03d}_{safe_name(label)[:36]}"

    def background(self, color=PAPER) -> None:
        self.c.setFillColor(color)
        self.c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)

    def finish_page(self) -> None:
        self.c.showPage()
        self.page += 1

    def footer(self, page_label: str | None = None) -> None:
        y = 9 * mm
        self.c.setStrokeColor(LINE)
        self.c.setLineWidth(0.5)
        self.c.line(MARGIN_X, y + 5 * mm, PAGE_W - MARGIN_X, y + 5 * mm)
        self.c.setFont("Arial-Bold", 7)
        self.c.setFillColor(GREEN)
        self.c.drawString(MARGIN_X, y, "CAREERPILOT")
        self.c.setFont("Arial", 7)
        self.c.setFillColor(MUTED)
        self.c.drawString(MARGIN_X + 26 * mm, y, self.short_title)
        self.c.drawRightString(PAGE_W - MARGIN_X, y, page_label or f"Page {self.page + 1}")

    def cover(self, subtitle: str, promise: str, accent: str) -> None:
        self.background(DEEP)
        self.c.setStrokeColor(Color(1, 1, 1, alpha=0.45))
        self.c.setLineWidth(0.7)
        self.c.line(MARGIN_X, TOP - 5 * mm, PAGE_W - MARGIN_X, TOP - 5 * mm)
        self.c.setFillColor(white)
        self.c.setFont("Georgia", 23)
        self.c.drawString(MARGIN_X, TOP, "career pilot")
        self.c.setFont("Arial-Bold", 8)
        self.c.setFillColor(WHITE_70)
        self.c.drawRightString(PAGE_W - MARGIN_X, TOP, f"PLANNER SERIES  /  {self.volume}")

        # Editorial orbit motif.
        cx, cy = PAGE_W - 46 * mm, PAGE_H - 72 * mm
        self.c.setStrokeColor(Color(1, 1, 1, alpha=0.18))
        self.c.setLineWidth(0.7)
        for radius in (19, 27, 35):
            self.c.circle(cx, cy, radius * mm, stroke=1, fill=0)
        self.c.setFillColor(HexColor(accent))
        self.c.circle(cx + 19 * mm, cy + 3 * mm, 3.2 * mm, stroke=0, fill=1)

        title_y = PAGE_H - 128 * mm
        self.c.setFillColor(white)
        lines = wrap_lines(self.title, "Georgia", 42, PAGE_W - 2 * MARGIN_X)
        for line in lines:
            self.c.setFont("Georgia", 42)
            self.c.drawString(MARGIN_X, title_y, line)
            title_y -= 15 * mm
        self.c.setFont("Georgia-Italic", 19)
        self.c.setFillColor(HexColor(accent))
        self.c.drawString(MARGIN_X, title_y - 1 * mm, subtitle)

        self.c.setFillColor(WHITE_70)
        self.c.setFont("Arial", 10)
        promise_lines = wrap_lines(promise, "Arial", 10, 112 * mm)
        py = title_y - 19 * mm
        for line in promise_lines:
            self.c.drawString(MARGIN_X, py, line)
            py -= 5 * mm

        box_y = 25 * mm
        self.c.setFillColor(Color(1, 1, 1, alpha=0.08))
        self.c.roundRect(MARGIN_X, box_y, PAGE_W - 2 * MARGIN_X, 22 * mm, 4 * mm, stroke=0, fill=1)
        self.c.setFillColor(WHITE_70)
        self.c.setFont("Arial-Bold", 7.5)
        self.c.drawString(MARGIN_X + 7 * mm, box_y + 13 * mm, "PRINTABLE + DIGITALLY FILLABLE")
        self.c.setFont("Arial", 8)
        self.c.drawString(MARGIN_X + 7 * mm, box_y + 7 * mm, "A4 format  /  Undated  /  Reusable")
        self.finish_page()

    def page_header(self, kicker: str, title: str, intro: str | None = None) -> float:
        self.background()
        self.c.setFont("Arial-Bold", 7.5)
        self.c.setFillColor(CORAL)
        self.c.drawString(MARGIN_X, TOP, kicker.upper())
        self.c.setFont("Arial-Bold", 7.5)
        self.c.setFillColor(MUTED)
        self.c.drawRightString(PAGE_W - MARGIN_X, TOP, self.volume)
        self.c.setStrokeColor(LINE)
        self.c.line(MARGIN_X, TOP - 5 * mm, PAGE_W - MARGIN_X, TOP - 5 * mm)
        y = TOP - 18 * mm
        self.c.setFont("Georgia", 27)
        self.c.setFillColor(GREEN)
        for line in wrap_lines(title, "Georgia", 27, PAGE_W - 2 * MARGIN_X):
            self.c.drawString(MARGIN_X, y, line)
            y -= 10 * mm
        if intro:
            y -= 1 * mm
            self.c.setFont("Arial", 9)
            self.c.setFillColor(MUTED)
            for line in wrap_lines(intro, "Arial", 9, PAGE_W - 2 * MARGIN_X):
                self.c.drawString(MARGIN_X, y, line)
                y -= 4.6 * mm
        return y - 5 * mm

    def section_label(self, text: str, x: float, y: float, width: float, right: str | None = None) -> float:
        self.c.setFillColor(GREEN)
        self.c.roundRect(x, y - 11 * mm, width, 11 * mm, 3 * mm, stroke=0, fill=1)
        self.c.setFillColor(white)
        self.c.setFont("Arial-Bold", 7.5)
        self.c.drawString(x + 4 * mm, y - 7.2 * mm, text.upper())
        if right:
            self.c.setFont("Arial", 7.5)
            self.c.drawRightString(x + width - 4 * mm, y - 7.2 * mm, right)
        return y - 15 * mm

    def paragraph(self, text: str, x: float, y: float, width: float, size: float = 9, color=INK, leading: float = 4.5) -> float:
        self.c.setFillColor(color)
        self.c.setFont("Arial", size)
        for line in wrap_lines(text, "Arial", size, width):
            self.c.drawString(x, y, line)
            y -= leading * mm
        return y

    def bullets(self, items: Iterable[str], x: float, y: float, width: float, size: float = 8.5, gap: float = 2.0) -> float:
        for item in items:
            lines = wrap_lines(item, "Arial", size, width - 6 * mm)
            self.c.setFillColor(GREEN)
            self.c.circle(x + 1.2 * mm, y + 1.2 * mm, 0.8 * mm, stroke=0, fill=1)
            self.c.setFillColor(INK)
            self.c.setFont("Arial", size)
            for line in lines:
                self.c.drawString(x + 5 * mm, y, line)
                y -= 4.2 * mm
            y -= gap * mm
        return y

    def text_field(self, label: str, x: float, y_top: float, width: float, height: float, hint: str | None = None, name: str | None = None) -> float:
        self.c.setFillColor(INK)
        self.c.setFont("Arial-Bold", 7.5)
        self.c.drawString(x, y_top, label.upper())
        if hint:
            self.c.setFont("Arial", 7.3)
            self.c.setFillColor(MUTED)
            self.c.drawRightString(x + width, y_top, hint)
        y = y_top - height - 4 * mm
        self.c.setFillColor(white)
        self.c.setStrokeColor(LINE)
        self.c.setLineWidth(0.6)
        self.c.roundRect(x, y, width, height, 2.5 * mm, stroke=1, fill=1)
        self.c.acroForm.textfield(
            name=name or self.next_field(label),
            tooltip=label,
            x=x + 3 * mm,
            y=y + 2.5 * mm,
            width=width - 6 * mm,
            height=height - 5 * mm,
            borderWidth=0,
            fillColor=white,
            textColor=INK,
            fontName="Helvetica",
            fontSize=8.5,
            fieldFlags="multiline",
            forceBorder=False,
        )
        return y - 6 * mm

    def line_field(self, label: str, x: float, y_top: float, width: float, name: str | None = None) -> float:
        self.c.setFillColor(MUTED)
        self.c.setFont("Arial-Bold", 7)
        self.c.drawString(x, y_top, label.upper())
        y = y_top - 8 * mm
        self.c.setStrokeColor(LINE)
        self.c.line(x, y, x + width, y)
        self.c.acroForm.textfield(
            name=name or self.next_field(label), tooltip=label, x=x, y=y + 1 * mm,
            width=width, height=6 * mm, borderWidth=0, fillColor=PAPER,
            textColor=INK, fontName="Helvetica", fontSize=8.5, forceBorder=False,
        )
        return y - 5 * mm

    def checkbox(self, label: str, x: float, y: float, name: str | None = None, size: float = 4.2 * mm) -> None:
        self.c.acroForm.checkbox(
            name=name or self.next_field(label), tooltip=label, x=x, y=y - 1 * mm,
            size=size, buttonStyle="check", borderWidth=0.7, borderColor=GREEN,
            fillColor=white, textColor=GREEN, forceBorder=True,
        )
        self.c.setFillColor(INK)
        self.c.setFont("Arial", 8)
        self.c.drawString(x + size + 2.5 * mm, y, label)

    def stat_box(self, value: str, label: str, x: float, y: float, width: float, accent=GREEN) -> None:
        self.c.setFillColor(white)
        self.c.setStrokeColor(LINE)
        self.c.roundRect(x, y, width, 22 * mm, 3 * mm, stroke=1, fill=1)
        self.c.setFillColor(accent)
        self.c.setFont("Georgia", 18)
        self.c.drawString(x + 5 * mm, y + 11 * mm, value)
        self.c.setFillColor(MUTED)
        self.c.setFont("Arial-Bold", 6.5)
        self.c.drawString(x + 5 * mm, y + 5 * mm, label.upper())

    def info_page(self, title: str, subtitle: str, rules: list[tuple[str, str]], outcome: list[str]) -> None:
        y = self.page_header("Read this first", title, subtitle)
        self.c.setFillColor(PALE)
        self.c.roundRect(MARGIN_X, y - 33 * mm, PAGE_W - 2 * MARGIN_X, 33 * mm, 4 * mm, stroke=0, fill=1)
        bx = MARGIN_X + 6 * mm
        by = y - 9 * mm
        column_width = (PAGE_W - 2 * MARGIN_X - 12 * mm) / len(rules)
        for number, (heading, body) in enumerate(rules, 1):
            self.c.setFillColor(GREEN)
            self.c.setFont("Georgia", 15)
            self.c.drawString(bx, by, f"0{number}")
            self.c.setFont("Arial-Bold", 8)
            self.c.drawString(bx + 13 * mm, by + 1 * mm, heading.upper())
            self.c.setFillColor(MUTED)
            self.c.setFont("Arial", 7.2)
            body_y = by - 3.5 * mm
            for line in wrap_lines(body, "Arial", 7.2, column_width - 15 * mm):
                self.c.drawString(bx + 13 * mm, body_y, line)
                body_y -= 3.5 * mm
            bx += column_width
        y -= 46 * mm
        y = self.section_label("What this planner helps you build", MARGIN_X, y, PAGE_W - 2 * MARGIN_X)
        y = self.bullets(outcome, MARGIN_X + 3 * mm, y - 1 * mm, PAGE_W - 2 * MARGIN_X - 6 * mm, 9, 2.4)
        y -= 4 * mm
        y = self.section_label("Your commitment", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, "Write it down")
        self.text_field("What I want to be different when I finish", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 30 * mm)
        self.footer()
        self.finish_page()

    def notes_page(self, kicker: str, title: str, prompt: str) -> None:
        y = self.page_header(kicker, title, prompt)
        self.text_field("Notes", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 167 * mm)
        self.footer()
        self.finish_page()

    def save(self) -> Path:
        self.c.save()
        return self.path


def build_daily() -> Path:
    p = PlannerPDF("careerpilot-daily-job-search-planner.pdf", "Daily Job Search Planner", "Daily Job Search Planner", "VOL. 01")
    p.cover("A calmer, more intentional search.", "Plan the work that matters, protect your energy, and finish each day knowing what moved forward.", "#D8A87A")
    p.info_page(
        "Make progress without living on job boards.",
        "Use one daily sheet per focused workday. The planner separates high-value work from activity that only feels productive.",
        [("Choose", "One outcome before opening a job board."), ("Execute", "Three focused blocks, not an endless list."), ("Close", "Log progress, then stop for the day.")],
        ["A clear target for every work session", "A balanced mix of applications, outreach, follow-up, and skill-building", "A visible record of evidence and progress", "A healthier end-of-day shutdown routine"],
    )
    y = p.page_header("Set your direction", "My job-search compass", "Complete this once, then revisit it whenever your search starts to feel scattered.")
    half = (PAGE_W - 2 * MARGIN_X - 6 * mm) / 2
    y1 = p.line_field("Primary role", MARGIN_X, y, half)
    p.line_field("Location / work preference", MARGIN_X + half + 6 * mm, y, half)
    y = min(y1, y) - 4 * mm
    y = p.text_field("What I want from my next role", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 29 * mm, "Work, growth, people, flexibility")
    y = p.text_field("Evidence I already have", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 31 * mm, "Skills, projects, outcomes, responsibilities")
    y = p.text_field("My non-negotiables", MARGIN_X, y, half, 29 * mm)
    p.text_field("What I can be flexible about", MARGIN_X + half + 6 * mm, y + 39 * mm, half, 29 * mm)
    y -= 3 * mm
    p.text_field("This week's definition of progress", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 27 * mm, "Keep it realistic and measurable")
    p.footer(); p.finish_page()

    y = p.page_header("Daily page 1 of 2", "Set the day before it sets you", "Decide what matters before notifications, job boards, and rejection emails compete for your attention.")
    third = (PAGE_W - 2 * MARGIN_X - 8 * mm) / 3
    p.stat_box("01", "Main outcome", MARGIN_X, y - 24 * mm, third)
    p.stat_box("03", "Focus blocks", MARGIN_X + third + 4 * mm, y - 24 * mm, third, CORAL)
    p.stat_box("01", "Shutdown time", MARGIN_X + 2 * (third + 4 * mm), y - 24 * mm, third, GREEN)
    y -= 35 * mm
    y = p.text_field("If I complete only one thing today, it is", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 20 * mm)
    y = p.text_field("My top three actions", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 31 * mm, "Write actions, not vague goals")
    y = p.text_field("Focus blocks", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 39 * mm, "Time / task / finish line")
    p.checkbox("Phone away during focus blocks", MARGIN_X, y)
    p.checkbox("Job-board limit decided", MARGIN_X + 67 * mm, y)
    p.checkbox("Shutdown time protected", MARGIN_X + 126 * mm, y)
    p.footer(); p.finish_page()

    y = p.page_header("Daily page 2 of 2", "Move the search forward", "Track meaningful actions and capture the evidence you will need for resumes, interviews, and follow-ups.")
    col = (PAGE_W - 2 * MARGIN_X - 6 * mm) / 2
    y_left = p.text_field("Applications", MARGIN_X, y, col, 37 * mm, "Role / company / next step")
    y_right = p.text_field("People and outreach", MARGIN_X + col + 6 * mm, y, col, 37 * mm, "Person / message / follow-up")
    y = min(y_left, y_right)
    y_left = p.text_field("Follow-ups due", MARGIN_X, y, col, 32 * mm)
    y_right = p.text_field("Learning or portfolio work", MARGIN_X + col + 6 * mm, y, col, 32 * mm)
    y = min(y_left, y_right)
    y = p.text_field("Evidence captured today", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 27 * mm, "A result, story, skill, or useful phrase")
    p.text_field("Tomorrow's first move", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 21 * mm)
    p.footer(); p.finish_page()

    y = p.page_header("Reusable worksheet", "Application focus sheet", "Slow down for the applications that deserve a thoughtful response.")
    y = p.line_field("Company and role", MARGIN_X, y, PAGE_W - 2 * MARGIN_X)
    y = p.text_field("What the employer appears to need most", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 29 * mm)
    y = p.text_field("My strongest matching evidence", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 35 * mm, "Use real examples and outcomes")
    y = p.text_field("What needs clarification or honest framing", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 29 * mm)
    y = p.text_field("Tailoring checklist", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 28 * mm, "Summary / bullets / keywords / cover note")
    p.checkbox("Resume saved with clear filename", MARGIN_X, y)
    p.checkbox("Application logged", MARGIN_X + 76 * mm, y)
    p.checkbox("Follow-up date set", MARGIN_X + 126 * mm, y)
    p.footer(); p.finish_page()

    y = p.page_header("Reusable worksheet", "Follow-up planner", "Professional follow-up is a system, not a memory test.")
    widths = [41, 42, 42, 35]
    x = MARGIN_X
    for label, width in zip(["Person / company", "Context", "Next message", "Date"], widths):
        p.c.setFont("Arial-Bold", 6.8); p.c.setFillColor(MUTED); p.c.drawString(x, y, label.upper()); x += width * mm + 3 * mm
    y -= 6 * mm
    for row in range(7):
        x = MARGIN_X
        for label, width in zip(["person", "context", "message", "date"], widths):
            p.c.setFillColor(white); p.c.setStrokeColor(LINE)
            p.c.roundRect(x, y - 16 * mm, width * mm, 14 * mm, 2 * mm, stroke=1, fill=1)
            p.c.acroForm.textfield(name=p.next_field(f"followup_{row}_{label}"), x=x + 2 * mm, y=y - 14 * mm, width=width * mm - 4 * mm, height=10 * mm, borderWidth=0, fillColor=white, textColor=INK, fontName="Helvetica", fontSize=7.5, fieldFlags="multiline", forceBorder=False)
            x += width * mm + 3 * mm
        y -= 20 * mm
    p.footer(); p.finish_page()

    y = p.page_header("Protect your energy", "Rejection reset", "A rejection can be disappointing without becoming a verdict on your value or potential.")
    y = p.text_field("What happened - only the facts", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 28 * mm)
    y = p.text_field("What I am feeling", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 25 * mm)
    y = p.text_field("What this outcome does not prove", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 25 * mm)
    y = p.text_field("One useful lesson, if there is one", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 25 * mm)
    y = p.text_field("My next small action", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 23 * mm)
    p.checkbox("I will stop reviewing this outcome today", MARGIN_X, y)
    p.footer(); p.finish_page()

    y = p.page_header("End the week", "Weekly review", "Use evidence, not mood, to decide what to continue and what to change.")
    box_w = (PAGE_W - 2 * MARGIN_X - 12 * mm) / 4
    for idx, (value, label) in enumerate([("", "Applications"), ("", "Outreach"), ("", "Follow-ups"), ("", "Interviews")]):
        x = MARGIN_X + idx * (box_w + 4 * mm)
        p.stat_box(value or "  ", label, x, y - 24 * mm, box_w, CORAL if idx == 3 else GREEN)
        p.c.acroForm.textfield(name=p.next_field(label), x=x + 4 * mm, y=y - 15 * mm, width=box_w - 8 * mm, height=8 * mm, borderWidth=0, fillColor=white, fontName="Helvetica", fontSize=14, textColor=GREEN, forceBorder=False)
    y -= 36 * mm
    y = p.text_field("What created the most momentum", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 27 * mm)
    y = p.text_field("What drained time without helping", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 27 * mm)
    y = p.text_field("What I learned about the market or myself", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 27 * mm)
    p.text_field("Next week's one priority", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 22 * mm)
    p.footer(); p.finish_page()
    p.notes_page("Keep what matters", "Notes and useful evidence", "Capture language, examples, feedback, and ideas worth carrying into the next application.")
    return p.save()


SPRINT_DAYS = [
    ("Choose one target", "Define one primary role and two sensible backups.", ["Read five current job descriptions.", "Note repeated responsibilities and tools.", "Write your primary role in one clear sentence."], "One primary role is written and supported by real market evidence."),
    ("Build your evidence inventory", "Collect proof before rewriting anything.", ["List jobs, projects, coursework, volunteering, and responsibilities.", "Mark outcomes, scale, and positive feedback.", "Choose the six strongest examples."], "Six examples are captured with enough detail to reuse."),
    ("Decode the market", "Turn job descriptions into a useful pattern.", ["Compare five postings for your target role.", "Group repeated needs into skills, tools, and outcomes.", "Separate requirements from preferences."], "You have a one-page role requirements map."),
    ("Create an honest keyword bank", "Use the language of the role without pretending.", ["Highlight terms that appear in three or more postings.", "Mark only the terms you genuinely understand or have used.", "Add a real example beside every selected keyword."], "Your keyword bank contains proof, not just phrases."),
    ("Sharpen your professional summary", "Make the top of your resume say who you are and where you fit.", ["Write role, experience level, and strongest value.", "Add two role-relevant strengths.", "Remove vague adjectives and unsupported claims."], "Your summary is specific, honest, and under four lines."),
    ("Rewrite your strongest achievements", "Turn duties into evidence.", ["Select six important responsibilities.", "Write action, context, and outcome for each.", "Add numbers only when you can verify them."], "Six resume bullets are specific and truthful."),
    ("Audit the master resume", "Make one strong base before tailoring.", ["Check hierarchy, tense, dates, and spacing.", "Remove filler and repeated language.", "Ask whether every section supports the target role."], "A clean master resume is saved and ready to tailor."),
    ("Build a focused company list", "Replace random searching with a target list.", ["List 15 companies that hire for the role.", "Add career-page links and likely locations.", "Rank each company by fit and interest."], "Fifteen target companies are ranked."),
    ("Tailor application one", "Practice quality over speed.", ["Compare the role with your evidence inventory.", "Adjust summary and top bullets.", "Use genuine keywords where they fit naturally."], "Application one is tailored and proofread."),
    ("Send and log application one", "Finish the loop properly.", ["Complete the application carefully.", "Save the exact resume version used.", "Log date, link, status, and follow-up date."], "Application one is submitted and traceable."),
    ("Start one useful conversation", "Build relationships without asking strangers for jobs.", ["Choose one person connected to the target role.", "Write a brief, specific message.", "Ask one thoughtful question about their experience."], "One respectful outreach message is sent."),
    ("Tailor application two", "Repeat the system with less friction.", ["Use the same evidence-first process.", "Notice which parts now move faster.", "Keep the final application specific to the role."], "Application two is submitted and logged."),
    ("Prepare your interview evidence", "Turn your best examples into stories.", ["Choose five common questions.", "Match one real example to each.", "Practice concise situation, action, and result answers."], "Five interview stories are outlined."),
    ("Review and design the next sprint", "Keep what worked; remove what did not.", ["Review your scoreboard and energy.", "Name the two actions that created the most progress.", "Schedule the next seven days before closing."], "Your repeatable weekly system is scheduled."),
]


def build_sprint() -> Path:
    p = PlannerPDF("careerpilot-14-day-job-search-sprint.pdf", "14-Day Job Search Sprint", "14-Day Job Search Sprint", "VOL. 02")
    p.cover("From scattered effort to a working system.", "Fourteen focused days to clarify your target, strengthen your evidence, and send better applications.", "#D8A87A")
    p.info_page(
        "Fourteen days. One useful outcome each day.",
        "This is a focused sprint, not a promise of employment. Continue when you miss a day; do not restart or rush to catch up.",
        [("Focus", "One finish line per day."), ("Evidence", "Real experience before polished wording."), ("Repeat", "Build a system you can use after day fourteen.")],
        ["A defined target role and honest keyword bank", "A stronger master resume and two tailored applications", "A focused company list and first outreach conversation", "Five interview stories and a repeatable weekly routine"],
    )
    y = p.page_header("Before day one", "Set your sprint conditions", "Make the plan realistic enough to finish.")
    y = p.line_field("Sprint start date", MARGIN_X, y, 73 * mm)
    p.line_field("Daily focus time", MARGIN_X + 88 * mm, y + 13 * mm, 73 * mm)
    y -= 2 * mm
    y = p.text_field("Primary role I am exploring", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 24 * mm)
    y = p.text_field("Why this role is worth a focused test", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 27 * mm)
    y = p.text_field("Constraints I need to respect", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 27 * mm, "Time, energy, caregiving, work, study")
    y = p.text_field("What success on day fourteen looks like", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 31 * mm)
    p.checkbox("I will continue after a missed day instead of restarting", MARGIN_X, y)
    p.footer(); p.finish_page()

    for number, (title, outcome, actions, done_when) in enumerate(SPRINT_DAYS, 1):
        y = p.page_header(f"Day {number} of 14", title, outcome)
        p.c.setFillColor(GREEN); p.c.circle(MARGIN_X + 9 * mm, y - 13 * mm, 9 * mm, stroke=0, fill=1)
        p.c.setFillColor(white); p.c.setFont("Georgia", 17); p.c.drawCentredString(MARGIN_X + 9 * mm, y - 17 * mm, str(number))
        action_x = MARGIN_X + 25 * mm
        p.c.setFillColor(INK); p.c.setFont("Arial-Bold", 8); p.c.drawString(action_x, y - 5 * mm, "TODAY'S THREE MOVES")
        ay = p.bullets(actions, action_x, y - 12 * mm, PAGE_W - MARGIN_X - action_x, 8.5, 1.2)
        y = min(y - 41 * mm, ay - 2 * mm)
        y = p.text_field("My plan for today's focus block", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 31 * mm, "When / where / first action")
        y = p.text_field("Work and evidence", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 62 * mm, "Capture the useful output, not every thought")
        p.c.setFillColor(PALE); p.c.roundRect(MARGIN_X, y - 20 * mm, PAGE_W - 2 * MARGIN_X, 18 * mm, 3 * mm, stroke=0, fill=1)
        p.c.setFillColor(GREEN); p.c.setFont("Arial-Bold", 7); p.c.drawString(MARGIN_X + 5 * mm, y - 8 * mm, "DONE WHEN")
        p.c.setFillColor(INK); p.c.setFont("Arial", 8); p.c.drawString(MARGIN_X + 29 * mm, y - 8 * mm, done_when)
        p.checkbox("Completed", MARGIN_X + 5 * mm, y - 16 * mm)
        p.checkbox("Continue tomorrow", MARGIN_X + 51 * mm, y - 16 * mm)
        p.footer(); p.finish_page()

    y = p.page_header("Sprint close", "Turn fourteen days into a repeatable week", "Progress becomes useful when you understand what created it.")
    y = p.text_field("What changed in my clarity, materials, or confidence", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 30 * mm)
    y = p.text_field("The two actions that created the most progress", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 28 * mm)
    y = p.text_field("What I will stop or reduce", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 25 * mm)
    y = p.text_field("My next seven-day rhythm", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 37 * mm, "Applications / outreach / learning / review")
    p.text_field("The first action already scheduled", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 21 * mm)
    p.footer(); p.finish_page()
    return p.save()


def build_interview() -> Path:
    p = PlannerPDF("careerpilot-interview-preparation-planner.pdf", "Interview Preparation Planner", "Interview Preparation Planner", "VOL. 03")
    p.cover("Prepare evidence, not performances.", "Research the role, choose the right stories, practise clearly, and arrive with questions worth asking.", "#E5B88D")
    p.info_page(
        "Walk in knowing what you want to communicate.",
        "Preparation should make you more present, not more scripted. Use short notes and real examples; never memorise paragraphs.",
        [("Research", "Understand the role, company, and people."), ("Evidence", "Match real stories to likely questions."), ("Practise", "Say it aloud, then make it simpler.")],
        ["A clear understanding of the role and its priorities", "A bank of structured, evidence-based stories", "Concise answers to high-frequency questions", "Thoughtful questions, logistics, and a follow-up plan"],
    )
    y = p.page_header("Interview overview", "The interview map", "Keep every stage and contact in one place.")
    y = p.line_field("Company and role", MARGIN_X, y, PAGE_W - 2 * MARGIN_X)
    half = (PAGE_W - 2 * MARGIN_X - 6 * mm) / 2
    y1 = p.line_field("Date and time", MARGIN_X, y, half)
    p.line_field("Format / location", MARGIN_X + half + 6 * mm, y, half)
    y = y1 - 3 * mm
    y = p.text_field("People I expect to meet", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 24 * mm, "Name / role / likely perspective")
    y = p.text_field("What this stage is probably testing", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 27 * mm)
    y = p.text_field("The three ideas I want them to remember", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 33 * mm)
    p.text_field("What I need to learn before deciding", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 29 * mm)
    p.footer(); p.finish_page()

    y = p.page_header("Research", "Company and context", "Research enough to ask better questions and understand the work. Avoid collecting trivia.")
    y = p.text_field("What the company does and who it serves", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 28 * mm)
    y = p.text_field("Current priorities, changes, or challenges", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 31 * mm)
    y = p.text_field("How this team or role contributes", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 28 * mm)
    y = p.text_field("What genuinely interests me", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 25 * mm)
    p.text_field("Sources worth revisiting", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 23 * mm, "Website / product / news / people")
    p.footer(); p.finish_page()

    y = p.page_header("Role fit", "Requirements-to-evidence map", "Use the job description to choose the examples that deserve airtime.")
    headers = ["Priority requirement", "My evidence", "Proof / outcome"]
    widths = [51, 68, 50]
    x = MARGIN_X
    for header, width in zip(headers, widths):
        p.c.setFillColor(GREEN); p.c.setFont("Arial-Bold", 6.8); p.c.drawString(x, y, header.upper()); x += width * mm + 3 * mm
    y -= 6 * mm
    for row in range(6):
        x = MARGIN_X
        for header, width in zip(headers, widths):
            p.c.setFillColor(white); p.c.setStrokeColor(LINE); p.c.roundRect(x, y - 22 * mm, width * mm, 20 * mm, 2 * mm, stroke=1, fill=1)
            p.c.acroForm.textfield(name=p.next_field(f"evidence_map_{row}_{header}"), x=x + 2 * mm, y=y - 20 * mm, width=width * mm - 4 * mm, height=16 * mm, borderWidth=0, fillColor=white, textColor=INK, fontName="Helvetica", fontSize=7.5, fieldFlags="multiline", forceBorder=False)
            x += width * mm + 3 * mm
        y -= 26 * mm
    p.footer(); p.finish_page()

    y = p.page_header("Opening answer", "Tell me about yourself", "Build a short path from where you are, through relevant evidence, to why this role makes sense.")
    y = p.text_field("Present - who I am professionally", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 30 * mm)
    y = p.text_field("Past - the two experiences most relevant here", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 36 * mm)
    y = p.text_field("Future - why this role is a sensible next step", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 30 * mm)
    y = p.text_field("My 60-second version", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 41 * mm, "Use speaking notes, not a script")
    p.checkbox("Under 90 seconds", MARGIN_X, y)
    p.checkbox("Specific to this role", MARGIN_X + 58 * mm, y)
    p.checkbox("Sounds like me", MARGIN_X + 113 * mm, y)
    p.footer(); p.finish_page()

    for story_number in range(1, 4):
        y = p.page_header("Evidence story", f"STAR story {story_number}", "Choose a different example on each page. Keep context short and spend most time on your actions.")
        y = p.line_field("Question or capability this story answers", MARGIN_X, y, PAGE_W - 2 * MARGIN_X)
        y = p.text_field("Situation and task", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 31 * mm, "Context / goal / constraint")
        y = p.text_field("Actions I personally took", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 48 * mm, "Decisions / communication / problem-solving")
        y = p.text_field("Result and evidence", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 31 * mm, "Outcome / feedback / learning")
        p.text_field("One-line takeaway", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 22 * mm)
        p.footer(); p.finish_page()

    y = p.page_header("Question bank", "High-frequency questions", "Prepare talking points for the questions most likely to expose unclear thinking.")
    prompts = ["Why this role?", "Why this company?", "A difficult problem", "A mistake or setback", "A conflict or disagreement", "A time you learned quickly"]
    col = (PAGE_W - 2 * MARGIN_X - 6 * mm) / 2
    for idx, prompt in enumerate(prompts):
        row, column = divmod(idx, 2)
        x = MARGIN_X + column * (col + 6 * mm)
        y_top = y - row * 49 * mm
        p.text_field(prompt, x, y_top, col, 38 * mm, "Evidence / key point / result")
    p.footer(); p.finish_page()

    y = p.page_header("Your questions", "Questions worth asking", "Use questions to understand expectations, ways of working, and whether the role fits you.")
    categories = [("Success", "What would strong performance look like after six months?"), ("Priorities", "What needs the most attention in the first ninety days?"), ("Team", "How does the team make decisions and share feedback?"), ("Growth", "How have people in this role expanded their responsibilities?"), ("Challenge", "What tends to be harder about this role than candidates expect?")]
    for heading, example in categories:
        p.c.setFillColor(GREEN); p.c.setFont("Arial-Bold", 8); p.c.drawString(MARGIN_X, y, heading.upper())
        p.c.setFillColor(MUTED); p.c.setFont("Arial", 7.5); p.c.drawString(MARGIN_X + 28 * mm, y, example)
        y = p.text_field("My version", MARGIN_X, y - 4 * mm, PAGE_W - 2 * MARGIN_X, 17 * mm)
    p.footer(); p.finish_page()

    y = p.page_header("Practice", "Mock interview scorecard", "Ask a trusted person to score clarity and evidence, not personality.")
    criteria = ["Answers the actual question", "Uses specific evidence", "Keeps context concise", "Explains personal actions", "Shares outcomes honestly", "Sounds natural, not memorised"]
    for index, criterion in enumerate(criteria):
        p.c.setFillColor(white); p.c.setStrokeColor(LINE); p.c.roundRect(MARGIN_X, y - 15 * mm, PAGE_W - 2 * MARGIN_X, 13 * mm, 2 * mm, stroke=1, fill=1)
        p.c.setFillColor(INK); p.c.setFont("Arial", 8); p.c.drawString(MARGIN_X + 4 * mm, y - 9 * mm, criterion)
        for score in range(1, 6):
            x = PAGE_W - MARGIN_X - (6 - score) * 9 * mm
            p.checkbox(str(score), x, y - 9 * mm, name=p.next_field(f"mock_{index}_{score}"), size=3.5 * mm)
        y -= 18 * mm
    y = p.text_field("The strongest answer", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 24 * mm)
    y = p.text_field("The answer to improve next", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 24 * mm)
    p.text_field("One change before the real interview", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 21 * mm)
    p.footer(); p.finish_page()

    y = p.page_header("Practical readiness", "Interview-day checklist", "Reduce avoidable stress so your attention can stay on the conversation.")
    checks = ["Time zone, address, or meeting link confirmed", "Names and roles checked", "Resume and job description available", "Device, camera, microphone, and charger checked", "Route and arrival buffer planned", "Water, notebook, and pen ready", "Three evidence stories reviewed", "Questions for the interviewer selected", "Phone and notifications silenced", "A calm five-minute reset scheduled"]
    for idx, check in enumerate(checks):
        p.checkbox(check, MARGIN_X, y - idx * 11 * mm)
    y -= 118 * mm
    p.text_field("Anything specific I need to bring or prepare", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 30 * mm)
    p.footer(); p.finish_page()

    y = p.page_header("After the conversation", "Debrief and follow-up", "Capture details while they are fresh. Do not judge the entire interview by one awkward moment.")
    y = p.text_field("What I learned about the role, team, and expectations", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 31 * mm)
    y = p.text_field("What I communicated well", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 27 * mm)
    y = p.text_field("What I would answer differently", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 27 * mm)
    y = p.text_field("Follow-up message", MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 34 * mm, "Thank them / reinforce fit / mention a useful detail")
    p.line_field("Follow-up sent", MARGIN_X, y, 72 * mm)
    p.line_field("Expected next step", MARGIN_X + 89 * mm, y, 72 * mm)
    p.footer(); p.finish_page()
    return p.save()


def build_switch() -> Path:
    p = PlannerPDF("careerpilot-career-switch-planner.pdf", "Career Switch Planner", "Career Switch Planner", "VOL. 04")
    p.cover("Build the bridge before you leap.", "Translate your experience, test realistic directions, close the right gaps, and tell a credible transition story.", "#C9D8CD")
    p.info_page(
        "A career switch is a positioning and evidence problem.",
        "You do not need to erase your past. The work is to understand which parts transfer, what the new market values, and what proof is still missing.",
        [("Translate", "Find the useful value inside old job titles."), ("Test", "Use conversations and small projects before committing."), ("Bridge", "Close only the gaps that block credible entry.")],
        ["A clear reason for changing direction", "A map of transferable skills and evidence", "Two or three realistic destination roles", "A gap-closing plan and a credible transition story"],
    )
    pages = [
        ("Direction", "Why I want to switch", "Separate what you are moving toward from what you are trying to escape.", [("What I want more of", 32), ("What I want less of", 32), ("What must stay true in my next chapter", 30), ("The risks I am willing to take - and the ones I am not", 31)]),
        ("Evidence", "Transferable skills inventory", "Name the skill, then prove it with a situation and result.", [("Skills I use across contexts", 38), ("Problems people trust me to solve", 36), ("Evidence and outcomes", 40), ("Language the new field uses for this value", 30)]),
        ("Evidence", "Experience worth carrying forward", "Your past matters when you explain the value, not only the title.", [("Projects and responsibilities with transferable value", 46), ("Moments I learned quickly", 31), ("Times I worked with unfamiliar people or systems", 31), ("Feedback that reveals strengths", 27)]),
        ("Explore", "Destination-role landscape", "Compare realistic options before choosing one path.", [("Role option one - fit, evidence, gaps", 37), ("Role option two - fit, evidence, gaps", 37), ("Role option three - fit, evidence, gaps", 37), ("The option worth testing first - and why", 29)]),
        ("Explore", "Adjacency map", "The best switch is often one sensible step away, not a total restart.", [("My current domain knowledge", 28), ("Adjacent functions or industries", 34), ("Bridge roles that value both backgrounds", 38), ("People or companies already making this connection", 32)]),
        ("Gap analysis", "Gap triage", "Do not turn every unfamiliar requirement into a six-month course.", [("Critical gaps - needed before applying", 34), ("Important gaps - can improve while applying", 34), ("Nice-to-have gaps - not urgent", 30), ("Evidence I may already have but describe poorly", 30)]),
        ("Build", "Learning sprint", "Choose one small learning outcome that produces visible evidence.", [("Skill or concept to strengthen", 23), ("Why the market cares", 25), ("Two-week learning plan", 44), ("Proof I will produce", 29)]),
        ("Build", "Bridge project", "Create a small, relevant piece of work that connects your old strengths with the new direction.", [("Problem or question", 25), ("Audience and constraints", 25), ("What I will create", 30), ("What it should demonstrate", 30), ("Finish date and sharing plan", 23)]),
        ("Positioning", "My transition story", "A clear story connects past value, deliberate preparation, and a realistic next step.", [("Past - relevant foundation", 31), ("Pivot - what changed and what I did about it", 34), ("Present - evidence I am ready now", 34), ("Future - why this role makes sense", 28)]),
        ("Positioning", "Resume repositioning plan", "Change emphasis before changing facts.", [("What moves higher", 27), ("What gets shortened or removed", 27), ("Which achievements need translation", 34), ("Keywords I can support with evidence", 31)]),
        ("Relationships", "Conversation planner", "Use conversations to learn, not to pressure people into referrals.", [("Person and why their perspective matters", 27), ("Three thoughtful questions", 35), ("What I learned", 37), ("Follow-up or next experiment", 27)]),
        ("Decide", "Application criteria", "Know which opportunities deserve your time.", [("Must-have conditions", 30), ("Positive signals", 30), ("Warning signs", 30), ("What would make a stretch role worth it", 31)]),
        ("Act", "Thirty-day bridge plan", "Balance learning, proof, conversations, and applications.", [("Week 1 - choose and research", 29), ("Week 2 - build evidence", 29), ("Week 3 - test the story", 29), ("Week 4 - apply and review", 29)]),
        ("Review", "Switch decision review", "A good decision can still feel uncertain. Use evidence from your experiments.", [("What became clearer", 29), ("What surprised me", 27), ("Evidence this direction fits", 32), ("Evidence I should reconsider", 32), ("My next committed step", 23)]),
    ]
    for kicker, title, intro, fields in pages:
        y = p.page_header(kicker, title, intro)
        for label, height in fields:
            y = p.text_field(label, MARGIN_X, y, PAGE_W - 2 * MARGIN_X, height * mm)
        p.footer(); p.finish_page()
    p.notes_page("Keep exploring", "Career-switch notes", "Capture roles, people, language, evidence, and questions that do not yet have a home.")
    return p.save()


def build_first_90() -> Path:
    p = PlannerPDF("careerpilot-first-90-days-planner.pdf", "First 90 Days Planner", "First 90 Days Planner", "VOL. 05")
    p.cover("Learn fast. Build trust. Create useful momentum.", "A practical guide for understanding the role, forming strong relationships, and delivering early value without pretending to know everything.", "#C9D8CD")
    p.info_page(
        "Your first job is to understand the system.",
        "Early credibility comes from listening, reliable follow-through, and making useful progress on the right problems - not from performing certainty.",
        [("Learn", "People, priorities, language, and constraints."), ("Align", "Confirm expectations with your manager."), ("Deliver", "Create visible value without rushing the diagnosis.")],
        ["A clear map of people, priorities, and ways of working", "A reliable rhythm with your manager and team", "Documented learning, feedback, and early wins", "Thirty-, sixty-, and ninety-day reviews grounded in evidence"],
    )
    pages = [
        ("Before day one", "Prepare without over-preparing", "Arrive organised, curious, and ready to learn.", [("What I already know about the role and team", 31), ("What I need to confirm", 31), ("Practical setup and documents", 29), ("How I want to show up in the first week", 31)]),
        ("Week one", "Questions before answers", "Use the first week to understand priorities, relationships, and how work actually moves.", [("What success means in this role", 29), ("Current team priorities", 31), ("How decisions are made", 29), ("Systems, tools, and routines to learn", 31)]),
        ("Relationships", "Stakeholder map", "Understand who is affected by your work and what they need from you.", [("My manager - expectations and communication", 31), ("Core teammates - roles and dependencies", 35), ("Partners and customers - needs and friction", 35), ("People I should learn from", 27)]),
        ("Alignment", "Manager working agreement", "Make expectations visible before misunderstandings become habits.", [("Top priorities", 29), ("How we will communicate", 27), ("How progress should be shared", 27), ("Feedback preferences", 27), ("When to escalate or ask for help", 25)]),
        ("Learning", "Role learning map", "Turn a flood of information into a structured learning plan.", [("Products, customers, or users", 31), ("Processes and systems", 31), ("Domain knowledge and language", 31), ("People and context", 31)]),
        ("First 30 days", "Listen, map, and establish reliability", "Your first milestone is a useful understanding of the work and dependable follow-through.", [("What I need to learn", 31), ("Relationships to build", 29), ("Work I can own safely", 29), ("Evidence I am on track", 29)]),
        ("Learning log", "Questions, answers, and patterns", "Keep one place for information you would otherwise ask for twice.", [("Question or unfamiliar term", 29), ("Answer and source", 33), ("Why it matters", 29), ("What I will do differently", 29)]),
        ("Progress", "Early wins tracker", "A useful win solves a real need and respects the system around it.", [("Need or friction I noticed", 29), ("Action I took", 31), ("Who it helped", 25), ("Result or feedback", 31), ("What I learned", 24)]),
        ("Meetings", "One-to-one notes", "Prepare a point of view, but leave room to listen.", [("Person and context", 23), ("What I want to understand", 29), ("Key notes", 46), ("Commitments and follow-up", 29)]),
        ("Feedback", "Feedback log", "Separate the signal from the emotion, then decide what to practise.", [("Feedback - exact words if possible", 31), ("Context and examples", 31), ("What I agree or need to clarify", 31), ("Action and review date", 27)]),
        ("Day 30", "Thirty-day review", "Check understanding and alignment before increasing speed.", [("What I understand now", 30), ("Relationships and trust built", 29), ("Early contributions", 29), ("Questions and risks", 29), ("Priorities for days 31-60", 25)]),
        ("Days 31-60", "Contribute with context", "Take on more ownership while continuing to test your assumptions.", [("Outcomes I can own", 31), ("Improvements worth exploring", 31), ("Partners I need", 27), ("How success will be measured", 29)]),
        ("Day 60", "Sixty-day review", "Make progress visible and ask for calibration.", [("Results and evidence", 31), ("What is becoming easier", 27), ("Where I still need support", 29), ("Feedback I want now", 27), ("Priorities for days 61-90", 25)]),
        ("Days 61-90", "Own the work and improve the system", "Shift from orientation to sustained contribution.", [("Core responsibility I will deepen", 31), ("One improvement I can lead responsibly", 32), ("How I will involve others", 27), ("What I will document or standardise", 29)]),
        ("Day 90", "Ninety-day review", "Review the evidence and agree on what the next chapter requires.", [("Contributions I am proud of", 30), ("Trust and relationships built", 28), ("What I have learned about the role", 30), ("Capabilities to strengthen next", 28), ("My next ninety-day focus", 25)]),
    ]
    for kicker, title, intro, fields in pages:
        y = p.page_header(kicker, title, intro)
        for label, height in fields:
            y = p.text_field(label, MARGIN_X, y, PAGE_W - 2 * MARGIN_X, height * mm)
        p.footer(); p.finish_page()
    p.notes_page("Keep learning", "First-90-days notes", "Capture names, systems, decisions, language, and context you will want later.")
    return p.save()


def main() -> None:
    outputs = [build_daily(), build_sprint(), build_interview(), build_switch(), build_first_90()]
    print("Generated CareerPilot Planner Series:")
    for output in outputs:
        print(output)


if __name__ == "__main__":
    main()
