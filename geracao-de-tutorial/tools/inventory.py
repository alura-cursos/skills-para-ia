#!/usr/bin/env python3
"""
geracao-de-tutorial — inventory.py
=============================
Enumerate every reviewable element (figures, animations, widgets) in a
tutorial HTML file and emit a JSON array suitable for use as the ELEMENTS
argument to workflows/per-element-review.js.

USAGE
-----
    python3 inventory.py path/to/tutorial.html
    python3 inventory.py path/to/tutorial.html --json > elements.json
    python3 inventory.py path/to/tutorial.html --markdown   # table for prose

OUTPUT (default)
----------------
JSON array with one entry per element:

    [
      {
        "id": "anim-market",
        "name": "Market-share animation",
        "type": "animation",
        "start": 741,
        "count": 191,
        "aria_label": "..."
      },
      ...
    ]

WHAT IT DETECTS
---------------
- <figure> elements (numbered figures + animation figures + unnumbered figures)
- <div class="widget" id="..."> elements (interactive widgets)
- aria-labelledby anchors (to identify each figure by its caption id)
- figcaption text (to extract the human-readable name)
"""

import re
import sys
import json
import argparse
from pathlib import Path


def find_figures(text):
    """Find every <figure> ... </figure> block. Returns list of dicts."""
    lines = text.split('\n')
    figures = []
    in_fig = False
    fig_start = None
    fig_lines = []

    for i, line in enumerate(lines, start=1):
        if not in_fig and '<figure' in line:
            in_fig = True
            fig_start = i
            fig_lines = [line]
        elif in_fig:
            fig_lines.append(line)
            if '</figure>' in line:
                figures.append({
                    'start': fig_start,
                    'end': i,
                    'count': i - fig_start + 1,
                    'content': '\n'.join(fig_lines),
                })
                in_fig = False
                fig_start = None
                fig_lines = []

    return figures


def find_widgets(text):
    """Find every <div class="widget" id="..."> ... </div> block (depth-balanced)."""
    lines = text.split('\n')
    widgets = []

    for i, line in enumerate(lines, start=1):
        if 'class="widget"' not in line:
            continue
        m = re.search(r'class="widget"[^>]*\bid="([^"]+)"', line)
        if not m:
            m = re.search(r'\bid="([^"]+)"[^>]*class="widget"', line)
        wid = m.group(1) if m else 'unknown-widget'

        depth = 1
        end = i
        for j in range(i, len(lines)):
            text_after = lines[j] if j == i - 1 else lines[j]
            # Count opens AFTER the initial widget div
            offset = lines[j].find('class="widget"') + 1 if j == i - 1 else 0
            search_in = lines[j][offset:] if j == i - 1 else lines[j]
            depth += len(re.findall(r'<div\b', search_in))
            depth -= len(re.findall(r'</div>', search_in))
            if depth == 0:
                end = j + 1
                break

        widgets.append({
            'start': i,
            'end': end,
            'count': end - i + 1,
            'id': wid,
            'content': '\n'.join(lines[i-1:end]),
        })

    return widgets


def classify_figure(fig):
    """Classify a figure as animation / numbered / unnumbered + extract id/name."""
    content = fig['content']

    m = re.search(r'aria-labelledby="([^"]+)"', content)
    aria = m.group(1) if m else ''
    primary_id = aria.split()[0] if aria else None

    # If no aria-labelledby, fall back to the <figure> tag's own id or the figcaption id
    if not primary_id:
        m = re.search(r'<figure[^>]*\bid="([^"]+)"', content)
        if m:
            primary_id = m.group(1)
    if not primary_id:
        m = re.search(r'<figcaption[^>]*\bid="([^"]+)"', content)
        if m:
            primary_id = m.group(1)
    if not primary_id:
        primary_id = 'no-aria'

    # Strip "-cap" suffix from aria-labelledby ids to get a cleaner element id
    # (since the cap id refers to the caption, not the visual element itself)
    clean_id = primary_id.replace('-cap', '') if primary_id.endswith('-cap') else primary_id

    is_animation = 'anim-' in clean_id
    fig_type = 'animation' if is_animation else 'figure'

    # Extract a clean name from the figcaption.
    # Capture the full figcaption text after any <strong>Figure N.</strong> prefix.
    cap_full_match = re.search(
        r'<figcaption[^>]*>\s*(?:<strong>\s*(?:Figure \d+\.|Animation:)\s*</strong>\s*)?\s*([^<\n]{0,150})',
        content
    )
    cap_text = ''
    if cap_full_match:
        cap_text = cap_full_match.group(1).strip()
        # Strip trailing period or comma if it looks like end-of-sentence
        cap_text = re.sub(r'\s*[\.\,]\s*$', '', cap_text)
        # Truncate at first sentence boundary
        if '.' in cap_text:
            cap_text = cap_text.split('.', 1)[0].strip()

    # Extract the figure number if present (from the <strong> prefix)
    fig_num_match = re.search(r'<figcaption[^>]*>\s*<strong>\s*Figure (\d+)\.', content)

    if is_animation:
        name = cap_text if cap_text else clean_id.replace('anim-', '').replace('-', ' ') + ' animation'
    elif fig_num_match:
        # Numbered figure — use "Figure N — <description>" (no duplication)
        n = fig_num_match.group(1)
        name = f"Figure {n} — {cap_text[:80]}" if cap_text else f"Figure {n}"
    else:
        name = cap_text[:80] or clean_id

    return {
        'id': clean_id,
        'name': name,
        'type': fig_type,
        'aria_label': aria,
    }


def main():
    parser = argparse.ArgumentParser(
        description='Enumerate reviewable elements in a tutorial HTML file.'
    )
    parser.add_argument('file', type=Path, help='Path to tutorial HTML file')
    parser.add_argument('--json', action='store_true', help='Emit JSON (default)')
    parser.add_argument('--markdown', action='store_true',
                        help='Emit a markdown table instead of JSON')
    args = parser.parse_args()

    if not args.file.exists():
        print(f'error: file not found: {args.file}', file=sys.stderr)
        sys.exit(1)

    text = args.file.read_text()
    figures = find_figures(text)
    widgets = find_widgets(text)

    elements = []

    for fig in figures:
        meta = classify_figure(fig)
        elements.append({
            'id': meta['id'],
            'name': meta['name'],
            'type': meta['type'],
            'start': fig['start'],
            'count': fig['count'],
            'aria_label': meta['aria_label'],
        })

    for w in widgets:
        elements.append({
            'id': w['id'],
            'name': w['id'].replace('widget-', '').replace('-', ' '),
            'type': 'widget',
            'start': w['start'],
            'count': w['count'],
            'aria_label': '',
        })

    elements.sort(key=lambda e: e['start'])

    if args.markdown:
        print('| # | id | type | name | lines |')
        print('|---|---|---|---|---|')
        for i, e in enumerate(elements, 1):
            print(f"| {i} | `{e['id']}` | {e['type']} | {e['name']} | {e['start']}–{e['start']+e['count']-1} ({e['count']} lines) |")
    else:
        print(json.dumps(elements, indent=2))

    print(f'\n# {len(elements)} elements: '
          f"{sum(1 for e in elements if e['type']=='animation')} animations, "
          f"{sum(1 for e in elements if e['type']=='figure')} figures, "
          f"{sum(1 for e in elements if e['type']=='widget')} widgets",
          file=sys.stderr)


if __name__ == '__main__':
    main()
