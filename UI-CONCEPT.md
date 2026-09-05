# PermaFrost — briefing conceitual para uma nova UI

Este documento não descreve a interface atual. Ele descreve **o produto**, para
que qualquer interface nova possa ser desenhada do zero sem perder o que
importa.

Se você só ler uma seção, leia "Os quatro invioláveis".

---

## 1. A ideia central

**O artefato não pode mentir.**

Tudo decorre disso. PermaFrost não é um explorador de blocos bonito nem um
dashboard de DeFi. É um objeto que um projeto coloca no próprio site e que
**ele mesmo não consegue editar**.

O que existe hoje no mercado: um projeto trava a liquidez e prova com um print
de tela. Print se falsifica em trinta segundos, e continua convincente meses
depois do lock ter vencido. A prova é estática; a verdade não é.

O selo do PermaFrost lê a chain a cada carregamento. Se o prazo vence, ele muda
sozinho — em todos os sites que o embutiram, sem ninguém tocar em nada.

---

## 2. Os três artefatos

O erro mais comum ao desenhar para este projeto é tratar o site como o produto.

| Artefato | Onde vive | Quem vê | O que é |
|---|---|---|---|
| **O lock** | Na blockchain Sui | Ninguém diretamente | A verdade |
| **O selo** | No site **dos outros** | Todo visitante daquele site | **O produto** |
| **O verificador** | permafrost.epochsui.com | Quem foi conferir | O cartório |

O selo é o produto. O verificador é a página de destino do selo. O lock é a
fonte.

**Consequência de design:** o selo é hóspede na página de outra pessoa. Não
pode travar a rolagem dela, não pode destoar da marca dela, não pode falhar
barulhento quando a rede pisca. O site pode ser ousado; o selo precisa ser
bem-educado.

---

## 3. Dois públicos que querem coisas opostas

### Quem trava (o cliente)
Quer **provar**. Chega com carteira. Escolhe um ativo, define uma data, assina,
copia o selo. É uma tarefa com começo e fim, e ele só volta se precisar
estender ou resgatar.

Jornada: `conectar → escolher → datar → assinar → copiar o selo`

### Quem verifica (o volume)
Quer **checar**. Chega sem carteira, quase sempre vindo de um clique no selo no
site de terceiros. Quer uma resposta em segundos. Não sabe o que é object id,
não sabe ler Move, e não vai instalar nada.

Jornada: `chegar → entender o veredito → conferir se quiser → ir embora`

**Hoje os dois compartilham a mesma home, e ela atende melhor o primeiro.** O
segundo é o volume: cada projeto que embute o selo manda visitantes. Separar
essas jornadas é provavelmente o maior ganho disponível.

---

## 4. O sistema de gelo — o estado visual É o dado

Este é o melhor ativo do projeto.

| Estado | O que significa |
|---|---|
| Bloco sólido | Travado, prazo correndo |
| Derretendo, pingando | Vesting liberando — o derretimento **é** a fração liberada |
| Linha de geada tracejada | Tempo decorrido, quando nada foi liberado ainda |
| Rachado | A data venceu, o beneficiário pode sacar |
| Poça | Tudo foi resgatado |
| Âmbar, "but empty" | Lock real com saldo zero |

A geometria é calculada, não ilustrada:

```
superfície do gelo:  y = 40 + 34 × fração_derretida
sistema de coordenadas: viewBox 86 × 88
silhueta: M22,40 L64,40 L68,74 L18,74 Z   (topo 40, base 74)
```

A regra que sustenta tudo: **o componente não aceita legenda nem texto livre.**
Ele só sabe desenhar o que a chain devolveu. É isso que impede quem embute de
fazê-lo afirmar algo falso.

A linha de geada existe por um caso específico: um cofre com cliff de 100% não
libera nada até o dia em que libera tudo. Sem essa linha, o bloco ficaria
visualmente parado por meses e leria como quebrado.

**Se a UI nova mantiver uma única coisa, mantenha este sistema.** A estética ao
redor é livre; a ligação entre estado e dado não é.

---

## 5. As restrições do terreno

Não são preferências. São o chão.

**Um arquivo HTML por nome.** O contrato guarda um `blob_id` por nome `.epoch`.
Sem rotas de servidor, sem code splitting, sem assets ao lado. Views trocam por
query string. Hoje: app ~200 KB, selo ~53 KB.

**Sem backend.** Cada número na tela veio do navegador do visitante falando com
a Sui via GraphQL. Isso é restrição *e* argumento de venda.

**O selo carrega uma vez por visitante do site alheio.** Por isso existe cache,
dedupe, limitador de concorrência e circuit breaker. Um selo que estoura o rate
limit e mostra erro na home do cliente é um selo removido.

**Animações só em `transform` e `opacity`**, e `prefers-reduced-motion` congela
tudo. O selo roda dentro de um iframe na página de terceiros; qualquer coisa
que force recálculo de layout trava a rolagem deles.

**Toda leitura passa por GraphQL.** O JSON-RPC dos fullnodes públicos foi
desativado.

---

## 6. Os quatro invioláveis

Aprendi cada um destes errando. Uma UI nova pode mudar tudo, menos isto.

### 6.1 A imagem nunca discorda do número
Ambos saem dos mesmos dados, no mesmo instante, contra o mesmo relógio.

*O erro que ensinou:* contagens regressivas usavam `Date.now()` enquanto o
estado vinha do relógio da chain. Um visitante com relógio adiantado via o selo
dizer "locked" acima de um contador dizendo "unlocked".

### 6.2 O valor sempre é declarado
Um zero não dito é uma afirmação falsa.

*O erro que ensinou:* o saldo da moeda travada estava no objeto e nunca era
lido. Dois dos três locks de teste tinham saldo **zero** e apareciam idênticos
a um com 1,27 bilhão de unidades — mesmo cadeado, mesma data confiante. Hoje um
lock vazio se denuncia em âmbar e diz "Locked — but empty".

### 6.3 Identificadores inteiros
Nada de `0x474b…8d1d` num produto cuja função é permitir conferência. Endereço
truncado é algo que o leitor tem que aceitar na fé — o oposto da proposta.

### 6.4 Tudo é link de verdade
Cards, resultados, navegação: âncoras com `href`, não botões. Um produto que diz
"confira você mesmo" e não deixa copiar um endereço, abrir em nova aba ou
compartilhar se contradiz.

---

## 7. O que está livre

Praticamente tudo o mais: estética, tipografia, paleta, layout, movimento,
arquitetura de informação, número de telas, se a morsa existe, como as duas
jornadas se separam.

O visual atual ("Arctic Chaos", recorte de revista) foi escolha de uma sessão,
não exigência do produto.

**E ele tem uma tensão real:** o produto vende confiança, e estética de bilhete
de resgate comunica subversão. No site isso diferencia de todo dashboard DeFi
clínico. No selo, um projeto sério pode hesitar antes de pôr magenta e amarelo
na própria landing page. Vale considerar que o selo tenha uma variante sóbria
enquanto o site mantém personalidade.

---

## 8. Os problemas de design ainda abertos

1. **A home não enuncia o problema.** Vai direto para a ferramenta. Quem não
   sabe o que é lock de liquidez não descobre ali.

2. **O ativo mais forte está enterrado.** O contraste entre um selo cheio e um
   vazio explica o produto inteiro numa imagem, e hoje só aparece se a pessoa
   caçar.

3. **Os dois públicos brigam pela mesma tela.**

4. **O selo tem uma personalidade só.**

5. **Não há estado de "projeto"**, só de lock individual. Um projeto com cinco
   LPs travadas precisa de cinco selos.

---

## 9. Inventário do que existe hoje

### Telas
```
/                    verificador (busca + vitrine ao vivo)
/?id=<id>            um lock específico
/?q=<termo>          lista de resultados
/?view=new           criar lock (seletor de objetos da carteira)
/?view=deploy        publicar blob num nome .epoch
/?view=guide         passo a passo
```

### O que a busca aceita
```
permafrost.epoch          nome — resolve pelo registro on-chain
0x474bfe…                 endereço — tudo que essa parte travou
0xee7200…                 id de lock ou cofre
0x2::sui::SUI  ou  SUI    tipo de moeda ou ticker
```

### Escrita on-chain
```
criar lock       object_lock::lock
estender prazo   object_lock::extend      (só adiante, nunca para trás)
resgatar objeto  object_lock::claim
resgatar vesting vesting::claim / claim_multi
apontar nome     walrus_names::update_blob
```

### Selo
```
pill  260 × 48
card  300 × 96
estados: congelado · destravado · resgatado · vazio
        + carregando · erro · não encontrado
```

### Dados reais para mockup (mainnet, não invente outros)
```
1.275,9677 CCTOO   object lock   ainda congelado
1.230.000 EPT      vesting vault ainda congelado
11.000 HIPPO       vesting vault ainda congelado
0 bnUSD            object lock   VAZIO — o contra-exemplo
```

---

## 10. Checklist para avaliar qualquer proposta nova

- [ ] O visitante entende o problema antes de ver a ferramenta?
- [ ] O veredito é legível em 3 segundos, sem saber nada de cripto?
- [ ] O valor travado aparece em todo lugar onde o cadeado aparece?
- [ ] Um lock vazio é visivelmente diferente de um cheio?
- [ ] Os endereços aparecem inteiros e clicáveis?
- [ ] Tudo que é destino tem `href`?
- [ ] O selo cabe em ~50 KB e não estraga a página de quem embute?
- [ ] A imagem é derivada do dado, sem legenda editável?
- [ ] Funciona com `prefers-reduced-motion`?
- [ ] Cabe num único arquivo HTML?

---

## Uma última coisa

O argumento de venda mais forte do produto não é o cadeado. É o **contra-exemplo**:
o mesmo sistema que prova também expõe quando não há nada por baixo.

Qualquer UI nova que colocar isso na frente, em vez de escondê-lo, vai
comunicar melhor do que a atual.
