# Modulo Notificacoes

Notificacoes devem informar o utilizador sobre eventos relevantes e levar diretamente ao contexto correto.

## Objetivo

Garantir que o utilizador saiba quando alguem interagiu com ele, sem ruido excessivo.

## Tipos de notificacao

Tipos recomendados:

- nova mensagem;
- novo comentario;
- resposta ao comentario;
- gosto em post;
- nova candidatura;
- candidatura aceite;
- candidatura rejeitada;
- pedido de conexao;
- conexao aceite;
- nova recomendacao.

## Regra de leitura

Ao clicar numa notificacao:

1. marcar como lida;
2. navegar para o destino correto.

Esta regra deve valer para todos os tipos.

## Acoes em massa

Adicionar:

- marcar tudo como lido.

Opcional:

- limpar todas.

Observacao:

`Limpar todas` deve ser avaliado com cuidado. Em muitos sistemas, e melhor arquivar visualmente do que apagar fisicamente, para preservar auditoria e historico.

## Estrutura minima

Cada notificacao deve ter:

- id;
- recipient_id;
- actor_id, quando aplicavel;
- type;
- title ou mensagem curta;
- target_type;
- target_id;
- read_at;
- created_at.

## Performance

- Buscar notificacoes por pagina.
- Indexar `recipient_id`, `read_at` e `created_at`.
- Evitar carregar dados completos do alvo em todas as notificacoes.

## Criterios de aceite

- Toda notificacao clicada fica como lida.
- O contador de nao lidas atualiza corretamente.
- `Marcar tudo como lido` funciona.
- Cada notificacao abre o destino certo.
- Notificacoes antigas nao travam a tela.
