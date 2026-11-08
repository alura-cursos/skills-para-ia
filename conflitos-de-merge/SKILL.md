---
name: conflitos-de-merge
description: Use quando precisar resolver um conflito de merge ou rebase do git que está em andamento. Gatilhos típicos: "resolve esse conflito de merge", "deu conflito no rebase", "merge conflict", "conserta os conflitos do git", "não consigo terminar o merge".
---

# conflitos-de-merge — resolva intenções, não texto

Um conflito é o git dizendo que dois commits mexeram nas mesmas linhas e ele não sabe qual manter. Mas os marcadores são sobre **texto**; o conflito de verdade é sobre **intenção** — o que cada lado estava tentando fazer.

O jeito errado (e comum) de resolver é no nível do texto: escolher `ours`/`theirs` no chute, ou colar os dois hunks, sem entender o porquê de cada mudança. Isso derruba em silêncio uma feature, ou reintroduz um bug que o outro lado tinha corrigido. A disciplina aqui é: **entenda a intenção dos dois lados antes de resolver, e produza uma resolução que honre as duas.**

Cinco passos. Não pule para a edição antes de entender o campo.

---

## 1. Veja o estado completo

Antes de tocar em qualquer arquivo:

- **Qual operação está em curso** — merge ou rebase? `git status` diz. Importa: um **rebase resolve conflito por commit, em rodadas** — o mesmo conflito (ou outro) pode reaparecer no próximo commit da série.
- **Qual o objetivo declarado** do merge/rebase — o que a branch que está entrando traz? Esse é o seu critério de desempate lá na frente.
- **Quais arquivos conflitam e quantos hunks** — `git diff --name-only --diff-filter=U`, depois leia os marcadores (`<<<<<<<`, `=======`, `>>>>>>>`) em cada um.

> ⚠️ **Pegadinha do rebase:** `ours` e `theirs` vêm **invertidos** em relação ao merge. No rebase, `ours` é a branch sobre a qual você está rebaseando (o upstream) e `theirs` é o **seu** commit sendo reaplicado. Confira qual é qual antes de escolher um lado pelo nome.

## 2. Para cada conflito, recupere as DUAS intenções

Um hunk conflitante tem dois lados. Para cada um, descubra **por que** aquela mudança foi feita — não só o que ela diz:

- A mensagem do commit que introduziu cada lado (`git log`, `git blame` na região do conflito).
- O PR / issue / ticket vinculado, se houver.
- O código ao redor — a mudança pode ser um pedaço de algo maior, e resolver só o hunk isolado quebra o resto.

Você não resolve bem o que não entende. Se a intenção de um dos lados for genuinamente opaca — commit sem mensagem, sem contexto — **diga isso ao usuário antes de adivinhar**, não chute.

## 3. Resolva honrando as duas intenções

Para cada hunk:

- **Se as intenções são compatíveis** (o caso mais comum), produza a versão que preserva as duas — normalmente a **união** do que cada lado queria, não a escolha de um. Ex.: um lado adicionou validação, o outro renomeou o campo → aplique a validação no campo renomeado.
- **Se são incompatíveis**, escolha o lado que casa com o **objetivo declarado** (passo 1) e **registre explicitamente a intenção descartada** — num comentário, no corpo do commit, ou avisando o usuário. Descartar em silêncio é o pior resultado: ninguém depois sabe que aquilo existiu.
- **Nunca invente comportamento novo.** A resolução é uma combinação ou escolha do que **já existia** nos dois lados — não é hora de escrever feature nova nem de refatorar. Se você se pegar escrevendo lógica que não estava em lado nenhum, pare.

**Regra dura: sempre resolva; nunca `git merge --abort` / `git rebase --abort`.** Abortar só empurra o problema pro futuro. (Se a conclusão for que o merge nem deveria acontecer — a branch está errada — isso é uma decisão do **usuário**, não um abort silencioso da sua parte.)

## 4. Verifique que as duas intenções sobreviveram

Resolvido no texto ≠ correto. Duas checagens, nesta ordem:

- **Conflito semântico que o git NÃO marcou.** Hunks sem sobreposição textual podem ser incompatíveis mesmo assim — um lado renomeou uma função, o outro adicionou um caller do nome antigo: nenhum `<<<<<<<`, mas quebrado. Reveja a **combinação inteira** dos arquivos tocados, não só onde havia marcador.
- **Os checks do projeto.** Descubra como o projeto valida e rode na ordem útil: **typecheck → testes → format/lint.** Conserte o que o merge quebrou. Passar nos testes dos dois lados é o **piso**, não o teto — os testes podem não cobrir a interação entre as duas mudanças.

## 5. Feche

- `git add` em tudo que foi resolvido, e finalize: `git commit` (merge) ou `git rebase --continue` (rebase).
- **Rebase:** volte aos passos 2–4 a cada rodada até o `git rebase` terminar de reaplicar todos os commits. Não presuma que acabou no primeiro.
- Deixe no corpo do commit qualquer **trade-off não-óbvio** (qual intenção venceu e por quê) — pro próximo que der `git blame` naquela linha entender a decisão sem ter que reconstruir tudo.

---

## Por que assim

- **Intenção, não texto.** Os marcadores mostram duas versões de código; a pergunta real é o que cada uma queria. Resolver sem essa resposta é sortear qual trabalho jogar fora.
- **Verificar as duas intenções (passo 4), não só compilar.** Um merge "que passa" pode ter apagado silenciosamente metade do ponto de uma das branches. O git marca sobreposição de texto; ele não marca sobreposição de *significado*.
- **Sempre resolver.** Assim como uma revisão se compromete com um veredito e um diagnóstico se compromete com um repro, aqui você se compromete com a resolução — abortar devolve a decisão sem tê-la tomado.
