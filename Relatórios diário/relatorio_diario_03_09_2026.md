# Relatório Diário - Kwick (antigo Konekta) (03/09/2026)

## 1. Rebranding para "Kwick"
- Foi efetuada uma pesquisa e substituição massiva da palavra "Konekta" para **"Kwick"** em todos os ficheiros orientados ao utilizador.
- Todos os ecrãs, componentes, alertas e ficheiros públicos de SEO (`sitemap.xml`, `robots.txt`, `llms.txt`) já refletem a nova marca.
- **Nota técnica:** A palavra "Konekta" manteve-se intencionalmente em configurações críticas da base de dados (`firebase.json`, `supabase/config.toml`) para não quebrar a ligação aos serviços Cloud que ainda usam os IDs antigos.

## 2. Restauro e Otimização da Landing Page
- Restauraram-se os blocos principais visuais na página inicial que alternam entre claro e escuro.
- Reintroduziram-se os "Cartões Flutuantes" que mostram os exemplos de vagas e perfis profissionais.
- Os textos dos cartões foram adaptados para uma **plataforma de serviços generalista** (ex: Eletricista, Canalizador, Pintor, TI), abandonando o foco exclusivo em serviços domésticos.
- Reintroduziu-se a secção de "Depoimentos" dinâmicos.

## 3. Correção de Navegação
- Reparados os 4 botões de navegação no cabeçalho ("Como funciona", "Suporte", "Depoimentos", "Sobre nós").
- Os links passaram a executar corretamente o _scroll_ automático para as respetivas secções ou o redirecionamento para as páginas informativas dedicadas.

## 4. Correção Lógica das Candidaturas
- Corrigido o fluxo de **Aceitação de Candidaturas** (`NEW_APPLICATION`). 
- Anteriormente, ao aceitar um candidato, o sistema disparava erradamente um "Pedido de Conexão" na *Minha Rede*.
- **Novo Fluxo:** Quando um cliente clica em "Aceitar", o sistema aprova a candidatura, gera de imediato uma permissão de conversa (chat) e abre a janela de mensagens sem os obrigar a serem "conexões" (amigos) na plataforma. As lógicas de "Trabalho" e "Rede Profissional" estão agora corretamente separadas.

## 5. Tarefas Pendentes
- ⚠️ **Questão de Aproximação / Localização:** A funcionalidade de aproximação baseada em geolocalização e matching por zonas **ainda não foi resolvida**. Esta será uma prioridade para as próximas sessões de desenvolvimento.
