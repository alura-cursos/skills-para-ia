---
name: diagnostico-de-bugs
description: Loop de diagnóstico para bugs difíceis e regressões de performance. Use quando o usuário pedir para "diagnosticar", "debugar", "investigar" ou "achar a causa" de algo, ou quando reportar algo quebrado / que dá erro / que falha / que está lento / intermitente. Exemplos de gatilho: "diagnostica esse bug", "por que isso está falhando às vezes?", "debug this", "essa rota ficou lenta depois do deploy".
---

# diagnostico-de-bugs — reproduza antes de raciocinar

O erro nº 1 em bug difícil é **teorizar sobre uma falha que você não consegue fazer acontecer sob demanda.** Você monta uma explicação elegante para um sintoma que aparece "de vez em quando" e passa horas defendendo a explicação em vez de encurralar o bug. Esta skill inverte a ordem: **primeiro um gatilho que faz o bug falhar agora, toda vez; só então teoria — e teoria decidida por experimento, não por leitura de código.**

É uma disciplina em 6 fases. Pule uma fase apenas com justificativa explícita.

> Antes de mexer: fixe o **sintoma exato** que o usuário relatou — a mensagem de erro, a saída errada, o número da lentidão — e leia o código da área afetada, mais qualquer documento de decisão de arquitetura que exista por ali. Um modelo mental errado da área faz você caçar o bug errado.

---

## Fase 1 — Construa um gatilho confiável  ← **o coração da skill**

Tudo além desta fase é mecânica. Com um sinal **pass/fail apertado** que fica vermelho *neste* bug, você acha a causa — bisect, hipótese e instrumentação apenas consomem esse sinal. Sem ele, encarar código não resolve.

Gaste esforço **desproporcional** aqui. Seja agressivo, seja criativo, não desista.

### Formas de montar um — da mais confiável ao último recurso

1. **Teste que falha** no seam mais próximo do bug (unit → integração → e2e). O ideal: vira regressão no repo depois.
2. **Script contra o sistema vivo** — `curl`/HTTP num dev server, ou uma chamada de CLI com input fixo diffando a saída contra um snapshot conhecido-bom.
3. **Replay de um caso real** — grave em disco a request/payload/evento que quebra e reproduza isolado no trecho suspeito.
4. **Harness mínimo descartável** — suba só o pedaço do sistema que toca o bug (um serviço, o resto mockado) e dispare o caminho com uma chamada.
5. **Browser headless** (Playwright/Puppeteer) para bug de interface — dirige a UI e afirma sobre DOM/console/network.
6. **Loop estatístico** para "às vezes erra" — centenas de inputs aleatórios (fuzz) até o modo de falha cair.
7. **Bisect ou diferencial** — bug que surgiu entre dois estados (commit / versão / dataset): automatize "sobe no estado X → checa" para um `git bisect run`; ou rode o mesmo input em duas versões/configs e diff a saída.
8. **Pessoa no loop — último recurso.** Se um humano *precisa* clicar, dê a ele um roteiro passo a passo que captura o resultado de volta para você: o loop continua estruturado, só não automático.

### Aperte o loop

Trate o loop como um produto. Assim que tiver *um*, **aperte**:

- **Mais rápido?** Cacheie o setup, pule init irrelevante, estreite o escopo do teste.
- **Sinal mais afiado?** Afirme sobre o sintoma específico, não sobre "não crashou".
- **Mais determinístico?** Fixe o relógio, dê seed no RNG, isole o filesystem, congele a rede.

Um loop de 30s e instável quase não ajuda; um de 2s e determinístico muda o jogo.

### Bug não-determinístico

A meta não é um repro limpo — é uma **taxa de reprodução maior**. Repita o gatilho 100×, paralelize, adicione stress, estreite janelas de timing, injete `sleep`. Um flake de 50% é debugável; 1% não é — suba a taxa até dar para trabalhar em cima.

### Se você genuinamente não consegue um loop

Pare e **diga isso explicitamente**. Liste o que tentou. Peça ao usuário: (a) acesso ao ambiente que reproduz, (b) um artefato capturado (HAR, dump de log, core dump, gravação de tela com timestamps), ou (c) permissão para instrumentar temporariamente o ambiente real. **Não** avance para hipótese sem loop.

### Critério de conclusão — um loop apertado que fica vermelho

A Fase 1 termina quando você consegue nomear **um comando** — um path de script, uma invocação de teste, um `curl` — que você **já rodou pelo menos uma vez** (cole a invocação e a saída), e que é:

- [ ] **Capaz de ficar vermelho** — dirige o caminho real do bug e afirma o **sintoma exato do usuário**; pega *este* bug e fica verde quando corrigido. Não basta "roda sem dar erro".
- [ ] **Determinístico** — mesmo veredito a cada run (flaky: taxa alta e fixada, conforme acima).
- [ ] **Rápido** — segundos, não minutos.
- [ ] **Rodável sem humano** — dá para rodar sozinho.

Se você se pegar lendo código para montar uma teoria antes desse comando existir: **pare.** Teorizar antes de conseguir observar a falha é justamente o erro que esta skill existe para evitar. Sem comando vermelho, sem Fase 2.

---

## Fase 2 — Reproduza e encolha

Rode o loop. Veja ficar vermelho — o bug aparece. Confirme:

- [ ] É a falha que o **usuário** descreveu — não uma vizinha parecida. Bug errado leva a fix errado.
- [ ] Reproduz em vários runs (ou, se não-determinístico, numa taxa alta o bastante para debugar).
- [ ] Você capturou o sintoma exato (mensagem, saída errada, tempo) para verificar o fix depois.

### Encolha

Com o loop vermelho, reduza ao **menor cenário que ainda fica vermelho**. Corte input, caller, config, dado e passo **um de cada vez**, rodando o loop após cada corte. Fica só o que sustenta a falha.

Por que vale: um repro mínimo encolhe o espaço de suspeitos da Fase 3 (menos peças móveis para desconfiar) e vira o teste de regressão limpo da Fase 5.

Pronto quando **cada elemento restante é load-bearing** — tirar qualquer um deixa o loop verde. Não avance sem ter reproduzido **e** encolhido.

---

## Fase 3 — Hipóteses falsificáveis

Gere **3 a 5 hipóteses ranqueadas** antes de testar qualquer uma — gerar só uma ancora você na primeira ideia plausível.

Cada hipótese precisa ser **falsificável**: diga a previsão que ela faz.

> Formato: "Se a causa é `<X>`, então `<mudar Y>` faz o bug sumir / `<mudar Z>` piora."

Se você não consegue enunciar a previsão, é um palpite — descarte ou afie.

**Mostre a lista ranqueada ao usuário antes de testar.** Ele costuma re-ranquear na hora ("acabamos de mexer no nº 3") ou já ter descartado alguma. Checkpoint barato, economia grande. Mas não trave nisso: se o usuário estiver ausente, siga com o seu ranking.

---

## Fase 4 — Instrumente, uma variável por vez

Cada sonda mapeia para uma previsão específica da Fase 3. **Mude uma variável de cada vez.**

Preferência de ferramenta:

1. **Debugger / REPL**, se o ambiente permite — um breakpoint vale dez logs.
2. **Logs no ponto** que distingue uma hipótese da outra.
3. Nunca "loga tudo e dá grep".

**Marque todo log temporário** com um prefixo único, ex. `[DBG-a4f2]` — a limpeza no fim vira um `grep` só. Log sem tag sobrevive; log com tag morre.

**Regressão de performance:** aqui log costuma enganar. Meça primeiro — baseline com timing harness, `performance.now()`, profiler ou query plan — e então bisect. Meça antes de mexer.

---

## Fase 5 — Corrija e trave

Escreva o teste de regressão **antes do fix** — mas só se existir um **seam correto**: um ponto onde o teste exercita o **padrão real do bug**, como ele acontece no call site. Se o único seam disponível é raso demais (teste de um caller quando o bug precisa de vários; unit que não reproduz a cadeia que disparou o bug), um teste ali dá **falsa confiança**.

**Se não há seam correto, isso já é um achado.** Anote: a arquitetura está impedindo que o bug seja travado. Leve isso para a Fase 6.

Se há seam correto:

1. Transforme o repro mínimo num teste que falha.
2. Veja falhar.
3. Aplique o fix.
4. Veja passar.
5. Rode o loop da Fase 1 contra o cenário **original** (não-minimizado) — o fix tem que segurar o caso real, não só o reduzido.

---

## Fase 6 — Limpeza e post-mortem

Obrigatório antes de declarar pronto:

- [ ] O repro original não reproduz mais (rode o loop da Fase 1)
- [ ] Teste de regressão passa (ou a ausência de seam está documentada)
- [ ] Toda instrumentação `[DBG-...]` removida (`grep` no prefixo)
- [ ] Protótipos descartáveis apagados (ou movidos para um lugar de debug claramente marcado)
- [ ] A hipótese que se confirmou está escrita no commit / PR — para quem debugar depois já aprender

**Depois pergunte: o que teria evitado este bug?** Faça essa recomendação **depois** do fix estar no lugar — você sabe mais agora do que quando começou. Se a resposta é arquitetural (sem seam de teste bom, callers embolados, acoplamento escondido), registre o encaminhamento com os detalhes: por exemplo, um code review focado no design da área, ou uma refatoração da parte que resistiu a ser testada.

---

## Por que a ordem é essa

Cada fase existe para desarmar um jeito específico de o diagnóstico dar errado:

- **Sem gatilho (Fase 1), você debuga no escuro.** Toda a disciplina depende de um sinal que fica vermelho neste bug — por isso ele vem antes de tudo, inclusive de qualquer teoria.
- **Sem encolher (Fase 2), você suspeita do sistema inteiro.** O repro mínimo é o que torna a Fase 3 viável.
- **Uma variável por vez (Fase 4)** é o que transforma "mexi em três coisas e melhorou" — que não ensina nada — em evidência.
- **O teste antes do fix (Fase 5)** é o que prova que você entendeu o bug, e não só empurrou o sintoma para o lado.
