---
name: teste-ab
description: Use quando o usuário quiser planejar, desenhar ou implementar um teste A/B ou experimento, ou montar um programa de experimentação de growth. Também quando mencionar "teste A/B", "split test", "experimento", "testar essa mudança", "qual versão é melhor", "significância estatística", "por quanto tempo rodar o teste", "hipótese", "ICE score", "backlog de experimentos" ou "velocidade de experimentação". Use sempre que alguém estiver comparando duas abordagens e quiser medir qual performa melhor, ou quiser montar uma prática sistemática de experimentação.
---

# teste-ab — decida antes de rodar, não espie

Um teste A/B te engana de duas formas: **hipótese vaga** (você não consegue dizer se acertou) e **espiar o resultado** (parar quando os números parecem bons → falso positivo). A disciplina inteira é pré-comprometer, antes do launch, cinco coisas — **hipótese falsificável, uma variável, métrica primária, tamanho de amostra e regra de parada** — e não tocar em nada até o teste terminar.

## Antes de desenhar

Entenda: o que você quer melhorar e por quê; a **baseline** (taxa de conversão atual) e o **volume de tráfego**; e as constraints (complexidade técnica, prazo, ferramentas). Use qualquer contexto que você já tenha sobre o produto e o público em vez de reperguntar.

## Os 4 princípios

(Essas cinco travas caem sob os 4 princípios abaixo.)

1. **Comece com uma hipótese falsificável** — uma previsão específica, baseada em dado ou raciocínio, não "vamos ver o que acontece".
2. **Teste UMA coisa** — uma variável por teste, senão você não sabe o que funcionou.
3. **Rigor estatístico** — tamanho de amostra pré-definido; não espie e não pare cedo; comprometa-se com a metodologia.
4. **Meça o que importa** — uma métrica **primária** ligada a valor de negócio, **secundárias** para contexto, e **guardrails** para não causar dano.

## A hipótese

```
Porque [observação/dado],
acreditamos que [mudança]
vai causar [resultado esperado]
para [público].
Saberemos que é verdade quando [métrica].
```

- **Fraca:** "Mudar a cor do botão talvez aumente cliques."
- **Forte:** "Porque usuários relatam dificuldade de achar o CTA (heatmaps + feedback), acreditamos que um botão maior e de cor contrastante vai aumentar os cliques no CTA em 15%+ para novos visitantes. Mediremos a taxa de clique de page-view até início de signup."

## Métricas

- **Primária** — a única que decide o teste; ligada direto à hipótese.
- **Secundárias** — explicam *por que* / *como* a mudança funcionou.
- **Guardrail** — o que não pode piorar; pare o teste se ficar significativamente negativo.

> Ex. (página de preços): primária = taxa de seleção de plano; secundária = tempo na página, distribuição de planos; guardrail = tickets de suporte, taxa de reembolso.

## Tamanho de amostra

Defina o **MDE** (menor efeito que vale a pena detectar) e calcule a amostra **antes** de rodar. Referência aproximada (por variante, 95% de confiança, ~80% de poder):

| Baseline | +10% | +20% | +50% |
|---|---|---|---|
| 1% | ~150k | ~39k | ~6k |
| 3% | ~47k | ~12k | ~2k |
| 5% | ~27k | ~7k | ~1,2k |
| 10% | ~12k | ~3k | ~550 |

Calcule o exato: [Evan Miller](https://www.evanmiller.org/ab-testing/sample-size.html) · [Optimizely](https://www.optimizely.com/sample-size-calculator/). Divida pelo tráfego/dia para saber a **duração** — e rode no mínimo 1-2 ciclos semanais completos (efeito dia da semana).

## Desenhar a variante

Uma mudança **única**, **significativa** o bastante para mover a agulha, e **fiel à hipótese**. O que dá para variar: headline/copy (ângulo, proposta de valor, tom) · design (layout, cor, imagem, hierarquia) · CTA (texto, tamanho, posição) · conteúdo (o que incluir, ordem, prova social).

## Alocação de tráfego

| Abordagem | Split | Quando |
|---|---|---|
| Padrão | 50/50 | default do A/B |
| Conservadora | 90/10, 80/20 | limitar risco de uma variante ruim |
| Ramping | começa pequeno, cresce | mitigar risco técnico |

Garanta **consistência** (o usuário vê a mesma variante ao voltar) e exposição equilibrada ao longo dos dias/horários.

## Implementação

- **Client-side** — JS altera a página após o load; rápido, mas pode causar *flicker*. Ferramentas: PostHog, Optimizely, VWO.
- **Server-side** — variante decidida antes do render; sem flicker, exige dev. Ferramentas: PostHog, LaunchDarkly, Split.

## Rodar o teste

**Checklist de pré-launch:** hipótese documentada · métrica primária definida · amostra calculada · variantes implementadas certo · tracking verificado · QA em todas as variantes.

**Durante — faça:** monitore problemas técnicos, qualidade dos segmentos, fatores externos. **Evite:** espiar e parar cedo, mudar as variantes, adicionar tráfego de fontes novas.

> **O problema de espiar.** Olhar antes de bater a amostra e parar cedo produz falso positivo e decisão errada. Pré-comprometa a amostra e confie no processo.

## Analisar

- **Significância:** 95% de confiança = p < 0,05 — menos de 5% de chance de ver esse resultado se não houvesse efeito real. É um limiar, não uma garantia.
- **Checklist:** bateu a amostra? é significativo (olhe o intervalo de confiança)? o efeito é relevante vs. o MDE? as secundárias são consistentes? algum guardrail piorou? há diferença por segmento (mobile × desktop, novo × recorrente)?

| Resultado | Conclusão |
|---|---|
| Vencedor significativo | implemente a variante |
| Perdedor significativo | mantenha o controle e entenda por quê |
| Sem diferença significativa | mais tráfego, ou um teste mais ousado |
| Sinais mistos | investigue mais, talvez por segmento |

Documente **todo** teste: hipótese · variantes (com screenshot) · resultado (amostra, métricas, significância) · decisão e aprendizado.

---

## Programa de experimentação (growth)

Um teste isolado vale. Um programa contínuo é um ativo que compõe. O loop:

```
1. Gere hipóteses (dados, pesquisa, concorrência, feedback de cliente)
2. Priorize com ICE
3. Desenhe e rode o teste
4. Analise com rigor estatístico
5. Promova os vencedores a um playbook
6. Gere novas hipóteses a partir do aprendizado → repita
```

**Fontes de hipótese:** pontos de drop-off no analytics · dores na pesquisa com clientes · padrões da concorrência · tickets de suporte recorrentes · hesitação/rage-click em heatmaps · testes "perdedores" (revelam ângulos novos).

**Priorização ICE** — dê nota 1-10 em **Impacto** (quanto move a métrica), **Confiança** (quão seguros estamos, por dado) e **Facilidade** (quão rápido/barato de rodar). `ICE = (I + C + F) / 3`. Rode os maiores primeiro; re-pontue mensalmente.

**Velocidade** (indicador antecedente de growth): 4-8 experimentos/mês · win rate 20-30% (muito acima pode indicar hipóteses conservadoras) · duração média 2-4 semanas · backlog 20+ hipóteses · lift acumulado.

**Playbook** — quando um teste vence, documente o *padrão*, não só implemente:
```
## [Nome]  ·  [data]
Hipótese: ...
Resultado: [vencedor/perdedor] — [métrica] mudou [X%] (IC 95%: [faixa], p=[valor])
Guardrails: ... · Deltas por segmento: ...
Por que funcionou/falhou: ...
Padrão reutilizável: ex. "prova social perto do CTA de preço aumenta seleção de plano"
Aplicar em: [outras páginas/fluxos]  ·  Status: [implementado/parado/precisa follow-up]
```

**Cadência:** semanal (30min) revisar experimentos rodando e guardrails — sem cravar vencedor cedo, mas pare o que tiver guardrail muito negativo · quinzenal concluir e lançar o próximo · mensal revisar velocidade/win rate/lift e repor o backlog · trimestral auditar o playbook (quais padrões já foram escalados?).

## Erros comuns

- **Design:** mudança pequena demais (indetectável) · coisas demais (não isola) · sem hipótese clara.
- **Execução:** parar cedo · mudar no meio · não conferir a implementação.
- **Análise:** ignorar o intervalo de confiança · cherry-pick de segmento · superinterpretar resultado inconclusivo.
