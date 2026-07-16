# Relatorio de Analise - Konekta

Data da analise: 2026-07-16

Este relatorio foi preparado com base no pedido descrito em `components/Importante.md`.
Nenhuma alteracao de codigo foi feita durante esta analise.

---

## Resumo executivo

O projeto e uma aplicacao Expo/React Native com versoes mobile e web, publicada em Firebase Hosting e usando Supabase como backend principal.

Os problemas relatados parecem estar concentrados em quatro areas:

1. Layout mobile sem tratamento centralizado de safe area e teclado.
2. Carregamento inconsistente de fontes de icones no build web de producao.
3. Fluxos Supabase sem tratamento robusto de erro, timeout e sessao expirada.
4. Premium parcialmente implementado, mas ainda com nomes antigos e estados inconsistentes.

---

## 1. Mobile Android - Safe Area e Layout

### Problema relatado

O conteudo invade a barra de status e a barra de navegacao inferior do Android.

### Evidencias encontradas

- O layout raiz em `app/_layout.js` usa `StatusBar`, mas nao envolve a aplicacao em um `SafeAreaProvider`.
- Varias telas usam `paddingTop` fixo em vez de `useSafeAreaInsets`.
- A tab bar mobile em `app/(tabs)/_layout.js` usa altura fixa e `paddingBottom: 8`.
- Algumas telas aplicam `insets.top`, mas de forma isolada, sem padrao unico.

Arquivos relevantes:

- `app/_layout.js`
- `app/(tabs)/_layout.js`
- `app/(tabs)/home.js`
- `app/(tabs)/jobs.js`
- `app/(tabs)/messages.js`
- `app/(tabs)/profile.js`
- `app/post/[id]/comments.js`
- `app/chat/[id].js`

### Causa provavel

A aplicacao nao tem uma estrategia global de safe area. Algumas telas tentam corrigir manualmente, outras usam valores fixos, e a navegacao inferior nao considera corretamente `insets.bottom`.

### Solucao recomendada

- Adicionar `SafeAreaProvider` no layout raiz.
- Criar um padrao para telas mobile usando `useSafeAreaInsets`.
- Ajustar tab bar para somar `insets.bottom`.
- Remover `paddingTop` fixo onde a tela deve respeitar a barra de status.
- Testar em Android com gestos e com barra de navegacao tradicional.

---

## 2. Campo de mensagem e teclado

### Problema relatado

Ao abrir o teclado, o campo de mensagem nao sobe e o utilizador nao consegue ver o que esta a escrever.

### Evidencias encontradas

Em varias telas, o `KeyboardAvoidingView` esta ativo apenas para iOS:

- `app/chat/[id].js`
- `app/post/[id]/comments.js`
- `app/post/create.js`
- `app/job/create.js`

Exemplo de padrao encontrado:

```js
behavior={Platform.OS === 'ios' ? 'padding' : undefined}
```

### Causa provavel

No Android, o comportamento de evitar teclado esta desativado. Por isso, o teclado cobre o input em vez de empurrar a interface.

### Solucao recomendada

- Definir comportamento especifico para Android, como `height` ou uma solucao baseada em `Keyboard` events.
- Confirmar `windowSoftInputMode` adequado para Android.
- Aplicar `paddingBottom` com `insets.bottom` nos campos fixos no rodape.
- Testar especialmente:
  - chat;
  - comentarios;
  - criacao de posts;
  - criacao de vagas.

---

## 3. Icones desaparecem em producao

### Problema relatado

No ambiente local os icones aparecem, mas no build publicado varios icones desaparecem. O problema parece pior ao atualizar a pagina Premium.

### Evidencias encontradas

O projeto carrega fontes de icones em dois lugares:

- `app/_layout.js`
- `app/(tabs)/_layout.js`

No layout das tabs existe carregamento manual de:

```js
'Ionicons': '/Ionicons.ttf'
```

No diretorio `dist`, foi encontrado:

- `dist/Ionicons.ttf`
- `dist/assets/node_modules/.../Ionicons.[hash].ttf`
- `dist/assets/node_modules/.../MaterialIcons.[hash].ttf`

Porem nao foi encontrado `dist/MaterialIcons.ttf` na raiz.

A pagina Premium usa `MaterialIcons` para selo verificado:

- `app/settings/premium.js`

### Causa provavel

O build web publica `Ionicons.ttf` na raiz, mas nao publica `MaterialIcons.ttf` na raiz. Como partes da aplicacao dependem de `MaterialIcons`, alguns icones ficam sem fonte em producao.

Tambem ha risco de conflito porque as fontes sao carregadas manualmente em mais de um lugar.

### Solucao recomendada

- Centralizar o carregamento de fontes de icones apenas no layout raiz.
- Remover o carregamento manual de `/Ionicons.ttf` em `app/(tabs)/_layout.js`, se nao for necessario.
- Garantir que `MaterialIcons` seja carregado usando asset importado pelo bundler, nao caminho fixo de raiz.
- Validar no `dist` final que Ionicons e MaterialIcons aparecem com URLs corretas.
- Testar refresh direto em `/settings/premium`.

---

## 4. Likes nao sao guardados

### Problema relatado

O like aparece inicialmente, mas desaparece apos atualizar a pagina.

### Evidencias encontradas

O componente `components/PostCard.js` usa atualizacao otimista:

- calcula `initialLiked` com `post.liked_by`;
- calcula `initialLikesCount` com `post.likes_count`;
- chama a RPC `toggle_post_like`.

O feed busca posts em `app/(tabs)/home.js` com:

```js
.select('*, author:users!inner(...)')
```

Nao foram encontrados scripts SQL/migrations no repositorio contendo a definicao de `toggle_post_like`.

### Causa provavel

A causa mais provavel esta no Supabase:

- RPC `toggle_post_like` inexistente ou incorreta;
- RPC nao atualiza `liked_by`;
- RPC nao atualiza `likes_count`;
- RLS bloqueia a atualizacao;
- o frontend espera `liked_by`, mas o banco pode estar persistindo likes de outra forma.

### Solucao recomendada

- Verificar no Supabase se a RPC `toggle_post_like` existe.
- Validar se a RPC atualiza dados de forma transacional.
- Preferir tabela dedicada:

```text
post_likes
- post_id
- user_id
- created_at
```

- Criar unique constraint em `(post_id, user_id)`.
- Atualizar `likes_count` via trigger ou view, ou calcular por query.
- Garantir policies RLS para inserir/remover apenas o proprio like.

---

## 5. Comentarios e processamento infinito

### Problema relatado

Ao abrir comentarios, a aplicacao fica em processamento infinito. Depois de atualizar, o navegador mostra aviso de site perigoso.

### Evidencias encontradas

Em `app/post/[id]/comments.js`:

- `fetchPostAndComments` nao usa `try/catch/finally`;
- erros de Supabase nao sao tratados;
- se uma chamada pendurar, `setLoading(false)` pode nunca acontecer;
- a subscription realtime chama novamente `fetchPostAndComments` em cada alteracao.

### Causa provavel

O loading infinito pode ser causado por:

- query ao Supabase sem resposta;
- sessao expirada;
- erro de RLS;
- erro na relacao `author:user_id(*)`;
- subscription realtime disparando refetchs repetidos;
- falta de timeout e estado de erro.

### Solucao recomendada

- Envolver o carregamento em `try/catch/finally`.
- Sempre executar `setLoading(false)` no `finally`.
- Exibir mensagem de erro quando a query falhar.
- Adicionar timeout para chamadas criticas.
- Evitar refetch completo em cada evento realtime; atualizar estado local quando possivel.
- Validar policies RLS da tabela `comments`.

---

## 6. Seguranca da plataforma

### Pontos observados

Nao foram encontrados usos evidentes de `eval`, `dangerouslySetInnerHTML`, `WebView` ou injecao direta de HTML.

Foram encontrados pontos que merecem revisao:

- `constants/index.js` contem `API_URL` e `SOCKET_URL` com `http://localhost:3000`.
- Nao ha migrations ou policies Supabase versionadas no repositorio.
- Operacoes de admin dependem fortemente de RLS/RPC no Supabase.
- Push notifications sao enviadas diretamente do cliente para a API da Expo.
- Existem textos com codificacao quebrada em varios arquivos.

### Riscos

- Se `http://localhost:3000` for usado em producao, pode causar falhas, mixed content ou comportamento suspeito.
- Sem policies versionadas, fica dificil auditar seguranca real do backend.
- Funcoes admin devem ser protegidas no backend, nao apenas pela interface.
- Enviar notificacoes diretamente pelo cliente pode permitir abuso se tokens forem expostos ou manipulados.

### Solucao recomendada

- Remover ou isolar URLs locais para desenvolvimento.
- Versionar schema, RPCs e policies do Supabase.
- Garantir RLS em tabelas sensiveis.
- Mover operacoes sensiveis para edge functions ou RPCs seguras.
- Revisar permissoes de admin no backend.
- Corrigir codificacao dos textos para UTF-8.

---

## 7. Processamento infinito apos inatividade

### Problema relatado

Apos algum tempo sem usar a plataforma, qualquer acao fica em loading infinito.

### Evidencias encontradas

Em `services/supabase.js`, o Supabase esta configurado com:

- `autoRefreshToken: true`
- `persistSession: true`

Em `store/authStore.js`, alem da sessao do Supabase, existe um cache proprio:

```text
mao_segura_user_session
```

Esse cache salva o usuario enriquecido e pode deixar a interface com usuario local mesmo quando a sessao real esta expirada ou em estado inconsistente.

Tambem ha varias chamadas Supabase sem timeout, por exemplo em:

- `utils/useUnreadCount.js`
- `app/post/[id]/comments.js`
- `app/chat/[id].js`
- telas de feed, notificacoes e mensagens.

### Causa provavel

O app pode ficar preso entre:

- usuario salvo localmente;
- sessao Supabase expirada ou em refresh;
- queries aguardando resposta;
- loading sem `finally`;
- subscriptions realtime tentando reconectar.

### Solucao recomendada

- Tratar a sessao Supabase como fonte principal de autenticacao.
- Usar o cache local apenas como fallback visual, nao como prova de sessao valida.
- Criar helper de query com timeout.
- Em caso de erro 401/403/JWT expirado, forcar refresh da sessao ou logout controlado.
- Adicionar estado de erro nas telas em vez de manter loading infinito.
- Revisar subscriptions realtime e limpar canais corretamente.

---

## 8. Sistema Premium - Konekt Mais

### Problema relatado

O plano deve chamar-se `Konekt Mais`, mas ainda aparece como `Konekta Plus` ou `Plus`.

### Evidencias encontradas

Ocorrencias relevantes:

- `app/settings/premium.js`
- `app/admin/users.js`
- `components/Importante.md`

Exemplos encontrados:

- `Subscricao Konekta Plus ativada`
- `Cancelar Plano Plus`
- `Comecar Konekta Plus`
- `Dar Plus`
- `Remover Plus`

### Causa

O sistema Premium foi implementado parcialmente com nome antigo.

### Solucao recomendada

- Substituir textos visiveis para `Konekt Mais`.
- Definir uma constante unica para nome do plano.
- Atualizar traducoes em `locales/pt.json` e `locales/en.json`, se aplicavel.
- Rever tambem mensagens de admin e alertas.

---

## 9. Premium - estrutura e admin

### Evidencias encontradas

A pagina Premium atualiza:

- tabela `subscriptions`;
- campo `users.is_premium`.

O admin em `app/admin/users.js` atualiza apenas:

- `users.is_premium`.

### Problema

O estado Premium pode ficar inconsistente:

- usuario com `is_premium = true`, mas sem `subscription`;
- subscription expirada, mas usuario ainda marcado como premium;
- admin ativa premium, mas a pagina Premium nao tem historico completo.

### Solucao recomendada

- Definir fonte de verdade para Premium.
- Quando admin atribuir Premium, criar ou atualizar tambem `subscriptions`.
- Guardar:
  - `plan`;
  - `status`;
  - `assigned_by`;
  - `payment_method`;
  - `expires_at`;
  - `created_at`;
  - `updated_at`.
- Preparar campo para futura API de pagamento.
- Evitar pagamento simulado em producao sem controle claro.

---

## 10. Selo de verificacao e Premium

### Problema relatado

Usuarios Premium devem ter selo consistente em toda a plataforma.

### Evidencias encontradas

O selo aparece em alguns locais:

- posts;
- perfil;
- mensagens;
- rede;
- admin;
- detalhes de vaga.

Mas ha inconsistencias:

- alguns lugares usam `is_verified`;
- outro lugar usa `isVerified`;
- Premium as vezes aparece como estrela, nao como selo unificado;
- nao existe componente unico para selo.

### Solucao recomendada

- Criar componente unico, por exemplo `UserBadges`.
- Esse componente deve receber `isVerified` e `isPremium`.
- Usar o mesmo componente em:
  - perfil;
  - posts;
  - comentarios;
  - mensagens;
  - conexoes;
  - listas de utilizadores;
  - vagas;
  - admin.
- Normalizar nomes de campos para `is_verified` e `is_premium`.

---

## 11. Ordem recomendada de execucao

Quando as alteracoes forem autorizadas, a ordem recomendada e:

1. Corrigir safe area e teclado no Android.
2. Corrigir carregamento de fontes e icones no web build.
3. Corrigir loading infinito com `try/catch/finally`, timeout e estados de erro.
4. Auditar likes e comentarios no Supabase: RPCs, RLS e estrutura de dados.
5. Normalizar Premium para `Konekt Mais`.
6. Ajustar admin para atribuir Premium de forma completa.
7. Criar componente unico para selos.
8. Fazer auditoria de seguranca no Supabase.
9. Corrigir textos com codificacao quebrada.
10. Testar Android real e refresh direto em rotas de producao.

---

## Conclusao

Os problemas relatados sao coerentes com o estado atual do projeto.

As causas mais provaveis sao:

- falta de tratamento global de safe area e teclado no Android;
- carregamento inconsistente de fontes de icones no build web;
- chamadas Supabase sem timeout e sem tratamento robusto de erro;
- cache local de usuario podendo divergir da sessao real;
- Premium parcialmente implementado e com nomenclatura antiga.

A recomendacao e corrigir primeiro os problemas estruturais de layout, icones e loading, porque eles afetam a usabilidade geral. Depois disso, deve-se revisar a persistencia no Supabase e consolidar o Premium/Konekt Mais.
