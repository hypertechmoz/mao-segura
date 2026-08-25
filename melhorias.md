# Problemas na versão Mobile (Android) e Web

## 1. Atualização em tempo real das notificações e mensagens

Existe um problema importante na versão **Mobile (Android)** e também na **Web** relacionado com a atualização em tempo real das notificações e das contagens exibidas na navbar.

O principal problema **não está nas mensagens em si**, mas sim nas **contagens (badges) dos sininhos de mensagens e notificações**.

### O que já funciona corretamente

* As mensagens chegam em tempo real. Quando um utilizador envia uma mensagem, o outro recebe imediatamente.
* Dentro da tela de conversa, o comportamento está correto. Se eu abrir uma conversa, ler as mensagens e voltar, a conversa já aparece como lida.

Ou seja, o sistema de mensagens em si está funcionando corretamente.

### O problema

As **contagens da navbar não são atualizadas em tempo real**.

#### Mensagens

Exemplo:

* Tenho 7 mensagens não lidas.
* Abro uma conversa e leio as mensagens.
* Volto para a lista.

O esperado é que a contagem diminua imediatamente para 6 (ou para o valor correspondente).

Atualmente isso não acontece. A contagem permanece igual até que eu faça um **refresh** (na Web) ou feche e abra novamente o aplicativo (no Android).

#### Notificações

O mesmo acontece com as notificações.

Se chegar uma nova notificação, ela pode aparecer na tela de notificações, mas o sininho da navbar continua sem atualizar a contagem.

Da mesma forma:

* Se eu abrir uma notificação, a contagem deveria diminuir imediatamente.
* Se eu clicar em **"Marcar todas como lidas"**, o badge deveria desaparecer imediatamente em toda a aplicação.

Hoje isso só acontece depois de atualizar manualmente a aplicação.

## Comportamento esperado

Toda alteração relacionada com leitura de mensagens ou notificações deve refletir imediatamente em toda a aplicação.

Por exemplo:

* Ler uma mensagem → diminuir imediatamente a contagem da navbar.
* Ler uma notificação → diminuir imediatamente a contagem.
* Marcar todas como lidas → remover imediatamente todas as contagens.
* Receber uma nova mensagem → aumentar imediatamente a contagem.
* Receber uma nova notificação → atualizar imediatamente o badge.

Tudo isso deve acontecer em **tempo real**, sem necessidade de refresh ou de reabrir o aplicativo.

## Impacto na experiência do utilizador

Este sistema funciona como uma espécie de **rede social voltada para serviços**.

Não faz sentido que o utilizador precise abrir constantemente a aplicação para descobrir se recebeu algo novo.

O objetivo é que a aplicação seja capaz de manter os indicadores atualizados em tempo real e, quando necessário, enviar notificações mesmo quando o utilizador estiver fora da aplicação.

Atualmente isso transmite a impressão de que o aplicativo não está funcionando corretamente em segundo plano, pois praticamente tudo depende de reabrir a aplicação para sincronizar.

Por favor, verifique toda a lógica responsável pelas contagens da navbar, tanto na versão Mobile quanto na Web, para garantir sincronização em tempo real em toda a aplicação.

---

# 2. Sobreposição da navbar com o teclado (Android)

Existe outro problema apenas na versão Android gerada para produção.

Durante os testes utilizando o **Expo**, tudo funciona normalmente.

No entanto, depois de gerar o **APK**, a navbar inferior passa a ficar sobreposta ao teclado do dispositivo.

Na prática:

* O teclado abre normalmente.
* A navbar invade a área do teclado.
* O aplicativo ocupa toda a parte inferior da tela, sem respeitar os limites do sistema.
* Isso provoca uma sobreposição entre a navbar da aplicação e a barra de navegação/teclado do Android.

Esse comportamento não acontece durante os testes no Expo, apenas na versão compilada (APK).

Peço que seja verificada a configuração responsável por esse comportamento, pois parece haver alguma diferença entre o ambiente de desenvolvimento e a build de produção.

O aplicativo deve respeitar as **Safe Areas** e os limites do sistema operacional também na versão APK, evitando qualquer sobreposição entre a interface da aplicação e os elementos nativos do Android.


alterações por se fazer a partir do dia 23 de agosto 2026

# Auditoria e Planeamento da Nova Arquitetura do Konekta

Quero que faças uma análise completa do projeto Konekta antes de começarmos a implementar as grandes alterações desta nova fase.

## OBJETIVO PRINCIPAL

A principal mudança desta fase é **generalizar completamente a plataforma de serviços do Konekta**.

O Konekta não deve continuar com uma arquitetura centrada em trabalhadores domésticos ou em profissões específicas.

A plataforma deve passar a funcionar como uma **plataforma geral de conexão entre clientes e profissionais**, capaz de acomodar praticamente qualquer tipo de serviço.

Exemplos:

* diarista
* empregada doméstica
* babá
* cozinheiro
* jardineiro
* eletricista
* canalizador
* pedreiro
* pintor
* carpinteiro
* mecânico
* fotógrafo
* designer gráfico
* designer UI/UX
* programador
* tester/QA
* técnico de informática
* professor
* explicador
* consultor
* assistente virtual
* editor de vídeo
* profissional de marketing
* entre muitos outros

A arquitetura deve ser **genérica, flexível e extensível**, permitindo adicionar novas categorias, especialidades e serviços sem precisar alterar estruturalmente o sistema ou criar lógica específica para cada profissão.

Esta generalização dos serviços será a **principal modificação desta fase do projeto**.

---

# 1. NÃO IMPLEMENTAR AINDA

Nesta primeira fase, não quero que saias imediatamente alterando várias partes do projeto.

Primeiro quero uma **auditoria e diagnóstico da arquitetura atual**.

Analisa o projeto inteiro e identifica:

* como o frontend está organizado;
* como o backend está organizado;
* como os dados estão estruturados;
* como os serviços/profissões estão modelados;
* como os utilizadores estão modelados;
* como os componentes visuais estão organizados;
* onde existem estilos duplicados;
* onde existem componentes duplicados;
* como as rotas estão estruturadas;
* como autenticação e autorização funcionam;
* como Firebase/database/API estão organizados;
* quais partes estão fortemente dependentes da lógica antiga de trabalhadores domésticos;
* quais partes podem ser reutilizadas;
* quais partes precisam ser refatoradas.

Não faça grandes alterações nesta fase sem primeiro apresentar o diagnóstico.

---

# 2. GENERALIZAÇÃO DO MODELO DE SERVIÇOS

Analisa cuidadosamente o modelo atual.

Queremos evoluir de uma lógica específica para algo semelhante a:

Categoria
→ Especialidade
→ Serviço

Por exemplo:

Tecnologia
→ Desenvolvimento de software
→ Desenvolvimento de aplicativo

Tecnologia
→ QA/Testes
→ Teste de aplicativo

Design
→ Design gráfico
→ Criação de logotipo

Casa
→ Limpeza
→ Limpeza residencial

Construção
→ Eletricidade
→ Instalação elétrica

A estrutura deve permitir que novas categorias e especialidades sejam adicionadas sem modificar o código principal da aplicação.

---

# 3. PROFISSIONAL MULTISERVIÇO

Um profissional não deve ficar limitado a uma única profissão.

Por exemplo:

Profissional A:

* Programador
* Tester
* Consultor de tecnologia

Profissional B:

* Designer
* Fotógrafo
* Editor de vídeo

Profissional C:

* Eletricista
* Técnico de instalações

Analisa se a arquitetura atual permite isso.

Caso não permita, propõe uma estrutura adequada.

---

# 4. NÃO CONFUNDIR PROFISSÃO COM MODELO DE SERVIÇO

A arquitetura antiga possui conceitos relacionados a trabalhadores domésticos, como:

* diarista
* permanente
* tempo integral
* dormir no serviço
* não dormir no serviço

Esses conceitos não devem determinar a arquitetura geral do Konekta.

Precisamos separar:

## Profissional

Quem presta o serviço.

## Especialidade

Área em que o profissional trabalha.

## Serviço

O que o profissional oferece.

## Modalidade

Como o serviço é realizado:

* presencial
* remoto
* híbrido

## Tipo de serviço

Como o serviço é contratado:

* serviço único
* recorrente
* temporário
* contrato contínuo
* por projeto
* por tarefa

## Disponibilidade

Quando o profissional pode trabalhar:

* imediato
* agendado
* determinados dias
* determinados horários
* flexível

A arquitetura deve permitir que cada serviço tenha as características necessárias sem obrigar todas as profissões a utilizar campos que não fazem sentido para elas.

---

# 5. SERVIÇOS PRESENCIAIS E REMOTOS

O Konekta deve suportar profissionais presenciais, remotos e híbridos.

Exemplos:

Eletricista:
Presencial

Programador:
Remoto

Designer:
Remoto ou híbrido

Professor:
Presencial ou remoto

Consultor:
Presencial, remoto ou híbrido

Portanto, localização não deve ser obrigatória para todos os serviços.

Para serviços presenciais, localização e proximidade são importantes.

Para serviços remotos, a localização pode ser irrelevante.

---

# 6. SISTEMA DE LOCALIZAÇÃO

Analisa a arquitetura atual de localização e proximidade.

O Konekta deve conseguir considerar:

* localização do cliente;
* localização do profissional;
* área de atendimento;
* raio de atendimento;
* distância;
* disponibilidade;
* categoria;
* especialidade;
* serviço;
* modalidade;
* relevância;
* avaliações.

Não destruas a lógica de proximidade que já existe.

Queremos generalizá-la para diferentes tipos de serviço.

---

# 7. DESIGN SYSTEM

Outro objetivo importante desta fase é **generalizar e centralizar completamente a identidade visual da aplicação**.

Neste momento quero verificar se existem inconsistências entre telas.

Analisa:

### Cores

Identifica todas as cores utilizadas atualmente.

Verifica se existem cores semelhantes utilizadas com valores diferentes.

Queremos definir uma paleta centralizada, por exemplo:

* primary
* primaryDark
* primaryLight
* secondary
* background
* surface
* text
* textSecondary
* border
* success
* warning
* error
* info
* disabled

Não escolha novas cores arbitrariamente sem analisar primeiro a identidade visual existente.

---

# 8. TIPOGRAFIA

Analisa todas as fontes, tamanhos e pesos utilizados.

Identifica inconsistências como:

* títulos com tamanhos diferentes sem motivo;
* textos iguais utilizando tamanhos diferentes;
* pesos diferentes;
* line heights inconsistentes;
* fontes diferentes.

Criar uma escala tipográfica centralizada.

Exemplo:

* display
* heading1
* heading2
* heading3
* bodyLarge
* body
* bodySmall
* caption
* button

A escala deve ser coerente e reutilizável em toda a aplicação.

---

# 9. BOTÕES

Este é um dos pontos que quero corrigir.

Analisa todos os botões existentes.

Identifica:

* tamanhos diferentes;
* alturas diferentes;
* border radius diferentes;
* fontes diferentes;
* pesos diferentes;
* paddings diferentes;
* cores diferentes;
* ícones diferentes;
* estados inconsistentes.

Queremos criar um componente de botão centralizado.

Por exemplo:

* Primary
* Secondary
* Outline
* Ghost
* Danger

Cada variante deve possuir estados consistentes:

* normal
* pressed
* focused
* disabled
* loading

Também devem existir tamanhos padronizados, por exemplo:

* small
* medium
* large

Depois disso, as telas não devem criar estilos de botão individualmente sem uma razão específica.

---

# 10. COMPONENTES GERAIS

Analisa e identifica componentes que deveriam ser centralizados.

Incluindo, quando aplicável:

* Button
* Input
* Select
* SearchBar
* Card
* ProfessionalCard
* ServiceCard
* Avatar
* Badge
* Modal
* BottomSheet
* Tabs
* Header
* Navigation
* EmptyState
* ErrorState
* LoadingState
* Toast
* Dialog
* List
* Divider

O objetivo é evitar que cada tela implemente a própria versão desses elementos.

---

# 11. ESPAÇAMENTO E LAYOUT

Analisa os espaçamentos atuais.

Queremos uma escala centralizada para:

* margin
* padding
* gap
* section spacing
* card spacing
* screen padding

Também analisa:

* border radius;
* sombras;
* elevação;
* tamanhos de ícones;
* tamanhos de avatars.

A aplicação deve ter uma linguagem visual consistente.

---

# 12. DESIGN TOKENS

Se a arquitetura atual permitir, cria ou propõe uma estrutura de Design Tokens.

Por exemplo:

colors
typography
spacing
radius
shadows
sizes
icons

Os componentes devem consumir esses tokens em vez de possuir valores espalhados pelo código.

---

# 13. ARQUITETURA DE FRONTEND

Analisa se a organização atual do frontend é escalável.

Procura:

* componentes duplicados;
* lógica duplicada;
* estilos duplicados;
* telas muito grandes;
* componentes com responsabilidades excessivas;
* lógica de negócio dentro da UI;
* chamadas de API diretamente espalhadas pelas telas;
* estados difíceis de manter.

Propõe uma estrutura mais organizada.

Não faça uma grande migração sem apresentar primeiro a proposta.

---

# 14. ARQUITETURA DE BACKEND

Analisa:

* collections/tables;
* relações;
* APIs;
* serviços;
* funções;
* validações;
* regras;
* queries;
* filtros;
* localização;
* autenticação;
* autorização.

Verifica especialmente se o backend está dependente de profissões específicas.

A arquitetura deve permitir adicionar uma nova profissão/categoria sem criar código específico para essa profissão.

---

# 15. SEGURANÇA — APENAS AUDITORIA INICIAL

A segurança nesta fase não é a principal alteração.

Quero utilizá-la inicialmente para confirmar que a base atual está em ordem antes de fazermos grandes mudanças.

Verifica:

* autenticação;
* autorização;
* roles;
* permissions;
* ownership;
* IDOR/BOLA;
* acesso entre utilizadores;
* acesso a recursos privados;
* acesso administrativo;
* Firebase Security Rules;
* Storage Rules;
* exposição excessiva de dados;
* secrets;
* uploads;
* rate limiting;
* validação de inputs;
* endpoints sensíveis.

Não faça uma refatoração de segurança gigante nesta fase.

Identifica os problemas e classifica-os.

Se encontrares uma vulnerabilidade crítica, corrige-a antes de continuarmos.

---

# 16. ROTAS E SITEMAP

Analisa a rota:

`/_sitemap`

O Expo Router pode gerar essa rota automaticamente.

Verifica se ela está disponível em produção.

Se estiver e não for necessária, devemos desativá-la.

Não confundir isso com o sitemap de SEO.

Queremos futuramente:

`/sitemap.xml`

para mecanismos de busca.

E:

`/robots.txt`

para orientação dos crawlers.

Também queremos garantir que rotas internas, administrativas e privadas não sejam expostas desnecessariamente.

---

# 17. ERROS E EXPOSIÇÃO DA ESTRUTURA

Analisa o comportamento quando alguém acessa uma URL inexistente.

A aplicação não deve revelar:

* lista de rotas;
* nomes de ficheiros;
* estrutura interna;
* stack traces;
* informações de debugging;
* endpoints internos.

Uma URL inexistente deve apresentar uma página 404 adequada.

Recursos privados devem possuir as verificações de autorização apropriadas.

---

# 18. SEO

Nesta primeira fase apenas audita.

Identifica o que será necessário posteriormente para:

* title;
* meta description;
* canonical;
* Open Graph;
* sitemap.xml;
* robots.txt;
* structured data;
* páginas públicas;
* URLs amigáveis;
* acessibilidade;
* performance.

Não priorizar SEO antes da arquitetura principal estar estabilizada.

---

# 19. LLMS.TXT

Verifica também a possibilidade de futuramente adicionar:

`/llms.txt`

O objetivo será fornecer uma descrição estruturada e pública do Konekta para sistemas de IA.

Não deve conter informações privadas.

Não tratar `llms.txt` como substituto de SEO, sitemap ou robots.txt.

---

# 20. RELATÓRIO DA FASE 0

No final da análise, NÃO alteres ainda grandes partes do projeto.

Entrega um relatório dividido em:

## A. ARQUITETURA ATUAL

Explica como o projeto está estruturado atualmente.

## B. PROBLEMAS

Classifica:

* crítico
* alto
* médio
* baixo

## C. GENERALIZAÇÃO DOS SERVIÇOS

Mostra exatamente quais partes da arquitetura atual estão presas ao modelo antigo de trabalhadores domésticos.

Explica como devem ser generalizadas.

## D. DESIGN SYSTEM

Lista todas as inconsistências encontradas em:

* cores
* fontes
* tamanhos
* botões
* inputs
* cards
* espaçamento
* radius
* sombras
* ícones
* componentes

## E. BACKEND

Mostra o que precisa mudar para suportar o novo modelo.

## F. FRONTEND

Mostra quais telas/componentes serão afetados.

## G. SEGURANÇA

Lista vulnerabilidades ou pontos suspeitos encontrados.

Corrige imediatamente apenas aquilo que for crítico e representar risco real.

## H. SEO

Lista o que será necessário posteriormente.

## I. PLANO DE IMPLEMENTAÇÃO

Divide o trabalho em fases pequenas e independentes.

A ordem preferencial é:

FASE 0
Auditoria e arquitetura

FASE 1
Design System

FASE 2
Generalização do modelo de serviços

FASE 3
Backend e database

FASE 4
Frontend e telas

FASE 5
Integração e testes

FASE 6
Auditoria de segurança

FASE 7
SEO, sitemap.xml, robots.txt e llms.txt

---

# REGRA FINAL

Não quero uma aplicação onde cada nova profissão precise de uma nova implementação.

Quero uma arquitetura em que:

"Adicionar uma nova profissão seja principalmente adicionar dados/configuração, e não escrever uma nova funcionalidade."

Também não quero uma aplicação onde cada tela tenha sua própria aparência.

Quero:

"Um único Design System utilizado por toda a aplicação."

O objetivo desta fase é transformar o Konekta numa plataforma **generalista, consistente, escalável, segura e preparada para crescer**, sem ficar presa à estrutura inicial criada para trabalhadores domésticos.

Primeiro analisa.

Depois apresenta o diagnóstico e o plano.

Só após essa análise começaremos a implementar cada fase individualmente.
Nb: muitas das tarefas que estão aqui, já estão em funcionamento tem outras que apenas tem que melhorar e tem outras por substituir algumas opções. então o pedido que deve ter em mente é (analisar se existe ou não, caso exista tratamentos são: dizer que já existe e recomendar melhoria, caso não exista você anuncia a melhoria)

e analise quando um user faz cadastro usando o google qual perfil será criado. 
se ele vai criar como cliente ou como profissional