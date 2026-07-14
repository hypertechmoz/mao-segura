# Regras de negocio

Este documento define as regras principais do Konekta. Estas regras devem orientar qualquer auditoria, refatoracao ou nova implementacao.

## Utilizadores e perfis

- Um utilizador deve estar autenticado para executar acoes privadas.
- Um utilizador possui um perfil principal ativo.
- Os tipos principais de perfil sao `cliente` e `profissional`.
- Cliente e profissional podem ver perfis, mensagens, notificacoes e rede.
- Algumas acoes dependem do tipo de perfil.

## Cliente

O cliente pode:

- visualizar posts de profissionais no Feed;
- gostar de posts;
- comentar posts;
- contactar profissionais;
- publicar vagas;
- encerrar vagas;
- recomendar profissionais;
- gerir conversas;
- receber notificacoes.

## Profissional

O profissional pode:

- publicar disponibilidade ou servicos;
- visualizar vagas no Feed;
- gostar de posts;
- comentar posts;
- candidatar-se a vagas;
- gerir conversas;
- receber notificacoes.

## Contacto e chat

- Clicar em `Contactar` deve abrir o chat com o utilizador selecionado.
- A conversa so deve ser criada definitivamente quando a primeira mensagem for enviada.
- Nao deve ser criado pedido intermediario, candidatura ou processo adicional para um simples contacto.
- O objetivo e reduzir registros vazios e fluxo desnecessario.

## Vagas e candidaturas

- Clientes podem criar vagas.
- Profissionais podem candidatar-se a vagas.
- Cliente ve vagas `ativas` e `encerradas`.
- Profissional ve candidaturas `pendentes`, `aceites`, `rejeitadas` e, quando aplicavel, `concluidas`.
- Uma candidatura deve notificar o cliente.

## Conexoes

- A plataforma deve usar o conceito de `conexoes`, nao `seguidores` e `seguindo`.
- A relacao de conexao indica que dois utilizadores aceitaram uma ligacao profissional.
- Ao visualizar um perfil, deve aparecer se os utilizadores estao conectados ou nao.
- Se nao estiverem conectados, deve existir opcao para conectar.
- Deve existir opcao de mensagem no perfil.

## Recomendacoes

- Clientes podem recomendar profissionais.
- Recomendacoes devem ser simples e rapidas, sem texto obrigatorio.
- A recomendacao deve usar estrelas, por exemplo de 1 a 5.
- A recomendacao nao deve ser chamada de avaliacao na interface principal.
- No perfil, recomendacoes devem aparecer de forma resumida, principalmente como contagem.
- Se a media de estrelas for exibida, deve ser compacta e secundaria.
- O sistema deve impedir duplicacao de recomendacao do mesmo cliente para o mesmo profissional.
- A plataforma deve avaliar se recomendacoes podem ser removidas ou moderadas. Por padrao, recomenda-se permitir remocao pelo autor e moderacao por admin.

## Gostos de perfil

- Gostos/likes de perfil nao fazem parte do escopo atual.
- Clientes nao precisam gostar do perfil de um profissional.
- Profissionais nao precisam gostar do perfil de um cliente.
- A reputacao do perfil deve ser baseada em conexoes e recomendacoes.
- Esta regra nao remove likes em posts do Feed.

## Notificacoes

- Ao clicar numa notificacao, ela deve ser marcada como lida.
- Deve existir acao para `marcar tudo como lido`.
- Pode existir acao para `limpar todas`, mas ela deve ser usada com cuidado para nao apagar historico necessario.
- Notificacoes devem apontar para o destino correto: post, comentario, vaga, candidatura, conversa, conexao ou perfil.

## Feed

- O Feed e o centro do produto.
- Cliente ve disponibilidade e posts de profissionais.
- Profissional ve vagas e oportunidades publicadas por clientes.
- Feed deve usar paginacao ou infinite scroll.
- Feed nao deve carregar todos os registros de uma vez.
