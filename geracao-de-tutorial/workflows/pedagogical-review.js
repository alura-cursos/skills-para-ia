/* ============================================================================
   geracao-de-tutorial — pedagogical review workflow
   ============================================================================

   USAGE
   -----
   Reviews the TUTORIAL for pedagogical quality (the THIRD review axis, after
   structural and visual). Asks: "is this tutorial actually GOOD AT TEACHING?"

     Workflow({
       scriptPath: '/path/to/geracao-de-tutorial/workflows/pedagogical-review.js',
       args: { file: '/path/to/tutorial.html' }
     })

   WHAT IT DOES
   -----------
   Fans out 8 parallel pedagogical-quality reviewers, each focused on one
   teaching dimension. Each finding gets adversarial verification. Synthesis
   produces a punch list of pedagogical improvements.

   Dimensions reviewed:
     1. Intuition layer presence (does every section start with prose, not formulas?)
     2. Worked-example completeness (do formulas get concrete arithmetic?)
     3. Reinforcement callbacks (does Layer 5 reference earlier concepts by name+color?)
     4. Glossary discipline (are glossary terms actually used in prose?)
     5. Audience-appropriate complexity (math complexity matches stated audience?)
     6. Worked-example faithfulness (do the worked numbers match what the formula gives?)
     7. Pedagogical ordering (do prerequisite concepts appear before they're used?)
     8. Concept reinforcement density (are key concepts revisited later?)

   Expected runtime: ~5-10 minutes.

   WHEN TO RUN
   -----------
   AFTER multi-dim-review.js and per-element-review.js pass. This is the final
   teaching-quality gate before declaring Distill-class.
   ============================================================================ */

export const meta = {
  name: 'tutorial-pedagogical-review',
  description: 'Pedagogical-quality review across 8 teaching dimensions, with adversarial verification.',
  phases: [
    { title: 'Review',     detail: '8 parallel pedagogical reviewers' },
    { title: 'Verify',     detail: 'Adversarial verify high/critical findings' },
    { title: 'Synthesize', detail: 'Aggregate confirmed teaching gaps' },
  ],
}

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
          location: { type: 'string' },
          issue: { type: 'string' },
          evidence: { type: 'string' },
          recommendation: { type: 'string' },
        },
        required: ['severity', 'location', 'issue', 'evidence', 'recommendation']
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

const DIMENSIONS = [
  {
    key: 'intuition-presence',
    title: 'Intuition layer presence',
    prompt: `Review ${FILE} for pedagogical Layer 1 (intuition before symbols).

For EVERY section that contains a formula (\\[ ... \\]):
1. Walk backwards from the formula to the section heading.
2. Verify there's at least one PROSE paragraph (no formulas, no symbols beyond the term-* glossary) explaining the concept BEFORE the formula appears.
3. The intuition should be plain-English and answer: "what is this thing, why does it matter?"

Flag as HIGH any section where the formula appears within 50 lines of the heading with NO intuition paragraph in between.
Flag as MEDIUM any section where intuition exists but is shorter than 2 sentences.
Flag as LOW any section where intuition is overly hedged ("we'll discuss" / "let's think about" / passive voice).

Return findings via schema with the section id and the exact line numbers.`,
  },
  {
    key: 'worked-examples',
    title: 'Worked-example completeness',
    prompt: `Review ${FILE} for pedagogical Layer 4 (worked examples).

For EVERY formula (display math \\[ ... \\] OR a substantial inline formula \\( ... \\) that introduces a new concept):
1. Find the nearest .callout.worked-example BELOW it (within the same section).
2. Verify the callout has CONCRETE ARITHMETIC (specific numbers, not symbolic).
3. Verify the arithmetic shows EVERY STEP (no "after simplification" or "and we get").
4. Verify the result is plausible (recompute it independently if simple).

Flag as CRITICAL any formula with no worked example AT ALL.
Flag as HIGH any worked example that hand-waves the arithmetic ("compute as you would expect").
Flag as MEDIUM any worked example whose numbers don't actually verify against the formula.

Return findings via schema. Include the formula and the verbatim worked-example text.`,
  },
  {
    key: 'reinforcement-callbacks',
    title: 'Reinforcement callbacks (Layer 5)',
    prompt: `Review ${FILE} for pedagogical Layer 5 (callbacks reinforcing earlier concepts).

Each section should END with a "Takeaway" paragraph that:
1. Uses the concept's NAME and COLOR vocabulary from above (look for term-* span usage).
2. Forward-references later sections where this idea appears next ("see §X for...").
3. Connects to previously introduced concepts ("recall §Y's...").

Flag as HIGH any section without a closing Takeaway paragraph.
Flag as MEDIUM any Takeaway that doesn't reference the concept's color/name from above.
Flag as LOW any Takeaway that just summarizes (no forward/backward links).

Bonus: check whether the document has "callback loops" — concepts introduced in §A that get reinforced in §B. List 2-3 examples found, and 2-3 missing connections.

Return findings via schema.`,
  },
  {
    key: 'glossary-discipline',
    title: 'Glossary terms actually used in prose',
    prompt: `Review ${FILE} for glossary usage discipline.

1. Find the glossary section (look for class="glossary" or id="glossary" or <dl> at the end).
2. Extract every <dt id="g-XXX"> term defined.
3. For each glossary term, count occurrences of <a class="gloss" href="#g-XXX"> in the prose.

Flag as MEDIUM any glossary term that is DEFINED but never linked from prose (stranded definition).
Flag as MEDIUM any technical term that appears 3+ times in prose but is NOT in the glossary (missing definition).
Flag as LOW any glossary term linked only once (probably under-used).

Return findings via schema with term name and counts.`,
  },
  {
    key: 'audience-complexity',
    title: 'Math complexity vs stated audience',
    prompt: `Review ${FILE} for math complexity matching the stated audience.

1. Find the audience statement (usually in §1 intro: "this tutorial assumes...").
2. Identify the most advanced math used in the body (calculus? linear algebra? measure theory? Just arithmetic?).
3. Verify the body math level matches the audience expectation.

Flag as HIGH any section using math the audience hasn't been told to expect (e.g., audience says "ML basics" but formula uses functional analysis).
Flag as MEDIUM any section where prerequisite math is used without a 1-line reminder.
Flag as LOW any section that over-explains math the audience clearly knows (verbose for the level).

Return findings via schema.`,
  },
  {
    key: 'worked-example-faithfulness',
    title: 'Do worked-example numbers actually verify?',
    prompt: `Review ${FILE} for worked-example mathematical faithfulness. This is the MOST IMPORTANT pedagogical check.

For EVERY .callout.worked-example in the document:
1. Read the setup ("given X, Y, Z").
2. Read the claimed result.
3. INDEPENDENTLY recompute every step yourself.
4. Flag mismatches.

Example check:
  Worked example says: "P(Paris)=0.30 → loss = -ln(0.30) ≈ 1.20"
  Verify: -ln(0.30) = 1.204 ✓
  Or: "β=5, margin=0.42-(-0.15)=0.57 → β·margin=2.85, σ(2.85)=0.946"
  Verify: 1/(1+exp(-2.85)) = 1/(1+0.0578) = 0.9454 ✓

Flag as CRITICAL any worked example with a computational error.
Flag as HIGH any worked example missing the intermediate steps that would let a reader verify.
Flag as MEDIUM any worked example whose final number disagrees with independent recomputation by >1%.

Return findings via schema. Include the worked example's setup, claimed result, and your recomputation.`,
  },
  {
    key: 'concept-ordering',
    title: 'Prerequisite concepts appear before they\'re used',
    prompt: `Review ${FILE} for concept ordering — do prerequisite concepts appear in the document BEFORE concepts that depend on them?

For each formula or section, identify the symbols/concepts it uses. Check whether each symbol/concept was:
- Introduced earlier in the document
- Defined in the glossary
- Standard notation the audience knows

Flag as HIGH any concept used before introduction (e.g., "π_θ" appears in §3 but isn't introduced until §5).
Flag as MEDIUM any forward-reference ("see §N for definition") where the reader has to jump ahead.
Flag as LOW any section that re-introduces something already covered (redundant, breaks flow).

Return findings via schema.`,
  },
  {
    key: 'reinforcement-density',
    title: 'Key concepts revisited often enough',
    prompt: `Review ${FILE} for concept reinforcement density.

Identify the 5-10 KEY concepts that the tutorial centers on (the ones with their own glossary entry + multiple sections). For each:
1. Count how many sections reference the concept (by name or by color-coded span).
2. Verify the concept is reinforced in AT LEAST 2 sections beyond the one it was introduced in.
3. Check whether the concept's color is reused consistently across those sections.

Flag as HIGH any KEY concept that is introduced in 1 section and never referenced again (under-reinforced).
Flag as MEDIUM any KEY concept whose color is used inconsistently across sections (visual memory breaks).
Flag as LOW any KEY concept reinforced ONLY through identical phrasing (no varied callback).

Return findings via schema with concept names and reference counts.`,
  },
]

phase('Review')

const reviewedAndVerified = await pipeline(
  DIMENSIONS,
  (d) => agent(
    d.prompt + `\n\nFile: ${FILE}\nUse Read tool. Severity:\n- critical: pedagogical failure (no intuition, wrong worked example, broken concept ordering)\n- high: significant teaching weakness\n- medium: small didactic gap\n- low: stylistic`,
    {
      label: `review:${d.key}`,
      phase: 'Review',
      schema: FINDING_SCHEMA,
      agentType: 'general-purpose',
    }
  ),
  async (review, original) => {
    if (!review || !review.findings || review.findings.length === 0) {
      return { dimension: original.key, verified: [], summary: 'no findings' }
    }
    const tier1 = review.findings.filter(f => f.severity === 'critical' || f.severity === 'high')
    const tier2 = review.findings.filter(f => f.severity === 'medium' || f.severity === 'low')

    const verdicts = await parallel(
      tier1.map(f => () => agent(
        `ADVERSARIAL VERIFIER. Refute this pedagogical finding.

Finding:
- Dimension: ${original.title}
- Location: ${f.location}
- Issue: ${f.issue}
- Evidence claimed: ${f.evidence}
- Recommendation: ${f.recommendation}

Read ${FILE} at the cited location. DEFAULT to is_real_issue=false unless you can independently confirm. Pedagogical claims are subjective — refute strongly if the original finding is stylistic preference rather than teaching defect.`,
        { label: `verify:${original.key}`, phase: 'Verify', schema: VERDICT_SCHEMA, agentType: 'general-purpose' }
      ))
    )

    return {
      dimension: original.key,
      title: original.title,
      verified: tier1.map((f, i) => ({ finding: f, verdict: verdicts[i] })),
      lower_tier: tier2,
      overall: review.overall_assessment,
    }
  }
)

phase('Synthesize')

const synth = await agent(
  `Pedagogical review results across 8 dimensions. Produce final teaching-quality punch list.

INPUT:
${JSON.stringify(reviewedAndVerified, null, 2).slice(0, 200000)}

Rules:
- TEACHING_GAPS_CONFIRMED if: critical/high AND verifier confirmed
- DEFERRED if: refuted or stylistic only
- Group by dimension. For each confirmed gap, write a specific, action-oriented teaching improvement.

Return JSON: { teaching_gaps_confirmed, deferred, overall_pedagogical_health }`,
  {
    label: 'synthesize',
    phase: 'Synthesize',
    schema: {
      type: 'object',
      properties: {
        teaching_gaps_confirmed: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              dimension: { type: 'string' },
              location: { type: 'string' },
              issue: { type: 'string' },
              fix: { type: 'string' },
              severity: { type: 'string' },
            },
            required: ['dimension', 'location', 'issue', 'fix'],
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
            required: ['location', 'issue', 'reason'],
          }
        },
        overall_pedagogical_health: { type: 'string' },
      },
      required: ['teaching_gaps_confirmed', 'deferred', 'overall_pedagogical_health'],
    },
    agentType: 'general-purpose',
  }
)

return synth
