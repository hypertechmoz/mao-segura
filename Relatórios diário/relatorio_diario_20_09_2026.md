# Relatório Diário - 20 de Setembro de 2026

## Resumo das Atividades
Neste período, o foco principal foi a implementação do sistema de **Recomendação Baseado na Localização GPS (Proximidade)** como motor padrão da aplicação e correção de espaçamentos no design da interface (especialmente na versão Web). O trabalho foi finalizado com o deploy para produção.

---

## 🛠 Funcionalidades Implementadas

### 1. Sistema de Feed por Proximidade (GPS Exato)
- **Base de Dados (PostGIS):** 
  - Criado script SQL (`20260916_location_feed.sql`) com três novas funções (RPCs) no Supabase: `get_nearby_workers_feed`, `get_nearby_jobs_feed` e `get_nearby_posts_feed`.
  - As funções calculam a distância matemática exata entre as coordenadas do utilizador e as coordenadas dos criadores dos posts/vagas.
- **Frontend (`home.js`):**
  - Integrado o `expo-location` para solicitar a permissão do GPS silenciosamente e obter a Latitude e Longitude atual do telemóvel/browser.
  - O feed agora consome os RPCs de proximidade, sendo o GPS a "fonte da verdade" padrão.
- **Fallback Automático:** Caso o GPS falhe ou o utilizador negue permissão, o sistema faz fallback elegante, filtrando o feed pela `cidade` do perfil.

### 2. Interface de Utilizador (UI) e Componentes
- **Apresentação de Distância Real:**
  - `WorkerCard.js`, `JobCard.js` e `PostCard.js` foram atualizados para apresentar a distância exata em quilómetros com o ícone de localização (ex: `< 1 km`, `17 km`) em vez da mensagem estática "Perto de si".
- **Seletor de Cidades (`CitySelector.js`):**
  - Adicionada a opção fixa **"Perto de mim (Localização atual)"**, permitindo aos utilizadores removerem qualquer filtro manual de cidade e voltarem ao algoritmo de GPS.
- **Perfis de Utilizador - Espaçamento:**
  - Corrigido o problema do espaçamento excessivo entre blocos de informação na visualização Web (Profile e Public Profile).
  - Forçado um espaçamento exato e uniforme de `2px` (`marginBottom: 2`, `marginTop: 2`) entre as "sections" de Informação, Experiência e Recomendações.

### 3. Deploy e Versionamento
- Executado e confirmado o commit das alterações (`fix: melhorias`) e "push" para o repositório GitHub.
- Compilada a build para ambiente Web e feito o Deploy com sucesso na cloud via **Firebase Hosting** (para o site `morstar-konekta` -> configurado com domínio `kwick.online`).

---

## 📌 Próximos Passos (Pendentes)
- **Envio de E-mails / SMTP:** Foi reportado o erro temporário de "Internal Server Error 500" na função de reenvio de OTP após a troca de nome na plataforma. O problema foi atenuado trocando a conta temporariamente, mas necessita de investigação definitiva futura.
- Acompanhar a performance das novas consultas SQL no Supabase à medida que os utilizadores fornecem as suas localizações.
