---
description: "Formula perguntas de esclarecimento para pedidos de implementação ambíguos, usando o contexto do workspace."
name: perguntas
argument-hint: pedido ou tema que precisa de esclarecimento
agent: agent
---

# Perguntas de esclarecimento

Analise o pedido `${input:perguntas:descreva o pedido ou tema a esclarecer}` junto com o contexto relevante da conversa e do workspace.

Antes de perguntar:

- Identifique o que já está especificado e o que pode ser confirmado no código, na documentação ou nas instruções do projeto.
- Separe dúvidas que mudariam o escopo, o comportamento esperado, os contratos, as restrições ou os critérios de aceite de detalhes que podem ser decididos seguindo os padrões existentes.
- Não repita perguntas cuja resposta já esteja disponível no contexto.

Se houver ambiguidades que afetem a solução, faça no máximo cinco perguntas curtas, diretas e neutras, em uma lista numerada na resposta. Agrupe questões relacionadas e ofereça opções apenas quando as alternativas forem claras e úteis. Priorize decisões que bloqueiam uma implementação correta; não pergunte sobre detalhes de baixo impacto.

Se o pedido estiver claro o bastante para avançar, não invente perguntas: diga que não há bloqueios e resuma brevemente as premissas relevantes.

Responda em português. Não crie plano, não edite arquivos e não inicie a implementação nesta etapa.