# Relatório Diário - Konekta (27/08/2026)

## 📋 Tarefas e Planeamento para as Próximas Sessões

Nesta sessão, recolhemos vários requisitos de melhoria a nível de UX/UI, Monetização (Plano Plus), Lógica de Localização e Histórico. Abaixo encontram-se as tarefas estruturadas que definem o nosso plano de ação:

### 1. Menu de Serviços e Categorias
- [ ] Popular a base de dados (tabela `specialties`) com 200+ serviços reais, organizados por categorias e subcategorias.
- [ ] Criar ecrã dedicado "Explorar Serviços" (com navegação clara entre Categorias Principais e Subcategorias).
- [ ] Adicionar botão "Serviços" de acesso rápido na Navbar/App.

### 2. Monetização e Limitações (Konekta Plus/Free)
- [ ] Criar sistema de Quotas na base de dados para limitar as Candidaturas de utilizadores Free.
- [ ] Limitar os uploads de imagens para contas Free nas mensagens/candidaturas.
- [ ] Alterar o Selo de Verificação para exigir subscrição Premium, mantendo o processo de verificação de documentos.
- [ ] Criar modais e avisos "Upgrade para Plus" quando o profissional bate no limite.

### 3. Localização, Distância e Proximidade
- [ ] Guardar as coordenadas de Latitude e Longitude do utilizador.
- [ ] Criar lógica SQL (Postgres) para cálculo de distâncias.
- [ ] Alterar feeds de recomendação e pesquisa para priorizar ou forçar *matching* com utilizadores da **mesma cidade/bairro**.
- [ ] Exibir etiqueta visual com a distância (ex: "A 2 km de ti") na UI.

### 4. Otimização da "Minha Rede"
- [ ] Alterar as sugestões de conexões na página "Minha Rede" para apenas recomendar Profissionais (ou Clientes) da mesma cidade.

### 5. Barra de Pesquisa (Search)
- [ ] Alterar o *placeholder* da barra de pesquisa de forma dinâmica: "Procurar Profissionais" (se Cliente) ou "Encontrar Vagas" (se Profissional).
- [ ] Criar nova vista unificada de Pesquisa com *Tabs*: Profissionais, Vagas e Posts, priorizando automaticamente os Profissionais para Clientes.

### 6. Títulos de Trabalho no Histórico (Sessão Anterior)
- [ ] Garantir que o `job_id` ou o título do serviço fica amarrado à Avaliação (Review) quando o contrato é fechado.
- [ ] Atualizar o ecrã do Histórico no Perfil do Cliente e do Profissional para mostrar o nome exato do serviço realizado junto às 5 estrelas.
