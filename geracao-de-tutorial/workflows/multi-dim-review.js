/* ============================================================================
   geracao-de-tutorial — multi-dimensional structural review workflow
   ============================================================================

   USAGE
   -----
   This is a Workflow tool script. To run it:

     Workflow({
       scriptPath: '/path/to/geracao-de-tutorial/workflows/multi-dim-review.js',
       args: { file: '/path/to/your/tutorial.html' }
     })

   WHAT IT DOES
   -----------
   Fans out 10 parallel dimension-specific reviewer agents over your tutorial
   HTML file, each focused on one quality axis. Each finding flagged as
   critical/high gets independently checked by an adversarial verifier whose
   job is to refute the claim. Final synthesis produces a punch list with
   confirmed bugs vs deferred items.

   Expected runtime: ~5-10 minutes. ~10-30 agent invocations.

   WHEN TO RUN
   -----------
   After the tutorial is structurally complete (all sections drafted, all
   formulas placed, all figures authored) but BEFORE shipping. Run again
   after applying fixes. Repeat until 0 critical findings.
   ============================================================================ */

export const meta = {
  name: 'tutorial-multi-dim-review',
  description: '10-dimensional structural review of an HTML tutorial with adversarial verification. Produces punch list of confirmed bugs.',
  phases: [
    { title: 'Review',     detail: '10 parallel dimension-specific reviewers' },
    { title: 'Verify',     detail: 'Adversarial verify high/critical findings' },
    { title: 'Synthesize', detail: 'Aggregate confirmed issues into punch list' },
  ],
}

// ============================================================================
// Configuration
// ============================================================================

const FILE = (args && args.file) || '/path/to/tutorial.html'

const FINDING_SCHEMA = {
  type: 'object',
  properties: {
    dimension: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          location: { type: 'string', description: 'line number, section, or selector' },
          issue: { type: 'string', description: 'concise description of what is wrong' },
          evidence: { type: 'string', description: 'verbatim quote or specific reference proving the issue exists' },
          recommendation: { type: 'string', description: 'specific actionable fix' },
          how_to_verify: { type: 'string', description: 'how a fresh reviewer could check this independently in <30s' },
        },
        required: ['severity', 'location', 'issue', 'evidence', 'recommendation', 'how_to_verify']
      }
    },
    overall_assessment: { type: 'string' }
  },
  required: ['dimension', 'findings', 'overall_assessment']
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    is_real_issue: { type: 'boolean' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    refutation_or_confirmation: { type: 'string' },
    revised_severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'not-a-bug'] },
  },
  required: ['is_real_issue', 'confidence', 'refutation_or_confirmation', 'revised_severity']
}

// ============================================================================
// The 10 review dimensions
// ============================================================================

const DIMENSIONS = [
  {
    key: 'html-structure',
    title: 'HTML/CSS structural validity',
    prompt: `You are reviewing FILE (${FILE}) for HTML structural validity. Be EXHAUSTIVE.

Check for:
1. Duplicate ids anywhere in the document (use grep + Python to count instances of each id="...")
2. Tag mismatches that simple counts wouldn't catch (e.g., <div> closed as </section>)
3. Invalid self-closing on elements that don't accept it
4. Attribute syntax errors (quotes, malformed values)
5. Nested <a> tags or <button> inside <button>
6. <style> or <script> outside <head> or end-of-body where they could break parsing
7. HTML5-invalid attribute names (e.g., aria typos like aria-labeledby)
8. <figure> elements that lack a figcaption when one is expected
9. ARIA references (aria-labelledby="X Y") where X or Y is not a valid id in the doc

Read the file. Return findings via the schema. Report ONLY real issues, not stylistic preferences.`,
  },
  {
    key: 'mathjax-tex',
    title: 'MathJax/TeX correctness',
    prompt: `You are reviewing FILE (${FILE}) for MathJax/TeX rendering correctness.

Check for:
1. Every \\[ has a matching \\] (counts should be equal)
2. Every \\( has a matching \\) (counts should be equal)
3. Inside each color-coded formula, brace nesting of \\textcolor{#X}{Y} is balanced
4. Any \\textcolor / \\cssId / \\class macros — verify they don't require an extension the page hasn't loaded
5. Unescaped underscores or special chars inside \\textcolor{}{} second arg that would break TeX
6. \\textcolor color values: all valid hex codes? Consistent across formulas (e.g., π_θ ALWAYS the same blue)?
7. \\lt and \\gt — supported (yes, in display math, but verify)
8. Worked examples — do inline \\(...\\) fragments all parse?

For each finding: include exact line number, verbatim TeX excerpt, and rendering failure mode.`,
  },
  {
    key: 'css-rules',
    title: 'CSS rule completeness and correctness',
    prompt: `You are reviewing FILE (${FILE}) for CSS correctness around equation-term color classes.

Check for:
1. Every CSS .term-X class defined has at least one use in the body, AND every <span class="term-X"> used in body has a corresponding CSS rule. Cross-reference.
2. The hover ::after tooltip CSS — confirm max-width with width: max-content is legal combination
3. mjx-mi[title]:hover doesn't conflict with anything
4. .term-* spans use color: <hex> — !important necessary or fighting another rule?
5. Light mode (@media prefers-color-scheme: light) — do new .term-* color rules have light-mode overrides? If not, tooltips and colored text will be same hex in light mode (probably still legible but inconsistent with rest of file's light-mode discipline).
6. CSS for animations inside SVG <style> tags — does anything cascade into the page from those scoped <style> blocks? (Browsers generally don't isolate <style> inside <svg>. So @keyframes names become global.)
7. Risk of @keyframes name collisions between animations
8. CSS rules referencing classes/ids that don't exist?

Output via schema.`,
  },
  {
    key: 'js-correctness',
    title: 'JavaScript correctness',
    prompt: `You are reviewing FILE (${FILE}) for JS correctness, especially math symbol tooltip handler.

Check for:
1. Does it wait for MathJax to finish typesetting before walking DOM? (window.MathJax.startup.promise)
2. Does SYMBOL_TIPS handle the case where MathJax renders a glyph with a different unicode codepoint than expected (e.g., 𝔼 U+1D53C vs E U+0045 + mathvariant attr)?
3. Are there other <script> blocks that might race with this one?
4. Is the page's window.MathJax config complete enough that startup.promise resolves? Or might it never resolve?
5. Does JS run if MathJax content gets re-typeset (e.g., theme switch)?
6. setTimeout fallback chain — safe if MathJax loads after 4s?
7. console.log calls — fine for production?
8. Other JS in the document (theme toggle, copy buttons, scroll spy, widgets) — any interaction with this code?

Output via schema. Include verbatim JS snippets in evidence.`,
  },
  {
    key: 'svg-animations',
    title: 'SVG animation validity',
    prompt: `You are reviewing FILE (${FILE}) for animated SVG figures.

For each animation, check:
1. CSS @keyframes defined reference target elements that exist by id/class in same SVG
2. Animation references (e.g., #bar-X) match actual SVG element ids
3. viewBox set correctly to contain all animated content
4. <animate> SMIL elements (if any) have valid attribute lists. CRITICAL: NO attributeName="textContent" (invalid; only XML attributes can be SMIL-animated)
5. @keyframes animating SVG geometric attributes (x, y, width, height, cx, cy): browsers vary. Note Safari compatibility concerns.
6. CSS variables (var(--accent)) referenced inside SVG — does the SVG's <style> scope leak :root to document? CRITICAL bear trap.
7. Animation cycles reasonable (no animations burning CPU at high rates)
8. prefers-reduced-motion — CSS handles only @keyframes. SMIL <animate> needs JS pauseAnimations(). Check both are handled.
9. Sweeper/follower dots — if sweeper uses ease-in-out, do follower <animate> calcMode="spline" + matching keySplines?

Output via schema.`,
  },
  {
    key: 'color-consistency',
    title: 'Color coding semantic consistency',
    prompt: `You are reviewing FILE (${FILE}) for color-coding consistency across color-coded formulas and animation SVGs.

Map each color (e.g., #7aa2f7 = the "subject" blue, #10b981 = the "positive" green, etc.).

Check for:
1. Within a SINGLE formula, is any symbol given two different colors?
2. Across formulas, is the same SEMANTIC role (e.g., "the subject") always the same color?
3. Color reuse: documented as intentional or confusing? E.g., two distinct roles sharing one color.
4. In animations, do colors match the formula color coding? E.g., an animation should color its "positive" markers with the same green used in the formula.
5. The cheatsheet table (notation list) — does it use term-* color highlights or stay plain?

Output via schema. For each finding, quote conflicting lines.`,
  },
  {
    key: 'accessibility',
    title: 'Accessibility (ARIA, keyboard, contrast)',
    prompt: `You are reviewing FILE (${FILE}) for accessibility.

Check for:
1. Color contrast — .term-* colors on dark/light backgrounds. WCAG AA contrast ≥ 4.5:1 for normal text, ≥ 3:1 for bold/large. Calculate for key colors.
2. Hover tooltips with pointer-events:none — keyboard-only users can't see them. Cheatsheet covers it?
3. JS sets title="..." on mjx-mi elements — these aren't focusable by default. Need tabindex="0".
4. Each animation SVG — aria-labelledby referencing title + desc. Are titles+descs descriptive enough for screen-reader user?
5. Animations run constantly (infinite loops). prefers-reduced-motion users should get static state.
6. Color-coding alone communicates info (WCAG 1.4.1). Are term-* spans also bolded?
7. Glossary anchors and term-* spans — both have hover content but distinct cues?

Output via schema.`,
  },
  {
    key: 'cross-refs',
    title: 'Cross-references, anchors, figure numbering',
    prompt: `You are reviewing FILE (${FILE}) for cross-reference consistency.

Check for:
1. Every <a href="#X"> resolves to an element with id="X"
2. Every aria-labelledby="X Y" resolves
3. Figure 1-N numbering is consistent in the order figures appear
4. Any text "see Figure N" — does N match actual numbering?
5. Glossary terms: every class="gloss" link's href resolves to a defined glossary anchor
6. New animations — do any prose paragraphs cross-reference them by name or section? If yes, do refs resolve?
7. Cheatsheet (notation <dl>) at top of math sections — does it use term-* spans correctly?

Output via schema. Use grep-style exhaustive enumeration.`,
  },
  {
    key: 'content-factual',
    title: 'Mathematical and factual correctness',
    prompt: `You are reviewing FILE (${FILE}) for FACTUAL/MATHEMATICAL correctness. This is the most important review.

Check every animated SVG:
- Verify all claimed numerical values match independent recomputation
- Verify probability conservation: do bars summing to "P=1" actually sum to the axis length?
- Verify formula constants: do labeled values like "ε=0.2" appear correctly in keyframes?
- Verify coordinate accuracy: derive coordinates from the math and check the SVG

Check every worked-example callout:
- Verify the arithmetic step by step
- Verify the final result

Check every figure's <desc> claims (color, content, semantics) match what the SVG actually renders.

Output via schema. For each finding: include verbatim claim and independent recomputation.`,
  },
  {
    key: 'responsive-print',
    title: 'Responsive, print, light mode, reduced motion',
    prompt: `You are reviewing FILE (${FILE}) for cross-context display.

Check for:
1. @media (prefers-color-scheme: light) — confirm new .term-* color rules don't break light mode. Yellow #fbbf24 visible on light bg? Orange #fb923c visible?
2. Animation SVGs hardcode hex colors (e.g., fill="#161922" for SVG background) — these won't switch in light mode.
3. @media print — disabling animations? Hiding chrome (theme toggle, progress bar)?
4. @media (prefers-reduced-motion: reduce) — currently animations always loop. Add rule to pause when set.
5. Responsive: animation SVGs have width:100%; max-width:820px. On 320px mobile, text labels readable? (SVG text scales with SVG, not viewport.)
6. .term-X span tooltips position:absolute. On small screens, do they extend off-screen?

Output via schema.`,
  },
]

// ============================================================================
// Workflow
// ============================================================================

phase('Review')

const reviewedAndVerified = await pipeline(
  DIMENSIONS,
  // Stage 1: review
  (d) => agent(
    d.prompt + `\n\nFile: ${FILE}\nUse Read tool to load the file. Be thorough. Severity guide:\n- critical: renders incorrectly, breaks page, factual error\n- high: noticeably degraded experience, accessibility violation\n- medium: small visual/UX issue\n- low: stylistic preference`,
    {
      label: `review:${d.key}`,
      phase: 'Review',
      schema: FINDING_SCHEMA,
      agentType: 'general-purpose',
    }
  ),

  // Stage 2: adversarial verify high/critical findings
  async (review, original, idx) => {
    if (!review || !review.findings || review.findings.length === 0) {
      return { dimension: original.key, verified: [], summary: 'no findings' }
    }
    const tier1 = review.findings.filter(f => f.severity === 'critical' || f.severity === 'high')
    const tier2 = review.findings.filter(f => f.severity === 'medium' || f.severity === 'low')

    const verifiedTier1 = await parallel(
      tier1.map(f => () => agent(
        `You are an ADVERSARIAL VERIFIER. Your job is to REFUTE this finding from a code review of ${FILE}.

Finding to refute:
- Dimension: ${original.title}
- Location: ${f.location}
- Issue: ${f.issue}
- Evidence claimed: ${f.evidence}
- Recommendation: ${f.recommendation}
- How to verify: ${f.how_to_verify}

You must INDEPENDENTLY verify by reading the file at the cited location. DEFAULT TO is_real_issue=false unless you can independently confirm the issue exists exactly as described. Do not take the reviewer's word for the evidence — verify the verbatim quote yourself.

If reviewer's evidence quote does not match the file, refute. If cited location does not contain the claimed problem, refute. If the issue is actually correct behavior or deliberate choice, refute.`,
        {
          label: `verify:${original.key}:${f.severity}`,
          phase: 'Verify',
          schema: VERDICT_SCHEMA,
          agentType: 'general-purpose',
        }
      ))
    )

    return {
      dimension: original.key,
      title: original.title,
      verified: tier1.map((f, i) => ({ finding: f, verdict: verifiedTier1[i] })),
      lower_tier: tier2,
      overall: review.overall_assessment,
    }
  }
)

phase('Synthesize')

const synth = await agent(
  `You have review-and-verify results for ${FILE} across 10 dimensions. Produce the final punch list.

INPUT:
${JSON.stringify(reviewedAndVerified, null, 2).slice(0, 200000)}

Rules:
- Include in CONFIRMED_BUGS if: critical/high AND verifier said is_real_issue=true with confidence high/medium
- Include in DEFERRED if: low-priority stylistic, or high/critical that verifier refuted (false positive)
- For each CONFIRMED_BUG: one-sentence fix prescription specific enough for a coder to implement without re-reading the file

Return JSON: { confirmed_bugs: [{location, issue, fix}], deferred: [{location, issue, reason}], overall_health }`,
  {
    label: 'synthesize',
    phase: 'Synthesize',
    schema: {
      type: 'object',
      properties: {
        confirmed_bugs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              dimension: { type: 'string' },
              location: { type: 'string' },
              issue: { type: 'string' },
              fix: { type: 'string' },
              severity: { type: 'string' }
            },
            required: ['dimension', 'location', 'issue', 'fix']
          }
        },
        deferred: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              location: { type: 'string' },
              issue: { type: 'string' },
              reason: { type: 'string' },
            },
            required: ['location', 'issue', 'reason']
          }
        },
        overall_health: { type: 'string' }
      },
      required: ['confirmed_bugs', 'deferred', 'overall_health']
    },
    agentType: 'general-purpose',
  }
)

return synth
