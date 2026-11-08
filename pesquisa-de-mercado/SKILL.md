---
name: pesquisa-de-mercado
description: Gera relatórios abrangentes de pesquisa de mercado (50+ páginas) no estilo das grandes consultorias (McKinsey, BCG, Gartner). Formatação profissional em LaTeX, visuais extensos (diagramas e gráficos), pesquisa de dado aprofundada, e análise estratégica multi-framework — Porter Five Forces, PESTLE, SWOT, TAM/SAM/SOM e Matriz BCG. Use para análise de mercado para decisão de investimento, entrada em mercado, due diligence de M&A, ou go-to-market.
---

# pesquisa-de-mercado — autoridade se ganha: fonte e premissa em tudo

Um relatório de 50+ páginas em LaTeX, com frameworks e gráficos, **parece** autoritativo por padrão. A disciplina que o torna crível — e não ficção confiante com boa tipografia — é simples e inegociável: **todo número tem fonte, e toda projeção declara suas premissas.** Limitações de dado são nomeadas, não varridas.

Saída: LaTeX compilado para PDF, rico em visual, multi-framework, com recomendações acionáveis.

## Estrutura (~50+ páginas)

**Front matter (~5p):** capa (com visual de destaque) · sumário / lista de figuras e tabelas (auto) · **sumário executivo** (2-3p): snapshot de métricas, tese de investimento, achados-chave, top 3-5 recomendações, infográfico de síntese.

**Núcleo (~35p) — 11 capítulos:**
1. **Visão geral & definição** do mercado — escopo, ecossistema, stakeholders, adjacências.
2. **Tamanho & crescimento** — TAM/SAM/SOM, CAGR histórico (5-10a) e projetado, drivers, quebra regional e por segmento.
3. **Drivers & tendências** — **PESTLE**; matriz probabilidade × impacto.
4. **Cenário competitivo** — **Porter's Five Forces**, market share, matriz de posicionamento 2×2, grupos estratégicos, barreiras de entrada.
5. **Cliente & segmentação** — tamanho e crescimento por segmento, comportamento de compra, jornada.
6. **Tecnologia & inovação** — stack atual, tecnologias emergentes, curva de adoção, patentes.
7. **Ambiente regulatório** — framework atual, órgãos, mudanças à frente, avaliação de impacto.
8. **Risco** — **risk heatmap** (probabilidade × impacto), registro de riscos, matriz de mitigação.
9. **Oportunidades & recomendações** — sizing, opções (build/buy/partner/ignore), matriz atratividade × capacidade de vencer, prioridade impacto × esforço.
10. **Roadmap de implementação** — plano faseado, marcos, dependências, timeline/Gantt.
11. **Tese de investimento & projeções** — projeção financeira, análise de cenários, retorno esperado, premissas, sensibilidade.

**Back matter (~5p):** metodologia & fontes · tabelas detalhadas de dado · perfis das empresas · **bibliografia** (BibTeX).

> Alvo por seção (mínimo → alvo): front 4→5 · overview 4→5 · tamanho 5→7 · drivers 4→6 · competitivo 5→7 · cliente 3→5 · tech 3→5 · regulatório 2→4 · risco 2→4 · recomendações 3→5 · roadmap 2→4 · investimento 2→4 · back 4→5. Total: o mínimo por seção soma ~43 — adense os capítulos finos e os apêndices para cruzar o piso de **50+**.

## Frameworks (aplique com rigor)

- **TAM/SAM/SOM** — do topo ao obtível, com premissas explícitas em cada camada.
- **Porter's Five Forces** — classifique cada força (Alto/Médio/Baixo) **com justificativa**, não só o rótulo.
- **PESTLE** — cada dimensão (político, econômico, social, tecnológico, legal, ambiental) com a tendência e o impacto.
- **SWOT** — forças/fraquezas (internas) × oportunidades/ameaças (externas); sintetizada no sumário executivo / capítulo 1.
- **Matriz BCG** e **posicionamento competitivo 2×2** — defina os eixos, plote os concorrentes.

## Fluxo

1. **Escopo** — definição do mercado, fronteiras geográficas, horizonte temporal, perguntas-chave.
2. **Pesquisa profunda** — reúna dado de: relatórios de indústria (Gartner, Forrester, IDC…), dados de associação setorial, estatística de governo, relatórios financeiros de empresas, estudos acadêmicos. **Cada estatística com fonte.** Cruze múltiplas fontes quando puder; anote as lacunas.
3. **Análise** — aplique os frameworks; sintetize em insights; identifique implicações estratégicas; priorize oportunidades.
4. **Visuais primeiro** — gere os **5-6 essenciais** antes de escrever (trajetória de crescimento, TAM/SAM/SOM, Porter's, matriz de posicionamento, risk heatmap, + infográfico do exec summary); adicione os de seção conforme escreve. Use a ferramenta que tiver — `matplotlib`/`plotly` para gráficos de dado; uma ferramenta de diagrama ou geração de imagem para esquemas. **Cada figura cita a fonte na legenda**, 300 DPI, paleta amigável a daltônicos, consistente no relatório todo.
5. **Escreva** (LaTeX, abaixo) — seção a seção, cobertura completa, sem abreviar; lidere com o insight, apoie no dado; fonte para toda estatística.
6. **Compile e revise** — pelo checklist.

## LaTeX (autocontido, com `tcolorbox`)

```latex
\documentclass[11pt]{report}
\usepackage[table]{xcolor}
\usepackage{tcolorbox}\tcbuselibrary{skins}
\usepackage{graphicx,booktabs}

% caixas de destaque — defina uma vez
\newtcolorbox{achado}[1]{colback=blue!5,  colframe=blue!55,  title=#1}
\newtcolorbox{risco}[1] {colback=orange!5,colframe=orange!70,title=#1}
\newtcolorbox{recomend}[1]{colback=violet!5,colframe=violet!60,title=#1}

\begin{document}
\begin{achado}{Achado-chave}
O mercado deve crescer a 15,3\% de CAGR até 2030.
\end{achado}

\begin{figure}[htbp]\centering
  \includegraphics[width=0.9\textwidth]{figures/market_growth.png}
  \caption{Trajetória de crescimento (2020–2030). Fonte: análise da indústria.}
\end{figure}

\begin{table}[htbp]\centering
  \caption{Tamanho de mercado por região (2024)}
  \begin{tabular}{@{}lrrr@{}}\toprule
    \textbf{Região} & \textbf{Tamanho} & \textbf{Share} & \textbf{CAGR}\\\midrule
    América do Norte & \$18,2B & 40,3\% & 12,5\%\\
    Ásia-Pacífico    & \$10,5B & 23,2\% & 18,7\%\\\midrule
    \textbf{Total}   & \$45,2B & 100\%  & 15,3\%\\\bottomrule
  \end{tabular}
\end{table}
\end{document}
```

Compile: `xelatex rel.tex && bibtex rel && xelatex rel.tex && xelatex rel.tex` (duas passadas depois do bibtex resolvem TOC, figuras e citações).

## Checklist final

- [ ] Estrutura completa: capa · TOC/listas · exec summary · os 11 capítulos · apêndices (metodologia, tabelas, perfis) · bibliografia.
- [ ] Os 5-6 visuais essenciais presentes e renderizando.
- [ ] **Toda estatística tem fonte citada.**
- [ ] **Toda projeção declara suas premissas**; limitações reconhecidas.
- [ ] Frameworks aplicados de fato (Porter com justificativa, PESTLE por dimensão, TAM/SAM/SOM com premissas).
- [ ] Recomendações específicas e priorizadas (não "melhore o SEO").
- [ ] Dado com no máximo ~2 anos; números específicos em vez de qualificadores vagos.
- [ ] PDF compila sem erro; cross-refs e bibliografia OK; **50+ páginas**.
