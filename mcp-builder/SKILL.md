---
name: mcp-builder
description: Guia para criar servidores MCP (Model Context Protocol) de alta qualidade, que permitem a um LLM interagir com serviços externos por meio de tools bem desenhadas. Use ao construir um servidor MCP para integrar uma API ou serviço externo, seja em Python (FastMCP) ou Node/TypeScript (MCP SDK).
---

# mcp-builder — projete para o agente, prove com evals

A qualidade de um servidor MCP se mede por **uma coisa só**: quão bem um LLM consegue realizar tarefas reais com ele. Não é a cobertura da API nem a elegância do código — é o agente conseguindo trabalhar. Daí as duas disciplinas que amarram este guia: **projete as tools para o agente** que vai usá-las (não para um humano navegando a API), e **prove que funciona com evals** antes de declarar pronto (Fase 4 não é opcional).

Quatro fases: pesquisa & design → implementação → revisão & teste → evals.

---

## Fase 1 — Pesquisa e design

**Leia as fontes oficiais** (são a verdade, não reinvente):
- Spec do MCP: comece pelo sitemap `https://modelcontextprotocol.io/sitemap.xml`, depois busque páginas com sufixo `.md` (ex.: `https://modelcontextprotocol.io/specification/draft.md`).
- SDK TypeScript: `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`
- SDK Python: `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`
- E a doc da API do serviço que você vai integrar (endpoints, auth, modelos de dado).

**Stack recomendada:** TypeScript (SDK maduro, tipagem estática, modelos geram bem) ou Python/FastMCP. Transporte: **Streamable HTTP** (stateless JSON, escala fácil) para servidor remoto; **stdio** para servidor local.

**Princípios de design das tools** — todos a favor do agente:
- **Cobertura vs. workflow.** Tools de workflow são convenientes para uma tarefa específica; cobertura ampla da API dá ao agente flexibilidade para compor operações. Na dúvida, **priorize cobertura ampla** — mas exponha um workflow quando ele economizar muitas idas e vindas.
- **Nomes descobríveis.** Prefixo consistente + verbo de ação: `github_create_issue`, `github_list_repos`. O agente acha a tool certa pelo nome.
- **Saída enxuta.** Retorne dado focado e relevante; ofereça filtro e paginação. Contexto é caro — não despeje a resposta inteira da API.
- **Erros acionáveis.** A mensagem de erro guia o agente para a solução: o que deu errado + o próximo passo concreto.

---

## Fase 2 — Implementação

**Infra compartilhada:** cliente da API com autenticação, helpers de erro, formatação de resposta (JSON/Markdown), paginação.

**Para cada tool:**
- **Input schema** com Zod (TS) ou Pydantic (Python) — constraints, descrições claras, e um exemplo na descrição do campo.
- **Output schema** quando der (`outputSchema` + `structuredContent` no SDK TS) — ajuda o cliente a processar a saída.
- **Descrição** concisa: o que faz, os parâmetros, o formato de retorno.
- **Implementação** async para I/O, erro tratado com mensagem acionável, paginação onde couber.
- **Annotations** (dicas de comportamento para o cliente): `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`.

**Python (FastMCP):**
```python
from mcp.server.fastmcp import FastMCP
from pydantic import Field

mcp = FastMCP("github")

@mcp.tool()
def github_list_repos(
    org: str = Field(description="Nome da organização"),
    per_page: int = Field(default=30, le=100, description="Itens por página (máx. 100)"),
) -> list[dict]:
    """Lista os repositórios públicos de uma organização do GitHub."""
    repos = ...  # chamada à API
    return repos

if __name__ == "__main__":
    mcp.run()   # stdio, para servidor local
```

**TypeScript (MCP SDK):**
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "github", version: "1.0.0" });

server.registerTool(
  "github_list_repos",
  {
    description: "Lista os repositórios públicos de uma organização do GitHub.",
    inputSchema: { org: z.string(), perPage: z.number().max(100).default(30) },
    outputSchema: { repos: z.array(z.object({ name: z.string() })) },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  async ({ org, perPage }) => {
    const repos = await fetchRepos(org, perPage);
    return {
      content: [{ type: "text", text: JSON.stringify(repos) }],
      structuredContent: { repos },   // dado estruturado além do texto
    };
  },
);
```

---

## Fase 3 — Revisão e teste

- **Qualidade:** sem código duplicado (DRY), erro tratado de forma consistente, tipagem completa, descrições de tool claras.
- **Build:** TS → `npm run build`; Python → `python -m py_compile server.py`.
- **Teste interativo** com o MCP Inspector: `npx @modelcontextprotocol/inspector`. Chame cada tool, veja input/output reais, confirme que os erros são acionáveis.

---

## Fase 4 — Evals (a prova)

Um servidor sem eval é uma aposta. Aqui você testa se um LLM consegue de fato usar o servidor para responder perguntas realistas e complexas.

1. **Inspecione as tools** disponíveis e o que cada uma faz.
2. **Explore os dados** só com operações READ-ONLY.
3. **Gere 10 perguntas** complexas e realistas.
4. **Resolva você mesmo** cada uma, para ter o gabarito.

Cada pergunta precisa ser:
- **Independente** — não depende de outra pergunta.
- **Read-only** — só operações não-destrutivas.
- **Complexa** — exige várias tool calls e exploração de verdade.
- **Realista** — um caso que uma pessoa realmente teria.
- **Verificável** — uma resposta única, checável por comparação de string.
- **Estável** — a resposta não muda com o tempo.

Formato XML:
```xml
<evaluation>
  <qa_pair>
    <question>Entre os repositórios públicos da organização, qual tem mais issues abertas com o label "bug", e quantas são?</question>
    <answer>api-gateway: 42</answer>
  </qa_pair>
  <!-- mais qa_pairs... -->
</evaluation>
```

Rode as 10 perguntas contra o servidor com um LLM. As que ele erra apontam onde a tool é confusa, a saída é grande demais, ou o erro não é acionável — **conserte o servidor, não a pergunta.** Só declare pronto quando o agente passa nas evals.
