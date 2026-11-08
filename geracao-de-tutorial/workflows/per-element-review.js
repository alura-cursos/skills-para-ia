/* ============================================================================
   geracao-de-tutorial — per-element visual review workflow
   ============================================================================

   USAGE
   -----
   Reviews each visual element (animation, figure, widget) in your tutorial
   SEPARATELY for both correctness and visual beauty. Each agent gets a
   tight scope (just one element's line range) so they Read only the relevant
   slice — much faster than asking one reviewer to look at everything.

     Workflow({
       scriptPath: '/path/to/geracao-de-tutorial/workflows/per-element-review.js',
       args: {
         file: '/path/to/tutorial.html',
         elements: [
           { id: 'anim-market', name: 'Market-share animation', start: 100, count: 200 },
           { id: 'fig-1',     name: 'Figure 1',       start: 300, count: 150 },
           ...
         ]
       }
     })

   Use a small Python pass first to enumerate every <figure> and widget
   in your tutorial with line ranges (see SKILL.md Phase 6 for the snippet).

   Expected runtime: ~5 minutes. ~2N agent invocations for N elements.

   WHEN TO RUN
   -----------
   AFTER the multi-dim structural review passes with 0 critical findings.
   This is the polish-phase review — every element gets graded A-F.
   ============================================================================ */

export const meta = {
  name: 'tutorial-per-element-review',
  description: 'Per-element review of every animation, figure, and widget in a tutorial. Each agent scores one element on correctness + visual quality. Adversarial verify high/critical findings.',
  phases: [
    { title: 'Review',     detail: 'parallel per-element reviewers' },
    { title: 'Verify',     detail: 'adversarial verify high/critical findings' },
    { title: 'Synthesize', detail: 'aggregate confirmed issues by element' },
  ],
}

const FILE = (args && args.file) || '/path/to/tutorial.html'
const ELEMENTS = (args && args.elements) || []

// ============================================================================
// Schemas
// ============================================================================

const FINDING_SCHEMA = {
  type: 'object',
  properties: {
    element_id: { type: 'string' },
    correctness_findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          issue: { type: 'string' },
          evidence: { type: 'string', description: 'Verbatim file excerpt or computation' },
          fix: { type: 'string', description: 'Specific actionable fix (file, line, what to change)' },
        },
        required: ['severity', 'issue', 'evidence', 'fix']
      }
    },
    visual_findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
          issue: { type: 'string' },
          evidence: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['severity', 'issue', 'evidence', 'fix']
      }
    },
    overall_score: { type: 'string', enum: ['A', 'B', 'C', 'D', 'F'] },
    highlights: { type: 'string', description: 'What this element does well' },
    summary: { type: 'string' },
  },
  required: ['element_id', 'correctness_findings', 'visual_findings', 'overall_score', 'summary']
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
// Per-element prompt template
// ============================================================================

function buildPrompt(el) {
  const checks = (el.domain_checks || [
    'Verify all numerical claims match the underlying math',
    'Verify visual encoding matches the claimed semantics (e.g., bar heights match values)',
    'Verify color usage matches the project palette',
    'Verify accessibility metadata (title, desc, aria-labelledby) is descriptive',
  ]).map((c, i) => `  ${i+1}. ${c}`).join('\n')

  return `Review ONE visual element in ${FILE} for correctness AND visual quality. Be terse and surgical.

Element: ${el.name} (id: ${el.id})
Read JUST these lines: Read with offset=${el.start}, limit=${el.count}

Domain-specific checks for this element:
${checks}

Universal visual-quality checks:
  - Geometry: do coordinates math out? (axis ticks at right positions, bars sized correctly)
  - Color harmony: does the color palette match rest of doc (see CSS vars)?
  - Typography: font sizes appropriate, no clipped descenders, no overlapping labels
  - White space: not cramped, not too sparse
  - Hierarchy: most important info has strongest visual weight
  - Accessibility: role="img", aria-labelledby with title+desc that describes visual sufficiently
  - Animation timing (if applicable): cycle duration reasonable (4-8s), no jarring transitions

Severity:
  critical — wrong math, broken SVG, misrepresents the concept
  high — visual confusion that would mislead a learner
  medium — small inconsistency that polish would fix
  low — stylistic preference

Return findings via schema. For each finding INCLUDE the verbatim file excerpt as evidence. If everything looks great, return empty findings arrays and overall_score "A" with highlights describing what works.`
}

// ============================================================================
// Workflow
// ============================================================================

if (ELEMENTS.length === 0) {
  return { error: 'No elements provided. Pass `args.elements: [{id, name, start, count, domain_checks?}]`.' }
}

phase('Review')

const reviewedAndVerified = await pipeline(
  ELEMENTS,
  // Stage 1: review
  (el) => agent(buildPrompt(el), {
    label: `review:${el.id}`,
    phase: 'Review',
    schema: FINDING_SCHEMA,
    agentType: 'general-purpose',
  }),

  // Stage 2: adversarial verify high/critical findings
  async (review, original, idx) => {
    if (!review) return { element: original.id, status: 'agent-returned-null' }

    const allFindings = [
      ...(review.correctness_findings || []).map(f => ({ ...f, dimension: 'correctness' })),
      ...(review.visual_findings || []).map(f => ({ ...f, dimension: 'visual' })),
    ]
    const tier1 = allFindings.filter(f => f.severity === 'critical' || f.severity === 'high')
    const tier2 = allFindings.filter(f => f.severity === 'medium' || f.severity === 'low')

    if (tier1.length === 0) {
      return {
        element: original.id,
        name: original.name,
        score: review.overall_score,
        highlights: review.highlights,
        verified_findings: [],
        lower_tier_findings: tier2,
      }
    }

    const verdicts = await parallel(
      tier1.map(f => () => agent(
        `ADVERSARIAL VERIFIER. Refute this finding.

Element: ${original.name}
Lines: ${original.start}-${original.start + original.count}
Finding:
- Severity: ${f.severity}
- Dimension: ${f.dimension}
- Issue: ${f.issue}
- Evidence claimed: ${f.evidence}
- Recommended fix: ${f.fix}

Read the same line range from ${FILE} (offset=${original.start} limit=${original.count}) and INDEPENDENTLY verify. DEFAULT to is_real_issue=false unless you can confirm by quoting the file. If reviewer's verbatim evidence doesn't match the file, refute. If issue is actually a deliberate design choice consistent with the rest of the doc, refute.`,
        {
          label: `verify:${original.id}`,
          phase: 'Verify',
          schema: VERDICT_SCHEMA,
          agentType: 'general-purpose',
        }
      ))
    )

    return {
      element: original.id,
      name: original.name,
      score: review.overall_score,
      highlights: review.highlights,
      verified_findings: tier1.map((f, i) => ({ finding: f, verdict: verdicts[i] })),
      lower_tier_findings: tier2,
    }
  }
)

phase('Synthesize')

const synth = await agent(
  `Per-element review results for ${ELEMENTS.length} visual elements in ${FILE}.

INPUT:
${JSON.stringify(reviewedAndVerified, null, 2).slice(0, 250000)}

Produce the final punch list.

Rules:
- CONFIRMED only if: severity critical/high AND adversarial verifier said is_real_issue=true with high/medium confidence
- MINOR_POLISH if: medium finding with explicit file-cited evidence
- Group by element. For each confirmed bug, write a precise fix prescription.
- Highlight overall scores: which elements are A-grade, which need work.

Return JSON: { ship_blockers, important_fixes, minor_polish, element_scores, overall_health }`,
  {
    label: 'synthesize',
    phase: 'Synthesize',
    schema: {
      type: 'object',
      properties: {
        ship_blockers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              element: { type: 'string' },
              issue: { type: 'string' },
              fix: { type: 'string' },
            },
            required: ['element', 'issue', 'fix']
          }
        },
        important_fixes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              element: { type: 'string' },
              issue: { type: 'string' },
              fix: { type: 'string' },
            },
            required: ['element', 'issue', 'fix']
          }
        },
        minor_polish: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              element: { type: 'string' },
              issue: { type: 'string' },
              fix: { type: 'string' },
            },
            required: ['element', 'issue', 'fix']
          }
        },
        element_scores: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              element: { type: 'string' },
              score: { type: 'string' },
              note: { type: 'string' },
            },
            required: ['element', 'score']
          }
        },
        overall_health: { type: 'string' },
      },
      required: ['ship_blockers', 'important_fixes', 'minor_polish', 'element_scores', 'overall_health']
    },
    agentType: 'general-purpose',
  }
)

return synth
