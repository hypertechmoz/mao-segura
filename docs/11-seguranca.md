# Seguranca

Seguranca deve ser considerada em todos os modulos do Konekta.

Nao existe seguranca perfeita, mas o sistema deve dificultar ataques comuns, proteger dados dos utilizadores e impedir acessos indevidos.

## Principios

- Nunca confiar no frontend.
- Validar autenticacao em toda acao privada.
- Validar autorizacao em toda acao sensivel.
- Validar ownership antes de ler, editar ou apagar dados.
- Aplicar o menor privilegio possivel.
- Evitar expor dados sensiveis.
- Tratar uploads como risco.

## Autenticacao

Usar autenticacao segura, preferencialmente Supabase Auth quando o projeto ja depende de Supabase.

Requisitos:

- sessoes seguras;
- refresh token protegido;
- logout correto;
- bloqueio de rotas privadas sem sessao.

## Autorizacao

Cada acao deve responder:

```text
Quem esta a pedir?
Tem permissao?
E dono deste recurso?
Esta acao e permitida para o tipo de perfil?
```

## Supabase RLS

Se o projeto usa Supabase, ativar e revisar RLS nas tabelas sensiveis.

Prioridades:

- profiles;
- posts;
- comments;
- likes;
- jobs;
- applications;
- conversations;
- messages;
- notifications;
- admin tables.

## Dados sensiveis

Evitar expor:

- tokens;
- emails sem necessidade;
- telefone sem regra clara;
- dados privados de perfil;
- mensagens privadas;
- informacao administrativa.

## Uploads

Validar:

- tipo de ficheiro;
- tamanho;
- bucket correto;
- permissao de leitura;
- permissao de escrita;
- ownership do arquivo.

## Rate limit e abuso

Aplicar protecoes para:

- login repetido;
- envio massivo de mensagens;
- spam de comentarios;
- spam de candidaturas;
- criacao repetida de posts;
- tentativas de acesso admin.

## Erros e logs

- Nao mostrar detalhes internos ao utilizador.
- Nao logar tokens.
- Nao logar senhas.
- Registrar erros importantes de forma estruturada.

## Checklist de auditoria

- RLS esta ativa nas tabelas sensiveis?
- Policies impedem acesso cruzado a mensagens?
- Utilizador comum nao acessa area admin?
- Notificacoes so aparecem para o destinatario?
- Candidaturas so aparecem para envolvidos?
- Uploads nao sao publicos indevidamente?
- O frontend nao e a unica barreira de seguranca?
