# Color palette reference

Eight semantic-slot colors for equations, prose spans, and SVG figures in
Distill-class technical tutorials. The palette is **domain-neutral**: pick a
color for each *semantic role in your tutorial* — whatever your subject (a
metric, an entity, a positive/negative outcome, a boundary) — and use it
consistently across formula color-coding (`\textcolor{}`), prose annotations
(`<span class="term-COLOR">`), and animation fills/strokes.

> The colors are fixed; the **roles are yours to assign**. The example roles
> below are only suggestions, drawn from a few different domains.

## Dark mode (default)

| Color | Hex | CSS var / class | Example roles (assign your own) |
|---|---|---|---|
| Blue | `#7aa2f7` | `--term-blue` / `.term-blue` | the primary subject — the model, the request, the portfolio, the tracked entity |
| Green | `#10b981` | `--term-green` / `.term-green` | positive / chosen / success — a correct answer, a cache hit, a gain, target met |
| Yellow | `#fbbf24` | `--term-yellow` / `.term-yellow` | reference / baseline / measured value — a baseline metric, a mean, a budget |
| Orange | `#fb923c` | `--term-orange` / `.term-orange` | boundary / caution / adjustment — a threshold, a clip range, noise, a retry |
| Violet | `#8b5cf6` | `--term-violet` / `.term-violet` | weighting / regularization / distance — a penalty term, a trade-off weight, a divergence |
| Red | `#ef4444` | `--term-red` / `.term-red` | negative / failure / rejected — an error, a miss, a rejected option |
| Cyan | `#06b6d4` | `--term-cyan` / `.term-cyan` | transform / derived / secondary — a normalization, a projection, a derived metric |
| Magenta | `#ec4899` | `--term-magenta` / `.term-magenta` | the objective — the quantity being minimized or maximized (loss, cost, total score) |

## Light mode (auto-switched via `@media prefers-color-scheme: light`)

Same colors, darker shades that meet WCAG AA contrast on white.

| Color | Light hex |
|---|---|
| Blue | `#2057d8` |
| Green | `#047857` |
| Yellow | `#a16207` |
| Orange | `#c2410c` |
| Violet | `#6d28d9` |
| Red | `#b91c1c` |
| Cyan | `#0e7490` |
| Magenta | `#be185d` |

## Discipline rules

1. **Semantic, not decorative.** Pick the role first, then use its color. NEVER pick a color because "it looks nice here."

2. **Same role = same color everywhere.** If a symbol means the same thing in section 3 and section 11, it must be the same color in both. The reader's visual memory depends on it.

3. **Triple consistency.** When a term appears in (a) a formula, (b) prose, and (c) an animation, all three should use the same color. The reader's brain links them.

4. **One color per role per figure.** Don't use one color for two different concepts in the same figure — that overloads and confuses. If two concepts must share a color, give one a tint variation (e.g., 40% opacity band vs solid).

5. **Test both themes.** Yellow `#fbbf24` on white is only 1.6:1 contrast — fails WCAG. Always verify the light-mode hex passes contrast.

## Choosing how many colors

Most tutorials need 3–6 roles, not all 8. Start with blue (subject), green (positive), red (negative); add the others only when a new role genuinely recurs. Fewer colors used consistently beat eight colors used loosely.

## Quick reference CSS

```css
:root {
  --term-blue:    #7aa2f7;
  --term-green:   #10b981;
  --term-yellow:  #fbbf24;
  --term-orange:  #fb923c;
  --term-violet:  #8b5cf6;
  --term-red:     #ef4444;
  --term-cyan:    #06b6d4;
  --term-magenta: #ec4899;
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --term-blue:    #2057d8;
    --term-green:   #047857;
    --term-yellow:  #a16207;
    --term-orange:  #c2410c;
    --term-violet:  #6d28d9;
    --term-red:     #b91c1c;
    --term-cyan:    #0e7490;
    --term-magenta: #be185d;
  }
}
```

## In MathJax formulas

```tex
\[ \textcolor{#ec4899}{\mathcal{L}} =
   \sum \textcolor{#7aa2f7}{x_i}\,\textcolor{#10b981}{w_i} \]
```

(Here magenta = the objective, blue = the subject, green = a positive weight — your roles, your call.)

## In prose

```html
The <span class="term-blue">request</span> is served from the
<span class="term-green">cache</span> when the key is present.
```

## In SVG animations

```html
<rect fill="var(--term-green)" .../>
<text fill="var(--term-blue)" .../>
```

Or use hex directly if the SVG isn't theme-aware (e.g., backgrounds).
