// Strings added after the first translation (machine-translated from en, 743 keys);
// merged into the other parts key by key (see ../mergeParts).
export default {
  "aceGen": {
    "addLora": "Adicionar o LoRA",
    "cfgIntervalOrder": "A orientação «de» deve ser menor que «até».",
    "lengthAskedNote": "A duração vai para o modelo como um desejo. Clique de novo na escolhida para deixar com o modelo.",
    "lengthByModelNote": "A partir de uma descrição, o modelo escolhe a duração. Escolha uma aqui para pedir a sua.",
    "loraName": "Nome do LoRA",
    "loraPath": "Pasta do adaptador LoRA",
    "manual": {
      "adg": "Orientação adaptativa (ADG)",
      "balancedOnly": "no modo Equilibrado",
      "baseOnly": "somente modelos base e SFT",
      "bpm": "Andamento",
      "cfgEnd": "Orientação até (parte do caminho)",
      "cfgStart": "Orientação desde (parte do caminho)",
      "cotCaption": "Ampliar a descrição",
      "cotCaptionHint": "Ligado: o modelo de linguagem pode reescrever seu texto de estilo antes de a música ser feita.",
      "cotLanguage": "Detectar o idioma",
      "cotLanguagePicked": "desligado: o idioma escolhido é mantido",
      "coverNoise": "Ruído misturado à fonte",
      "coverRepaintOnly": "para um cover ou uma repintura",
      "infer": "Método de decodificação",
      "latentCrossfade": "Emenda dentro do modelo",
      "length": "Duração",
      "lmCfg": "Proximidade do prompt",
      "lmNegative": "O que evitar",
      "lmSub": "escreve o plano da música e completa o que falta",
      "lmTitle": "Modelo de linguagem",
      "loraScale": "Intensidade do LoRA",
      "metaByModel": "o modelo escolhe a partir da descrição",
      "musicSub": "o que se sabe da música de antemão",
      "musicTitle": "Música",
      "myLoras": "Meus LoRAs: {n}",
      "needRef": "com uma faixa de referência",
      "noLm": "O ACE-Step não o carrega nesta GPU",
      "noLmWithRef": "não é usado com uma faixa de referência",
      "ode": "ODE: repete exatamente",
      "off": "desligado",
      "pickLora": "escolha um LoRA antes",
      "refSub": "cover e repintura",
      "refTitle": "Faixa de referência",
      "repaintMode": "Modo de repintura",
      "repaintModes": {
        "aggressive": "Ousado",
        "balanced": "Equilibrado",
        "conservative": "Cuidadoso"
      },
      "repaintOnly": "para repintar um trecho",
      "repaintStrength": "Intensidade da repintura",
      "resultSub": "como entregar",
      "sde": "SDE: com aleatoriedade",
      "sdeBaseWarn": "Em um modelo base, o SDE deu ruído em vez de música num teste (32 passos). No Turbo funciona, com um som mais escuro.",
      "shift": "Deslocamento do cronograma",
      "thinking": "Primeiro um plano (thinking)",
      "tiled": "Decodificar em blocos",
      "turboSteps": "O Turbo aceita de 1 a 8 passos: mais que isso é cortado para 8",
      "wavCrossfade": "Emenda no áudio"
    },
    "modeDescribe": "A partir de uma descrição",
    "modeLabel": "Por onde começar",
    "modeOwn": "Letra e estilo próprios",
    "modelNote": "O Turbo usa 8 passos. Os outros modelos demoram mais; tirar ou adicionar uma parte não funciona em todos, e as tarefas que um modelo não faz ficam esmaecidas na aba De uma faixa.",
    "noLmBaseNote": "Base e SFT dependem desse modelo para vocais limpos: neste modo a voz pode soar ruidosa e distante. Para vocais, mude para Letra e estilo próprios e escreva a letra, ou escolha o Turbo.",
    "noLmNote": "Nesta placa de vídeo (8 GB ou menos) o ACE-Step não carrega seu modelo de linguagem, então sua descrição vai para o modelo como um simples prompt de estilo, sem letra escrita.",
    "noVocal": "Sem vocal",
    "noVocalHint": "Um instrumental: não precisa de letra, o estilo abaixo define a música.",
    "queuedStatus": "Na fila, takes: {n}",
    "refFile": "Arquivo de áudio de referência",
    "refOff": "Ligue para trabalhar a partir de uma faixa pronta: um cover, um trecho refeito, uma parte removida ou adicionada.",
    "removeLoraConfirm": "Remover?",
    "removeLoraNamed": "Remover o LoRA {name}",
    "repaintOrder": "O fim do trecho deve vir depois do início.",
    "simple": {
      "auto": "auto",
      "fast": "rápido {n}",
      "formatHint": "O mp3 ocupa menos espaço; wav e flac mantêm o som sem perdas.",
      "key": "Modo",
      "keyHint": "Maior soa mais brilhante, menor mais escuro e triste. A tônica e outras escalas são escolhidas em Manual.",
      "keyWish": "A partir de uma descrição, o modelo escolhe o tom. Um modo escolhido aqui vai para ele como um desejo.",
      "lengthHint": "Quanto tempo dura a faixa.",
      "lengthWish": "A partir de uma descrição, o modelo escolhe a duração. Uma escolhida aqui vai para ele como um desejo, não uma garantia.",
      "major": "maior",
      "medium": "médio {n}",
      "minor": "menor",
      "slow": "lento {n}",
      "tempo": "Andamento",
      "tempoHint": "Batidas por minuto. «Auto» deixa com o modelo; um número exato é definido em Manual.",
      "tempoWish": "A partir de uma descrição, o modelo escolhe o andamento. Um escolhido aqui vai para ele como um desejo."
    },
    "tabChanged": "alterado",
    "tabs": {
      "ref": "De uma faixa",
      "song": "Música",
      "tuning": "Ajustes"
    },
    "taskType": "O que fazer com a faixa",
    "taskUnsupported": "Não compatível com este modelo",
    "help": {
      "style": {
        "tips": [
          "O ideal são 5–9 tags: com menos, o modelo preenche as lacunas por conta própria e o resultado fica menos previsível; com mais, as tags começam a brigar entre si.",
          "Coloque primeiro o gênero e o clima: eles moldam o caráter geral da faixa mais do que as outras tags.",
          "Não misture tags contraditórias numa mesma categoria (por ex. «agressivo» e «sonhador» ao mesmo tempo): o modelo vai ignorar uma ou o resultado vai ficar confuso.",
          "É melhor escrever as tags em inglês: os dados de treino são em sua maioria em inglês, então a precisão é maior, mesmo que a letra seja em russo.",
          "Um andamento definido em Ajustes (em Simples, ou como número exato em Manual) é mais confiável do que uma tag de texto como «120 bpm» no estilo: use-o quando o andamento importar."
        ]
      },
      "lyrics": {
        "tips": [
          "Combine com a duração da faixa: cerca de 2 minutos costumam bastar para 2 estrofes + 2 refrões; para 3+ minutos, adicione uma ponte e um segundo gancho. Um texto longo demais para uma duração curta será «espremido» pelo modelo.",
          "Versos curtos (5–10 sílabas) se encaixam na melodia de forma mais previsível do que os longos: se um verso ficar longo, divida em dois.",
          "Um refrão que se repete (texto idêntico palavra por palavra em cada [Chorus]) ajuda o modelo a manter a mesma melodia nele ao longo da faixa.",
          "Para uma faixa totalmente instrumental, marque «Sem vocal» em vez de escrever uma letra que seja só [Interlude]: é mais confiável.",
          "A pontuação (vírgulas, reticências) afeta o fraseado e as pausas do vocal: use-a de propósito, não só pelas regras de ortografia."
        ]
      },
      "remix": {
        "unavailable": "O conjunto de cenários disponíveis depende do modelo escolhido: as opções não compatíveis ficam esmaecidas no formulário. Tente outro modelo (na aba Música ou em Ajustes) se precisar de um cenário específico. Envie o arquivo de referência num formato do qual o modelo consiga extrair áudio (wav/mp3/flac): arquivos muito longos (vários minutos) podem aumentar bastante o tempo de processamento."
      },
      "advanced": {
        "title": "Ajustes",
        "rows": [
          {
            "param": "Simples e Manual",
            "what": "Simples tem poucas escolhas claras: passos de decodificação (não no Turbo), duração, andamento (lento 80, médio 110, rápido 140), modo (maior ou menor) e formato. Manual tem todos os parâmetros em grupos, e o console mostra todos de uma vez."
          },
          {
            "param": "Formato",
            "what": "O formato do arquivo de saída. O mp3 é mais compacto e basta para ouvir; wav e flac não têm perdas, mas são de 5 a 10 vezes maiores."
          },
          {
            "param": "Andamento, tom, fórmula de compasso",
            "what": "Parâmetros musicais explícitos. Deixados em auto, o modelo os tira do texto de estilo; defina-os à mão só quando a precisão importar (para misturar com outras faixas, por exemplo). A fórmula de compasso é 2/4, 3/4, 4/4 ou 6/8. A partir de uma descrição, o modelo os escolhe sozinho: um andamento ou tom definido aqui vai para ele como um desejo, e a fórmula de compasso fica com ele."
          },
          {
            "param": "Idioma do vocal",
            "what": "O idioma em que o vocal é cantado. Em auto, ele vem da letra, o que pode falhar com letras curtas ou ambíguas: defina-o se o vocal sair no idioma errado. Um idioma escolhido à mão é mantido, o modelo de linguagem não o substitui."
          },
          {
            "param": "Passos de decodificação",
            "what": "O número de passos de difusão. Mais pode dar um áudio mais limpo, mas uma geração mais lenta; a partir de certo ponto o ganho quase não se ouve. O Turbo aceita de 1 a 8 (8 por padrão), os modelos SFT 50, os modelos base 32. Em Simples, Mais dobra o número habitual."
          },
          {
            "param": "Proximidade do estilo",
            "what": "A escala de orientação: com que rigor o modelo segue sua descrição. Mais alta segue as tags de estilo com mais precisão, mas valores muito altos deixam o som áspero e cheio de artefatos; mais baixa é mais natural, porém menos previsível. O Turbo não a usa. O padrão é 7, uma faixa razoável costuma ser de 3 a 12."
          },
          {
            "param": "Seed",
            "what": "Abaixo do formulário, ao lado de Criar. Com o dado pressionado, cada take recebe uma nova seed aleatória. Um número com as demais configurações iguais repete quase o mesmo resultado: útil para trocar uma tag de estilo e comparar."
          },
          {
            "param": "Modelo",
            "what": "O Turbo é mais rápido com alguma perda de qualidade e não faz todas as tarefas da aba De uma faixa; base e SFT são mais lentos, mas mais precisos e flexíveis. O modelo é escolhido na aba Música ou em Manual."
          },
          {
            "param": "LoRA",
            "what": "Um complemento ajustado sobre o modelo, para um timbre de voz ou subgênero específico, por exemplo. A intensidade dele (de 0 a 1) define quanto ele afeta o resultado: 1 é o efeito completo que o autor do adaptador pretendia, menos o mistura com mais suavidade. Os adaptadores são adicionados em Meus LoRAs, em Manual, com um nome e uma pasta."
          }
        ],
        "footer": "O que você não mexer vai com o padrão do motor: não é preciso definir tudo para ter um bom resultado. Redefinir devolve as linhas próprias dos ajustes e não mexe no modelo nem na duração."
      }
    }
  },
  "aiPart": {
    "guide": {
      "scratch": [
        {
          "title": "Andamento, tom, duração",
          "text": "Em um projeto vazio, defina o BPM e o «Tom», e a duração em segundos no painel. 64 compassos a 120 BPM são 128 segundos."
        },
        {
          "title": "Comece pela bateria",
          "text": "«Adicionar uma parte», instrumento «Bateria». As outras partes seguem o ritmo da bateria, então ela vem primeiro."
        },
        {
          "title": "Baixo e depois harmonia",
          "text": "Baixo, depois acordes: teclado, pad. Mantenha a bateria marcada na lista de faixas que o modelo ouve."
        },
        {
          "title": "Melodia e cor",
          "text": "Lead, cordas, percussão. De cinco a sete partes bastam; com mais, a mixagem fica carregada."
        },
        {
          "title": "Escolha e ajuste o volume",
          "text": "Fique com a melhor variante de cada parte e baixe-a logo para um nível adequado."
        },
        {
          "title": "Monte a música",
          "text": "Ligue o «Ímã» e a régua em compassos, corte as partes com a Faca e remova pedaços com a Borracha: uma introdução, a parte principal, uma pausa sem bateria e baixo, um final."
        }
      ],
      "scratchIntro": "O arranjador pode montar uma faixa a partir de um projeto vazio. As partes são adicionadas uma a uma e cada nova ouve as que já estão lá, então a ordem importa.",
      "scratchTitle": "Uma faixa do zero",
      "steps": [
        {
          "title": "Inicie o motor",
          "text": "O arranjador roda no ACE-Step; repintar, continuar e cover também podem rodar no Stable Audio 3. Se o motor estiver parado, o painel oferece iniciá-lo com um botão, e o motor que estava na GPU é parado."
        },
        {
          "title": "Defina o andamento e o tom",
          "text": "Antes da primeira parte, defina o BPM do projeto e o \"Tom\": tônica e escala. O modelo as recebe a cada pedido. Não mude o andamento depois das primeiras partes: elas sairiam da grade."
        },
        {
          "title": "Escolha um modo",
          "text": "\"Adicionar uma parte\", \"Repintar\", \"Continuar\" ou \"Cover\". A dica ao lado do seletor diz em uma linha o que o modelo vai fazer."
        },
        {
          "title": "Descreva o que você precisa",
          "text": "Para uma parte nova, escolha o instrumento. Na descrição, diga o som e a execução. Escreva no seu idioma: \"Para inglês\" a reescreve do jeito que o modelo lê melhor. O \"?\" ao lado do campo abre palavras e exemplos prontos."
        },
        {
          "title": "Marque o que o modelo ouve",
          "text": "O modelo se ajusta às faixas marcadas. Mantenha a bateria: o modelo segue a grade dela."
        },
        {
          "title": "Diga onde",
          "text": "A música toda ou a região de loop: ative \"Loop\" e arraste a região na régua. \"Repintar\" funciona só na região de loop."
        },
        {
          "title": "Gere e escolha",
          "text": "As variantes vão para faixas novas. \"Ouvir\" troca para uma variante, \"Manter\" remove as outras."
        }
      ],
      "tips": [
        "A descrição funciona melhor em inglês, em frases curtas separadas por vírgulas. Escreva no seu idioma e clique em \"Para inglês\"; leia o resultado e corrija se precisar.",
        "Descreva uma parte, não a música toda: o que o instrumento toca e como soa.",
        "Monte a música por etapas: bateria, depois baixo, harmonia e melodia. Cada parte nova ouve as anteriores.",
        "Não gostou de uma variante? Gere de novo: cada execução usa novas seeds aleatórias.",
        "Depois de cada parte nova, ajuste o volume dela antes de adicionar a próxima: a próxima parte ouve a mixagem como está agora.",
        "Quando as partes estiverem prontas, monte a música com elas: corte as faixas nos compassos com a Faca (C) e remova pedaços com a Borracha (E), para que os instrumentos entrem um após o outro.",
        "Para vocais, digite a letra e confira o \"Idioma dos vocais\": em \"Auto\" ele é detectado pelas letras.",
        "O ACE-Step nivela cada resultado em -1 dBFS, então uma parte nova chega alta: abaixe-a com o controle de volume da faixa.",
        "Para terminar a música em outra DAW, exporte \"Stems + Reaper\" ou DAWproject.",
        "Repintar, continuar e cover também podem rodar no Stable Audio 3: escolha-o como motor no painel. Ele preenche e continua ouvindo o áudio ao redor do trecho, em segundos, somente instrumental. Adicionar uma parte fica com o ACE-Step."
      ]
    },
    "toEnglish": "Para o inglês",
    "toEnglishBusy": "Escrevendo…",
    "toEnglishDone": "Reescrito em inglês pelo assistente; edite se precisar.",
    "toEnglishFailed": "O assistente não conseguiu escrever a descrição.",
    "toEnglishGpu": "O assistente de prompts está configurado para usar a GPU e descarregaria o modelo. Mude para Auto ou CPU na página Modelos.",
    "toEnglishTitle": "Descreva em qualquer idioma: o assistente de prompts reescreve em inglês, do jeito que o modelo lê melhor",
    "toEnglishUndo": "Desfazer"
  },
  "create": {
    "closeTool": "Fechar",
    "deleteAsk": "Excluir?",
    "details": "Detalhes",
    "download": "Baixar",
    "emptyAll": "Suas músicas aparecerão aqui",
    "emptyHint": "Escolha um motor, preencha o formulário ou escreva uma frase na linha de ideia acima dele e clique em Criar.",
    "emptyPeriod": "Nada foi feito neste período",
    "engine": "Motor",
    "engineTitle": "{name}: {status}",
    "engines": {
      "ace_step": "Rápido, covers",
      "stable_audio": "Sons e loops",
      "yue2": "Músicas com vocal"
    },
    "failed": "Não deu certo. Carregue no formulário e clique em Criar de novo.",
    "idea": {
      "chip": {
        "description": "Descrição",
        "length": "Duração",
        "lyrics": "Letra",
        "style": "Estilo",
        "tempo": "Andamento e tom"
      },
      "describe": "Descrever",
      "dismiss": "Dispensar",
      "formChanged": "O formulário foi alterado.",
      "noAssistant": "O assistente de prompts não está pronto: baixe o modelo dele em Modelos e configurações (a engrenagem no cabeçalho).",
      "noAssistantLink": "Baixar em Modelos",
      "noAssistantNote": "O assistente de prompts precisa do modelo dele.",
      "placeholder": {
        "ace_step": "Em uma frase: que música você quer",
        "stable_audio": "Em uma frase: o que deve soar",
        "yue2": "Em uma frase: sobre o que é a música"
      },
      "replaces": "Substitui o que está no formulário agora",
      "settings": "Configurações",
      "stop": "Parar",
      "stopping": "Parando…",
      "undo": "Voltar ao que estava",
      "write": "Escrever a letra e o estilo",
      "writeSa": "Escrever a descrição",
      "writeShort": "Escrever",
      "writing": "O assistente está escrevendo…",
      "written": "Colocado no formulário abaixo.",
      "writtenOther": "Colocado no formulário do {name}.",
      "saKind": "Escrever",
      "saKinds": {
        "auto": "Auto: pela ideia",
        "music": "Faixa musical",
        "instrument": "Instrumento solo",
        "one_shot": "Amostra one-shot",
        "sfx": "Efeito sonoro"
      }
    },
    "lessDetails": "Menos",
    "live": {
      "failed": "Take com falha: {name}. {reason}",
      "queue": "Takes na fila: {n}",
      "ready": "Take pronto: {name}",
      "readyMany": "Takes prontos: {n}, {name}"
    },
    "loading": "Carregando faixas…",
    "making": "Criando",
    "menu": {
      "made": "Criado {when}, duração {len}",
      "midi": "Para MIDI",
      "rename": "Renomear",
      "stems": "Separar em stems",
      "took": "levou {s} s"
    },
    "models": "Modelos",
    "more": "Detalhes e ações",
    "pause": "Pausar",
    "peek": {
      "copied": "Copiado",
      "copy": "Copiar",
      "lines": "{n} linhas",
      "lyrics": "Letra",
      "noLyrics": "Sem letra",
      "style": "Estilo",
      "tags": "{n} tags"
    },
    "period": "Período",
    "periodHint": {
      "all": "Tudo o que foi feito até agora.",
      "today": "Takes feitos hoje. Os marcados com estrela ficam em Favoritos na biblioteca.",
      "week": "Takes dos últimos sete dias."
    },
    "periods": {
      "all": "Tudo",
      "today": "Hoje",
      "week": "7 dias"
    },
    "play": "Reproduzir",
    "position": "Posição na faixa",
    "queued": "Na fila",
    "reuse": "Carregar no formulário",
    "reuseInForm": "Carregar no formulário",
    "session": "Sessão",
    "showAll": "Mostrar tudo: {n}",
    "showMore": "Mostrar mais: {n}",
    "startAndCreate": "Iniciar {name} e criar",
    "startFailed": "{name} não iniciou.",
    "startingEngine": "Iniciando {name}…",
    "startsOnCreate": "{name} não está em execução agora. Ele inicia quando você clica em Criar; o primeiro take após o início demora mais.",
    "startsOnCreateOther": "{other} está usando a GPU agora. {name} inicia quando você clica em Criar, e {other} para. O primeiro take após o início demora mais.",
    "stop": "Parar",
    "stopAsk": "Parar?",
    "stopConfirm": "Clique de novo para parar: o que foi feito até agora se perde",
    "stopped": "Parado.",
    "styleAndLyrics": "Estilo e letra",
    "takeN": "Take {n}",
    "takeTitle": "{title}, take {n}",
    "takes": "Takes: {n}",
    "toSession": "Para a lista da sessão, takes: {n}",
    "untitled": "Sem título",
    "wholeLibrary": "A biblioteca inteira"
  },
  "favorite": {
    "add": "Adicionar aos favoritos",
    "remove": "Remover dos favoritos"
  },
  "header": {
    "create": "Criar",
    "desc": {
      "create": "Músicas, instrumentais e sons",
      "library": "Todas as faixas: criadas, enviadas e do editor"
    },
    "gpuFree": "GPU livre",
    "home": "Início",
    "languageCurrent": "Idioma da interface: {name}",
    "library": "Biblioteca",
    "more": "Mais: idioma, modelos, ajuda",
    "guide": {
      "mapTitle": "As partes do aplicativo",
      "map": {
        "idea": "O jeito mais simples de começar, na própria página inicial: uma frase e Compor, e um modelo de linguagem local escreve o prompt para o motor. Edite e gere a faixa.",
        "lora": "Ajuste o ACE-Step com suas próprias faixas: envie áudio, rotule automaticamente, confira as descrições, treine e exporte. Abre na página Criar, sob o ACE-Step; o adaptador pronto aparece no formulário do ACE-Step.",
        "yue": "O segundo motor: escreve uma música inteira com vocal e pode construí-la em torno de uma melodia dada (a aba Melodia, com o SheetSage2). Também transforma uma faixa em MIDI."
      },
      "gpu": [
        "Os motores não cabem juntos na GPU, então um roda por vez. O motor é escolhido na página Criar e inicia quando você clica em Criar no formulário dele; o que estava rodando para.",
        "O primeiro início leva alguns minutos enquanto o modelo carrega na memória de vídeo. O botão de status no cabeçalho mostra o motor na GPU e quanto da memória de vídeo está cheia; um clique mostra quem ocupa quanta, o botão Descarregar e o caminho para Modelos.",
        "Descarregar interrompe uma geração ou um treino em andamento, então o botão pergunta antes."
      ],
      "steps": [
        {
          "title": "Abra o ACE-Step",
          "text": "Vá em Criar e escolha o ACE-Step. Ele inicia no primeiro clique em Criar; o primeiro início leva alguns minutos."
        },
        {
          "title": "Descreva a música",
          "text": "Na aba Música, A partir de uma descrição: um par de frases basta, o gênero, o clima, sobre o que é a letra. Escolha a duração e quantos takes."
        },
        {
          "title": "Escolha o melhor take",
          "text": "Os takes se alinham na lista da sessão ao lado do formulário (embaixo dele no celular). Tudo o que é criado é salvo sozinho na biblioteca."
        },
        {
          "title": "Separe em stems",
          "text": "Vocais, bateria, baixo e outros com um clique: Separar em stems no menu de um take, a aba Stems e notas na biblioteca, ou direto no editor."
        },
        {
          "title": "Monte no editor",
          "text": "Distribua os stems em faixas, adicione partes com o arranjador de IA, ajuste os efeitos."
        },
        {
          "title": "Exporte",
          "text": "Faça a mixagem em WAV ou MP3, ou exporte as faixas com um projeto do Reaper ou DAWproject."
        }
      ],
      "compare": [
        {
          "label": "Ideal para",
          "ace": "Músicas e instrumentais rápidos, muitas variantes seguidas",
          "yue": "Uma música inteira com vocal de uma vez",
          "sa3": "Instrumentais, efeitos sonoros e samples; preenche e continua áudio no editor"
        },
        {
          "label": "Trabalhar a partir de uma faixa",
          "ace": "Cover, repintar uma seção, adicionar uma parte, extrair uma parte, continuar",
          "yue": "Uma música na melodia de outra faixa: a aba Melodia, com o SheetSage2 ou um arquivo MIDI",
          "sa3": "Repintar um trecho, continuar, um cover em outro estilo (áudio para áudio); sem partes sobre uma mixagem"
        },
        {
          "label": "Seu próprio estilo",
          "ace": "Um LoRA treinado com suas faixas",
          "yue": "Não",
          "sa3": "Não (o suporte a LoRA está planejado)"
        },
        {
          "label": "Duração",
          "ace": "De 10 a 300 segundos, 1, 2 ou 4 takes por execução",
          "yue": "Quanto a letra durar, ou de 1 a 8 minutos; de 1 a 4 takes por execução",
          "sa3": "Até 6 minutos (medium) ou 2 minutos (small); 1, 2 ou 4 takes por execução, segundos por execução"
        },
        {
          "label": "MIDI",
          "ace": "Não",
          "yue": "Uma faixa ou stem para MIDI (MuScriptor)",
          "sa3": "Não"
        },
        {
          "label": "Licença",
          "ace": "MIT: uso comercial permitido; confira os termos atuais antes de publicar",
          "yue": "Somente uso não comercial",
          "sa3": "Stability AI Community License: grátis abaixo de 1 M USD por ano; somente instrumental, sem vocal"
        }
      ]
    },
    "helpSections": {
      "idea": {
        "title": "Compor a partir de uma ideia",
        "text": "Na página inicial, descreva uma música, um instrumental ou um som em uma ou duas frases e escolha o motor; o idioma da letra e quem escreve o prompt ficam em Mais. Em Compor, o assistente de prompts, um modelo local Qwen3.5, escreve o prompt no formato do motor: tags de estilo, letra em seções, andamento e tom. Edite, gere, ou abra no formulário do motor. Um som pula o assistente e vai direto ao Stable Audio. Na página Criar, a mesma ideia fica na linha de ideia acima do formulário e escreve direto nele. O modelo e o dispositivo do assistente são definidos em Modelos e configurações."
      },
      "engines": {
        "text": "Três motores geram áudio, ACE-Step 1.5, YuE2-3B e Stable Audio 3, e eles não cabem juntos em uma GPU, então um roda por vez. Escolha um motor na página Criar: ele inicia quando você clica em Criar e o que estava rodando para sozinho. A luz mostra o estado; o primeiro início pode levar alguns minutos enquanto o modelo carrega na memória de vídeo. O botão de status no cabeçalho mostra o que ocupa a GPU e pode descarregá-lo."
      },
      "ace": {
        "text": "Na aba Música, descreva a música em palavras simples (A partir de uma descrição) ou dê tags de estilo e letra com marcadores [Verse] / [Chorus] (Letra e estilo próprios), ou marque Sem vocal. Na aba De uma faixa, uma faixa de referência faz um cover, repinta uma seção, extrai ou adiciona uma parte, ou termina uma composição. A duração é de 10 a 300 s, com 1, 2 ou 4 takes por execução. Ajustes tem Simples (passos, duração, andamento, modo, formato) e Manual (cada parâmetro); um LoRA treinado é ativado ali, com intensidade de 0 a 1."
      },
      "yue": {
        "text": "O YuE2-3B escreve músicas inteiras com vocal. A aba Música guarda a letra, o estilo, a duração e a qualidade. A aba Melodia define o plano da melodia: Sem plano vai direto ao áudio, Seguir uma melodia mantém uma melodia dada e inventa o acompanhamento, Melodia e acordes escreve primeiro um plano dos dois. O SheetSage2 (De uma música…) escreve a melodia de uma faixa como uma partitura ABC, que você pode editar e devolver ao YuE2."
      },
      "sa3": {
        "text": "O Stable Audio 3 faz música instrumental e efeitos sonoros a partir de uma descrição em segundos: escolha Música ou Som, descreva como uma biblioteca de samples faria (gênero, instrumentos, clima, andamento, ou a fonte de um som e como é produzido), defina a duração e o número de takes. Não há vocal. O mesmo motor atende o arranjador de IA e os Samples do editor, onde repinta, continua e faz covers ouvindo o áudio dos dois lados do trecho. Os pesos principais têm acesso restrito: aceite a licença no Hugging Face, salve seu token e baixe um modelo em Modelos e configurações."
      },
      "lora": {
        "text": "O treino de LoRA fica sob o ACE-Step na página Criar, ao lado de Gerar (no celular, um seletor acima do formulário). O treino precisa do ACE-Step em execução, e a página oferece iniciá-lo. Ele percorre todo o processo de ajuste fino: enviar áudio, rotulagem automática, revisar e editar as descrições, pré-processamento, treino com progresso ao vivo e exportação. Um adaptador pronto é adicionado à lista de LoRA no formulário do ACE-Step."
      },
      "stems": {
        "text": "Qualquer faixa salva pode ser separada em quatro stems (vocais, bateria, baixo, outros) com um clique: Separar em stems no menu de um take, a aba Stems e notas na biblioteca, ou uma faixa no editor. Os stems podem abrir no editor como um projeto pronto de quatro faixas. A transcrição MIDI (MuScriptor) funciona na mixagem completa ou em um único stem; ela roda no motor YuE2, então o YuE2 precisa estar instalado."
      },
      "arranger": {
        "text": "O botão «Arranjador de IA» no editor monta uma peça passo a passo em vez de gerá-la inteira. «Adicionar uma parte» escreve uma parte nova (bateria, baixo, pad, cordas etc.) sobre as faixas escolhidas, «Repintar» reescreve um trecho fraco, «Continuar» prolonga a faixa, «Cover» faz uma nova versão em outro estilo. Cada variante cai em sua própria faixa: ouça, fique com a melhor e passe para a próxima parte. As partes são adicionadas pelo modelo base do ACE-Step (cerca de 4.8 GB) ou pela versão base XL, maior (cerca de 20 GB, precisa de uma placa de 16 GB); ambos são opcionais, e sem o modelo base o arranjador oferece instalá-lo. Os outros modos rodam no turbo, ou no Stable Audio 3 quando você o escolhe como motor: ele preenche, continua e faz covers ouvindo o áudio ao redor, somente instrumental."
      },
      "sfx": {
        "text": "O botão «Samples» no editor cria one-shots (um bumbo, uma batida, um whoosh), loops no andamento do projeto e texturas (chuva, uma multidão, um drone) com o Stable Audio 3, a partir de uma descrição curta. Os resultados se alinham numa faixa: ouça primeiro, depois adicione o que gostar a uma nova faixa ou à faixa selecionada no cursor de reprodução. Os loops são cortados em compassos inteiros, mas o modelo não garante uma emenda perfeita, então confira-os em repetição. «Remover da lista» exclui os sons do trabalho da biblioteca e do disco, exceto os que estiverem numa faixa naquele momento."
      }
    }
  },
  "home": {
    "allTracks": "Toda a biblioteca",
    "compose": "Compor",
    "composeHere": "O assistente escreve o prompt para o motor escolhido; você pode editá-lo antes de gerar",
    "composeSound": "O assistente escreve um prompt de som com a duração, e o Stable Audio o cria",
    "engineLabel": "Motor",
    "engines": "Ou vá direto a um motor",
    "firstText": "Descreva uma música ou pegue um exemplo:",
    "firstTitle": "Suas faixas aparecerão aqui",
    "guide": "Como funciona a composição",
    "kind": {
      "instrumental": "Instrumental",
      "song": "Música com vocal",
      "sound": "Som"
    },
    "kindLabel": "O que criar",
    "lead": "Tudo roda neste computador",
    "loading": "Carregando as faixas",
    "more": "Mais",
    "needPhrase": "Descreva a música primeiro",
    "title": "O que vamos criar?",
    "phraseLabel": "Descreva a música",
    "placeholderSound": "chuva num telhado de zinco à noite, perto e calma",
    "soundBySa3": "Os sons são feitos pelo Stable Audio",
    "soundMissing": "O Stable Audio não está instalado"
  },
  "keyScale": {
    "hint": "O ACE-Step só conhece maior e menor. Para esta escala ele recebe o tom mais próximo ({key}) e o nome da escala na descrição: uma dica, não uma garantia.",
    "mode": "Escala",
    "modes": {
      "blues": "Blues",
      "dorian": "Dórica",
      "double_harmonic": "Harmônica dupla",
      "harmonic_minor": "Menor harmônica",
      "hungarian_minor": "Menor húngara",
      "locrian": "Lócria",
      "lydian": "Lídia",
      "major": "Maior (jônica)",
      "major_pentatonic": "Pentatônica maior",
      "melodic_minor": "Menor melódica",
      "minor": "Menor natural (eólia)",
      "minor_pentatonic": "Pentatônica menor",
      "mixolydian": "Mixolídia",
      "phrygian": "Frígia",
      "phrygian_dominant": "Frígia dominante"
    },
    "needTonic": "Escolha primeiro a nota do tom",
    "none": "Não existe essa escala",
    "notSet": "não definido",
    "search": "Digite para buscar",
    "tonic": "Tônica"
  },
  "libraryPage": {
    "aiPart": "Uma parte do arranjador de IA",
    "collectionName": "Nome da coleção",
    "confirmDeleteCollection": "Remover a coleção?",
    "cot": {
      "full": "melodia e acordes",
      "melody": "segue uma melodia"
    },
    "delete": "Excluir",
    "deleteCollection": "Remover a coleção (as faixas ficam)",
    "deleteFailed": "Não foi possível excluir: {error}",
    "emptyCollection": "Abra uma faixa e adicione-a a esta coleção na aba Sobre.",
    "emptyFavorites": "Marque uma faixa com a estrela e ela aparece aqui.",
    "emptyHere": "Ainda não há nada aqui",
    "emptyHint": "As faixas que você cria e envia ficam reunidas aqui.",
    "facts": {
      "file": "Arquivo",
      "madeIn": "Criado em",
      "melody": "Melodia",
      "model": "Modelo"
    },
    "filters": {
      "all": "Todas as faixas",
      "favorites": "Favoritos",
      "midi": "Notas (MIDI)",
      "score": "Partitura",
      "stems": "Stems",
      "today": "Hoje"
    },
    "filtersLabel": "Filtros da biblioteca",
    "groups": {
      "collections": "Coleções",
      "has": "O que a faixa tem",
      "origin": "Criado por",
      "tags": "Tags"
    },
    "loadFailed": "Não foi possível carregar a biblioteca.",
    "newCollection": "+ Nova coleção",
    "newest": "Mais recentes primeiro",
    "noCollections": "Ainda não há coleções: crie a primeira com Nova coleção.",
    "nothingFound": "Nada encontrado",
    "nothingFoundHint": "Tente outra palavra ou outro filtro.",
    "oldest": "Mais antigas primeiro",
    "order": "Ordem",
    "origins": {
      "editor": "Editor",
      "upload": "Enviado"
    },
    "period": "Período",
    "pick": "Escolha uma faixa: a letra, o estilo, os stems e as notas aparecem aqui.",
    "renameCollection": "Renomear a coleção",
    "retry": "Tentar de novo",
    "reuseHint": "Abre Criar com esta letra, estilo e configurações",
    "search": "Título, estilo ou um verso da letra",
    "showAll": "Mostrar todas as faixas",
    "sub": {
      "editor": "Do editor",
      "engine": "Sem descrição",
      "upload": "Arquivo enviado"
    },
    "tabs": {
      "about": "Sobre",
      "lyrics": "Letra",
      "parts": "Stems e notas"
    },
    "take": "Take {n}",
    "title": "Biblioteca",
    "toCreate": "Crie a primeira faixa",
    "today": "Hoje",
    "yesterday": "Ontem",
    "bulk": {
      "addTag": "Adicionar #{tag}",
      "clear": "Limpar a seleção (Esc)",
      "collected": "{n} música adicionada a «{name}» | {n} músicas adicionadas a «{name}»",
      "collection": "Coleção",
      "favorited": "{n} música adicionada aos favoritos | {n} músicas adicionadas aos favoritos",
      "label": "Ações nas músicas selecionadas",
      "newCollection": "Nova coleção…",
      "noTags": "Ainda não há tags: digite uma e pressione Enter.",
      "selectAll": "Selecionar tudo: {n}",
      "selectSong": "Selecionar «{title}» com seus takes: {n}",
      "selectTrack": "Selecionar «{title}»",
      "selected": "Selecionadas: {n}",
      "tag": "Tag",
      "tagPlaceholder": "Uma nova tag, ou busque uma",
      "tagged": "#{tag} adicionada a {n} música | #{tag} adicionada a {n} músicas",
      "uncollected": "{n} música removida de «{name}» | {n} músicas removidas de «{name}»",
      "unfavorited": "{n} música removida dos favoritos | {n} músicas removidas dos favoritos",
      "untagged": "#{tag} removida de {n} música | #{tag} removida de {n} músicas"
    },
    "emptyTag": "Adicione esta tag a uma música na aba Sobre, ou a várias de uma vez pela barra de seleção.",
    "tags": {
      "add": "Adicione uma tag e pressione Enter",
      "added": "Tag #{tag} adicionada",
      "confirmDelete": "Remover a tag?",
      "delete": "Tirar a tag de todas as músicas",
      "remove": "Remover a tag #{tag}",
      "removed": "Tag #{tag} removida",
      "rename": "Renomear a tag"
    },
    "trash": {
      "confirmEmpty": "Excluir todas definitivamente?",
      "confirmPurge": "Excluir definitivamente?",
      "deleted": "Excluída: {when}",
      "dismiss": "Ocultar o aviso",
      "emptied": "A lixeira está vazia agora",
      "empty": "Esvaziar a lixeira",
      "emptyHere": "A lixeira está vazia",
      "emptyHint": "As músicas excluídas ficam aqui por 30 dias, caso você queira alguma de volta.",
      "loadFailed": "Não foi possível carregar a lixeira: {error}",
      "moveHint": "Move a música para a lixeira: de lá ela pode ser restaurada por 30 dias",
      "moved": "{n} música movida para a lixeira | {n} músicas movidas para a lixeira",
      "note": "As músicas na lixeira são excluídas definitivamente após 30 dias.",
      "purge": "Excluir para sempre",
      "purged": "{n} música excluída definitivamente | {n} músicas excluídas definitivamente",
      "restore": "Restaurar",
      "restored": "{n} música restaurada | {n} músicas restauradas",
      "title": "Lixeira",
      "undo": "Desfazer"
    }
  },
  "midiPanel": {
    "betterWithVocals": "Funciona a partir da mixagem completa; para uma melodia exata, separe a faixa em stems e reconheça primeiro o vocal.",
    "scoreEmpty": "O MIDI não tem notas para fazer uma partitura.",
    "scoreFromFull": "da mixagem completa",
    "scoreFromStems": "melodia do vocal, acompanhamento do baixo e do resto",
    "scoreFromVocals": "melodia do vocal",
    "scoreInserted": "A partitura está no formulário do YuE2 ({from}).",
    "toScore": "Para uma partitura do YuE2",
    "toScoreHint": "Transforma as notas em uma partitura ABC para o YuE2 e a coloca no formulário dele: o vocal vira a melodia, o baixo e o resto viram o acompanhamento e os acordes."
  },
  "miniWave": {
    "percent": "{n}%",
    "timeOf": "{pos} de {total}"
  },
  "models": {
    "check": "Verificar",
    "checkBad": "Danificados ou ausentes: {files}. Baixe esta parte de novo.",
    "checkFailed": "Não foi possível verificar: {error}",
    "checkOffline": "Não foi possível acessar o Hugging Face, então só os tamanhos foram comparados.",
    "checkOkHash": "Todos os {n} arquivos estão íntegros; {h} bateram com o SHA-256 listado pelo Hugging Face.",
    "checkOkRecord": "Todos os {n} arquivos batem com o registro por tamanho.",
    "checkOkSize": "Todos os {n} arquivos estão íntegros (verificado por tamanho e estrutura; não há lista de checksums para comparar).",
    "checkOutdated": "Íntegro, mas o repositório agora tem uma versão mais nova de: {files}. Baixe de novo para obtê-la.",
    "checkTitle": "Verificar se os arquivos estão íntegros",
    "checking": "Verificando…",
    "parts": {
      "yue2-bf16": {
        "name": "YuE2 bf16",
        "text": "O modelo sem quantização. Precisa de mais memória de vídeo que o q8_0 (a maior das três)."
      }
    },
    "reinstall": "Baixar de novo",
    "reinstallAsk": "Baixar {gb} GB de novo?",
    "reinstallNamed": "Baixar {name} de novo",
    "reinstallNo": "Manter",
    "reinstallTitle": "Baixar de novo e substituir os arquivos",
    "reinstallYes": "Baixar de novo",
    "yue2": {
      "noSettings": "A precisão q8_0, q4_0 ou bf16 é escolhida a cada geração no formulário do YuE2, junto com Qualidade."
    }
  },
  "params": {
    "changed": "Alterado",
    "consoleNote": "Os valores definidos à mão ficam marcados. O resto vai com o valor padrão.",
    "consoleTitle": "Console do {name}",
    "default": "Padrão: {v}",
    "quick": "Escolha rápida: {group}",
    "reset": "Voltar ao padrão",
    "resetOne": "Voltar {name} ao padrão",
    "simple": {
      "more": "Mais: {n}",
      "normal": "Habitual: {n}",
      "steps": "Passos de decodificação",
      "stepsHint": "Mais passos demoram mais."
    }
  },
  "player": {
    "close": "Fechar o player",
    "label": "Player",
    "next": "Próxima faixa",
    "prev": "Faixa anterior (do início, se a faixa já estiver em andamento)"
  },
  "presets": {
    "button": "Preset",
    "confirmDelete": "Clique de novo para excluir {name}",
    "deleteAsk": "Excluir?",
    "deleteOne": "Excluir o preset {name}",
    "none": "Ainda não há presets salvos.",
    "saveCurrent": "Salvar o formulário como preset",
    "title": "Presets: conjuntos salvos de configurações do formulário"
  },
  "resources": {
    "ramOf": "RAM {used} de {total} GB",
    "state": {
      "error": "{model} relatou um erro",
      "running": "{model} está em execução",
      "starting": "{model} está iniciando",
      "stopping": "{model} está parando"
    },
    "vramOf": "Memória de vídeo {used} de {total} GB",
    "holder": {
      "cover": "Capas (Z-Image Turbo)"
    }
  },
  "sa3Gen": {
    "badGuidanceWindow": "A orientação para num nível de ruído maior do que aquele em que começa: diminua «para em» ou aumente «começa em».",
    "formTabs": "Seções do formulário",
    "kindLabel": "Tipo de áudio",
    "lengthFromRef": "A faixa de referência define a duração:",
    "lengthOwn": "própria: {v}",
    "lengthSeconds": "{n} s",
    "manual": {
      "apg": "Parte de APG",
      "autoTags": "Tags de serviço",
      "cfg": "Proximidade da descrição",
      "cfgStartsAt": "A orientação começa no nível de ruído",
      "cfgStopsAt": "A orientação para no nível de ruído",
      "chunked": "Decodificar em pedaços",
      "chunkedAuto": "Auto",
      "duration": "Duração",
      "fromRef": "definido pela faixa de referência",
      "guidanceSub": "como a descrição conduz o som; o nível de ruído cai de 1 a 0 durante a execução",
      "guidanceTitle": "Orientação",
      "needCfg": "quando a proximidade da descrição não é 1",
      "needTwo": "com duas variantes ou mais",
      "negative": "O que evitar",
      "normThreshold": "Limite de um passo de orientação",
      "off": "Não",
      "on": "Sim",
      "padding": "Folga de duração",
      "perVariant": "Uma descrição por variante",
      "resultSub": "a duração e a descrição",
      "resultTitle": "Resultado",
      "sampler": "Sampler",
      "samplerAuto": "padrão (pingpong)",
      "samplerAutoBase": "o padrão do modelo",
      "samplerLoud": "Mais alto que o normal e com clipping: num teste, 1-2 % do som bateu no teto.",
      "samplerQuiet": "Cerca de 7 dB mais baixo que o normal.",
      "samplerSub": "como cada passo é calculado",
      "samplerTitle": "Sampler",
      "scalePhi": "Suavizar a orientação",
      "textOnly": "somente sem uma faixa de referência",
      "trim": "Cortar o silêncio do início"
    },
    "modelsAfterStart": "A lista de modelos aparece quando o motor está em execução.",
    "queuedNote": "Takes na fila: {n}",
    "ref": {
      "modeLabel": "O que fazer com a referência",
      "off": "Ligue para trabalhar a partir de uma faixa pronta: refazê-la, refazer um trecho ou continuá-la."
    },
    "simple": {
      "tagsOff": "Não adicionar",
      "tagsOn": "Adicionar"
    },
    "submitKind": {
      "music": "Criar música",
      "sfx": "Criar um som"
    },
    "tabChanged": "alterado",
    "tabs": {
      "ref": "De uma faixa",
      "sound": "Descrição",
      "tuning": "Ajustes"
    },
    "advancedHint": "O dado ao lado da seed a torna aleatória de novo; um número repete aquele som. Os modelos pós-treinados são ajustados para 8 passos e proximidade 1; O que evitar e o grupo Orientação só funcionam quando a proximidade da descrição não é 1.",
    "advancedHintBase": "Um checkpoint base: começa com 50 passos e proximidade 7, então O que evitar funciona; tente «poor quality» ali.",
    "help": {
      "tips": [
        "Música: gênero, instrumentos e como cada um soa, clima e energia, andamento em BPM.",
        "Um som: o que o produz, como acontece e por quanto tempo, onde está o microfone e como a sala soa.",
        "As tags ajudam: TrackType: Music, VocalType: Instrumental, Genre: Funk, Instruments: Guitar, Saxophone; TrackType: Instrument para uma parte solo; TrackType: SFX para um som.",
        "Sem vocal: o modelo faz instrumentais; um prompt com vocal dá, no máximo, texturas sem palavras.",
        "Digite uma seed para repetir um resultado; com o dado pressionado, cada take recebe uma nova."
      ]
    },
    "translateBtn": "Só traduzir",
    "translateHint": "O Stable Audio só entende inglês: o assistente pode escrever um prompt em inglês a partir do seu texto ou apenas traduzi-lo.",
    "translateNoAssistant": "O assistente de prompts não está pronto: baixe o modelo dele em Modelos.",
    "translateRunning": "Traduzindo…",
    "translateStopping": "Parando…",
    "translateStop": "Parar",
    "translateDone": "Traduzido para inglês.",
    "translateUndo": "Restaurar",
    "composeBtn": "Escrever o prompt",
    "composeTitle": "O assistente transforma a descrição, em qualquer idioma, em um prompt para o Stable Audio: gênero, instrumentos, som, andamento e duração",
    "composeRunning": "Escrevendo o prompt…",
    "composeDone": "O prompt para o Stable Audio está pronto."
  },
  "tagInput": {
    "cleared": "Todas as tags foram removidas",
    "removeTag": "Remover {tag}",
    "removed": "{tag} removida",
    "restored": "Tags restauradas",
    "undo": "Desfazer",
    "undoTitle": "Trazer de volta as tags removidas"
  },
  "yueGen": {
    "help": {
      "advanced": {
        "choices": [
          "Qualidade (aba Música): Rascunho é o modelo q4_0, Normal q8_0, Final bf16 com 32 passos de decodificação e proximidade do estilo 1.2.",
          "Duração (aba Música): os minutos viram Não menos que e Não mais que; o modelo produz 25 tokens por segundo de som.",
          "Canto: Mais firme é Ousadia 0.85, Mais ousado 1.1.",
          "Repetições: Menos é Penalidade de repetição 1.3 com Memória de repetição 80.",
          "Partitura: Mais cuidadosa é uma Ousadia da partitura de 0.55."
        ],
        "choicesIntro": "Eles definem os mesmos valores das correções abaixo, com um clique.",
        "choicesTitle": "As opções nas abas",
        "title": "Ajustes",
        "lead": "Você pode deixá-los como estão: o que você não mudar vai com o padrão do motor, mostrado em cada linha em Manual. Eles importam quando uma faixa continua saindo errada: cortada, em loop, desafinada. Ache seu caso abaixo e clique em Aplicar: os números certos entram sozinhos nos campos.",
        "fixes": [
          {
            "id": "cutoff",
            "problem": "A faixa corta antes de a letra acabar",
            "fix": "Não mais que: 12000 tokens, um teto de duração de cerca de 8 minutos em vez de 6."
          },
          {
            "id": "offbrief",
            "problem": "O som não combina com as tags",
            "fix": "Proximidade do estilo: 1.2, para o modelo seguir a descrição com mais rigor. Se isso não ajudar, o problema são as próprias tags."
          },
          {
            "id": "loop",
            "problem": "Uma frase fica em loop sem parar",
            "fix": "Penalidade de repetição 1.3 e Memória de repetição 80: uma penalidade maior para repetições e uma memória mais longa delas."
          },
          {
            "id": "offkey",
            "problem": "Notas desafinadas, falhas na voz, ruído",
            "fix": "Ousadia 0.85 e 32 passos de decodificação: menos ousadia, mais passadas desenhando o áudio."
          },
          {
            "id": "melody",
            "problem": "A melodia é incoerente",
            "fix": "Se o plano estiver desligado, ele passa para Melodia e acordes (um plano que você já escolheu permanece), e Partitura vai para Mais cuidadosa (Ousadia da partitura 0.55), então a partitura é escrita com mais cautela. Ou pegue uma melodia de uma música na aba Melodia: uma partitura dada substitui o plano, e então só a escolha do plano importa."
          },
          {
            "id": "same",
            "problem": "Todos os takes soam parecidos",
            "fix": "Liga a seed aleatória. Se não bastar, Ousadia 1.1."
          },
          {
            "id": "final",
            "problem": "Quero o render final",
            "fix": "Qualidade: Final, o modelo bf16 (quando baixado), 32 passos e proximidade do estilo 1.2. Faça 2–3 takes e fique com o melhor."
          }
        ],
        "fieldsIntro": "Sob cada campo há uma escala de valores típicos: a marca acima dela é o padrão para o áudio, a marca abaixo é o da partitura (só com um plano de melodia e sem partitura dada). Uma partitura precisa de rigor, o áudio precisa de vida, daí os padrões diferentes.",
        "groups": [
          {
            "title": "Precisão e qualidade",
            "fields": [
              {
                "key": "cfg_scale",
                "name": "Proximidade do estilo (CFG)",
                "text": "Com que obediência o modelo segue as tags de estilo. Como o volume da sua voz no ouvido de um músico: mais baixo, eles tocam com mais liberdade; mais alto, mais fiéis ao pedido, porém mais duros.",
                "left": "mais livre",
                "right": "mais fiel às tags",
                "when": "1.2 se o som mal combina com a descrição. Acima de 1.5: artefatos e um som «de plástico»."
              },
              {
                "key": "num_inference_steps",
                "name": "Passos de decodificação",
                "text": "Quantas passadas o modelo dá para transformar seu plano em áudio pronto. Como demãos de tinta: 8 é um esboço rápido, 32 uma demão final limpa.",
                "left": "mais rápido",
                "right": "mais limpo",
                "when": "8 para rascunhos, 32 para o final. A diferença quase não se ouve (cerca de 4 s por faixa numa RTX 4080); além de 32 o som só muda, não melhora."
              }
            ]
          },
          {
            "title": "Caráter da interpretação",
            "fields": [
              {
                "key": "temperature",
                "name": "Ousadia (temperature)",
                "text": "A ousadia do modelo (no mínimo 0.01: zero para o motor). Baixa: toca «ao pé da letra», regular e previsível; alta: improvisa, às vezes de forma brilhante, às vezes desafinando.",
                "left": "mais firme",
                "right": "mais ousado",
                "when": "Desafinado: 0.85. Todos os takes iguais: 1.1. Uma partitura estranha: 0.5–0.6 para a partitura."
              },
              {
                "key": "repetition_penalty",
                "name": "Penalidade de repetição",
                "text": "Uma penalidade por repetir o que já foi tocado. Quanto mais alta, mais o modelo evita o «disco arranhado». Para a partitura é quase 1.0: repetições são normais na notação.",
                "left": "repetições permitidas",
                "right": "sem repetições",
                "when": "Em loop: 1.3. Abaixo de 1.1 há risco de loops monótonos."
              }
            ]
          },
          {
            "title": "Duração da faixa",
            "fields": [
              {
                "key": "min_tokens",
                "name": "Não menos que",
                "text": "O modelo não pode terminar antes deste ponto. Cerca de 25 unidades por segundo: 200 ≈ 8 segundos de áudio.",
                "left": "pode ser curta",
                "right": "não antes de",
                "when": "A faixa termina antes de cantar tudo: aumente."
              },
              {
                "key": "max_tokens",
                "name": "Não mais que",
                "text": "Teto de duração. 9000 ≈ 6 minutos de música; o formulário aceita até 15000. Mais: espera maior e mais memória da GPU.",
                "left": "mais curta",
                "right": "mais longa",
                "when": "Corta no meio da frase: 12000."
              }
            ]
          }
        ],
        "rareIntro": "Mudam as mesmas coisas que Ousadia ou Penalidade de repetição, só que com mais finura. Normalmente ficam como estão.",
        "rare": [
          {
            "key": "top_p",
            "name": "Corte de escolhas raras (top-p)",
            "text": "Quantas opções «sensatas» o modelo considera em cada passo: 1, todas; 0.5, só as mais óbvias."
          },
          {
            "key": "top_k",
            "name": "Candidatos (top-k)",
            "text": "Um limite rígido para o número de opções em cada escolha. Um segundo filtro ao lado do corte de escolhas raras."
          },
          {
            "key": "penalty_window",
            "name": "Memória de repetição",
            "text": "Até onde o modelo se lembra do que tocou ao calcular a penalidade de repetição. 50 ≈ 2 segundos de áudio. Suba para 80 quando houver loop."
          }
        ]
      },
      "melody": {
        "lead": "O YuE2 pode cantar a letra sobre uma melodia que você der. A partitura ABC a guarda: notas escritas como texto. A partir de uma partitura no formato que o app escreve, a música sai no mesmo tom, com as mesmas notas cantadas e a mesma duração: em nosso teste as notas bateram em 93–99 %.",
        "roll": [
          "Ouvir toca a partitura num piano. Um clique ou arrasto no roll escolhe onde começar, ⏮ volta ao início.",
          "As notas rosa são o vocal (Vocal), as azuis o acompanhamento (Ins). Os números dos compassos e os acordes ficam no alto.",
          "Ctrl + roda do mouse dá zoom, ⤢ abre a janela grande com três oitavas de teclas.",
          "Partitura mostra a mesma partitura em pautas; um clique numa nota a toca."
        ],
        "rollTitle": "O roll e as notas",
        "sources": [
          "De uma música… — escolha um arquivo de áudio e o SheetSage2 escreve a melodia e os acordes dele. Funciona melhor com um vocal claro.",
          "Importar MIDI — a parte mais aguda vira a melodia, os outros canais o acompanhamento e os acordes, e o tom é encontrado sozinho. Mantenha a melodia vocal em uma faixa própria.",
          "Piano — escolha uma duração e pressione teclas (abaixo, à esquerda do roll, ou num teclado MIDI): as notas vão uma após a outra.",
          "De uma faixa criada: Para MIDI no menu de um take, ou a aba Stems e notas na biblioteca, e depois Para uma partitura do YuE2. O vocal vira a melodia, o baixo e o resto o acompanhamento."
        ],
        "sourcesTitle": "De onde vem uma melodia",
        "tips": [
          "Uma nota por sílaba: um verso de 8 sílabas precisa de cerca de 8 notas.",
          "A música dura o que duram as notas: 8 compassos de 4/4 a 100 BPM são cerca de 20 segundos.",
          "Seguir uma melodia: o modelo mantém sua melodia e inventa o acompanhamento; Melodia e acordes: ele constrói os dois a partir da partitura.",
          "Um tom ou andamento no estilo não faz nada: eles vêm das notas.",
          "Edite o texto ABC à mão só se conhecer o formato: o modelo lê melhor o layout que o app escreve (vozes Vocal e Ins)."
        ],
        "tipsTitle": "Para um resultado fiel",
        "title": "Melodia e partitura ABC"
      },
      "style": {
        "tips": [
          "O ideal são 5–8 tags: com mais, começam a brigar; com menos, o resultado fica menos previsível.",
          "Escreva as tags em inglês, mas comece pelo idioma da música (Russian, English, Spanish…): os exemplos do próprio motor fazem isso, e os fluxos de ideia o adicionam por você.",
          "Com um plano de melodia (Seguir uma melodia ou Melodia e acordes), o estilo ainda importa: ele define o timbre e o arranjo, enquanto a melodia vem da partitura ABC."
        ]
      },
      "lyrics": {
        "tips": [
          "Com um plano de melodia, o ritmo dos versos deve combinar mais ou menos com a partitura ABC (sílabas por compasso); senão o modelo precisa esticar ou comprimir as palavras para caberem na melodia.",
          "Versos curtos se encaixam na melodia de forma mais previsível do que os longos.",
          "Repita o refrão palavra por palavra em cada [Chorus]: isso mantém a mesma linha melódica nele ao longo da faixa."
        ]
      },
      "cot": {
        "title": "O plano da melodia",
        "intro": "O plano da melodia decide se o modelo escreve um plano musical antes do áudio e como usa a partitura ABC da aba Melodia.",
        "melodyNote": "Dê a melodia na partitura ABC sob o plano: De uma música… (SheetSage2), um arquivo MIDI ou o piano. Sem partitura, o modelo escreve seu próprio plano só de melodia.",
        "precisionNote": "A precisão do modelo (q8_0, q4_0, bf16) não tem a ver com o plano: quem a define é Qualidade na aba Música. O q4_0 economiza memória de vídeo com uma pequena perda de qualidade, seja qual for o plano.",
        "abcFooter": "O mais fácil é não escrever ABC do zero, e sim pegá-lo de uma música com De uma música… (SheetSage2) e depois retocar à mão os compassos de que precisar."
      }
    },
    "length": {
      "auto": "Auto",
      "autoHint": "Quanto a letra durar, até cerca de 6 minutos.",
      "hint": "Cerca de {n} min: uma letra mais curta é cantada e tocada até essa duração, uma mais longa é cortada aí.",
      "label": "Duração",
      "minutes": "{n} min",
      "ownHint": "Definida à mão em Ajustes (Mín. / Máx. de tokens)."
    },
    "lines": "Versos: {n}",
    "linesAbout": "Versos: {n}, cerca de {time}",
    "linesAboutHint": "Uma estimativa com base nas suas músicas anteriores: cerca de {s} s por verso. Para a duração Auto.",
    "manual": {
      "abcGiven": "a partitura da aba Melodia",
      "changed": "{n} de {total} alterados",
      "console": "Console: todos os grupos de uma vez",
      "consoleTitle": "Console do YuE2",
      "done": "Pronto",
      "groups": {
        "character": {
          "sub": "o vocal e a música",
          "title": "Caráter"
        },
        "length": {
          "sub": "25 tokens por segundo",
          "title": "Duração"
        },
        "repeats": {
          "sub": "contra loops",
          "title": "Repetições"
        },
        "score": {
          "sub": "como o modelo escreve o plano da melodia",
          "title": "Partitura"
        },
        "sound": {
          "sub": "o modelo e a decodificação",
          "title": "Som"
        }
      },
      "manual": "Manual",
      "params": {
        "cfg": "Proximidade do estilo",
        "max_tokens": "Não mais que",
        "min_tokens": "Não menos que",
        "penalty_window": "Memória de repetição",
        "precision": "Precisão do modelo",
        "repetition_penalty": "Penalidade de repetição",
        "steps": "Passos de decodificação",
        "temperature": "Ousadia",
        "top_k": "Candidatos",
        "top_p": "Corte de escolhas raras"
      },
      "reset": "Redefinir",
      "resetAll": "Redefinir tudo",
      "seconds": "{n} s",
      "seedRandom": "aleatória",
      "sends": "Vai para o motor",
      "sendsRest": "Os valores definidos à mão ficam marcados. O que não está na linha fica com o padrão do motor.",
      "simple": "Simples"
    },
    "perf": {
      "manualNow": "(definido à mão agora)",
      "repeats": {
        "hint": "Menos, quando uma frase fica girando sem parar.",
        "label": "Repetições",
        "options": {
          "fewer": "Menos",
          "normal": "Normal"
        }
      },
      "score": {
        "hint": "Mais cuidadosa, quando a melodia divaga: o modelo escreve a partitura com mais cautela.",
        "label": "Partitura",
        "options": {
          "careful": "Mais cuidadosa",
          "normal": "Normal"
        }
      },
      "temperature": {
        "hint": "Mais firme: menos notas desafinadas e falhas na voz. Mais ousado: os takes diferem mais entre si.",
        "label": "Canto",
        "options": {
          "normal": "Normal",
          "steady": "Mais firme",
          "varied": "Mais ousado"
        }
      }
    },
    "planLabel": "Plano da melodia",
    "planNames": {
      "full": "Melodia e acordes",
      "melody": "Seguir uma melodia",
      "off": "Sem plano"
    },
    "qualityHints": {
      "draft": "O modelo {model} usa menos memória de vídeo e o som é um pouco mais simples: para testar ideias.",
      "final": "O modelo {model}, 32 passos de decodificação e mais próximo das tags de estilo (CFG 1.2): para uma faixa final. Faça 2–3 takes e fique com o melhor. O bf16 precisa de mais memória de vídeo que o q8_0 (o arquivo dele tem 7.3 GB contra 4.3 GB).",
      "normal": "O modelo {model} com os ajustes habituais: bom som sem espera.",
      "own": "Precisão, passos e CFG à mão."
    },
    "qualityLabel": "Qualidade",
    "qualityNames": {
      "draft": "Rascunho",
      "final": "Final",
      "normal": "Normal",
      "own": "Própria"
    },
    "queued": "Na fila, takes: {n}",
    "scoreGivenNote": "A partitura dada substitui o plano, então a amostragem da partitura não faz nada e não é enviada.",
    "sections": {
      "bridge": "+ Ponte",
      "chorus": "+ Refrão",
      "outro": "+ Final",
      "verse": "+ Estrofe"
    },
    "tabs": {
      "changed": "Alterado em relação ao padrão",
      "melody": "Melodia",
      "song": "Música",
      "tuning": "Ajustes"
    },
    "takes": "Takes",
    "tuningTitle": "Ajustes de desempenho"
  },
  "acePage": {
    "openTrainingPage": "Abrir o treino de LoRA"
  },
  "library": {
    "noTracks": "A biblioteca ainda não tem faixas. Envie um arquivo acima ou crie uma faixa em Criar."
  },
  "notInstalled": {
    "stableAudio": {
      "text": "O Stable Audio 3 faz instrumentais e efeitos sonoros e move o repintar, o continuar e o cover do editor. Ele ficou de fora na instalação. Depois de instalado, baixe um modelo em Modelos e configurações ou direto no formulário do Stable Audio."
    }
  },
  "idea": {
    "guide": {
      "lead": "Uma frase entra, uma música sai, direto na página inicial. Você descreve uma música, um instrumental ou um som com suas palavras, um modelo de linguagem local escreve o prompt no formato do motor escolhido, você o edita se quiser e o motor faz a música.",
      "steps": [
        {
          "title": "Descreva a ideia",
          "text": "Uma ou duas frases: sobre o que é a música, o clima, quem canta, onde e quando. Para um instrumental: o gênero, os instrumentos e o clima."
        },
        {
          "title": "Escolha o tipo e o motor",
          "text": "Música com vocais, instrumental ou som, depois ACE-Step, YuE2 ou Stable Audio 3. Não dá para escolher um motor que não faz esse tipo; um som é sempre do Stable Audio."
        },
        {
          "title": "Compor",
          "text": "Clique em Compor: o assistente escreve o prompt logo abaixo da frase e mostra a etapa, a porcentagem e o texto conforme ele cresce. Você pode parar. Um som pula esta etapa: Compor abre o formulário do Stable Audio com a frase."
        },
        {
          "title": "Edite o prompt",
          "text": "As tags, a letra, o andamento, o tom e a duração podem ser mudados direto nos campos."
        },
        {
          "title": "Gerar",
          "text": "Gerar coloca as variantes na fila do motor, que o inicia quando chega a vez delas, e abre Criar: as variantes aparecem na lista da sessão, com o nome da ideia."
        }
      ],
      "writer": [
        "O assistente de prompts é um modelo de linguagem local, o Qwen3.5. Ele fica fiel à ideia e escreve a letra no idioma da ideia ou no que você escolher. O modelo dele é baixado na página Modelos.",
        "No ACE-Step, o próprio modelo de linguagem do ACE-Step também pode escrever o prompt enquanto o motor está rodando. É mais rápido, geralmente 5–20 s, mas foge mais da ideia.",
        "O idioma da letra é tirado das letras da ideia por padrão; você pode escolhê-lo em Mais, assim como quem escreve o prompt. Na página Criar, fica nas Configurações da linha da ideia."
      ],
      "after": [
        "Outra variante escreve o prompt de novo a partir da mesma ideia.",
        "Abrir no formulário coloca o prompt no formulário do motor na página Criar, com todas as configurações dele.",
        "A ideia e o prompt ficam quando você sai da página ou a recarrega. Depois de Gerar, são limpos para a próxima ideia; Redefinir os limpa à mão.",
        "Na página Criar, a mesma ideia fica na linha da ideia acima do formulário: Escrever coloca a letra e o estilo direto no formulário (Descrever, no Stable Audio), e Voltar ao que era restaura o formulário."
      ],
      "tips": [
        "O específico vence o genérico: \"um trem noturno saindo de uma cidade pequena\" rende mais que \"uma música triste\".",
        "Quer um gênero, uma voz ou instrumentos específicos? Cite-os na ideia.",
        "Leia a letra antes de gerar: um modelo pequeno nem sempre acerta a rima e a métrica.",
        "Não é o som que você queria? Tente outro motor com a mesma ideia: o prompt é reescrito no formato dele.",
        "Chuva, uma batida, passos são sons, não música: escolha Som, e a frase vai direto para o formulário do Stable Audio. Com Instrumental e o Stable Audio 3, o assistente percebe sozinho que você quer um som; o ACE-Step faz uma música a partir dessa ideia."
      ]
    }
  },
  "sa3Weights": {
    "allOnModels": "Todos os modelos, os checkpoints base e as configurações estão na página Modelos"
  },
  "autoTitle": {
    "accept": "Usar",
    "another": "Outro",
    "bulk": "Sugerir títulos",
    "bulkDone": "{n} faixa nomeada | {n} faixas nomeadas",
    "bulkFailed": "{n} nomeadas, depois parou: {error} | {n} nomeadas, depois parou: {error}",
    "bulkHint": "O assistente dá nome a cada faixa selecionada, uma por vez; «Desfazer» devolve os títulos antigos.",
    "bulkStopped": "Parado: {n} de {total} nomeadas",
    "bulkUndone": "Título antigo restaurado | Títulos antigos restaurados: {n}",
    "cancel": "Cancelar",
    "failed": "Não foi possível pensar em um título: {error}",
    "noAssistant": "O assistente de prompts não está pronto: baixe o modelo dele em Modelos.",
    "progress": "Nomeando {done} de {total}",
    "stop": "Parar",
    "suggest": "Sugerir um título",
    "working": "Pensando em um título…"
  },
  "covers": {
    "alt": "Capa de {title}",
    "another": "Outra capa",
    "bulk": "Criar capas",
    "bulkDone": "{n} capa criada | {n} capas criadas",
    "bulkFailed": "{n} não deram certo",
    "bulkHint": "Uma capa para cada faixa selecionada, uma após a outra; uma faixa que já tem capa recebe uma nova.",
    "bulkProgress": "Capas: {done} de {total}",
    "cancel": "Cancelar",
    "describe": "O que a imagem mostra",
    "describeHint": "Uma cena em poucas palavras; inglês funciona melhor. Texto na imagem é evitado automaticamente.",
    "dismiss": "Dispensar",
    "edit": "Editar a descrição…",
    "enable": "Criar capas de álbum para as faixas",
    "enableHint": "Adiciona uma imagem a cada música da biblioteca, do player e da sessão. Desligado: sem capas e sem botões de capa em lugar nenhum.",
    "engine": "Capas (Z-Image Turbo)",
    "failed": "A capa não deu certo: {error}",
    "fromAssistant": "Da ideia do assistente para esta faixa.",
    "installed": "instalado",
    "loadingPrompt": "Lendo a descrição…",
    "make": "Criar uma capa",
    "making": "Criando a capa…",
    "makingPct": "Criando a capa… {pct}%",
    "model": "Modelo: Z-Image Turbo, {gb} GB",
    "notInstalled": "não instalado",
    "notInstalledHint": "O modelo de capas não está neste computador. Instale-o com o instalador (a parte Capas) ou com o script de instalação.",
    "onButton": "Uma capa só é criada quando você aperta um botão: nos detalhes de uma faixa na biblioteca ou para as faixas selecionadas. Cada uma leva de 5 a 10 segundos; nesse tempo a GPU troca para o modelo de capas, e a próxima música carrega o motor dela de volta.",
    "parts": {
      "main": "Pesos do Z-Image Turbo",
      "server": "Servidor de imagens (stable-diffusion.cpp)"
    },
    "queued": "Aguardando na fila…",
    "remove": "Remover a capa",
    "removeConfirm": "Sim, remover",
    "stop": "Parar",
    "title": "Capas",
    "draw": "Desenhar",
    "withAssistant": "Fazer com o assistente",
    "withAssistantHint": "O assistente de prompts escreve uma descrição a partir do seu texto (em qualquer idioma) ou, com o campo vazio, da música; você pode editá-la antes de desenhar.",
    "putBack": "Restaurar",
    "anyLanguageHint": "Escreva em qualquer idioma: o assistente transforma o texto em uma descrição que o modelo de imagens entende.",
    "fromSaved": "A descrição usada para desenhar a última capa.",
    "noAssistant": "O assistente de prompts não está pronto: baixe o modelo dele em Modelos.",
    "describing": "Descrevendo a imagem…",
    "describingPct": "Descrevendo a imagem… {pct}%",
    "describeFailed": "O assistente não conseguiu descrever a imagem: {error}",
    "bulkDescribing": "Descrevendo {done} de {total}",
    "starting": "Iniciando o modelo de imagens…"
  },
  "takeCompare": {
    "best": "★ Melhor",
    "failed": "Não foi possível carregar",
    "keep": "Manter a melhor, mover as outras para a lixeira",
    "keepConfirm": "Mover {n} take para a lixeira? | Mover {n} takes para a lixeira?",
    "keepNeedStar": "Marque a melhor take com uma estrela para mantê-la.",
    "keepTooMany": "Marque só uma take com estrela: a que fica.",
    "keepWill": "Mantém {take}; a outra vai para a lixeira. | Mantém {take}; as outras {n} vão para a lixeira.",
    "kept": "{take} mantida; {n} take movida para a lixeira. | {take} mantida; {n} takes movidas para a lixeira.",
    "keys": "1–4 escolher take · Espaço reproduzir/pausar · ←/→ 5 s · Esc fechar",
    "loading": "Carregando…",
    "loadingAll": "carregando as takes…",
    "newestOf": "As {shown} mais recentes de {total} takes",
    "nowHearing": "Tocando agora: {take}",
    "open": "Comparar",
    "openTitle": "Comparar as takes desta música, A/B",
    "position": "{at} de {total}",
    "restored": "{n} take restaurada | {n} takes restauradas",
    "seed": "seed {seed}",
    "seek": "Posição",
    "takes": "Takes",
    "tileLabel": "{letter}, take {n}",
    "title": "Comparar takes"
  }
}
