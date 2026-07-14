# Arquitetura modular

O Konekta deve ser organizado por modulos funcionais. Cada modulo deve ter responsabilidades claras e evitar misturar regra de negocio, UI, chamadas de dados e validacoes no mesmo lugar.

## Modulos principais

1. Autenticacao
2. Perfil
3. Feed
4. Chat e mensagens
5. Vagas e candidaturas
6. Conexoes
7. Recomendacoes
8. Notificacoes
9. Admin
10. Seguranca
11. Analytics e metricas

## Estrutura recomendada no frontend

```text
app/            rotas e telas principais
components/     componentes reutilizaveis
hooks/          hooks de dominio e UI
services/       acesso a Supabase, storage, notificacoes e APIs
store/          estado global leve
utils/          funcoes puras e helpers
types/          tipos compartilhados, quando aplicavel
docs/           especificacao funcional e tecnica
```

## Responsabilidade por camada

### Telas

As telas devem coordenar o fluxo e renderizar a interface. Nao devem conter regras complexas de negocio.

### Componentes

Componentes devem ser reutilizaveis, pequenos e focados em apresentacao ou interacao especifica.

### Hooks

Hooks devem concentrar estado local, carregamentos, paginacao e efeitos relacionados a uma funcionalidade.

### Services

Services devem concentrar chamadas ao Supabase, Storage, notificacoes e APIs externas.

### Store global

O estado global deve ser usado apenas para informacoes realmente globais, como autenticacao, sessao e dados essenciais do utilizador.

## Principios tecnicos

- Evitar componentes gigantes.
- Evitar logica duplicada.
- Evitar chamadas repetidas sem necessidade.
- Separar perfil resumido de perfil completo.
- Usar paginacao para listas grandes.
- Usar contadores persistidos quando o valor for exibido com frequencia.
- Validar autorizacao no backend, policies ou regras do Supabase.

## Entidades conceituais

```text
users
profiles
posts
comments
likes
connections
recommendations
jobs
applications
conversations
messages
notifications
admin_audit_logs
```

## Decisao tecnica importante

Quando houver duas formas de implementar uma funcionalidade, a escolha deve considerar:

- simplicidade para o utilizador;
- menor numero de estados;
- menor custo de processamento;
- facilidade de manutencao;
- seguranca;
- escalabilidade futura.
