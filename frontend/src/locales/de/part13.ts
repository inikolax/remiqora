// Notes workspace and help, and the strings added or reworded after part12 (machine-translated from en); merged last, key by key.
export default {
  "aceGen": {
    "closeness": "Wie nah am Original",
    "closenessHigh": "Freier",
    "closenessHint": "Links behält das Ergebnis Melodie und Arrangement der Vorlage; rechts verändert das Modell mehr.",
    "closenessLow": "Näher am Original",
    "loraSimple": "LoRA",
    "loraTrain": "Eigene trainieren",
    "modelDefault": "{name} (Standard)",
    "refChoose": "Datei wählen",
    "refDrop": "Audio hierher ziehen oder aus der Bibliothek wählen",
    "refFromLibrary": "Aus der Bibliothek",
    "refLoading": "Titel wird geladen…",
    "refNeeded": "Wähle hier einen Titel oder geh zurück zum Tab „Song“ für einen neuen Song.",
    "refOff": "Nimm einen fertigen Titel: ein Cover, einen neu gemalten Bereich, einen entfernten oder ergänzten Part. Ohne Titel macht das Formular einen neuen Song.",
    "refRemove": "Entfernen"
  },
  "aiPart": {
    "guide": {
      "hears": [
        "Die markierten Spuren werden zu einer Stereospur gemischt: mit den Spurlautstärken, Fades und der Tempoanpassung (W), aber ohne Effekte und ohne Rücksicht auf die Tasten M und S.",
        "Das Tempo kommt aus dem BPM-Feld des Projekts, nicht aus den Clips: Stelle es passend zum Material ein. Die Tonart kommt aus „Tonart“; bei „Auto“ findet das Modell sie selbst.",
        "ACE-Step kennt nur Dur und Moll. Bei jeder anderen Tonleiter bekommt das Modell die nächstliegende Tonart und den Namen der Tonleiter in der Beschreibung: ein Hinweis, keine Garantie.",
        "Spuren mit Varianten, bei denen die Wahl noch aussteht, werden nicht angeboten: Sie sind Entwürfe.",
        "Das Modell nimmt keinen Bereich über 10 Minuten: Wähle ein kürzeres Stück."
      ],
      "limits": [
        "„Part hinzufügen“ läuft nur auf dem ACE-Step-Basismodell (etwa 4,8 GB). In der Desktop-App ist es bei der Installation eine Option; wurde es ausgelassen, zeigt der Arrangeur eine Schaltfläche „Installieren“. Mit den Skripten gibt setup_models am Ende den Befehl dafür aus.",
        "base ist langsamer als turbo: Auf einer RTX 4080 braucht eine Variante für einen Titel von 2–3 Minuten etwa 10 Sekunden, und der erste Lauf dauert länger, während das Modell lädt.",
        "Das Modell hält sich besser an Tonart und Akkorde dessen, was es hört, als an rhythmische Ideen: „spielt in den Lücken des Gesangs“ klappt womöglich nicht.",
        "Die Klangqualität ist das, was das Modell liefert. Es gibt kein MIDI zu Audio: Das Modell arbeitet nur mit Audio.",
        "Ist xl-base installiert, erscheint es in der Modellliste; auf einer 16-GB-Karte belegt es fast den ganzen Videospeicher. Zum Ergänzen von Parts nimm base: In Messungen lieferte xl-base in etwa einer von fünf Varianten Rauschen, base in einer von fünfundzwanzig.",
        "Das Aussortieren von Rauschen kostet Zeit: Wird eine Variante verworfen, wird die Anfrage erneut gesendet, und die Erzeugung dauert länger. Schlagzeug, Percussion und Effekte werden nicht geprüft: Sie sind von Natur aus rauschartig."
      ],
      "variants": [
        {
          "term": "Anhören",
          "text": "schaltet auf diese Variante um, stummt die anderen und spielt ab dem Anfang des Bereichs."
        },
        {
          "term": "Behalten",
          "text": "behält die Variante und entfernt die anderen. Bei Repaint, Fortsetzung oder Cover ersetzt die behaltene Variante das Original im Bereich."
        },
        {
          "term": "Alle entfernen",
          "text": "entfernt alle Varianten und setzt die Spuren zurück, wie sie waren."
        },
        {
          "term": "Kontextkopie",
          "text": "markiert eine Variante, in der das Modell fast den gehörten Mix statt eines neuen Parts zurückgegeben hat. Erzeuge neu."
        },
        {
          "term": "Rauschen",
          "text": "markiert eine Variante, in der das Modell Zischen statt eines Parts zurückgegeben hat. Der Arrangeur verwirft solche Varianten selbst und fordert Ersatz an, bis zu zweimal; die Markierung bleibt nur bei dem, was nach den Wiederholungen zurückkam."
        },
        {
          "term": "Ctrl+Z",
          "text": "macht sowohl das Einfügen der Varianten als auch die Wahl rückgängig. Die Dateien verworfener Varianten verlassen die Bibliothek erst beim Speichern des Projekts, und nur wenn kein Clip sie verwendet."
        }
      ]
    }
  },
  "covers": {
    "after": {
      "hintSa": "Nach der Erzeugung: ein Cover für alle Varianten. Belegt die GPU für weitere ~30 s."
    },
    "studio": {
      "errChanged": "Das Cover wurde inzwischen neu erstellt. Speichere noch einmal.",
      "errLoad": "Das Coverbild konnte nicht geladen werden. Versuche es erneut.",
      "errNoCover": "Dieser Titel hat kein Cover, auf das sich die Beschriftung setzen ließe.",
      "errSave": "Die Beschriftung konnte nicht gespeichert werden. Versuche es erneut."
    }
  },
  "create": {
    "failed": "Es hat nicht geklappt. Klick auf „Diese Einstellungen erneut verwenden“ und dann noch einmal auf „Erstellen“.",
    "madeAt": "um {time}",
    "menu": {
      "midi": "Noten zu MIDI"
    },
    "notes": {
      "cardTitle": "Noten",
      "draw": "Zeichnen",
      "drawNote": "„Zeichnen“ öffnet rechts die Noten mit einem Gerüst aus dem Text: Teile aus den Tags [Verse], [Chorus], ein Platzhalter-Akkord pro Takt.",
      "emptyLead": "Ohne Noten schreibt YuE2 die Melodie selbst. Mit Noten singt es deine.",
      "emptyTitle": "Noch keine Noten",
      "fromSong": "Aus einem Song",
      "fromSongDots": "Aus einem Song…",
      "hasScore": "das Formular hat eine Partitur",
      "importMidi": "MIDI importieren",
      "open": "Noten öffnen",
      "openHere": "Die Noten sind rechts geöffnet.",
      "openNote": "Änderungen an den Noten gehen direkt ins Formular — klick auf „{button}“, und YuE2 nimmt sie.",
      "openSection": "Diesen Abschnitt in den Noten öffnen",
      "openTakeTip": "Die Partitur dieser Variante im Arbeitsbereich „Noten“ — anhören, vergleichen, bearbeiten, dann bei Bedarf ins Formular übernehmen",
      "rail": "Noten",
      "railTip": "YuE2-Noten — der Partitur-Editor rechts, anstelle der Sitzung",
      "remarks": "{n} Anmerkung der Prüfung: {list} | {n} Anmerkungen der Prüfung: {list}",
      "takeTitle": "{title} · Variante {n}"
    },
    "rail": {
      "ace_step": "ACE",
      "generate": "Erzeugen",
      "lora": "LoRA",
      "models": "Modelle",
      "stable_audio": "Sound",
      "yue2": "YuE2"
    },
    "reuse": "Diese Einstellungen erneut verwenden",
    "reuseInForm": "Diese Einstellungen erneut verwenden"
  },
  "editor": {
    "clipInTrash": "Titel im Papierkorb",
    "clipInTrashHint": "Der Titel dieses Clips liegt im Papierkorb der Bibliothek: Er wird noch abgespielt, aber der Papierkorb löscht ihn nach 30 Tagen endgültig.",
    "guide": {
      "clip": [
        "Ziehen verschiebt einen Clip, die Ränder beschneiden ihn. Die Wellenform wird beim Beschneiden nicht gestaucht: Du siehst genau das Audio, das übrig bleibt. Die Quelldatei ändert sich nie.",
        "Die Schaltflächen auf einem Clip liegen über der Wellenform und erscheinen beim Darüberfahren oder wenn der Clip gewählt ist; eingeschaltete sind immer sichtbar. M stummt den Clip, S lässt nur ihn hören, W passt ihn ans Projekttempo an, das Kreuz löscht ihn.",
        "Die Randgriffe stellen Fades ein. Ohne sie bekommt jeder Rand einen Mikro-Fade von 15 ms, damit ein Schnitt nicht knackt.",
        "Werkzeuge im Transport: „Auswählen“ (V) verschiebt und beschneidet Clips, das Messer (C) schneidet einen Clip dort, wo du klickst, der Radierer (E) entfernt das Stück, über das du ziehst, oder bei einem Klick den ganzen Clip. Messer und Radierer rasten am Raster und an den Clip-Rändern ein; Esc geht zurück zu „Auswählen“.",
        "S schneidet den gewählten Clip an der Abspielposition oder, wenn nichts gewählt ist, jeden Clip unter der Abspielposition. Ctrl+D setzt eine Kopie direkt hinter den Clip.",
        "Clips sind durchscheinend: Das Raster der Timeline schimmert durch."
      ],
      "lane": [
        "Benenne eine Spur direkt in ihrem Kopf um. M stummt sie, S lässt nur sie hören.",
        "Farbe: Wähle die Spur und klick auf einen Punkt über der Spurliste.",
        "Eine Spur mit einem ganzen Song lässt sich mit der Schaltfläche neben M und S in Stems zerlegen: Gesang, Schlagzeug, Bass und Rest ersetzen sie.",
        "Das Kreuz entfernt die Spur; Ctrl+Z holt sie zurück.",
        "Die Spurhöhe stellst du mit dem Pfeil-Regler im Transport oder mit Alt und dem Mausrad ein: Je höher die Spur, desto größer die Wellenform. Eine Höhe für alle Spuren."
      ],
      "steps": [
        {
          "title": "Spuren hinzufügen",
          "text": "Die Schaltfläche „Spur“ öffnet die Bibliothek: Füge einen Titel ganz oder als Stems hinzu. Eine Datei von deinem Computer kannst du direkt auf eine Spur ziehen."
        },
        {
          "title": "Clips anordnen",
          "text": "Zieh Clips und beschneide sie an den Rändern. Das Messer (C) schneidet einen Clip dort, wo du klickst, der Radierer (E) entfernt das Stück, über das du ziehst. Fades ziehst du an den Griffen an den Clip-Rändern auf."
        },
        {
          "title": "Tempo anpassen",
          "text": "Das BPM-Feld stellt das Projekttempo ein, die Schaltfläche W an einem Clip passt ihn an dieses Tempo an. „Magnet“ schaltet das Einrasten am Raster ein, und der Schalter „0:00 | 1 | 2“ wählt, was Lineal und Raster zählen: Sekunden oder Takte."
        },
        {
          "title": "Mischen",
          "text": "Spurlautstärke und Panorama, acht Effekte auf jeder Spur und auf dem Master. Die Schaltfläche „Mixer“ zeigt den Mixer."
        },
        {
          "title": "Speichern",
          "text": "Es gibt kein automatisches Speichern: „Speichern“ oder Ctrl+S. Verlässt du die Seite mit ungespeicherten Änderungen, warnt dich der Editor."
        },
        {
          "title": "Exportieren",
          "text": "WAV oder MP3 in die Bibliothek, oder Stems mit einem Reaper-Projekt oder DAWproject, um in deiner eigenen DAW weiterzuarbeiten."
        }
      ],
      "tempo": [
        "Das Tempo eines Clips wird beim Hinzufügen aus seinen ersten 30 Sekunden erkannt. Der Detektor ist einfach und kann sich bei komplexem Material irren.",
        "W streckt den Clip auf die Projekt-BPM, ohne seine Tonhöhe zu ändern.",
        "Clips haften an den Rändern anderer Clips und am Anfang der Timeline. „Magnet“ ergänzt das Einrasten am Raster. Der Schalter „0:00 | 1 | 2“ wählt, was Raster und Lineal zählen: Sekunden oder Takte und Schläge der Projekt-BPM (4/4). Der Rasterschritt folgt dem Zoom; die Linien an den Markierungen des Lineals sind heller.",
        "„Loop“ wiederholt den Bereich auf dem Lineal: Verschiebe ihn als Ganzes oder zieh an seinen Rändern. Derselbe Bereich ist die Auswahl für den KI-Arrangeur. Ein Klick auf das Lineal springt an die Stelle."
      ]
    },
    "help": {
      "title": "Hilfe zum Editor"
    },
    "hotkeys": {
      "keys": [
        {
          "keys": "Space",
          "action": "Abspielen und pausieren"
        },
        {
          "keys": "S",
          "action": "Einen Clip an der Abspielposition schneiden"
        },
        {
          "keys": "V / C / E",
          "action": "Werkzeug: Auswählen, Messer, Radierer"
        },
        {
          "keys": "Del",
          "action": "Den gewählten Clip löschen"
        },
        {
          "keys": "Ctrl+D",
          "action": "Den gewählten Clip duplizieren"
        },
        {
          "keys": "Ctrl+Z",
          "action": "Rückgängig, bis zu 30 Schritte"
        },
        {
          "keys": "Ctrl+Y / Ctrl+Shift+Z",
          "action": "Wiederholen"
        },
        {
          "keys": "Ctrl+S",
          "action": "Das Projekt speichern"
        },
        {
          "keys": "Esc",
          "action": "Auswahl aufheben und zurück zum Werkzeug „Auswählen“"
        },
        {
          "keys": "← →",
          "action": "Abspielposition um einen Rasterschritt, mit Shift um vier"
        },
        {
          "keys": "Home / End",
          "action": "Zum Anfang oder zum Ende"
        },
        {
          "keys": "+ / −",
          "action": "Zoom"
        },
        {
          "keys": "Tab",
          "action": "Nächster Clip, nächste Spur oder nächster Griff"
        }
      ],
      "mouse": [
        {
          "keys": "Ctrl+Mausrad",
          "action": "Zoom"
        },
        {
          "keys": "Alt+Mausrad",
          "action": "Spurhöhe"
        },
        {
          "keys": "Klick mit dem Messer",
          "action": "Den Clip an dieser Stelle schneiden"
        },
        {
          "keys": "Ziehen mit dem Radierer",
          "action": "Dieses Stück des Clips entfernen; ein Klick entfernt den ganzen Clip"
        },
        {
          "keys": "Shift+Ziehen",
          "action": "Die Timeline scrollen; die mittlere Maustaste geht auch"
        },
        {
          "keys": "Klick auf das Lineal",
          "action": "An die Stelle springen"
        },
        {
          "keys": "Datei auf eine Spur",
          "action": "Einen Clip von deinem Computer an dieser Stelle hinzufügen"
        }
      ]
    },
    "restoreFromTrash": "Aus dem Papierkorb wiederherstellen",
    "trashedSources": "Ein Clip spielt einen Titel aus dem Papierkorb: {names}. Der Papierkorb löscht ihn nach 30 Tagen endgültig. | {n} Clips spielen Titel aus dem Papierkorb: {names}. Der Papierkorb löscht sie nach 30 Tagen endgültig."
  },
  "footer": {
    "muscriptorNote": "Macht aus einem Titel oder einem Stem ein MIDI. Die Gewichte sind nur für nicht-kommerzielle Nutzung; siehe die Modellkarte.",
    "qwenNote": "Der Prompt-Assistent: schreibt aus einer Idee den Prompt, Titel und Covertexte.",
    "sa3Note": "Instrumentals und Soundeffekte. Kostenlos für private und kommerzielle Nutzung unter 1 Mio. USD Jahresumsatz; darüber ist eine Enterprise-Lizenz nötig.",
    "sdcppNote": "Führt das Cover-Modell aus.",
    "sheetsageNote": "Schreibt die Melodie eines Titels als Partitur auf (Noten, „Aus einem Song…“). Die Gewichte sind nur für nicht-kommerzielle Nutzung; siehe die Modellkarte.",
    "zimageNote": "Zeichnet die Covers. Sein Text-Encoder Qwen3-4B-Instruct ist ebenfalls Apache-2.0."
  },
  "header": {
    "guide": {
      "map": {
        "ace": "Schnelle Songs und Instrumentals aus einer Beschreibung, Tags und Lyrics; mit einem Referenztitel auch ein Cover, ein neu gemalter Abschnitt, ein ergänzter oder extrahierter Part, eine Fortsetzung.",
        "sa3": "Instrumentals und Soundeffekte aus einer Beschreibung, schnell. Im KI-Arrangeur des Editors malt es neu, setzt fort und macht Covers, indem es auf das Audio rund um den Bereich hört.",
        "yue": "Schreibt einen ganzen Song mit Gesang und kann ihn um eine vorgegebene Melodie aufbauen (der Tab „Melodie“ und der Arbeitsbereich „Noten“, mit SheetSage2). Es macht auch aus einem Titel ein MIDI."
      },
      "steps": [
        {
          "title": "Eine Engine wählen",
          "text": "Geh zu „Erstellen“: Die Engines stehen links, YuE2, ACE-Step und Stable Audio. Für einen ersten Song mit Gesang nimm YuE2. Es startet beim ersten Klick auf „Erstellen“; der erste Start dauert ein paar Minuten."
        },
        {
          "title": "Den Song beschreiben",
          "text": "Gib im Tab „Song“ die Lyrics und den Stil ein, oder schreib die Idee in einem Satz in die Zeile über dem Formular, und der Assistent füllt die Felder aus. Wähle die Länge und die Zahl der Varianten."
        },
        {
          "title": "Die beste Variante wählen",
          "text": "Die Varianten reihen sich in der Sitzungsliste neben dem Formular auf (auf dem Handy darunter). Alles Erstellte wird von selbst in der Bibliothek gespeichert."
        },
        {
          "title": "In Stems zerlegen",
          "text": "Gesang, Schlagzeug, Bass und Rest mit einem Klick: „In Stems zerlegen“ im Menü einer Variante, der Tab „Stems und Noten“ in der Bibliothek oder direkt im Editor."
        },
        {
          "title": "Im Editor aufbauen",
          "text": "Leg die Stems auf Spuren, ergänze Parts mit dem KI-Arrangeur, stelle die Effekte ein."
        },
        {
          "title": "Exportieren",
          "text": "Mische zu WAV oder MP3 ab, oder exportiere die Spuren mit einem Reaper-Projekt oder DAWproject."
        }
      ],
      "tips": [
        "Du weißt nicht, wie du einen Stil beschreiben sollst? Starte auf der Startseite: Beschreibe die Musik in einem Satz, der Assistent schreibt den Prompt, und du bearbeitest ihn.",
        "Fast, aber nicht ganz? Einen Abschnitt neu zu malen geht oft schneller als eine neue Erzeugung.",
        "Der Referenztitel für ein Cover oder einen neuen Part kann direkt aus der Bibliothek kommen.",
        "Jeder Bereich hat eine eigene Hilfe-Schaltfläche; der Editor hat außerdem eine separate Übersicht der Tastenkürzel.",
        "Der Editor speichert nicht automatisch: Klick auf „Speichern“, bevor du die Seite verlässt; vergisst du es, fragt der Editor nach."
      ]
    },
    "helpSections": {
      "covers": {
        "text": "Ein Cover wird auf diesem Computer vom Modell Z-Image Turbo gezeichnet. Setz unter dem Formular das Häkchen bei „Cover erstellen“, und ein Cover für alle Varianten kommt nach dem Song; oder erstelle es später mit der Schaltfläche auf der Karte eines Titels in der Bibliothek, auch für mehrere gewählte Titel auf einmal. „Cover gestalten“ ändert die Beschreibung des Bildes und fügt eine Beschriftung mit dem Titel hinzu. Das Cover-Modell wird separat installiert: siehe „Modelle und Einstellungen“.",
        "title": "Covers"
      },
      "downloads": {
        "text": "Ein Titel lässt sich als MP3 (320 kbit/s, mit Cover und Tags, läuft überall), FLAC (verlustfrei, mit Cover und Tags) oder WAV (die Quelle für eine DAW, ohne Cover) herunterladen. Wähle das Format im Menü „Herunterladen“ einer Variante oder eines Titels, es wird gemerkt; man kann es auch unter „Modelle und Einstellungen“, „Allgemein“ festlegen. Der Name des Künstlers kommt in die Tags.",
        "title": "Download-Formate"
      },
      "engines": {
        "text": "Drei Engines erzeugen Audio, YuE2-3B, ACE-Step 1.5 und Stable Audio 3, und sie passen nicht zusammen auf eine GPU, daher läuft immer nur eine. Wähle eine Engine auf der Seite „Erstellen“: Sie startet, wenn du auf „Erstellen“ klickst, und die laufende stoppt von selbst. Das Lämpchen zeigt ihren Zustand; der erste Start kann ein paar Minuten dauern, während das Modell in den Videospeicher geladen wird. Die Status-Schaltfläche in der Kopfzeile zeigt, was die GPU belegt, und kann es entladen."
      },
      "library": {
        "text": "Jeder Titel, ob erzeugt, hochgeladen oder aus dem Editor exportiert, landet in einer gemeinsamen Bibliothek, die jedes Modul nutzen kann, sodass ein Titel von jeder Engine in Stems zerlegt, transkribiert und gemischt werden kann, ohne die App zu verlassen."
      },
      "notes": {
        "more": "Mehr zu den Noten",
        "text": "„Noten“ ist der Arbeitsbereich von YuE2: die Schaltfläche „Noten“ unter YuE2 in der Leiste von „Erstellen“. Er zeigt und bearbeitet die Melodie des Songs als Partitur; die Partitur kann aus einem fertigen Titel (Aus einem Song…, SheetSage2) oder einer MIDI-Datei stammen und geht in das YuE2-Formular im Tab „Melodie“.",
        "title": "Noten"
      },
      "trash": {
        "text": "Gelöschte Titel kommen in den Papierkorb der Bibliothek und bleiben dort 30 Tage: Stelle sie dort wieder her oder lösche sie endgültig. Wähle mehrere Titel, um sie auf einmal in den Papierkorb zu verschieben, mit Tags zu versehen, Covers zu erstellen oder zu benennen. Die Bibliothek filtert nach Tags.",
        "title": "Papierkorb und Tags"
      }
    }
  },
  "home": {
    "allTracks": "Bibliothek öffnen"
  },
  "idea": {
    "languageAutoIdea": "Auto (aus der Idee)",
    "writer": "Wer schreibt Lyrics und Stil:",
    "writerAce": "ACE-Step selbst"
  },
  "libraryPage": {
    "filters": {
      "midi": "MIDI",
      "score": "Noten"
    },
    "filtersToggle": "Filter",
    "openEditor": "Im Editor öffnen",
    "openEditorFailed": "Konnte nicht im Editor geöffnet werden: {error}",
    "openEditorHint": "Ein neues Editor-Projekt mit diesem Titel auf einer Spur",
    "promptTitle": "Der Titel hat keinen eigenen Namen: Es wird eine Zeile seiner Lyrics angezeigt.",
    "score": {
      "download": ".abc herunterladen",
      "failed": "Die Noten konnten nicht geladen werden: {error}",
      "hint": "Die ABC-Partitur, nach der YuE2 diesen Titel gesungen hat",
      "open": "In den Noten öffnen",
      "openHint": "Eine Kopie der Partitur in den Noten auf der Seite „Erstellen“; die Noten des Formulars bleiben unverändert",
      "title": "Noten"
    },
    "trash": {
      "loading": "Wird geladen…"
    },
    "usage": {
      "bulk": "{n} Titel werden in Editor-Projekten verwendet: {names}. Im Papierkorb werden sie noch abgespielt, aber wenn du den Papierkorb leerst, verschwinden ihre Clips in den Projekten. Löschen?",
      "more": " (und {n} weitere)",
      "purge": "Endgültig löschen? Wird in Editor-Projekten verwendet: {names}. Ihre Clips in den Projekten verschwinden.",
      "single": "Der Titel wird im Editor-Projekt „{name}“{more} verwendet. Im Papierkorb wird er noch abgespielt, aber wenn du den Papierkorb leerst, verschwindet der Clip im Projekt. Löschen?"
    },
    "yueLicence": "YuE2: nicht-kommerzielle Lizenz (CC BY-NC 4.0)",
    "yueLicenceHint": "YuE2-Songs dürfen nicht verkauft oder kommerziell genutzt werden. Details: Modelle und Lizenzen."
  },
  "midiPanel": {
    "recognize": "Noten zu MIDI"
  },
  "models": {
    "general": {
      "artist": "Name des Künstlers",
      "artistHint": "Wird in die Tags heruntergeladener Titel geschrieben. Derselbe Name wie in der Fußzeile.",
      "artistSave": "Speichern",
      "artistSaved": "Gespeichert",
      "autoCover": "Nach dem Song ein Cover erstellen",
      "autoCoverHint": "Der Startwert des Kästchens „Cover erstellen“ unter den Formularen der Engines.",
      "autoCoverOff": "Covers sind aus, oder ihr Modell ist nicht installiert: siehe „Covers“.",
      "formatHint": "Das Format der Download-Schaltflächen in der Sitzung und in der Bibliothek. Ein in einem Download-Menü gewähltes Format wird auch hier gemerkt.",
      "languageHint": "Dieselbe Wahl wie die Sprachschaltfläche in der Kopfzeile.",
      "nav": "Allgemein",
      "title": "Allgemeine Einstellungen"
    },
    "showMore": "{n} weitere, nicht heruntergeladen: {names} ▾"
  },
  "notesHelp": {
    "actions": {
      "checks": "Prüfung zeigen",
      "draw": "„Von Grund auf zeichnen“ öffnen",
      "musicianOff": "Römische Stufenzahlen ausblenden",
      "musicianOn": "Römische Stufenzahlen anzeigen",
      "simple": "Einfache Ansicht öffnen",
      "snapIsOn": "„In der Tonart“ ist an",
      "snapOn": "„In der Tonart“ einschalten"
    },
    "fig": {
      "at": "Tempo 95, 4/4",
      "barTime": "1 Takt ≈ 2,5 s",
      "beats": "4 Schläge: eins-zwei-drei-vier",
      "brk": "Break",
      "chordsTitle": "Akkorde über den Takten",
      "counter": "5 Silb. · 6 Noten",
      "fourBars": "4 Takte ≈ 10 s",
      "higher": "höher",
      "inKey": "Töne der Tonart",
      "ins": "Instrument",
      "intro": "Intro",
      "longer": "lange Note",
      "lower": "tiefer",
      "lyricsTags": "Tags im Text",
      "melisma": "gehalten",
      "octaveNote": "eine Männerstimme singt eine Oktave unter den notierten Noten",
      "offKey": "außerhalb der Tonart",
      "partsRibbon": "Teile in den Noten",
      "pause": "Pause",
      "picker": "Passend",
      "shorter": "kurz",
      "sing": "die Stimme singt",
      "snapped": "rastet hier ein",
      "sung": "gesungen",
      "syllables": [
        "Wir",
        "sin",
        "gen",
        "ger",
        "ne"
      ],
      "time": "Zeit →",
      "vocal": "Gesang",
      "written": "notiert"
    },
    "firstTime": "Neu bei den Noten?",
    "open": "Hilfe zu den Noten",
    "openTip": "Einfach erklärt: wie du eine Melodie zeichnest und wie YuE2 sie singt",
    "sections": {
      "checks": {
        "head": {
          "check": "Was dort steht",
          "fix": "Was zu tun ist",
          "means": "Was es bedeutet"
        },
        "intro": "Die Prüfung ist die Zeile unten in den Noten: Ein Klick öffnet die Liste. Gelb heißt „einen Blick wert“, grün alles in Ordnung, grau nur ein Hinweis. Wo die Lösung auf der Hand liegt, gibt es die Schaltfläche „Beheben“; „Zeigen“ wählt die betroffenen Noten oder Takte aus. Ctrl+Z macht jede Korrektur rückgängig.",
        "rows": [
          {
            "check": "Keine Tonart oder kein Tempo",
            "means": "YuE2 weiß nicht, in welcher Tonart und wie schnell es singen soll.",
            "fix": "Wähle sie oben auf den Chips."
          },
          {
            "check": "Takte ohne Akkord",
            "means": "YuE2 ist an einen Akkord in jedem Takt gewöhnt.",
            "fix": "Klick ruhig auf „Beheben“: Der vorherige Akkord wird in die leeren Takte übernommen."
          },
          {
            "check": "Der Gesang hat keine Noten",
            "means": "Es gibt keine Melodie — YuE2 erfindet eine.",
            "fix": "Zeichne die Melodie mit dem Stift oder nimm einen der Schnellstarts."
          },
          {
            "check": "Weniger Noten als Silben im Text",
            "means": "Viel weniger Noten als Silben: YuE2 erfindet den Rest dazu und kann von deinen Noten abweichen.",
            "fix": "Ergänze Noten (in der einfachen Ansicht mit der Schaltfläche „ergänzen“) oder nimm „Aus einem Song…“."
          },
          {
            "check": "Noten über oder unter der Stimme",
            "means": "Schwer zu singen; YuE2 kann sich verausgaben oder die Oktave wechseln.",
            "fix": "Prüfe zuerst, ob die richtige Stimme gewählt ist, männlich oder weiblich. Klick dann auf „Beheben“: Die Melodie wird oktavweise in den Umfang verschoben."
          },
          {
            "check": "Die Teile passen nicht zum Text",
            "means": "Mehr oder weniger Teile in den Noten als Tags im Text: Zeilen landen an den falschen Stellen.",
            "fix": "„Beheben“ fügt die fehlenden Teile am Ende hinzu — prüfe dann die Reihenfolge. Überzählige Teile entfernst du selbst, oder du passt die Tags im Text an."
          },
          {
            "check": "Das Instrument spielt mit der Stimme",
            "means": "Ein Hinweis, kein Fehler: Meist pausiert das Instrument, solange die Stimme singt.",
            "fix": "Nichts, wenn es so gewollt ist. Sonst lösche die Noten des Instruments in diesen Takten."
          },
          {
            "check": "Der ABC-Text ist lang",
            "means": "Eine sehr lange Partitur nimmt viel vom Prompt für YuE2 ein.",
            "fix": "Kürze den Song oder entferne überzählige Instrumentennoten."
          }
        ],
        "tip": "Grüne Punkte brauchen nichts. Wenn keine Anmerkungen mehr übrig sind, kannst du auf „Erstellen“ klicken.",
        "title": "Prüfung für YuE2",
        "toc": "Prüfung für YuE2"
      },
      "chords": {
        "note": "YuE2 nutzt die Akkorde nur mit dem Plan „Melodie und Akkorde“. Bei „Einer Melodie folgen“ wählt das Modell die Begleitung selbst, und deine Akkorde bleiben ein Hinweis für dich.",
        "p": [
          "Ein <b>Akkord</b> sind mehrere gleichzeitig gespielte Töne. Die Begleitung baut darauf auf: Gitarre, Keys, Bass. Die Akkorde stehen in einer Reihe über den Noten, meist einer pro Takt.",
          "Klick auf den Akkord eines Takts (oder auf eine leere Stelle in der Reihe), um einen anderen zu wählen. Die <b>passenden</b> stehen zuerst: Akkorde deiner Tonart, die YuE2 am besten hält. Darunter folgen „Häufig in Moll“ oder „Häufig in Dur“ und „Mehr“ zum Experimentieren. „Anhören“ spielt den Akkord ab, „Zwei pro Takt“ teilt den Takt in zwei Akkorde.",
          "Du weißt nicht, was du nehmen sollst? Behalte, was „Von Grund auf zeichnen“ einsetzt: eine bewährte Folge aus vier Akkorden.",
          "<b>Für Musiker</b> — der Schalter unter dem Raster zeigt römische Stufenzahlen an den Akkorden (I, IV, V, vi…): die Stufe des Akkords in der Tonart. Das ist für alle, die die Theorie kennen; alle anderen brauchen es nicht."
        ],
        "title": "Akkorde",
        "toc": "Akkorde"
      },
      "faq": {
        "items": [
          {
            "q": "Muss ich Noten lesen können?",
            "a": "Nein. Es reicht, „höher — tiefer“ und „länger — kürzer“ zu hören. Schalte „In der Tonart“ ein, und es gibt keine falschen Töne."
          },
          {
            "q": "Warum singt die Männerstimme tiefer als gezeichnet?",
            "a": "YuE2 schreibt Männermelodien eine Oktave höher, als sie gesungen werden. Das ist normal; du musst die Noten nicht absenken."
          },
          {
            "q": "Werden die Noten irgendwo gespeichert?",
            "a": "Ja, es sind die Noten des Formulars: Jede Änderung geht direkt ins Formular, und Ctrl+Z macht sie rückgängig. Es gibt kein separates Speichern — klick auf „Erstellen“, und YuE2 nimmt sie."
          },
          {
            "q": "Wie lang wird der Song?",
            "a": "So lang wie seine Takte. Bei Tempo 95 im 4/4-Takt dauert ein Takt etwa 2,5 Sekunden: 16 Takte sind etwa 40 Sekunden, 64 Takte etwa 2,7 Minuten."
          },
          {
            "q": "Warum hat YuE2 nicht genau meine Noten gesungen?",
            "a": "Das Modell folgt den Noten eng, ist aber kein Synthesizer: Es kann die Melodie verzieren, eine Silbe verschieben, eine Oktave tiefer singen. Weicht es stark ab, siehe das Rezept „Der Song folgt den Noten nicht“."
          },
          {
            "q": "Muss ich Schlagzeug und Bass zeichnen?",
            "a": "Nein. Nur die Stimme und, wenn du magst, eine Instrumentallinie im Intro und in den Breaks. Den Rest spielt YuE2 aus dem Stil."
          },
          {
            "q": "Was ist der ABC-Text unten?",
            "a": "Dieselben Noten in Buchstaben geschrieben — das bekommt YuE2. Der Editor schreibt ihn selbst; bearbeite ihn nur von Hand, wenn du das Format kennst."
          },
          {
            "q": "Wie höre ich etwas an, ohne einen Song zu erstellen?",
            "a": "„Anhören“ (Space) spielt die Noten auf einem Klavier ab. Das Metronom klickt die Schläge, „Wiederholen“ spielt die markierten Takte in Schleife."
          },
          {
            "q": "Kann ich die Noten einer fertigen Variante übernehmen?",
            "a": "Ja: „Noten öffnen“ bei einer Variante öffnet sie als Kopie. Bearbeite sie, höre sie an und klick auf „Ins Formular“, um daraus eine neue Variante zu machen."
          }
        ],
        "title": "Häufige Fragen",
        "toc": "Häufige Fragen"
      },
      "key": {
        "p": [
          "Eine <b>Tonart</b> ist eine Gruppe von sieben Tönen, die gut zusammenpassen. Eine Melodie aus ihnen klingt richtig, während ein Ton außerhalb der Gruppe wie ein falscher Ton schrammt.",
          "<b>Moll</b> klingt trauriger und dramatischer, <b>Dur</b> heller und fröhlicher. Der Buchstabe (C, D, A…) ist der Ton, bei dem die Gruppe beginnt. Fürs Ohr spielt er kaum eine Rolle; wichtig ist, ob es sich bequem singen lässt.",
          "Raster-Zeilen, die zur Tonart gehören, sind hervorgehoben. Schalte <b>„In der Tonart“</b> ein, und der Stift lässt keinen falschen Ton zu: Er rastet auf der nächsten passenden Zeile ein. So singst du am einfachsten nie daneben. Brauchst du einen Ton von außerhalb? Halte Shift gedrückt.",
          "Die Tonart änderst du auf dem Chip „Tonart“ oben. Ist „Auch Noten und Akkorde verschieben“ an, verschiebt sich der ganze Song und klingt höher oder tiefer."
        ],
        "tempo": [
          "Das <b>Tempo</b> sind Schläge pro Minute (BPM). 70–90 ist ruhig, 95–120 mittel, ab 130 schnell. YuE2 übernimmt das Tempo aus den Noten; eine Tempoangabe im Stiltext hat keine Wirkung.",
          "Die <b>Taktart</b> sagt, wie viele Schläge ein Takt hat. 4/4 ist fast jeder Pop- und Rocksong, 3/4 ein Walzer, 6/8 ein wiegendes Gefühl, Balladen. Unsicher? Bleib bei 4/4.",
          "Die <b>Länge</b> ist die Zahl der Takte des Songs. Das Audio folgt den Noten: 8 Takte 4/4 bei Tempo 95 sind etwa 20 Sekunden."
        ],
        "tempoTitle": "Tempo und Taktart",
        "title": "Tonart, Tempo und Taktart",
        "toc": "Tonart und Tempo"
      },
      "lanes": {
        "p": [
          "Die Noten haben zwei Stimmen (Spuren). <b>Gesang</b> (violett-rosa Noten) ist das, was die Sängerin oder der Sänger singt. <b>Instrument</b> (türkis) ist eine melodische Linie eines Instruments: das Intro, die Breaks, der Schluss.",
          "Der Stift schreibt in die aktive Spur — klick auf die andere, um zu wechseln. „Stumm“ und „Nur diese Spur“ ändern nur, was du hier hörst; auf den Song haben sie keinen Einfluss.",
          "<b>Warum das Instrument meist pausiert, solange die Stimme singt.</b> So sind auch die eigenen Partituren von YuE2 aufgebaut: Das Instrument füllt die Stellen ohne Stimme. Spielt es über dem Gesang, kann YuE2 durcheinanderkommen, was es singen soll. Die Prüfung weist auf solche Takte hin — es ist ein Hinweis, kein Fehler.",
          "Schlagzeug, Bass und die Begleitung müssen nicht gezeichnet werden: YuE2 spielt sie selbst aus dem Stil und den Akkorden."
        ],
        "title": "Gesang und Instrument",
        "toc": "Gesang und Instrument",
        "voice": [
          "Der Schalter Männlich / Weiblich auf der Gesangsspur legt einen bequemen Umfang für die Stimme fest. Noten außerhalb davon bekommen einen roten Rand, und die Prüfung bietet an, sie zurückzuholen. Sagt der Stil „female“ oder „female vocals“, stellt sich der Schalter von selbst um.",
          "<b>Die Männerstimme von YuE2 singt eine Oktave unter den notierten Noten.</b> Das ist normal: YuE2 schreibt Melodien auch in seinen eigenen Partituren so. Eine Männermelodie sieht im Editor deshalb hoch aus — senke sie nicht absichtlich ab, sonst rutscht der Sänger in den Bass.",
          "Beim MIDI-Import nimmt „Oktave an die Stimme anpassen“ diese Verschiebung für dich vor."
        ],
        "voiceTitle": "Männer- oder Frauenstimme"
      },
      "parts": {
        "p": [
          "Ein Song besteht aus Teilen: Intro, Strophe, Pre-Chorus, Refrain, Bridge, Zwischenspiel, Outro. Im Editor sind sie das farbige Band über den Takten.",
          "Die Teile sind an die Tags im Text gebunden: [Verse] ist eine Strophe, [Chorus] ein Refrain, [Bridge] eine Bridge und so weiter. So weiß YuE2, welche Zeilen es wo in den Noten singen soll. Anzahl und Reihenfolge der Teile sollten also zu den Tags im Text passen — die Prüfung achtet darauf.",
          "Ein Klick auf einen Teil öffnet sein Menü: Typ, Name, „Abschnitt wiederholen“ (ein zweiter Refrain in einer Sekunde), „Abschnitt danach hinzufügen“, „Ganzen Abschnitt zeigen“, „Mit den Takten löschen“. Den Rand eines Teils kannst du ziehen.",
          "<b>„Teile nach dem Text markieren“.</b> Nach einem MIDI-Import gibt es meist keine Teile. Hat der Text Tags, bietet der Editor an, die Noten mit einem Klick danach zu markieren: Die Takte werden der Reihe nach nach den Tags des Textes aufgeteilt."
        ],
        "tip": "Üblich für YuE2: Intro und Bridge 4–8 Takte, Strophe und Refrain 8–16.",
        "title": "Teile des Songs",
        "toc": "Teile des Songs"
      },
      "recipes": {
        "intro": "Häufige Wünsche und was du dafür tun kannst, Schritt für Schritt.",
        "items": [
          {
            "title": "Ich möchte den Refrain höher",
            "steps": [
              "Zeige den Refrain: Klick auf den Teil „Refrain“ → „Ganzen Abschnitt zeigen“.",
              "Zieh mit „Auswählen“ einen Rahmen um die Refrainnoten in der Gesangsspur.",
              "Drück ↑: Jeder Druck ist ein Halbton nach oben. 3–5 Halbtöne sind deutlich zu hören; Shift + ↑ springt eine Oktave.",
              "Oder in der einfachen Ansicht: die Schaltflächen „Zeile eine Tonstufe höher“ bei jeder Refrainzeile.",
              "Wirf einen Blick auf die Prüfung: Die Noten sollten den Stimmumfang nicht verlassen."
            ]
          },
          {
            "title": "Der Song folgt den Noten nicht",
            "steps": [
              "Prüfe den Plan im Tab „Melodie“: Er sollte „Einer Melodie folgen“ oder „Melodie und Akkorde“ sein, nicht „Kein Plan“.",
              "Öffne die Prüfung. Häufige Ursachen sind „Weniger Noten als Silben“ und „Die Teile passen nicht zum Text“.",
              "Eine Note pro Silbe: In der einfachen Ansicht sollte der Zähler jeder Zeile stimmen.",
              "Eine Männerstimme singt eine Oktave unter den notierten Noten — vergleiche die Form der Melodie, nicht ihre Höhe.",
              "Mach 2–3 Varianten: Das Modell improvisiert noch ein wenig, und eine Variante liegt meist näher dran."
            ]
          },
          {
            "title": "Die Melodie ist langweilig",
            "steps": [
              "Heb den Refrain 3–5 Halbtöne über die Strophe — dadurch hebt er „ab“.",
              "Mische lange und kurze Noten: ein paar kurze, dann am Zeilenende eine lange Note.",
              "Füge einen Sprung ein: eine Note deutlich höher als ihre Nachbarn, auf dem wichtigsten Wort.",
              "Wiederhole eine gute Phrase mit Ctrl+C und Ctrl+V. Wiederholung macht eine Melodie eingängig.",
              "Beende eine Zeile auf einem Ton der Tonart (einer hervorgehobenen Zeile) — dann klingt die Phrase abgeschlossen."
            ]
          },
          {
            "title": "Die Worte passen nicht",
            "steps": [
              "Öffne „Einfach“: Eine überfüllte Zeile zeigt „Noten fehlen“.",
              "Klick auf „ergänzen“ — die längsten Noten werden geteilt.",
              "Oder teile lange Noten selbst mit dem Werkzeug „Teilen“ (C).",
              "Ist die Zeile noch immer überfüllt, gib ihr mehr Platz: zieh den Rand des Teils oder nimm „Abschnitt danach hinzufügen“. Oder kürze die Textzeile."
            ]
          },
          {
            "title": "Ich möchte die Melodie eines anderen Songs",
            "steps": [
              "Du hast eine Audiodatei — „Aus einem Song…“: SheetSage2 schreibt die Melodie und die Akkorde auf.",
              "Du hast ein MIDI — „MIDI importieren“: Wähle die Gesangsspur als Gesang, schalte „Oktave an die Stimme anpassen“ ein und gib das echte Tempo des Songs ein.",
              "Es ist schon eine YuE2-Variante — „Noten öffnen“ bei der Variante, dann „Ins Formular“.",
              "Nach dem Import: „Teile nach dem Text markieren“, dann die Prüfung.",
              "Deine Worte fallen wahrscheinlich anders als im Original — passe sie in der einfachen Ansicht an."
            ]
          }
        ],
        "title": "Rezepte",
        "toc": "Rezepte"
      },
      "roll": {
        "head": {
          "key": "Taste",
          "what": "Was sie tut"
        },
        "keys": [
          {
            "key": "Space",
            "what": "Abspielen oder pausieren"
          },
          {
            "key": "Home",
            "what": "Zurück zum Anfang"
          },
          {
            "key": "B · V · E · C",
            "what": "Stift · Auswählen · Radierer · Teilen"
          },
          {
            "key": "1 2 3 4 5",
            "what": "Länge einer neuen Note: 1/16, 1/8, 1/4, 1/2, ganze"
          },
          {
            "key": "6",
            "what": "Eine Pause statt einer Note"
          },
          {
            "key": "K",
            "what": "„In der Tonart“ ein- oder ausschalten"
          },
          {
            "key": "L",
            "what": "Die markierten Takte wiederholen"
          },
          {
            "key": "F",
            "what": "Vollbild"
          },
          {
            "key": "↑ ↓",
            "what": "Gewählte Noten einen Halbton höher oder tiefer"
          },
          {
            "key": "Shift + ↑ ↓",
            "what": "Gewählte Noten eine Oktave höher oder tiefer"
          },
          {
            "key": "← →",
            "what": "Auswahl (oder Cursor) um einen Rasterschritt verschieben"
          },
          {
            "key": "Shift + ← →",
            "what": "Um einen ganzen Takt verschieben"
          },
          {
            "key": "Entf",
            "what": "Auswahl löschen"
          },
          {
            "key": "Ctrl + Z · Ctrl + Shift + Z",
            "what": "Rückgängig · Wiederholen"
          },
          {
            "key": "Ctrl + C · Ctrl + V",
            "what": "Kopieren · am Cursor einfügen"
          },
          {
            "key": "Ctrl + D",
            "what": "Auswahl duplizieren"
          },
          {
            "key": "Ctrl + A",
            "what": "Alle Noten der Spur auswählen"
          },
          {
            "key": "Esc",
            "what": "Auswahl aufheben"
          },
          {
            "key": "Shift beim Zeichnen",
            "what": "Eine Note außerhalb der Tonart setzen"
          },
          {
            "key": "Alt beim Zeichnen",
            "what": "Radieren"
          },
          {
            "key": "Ctrl + Mausrad",
            "what": "Vergrößern oder verkleinern"
          },
          {
            "key": "Shift + Mausrad",
            "what": "Seitlich scrollen"
          }
        ],
        "keysHint": "Sie funktionieren, solange der Fokus im Noteneditor liegt, nicht in einem Textfeld.",
        "keysTitle": "Tastenkürzel",
        "p": [
          "Die Piano Roll ist ein Streifen, der von links nach rechts läuft, wie die Zeit. Jeder Balken darauf ist eine Note.",
          "<b>Weiter oben auf dem Bildschirm heißt ein höherer Ton.</b> Die Klaviertasten links zeigen, welche Note es ist.",
          "<b>Ein längerer Balken heißt ein längerer Ton.</b> Leerer Raum zwischen den Noten ist eine Pause: Die Stimme schweigt.",
          "Ein <b>Takt</b> ist die Strecke zwischen den dicken senkrechten Linien; die Taktnummern stehen oben. Im 4/4-Takt hat ein Takt vier Schläge — vier Schritte, zu denen du klatschen könntest. Bei Tempo 95 dauert ein Takt etwa 2,5 Sekunden, 16 Takte sind also grob 40 Sekunden Song.",
          "Das <b>Raster</b> sind die dünnen Linien innerhalb eines Takts. Noten rasten daran ein, damit der Rhythmus gleichmäßig wird. Mit einem feineren Raster setzt du eine Note genauer.",
          "Der <b>Cursor</b> ist die senkrechte Linie, an der „Anhören“ beginnt. Klick auf das Taktlineal, um ihn zu setzen. Zieh am Lineal entlang, um Takte für die Wiederholung zu markieren."
        ],
        "title": "So liest du die Piano Roll",
        "toc": "Die Piano Roll lesen",
        "tools": [
          "<b>Stift (B)</b> — ein Klick setzt eine Note der gewählten Länge; Ziehen nach rechts verlängert sie.",
          "<b>Auswählen (V)</b> — klick auf eine Note oder zieh einen Rahmen um mehrere. Gewählte Noten lassen sich ziehen, mit den Pfeiltasten verschieben und an ihrem rechten Rand in der Länge ändern.",
          "<b>Radierer (E)</b> — klicke oder streiche über Noten, um sie zu entfernen. Mit gedrückter Alt-Taste wird jedes Werkzeug zum Radierer.",
          "<b>Teilen (C)</b> — teilt eine Note entlang des Rasters in zwei. Praktisch, wenn ein langer Ton zwei Silben tragen soll.",
          "<b>Länge</b> — die Länge einer neuen Note: 1/4 ist ein Schlag, 1/8 ein halber Schlag, 1/2 zwei Schläge. „Pause“ zeichnet Stille."
        ],
        "toolsTitle": "Werkzeuge",
        "views": [
          "<b>Piano Roll</b> — die Hauptansicht, in der du zeichnest und bearbeitest.",
          "<b>Notenblatt</b> — dieselben Noten wie im Notenbuch, für alle, die Noten lesen: zum Ansehen und Anhören.",
          "<b>Einfach</b> — die Melodie als Punkte über dem Text; siehe „Einfache Ansicht“."
        ],
        "viewsTitle": "Drei Ansichten"
      },
      "simple": {
        "p": [
          "„Einfach“ ist die Ansicht für alle, denen die Piano Roll schwerfällt. Jede Textzeile ist eine Karte: Punkte stehen über den Silben, und die Linie dazwischen zeigt, wohin die Melodie geht — nach oben oder unten.",
          "<b>Zieh einen Punkt nach oben oder unten</b> (oder wähle ihn und drück ↑ ↓), um die Note zu erhöhen oder zu senken. Mit „In der Tonart“ springt der Punkt nur über die Töne der Tonart, nie daneben. Ein Klick auf eine Silbe spielt ihre Note ab.",
          "Der <b>Zähler</b> „5 Silb. · 5 Noten“ zeigt, ob es genug Noten für die Worte gibt. Am besten ist eine Note pro Silbe.",
          "<b>„+1 als Melisma gesungen“</b> — mehr Noten als Silben: Die überzähligen werden gedehnt auf einer Silbe gesungen („jeah-ea-eah“). Das ist in Ordnung und oft schön.",
          "<b>„Noten fehlen — ergänzen“</b> — mehr Silben als Noten. Die Schaltfläche „ergänzen“ teilt die längsten Noten der Zeile, sodass jede Silbe ihre eigene bekommt.",
          "Der Rhythmus, also die Notenlängen, wird hier nicht geändert — dafür nimm die Piano Roll. Die Schaltflächen an einer Zeile spielen sie ab und verschieben die ganze Zeile nach oben oder unten."
        ],
        "title": "Einfache Ansicht: die Melodie über den Worten",
        "toc": "Einfache Ansicht"
      },
      "start": {
        "also": [
          "<b>Auf dem Klavier spielen</b> — auf dem Bildschirmklavier oder einem MIDI-Keyboard: Die Noten werden ab dem Cursor nacheinander geschrieben.",
          "<b>ABC einfügen</b> — wenn die Melodie schon als ABC vorliegt (Menü „Importieren“).",
          "<b>Noten einer Variante</b> — eine fertige YuE2-Variante hat „Noten öffnen“: Ihre Partitur öffnet sich als Kopie. Höre sie an und bearbeite sie; das Formular ändert sich nicht. „Ins Formular“ übernimmt diese Noten ins Formular, „Schließen“ kehrt zu den Noten des Formulars zurück."
        ],
        "alsoTitle": "Weitere Wege",
        "intro": "Noch keine Noten? Alle drei Wege stehen auf dem leeren Noten-Bildschirm.",
        "sparse": "YuE2 singt eine Note pro Silbe. Hat eine MIDI-Transkription weit weniger Noten, als der Text Silben hat (automatische Transkriptionen haben das oft), muss das Modell den Rest erfinden, und der Song folgt den Noten nicht mehr. Die Prüfung warnt davor. Ergänze die Melodie in der Piano Roll oder der einfachen Ansicht — oder nimm die Noten „Aus einem Song…“.",
        "sparseTitle": "Warum ein „dünnes“ MIDI schwache Ergebnisse liefert",
        "title": "Drei Schnellstarts",
        "toc": "Drei Schnellstarts",
        "ways": [
          {
            "title": "Von Grund auf zeichnen",
            "text": "Wähle Tonart, Tempo und Taktart, und der Editor baut aus dem Text ein Gerüst: Teile nach den Tags [Verse] und [Chorus], eine passende Zahl von Takten und Platzhalter-Akkorde. Dir bleibt nur noch, die Gesangsmelodie mit dem Stift zu zeichnen. Der beste Weg, wenn die Melodie in deinem Kopf ist."
          },
          {
            "title": "Aus einem Song…",
            "text": "Wähle eine Audiodatei, und SheetSage2 transkribiert ihre Melodie, Akkorde und Teile. Das dauert ein bis zwei Minuten. Am besten klappt es bei einem Titel mit klarem Gesang, ohne Chor oder Rauschen. Danach bearbeitest du nach Belieben."
          },
          {
            "title": "MIDI importieren",
            "text": "Zieh eine .mid-Datei aus einer DAW, einer Notensatz-App oder von einer Website hinein. Wähle im Auswahlfenster, welche Spur zum Gesang und welche zum Instrument wird; Schlagzeug und der Rest entfallen, und von Akkorden wird der oberste Ton genommen. „Oktave an die Stimme anpassen“ verschiebt die Melodie so, wie YuE2 sie schreibt. Das Tempofeld: Transkriptionen sind oft mit 120 BPM gespeichert, obwohl der Song schneller oder langsamer ist — gib das echte Tempo ein, und die Noten landen dort, wo sie klingen."
          }
        ]
      },
      "what": {
        "head": {
          "name": "Plan",
          "text": "Was YuE2 tut",
          "when": "Wann du ihn wählst"
        },
        "p": [
          "Noten sind die als Balken gezeichnete Melodie des Songs: welchen Ton man singt, wann man beginnt und wie lange man ihn hält. Du musst keine Noten lesen können — es reicht zu hören, welcher Ton höher und welcher tiefer ist.",
          "<b>Ohne Noten</b> erfindet YuE2 die Melodie selbst. Jede Variante ist anders, und man weiß vorher nicht, wie eine Zeile gesungen wird.",
          "<b>Mit Noten</b> singt YuE2 deine Melodie. In unseren Tests traf das Modell die gezeichneten Noten zu 98 %, behielt das Auf und Ab der Melodie und die Länge: So viele Takte, wie du zeichnest, so viel singt es.",
          "Im Formular werden die Noten als ABC-Text gespeichert — dieselben Noten in Buchstaben geschrieben. Der Editor schreibt ihn für dich; du musst ihn nicht anfassen."
        ],
        "plans": [
          {
            "name": "Kein Plan",
            "text": "Erfindet Melodie und Begleitung selbst und geht direkt zum Audio.",
            "when": "Wenn es keine Noten gibt und du nur Ideen hören willst. Sobald das Formular Noten hat, stellt die App den Plan von selbst auf „Einer Melodie folgen“."
          },
          {
            "name": "Einer Melodie folgen",
            "text": "Singt deine Melodie und erfindet die Begleitung selbst. Deine Akkorde werden nicht genutzt.",
            "when": "Fast immer, sobald du den Gesang gezeichnet hast. Die sicherste Wahl."
          },
          {
            "name": "Melodie und Akkorde",
            "text": "Nimmt sowohl deine Melodie als auch deine Akkorde.",
            "when": "Wenn du Akkorde gewählt hast und genau diese Harmonie willst."
          }
        ],
        "plansIntro": "Der Plan wird im Formular im Tab „Melodie“ gewählt. Er sagt YuE2, was es mit deinen Noten tun soll.",
        "plansTitle": "Die drei Melodiepläne",
        "title": "Was Noten sind und wozu YuE2 sie braucht",
        "toc": "Wozu Noten"
      }
    },
    "title": "Hilfe zu den Noten",
    "toc": "Inhalt",
    "tocPick": "Hilfeabschnitt"
  },
  "player": {
    "mute": "Stummschalten",
    "unmute": "Ton einschalten",
    "volume": "Lautstärke"
  },
  "sa3Gen": {
    "promptHint": "Englisch funktioniert am besten; der Assistent „Beschreiben“ übersetzt. Nenne Genre, Instrumente, Stimmung und Tempo; bei einem Sound seine Quelle, wie er entsteht und den Raum."
  },
  "score": {
    "checks": {
      "sparseVocal": "Weniger Noten als Silben im Text — YuE2 erfindet den Rest",
      "sparseVocalSub": "{notes} Noten, {syllables} Silben. Zeichne besser den Rest der Melodie oder nimm „Aus einem Song…“"
    },
    "lane": {
      "femaleAbbr": "Weibl.",
      "insShort": "Instr.",
      "maleAbbr": "Männl.",
      "voiceFemale": "Stimme: weiblich",
      "voiceMale": "Stimme: männlich"
    },
    "midi": {
      "fitOctave": "Oktave an die Stimme anpassen",
      "fitOctaveHint": "YuE2 schreibt eine Melodie etwa eine Oktave über der Stelle, an der sie gesungen wird, während eine MIDI-Transkription die gesungene Tonhöhe hat. Der ganze Gesangspart wird um ganze Oktaven verschoben.",
      "markSections": "Teile nach dem Text markieren",
      "movedDown": "Der Gesang wurde um {n} Oktave nach unten verschoben. | Der Gesang wurde um {n} Oktaven nach unten verschoben.",
      "movedUp": "Der Gesang wurde um {n} Oktave nach oben verschoben. | Der Gesang wurde um {n} Oktaven nach oben verschoben.",
      "noSections": "Das MIDI hat keine Songteile. Tags im Text: {tags}.",
      "octaveDown": "−{n} Oktave | −{n} Oktaven",
      "octaveNone": "Oktave wie in der Datei",
      "octaveUp": "+{n} Oktave | +{n} Oktaven",
      "tempoFile": "aus der Datei",
      "tempoHint": "Die Datei sagt {bpm} BPM. Transkriptionen werden oft mit 120 gespeichert, egal wie schnell der Song ist: Stelle das Tempo des Songs ein, und die Noten landen dort, wo sie klingen.",
      "tempoTrack": "aus dem Titel „{title}“"
    },
    "overview": {
      "pickHint": "Diese Takte in den Noten öffnen"
    },
    "toolbar": {
      "musician": "Für Musiker",
      "musicianTip": "Stufen der Akkorde anzeigen (I, IV, V…) — Musiktheorie für alle, die sie kennen"
    },
    "workspace": {
      "backTip": "Zurück zur Sitzung; die Noten bleiben im Formular",
      "copyBadge": "Kopie der Variante",
      "copyBadgeTip": "Eine Kopie der Noten der Variante: Das Formular ändert sich erst bei „Ins Formular“",
      "copyLead": "Höre hier an und bearbeite — das Formular ändert sich erst, wenn du auf „Ins Formular“ klickst. „Schließen“ geht zurück zu den Noten des Formulars.",
      "copyTitle": "Noten der Variante „{title}“",
      "form": "Formular",
      "formBadge": "Noten des Formulars",
      "formBadgeTip": "Das sind die Noten des Formulars: Änderungen gehen sofort ins Formular (Ctrl+Z macht sie rückgängig)",
      "label": "Noten",
      "replaceConfirm": "Das Formular hat schon andere Noten. Durch die Noten dieser Variante ersetzen? (Ctrl+Z holt sie zurück)",
      "title": "Noten",
      "toForm": "Ins Formular"
    }
  },
  "takeCompare": {
    "seed": "Seed {seed}"
  },
  "yueGen": {
    "abcScore": "Noten",
    "help": {
      "melody": {
        "sources": [
          "Aus einem Song… — wähle eine Audiodatei, und SheetSage2 schreibt ihre Melodie und Akkorde auf. Am besten funktioniert ein Song mit klarem Gesang.",
          "MIDI importieren — die höchste Stimme wird zur Melodie, die anderen Kanäle zu Begleitung und Akkorden, und die Tonart wird von selbst gefunden. Halte die Gesangsmelodie auf einer eigenen Spur.",
          "Klavier — wähle eine Länge und drücke Tasten (unten, links neben der Roll, oder auf einem MIDI-Keyboard): Die Noten folgen aufeinander.",
          "Aus einem Titel: „Noten zu MIDI“ im Menü einer Variante oder der Tab „Stems und Noten“ in der Bibliothek, dann „Zur YuE2-Partitur“. Der Gesang wird zur Melodie, Bass und der Rest zur Begleitung."
        ]
      }
    },
    "unloadSheetSage": "Grafikkarte nach dem Auslesen der Melodie freigeben"
  }
}
