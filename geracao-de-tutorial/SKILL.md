---
name: geracao-de-tutorial
description: Constrói um tutorial HTML autocontido, rigoroso, didático e visualmente belo — acabamento de nível Distill para qualquer receita técnica, metodologia, resultado de pesquisa ou conceito educacional. Use quando o usuário quiser ensinar um conceito técnico ou pedir para criar um tutorial (por exemplo, "crie um tutorial sobre..."). Produz um tutorial de página única com explicações que priorizam a intuição, equações com código de cores, SVGs geométricos animados, widgets interativos, acessibilidade completa e dark/light mode. Inclui 26 arquivos de exemplo em 5 gêneros (math, algorithm, architecture, recipe, research) cobrindo 5 padrões de animação e 9 padrões de figura, mais 3 workflows de revisão, ferramentas de validação (validate.py roda 21 checagens) e docs de referência. Os padrões são agnósticos a domínio — os assuntos abrangem economia, programação, design, ciência e web performance.
---

# geracao-de-tutorial — construa um tutorial técnico de nível Distill

## Mapa de arquivos desta skill

```
geracao-de-tutorial/                           ~9,350 lines across 37 files
├── SKILL.md                              ← you are here (methodology + pointers)
│
├── starters/                             ← copy these to fork a new tutorial
│   ├── boilerplate.html                  HTML scaffold (header/main/footer/TOC/skip-link/theme-toggle)
│   ├── infrastructure.css                Full CSS infrastructure (~780 lines, 16 sections)
│   └── infrastructure.js                 Vanilla JS (theme, scroll-spy, math tooltips, reduced-motion)
│
├── examples/                             ← read for patterns, copy as templates
│   │
│   │  -- ANIMATIONS (5 patterns) --
│   ├── animation-3phase.html             Discrete states fade in sequence (market share, 3 quarters)
│   ├── animation-sweeper.html            Continuous param + multiple followers (adoption S-curve)
│   ├── animation-sequential-reveal.html  Elements appear one by one + stay (CI/CD pipeline)
│   ├── animation-tracker-curve.html      Tracker follows a drawn path (temperature over 24h)
│   ├── animation-before-after.html       Interactive toggle (UI redesign before/after)
│   │
│   │  -- STATIC FIGURES (9 patterns) --
│   ├── figure-architecture.html          Boxes + arrows + tiers + latency budget
│   ├── figure-lineage-tree.html          Active vs dead branches (git branch tree)
│   ├── figure-trajectory.html            Multi-metric trajectory over stages (product milestones)
│   ├── figure-comparison.html            Side-by-side 3-column comparison
│   ├── figure-sequence-diagram.html      UML-style message exchanges between actors over time
│   ├── figure-state-machine.html         States + transitions (protocol / lifecycle modeling)
│   ├── figure-heatmap.html               2D matrix viz (sales grid, risk matrix, correlation table)
│   ├── figure-network.html               Undirected nodes + edges (supply-chain / trade network)
│   ├── figure-flowchart.html             Decision tree / branching logic with labeled YES/NO
│   │
│   │  -- WIDGETS (1 pattern) --
│   ├── widget-interactive.html           Slider + chart + readout (law of large numbers)
│   │
│   │  -- SECTION TEMPLATES (7 — covers all 5 genres + intro + appendix) --
│   ├── section-intro.html                Opening section (§1: goal, prerequisites, conventions)
│   ├── section-complete.html             Math genre (KL divergence — forecasting; all 5 layers)
│   ├── section-algorithm.html            Algorithm genre (binary search; pseudocode + complexity)
│   ├── section-architecture.html         System genre (API request lifecycle; failure modes)
│   ├── section-recipe.html               Recipe genre (Stage 1 caching; KPIs + bear traps)
│   ├── section-research.html             Research-finding genre (caching-ablation finding; methodology lesson)
│   ├── section-appendix.html             Closing appendix (bear traps + glossary + refs + limitations)
│   │
│   │  -- WORKED-EXAMPLE CALLOUTS (3 standalone genres) --
│   ├── worked-example-algorithm.html     Algorithm trace template (quicksort)
│   ├── worked-example-system.html        System trace template (Stripe webhook through SQS)
│   ├── worked-example-recipe.html        Optimization-run template (Stage 3 DB indexing)
│   │
│   │  -- ANTI-PATTERN REFERENCE --
│   └── anti-patterns.html                Gallery of BAD/GOOD pairs (probability conservation,
│                                          SMIL textContent, :root leaks, color overload, ...)
│
├── workflows/                            ← runnable review pipelines (3 quality axes)
│   ├── multi-dim-review.js               STRUCTURAL: 10-dimension HTML/CSS/JS/SVG/colors/...
│   ├── per-element-review.js             VISUAL: per-figure review with A-F scoring
│   └── pedagogical-review.js             TEACHING: 8-dimension intuition/examples/glossary/...
│
├── tools/                                ← Python helpers (tested against the shipped examples)
│   ├── inventory.py                      Enumerate figures + widgets with line ranges (JSON output)
│   └── validate.py                       Shipping checklist validator (--snippet for example files,
│                                          --json for machine output, exit code 0/1)
│
└── reference/                            ← deep-dive reference docs
    ├── color-palette.md                  Canonical semantic colors (dark + light hex)
    └── deployment.md                     Hosting + graceful degradation + analytics + versioning
```

**Sempre leia os arquivos relevantes ao invocar esta skill.** Eles contêm código que, do contrário, você teria que inventar.

---

## Quando usar esta skill

- O usuário quer **ensinar um conceito técnico** — metodologia, resultado de pesquisa, algoritmo, receita.
- O usuário quer um **artefato de página única, autocontido e portátil** (um arquivo HTML, sem etapa de build).
- Escopo razoável: um **tutorial HTML de 3-15k linhas** explicando de 5 a 20 conceitos distintos.
- O público é **técnico** (engenheiro, pesquisador, estudante avançado) — não iniciantes absolutos.
- O usuário valoriza **qualidade visual + pedagógica** no nível de Distill ou 3Blue1Brown.

## Quando NÃO usar

- README ou how-to curto (markdown já basta).
- Documento de referência para consulta, não para leitura linear.
- Notebook vivo que reexecuta computações (use Jupyter, Observable, Streamlit).
- Site com múltiplas páginas (esta skill pressupõe saída em arquivo único).

---

## O modelo mental: scaffold pedagógico de 5 camadas

Todo conceito que vale a pena explicar recebe as mesmas cinco camadas. **Não pule nenhuma.**

```
┌─────────────────────────────────────────────────────────┐
│ 1. INTUITION   (prose)                                  │
│    Plain-English statement of what the concept does     │
│    and why it matters. No formulas yet.                 │
├─────────────────────────────────────────────────────────┤
│ 2. GEOMETRY    (animated SVG or figure)                 │
│    A visualization showing the SHAPE of the concept     │
│    before the symbols. 3Blue1Brown style.              │
├─────────────────────────────────────────────────────────┤
│ 3. FORMULA / PSEUDOCODE / COMPONENTS                    │
│    Math (math genre), pseudocode (algorithm),           │
│    components+data flow (system), recipe table (recipe),│
│    method+evidence (research).                          │
├─────────────────────────────────────────────────────────┤
│ 4. WORKED EXAMPLE  (.callout.worked-example)            │
│    Real numbers from a real scenario. Step-by-step.     │
├─────────────────────────────────────────────────────────┤
│ 5. REINFORCEMENT (callbacks, takeaway, recap)           │
│    Reuse the concept's color, name, and shape later.    │
└─────────────────────────────────────────────────────────┘
```

Um leitor que pule QUALQUER camada isolada ainda consegue entender. Um leitor que leia TODAS AS CINCO consolida. **Redundância em camadas.**

A camada 3 especificamente se adapta por gênero. Os gêneros têm templates de seção correspondentes em `examples/`. Veja **Scaffolds específicos por tópico** mais abaixo.

**As seções de Intro e Apêndice** não usam o scaffold de 5 camadas — elas orientam e referenciam. Veja `examples/section-intro.html` e `examples/section-appendix.html` para suas estruturas distintas.

---

## Fase 0: Prepare o projeto a partir dos starters

```bash
SKILL_DIR=$HOME/.claude/skills/geracao-de-tutorial  # path to this skill's folder; adjust if installed elsewhere
cp $SKILL_DIR/starters/boilerplate.html        ./tutorial.html
cp $SKILL_DIR/starters/infrastructure.css      ./infrastructure.css
cp $SKILL_DIR/starters/infrastructure.js       ./infrastructure.js
```

Edite `boilerplate.html` para embutir o CSS/JS inline (entrega em arquivo único) ou para linká-los externamente. O tutorial de referência é single-file por portabilidade.

---

## Fase 1: Planeje o documento

### 1.1 Público e pré-requisitos
Uma frase. "Este tutorial pressupõe que o leitor conhece X, mas não Y." Fixe no topo.

### 1.2 Estrutura de seções (TOC)
8-15 seções `<h2>`, estruturadas como: **§1 Intro** (use o template `examples/section-intro.html`) → seções de conceito/receita/sistema/algoritmo (uma por conceito) → **§N Apêndice** (use o template `examples/section-appendix.html`).

### 1.3 Paleta de cores
Atribua uma cor a cada **papel semântico**. **A decisão de design mais importante.** Veja `reference/color-palette.md`.

### 1.4 Voz e tom
Direto, técnico, sem rodeios. Imperativo para instruções. Honesto sobre incertezas.

Por padrão, gere o tutorial em si em português (pt-BR) para este público brasileiro — ou no idioma que o usuário pedir. Isso é independente do idioma deste arquivo de skill.

---

## Fase 2: Fundação

Os starter files em `starters/` fornecem:
- **`boilerplate.html`** — scaffold HTML (header, hero KPI cards, TOC sidebar, main, footer; MathJax CDN; skip-link; theme toggle; reading progress; back-to-top).
- **`infrastructure.css`** — stylesheet de produção com 16 seções (variables, light/dark/print/reduced-motion, acessibilidade, classes de termos de equação com hover tooltips, callouts, pipeline-mini, KPI cards, sparklines, tabelas, code blocks, cheatsheet, glossário, TOC sidebar, controles de tema, overrides responsivos).
- **`infrastructure.js`** — Vanilla JS (theme toggle com localStorage, reading progress, back-to-top, scroll-spy, copy-to-clipboard, pós-processador de tooltip de símbolos matemáticos com detecção de mathvariant, handler de SMIL para prefers-reduced-motion).

Leia cada starter para entender o que já vem pronto antes de customizar.

---

## Fase 3: Escrevendo cada seção

### 3.1 Escolha o template de seção certo

| Gênero | Template | Forma da camada 3 |
|---|---|---|
| Intro (§1) | `section-intro.html` | (sem 5 camadas; orientação) |
| Conceito matemático | `section-complete.html` | Fórmula com código de cores |
| Algoritmo | `section-algorithm.html` | Pseudocódigo + callout de complexidade |
| Sistema / arquitetura | `section-architecture.html` | Diagrama de componentes + fluxo de dados |
| Receita / metodologia | `section-recipe.html` | Tabelas de dados + parâmetros |
| Resultado de pesquisa | `section-research.html` | Tabela de método + evidências |
| Apêndice (§N) | `section-appendix.html` | (sem 5 camadas; referência) |

### 3.2 Esqueleto de seção (seções de conceito)

```html
<section id="sN-concept" class="section">
  <h2 id="sN-concept-h">N. Section Title</h2>

  <p class="pipeline-mini" aria-label="You are here">
    <span class="step done">Previous</span>
    <span class="step active">This concept</span>
    <span class="step">Next</span>
  </p>

  <p class="callout">
    <strong>What you'll learn:</strong> [single-sentence objective].
  </p>

  <!-- Layer 1: intuition -->
  <p>[Plain-English statement.]</p>

  <!-- Layer 2: geometric figure or animation -->
  <figure role="figure" aria-labelledby="..."> ... </figure>

  <!-- Layer 3: formula / pseudocode / components -->
  ...

  <!-- Layer 4: worked example -->
  <div class="callout worked-example"> ... </div>

  <!-- Layer 5: takeaway + callback -->
  <p><strong>Takeaway.</strong> [One sentence using the concept's color + name.]</p>
</section>
```

### 3.3 Âncoras de glossário

```html
<a class="gloss" href="#g-X">term</a>
<!-- ... -->
<dl class="glossary"><dt id="g-X">Term</dt><dd>definition</dd></dl>
```

---

## Fase 4: Elementos visuais

### 4.1 Padrões de animação (5 disponíveis)

| Padrão | Quando usar | Template |
|---|---|---|
| 3-phase | Estados discretos se alternam | `examples/animation-3phase.html` |
| Sweeper + follower | Parâmetro contínuo + saídas derivadas | `examples/animation-sweeper.html` |
| Sequential reveal | Elementos aparecem um a um e permanecem | `examples/animation-sequential-reveal.html` |
| Tracker on curve | Ponto segue um caminho desenhado | `examples/animation-tracker-curve.html` |
| Before/after toggle | Comparação binária controlada pelo leitor | `examples/animation-before-after.html` |

**Regras universais de animação**:
1. CSS @keyframes, não SMIL (bear trap B.3).
2. Escope as CSS variables em `#anim-X-fig`, NUNCA em `:root` (bear trap B.1).
3. A codificação visual corresponde à matemática; derive cada coordenada (bear trap B.7).
4. Reutilize a paleta de cores do projeto.
5. Loop de 4-8 segundos.
6. role="img" + aria-labelledby → title + desc.

### 4.2 Padrões de figura estática (9 disponíveis)

| Padrão | Quando usar | Template |
|---|---|---|
| Architecture | Caixas + setas + camadas + anotações de latency | `examples/figure-architecture.html` |
| Lineage tree | Branches ativos vs. mortos | `examples/figure-lineage-tree.html` |
| Trajectory plot | Múltiplas métricas ao longo de estágios | `examples/figure-trajectory.html` |
| Comparison | Comparação lado a lado de 2-3 colunas | `examples/figure-comparison.html` |
| Sequence diagram | Atores UML + mensagens ao longo do tempo | `examples/figure-sequence-diagram.html` |
| State machine | Estados + transições (protocolos, ciclos de vida) | `examples/figure-state-machine.html` |
| Heatmap / matrix | Grade 2D: vendas, risco, correlação | `examples/figure-heatmap.html` |
| Network / graph | Nós não direcionados + arestas | `examples/figure-network.html` |
| Flowchart | Árvore de decisão / lógica de ramificação | `examples/figure-flowchart.html` |

### 4.3 Widgets interativos

→ Veja `examples/widget-interactive.html` para um padrão completo (slider + chart + saída de texto + reatividade de aria-label).

### 4.4 Padrões de callout de exemplo resolvido (3 gêneros + math)

| Padrão | Quando usar | Template |
|---|---|---|
| Aritmética matemática | Fórmula → números → resultado | Camada 4 de `section-complete.html` |
| Algorithm trace | Tabela de estado de iteração/recursão | `examples/worked-example-algorithm.html` |
| System trace | Latency por hop + variações de cenário | `examples/worked-example-system.html` |
| Recipe run | Trajetória real de métrica + custo de infra + bear trap | `examples/worked-example-recipe.html` |

### 4.5 Cheatsheet de notação

```html
<dl class="cheatsheet">
  <dt>\(\bar{x}\)</dt><dd>the sample mean</dd>
  <dt>\(\sigma\)</dt><dd>standard deviation</dd>
</dl>
```

---

## Fase 5: Acessibilidade (inegociável)

1. Skip link para `#main` funciona no primeiro Tab.
2. Todo `<svg>` tem role="img" + aria-labelledby → title + desc.
3. Tabelas: thead, tbody, scope, caption (WCAG 1.3.1).
4. Contraste de cor ≥ 4.5:1 normal, ≥ 3:1 em negrito, em AMBOS os temas.
5. Focus rings (`:focus-visible`).
6. Navegação por teclado incluindo os math tooltips (`tabindex="0"` em `mjx-mi[title]`).
7. prefers-reduced-motion respeitado TANTO para CSS @keyframes QUANTO para SMIL (bear trap B.3).
8. Stylesheet de impressão esconde o chrome da interface.
9. Mobile a 320px — os tooltips fazem clamp.

---

## Fase 6: Revisão estrutural (multidimensional)

```javascript
Workflow({
  scriptPath: SKILL_DIR + '/workflows/multi-dim-review.js',
  args: { file: '/path/to/your/tutorial.html' }
})
```

10 revisores específicos por dimensão + verificadores adversariais + síntese. Aplique as correções confirmadas. Reexecute até 0 críticos.

---

## Fase 7: Revisão visual por elemento

Primeiro, enumere os elementos:

```bash
python3 $SKILL_DIR/tools/inventory.py tutorial.html --json > elements.json
```

Depois, rode a revisão:

```javascript
Workflow({
  scriptPath: SKILL_DIR + '/workflows/per-element-review.js',
  args: { file: '/path/to/tutorial.html', elements: <paste from elements.json> }
})
```

Reescreva qualquer elemento com nota abaixo de B. Repita até todos os elementos atingirem nota A.

---

## Fase 8: Revisão pedagógica (o terceiro eixo)

```javascript
Workflow({
  scriptPath: SKILL_DIR + '/workflows/pedagogical-review.js',
  args: { file: '/path/to/tutorial.html' }
})
```

8 dimensões de qualidade didática: presença da camada de intuição, completude do exemplo resolvido, callbacks de reforço, disciplina de glossário, complexidade apropriada ao público, fidelidade do exemplo resolvido, ordenação dos conceitos, densidade de reforço. Aplique as correções didáticas confirmadas.

---

## Fase 9: Valide contra o checklist de publicação

```bash
# Full-document validation
python3 $SKILL_DIR/tools/validate.py tutorial.html

# Snippet validation (for example fragments that don't have full infrastructure)
python3 $SKILL_DIR/tools/validate.py --snippet some-snippet.html

# Machine-readable
python3 $SKILL_DIR/tools/validate.py tutorial.html --json > results.json
```

Roda 21 checagens automáticas (balanceamento de tags, balanceamento de MathJax, refs de aria, detecção de bear trap, metadados de acessibilidade, media queries de tematização, etc.). Exit code 0 se tudo passar, 1 caso contrário.

---

## Fase 10: Itere até a régua de qualidade

**É aqui que o nível Distill é construído.** Rascunhos de passada única são nota B. A iteração é o que faz a diferença.

### Loop de iteração

```
while quality < SHIP_THRESHOLD:
  1. Run multi-dim-review.js          (Phase 6)
  2. Apply all confirmed fixes
  3. Run per-element-review.js        (Phase 7)
  4. Re-author any element scoring < B
  5. Run pedagogical-review.js        (Phase 8)
  6. Apply confirmed teaching fixes
  7. Run validate.py                  (Phase 9 — objective gate)
  8. Get human eyes on it (the user)
  9. Apply user feedback
```

### Critérios objetivos de PARADA

Pronto para publicar quando TODOS forem verdadeiros:

| Critério | Alvo |
|---|---|
| Exit code do `validate.py` | **0** (todas as 21 checagens passam) |
| Findings críticos da revisão multidimensional | **0** |
| Findings altos da revisão multidimensional | **≤ 2** |
| Média da revisão por elemento | **A− ou superior** |
| Elementos em C/D/F na revisão por elemento | **0** |
| Findings críticos da revisão pedagógica | **0** |
| Findings altos da revisão pedagógica | **≤ 3** |
| Todas as checagens de acessibilidade da Fase 5 | **passam** |
| Contraste WCAG AA | **passa em AMBOS os temas** |
| Usuário deu o "ship it" | **sim** |

QUALQUER falha → mais uma iteração. Não declare "pronto" prematuramente.

### Expectativa de número de iterações

Com base no tutorial de referência:
- Iterações até o primeiro rascunho completo: 1-2
- Iterações até a primeira passada de revisão: 1-2 (pega 80% dos bugs)
- Iterações até a média A por elemento: 2-3
- Iterações até passar na revisão pedagógica: 1-2
- Iterações até o polimento final: 1-2

**Total: 6-11 ciclos para um tutorial polido.** Menos que isso é suspeito.

---

## Bear traps (as 15 coisas que consumiram horas)

→ Veja `examples/anti-patterns.html` para pares VISUAIS BAD/GOOD das primeiras 8 bear traps.

### B.1 `:root` dentro de `<style>` de SVG VAZA para o documento
Escope em `#anim-name-fig` em vez disso. A check 8 do `validate.py` detecta isso.

### B.2 SMIL `<animate attributeName="textContent">` é inválido
Use `<text>` empilhados + fade de opacity via CSS. Check 9 do `validate.py`.

### B.3 `prefers-reduced-motion` ignorado pelo SMIL
Use JS `svg.pauseAnimations()`. Já vem pronto em `starters/infrastructure.js`. Check 20 do `validate.py`.

### B.4 MathJax `\mathbb{E}` renderiza como textContent "E"
Verifique `el.getAttribute('mathvariant')`. Já vem pronto em `starters/infrastructure.js`. Check 21 do `validate.py`.

### B.5 Letras latinas isoladas em SYMBOL_TIPS dão match em excesso
Restrinja a letras gregas não ambíguas (π, θ, ε, β, σ, α, μ). Check 10 do `validate.py`.

### B.6 `mjx-mi[title]` não é focável por teclado por padrão
Adicione `tabindex="0"`. Já vem pronto em `starters/infrastructure.js`.

### B.7 As coordenadas de SVG animado devem satisfazer a codificação visual
Barras empilhadas somam o comprimento do eixo em cada frame. Cada coordenada deriva dos valores.

### B.8 Sweeper + follower precisam de curvas de ease correspondentes
Use `calcMode="spline" keySplines="0.42 0 0.58 1; ..."` nos animates do follower.

### B.9 Colisões de cor e sobrecarga semântica
Hues distintos para papéis semânticos distintos. Veja a regra 4 de `examples/anti-patterns.html`.

### B.10 Contraste de cor no light-mode
Use os overrides hex de light-mode em `reference/color-palette.md`.

### B.11 Clamping de tooltip em viewports estreitos
`max-width: min(320px, calc(100vw - 32px))`. Já vem pronto. Check 19 do `validate.py`.

### B.12 `<figure aria-labelledby>` referencia apenas a caption
Adicione `aria-describedby="svg-desc"` separadamente.

### B.13 Nada de magic numbers em widgets
Compute a partir do estado da simulação.

### B.14 Reads por faixa de linhas de cada elemento nas revisões
O `tools/inventory.py` gera as faixas de linhas automaticamente.

### B.15 A primeira tentativa de workflow falha na validação de schema ~20% das vezes
Aperte os prompts, reduza o escopo e conte com ~80% de conclusão na primeira execução.

---

## Scaffolds específicos por tópico

O padrão de 5 camadas é universal, mas a camada 3 muda por gênero. Cada gênero tem um template de seção correspondente + um template de exemplo resolvido:

### Conceitos matemáticos / quantitativos
- Camada 3: fórmula com código de cores + bullets de símbolos + descrição em palavras simples.
- Template: `examples/section-complete.html` (KL divergence — forecasting).
- Exemplo resolvido: aritmética com valores nomeados.

### Conceitos de algoritmo
- Camada 3: bloco de pseudocódigo com números de linha + explicação linha a linha + callout de complexidade.
- Template: `examples/section-algorithm.html` (binary search), `examples/worked-example-algorithm.html` (quicksort trace).
- Exemplo resolvido: tabela de state-trace, uma linha por iteração.

### Conceitos de sistema / arquitetura
- Camada 3: lista numerada de componentes + pseudocódigo de fluxo de dados + diagrama de arquitetura.
- Template: `examples/section-architecture.html` (CDN request lifecycle), `examples/worked-example-system.html` (Stripe webhook trace).
- Exemplo resolvido: tabela de trace por hop com latency cumulativa + variações de cenário.
- Adicione: callout de failure modes.

### Conceitos de receita / metodologia
- Camada 3: tabela de composição de dados + tabela de parâmetros com ⚠ para flags críticas.
- Template: `examples/section-recipe.html` (Stage 1 caching), `examples/worked-example-recipe.html` (Stage 3 DB indexing).
- Exemplo resolvido: trajetória de métrica ao longo dos pontos de avaliação + custo de infra + bear trap.

### Resultado de pesquisa / redação de paper
- Camada 3: afirmação → evidência (figuras + tabelas) → ablation + método.
- Template: `examples/section-research.html` (a ablação 'Stage 1 caching é load-bearing').
- Exemplo resolvido: setup experimental + tabela de evidências + lição metodológica.
- Adicione: callout de limitações.

---

## O que significa "nível Distill" (mensurável)

Alcança o nível Distill quando TODOS OS DEZ forem verdadeiros:

1. **Pule toda fórmula → ainda entenda cada conceito.** Teste: leia apenas a prosa de intuição de 3 conceitos.
2. **Leia apenas as fórmulas → derive os números dos exemplos resolvidos.** Teste: cubra a prosa; reproduza os exemplos resolvidos.
3. **Usuário de screen reader recebe a mesma informação que um vidente.** Teste: todo `<svg>` tem title + desc.
4. **Usuário mobile recebe a mesma informação que no desktop.** Teste: viewport de 320px; os tooltips fazem clamp.
5. **Light, dark, print, high-contrast e reduced-motion todos coerentes.** Teste: alterne cada modo.
6. **Hover em qualquer símbolo → definição.** Teste: passe o hover nas letras gregas.
7. **Toda afirmação em prosa é verificável.** Teste: rastreie as afirmações até fórmulas, exemplos, citações.
8. **`validate.py` retorna exit code 0.**
9. **Revisão multidimensional 0 críticos, média da revisão por elemento ≥ A−, revisão pedagógica 0 críticos.**
10. **Nenhum elemento com nota abaixo de B.**

TODOS OS DEZ, não a maioria. Não declare "pronto" prematuramente.

---

## Checklist de publicação

Rode `python3 $SKILL_DIR/tools/validate.py tutorial.html` para checar os itens 1-21 automaticamente. Checagens de pré-publicação que só um humano faz:

```
[ ] User has given "ship it"
[ ] Mobile viewport tested at 320px (visual verification)
[ ] Light mode + dark mode + print mode visually verified
[ ] Per-element review: all elements ≥ B
[ ] Pedagogical review: 0 critical findings
[ ] Deployment plan in place (see reference/deployment.md)
```

---

## Depois de publicar

Veja `reference/deployment.md` para:
- Opções de hosting (GitHub Pages, Netlify, S3 + CloudFront, Cloudflare Pages)
- Testes de graceful degradation (MathJax não carrega, JS desativado, conexões lentas)
- Analytics que respeitam a privacidade
- Canais de feedback dos leitores
- Versionamento + manutenção de longo prazo
- BibTeX de citação

---

## Ordem de operações sugerida

Para ~5,000 linhas cobrindo 5-8 conceitos:

| Dia | Trabalho |
|---|---|
| 1 | Planejar: público, seções, paleta de cores. Copiar starters/; customizar. |
| 2 | Rascunhar a intro §1 (use section-intro.html). Estabelecer a paleta de cores + a voz. |
| 3 | Rascunhar o conceito da seção 1 (todas as 5 camadas). Estabelecer o padrão. |
| 4-6 | Rascunhar as demais seções de conceito. |
| 7 | Criar todas as animações e widgets. Rascunhar o apêndice §N (use section-appendix.html). |
| 8 | Passada de acessibilidade + limpeza de referências cruzadas. Rodar `validate.py`. |
| 9 | Rodar `multi-dim-review.js` + aplicar os findings. |
| 10 | Rodar `inventory.py` + `per-element-review.js` + aplicar os findings. |
| 11 | Rodar `pedagogical-review.js` + aplicar os findings. |
| 12 | Iteração com feedback do usuário + polimento final. |

~12 dias para um tutorial polido, acessível e em arquivo único. Some 30-50% no primeiro uso. O tutorial de referência passou por ~12-15 ciclos de iteração ao longo de ~3 semanas.

---

## Índice de padrões

Todo padrão desta skill tem um exemplo autocontido e validado em `examples/` — essa é a fonte da verdade. Onde cada padrão fica:

| Padrão | Arquivo de exemplo |
|---|---|
| Estrutura de seção de 5 camadas | `section-complete.html` |
| Animação 3-phase | `animation-3phase.html` |
| Animação sweeper + follower | `animation-sweeper.html` |
| Animação sequential-reveal | `animation-sequential-reveal.html` |
| Animação tracker-on-curve | `animation-tracker-curve.html` |
| Before/after toggle | `animation-before-after.html` |
| Widget interativo com estado | `widget-interactive.html` |
| Fórmula com código de cores e termos em prosa | `section-complete.html` |
| Hero KPI cards | `section-intro.html` |
| Indicadores pipeline-mini | qualquer template de seção |
| Callout de exemplo resolvido | `worked-example-*.html` |
| Glossário + referências | `section-appendix.html` |
| Cheatsheet de notação | §4.5 acima |
| Bear-trap callouts | `section-recipe.html`, `section-appendix.html` |

Os assuntos dos exemplos abrangem domínios de propósito — economia, programação, design, ciência, forecasting, web performance — porque os padrões são agnósticos a domínio. Copie um e troque pelo seu assunto.
