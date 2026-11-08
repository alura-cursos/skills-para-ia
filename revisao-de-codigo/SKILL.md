---
name: revisao-de-codigo
description: Revisa um conjunto de mudanças — uma branch, um PR, commits específicos ou o working tree — por lentes independentes (correção, design, segurança, testes e aderência à intenção), roda as lentes em sub-agentes paralelos, verifica cada achado antes de reportar (pra cortar falso-positivo) e entrega um relatório priorizado por severidade com um veredito. Use quando o usuário quiser revisar um diff/PR/branch, ou pedir coisas como "revise as mudanças desde X", "faça um code review", "review this PR" ou "o que tem de errado nessa branch?".
---

# revisao-de-codigo — revisão por lentes, com verificação e veredito

Revisa o diff entre o que mudou e uma **base** que o usuário escolhe. Em vez de uma leitura única e monolítica, o trabalho é dividido em **lentes independentes** que rodam em **sub-agentes paralelos** (contextos separados não se contaminam), cada achado passa por uma **verificação adversarial** antes de entrar no relatório, e o resultado é **priorizado por severidade** — não por lente.

Três princípios guiam a skill:

- **Priorize por severidade, não por revisor.** O autor quer uma lista de "o que corrigir", não cinco relatórios separados para costurar na cabeça.
- **Verifique antes de reportar.** Um achado falso custa mais caro que um omitido — ele manda o autor caçar um problema que não existe. Todo candidato é checado por um cético antes de sobreviver.
- **Comprometa-se com um veredito.** Uma revisão que não diz "pode seguir" ou "não faça merge disso" empurra a decisão de volta pro autor. Esta skill se compromete.

## Quando usar

- Revisar uma **branch**, um **PR**, **commits** específicos, ou mudanças ainda **não commitadas** (working tree).
- Pedidos como "revise desde `main`", "faça um code review dessas mudanças", "o que tem de errado aqui?".

## Quando NÃO usar

- Auditoria de segurança de um codebase **inteiro** — esta skill revisa um *diff*, não o repositório todo.
- Gerar ou refatorar código — ela **avalia** mudanças que já existem, não as escreve.
- Quando não há diff: sem mudança, não há o que revisar.

---

## Processo

### 1. Delimite o que revisar

Descubra o conjunto de mudanças e a **base** de comparação:

- O usuário pode nomear a base: uma branch, uma tag, um commit, `main`, `HEAD~3`, etc.
- Se ele não disser, escolha o padrão mais útil e **avise qual escolheu**:
  - working tree sujo (há mudanças não commitadas) → revise o que está pendente: `git diff HEAD`.
  - working tree limpo → revise a branch atual contra sua base (o merge-base com `main`/`master`).
  - Só pergunte se ficar genuinamente ambíguo.

Valide o material **uma vez** aqui — que a base resolve e que o diff não é vazio — antes de gastar sub-agentes; cada lente depois re-roda o `git diff` no seu próprio escopo:

- Resolva a base: `git rev-parse <base>` — se falhar, pare aqui com uma mensagem clara.
- Diff da branch: `git diff <base>...HEAD` (três pontos = compara contra o merge-base, não contra a ponta da base).
- Working tree: `git diff` (unstaged), `git diff --staged` (staged) ou `git diff HEAD` (tudo pendente).
- Lista de commits: `git log <base>..HEAD --oneline`. Arquivos tocados: `git diff --stat <base>...HEAD`.

**Se o diff for vazio, pare** — não abra sub-agentes para revisar o nada.

### 2. Reúna contexto (para a revisão não ser cega)

Colete três coisas uma vez e repasse a todas as lentes:

- **Intenção** — o que a mudança tenta fazer: as mensagens de commit, a descrição do PR/issue vinculado, ou uma pergunta de uma linha ao usuário. Sem isso, a lente *Intenção* não roda.
- **Convenções** — como este repo escreve código: configs de linter/formatter (`.eslintrc`, `ruff.toml`, `.editorconfig`…), docs como `CONTRIBUTING`/`STYLE`, e os idiomas visíveis nos próprios arquivos que o diff toca. **Deixe passar o que a tooling já garante** — não aponte o que o linter pega sozinho.
- **Raio de impacto** — leia o código **ao redor** das linhas alteradas, não só os `+`/`-`. Um "null não tratado" pode já estar tratado no chamador; um "duplicado" pode ser coincidência. Contexto muda o veredito.

### 3. Revise por lentes, em paralelo

Dispare os sub-agentes num **único** disparo (várias chamadas `Agent` na mesma mensagem), um por lente, com o subagente `general-purpose`. Cada um recebe escopo estreito — só a sua lente — para os contextos não se misturarem. Use as lentes que fazem sentido para o diff (descarte as que não se aplicam):

- **Correção** — bugs de lógica, erros/exceções não tratados, casos de borda, off-by-one, condições de corrida, invariantes quebradas, vazamento de recurso. A lente de maior valor.
- **Design & clareza** — nomes que não dizem o que a coisa faz; lógica duplicada dentro da mudança; abstração criada para uma necessidade que o diff não tem; uma função fazendo várias coisas não relacionadas; código morto/inalcançável. (Heurísticas, sempre um juízo — não regra dura.)
- **Segurança** — entrada não confiável chegando a um sink (injeção, path traversal), segredos no código, desserialização insegura, checagem de autorização ausente, cripto fraca — só onde a mudança plausivelmente encosta nisso.
- **Testes & contrato** — o comportamento novo está coberto por teste que de fato **afirma** algo? mudança em API pública atualizou docs/tipos? os testes testam o comportamento, não a implementação?
- **Intenção** — o diff faz o que a intenção pediu, nada faltando e nada a mais (scope creep)? Pule se nenhuma intenção foi encontrada.

**Brief de cada lente** (adapte `[LENTE]` e `[O QUE PROCURAR]`):

> Você revisa **só a lente [LENTE]** das mudanças neste repositório. Rode `git diff <base>...HEAD` e leia os arquivos afetados para ter contexto (não só as linhas alteradas). Intenção da mudança: `[intenção]`. Convenções do repo: `[configs/docs]`.
> Reporte **apenas** achados de [LENTE]: [O QUE PROCURAR]. Para cada achado: `arquivo:linha`, severidade (`blocker` | `ajustar` | `nit`), o que está errado em uma frase, o trecho citado, e a correção sugerida. **Ignore o que linter/formatter já garante.** No máximo os ~7 achados mais reais; qualidade acima de quantidade. Se não houver nada, responda "nada a apontar". Responda em português.

### 4. Verifique antes de reportar

O modo de falha da revisão automática é o **falso-positivo confiante**. Então cada achado candidato passa por um cético, também em paralelo:

> Tente **refutar** este achado: `[achado + trecho]`. Ele é real, ou o código ao redor / o chamador já trata o caso? É coisa que a tooling pega? A "duplicação" é mesmo a mesma lógica? Responda **confirmado** (confiança alta/média) ou **refutado** (com o motivo). Na dúvida, refute.

Descarte o que não for confirmado. Um bom review erra para o lado de reportar menos, porém certo.

### 5. Reporte por severidade, com veredito

Agregue **só os achados confirmados**, ordenados por severidade (não por lente — o leitor quer "o que preciso consertar"):

- 🔴 **Blocker** — vai causar comportamento errado, perda de dado, brecha de segurança ou crash num caminho realista. O merge espera.
- 🟡 **Ajustar** — defeito real ou problema claro de design que não necessariamente quebra produção, mas deve ser corrigido.
- 🟢 **Nit** — menor, estético ou preferência. Pegar ou largar.

Cada achado: **`arquivo:linha`** — o que está errado — por que importa — correção sugerida — *(confiança)*.

Feche com a contagem por severidade e um **veredito**:

- **Pedir mudanças** — há algum 🔴, ou vários 🟡.
- **Aprovar com ressalvas** — nenhum 🔴, alguns 🟡/🟢.
- **Aprovar** — nenhum 🔴 e nada relevante a ajustar.

O relatório sai em **português**.

---

## Formato do relatório

```markdown
# Code review — <base>...HEAD  (<n> commits, <n> arquivos)

## 🔴 Blocker (<n>)
- **`src/auth.ts:42`** — o token expirado ainda é aceito porque `exp` é comparado
  como string, não como número. → compare `Number(exp)` contra `Date.now()/1000`. *(confiança alta)*

## 🟡 Ajustar (<n>)
- **`src/cart.ts:88`** — `applyDiscount` duplica o cálculo de imposto de `checkout.ts:120`.
  → extraia `taxFor(item)` e chame nos dois lugares. *(confiança média)*

## 🟢 Nit (<n>)
- **`src/utils.ts:12`** — `tmp` não diz o que guarda. → `normalizedEmail`. *(confiança alta)*

---
**Resumo:** 1 blocker · 1 a ajustar · 1 nit.
**Veredito: pedir mudanças** — o blocker de auth precisa sair antes do merge.
```

Se nenhuma lente encontrou nada confirmado, diga isso claramente e dê o veredito **Aprovar** — um review limpo é um resultado válido, não um sinal de que faltou procurar.

---

## Por que lentes separadas + verificação

- **Lentes não se contaminam.** Um sub-agente caçando bug de segurança não se distrai com nome de variável; um caçando duplicação não inventa buraco de segurança. Escopo estreito = menos ruído.
- **Severidade, não autor.** Cinco relatórios por perspectiva empurram o trabalho de priorizar para o autor. A skill faz esse trabalho: uma lista única, ordenada pelo que dói.
- **Verificar é o diferencial.** Gerar achados é fácil; gerar achados **certos** é o que torna um review confiável. O passo de refutação é o que separa "revisão útil" de "lista de palpites".
