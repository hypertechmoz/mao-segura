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
