# Como usar esta documentacao com agentes de IA

Esta pasta organiza a visao funcional e tecnica do Konekta para orientar agentes de IA, desenvolvedores e auditorias futuras.

O objetivo nao e pedir para um agente "melhorar tudo". O objetivo e trabalhar por modulos, com escopo claro, relatorio tecnico e implementacao controlada.

## Ordem recomendada

1. Ler `01-visao-geral.md`.
2. Ler `02-regras-de-negocio.md`.
3. Ler `03-arquitetura-modular.md`.
4. Ler o documento do modulo que sera trabalhado.
5. Ler `11-seguranca.md` e `12-qualidade-e-requisitos-nao-funcionais.md`.
6. Fazer auditoria antes de implementar.
7. Implementar apenas depois de apresentar conclusoes e plano.

## Prompt mestre para auditoria

Use este prompt quando quiser que um agente analise o projeto antes de alterar codigo:

```text
Leia a pasta docs/ e depois audite o modulo [NOME_DO_MODULO] no codigo atual.

Objetivo:
- verificar se o codigo atual cumpre a especificacao funcional;
- identificar complexidade desnecessaria;
- identificar riscos de seguranca;
- identificar problemas de performance e escalabilidade;
- identificar sinais de codigo pouco profissional, duplicado ou dificil de manter;
- recomendar melhorias com justificativa tecnica.

Regras:
- Nao implemente nada antes de apresentar o relatorio.
- Nao reescreva o projeto inteiro.
- Preserve funcionalidades que ja funcionam.
- Priorize simplicidade, fluxo leve e experiencia profissional.
- Quando houver duas solucoes possiveis, escolha a mais escalavel e explique por que.
```

## Prompt mestre para implementacao

Use este prompt depois de receber a auditoria:

```text
Com base na auditoria aprovada, implemente apenas as melhorias do modulo [NOME_DO_MODULO].

Regras:
- Trabalhe com escopo limitado ao modulo.
- Evite criar fluxos intermediarios desnecessarios.
- Evite duplicacao de codigo.
- Use tipagem forte.
- Valide permissao e ownership no backend ou nas regras do Supabase.
- Mantenha a interface simples, clara e profissional.
- Depois da implementacao, rode os testes/verificacoes possiveis e entregue um resumo do que mudou.
```

## Sequencia recomendada de desenvolvimento

1. Feed
2. Chat e mensagens
3. Notificacoes
4. Perfil
5. Conexoes e recomendacoes
6. Vagas e candidaturas
7. Seguranca
8. Admin
9. Performance e refatoracao final

## Principio central

O Konekta deve ser simples para o utilizador, mas profissional por dentro.

Simplicidade nao significa codigo improvisado. Significa reduzir passos, reduzir estados desnecessarios, remover processos intermediarios e manter cada fluxo direto.
