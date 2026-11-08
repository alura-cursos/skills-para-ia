# Skills para Claude Code: coleção Alura

Uma coleção de **20 Agent Skills em português** para o [Claude Code](https://claude.com/claude-code), com tarefas de programação, dados, marketing, produto e criação de conteúdo. Cada pasta reúne instruções para uma tarefa específica e também serve como exemplo para quem quer criar suas próprias skills.

Comece por uma skill que resolva uma necessidade sua. As ferramentas necessárias variam conforme a tarefa, como explicado em [Requisitos e compatibilidade](#requisitos-e-compatibilidade).

[Como usar](#como-usar) · [Exemplos de pedidos](#exemplos-de-pedidos) · [As 20 skills](#as-20-skills) · [Como funcionam](#como-as-skills-funcionam) · [Dúvidas comuns](#dúvidas-comuns)

## Como usar

Os passos abaixo são para o **Claude Code executado localmente**. Você precisa tê-lo instalado e autenticado. Se ainda não configurou o ambiente, siga o [guia oficial de instalação](https://code.claude.com/docs/en/setup).

### 1. Instale uma skill

Uma opção é usar o [Skills CLI da Vercel](https://github.com/vercel-labs/skills). A versão atual exige **Node.js 22.20 ou superior**. No terminal, dentro da pasta do projeto em que pretende trabalhar, execute:

```bash
npx skills add alura-cursos/skills-para-ia --skill product-prd -a claude-code
```

Esse exemplo instala `product-prd` no projeto atual. Siga as opções apresentadas pelo instalador. Para escolher outra skill, substitua `product-prd` pelo nome de uma das pastas listadas neste README.

Para disponibilizá-la em todos os seus projetos locais, use a instalação pessoal com `-g`:

```bash
npx skills add alura-cursos/skills-para-ia --skill product-prd -a claude-code -g
```

Escolha um dos dois escopos. O instalador disponibiliza os arquivos da skill; as dependências necessárias para executar a tarefa são configuradas separadamente.

<details>
<summary>Alternativa: instalação manual, sem o Skills CLI</summary>

Com Git instalado, os comandos abaixo baixam a coleção e copiam a pasta `product-prd` para o diretório de skills pessoais.

**macOS, Linux ou WSL:**

```bash
git clone https://github.com/alura-cursos/skills-para-ia.git
cd skills-para-ia
mkdir -p "$HOME/.claude/skills"
cp -R product-prd "$HOME/.claude/skills/"
```

**Windows com PowerShell:**

```powershell
git clone https://github.com/alura-cursos/skills-para-ia.git
Set-Location skills-para-ia
$destinoSkills = Join-Path $env:USERPROFILE ".claude\skills"
New-Item -ItemType Directory -Path $destinoSkills -Force | Out-Null
Copy-Item -LiteralPath ".\product-prd" -Destination $destinoSkills -Recurse
```

Você também pode baixar o repositório em **Code > Download ZIP**, extrair os arquivos e copiar a pasta da skill manualmente.

| Escopo | Onde colocar a pasta da skill |
| --- | --- |
| Pessoal, para seus projetos locais | `~/.claude/skills/product-prd/` ou `%USERPROFILE%\.claude\skills\product-prd\` no Windows |
| Somente um projeto | `.claude/skills/product-prd/`, dentro da pasta do projeto de destino |

O arquivo deve ficar diretamente em `product-prd/SKILL.md`. **Copie a pasta inteira**, incluindo os recursos auxiliares. Isso é essencial para `geracao-de-tutorial`, que inclui exemplos, templates e ferramentas de validação.

</details>

### 2. Abra o Claude Code

No terminal, abra a pasta do projeto em que deseja trabalhar e execute:

```bash
claude
```

Dentro do Claude Code, use `/skills` para conferir se a skill está disponível. Se instalou durante uma sessão já aberta e ela não apareceu, execute `/reload-skills` ou inicie uma nova sessão.

### 3. Faça um pedido

Para chamar a skill do exemplo diretamente, envie esta mensagem **dentro do Claude Code**:

```text
/product-prd Crie um PRD para uma funcionalidade de favoritos em uma plataforma de cursos. O objetivo é permitir que estudantes salvem cursos para assistir depois. Inclua escopo, critérios de aceitação e métricas de sucesso.
```

Também é possível pedir a tarefa em linguagem natural. Claude pode selecionar uma skill quando o pedido corresponde à sua descrição. Usar `/nome-da-skill` torna a escolha explícita.

Informe o objetivo, os arquivos ou dados disponíveis e o resultado esperado. Para tarefas com arquivos, forneça o caminho real dentro do projeto ou disponibilize o material na sessão.

## Exemplos de pedidos

Instale a skill correspondente antes de usar cada exemplo. Os caminhos de arquivo abaixo são ilustrativos.

| Skill | Exemplo de mensagem no Claude Code |
| --- | --- |
| `analise-csv` | `/analise-csv Analise dados/vendas.csv, identifique valores ausentes e gere gráficos adequados às colunas.` |
| `revisao-de-codigo` | `/revisao-de-codigo Revise as alterações desta branch em relação à main e priorize os problemas encontrados.` |
| `copy-de-anuncio` | `/copy-de-anuncio Crie cinco variações para divulgar um curso de Python a iniciantes no LinkedIn, explorando benefícios diferentes.` |
| `jornada-do-cliente` | `/jornada-do-cliente Mapeie a jornada de matrícula com base nas entrevistas em pesquisa/entrevistas.md e indique as lacunas de informação.` |
| `pdf` | `/pdf Extraia as tabelas de documentos/relatorio.pdf e salve os resultados em CSV.` |

---

## As 20 skills

### 🧑‍💻 Código & engenharia

- **[`revisao-de-codigo`](revisao-de-codigo/SKILL.md)**: *"revisão por lentes, com verificação e veredito"*  
  Revisa um diff/PR/branch por perspectivas independentes (correção, design, segurança, testes, intenção) em subagentes paralelos, verifica cada achado antes de reportar e entrega um relatório priorizado por severidade.
- **[`diagnostico-de-bugs`](diagnostico-de-bugs/SKILL.md)**: *"reproduza antes de raciocinar"*  
  Investiga bugs e regressões de desempenho a partir de um caso reproduzível, testa hipóteses e verifica a correção.
- **[`conflitos-de-merge`](conflitos-de-merge/SKILL.md)**: *"resolva intenções, não texto"*  
  Resolve conflitos de merge/rebase do git reconstruindo o que cada lado queria fazer, em vez de escolher blocos de texto no escuro.
- **[`arquitetura-de-codigo`](arquitetura-de-codigo/SKILL.md)**: *"aprofunde módulos, não reorganize"*  
  Varre o codebase atrás de módulos rasos para aprofundar, mostra os candidatos num relatório HTML com diagramas antes/depois, e refatora junto com você o que você escolher.
- **[`testes-de-frontend`](testes-de-frontend/SKILL.md)**: *"reconheça antes de agir"*  
  Toolkit Playwright para testar webapps locais: renderiza, inspeciona o DOM real e age com os seletores que descobriu em vez de chutar.

### 📊 Dados & finanças

- **[`analise-csv`](analise-csv/SKILL.md)**: *"inspecione, entregue tudo, não pergunte"*  
  Resume, analisa e visualiza arquivos CSV com pandas, adaptando as análises às colunas existentes e entregando estatísticas, gráficos e interpretações.
- **[`indices-financeiros`](indices-financeiros/SKILL.md)**: *"o número precisa de contexto"*  
  Calcula índices financeiros (rentabilidade, liquidez, alavancagem, eficiência, valuation) a partir de demonstrações e os interpreta contra indústria e tendências. Não solta número solto.

### 📈 Growth & marketing

- **[`teste-ab`](teste-ab/SKILL.md)**: *"decida antes de rodar, não espie"*  
  Planeja e implementa testes A/B e programas de experimentação, com hipótese, métrica, amostra e regra de parada fixadas antes de o teste começar.
- **[`copy-de-anuncio`](copy-de-anuncio/SKILL.md)**: *"varie o ângulo, não a palavra"*  
  Gera, itera e escala criativos de anúncio para qualquer plataforma de mídia paga, explorando ângulos diferentes em vez de trocar sinônimos.
- **[`plano-de-marketing`](plano-de-marketing/SKILL.md)**: *"específico ou fracassa"*  
  Monta um plano de growth executável de 12 meses estruturado por AARRR, ancorado no orçamento, time e estágio reais do cliente.
- **[`pesquisa-de-mercado`](pesquisa-de-mercado/SKILL.md)**: *"autoridade se ganha: fonte e premissa em tudo"*  
  Produz relatórios detalhados de pesquisa de mercado em LaTeX, com fontes para os dados e premissas explícitas nas projeções.

### 🧭 Produto & pesquisa

- **[`jornada-do-cliente`](jornada-do-cliente/SKILL.md)**: *"sintetize pesquisa, não invente"*  
  Mapeia a jornada do cliente (estágios, touchpoints, curva emocional, dores, oportunidades), com visualização em mermaid, e se recusa a fabricar dado emocional sem input de pesquisa.
- **[`product-prd`](product-prd/SKILL.md)**: *"o quê e o porquê, não o como"*  
  Cria um PRD que alinha stakeholders no que construir, por quê, e como medir sucesso, sem prescrever a implementação.
- **[`ideacao-de-pesquisa`](ideacao-de-pesquisa/SKILL.md)**: *"diverja antes de julgar"*  
  Brainstorming de pesquisa early-stage, separando a geração da avaliação para não matar a ideia ousada cedo demais.

### 🎨 Conteúdo & interface

- **[`geracao-de-tutorial`](geracao-de-tutorial/SKILL.md)**: *"construa um tutorial técnico de nível Distill"*  
  Produz tutoriais técnicos em HTML com explicações progressivas, diagramas animados, exemplos interativos, acessibilidade e temas claro e escuro. Inclui arquivos auxiliares de exemplos, revisão e validação.
- **[`pdf`](pdf/SKILL.md)**: *"operações com PDF (Python + linha de comando)"*  
  Extrai texto/tabelas, junta, divide, rotaciona, coloca marca d'água, preenche formulários, criptografa e roda OCR em PDFs, via Python e CLI.
- **[`pptx`](pptx/SKILL.md)**: *"criar, ler e editar apresentações"*  
  Cria, lê e edita apresentações `.pptx` com python-pptx, incluindo revisão visual dos slides por outro subagente antes da entrega.
- **[`frontend-design`](frontend-design/SKILL.md)**: *"escolha, não default"*  
  Define paleta, tipografia e layout para criar interfaces com identidade visual adequada ao conteúdo, ao público e ao objetivo do projeto.

### 🤖 Ferramentas para agentes

- **[`mcp-builder`](mcp-builder/SKILL.md)**: *"projete para o agente, prove com evals"*  
  Guia para construir servidores MCP de qualidade (Python/FastMCP ou Node/TypeScript SDK) e provar que um LLM realmente consegue usá-los, com evals.
- **[`pi-agent`](pi-agent/SKILL.md)**: *"construir com e usar o Pi"*  
  Instalar, configurar e estender o Pi (o harness minimalista de coding no terminal): SDK, RPC, skills, extensions e o ecossistema de pacotes.

---

## Como as skills funcionam

Uma skill reúne instruções em um arquivo `SKILL.md` e pode incluir scripts, exemplos e outros recursos. O início do arquivo contém os metadados `name` e `description` entre marcadores `---`; o restante descreve como executar a tarefa.

```markdown
---
name: revisao-de-codigo          # igual ao nome da pasta
description: Revisa alterações de código e apresenta os problemas por severidade.
---

# revisao-de-codigo: revisão por lentes, com verificação e veredito

(Instruções da skill...)
```

O agente usa os metadados para identificar skills relevantes e carrega as instruções completas quando uma delas é acionada. Esse carregamento sob demanda é chamado de *progressive disclosure*. Veja o [formato Agent Skills](https://agentskills.io/home) e a [documentação de skills do Claude Code](https://code.claude.com/docs/en/skills).

## Requisitos e compatibilidade

As instruções desta coleção foram preparadas para o Claude Code. Em outros agentes que aceitam o formato Agent Skills, pode ser necessário adaptar ferramentas, caminhos e recursos de execução.

Além do agente, algumas tarefas exigem ferramentas específicas. Exemplos:

| Skill | Dependências conforme a tarefa |
| --- | --- |
| `analise-csv` | Python, pandas, matplotlib e seaborn |
| `testes-de-frontend` | Python, Playwright, Chromium e aplicação acessível para teste |
| `pdf` | Bibliotecas Python; Poppler para algumas operações e Tesseract quando houver OCR |
| `pptx` | python-pptx ou PptxGenJS; LibreOffice e Poppler para o fluxo de revisão visual |
| `pesquisa-de-mercado` | Acesso às fontes de pesquisa e ferramentas LaTeX para gerar o relatório |
| `geracao-de-tutorial` | Recursos da pasta, Python para validação e suporte à ferramenta `Workflow()` para os fluxos de revisão que a utilizam |

Consulte o `SKILL.md` da opção escolhida para os requisitos completos. As skills que usam subagentes também dependem desse recurso no ambiente de execução.

## Dúvidas comuns

**A skill não apareceu.** Confira o nome da pasta, a presença de `SKILL.md` e o escopo de instalação. Na instalação manual, evite uma pasta extra entre o nome da skill e o arquivo. Use `/reload-skills` ou abra uma nova sessão.

**A skill está disponível, mas não foi usada.** Chame-a explicitamente com `/nome-da-skill` e descreva a tarefa, os dados de entrada e a entrega esperada.

**Faltou uma biblioteca ou ferramenta.** Verifique os requisitos no `SKILL.md` e configure a dependência no mesmo ambiente em que o agente executa a tarefa. Instalar a skill não instala automaticamente Python, navegadores ou ferramentas de documentos.

**Como atualizar?** Se instalou pelo Skills CLI, use `npx skills check` para consultar atualizações e `npx skills update` para aplicá-las. Se copiou as pastas manualmente, baixe a versão atual da coleção e atualize as cópias instaladas, preservando eventuais personalizações.

**Posso adaptar uma skill?** Você pode ajustar as instruções para seu fluxo de trabalho. Use um nome e uma descrição que expliquem quando ela deve entrar em ação e experimente com tarefas representativas antes de incorporá-la à rotina.
