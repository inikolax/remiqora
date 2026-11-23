// Strings added after the first translation (machine-translated from en, 743 keys);
// merged into the other parts key by key (see ../mergeParts).
export default {
  "aceGen": {
    "addLora": "Aggiungi il LoRA",
    "cfgIntervalOrder": "La guida «da» deve essere minore di «fino a».",
    "lengthAskedNote": "La durata arriva al modello come desiderio. Premi di nuovo quella scelta per lasciarla al modello.",
    "lengthByModelNote": "Da una descrizione il modello sceglie da solo la durata. Sceglila qui per chiedere la tua.",
    "loraName": "Nome del LoRA",
    "loraPath": "Cartella dell’adattatore LoRA",
    "manual": {
      "adg": "Guida adattiva (ADG)",
      "balancedOnly": "nella modalità Bilanciata",
      "baseOnly": "solo modelli base e SFT",
      "bpm": "Tempo",
      "cfgEnd": "Guida fino a (quota del percorso)",
      "cfgStart": "Guida da (quota del percorso)",
      "cotCaption": "Estendi la descrizione",
      "cotCaptionHint": "Attivo: il modello linguistico può riscrivere il testo dello stile prima che nasca la musica.",
      "cotLanguage": "Rileva la lingua",
      "cotLanguagePicked": "disattivato: resta la lingua scelta",
      "coverNoise": "Rumore mescolato alla sorgente",
      "coverRepaintOnly": "per una cover o un ritocco",
      "infer": "Metodo di decodifica",
      "latentCrossfade": "Giunzione dentro il modello",
      "length": "Durata",
      "lmCfg": "Aderenza al prompt",
      "lmNegative": "Cosa evitare",
      "lmSub": "scrive il piano del brano e completa ciò che manca",
      "lmTitle": "Modello linguistico",
      "loraScale": "Intensità del LoRA",
      "metaByModel": "lo sceglie il modello dalla descrizione",
      "musicSub": "ciò che si sa del brano in anticipo",
      "musicTitle": "Musica",
      "myLoras": "I miei LoRA: {n}",
      "needRef": "con un brano di riferimento",
      "noLm": "ACE-Step non lo carica su questa GPU",
      "noLmWithRef": "non usato con un brano di riferimento",
      "ode": "ODE: si ripete identico",
      "off": "off",
      "pickLora": "scegli prima un LoRA",
      "refSub": "cover e ritocco",
      "refTitle": "Brano di riferimento",
      "repaintMode": "Modalità di ritocco",
      "repaintModes": {
        "aggressive": "Audace",
        "balanced": "Bilanciata",
        "conservative": "Prudente"
      },
      "repaintOnly": "per ritoccare un intervallo",
      "repaintStrength": "Intensità del ritocco",
      "resultSub": "come consegnarlo",
      "sde": "SDE: con casualità",
      "sdeBaseWarn": "Su un modello base SDE in un test ha dato rumore invece di musica (32 passi). Su Turbo funziona, con un suono più scuro.",
      "shift": "Spostamento dello schema",
      "thinking": "Prima un piano (thinking)",
      "tiled": "Decodifica a tasselli",
      "turboSteps": "Turbo accetta da 1 a 8 passi: di più vengono ridotti a 8",
      "wavCrossfade": "Giunzione nell’audio"
    },
    "modeDescribe": "Da una descrizione",
    "modeLabel": "Da cosa partire",
    "modeOwn": "Testo e stile propri",
    "modelNote": "Turbo fa 8 passi. Gli altri modelli ci mettono di più; togliere o aggiungere una parte non funziona con tutti, e le attività che un modello non sa fare sono in grigio nella scheda Da un brano.",
    "noLmBaseNote": "Base e SFT si appoggiano a quel modello per voci pulite: in questa modalità la voce può suonare rumorosa e lontana. Per le voci passa a Testo e stile propri e scrivi il testo, oppure scegli Turbo.",
    "noLmNote": "Su questa scheda grafica (8 GB o meno) ACE-Step non carica il suo modello linguistico, quindi la tua descrizione arriva al modello come semplice prompt di stile, senza testo scritto.",
    "noVocal": "Senza voce",
    "noVocalHint": "Uno strumentale: nessun testo necessario, lo stile qui sotto definisce la musica.",
    "queuedStatus": "In coda, varianti: {n}",
    "refFile": "File audio di riferimento",
    "refOff": "Attivalo per lavorare da un brano finito: una cover, un intervallo rifatto, una parte tolta o aggiunta.",
    "removeLoraConfirm": "Rimuovere?",
    "removeLoraNamed": "Rimuovi il LoRA {name}",
    "repaintOrder": "La fine dell’intervallo deve venire dopo l’inizio.",
    "simple": {
      "auto": "auto",
      "fast": "veloce {n}",
      "formatHint": "mp3 occupa meno spazio; wav e flac mantengono il suono senza perdita.",
      "key": "Modo",
      "keyHint": "Maggiore suona più luminoso, minore più scuro e triste. La tonica e le altre scale si scelgono in Manuale.",
      "keyWish": "Da una descrizione il modello sceglie la tonalità. Un modo scelto qui gli arriva come desiderio.",
      "lengthHint": "Quanto dura il brano.",
      "lengthWish": "Da una descrizione il modello sceglie la durata. Quella scelta qui gli arriva come desiderio, non come garanzia.",
      "major": "maggiore",
      "medium": "medio {n}",
      "minor": "minore",
      "slow": "lento {n}",
      "tempo": "Tempo",
      "tempoHint": "Battiti al minuto. «Auto» lo lascia al modello; un numero esatto si imposta in Manuale.",
      "tempoWish": "Da una descrizione il modello sceglie il tempo. Quello scelto qui gli arriva come desiderio."
    },
    "tabChanged": "modificato",
    "tabs": {
      "ref": "Da un brano",
      "song": "Brano",
      "tuning": "Regolazioni"
    },
    "taskType": "Cosa fare con il brano",
    "taskUnsupported": "Non supportato da questo modello",
    "help": {
      "style": {
        "tips": [
          "L’ideale sono 5–9 tag: meno, e il modello riempie da solo i vuoti, rendendo il risultato meno prevedibile; di più, e i tag iniziano a entrare in conflitto.",
          "Metti prima genere e atmosfera: modellano il carattere generale del brano più degli altri tag.",
          "Non mescolare tag contraddittori nella stessa categoria (ad es. «aggressive» e «dreamy» insieme): il modello ne ignorerà uno oppure il risultato sarà confuso.",
          "Meglio scrivere i tag in inglese: i dati di addestramento sono in gran parte inglesi, quindi la precisione è maggiore, anche se il testo è in un’altra lingua.",
          "Un tempo impostato in Regolazioni (in Semplice, o come numero esatto in Manuale) è più affidabile di un tag testuale come «120 bpm» nello stile: usalo quando il tempo conta."
        ]
      },
      "lyrics": {
        "tips": [
          "Adatta il testo alla durata: ~2 minuti di solito bastano per 2 strofe + 2 ritornelli; per 3+ minuti aggiungi un bridge e un secondo gancio: un testo troppo lungo per una durata breve verrà «stipato» dal modello.",
          "Le righe brevi (5–10 sillabe) si adattano alla melodia in modo più prevedibile di quelle lunghe: se una riga è lunga, dividila in due.",
          "Un ritornello ripetuto (testo identico parola per parola in ogni [Chorus]) aiuta il modello a mantenere la stessa melodia per tutto il brano.",
          "Per un brano completamente strumentale, spunta «Senza voce» invece di scrivere un testo che è solo [Interlude]: è più affidabile.",
          "La punteggiatura (virgole, puntini di sospensione) influenza il fraseggio e le pause nella voce: usala con intenzione, non solo secondo le regole ortografiche."
        ]
      },
      "remix": {
        "unavailable": "L’insieme degli scenari disponibili dipende dal modello scelto: le opzioni non supportate nel modulo sono in grigio. Prova un altro modello (nella scheda Brano o in Regolazioni) se ti serve uno scenario specifico. Carica il file di riferimento in un formato da cui il modello può estrarre l’audio (wav/mp3/flac): file molto lunghi (diversi minuti) possono aumentare sensibilmente i tempi di elaborazione."
      },
      "advanced": {
        "title": "Regolazioni",
        "rows": [
          {
            "param": "Semplice e Manuale",
            "what": "Semplice ha poche scelte chiare: passi di decodifica (non su Turbo), durata, tempo (lento 80, medio 110, veloce 140), modo (maggiore o minore) e formato. Manuale ha ogni parametro in gruppi, e la console li mostra tutti insieme."
          },
          {
            "param": "Formato",
            "what": "Il formato del file di uscita. mp3 è più compatto e basta per l’ascolto; wav e flac sono senza perdita ma 5–10 volte più grandi."
          },
          {
            "param": "Tempo, tonalità, metro",
            "what": "Parametri musicali espliciti. Lasciati su auto, il modello li prende dal testo dello stile; impostali a mano solo quando serve precisione (per mixare con altri brani, ad esempio). Il metro è 2/4, 3/4, 4/4 o 6/8. Da una descrizione il modello li sceglie da solo: un tempo o una tonalità impostati qui gli arrivano come desiderio, e il metro resta a lui."
          },
          {
            "param": "Lingua della voce",
            "what": "La lingua in cui si canta. Su auto viene ricavata dal testo, il che può sbagliare con testi brevi o ambigui: impostala se la voce esce nella lingua sbagliata. Una lingua scelta a mano viene mantenuta, il modello linguistico non la sostituisce."
          },
          {
            "param": "Passi di decodifica",
            "what": "Il numero di passi di diffusione. Di più può significare audio più pulito ma generazione più lenta; oltre un certo punto il guadagno si sente appena. Turbo accetta da 1 a 8 (8 di default), i modelli SFT 50, i modelli base 32. In Semplice, Di più raddoppia il numero usuale."
          },
          {
            "param": "Aderenza allo stile",
            "what": "La guidance scale: quanto rigorosamente il modello segue la tua descrizione. Più alta segue più precisamente i tag di stile, ma valori molto alti rendono il suono aspro e pieno di artefatti; più bassa è più naturale ma meno prevedibile. Turbo non la usa. Il valore predefinito è 7, un intervallo ragionevole è di solito da 3 a 12."
          },
          {
            "param": "Seed",
            "what": "Sotto il modulo, accanto a Crea. Con il dado premuto ogni variante riceve un nuovo seed casuale. Un numero con le stesse altre impostazioni ripete quasi il risultato: comodo per cambiare un tag di stile e confrontare."
          },
          {
            "param": "Modello",
            "what": "Turbo è più veloce a scapito di un po’ di qualità e non fa ogni attività della scheda Da un brano; base e SFT sono più lenti ma più accurati e flessibili. Il modello si sceglie nella scheda Brano o in Manuale."
          },
          {
            "param": "LoRA",
            "what": "Un’aggiunta affinata sul modello, per un particolare timbro vocale o sottogenere, ad esempio. La sua intensità (da 0 a 1) stabilisce quanto influisce sul risultato: 1 è l’effetto pieno voluto dall’autore dell’adattatore, più basso lo fonde più delicatamente. Gli adattatori si aggiungono sotto I miei LoRA in Manuale, con un nome e una cartella."
          }
        ],
        "footer": "Ciò che lasci stare va con il valore predefinito del motore: non devi impostare tutto per ottenere un buon risultato. Ripristina rimette le righe proprie delle regolazioni e lascia stare il modello e la durata."
      }
    }
  },
  "aiPart": {
    "guide": {
      "scratch": [
        {
          "title": "Tempo, tonalità, durata",
          "text": "In un progetto vuoto imposta i BPM e la «Tonalità», e la durata in secondi nel pannello. 64 battute a 120 BPM sono 128 secondi."
        },
        {
          "title": "Parti dalla batteria",
          "text": "«Aggiungi una parte», strumento «Batteria». Le altre parti tengono il ritmo sulla batteria, quindi la batteria viene per prima."
        },
        {
          "title": "Basso, poi armonia",
          "text": "Basso, poi accordi: tastiera, pad. Lascia la batteria spuntata nell’elenco delle tracce che il modello ascolta."
        },
        {
          "title": "Melodia e colore",
          "text": "Lead, archi, percussioni. Bastano da cinque a sette parti; di più, e il mix si affolla."
        },
        {
          "title": "Scegli e regola il volume",
          "text": "Tieni la variante migliore di ogni parte e portala subito a un livello adatto."
        },
        {
          "title": "Costruisci il brano",
          "text": "Attiva «Magnete» e il righello in battute, taglia le parti con il Coltello e rimuovi i pezzi con la Gomma: un’intro, la sezione principale, uno stacco senza batteria e basso, un finale."
        }
      ],
      "scratchIntro": "L’arrangiatore può costruire un brano da un progetto vuoto. Le parti si aggiungono una alla volta e ognuna ascolta quelle già presenti, quindi l’ordine conta.",
      "scratchTitle": "Un brano da zero",
      "steps": [
        {
          "title": "Avvia il motore",
          "text": "L’arrangiatore gira su ACE-Step; ritocco, prosecuzione e cover possono girare anche su Stable Audio 3. Se il motore è fermo, il pannello offre di avviarlo con un pulsante, e allora il motore sulla GPU si ferma."
        },
        {
          "title": "Imposta il tempo e la tonalità",
          "text": "Prima della prima parte, imposta i BPM del progetto e la «Tonalità»: tonica e scala. Il modello li riceve a ogni richiesta. Non cambiare il tempo dopo le prime parti: uscirebbero dalla griglia."
        },
        {
          "title": "Scegli una modalità",
          "text": "«Aggiungi una parte», «Ritocca», «Prosegui» o «Cover». Il suggerimento accanto all’interruttore dice in una riga cosa farà il modello."
        },
        {
          "title": "Descrivi ciò che ti serve",
          "text": "Per una nuova parte, scegli lo strumento. Nella descrizione, indica il suono e come si suona. Scrivi nella tua lingua: «In inglese» la riscrive come il modello la legge meglio. Il «?» accanto al campo apre parole ed esempi pronti."
        },
        {
          "title": "Spunta ciò che il modello ascolta",
          "text": "Il modello si adatta alle tracce spuntate. Tieni la batteria: il modello ne segue la griglia."
        },
        {
          "title": "Indica dove",
          "text": "Tutto il brano o la regione di loop: attiva «Loop» e trascina la regione sul righello. «Ritocca» funziona solo sulla regione di loop."
        },
        {
          "title": "Genera e scegli",
          "text": "Le varianti finiscono su nuove tracce. «Ascolta» passa a una variante, «Tieni» rimuove le altre."
        }
      ],
      "tips": [
        "La descrizione funziona meglio in inglese, con brevi frasi separate da virgole. Scrivi nella tua lingua e premi «In inglese»; leggi il risultato e correggilo se serve.",
        "Descrivi una parte, non tutto il brano: cosa suona lo strumento e come suona.",
        "Costruisci il brano per passi: batteria, poi basso, poi armonia, poi melodia. Ogni parte successiva ascolta le precedenti.",
        "Non ti piace una variante? Genera di nuovo: ogni esecuzione usa nuovi seed casuali.",
        "Dopo ogni nuova parte, imposta il suo volume prima di aggiungere la successiva: la parte successiva ascolta il mix com’è ora.",
        "Quando le parti sono pronte, costruisci il brano con esse: taglia le tracce sulle battute con il Coltello (C) e rimuovi i pezzi con la Gomma (E), in modo che gli strumenti entrino uno dopo l’altro.",
        "Per la voce, scrivi il testo e controlla «Lingua della voce»: su «Auto» viene ricavata dalle lettere.",
        "ACE-Step porta ogni risultato a -1 dBFS, quindi una nuova parte arriva forte: abbassala con il cursore del volume della traccia.",
        "Per finire il brano in un’altra DAW, esporta «Stem + Reaper» o DAWproject.",
        "Ritocco, prosecuzione e cover possono girare anche su Stable Audio 3: sceglilo come motore nel pannello. Riempie e prosegue ascoltando l’audio attorno all’intervallo, in pochi secondi, solo strumentale. Aggiungere una parte resta ad ACE-Step."
      ]
    },
    "toEnglish": "In inglese",
    "toEnglishBusy": "Scrivo…",
    "toEnglishDone": "Riscritto in inglese dall’assistente; modificalo se serve.",
    "toEnglishFailed": "L’assistente non è riuscito a scrivere la descrizione.",
    "toEnglishGpu": "L’assistente per i prompt è impostato per girare sulla GPU e scaricherebbe il modello. Passalo su Auto o CPU nella pagina Modelli.",
    "toEnglishTitle": "Descrivilo in qualsiasi lingua: l’assistente per i prompt lo riscrive in inglese, come il modello lo legge meglio",
    "toEnglishUndo": "Annulla"
  },
  "create": {
    "closeTool": "Chiudi",
    "deleteAsk": "Eliminare?",
    "details": "Dettagli",
    "download": "Scarica",
    "emptyAll": "I tuoi brani appariranno qui",
    "emptyHint": "Scegli un motore, compila il modulo o scrivi una frase nella riga dell’idea sopra, e premi Crea.",
    "emptyPeriod": "In questo periodo non è stato creato nulla",
    "engine": "Motore",
    "engineTitle": "{name}: {status}",
    "engines": {
      "ace_step": "Veloce, cover",
      "stable_audio": "Suoni e loop",
      "yue2": "Brani con voce"
    },
    "failed": "Non ha funzionato. Caricalo nel modulo e premi di nuovo Crea.",
    "idea": {
      "chip": {
        "description": "Descrizione",
        "length": "Durata",
        "lyrics": "Testo",
        "style": "Stile",
        "tempo": "Tempo e tonalità"
      },
      "describe": "Descrivi",
      "dismiss": "Chiudi",
      "formChanged": "Il modulo è stato modificato.",
      "noAssistant": "L’assistente per i prompt non è pronto: scarica il suo modello in Modelli e impostazioni (l’ingranaggio nell’intestazione).",
      "noAssistantLink": "Scaricalo in Modelli",
      "noAssistantNote": "L’assistente per i prompt ha bisogno del suo modello.",
      "placeholder": {
        "ace_step": "In una frase: che musica vuoi",
        "stable_audio": "In una frase: cosa deve suonare",
        "yue2": "In una frase: di cosa parla il brano"
      },
      "replaces": "Sostituisce ciò che c’è ora nel modulo",
      "settings": "Impostazioni",
      "stop": "Ferma",
      "stopping": "Mi fermo…",
      "undo": "Rimetti ciò che c’era",
      "write": "Scrivi il testo e lo stile",
      "writeSa": "Scrivi la descrizione",
      "writeShort": "Scrivi",
      "writing": "L’assistente sta scrivendo…",
      "written": "Inserito nel modulo qui sotto.",
      "writtenOther": "Inserito nel modulo di {name}.",
      "saKind": "Scrivi",
      "saKinds": {
        "auto": "Auto: in base all'idea",
        "music": "Brano musicale",
        "instrument": "Strumento solista",
        "one_shot": "Campione one-shot",
        "sfx": "Effetto sonoro"
      }
    },
    "lessDetails": "Meno",
    "live": {
      "failed": "Variante non riuscita: {name}. {reason}",
      "queue": "Varianti in coda: {n}",
      "ready": "Variante pronta: {name}",
      "readyMany": "Varianti pronte: {n}, {name}"
    },
    "loading": "Caricamento dei brani…",
    "making": "In creazione",
    "menu": {
      "made": "Creato {when}, durata {len}",
      "midi": "In MIDI",
      "rename": "Rinomina",
      "stems": "Dividi in stem",
      "took": "ci sono voluti {s} s"
    },
    "models": "Modelli",
    "more": "Dettagli e azioni",
    "pause": "Pausa",
    "peek": {
      "copied": "Copiato",
      "copy": "Copia",
      "lines": "{n} righe",
      "lyrics": "Testo",
      "noLyrics": "Nessun testo",
      "style": "Stile",
      "tags": "{n} tag"
    },
    "period": "Periodo",
    "periodHint": {
      "all": "Tutto ciò che è stato creato finora.",
      "today": "Varianti create oggi. Quelle con la stella finiscono sotto Preferiti nella libreria.",
      "week": "Varianti degli ultimi sette giorni."
    },
    "periods": {
      "all": "Tutto",
      "today": "Oggi",
      "week": "7 giorni"
    },
    "play": "Riproduci",
    "position": "Posizione nel brano",
    "queued": "In coda",
    "reuse": "Carica nel modulo",
    "reuseInForm": "Carica nel modulo",
    "session": "Sessione",
    "showAll": "Mostra tutto: {n}",
    "showMore": "Mostra altro: {n}",
    "startAndCreate": "Avvia {name} e crea",
    "startFailed": "{name} non si è avviato.",
    "startingEngine": "Avvio di {name}…",
    "startsOnCreate": "{name} ora non è in esecuzione. Parte quando premi Crea; la prima variante dopo l’avvio richiede più tempo.",
    "startsOnCreateOther": "Ora la GPU è occupata da {other}. {name} parte quando premi Crea e {other} si ferma. La prima variante dopo l’avvio richiede più tempo.",
    "stop": "Ferma",
    "stopAsk": "Fermare?",
    "stopConfirm": "Premi di nuovo per fermare: ciò che è stato creato finora andrà perso",
    "stopped": "Fermato.",
    "styleAndLyrics": "Stile e testo",
    "takeN": "Variante {n}",
    "takeTitle": "{title}, variante {n}",
    "takes": "Varianti: {n}",
    "toSession": "All’elenco della sessione, varianti: {n}",
    "untitled": "Senza titolo",
    "wholeLibrary": "Tutta la libreria"
  },
  "favorite": {
    "add": "Aggiungi ai preferiti",
    "remove": "Rimuovi dai preferiti"
  },
  "header": {
    "create": "Crea",
    "desc": {
      "create": "Brani, strumentali e suoni",
      "library": "Ogni brano: creato, caricato e dall’editor"
    },
    "gpuFree": "GPU libera",
    "home": "Home",
    "languageCurrent": "Lingua dell’interfaccia: {name}",
    "library": "Libreria",
    "more": "Altro: lingua, modelli, aiuto",
    "guide": {
      "mapTitle": "Le parti dell’app",
      "map": {
        "idea": "Il modo più semplice per cominciare, proprio nella home: una frase e Componi, e un modello linguistico locale scrive il prompt per il motore. Modificalo e genera il brano.",
        "lora": "Affina ACE-Step sui tuoi brani: carica l’audio, etichetta in automatico, controlla le descrizioni, addestra ed esporta. Si apre nella pagina Crea, sotto ACE-Step; l’adattatore finito compare nel modulo di ACE-Step.",
        "yue": "Il secondo motore: scrive un brano intero con voce e può costruirlo attorno a una melodia data (la scheda Melodia, con SheetSage2). Trasforma anche un brano in MIDI."
      },
      "gpu": [
        "I motori non stanno insieme sulla GPU, quindi ne gira uno alla volta. Un motore si sceglie nella pagina Crea e parte quando premi Crea nel suo modulo; quello in esecuzione si ferma.",
        "Il primo avvio richiede qualche minuto mentre il modello si carica nella memoria video. Il pulsante di stato nell’intestazione mostra il motore sulla GPU e quanto è piena la memoria video; un clic mostra chi occupa quanta memoria, il pulsante Scarica e il percorso verso Modelli.",
        "Scaricare ferma una generazione o un addestramento in corso, perciò il pulsante chiede prima conferma."
      ],
      "steps": [
        {
          "title": "Apri ACE-Step",
          "text": "Vai su Crea e scegli ACE-Step. Parte alla prima pressione di Crea; il primo avvio richiede qualche minuto."
        },
        {
          "title": "Descrivi il brano",
          "text": "Nella scheda Brano, Da una descrizione: bastano un paio di frasi, il genere, l’atmosfera, di cosa parla il testo. Scegli la durata e quante varianti."
        },
        {
          "title": "Scegli la variante migliore",
          "text": "Le varianti si allineano nell’elenco della sessione accanto al modulo (sotto, su telefono). Tutto ciò che viene creato si salva da solo nella libreria."
        },
        {
          "title": "Dividi in stem",
          "text": "Voce, batteria, basso e altro con un clic: Dividi in stem nel menu di una variante, la scheda Stem e note nella libreria, o direttamente nell’editor."
        },
        {
          "title": "Costruiscilo nell’editor",
          "text": "Disponi gli stem sulle corsie, aggiungi parti con l’arrangiatore IA, imposta gli effetti."
        },
        {
          "title": "Esporta",
          "text": "Mixa in WAV o MP3, oppure esporta le corsie con un progetto Reaper o DAWproject."
        }
      ],
      "compare": [
        {
          "label": "Ideale per",
          "ace": "Brani e strumentali veloci, molte varianti di seguito",
          "yue": "Un brano intero con voce in un colpo solo",
          "sa3": "Strumentali, effetti sonori e campioni; riempie e prosegue l’audio nell’editor"
        },
        {
          "label": "Lavorare da un brano",
          "ace": "Cover, ritocco di una sezione, aggiunta o estrazione di una parte, continuazione",
          "yue": "Un brano sulla melodia di un altro: la scheda Melodia, con SheetSage2 o un file MIDI",
          "sa3": "Ritocco di un intervallo, continuazione, cover in un altro stile (audio-to-audio); nessuna parte sopra un mix"
        },
        {
          "label": "Il tuo stile",
          "ace": "Un LoRA addestrato sui tuoi brani",
          "yue": "No",
          "sa3": "No (il supporto LoRA è previsto)"
        },
        {
          "label": "Durata",
          "ace": "Da 10 a 300 secondi, 1, 2 o 4 varianti per esecuzione",
          "yue": "Quanto dura il testo, oppure da 1 a 8 minuti; da 1 a 4 varianti per esecuzione",
          "sa3": "Fino a 6 minuti (medium) o 2 minuti (small); 1, 2 o 4 varianti per esecuzione, secondi per esecuzione"
        },
        {
          "label": "MIDI",
          "ace": "No",
          "yue": "Un brano o stem in MIDI (MuScriptor)",
          "sa3": "No"
        },
        {
          "label": "Licenza",
          "ace": "MIT: uso commerciale consentito; controlla i termini attuali prima di pubblicare",
          "yue": "Solo uso non commerciale",
          "sa3": "Stability AI Community License: gratuita sotto 1M USD l’anno; solo strumentale, senza voce"
        }
      ]
    },
    "helpSections": {
      "idea": {
        "title": "Comporre da un’idea",
        "text": "Nella home descrivi un brano, uno strumentale o un suono in una o due frasi e scegli il motore; la lingua del testo e chi scrive il prompt sono sotto Altro. In Componi l’assistente per i prompt, un modello Qwen3.5 locale, scrive il prompt nel formato del motore: tag di stile, testo in sezioni, tempo e tonalità. Modificalo, genera, o aprilo nel modulo del motore. Un suono salta l’assistente e va dritto a Stable Audio. Nella pagina Crea la stessa idea sta nella riga dell’idea sopra il modulo e scrive direttamente al suo interno. Il modello e il dispositivo dell’assistente si impostano in Modelli e impostazioni."
      },
      "engines": {
        "text": "Tre motori generano audio, ACE-Step 1.5, YuE2-3B e Stable Audio 3, e non stanno insieme su una GPU, quindi ne gira uno alla volta. Scegli un motore nella pagina Crea: parte quando premi Crea, e quello in esecuzione si ferma da solo. La spia mostra il suo stato; il primo avvio può richiedere qualche minuto mentre il modello si carica nella memoria video. Il pulsante di stato nell’intestazione mostra cosa occupa la GPU e può scaricarlo."
      },
      "ace": {
        "text": "Nella scheda Brano descrivi la musica a parole (Da una descrizione) oppure dai tag di stile e testo con i marcatori [Verse] / [Chorus] (Testo e stile propri), oppure spunta Senza voce. Nella scheda Da un brano un brano di riferimento crea una cover, ritocca una sezione, estrae o aggiunge una parte, o completa una composizione. La durata è 10-300 s, con 1, 2 o 4 varianti per esecuzione. Regolazioni ha Semplice (passi, durata, tempo, modo, formato) e Manuale (ogni parametro); un LoRA addestrato si attiva lì, con un’intensità da 0 a 1."
      },
      "yue": {
        "text": "YuE2-3B scrive brani interi con voce. La scheda Brano contiene il testo, lo stile, la durata e la qualità. La scheda Melodia imposta il piano della melodia: Nessun piano va dritto all’audio, Segui una melodia mantiene una melodia data e inventa l’accompagnamento, Melodia e accordi scrive prima un piano di entrambi. SheetSage2 (Da un brano…) scrive la melodia di un brano come spartito ABC, che puoi modificare e restituire a YuE2."
      },
      "sa3": {
        "text": "Stable Audio 3 crea musica strumentale ed effetti sonori da una descrizione in pochi secondi: scegli Musica o Suono, descrivilo come farebbe una libreria di campioni (genere, strumenti, atmosfera, tempo, oppure la fonte di un suono e come nasce), imposta la durata e il numero di varianti. Non c’è la voce. Lo stesso motore serve l’arrangiatore IA e i Campioni dell’editor, dove ritocca, prosegue e fa cover ascoltando l’audio ai due lati dell’intervallo. I pesi principali sono ad accesso limitato: accetta la licenza su Hugging Face, salva il tuo token e scarica un modello in Modelli e impostazioni."
      },
      "lora": {
        "text": "L’addestramento LoRA sta sotto ACE-Step nella pagina Crea, accanto a Genera (su telefono, un interruttore sopra il modulo). L’addestramento richiede ACE-Step in esecuzione, e la pagina offre di avviarlo. Guida attraverso l’intero processo di affinamento: carica audio, etichettatura automatica, revisione e modifica delle descrizioni, preelaborazione, addestramento con avanzamento in tempo reale ed esportazione. Un adattatore finito viene aggiunto all’elenco LoRA nel modulo di ACE-Step."
      },
      "stems": {
        "text": "Qualsiasi brano salvato può essere diviso in quattro stem (voce, batteria, basso, altro) con un clic: Dividi in stem nel menu di una variante, la scheda Stem e note nella libreria, o una traccia nell’editor. Gli stem possono aprirsi nell’editor come progetto pronto a quattro tracce. La trascrizione MIDI (MuScriptor) funziona sul mix completo o su un singolo stem; gira sul motore YuE2, quindi YuE2 deve essere installato."
      },
      "arranger": {
        "text": "Il pulsante «Arrangiatore IA» nell’editor costruisce un pezzo passo dopo passo invece di generarlo intero. «Aggiungi una parte» scrive una nuova parte (batteria, basso, pad, archi e così via) sulle tracce scelte, «Ritocca» riscrive un intervallo debole, «Prosegui» porta avanti il brano, «Cover» crea una nuova versione in un altro stile. Ogni variante finisce su una traccia propria: ascolta, tieni la migliore e passa alla parte successiva. Le parti vengono aggiunte dal modello base di ACE-Step (circa 4.8 GB) o dalla sua versione base XL più grande (circa 20 GB, richiede una scheda da 16 GB); entrambi sono facoltativi, e senza il modello base l’arrangiatore offre di installarlo. Le altre modalità girano su turbo, o su Stable Audio 3 quando lo scegli come motore: riempie, prosegue e fa cover ascoltando l’audio circostante, solo strumentale."
      },
      "sfx": {
        "text": "Il pulsante «Campioni» nell’editor crea one-shot (un kick, un colpo, un whoosh), loop al tempo del progetto e texture (pioggia, folla, un drone) con Stable Audio 3, da una breve descrizione. I risultati si allineano in una striscia: prima ascolta, poi aggiungi quello che ti piace a una nuova traccia o alla traccia selezionata alla testina. I loop sono tagliati a battute intere ma il modello non garantisce una giunzione senza stacchi, quindi controllali in ripetizione. «Rimuovi dall’elenco» elimina i suoni del lavoro dalla libreria e dal disco, tranne quelli su una corsia in quel momento."
      }
    }
  },
  "home": {
    "allTracks": "Tutta la libreria",
    "compose": "Componi",
    "composeHere": "L’assistente scrive il prompt per il motore scelto; puoi modificarlo prima di generare",
    "composeSound": "L’assistente scrive un prompt per il suono con la durata, Stable Audio lo crea",
    "engineLabel": "Motore",
    "engines": "Oppure vai direttamente a un motore",
    "firstText": "Descrivi un brano o prendi un esempio:",
    "firstTitle": "I tuoi brani appariranno qui",
    "guide": "Come funziona la composizione",
    "kind": {
      "instrumental": "Strumentale",
      "song": "Brano con voce",
      "sound": "Suono"
    },
    "kindLabel": "Cosa creare",
    "lead": "Tutto gira su questo computer",
    "loading": "Caricamento dei brani",
    "more": "Altro",
    "needPhrase": "Prima descrivi la musica",
    "title": "Cosa creiamo?",
    "phraseLabel": "Descrivi la musica",
    "placeholderSound": "pioggia su un tetto di lamiera di notte, vicina e calma",
    "soundBySa3": "I suoni li crea Stable Audio",
    "soundMissing": "Stable Audio non è installato"
  },
  "keyScale": {
    "hint": "ACE-Step conosce solo maggiore e minore. Per questa scala riceve la tonalità più vicina ({key}) e il nome della scala nella descrizione: un suggerimento, non una garanzia.",
    "mode": "Scala",
    "modes": {
      "blues": "Blues",
      "dorian": "Dorica",
      "double_harmonic": "Doppia armonica",
      "harmonic_minor": "Minore armonica",
      "hungarian_minor": "Minore ungherese",
      "locrian": "Locria",
      "lydian": "Lidia",
      "major": "Maggiore (Ionica)",
      "major_pentatonic": "Pentatonica maggiore",
      "melodic_minor": "Minore melodica",
      "minor": "Minore naturale (Eolia)",
      "minor_pentatonic": "Pentatonica minore",
      "mixolydian": "Misolidia",
      "phrygian": "Frigia",
      "phrygian_dominant": "Frigia dominante"
    },
    "needTonic": "Scegli prima la nota della tonalità",
    "none": "Nessuna scala simile",
    "notSet": "non impostata",
    "search": "Scrivi per cercare",
    "tonic": "Tonica"
  },
  "libraryPage": {
    "aiPart": "Una parte dell’arrangiatore IA",
    "collectionName": "Nome della raccolta",
    "confirmDeleteCollection": "Rimuovere la raccolta?",
    "cot": {
      "full": "melodia e accordi",
      "melody": "segue una melodia"
    },
    "delete": "Elimina",
    "deleteCollection": "Rimuovi la raccolta (i suoi brani restano)",
    "deleteFailed": "Impossibile eliminare: {error}",
    "emptyCollection": "Apri un brano e aggiungilo a questa raccolta nella scheda Info.",
    "emptyFavorites": "Segna un brano con la stella e comparirà qui.",
    "emptyHere": "Ancora niente qui",
    "emptyHint": "I brani che crei e carichi si raccolgono qui.",
    "facts": {
      "file": "File",
      "madeIn": "Creato in",
      "melody": "Melodia",
      "model": "Modello"
    },
    "filters": {
      "all": "Tutti i brani",
      "favorites": "Preferiti",
      "midi": "Note (MIDI)",
      "score": "Spartito",
      "stems": "Stem",
      "today": "Oggi"
    },
    "filtersLabel": "Filtri della libreria",
    "groups": {
      "collections": "Raccolte",
      "has": "Cosa ha il brano",
      "origin": "Creato da",
      "tags": "Tag"
    },
    "loadFailed": "Impossibile caricare la libreria.",
    "newCollection": "+ Nuova raccolta",
    "newest": "Prima i più recenti",
    "noCollections": "Ancora nessuna raccolta: crea la prima con Nuova raccolta.",
    "nothingFound": "Nessun risultato",
    "nothingFoundHint": "Prova un’altra parola o un altro filtro.",
    "oldest": "Prima i più vecchi",
    "order": "Ordine",
    "origins": {
      "editor": "Editor",
      "upload": "Caricato"
    },
    "period": "Periodo",
    "pick": "Scegli un brano: qui compaiono testo, stile, stem e note.",
    "renameCollection": "Rinomina la raccolta",
    "retry": "Riprova",
    "reuseHint": "Apre Crea con questo testo, stile e impostazioni",
    "search": "Titolo, stile o una riga del testo",
    "showAll": "Mostra tutti i brani",
    "sub": {
      "editor": "Dall’editor",
      "engine": "Nessuna descrizione",
      "upload": "File caricato"
    },
    "tabs": {
      "about": "Info",
      "lyrics": "Testo",
      "parts": "Stem e note"
    },
    "take": "Variante {n}",
    "title": "Libreria",
    "toCreate": "Crea il primo brano",
    "today": "Oggi",
    "yesterday": "Ieri",
    "bulk": {
      "addTag": "Aggiungi #{tag}",
      "clear": "Annulla la selezione (Esc)",
      "collected": "{n} brano aggiunto a «{name}» | {n} brani aggiunti a «{name}»",
      "collection": "Raccolta",
      "favorited": "{n} brano aggiunto ai preferiti | {n} brani aggiunti ai preferiti",
      "label": "Azioni sui brani selezionati",
      "newCollection": "Nuova raccolta…",
      "noTags": "Ancora nessun tag: scrivine uno e premi Invio.",
      "selectAll": "Seleziona tutto: {n}",
      "selectSong": "Seleziona «{title}» con le sue take: {n}",
      "selectTrack": "Seleziona «{title}»",
      "selected": "Selezionati: {n}",
      "tag": "Tag",
      "tagPlaceholder": "Un nuovo tag, o cercane uno",
      "tagged": "#{tag} aggiunto a {n} brano | #{tag} aggiunto a {n} brani",
      "uncollected": "{n} brano tolto da «{name}» | {n} brani tolti da «{name}»",
      "unfavorited": "{n} brano tolto dai preferiti | {n} brani tolti dai preferiti",
      "untagged": "#{tag} tolto da {n} brano | #{tag} tolto da {n} brani"
    },
    "emptyTag": "Aggiungi questo tag a un brano nella sua scheda Info, o a più brani insieme dalla barra di selezione.",
    "tags": {
      "add": "Aggiungi un tag e premi Invio",
      "added": "Tag #{tag} aggiunto",
      "confirmDelete": "Rimuovere il tag?",
      "delete": "Togli il tag da tutti i brani",
      "remove": "Rimuovi il tag #{tag}",
      "removed": "Tag #{tag} rimosso",
      "rename": "Rinomina il tag"
    },
    "trash": {
      "confirmEmpty": "Eliminarli tutti definitivamente?",
      "confirmPurge": "Eliminare definitivamente?",
      "deleted": "Eliminato: {when}",
      "dismiss": "Nascondi l’avviso",
      "emptied": "Il cestino è vuoto adesso",
      "empty": "Svuota il cestino",
      "emptyHere": "Il cestino è vuoto",
      "emptyHint": "I brani eliminati restano qui per 30 giorni, nel caso ne volessi riavere uno.",
      "loadFailed": "Impossibile caricare il cestino: {error}",
      "moveHint": "Sposta il brano nel cestino: da lì si può ripristinare per 30 giorni",
      "moved": "{n} brano spostato nel cestino | {n} brani spostati nel cestino",
      "note": "I brani nel cestino vengono eliminati definitivamente dopo 30 giorni.",
      "purge": "Elimina per sempre",
      "purged": "{n} brano eliminato definitivamente | {n} brani eliminati definitivamente",
      "restore": "Ripristina",
      "restored": "{n} brano ripristinato | {n} brani ripristinati",
      "title": "Cestino",
      "undo": "Annulla"
    }
  },
  "midiPanel": {
    "betterWithVocals": "Funziona dal mix completo; per una melodia esatta, dividi prima il brano in stem e riconosci la voce.",
    "scoreEmpty": "Il MIDI non ha note da cui ricavare uno spartito.",
    "scoreFromFull": "dal mix completo",
    "scoreFromStems": "melodia dalla voce, accompagnamento dal basso e dal resto",
    "scoreFromVocals": "melodia dalla voce",
    "scoreInserted": "Lo spartito è nel modulo di YuE2 ({from}).",
    "toScore": "In uno spartito YuE2",
    "toScoreHint": "Trasforma le note in uno spartito ABC per YuE2 e lo inserisce nel suo modulo: la voce diventa la melodia, il basso e il resto l’accompagnamento e gli accordi."
  },
  "miniWave": {
    "percent": "{n}%",
    "timeOf": "{pos} di {total}"
  },
  "models": {
    "check": "Verifica",
    "checkBad": "Danneggiati o mancanti: {files}. Scarica di nuovo questa parte.",
    "checkFailed": "Impossibile verificare: {error}",
    "checkOffline": "Hugging Face non è raggiungibile, quindi sono state confrontate solo le dimensioni.",
    "checkOkHash": "Tutti i {n} file sono integri; {h} corrispondono allo SHA-256 elencato da Hugging Face.",
    "checkOkRecord": "Tutti i {n} file corrispondono alla loro registrazione per dimensione.",
    "checkOkSize": "Tutti i {n} file sono integri (verificati per dimensione e struttura; non c’è un elenco di checksum con cui confrontare).",
    "checkOutdated": "Integri, ma il repository ora contiene una versione più recente di: {files}. Scarica di nuovo per ottenerla.",
    "checkTitle": "Verifica che i file siano integri",
    "checking": "Verifica…",
    "parts": {
      "yue2-bf16": {
        "name": "YuE2 bf16",
        "text": "Il modello non quantizzato. Richiede più memoria video di q8_0 (la più alta dei tre)."
      }
    },
    "reinstall": "Scarica di nuovo",
    "reinstallAsk": "Scaricare di nuovo {gb} GB?",
    "reinstallNamed": "Scarica di nuovo {name}",
    "reinstallNo": "Mantieni",
    "reinstallTitle": "Scaricalo di nuovo e sostituisci i file",
    "reinstallYes": "Scarica di nuovo",
    "yue2": {
      "noSettings": "La precisione q8_0, q4_0 o bf16 si sceglie per ogni generazione nel modulo di YuE2, con Qualità."
    }
  },
  "params": {
    "changed": "Modificato",
    "consoleNote": "I valori impostati a mano sono evidenziati. Il resto va con il valore predefinito.",
    "consoleTitle": "Console di {name}",
    "default": "Predefinito: {v}",
    "quick": "Scelta rapida: {group}",
    "reset": "Torna al predefinito",
    "resetOne": "Riporta {name} al predefinito",
    "simple": {
      "more": "Di più: {n}",
      "normal": "Normale: {n}",
      "steps": "Passi di decodifica",
      "stepsHint": "Più passi richiedono più tempo."
    }
  },
  "player": {
    "close": "Chiudi il player",
    "label": "Player",
    "next": "Brano successivo",
    "prev": "Brano precedente (dall’inizio, se il brano è in corso)"
  },
  "presets": {
    "button": "Preset",
    "confirmDelete": "Fai di nuovo clic per eliminare {name}",
    "deleteAsk": "Eliminare?",
    "deleteOne": "Elimina il preset {name}",
    "none": "Ancora nessun preset salvato.",
    "saveCurrent": "Salva il modulo come preset",
    "title": "Preset: insiemi salvati delle impostazioni del modulo"
  },
  "resources": {
    "ramOf": "RAM {used} di {total} GB",
    "state": {
      "error": "{model} ha segnalato un errore",
      "running": "{model} è in esecuzione",
      "starting": "{model} si sta avviando",
      "stopping": "{model} si sta fermando"
    },
    "vramOf": "Memoria video {used} di {total} GB",
    "holder": {
      "cover": "Copertine (Z-Image Turbo)"
    }
  },
  "sa3Gen": {
    "badGuidanceWindow": "La guida termina a un livello di rumore più alto di quello a cui inizia: abbassa «termina a» o alza «inizia a».",
    "formTabs": "Sezioni del modulo",
    "kindLabel": "Tipo di audio",
    "lengthFromRef": "La durata è data dal brano di riferimento:",
    "lengthOwn": "propria: {v}",
    "lengthSeconds": "{n} s",
    "manual": {
      "apg": "Quota APG",
      "autoTags": "Tag di servizio",
      "cfg": "Aderenza alla descrizione",
      "cfgStartsAt": "La guida inizia al livello di rumore",
      "cfgStopsAt": "La guida termina al livello di rumore",
      "chunked": "Decodifica a blocchi",
      "chunkedAuto": "Auto",
      "duration": "Durata",
      "fromRef": "data dal brano di riferimento",
      "guidanceSub": "come la descrizione guida il suono; il livello di rumore scende da 1 a 0 durante l’esecuzione",
      "guidanceTitle": "Guida",
      "needCfg": "quando l’aderenza alla descrizione non è 1",
      "needTwo": "con due varianti o più",
      "negative": "Cosa evitare",
      "normThreshold": "Limite di un passo di guida",
      "off": "No",
      "on": "Sì",
      "padding": "Margine di durata",
      "perVariant": "Una descrizione per variante",
      "resultSub": "la durata e la descrizione",
      "resultTitle": "Risultato",
      "sampler": "Sampler",
      "samplerAuto": "predefinito (pingpong)",
      "samplerAutoBase": "il predefinito del modello",
      "samplerLoud": "Più forte del solito e tagliato: in un test l’1-2% del suono toccava il massimo.",
      "samplerQuiet": "Circa 7 dB più piano del solito.",
      "samplerSub": "come viene calcolato ogni passo",
      "samplerTitle": "Sampler",
      "scalePhi": "Ammorbidisci la guida",
      "textOnly": "solo senza brano di riferimento",
      "trim": "Taglia il silenzio all’inizio"
    },
    "modelsAfterStart": "L’elenco dei modelli compare quando il motore è in esecuzione.",
    "queuedNote": "Varianti in coda: {n}",
    "ref": {
      "modeLabel": "Cosa fare con il riferimento",
      "off": "Attivalo per lavorare da un brano finito: rifarlo, rifare un intervallo o proseguirlo."
    },
    "simple": {
      "tagsOff": "Non aggiungere",
      "tagsOn": "Aggiungi"
    },
    "submitKind": {
      "music": "Crea musica",
      "sfx": "Crea un suono"
    },
    "tabChanged": "modificato",
    "tabs": {
      "ref": "Da un brano",
      "sound": "Descrizione",
      "tuning": "Regolazioni"
    },
    "advancedHint": "Il dado accanto al seed lo rende di nuovo casuale; un numero ripete quel suono. I modelli post-addestrati sono tarati per 8 passi e aderenza 1; Cosa evitare e il gruppo Guida funzionano solo quando l’aderenza alla descrizione non è 1.",
    "advancedHintBase": "Un checkpoint base: parte con 50 passi e aderenza 7, quindi Cosa evitare funziona; prova «poor quality» lì.",
    "help": {
      "tips": [
        "Musica: genere, strumenti e come suona ciascuno, atmosfera ed energia, tempo in BPM.",
        "Un suono: cosa lo produce, come avviene e per quanto, dove si trova il microfono e come suona la stanza.",
        "I tag aiutano: TrackType: Music, VocalType: Instrumental, Genre: Funk, Instruments: Guitar, Saxophone; TrackType: Instrument per una parte solista; TrackType: SFX per un suono.",
        "Niente voce: il modello crea strumentali; un prompt vocale dà al massimo texture senza parole.",
        "Scrivi un seed per ripetere un risultato; con il dado premuto ogni variante ne riceve uno nuovo."
      ]
    },
    "translateBtn": "Traduci soltanto",
    "translateHint": "Stable Audio capisce solo l’inglese: l’assistente può scrivere un prompt in inglese dal tuo testo, o solo tradurlo.",
    "translateNoAssistant": "L'assistente per i prompt non è pronto: scarica il suo modello in Modelli.",
    "translateRunning": "Traduzione in corso…",
    "translateStopping": "Arresto in corso…",
    "translateStop": "Ferma",
    "translateDone": "Tradotto in inglese.",
    "translateUndo": "Ripristina",
    "composeBtn": "Scrivi il prompt",
    "composeTitle": "L’assistente trasforma la descrizione, in qualsiasi lingua, in un prompt per Stable Audio: genere, strumenti, suono, tempo e durata",
    "composeRunning": "Scrivo il prompt…",
    "composeDone": "Il prompt per Stable Audio è pronto."
  },
  "tagInput": {
    "cleared": "Tutti i tag cancellati",
    "removeTag": "Rimuovi {tag}",
    "removed": "{tag} rimosso",
    "restored": "Tag ripristinati",
    "undo": "Annulla",
    "undoTitle": "Riporta i tag cancellati"
  },
  "yueGen": {
    "help": {
      "advanced": {
        "choices": [
          "Qualità (scheda Brano): Bozza è il modello q4_0, Normale q8_0, Finale bf16 con 32 passi di decodifica e aderenza allo stile 1.2.",
          "Durata (scheda Brano): i minuti diventano Non meno di e Non più di; il modello produce 25 token al secondo di suono.",
          "Canto: Più stabile è Audacia 0.85, Più audace 1.1.",
          "Ripetizioni: Meno è Penalità di ripetizione 1.3 con Memoria delle ripetizioni 80.",
          "Spartito: Più prudente è un’Audacia dello spartito di 0.55."
        ],
        "choicesIntro": "Impostano gli stessi valori delle soluzioni qui sotto, con un clic.",
        "choicesTitle": "Le scelte nelle schede",
        "title": "Regolazioni",
        "lead": "Puoi lasciarle stare: ciò che non cambi va con il valore predefinito del motore, mostrato su ogni riga in Manuale. Contano quando un brano esce sempre sbagliato: troncato, in loop, stonato. Trova il tuo caso qui sotto e premi Applica: i numeri giusti vanno nei campi da soli.",
        "fixes": [
          {
            "id": "cutoff",
            "problem": "Il brano si interrompe prima della fine del testo",
            "fix": "Non più di: 12000 token, un tetto di durata di circa 8 minuti invece di 6."
          },
          {
            "id": "offbrief",
            "problem": "Il suono non corrisponde ai tag",
            "fix": "Aderenza allo stile: 1.2, così il modello segue la descrizione più rigorosamente. Se non aiuta, il problema sono i tag stessi."
          },
          {
            "id": "loop",
            "problem": "Una frase gira in loop all’infinito",
            "fix": "Penalità di ripetizione 1.3 e Memoria delle ripetizioni 80: una penalità più forte per le ripetizioni e una memoria più lunga di esse."
          },
          {
            "id": "offkey",
            "problem": "Note stonate, incrinature nella voce, rumore",
            "fix": "Audacia 0.85 e 32 passi di decodifica: meno audacia, più passaggi per rendere l’audio."
          },
          {
            "id": "melody",
            "problem": "La melodia è incoerente",
            "fix": "Se il piano è spento, passa a Melodia e accordi (un piano già scelto resta), e Spartito va su Più prudente (Audacia dello spartito 0.55), così lo spartito è scritto con più cautela. Oppure prendi una melodia da un brano nella scheda Melodia: uno spartito dato sostituisce il piano, e allora conta solo la scelta del piano."
          },
          {
            "id": "same",
            "problem": "Tutte le varianti suonano uguali",
            "fix": "Attiva il seed casuale. Se non basta, Audacia 1.1."
          },
          {
            "id": "final",
            "problem": "Voglio il rendering finale",
            "fix": "Qualità: Finale, il modello bf16 (se scaricato), 32 passi e aderenza allo stile 1.2. Fai 2–3 varianti e tieni la migliore."
          }
        ],
        "fieldsIntro": "Sotto ogni campo c’è una scala di valori tipici: il segno sopra è il predefinito per l’audio, il segno sotto quello per lo spartito (solo con un piano della melodia e senza spartito dato). Uno spartito vuole rigore, l’audio vuole vita, da qui i predefiniti diversi.",
        "groups": [
          {
            "title": "Precisione e qualità",
            "fields": [
              {
                "key": "cfg_scale",
                "name": "Aderenza allo stile (CFG)",
                "text": "Quanto docilmente il modello segue i tag di stile. Come il volume della tua voce nell’orecchio di un musicista: più piano, suonano più liberamente; più forte, più vicini alle indicazioni, ma più rigidi.",
                "left": "più libero",
                "right": "più fedele ai tag",
                "when": "1.2 se il suono corrisponde a malapena alla descrizione. Sopra 1.5: artefatti e un suono «di plastica»."
              },
              {
                "key": "num_inference_steps",
                "name": "Passi di decodifica",
                "text": "Quanti passaggi fa il modello per trasformare il suo piano in audio finito. Come le mani di vernice: 8 è uno schizzo veloce, 32 una mano finale pulita.",
                "left": "più veloce",
                "right": "più pulito",
                "when": "8 per le bozze, 32 per il finale. La differenza si sente appena (circa 4 s per brano su una RTX 4080); oltre 32 il suono cambia soltanto, non migliora."
              }
            ]
          },
          {
            "title": "Carattere dell’esecuzione",
            "fields": [
              {
                "key": "temperature",
                "name": "Audacia (temperature)",
                "text": "L’audacia del modello (almeno 0.01: zero ferma il motore). Bassa: suona «da manuale», regolare e prevedibile; alta: improvvisa, a volte in modo brillante, a volte stonando.",
                "left": "più stabile",
                "right": "più audace",
                "when": "Stonato: 0.85. Tutte le varianti uguali: 1.1. Spartito strano: 0.5–0.6 per lo spartito."
              },
              {
                "key": "repetition_penalty",
                "name": "Penalità di ripetizione",
                "text": "Una penalità per ripetere ciò che è già stato suonato. Più è alta, più il modello evita il «disco rotto». Per lo spartito è quasi 1.0: le ripetizioni sono normali nella notazione.",
                "left": "ripetizioni consentite",
                "right": "nessuna ripetizione",
                "when": "Loop: 1.3. Sotto 1.1 c’è il rischio di loop monotoni."
              }
            ]
          },
          {
            "title": "Durata del brano",
            "fields": [
              {
                "key": "min_tokens",
                "name": "Non meno di",
                "text": "Il modello non può finire prima di questo punto. Circa 25 unità al secondo: 200 ≈ 8 secondi di audio.",
                "left": "può essere breve",
                "right": "non prima",
                "when": "Il brano finisce prima di aver cantato tutto: alzalo."
              },
              {
                "key": "max_tokens",
                "name": "Non più di",
                "text": "Tetto di durata. 9000 ≈ 6 minuti di brano; il modulo accetta fino a 15000. Di più: attesa più lunga e più memoria GPU.",
                "left": "più corto",
                "right": "più lungo",
                "when": "Si interrompe a metà frase: 12000."
              }
            ]
          }
        ],
        "rareIntro": "Questi cambiano le stesse cose di Audacia o Penalità di ripetizione, solo in modo più fine. Di solito si lasciano stare.",
        "rare": [
          {
            "key": "top_p",
            "name": "Soglia delle scelte rare (top-p)",
            "text": "Quante opzioni «sensate» il modello considera a ogni passo: 1 tutte, 0.5 solo le più ovvie."
          },
          {
            "key": "top_k",
            "name": "Candidati (top-k)",
            "text": "Un limite rigido al numero di opzioni in ogni scelta. Un secondo filtro accanto alla soglia delle scelte rare."
          },
          {
            "key": "penalty_window",
            "name": "Memoria delle ripetizioni",
            "text": "Fino a quanto indietro il modello ricorda ciò che ha suonato nel calcolare la penalità di ripetizione. 50 ≈ 2 secondi di audio. Alzala a 80 in caso di loop."
          }
        ]
      },
      "melody": {
        "lead": "YuE2 può cantare il testo su una melodia che gli dai. Lo spartito ABC la contiene: note scritte come testo. Da uno spartito nel formato che l’app scrive, il brano esce nella stessa tonalità, con le stesse note cantate e la stessa durata: nel nostro test le note coincidevano al 93–99 %.",
        "roll": [
          "Ascolta suona lo spartito al pianoforte. Un clic o un trascinamento sul roll sceglie da dove partire, ⏮ torna all’inizio.",
          "Le note rosa sono la voce (Vocal), quelle blu l’accompagnamento (Ins). In alto scorrono i numeri delle battute e gli accordi.",
          "Ctrl + rotellina del mouse fa lo zoom, ⤢ apre la finestra grande con tre ottave di tasti.",
          "Spartito mostra lo stesso brano sul pentagramma; un clic su una nota la suona."
        ],
        "rollTitle": "Il roll e le note",
        "sources": [
          "Da un brano… — scegli un file audio e SheetSage2 ne scrive la melodia e gli accordi. Funziona meglio con un brano dalla voce chiara.",
          "Importa MIDI — la parte più acuta diventa la melodia, gli altri canali l’accompagnamento e gli accordi, e la tonalità si trova da sola. Tieni la melodia della voce su una traccia a parte.",
          "Pianoforte — scegli una durata e premi i tasti (qui sotto, a sinistra del roll, o su una tastiera MIDI): le note si susseguono.",
          "Da un brano creato: In MIDI nel menu di una variante, o la scheda Stem e note nella libreria, poi In uno spartito YuE2. La voce diventa la melodia, il basso e il resto l’accompagnamento."
        ],
        "sourcesTitle": "Da dove viene una melodia",
        "tips": [
          "Una nota per sillaba: una riga di 8 sillabe richiede circa 8 note.",
          "Il brano dura quanto le note: 8 battute in 4/4 a 100 BPM sono circa 20 secondi.",
          "Segui una melodia: il modello mantiene la tua melodia e inventa l’accompagnamento; Melodia e accordi: costruisce entrambi dallo spartito.",
          "Una tonalità o un tempo nello stile non servono a nulla: arrivano dalle note.",
          "Modifica il testo ABC a mano solo se conosci il formato: il modello legge meglio la struttura che scrive l’app (voci Vocal e Ins)."
        ],
        "tipsTitle": "Per un risultato fedele",
        "title": "La melodia e lo spartito ABC"
      },
      "style": {
        "tips": [
          "L’ideale sono 5–8 tag: di più iniziano a entrare in conflitto, meno dà un risultato meno prevedibile.",
          "Scrivi i tag in inglese, ma comincia con la lingua del brano (Russian, English, Spanish…): lo fanno tutti gli esempi del motore, e i flussi dell’idea la aggiungono per te.",
          "Con un piano della melodia (Segui una melodia o Melodia e accordi) lo stile conta ancora: stabilisce il timbro e l’arrangiamento, mentre la melodia viene dallo spartito ABC."
        ]
      },
      "lyrics": {
        "tips": [
          "Con un piano della melodia, il ritmo delle righe dovrebbe più o meno coincidere con lo spartito ABC (sillabe per battuta); altrimenti il modello deve allungare o comprimere le parole per adattarle alla melodia.",
          "Le righe brevi si adattano alla melodia in modo più prevedibile di quelle lunghe.",
          "Ripeti il ritornello parola per parola in ogni [Chorus]: così mantiene la stessa linea melodica per tutto il brano."
        ]
      },
      "cot": {
        "title": "Il piano della melodia",
        "intro": "Il piano della melodia decide se il modello scrive un piano musicale prima dell’audio, e come usa lo spartito ABC della scheda Melodia.",
        "melodyNote": "Dai la melodia nello spartito ABC sotto il piano: Da un brano… (SheetSage2), un file MIDI o il pianoforte. Senza spartito il modello scrive un proprio piano di sola melodia.",
        "precisionNote": "La precisione del modello (q8_0, q4_0, bf16) non c’entra con il piano: la imposta Qualità nella scheda Brano. q4_0 risparmia memoria video a un piccolo costo in qualità, qualunque sia il piano.",
        "abcFooter": "Il modo più semplice non è scrivere ABC da zero ma prenderlo da un brano con Da un brano… (SheetSage2), poi ritoccare a mano le battute che servono."
      }
    },
    "length": {
      "auto": "Auto",
      "autoHint": "Quanto dura il testo, fino a circa 6 minuti.",
      "hint": "Circa {n} min: un testo più corto viene cantato e suonato fino a quella durata, uno più lungo viene tagliato lì.",
      "label": "Durata",
      "minutes": "{n} min",
      "ownHint": "Impostata a mano in Regolazioni (Token min / max)."
    },
    "lines": "Righe: {n}",
    "linesAbout": "Righe: {n}, circa {time}",
    "linesAboutHint": "Una stima dai tuoi brani precedenti: circa {s} s a riga. Per la durata Auto.",
    "manual": {
      "abcGiven": "lo spartito dalla scheda Melodia",
      "changed": "{n} di {total} modificati",
      "console": "Console: tutti i gruppi insieme",
      "consoleTitle": "Console di YuE2",
      "done": "Fatto",
      "groups": {
        "character": {
          "sub": "la voce e la musica",
          "title": "Carattere"
        },
        "length": {
          "sub": "25 token al secondo",
          "title": "Durata"
        },
        "repeats": {
          "sub": "contro i loop",
          "title": "Ripetizioni"
        },
        "score": {
          "sub": "come il modello scrive il piano della melodia",
          "title": "Spartito"
        },
        "sound": {
          "sub": "il modello e la decodifica",
          "title": "Suono"
        }
      },
      "manual": "Manuale",
      "params": {
        "cfg": "Aderenza allo stile",
        "max_tokens": "Non più di",
        "min_tokens": "Non meno di",
        "penalty_window": "Memoria delle ripetizioni",
        "precision": "Precisione del modello",
        "repetition_penalty": "Penalità di ripetizione",
        "steps": "Passi di decodifica",
        "temperature": "Audacia",
        "top_k": "Candidati",
        "top_p": "Soglia delle scelte rare"
      },
      "reset": "Ripristina",
      "resetAll": "Ripristina tutto",
      "seconds": "{n} s",
      "seedRandom": "casuale",
      "sends": "Va al motore",
      "sendsRest": "I valori impostati a mano sono evidenziati. Ciò che non è nella riga resta al valore predefinito del motore.",
      "simple": "Semplice"
    },
    "perf": {
      "manualNow": "(ora impostato a mano)",
      "repeats": {
        "hint": "Meno, quando una frase gira in continuazione.",
        "label": "Ripetizioni",
        "options": {
          "fewer": "Meno",
          "normal": "Normale"
        }
      },
      "score": {
        "hint": "Più prudente, quando la melodia divaga: il modello scrive lo spartito con più cautela.",
        "label": "Spartito",
        "options": {
          "careful": "Più prudente",
          "normal": "Normale"
        }
      },
      "temperature": {
        "hint": "Più stabile: meno note stonate e incrinature nella voce. Più audace: le varianti differiscono di più tra loro.",
        "label": "Canto",
        "options": {
          "normal": "Normale",
          "steady": "Più stabile",
          "varied": "Più audace"
        }
      }
    },
    "planLabel": "Piano della melodia",
    "planNames": {
      "full": "Melodia e accordi",
      "melody": "Segui una melodia",
      "off": "Nessun piano"
    },
    "qualityHints": {
      "draft": "Il modello {model} usa meno memoria video, il suono è un po’ più semplice: per provare idee.",
      "final": "Il modello {model}, 32 passi di decodifica e più vicino ai tag di stile (CFG 1.2): per un brano finito. Fai 2–3 varianti e tieni la migliore. bf16 richiede più memoria video di q8_0 (il suo file è di 7.3 GB contro 4.3 GB).",
      "normal": "Il modello {model} con le impostazioni usuali: buon suono senza attese.",
      "own": "Precisione, passi e CFG a mano."
    },
    "qualityLabel": "Qualità",
    "qualityNames": {
      "draft": "Bozza",
      "final": "Finale",
      "normal": "Normale",
      "own": "Propria"
    },
    "queued": "In coda, varianti: {n}",
    "scoreGivenNote": "Lo spartito dato sostituisce il piano, quindi il campionamento dello spartito non fa nulla e non viene inviato.",
    "sections": {
      "bridge": "+ Bridge",
      "chorus": "+ Ritornello",
      "outro": "+ Outro",
      "verse": "+ Strofa"
    },
    "tabs": {
      "changed": "Modificato rispetto ai predefiniti",
      "melody": "Melodia",
      "song": "Brano",
      "tuning": "Regolazioni"
    },
    "takes": "Varianti",
    "tuningTitle": "Impostazioni di prestazione"
  },
  "acePage": {
    "openTrainingPage": "Apri l’addestramento LoRA"
  },
  "library": {
    "noTracks": "La libreria non ha ancora brani. Carica un file qui sopra o crea un brano in Crea."
  },
  "notInstalled": {
    "stableAudio": {
      "text": "Stable Audio 3 crea strumentali ed effetti sonori e alimenta ritocco, prosecuzione e cover dell’editor. È stato escluso all’installazione. Una volta installato, scarica un modello in Modelli e impostazioni o direttamente nel modulo di Stable Audio."
    }
  },
  "idea": {
    "guide": {
      "lead": "Una frase in entrata, un brano in uscita, proprio nella home. Descrivi un brano, uno strumentale o un suono con parole tue, un modello linguistico locale scrive il prompt nel formato del motore scelto, lo modifichi se vuoi, e il motore crea il brano.",
      "steps": [
        {
          "title": "Descrivi l’idea",
          "text": "Una o due frasi: di cosa parla il brano, l’atmosfera, chi canta, dove e quando. Per uno strumentale: il genere, gli strumenti e l’atmosfera."
        },
        {
          "title": "Scegli il tipo e il motore",
          "text": "Brano con voce, strumentale o suono, poi ACE-Step, YuE2 o Stable Audio 3. Un motore che non produce quel tipo non si può scegliere; un suono è sempre di Stable Audio."
        },
        {
          "title": "Componi",
          "text": "Premi Componi: l’assistente scrive il prompt subito sotto la frase e mostra la fase, la percentuale e il testo mentre cresce. Puoi fermarlo. Un suono salta questo passo: Componi apre il modulo di Stable Audio con la frase."
        },
        {
          "title": "Modifica il prompt",
          "text": "I tag, il testo, il tempo, la tonalità e la durata si possono cambiare direttamente nei campi."
        },
        {
          "title": "Genera",
          "text": "Genera mette le varianti nella coda del motore, che si avvia quando arriva il loro turno, e apre Crea: le varianti compaiono nell’elenco della sessione, con il nome dell’idea."
        }
      ],
      "writer": [
        "L’assistente per i prompt è un modello linguistico locale, Qwen3.5. Rimane fedele all’idea e scrive il testo nella lingua dell’idea o in quella che scegli. Il suo modello si scarica nella pagina Modelli.",
        "Per ACE-Step, anche il modello linguistico di ACE-Step può scrivere il prompt mentre il motore gira. È più veloce, di solito 5–20 s, ma si allontana più spesso dall’idea.",
        "La lingua del testo è ricavata di default dalle lettere dell’idea; puoi sceglierla sotto Altro, e così chi scrive il prompt. Nella pagina Crea è sotto Impostazioni della riga dell’idea."
      ],
      "after": [
        "Un’altra variante riscrive il prompt dalla stessa idea.",
        "Apri nel modulo mette il prompt nel modulo del motore nella pagina Crea, con tutte le sue impostazioni.",
        "L’idea e il prompt restano quando lasci la pagina o la ricarichi. Dopo Genera vengono cancellati per l’idea successiva; Ripristina li cancella a mano.",
        "Nella pagina Crea la stessa idea sta nella riga dell’idea sopra il modulo: Scrivi mette il testo e lo stile direttamente nel modulo (Descrivi, per Stable Audio), e Rimetti ciò che c’era ripristina il modulo."
      ],
      "tips": [
        "I dettagli battono le parole generiche: «un treno notturno da una piccola città» dà più di «una canzone triste».",
        "Vuoi un genere, una voce o strumenti particolari? Nominali nell’idea.",
        "Leggi il testo prima di generare: un modello piccolo non sempre azzecca rima e metrica.",
        "Non è il suono che volevi? Prova un altro motore con la stessa idea: il prompt viene riscritto nel suo formato.",
        "Pioggia, un colpo, passi sono suoni, non musica: scegli Suono, e la frase va dritta nel modulo di Stable Audio. Con Strumentale e Stable Audio 3 l’assistente capisce da solo che si vuole un suono; ACE-Step crea un brano da un’idea simile."
      ]
    }
  },
  "sa3Weights": {
    "allOnModels": "Ogni modello, i checkpoint base e le impostazioni sono nella pagina Modelli"
  },
  "autoTitle": {
    "accept": "Usalo",
    "another": "Un altro",
    "bulk": "Suggerisci titoli",
    "bulkDone": "{n} brano nominato | {n} brani nominati",
    "bulkFailed": "{n} nominati, poi si è fermato: {error} | {n} nominati, poi si è fermato: {error}",
    "bulkHint": "L’assistente dà un nome a ogni brano selezionato, uno dopo l’altro; «Annulla» rimette i vecchi titoli.",
    "bulkStopped": "Fermato: {n} di {total} nominati",
    "bulkUndone": "Vecchio titolo ripristinato | Vecchi titoli ripristinati: {n}",
    "cancel": "Annulla",
    "failed": "Non è venuto in mente un titolo: {error}",
    "noAssistant": "L’assistente per i prompt non è pronto: scarica il suo modello in Modelli.",
    "progress": "Assegno il nome a {done} di {total}",
    "stop": "Stop",
    "suggest": "Suggerisci un titolo",
    "working": "Penso a un titolo…"
  },
  "covers": {
    "alt": "Copertina di {title}",
    "another": "Un’altra copertina",
    "bulk": "Crea copertine",
    "bulkDone": "{n} copertina creata | {n} copertine create",
    "bulkFailed": "{n} non sono riuscite",
    "bulkHint": "Una copertina per ogni brano selezionato, una dopo l’altra; un brano che ne ha già una ne riceve una nuova.",
    "bulkProgress": "Copertine: {done} di {total}",
    "cancel": "Annulla",
    "describe": "Cosa mostra l’immagine",
    "describeHint": "Una scena in poche parole; l’inglese funziona meglio. Il testo nell’immagine viene evitato in automatico.",
    "dismiss": "Chiudi",
    "edit": "Modifica la descrizione…",
    "enable": "Crea le copertine degli album per i brani",
    "enableHint": "Aggiunge un’immagine a ogni brano nella libreria, nel player e nella sessione. Disattivato: nessuna copertina e nessun pulsante per le copertine.",
    "engine": "Copertine (Z-Image Turbo)",
    "failed": "La copertina non è riuscita: {error}",
    "fromAssistant": "Dall’idea dell’assistente per questo brano.",
    "installed": "installato",
    "loadingPrompt": "Lettura della descrizione…",
    "make": "Crea una copertina",
    "making": "Creo la copertina…",
    "makingPct": "Creo la copertina… {pct}%",
    "model": "Modello: Z-Image Turbo, {gb} GB",
    "notInstalled": "non installato",
    "notInstalledHint": "Il modello delle copertine non è su questo computer. Installalo con l’installer (la parte Copertine) o con lo script di installazione.",
    "onButton": "Una copertina viene creata solo quando premi un pulsante: nei dettagli di un brano in libreria o per i brani selezionati. Ognuna richiede da 5 a 10 secondi; in quel tempo la GPU passa al modello delle copertine e il brano successivo ricarica il suo motore.",
    "parts": {
      "main": "Pesi di Z-Image Turbo",
      "server": "Server di immagini (stable-diffusion.cpp)"
    },
    "queued": "In attesa in coda…",
    "remove": "Rimuovi la copertina",
    "removeConfirm": "Sì, rimuovi",
    "stop": "Stop",
    "title": "Copertine",
    "draw": "Disegna",
    "withAssistant": "Fallo con l’assistente",
    "withAssistantHint": "L’assistente dei prompt scrive una descrizione dal tuo testo (in qualsiasi lingua) o, con il campo vuoto, dalla canzone; puoi modificarla prima di disegnare.",
    "putBack": "Ripristina",
    "anyLanguageHint": "Scrivi in qualsiasi lingua: l’assistente lo trasforma in una descrizione che il modello di immagini capisce.",
    "fromSaved": "La descrizione da cui è stata disegnata l’ultima copertina.",
    "noAssistant": "L’assistente dei prompt non è pronto: scarica il suo modello in Modelli.",
    "describing": "Descrivo l’immagine…",
    "describingPct": "Descrivo l’immagine… {pct}%",
    "describeFailed": "L’assistente non è riuscito a descrivere l’immagine: {error}",
    "bulkDescribing": "Descrivo {done} di {total}",
    "starting": "Avvio del modello di immagini…"
  },
  "takeCompare": {
    "best": "★ Migliore",
    "failed": "Impossibile caricare",
    "keep": "Tieni la migliore, sposta le altre nel cestino",
    "keepConfirm": "Spostare {n} variante nel cestino? | Spostare {n} varianti nel cestino?",
    "keepNeedStar": "Metti una stella alla variante migliore per tenerla.",
    "keepTooMany": "Metti la stella a una sola variante: quella da tenere.",
    "keepWill": "Tiene {take}; l’altra va nel cestino. | Tiene {take}; le altre {n} vanno nel cestino.",
    "kept": "Tenuta {take}; {n} variante spostata nel cestino. | Tenuta {take}; {n} varianti spostate nel cestino.",
    "keys": "1–4 scegli una variante · Spazio riproduci/pausa · ←/→ 5 s · Esc chiudi",
    "loading": "Caricamento…",
    "loadingAll": "caricamento delle varianti…",
    "newestOf": "Le {shown} più recenti su {total} varianti",
    "nowHearing": "In riproduzione: {take}",
    "open": "Confronta",
    "openTitle": "Confronta le varianti di questo brano, A/B",
    "position": "{at} di {total}",
    "restored": "{n} variante ripristinata | {n} varianti ripristinate",
    "seed": "seed {seed}",
    "seek": "Posizione",
    "takes": "Varianti",
    "tileLabel": "{letter}, variante {n}",
    "title": "Confronta le varianti"
  }
}
