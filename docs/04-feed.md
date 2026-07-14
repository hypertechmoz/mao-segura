# Modulo Feed

O Feed e o centro da experiencia do Konekta. E onde clientes descobrem profissionais e profissionais descobrem oportunidades.

## Objetivo

Permitir descoberta rapida, bonita e util de posts, disponibilidades, servicos e vagas.

## Feed do cliente

O cliente deve ver principalmente:

- posts de disponibilidade feitos por profissionais;
- servicos oferecidos por profissionais;
- atualizacoes profissionais importantes.

### Acoes do cliente no Feed

- Gostar do post.
- Comentar.
- Contactar.

### Regra do botao Contactar

Ao clicar em `Contactar`, o app deve abrir a tela de chat com o profissional.

A conversa so deve ser criada quando a primeira mensagem for enviada.

Nao deve criar:

- candidatura;
- pedido intermediario;
- processo de aprovacao;
- registro vazio de conversa.

## Feed do profissional

O profissional deve ver principalmente:

- vagas criadas por clientes;
- pedidos de servico;
- oportunidades relevantes.

### Acoes do profissional no Feed

- Gostar do post.
- Comentar.
- Candidatar-se.

## Performance

O Feed deve:

- usar paginacao ou infinite scroll;
- carregar dados em lotes;
- evitar buscar perfil completo para cada item;
- usar perfil resumido para cards;
- evitar consultas N+1;
- preservar contadores como `likes_count` e `comments_count` quando fizer sentido.

## UX

O Feed deve ser:

- leve;
- responsivo;
- visualmente limpo;
- facil de ler;
- focado em acao;
- sem excesso de botoes.

## Criterios de aceite

- Cliente consegue abrir Feed e contactar profissional em poucos passos.
- Profissional consegue abrir Feed e candidatar-se a uma vaga.
- Listas grandes nao travam a tela.
- Posts mostram informacao suficiente sem poluir o card.
- Acoes principais estao claras.
- Likes de posts funcionam sem duplicacao.
- O Feed nao recalcula dados pesados a cada renderizacao.
