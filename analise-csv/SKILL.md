---
name: analise-csv
description: Analisa arquivos CSV, gera estatísticas de resumo e plota visualizações rápidas com Python e pandas. Use sempre que o usuário subir/referenciar um .csv, ou pedir para resumir, analisar ou visualizar dados tabulares, entender a estrutura e a qualidade dos dados, ou extrair insights de um CSV.
---

# analise-csv — inspecione, entregue tudo, não pergunte

Quando alguém te passa um CSV para resumir, a intenção **já está clara**: a pessoa quer a análise. Perguntar "o que você quer fazer com esses dados?" ou listar opções é enrolação. A disciplina tem dois lados:

- **Inspecione antes de decidir.** Olhe as colunas e os tipos primeiro, e escolha as análises que fazem sentido para **este** dataset — nunca um template cego que roda gráfico que não se aplica.
- **Entregue tudo de uma vez.** Visão geral, estatísticas, dados faltantes, os gráficos que se aplicam e os insights — na primeira resposta. Sem perguntas, sem opções, sem esperar direção.

Setup: `pip install pandas matplotlib seaborn`.

## O processo (automático)

1. **Carregue e inspecione** o CSV num DataFrame.
2. **Identifique a estrutura** — colunas de data, numéricas, categóricas; % de faltantes.
3. **Escolha as análises pelo que existe no dado:**
   - Vendas/e-commerce (data de pedido, receita, produto) → tendência temporal, receita, performance de produto.
   - Cliente (demografia, segmento, região) → distribuição, segmentação, padrão geográfico.
   - Financeiro (transação, valor, data) → tendência, resumo estatístico, correlação.
   - Operacional (timestamp, métrica, status) → série temporal, métricas, distribuição.
   - Survey (resposta categórica, nota) → frequência, cross-tab, distribuição.
   - Genérico → adapta pelos tipos de coluna encontrados.
4. **Só gere o gráfico que faz sentido:** série temporal **só** com coluna de data; heatmap de correlação **só** com 2+ colunas numéricas; distribuição de categoria **só** com coluna categórica; histograma para numéricas quando relevante.
5. **Entregue** overview (linhas × colunas × tipos) · estatísticas-chave · análise de faltantes · os gráficos aplicáveis · insights acionáveis baseados nos padrões **deste** dataset.

## O código (adaptativo)

```python
import pandas as pd
import matplotlib
matplotlib.use("Agg")            # salva sem precisar de display
import matplotlib.pyplot as plt
import seaborn as sns

def summarize_csv(path, outdir="/tmp"):
    df = pd.read_csv(path)

    # overview
    print(f"{df.shape[0]:,} linhas × {df.shape[1]} colunas")
    print(df.dtypes.value_counts().to_string())

    # detecta datas (pelo nome, depois tenta converter)
    for c in df.columns:
        if (pd.api.types.is_object_dtype(df[c]) or pd.api.types.is_string_dtype(df[c])) and any(k in c.lower() for k in ("date", "data", "time")):
            df[c] = pd.to_datetime(df[c], errors="coerce")
    date_cols = df.select_dtypes(include="datetime").columns.tolist()
    num_cols  = df.select_dtypes(include="number").columns.tolist()
    cat_cols  = [c for c in df.select_dtypes(include=["object", "string"]).columns if df[c].nunique() <= 30]

    # estatísticas + faltantes
    if num_cols:
        print(df[num_cols].describe().T.to_string())
    faltantes = df.isna().mean().mul(100).round(1)
    faltantes = faltantes[faltantes > 0]
    if len(faltantes):
        print("Faltantes (%):\n" + faltantes.to_string())

    # gráficos — só os que se aplicam
    figs = []
    def salva(fig, nome):
        p = f"{outdir}/{nome}.png"; fig.savefig(p, bbox_inches="tight"); plt.close(fig); figs.append(p)

    for c in num_cols[:6]:                       # histogramas numéricos
        fig, ax = plt.subplots(); df[c].hist(ax=ax, bins=30); ax.set_title(f"Distribuição — {c}")
        salva(fig, f"hist_{c}")
    if len(num_cols) >= 2:                        # correlação
        fig, ax = plt.subplots()
        sns.heatmap(df[num_cols].corr(numeric_only=True), annot=True, fmt=".2f", cmap="coolwarm", ax=ax)
        ax.set_title("Correlação"); salva(fig, "correlacao")
    if date_cols and num_cols:                    # série temporal
        d = date_cols[0]
        serie = df.dropna(subset=[d]).set_index(d)[num_cols[0]].resample("D").sum()
        fig, ax = plt.subplots(); serie.plot(ax=ax); ax.set_title(f"{num_cols[0]} ao longo do tempo")
        salva(fig, "serie_temporal")
    for c in cat_cols[:3]:                         # top categorias
        fig, ax = plt.subplots(); df[c].value_counts().head(10).plot.barh(ax=ax)
        ax.set_title(f"Top — {c}"); salva(fig, f"cat_{c}")

    print(f"\n{len(figs)} gráfico(s) salvo(s) em {outdir}/")
    return figs
```

## Comportamento

✅ **Faça:** rode a análise já · gere todos os gráficos relevantes · dê os insights sem ser pedido · seja completo na primeira resposta · aja sem pedir permissão.

❌ **Nunca:** "o que você quer fazer com esses dados?" · listar opções para o usuário escolher · esperar direção antes de analisar · entregar análise parcial que exige follow-up · descrever o que você *poderia* fazer em vez de fazer.

## Exemplo de saída

**Visão geral** — 5.000 linhas × 8 colunas (3 numéricas, 1 de data).
**Estatísticas** — ticket médio R$ 58,20 · desvio R$ 12,40 · faltantes: 2% numa coluna (100 de 5.000 células).
**Insights** — vendas em tendência de alta; pico no Q4. *(anexo: gráfico de tendência)*
