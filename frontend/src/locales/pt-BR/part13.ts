// Notes workspace and help, and the strings added or reworded after part12 (machine-translated from en); merged last, key by key.
export default {
  "aceGen": {
    "closeness": "Quão próximo do original",
    "closenessHigh": "Mais livre",
    "closenessHint": "Para a esquerda, o resultado mantém a melodia e o arranjo da fonte; para a direita, o modelo muda mais.",
    "closenessLow": "Mais próximo do original",
    "loraSimple": "LoRA",
    "loraTrain": "Treinar o seu próprio",
    "modelDefault": "{name} (padrão)",
    "refChoose": "Escolher um arquivo",
    "refDrop": "Solte o áudio aqui ou escolha-o na biblioteca",
    "refFromLibrary": "Da biblioteca",
    "refLoading": "Carregando a faixa…",
    "refNeeded": "Escolha uma faixa aqui ou volte à aba Música para uma música nova.",
    "refOff": "Use uma faixa pronta: um cover, um trecho refeito, uma parte retirada ou adicionada. Sem faixa, o formulário cria uma música nova.",
    "refRemove": "Remover"
  },
  "aiPart": {
    "guide": {
      "hears": [
        "As faixas marcadas são mixadas em uma única faixa estéreo: com os volumes das faixas, os fades e o ajuste de andamento (W), mas sem efeitos e ignorando os botões M e S.",
        "O andamento vem do campo BPM do projeto, não dos clipes: ajuste-o ao material. O tom vem de «Tom»; em «Auto», o modelo o encontra sozinho.",
        "O ACE-Step conhece só maior e menor. Para qualquer outra escala, o modelo recebe o tom mais próximo e o nome da escala na descrição: uma dica, não uma garantia.",
        "Faixas com variantes ainda à espera de escolha não são oferecidas: são rascunhos.",
        "O modelo não aceita um trecho de mais de 10 minutos: selecione um fragmento mais curto."
      ],
      "limits": [
        "«Adicionar uma parte» só funciona com o modelo base do ACE-Step (cerca de 4,8 GB). No app de desktop, é uma opção na instalação; se foi deixada de fora, o arranjador mostra um botão Instalar. Com os scripts, o setup_models mostra o comando para isso no final.",
        "O base é mais lento que o turbo: em uma RTX 4080, uma variante para uma faixa de 2–3 minutos leva cerca de 10 segundos, e a primeira execução demora mais enquanto o modelo carrega.",
        "O modelo respeita o tom e os acordes do que ouve melhor do que ideias rítmicas: «toca nas pausas do vocal» pode não funcionar.",
        "A qualidade do som é a que o modelo entrega. Não existe MIDI para áudio: o modelo trabalha só com áudio.",
        "Se o xl-base estiver instalado, ele aparece na lista de modelos; em uma placa de 16 GB ele ocupa quase toda a memória de vídeo. Para adicionar partes, use o base: nas medições, o xl-base devolveu ruído em cerca de uma variante em cinco, o base em uma em vinte e cinco.",
        "Descartar ruído custa tempo: quando uma variante é descartada, o pedido é enviado de novo e a geração demora mais. Bateria, percussão e efeitos não são verificados: são ruidosos por natureza."
      ],
      "variants": [
        {
          "term": "Ouvir",
          "text": "muda para esta variante, silencia as outras e toca desde o início do trecho."
        },
        {
          "term": "Manter",
          "text": "mantém a variante e remove as outras. Em um repaint, uma continuação ou um cover, a variante mantida substitui o original no trecho."
        },
        {
          "term": "Remover todas",
          "text": "remove todas as variantes e devolve as faixas como estavam."
        },
        {
          "term": "Cópia do contexto",
          "text": "marca uma variante em que o modelo devolveu quase a mesma mixagem que ouviu, em vez de uma parte nova. Gere de novo."
        },
        {
          "term": "Ruído",
          "text": "marca uma variante em que o modelo devolveu chiado em vez de uma parte. O arranjador descarta essas variantes sozinho e pede substitutas, até duas vezes; a marca fica só no que voltou depois das tentativas."
        },
        {
          "term": "Ctrl+Z",
          "text": "desfaz tanto a inserção das variantes quanto a escolha. Os arquivos das variantes descartadas só saem da biblioteca quando o projeto é salvo, e apenas se nenhum clipe os usar."
        }
      ]
    }
  },
  "covers": {
    "after": {
      "hintSa": "Depois da geração: uma capa para todos os takes. Ocupa a GPU por mais ~30 s."
    },
    "studio": {
      "errChanged": "A capa foi refeita nesse meio-tempo. Salve mais uma vez.",
      "errLoad": "Não foi possível carregar a imagem da capa. Tente de novo.",
      "errNoCover": "Esta faixa não tem capa para pôr a legenda.",
      "errSave": "Não foi possível salvar a legenda. Tente de novo."
    }
  },
  "create": {
    "failed": "Não deu certo. Clique em Repetir com estas configurações e depois em Criar de novo.",
    "madeAt": "às {time}",
    "menu": {
      "midi": "Notas para MIDI"
    },
    "notes": {
      "cardTitle": "Notas",
      "draw": "Desenhar",
      "drawNote": "«Desenhar» abre Notas à direita com um esqueleto a partir da letra: seções pelas marcas [Verse], [Chorus], um acorde provisório por compasso.",
      "emptyLead": "Sem notas, o YuE2 escreve a melodia sozinho. Com notas, ele canta a sua.",
      "emptyTitle": "Ainda sem notas",
      "fromSong": "De uma música",
      "fromSongDots": "De uma música…",
      "hasScore": "o formulário tem uma partitura",
      "importMidi": "Importar MIDI",
      "open": "Abrir notas",
      "openHere": "As notas estão abertas à direita.",
      "openNote": "As alterações nas notas vão direto para o formulário — clique em «{button}» e o YuE2 as usa.",
      "openSection": "Abrir esta seção em Notas",
      "openTakeTip": "A partitura deste take no espaço Notas — ouça, compare, edite e depois leve para o formulário, se quiser",
      "rail": "Notas",
      "railTip": "Notas do YuE2 — o editor de partitura à direita, no lugar da Sessão",
      "remarks": "{n} observação da verificação: {list} | {n} observações da verificação: {list}",
      "takeTitle": "{title} · Take {n}"
    },
    "rail": {
      "ace_step": "ACE",
      "generate": "Criar",
      "lora": "LoRA",
      "models": "Modelos",
      "stable_audio": "Som",
      "yue2": "YuE2"
    },
    "reuse": "Repetir com estas configurações",
    "reuseInForm": "Repetir com estas configurações"
  },
  "editor": {
    "clipInTrash": "Faixa na lixeira",
    "clipInTrashHint": "A faixa deste clipe está na lixeira da biblioteca: ela ainda toca, mas a lixeira a exclui de vez após 30 dias.",
    "guide": {
      "clip": [
        "Arrastar move um clipe, as bordas o cortam. A forma de onda não é espremida durante o corte: você vê exatamente o áudio que sobra. O arquivo de origem nunca muda.",
        "Os botões de um clipe ficam sobre a forma de onda e aparecem ao passar o mouse ou quando o clipe está selecionado; os que estão ligados ficam sempre visíveis. M silencia o clipe, S deixa só ele audível, W o ajusta ao andamento do projeto, o X o exclui.",
        "As alças das bordas definem os fades. Sem elas, cada borda recebe um microfade de 15 ms para que um corte não estale.",
        "Ferramentas no transporte: Selecionar (V) move e corta clipes, a Faca (C) corta um clipe onde você clica, a Borracha (E) remove o pedaço sobre o qual você arrasta, ou o clipe inteiro com um clique. A Faca e a Borracha se encaixam na grade e nas bordas dos clipes; Esc volta para Selecionar.",
        "S corta o clipe selecionado no cursor de reprodução, ou todos os clipes sob o cursor quando nada está selecionado. Ctrl+D coloca uma cópia logo depois do clipe.",
        "Os clipes são translúcidos: a grade da linha do tempo aparece através deles."
      ],
      "lane": [
        "Renomeie uma faixa direto no cabeçalho dela. M a silencia, S deixa só ela audível.",
        "Cor: selecione a faixa e clique em um ponto acima da lista de faixas.",
        "Uma faixa com uma música inteira pode ser separada em stems com o botão ao lado de M e S: vocais, bateria, baixo e outros a substituem.",
        "O X remove a faixa; Ctrl+Z a traz de volta.",
        "A altura da faixa é definida com o controle de setas no transporte ou com Alt e a roda do mouse: quanto mais alta a faixa, maior a forma de onda. Uma só altura para todas as faixas."
      ],
      "steps": [
        {
          "title": "Adicione faixas",
          "text": "O botão «Faixa» abre a biblioteca: adicione uma faixa inteira ou como stems. Um arquivo do seu computador pode ser solto direto em uma faixa."
        },
        {
          "title": "Arrume os clipes",
          "text": "Arraste os clipes e corte-os pelas bordas. A Faca (C) corta um clipe onde você clica, a Borracha (E) remove o pedaço sobre o qual você arrasta. Os fades se puxam das alças nas bordas do clipe."
        },
        {
          "title": "Ajuste o andamento",
          "text": "O campo BPM define o andamento do projeto, o botão W em um clipe o ajusta a esse andamento. «Ímã» liga o encaixe na grade, e o seletor «0:00 | 1 | 2» escolhe o que a régua e a grade contam: segundos ou compassos."
        },
        {
          "title": "Mixe",
          "text": "Volume e pan da faixa, oito efeitos em cada faixa e no master. O botão «Mixer» mostra o mixer."
        },
        {
          "title": "Salve",
          "text": "Não há salvamento automático: «Salvar» ou Ctrl+S. Se você sair da página com alterações não salvas, o editor avisa."
        },
        {
          "title": "Exporte",
          "text": "WAV ou MP3 para a biblioteca, ou stems com um projeto do Reaper ou DAWproject para finalizar na sua própria DAW."
        }
      ],
      "tempo": [
        "O andamento de um clipe é detectado quando ele é adicionado, a partir dos primeiros 30 segundos. O detector é simples e pode errar em material complexo.",
        "W estica o clipe até o BPM do projeto sem mudar o tom (a altura).",
        "Os clipes grudam nas bordas de outros clipes e no início da linha do tempo. «Ímã» acrescenta o encaixe na grade. O seletor «0:00 | 1 | 2» escolhe o que a grade e a régua contam: segundos, ou compassos e tempos do BPM do projeto (4/4). O passo da grade acompanha o zoom; as linhas nas marcas da régua são mais claras.",
        "«Loop» repete a região na régua: mova-a inteira ou arraste as bordas. A mesma região é a seleção para o arranjador de IA. Clique na régua para ir a um ponto."
      ]
    },
    "help": {
      "title": "Ajuda do editor"
    },
    "hotkeys": {
      "keys": [
        {
          "keys": "Space",
          "action": "Tocar e pausar"
        },
        {
          "keys": "S",
          "action": "Cortar um clipe no cursor de reprodução"
        },
        {
          "keys": "V / C / E",
          "action": "Ferramenta: selecionar, faca, borracha"
        },
        {
          "keys": "Del",
          "action": "Excluir o clipe selecionado"
        },
        {
          "keys": "Ctrl+D",
          "action": "Duplicar o clipe selecionado"
        },
        {
          "keys": "Ctrl+Z",
          "action": "Desfazer, até 30 passos"
        },
        {
          "keys": "Ctrl+Y / Ctrl+Shift+Z",
          "action": "Refazer"
        },
        {
          "keys": "Ctrl+S",
          "action": "Salvar o projeto"
        },
        {
          "keys": "Esc",
          "action": "Limpar a seleção e voltar à ferramenta Selecionar"
        },
        {
          "keys": "← →",
          "action": "Cursor de reprodução um passo da grade, quatro com Shift"
        },
        {
          "keys": "Home / End",
          "action": "Para o início ou para o fim"
        },
        {
          "keys": "+ / −",
          "action": "Zoom"
        },
        {
          "keys": "Tab",
          "action": "Próximo clipe, faixa ou alça"
        }
      ],
      "mouse": [
        {
          "keys": "Ctrl+roda",
          "action": "Zoom"
        },
        {
          "keys": "Alt+roda",
          "action": "Altura da faixa"
        },
        {
          "keys": "Clique com a faca",
          "action": "Cortar o clipe naquele ponto"
        },
        {
          "keys": "Arrastar a borracha",
          "action": "Remover aquele pedaço do clipe; um clique remove o clipe inteiro"
        },
        {
          "keys": "Shift+arrastar",
          "action": "Rolar a linha do tempo; o botão do meio também funciona"
        },
        {
          "keys": "Clique na régua",
          "action": "Ir para um ponto"
        },
        {
          "keys": "Arquivo sobre uma faixa",
          "action": "Adicionar um clipe do seu computador naquele ponto"
        }
      ]
    },
    "restoreFromTrash": "Restaurar da lixeira",
    "trashedSources": "Um clipe toca uma faixa da lixeira: {names}. A lixeira a exclui de vez após 30 dias. | {n} clipes tocam faixas da lixeira: {names}. A lixeira as exclui de vez após 30 dias."
  },
  "footer": {
    "muscriptorNote": "Transforma uma faixa ou um stem em MIDI. Os pesos são só para uso não comercial; veja o cartão do modelo.",
    "qwenNote": "O assistente de prompts: escreve o prompt a partir de uma ideia, títulos e descrições de capa.",
    "sa3Note": "Instrumentais e efeitos sonoros. Gratuito para uso pessoal e comercial abaixo de 1 milhão de USD de receita anual; acima disso é preciso uma licença empresarial.",
    "sdcppNote": "Executa o modelo de capas.",
    "sheetsageNote": "Escreve a melodia de uma faixa como partitura (Notas, «De uma música…»). Os pesos são só para uso não comercial; veja o cartão do modelo.",
    "zimageNote": "Desenha as capas. O codificador de texto dele, Qwen3-4B-Instruct, também é Apache-2.0."
  },
  "header": {
    "guide": {
      "map": {
        "ace": "Músicas rápidas e instrumentais a partir de uma descrição, tags e letra; com uma faixa de referência também um cover, um trecho refeito, uma parte adicionada ou extraída, uma continuação.",
        "sa3": "Instrumentais e efeitos sonoros a partir de uma descrição, rapidamente. No arranjador de IA do editor, ele refaz, continua e faz covers ouvindo o áudio ao redor do trecho.",
        "yue": "Escreve uma música inteira com vocais e pode construí-la em torno de uma melodia dada (a aba Melodia e o espaço Notas, com o SheetSage2). Também transforma uma faixa em MIDI."
      },
      "steps": [
        {
          "title": "Escolha um motor",
          "text": "Vá a Criar: os motores estão à esquerda, YuE2, ACE-Step e Stable Audio. Para uma primeira música com vocais, use o YuE2. Ele inicia no primeiro clique em Criar; a primeira inicialização leva alguns minutos."
        },
        {
          "title": "Descreva a música",
          "text": "Na aba Música, digite a letra e o estilo, ou escreva a ideia em uma frase na linha acima do formulário e o assistente preenche os campos. Escolha a duração e quantos takes."
        },
        {
          "title": "Escolha o melhor take",
          "text": "Os takes se enfileiram na lista da sessão ao lado do formulário (embaixo dele no celular). Tudo o que é criado é salvo na biblioteca automaticamente."
        },
        {
          "title": "Separe em stems",
          "text": "Vocais, bateria, baixo e outros com um clique: Separar em stems no menu de um take, a aba Stems e notas na biblioteca, ou direto no editor."
        },
        {
          "title": "Monte no editor",
          "text": "Distribua os stems nas faixas, adicione partes com o arranjador de IA, ajuste os efeitos."
        },
        {
          "title": "Exporte",
          "text": "Faça a mixagem em WAV ou MP3, ou exporte as faixas com um projeto do Reaper ou DAWproject."
        }
      ],
      "tips": [
        "Não sabe como descrever um estilo? Comece pela página inicial: descreva a música em uma frase, o assistente escreve o prompt e você o edita.",
        "Quase, mas não exatamente? Refazer uma seção costuma ser mais rápido do que gerar de novo.",
        "A faixa de referência para um cover ou uma nova parte pode vir direto da biblioteca.",
        "Cada seção tem seu próprio botão de ajuda; o editor também tem uma folha de atalhos separada.",
        "O editor não salva automaticamente: clique em Salvar antes de sair da página; se esquecer, o editor pergunta."
      ]
    },
    "helpSections": {
      "covers": {
        "text": "Uma capa é desenhada neste computador pelo modelo Z-Image Turbo. Marque Fazer uma capa sob o formulário e uma capa para todos os takes vem depois da música; ou faça-a depois com o botão no cartão de uma faixa na biblioteca, também para várias faixas selecionadas de uma vez. Design da capa muda a descrição da imagem e adiciona uma legenda com o título. O modelo de capas é instalado à parte: veja Modelos e configurações.",
        "title": "Capas"
      },
      "downloads": {
        "text": "Uma faixa é baixada como MP3 (320 kbit/s, com a capa e as tags, toca em qualquer lugar), FLAC (sem perdas, com a capa e as tags) ou WAV (a fonte para uma DAW, sem capa). Escolha o formato no menu Baixar de um take ou de uma faixa; ele fica memorizado e também pode ser definido em Modelos e configurações, Geral. O nome do artista vai para as tags.",
        "title": "Formatos de download"
      },
      "engines": {
        "text": "Três motores geram áudio, YuE2-3B, ACE-Step 1.5 e Stable Audio 3, e eles não cabem juntos em uma só GPU, então um roda por vez. Escolha um motor na página Criar: ele inicia quando você clica em Criar, e o que estava rodando para sozinho. A luz mostra o estado dele; a primeira inicialização pode levar alguns minutos enquanto o modelo carrega na memória de vídeo. O botão de status no cabeçalho mostra o que ocupa a GPU e pode descarregá-lo."
      },
      "library": {
        "text": "Toda faixa, seja gerada, enviada ou exportada do editor, vai para uma biblioteca única que todos os módulos podem usar, de modo que uma faixa feita por qualquer motor pode ser separada em stems, transcrita e mixada sem sair do app."
      },
      "notes": {
        "more": "Mais sobre as notas",
        "text": "Notas é o espaço de trabalho do YuE2: o botão Notas sob o YuE2 na barra lateral de Criar. Ele mostra e edita a melodia da música como partitura; a partitura pode vir de uma faixa pronta (De uma música…, SheetSage2) ou de um arquivo MIDI e vai para o formulário do YuE2, na aba Melodia.",
        "title": "Notas"
      },
      "trash": {
        "text": "As faixas excluídas vão para a lixeira da biblioteca e ficam lá por 30 dias: restaure-as de lá ou exclua-as de vez. Selecione várias faixas para movê-las para a lixeira de uma vez, marcá-las com tags, fazer capas ou dar nomes a elas. A biblioteca filtra por tags.",
        "title": "Lixeira e tags"
      }
    }
  },
  "home": {
    "allTracks": "Abrir a biblioteca"
  },
  "idea": {
    "languageAutoIdea": "Auto (pela ideia)",
    "writer": "Quem escreve a letra e o estilo:",
    "writerAce": "o próprio ACE-Step"
  },
  "libraryPage": {
    "filters": {
      "midi": "MIDI",
      "score": "Notas"
    },
    "filtersToggle": "Filtros",
    "openEditor": "Abrir no editor",
    "openEditorFailed": "Não foi possível abrir no editor: {error}",
    "openEditorHint": "Um novo projeto do editor com esta faixa em uma pista",
    "promptTitle": "A faixa não tem nome próprio: é mostrada uma linha da letra.",
    "score": {
      "download": "Baixar .abc",
      "failed": "Não foi possível carregar as notas: {error}",
      "hint": "A partitura ABC a partir da qual o YuE2 cantou esta faixa",
      "open": "Abrir em Notas",
      "openHint": "Uma cópia da partitura em Notas na página Criar; as notas do formulário continuam como estão",
      "title": "Notas"
    },
    "trash": {
      "loading": "Carregando…"
    },
    "usage": {
      "bulk": "{n} faixas são usadas em projetos do editor: {names}. Na lixeira elas ainda tocam, mas se você esvaziar a lixeira os clipes delas nos projetos desaparecem. Excluir?",
      "more": " (e mais {n})",
      "purge": "Excluir de vez? Usada em projetos do editor: {names}. Os clipes dela nos projetos vão desaparecer.",
      "single": "A faixa é usada no projeto do editor «{name}»{more}. Na lixeira ela ainda toca, mas se você esvaziar a lixeira o clipe no projeto desaparece. Excluir?"
    },
    "yueLicence": "YuE2: licença não comercial (CC BY-NC 4.0)",
    "yueLicenceHint": "As músicas do YuE2 não podem ser vendidas nem usadas comercialmente. Detalhes: Modelos e licenças."
  },
  "midiPanel": {
    "recognize": "Notas para MIDI"
  },
  "models": {
    "general": {
      "artist": "Nome do artista",
      "artistHint": "Gravado nas tags das faixas baixadas. O mesmo nome do rodapé.",
      "artistSave": "Salvar",
      "artistSaved": "Salvo",
      "autoCover": "Fazer uma capa depois da música",
      "autoCoverHint": "O valor inicial da caixa Fazer uma capa sob os formulários dos motores.",
      "autoCoverOff": "As capas estão desligadas ou o modelo delas não está instalado: veja Capas.",
      "formatHint": "O formato dos botões Baixar na sessão e na biblioteca. Um formato escolhido em um menu de download também fica memorizado aqui.",
      "languageHint": "A mesma escolha do botão de idioma no cabeçalho.",
      "nav": "Geral",
      "title": "Configurações gerais"
    },
    "showMore": "mais {n}, não baixados: {names} ▾"
  },
  "notesHelp": {
    "actions": {
      "checks": "Mostrar a verificação",
      "draw": "Abrir «Desenhar do zero»",
      "musicianOff": "Ocultar os algarismos romanos",
      "musicianOn": "Mostrar os algarismos romanos",
      "simple": "Abrir a visualização simples",
      "snapIsOn": "«No tom» está ligado",
      "snapOn": "Ligar «No tom»"
    },
    "fig": {
      "at": "andamento 95, 4/4",
      "barTime": "1 compasso ≈ 2,5 s",
      "beats": "4 tempos: um-dois-três-quatro",
      "brk": "intervalo",
      "chordsTitle": "Acordes sobre os compassos",
      "counter": "5 síl. · 6 notas",
      "fourBars": "4 compassos ≈ 10 s",
      "higher": "mais agudo",
      "inKey": "notas do tom",
      "ins": "Instrumento",
      "intro": "intro",
      "longer": "nota longa",
      "lower": "mais grave",
      "lyricsTags": "Marcas na letra",
      "melisma": "sustentada",
      "octaveNote": "uma voz masculina canta uma oitava abaixo das notas escritas",
      "offKey": "fora do tom",
      "partsRibbon": "Partes nas notas",
      "pause": "pausa",
      "picker": "Adequados",
      "shorter": "curta",
      "sing": "a voz canta",
      "snapped": "cai aqui",
      "sung": "cantada",
      "syllables": [
        "Vo",
        "cê",
        "é",
        "meu",
        "sol"
      ],
      "time": "tempo →",
      "vocal": "Vocal",
      "written": "escrita"
    },
    "firstTime": "Novo nas notas?",
    "open": "Ajuda das notas",
    "openTip": "Em palavras simples: como desenhar uma melodia e como o YuE2 a canta",
    "sections": {
      "checks": {
        "head": {
          "check": "O que diz",
          "fix": "O que fazer",
          "means": "O que significa"
        },
        "intro": "A verificação é a linha na parte de baixo de Notas: clique nela para abrir a lista. Amarelo quer dizer «vale conferir», verde que está tudo certo, cinza apenas uma nota. Quando a correção é óbvia, há um botão Corrigir; Mostrar seleciona as notas ou os compassos em questão. Ctrl+Z desfaz qualquer correção.",
        "rows": [
          {
            "check": "Sem tom ou andamento",
            "means": "O YuE2 não sabe em que tom nem com que rapidez cantar.",
            "fix": "Escolha-os nos chips no topo."
          },
          {
            "check": "Compassos sem acorde",
            "means": "O YuE2 está acostumado a um acorde em cada compasso.",
            "fix": "Pode apertar Corrigir sem medo: o acorde anterior passa para os compassos vazios."
          },
          {
            "check": "O vocal não tem notas",
            "means": "Não há melodia — o YuE2 vai inventar uma.",
            "fix": "Desenhe a melodia com o lápis ou use um dos inícios rápidos."
          },
          {
            "check": "Menos notas do que sílabas na letra",
            "means": "Bem menos notas do que sílabas: o YuE2 inventa o resto e pode se afastar das suas notas.",
            "fix": "Preencha com notas (na visualização simples, o botão «adicionar») ou use «De uma música…»."
          },
          {
            "check": "Notas acima ou abaixo da voz",
            "means": "É difícil para o cantor; o YuE2 pode forçar a voz ou trocar de oitava.",
            "fix": "Primeiro confira se a voz certa está escolhida, masculina ou feminina. Depois aperte Corrigir: a melodia sobe ou desce por oitavas até caber na extensão."
          },
          {
            "check": "As seções não correspondem à letra",
            "means": "Há mais ou menos partes nas notas do que marcas na letra: as linhas caem nos lugares errados.",
            "fix": "Corrigir adiciona as partes que faltam no final — depois confira a ordem. Remova as partes a mais você mesmo ou ajuste as marcas na letra."
          },
          {
            "check": "O instrumento toca junto com a voz",
            "means": "Uma nota, não um erro: normalmente o instrumento fica em silêncio enquanto a voz canta.",
            "fix": "Nada, se for intencional. Caso contrário, apague as notas do instrumento nesses compassos."
          },
          {
            "check": "O ABC está longo",
            "means": "Uma partitura muito longa ocupa boa parte do prompt do YuE2.",
            "fix": "Encurte a música ou remova notas de instrumento desnecessárias."
          }
        ],
        "tip": "Os itens verdes não precisam de nada. Sem nenhuma observação restante, você pode apertar Criar.",
        "title": "Verificação para o YuE2",
        "toc": "Verificação para o YuE2"
      },
      "chords": {
        "note": "O YuE2 só usa os acordes com o plano «Melodia e acordes». Com «Seguir uma melodia», o modelo escolhe o acompanhamento sozinho, e os seus acordes ficam apenas como referência para você.",
        "p": [
          "Um <b>acorde</b> é um conjunto de sons tocados juntos. O acompanhamento se apoia nele: violão, teclado, baixo. Os acordes ficam em uma fileira acima das notas, em geral um por compasso.",
          "Clique no acorde de um compasso (ou em um espaço vazio da fileira) para escolher outro. Os <b>adequados</b> vêm primeiro: acordes do seu tom, que o YuE2 segue melhor. Abaixo estão «Comuns no menor» ou «Comuns no maior» e «Mais», para experimentar. «Ouvir» toca o acorde, «Dois no compasso» divide o compasso em dois acordes.",
          "Não sabe o que escolher? Fique com o que «Desenhar do zero» coloca: uma progressão de quatro acordes já testada.",
          "<b>Para músicos</b> — o interruptor sob a grade mostra algarismos romanos nos acordes (I, IV, V, vi…): o grau do acorde no tom. É para quem conhece a teoria; os demais não precisam dele."
        ],
        "title": "Acordes",
        "toc": "Acordes"
      },
      "faq": {
        "items": [
          {
            "q": "Preciso saber ler partitura?",
            "a": "Não. Basta ouvir «mais agudo — mais grave» e «mais longo — mais curto». Ligue «No tom» e não haverá notas erradas."
          },
          {
            "q": "Por que a voz masculina canta mais grave do que o desenhado?",
            "a": "O YuE2 escreve as melodias masculinas uma oitava acima de onde são cantadas. Isso é normal; não é preciso baixar as notas."
          },
          {
            "q": "As notas ficam salvas em algum lugar?",
            "a": "Sim, são as notas do formulário: cada alteração vai direto para o formulário, e Ctrl+Z a desfaz. Não há salvamento separado — aperte Criar e o YuE2 as usa."
          },
          {
            "q": "Quanto tempo a música vai durar?",
            "a": "Tanto quanto os seus compassos. No andamento 95 em 4/4, um compasso dura cerca de 2,5 segundos: 16 compassos são cerca de 40 segundos, 64 compassos cerca de 2,7 minutos."
          },
          {
            "q": "Por que o YuE2 não cantou exatamente as minhas notas?",
            "a": "O modelo segue as notas de perto, mas não é um sintetizador: pode enfeitar a melodia, deslocar uma sílaba, cantar uma oitava abaixo. Se ficar muito diferente, veja a receita «A música não segue as notas»."
          },
          {
            "q": "Preciso desenhar bateria e baixo?",
            "a": "Não. Só a voz e, se quiser, uma linha de instrumento na intro e nos intervalos. O YuE2 toca o resto a partir do estilo."
          },
          {
            "q": "O que é o texto ABC lá embaixo?",
            "a": "As mesmas notas escritas em letras — é isso que o YuE2 recebe. O editor o escreve sozinho; edite-o à mão só se conhecer o formato."
          },
          {
            "q": "Como ouvir sem criar uma música?",
            "a": "Ouvir (Espaço) toca as notas em um piano. O Metrônomo marca os tempos, Repetir repete os compassos marcados."
          },
          {
            "q": "Posso pegar as notas de um take pronto?",
            "a": "Sim: «Abrir notas» em um take as abre como uma cópia. Edite, ouça e aperte «Para o formulário» para criar um novo take a partir delas."
          }
        ],
        "title": "Perguntas frequentes",
        "toc": "Perguntas frequentes"
      },
      "key": {
        "p": [
          "Um <b>tom</b> é um conjunto de sete sons que combinam entre si. Uma melodia feita com eles soa certa, enquanto um som fora do conjunto incomoda como uma nota errada.",
          "O <b>menor</b> soa mais triste e dramático, o <b>maior</b> mais claro e animado. A letra (C, D, A…) é o som em que o conjunto começa. De ouvido isso quase não importa; o que importa é se é confortável de cantar.",
          "As linhas da grade que pertencem ao tom ficam destacadas. Ligue <b>«No tom»</b> e o lápis não deixa colocar uma nota errada: ela cai na linha mais próxima que serve. É o jeito mais fácil de nunca desafinar. Precisa de uma nota fora do tom? Segure Shift.",
          "O tom se muda no chip Tom, no topo. Com «Mover também as notas e os acordes» ligado, a música inteira se desloca e soa mais aguda ou mais grave."
        ],
        "tempo": [
          "O <b>andamento</b> é o número de batidas por minuto (BPM). 70–90 é calmo, 95–120 médio, 130 ou mais rápido. O YuE2 toma o andamento das notas; um andamento no texto do estilo não tem efeito.",
          "O <b>compasso</b> (fórmula de compasso) diz quantos tempos há em cada compasso. 4/4 é quase todo o pop e o rock, 3/4 uma valsa, 6/8 um balanço, baladas. Na dúvida, fique com 4/4.",
          "A <b>duração</b> é quantos compassos a música tem. O áudio segue as notas: 8 compassos de 4/4 no andamento 95 são cerca de 20 segundos."
        ],
        "tempoTitle": "Andamento e compasso",
        "title": "Tom, andamento e compasso",
        "toc": "Tom e andamento"
      },
      "lanes": {
        "p": [
          "As notas têm duas vozes (linhas). O <b>Vocal</b> (notas rosa-arroxeadas) é o que o cantor canta. O <b>Instrumento</b> (verde-azulado) é uma linha melódica de um instrumento: a intro, os intervalos, o final.",
          "O lápis escreve na linha ativa — clique na outra para trocar. «Mudo» e «Só esta voz» só mudam o que você ouve aqui; não afetam a música.",
          "<b>Por que o instrumento costuma ficar em silêncio enquanto a voz canta.</b> É assim que as partituras do próprio YuE2 são feitas: o instrumento preenche os lugares sem voz. Se tocar por cima do canto, o YuE2 pode se confundir sobre o que cantar. A verificação aponta esses compassos — é uma nota, não um erro.",
          "Bateria, baixo e o acompanhamento não precisam ser desenhados: o YuE2 os toca sozinho a partir do estilo e dos acordes."
        ],
        "title": "Vocal e Instrumento",
        "toc": "Vocal e Instrumento",
        "voice": [
          "O interruptor Masculina / Feminina na linha Vocal define uma extensão confortável para o cantor. As notas fora dela ganham um contorno vermelho, e a verificação se oferece para trazê-las de volta. Se o estilo diz female ou female vocals, o interruptor se ajusta sozinho.",
          "<b>A voz masculina do YuE2 canta uma oitava abaixo das notas escritas.</b> Isso é normal: o YuE2 escreve as melodias assim também nas suas próprias partituras. Por isso uma melodia masculina parece aguda no editor — não a abaixe de propósito, ou o cantor cai para o grave.",
          "Ao importar MIDI, «Ajustar a oitava à voz» faz esse deslocamento por você."
        ],
        "voiceTitle": "Voz masculina ou feminina"
      },
      "parts": {
        "p": [
          "Uma música é feita de partes: intro, verso, pré-refrão, refrão, ponte, interlúdio, final. No editor elas formam a faixa colorida acima dos compassos.",
          "As partes estão ligadas às marcas na letra: [Verse] é um verso, [Chorus] um refrão, [Bridge] uma ponte e assim por diante. É assim que o YuE2 sabe quais linhas cantar em que lugar das notas. Por isso o número e a ordem das partes devem coincidir com as marcas na letra — a verificação vigia isso.",
          "Clicar em uma parte abre o menu dela: tipo, nome, «Repetir a seção» (um segundo refrão em um segundo), «Adicionar uma seção depois», «Mostrar a seção inteira», «Excluir com seus compassos». A borda de uma parte pode ser arrastada.",
          "<b>«Marcar as partes pela letra».</b> Depois de importar um MIDI, em geral não há partes. Se a letra tem marcas, o editor se oferece para marcar as notas por elas com um botão: os compassos são divididos pelas marcas da letra, em ordem."
        ],
        "tip": "Habitual para o YuE2: intro e ponte com 4–8 compassos, verso e refrão com 8–16.",
        "title": "Partes da música",
        "toc": "Partes da música"
      },
      "recipes": {
        "intro": "Desejos comuns e o que fazer em cada caso, passo a passo.",
        "items": [
          {
            "title": "Quero o refrão mais agudo",
            "steps": [
              "Mostre o refrão: clique na parte Refrão → «Mostrar a seção inteira».",
              "Com Selecionar, desenhe um quadro em volta das notas do refrão na linha Vocal.",
              "Aperte ↑: cada toque sobe um semitom. 3–5 semitons já se ouvem bem; Shift + ↑ salta uma oitava.",
              "Ou na visualização simples: os botões «Subir um grau da escala» em cada linha do refrão.",
              "Olhe a verificação: as notas não devem sair da extensão da voz."
            ]
          },
          {
            "title": "A música não segue as notas",
            "steps": [
              "Confira o plano na aba Melodia: deve ser «Seguir uma melodia» ou «Melodia e acordes», não «Sem plano».",
              "Abra a verificação. As causas comuns são «Menos notas do que sílabas» e «As seções não correspondem à letra».",
              "Uma nota por sílaba: na visualização simples, o contador de cada linha deve bater.",
              "Uma voz masculina canta uma oitava abaixo das notas escritas — compare o desenho da melodia, não a altura.",
              "Faça 2–3 takes: o modelo ainda improvisa um pouco, e um take costuma ficar mais próximo."
            ]
          },
          {
            "title": "A melodia está monótona",
            "steps": [
              "Suba o refrão 3–5 semitons acima do verso — é isso que o faz «decolar».",
              "Misture notas longas e curtas: algumas curtas e depois uma nota longa no fim da linha.",
              "Acrescente um salto: uma nota claramente mais aguda que as vizinhas, na palavra mais importante.",
              "Repita uma boa frase com Ctrl+C e Ctrl+V. A repetição deixa a melodia pegajosa.",
              "Termine a linha em uma nota do tom (uma linha destacada) — a frase soa então concluída."
            ]
          },
          {
            "title": "As palavras não cabem",
            "steps": [
              "Abra «Simples»: uma linha apertada mostra «faltam notas».",
              "Aperte «adicionar» — as notas mais longas são divididas.",
              "Ou divida você mesmo as notas longas com a ferramenta Dividir (C).",
              "Se a linha continuar apertada, dê mais espaço a ela: arraste a borda da parte ou use «Adicionar uma seção depois». Ou encurte a linha da letra."
            ]
          },
          {
            "title": "Quero a melodia de outra música",
            "steps": [
              "Tem um arquivo de áudio — «De uma música…»: o SheetSage2 transcreve a melodia e os acordes.",
              "Tem um MIDI — «Importar MIDI»: escolha a parte vocal como Vocal, ligue «Ajustar a oitava à voz» e informe o andamento real da música.",
              "Já é um take do YuE2 — «Abrir notas» no take e depois «Para o formulário».",
              "Depois da importação: «Marcar as partes pela letra» e depois a verificação.",
              "Suas palavras provavelmente cairão de outro jeito que no original — ajuste-as na visualização simples."
            ]
          }
        ],
        "title": "Receitas",
        "toc": "Receitas"
      },
      "roll": {
        "head": {
          "key": "Tecla",
          "what": "O que faz"
        },
        "keys": [
          {
            "key": "Space",
            "what": "Ouvir ou pausar"
          },
          {
            "key": "Home",
            "what": "Voltar ao início"
          },
          {
            "key": "B · V · E · C",
            "what": "Lápis · Selecionar · Borracha · Dividir"
          },
          {
            "key": "1 2 3 4 5",
            "what": "Duração de uma nova nota: 1/16, 1/8, 1/4, 1/2, inteira"
          },
          {
            "key": "6",
            "what": "Uma pausa em vez de uma nota"
          },
          {
            "key": "K",
            "what": "Ligar ou desligar «No tom»"
          },
          {
            "key": "L",
            "what": "Repetir os compassos marcados"
          },
          {
            "key": "F",
            "what": "Tela cheia"
          },
          {
            "key": "↑ ↓",
            "what": "Notas selecionadas um semitom acima ou abaixo"
          },
          {
            "key": "Shift + ↑ ↓",
            "what": "Notas selecionadas uma oitava acima ou abaixo"
          },
          {
            "key": "← →",
            "what": "Mover a seleção (ou o cursor) um passo da grade"
          },
          {
            "key": "Shift + ← →",
            "what": "Mover um compasso inteiro"
          },
          {
            "key": "Delete",
            "what": "Excluir a seleção"
          },
          {
            "key": "Ctrl + Z · Ctrl + Shift + Z",
            "what": "Desfazer · refazer"
          },
          {
            "key": "Ctrl + C · Ctrl + V",
            "what": "Copiar · colar no cursor"
          },
          {
            "key": "Ctrl + D",
            "what": "Duplicar a seleção"
          },
          {
            "key": "Ctrl + A",
            "what": "Selecionar todas as notas da linha"
          },
          {
            "key": "Esc",
            "what": "Limpar a seleção"
          },
          {
            "key": "Shift ao desenhar",
            "what": "Colocar uma nota fora do tom"
          },
          {
            "key": "Alt ao desenhar",
            "what": "Apagar"
          },
          {
            "key": "Ctrl + roda",
            "what": "Aumentar ou diminuir o zoom"
          },
          {
            "key": "Shift + roda",
            "what": "Rolar para os lados"
          }
        ],
        "keysHint": "Funcionam enquanto o foco está no editor de notas, não em um campo de texto.",
        "keysTitle": "Atalhos de teclado",
        "p": [
          "O piano roll é uma faixa que corre da esquerda para a direita, como o tempo. Cada barra nele é uma nota.",
          "<b>Mais alto na tela quer dizer um som mais agudo.</b> As teclas de piano à esquerda mostram qual é a nota.",
          "<b>Uma barra mais longa quer dizer um som mais longo.</b> O espaço vazio entre as notas é uma pausa: a voz fica em silêncio.",
          "Um <b>compasso</b> é o trecho entre as linhas verticais grossas; os números dos compassos ficam no alto. Em 4/4, um compasso tem quatro tempos — quatro passos que você poderia marcar com palmas. No andamento 95, um compasso dura cerca de 2,5 segundos, então 16 compassos são aproximadamente 40 segundos de música.",
          "A <b>grade</b> são as linhas finas dentro do compasso. As notas se encaixam nelas, e assim o ritmo sai regular. Uma grade mais fina permite colocar uma nota com mais precisão.",
          "O <b>cursor</b> é a linha vertical onde o Ouvir começa. Clique na régua de compassos para colocá-lo. Arraste ao longo da régua para marcar compassos para repetir."
        ],
        "title": "Como ler o piano roll",
        "toc": "Lendo o piano roll",
        "tools": [
          "<b>Lápis (B)</b> — um clique coloca uma nota da duração escolhida; arrastar para a direita a alonga.",
          "<b>Selecionar (V)</b> — clique em uma nota ou desenhe um quadro em volta de várias. As notas selecionadas podem ser arrastadas, movidas com as setas e redimensionadas pela borda direita.",
          "<b>Borracha (E)</b> — clique ou passe sobre as notas para removê-las. Segurar Alt transforma qualquer ferramenta em borracha.",
          "<b>Dividir (C)</b> — divide uma nota em duas ao longo da grade. Útil quando um som longo precisa carregar duas sílabas.",
          "<b>Duração</b> — o comprimento de uma nova nota: 1/4 é um tempo, 1/8 meio tempo, 1/2 dois tempos. «Pausa» desenha silêncio."
        ],
        "toolsTitle": "Ferramentas",
        "views": [
          "<b>Piano roll</b> — a visualização principal, onde você desenha e edita.",
          "<b>Partitura</b> — as mesmas notas como em um livro de música, para quem lê partitura: para ver e ouvir.",
          "<b>Simples</b> — a melodia como pontos sobre a letra; veja «Visualização simples»."
        ],
        "viewsTitle": "Três visualizações"
      },
      "simple": {
        "p": [
          "«Simples» é a visualização para quem acha o piano roll difícil. Cada linha da letra é um cartão: pontos ficam sobre as sílabas, e a linha entre eles mostra para onde vai a melodia — para cima ou para baixo.",
          "<b>Arraste um ponto para cima ou para baixo</b> (ou escolha-o e aperte ↑ ↓) para subir ou descer a nota. Com «No tom», o ponto só passa pelas notas do tom, nunca fora. Clicar em uma sílaba toca a nota dela.",
          "O <b>contador</b> «5 síl. · 5 notas» mostra se há notas suficientes para as palavras. O melhor é uma nota por sílaba.",
          "<b>«+1 cantada como melisma»</b> — mais notas do que sílabas: as extras são cantadas esticadas em uma só sílaba («é-é-éh»). Tudo bem, e muitas vezes fica lindo.",
          "<b>«Faltam notas — adicionar»</b> — mais sílabas do que notas. O botão «adicionar» divide as notas mais longas da linha para que cada sílaba tenha a sua.",
          "O ritmo, isto é, a duração das notas, não é alterado aqui — use o piano roll para isso. Os botões de uma linha a tocam e movem a linha inteira para cima ou para baixo."
        ],
        "title": "Visualização simples: a melodia sobre as palavras",
        "toc": "Visualização simples"
      },
      "start": {
        "also": [
          "<b>Tocar no piano</b> — no teclado da tela ou em um teclado MIDI: as notas são escritas uma após a outra a partir do cursor.",
          "<b>Colar ABC</b> — se a melodia já existe como ABC (menu Importar).",
          "<b>As notas de um take</b> — um take pronto do YuE2 tem «Abrir notas»: a partitura dele abre como uma cópia. Ouça e edite; o formulário não muda. «Para o formulário» leva essas notas para o formulário, «Fechar» volta às notas do formulário."
        ],
        "alsoTitle": "Mais maneiras",
        "intro": "Ainda sem notas? As três maneiras estão na tela vazia de Notas.",
        "sparse": "O YuE2 canta uma nota por sílaba. Se uma transcrição MIDI tem bem menos notas do que a letra tem sílabas (as transcrições automáticas costumam ter), o modelo precisa inventar o resto, e a música deixa de seguir as notas. A verificação avisa sobre isso. Preencha a melodia no piano roll ou na visualização simples — ou pegue as notas «De uma música…».",
        "sparseTitle": "Por que um MIDI «esparso» dá resultados fracos",
        "title": "Três inícios rápidos",
        "toc": "Três inícios rápidos",
        "ways": [
          {
            "title": "Desenhar do zero",
            "text": "Escolha um tom, um andamento e um compasso, e o editor monta um esqueleto a partir da letra: partes pelas marcas [Verse] e [Chorus], um número adequado de compassos e acordes provisórios. Só falta desenhar a melodia vocal com o lápis. O melhor caminho quando a melodia está na sua cabeça."
          },
          {
            "title": "De uma música…",
            "text": "Escolha um arquivo de áudio e o SheetSage2 transcreve a melodia, os acordes e as partes. Leva um ou dois minutos. Funciona melhor com uma faixa de vocal claro, sem coro nem ruído. Depois edite como quiser."
          },
          {
            "title": "Importar MIDI",
            "text": "Solte um arquivo .mid de uma DAW, de um app de notação ou de um site. No seletor, escolha qual parte vira o Vocal e qual o Instrumento; bateria e o resto são descartados, e dos acordes é tomada a nota mais aguda. «Ajustar a oitava à voz» desloca a melodia do jeito que o YuE2 a escreve. O campo de andamento: as transcrições costumam ser salvas em 120 BPM mesmo que a música seja mais rápida ou mais lenta — informe o andamento real e as notas caem onde soam."
          }
        ]
      },
      "what": {
        "head": {
          "name": "Plano",
          "text": "O que o YuE2 faz",
          "when": "Quando escolher"
        },
        "p": [
          "As notas são a melodia da música desenhada em barras: que som cantar, quando começar e por quanto tempo segurá-lo. Você não precisa saber ler partitura — basta ouvir qual som é mais agudo e qual é mais grave.",
          "<b>Sem notas</b>, o YuE2 inventa a melodia sozinho. Cada take é diferente, e não dá para saber de antemão como uma linha será cantada.",
          "<b>Com notas</b>, o YuE2 canta a sua melodia. Em nossos testes, o modelo acertou 98% das notas desenhadas, manteve as subidas e descidas da melodia e manteve a duração: quantos compassos você desenha, tanto ele canta.",
          "No formulário, as notas são guardadas como texto ABC — as mesmas notas escritas em letras. O editor o escreve para você; não é preciso mexer nele."
        ],
        "plans": [
          {
            "name": "Sem plano",
            "text": "Inventa a melodia e o acompanhamento sozinho e vai direto ao áudio.",
            "when": "Quando não há notas e você só quer ouvir ideias. Assim que o formulário tem notas, o app muda o plano para «Seguir uma melodia» sozinho."
          },
          {
            "name": "Seguir uma melodia",
            "text": "Canta a sua melodia e inventa o acompanhamento sozinho. Seus acordes não são usados.",
            "when": "Quase sempre, depois de desenhar a voz. A escolha mais segura."
          },
          {
            "name": "Melodia e acordes",
            "text": "Usa tanto a sua melodia quanto os seus acordes.",
            "when": "Quando você escolheu acordes e quer exatamente essa harmonia."
          }
        ],
        "plansIntro": "O plano é escolhido no formulário, na aba Melodia. Ele diz ao YuE2 o que fazer com as suas notas.",
        "plansTitle": "Os três planos de melodia",
        "title": "O que são as notas e por que o YuE2 precisa delas",
        "toc": "Por que notas"
      }
    },
    "title": "Ajuda das notas",
    "toc": "Conteúdo",
    "tocPick": "Seção da ajuda"
  },
  "player": {
    "mute": "Silenciar",
    "unmute": "Reativar o som",
    "volume": "Volume"
  },
  "sa3Gen": {
    "promptHint": "O inglês funciona melhor; o assistente Descrever traduz. Diga o gênero, os instrumentos, o clima e o andamento; para um som, a fonte dele, como ele acontece e o ambiente."
  },
  "score": {
    "checks": {
      "sparseVocal": "Menos notas do que sílabas na letra — o YuE2 vai inventar o resto",
      "sparseVocalSub": "{notes} notas, {syllables} sílabas. Melhor desenhar o resto da melodia ou usar «De uma música…»"
    },
    "lane": {
      "femaleAbbr": "Fem.",
      "insShort": "Instr.",
      "maleAbbr": "Masc.",
      "voiceFemale": "Voz: feminina",
      "voiceMale": "Voz: masculina"
    },
    "midi": {
      "fitOctave": "Ajustar a oitava à voz",
      "fitOctaveHint": "O YuE2 escreve uma melodia cerca de uma oitava acima de onde ela é cantada, enquanto uma transcrição MIDI tem a altura cantada. Toda a parte vocal se move por oitavas inteiras.",
      "markSections": "Marcar as partes pela letra",
      "movedDown": "O vocal foi movido {n} oitava para baixo. | O vocal foi movido {n} oitavas para baixo.",
      "movedUp": "O vocal foi movido {n} oitava para cima. | O vocal foi movido {n} oitavas para cima.",
      "noSections": "O MIDI não tem partes de música. Marcas da letra: {tags}.",
      "octaveDown": "−{n} oitava | −{n} oitavas",
      "octaveNone": "oitava como no arquivo",
      "octaveUp": "+{n} oitava | +{n} oitavas",
      "tempoFile": "do arquivo",
      "tempoHint": "O arquivo diz {bpm} BPM. As transcrições costumam ser salvas em 120, seja qual for o andamento da música: defina o andamento da música e as notas são colocadas conforme soam.",
      "tempoTrack": "da faixa «{title}»"
    },
    "overview": {
      "pickHint": "Abrir estes compassos em Notas"
    },
    "toolbar": {
      "musician": "Para músicos",
      "musicianTip": "Mostrar os graus dos acordes (I, IV, V…) — teoria musical para quem a conhece"
    },
    "workspace": {
      "backTip": "Voltar à sessão; as notas ficam no formulário",
      "copyBadge": "cópia do take",
      "copyBadgeTip": "Uma cópia das notas do take: o formulário não muda até «Para o formulário»",
      "copyLead": "Ouça e edite aqui — o formulário não muda até você clicar em «Para o formulário». «Fechar» volta às notas do formulário.",
      "copyTitle": "Notas do take «{title}»",
      "form": "Formulário",
      "formBadge": "notas do formulário",
      "formBadgeTip": "Estas são as notas do formulário: as alterações vão para o formulário na hora (Ctrl+Z as desfaz)",
      "label": "Notas",
      "replaceConfirm": "O formulário já tem outras notas. Substituí-las pelas notas deste take? (Ctrl+Z as traz de volta)",
      "title": "Notas",
      "toForm": "Para o formulário"
    }
  },
  "takeCompare": {
    "seed": "Seed {seed}"
  },
  "yueGen": {
    "abcScore": "Notas",
    "help": {
      "melody": {
        "sources": [
          "De uma música… — escolha um arquivo de áudio e o SheetSage2 anota a melodia e os acordes. Uma música com vocal claro funciona melhor.",
          "Importar MIDI — a parte mais aguda vira a melodia, os outros canais o acompanhamento e os acordes, e o tom é encontrado sozinho. Mantenha a melodia vocal em uma faixa separada.",
          "Piano — escolha uma duração e toque as teclas (embaixo, à esquerda do roll, ou em um teclado MIDI): as notas se seguem uma à outra.",
          "De uma faixa: Notas para MIDI no menu de um take, ou a aba Stems e notas na biblioteca, e depois Para uma partitura do YuE2. O vocal vira a melodia, o baixo e o resto o acompanhamento."
        ]
      }
    },
    "unloadSheetSage": "Liberar a placa de vídeo depois de extrair a melodia"
  }
}
