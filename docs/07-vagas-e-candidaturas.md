# Modulo Vagas e candidaturas

Vagas representam oportunidades publicadas por clientes. Candidaturas representam interesse dos profissionais nessas oportunidades.

## Objetivo

Permitir que clientes publiquem trabalhos e profissionais se candidatem de forma simples.

## Cliente

O cliente deve poder:

- criar vaga;
- editar vaga, se ainda estiver ativa;
- encerrar vaga;
- ver vagas ativas;
- ver vagas encerradas;
- ver candidaturas recebidas;
- aceitar ou rejeitar candidaturas.

## Profissional

O profissional deve poder:

- visualizar vagas no Feed ou aba Vagas;
- candidatar-se;
- acompanhar candidaturas pendentes;
- ver candidaturas aceites;
- ver candidaturas rejeitadas;
- ver candidaturas concluidas, se o fluxo existir.

## Estados de vaga

Estados recomendados:

- ativa;
- encerrada;
- cancelada, se necessario.

Evitar muitos estados se ainda nao houver necessidade real.

## Estados de candidatura

Estados recomendados:

- pendente;
- aceite;
- rejeitada;
- concluida, se aplicavel.

## Notificacoes

- Quando profissional se candidata, cliente recebe notificacao.
- Quando cliente aceita ou rejeita, profissional recebe notificacao.
- Ao clicar na notificacao, abrir vaga ou candidatura correspondente.

## Criterios de aceite

- Cliente diferencia claramente vagas ativas e encerradas.
- Profissional diferencia claramente pendentes, aceites e rejeitadas.
- Candidatura nao e confundida com simples contacto por chat.
- Estados sao simples e suficientes.
