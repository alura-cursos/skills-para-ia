---
name: testes-de-frontend
description: Toolkit para interagir com e testar aplicações web locais usando Playwright. Serve para verificar funcionalidade de frontend, debugar comportamento de UI, capturar screenshots do browser e ver logs do console. Use quando o usuário quiser testar uma webapp local, automatizar cliques/preenchimento, tirar screenshot de uma página, ou investigar por que a UI não se comporta como esperado.
---

# testes-de-frontend — reconheça antes de agir

O erro nº 1 em automação web é **chutar seletores** — do código-fonte, ou do que você *acha* que a página renderiza. App dinâmico renderiza diferente do fonte, e o JS roda depois do load. A disciplina: renderize a página, **espere ela assentar** (`networkidle`), **inspecione o DOM realmente renderizado** (screenshot + query), e só então aja com os seletores que você **descobriu** — nunca com os que você supôs.

Escreva scripts nativos de Playwright em Python. Setup: `pip install playwright && playwright install chromium`.

---

## Árvore de decisão

```
Tarefa → é HTML estático?
  ├─ Sim → leia o HTML direto para achar os seletores → script Playwright via file://
  │        (se falhar / vier incompleto → trate como dinâmico, abaixo)
  └─ Não (webapp dinâmico) → o servidor já está rodando?
       ├─ Não → suba o servidor (ver "Gerenciar o servidor"), depois automatize
       └─ Sim → reconhecimento-então-ação:
             1. navegue e espere networkidle
             2. screenshot + inspecione o DOM
             3. descubra os seletores no estado renderizado
             4. execute as ações com os seletores descobertos
```

## O padrão: reconhecimento → ação

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)     # headless por padrão (use headed para debugar visualmente)
    page = browser.new_page()
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")         # espere o JS rodar (bom no reconhecimento inicial)

    # 1) RECONHECIMENTO — inspecione o DOM RENDERIZADO, não o código-fonte
    page.screenshot(path="/tmp/inspect.png", full_page=True)
    for botao in page.get_by_role("button").all():
        print(botao.text_content())

    # 2) AÇÃO — com seletores que você DESCOBRIU no passo 1
    page.get_by_role("button", name="Entrar").click()
    page.wait_for_load_state("networkidle")

    browser.close()
```

## ⚠️ A armadilha

**Não** inspecione o DOM antes de a página assentar num app dinâmico — você pega o esqueleto pré-JS e sai com seletores errados. Para o **reconhecimento inicial**, quando ainda não sabe os seletores, `page.wait_for_load_state("networkidle")` é a espera mais prática antes de inspecionar.

**Nota:** o Playwright oficialmente **desencoraja** `networkidle` — quando você já conhece um seletor-âncora, `wait_for_selector(...)` ou o auto-wait por role (`get_by_role(...)`) é mais robusto. Reserve `networkidle` para o reconhecimento inicial, quando ainda não descobriu os seletores.

## Descobrir seletores (o reconhecimento)

```python
page.get_by_role("button").all()     # botões
page.get_by_role("link").all()       # links
page.get_by_role("textbox").all()    # inputs
print(page.content())                # HTML já renderizado
page.screenshot(path="/tmp/page.png", full_page=True)
```

Prefira seletores robustos — `get_by_role(...)`, `get_by_text(...)`, `text=`, IDs — em vez de CSS frágil que depende do layout.

## HTML estático (sem servidor)

```python
page.goto("file:///caminho/absoluto/pagina.html")   # file:// para HTML local
```

## Capturar logs do console (debug de UI)

```python
page.on("console",   lambda msg: print(f"[{msg.type}] {msg.text}"))
page.on("pageerror", lambda err: print(f"[erro] {err}"))
page.goto("http://localhost:5173")
```

## Gerenciar o servidor

Se o servidor ainda não está de pé, suba-o em background, **espere a porta abrir**, rode a automação e finalize sempre no `finally`:

```python
import subprocess, socket, time

def espera_porta(porta, timeout=30):
    fim = time.time() + timeout
    while time.time() < fim:
        with socket.socket() as s:
            if s.connect_ex(("localhost", porta)) == 0:
                return
        time.sleep(0.3)
    raise TimeoutError(f"porta {porta} não abriu em {timeout}s")

servidor = subprocess.Popen("npm run dev", shell=True, cwd="frontend")
try:
    espera_porta(5173)
    # ... rode o script Playwright aqui ...
finally:
    servidor.terminate()
```

Para backend + frontend, suba os dois `Popen` e espere as **duas** portas antes de automatizar.

## Boas práticas

- `sync_playwright()` para scripts síncronos; `chromium.launch(headless=True)` por padrão (headed só para debugar visualmente).
- **Sempre** feche o browser no fim (ou deixe o `with` fechar).
- Seletores descritivos: `get_by_role`, `get_by_text`, `text=`, IDs — não CSS frágil.
- Espere de propósito: `wait_for_load_state("networkidle")`, `wait_for_selector(...)`. Evite `wait_for_timeout` fixo, a não ser como último recurso.
