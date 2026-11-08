---
name: copy-de-anuncio
description: Use quando o usuário quiser gerar, iterar ou escalar criativos de anúncio — headlines, descrições, texto primário ou variações completas — para qualquer plataforma de mídia paga. Também quando mencionar "variações de anúncio", "ad copy", "gerar headlines", "RSA headlines", "copy em massa", "creative testing", "otimizar performance de anúncio", "escreve uns anúncios", "copy de Facebook/Google/LinkedIn Ads" ou "preciso de mais variações". Use sempre que alguém precisar produzir copy de anúncio em escala ou iterar em anúncios existentes.
---

# copy-de-anuncio — varie o ângulo, não a palavra

O erro nº 1 ao gerar criativo é produzir 15 headlines que dizem **a mesma coisa** com sinônimos trocados. Isso é ruído, não teste. Um teste de verdade precisa de **ângulos distintos** — motivos diferentes para alguém clicar. E, depois que os anúncios rodam, você itera **pelo dado** (dobra a aposta no que vence), não pelo achismo.

Duas regras duras embaixo disso: **varie o ângulo, não a palavra**, e **valide cada peça contra o limite de caractere da plataforma antes de entregar** — elas truncam em silêncio.

## Antes de começar

Reúna (pergunte o que faltar, mas use o contexto de produto/público que já tiver):

- **Plataforma & formato** — Google (RSA), Meta, LinkedIn, TikTok, X? feed, stories, search, vídeo? partindo do zero ou iterando?
- **Produto & oferta** — o que promove, a proposta de valor central, o que difere da concorrência.
- **Público & consciência** — quem é, e em que estágio (consciente do problema / da solução / do produto); qual dor ou desejo move.
- **Dado de performance** (se iterando) — o que roda hoje, o que performa melhor/pior (CTR, conversão, ROAS), que ângulos já foram testados.
- **Restrições** — voz da marca / palavras a evitar, compliance, elementos obrigatórios (marca, disclaimer).

## Dois modos

1. **Do zero** — gera um set completo a partir do contexto de produto, público e boas práticas da plataforma.
2. **Iterando por dado** — analisa o que funciona, acha o padrão dos vencedores, gera novas variações em cima dos temas vencedores explorando 1-2 ângulos novos.

Loop: `puxa dado → identifica padrão vencedor → gera variações → valida specs → entrega`.

## Ângulos primeiro (o coração)

Antes de escrever headline nenhuma, defina **3-5 ângulos distintos** — cada um toca uma motivação diferente:

| Categoria | Exemplo |
|---|---|
| Dor | "Pare de perder tempo com X" |
| Resultado | "Alcance Y em Z dias" |
| Prova social | "Junte-se a 10.000+ times que…" |
| Curiosidade | "O segredo de X que as top usam" |
| Comparação | "Diferente de X, a gente faz Y" |
| Urgência | "Por tempo limitado: X grátis" |
| Identidade | "Feito para [papel/tipo específico]" |
| Contrário | "Por que [prática comum] não funciona" |

Para **cada** ângulo, gere várias variações mexendo em palavra, especificidade (número × claim genérico), tom (afirmação × pergunta × comando) e estrutura (soco curto × benefício completo). Mas o que você **testa** são os ângulos — não os sinônimos.

## Specs das plataformas (valide antes de entregar)

| Plataforma | Peça | Limite | Qtde |
|---|---|---|---|
| **Google RSA** | Headline | 30 caracteres | até 15 |
| | Descrição | 90 caracteres | até 4 |
| **Meta** | Texto primário | 125 visíveis (2.200 máx) | front-load o gancho |
| | Headline / descrição | ~40 / ~30 | — |
| **LinkedIn** | Intro / headline | ~150 (600) / ~70 (200) | — |
| **TikTok** | Texto | ~80 (100 máx) | — |
| **X** | Texto / headline do card | 280 / 70 | — |

**RSA:** headlines têm que fazer sentido **sozinhas e em qualquer combinação** (o Google combina e otimiza as headlines — qualquer combinação pode ser exibida); inclua ao menos uma focada em keyword, uma em benefício e 2-3 de **CTA**. Fixe posição só quando necessário (reduz a otimização).

## Iterar pelo dado

1. **Analise os vencedores** (peça qual métrica importa — CTR, conversão, ROAS): que temas, estruturas (pergunta? número? comando?) e palavras se repetem no topo? mais curtos ou mais longos?
2. **Analise os perdedores** — que ângulos não ressoam? genérico demais? longo demais? tom errado?
3. **Gere o novo** — dobre a aposta nos temas vencedores com fraseado fresco, estenda os ângulos que ganham, teste 1-2 novos, e **evite** os padrões dos perdedores.
4. **Documente a rodada** — top performers + métricas, padrão vencedor, novas variações, ângulos novos em teste, ângulos aposentados.

> Para estruturar esses testes com rigor estatístico (amostra, significância, não espiar), veja a skill **`teste-ab`**.

## Qualidade da copy

**Headline que clica:** específica ("Corte 75% do tempo de relatório") > vaga ("Economize tempo"); benefício ("Suba código mais rápido") > feature ("Pipeline de CI/CD"); voz ativa; número quando der ("3× mais rápido", "em 5 min", "10.000+ times"). **Evite:** jargão que o público não reconhece; claim sem especificidade ("melhor", "líder"); CAIXA ALTA e pontuação em excesso; clickbait que a landing page não entrega.

**Descrição complementa, não repete** a headline: ponto de prova (número, depoimento), quebra de objeção ("Sem cartão de crédito"), reforço de CTA, urgência **genuína**.

## Saída

- **Padrão** — organizada por ângulo, com contagem de caracteres; sinalize o que passou do limite e ofereça a versão aparada.
- **CSV em massa** (10+ variações) — colunas `headline_1..n, description_1..n, platform` para upload direto.
- **Relatório de iteração** — resumo de performance (analisado, melhor/pior, padrão) + criativo novo + recomendações (o que pausar, escalar, testar).

## Produção em escala + visuais

**Copy em ondas:** onda 1 = ângulos centrais (3-5 ângulos × 5 variações); onda 2 = estende os 2 melhores; onda 3 = curingas (contrário, emocional, ultra-específico). Filtro de qualidade: fora do limite, duplicata, possível violação de política, e combos headline/descrição que fazem sentido juntos.

**Visuais:** imagem estática com IA generativa (Flux, Ideogram, Gemini/"Nano Banana"); vídeo com Veo, Kling, Runway, Sora; e vídeo **templatizado, orientado a dado**, com Remotion para escalar centenas de variações. Fluxo: gere o hero criativo com IA (exploratório) → vire template no Remotion nos padrões vencedores → produza em lote.

## Erros comuns

Headlines que só funcionam juntas (qualquer combinação pode ser servida) · ignorar limite de caractere · todas as variações com o mesmo ângulo · nenhuma headline de CTA · descrição genérica ("Saiba mais sobre nossa solução") · iterar sem dado · mudar muita coisa por ciclo · aposentar criativo cedo demais (dê 1.000+ impressões antes de julgar).
