# Solicitação de Análise da Plataforma

Estou a desenvolver uma plataforma com versões **Web** e **Mobile (Android)**. Atualmente estou a enfrentar alguns problemas que precisam de ser analisados.

**Importante:** por enquanto **não altere nada no código**. O objetivo é apenas **analisar cada problema**, identificar a causa e apresentar as possíveis soluções. Apenas depois da análise irei autorizar as alterações.

---

# 1. Problemas na versão Mobile (Android)

## 1.1 Safe Area / Layout

O layout não está a respeitar corretamente as áreas seguras do dispositivo.

### Parte superior

O conteúdo invade a área da barra de status (Status Bar), ficando por baixo dela.

### Parte inferior

O conteúdo também invade a área inferior do dispositivo, ficando por baixo da barra de navegação do Android.

Como consequência, alguns elementos ficam escondidos e a navegação torna-se difícil.

---

## 1.2 Campo de mensagem e teclado

Ao escrever uma mensagem:

* o teclado abre;
* porém o campo de texto não acompanha o teclado;
* não consigo visualizar o que estou a escrever.

O comportamento esperado é:

* quando o teclado abrir, o campo de mensagem deve subir automaticamente;
* quando o teclado fechar, o campo deve voltar à posição original.

Verifique toda a implementação relacionada com o comportamento do teclado na versão mobile.

---


# 2. Problema dos ícones após o Hosting

Este problema acontece apenas na versão publicada.

Durante o desenvolvimento (ambiente local):

* todos os ícones aparecem normalmente.

Depois de publicar a aplicação (produção):

* vários ícones deixam de aparecer.
Existe um comportamento inconsistente relacionado com os ícones.

Na primeira abertura da aplicação:

* os ícones não aparecem.

Depois de fazer login:

* alguns ícones passam a aparecer.

Ao atualizar (refresh):

* desaparecem novamente.

nota: só desaparem se eu clicar na opção premium e atualizar nessa pagina, se volto para o home e atualizo de novo, volta a aparecer. acho que merece atenção essa pagina do premium.

Portanto, a análise deve considerar especificamente o ambiente de produção.

---

# 3. Likes não são guardados

Quando um utilizador adiciona um like:

* o like aparece inicialmente;
* porém, ao atualizar a página (refresh), desaparece.

Verificar:

* persistência dos dados;
* sincronização entre frontend e backend;
* atualização da base de dados.

---

# 4. Comentários

Ao abrir a área de comentários:

* a aplicação ficou apenas em processamento infinito.

Depois de atualizar a página:

* apareceu um aviso do navegador indicando que o site poderia ser perigoso.

Peço que seja investigada a causa deste comportamento.

---

# 5. Segurança da plataforma

Também peço uma análise geral da segurança da aplicação.

Objetivos:

* identificar possíveis vulnerabilidades;
* verificar por que motivo o navegador apresenta avisos de segurança;
* verificar se existe algum comportamento que possa fazer a plataforma ser considerada insegura;
* aplicar boas práticas para evitar bloqueios, avisos ou possíveis restrições.

Importante:

A plataforma ainda está em fase de testes, portanto esse tipo de aviso não deveria ocorrer.

---

# 6. Processamento infinito após inatividade

Existe outro problema importante.

Se eu permanecer algum tempo sem utilizar a plataforma:

* ela deixa de responder corretamente;
* qualquer ação passa a ficar em processamento infinito;
* nenhuma operação é concluída.

Inicialmente pensei que fosse apenas durante o desenvolvimento.

No entanto, depois da publicação em produção, o problema continua exatamente igual.

Peço que seja analisado:

* timeout de sessão;
* autenticação;
* refresh de tokens;
* estado da aplicação;
* chamadas ao backend;
* possíveis deadlocks.

---

# 7. Sistema Premium (Konekt Mais)

Quero implementar uma versão Premium chamada **Konekt Mais**.

Neste momento:

* parte da funcionalidade já existe;
* ainda falta concluir a implementação.

Antes de finalizar essa funcionalidade, peço uma análise completa para garantir que toda a estrutura já está preparada.

---

## 7.1 Nome do plano

Atualmente aparece como:

**Konekt plus**

O nome correto deverá ser:

**Konekt Mais**

Verificar todas as ocorrências.

---

## 7.2 Selo de verificação

Os utilizadores Premium deverão possuir um selo de verificação.

Esse selo deve aparecer em toda a plataforma, incluindo:

* perfil;
* publicações;
* comentários;
* mensagens;
* pedidos de conexão;
* listas de utilizadores;
* qualquer outro local onde o utilizador seja apresentado.

O selo deve ser consistente em toda a aplicação.

---

## 7.3 Estrutura pronta para pagamento

A ideia é que toda a lógica Premium já esteja pronta.

A única funcionalidade que deverá faltar é:

* integração da API de pagamento.

Quando essa API for implementada futuramente, o sistema deverá funcionar sem necessidade de grandes alterações.

---

## 7.4 Atribuição Premium pelo Admin

Enquanto o sistema de pagamento não existir, o administrador deverá conseguir atribuir manualmente o plano Premium.

Fluxo esperado:

1. o administrador entra no painel de administração;
2. seleciona um utilizador;
3. atribui o plano Premium;
4. o utilizador passa imediatamente a usufruir de todos os benefícios Premium.

Isso permitirá testar toda a funcionalidade antes da implementação do pagamento.

---

## 7.5 Benefícios Premium

Após um utilizador ser marcado como Premium, todas as funcionalidades Premium devem funcionar corretamente.

O único elemento que deverá continuar pendente será a integração da API de pagamento.

---

# Objetivo desta solicitação

Neste momento, **não pretendo que seja feita qualquer alteração no código**.

Peço apenas que seja realizada uma análise completa da plataforma para:

* identificar todas as causas dos problemas;
* explicar cada problema encontrado;
* apresentar possíveis soluções;
* indicar as melhores práticas;
* informar quais alterações serão necessárias.

Depois dessa análise, irei autorizar as correções.
