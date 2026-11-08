---
name: pi-agent
description: Construir com e usar o Pi, o harness minimalista de coding no terminal. Use para instalar o Pi, configurar providers/modelos/settings, criar skills/extensions/packages/themes/prompt templates, embutir o Pi via SDK, integrar por RPC ou streams de eventos JSON, parsear sessões, desenvolver providers e componentes de TUI custom, ou usar pacotes do ecossistema como pi-subagents (delegação/orquestração), pi-mcp-adapter (servidores MCP), pi-interview (formulários interativos) e pi-web-access (busca web, fetch, entendimento de vídeo).
---

# pi-agent — construir com e usar o Pi

O Pi é um harness minimalista de coding no terminal (pacote `@earendil-works/pi-coding-agent`), estendido por extensions TypeScript, skills, packages, prompt templates, themes, providers/modelos custom, integração via SDK, modo RPC, streams de eventos JSON e componentes de TUI. Docs: `https://pi.dev/docs/latest`.

Duas disciplinas guiam qualquer trabalho com Pi: **escolha a superfície certa** para a tarefa antes de codar (não chute a API), e lembre que **o Pi roda local e sem sandbox** — trate todo recurso como código com as permissões do processo.

## Instalar e rodar

Requer Node.js/npm.

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
pi                                                   # inicia a sessão
pi -p "Resuma este codebase"                         # one-shot com prompt
pi --provider anthropic --model claude-sonnet-4-5    # escolhe provider/modelo
pi --tools read,grep,find,ls -p "Revise o repositório"
```

## Escolha a superfície

| Necessidade | Superfície |
|---|---|
| App Node/TS com type-safety, acesso direto ao estado, tools/extensions in-process | **SDK** — `createAgentSession()` para uma sessão estável; `createAgentSessionRuntime()` quando o app troca de sessão via new/resume/fork/clone/import |
| Cliente não-Node, isolamento de processo, protocolo agnóstico de linguagem | **RPC** — comece com `pi --mode rpc --no-session` (subprocesso stateless); adicione flags de sessão quando precisar persistir |
| Pipeline one-shot que só consome eventos em streaming (sem controle bidirecional) | **JSON** — `pi --mode json "prompt"` |
| Comportamento nativo do Pi: tools custom, handlers de comando, hooks de evento, registro de provider, compaction custom, proteção de path, política de trust do projeto, prompts de UI, widgets, componentes de TUI | **extension** (TypeScript) |
| Compartilhar ou instalar extensions/skills/prompt templates/themes entre máquinas e projetos | **package** |

## Pacotes do ecossistema

- **pi-subagents** — delegação e orquestração: subagentes, cadeias, runs paralelos.
- **pi-mcp-adapter** — conectar servidores MCP; descoberta e config de tools MCP.
- **pi-interview** — formulários de entrevista interativos, input estruturado do usuário.
- **pi-web-access** — busca web, fetch de URL/PDF/repo, entendimento de vídeo.

## Segurança (não pule)

O Pi é **local e não-sandboxed por padrão.** Trate extensions, packages, skills, comandos de shell e os recursos `.pi` locais do projeto como **código** rodando com as permissões do processo Pi. Para repos não-confiáveis ou automação sem supervisão, isole com Docker, uma VM ou uma sandbox remota.

**Não** guarde segredos em arquivos do projeto. Prefira variáveis de ambiente, `~/.pi/agent/auth.json`, OAuth via `/login`, ou lookup de segredo por comando na config de provider / `models.json`.

## Fonte autoritativa

Este guia resume a documentação do Pi em `https://pi.dev/docs/latest` e as páginas de pacote em `https://pi.dev/packages/`. **Quando o comportamento exato da API importar**, vá à doc citada e inspecione as definições TypeScript instaladas em `node_modules/@earendil-works/pi-coding-agent/dist/` e `node_modules/@earendil-works/pi-ai/dist/`. A doc cobre também os temas que este guia não detalha: setup de providers e modelos locais/proxies, implementação de provider custom (OAuth, streaming), sessões (branching, compaction, formato JSONL), themes e prompt templates, keybindings e setup de terminal (tmux, Windows, Termux), containerization e trust, e desenvolvimento do próprio Pi.
