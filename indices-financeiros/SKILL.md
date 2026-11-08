---
name: indices-financeiros
description: Calcula os principais índices e métricas financeiras a partir de demonstrações financeiras (DRE, balanço, fluxo de caixa) para análise de investimento — rentabilidade, liquidez, alavancagem, eficiência, valuation e métricas por ação. Use quando o usuário fornecer demonstrações financeiras, pedir para calcular índices (ROE, P/L, liquidez corrente…), ou avaliar a saúde financeira de uma empresa.
---

# indices-financeiros — o número precisa de contexto

Um índice financeiro, sozinho, **não diz nada**. ROE de 15%? Liquidez corrente 1,2? P/L 30? Bom ou ruim depende inteiramente do **setor** e da **tendência**. A disciplina: **valide o dado primeiro**, calcule o índice, e **sempre** interprete-o contra um benchmark (a norma do setor) e ao longo do tempo (a tendência) — sinalizando os anômalos. Uma tabela de índices crus, sem o "e daí?", é trivia, não análise.

## As categorias (com a fórmula)

- **Rentabilidade** — ROE (lucro líq. ÷ patrimônio) · ROA (lucro líq. ÷ ativo total) · margem bruta/operacional/líquida (÷ receita).
- **Liquidez** — corrente (ativo circ. ÷ passivo circ.) · seca (ativo circ. − estoque, ÷ passivo circ.) · caixa (caixa ÷ passivo circ.).
- **Alavancagem** — dívida/patrimônio (D/E) · cobertura de juros (EBIT ÷ despesa de juros) · cobertura do serviço da dívida.
- **Eficiência** — giro do ativo (receita ÷ ativo) · giro de estoque (CMV ÷ estoque) · giro de recebíveis.
- **Valuation** — P/L · P/VP · P/Receita · EV/EBITDA · PEG.
- **Por ação** — LPA · valor patrimonial por ação · dividendo por ação.

## Como usar

1. **Input** — as demonstrações (DRE, balanço, fluxo de caixa) em CSV, JSON, Excel ou texto.
2. **Valide a completude do dado ANTES de calcular.** Trate faltantes explicitamente — use a média do setor ou exclua, e **diga qual** você fez.
3. **Calcule → interprete → sinalize.** Cada índice vem com "vs. setor" e "vs. período anterior"; sinalize o incomum/preocupante.

## O cálculo (inline)

```python
def _div(a, b):
    """Divisão segura: None se faltar dado ou o denominador for 0."""
    return round(a / b, 3) if (a is not None and b not in (None, 0)) else None

def financial_ratios(f):
    """f: dict com as linhas das demonstrações (mesma moeda, mesmo período)."""
    g = f.get
    ca, inv = g("current_assets"), g("inventory")
    quick   = ca - (inv or 0) if ca is not None else None      # ativo circ. sem estoque
    lpa     = _div(g("net_income"), g("shares"))
    vpa     = _div(g("equity"),     g("shares"))
    return {
        "ROE":                _div(g("net_income"),       g("equity")),
        "ROA":                _div(g("net_income"),       g("total_assets")),
        "margem_bruta":       _div(g("gross_profit"),     g("revenue")),
        "margem_operacional": _div(g("operating_income"), g("revenue")),
        "margem_liquida":     _div(g("net_income"),       g("revenue")),
        "liquidez_corrente":  _div(ca,                    g("current_liabilities")),
        "liquidez_seca":      _div(quick,                 g("current_liabilities")),
        "divida_patrimonio":  _div(g("total_debt"),       g("equity")),
        "cobertura_juros":    _div(g("ebit"),             g("interest_expense")),
        "giro_ativo":         _div(g("revenue"),          g("total_assets")),
        "giro_estoque":       _div(g("cogs"),             inv),
        "LPA":                lpa,
        "valor_patrim_acao":  vpa,
        "P_L":                _div(g("price"),            lpa),
        "P_VP":               _div(g("price"),            vpa),
        "EV_EBITDA":          _div(g("enterprise_value"), g("ebitda")),
    }
```

O dict acima é um subconjunto representativo — os demais índices citados (liquidez de caixa, giro de recebíveis, PEG, dividendo por ação…) seguem o mesmo padrão `_div` com as linhas que faltarem (PEG precisa também da taxa de crescimento).

Um índice que sai `None` sinaliza dado faltando — trate isso na interpretação, não o esconda.

## Boas práticas

- Valide a completude **antes** de calcular; trate faltantes de forma explícita.
- Interprete **no contexto do setor** — o mesmo número é ótimo num setor e péssimo noutro.
- Traga **comparação entre períodos** para revelar a tendência (um número, dois pontos no tempo).
- **Sinalize** o índice incomum ou preocupante em vez de deixá-lo na tabela sem comentário.

## Limitações

- Exige dado acurado — lixo entra, lixo sai.
- Benchmarks de setor são guia geral, não regra.
- Alguns índices não se aplicam a todo setor (giro de estoque num banco, por exemplo).
- Desempenho histórico não garante o futuro.
