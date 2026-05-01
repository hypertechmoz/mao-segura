# Trabalhe já

O **Trabalhe já** é uma plataforma móvel e web para aproximar **clientes** e **profissionais** em Moçambique: quem procura serviços caseiros encontra quem está perto; quem oferece trabalho encontra oportunidades. O projeto usa **Expo/React Native** para Android, iOS e Web a partir de uma única base de código.

---

## 🚀 Visão Geral para IAs e Desenvolvedores

Este README serve como o "mapa mental" do projeto. Foi desenhado para que qualquer desenvolvedor (humano ou inteligência artificial) consiga contextualizar o estado atual da arquitetura e funcionalidade.

### 🛠️ Stack Tecnológica
- **Core:** React Native + Expo (SDK 54) com motor **Hermes**.
- **Navegação:** `expo-router` (File-based routing v6).
- **Base de Dados & Auth:** Firebase (Authentication, Firestore, Storage).
- **Estado Global:** Zustand (Gerenciamento leve e reativo).
- **Internacionalização:** i18next (Suporte completo a Português e Inglês).
- **Estilização:** CSS Customizado / React Native StyleSheet (Design limpo e moderno).
- **Build/Deploy:** EAS (Expo Application Services).

---

## 🏗️ Arquitetura do Projeto

```
/mobile
  ├── app/                  # Rotas (Tabs, Auth, Job, Chat, Post, etc.) - expo-router
  ├── assets/               # Imagens, logotipos e splash screens
  ├── components/           # Componentes UI reutilizáveis (PostCard, etc.)
  ├── hooks/                # Hooks personalizados (Notifications, Auth, etc.)
  ├── locales/              # Ficheiros de tradução JSON (PT/EN)
  ├── services/             # Integrações (Firebase, Notificações, Storage)
  ├── store/                # Estados Zustand (authStore)
  ├── utils/                # Helpers (Datas, validações, profileUtils)
  ├── app.json              # Configurações nativas (Permissões Android/iOS)
  └── eas.json              # Configurações de Compilação na Nuvem
```

---

## ✅ O que já foi implementado (Estado Atual)

A aplicação encontra-se num estado de **Build Final de Preview**, com as seguintes funcionalidades totalmente operacionais:

1.  **Autenticação Robusta:** Registo e Login via Email/Password com distinção de perfis (Trabalhador vs Empregador).
2.  **Gestão de Perfis:** Edição de dados, biografia, seleção de avatares e upload de fotografias reais para o Firebase Storage.
3.  **Mural de Vagas (Jobs):**
    *   Criação de vagas de emprego (Empregadores).
    *   Candidatura a vagas (Trabalhadores).
    *   Filtros de localização automática baseados no perfil do utilizador.
4.  **Feed Comunitário:** Sistema de "Posts" onde utilizadores podem partilhar a sua disponibilidade ou atualizações com suporte a imagem e texto.
5.  **Chat em Tempo Real:** Sistema de mensagens diretas entre candidatos e empregadores via Firestore Listeners.
6.  **Notificações Inteligentes:**
    *   Marcação de mensagens não lidas.
    *   Navegação direta da notificação para a conversa ou vaga correspondente.
7.  **Multilingue:** Sistema `i18n` implementado em toda a interface.
8.  **Deploy Nativo:** Configurado para **EAS Build**. Já gera ficheiros `.apk` para Android com permissões de câmara, galeria e notificações devidamente declaradas.

---

## 🛠️ Como rodar o projeto

1.  **Instalação:** `npm install`
2.  **Ambiente:** Cria um ficheiro `.env` com as chaves do Firebase (API Key, Project ID, etc.).
3.  **Desenvolvimento:** `npx expo start`
4.  **Build Mobile:** `npx eas-cli build -p android --profile preview`

---

## 🌍 Missão Social
O Trabalhe já foca-se em ligar oferta e procura de trabalho informal e técnico, com perfis, avaliações e histórico transparente para quem contrata e para quem presta o serviço.

---
**Status:** Pronta para Deploy / Testes de Usuário Real.
**Desenvolvedores:** Equipa HyperTech
