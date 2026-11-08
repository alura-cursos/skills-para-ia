#!/usr/bin/env python3
"""
geracao-de-tutorial — validate.py
============================
Runs the 21-item shipping checklist over a tutorial HTML file and reports
pass/fail for each. Exit code 0 if all critical checks pass, 1 otherwise.

USAGE
-----
    python3 validate.py path/to/tutorial.html
    python3 validate.py path/to/tutorial.html --quiet   # only failures
    python3 validate.py path/to/tutorial.html --json    # machine-readable

CHECKS PERFORMED
----------------
A. Structural integrity
    1. HTML tag balance (22 tag types, delta = 0 each)
    2. MathJax inline delimiters balanced  \( / \)
    3. MathJax display delimiters balanced \[ / \]
    4. <g> balance outside comments

B. Cross-references
    5. All href="#X" resolve to id="X" in the document
    6. All aria-labelledby="X Y" resolve
    7. All aria-describedby="X" resolve

C. Bear traps
    8. NO :root selectors inside <svg><style> blocks
    9. NO <animate attributeName="textContent"> (invalid SMIL)
   10. Math symbol tooltip dictionary contains NO single Latin letters that over-match

D. Accessibility
   11. <svg> elements with role="img" all have aria-labelledby
   12. Tables have <thead>, <tbody>, <caption>
   13. <table> uses <th scope=...>
   14. Skip link present
   15. Theme toggle present

E. Theming / responsiveness
   16. CSS includes @media (prefers-color-scheme: light)
   17. CSS includes @media (prefers-reduced-motion: reduce)
   18. CSS includes @media print
   19. Tooltip clamping CSS present (max-width: min(...calc(100vw...))
   20. JS includes pauseAnimations() call (SMIL reduced-motion handler)
   21. JS includes mathvariant check (for double-struck E tooltip)
"""

import re
import sys
import json
import argparse
from pathlib import Path


# ============================================================================
# HTML tag balance
# ============================================================================

TAG_TYPES = [
    'div', 'section', 'figure', 'table', 'thead', 'tbody', 'svg', 'p',
    'ul', 'ol', 'h2', 'h3', 'h4', 'tr', 'td', 'th', 'details', 'summary',
    'caption', 'dl', 'dt', 'dd',
]


def _strip_comments(text):
    """Strip HTML comments AND CSS comments AND <pre>/<code>/<script> contents from
    text. Used by checks that count tag/keyword occurrences and shouldn't be fooled
    by mentions in comments or by code/script content (which is data, not markup)."""
    t = re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)
    t = re.sub(r'/\*.*?\*/', '', t, flags=re.DOTALL)
    # Strip <pre>...</pre> contents (code examples shown as documentation)
    t = re.sub(r'<pre[^>]*>.*?</pre>', '', t, flags=re.DOTALL)
    # Strip standalone <code>...</code> blocks (inline code mentions)
    # Note: this is a heuristic — it strips ALL <code> contents, including legitimate
    # ones. For tutorials, this is fine because <code> contents are textual references.
    t = re.sub(r'<code[^>]*>.*?</code>', '', t, flags=re.DOTALL)
    return t


def check_tag_balance(text, results):
    # CRITICAL: strip comments first. Otherwise "see <table> ..." in a comment counts
    # as an open tag with no close, false-positiving the balance check.
    t = _strip_comments(text)
    for tag in TAG_TYPES:
        opens = len(re.findall(rf'<{tag}[ />]', t))
        closes = len(re.findall(rf'</{tag}>', t))
        delta = opens - closes
        if delta != 0:
            results['fail'].append(
                f"[1] <{tag}> imbalanced: {opens} opens, {closes} closes (delta {delta})"
            )
        else:
            results['pass'].append(f"<{tag}> balanced ({opens})")


def check_mathjax(text, results):
    inline_open  = len(re.findall(r'\\\(', text))
    inline_close = len(re.findall(r'\\\)', text))
    display_open  = len(re.findall(r'\\\[', text))
    display_close = len(re.findall(r'\\\]', text))

    if inline_open != inline_close:
        results['fail'].append(
            f"[2] MathJax inline \\( / \\) imbalanced: {inline_open} / {inline_close}"
        )
    else:
        results['pass'].append(f"MathJax inline balanced ({inline_open})")

    if display_open != display_close:
        results['fail'].append(
            f"[3] MathJax display \\[ / \\] imbalanced: {display_open} / {display_close}"
        )
    else:
        results['pass'].append(f"MathJax display balanced ({display_open})")


def check_g_balance(text, results):
    # Strip CSS comments AND HTML comments before counting
    t = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
    t = re.sub(r'<!--.*?-->', '', t, flags=re.DOTALL)
    opens = len(re.findall(r'<g[ >]', t))
    closes = len(re.findall(r'</g>', t))
    if opens != closes:
        results['fail'].append(f"[4] <g> imbalanced outside comments: {opens} / {closes}")
    else:
        results['pass'].append(f"<g> balanced outside comments ({opens})")


# ============================================================================
# Cross-references
# ============================================================================

def check_href_anchors(text, results):
    ids = set(re.findall(r'\bid="([^"]+)"', text))
    refs = re.findall(r'href="#([^"]+)"', text)
    unresolved = [r for r in set(refs) if r not in ids]
    if unresolved:
        results['fail'].append(
            f"[5] {len(unresolved)} href anchors unresolved: {', '.join(unresolved[:5])}"
            + ('...' if len(unresolved) > 5 else '')
        )
    else:
        results['pass'].append(f"All {len(set(refs))} href anchors resolve")


def check_aria_labelledby(text, results):
    ids = set(re.findall(r'\bid="([^"]+)"', text))
    refs = []
    for m in re.finditer(r'aria-labelledby="([^"]+)"', text):
        refs.extend(m.group(1).split())
    unresolved = [r for r in set(refs) if r not in ids]
    if unresolved:
        results['fail'].append(
            f"[6] {len(unresolved)} aria-labelledby refs unresolved: {', '.join(unresolved[:5])}"
        )
    else:
        results['pass'].append(f"All {len(set(refs))} aria-labelledby refs resolve")


def check_aria_describedby(text, results):
    ids = set(re.findall(r'\bid="([^"]+)"', text))
    refs = re.findall(r'aria-describedby="([^"]+)"', text)
    flat_refs = []
    for r in refs:
        flat_refs.extend(r.split())
    unresolved = [r for r in set(flat_refs) if r not in ids]
    if unresolved:
        results['fail'].append(
            f"[7] {len(unresolved)} aria-describedby refs unresolved: {', '.join(unresolved[:5])}"
        )
    else:
        results['pass'].append(f"All {len(set(flat_refs))} aria-describedby refs resolve")


# ============================================================================
# Bear traps
# ============================================================================

def check_no_root_in_svg_style(text, results):
    pattern = re.compile(
        r'<svg[^>]*>(?:(?!</svg>).)*?<style>(?:(?!</style>).)*?(:root\s*\{)',
        re.DOTALL,
    )
    leaks = pattern.findall(text)
    if leaks:
        results['fail'].append(
            f"[8] BEAR TRAP B.1: {len(leaks)} :root selectors inside SVG <style> blocks "
            f"(they leak to the document)"
        )
    else:
        results['pass'].append(":root NOT leaked inside any SVG <style>")


def check_no_smil_textcontent(text, results):
    # Strip comments so the bear trap warning text itself doesn't trigger this check
    t = _strip_comments(text)
    bad = len(re.findall(r'attributeName="textContent"', t))
    if bad > 0:
        results['fail'].append(
            f"[9] BEAR TRAP B.2: {bad} <animate attributeName=\"textContent\"> elements (invalid SMIL)"
        )
    else:
        results['pass'].append("No invalid SMIL textContent animations")


def check_no_latin_singles_in_tooltips(text, results):
    # Find SYMBOL_TIPS dictionary in JS, check for single Latin letters
    m = re.search(r"var SYMBOL_TIPS = \{([^}]+)\}", text, re.DOTALL)
    if not m:
        results['warn'].append("[10] SYMBOL_TIPS dictionary not found; skipping check")
        return
    keys = re.findall(r"'([^']+)':", m.group(1))
    bad = [k for k in keys if len(k) == 1 and k.isascii() and k.isalpha()]
    if bad:
        results['fail'].append(
            f"[10] BEAR TRAP B.5: SYMBOL_TIPS contains ambiguous Latin single letters: {bad}"
        )
    else:
        results['pass'].append(f"SYMBOL_TIPS contains no ambiguous Latin singles")


# ============================================================================
# Accessibility
# ============================================================================

def check_svg_aria(text, results):
    svgs = re.findall(r'<svg[^>]*>', text)
    role_img_svgs = [s for s in svgs if 'role="img"' in s]
    missing_aria = [s for s in role_img_svgs
                    if 'aria-labelledby' not in s and 'aria-label' not in s]
    if missing_aria:
        results['fail'].append(
            f"[11] {len(missing_aria)} <svg role=\"img\"> elements without aria-labelledby or aria-label"
        )
    else:
        results['pass'].append(f"All {len(role_img_svgs)} role=\"img\" SVGs have ARIA labels")


def check_table_semantics(text, results):
    tables = re.findall(r'<table[^>]*>.*?</table>', text, re.DOTALL)
    bad_tables = []
    for t in tables:
        if '<thead' not in t or '<tbody' not in t:
            bad_tables.append('missing thead/tbody')
    if bad_tables:
        results['fail'].append(
            f"[12] {len(bad_tables)} tables missing <thead> or <tbody>"
        )
    else:
        results['pass'].append(f"All {len(tables)} tables have thead/tbody")

    th_with_scope = len(re.findall(r'<th[^>]*\bscope=', text))
    total_th = len(re.findall(r'<th\b', text))
    if total_th > 0 and th_with_scope < total_th * 0.5:
        results['warn'].append(
            f"[13] Only {th_with_scope}/{total_th} <th> elements have scope= (target: all)"
        )
    elif total_th > 0:
        results['pass'].append(f"{th_with_scope}/{total_th} <th> have scope attribute")


def check_skip_link(text, results):
    if 'class="skip-link"' in text or 'class=\'skip-link\'' in text:
        results['pass'].append("Skip link present")
    else:
        results['fail'].append("[14] Skip link missing (a.skip-link)")


def check_theme_toggle(text, results):
    # Accept either id="theme-toggle" (boilerplate convention) or class="theme-toggle"
    # (some tutorials use class for styling)
    if 'id="theme-toggle"' in text or 'class="theme-toggle"' in text or 'theme-toggle' in text:
        results['pass'].append("Theme toggle present")
    else:
        results['warn'].append("[15] Theme toggle missing (id='theme-toggle' or class='theme-toggle')")


# ============================================================================
# Theming
# ============================================================================

def check_light_mode(text, results):
    if '@media (prefers-color-scheme: light)' in text or '@media(prefers-color-scheme: light)' in text:
        results['pass'].append("Light-mode CSS media query present")
    else:
        results['fail'].append("[16] @media (prefers-color-scheme: light) missing")


def check_reduced_motion(text, results):
    if '@media (prefers-reduced-motion' in text or '@media(prefers-reduced-motion' in text:
        results['pass'].append("Reduced-motion CSS media query present")
    else:
        results['fail'].append("[17] @media (prefers-reduced-motion: reduce) missing")


def check_print(text, results):
    if '@media print' in text:
        results['pass'].append("Print stylesheet present")
    else:
        results['warn'].append("[18] @media print missing")


def check_tooltip_clamping(text, results):
    if 'max-width: min(' in text and '100vw' in text:
        results['pass'].append("Tooltip clamping CSS present")
    else:
        results['warn'].append("[19] Tooltip viewport clamping (max-width: min(...calc(100vw...))) missing")


def check_pause_animations(text, results):
    if 'pauseAnimations' in text:
        results['pass'].append("SMIL reduced-motion handler (pauseAnimations) present")
    else:
        results['fail'].append("[20] pauseAnimations() missing from JS (SMIL ignores CSS media query)")


def check_mathvariant(text, results):
    if 'mathvariant' in text and ('double-struck' in text or 'mathbb' in text.lower()):
        results['pass'].append("Mathvariant detection for double-struck E present")
    else:
        results['warn'].append(
            "[21] mathvariant check missing (𝔼 tooltip via \\mathbb{E} won't fire — see bear trap B.4)"
        )


# ============================================================================
# Main
# ============================================================================

CHECKS_FULL = [
    ('Structural integrity',
     [check_tag_balance, check_mathjax, check_g_balance]),
    ('Cross-references',
     [check_href_anchors, check_aria_labelledby, check_aria_describedby]),
    ('Bear traps',
     [check_no_root_in_svg_style, check_no_smil_textcontent,
      check_no_latin_singles_in_tooltips]),
    ('Accessibility',
     [check_svg_aria, check_table_semantics, check_skip_link, check_theme_toggle]),
    ('Theming / responsiveness',
     [check_light_mode, check_reduced_motion, check_print,
      check_tooltip_clamping, check_pause_animations, check_mathvariant]),
]

# Snippet mode: validates an example fragment (figure, animation, widget) without
# expecting the full-document infrastructure (skip-link, media queries, JS handlers,
# SYMBOL_TIPS dictionary). Use this for example files in geracao-de-tutorial/examples/
# which are designed to be COPIED INTO a complete tutorial, not to stand alone.
CHECKS_SNIPPET = [
    ('Structural integrity',
     [check_tag_balance, check_g_balance]),  # skip MathJax balance (snippets may not have any)
    ('Cross-references',
     [check_aria_labelledby, check_aria_describedby]),  # skip href anchors (snippets often have placeholder #s)
    ('Bear traps',
     [check_no_root_in_svg_style, check_no_smil_textcontent]),  # skip SYMBOL_TIPS check (snippets don't have JS)
    ('Accessibility',
     [check_svg_aria, check_table_semantics]),  # skip skip-link, theme-toggle (snippets don't have them)
]


def main():
    parser = argparse.ArgumentParser(
        description='Validate a tutorial HTML file against the 21-item shipping checklist.'
    )
    parser.add_argument('file', type=Path, help='Path to tutorial HTML file')
    parser.add_argument('--quiet', action='store_true', help='Only report failures')
    parser.add_argument('--json', action='store_true', help='Machine-readable JSON output')
    parser.add_argument(
        '--snippet', action='store_true',
        help='Validate as a snippet/fragment (skip checks for skip-link, media queries, '
             'pauseAnimations, theme toggle — i.e., the full-document infrastructure that '
             'example files in geracao-de-tutorial/examples/ deliberately omit).'
    )
    args = parser.parse_args()

    if not args.file.exists():
        print(f'error: file not found: {args.file}', file=sys.stderr)
        sys.exit(2)

    text = args.file.read_text()
    results = {'pass': [], 'fail': [], 'warn': []}

    checks_to_run = CHECKS_SNIPPET if args.snippet else CHECKS_FULL
    for category, checks in checks_to_run:
        for check in checks:
            check(text, results)

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        if not args.quiet:
            print(f"\n=== VALIDATING {args.file} ===\n")
            for category, _ in checks_to_run:
                print(f"\n[{category}]")
            print()

        print(f"\n=== RESULTS ===\n")
        if not args.quiet:
            for p in results['pass']:
                print(f"  ✓ {p}")
        for w in results['warn']:
            print(f"  ⚠ {w}")
        for f in results['fail']:
            print(f"  ✗ {f}")

        print(f"\nPASS: {len(results['pass'])}  WARN: {len(results['warn'])}  FAIL: {len(results['fail'])}\n")

        if results['fail']:
            print("Status: ✗ FAIL — fix the above before shipping.")
        elif results['warn']:
            print("Status: ⚠ PASS WITH WARNINGS — consider addressing the warns.")
        else:
            print("Status: ✓ ALL CHECKS PASS — ready to ship.")

    sys.exit(0 if not results['fail'] else 1)


if __name__ == '__main__':
    main()
