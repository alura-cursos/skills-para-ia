---
name: product-prd
description: Cria um Product Requirements Document (PRD) abrangente que alinha os stakeholders sobre o que construir, por quê, e como o sucesso será medido. Use ao especificar features, epics ou iniciativas de produto para o handoff com a engenharia.
---

# product-prd — o quê e o porquê, não o como

Um PRD é o artefato de especificação que comunica **o que** construir e **por quê**. Ele faz a ponte entre entender o problema e a implementação da engenharia — com requisitos claros, critérios de sucesso e fronteiras de escopo.

A disciplina do PRD é uma **fronteira**: especifique o **resultado** e os **requisitos**, não a **implementação**. Três regras saem disso:

- **O quê e o porquê, não o como.** Um PRD que desenha o sistema tira da engenharia a flexibilidade de construir certo. Levante as considerações técnicas que a eng precisa saber — sem projetar a solução.
- **Todo requisito é testável.** Se ninguém consegue verificar se foi cumprido, não é um requisito — é um desejo.
- **Escopo explícito.** Dentro / fora / adiado, cravado. Escopo difuso convida scope creep.

## Quando usar

- Depois do alinhamento de problema e solução, antes de a engenharia começar.
- Ao especificar uma feature, epic ou iniciativa para handoff.
- Quando vários times precisam coordenar sobre uma entrega compartilhada.
- Quando stakeholders precisam aprovar o escopo antes do investimento.
- Como documentação de referência durante o desenvolvimento e o QA.

## Quando NÃO usar

- **O problema ainda não está enquadrado** → enquadre primeiro; um PRD **pressupõe** um problema acordado.
- **Você precisa de um pitch de uma página** para alinhar a abordagem → faça um brief de solução antes; o PRD vem depois desse alinhamento.
- **Você só precisa quebrar o trabalho em tickets** para um sprint → escreva user stories.
- **Você está registrando uma decisão técnica/arquitetural** → escreva uma ADR.

## O processo

1. **Resuma o problema.** Um recap curto do problema sendo resolvido (link ao enunciado, se houver). O leitor tem que entender o *porquê* antes de mergulhar no *o quê*.
2. **Defina metas e métricas de sucesso.** O que é sucesso, em métricas específicas e mensuráveis, com **baseline e alvo**. Elas se conectam direto ao problema.
3. **Esboce a solução.** Alto nível, focada na funcionalidade voltada ao usuário. Detalhe o bastante para os stakeholders avaliarem a abordagem — sem sobre-especificar a implementação.
4. **Detalhe os requisitos funcionais (user stories).** O que o sistema **deve** fazer, em user stories ou statements. **Cada requisito é testável** — dá para verificar se foi atendido.
5. **Defina as fronteiras de escopo.** Explícito: o que está **dentro**, **fora**, e **adiado** para iterações futuras.
6. **Trate as considerações técnicas.** Constraints, integrações, decisões que a engenharia precisa conhecer — **sem desenhar o sistema**.
7. **Identifique dependências e riscos.** Dependências externas, premissas e riscos que podem impactar a entrega — cada um com **mitigação** e **dono**.
8. **Proponha timeline e marcos.** Fases e checkpoints, para os stakeholders entenderem o plano de entrega — sem cravar datas prematuramente.

## Formato de saída

Um PRD completo preenche todas as seções: **Visão geral** · **Metas & Métricas de sucesso** · **User Stories** · **Escopo** (dentro/fora/futuro) · **Design da solução** (a ordem do documento não é a ordem de trabalho: você esboça a solução cedo, mas ela é posicionada aqui, depois do escopo) · **Considerações técnicas** · **Dependências & Riscos** · **Timeline & Marcos** · **Perguntas abertas** · **Apêndice** (quando houver material de apoio). Seções em `##`, tabelas para comparação estruturada.

## Checklist de qualidade

- [ ] O problema e o "por que agora" estão claramente articulados.
- [ ] As métricas de sucesso são específicas e mensuráveis (com baseline e alvo).
- [ ] As fronteiras de escopo são explícitas (dentro / fora / futuro).
- [ ] Os requisitos são testáveis e sem ambiguidade.
- [ ] As considerações técnicas aparecem sem sobre-especificar a implementação.
- [ ] Dependências e riscos estão documentados com donos.
- [ ] O documento se lê em menos de 15 minutos.
