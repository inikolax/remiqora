// Notes workspace and help, and the strings added or reworded after part12 (machine-translated from en); merged last, key by key.
export default {
  "aceGen": {
    "closeness": "Quanto vicino all’originale",
    "closenessHigh": "Più libero",
    "closenessHint": "A sinistra il risultato mantiene la melodia e l’arrangiamento della sorgente; a destra il modello cambia di più.",
    "closenessLow": "Più vicino all’originale",
    "loraSimple": "LoRA",
    "loraTrain": "Addestra il tuo",
    "modelDefault": "{name} (predefinito)",
    "refChoose": "Scegli un file",
    "refDrop": "Trascina qui l’audio o sceglilo dalla libreria",
    "refFromLibrary": "Dalla libreria",
    "refLoading": "Caricamento del brano…",
    "refNeeded": "Scegli qui un brano, oppure torna alla scheda Brano per una nuova canzone.",
    "refOff": "Prendi un brano già pronto: una cover, un intervallo rifatto, una parte tolta o aggiunta. Senza un brano il modulo crea una nuova canzone.",
    "refRemove": "Rimuovi"
  },
  "aiPart": {
    "guide": {
      "hears": [
        "Le tracce selezionate vengono mixate in un’unica traccia stereo: con i volumi delle tracce, le dissolvenze e l’adattamento del tempo (W), ma senza effetti e ignorando i pulsanti M e S.",
        "Il tempo viene dal campo BPM del progetto, non dalle clip: impostalo in modo che corrisponda al materiale. La tonalità viene da «Tonalità»; su «Auto» il modello la trova da sé.",
        "ACE-Step conosce solo maggiore e minore. Per qualsiasi altra scala il modello riceve la tonalità più vicina e il nome della scala nella descrizione: un suggerimento, non una garanzia.",
        "Le tracce con varianti in attesa di scelta non vengono proposte: sono bozze.",
        "Il modello non accetta un intervallo più lungo di 10 minuti: seleziona un frammento più breve."
      ],
      "limits": [
        "«Aggiungi una parte» funziona solo con il modello base di ACE-Step (circa 4,8 GB). Nell’app desktop è un’opzione all’installazione; se è stata esclusa, l’arrangiatore mostra un pulsante Installa. Con gli script, setup_models stampa alla fine il comando per installarlo.",
        "base è più lento di turbo: su una RTX 4080 una variante per un brano di 2-3 minuti richiede circa 10 secondi, e il primo avvio dura di più mentre il modello si carica.",
        "Il modello rispetta la tonalità e gli accordi di ciò che sente meglio delle idee ritmiche: «suona negli spazi della voce» potrebbe non riuscire.",
        "La qualità del suono è quella che dà il modello. Non esiste MIDI in audio: il modello lavora solo con l’audio.",
        "Se xl-base è installato, compare nell’elenco dei modelli; su una scheda da 16 GB occupa quasi tutta la memoria video. Per aggiungere parti usa base: nelle misurazioni xl-base ha restituito rumore in circa una variante su cinque, base in una su venticinque.",
        "Scartare il rumore costa tempo: quando una variante viene scartata la richiesta viene rinviata, e la generazione dura di più. Batteria, percussioni ed effetti non vengono controllati: sono rumorosi per natura."
      ],
      "variants": [
        {
          "term": "Ascolta",
          "text": "passa a questa variante, silenzia le altre e riproduce dall’inizio dell’intervallo."
        },
        {
          "term": "Tieni",
          "text": "tiene la variante e rimuove le altre. Per una ridipintura, una continuazione o una cover la variante tenuta sostituisce l’originale nell’intervallo."
        },
        {
          "term": "Rimuovi tutto",
          "text": "rimuove ogni variante e riporta le tracce com’erano."
        },
        {
          "term": "Copia del contesto",
          "text": "segna una variante in cui il modello ha restituito quasi il mix che ha sentito invece di una nuova parte. Genera di nuovo."
        },
        {
          "term": "Rumore",
          "text": "segna una variante in cui il modello ha restituito fruscio invece di una parte. L’arrangiatore scarta da sé queste varianti e ne chiede di nuove, fino a due volte; il segno resta solo su ciò che è tornato dopo i tentativi."
        },
        {
          "term": "Ctrl+Z",
          "text": "annulla sia l’inserimento delle varianti sia la scelta. I file delle varianti scartate lasciano la libreria solo quando il progetto viene salvato, e solo se nessuna clip li usa."
        }
      ]
    }
  },
  "covers": {
    "after": {
      "hintSa": "Dopo la generazione: una copertina per tutte le take. Occupa la GPU per altri ~30 s."
    },
    "studio": {
      "errChanged": "Nel frattempo la copertina è stata rifatta. Salva ancora una volta.",
      "errLoad": "Impossibile caricare l’immagine della copertina. Riprova.",
      "errNoCover": "Questo brano non ha una copertina su cui mettere la didascalia.",
      "errSave": "Impossibile salvare la didascalia. Riprova."
    }
  },
  "create": {
    "failed": "Non ha funzionato. Premi Riusa queste impostazioni, poi di nuovo Crea.",
    "madeAt": "alle {time}",
    "menu": {
      "midi": "Note in MIDI"
    },
    "notes": {
      "cardTitle": "Note",
      "draw": "Disegna",
      "drawNote": "«Disegna» apre Note a destra con uno scheletro dal testo: sezioni dai tag [Verse], [Chorus], un accordo provvisorio per battuta.",
      "emptyLead": "Senza note YuE2 scrive da sé la melodia. Con le note canta la tua.",
      "emptyTitle": "Ancora nessuna nota",
      "fromSong": "Da una canzone",
      "fromSongDots": "Da una canzone…",
      "hasScore": "il modulo ha una partitura",
      "importMidi": "Importa MIDI",
      "open": "Apri le note",
      "openHere": "Le note sono aperte a destra.",
      "openNote": "Le modifiche alle note vanno direttamente nel modulo — premi «{button}» e YuE2 le prende.",
      "openSection": "Apri questa sezione in Note",
      "openTakeTip": "La partitura di questa take nello spazio Note — ascolta, confronta, modifica, poi mettila nel modulo se vuoi",
      "rail": "Note",
      "railTip": "Note di YuE2 — l’editor della partitura a destra, al posto della Sessione",
      "remarks": "{n} segnalazione del controllo: {list} | {n} segnalazioni del controllo: {list}",
      "takeTitle": "{title} · Take {n}"
    },
    "rail": {
      "ace_step": "ACE",
      "generate": "Crea",
      "lora": "LoRA",
      "models": "Modelli",
      "stable_audio": "Suono",
      "yue2": "YuE2"
    },
    "reuse": "Riusa queste impostazioni",
    "reuseInForm": "Riusa queste impostazioni"
  },
  "editor": {
    "clipInTrash": "Brano nel cestino",
    "clipInTrashHint": "Il brano di questa clip è nel cestino della libreria: si sente ancora, ma il cestino lo elimina definitivamente dopo 30 giorni.",
    "guide": {
      "clip": [
        "Trascinare sposta una clip, i bordi la tagliano. La forma d’onda non viene compressa mentre tagli: vedi esattamente l’audio che resta. Il file sorgente non cambia mai.",
        "I pulsanti su una clip stanno sopra la forma d’onda e compaiono al passaggio del mouse o quando la clip è selezionata; quelli attivi sono sempre visibili. M silenzia la clip, S lascia udibile solo lei, W la adatta al tempo del progetto, la croce la elimina.",
        "Le maniglie dei bordi impostano le dissolvenze. Senza di esse ogni bordo riceve una micro-dissolvenza di 15 ms perché un taglio non scatti.",
        "Gli strumenti nel trasporto: Selezione (V) sposta e taglia le clip, il Coltello (C) taglia una clip dove clicchi, la Gomma (E) rimuove il pezzo su cui trascini, o l’intera clip con un clic. Coltello e Gomma si agganciano alla griglia e ai bordi delle clip; Esc torna a Selezione.",
        "S taglia la clip selezionata sul cursore di riproduzione, oppure ogni clip sotto il cursore quando non c’è nulla di selezionato. Ctrl+D mette una copia subito dopo la clip.",
        "Le clip sono traslucide: la griglia della timeline traspare attraverso di esse."
      ],
      "lane": [
        "Rinomina una traccia direttamente nella sua intestazione. M la silenzia, S lascia udibile solo lei.",
        "Colore: seleziona la traccia e clicca un punto sopra l’elenco delle tracce.",
        "Una traccia con un’intera canzone si può dividere in stem con il pulsante accanto a M e S: voce, batteria, basso e altro la sostituiscono.",
        "La croce rimuove la traccia; Ctrl+Z la riporta.",
        "L’altezza delle tracce si imposta con il cursore delle frecce nel trasporto o con Alt e la rotella del mouse: più alta è la traccia, più grande è la forma d’onda. Un’unica altezza per tutte le tracce."
      ],
      "steps": [
        {
          "title": "Aggiungi le tracce",
          "text": "Il pulsante «Traccia» apre la libreria: aggiungi un brano intero o come stem. Un file dal tuo computer si può trascinare direttamente su una traccia."
        },
        {
          "title": "Disponi le clip",
          "text": "Trascina le clip e tagliale dai bordi. Il Coltello (C) taglia una clip dove clicchi, la Gomma (E) rimuove il pezzo su cui trascini. Le dissolvenze si tirano dalle maniglie ai bordi della clip."
        },
        {
          "title": "Adatta il tempo",
          "text": "Il campo BPM imposta il tempo del progetto, il pulsante W su una clip la adatta a quel tempo. «Magnete» attiva l’aggancio alla griglia, e l’interruttore «0:00 | 1 | 2» sceglie cosa contano il righello e la griglia: secondi o battute."
        },
        {
          "title": "Mixa",
          "text": "Volume e panning delle tracce, otto effetti su ogni traccia e sul master. Il pulsante «Mixer» mostra il mixer."
        },
        {
          "title": "Salva",
          "text": "Non c’è salvataggio automatico: «Salva» o Ctrl+S. Se lasci la pagina con modifiche non salvate, l’editor ti avvisa."
        },
        {
          "title": "Esporta",
          "text": "WAV o MP3 nella libreria, oppure stem con un progetto Reaper o DAWproject da rifinire nella tua DAW."
        }
      ],
      "tempo": [
        "Il tempo di una clip viene rilevato quando la si aggiunge, dai suoi primi 30 secondi. Il rilevatore è semplice e può sbagliare su materiale complesso.",
        "W allunga la clip al BPM del progetto senza cambiarne l’altezza.",
        "Le clip si agganciano ai bordi delle altre clip e all’inizio della timeline. «Magnete» aggiunge l’aggancio alla griglia. L’interruttore «0:00 | 1 | 2» sceglie cosa contano la griglia e il righello: secondi, oppure battute e movimenti del BPM del progetto (4/4). Il passo della griglia segue lo zoom; le linee sui segni del righello sono più luminose.",
        "«Ripeti» ripete la regione sul righello: spostala intera o trascina i suoi bordi. La stessa regione è la selezione per l’arrangiatore IA. Clicca il righello per posizionarti."
      ]
    },
    "help": {
      "title": "Guida all’editor"
    },
    "hotkeys": {
      "keys": [
        {
          "keys": "Space",
          "action": "Riproduci e pausa"
        },
        {
          "keys": "S",
          "action": "Taglia una clip sul cursore di riproduzione"
        },
        {
          "keys": "V / C / E",
          "action": "Strumento: selezione, coltello, gomma"
        },
        {
          "keys": "Del",
          "action": "Elimina la clip selezionata"
        },
        {
          "keys": "Ctrl+D",
          "action": "Duplica la clip selezionata"
        },
        {
          "keys": "Ctrl+Z",
          "action": "Annulla, fino a 30 passi"
        },
        {
          "keys": "Ctrl+Y / Ctrl+Shift+Z",
          "action": "Ripeti"
        },
        {
          "keys": "Ctrl+S",
          "action": "Salva il progetto"
        },
        {
          "keys": "Esc",
          "action": "Cancella la selezione e torna allo strumento Selezione"
        },
        {
          "keys": "← →",
          "action": "Cursore di un passo della griglia, di quattro con Shift"
        },
        {
          "keys": "Home / End",
          "action": "All’inizio o alla fine"
        },
        {
          "keys": "+ / −",
          "action": "Zoom"
        },
        {
          "keys": "Tab",
          "action": "Clip, traccia o maniglia successiva"
        }
      ],
      "mouse": [
        {
          "keys": "Ctrl+rotella",
          "action": "Zoom"
        },
        {
          "keys": "Alt+rotella",
          "action": "Altezza delle tracce"
        },
        {
          "keys": "Clic del coltello",
          "action": "Taglia la clip in quel punto"
        },
        {
          "keys": "Trascinamento della gomma",
          "action": "Rimuove quel pezzo della clip; un clic rimuove l’intera clip"
        },
        {
          "keys": "Shift+trascina",
          "action": "Scorre la timeline; funziona anche il pulsante centrale"
        },
        {
          "keys": "Clic sul righello",
          "action": "Posizionamento"
        },
        {
          "keys": "File su una traccia",
          "action": "Aggiunge una clip dal tuo computer in quel punto"
        }
      ]
    },
    "restoreFromTrash": "Ripristina dal cestino",
    "trashedSources": "Una clip riproduce un brano che è nel cestino: {names}. Il cestino lo elimina definitivamente dopo 30 giorni. | {n} clip riproducono brani che sono nel cestino: {names}. Il cestino li elimina definitivamente dopo 30 giorni."
  },
  "footer": {
    "muscriptorNote": "Trasforma un brano o uno stem in MIDI. I pesi sono solo per uso non commerciale; vedi la scheda del modello.",
    "qwenNote": "L’assistente per i prompt: scrive il prompt da un’idea, titoli e descrizioni delle copertine.",
    "sa3Note": "Strumentali ed effetti sonori. Gratuito per uso personale e commerciale sotto 1M USD di ricavi annui; oltre serve una licenza enterprise.",
    "sdcppNote": "Esegue il modello delle copertine.",
    "sheetsageNote": "Scrive la melodia di un brano come partitura (Note, «Da una canzone…»). I pesi sono solo per uso non commerciale; vedi la scheda del modello.",
    "zimageNote": "Disegna le copertine. Anche il suo codificatore di testo Qwen3-4B-Instruct è Apache-2.0."
  },
  "header": {
    "guide": {
      "map": {
        "ace": "Canzoni veloci e strumentali da una descrizione, tag e testo; con un brano di riferimento anche una cover, un intervallo ridipinto, una parte aggiunta o estratta, una continuazione.",
        "sa3": "Strumentali ed effetti sonori da una descrizione, in fretta. Nell’arrangiatore IA dell’editor ridipinge, continua e fa cover ascoltando l’audio attorno all’intervallo.",
        "yue": "Scrive un’intera canzone con voce e può costruirla attorno a una melodia data (la scheda Melodia e lo spazio Note, con SheetSage2). Trasforma anche un brano in MIDI."
      },
      "steps": [
        {
          "title": "Scegli un motore",
          "text": "Vai su Crea: i motori sono a sinistra, YuE2, ACE-Step e Stable Audio. Per una prima canzone con voce prendi YuE2. Parte alla prima pressione di Crea; il primo avvio richiede qualche minuto."
        },
        {
          "title": "Descrivi la canzone",
          "text": "Nella scheda Brano scrivi il testo e lo stile, oppure scrivi l’idea in una frase nella riga sopra il modulo e l’assistente compila i campi. Scegli la durata e quante take."
        },
        {
          "title": "Scegli la take migliore",
          "text": "Le take si allineano nell’elenco della sessione accanto al modulo (sotto di esso su un telefono). Tutto ciò che viene creato è salvato da solo nella libreria."
        },
        {
          "title": "Dividi in stem",
          "text": "Voce, batteria, basso e altro con un clic: Dividi in stem nel menu di una take, la scheda Stem e note nella libreria, o direttamente nell’editor."
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
      "tips": [
        "Non sai come descrivere uno stile? Inizia dalla home: descrivi la musica in una frase, l’assistente scrive il prompt e tu lo modifichi.",
        "Quasi giusto ma non del tutto? Ridipingere una sezione spesso è più rapido che generare di nuovo.",
        "Il brano di riferimento per una cover o una nuova parte può venire direttamente dalla libreria.",
        "Ogni sezione ha il suo pulsante di aiuto; l’editor ha anche un foglio di scorciatoie a parte.",
        "L’editor non salva automaticamente: premi Salva prima di lasciare la pagina; se te ne dimentichi, l’editor te lo chiede."
      ]
    },
    "helpSections": {
      "covers": {
        "text": "Una copertina viene disegnata su questo computer dal modello Z-Image Turbo. Spunta Crea una copertina sotto il modulo e una copertina per tutte le take arriva dopo la canzone; oppure creala dopo con il pulsante sulla scheda di un brano nella libreria, anche per più brani selezionati insieme. Progetta la copertina cambia la descrizione dell’immagine e aggiunge una didascalia con il titolo. Il modello delle copertine si installa a parte: vedi Modelli e impostazioni.",
        "title": "Copertine"
      },
      "downloads": {
        "text": "Un brano si scarica come MP3 (320 kbit/s, con copertina e tag, si ascolta ovunque), FLAC (senza perdita, con copertina e tag) o WAV (la sorgente per una DAW, senza copertina). Scegli il formato nel menu Scarica di una take o di un brano, viene ricordato; si può impostare anche in Modelli e impostazioni, Generali. Il nome dell’artista finisce nei tag.",
        "title": "Formati di download"
      },
      "engines": {
        "text": "Tre motori generano audio, YuE2-3B, ACE-Step 1.5 e Stable Audio 3, e non stanno insieme su una sola GPU, quindi ne gira uno alla volta. Scegli un motore nella pagina Crea: parte quando premi Crea, e quello in esecuzione si ferma da solo. La spia mostra il suo stato; il primo avvio può richiedere qualche minuto mentre il modello si carica nella memoria video. Il pulsante di stato nell’intestazione mostra cosa occupa la GPU e può scaricarlo."
      },
      "library": {
        "text": "Ogni brano, generato, caricato o esportato dall’editor, finisce in un’unica libreria condivisa che ogni modulo può usare, così un brano creato da qualsiasi motore può essere diviso in stem, trascritto e mixato senza uscire dall’app."
      },
      "notes": {
        "more": "Altro sulle note",
        "text": "Note è lo spazio di lavoro di YuE2: il pulsante Note sotto YuE2 nella barra di Crea. Mostra e modifica la melodia della canzone come partitura; la partitura può venire da un brano finito (Da una canzone…, SheetSage2) o da un file MIDI e va nel modulo di YuE2, nella scheda Melodia.",
        "title": "Note"
      },
      "trash": {
        "text": "I brani eliminati vanno nel cestino della libreria e ci restano per 30 giorni: ripristinali da lì o eliminali definitivamente. Seleziona più brani per spostarli insieme nel cestino, taggarli, creare copertine o dare loro un nome. La libreria filtra per tag.",
        "title": "Cestino e tag"
      }
    }
  },
  "home": {
    "allTracks": "Apri la libreria"
  },
  "idea": {
    "languageAutoIdea": "Auto (dall’idea)",
    "writer": "Chi scrive il testo e lo stile:",
    "writerAce": "ACE-Step stesso"
  },
  "libraryPage": {
    "filters": {
      "midi": "MIDI",
      "score": "Note"
    },
    "filtersToggle": "Filtri",
    "openEditor": "Apri nell’editor",
    "openEditorFailed": "Impossibile aprire nell’editor: {error}",
    "openEditorHint": "Un nuovo progetto dell’editor con questo brano su una corsia",
    "promptTitle": "Il brano non ha un nome proprio: viene mostrata una riga del suo testo.",
    "score": {
      "download": "Scarica .abc",
      "failed": "Impossibile caricare le note: {error}",
      "hint": "La partitura ABC da cui YuE2 ha cantato questo brano",
      "open": "Apri in Note",
      "openHint": "Una copia della partitura in Note nella pagina Crea; le note del modulo restano come sono",
      "title": "Note"
    },
    "trash": {
      "loading": "Caricamento…"
    },
    "usage": {
      "bulk": "{n} brani sono usati in progetti dell’editor: {names}. Nel cestino si sentiranno ancora, ma se svuoti il cestino le loro clip nei progetti spariscono. Eliminare?",
      "more": " (e altri {n})",
      "purge": "Eliminare definitivamente? Usato in progetti dell’editor: {names}. Le sue clip nei progetti spariranno.",
      "single": "Il brano è usato nel progetto dell’editor «{name}»{more}. Nel cestino si sentirà ancora, ma se svuoti il cestino la clip nel progetto sparisce. Eliminare?"
    },
    "yueLicence": "YuE2: licenza non commerciale (CC BY-NC 4.0)",
    "yueLicenceHint": "Le canzoni di YuE2 non possono essere vendute né usate commercialmente. Dettagli: Modelli e licenze."
  },
  "midiPanel": {
    "recognize": "Note in MIDI"
  },
  "models": {
    "general": {
      "artist": "Nome dell’artista",
      "artistHint": "Scritto nei tag dei brani scaricati. Lo stesso nome del piè di pagina.",
      "artistSave": "Salva",
      "artistSaved": "Salvato",
      "autoCover": "Crea una copertina dopo la canzone",
      "autoCoverHint": "Il valore iniziale della casella Crea una copertina sotto i moduli dei motori.",
      "autoCoverOff": "Le copertine sono disattivate o il loro modello non è installato: vedi Copertine.",
      "formatHint": "Il formato dei pulsanti Scarica nella sessione e nella libreria. Anche un formato scelto in un menu di download viene ricordato qui.",
      "languageHint": "La stessa scelta del pulsante della lingua nell’intestazione.",
      "nav": "Generali",
      "title": "Impostazioni generali"
    },
    "showMore": "{n} altri, non scaricati: {names} ▾"
  },
  "notesHelp": {
    "actions": {
      "checks": "Mostra il controllo",
      "draw": "Apri «Disegna da zero»",
      "musicianOff": "Nascondi i numeri romani",
      "musicianOn": "Mostra i numeri romani",
      "simple": "Apri la vista semplice",
      "snapIsOn": "«In tonalità» è attivo",
      "snapOn": "Attiva «In tonalità»"
    },
    "fig": {
      "at": "tempo 95, 4/4",
      "barTime": "1 battuta ≈ 2,5 s",
      "beats": "4 movimenti: uno-due-tre-quattro",
      "brk": "stacco",
      "chordsTitle": "Accordi sulle battute",
      "counter": "5 sill. · 6 note",
      "fourBars": "4 battute ≈ 10 s",
      "higher": "più alto",
      "inKey": "note della tonalità",
      "ins": "Strumento",
      "intro": "intro",
      "longer": "nota lunga",
      "lower": "più basso",
      "lyricsTags": "Tag nel testo",
      "melisma": "tenuta",
      "octaveNote": "una voce maschile canta un’ottava sotto le note scritte",
      "offKey": "fuori tonalità",
      "partsRibbon": "Sezioni nelle note",
      "pause": "pausa",
      "picker": "Adatti",
      "shorter": "corta",
      "sing": "la voce canta",
      "snapped": "si posa qui",
      "sung": "cantata",
      "syllables": [
        "Sei",
        "il",
        "mio",
        "so",
        "le"
      ],
      "time": "tempo →",
      "vocal": "Voce",
      "written": "scritta"
    },
    "firstTime": "Nuovo con le note?",
    "open": "Guida alle note",
    "openTip": "In parole semplici: come disegnare una melodia e come la canta YuE2",
    "sections": {
      "checks": {
        "head": {
          "check": "Cosa dice",
          "fix": "Cosa fare",
          "means": "Cosa significa"
        },
        "intro": "Il controllo è la riga in fondo a Note: clicca per aprire l’elenco. Il giallo significa «da guardare», il verde tutto a posto, il grigio solo un’annotazione. Dove la correzione è ovvia c’è il pulsante Correggi; Mostra seleziona le note o le battute in questione. Ctrl+Z annulla qualsiasi correzione.",
        "rows": [
          {
            "check": "Nessuna tonalità o tempo",
            "means": "YuE2 non sa in quale tonalità e a che velocità cantare.",
            "fix": "Sceglili con i chip in alto."
          },
          {
            "check": "Battute senza accordo",
            "means": "YuE2 è abituato a un accordo in ogni battuta.",
            "fix": "Premi Correggi senza timori: l’accordo precedente prosegue nelle battute vuote."
          },
          {
            "check": "La voce non ha note",
            "means": "Non c’è nessuna melodia: YuE2 se la inventerà.",
            "fix": "Disegna la melodia con la matita o usa uno degli avvii rapidi."
          },
          {
            "check": "Meno note che sillabe nel testo",
            "means": "Molte meno note che sillabe: YuE2 inventa il resto e può allontanarsi dalle tue note.",
            "fix": "Aggiungi note (nella vista semplice, il pulsante «aggiungi») oppure usa «Da una canzone…»."
          },
          {
            "check": "Note sopra o sotto la voce",
            "means": "Difficile per chi canta; YuE2 può forzare o cambiare ottava.",
            "fix": "Prima controlla che sia scelta la voce giusta, maschile o femminile. Poi premi Correggi: la melodia si sposta per ottave dentro l’estensione."
          },
          {
            "check": "Le sezioni non corrispondono al testo",
            "means": "Più o meno sezioni nelle note che tag nel testo: le righe finiscono nei posti sbagliati.",
            "fix": "Correggi aggiunge le sezioni mancanti in fondo — poi controlla l’ordine. Elimina tu le sezioni in più o modifica i tag nel testo."
          },
          {
            "check": "Lo strumento suona insieme alla voce",
            "means": "Un’annotazione, non un errore: di solito lo strumento tace mentre la voce canta.",
            "fix": "Niente, se è voluto. Altrimenti cancella le note dello strumento in quelle battute."
          },
          {
            "check": "L’ABC è lungo",
            "means": "Una partitura molto lunga occupa gran parte del prompt di YuE2.",
            "fix": "Accorcia la canzone o elimina le note in più dello strumento."
          }
        ],
        "tip": "Le voci verdi non richiedono nulla. Quando non restano segnalazioni, puoi premere Crea.",
        "title": "Controllo per YuE2",
        "toc": "Controllo per YuE2"
      },
      "chords": {
        "note": "YuE2 usa gli accordi solo con il piano «Melodia e accordi». Con «Segui una melodia» il modello sceglie da sé l’accompagnamento, e i tuoi accordi restano solo un appunto per te.",
        "p": [
          "Un <b>accordo</b> è un insieme di suoni suonati insieme. L’accompagnamento si regge su di esso: chitarra, tastiere, basso. Gli accordi stanno in fila sopra le note, di solito uno per battuta.",
          "Clicca l’accordo di una battuta (o un punto vuoto della fila) per sceglierne un altro. Quelli <b>adatti</b> vengono per primi: gli accordi della tua tonalità, che YuE2 rispetta meglio. Sotto ci sono «Comuni in minore» o «Comuni in maggiore» e «Altri» per sperimentare. «Ascolta» suona l’accordo, «Due in una battuta» divide la battuta in due accordi.",
          "Non sai cosa scegliere? Tieni quello che inserisce «Disegna da zero»: una progressione collaudata di quattro accordi.",
          "<b>Per i musicisti</b> — l’interruttore sotto la griglia mostra i numeri romani sugli accordi (I, IV, V, vi…): il grado dell’accordo nella tonalità. Serve a chi conosce la teoria; agli altri non serve."
        ],
        "title": "Accordi",
        "toc": "Accordi"
      },
      "faq": {
        "items": [
          {
            "q": "Devo saper leggere la musica?",
            "a": "No. Basta sentire «più alto — più basso» e «più lungo — più corto». Attiva «In tonalità» e non ci saranno note sbagliate."
          },
          {
            "q": "Perché la voce maschile canta più in basso di quanto ho disegnato?",
            "a": "YuE2 scrive le melodie maschili un’ottava sopra dove vengono cantate. È normale; non serve abbassare le note."
          },
          {
            "q": "Le note vengono salvate da qualche parte?",
            "a": "Sì, sono le note del modulo: ogni modifica va direttamente nel modulo, e Ctrl+Z la annulla. Nessun salvataggio a parte — premi Crea e YuE2 le prende."
          },
          {
            "q": "Quanto durerà la canzone?",
            "a": "Quanto le sue battute. A tempo 95 in 4/4 una battuta dura circa 2,5 secondi: 16 battute sono circa 40 secondi, 64 battute circa 2,7 minuti."
          },
          {
            "q": "Perché YuE2 non ha cantato esattamente le mie note?",
            "a": "Il modello segue le note da vicino, ma non è un sintetizzatore: può abbellire la melodia, spostare una sillaba, cantare un’ottava sotto. Se è molto diverso, guarda la ricetta «La canzone non segue le note»."
          },
          {
            "q": "Devo disegnare batteria e basso?",
            "a": "No. Solo la voce e, se vuoi, una linea di strumento nell’intro e negli stacchi. YuE2 suona il resto in base allo stile."
          },
          {
            "q": "Cos’è il testo ABC in fondo?",
            "a": "Le stesse note scritte in lettere — è ciò che riceve YuE2. Lo scrive l’editor da solo; modificalo a mano solo se conosci il formato."
          },
          {
            "q": "Come ascolto senza creare una canzone?",
            "a": "Ascolta (Space) suona le note con un pianoforte. Metronomo segna i movimenti, Ripeti ripete le battute selezionate."
          },
          {
            "q": "Posso prendere le note di una take già pronta?",
            "a": "Sì: «Apri le note» su una take le apre come copia. Modifica, ascolta e premi «Nel modulo» per creare da esse una nuova take."
          }
        ],
        "title": "Domande frequenti",
        "toc": "Domande frequenti"
      },
      "key": {
        "p": [
          "Una <b>tonalità</b> è un insieme di sette suoni che stanno bene insieme. Una melodia fatta con essi suona giusta, mentre un suono fuori dall’insieme stona come una nota sbagliata.",
          "Il <b>minore</b> suona più triste e drammatico, il <b>maggiore</b> più luminoso e allegro. La lettera (C, D, A…) è il suono da cui parte l’insieme. A orecchio conta poco; conta se è comodo da cantare.",
          "Le righe della griglia che appartengono alla tonalità sono evidenziate. Attiva <b>«In tonalità»</b> e la matita non ti lascerà posare una nota sbagliata: si posa sulla riga adatta più vicina. È il modo più facile per non stonare mai. Serve una nota fuori tonalità? Tieni premuto Shift.",
          "La tonalità si cambia con il chip Tonalità in alto. Con «Sposta anche le note e gli accordi» attivo, tutta la canzone si sposta e suona più alta o più bassa."
        ],
        "tempo": [
          "Il <b>tempo</b> sono i battiti al minuto (BPM). 70–90 è calmo, 95–120 medio, da 130 in su veloce. YuE2 prende il tempo dalle note; un tempo nel testo dello stile non ha effetto.",
          "Il <b>metro</b> è quanti movimenti ha una battuta. 4/4 è quasi tutto il pop e il rock, 3/4 un valzer, 6/8 una sensazione ondeggiante, le ballate. Non sei sicuro? Tieni 4/4.",
          "La <b>durata</b> è quante battute ha la canzone. L’audio segue le note: 8 battute di 4/4 a tempo 95 sono circa 20 secondi."
        ],
        "tempoTitle": "Tempo e metro",
        "title": "Tonalità, tempo e metro",
        "toc": "Tonalità e tempo"
      },
      "lanes": {
        "p": [
          "Le note hanno due corsie. <b>Voce</b> (note viola-rosa) è ciò che canta il cantante. <b>Strumento</b> (verde acqua) è una linea melodica di uno strumento: l’intro, gli stacchi, il finale.",
          "La matita scrive nella corsia attiva — clicca l’altra per cambiare. «Muto» e «Solo questa» cambiano soltanto ciò che senti qui; non influiscono sulla canzone.",
          "<b>Perché lo strumento di solito tace mentre la voce canta.</b> Così sono fatte le partiture di YuE2: lo strumento riempie i punti senza voce. Se suona sopra il canto, YuE2 può confondersi su cosa cantare. Il controllo segnala queste battute — è un’annotazione, non un errore.",
          "Batteria, basso e accompagnamento non vanno disegnati: YuE2 li suona da sé in base allo stile e agli accordi."
        ],
        "title": "Voce e Strumento",
        "toc": "Voce e Strumento",
        "voice": [
          "L’interruttore Maschile / Femminile sulla corsia Voce imposta un’estensione comoda per il cantante. Le note fuori da essa hanno un contorno rosso, e il controllo propone di riportarle dentro. Se lo stile dice female o female vocals, l’interruttore si imposta da solo.",
          "<b>La voce maschile di YuE2 canta un’ottava sotto le note scritte.</b> È normale: YuE2 scrive così le melodie anche nelle sue partiture. Quindi una melodia maschile appare alta nell’editor — non abbassarla di proposito, o il cantante scende sui bassi.",
          "Importando un MIDI, «Adatta l’ottava alla voce» fa questo spostamento per te."
        ],
        "voiceTitle": "Voce maschile o femminile"
      },
      "parts": {
        "p": [
          "Una canzone è fatta di sezioni: intro, strofa, pre-ritornello, ritornello, bridge, interludio, outro. Nell’editor sono il nastro colorato sopra le battute.",
          "Le sezioni sono legate ai tag nel testo: [Verse] è una strofa, [Chorus] un ritornello, [Bridge] un bridge e così via. Così YuE2 sa quali righe cantare e dove nelle note. Perciò il numero e l’ordine delle sezioni devono corrispondere ai tag nel testo — il controllo lo verifica.",
          "Cliccando una sezione si apre il suo menu: tipo, nome, «Ripeti la sezione» (un secondo ritornello in un secondo), «Aggiungi una sezione dopo», «Mostra l’intera sezione», «Elimina con le sue battute». Il bordo di una sezione si può trascinare.",
          "<b>«Segna le sezioni dal testo».</b> Dopo un’importazione MIDI di solito non ci sono sezioni. Se il testo ha dei tag, l’editor propone di segnare le note con essi con un solo pulsante: le battute vengono divise in ordine secondo i tag del testo."
        ],
        "tip": "Tipico per YuE2: intro e bridge 4–8 battute, strofa e ritornello 8–16.",
        "title": "Sezioni della canzone",
        "toc": "Sezioni della canzone"
      },
      "recipes": {
        "intro": "Desideri comuni e cosa fare, passo per passo.",
        "items": [
          {
            "title": "Voglio il ritornello più alto",
            "steps": [
              "Mostra il ritornello: clicca la sezione Ritornello → «Mostra l’intera sezione».",
              "Con Selezione, disegna un riquadro attorno alle note del ritornello nella corsia Voce.",
              "Premi ↑: ogni pressione è un semitono su. 3–5 semitoni si sentono bene; Shift + ↑ salta di un’ottava.",
              "Oppure nella vista semplice: i pulsanti «Alza di un grado della scala» a ogni riga del ritornello.",
              "Guarda il controllo: le note non devono uscire dall’estensione della voce."
            ]
          },
          {
            "title": "La canzone non segue le note",
            "steps": [
              "Controlla il piano nella scheda Melodia: deve essere «Segui una melodia» o «Melodia e accordi», non «Nessun piano».",
              "Apri il controllo. Cause comuni sono «Meno note che sillabe» e «Le sezioni non corrispondono al testo».",
              "Una nota per sillaba: nella vista semplice il contatore di ogni riga deve combaciare.",
              "Una voce maschile canta un’ottava sotto le note scritte — confronta la forma della melodia, non la sua altezza.",
              "Crea 2–3 take: il modello improvvisa ancora un po’, e una take di solito è più vicina."
            ]
          },
          {
            "title": "La melodia è noiosa",
            "steps": [
              "Alza il ritornello di 3–5 semitoni sopra la strofa — è questo che lo fa «decollare».",
              "Mescola note lunghe e corte: alcune corte, poi una nota lunga a fine riga.",
              "Aggiungi un salto: una nota nettamente più alta delle vicine, sulla parola più importante.",
              "Ripeti una bella frase con Ctrl+C e Ctrl+V. La ripetizione rende una melodia orecchiabile.",
              "Chiudi una riga su una nota della tonalità (una riga evidenziata) — la frase suona allora conclusa."
            ]
          },
          {
            "title": "Le parole non ci stanno",
            "steps": [
              "Apri «Semplice»: una riga affollata mostra «mancano note».",
              "Premi «aggiungi» — le note più lunghe vengono divise.",
              "Oppure dividi tu le note lunghe con lo strumento Dividi (C).",
              "Se la riga è ancora affollata, dalle più spazio: trascina il bordo della sezione o usa «Aggiungi una sezione dopo». Oppure accorcia la riga del testo."
            ]
          },
          {
            "title": "Voglio la melodia di un’altra canzone",
            "steps": [
              "Hai un file audio — «Da una canzone…»: SheetSage2 trascrive melodia e accordi.",
              "Hai un MIDI — «Importa MIDI»: scegli la parte vocale come Voce, attiva «Adatta l’ottava alla voce» e inserisci il tempo reale della canzone.",
              "È già una take di YuE2 — «Apri le note» sulla take, poi «Nel modulo».",
              "Dopo l’importazione: «Segna le sezioni dal testo», poi il controllo.",
              "Le tue parole probabilmente cadranno diversamente dall’originale — sistemale nella vista semplice."
            ]
          }
        ],
        "title": "Ricette",
        "toc": "Ricette"
      },
      "roll": {
        "head": {
          "key": "Tasto",
          "what": "Cosa fa"
        },
        "keys": [
          {
            "key": "Space",
            "what": "Ascolta o pausa"
          },
          {
            "key": "Home",
            "what": "Torna all’inizio"
          },
          {
            "key": "B · V · E · C",
            "what": "Matita · Selezione · Gomma · Dividi"
          },
          {
            "key": "1 2 3 4 5",
            "what": "Durata di una nuova nota: 1/16, 1/8, 1/4, 1/2, intera"
          },
          {
            "key": "6",
            "what": "Una pausa invece di una nota"
          },
          {
            "key": "K",
            "what": "Attiva o disattiva «In tonalità»"
          },
          {
            "key": "L",
            "what": "Ripeti le battute selezionate"
          },
          {
            "key": "F",
            "what": "Schermo intero"
          },
          {
            "key": "↑ ↓",
            "what": "Note selezionate un semitono su o giù"
          },
          {
            "key": "Shift + ↑ ↓",
            "what": "Note selezionate un’ottava su o giù"
          },
          {
            "key": "← →",
            "what": "Sposta la selezione (o il cursore) di un passo della griglia"
          },
          {
            "key": "Shift + ← →",
            "what": "Sposta di un’intera battuta"
          },
          {
            "key": "Delete",
            "what": "Elimina la selezione"
          },
          {
            "key": "Ctrl + Z · Ctrl + Shift + Z",
            "what": "Annulla · ripeti"
          },
          {
            "key": "Ctrl + C · Ctrl + V",
            "what": "Copia · incolla al cursore"
          },
          {
            "key": "Ctrl + D",
            "what": "Duplica la selezione"
          },
          {
            "key": "Ctrl + A",
            "what": "Seleziona tutte le note della corsia"
          },
          {
            "key": "Esc",
            "what": "Cancella la selezione"
          },
          {
            "key": "Shift mentre disegni",
            "what": "Posa una nota fuori tonalità"
          },
          {
            "key": "Alt mentre disegni",
            "what": "Cancella"
          },
          {
            "key": "Ctrl + rotella",
            "what": "Ingrandisci o riduci"
          },
          {
            "key": "Shift + rotella",
            "what": "Scorri di lato"
          }
        ],
        "keysHint": "Funzionano quando il focus è nell’editor delle note, non in un campo di testo.",
        "keysTitle": "Scorciatoie da tastiera",
        "p": [
          "Il piano roll è una striscia che scorre da sinistra a destra, come il tempo. Ogni barra su di esso è una nota.",
          "<b>Più in alto sullo schermo significa un suono più acuto.</b> I tasti del pianoforte a sinistra mostrano di quale nota si tratta.",
          "<b>Una barra più lunga significa un suono più lungo.</b> Lo spazio vuoto tra le note è una pausa: la voce tace.",
          "Una <b>battuta</b> è il tratto tra le spesse linee verticali; i numeri delle battute sono in alto. In 4/4 una battuta ha quattro movimenti — quattro passi su cui potresti battere le mani. A tempo 95 una battuta dura circa 2,5 secondi, quindi 16 battute sono circa 40 secondi di canzone.",
          "La <b>griglia</b> sono le linee sottili dentro una battuta. Le note vi si agganciano, così il ritmo viene regolare. Una griglia più fine permette di posare una nota con più precisione.",
          "Il <b>cursore</b> è la linea verticale da cui parte Ascolta. Clicca il righello delle battute per posizionarlo. Trascina lungo il righello per selezionare le battute da ripetere."
        ],
        "title": "Come leggere il piano roll",
        "toc": "Leggere il piano roll",
        "tools": [
          "<b>Matita (B)</b> — un clic posa una nota della durata scelta; trascinando a destra la allunga.",
          "<b>Selezione (V)</b> — clicca una nota o disegna un riquadro attorno a più note. Le note selezionate si possono trascinare, spostare con i tasti freccia e ridimensionare dal bordo destro.",
          "<b>Gomma (E)</b> — clicca o passa sulle note per rimuoverle. Tenendo premuto Alt qualsiasi strumento diventa la gomma.",
          "<b>Dividi (C)</b> — divide una nota in due lungo la griglia. Comodo quando un lungo suono deve portare due sillabe.",
          "<b>Durata</b> — la durata di una nuova nota: 1/4 è un movimento, 1/8 mezzo movimento, 1/2 due movimenti. «Pausa» disegna il silenzio."
        ],
        "toolsTitle": "Strumenti",
        "views": [
          "<b>Piano roll</b> — la vista principale, dove si disegna e si modifica.",
          "<b>Note</b> — le stesse note come in un libro di musica, per chi legge la musica: per guardare e ascoltare.",
          "<b>Semplice</b> — la melodia come punti sopra il testo; vedi «Vista semplice»."
        ],
        "viewsTitle": "Tre viste"
      },
      "simple": {
        "p": [
          "«Semplice» è la vista per chi trova difficile il piano roll. Ogni riga del testo è una scheda: i punti stanno sopra le sillabe, e la linea tra di essi mostra dove va la melodia — su o giù.",
          "<b>Trascina un punto su o giù</b> (o selezionalo e premi ↑ ↓) per alzare o abbassare la nota. Con «In tonalità» il punto si muove solo tra le note della tonalità, mai fuori. Cliccando una sillaba si ascolta la sua nota.",
          "Il <b>contatore</b> «5 sill. · 5 note» mostra se ci sono abbastanza note per le parole. Il meglio è una nota per sillaba.",
          "<b>«+1 cantata come melisma»</b> — più note che sillabe: quelle in più vengono cantate allungate su una sillaba («a-a-amo-o-ore»). Va bene e spesso è bellissimo.",
          "<b>«Mancano note — aggiungi»</b> — più sillabe che note. Il pulsante «aggiungi» divide le note più lunghe della riga così che ogni sillaba abbia la sua.",
          "Il ritmo, cioè la durata delle note, non si cambia qui — usa il piano roll. I pulsanti su una riga la ascoltano e spostano l’intera riga su o giù."
        ],
        "title": "Vista semplice: la melodia sulle parole",
        "toc": "Vista semplice"
      },
      "start": {
        "also": [
          "<b>Suona il pianoforte</b> — sulla tastiera su schermo o su una tastiera MIDI: le note si scrivono una dopo l’altra dal cursore.",
          "<b>Incolla ABC</b> — se la melodia esiste già come ABC (il menu Importa).",
          "<b>Le note di una take</b> — una take di YuE2 finita ha «Apri le note»: la sua partitura si apre come copia. Ascoltala e modificala; il modulo non cambia. «Nel modulo» porta queste note nel modulo, «Chiudi» torna alle note del modulo."
        ],
        "alsoTitle": "Altri modi",
        "intro": "Ancora nessuna nota? Tutti e tre i modi sono nella schermata vuota di Note.",
        "sparse": "YuE2 canta una nota per sillaba. Se una trascrizione MIDI ha molte meno note delle sillabe del testo (le trascrizioni automatiche spesso ne hanno), il modello deve inventare il resto, e la canzone smette di seguire le note. Il controllo lo segnala. Completa la melodia nel piano roll o nella vista semplice — oppure prendi le note «Da una canzone…».",
        "sparseTitle": "Perché un MIDI «scarno» dà risultati deboli",
        "title": "Tre avvii rapidi",
        "toc": "Tre avvii rapidi",
        "ways": [
          {
            "title": "Disegna da zero",
            "text": "Scegli tonalità, tempo e metro, e l’editor costruisce uno scheletro dal testo: sezioni dai tag [Verse] e [Chorus], un numero adatto di battute e accordi provvisori. Resta solo da disegnare la melodia vocale con la matita. Il modo migliore quando la melodia è nella tua testa."
          },
          {
            "title": "Da una canzone…",
            "text": "Scegli un file audio e SheetSage2 ne trascrive melodia, accordi e sezioni. Ci vuole un minuto o due. Funziona meglio su un brano con una voce chiara, senza coro né rumore. Poi modifica come vuoi."
          },
          {
            "title": "Importa MIDI",
            "text": "Trascina un file .mid da una DAW, un’app di notazione o un sito web. Nel selettore scegli quale parte diventa la Voce e quale lo Strumento; batteria e il resto vengono scartati, e dagli accordi si prende la nota più alta. «Adatta l’ottava alla voce» sposta la melodia come la scrive YuE2. Il campo del tempo: le trascrizioni spesso sono salvate a 120 BPM anche se la canzone è più veloce o più lenta — inserisci il tempo reale e le note cadono dove suonano."
          }
        ]
      },
      "what": {
        "head": {
          "name": "Piano",
          "text": "Cosa fa YuE2",
          "when": "Quando sceglierlo"
        },
        "p": [
          "Le note sono la melodia della canzone disegnata come barre: quale suono cantare, quando iniziare e quanto tenerlo. Non serve saper leggere la musica — basta sentire quale suono è più alto e quale più basso.",
          "<b>Senza note</b> YuE2 inventa la melodia da sé. Ogni take è diversa, e non si può sapere in anticipo come verrà cantata una riga.",
          "<b>Con le note</b> YuE2 canta la tua melodia. Nei nostri test il modello ha colpito le note disegnate il 98% delle volte, ha mantenuto i salti su e giù della melodia e la durata: tante battute disegni, tante ne canta.",
          "Nel modulo le note sono conservate come testo ABC — le stesse note scritte in lettere. Lo scrive l’editor per te; non devi toccarlo."
        ],
        "plans": [
          {
            "name": "Nessun piano",
            "text": "Inventa da sé melodia e accompagnamento e passa direttamente all’audio.",
            "when": "Quando non ci sono note e vuoi solo ascoltare idee. Appena il modulo ha delle note, l’app imposta da sola il piano su «Segui una melodia»."
          },
          {
            "name": "Segui una melodia",
            "text": "Canta la tua melodia e inventa da sé l’accompagnamento. I tuoi accordi non vengono usati.",
            "when": "Quasi sempre, dopo che hai disegnato la voce. La scelta più sicura."
          },
          {
            "name": "Melodia e accordi",
            "text": "Prende sia la tua melodia sia i tuoi accordi.",
            "when": "Quando hai scelto gli accordi e vuoi proprio quell’armonia."
          }
        ],
        "plansIntro": "Il piano si sceglie nel modulo, nella scheda Melodia. Dice a YuE2 cosa fare con le tue note.",
        "plansTitle": "I tre piani della melodia",
        "title": "Cosa sono le note e perché servono a YuE2",
        "toc": "Perché le note"
      }
    },
    "title": "Guida alle note",
    "toc": "Indice",
    "tocPick": "Sezione della guida"
  },
  "player": {
    "mute": "Silenzia",
    "unmute": "Riattiva l’audio",
    "volume": "Volume"
  },
  "sa3Gen": {
    "promptHint": "L’inglese funziona meglio; l’assistente Descrivi traduce. Indica genere, strumenti, atmosfera e tempo; per un suono, la sua fonte, come avviene e l’ambiente."
  },
  "score": {
    "checks": {
      "sparseVocal": "Meno note che sillabe nel testo — YuE2 inventerà il resto",
      "sparseVocalSub": "{notes} note, {syllables} sillabe. Meglio disegnare il resto della melodia o usare «Da una canzone…»"
    },
    "lane": {
      "femaleAbbr": "Femm.",
      "insShort": "Str.",
      "maleAbbr": "Masch.",
      "voiceFemale": "Voce: femminile",
      "voiceMale": "Voce: maschile"
    },
    "midi": {
      "fitOctave": "Adatta l’ottava alla voce",
      "fitOctaveHint": "YuE2 scrive una melodia circa un’ottava sopra dove viene cantata, mentre una trascrizione MIDI ha l’altezza cantata. L’intera parte vocale si sposta per ottave intere.",
      "markSections": "Segna le sezioni dal testo",
      "movedDown": "La voce è stata spostata giù di {n} ottava. | La voce è stata spostata giù di {n} ottave.",
      "movedUp": "La voce è stata spostata su di {n} ottava. | La voce è stata spostata su di {n} ottave.",
      "noSections": "Il MIDI non ha sezioni della canzone. Tag del testo: {tags}.",
      "octaveDown": "−{n} ottava | −{n} ottave",
      "octaveNone": "ottava come nel file",
      "octaveUp": "+{n} ottava | +{n} ottave",
      "tempoFile": "dal file",
      "tempoHint": "Il file dice {bpm} BPM. Le trascrizioni spesso sono salvate a 120 qualunque sia il tempo della canzone: imposta il tempo della canzone e le note vengono posizionate secondo quando suonano.",
      "tempoTrack": "dal brano «{title}»"
    },
    "overview": {
      "pickHint": "Apri queste battute in Note"
    },
    "toolbar": {
      "musician": "Per musicisti",
      "musicianTip": "Mostra i gradi degli accordi (I, IV, V…) — teoria musicale per chi la conosce"
    },
    "workspace": {
      "backTip": "Torna alla sessione; le note restano nel modulo",
      "copyBadge": "copia della take",
      "copyBadgeTip": "Una copia delle note della take: il modulo non cambia finché non premi «Nel modulo»",
      "copyLead": "Ascolta e modifica qui — il modulo non cambia finché non premi «Nel modulo». «Chiudi» torna alle note del modulo.",
      "copyTitle": "Note della take «{title}»",
      "form": "Modulo",
      "formBadge": "note del modulo",
      "formBadgeTip": "Queste sono le note del modulo: le modifiche vanno subito nel modulo (Ctrl+Z le annulla)",
      "label": "Note",
      "replaceConfirm": "Il modulo ha già altre note. Sostituirle con le note di questa take? (Ctrl+Z le riporta)",
      "title": "Note",
      "toForm": "Nel modulo"
    }
  },
  "takeCompare": {
    "seed": "Seed {seed}"
  },
  "yueGen": {
    "abcScore": "Note",
    "help": {
      "melody": {
        "sources": [
          "Da una canzone… — scegli un file audio e SheetSage2 ne scrive melodia e accordi. Funziona meglio una canzone con una voce chiara.",
          "Importa MIDI — la parte più alta diventa la melodia, gli altri canali l’accompagnamento e gli accordi, e la tonalità si trova da sola. Tieni la melodia vocale su una traccia a parte.",
          "Pianoforte — scegli una durata e premi i tasti (sotto, a sinistra del roll, o su una tastiera MIDI): le note si susseguono.",
          "Da un brano: Note in MIDI nel menu di una take, o la scheda Stem e note nella libreria, poi In una partitura YuE2. La voce diventa la melodia, il basso e il resto l’accompagnamento."
        ]
      }
    },
    "unloadSheetSage": "Libera la scheda video dopo aver estratto la melodia"
  }
}
