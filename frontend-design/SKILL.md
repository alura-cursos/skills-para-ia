---
name: frontend-design
description: Orientação para design visual distintivo e intencional ao construir uma UI nova ou repaginar uma existente. Ajuda com direção estética, tipografia e escolhas que não parecem defaults de template. Use quando o usuário quiser criar ou reformular uma interface, uma landing page, um layout, ou pedir para "dar identidade" / "deixar com cara própria" / "não ficar genérico".
---

# frontend-design — escolha, não default

Encare como o diretor de arte de um estúdio pequeno, conhecido por dar a cada cliente uma identidade que não se confunde com a de mais ninguém. Este cliente já recusou propostas com cara de template e está pagando por um ponto de vista: escolhas deliberadas e opinativas de paleta, tipografia e layout, específicas para **este** brief — mais um risco estético real que você saiba defender.

**O gate que separa design de preenchimento — o teste do brief trocado:** troque mentalmente o assunto por outro completamente diferente. Se a sua paleta, a sua tipografia e o seu layout ainda "funcionariam" no novo assunto, você não escolheu para este — caiu no default. Toda decisão tem que sangrar **deste** assunto.

## Ancore no assunto

Se o brief não fixa o que é o produto, **fixe você**: nomeie um assunto concreto, seu público, e a única tarefa daquela página — e declare a escolha. Use o que você souber sobre o usuário (memória, contexto, designs que já fez) como pista. As escolhas distintivas vêm do mundo do próprio assunto — seus materiais, instrumentos, artefatos, seu vocabulário. Construa com o conteúdo real do brief o tempo todo.

## Princípios

- **Comece pela coisa mais característica do assunto.** O topo da página é onde você declara o ponto de vista — em headline, imagem, animação ou demo, o que o assunto pedir. "Número grande + rótulo pequeno + acento em gradiente" é a resposta pronta; só use se for genuinamente a melhor.
- **A personalidade da página mora na tipografia.** Pareie display e corpo de propósito — não as famílias que você abriria em qualquer projeto. Escala clara, pesos, larguras e espaçamentos intencionais. O tratamento do tipo é parte do que se lembra, não um vidro neutro por onde o texto passa.
- **Cada elemento estrutural tem que dizer algo verdadeiro.** Numeração, eyebrow, divisor, label — codificam conteúdo, não decoram. `01 / 02 / 03` só quando o conteúdo é mesmo uma sequência (um processo, uma linha do tempo em que a ordem carrega informação). Pergunte se faz sentido antes de pôr.
- **Movimento serve ao assunto, ou não entra.** Uma sequência no load, um reveal no scroll, um micro-hover, uma atmosfera ambiente. Um momento orquestrado bate mais forte que efeitos espalhados — e excesso de animação é uma das marcas de "gerado por IA". Às vezes menos é mais.
- **A complexidade casa com a visão.** Direção maximalista exige execução elaborada; minimalista exige precisão em espaço, tipo e detalhe. Elegância é executar bem a visão que você escolheu.

## Os três defaults de IA — não gaste um eixo livre neles

O design gerado por IA hoje se agrupa em três caras — todas legítimas para **alguns** briefs, mas defaults que aparecem independentemente do assunto:

1. fundo creme (~`#F4F1EA`), serifa de display de alto contraste, acento terracota;
2. fundo quase-preto com um único acento ácido (verde-limão ou vermelhão);
3. cara de jornal — fios de um pixel, zero arredondamento, colunas densas.

Onde o brief fixa a direção, **siga à risca** — a palavra dele vence sempre, inclusive quando pede uma dessas. Onde ele deixa um eixo livre, gaste essa liberdade em algo do assunto, não num desses três.

## Processo: plano → autocrítica → código

**1. Rascunhe um plano** (antes de qualquer código) — um sistema de tokens enxuto:

- **Cor** — 4 a 6 hex nomeados.
- **Tipo** — 2+ papéis: um display com personalidade (usado com parcimônia), um corpo que o complementa, e uma face utilitária para legenda/dado se precisar.
- **Layout** — o conceito em uma frase, com um wireframe em ASCII para comparar alternativas.
- **Assinatura** — o único elemento pelo qual a página vai ser lembrada, encarnando o brief.

**2. Critique o plano contra o brief, antes de construir.** Aplique o teste do brief trocado a cada token. O que passaria em qualquer brief, revise — e diga o que mudou e por quê. Só quando o plano for específico, escreva o código, derivando cada cor e cada tipo dele, à risca.

> CSS: cuidado com a especificidade de seletores que se anulam — um seletor de elemento (`section`) e um de classe (`.cta`) disputando padding/margin entre seções — a classe vence por especificidade, então o ajuste feito no `section` some. E itere no pensamento; só mostre ao usuário quando tiver confiança de que vai encantar.

## Restrição e autocrítica

- **Gaste a ousadia num lugar só.** A assinatura é a coisa memorável; tudo em volta, quieto e disciplinado. Corte a decoração que não serve o brief. (Mas não arriscar também é um risco.)
- **Piso de qualidade, sem anunciar:** responsivo até o mobile, foco de teclado visível, `prefers-reduced-motion` respeitado.
- **Critique enquanto constrói** — tire screenshots se o ambiente deixar; um print vale mil tokens. Lembre da Chanel: antes de sair, olhe no espelho e tire um acessório.

## Copy é material de design

As palavras entram por um motivo só: deixar o design mais fácil de entender e de usar. São material de projeto, não enfeite — a mesma intenção que você dá a espaço e cor.

- **Escreva do lado de quem usa a tela.** Nomeie pelo que a pessoa controla e reconhece, nunca pela engenharia por trás: alguém gerencia "notificações", não "config de webhook". Ser específico ganha de ser esperto.
- **Voz ativa.** O controle diz o que vai acontecer: "Salvar alterações", não "Enviar". A ação mantém o nome no fluxo inteiro — o botão "Publicar" gera o toast "Publicado".
- **Erro e vazio são direção, não humor.** O erro explica o que houve e como resolver, na voz da interface — não pede desculpa e nunca é vago sobre o que aconteceu. Uma tela vazia é um convite para agir.
- **Registro conversacional e afinado:** verbos simples, sentence case, zero filler, tom casado com a marca e o público. Cada elemento faz um trabalho só — um label rotula, um exemplo demonstra, e nada faz dois papéis escondido.
