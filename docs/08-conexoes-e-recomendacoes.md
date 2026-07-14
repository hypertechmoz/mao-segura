# Modulo Conexoes e recomendacoes

Este modulo cria confianca profissional dentro do Konekta sem transformar a plataforma numa rede social pesada.

## Objetivo

Substituir logicas sociais genericas por relacoes simples e sinais claros de confianca.

O escopo deste modulo e:

- conexoes;
- recomendacoes por estrelas.

Nao faz parte do escopo:

- gostos em perfil;
- avaliacoes escritas obrigatorias.

Observacao:

Likes em posts continuam a existir no modulo Feed. O que nao existe e like/gosto de perfil.

## Conexoes

Conexoes representam relacoes profissionais entre dois utilizadores.

Estados possiveis:

- sem conexao;
- pedido enviado;
- pedido recebido;
- conectado;
- bloqueado, se aplicavel.

## Regras de conexao

- Um utilizador pode enviar pedido de conexao a outro.
- O destinatario pode aceitar ou recusar.
- Quando aceito, ambos aparecem como conectados.
- Conexoes devem aparecer na aba Minha Rede e no perfil.

## Recomendacoes

Recomendacoes sao sinais simples de confianca.

Como muitos utilizadores podem nao querer escrever textos, a recomendacao deve ser rapida:

```text
Selecionar estrelas
Confirmar recomendacao
Fim
```

## Regras de recomendacao

- Cliente pode recomendar profissional.
- A recomendacao deve usar estrelas, por exemplo de 1 a 5.
- Texto nao deve ser obrigatorio.
- A interface principal deve chamar isto de recomendacao, nao de avaliacao.
- O perfil deve mostrar principalmente a contagem de recomendacoes.
- Se a media de estrelas for exibida, deve aparecer de forma compacta e secundaria.
- Um cliente nao pode criar varias recomendacoes ativas para o mesmo profissional.
- A recomendacao pode ser removida pelo autor, se essa regra for aprovada.
- Admin deve poder moderar recomendacoes abusivas ou fraudulentas.

## Exibicao no perfil

Exemplo de exibicao simples:

```text
Conexoes: 42
Recomendacoes: 18
```

Opcionalmente:

```text
Recomendacoes: 18 | 4.7 estrelas
```

Evitar:

- lista longa de textos;
- formularios obrigatorios;
- perguntas detalhadas;
- varias categorias de avaliacao.

## Criterios de aceite

- Minha Rede usa conexoes.
- Perfis mostram estado de conexao.
- Recomendacoes funcionam por estrelas.
- Recomendacoes nao exigem texto.
- O perfil mostra contagem de recomendacoes.
- Nao ha funcionalidade de gostos/likes de perfil.
- Nao ha duplicacao de recomendacoes ativas do mesmo cliente para o mesmo profissional.
