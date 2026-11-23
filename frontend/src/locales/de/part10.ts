// Strings added after the first translation (machine-translated from en, 743 keys);
// merged into the other parts key by key (see ../mergeParts).
export default {
  "aceGen": {
    "addLora": "LoRA hinzufügen",
    "cfgIntervalOrder": "„Guidance ab“ muss kleiner sein als „bis“.",
    "lengthAskedNote": "Die Länge geht als Wunsch ans Modell. Klicke die gewählte noch einmal an, um es dem Modell zu überlassen.",
    "lengthByModelNote": "Bei einer Beschreibung wählt das Modell die Länge selbst. Wähle hier eine, um deine zu wünschen.",
    "loraName": "LoRA-Name",
    "loraPath": "Ordner des LoRA-Adapters",
    "manual": {
      "adg": "Adaptive Guidance (ADG)",
      "balancedOnly": "im Modus „Ausgewogen“",
      "baseOnly": "nur Base- und SFT-Modelle",
      "bpm": "Tempo",
      "cfgEnd": "Guidance bis (Anteil des Weges)",
      "cfgStart": "Guidance ab (Anteil des Weges)",
      "cotCaption": "Beschreibung erweitern",
      "cotCaptionHint": "An: Das Sprachmodell darf deinen Stiltext umschreiben, bevor die Musik entsteht.",
      "cotLanguage": "Sprache erkennen",
      "cotLanguagePicked": "aus: die gewählte Sprache bleibt",
      "coverNoise": "Mit der Quelle gemischtes Rauschen",
      "coverRepaintOnly": "für Cover oder Repaint",
      "infer": "Dekodiermethode",
      "latentCrossfade": "Übergang im Modell",
      "length": "Länge",
      "lmCfg": "Nähe zum Prompt",
      "lmNegative": "Was vermieden werden soll",
      "lmSub": "schreibt den Songplan und ergänzt, was fehlt",
      "lmTitle": "Sprachmodell",
      "loraScale": "LoRA-Stärke",
      "metaByModel": "das Modell wählt es aus der Beschreibung",
      "musicSub": "was vorab über den Song bekannt ist",
      "musicTitle": "Musik",
      "myLoras": "Meine LoRAs: {n}",
      "needRef": "mit einem Referenztitel",
      "noLm": "ACE-Step lädt es auf dieser GPU nicht",
      "noLmWithRef": "wird mit einem Referenztitel nicht verwendet",
      "ode": "ODE: wiederholt sich exakt",
      "off": "aus",
      "pickLora": "wähle zuerst eine LoRA",
      "refSub": "Cover und Repaint",
      "refTitle": "Referenztitel",
      "repaintMode": "Repaint-Modus",
      "repaintModes": {
        "aggressive": "Mutig",
        "balanced": "Ausgewogen",
        "conservative": "Vorsichtig"
      },
      "repaintOnly": "zum Neumalen eines Bereichs",
      "repaintStrength": "Repaint-Stärke",
      "resultSub": "wie das Ergebnis geliefert wird",
      "sde": "SDE: mit Zufall",
      "sdeBaseWarn": "Auf einem Base-Modell lieferte SDE in einem Test (32 Schritte) Rauschen statt Musik. Auf Turbo funktioniert es, mit dunklerem Klang.",
      "shift": "Zeitplan-Verschiebung",
      "thinking": "Erst ein Plan (Thinking)",
      "tiled": "In Kacheln dekodieren",
      "turboSteps": "Turbo nimmt 1 bis 8 Schritte: mehr werden auf 8 gekürzt",
      "wavCrossfade": "Übergang im Audio"
    },
    "modeDescribe": "Aus einer Beschreibung",
    "modeLabel": "Wovon ausgehen",
    "modeOwn": "Eigene Lyrics und Stil",
    "modelNote": "Turbo braucht 8 Schritte. Die anderen Modelle brauchen länger; einen Teil entfernen oder hinzufügen klappt nicht bei allen, und Aufgaben, die ein Modell nicht kann, sind im Tab „Aus einem Titel“ ausgegraut.",
    "noLmBaseNote": "Base und SFT stützen sich für sauberen Gesang auf dieses Modell: In diesem Modus kann die Stimme verrauscht und fern klingen. Für Gesang wechsle zu „Eigene Lyrics und Stil“ und schreibe den Text, oder wähle Turbo.",
    "noLmNote": "Auf dieser Grafikkarte (8 GB oder weniger) lädt ACE-Step sein Sprachmodell nicht, daher geht deine Beschreibung als einfacher Stil-Prompt ans Modell, ohne geschriebene Lyrics.",
    "noVocal": "Ohne Gesang",
    "noVocalHint": "Ein Instrumental: keine Lyrics nötig, der Stil unten bestimmt die Musik.",
    "queuedStatus": "In der Warteschlange, Varianten: {n}",
    "refFile": "Referenz-Audiodatei",
    "refOff": "Schalte es ein, um von einem fertigen Titel auszugehen: Cover, neu gemachter Bereich, entfernter oder hinzugefügter Teil.",
    "removeLoraConfirm": "Entfernen?",
    "removeLoraNamed": "LoRA {name} entfernen",
    "repaintOrder": "Das Ende des Bereichs muss nach dem Anfang liegen.",
    "simple": {
      "auto": "auto",
      "fast": "schnell {n}",
      "formatHint": "mp3 braucht weniger Platz; wav und flac erhalten den Klang verlustfrei.",
      "key": "Tongeschlecht",
      "keyHint": "Dur klingt heller, Moll dunkler und trauriger. Grundton und andere Tonleitern wählst du unter „Manuell“.",
      "keyWish": "Bei einer Beschreibung wählt das Modell die Tonart. Ein hier gewähltes Tongeschlecht geht als Wunsch an das Modell.",
      "lengthHint": "Wie lang der Titel läuft.",
      "lengthWish": "Bei einer Beschreibung wählt das Modell die Länge. Eine hier gewählte geht als Wunsch ans Modell, nicht als Garantie.",
      "major": "Dur",
      "medium": "mittel {n}",
      "minor": "Moll",
      "slow": "langsam {n}",
      "tempo": "Tempo",
      "tempoHint": "Schläge pro Minute. „Auto“ überlässt es dem Modell; eine genaue Zahl stellst du unter „Manuell“ ein.",
      "tempoWish": "Bei einer Beschreibung wählt das Modell das Tempo. Ein hier gewähltes geht als Wunsch ans Modell."
    },
    "tabChanged": "geändert",
    "tabs": {
      "ref": "Aus einem Titel",
      "song": "Song",
      "tuning": "Feinabstimmung"
    },
    "taskType": "Was mit dem Titel geschehen soll",
    "taskUnsupported": "Von diesem Modell nicht unterstützt",
    "help": {
      "style": {
        "tips": [
          "Optimal sind 5–9 Tags: Bei weniger füllt das Modell die Lücken selbst, und das Ergebnis wird weniger vorhersehbar; bei mehr geraten Tags in Konflikt miteinander.",
          "Setze Genre und Stimmung an den Anfang — sie prägen den Gesamtcharakter des Titels mehr als die übrigen Tags.",
          "Mische keine widersprüchlichen Tags in einer Kategorie (z. B. „aggressive“ und „dreamy“ zugleich) — das Modell ignoriert eines davon, oder das Ergebnis wird verwaschen.",
          "Schreibe Tags besser auf Englisch — die Trainingsdaten sind überwiegend englisch, daher ist die Genauigkeit höher, auch wenn die Lyrics auf Deutsch sind.",
          "Ein in der Feinabstimmung gesetztes Tempo (unter „Einfach“ oder als genaue Zahl unter „Manuell“) ist zuverlässiger als ein Text-Tag wie „120 bpm“ im Stil: Nutze es, wenn das Tempo wichtig ist."
        ]
      },
      "lyrics": {
        "tips": [
          "Passe sie an die Länge des Titels an: Etwa 2 Minuten genügen meist für 2 Strophen + 2 Refrains; ab 3 Minuten füge eine Bridge und einen zweiten Hook hinzu — ein für eine kurze Dauer zu langer Text wird vom Modell „gequetscht“.",
          "Kurze Zeilen (5–10 Silben) passen berechenbarer zur Melodie als lange — wird eine Zeile zu lang, teile sie in zwei.",
          "Ein sich wiederholender Refrain (wortgleicher Text in jedem [Chorus]) hilft dem Modell, die Melodie dafür im ganzen Titel beizubehalten.",
          "Hake für einen rein instrumentalen Titel „Ohne Gesang“ an, statt Lyrics zu schreiben, die nur aus [Interlude] bestehen: Das ist zuverlässiger.",
          "Interpunktion (Kommas, Auslassungspunkte) beeinflusst Phrasierung und Pausen im Gesang — nutze sie bewusst, nicht nur nach den Rechtschreibregeln."
        ]
      },
      "remix": {
        "unavailable": "Welche Szenarien verfügbar sind, hängt vom gewählten Modell ab — nicht unterstützte Optionen im Formular sind ausgegraut. Probiere ein anderes Modell (im Tab „Song“ oder in der Feinabstimmung), wenn du ein bestimmtes Szenario brauchst. Lade die Referenzdatei in einem Format hoch, aus dem das Modell Audio extrahieren kann (wav/mp3/flac) — sehr lange Dateien (mehrere Minuten) können die Verarbeitungszeit spürbar erhöhen."
      },
      "advanced": {
        "title": "Feinabstimmung",
        "rows": [
          {
            "param": "Einfach und Manuell",
            "what": "„Einfach“ hat ein paar schlichte Auswahlen: Dekodierschritte (nicht bei Turbo), Länge, Tempo (langsam 80, mittel 110, schnell 140), Tongeschlecht (Dur oder Moll) und Format. „Manuell“ hat jeden Parameter in Gruppen, und die Konsole zeigt alle auf einmal."
          },
          {
            "param": "Format",
            "what": "Das Format der Ausgabedatei. mp3 ist kompakter und fürs Hören ausreichend; wav und flac sind verlustfrei, aber 5–10 Mal größer."
          },
          {
            "param": "Tempo, Tonart, Taktart",
            "what": "Ausdrückliche musikalische Parameter. Auf Auto entnimmt sie das Modell dem Stiltext; setze sie nur von Hand, wenn es auf Genauigkeit ankommt (etwa zum Mischen mit anderen Titeln). Die Taktart ist 2/4, 3/4, 4/4 oder 6/8. Bei einer Beschreibung wählt das Modell sie selbst: Ein hier gesetztes Tempo oder eine Tonart geht als Wunsch an das Modell, die Taktart bleibt ihm überlassen."
          },
          {
            "param": "Gesangssprache",
            "what": "Die Sprache, in der gesungen wird. Auf Auto wird sie aus den Lyrics entnommen, was bei kurzen oder mehrdeutigen Lyrics danebengehen kann: Setze sie, wenn der Gesang in der falschen Sprache kommt. Eine von Hand gewählte Sprache bleibt erhalten, das Sprachmodell ersetzt sie nicht."
          },
          {
            "param": "Dekodierschritte",
            "what": "Die Anzahl der Diffusionsschritte. Mehr kann saubereres Audio bedeuten, aber langsamere Erzeugung; ab einem Punkt ist der Gewinn kaum zu hören. Turbo nimmt 1 bis 8 (standardmäßig 8), SFT-Modelle 50, Base-Modelle 32. Unter „Einfach“ verdoppelt „Mehr“ die übliche Zahl."
          },
          {
            "param": "Nähe zum Stil",
            "what": "Die Guidance-Skala: wie streng das Modell deiner Beschreibung folgt. Höher folgt den Stil-Tags genauer, aber sehr hohe Werte machen den Klang schroff und voller Artefakte; niedriger ist natürlicher, aber weniger vorhersehbar. Turbo nutzt sie nicht. Der Standard ist 7, ein sinnvoller Bereich ist meist 3 bis 12."
          },
          {
            "param": "Seed",
            "what": "Unter dem Formular, neben „Erzeugen“. Bei gedrücktem Würfel bekommt jede Variante einen neuen zufälligen Seed. Eine Zahl mit sonst gleichen Einstellungen wiederholt das Ergebnis fast: praktisch, um ein Stil-Tag zu ändern und zu vergleichen."
          },
          {
            "param": "Modell",
            "what": "Turbo ist schneller auf Kosten der Qualität und kann nicht jede Aufgabe im Tab „Aus einem Titel“; Base und SFT sind langsamer, aber genauer und flexibler. Das Modell wählst du im Tab „Song“ oder unter „Manuell“."
          },
          {
            "param": "LoRA",
            "what": "Eine feinabgestimmte Ergänzung über dem Modell, etwa für ein bestimmtes Stimmtimbre oder ein Subgenre. Ihre Stärke (0 bis 1) legt fest, wie stark sie das Ergebnis beeinflusst: 1 ist die volle Wirkung, die der Autor des Adapters beabsichtigt hat, niedriger mischt sie sanfter ein. Adapter fügst du unter „Meine LoRAs“ unter „Manuell“ hinzu, mit einem Namen und einem Ordner."
          }
        ],
        "footer": "Was du in Ruhe lässt, läuft mit dem Standard der Engine: Du musst nicht alles einstellen, um ein gutes Ergebnis zu bekommen. „Zurücksetzen“ stellt die eigenen Zeilen der Feinabstimmung wieder her und lässt Modell und Länge in Ruhe."
      }
    }
  },
  "aiPart": {
    "guide": {
      "scratch": [
        {
          "title": "Tempo, Tonart, Länge",
          "text": "Stelle in einem leeren Projekt die BPM und die „Tonart“ ein, dazu die Länge in Sekunden im Panel. 64 Takte bei 120 BPM sind 128 Sekunden."
        },
        {
          "title": "Mit dem Schlagzeug anfangen",
          "text": "„Part hinzufügen“, Instrument „Schlagzeug“. Die anderen Parts halten ihren Rhythmus nach dem Schlagzeug, also kommt es zuerst."
        },
        {
          "title": "Bass, dann Harmonie",
          "text": "Bass, dann Akkorde: Keyboard, Pad. Lass das Schlagzeug in der Liste der Spuren, die das Modell hört, angehakt."
        },
        {
          "title": "Melodie und Farbe",
          "text": "Lead, Streicher, Percussion. Fünf bis sieben Parts genügen; mehr, und der Mix wird zu voll."
        },
        {
          "title": "Auswählen und Lautstärke setzen",
          "text": "Behalte die beste Variante jedes Parts und bringe sie gleich auf eine passende Lautstärke."
        },
        {
          "title": "Den Song bauen",
          "text": "Schalte „Magnet“ und das Lineal in Takten ein, schneide die Parts mit dem Messer und entferne Stücke mit dem Radierer: Intro, Hauptteil, Break ohne Schlagzeug und Bass, Ende."
        }
      ],
      "scratchIntro": "Der Arrangeur kann einen Titel aus einem leeren Projekt aufbauen. Die Parts werden einzeln hinzugefügt und jeder neue hört die vorhandenen, deshalb zählt die Reihenfolge.",
      "scratchTitle": "Ein Titel von Grund auf",
      "steps": [
        {
          "title": "Die Engine starten",
          "text": "Der Arrangeur läuft auf ACE-Step; Repaint, Fortsetzen und Cover können auch auf Stable Audio 3 laufen. Ist die Engine gestoppt, bietet das Panel an, sie mit einer Taste zu starten, und die Engine auf der GPU wird dann beendet."
        },
        {
          "title": "Tempo und Tonart einstellen",
          "text": "Stelle vor dem ersten Part die BPM des Projekts und die „Tonart“ ein: Grundton und Tonleiter. Das Modell bekommt sie mit jeder Anfrage. Ändere das Tempo nicht nach den ersten Parts: Sie würden vom Raster abdriften."
        },
        {
          "title": "Einen Modus wählen",
          "text": "„Part hinzufügen“, „Repaint“, „Fortsetzen“ oder „Cover“. Der Hinweis neben dem Schalter sagt in einer Zeile, was das Modell tun wird."
        },
        {
          "title": "Beschreiben, was du brauchst",
          "text": "Wähle für einen neuen Part das Instrument. Nenne in der Beschreibung den Klang und das Spiel. Schreibe in deiner eigenen Sprache: „Auf Englisch“ schreibt es so um, wie das Modell es am besten liest. Das „?“ am Feld öffnet Wörter und fertige Beispiele."
        },
        {
          "title": "Anhaken, was das Modell hört",
          "text": "Das Modell richtet sich nach den angehakten Spuren. Lass das Schlagzeug drin: Das Modell folgt seinem Raster."
        },
        {
          "title": "Sagen, wo",
          "text": "Der ganze Titel oder der Loop-Bereich: Schalte „Loop“ ein und ziehe den Bereich auf dem Lineal. „Repaint“ funktioniert nur im Loop-Bereich."
        },
        {
          "title": "Erzeugen und wählen",
          "text": "Die Varianten landen auf neuen Spuren. „Anhören“ wechselt zu einer Variante, „Behalten“ entfernt die anderen."
        }
      ],
      "tips": [
        "Die Beschreibung funktioniert am besten auf Englisch, als kurze, durch Kommas getrennte Phrasen. Schreibe in deiner eigenen Sprache und klicke auf „Auf Englisch“; lies das Ergebnis und korrigiere es bei Bedarf.",
        "Beschreibe einen Part, nicht den ganzen Titel: was das Instrument spielt und wie es klingt.",
        "Baue den Titel in Schritten: Schlagzeug, dann Bass, dann Harmonie, dann Melodie. Jeder nächste Part hört die früheren.",
        "Mit einer Variante unzufrieden? Erzeuge neu: Jeder Durchlauf nutzt neue zufällige Seeds.",
        "Stelle nach jedem neuen Part seine Lautstärke ein, bevor du den nächsten hinzufügst: Der nächste Part hört den Mix, wie er jetzt ist.",
        "Sind die Parts fertig, baue daraus den Song: Schneide die Spuren mit dem Messer (C) an Taktgrenzen und entferne Stücke mit dem Radierer (E), damit die Instrumente nacheinander einsetzen.",
        "Gib für Gesang die Lyrics ein und prüfe die „Gesangssprache“: Auf „Auto“ wird sie an den Buchstaben erkannt.",
        "ACE-Step normalisiert jedes Ergebnis auf -1 dBFS, daher kommt ein neuer Part laut an: Hole ihn mit dem Lautstärkeregler der Spur herunter.",
        "Um den Titel in einer anderen DAW fertigzustellen, exportiere „Stems + Reaper“ oder DAWproject.",
        "Repaint, Fortsetzen und Cover können auch auf Stable Audio 3 laufen: Wähle es im Panel als Engine. Es ergänzt und setzt fort, indem es das Audio um den Bereich herum anhört, in Sekunden, nur instrumental. Das Hinzufügen eines Parts bleibt bei ACE-Step."
      ]
    },
    "toEnglish": "Auf Englisch",
    "toEnglishBusy": "Schreibt…",
    "toEnglishDone": "Vom Assistenten auf Englisch umgeschrieben; bearbeite es bei Bedarf.",
    "toEnglishFailed": "Der Assistent konnte die Beschreibung nicht schreiben.",
    "toEnglishGpu": "Der Prompt-Assistent ist auf die GPU eingestellt und würde das Modell entladen. Stelle ihn auf der Seite „Modelle“ auf Auto oder CPU.",
    "toEnglishTitle": "Beschreibe es in jeder Sprache: Der Prompt-Assistent schreibt es auf Englisch um, so versteht das Modell es am besten",
    "toEnglishUndo": "Rückgängig"
  },
  "create": {
    "closeTool": "Schließen",
    "deleteAsk": "Löschen?",
    "details": "Details",
    "download": "Herunterladen",
    "emptyAll": "Deine Songs erscheinen hier",
    "emptyHint": "Wähle eine Engine, fülle das Formular aus oder schreibe einen Satz in die Ideenzeile darüber und klicke auf Erzeugen.",
    "emptyPeriod": "In diesem Zeitraum wurde nichts erstellt",
    "engine": "Engine",
    "engineTitle": "{name}: {status}",
    "engines": {
      "ace_step": "Schnell, Covers",
      "stable_audio": "Sounds und Loops",
      "yue2": "Songs mit Gesang"
    },
    "failed": "Es hat nicht geklappt. Lade es ins Formular und klicke noch einmal auf Erzeugen.",
    "idea": {
      "chip": {
        "description": "Beschreibung",
        "length": "Länge",
        "lyrics": "Lyrics",
        "style": "Stil",
        "tempo": "Tempo und Tonart"
      },
      "describe": "Beschreiben",
      "dismiss": "Verwerfen",
      "formChanged": "Das Formular wurde geändert.",
      "noAssistant": "Der Prompt-Assistent ist nicht bereit: Lade sein Modell unter „Modelle und Einstellungen“ herunter (das Zahnrad in der Kopfzeile).",
      "noAssistantLink": "Unter „Modelle“ herunterladen",
      "noAssistantNote": "Der Prompt-Assistent braucht sein Modell.",
      "placeholder": {
        "ace_step": "In einem Satz: welche Musik du willst",
        "stable_audio": "In einem Satz: was klingen soll",
        "yue2": "In einem Satz: wovon der Song handelt"
      },
      "replaces": "Ersetzt, was jetzt im Formular steht",
      "settings": "Einstellungen",
      "stop": "Stopp",
      "stopping": "Wird gestoppt…",
      "undo": "Das Vorherige zurückholen",
      "write": "Lyrics und Stil schreiben",
      "writeSa": "Beschreibung schreiben",
      "writeShort": "Schreiben",
      "writing": "Der Assistent schreibt…",
      "written": "Ins Formular unten eingetragen.",
      "writtenOther": "Ins Formular „{name}“ eingetragen.",
      "saKind": "Schreiben",
      "saKinds": {
        "auto": "Auto: nach der Idee",
        "music": "Musikstück",
        "instrument": "Soloinstrument",
        "one_shot": "One-Shot-Sample",
        "sfx": "Soundeffekt"
      }
    },
    "lessDetails": "Weniger",
    "live": {
      "failed": "Variante fehlgeschlagen: {name}. {reason}",
      "queue": "Varianten in der Warteschlange: {n}",
      "ready": "Variante fertig: {name}",
      "readyMany": "Varianten fertig: {n}, {name}"
    },
    "loading": "Titel werden geladen…",
    "making": "Wird erstellt",
    "menu": {
      "made": "Erstellt {when}, {len} lang",
      "midi": "Zu MIDI",
      "rename": "Umbenennen",
      "stems": "In Stems zerlegen",
      "took": "dauerte {s} s"
    },
    "models": "Modelle",
    "more": "Details und Aktionen",
    "pause": "Pause",
    "peek": {
      "copied": "Kopiert",
      "copy": "Kopieren",
      "lines": "{n} Zeilen",
      "lyrics": "Lyrics",
      "noLyrics": "Keine Lyrics",
      "style": "Stil",
      "tags": "{n} Tags"
    },
    "period": "Zeitraum",
    "periodHint": {
      "all": "Alles, was bisher erstellt wurde.",
      "today": "Heute erstellte Varianten. Die mit Stern landen in der Bibliothek unter Favoriten.",
      "week": "Varianten der letzten sieben Tage."
    },
    "periods": {
      "all": "Alle",
      "today": "Heute",
      "week": "7 Tage"
    },
    "play": "Abspielen",
    "position": "Position im Titel",
    "queued": "In der Warteschlange",
    "reuse": "Ins Formular laden",
    "reuseInForm": "Ins Formular laden",
    "session": "Sitzung",
    "showAll": "Alle anzeigen: {n}",
    "showMore": "Mehr anzeigen: {n}",
    "startAndCreate": "{name} starten und erzeugen",
    "startFailed": "{name} wurde nicht gestartet.",
    "startingEngine": "{name} startet…",
    "startsOnCreate": "{name} läuft gerade nicht. Es startet, wenn du auf Erzeugen klickst; die erste Variante nach dem Start dauert länger.",
    "startsOnCreateOther": "{other} belegt gerade die GPU. {name} startet, wenn du auf Erzeugen klickst, und {other} wird beendet. Die erste Variante nach dem Start dauert länger.",
    "stop": "Stopp",
    "stopAsk": "Stoppen?",
    "stopConfirm": "Noch einmal klicken zum Stoppen: Das bisher Erstellte geht verloren",
    "stopped": "Gestoppt.",
    "styleAndLyrics": "Stil und Lyrics",
    "takeN": "Variante {n}",
    "takeTitle": "{title}, Variante {n}",
    "takes": "Varianten: {n}",
    "toSession": "Zur Sitzungsliste, Varianten: {n}",
    "untitled": "Ohne Titel",
    "wholeLibrary": "Die ganze Bibliothek"
  },
  "favorite": {
    "add": "Zu Favoriten hinzufügen",
    "remove": "Aus Favoriten entfernen"
  },
  "header": {
    "create": "Erstellen",
    "desc": {
      "create": "Songs, Instrumentals und Sounds",
      "library": "Jeder Titel: erstellt, hochgeladen und aus dem Editor"
    },
    "gpuFree": "GPU ist frei",
    "home": "Start",
    "languageCurrent": "Oberflächensprache: {name}",
    "library": "Bibliothek",
    "more": "Mehr: Sprache, Modelle, Hilfe",
    "guide": {
      "mapTitle": "Die Teile der App",
      "map": {
        "idea": "Der einfachste Einstieg, gleich auf der Startseite: ein Satz und „Komponieren“, und ein lokales Sprachmodell schreibt den Prompt für die Engine. Bearbeite ihn und erzeuge den Titel.",
        "lora": "ACE-Step mit deinen eigenen Titeln feinabstimmen: Audio hochladen, automatisch beschriften, Beschreibungen prüfen, trainieren und exportieren. Es öffnet sich auf der Seite „Erstellen“ unter ACE-Step; der fertige Adapter erscheint im ACE-Step-Formular.",
        "yue": "Die zweite Engine: schreibt einen ganzen Song mit Gesang und kann ihn um eine vorgegebene Melodie herum bauen (Tab „Melodie“, mit SheetSage2). Sie macht auch aus einem Titel MIDI."
      },
      "gpu": [
        "Die Engines passen nicht zusammen auf die GPU, daher läuft immer nur eine. Eine Engine wählst du auf der Seite „Erstellen“, und sie startet, wenn du in ihrem Formular auf Erzeugen klickst; die laufende wird beendet.",
        "Der erste Start dauert einige Minuten, während das Modell in den Grafikspeicher geladen wird. Die Statustaste in der Kopfzeile zeigt die Engine auf der GPU und wie voll der Grafikspeicher ist; ein Klick zeigt, wer wie viel Speicher belegt, die Taste „Entladen“ und den Weg zu den Modellen.",
        "Das Entladen beendet eine laufende Erzeugung oder ein Training, deshalb fragt die Taste vorher nach."
      ],
      "steps": [
        {
          "title": "ACE-Step öffnen",
          "text": "Gehe zu „Erstellen“ und wähle ACE-Step. Es startet mit dem ersten Klick auf Erzeugen; der erste Start dauert einige Minuten."
        },
        {
          "title": "Den Song beschreiben",
          "text": "Im Tab „Song“ unter „Aus einer Beschreibung“: Ein paar Sätze genügen, das Genre, die Stimmung, worum es im Text geht. Wähle die Länge und wie viele Varianten."
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
          "title": "Im Editor bauen",
          "text": "Lege die Stems auf Spuren, füge Parts mit dem KI-Arrangeur hinzu, richte die Effekte ein."
        },
        {
          "title": "Exportieren",
          "text": "Zu WAV oder MP3 mischen oder die Spuren mit einem Reaper-Projekt oder DAWproject exportieren."
        }
      ],
      "compare": [
        {
          "label": "Am besten für",
          "ace": "Schnelle Songs und Instrumentals, viele Varianten hintereinander",
          "yue": "Einen ganzen Song mit Gesang in einem Rutsch",
          "sa3": "Instrumentals, Soundeffekte und Samples; ergänzt und setzt Audio im Editor fort"
        },
        {
          "label": "Arbeit mit einem Titel",
          "ace": "Cover, einen Abschnitt neu malen, einen Part hinzufügen, einen Part extrahieren, fortsetzen",
          "yue": "Ein Song zur Melodie eines anderen Titels: Tab „Melodie“, mit SheetSage2 oder einer MIDI-Datei",
          "sa3": "Einen Bereich neu malen, fortsetzen, ein Cover in anderem Stil (Audio zu Audio); keine Parts über einem Mix"
        },
        {
          "label": "Dein eigener Stil",
          "ace": "Eine auf deinen Titeln trainierte LoRA",
          "yue": "Nein",
          "sa3": "Nein (LoRA-Unterstützung ist geplant)"
        },
        {
          "label": "Länge",
          "ace": "10 bis 300 Sekunden, 1, 2 oder 4 Varianten pro Durchlauf",
          "yue": "So lang, wie die Lyrics brauchen, oder 1 bis 8 Minuten; 1 bis 4 Varianten pro Durchlauf",
          "sa3": "Bis zu 6 Minuten (medium) oder 2 Minuten (small); 1, 2 oder 4 Varianten pro Durchlauf, Sekunden pro Durchlauf"
        },
        {
          "label": "MIDI",
          "ace": "Nein",
          "yue": "Ein Titel oder Stem zu MIDI (MuScriptor)",
          "sa3": "Nein"
        },
        {
          "label": "Lizenz",
          "ace": "MIT: kommerzielle Nutzung erlaubt; prüfe vor der Veröffentlichung die aktuellen Bedingungen",
          "yue": "Nur nicht kommerzielle Nutzung",
          "sa3": "Stability AI Community License: kostenlos unter 1 Mio. USD im Jahr; nur Instrumentals, kein Gesang"
        }
      ]
    },
    "helpSections": {
      "idea": {
        "title": "Aus einer Idee komponieren",
        "text": "Beschreibe auf der Startseite einen Song, ein Instrumental oder einen Sound in ein, zwei Sätzen und wähle die Engine; die Sprache der Lyrics und wer den Prompt schreibt, stehen unter „Mehr“. Bei „Komponieren“ schreibt der Prompt-Assistent, ein lokales Qwen3.5-Modell, den Prompt im Format der Engine: Stil-Tags, Lyrics in Abschnitten, Tempo und Tonart. Bearbeite ihn, erzeuge oder öffne ihn im Formular der Engine. Ein Sound überspringt den Assistenten und geht direkt an Stable Audio. Auf der Seite „Erstellen“ sitzt dieselbe Idee in der Ideenzeile über dem Formular und schreibt direkt hinein. Modell und Gerät des Assistenten stellst du unter „Modelle und Einstellungen“ ein."
      },
      "engines": {
        "text": "Drei Engines erzeugen Audio, ACE-Step 1.5, YuE2-3B und Stable Audio 3, und sie passen nicht zusammen auf eine GPU, daher läuft immer nur eine. Wähle eine Engine auf der Seite „Erstellen“: Sie startet, wenn du auf Erzeugen klickst, und die laufende beendet sich selbst. Das Licht zeigt ihren Zustand; der erste Start kann einige Minuten dauern, während das Modell in den Grafikspeicher geladen wird. Die Statustaste in der Kopfzeile zeigt, was die GPU belegt, und kann es entladen."
      },
      "ace": {
        "text": "Beschreibe im Tab „Song“ die Musik in einfachen Worten (Aus einer Beschreibung) oder gib Stil-Tags und Lyrics mit den Markern [Verse] / [Chorus] an (Eigene Lyrics und Stil), oder hake „Ohne Gesang“ an. Im Tab „Aus einem Titel“ macht ein Referenztitel ein Cover, malt einen Abschnitt neu, extrahiert oder ergänzt einen Part oder vollendet eine Komposition. Die Länge beträgt 10–300 s, mit 1, 2 oder 4 Varianten pro Durchlauf. Die Feinabstimmung hat „Einfach“ (Schritte, Länge, Tempo, Tongeschlecht, Format) und „Manuell“ (jeder Parameter); eine trainierte LoRA schaltest du dort ein, mit einer Stärke von 0 bis 1."
      },
      "yue": {
        "text": "YuE2-3B schreibt ganze Songs mit Gesang. Der Tab „Song“ enthält die Lyrics, den Stil, die Länge und die Qualität. Der Tab „Melodie“ legt den Melodieplan fest: „Kein Plan“ geht direkt zum Audio, „Einer Melodie folgen“ behält eine vorgegebene Melodie und erfindet die Begleitung, „Melodie und Akkorde“ schreibt zuerst einen Plan für beides. SheetSage2 (Aus einem Song…) schreibt die Melodie eines Titels als ABC-Partitur auf, die du bearbeiten und wieder an YuE2 geben kannst."
      },
      "sa3": {
        "text": "Stable Audio 3 macht in Sekunden instrumentale Musik und Soundeffekte aus einer Beschreibung: Wähle Musik oder Sound, beschreibe es so, wie es eine Sample-Bibliothek tun würde (Genre, Instrumente, Stimmung, Tempo, oder die Quelle eines Sounds und wie er entsteht), stelle die Länge und die Zahl der Varianten ein. Es gibt keinen Gesang. Dieselbe Engine bedient den KI-Arrangeur und die Samples des Editors, wo sie neu malt, fortsetzt und Covers macht, indem sie das Audio auf beiden Seiten des Bereichs anhört. Die Hauptgewichte sind gesperrt: Akzeptiere die Lizenz auf Hugging Face, speichere dein Token und lade ein Modell unter „Modelle und Einstellungen“ herunter."
      },
      "lora": {
        "text": "Das LoRA-Training liegt auf der Seite „Erstellen“ unter ACE-Step, neben „Erzeugen“ (auf dem Handy ein Schalter über dem Formular). Das Training braucht ein laufendes ACE-Step, und die Seite bietet an, es zu starten. Es führt durch die ganze Feinabstimmungs-Pipeline: Audio hochladen, automatische Beschriftung, Beschreibungen prüfen und bearbeiten, Vorverarbeitung, Training mit Live-Fortschritt und Export. Ein fertiger Adapter wird der LoRA-Liste im ACE-Step-Formular hinzugefügt."
      },
      "stems": {
        "text": "Jeder gespeicherte Titel lässt sich mit einem Klick in vier Stems zerlegen (Gesang, Schlagzeug, Bass, Rest): „In Stems zerlegen“ im Menü einer Variante, der Tab „Stems und Noten“ in der Bibliothek oder eine Spur im Editor. Die Stems können im Editor als fertiges Vierspurprojekt geöffnet werden. Die MIDI-Transkription (MuScriptor) arbeitet mit dem ganzen Mix oder einem einzelnen Stem; sie läuft auf der Engine YuE2, daher muss YuE2 installiert sein."
      },
      "arranger": {
        "text": "Die Taste „KI-Arrangeur“ im Editor baut ein Stück Schritt für Schritt auf, statt es ganz zu erzeugen. „Part hinzufügen“ schreibt einen neuen Part (Schlagzeug, Bass, Pad, Streicher und so weiter) über die gewählten Spuren, „Repaint“ schreibt einen schwachen Bereich neu, „Fortsetzen“ führt den Titel weiter, „Cover“ macht eine neue Version in anderem Stil. Jede Variante landet auf einer eigenen Spur: Hör rein, behalte die beste und mach mit dem nächsten Part weiter. Parts fügt das ACE-Step-Base-Modell hinzu (etwa 4,8 GB) oder seine größere XL-Base-Version (etwa 20 GB, braucht eine 16-GB-Karte); beide sind optional, und ohne das Base-Modell bietet der Arrangeur an, es zu installieren. Die anderen Modi laufen auf Turbo oder auf Stable Audio 3, wenn du es als Engine wählst: Es ergänzt, setzt fort und macht Covers, indem es das umgebende Audio anhört, nur instrumental."
      },
      "sfx": {
        "text": "Die Taste „Samples“ im Editor macht aus einer kurzen Beschreibung mit Stable Audio 3 One-Shots (eine Kick, ein Hit, ein Whoosh), Loops im Projekttempo und Texturen (Regen, eine Menschenmenge, ein Drone). Die Ergebnisse reihen sich in einem Streifen auf: erst anhören, dann das gewünschte auf einer neuen Spur oder der gewählten Spur an der Abspielposition hinzufügen. Loops werden auf ganze Takte geschnitten, aber das Modell garantiert keinen nahtlosen Übergang, prüfe sie daher in der Wiederholung. „Aus der Liste entfernen“ löscht die Sounds des Auftrags aus der Bibliothek und von der Festplatte, außer denen, die gerade auf einer Spur liegen."
      }
    }
  },
  "home": {
    "allTracks": "Die ganze Bibliothek",
    "compose": "Komponieren",
    "composeHere": "Der Assistent schreibt den Prompt für die gewählte Engine; du kannst ihn vor dem Erzeugen bearbeiten",
    "composeSound": "Der Assistent schreibt einen Sound-Prompt samt Länge, Stable Audio erzeugt ihn",
    "engineLabel": "Engine",
    "engines": "Oder gleich zu einer Engine",
    "firstText": "Beschreibe einen Song oder nimm ein Beispiel:",
    "firstTitle": "Deine Titel erscheinen hier",
    "guide": "So funktioniert das Komponieren",
    "kind": {
      "instrumental": "Instrumental",
      "song": "Song mit Gesang",
      "sound": "Sound"
    },
    "kindLabel": "Was erstellt werden soll",
    "lead": "Alles läuft auf diesem Computer",
    "loading": "Titel werden geladen",
    "more": "Mehr",
    "needPhrase": "Beschreibe zuerst die Musik",
    "title": "Was machen wir?",
    "phraseLabel": "Beschreibe die Musik",
    "placeholderSound": "Regen auf einem Blechdach in der Nacht, nah und ruhig",
    "soundBySa3": "Sounds macht Stable Audio",
    "soundMissing": "Stable Audio ist nicht installiert"
  },
  "keyScale": {
    "hint": "ACE-Step kennt nur Dur und Moll. Für diese Tonleiter bekommt es die nächstliegende Tonart ({key}) und den Namen der Tonleiter in der Beschreibung: ein Hinweis, keine Garantie.",
    "mode": "Tonleiter",
    "modes": {
      "blues": "Blues",
      "dorian": "Dorisch",
      "double_harmonic": "Doppelt harmonisch",
      "harmonic_minor": "Harmonisch Moll",
      "hungarian_minor": "Ungarisch Moll",
      "locrian": "Lokrisch",
      "lydian": "Lydisch",
      "major": "Dur (Ionisch)",
      "major_pentatonic": "Dur-Pentatonik",
      "melodic_minor": "Melodisch Moll",
      "minor": "Natürlich Moll (Äolisch)",
      "minor_pentatonic": "Moll-Pentatonik",
      "mixolydian": "Mixolydisch",
      "phrygian": "Phrygisch",
      "phrygian_dominant": "Phrygisch dominant"
    },
    "needTonic": "Wähle zuerst den Grundton",
    "none": "Keine solche Tonleiter",
    "notSet": "nicht gesetzt",
    "search": "Tippen zum Suchen",
    "tonic": "Grundton"
  },
  "libraryPage": {
    "aiPart": "Ein Part vom KI-Arrangeur",
    "collectionName": "Name der Sammlung",
    "confirmDeleteCollection": "Die Sammlung entfernen?",
    "cot": {
      "full": "Melodie und Akkorde",
      "melody": "folgt einer Melodie"
    },
    "delete": "Löschen",
    "deleteCollection": "Die Sammlung entfernen (ihre Titel bleiben)",
    "deleteFailed": "Konnte nicht gelöscht werden: {error}",
    "emptyCollection": "Öffne einen Titel und füge ihn im Tab „Info“ dieser Sammlung hinzu.",
    "emptyFavorites": "Markiere einen Titel mit dem Stern, dann erscheint er hier.",
    "emptyHere": "Hier ist noch nichts",
    "emptyHint": "Titel, die du erstellst und hochlädst, sammeln sich hier.",
    "facts": {
      "file": "Datei",
      "madeIn": "Erstellt in",
      "melody": "Melodie",
      "model": "Modell"
    },
    "filters": {
      "all": "Alle Titel",
      "favorites": "Favoriten",
      "midi": "Noten (MIDI)",
      "score": "Partitur",
      "stems": "Stems",
      "today": "Heute"
    },
    "filtersLabel": "Bibliotheksfilter",
    "groups": {
      "collections": "Sammlungen",
      "has": "Was der Titel hat",
      "origin": "Erstellt von",
      "tags": "Tags"
    },
    "loadFailed": "Die Bibliothek konnte nicht geladen werden.",
    "newCollection": "+ Neue Sammlung",
    "newest": "Neueste zuerst",
    "noCollections": "Noch keine Sammlungen: Lege die erste mit „Neue Sammlung“ an.",
    "nothingFound": "Nichts gefunden",
    "nothingFoundHint": "Versuche ein anderes Wort oder einen anderen Filter.",
    "oldest": "Älteste zuerst",
    "order": "Reihenfolge",
    "origins": {
      "editor": "Editor",
      "upload": "Hochgeladen"
    },
    "period": "Zeitraum",
    "pick": "Wähle einen Titel: Seine Lyrics, sein Stil, Stems und Noten erscheinen hier.",
    "renameCollection": "Sammlung umbenennen",
    "retry": "Erneut versuchen",
    "reuseHint": "Öffnet „Erstellen“ mit diesen Lyrics, diesem Stil und diesen Einstellungen",
    "search": "Titel, Stil oder eine Zeile der Lyrics",
    "showAll": "Alle Titel anzeigen",
    "sub": {
      "editor": "Aus dem Editor",
      "engine": "Keine Beschreibung",
      "upload": "Hochgeladene Datei"
    },
    "tabs": {
      "about": "Info",
      "lyrics": "Lyrics",
      "parts": "Stems und Noten"
    },
    "take": "Variante {n}",
    "title": "Bibliothek",
    "toCreate": "Den ersten Titel erstellen",
    "today": "Heute",
    "yesterday": "Gestern",
    "bulk": {
      "addTag": "#{tag} hinzufügen",
      "clear": "Auswahl aufheben (Esc)",
      "collected": "{n} Titel zu «{name}» hinzugefügt | {n} Titel zu «{name}» hinzugefügt",
      "collection": "Sammlung",
      "favorited": "{n} Titel zu den Favoriten hinzugefügt | {n} Titel zu den Favoriten hinzugefügt",
      "label": "Aktionen für die ausgewählten Titel",
      "newCollection": "Neue Sammlung…",
      "noTags": "Noch keine Tags: eines eingeben und Enter drücken.",
      "selectAll": "Alle auswählen: {n}",
      "selectSong": "«{title}» mit allen Takes auswählen: {n}",
      "selectTrack": "«{title}» auswählen",
      "selected": "Ausgewählt: {n}",
      "tag": "Tag",
      "tagPlaceholder": "Neuer Tag oder Suche",
      "tagged": "#{tag} zu {n} Titel hinzugefügt | #{tag} zu {n} Titeln hinzugefügt",
      "uncollected": "{n} Titel aus «{name}» entfernt | {n} Titel aus «{name}» entfernt",
      "unfavorited": "{n} Titel aus den Favoriten entfernt | {n} Titel aus den Favoriten entfernt",
      "untagged": "#{tag} von {n} Titel entfernt | #{tag} von {n} Titeln entfernt"
    },
    "emptyTag": "Füge diesen Tag auf dem Tab „Info“ zu einem Titel hinzu oder über die Auswahlleiste zu mehreren auf einmal.",
    "tags": {
      "add": "Tag hinzufügen und Enter drücken",
      "added": "Tag #{tag} hinzugefügt",
      "confirmDelete": "Tag entfernen?",
      "delete": "Tag von allen Titeln entfernen",
      "remove": "Tag #{tag} entfernen",
      "removed": "Tag #{tag} entfernt",
      "rename": "Tag umbenennen"
    },
    "trash": {
      "confirmEmpty": "Alle endgültig löschen?",
      "confirmPurge": "Endgültig löschen?",
      "deleted": "Gelöscht: {when}",
      "dismiss": "Hinweis ausblenden",
      "emptied": "Der Papierkorb ist jetzt leer",
      "empty": "Papierkorb leeren",
      "emptyHere": "Der Papierkorb ist leer",
      "emptyHint": "Gelöschte Titel bleiben hier 30 Tage, falls du einen zurückhaben möchtest.",
      "loadFailed": "Der Papierkorb konnte nicht geladen werden: {error}",
      "moveHint": "Verschiebt den Titel in den Papierkorb: Dort lässt er sich 30 Tage lang wiederherstellen",
      "moved": "{n} Titel in den Papierkorb verschoben | {n} Titel in den Papierkorb verschoben",
      "note": "Titel im Papierkorb werden nach 30 Tagen endgültig gelöscht.",
      "purge": "Endgültig löschen",
      "purged": "{n} Titel endgültig gelöscht | {n} Titel endgültig gelöscht",
      "restore": "Wiederherstellen",
      "restored": "{n} Titel wiederhergestellt | {n} Titel wiederhergestellt",
      "title": "Papierkorb",
      "undo": "Rückgängig"
    }
  },
  "midiPanel": {
    "betterWithVocals": "Arbeitet mit dem ganzen Mix; für eine exakte Melodie zerlege den Titel zuerst in Stems und erkenne den Gesang.",
    "scoreEmpty": "Das MIDI hat keine Noten, aus denen sich eine Partitur machen ließe.",
    "scoreFromFull": "aus dem ganzen Mix",
    "scoreFromStems": "Melodie aus dem Gesang, Begleitung aus Bass und dem Rest",
    "scoreFromVocals": "Melodie aus dem Gesang",
    "scoreInserted": "Die Partitur steht im YuE2-Formular ({from}).",
    "toScore": "Zur YuE2-Partitur",
    "toScoreHint": "Macht aus den Noten eine ABC-Partitur für YuE2 und trägt sie in dessen Formular ein: Der Gesang wird zur Melodie, Bass und der Rest zu Begleitung und Akkorden."
  },
  "miniWave": {
    "percent": "{n} %",
    "timeOf": "{pos} von {total}"
  },
  "models": {
    "check": "Prüfen",
    "checkBad": "Beschädigt oder fehlt: {files}. Lade diesen Teil neu herunter.",
    "checkFailed": "Prüfung nicht möglich: {error}",
    "checkOffline": "Hugging Face war nicht erreichbar, daher wurden nur die Größen verglichen.",
    "checkOkHash": "Alle {n} Dateien sind vollständig; {h} stimmten mit der SHA-256 überein, die Hugging Face angibt.",
    "checkOkRecord": "Alle {n} Dateien stimmen in der Größe mit ihrem Eintrag überein.",
    "checkOkSize": "Alle {n} Dateien sind vollständig (nach Größe und Struktur geprüft; es gibt keine Prüfsummenliste zum Vergleich).",
    "checkOutdated": "Vollständig, aber das Repository enthält jetzt eine neuere Version von: {files}. Lade neu herunter, um sie zu bekommen.",
    "checkTitle": "Prüfen, ob die Dateien vollständig sind",
    "checking": "Wird geprüft…",
    "parts": {
      "yue2-bf16": {
        "name": "YuE2 bf16",
        "text": "Das Modell unquantisiert. Braucht mehr Grafikspeicher als q8_0 (am meisten der drei)."
      }
    },
    "reinstall": "Neu herunterladen",
    "reinstallAsk": "{gb} GB noch einmal laden?",
    "reinstallNamed": "{name} neu herunterladen",
    "reinstallNo": "Behalten",
    "reinstallTitle": "Noch einmal herunterladen und die Dateien ersetzen",
    "reinstallYes": "Neu herunterladen",
    "yue2": {
      "noSettings": "Die Genauigkeit q8_0, q4_0 oder bf16 wird für jede Erzeugung im YuE2-Formular mit „Qualität“ gewählt."
    }
  },
  "params": {
    "changed": "Geändert",
    "consoleNote": "Von Hand gesetzte Werte sind markiert. Der Rest läuft mit seinem Standardwert.",
    "consoleTitle": "Konsole {name}",
    "default": "Standard: {v}",
    "quick": "Schnellauswahl: {group}",
    "reset": "Zurück auf Standard",
    "resetOne": "{name} auf Standard zurücksetzen",
    "simple": {
      "more": "Mehr: {n}",
      "normal": "Üblich: {n}",
      "steps": "Dekodierschritte",
      "stepsHint": "Mehr Schritte dauern länger."
    }
  },
  "player": {
    "close": "Player schließen",
    "label": "Player",
    "next": "Nächster Titel",
    "prev": "Vorheriger Titel (vom Anfang, wenn der Titel schon läuft)"
  },
  "presets": {
    "button": "Preset",
    "confirmDelete": "Noch einmal klicken, um {name} zu löschen",
    "deleteAsk": "Löschen?",
    "deleteOne": "Preset {name} löschen",
    "none": "Noch keine Presets gespeichert.",
    "saveCurrent": "Das Formular als Preset speichern",
    "title": "Presets: gespeicherte Sätze von Formulareinstellungen"
  },
  "resources": {
    "ramOf": "RAM {used} von {total} GB",
    "state": {
      "error": "{model} meldete einen Fehler",
      "running": "{model} läuft",
      "starting": "{model} startet",
      "stopping": "{model} wird beendet"
    },
    "vramOf": "Grafikspeicher {used} von {total} GB",
    "holder": {
      "cover": "Cover (Z-Image Turbo)"
    }
  },
  "sa3Gen": {
    "badGuidanceWindow": "Guidance endet bei einem höheren Rauschpegel, als sie beginnt: Senke „endet bei“ oder erhöhe „beginnt bei“.",
    "formTabs": "Abschnitte des Formulars",
    "kindLabel": "Art des Audios",
    "lengthFromRef": "Der Referenztitel bestimmt die Länge:",
    "lengthOwn": "eigene: {v}",
    "lengthSeconds": "{n} s",
    "manual": {
      "apg": "APG-Anteil",
      "autoTags": "Service-Tags",
      "cfg": "Nähe zur Beschreibung",
      "cfgStartsAt": "Guidance beginnt bei Rauschpegel",
      "cfgStopsAt": "Guidance endet bei Rauschpegel",
      "chunked": "In Blöcken dekodieren",
      "chunkedAuto": "Auto",
      "duration": "Länge",
      "fromRef": "vom Referenztitel bestimmt",
      "guidanceSub": "wie die Beschreibung den Klang lenkt; der Rauschpegel fällt während des Durchlaufs von 1 auf 0",
      "guidanceTitle": "Guidance",
      "needCfg": "wenn „Nähe zur Beschreibung“ nicht 1 ist",
      "needTwo": "ab zwei Varianten",
      "negative": "Was vermieden werden soll",
      "normThreshold": "Obergrenze für einen Guidance-Schritt",
      "off": "Nein",
      "on": "Ja",
      "padding": "Längenreserve",
      "perVariant": "Eine Beschreibung pro Variante",
      "resultSub": "die Länge und die Beschreibung",
      "resultTitle": "Ergebnis",
      "sampler": "Sampler",
      "samplerAuto": "Standard (pingpong)",
      "samplerAutoBase": "der Standard des Modells",
      "samplerLoud": "Lauter als üblich und übersteuert: In einem Test erreichten 1-2 % des Klangs die Obergrenze.",
      "samplerQuiet": "Etwa 7 dB leiser als üblich.",
      "samplerSub": "wie jeder Schritt berechnet wird",
      "samplerTitle": "Sampler",
      "scalePhi": "Guidance abschwächen",
      "textOnly": "nur ohne Referenztitel",
      "trim": "Stille am Anfang abschneiden"
    },
    "modelsAfterStart": "Die Liste der Modelle erscheint, sobald die Engine läuft.",
    "queuedNote": "Varianten in der Warteschlange: {n}",
    "ref": {
      "modeLabel": "Was mit der Referenz geschehen soll",
      "off": "Schalte es ein, um von einem fertigen Titel auszugehen: neu machen, einen Bereich wiederholen oder fortsetzen."
    },
    "simple": {
      "tagsOff": "Nicht hinzufügen",
      "tagsOn": "Hinzufügen"
    },
    "submitKind": {
      "music": "Musik erstellen",
      "sfx": "Einen Sound erstellen"
    },
    "tabChanged": "geändert",
    "tabs": {
      "ref": "Aus einem Titel",
      "sound": "Beschreibung",
      "tuning": "Feinabstimmung"
    },
    "advancedHint": "Der Würfel neben dem Seed macht ihn wieder zufällig; eine Zahl wiederholt diesen Klang. Die nachtrainierten Modelle sind auf 8 Schritte und Nähe 1 abgestimmt; „Was vermieden werden soll“ und die Gruppe „Guidance“ wirken nur, wenn die Nähe zur Beschreibung nicht 1 ist.",
    "advancedHintBase": "Ein Base-Checkpoint: Er startet mit 50 Schritten und Nähe 7, daher funktioniert „Was vermieden werden soll“; probiere dort „poor quality“.",
    "help": {
      "tips": [
        "Musik: Genre, Instrumente und wie jedes klingt, Stimmung und Energie, Tempo in BPM.",
        "Ein Sound: was ihn macht, wie und wie lange es geschieht, wo das Mikrofon steht und wie der Raum klingt.",
        "Tags helfen: TrackType: Music, VocalType: Instrumental, Genre: Funk, Instruments: Guitar, Saxophone; TrackType: Instrument für einen Solopart; TrackType: SFX für einen Sound.",
        "Kein Gesang: Das Modell macht Instrumentals; ein Gesangs-Prompt ergibt höchstens textlose Texturen.",
        "Gib einen Seed ein, um ein Ergebnis zu wiederholen; bei gedrücktem Würfel bekommt jede Variante einen neuen."
      ]
    },
    "translateBtn": "Nur übersetzen",
    "translateHint": "Stable Audio versteht nur Englisch: Der Assistent schreibt aus deinem Text einen englischen Prompt oder übersetzt ihn nur.",
    "translateNoAssistant": "Der Prompt-Assistent ist nicht bereit: Lade sein Modell unter Modelle herunter.",
    "translateRunning": "Wird übersetzt…",
    "translateStopping": "Wird gestoppt…",
    "translateStop": "Stopp",
    "translateDone": "Ins Englische übersetzt.",
    "translateUndo": "Zurücksetzen",
    "composeBtn": "Prompt schreiben",
    "composeTitle": "Der Assistent macht aus der Beschreibung in jeder Sprache einen Prompt für Stable Audio: Genre, Instrumente, Klang, Tempo und Länge",
    "composeRunning": "Schreibe den Prompt…",
    "composeDone": "Der Prompt für Stable Audio ist fertig."
  },
  "tagInput": {
    "cleared": "Alle Tags gelöscht",
    "removeTag": "{tag} entfernen",
    "removed": "{tag} entfernt",
    "restored": "Tags wiederhergestellt",
    "undo": "Rückgängig",
    "undoTitle": "Die gelöschten Tags zurückholen"
  },
  "yueGen": {
    "help": {
      "advanced": {
        "choices": [
          "Qualität (Tab Song): Entwurf ist das Modell q4_0, Normal q8_0, Final bf16 mit 32 Dekodierschritten und Nähe zum Stil 1,2.",
          "Länge (Tab Song): Minuten werden zu „Nicht kürzer als“ und „Nicht länger als“; das Modell erzeugt 25 Tokens pro Sekunde Klang.",
          "Gesang: Ruhiger ist Wagemut 0,85, Mutiger 1,1.",
          "Wiederholungen: Weniger ist Wiederholungsstrafe 1,3 mit Wiederholungsgedächtnis 80.",
          "Partitur: Vorsichtiger ist ein Partitur-Wagemut von 0,55."
        ],
        "choicesIntro": "Sie setzen dieselben Werte wie die Lösungen unten, mit einem Klick.",
        "choicesTitle": "Die Auswahlen in den Tabs",
        "title": "Feinabstimmung",
        "lead": "Du kannst sie in Ruhe lassen: Was du nicht änderst, läuft mit dem Standard der Engine, der in jeder Zeile unter „Manuell“ steht. Sie zählen, wenn ein Titel immer wieder falsch gerät: abgeschnitten, in Schleife, schief. Finde unten deinen Fall und klicke auf „Anwenden“: Die richtigen Zahlen kommen von selbst in die Felder.",
        "fixes": [
          {
            "id": "cutoff",
            "problem": "Titel bricht vor dem Ende der Lyrics ab",
            "fix": "Nicht länger als: 12000 Tokens, eine Längenobergrenze von etwa 8 statt 6 Minuten."
          },
          {
            "id": "offbrief",
            "problem": "Klang passt nicht zu den Tags",
            "fix": "Nähe zum Stil: 1,2, damit das Modell der Beschreibung strenger folgt. Hilft das nicht, liegt es an den Tags selbst."
          },
          {
            "id": "loop",
            "problem": "Eine Phrase läuft immer wieder im Kreis",
            "fix": "Wiederholungsstrafe 1,3 und Wiederholungsgedächtnis 80: eine stärkere Strafe für Wiederholungen und ein längeres Gedächtnis dafür."
          },
          {
            "id": "offkey",
            "problem": "Falsche Töne, Brüche in der Stimme, Rauschen",
            "fix": "Wagemut 0,85 und 32 Dekodierschritte: weniger Wagemut, mehr Durchläufe beim Rendern des Audios."
          },
          {
            "id": "melody",
            "problem": "Melodie ist unzusammenhängend",
            "fix": "Ist der Plan aus, wechselt er auf „Melodie und Akkorde“ (ein schon gewählter Plan bleibt), und „Partitur“ geht auf „Vorsichtiger“ (Partitur-Wagemut 0,55), sodass die Partitur behutsamer geschrieben wird. Oder nimm im Tab „Melodie“ eine Melodie aus einem Song: Eine vorgegebene Partitur ersetzt den Plan, und dann zählt nur die Wahl des Plans."
          },
          {
            "id": "same",
            "problem": "Alle Varianten klingen gleich",
            "fix": "Schaltet den zufälligen Seed ein. Reicht das nicht, Wagemut 1,1."
          },
          {
            "id": "final",
            "problem": "Ich will das finale Rendering",
            "fix": "Qualität: Final, das Modell bf16 (wenn heruntergeladen), 32 Schritte und Nähe zum Stil 1,2. Erstelle 2–3 Varianten und behalte die beste."
          }
        ],
        "fieldsIntro": "Unter jedem Feld ist eine Skala typischer Werte: Die Markierung darüber ist der Standard fürs Audio, die darunter der für die Partitur (nur mit Melodieplan und ohne vorgegebene Partitur). Eine Partitur braucht Strenge, Audio braucht Leben, daher die unterschiedlichen Standardwerte.",
        "groups": [
          {
            "title": "Genauigkeit und Qualität",
            "fields": [
              {
                "key": "cfg_scale",
                "name": "Nähe zum Stil (CFG)",
                "text": "Wie folgsam das Modell den Stil-Tags folgt. Wie die Lautstärke deiner Stimme im Ohr eines Musikers: leiser — er spielt freier, lauter — näher an der Vorgabe, aber steifer.",
                "left": "freier",
                "right": "strenger nach Tags",
                "when": "1,2, wenn der Klang kaum zur Beschreibung passt. Über 1,5 — Artefakte und ein „plastischer“ Klang."
              },
              {
                "key": "num_inference_steps",
                "name": "Dekodierschritte",
                "text": "Wie viele Durchläufe das Modell macht, um seinen Plan in fertiges Audio zu verwandeln. Wie Farbschichten: 8 ist eine schnelle Skizze, 32 ein sauberer Schlussanstrich.",
                "left": "schneller",
                "right": "sauberer",
                "when": "8 für Entwürfe, 32 für das Finale. Der Unterschied ist kaum hörbar (etwa 4 s pro Titel auf einer RTX 4080); über 32 hinaus ändert sich der Klang nur, er wird nicht besser."
              }
            ]
          },
          {
            "title": "Charakter des Vortrags",
            "fields": [
              {
                "key": "temperature",
                "name": "Wagemut (Temperature)",
                "text": "Der Wagemut des Modells (mindestens 0,01: Null stoppt die Engine). Niedrig — spielt „nach Lehrbuch“, gleichmäßig und vorhersehbar; hoch — improvisiert, mal genial, mal schief.",
                "left": "ruhiger",
                "right": "mutiger",
                "when": "Schiefe Töne: 0,85. Alle Varianten gleich: 1,1. Eine merkwürdige Partitur: 0,5–0,6 für die Partitur."
              },
              {
                "key": "repetition_penalty",
                "name": "Wiederholungsstrafe",
                "text": "Eine Strafe fürs Wiederholen von bereits Gespieltem. Je höher, desto stärker meidet das Modell eine „hängende Schallplatte“. Für die Partitur liegt sie nahe 1,0 — Wiederholungen sind in der Notation normal.",
                "left": "Wiederholungen erlaubt",
                "right": "keine Wiederholungen",
                "when": "Schleife: 1,3. Unter 1,1 droht eintönige Schleifen."
              }
            ]
          },
          {
            "title": "Länge des Titels",
            "fields": [
              {
                "key": "min_tokens",
                "name": "Nicht kürzer als",
                "text": "Das Modell darf nicht vorher enden. Etwa 25 Einheiten pro Sekunde: 200 ≈ 8 Sekunden Audio.",
                "left": "darf kurz sein",
                "right": "nicht vorher",
                "when": "Der Titel endet, bevor alles gesungen ist: erhöhe es."
              },
              {
                "key": "max_tokens",
                "name": "Nicht länger als",
                "text": "Längenobergrenze. 9000 ≈ 6 Minuten Song; das Formular nimmt bis zu 15000. Mehr — längeres Warten und mehr GPU-Speicher.",
                "left": "kürzer",
                "right": "länger",
                "when": "Bricht mitten in der Phrase ab: 12000."
              }
            ]
          }
        ],
        "rareIntro": "Diese ändern dasselbe wie Wagemut oder Wiederholungsstrafe, nur feiner. Meist lässt man sie in Ruhe.",
        "rare": [
          {
            "key": "top_p",
            "name": "Grenze für seltene Wahl (top-p)",
            "text": "Wie viele „vernünftige“ Optionen das Modell bei jedem Schritt in Betracht zieht: 1 — alle, 0,5 — nur die naheliegendsten."
          },
          {
            "key": "top_k",
            "name": "Kandidaten (top-k)",
            "text": "Eine harte Obergrenze für die Zahl der Optionen bei jeder Wahl. Ein zweiter Filter neben der Grenze für seltene Wahl."
          },
          {
            "key": "penalty_window",
            "name": "Wiederholungsgedächtnis",
            "text": "Wie weit zurück das Modell sich beim Berechnen der Wiederholungsstrafe an Gespieltes erinnert. 50 ≈ 2 Sekunden Audio. Erhöhe auf 80 bei Schleifen."
          }
        ]
      },
      "melody": {
        "lead": "YuE2 kann die Lyrics zu einer Melodie singen, die du vorgibst. Die ABC-Partitur enthält sie: als Text geschriebene Noten. Aus einer Partitur im Format, das die App schreibt, entsteht der Song in derselben Tonart, mit denselben gesungenen Noten und derselben Länge: In unserem Test stimmten die Noten zu 93–99 % überein.",
        "roll": [
          "„Anhören“ spielt die Partitur auf einem Klavier ab. Ein Klick oder Ziehen auf der Roll wählt den Startpunkt, ⏮ geht zurück zum Anfang.",
          "Rosa Noten sind der Gesang (Vocal), blaue die Begleitung (Ins). Taktnummern und Akkorde laufen oben entlang.",
          "Strg + Mausrad zoomt, ⤢ öffnet das große Fenster mit drei Oktaven Tasten.",
          "„Notenblatt“ zeigt dieselbe Partitur auf Notenlinien; ein Klick auf eine Note spielt sie ab."
        ],
        "rollTitle": "Die Roll und die Noten",
        "sources": [
          "Aus einem Song… — wähle eine Audiodatei, und SheetSage2 schreibt Melodie und Akkorde auf. Am besten funktioniert ein Song mit klarem Gesang.",
          "MIDI importieren — die höchste Stimme wird zur Melodie, die anderen Kanäle zu Begleitung und Akkorden, und die Tonart wird von selbst gefunden. Halte die Gesangsmelodie auf einer eigenen Spur.",
          "Klavier — wähle eine Länge und drücke Tasten (unten, links neben der Roll, oder auf einem MIDI-Keyboard): Die Noten folgen aufeinander.",
          "Aus einem Titel: „Zu MIDI“ im Menü einer Variante oder der Tab „Stems und Noten“ in der Bibliothek, dann „Zur YuE2-Partitur“. Der Gesang wird zur Melodie, Bass und der Rest zur Begleitung."
        ],
        "sourcesTitle": "Woher eine Melodie kommt",
        "tips": [
          "Eine Note pro Silbe: Eine Zeile mit 8 Silben braucht etwa 8 Noten.",
          "Der Song ist so lang wie die Noten: 8 Takte im 4/4-Takt bei 100 BPM sind etwa 20 Sekunden.",
          "Einer Melodie folgen: Das Modell behält deine Melodie und erfindet die Begleitung; Melodie und Akkorde: Es baut beides aus der Partitur.",
          "Eine Tonart oder ein Tempo im Stil bewirkt nichts: Sie kommen aus den Noten.",
          "Bearbeite den ABC-Text nur von Hand, wenn du das Format kennst: Das Modell liest am besten das Layout, das die App schreibt (Stimmen Vocal und Ins)."
        ],
        "tipsTitle": "Für ein nahes Ergebnis",
        "title": "Melodie und die ABC-Partitur"
      },
      "style": {
        "tips": [
          "Optimal sind 5–8 Tags — mehr geraten in Konflikt, weniger ergibt ein weniger vorhersehbares Ergebnis.",
          "Schreibe die Tags auf Englisch, beginne aber mit der Sprache des Songs (Russian, English, Spanish…): Die eigenen Beispiele der Engine tun das alle, und die Ideen-Abläufe fügen es für dich hinzu.",
          "Mit einem Melodieplan (Einer Melodie folgen oder Melodie und Akkorde) zählt der Stil weiterhin: Er legt Klangfarbe und Arrangement fest, während die Melodie aus der ABC-Partitur kommt."
        ]
      },
      "lyrics": {
        "tips": [
          "Mit einem Melodieplan sollte der Rhythmus der Zeilen grob zur ABC-Partitur passen (Silben pro Takt); sonst muss das Modell die Wörter dehnen oder stauchen, damit sie zur Melodie passen.",
          "Kurze Zeilen passen berechenbarer zur Melodie als lange.",
          "Wiederhole den Refrain wortgleich in jedem [Chorus] — das hält dafür im ganzen Titel dieselbe Melodielinie bei."
        ]
      },
      "cot": {
        "title": "Der Melodieplan",
        "intro": "Der Melodieplan entscheidet, ob das Modell vor dem Audio einen musikalischen Plan schreibt und wie es die ABC-Partitur im Tab „Melodie“ verwendet.",
        "melodyNote": "Gib die Melodie in der ABC-Partitur unter dem Plan an: Aus einem Song… (SheetSage2), eine MIDI-Datei oder das Klavier. Ohne Partitur schreibt das Modell einen eigenen reinen Melodieplan.",
        "precisionNote": "Die Modellgenauigkeit (q8_0, q4_0, bf16) hat mit dem Plan nichts zu tun: Die „Qualität“ im Tab „Song“ legt sie fest. q4_0 spart Grafikspeicher bei kleinem Qualitätsverlust, egal welcher Plan.",
        "abcFooter": "Am einfachsten schreibst du ABC nicht von Grund auf, sondern nimmst es mit „Aus einem Song…“ (SheetSage2) aus einem Song und überarbeitest dann die nötigen Takte von Hand."
      }
    },
    "length": {
      "auto": "Auto",
      "autoHint": "So lang, wie die Lyrics brauchen, bis zu etwa 6 Minuten.",
      "hint": "Etwa {n} Min.: Ein kürzerer Text wird bis zu dieser Länge gesungen und weitergespielt, ein längerer wird dort abgeschnitten.",
      "label": "Länge",
      "minutes": "{n} Min.",
      "ownHint": "Von Hand in der Feinabstimmung gesetzt (Min / Max Tokens)."
    },
    "lines": "Zeilen: {n}",
    "linesAbout": "Zeilen: {n}, etwa {time}",
    "linesAboutHint": "Eine Schätzung aus deinen früheren Songs: etwa {s} s pro Zeile. Für die Länge „Auto“.",
    "manual": {
      "abcGiven": "die Partitur aus dem Tab „Melodie“",
      "changed": "{n} von {total} geändert",
      "console": "Konsole: alle Gruppen auf einmal",
      "consoleTitle": "YuE2-Konsole",
      "done": "Fertig",
      "groups": {
        "character": {
          "sub": "der Gesang und die Musik",
          "title": "Charakter"
        },
        "length": {
          "sub": "25 Tokens pro Sekunde",
          "title": "Länge"
        },
        "repeats": {
          "sub": "gegen Schleifen",
          "title": "Wiederholungen"
        },
        "score": {
          "sub": "wie das Modell den Melodieplan schreibt",
          "title": "Partitur"
        },
        "sound": {
          "sub": "das Modell und die Dekodierung",
          "title": "Klang"
        }
      },
      "manual": "Manuell",
      "params": {
        "cfg": "Nähe zum Stil",
        "max_tokens": "Nicht länger als",
        "min_tokens": "Nicht kürzer als",
        "penalty_window": "Wiederholungsgedächtnis",
        "precision": "Modellgenauigkeit",
        "repetition_penalty": "Wiederholungsstrafe",
        "steps": "Dekodierschritte",
        "temperature": "Wagemut",
        "top_k": "Kandidaten",
        "top_p": "Grenze für seltene Wahl"
      },
      "reset": "Zurücksetzen",
      "resetAll": "Alles zurücksetzen",
      "seconds": "{n} s",
      "seedRandom": "zufällig",
      "sends": "Geht an die Engine",
      "sendsRest": "Von Hand gesetzte Werte sind markiert. Was nicht in der Zeile steht, bleibt beim Standard der Engine.",
      "simple": "Einfach"
    },
    "perf": {
      "manualNow": "(jetzt von Hand gesetzt)",
      "repeats": {
        "hint": "Weniger, wenn sich eine Phrase im Kreis dreht.",
        "label": "Wiederholungen",
        "options": {
          "fewer": "Weniger",
          "normal": "Normal"
        }
      },
      "score": {
        "hint": "Vorsichtiger, wenn die Melodie abschweift: Das Modell schreibt die Partitur behutsamer.",
        "label": "Partitur",
        "options": {
          "careful": "Vorsichtiger",
          "normal": "Normal"
        }
      },
      "temperature": {
        "hint": "Ruhiger: weniger falsche Töne und Brüche in der Stimme. Mutiger: Die Varianten unterscheiden sich stärker voneinander.",
        "label": "Gesang",
        "options": {
          "normal": "Normal",
          "steady": "Ruhiger",
          "varied": "Mutiger"
        }
      }
    },
    "planLabel": "Melodieplan",
    "planNames": {
      "full": "Melodie und Akkorde",
      "melody": "Einer Melodie folgen",
      "off": "Kein Plan"
    },
    "qualityHints": {
      "draft": "Das Modell {model} braucht weniger Grafikspeicher, der Klang ist etwas schlichter: zum Ausprobieren von Ideen.",
      "final": "Das Modell {model}, 32 Dekodierschritte und näher an den Stil-Tags (CFG 1,2): für einen fertigen Titel. Erstelle 2–3 Varianten und behalte die beste. bf16 braucht mehr Grafikspeicher als q8_0 (die Datei ist 7,3 GB groß gegenüber 4,3 GB).",
      "normal": "Das Modell {model} mit den üblichen Einstellungen: guter Klang ohne langes Warten.",
      "own": "Genauigkeit, Schritte und CFG von Hand."
    },
    "qualityLabel": "Qualität",
    "qualityNames": {
      "draft": "Entwurf",
      "final": "Final",
      "normal": "Normal",
      "own": "Eigene"
    },
    "queued": "In der Warteschlange, Varianten: {n}",
    "scoreGivenNote": "Die vorgegebene Partitur ersetzt den Plan, daher bewirkt das Partitur-Sampling nichts und wird nicht gesendet.",
    "sections": {
      "bridge": "+ Bridge",
      "chorus": "+ Chorus",
      "outro": "+ Outro",
      "verse": "+ Verse"
    },
    "tabs": {
      "changed": "Gegenüber den Standardwerten geändert",
      "melody": "Melodie",
      "song": "Song",
      "tuning": "Feinabstimmung"
    },
    "takes": "Varianten",
    "tuningTitle": "Leistungseinstellungen"
  },
  "acePage": {
    "openTrainingPage": "LoRA-Training öffnen"
  },
  "library": {
    "noTracks": "Die Bibliothek hat noch keine Titel. Lade oben eine Datei hoch oder erstelle einen Titel unter „Erstellen“."
  },
  "notInstalled": {
    "stableAudio": {
      "text": "Stable Audio 3 macht Instrumentals und Soundeffekte und treibt Repaint, Fortsetzen und Cover des Editors an. Es wurde bei der Installation ausgelassen. Sobald es installiert ist, lade ein Modell unter „Modelle und Einstellungen“ oder direkt im Formular von Stable Audio herunter."
    }
  },
  "idea": {
    "guide": {
      "lead": "Ein Satz hinein, ein Titel heraus, gleich auf der Startseite. Du beschreibst einen Song, ein Instrumental oder einen Sound in eigenen Worten, ein lokales Sprachmodell schreibt den Prompt im Format der gewählten Engine, du bearbeitest ihn nach Wunsch, und die Engine macht den Titel.",
      "steps": [
        {
          "title": "Die Idee beschreiben",
          "text": "Ein, zwei Sätze: worum es im Song geht, die Stimmung, wer singt, wo und wann. Für ein Instrumental: das Genre, die Instrumente und die Stimmung."
        },
        {
          "title": "Art und Engine wählen",
          "text": "Song mit Gesang, Instrumental oder Sound, dann ACE-Step, YuE2 oder Stable Audio 3. Eine Engine, die diese Art nicht macht, lässt sich nicht wählen; ein Sound ist immer Sache von Stable Audio."
        },
        {
          "title": "Komponieren",
          "text": "Klicke auf „Komponieren“: Der Assistent schreibt den Prompt direkt unter den Satz und zeigt Phase, Prozent und den Text beim Wachsen. Du kannst ihn stoppen. Ein Sound überspringt diesen Schritt: „Komponieren“ öffnet das Formular von Stable Audio mit dem Satz."
        },
        {
          "title": "Den Prompt bearbeiten",
          "text": "Tags, Lyrics, Tempo, Tonart und Länge lassen sich direkt in den Feldern ändern."
        },
        {
          "title": "Erzeugen",
          "text": "„Erzeugen“ legt die Varianten in die Warteschlange der Engine, die die Engine startet, wenn sie an der Reihe sind, und öffnet „Erstellen“: Die Varianten erscheinen in der Sitzungsliste, benannt nach der Idee."
        }
      ],
      "writer": [
        "Der Prompt-Assistent ist ein lokales Sprachmodell, Qwen3.5. Er bleibt bei der Idee und schreibt die Lyrics in der Sprache der Idee oder der, die du wählst. Sein Modell wird auf der Seite „Modelle“ heruntergeladen.",
        "Für ACE-Step kann auch das eigene Sprachmodell von ACE-Step den Prompt schreiben, solange die Engine läuft. Es ist schneller, meist 5–20 s, weicht aber öfter von der Idee ab.",
        "Die Sprache der Lyrics wird standardmäßig an den Buchstaben der Idee erkannt; du kannst sie unter „Mehr“ wählen, ebenso wer den Prompt schreibt. Auf der Seite „Erstellen“ steht sie unter den Einstellungen der Ideenzeile."
      ],
      "after": [
        "Eine weitere Variante schreibt den Prompt aus derselben Idee neu.",
        "„Im Formular öffnen“ trägt den Prompt mit allen Einstellungen in das Formular der Engine auf der Seite „Erstellen“ ein.",
        "Die Idee und der Prompt bleiben, wenn du die Seite verlässt oder neu lädst. Nach „Erzeugen“ werden sie für die nächste Idee geleert; „Zurücksetzen“ leert sie von Hand.",
        "Auf der Seite „Erstellen“ sitzt dieselbe Idee in der Ideenzeile über dem Formular: „Schreiben“ trägt Lyrics und Stil direkt ins Formular ein („Beschreiben“ bei Stable Audio), und „Das Vorherige zurückholen“ stellt das Formular wieder her."
      ],
      "tips": [
        "Konkretes schlägt allgemeine Worte: „ein Nachtzug aus einer Kleinstadt“ gibt mehr her als „ein trauriges Lied“.",
        "Du willst ein bestimmtes Genre, eine Stimme oder Instrumente? Nenne sie in der Idee.",
        "Lies die Lyrics vor dem Erzeugen: Ein kleines Modell trifft Reim und Metrum nicht immer.",
        "Nicht der gewünschte Klang? Probiere dieselbe Idee mit einer anderen Engine: Der Prompt wird in deren Format neu geschrieben.",
        "Regen, ein Schlag, Schritte sind Sounds, keine Musik: Wähle „Sound“, und der Satz geht direkt in das Formular von Stable Audio. Bei „Instrumental“ und Stable Audio 3 erkennt der Assistent selbst, dass ein Sound gewünscht ist; ACE-Step macht aus einer solchen Idee einen Titel."
      ]
    }
  },
  "sa3Weights": {
    "allOnModels": "Alle Modelle, die Base-Checkpoints und die Einstellungen stehen auf der Seite „Modelle“"
  },
  "autoTitle": {
    "accept": "Übernehmen",
    "another": "Noch einer",
    "bulk": "Titel vorschlagen",
    "bulkDone": "{n} Track benannt | {n} Tracks benannt",
    "bulkFailed": "{n} benannt, dann abgebrochen: {error} | {n} benannt, dann abgebrochen: {error}",
    "bulkHint": "Der Assistent benennt die ausgewählten Tracks nacheinander; „Rückgängig“ bringt die alten Titel zurück.",
    "bulkStopped": "Gestoppt: {n} von {total} benannt",
    "bulkUndone": "Alter Titel wiederhergestellt | Alte Titel wiederhergestellt: {n}",
    "cancel": "Abbrechen",
    "failed": "Mir ist kein Titel eingefallen: {error}",
    "noAssistant": "Der Prompt-Assistent ist nicht bereit: Lade sein Modell unter „Modelle“ herunter.",
    "progress": "Benenne {done} von {total}",
    "stop": "Stopp",
    "suggest": "Titel vorschlagen",
    "working": "Überlege mir einen Titel…"
  },
  "covers": {
    "alt": "Cover von {title}",
    "another": "Anderes Cover",
    "bulk": "Cover erstellen",
    "bulkDone": "{n} Cover erstellt | {n} Cover erstellt",
    "bulkFailed": "{n} hat nicht geklappt",
    "bulkHint": "Ein Cover für jeden ausgewählten Track, nacheinander; ein Track, der schon eins hat, bekommt ein neues.",
    "bulkProgress": "Cover: {done} von {total}",
    "cancel": "Abbrechen",
    "describe": "Was das Bild zeigt",
    "describeHint": "Eine Szene in wenigen Worten; Englisch funktioniert am besten. Text im Bild wird von selbst vermieden.",
    "dismiss": "Schließen",
    "edit": "Beschreibung bearbeiten…",
    "enable": "Albumcover für Tracks erstellen",
    "enableHint": "Fügt jedem Song in der Bibliothek, im Player und in der Session ein Bild hinzu. Aus: keine Cover und nirgends Cover-Schaltflächen.",
    "engine": "Cover (Z-Image Turbo)",
    "failed": "Das Cover hat nicht geklappt: {error}",
    "fromAssistant": "Aus der Idee des Assistenten für diesen Track.",
    "installed": "installiert",
    "loadingPrompt": "Lese die Beschreibung…",
    "make": "Cover erstellen",
    "making": "Erstelle das Cover…",
    "makingPct": "Erstelle das Cover… {pct} %",
    "model": "Modell: Z-Image Turbo, {gb} GB",
    "notInstalled": "nicht installiert",
    "notInstalledHint": "Das Cover-Modell ist nicht auf diesem Computer. Installiere es mit dem Installer (Teil „Cover“) oder dem Setup-Skript.",
    "onButton": "Ein Cover wird nur erstellt, wenn du eine Schaltfläche drückst: in den Details eines Tracks in der Bibliothek oder für die ausgewählten Tracks. Jedes dauert 5 bis 10 Sekunden; in dieser Zeit wechselt die GPU zum Cover-Modell, und der nächste Song lädt seine Engine wieder.",
    "parts": {
      "main": "Z-Image Turbo Gewichte",
      "server": "Bildserver (stable-diffusion.cpp)"
    },
    "queued": "Wartet in der Warteschlange…",
    "remove": "Cover entfernen",
    "removeConfirm": "Ja, entfernen",
    "stop": "Stopp",
    "title": "Cover",
    "draw": "Zeichnen",
    "withAssistant": "Mit dem Assistenten machen",
    "withAssistantHint": "Der Prompt-Assistent schreibt eine Beschreibung aus deinem Text (in jeder Sprache) oder, bei leerem Feld, aus dem Song; du kannst sie vor dem Zeichnen bearbeiten.",
    "putBack": "Zurücksetzen",
    "anyLanguageHint": "Schreib in jeder Sprache: Der Assistent macht daraus eine Beschreibung, die das Bildmodell versteht.",
    "fromSaved": "Die Beschreibung, nach der das letzte Cover gezeichnet wurde.",
    "noAssistant": "Der Prompt-Assistent ist nicht bereit: Lade sein Modell unter Modelle herunter.",
    "describing": "Beschreibe das Bild…",
    "describingPct": "Beschreibe das Bild… {pct}%",
    "describeFailed": "Der Assistent konnte das Bild nicht beschreiben: {error}",
    "bulkDescribing": "Beschreibe {done} von {total}",
    "starting": "Starte das Bildmodell…"
  },
  "takeCompare": {
    "best": "★ Beste",
    "failed": "Konnte nicht geladen werden",
    "keep": "Die beste behalten, die anderen in den Papierkorb legen",
    "keepConfirm": "{n} Variante in den Papierkorb legen? | {n} Varianten in den Papierkorb legen?",
    "keepNeedStar": "Markiere die beste Variante mit einem Stern, um sie zu behalten.",
    "keepTooMany": "Markiere nur eine Variante mit einem Stern: die, die bleibt.",
    "keepWill": "Behält {take}; die andere kommt in den Papierkorb. | Behält {take}; die anderen {n} kommen in den Papierkorb.",
    "kept": "{take} behalten; {n} Variante in den Papierkorb gelegt. | {take} behalten; {n} Varianten in den Papierkorb gelegt.",
    "keys": "1–4 Variante wählen · Leertaste Wiedergabe/Pause · ←/→ 5 s · Esc schließen",
    "loading": "Lädt…",
    "loadingAll": "lade die Varianten…",
    "newestOf": "Die {shown} neuesten von {total} Varianten",
    "nowHearing": "Läuft gerade: {take}",
    "open": "Vergleichen",
    "openTitle": "Die Varianten dieses Songs vergleichen, A/B",
    "position": "{at} von {total}",
    "restored": "{n} Variante wiederhergestellt | {n} Varianten wiederhergestellt",
    "seed": "Seed {seed}",
    "seek": "Position",
    "takes": "Varianten",
    "tileLabel": "{letter}, Variante {n}",
    "title": "Varianten vergleichen"
  }
}
