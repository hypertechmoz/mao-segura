# Modulo Chat e mensagens

O chat deve ser direto, rapido e central para fechar trabalhos.

## Objetivo

Permitir que cliente e profissional conversem sem criar processos desnecessarios.

## Fluxo recomendado de contacto

```text
Cliente abre Feed
Seleciona post profissional
Clica Contactar
App abre chat com profissional
Cliente escreve primeira mensagem
Conversa e criada
Mensagem e enviada
Profissional recebe notificacao
```

## Regra principal

A conversa nao deve ser criada apenas pelo clique em `Contactar`. Ela deve ser criada quando a primeira mensagem for enviada.

## Estados de conversa

Estados recomendados:

- existente;
- rascunho local antes da primeira mensagem;
- criada apos envio;
- arquivada, se futuramente necessario.

Evitar estados excessivos como:

- aguardando contacto;
- pedido criado;
- pedido aceite;
- pre-chat;
- conversa pendente.

## Mensagens

Cada mensagem deve ter:

- id;
- conversation_id;
- sender_id;
- receiver_id ou participantes derivados da conversa;
- texto ou tipo de conteudo;
- created_at;
- read_at, quando aplicavel.

## Notificacoes

Ao enviar uma mensagem:

- criar notificacao para o destinatario;
- atualizar contador de nao lidas;
- navegar para a conversa ao clicar na notificacao.

## Seguranca

- Apenas participantes da conversa podem ler mensagens.
- Apenas participantes da conversa podem enviar mensagens.
- O frontend nao deve decidir sozinho quem pode acessar uma conversa.
- Policies do Supabase ou backend devem validar permissao.

## Criterios de aceite

- Contactar abre chat sem criar lixo no banco.
- Primeira mensagem cria conversa automaticamente.
- Conversas existentes sao reutilizadas.
- Mensagens chegam ao destinatario.
- Notificacao de nova mensagem navega para a conversa correta.
