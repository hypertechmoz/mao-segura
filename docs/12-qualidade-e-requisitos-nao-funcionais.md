# Qualidade e requisitos nao funcionais

Este documento define os criterios que impedem o projeto de parecer improvisado ou "vibe coded".

## Qualidade de codigo

O codigo deve:

- parecer codigo de producao;
- ter nomes claros;
- evitar funcoes gigantes;
- evitar componentes gigantes;
- evitar duplicacao;
- separar UI de regra de negocio;
- usar tipagem forte sempre que possivel;
- tratar erros;
- evitar comentarios desnecessarios;
- ter comentarios apenas quando ajudam a entender uma decisao.

## Sinais de alerta

Evitar:

- nomes como `data2`, `finalNewData`, `tempUserInfo`;
- arquivos enormes com varias responsabilidades;
- logica de permissao apenas no frontend;
- varias funcoes fazendo quase a mesma coisa;
- chamadas repetidas ao banco em loops;
- estados demais para fluxos simples;
- telas que fazem chamadas, transformacoes, validacoes e UI ao mesmo tempo.

## Performance

Requisitos recomendados:

- Feed deve carregar rapidamente em conexoes comuns.
- Listas devem usar paginacao ou infinite scroll.
- Evitar buscar todos os registros de uma tabela.
- Evitar recalcular contadores a cada acesso.
- Evitar consultas N+1.
- Separar perfil resumido de perfil completo.
- Usar cache local com cuidado, quando fizer sentido.

## Escalabilidade

O sistema deve ser pensado para crescer.

Recomendacoes:

- indexes para colunas consultadas com frequencia;
- contadores persistidos para likes de posts, comentarios, recomendacoes e mensagens nao lidas;
- consultas filtradas por usuario, perfil, data e status;
- evitar carregar dados completos quando so resumo e necessario;
- planejar moderacao e auditoria para funcoes sensiveis.

## Experiencia do utilizador

A interface deve ser:

- clara;
- profissional;
- simples de navegar;
- visualmente consistente;
- sem excesso de etapas;
- sem textos confusos;
- adaptada para utilizadores com diferentes niveis de escolaridade.

## Requisitos de produto

- Acoes comuns devem exigir poucos passos.
- Contactar deve abrir chat.
- Candidatar-se deve ser diferente de contactar.
- Conexoes devem substituir seguidores/seguindo.
- Recomendacoes devem ser simples, por estrelas e sem texto obrigatorio.
- Gostos/likes de perfil nao fazem parte do escopo atual.
- Likes em posts continuam a fazer parte do Feed.
- Notificacoes devem marcar leitura corretamente.

## Criterios de aceite para agentes

Antes de concluir uma tarefa, o agente deve responder:

- O que foi alterado?
- Que problema foi resolvido?
- Que risco foi reduzido?
- Que verificacoes foram feitas?
- Que parte ainda precisa de revisao futura?

Se nao puder testar, deve explicar por que.
