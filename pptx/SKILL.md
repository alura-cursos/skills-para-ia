---
name: pptx
description: Use sempre que um arquivo .pptx estiver envolvido — como entrada, saída, ou os dois. Inclui: criar decks, pitch decks ou apresentações; ler, parsear ou extrair texto de qualquer .pptx (mesmo que o conteúdo vá para outro lugar, como um e-mail ou resumo); editar/modificar apresentações existentes; combinar ou dividir arquivos de slides; trabalhar com templates, layouts, notas do apresentador ou comentários. Dispare sempre que o usuário mencionar "deck", "slides", "apresentação" ou citar um arquivo .pptx, independentemente do que ele fará com o conteúdo depois.
---

# pptx — criar, ler e editar apresentações

**Seu primeiro render quase nunca está certo.** Slide é fácil de errar no detalhe — texto vazando da caixa, elementos sobrepostos, contraste fraco — e o erro só aparece quando você *olha* o resultado renderizado, não o código. Por isso a **QA visual com subagente de olhos frescos é obrigatória** (última seção), não opcional. Trate como caça ao bug: assuma que tem problema.

| Tarefa | Ferramenta |
|---|---|
| Ler / extrair texto | `python -m markitdown deck.pptx` |
| Criar do zero | `python-pptx` (Python) ou `pptxgenjs` (Node) |
| Editar / partir de template | `python-pptx` (ou desempacotar o XML) |
| Renderizar para imagem (QA) | LibreOffice (`soffice`) → `pdftoppm` |

---

## Ler

```bash
python -m markitdown apresentacao.pptx          # extrai o texto

# visão visual (também é o passo de QA):
soffice --headless --convert-to pdf apresentacao.pptx
pdftoppm -jpeg -r 150 apresentacao.pdf slide     # gera slide-01.jpg, slide-02.jpg, ...

# XML cru — um .pptx é só um zip:
unzip apresentacao.pptx -d desempacotado/
```

## Criar / editar — `python-pptx`

```python
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor

prs = Presentation()                       # ou Presentation("template.pptx") para editar
slide = prs.slides.add_slide(prs.slide_layouts[6])   # layout 6 = em branco

# título
cx = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(9), Inches(1))
tf = cx.text_frame; tf.margin_left = 0      # evita o padding que desalinha formas com o texto
p = tf.paragraphs[0]; p.text = "Título do slide"
p.font.size = Pt(40); p.font.bold = True
p.font.color.rgb = RGBColor(0x1B, 0x43, 0x32)

# um elemento visual em TODO slide (imagem, gráfico, ícone, forma)
slide.shapes.add_picture("grafico.png", Inches(5.2), Inches(1.6), width=Inches(4))

# notas do apresentador
slide.notes_slide.notes_text_frame.text = "Aqui eu falo sobre X."

prs.save("apresentacao.pptx")
```

Para decks muito visuais em Node, `pptxgenjs` também é ótimo. Para editar via XML, desempacote o zip, altere os `.xml` em `ppt/slides/` e reempacote.

---

## Design — não faça slides sem graça

Bullets pretos em fundo branco não impressionam ninguém. Antes de começar:

- **Paleta ousada e informada pelo tema.** Se dá pra trocar suas cores em qualquer outra apresentação e ainda "funcionar", elas são genéricas demais. Nada de azul por padrão.
- **Dominância, não igualdade.** Uma cor domina (60-70% do peso visual), 1-2 de apoio, e um acento afiado. Nunca todas com o mesmo peso.
- **Sanduíche claro/escuro.** Fundo escuro no título e na conclusão, claro no miolo — ou escuro do início ao fim, para um ar premium.
- **Um motivo visual só, repetido.** Escolha UM elemento distintivo (molduras arredondadas, ícones em círculos coloridos, uma borda grossa de um lado só) e leve por todos os slides.

**Paletas (inspiração — `primária / secundária / acento`):**

| Tema | Primária | Secundária | Acento |
|---|---|---|---|
| Grafite executivo | `23272E` | `E8EAED` | `E4B343` |
| Verde cerrado | `1B4332` | `95D5B2` | `F4F1DE` |
| Terracota quente | `9C4A3C` | `E9E4D8` | `4A6C6F` |
| Azul profundo | `0B2545` | `8DA9C4` | `EEF4ED` |
| Vinho e creme | `6A2E3A` | `C08497` | `F1E4D4` |
| Coral vibrante | `E5564E` | `F2C14E` | `2E3A59` |

**Tipografia** — fuja do Arial padrão; pareie um display com personalidade e um corpo limpo:

| Título | Corpo |
|---|---|
| Georgia | Calibri |
| Trebuchet MS | Calibri |
| Cambria | Calibri |
| Palatino | Garamond |

Tamanhos: título do slide **36-44pt bold** · cabeçalho de seção 20-24pt bold · corpo 14-16pt · legenda 10-12pt suave.

**Layouts** (varie entre eles): duas colunas (texto à esquerda, visual à direita) · linhas de ícone+texto (ícone em círculo colorido, cabeçalho bold, descrição) · grade 2×2 ou 2×3 · imagem sangrando meia página com conteúdo sobreposto. **Dados:** callout de número gigante (60-72pt com rótulo pequeno) · colunas de comparação (antes/depois) · timeline numerada. **Margens** ≥ 0.5"; espaço entre blocos 0.3-0.5", consistente; deixe respiro.

**Evite (erros comuns):**

- Repetir o mesmo layout slide após slide — varie colunas, cards, callouts.
- Centralizar corpo de texto — alinhe parágrafos e listas à esquerda; centralize só títulos.
- Pouco contraste de tamanho — título 36pt+ tem que saltar do corpo 14-16pt.
- Estilizar um slide e deixar o resto pelado — comprometa-se em todos, ou mantenha simples em todos.
- Slide só de texto — todo slide precisa de imagem, ícone, gráfico ou forma.
- Texto ou ícone de baixo contraste — nada de texto claro em fundo claro, nem ícone escuro em fundo escuro sem um círculo de contraste.
- **NUNCA uma linha de destaque sob o título** — é a marca registrada de slide gerado por IA. Use whitespace ou cor de fundo no lugar.

---

## QA (obrigatória)

**Assuma que há problemas — seu trabalho é achá-los.** Se você não achou nenhum na primeira inspeção, não olhou com atenção suficiente.

### QA de conteúdo
```bash
python -m markitdown output.pptx                                    # confira ordem, faltas, typos
python -m markitdown output.pptx | grep -iE "xxxx|lorem|ipsum|placeholder|título aqui"
```
Se o grep achar placeholder sobrando, conserte antes de declarar pronto.

### QA visual — **use subagentes**
Você olhou o código e vai enxergar o que espera, não o que está lá. Um subagente tem olhos frescos — use **mesmo para 2-3 slides**. Renderize para imagem (seção *Ler*) e passe o checklist:

> Inspecione estes slides visualmente. **Assuma que há problemas — encontre-os.** Procure: elementos sobrepostos (texto atravessando formas, linhas cortando palavras); texto vazando ou cortado na borda da caixa; linha decorativa posicionada para título de 1 linha, mas o título quebrou em 2; rodapé/fonte colidindo com o conteúdo acima; elementos colados (< 0.3" de gap); gaps desiguais (vazio grande de um lado, apertado do outro); margem insuficiente da borda (< 0.5"); colunas desalinhadas; texto de baixo contraste (cinza claro em fundo creme); ícone de baixo contraste; caixa estreita demais causando quebra excessiva; placeholder sobrando. Liste **todos** os problemas, mesmo os menores, slide a slide.

### Loop de verificação
1. Gera → converte para imagem → inspeciona.
2. **Lista os problemas** (se não achou nenhum, olhe de novo, mais crítico).
3. Corrige.
4. **Re-verifica os slides afetados** — um conserto costuma criar outro.
5. Repete até uma passada inteira não achar nada novo.

**Não declare pronto sem ao menos um ciclo completo de corrigir-e-verificar.**

---

## Dependências

- `pip install "markitdown[pptx]" python-pptx Pillow` — leitura, criação/edição, imagens
- **LibreOffice** (`soffice`) — converter `.pptx → .pdf` para o QA visual
- **Poppler** (`pdftoppm`) — converter `.pdf → imagens`
- Opcional: `npm install -g pptxgenjs` — criar decks pelo Node
