---
name: pdf
description: Use sempre que o usuário quiser fazer qualquer coisa com arquivos PDF — ler ou extrair texto/tabelas, juntar/mesclar vários PDFs, dividir, rotacionar páginas, adicionar marca d'água, criar PDFs do zero, preencher formulários, criptografar/descriptografar, extrair imagens, ou rodar OCR em PDFs escaneados. Se o usuário mencionar um arquivo .pdf ou pedir para produzir um, use esta skill.
---

# pdf — operações com PDF (Python + linha de comando)

Cada tarefa tem uma ferramenta certa. Escolha por ela primeiro:

| Tarefa | Ferramenta |
|---|---|
| Extrair **texto** (com layout) | `pdfplumber` |
| Extrair **tabelas** | `pdfplumber` (→ `pandas`) |
| **Juntar / dividir / rotacionar / criptografar / marca d'água** | `pypdf` |
| **Criar** PDF do zero | `reportlab` |
| **OCR** (PDF escaneado, sem texto) | `pytesseract` + `pdf2image` |
| Extrair **imagens** | `pdfimages` (poppler) |
| **Preencher formulário** | `pypdf` (ver §Formulários) |
| Tarefa rápida no terminal | `qpdf` / `poppler-utils` |

**Setup:** `pip install pypdf pdfplumber reportlab pandas pytesseract pdf2image`. As ferramentas de OCR e de linha de comando pedem binários do sistema: `tesseract-ocr` (com `tesseract-ocr-por` para português), `poppler-utils` e `qpdf`.

---

## Ler e extrair

### Texto — `pdfplumber` (preserva o layout)
```python
import pdfplumber

with pdfplumber.open("documento.pdf") as pdf:
    texto = "\n".join(p.extract_text() or "" for p in pdf.pages)
```
Para texto simples e rápido (sem layout), `pypdf` serve: `"".join(p.extract_text() or "" for p in PdfReader("documento.pdf").pages)`.

### Tabelas — `pdfplumber` → `pandas` → Excel
```python
import pandas as pd, pdfplumber

dfs = []
with pdfplumber.open("documento.pdf") as pdf:
    for page in pdf.pages:
        for tabela in page.extract_tables():
            if tabela and len(tabela) > 1:            # ignora tabela vazia
                dfs.append(pd.DataFrame(tabela[1:], columns=tabela[0]))

if dfs:
    pd.concat(dfs, ignore_index=True).to_excel("tabelas.xlsx", index=False)
```

### Metadados
```python
from pypdf import PdfReader
meta = PdfReader("documento.pdf").metadata
print(meta.title, meta.author, meta.subject, meta.creator)
```

---

## Manipular — `pypdf`

> O `pypdf` moderno aceita um path direto em `writer.write(...)` e copia páginas em bloco com `writer.append(reader)`.

### Juntar
```python
from pypdf import PdfReader, PdfWriter

writer = PdfWriter()
for caminho in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    writer.append(PdfReader(caminho))
writer.write("juntado.pdf")
```

### Dividir (uma página por arquivo)
```python
reader = PdfReader("entrada.pdf")
for i, page in enumerate(reader.pages, start=1):
    writer = PdfWriter()
    writer.add_page(page)
    writer.write(f"pagina_{i}.pdf")
```

### Rotacionar
```python
reader = PdfReader("entrada.pdf")
writer = PdfWriter()
writer.append(reader)
writer.pages[0].rotate(90)        # 90° horário na 1ª página
writer.write("rotacionado.pdf")
```

### Criptografar / descriptografar
```python
# proteger com senha
writer = PdfWriter()
writer.append(PdfReader("entrada.pdf"))
writer.encrypt("senha-usuario", owner_password="senha-dono")
writer.write("protegido.pdf")

# remover a senha (você precisa conhecê-la)
reader = PdfReader("protegido.pdf")
if reader.is_encrypted:
    reader.decrypt("senha-usuario")
saida = PdfWriter(); saida.append(reader); saida.write("aberto.pdf")
```

### Marca d'água
```python
marca = PdfReader("marca.pdf").pages[0]
reader = PdfReader("documento.pdf")
writer = PdfWriter()
for page in reader.pages:
    page.merge_page(marca)         # sobrepõe a marca em cada página
    writer.add_page(page)
writer.write("com_marca.pdf")
```

---

## Criar — `reportlab`

### Canvas simples
```python
from reportlab.lib.pagesizes import A4      # A4 é o padrão no Brasil, não 'letter'
from reportlab.pdfgen import canvas

c = canvas.Canvas("ola.pdf", pagesize=A4)
larg, alt = A4
c.drawString(72, alt - 72, "Olá, mundo!")
c.line(72, alt - 90, 400, alt - 90)
c.save()
```

### Documento de várias páginas — Platypus
```python
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet

styles = getSampleStyleSheet()
story = [
    Paragraph("Título do relatório", styles["Title"]),
    Spacer(1, 12),
    Paragraph("Corpo do relatório. " * 20, styles["Normal"]),
    PageBreak(),
    Paragraph("Página 2", styles["Heading1"]),
]
SimpleDocTemplate("relatorio.pdf", pagesize=A4).build(story)
```

### ⚠️ Armadilha: subscrito / sobrescrito
Nunca use caracteres **Unicode** de subscrito/sobrescrito (`₀₁₂₃`, `⁰¹²³`) no reportlab — as fontes embutidas não têm esses glifos e eles viram **quadrados pretos**. Use as tags XML dentro de um `Paragraph`:
```python
Paragraph("H<sub>2</sub>O", styles["Normal"])          # subscrito
Paragraph("x<super>2</super> + y<super>2</super>", styles["Normal"])   # sobrescrito
```
Em texto desenhado no `canvas` (fora de `Paragraph`), ajuste tamanho e posição da fonte na mão.

---

## OCR — PDF escaneado (imagem, sem texto)
```python
# pip install pytesseract pdf2image  +  binários tesseract-ocr-por e poppler
import pytesseract
from pdf2image import convert_from_path

texto = ""
for i, img in enumerate(convert_from_path("escaneado.pdf"), start=1):
    texto += f"--- Página {i} ---\n"
    texto += pytesseract.image_to_string(img, lang="por")   # 'por' = português
```

## Extrair imagens
```bash
pdfimages -j entrada.pdf prefixo    # gera prefixo-000.jpg, prefixo-001.jpg, ...
```

## Formulários
```python
reader = PdfReader("formulario.pdf")
print(list(reader.get_fields()))                 # nomes dos campos

writer = PdfWriter()
writer.append(reader)
writer.update_page_form_field_values(
    writer.pages[0], {"nome": "Ana Souza", "email": "ana@exemplo.com"}
)
writer.write("formulario_preenchido.pdf")
```

---

## Linha de comando (sem Python)
```bash
pdftotext -layout entrada.pdf saida.txt          # extrai texto preservando layout
pdftotext -f 1 -l 5 entrada.pdf saida.txt        # só as páginas 1–5

qpdf --empty --pages a.pdf b.pdf -- juntado.pdf   # juntar
qpdf entrada.pdf --pages . 1-5 -- p1-5.pdf        # fatiar páginas 1–5
qpdf entrada.pdf saida.pdf --rotate=+90:1         # rotacionar a página 1
qpdf --password=SENHA --decrypt in.pdf out.pdf    # remover senha
```

---

## Verifique o resultado

Depois de gerar ou manipular, **reabra o arquivo e confirme** — não confie só no "salvou":
```python
r = PdfReader("saida.pdf")
print("páginas:", len(r.pages))
print("tem texto?", bool((r.pages[0].extract_text() or "").strip()))
```
Um PDF que grava sem erro mas não abre, ou que sai com zero página, é uma falha **silenciosa** — a checagem de 3 linhas pega isso na hora.
