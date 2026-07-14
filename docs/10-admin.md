# Modulo Admin

O modulo administrativo deve ser tratado como area sensivel.

## Objetivo

Permitir moderacao, suporte e gestao da plataforma sem expor dados ou permitir acesso indevido.

## Funcionalidades possiveis

- visualizar utilizadores;
- gerir perfis denunciados;
- moderar posts;
- moderar comentarios;
- moderar recomendacoes;
- gerir vagas denunciadas;
- visualizar logs de auditoria;
- bloquear utilizadores;
- desbloquear utilizadores.

## Seguranca obrigatoria

- Apenas administradores podem acessar rotas admin.
- Permissao deve ser validada no backend, policies ou regras de acesso.
- Nunca confiar apenas em esconder botoes no frontend.
- Acoes criticas devem gerar log de auditoria.

## Logs de auditoria

Acoes criticas devem registrar:

- admin_id;
- acao;
- alvo;
- motivo, quando aplicavel;
- data;
- metadados relevantes.

## Criterios de aceite

- Utilizador comum nao consegue acessar dados admin.
- Chamadas admin sao bloqueadas sem permissao.
- Acoes criticas ficam registradas.
- Dados sensiveis nao aparecem em logs publicos ou mensagens de erro.
