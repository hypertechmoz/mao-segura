# Relatorio de Analise - Konekta

Data da analise: 2026-07-16

Este relatorio foi preparado com base no pedido descrito em `components/Importante.md`.
Nenhuma alteracao de codigo foi feita durante esta analise.

---

## Resumo executivo

O projeto e uma aplicacao Expo/React Native com versoes mobile e web, publicada em Firebase Hosting e usando Supabase como backend principal.

Os problemas relatados parecem estar concentrados em seis areas:

1. Layout mobile sem tratamento centralizado de safe area e teclado.
2. Carregamento inconsistente de fontes de icones no build web de producao.
3. Fluxos Supabase sem tratamento robusto de erro, timeout e sessao expirada.
4. Premium parcialmente implementado, mas ainda com nomes antigos e estados inconsistentes.
5. Edicao de perfil com fluxo instavel de foto no Android e valores incompatveis com constraints do banco.
6. Chat/conversas com possivel duplicacao de conversas e estado de autorizacao inconsistente.

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

## 11. Edicao de perfil - foto no Android e erro ao guardar

### Frase organizada do problema relatado

Na versao Android, ao entrar em `Editar Perfil`, escolher a opcao para tirar uma foto no momento e confirmar o uso da foto, a aplicacao nao permanece na tela de edicao. Ela sai da tela de edicao e volta para a Home. Como resultado, a foto nao fica aplicada ao perfil.

Tambem foi observado que, ao preencher todos os campos da edicao de perfil e tentar guardar, aparece um erro relacionado a tabela `worker_profiles`, informando que uma nova linha viola a constraint `worker_profiles_availability_check`.

### Erro observado na imagem enviada

Mensagem exibida:

```text
Guardar Perfil
new row for relation "worker_profiles" violates check constraint "worker_profiles_availability_check"
```

### Evidencias encontradas no codigo

Arquivo principal:

- `app/settings/edit-profile.js`

O fluxo de foto usa:

```js
ImagePicker.launchCameraAsync(...)
```

Depois de tirar ou escolher a foto, o app faz upload imediato para o Supabase Storage e apenas atualiza o estado local:

```js
setProfilePhoto(publicUrl)
```

O upload da foto nao chama `router.replace` nem deveria navegar sozinho.

Porem a tela usa `useFocusEffect` para recarregar os dados sempre que a tela recebe foco:

```js
useFocusEffect(...)
```

No Android, abrir a camera tira a aplicacao do foco. Ao voltar da camera, a tela recebe foco novamente. Isso pode disparar `loadData()` e sobrescrever o estado local da edicao, incluindo a foto recem-selecionada, com os dados antigos vindos do banco.

Tambem foi encontrado um redirecionamento global em `app/index.js`:

```js
if (user) {
    return <Redirect href="/(tabs)/home" />;
}
```

Se o Android recriar a Activity apos a camera, ou se o estado de navegacao for perdido durante o retorno da camera, a aplicacao pode voltar pelo fluxo inicial e cair na Home.

### Causa provavel da foto voltar para Home

A causa mais provavel e uma combinacao de comportamento Android com a implementacao atual:

- a camera abre uma Activity externa;
- ao retornar, a tela `edit-profile` recebe foco novamente;
- `useFocusEffect` recarrega dados do perfil;
- o estado local da foto pode ser substituido;
- em alguns dispositivos, o processo pode ser recriado e o `Redirect` do `app/index.js` manda o utilizador autenticado para `/(tabs)/home`.

Ou seja, o problema nao parece estar no botao da camera em si, mas na falta de protecao do estado da tela durante o retorno do ImagePicker no Android.

### Solucao recomendada para a foto

- Evitar recarregar automaticamente o perfil quando a tela recebe foco apos voltar da camera.
- Usar uma flag, por exemplo `isPickingImageRef`, para impedir `loadData()` durante o retorno do ImagePicker.
- Fechar o modal antes de abrir a camera.
- Guardar temporariamente a imagem selecionada em estado local ate o utilizador clicar em `Guardar Alteracoes`.
- Considerar fazer o upload apenas no momento de guardar, nao imediatamente apos tirar a foto.
- Testar em Android real, porque o comportamento pode variar entre dispositivos.

### Causa provavel do erro `worker_profiles_availability_check`

Na tela `edit-profile`, os valores enviados para `availability` sao:

```text
FULL_TIME
PART_TIME
WEEKENDS
FLEXIBLE
IMMEDIATE
TEMPORARY
```

Mas em outras partes do projeto aparecem valores diferentes para disponibilidade:

```text
DAILY
TEMPORARY
PERMANENT
IMMEDIATE
```

Exemplos:

- `constants/index.js` usa `DAILY`, `TEMPORARY`, `PERMANENT`.
- `app/(tabs)/profile.js` espera `IMMEDIATE`, `TEMPORARY`, `DAILY`, `PERMANENT`.
- `app/user/[id].js` compara `availability` com `DAILY`.
- `app/settings/edit-profile.js` envia `FULL_TIME`, `PART_TIME`, `WEEKENDS`, `FLEXIBLE`, `IMMEDIATE`, `TEMPORARY`.

Portanto, a tela de edicao esta provavelmente enviando valores que nao estao permitidos pela constraint `worker_profiles_availability_check` no Supabase.

### Solucao recomendada para o erro de disponibilidade

- Verificar no Supabase quais valores sao permitidos pela constraint `worker_profiles_availability_check`.
- Padronizar os valores de disponibilidade em uma unica constante compartilhada.
- Ajustar `app/settings/edit-profile.js` para enviar apenas valores aceitos pelo banco.
- Atualizar as telas de perfil para exibirem os mesmos valores.
- Se o produto realmente precisar de novos valores como `FULL_TIME`, `PART_TIME`, `WEEKENDS` e `FLEXIBLE`, entao a constraint do banco tambem deve ser atualizada.
- Adicionar validacao antes de guardar, para impedir envio de valor invalido e mostrar mensagem clara ao utilizador.

### Prioridade

Alta.

Este problema bloqueia a atualizacao completa do perfil e afeta diretamente a primeira experiencia do utilizador trabalhador.

---

## 12. Chat - conversa aparece bloqueada em Mensagens, mas desbloqueada via Notificacoes

### Frase organizada do problema relatado

Quando um utilizador aceita o pedido de contacto e autoriza a conversa, o outro utilizador recebe uma notificacao dizendo que o contacto foi aceite. Ao abrir a conversa pela notificacao, o chat aparece desbloqueado e mostra as mensagens corretamente.

Porem, ao entrar pela aba `Mensagens`, a conversa com o mesmo utilizador ainda aparece bloqueada, como se estivesse aguardando autorizacao.

Tambem foi relatado que, no Android, em alguns momentos o app fecha sozinho sem acao clara do utilizador.

### Evidencias encontradas nas imagens

As imagens mostram dois links de chat diferentes para o mesmo contacto `Elite Company`:

```text
/chat/5a4c38be-ba0c-431f-a9ba-66d091cc1fc2
/chat/a5b837a1-2931-4473-9978-01e8631f8e18
```

Na primeira rota, o chat aparece bloqueado:

```text
Aguardando Autorizacao
Chat bloqueado...
```

Na segunda rota, aberta pela notificacao, o chat aparece autorizado e mostra mensagens:

```text
O seu pedido de contacto foi aceite!
oi
ola
```

Isso indica que provavelmente existem duas linhas diferentes em `chat_conversations` para o mesmo par de utilizadores.

### Evidencias encontradas no codigo

Arquivos relevantes:

- `app/(tabs)/messages.js`
- `app/(tabs)/notifications.js`
- `app/chat/[id].js`
- `utils/chatHelper.js`
- `utils/chatSecureHelper.js`
- `components/PostCard.js`
- `app/user/[id].js`

Na aba `Mensagens`, a lista busca todas as conversas do utilizador e abre pelo `id` da conversa encontrada:

```js
router.push({ pathname: `/chat/${item.id}`, params: { name: item.otherUser?.name } })
```

Ela nao filtra apenas conversas autorizadas, nem tenta agrupar conversas duplicadas pelo par `worker_id` + `employer_id`.

No helper `startOrGetConversation`, a busca por conversa existente usa `maybeSingle()`:

```js
.eq(fieldSelf, uid)
.eq(fieldOther, targetId)
.maybeSingle()
```

Se ja existirem duas conversas para o mesmo par, `maybeSingle()` pode falhar por haver mais de uma linha. O erro `fetchError` e capturado na variavel, mas nao e tratado. Nesse caso, o codigo continua e pode criar mais uma conversa.

No helper `acceptConnectionRequest`, quando um pedido e aceite, o app chama `startOrGetConversation()` e depois marca a conversa retornada como autorizada:

```js
await supabase.from('chat_conversations').update({
    is_authorized: true,
    updated_at: new Date().toISOString()
}).eq('id', conversationId);
```

A notificacao criada aponta diretamente para essa conversa autorizada:

```js
route: `/chat/${conversationId}`
```

Por isso a notificacao abre o chat correto, enquanto a aba Mensagens pode estar abrindo outra conversa antiga ainda bloqueada.

### Causa provavel

A causa mais provavel e duplicacao de conversas em `chat_conversations`.

O sistema permite que exista mais de uma conversa para o mesmo par `worker_id` + `employer_id`, especialmente porque:

- nao foi encontrada uma protecao visivel no frontend contra duplicatas;
- nao ha evidencia no repositorio de uma constraint unica no banco;
- `startOrGetConversation()` ignora `fetchError`;
- a aba Mensagens lista conversas por `updated_at`, sem consolidar duplicatas;
- a notificacao aponta para a conversa autorizada especifica, mas a aba Mensagens pode abrir a conversa pendente antiga.

### Solucao recomendada

- Criar uma constraint unica no Supabase para impedir duplicatas por par de utilizadores.
- Definir uma regra clara para conversa unica:

```text
unique(worker_id, employer_id)
```

- Ajustar `startOrGetConversation()` para:
  - tratar `fetchError`;
  - se encontrar multiplas conversas, escolher a autorizada ou a mais recente;
  - nao criar nova conversa quando ja existe uma pendente/autorizada para o mesmo par.
- Criar rotina de limpeza/migracao para conversas duplicadas ja existentes.
- Na aba `Mensagens`, priorizar conversas autorizadas quando houver duplicatas.
- Ao aceitar um pedido, atualizar todas as conversas pendentes do mesmo par ou mesclar na conversa principal.
- Garantir que `last_message`, `updated_at` e `unread_count` fiquem na conversa principal.

### Prioridade

Alta.

Este bug quebra a confianca no chat, porque o utilizador recebe a confirmacao de contacto aceite, mas a entrada principal de mensagens continua mostrando a conversa como bloqueada.

---

## 13. Android - app fecha sozinho

### Problema relatado

No Android, em alguns momentos o app fecha sozinho, sem uma acao clara.

### Evidencias encontradas no log `adblog.md`

O log confirmou um crash real no Android.

Horario do crash:

```text
07-17 19:27:02
```

Erro principal:

```text
FATAL EXCEPTION: mqt_v_native
Process: com.maosegura.app
com.facebook.react.common.JavascriptException:
Error: cannot add `postgres_changes` callbacks for realtime:messages-list after `subscribe()`.
```

Componente indicado pelo stack trace:

```text
at Messages
```

Arquivo relacionado:

```text
app/(tabs)/messages.js
```

Logo antes do crash tambem aparece:

```text
E ReactNativeJS: Error: cannot add `postgres_changes` callbacks for realtime:messages-list after `subscribe()`.
```

Depois disso, o Android encerra o processo:

```text
Process : Sending signal. PID: 15318 SIG: 9
```

### Causa confirmada

A causa principal do fechamento registrado no log e o canal realtime do Supabase na tela `Messages`.

Em `app/(tabs)/messages.js`, o canal e criado com nome fixo:

```js
const channel = supabase.channel('messages-list')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, () => fetchConversations())
    .subscribe();
```

O erro indica que o app tentou adicionar callbacks `postgres_changes` a um canal que ja estava subscrito.

Isso pode acontecer quando:

- a tela `Messages` monta mais de uma vez;
- a navegacao preserva uma instancia anterior da tela;
- o cleanup ainda nao removeu o canal antigo;
- o mesmo nome de canal `messages-list` e reutilizado;
- React Native/Expo Router reconecta efeitos durante navegacao ou retorno do background.

Como esse erro nao e capturado, ele sobe como `JavascriptException` fatal e fecha o app Android.

### Solucao recomendada para este crash

- Usar nome de canal unico por utilizador e por montagem, por exemplo:

```text
messages-list-${uid}-${Date.now()}
```

- Antes de criar um canal novo, remover qualquer canal anterior guardado em `useRef`.
- Evitar reutilizar o mesmo nome fixo `messages-list`.
- Garantir que `.on(...)` seja sempre chamado antes de `.subscribe()`.
- Garantir cleanup robusto com `supabase.removeChannel(channel)` no retorno do `useEffect`.
- Opcionalmente, mover a subscription para um hook centralizado e impedir subscriptions duplicadas.

### Outros erros observados no log

Apos o crash principal, tambem aparecem erros como:

```text
TypeError: undefined is not a function
at RootLayout
at Profile
```

E erros nativos de UI:

```text
addViewAt: failed to insert view
The specified child already has a parent
```

Esses erros podem ser consequencia do estado instavel causado pelo crash inicial, mas devem ser reavaliados depois de corrigir a subscription da tela `Messages`.

Tambem apareceu aviso de notificacoes push:

```text
Erro ao obter token do Expo:
Default FirebaseApp is not initialized in this process com.maosegura.app.
```

Isso indica que as credenciais/configuracao FCM para notificacoes Android ainda precisam ser revistas, mas esse aviso nao foi o causador direto do crash registrado.

Tambem apareceu aviso do ImagePicker:

```text
[expo-image-picker] ImagePicker.MediaTypeOptions have been deprecated.
```

Esse aviso deve ser corrigido futuramente, mas tambem nao foi a causa direta do fechamento registrado.

### Evidencias encontradas no codigo

Nao ha logs nativos no repositorio que permitam confirmar a causa exata do fechamento. Para identificar a causa real, sera necessario capturar logs com `adb logcat`, EAS build logs ou adicionar Crashlytics/Sentry.

Mesmo assim, existem pontos de risco:

- `newArchEnabled: true` em `app.json`;
- uso de `expo-notifications` no layout raiz;
- uso de camera e selecao de imagem com upload e conversao para base64 em `app/settings/edit-profile.js`;
- varias subscriptions realtime do Supabase;
- chamadas async sem timeout em varias telas;
- ausencia de Crashlytics ou ferramenta equivalente para capturar stack traces nativas.

### Causas possiveis

As causas mais provaveis precisam ser confirmadas por logs, mas os suspeitos principais sao:

- crash nativo ao voltar da camera ou galeria;
- consumo alto de memoria ao converter imagem para base64 antes do upload;
- incompatibilidade ou instabilidade relacionada a `newArchEnabled`;
- erro nativo de notificacoes push em Android;
- estado de navegacao recriado apos app ir para segundo plano;
- excecao nao capturada em algum fluxo async que deixa a UI inconsistente e fecha a Activity.

Depois da leitura do `adblog.md`, a primeira correcao deve ser o canal realtime duplicado em `app/(tabs)/messages.js`.

### Solucao recomendada

- Capturar `adb logcat` durante o uso ate o app fechar.
- Adicionar Crashlytics ou Sentry antes de novas publicacoes de teste.
- Testar build Android com `newArchEnabled` ligado e desligado.
- Evitar converter fotos grandes para base64; preferir upload por `FileSystem`/blob controlado ou compressao previa.
- Revisar fluxos de camera, notificacoes e realtime subscriptions.
- Adicionar tratamento global para erros nao capturados.

### Prioridade

Critica.

Fechamento inesperado no Android foi confirmado como crash fatal causado por erro JavaScript nao tratado na tela `Messages`.

---

## 14. Ordem recomendada de execucao

Quando as alteracoes forem autorizadas, a ordem recomendada e:

1. Corrigir safe area e teclado no Android.
2. Corrigir carregamento de fontes e icones no web build.
3. Corrigir edicao de perfil: retorno da camera no Android e constraint de `availability`.
4. Corrigir duplicacao de conversas e estado de autorizacao do chat.
5. Investigar fechamento inesperado no Android com logs reais.
6. Corrigir loading infinito com `try/catch/finally`, timeout e estados de erro.
7. Auditar likes e comentarios no Supabase: RPCs, RLS e estrutura de dados.
8. Normalizar Premium para `Konekt Mais`.
9. Ajustar admin para atribuir Premium de forma completa.
10. Criar componente unico para selos.
11. Fazer auditoria de seguranca no Supabase.
12. Corrigir textos com codificacao quebrada.
13. Testar Android real e refresh direto em rotas de producao.

---

## Conclusao

Os problemas relatados sao coerentes com o estado atual do projeto.

As causas mais provaveis sao:

- falta de tratamento global de safe area e teclado no Android;
- carregamento inconsistente de fontes de icones no build web;
- chamadas Supabase sem timeout e sem tratamento robusto de erro;
- cache local de usuario podendo divergir da sessao real;
- Premium parcialmente implementado e com nomenclatura antiga.
- edicao de perfil enviando valores de disponibilidade possivelmente incompatveis com o banco;
- fluxo de camera no Android vulneravel a recarregamento da tela e perda de estado.
- chat permitindo conversas duplicadas para o mesmo par de utilizadores;
- app Android fechando sozinho sem logs nativos suficientes para confirmar a causa.

A recomendacao e corrigir primeiro os problemas estruturais de layout, icones e loading, porque eles afetam a usabilidade geral. Depois disso, deve-se revisar a persistencia no Supabase e consolidar o Premium/Konekt Mais.
