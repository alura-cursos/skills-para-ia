---
name: jornada-do-cliente
description: Produz um mapa de jornada do cliente cobrindo estágios, touchpoints, curva emocional, dores, momentos da verdade e anotações de oportunidade. A saída é um artefato em markdown que pode incluir uma visualização em mermaid (timeline / flowchart). Suporta jornada linear (início ao fim) e cíclica (loops de engajamento recorrente). Recusa-se a fabricar dado emocional ou comportamental sem input de pesquisa. Use quando o usuário quiser mapear a experiência do cliente, um customer journey, um funil como lente de experiência, ou entender onde o produto pode intervir.
---

# jornada-do-cliente — sintetize pesquisa, não invente

**Um mapa de jornada é um artefato de síntese, não um brainstorm.** Todo estágio, touchpoint, emoção e dor tem que rastrear até um input de pesquisa (entrevista, survey, analytics, ticket de suporte, observação). Entradas do tipo "imagino que o usuário se sente frustrado aqui" são o anti-padrão P0 — ficção vestida de insight, que engana o time.

- Se o usuário traz **sinal de pesquisa**, ancore o mapa nele.
- Se traz **hipóteses**, rotule cada entrada como **Hipótese (confiança: Baixa)** e recomende pesquisa de validação.

Esta skill **se recusa a fabricar** dado emocional ou comportamental sem pesquisa (ver *Protocolos de recusa*).

## Inputs

**Obrigatórios:** persona/segmento (para QUEM é a jornada) · objetivo/resultado (o que o cliente tenta realizar) · escopo (fim-a-fim OU focado numa fase, tipo onboarding, checkout, renovação, suporte).

**Opcionais (melhoram a qualidade):** dado de pesquisa (síntese de entrevistas, survey, tickets, analytics) · mapa existente a revisar · estágios/touchpoints que o usuário quer garantir · tipo linear (default) vs. cíclico.

## O que você produz

1. **Sumário executivo** (3-5 frases) — para quem, o que tenta realizar, onde estão as maiores dores e oportunidades, e o momento da verdade mais importante.
2. **Persona / segmento** — 1 parágrafo resumindo o cliente que a jornada descreve.
3. **Escopo** — a fase/ciclo coberto. Diga explicitamente o que **inclui** e o que **exclui**.
4. **Estágios (3-7 nomeados)** — nome em verbo de cliente ("Descobre", "Considera", "Experimenta", "Decide", "Usa", "Renova"). Cada um: objetivo do cliente ali · duração estimada · gatilho de entrada · critério de saída.
5. **Touchpoints por estágio** — onde o cliente interage com o produto/organização:

   | Estágio | Touchpoint | Canal | O que acontece |
   |---|---|---|---|
   | Descobre | Resultado de busca | Buscador | Vê a opção do concorrente |
   | Considera | Demo | App / vídeo | Assiste à visão geral de 90s |

6. **Curva emocional** — o que o cliente sente em cada estágio. Rótulos **específicos** (frustração, esperança, ansiedade, alívio), nunca genéricos (feliz/triste):

   | Estágio | Emoção dominante | Confiança | Fonte |
   |---|---|---|---|
   | Descobre | Curiosidade, leve ceticismo | Média | 12 entrevistas; 3 citaram ceticismo |
   | Considera | Frustração | Alta | 87% dos respondentes citaram "preço confuso" |

   Sem dado de pesquisa, **toda** entrada vira "Hipótese / confiança Baixa" + recomendação de validar.

7. **Dores e momentos da verdade** — dor = onde há atrito/confusão/bloqueio. Momento da verdade (MdV) = **não** toda interação, só os **3-5** momentos que decidem se o cliente continua ou abandona.

   | Estágio | Dor / MdV | Severidade (1-5) | Evidência do cliente | Implicação |
   |---|---|---|---|---|
   | Considera | Confusão de preço | 4 | 87% no survey | Bloqueia conversão; precisa de clareza de preço |
   | Experimenta | "Aha" alcançado quando… (momento da verdade) | 5 | 92% que chegam aqui convertem | Vira o critério de ativação |

8. **Oportunidades por estágio** (1-3) — onde o produto pode intervir para reduzir dor ou amplificar um MdV. Tabela: estágio · oportunidade · mudança de produto que resolve · esforço (grosso).
9. **Visual (mermaid)** — quando viável; tabelas markdown são sempre o fallback válido. `timeline` para jornada linear; `flowchart` para ramificada com pontos de decisão. Com **5+ estágios**, gere também blocos seccionais (por estágio ou a cada 2-3) para não sobrecarregar e falhar o render.

   ```
   timeline
       title Jornada do cliente
       Descobre : Vê o anúncio : Cai no site
       Considera : Lê o preço : Assiste à demo
       Experimenta : Faz signup : Onboarding
       Decide : Faz upgrade ou churn
   ```

10. **Lacunas de pesquisa (explícitas)** — o que o mapa **não** endereça por falta de dado, e qual pesquisa de follow-up fecharia as lacunas mais importantes.

## Protocolos de recusa

Você **recusa** produzir o mapa sem qualidade mínima de input:

1. **Sem persona ou escopo** → "Preciso saber de quem é a jornada e o que a pessoa tenta realizar. Me dê uma persona (ou um resumo) e o objetivo."
2. **Fabricar emoção sem pesquisa** → "Posso sugerir emoções hipotéticas, mas elas virão rotuladas como Hipótese (confiança: Baixa) e recomendadas para validação. Segue no modo-hipótese, ou você tem dado de pesquisa para ancorar?"
3. **Escopo excessivo** (jornada fim-a-fim de um produto de ciclo longo, ex.: 5 anos de SaaS B2B) → é grosso demais para ser útil: "Escolha uma fase — pré-compra, onboarding, expansão (renovação + cross-sell) ou off-boarding (churn + recuperação)."
4. **Um único touchpoint como "jornada"** (ex.: "checkout") → "Um touchpoint só não é uma jornada. Expanda para os estágios ao redor (navegar + carrinho + checkout + pós-compra), ou trate o fluxo de checkout como outro artefato."

> Escopo: esta skill cobre o lado da **experiência do usuário** (journey maps, user flows, funis como lente de experiência). Não produz *service blueprints*, diagramas operacionais nem mapas de arquitetura de sistema.

## Padrões

- **Linear (default)** — sequência única, início ao fim. Jornadas de compra, onboarding, resolução de suporte.
- **Cíclica** — loop recorrente; o cliente volta a um estágio numa cadência. Ciclos de renovação, loops de engajamento, tarefas recorrentes.
- **Multi-ator (avançado)** — personas com jornadas que se cruzam (ex.: comprador + influenciador + usuário em B2B). Use **com parcimônia**: tabelas markdown paralelas (uma por ator) com touchpoints compartilhados anotados, mermaid simplificado ou omitido, e um aviso de complexidade — priorize a profundidade de pesquisa no ator primário.

## Checklist de qualidade

- [ ] Persona e escopo declarados explicitamente.
- [ ] 3-7 estágios nomeados, cada um com objetivo, duração, gatilho e critério de saída.
- [ ] **Toda** entrada da curva emocional tem confiança **e** fonte (ou está marcada como Hipótese).
- [ ] Momentos da verdade limitados aos 3-5 que decidem continuar × abandonar, não toda interação.
- [ ] Cada oportunidade se amarra a uma dor ou MdV específico.
- [ ] Mermaid presente quando viável, com tabelas como fallback.
- [ ] Lacunas de pesquisa declaradas explicitamente.
