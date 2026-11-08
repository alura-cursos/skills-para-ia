# Skills para Claude Code — coleção Alura

Uma coleção curada de **Agent Skills** para o [Claude Code](https://claude.com/claude-code): 20 skills prontas para usar, escritas em português. Cada pasta é uma skill independente e serve para duas coisas ao mesmo tempo: **usar como ferramenta** (o Claude dispara sozinho quando o seu pedido casa com a descrição) e **ler como exemplo** de como uma skill boa é feita por dentro.

---

## As 20 skills

### 🧑‍💻 Código & engenharia

- **[`revisao-de-codigo`](revisao-de-codigo/SKILL.md)** — *"revisão por lentes, com verificação e veredito"*  
  Revisa um diff/PR/branch por lentes independentes (correção, design, segurança, testes, intenção) em sub-agentes paralelos, verifica cada achado antes de reportar e entrega um relatório priorizado por severidade.
- **[`diagnostico-de-bugs`](diagnostico-de-bugs/SKILL.md)** — *"reproduza antes de raciocinar"*  
  Loop de diagnóstico para bugs difíceis e regressões de performance: primeiro um repro apertado que falha de verdade, só então a teoria da causa.
- **[`conflitos-de-merge`](conflitos-de-merge/SKILL.md)** — *"resolva intenções, não texto"*  
  Resolve conflitos de merge/rebase do git reconstruindo o que cada lado queria fazer, em vez de escolher blocos de texto no escuro.
- **[`arquitetura-de-codigo`](arquitetura-de-codigo/SKILL.md)** — *"aprofunde módulos, não reorganize"*  
  Varre o codebase atrás de módulos rasos para aprofundar, mostra os candidatos num relatório HTML com diagramas antes/depois, e refatora junto com você o que você escolher.
- **[`testes-de-frontend`](testes-de-frontend/SKILL.md)** — *"reconheça antes de agir"*  
  Toolkit Playwright para testar webapps locais: renderiza, inspeciona o DOM real e age com os seletores que descobriu em vez de chutar.

### 📊 Dados & finanças

- **[`analise-csv`](analise-csv/SKILL.md)** — *"inspecione, entregue tudo, não pergunte"*  
  Resume, analisa e visualiza qualquer CSV com pandas, adaptando as análises às colunas reais e entrega o pacote completo de uma vez, sem travar em perguntas.
- **[`indices-financeiros`](indices-financeiros/SKILL.md)** — *"o número precisa de contexto"*  
  Calcula índices financeiros (rentabilidade, liquidez, alavancagem, eficiência, valuation) a partir de demonstrações e os interpreta contra indústria e tendências. Não solta número solto.

### 📈 Growth & marketing

- **[`teste-ab`](teste-ab/SKILL.md)** — *"decida antes de rodar, não espie"*  
  Planeja e implementa testes A/B e programas de experimentação, com hipótese, métrica, amostra e regra de parada fixadas antes de o teste começar.
- **[`copy-de-anuncio`](copy-de-anuncio/SKILL.md)** — *"varie o ângulo, não a palavra"*  
  Gera, itera e escala criativos de anúncio para qualquer plataforma de mídia paga, explorando ângulos diferentes em vez de trocar sinônimos.
- **[`plano-de-marketing`](plano-de-marketing/SKILL.md)** — *"específico ou fracassa"*  
  Monta um plano de growth executável de 12 meses estruturado por AARRR, ancorado no orçamento, time e estágio reais do cliente.
- **[`pesquisa-de-mercado`](pesquisa-de-mercado/SKILL.md)** — *"autoridade se ganha: fonte e premissa em tudo"*  
  Gera relatórios de pesquisa de mercado (50+ páginas) em LaTeX no estilo das grandes consultorias, com fonte em cada dado e premissa em cada projeção.

### 🧭 Produto & pesquisa

- **[`jornada-do-cliente`](jornada-do-cliente/SKILL.md)** — *"sintetize pesquisa, não invente"*  
  Mapeia a jornada do cliente (estágios, touchpoints, curva emocional, dores, oportunidades), com visualização em mermaid, e se recusa a fabricar dado emocional sem input de pesquisa.
- **[`product-prd`](product-prd/SKILL.md)** — *"o quê e o porquê, não o como"*  
  Cria um PRD que alinha stakeholders no que construir, por quê, e como medir sucesso, sem prescrever a implementação.
- **[`ideacao-de-pesquisa`](ideacao-de-pesquisa/SKILL.md)** — *"diverja antes de julgar"*  
  Brainstorming de pesquisa early-stage, separando a geração da avaliação para não matar a ideia ousada cedo demais.

### 🎨 Conteúdo & interface

- **[`geracao-de-tutorial`](geracao-de-tutorial/SKILL.md)** — *"construa um tutorial técnico de nível Distill"*  
  Constrói tutoriais extremamente completos e caprichados em HTML. Explicações que priorizam a intuição, equações com código de cores, SVGs animados, widgets interativos, acessibilidade e dark/light. É a única skill multi-arquivo (exemplos, workflows e validação inclusos).
- **[`pdf`](pdf/SKILL.md)** — *"operações com PDF (Python + linha de comando)"*  
  Extrai texto/tabelas, junta, divide, rotaciona, coloca marca d'água, preenche formulários, criptografa e roda OCR em PDFs, via Python e CLI.
- **[`pptx`](pptx/SKILL.md)** — *"criar, ler e editar apresentações"*  
  Cria, lê e edita apresentações `.pptx` com python-pptx, incluindo uma etapa de QA visual por um sub-agente de olhos frescos antes de entregar.
- **[`frontend-design`](frontend-design/SKILL.md)** — *"escolha, não default"*  
  Direção de design visual que foge do template: paleta, tipografia e layout que sangram do assunto do brief, não dos defaults de IA.

### 🤖 Ferramentas para agentes

- **[`mcp-builder`](mcp-builder/SKILL.md)** — *"projete para o agente, prove com evals"*  
  Guia para construir servidores MCP de qualidade (Python/FastMCP ou Node/TypeScript SDK) e provar que um LLM realmente consegue usá-los, com evals.
- **[`pi-agent`](pi-agent/SKILL.md)** — *"construir com e usar o Pi"*  
  Instalar, configurar e estender o Pi (o harness minimalista de coding no terminal): SDK, RPC, skills, extensions e o ecossistema de pacotes.

---

## Como as skills funcionam

Uma skill é uma pasta com um arquivo `SKILL.md` — só ele é obrigatório. O arquivo tem um frontmatter YAML e um corpo em markdown:

```yaml
---
name: revisao-de-codigo          # igual ao nome da pasta
description: Revisa um conjunto de mudanças...   # é isso que dispara a skill
---

# revisao-de-codigo — revisão por lentes, com verificação e veredito

(instruções da skill...)
```

O Claude Code enxerga o `name` e a `description` de todas as skills o tempo todo, mas **só carrega o corpo do `SKILL.md` quando é relevante**, quando o seu pedido casa com a descrição. Isso é *progressive disclosure*: a descrição é barata e fica sempre visível; o conteúdo pesado só entra em contexto na hora do uso.

## Como usar

Copie a pasta da skill para o diretório de skills do Claude Code:

```bash
# skill pessoal (vale em qualquer projeto seu)
cp -r revisao-de-codigo ~/.claude/skills/

# ou skill de projeto (vale só naquele repositório, versionada junto)
cp -r revisao-de-codigo .claude/skills/
```

Pronto. A skill é descoberta automaticamente e dispara quando o seu pedido bate com a descrição. Você não precisa "chamar" pelo nome (mas pode). Para conferir se foi carregada, use `/skills` no Claude Code.