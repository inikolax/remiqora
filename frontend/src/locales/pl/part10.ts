// Strings added after the first translation (machine-translated from en, 743 keys);
// merged into the other parts key by key (see ../mergeParts).
export default {
  "aceGen": {
    "addLora": "Dodaj LoRA",
    "cfgIntervalOrder": "Guidance „od” musi być mniejsze niż „do”.",
    "lengthAskedNote": "Długość trafia do modelu jako życzenie. Kliknij wybraną ponownie, aby zostawić ją modelowi.",
    "lengthByModelNote": "Przy opisie model sam wybiera długość. Wybierz ją tutaj, aby poprosić o swoją.",
    "loraName": "Nazwa LoRA",
    "loraPath": "Folder adaptera LoRA",
    "manual": {
      "adg": "Adaptacyjne guidance (ADG)",
      "balancedOnly": "w trybie Zrównoważonym",
      "baseOnly": "tylko modele base i SFT",
      "bpm": "Tempo",
      "cfgEnd": "Guidance do (część drogi)",
      "cfgStart": "Guidance od (część drogi)",
      "cotCaption": "Rozbuduj opis",
      "cotCaptionHint": "Włączone: model językowy może przepisać Twój tekst stylu, zanim powstanie muzyka.",
      "cotLanguage": "Wykryj język",
      "cotLanguagePicked": "wyłączone: wybrany język zostaje",
      "coverNoise": "Szum domieszany do źródła",
      "coverRepaintOnly": "dla covera lub przemalowania",
      "infer": "Metoda dekodowania",
      "latentCrossfade": "Szew wewnątrz modelu",
      "length": "Długość",
      "lmCfg": "Zgodność z promptem",
      "lmNegative": "Czego unikać",
      "lmSub": "pisze plan utworu i uzupełnia braki",
      "lmTitle": "Model językowy",
      "loraScale": "Siła LoRA",
      "metaByModel": "model wybiera to z opisu",
      "musicSub": "co wiadomo o utworze z góry",
      "musicTitle": "Muzyka",
      "myLoras": "Moje LoRA: {n}",
      "needRef": "z utworem referencyjnym",
      "noLm": "ACE-Step nie ładuje go na tym GPU",
      "noLmWithRef": "nie jest używany z utworem referencyjnym",
      "ode": "ODE: powtarza się dokładnie",
      "off": "wyłączone",
      "pickLora": "najpierw wybierz LoRA",
      "refSub": "cover i przemalowanie",
      "refTitle": "Utwór referencyjny",
      "repaintMode": "Tryb przemalowania",
      "repaintModes": {
        "aggressive": "Śmiały",
        "balanced": "Zrównoważony",
        "conservative": "Ostrożny"
      },
      "repaintOnly": "do przemalowania zakresu",
      "repaintStrength": "Siła przemalowania",
      "resultSub": "jak to oddać",
      "sde": "SDE: z losowością",
      "sdeBaseWarn": "Na modelu base SDE dało w teście szum zamiast muzyki (32 kroki). Na Turbo działa, z ciemniejszym brzmieniem.",
      "shift": "Przesunięcie harmonogramu",
      "thinking": "Najpierw plan (thinking)",
      "tiled": "Dekoduj fragmentami",
      "turboSteps": "Turbo przyjmuje od 1 do 8 kroków: więcej jest ucinane do 8",
      "wavCrossfade": "Szew w dźwięku"
    },
    "modeDescribe": "Z opisu",
    "modeLabel": "Od czego zacząć",
    "modeOwn": "Własny tekst i styl",
    "modelNote": "Turbo używa 8 kroków. Inne modele trwają dłużej; usunięcie lub dodanie partii nie działa we wszystkich, a zadania, których model nie potrafi, są wyszarzone w zakładce Z utworu.",
    "noLmBaseNote": "Base i SFT opierają się na tym modelu przy czystym wokalu: w tym trybie głos może brzmieć szumiąco i daleko. Dla wokalu przełącz na Własny tekst i styl i napisz tekst albo wybierz Turbo.",
    "noLmNote": "Na tej karcie graficznej (8 GB lub mniej) ACE-Step nie ładuje swojego modelu językowego, więc Twój opis trafia do modelu jako zwykły prompt stylu, bez napisanego tekstu.",
    "noVocal": "Bez wokalu",
    "noVocalHint": "Utwór instrumentalny: tekst niepotrzebny, muzykę wyznacza styl poniżej.",
    "queuedStatus": "W kolejce, wersji: {n}",
    "refFile": "Plik audio referencyjny",
    "refOff": "Włącz, aby pracować na gotowym utworze: cover, przerobiony zakres, usunięta lub dodana partia.",
    "removeLoraConfirm": "Usunąć?",
    "removeLoraNamed": "Usuń LoRA {name}",
    "repaintOrder": "Koniec zakresu musi być po jego początku.",
    "simple": {
      "auto": "auto",
      "fast": "szybkie {n}",
      "formatHint": "mp3 zajmuje mniej miejsca; wav i flac zachowują dźwięk bez strat.",
      "key": "Tryb",
      "keyHint": "Dur brzmi jaśniej, moll ciemniej i smutniej. Tonikę i inne skale wybiera się w trybie Ręcznym.",
      "keyWish": "Przy opisie model sam wybiera tonację. Wybrany tu tryb trafia do niego jako życzenie.",
      "lengthHint": "Jak długo trwa utwór.",
      "lengthWish": "Przy opisie model sam wybiera długość. Wybrana tu trafia do niego jako życzenie, nie gwarancja.",
      "major": "dur",
      "medium": "średnie {n}",
      "minor": "moll",
      "slow": "wolne {n}",
      "tempo": "Tempo",
      "tempoHint": "Uderzenia na minutę. „Auto” zostawia to modelowi; dokładną liczbę ustawia się w trybie Ręcznym.",
      "tempoWish": "Przy opisie model sam wybiera tempo. Wybrane tu trafia do niego jako życzenie."
    },
    "tabChanged": "zmieniono",
    "tabs": {
      "ref": "Z utworu",
      "song": "Piosenka",
      "tuning": "Ustawienia"
    },
    "taskType": "Co zrobić z utworem",
    "taskUnsupported": "Nieobsługiwane przez ten model",
    "help": {
      "style": {
        "tips": [
          "Optymalnie jest 5–9 tagów: przy mniejszej liczbie model sam wypełnia luki i wynik jest mniej przewidywalny; przy większej tagi zaczynają ze sobą kolidować.",
          "Najpierw podaj gatunek i nastrój: kształtują ogólny charakter utworu bardziej niż pozostałe tagi.",
          "Nie mieszaj sprzecznych tagów w jednej kategorii (np. „agresywny” i „rozmarzony” naraz): model zignoruje jeden z nich albo wynik będzie zamazany.",
          "Lepiej pisać tagi po angielsku: dane treningowe są w większości angielskie, więc trafność jest wyższa, nawet jeśli tekst jest po rosyjsku.",
          "Tempo ustawione w Ustawieniach (w trybie Prostym albo jako dokładna liczba w Ręcznym) jest pewniejsze niż tag tekstowy typu „120 bpm” w stylu: użyj go, gdy tempo ma znaczenie."
        ]
      },
      "lyrics": {
        "tips": [
          "Dopasuj do długości utworu: ~2 minuty zwykle wystarczą na 2 zwrotki + 2 refreny; przy 3+ minutach dodaj bridge i drugi hook. Tekst zbyt długi na krótki czas model „upchnie” na siłę.",
          "Krótkie wersy (5–10 sylab) wpadają w melodię bardziej przewidywalnie niż długie: jeśli wers się dłuży, podziel go na dwa.",
          "Powtarzający się refren (identyczny słowo w słowo tekst w każdym [Chorus]) pomaga modelowi utrzymać tę samą melodię refrenu w całym utworze.",
          "Dla utworu w pełni instrumentalnego zaznacz „Bez wokalu” zamiast pisać tekst złożony tylko z [Interlude]: jest to pewniejsze.",
          "Interpunkcja (przecinki, wielokropki) wpływa na frazowanie i pauzy w wokalu: używaj jej świadomie, a nie tylko według zasad ortografii."
        ]
      },
      "remix": {
        "unavailable": "Zestaw dostępnych scenariuszy zależy od wybranego modelu: nieobsługiwane opcje w formularzu są wyszarzone. Jeśli potrzebujesz konkretnego scenariusza, spróbuj innego modelu (w zakładce Piosenka lub w Ustawieniach). Wgraj plik referencyjny w formacie, z którego model potrafi wyciągnąć audio (wav/mp3/flac): bardzo długie pliki (kilka minut) mogą wyraźnie wydłużyć czas przetwarzania."
      },
      "advanced": {
        "title": "Ustawienia",
        "rows": [
          {
            "param": "Prosty i Ręczny",
            "what": "Prosty ma kilka jasnych wyborów: kroki dekodowania (nie na Turbo), długość, tempo (wolne 80, średnie 110, szybkie 140), tryb (dur lub moll) i format. Ręczny ma każdy parametr w grupach, a konsola pokazuje je wszystkie naraz."
          },
          {
            "param": "Format",
            "what": "Format pliku wynikowego. mp3 jest bardziej zwarty i wystarcza do słuchania; wav i flac są bezstratne, ale 5–10 razy większe."
          },
          {
            "param": "Tempo, tonacja, metrum",
            "what": "Jawne parametry muzyczne. Zostawione na auto, model bierze je z tekstu stylu; ustawiaj je ręcznie tylko wtedy, gdy liczy się dokładność (np. do miksowania z innymi utworami). Metrum to 2/4, 3/4, 4/4 lub 6/8. Przy opisie model sam je wybiera: ustawione tu tempo lub tonacja trafia do niego jako życzenie, a metrum zostaje jemu."
          },
          {
            "param": "Język wokalu",
            "what": "Język, w którym śpiewany jest wokal. Na auto jest brany z tekstu, co może zawieść przy krótkich lub niejednoznacznych tekstach: ustaw go, jeśli wokal wychodzi w złym języku. Język wybrany ręcznie zostaje, model językowy go nie zastępuje."
          },
          {
            "param": "Kroki dekodowania",
            "what": "Liczba kroków dyfuzji. Więcej może dać czystsze audio, ale wolniejsze generowanie; od pewnego momentu zysk jest ledwo słyszalny. Turbo przyjmuje od 1 do 8 (domyślnie 8), modele SFT 50, modele base 32. W trybie Prostym Więcej podwaja zwykłą liczbę."
          },
          {
            "param": "Zgodność ze stylem",
            "what": "Guidance scale: jak ściśle model trzyma się Twojego opisu. Wyższa wartość dokładniej podąża za tagami stylu, ale bardzo wysokie dają szorstki dźwięk pełen artefaktów; niższa jest bardziej naturalna, ale mniej przewidywalna. Turbo jej nie używa. Domyślnie 7, rozsądny zakres to zwykle 3 do 12."
          },
          {
            "param": "Seed",
            "what": "Pod formularzem, obok Utwórz. Przy wciśniętej kostce każda wersja dostaje nowy losowy seed. Liczba przy takich samych pozostałych ustawieniach prawie powtarza wynik: wygodne, gdy zmieniasz jeden tag stylu i porównujesz."
          },
          {
            "param": "Model",
            "what": "Turbo jest szybsze kosztem jakości i nie robi każdego zadania z zakładki Z utworu; base i SFT są wolniejsze, ale dokładniejsze i bardziej elastyczne. Model wybiera się w zakładce Piosenka lub w trybie Ręcznym."
          },
          {
            "param": "LoRA",
            "what": "Dostrojony dodatek do modelu, np. dla konkretnej barwy głosu lub podgatunku. Jego siła (od 0 do 1) określa, jak mocno wpływa na wynik: 1 to pełny efekt zamierzony przez autora adaptera, niżej wtapia się łagodniej. Adaptery dodaje się w Moje LoRA, w trybie Ręcznym, podając nazwę i folder."
          }
        ],
        "footer": "To, czego nie ruszysz, idzie z domyślną wartością silnika: nie trzeba ustawiać wszystkiego, by dostać dobry wynik. Reset przywraca własne wiersze ustawień i nie rusza modelu ani długości."
      }
    }
  },
  "aiPart": {
    "guide": {
      "scratch": [
        {
          "title": "Tempo, tonacja, długość",
          "text": "W pustym projekcie ustaw BPM i „Tonację”, a długość w sekundach w panelu. 64 takty przy 120 BPM to 128 sekund."
        },
        {
          "title": "Zacznij od perkusji",
          "text": "„Dodaj partię”, instrument „Perkusja”. Pozostałe partie trzymają rytm perkusji, więc ona idzie pierwsza."
        },
        {
          "title": "Bas, potem harmonia",
          "text": "Bas, potem akordy: klawisze, pad. Zostaw perkusję zaznaczoną na liście ścieżek, które słyszy model."
        },
        {
          "title": "Melodia i kolor",
          "text": "Lead, smyczki, perkusjonalia. Wystarczy pięć do siedmiu partii; przy większej liczbie miks robi się ciasny."
        },
        {
          "title": "Wybierz i ustaw głośność",
          "text": "Zostaw najlepszy wariant każdej partii i od razu zmniejsz jego głośność do odpowiedniego poziomu."
        },
        {
          "title": "Zbuduj piosenkę",
          "text": "Włącz „Magnes” i linijkę w taktach, tnij partie Nożem i usuwaj fragmenty Gumką: intro, część główna, przerwa bez perkusji i basu, zakończenie."
        }
      ],
      "scratchIntro": "Aranżer potrafi zbudować utwór z pustego projektu. Partie dodaje się po jednej, a każda kolejna słyszy już istniejące, więc kolejność ma znaczenie.",
      "scratchTitle": "Utwór od zera",
      "steps": [
        {
          "title": "Uruchom silnik",
          "text": "Aranżer działa na ACE-Step; przemalowanie, kontynuacja i cover mogą też działać na Stable Audio 3. Jeśli silnik jest zatrzymany, panel proponuje uruchomić go jednym przyciskiem, a silnik działający na GPU zostaje wtedy zatrzymany."
        },
        {
          "title": "Ustaw tempo i tonację",
          "text": "Przed pierwszą partią ustaw BPM projektu i „Tonację”: tonikę i skalę. Model dostaje je z każdym zapytaniem. Nie zmieniaj tempa po pierwszych partiach: wypadłyby z siatki."
        },
        {
          "title": "Wybierz tryb",
          "text": "„Dodaj partię”, „Przemaluj”, „Kontynuuj” lub „Cover”. Podpowiedź obok przełącznika w jednej linijce mówi, co zrobi model."
        },
        {
          "title": "Opisz, czego potrzebujesz",
          "text": "Dla nowej partii wybierz instrument. W opisie nazwij brzmienie i sposób grania. Pisz w swoim języku: „Na angielski” przepisze opis tak, jak model czyta go najlepiej. Znak „?” przy polu otwiera słowa i gotowe przykłady."
        },
        {
          "title": "Zaznacz, co słyszy model",
          "text": "Model dopasowuje się do zaznaczonych ścieżek. Zostaw perkusję: model idzie za jej siatką."
        },
        {
          "title": "Wskaż miejsce",
          "text": "Cały utwór albo zakres pętli: włącz „Pętlę” i przeciągnij zakres na linijce. „Przemaluj” działa tylko na zakresie pętli."
        },
        {
          "title": "Generuj i wybierz",
          "text": "Warianty trafiają na nowe ścieżki. „Słuchaj” przełącza na wariant, „Zachowaj” usuwa pozostałe."
        }
      ],
      "tips": [
        "Opis działa najlepiej po angielsku, jako krótkie frazy oddzielone przecinkami. Pisz w swoim języku i naciśnij „Na angielski”; przeczytaj wynik i w razie potrzeby popraw.",
        "Opisz jedną partię, nie cały utwór: co gra instrument i jak brzmi.",
        "Buduj utwór krok po kroku: perkusja, potem bas, harmonia i melodia. Każda następna partia słyszy poprzednie.",
        "Nie podoba Ci się wariant? Wygeneruj ponownie: każde uruchomienie używa nowych losowych seedów.",
        "Po każdej nowej partii ustaw jej głośność, zanim dodasz kolejną: następna partia słyszy miks takim, jaki jest teraz.",
        "Gdy partie są gotowe, zbuduj z nich utwór: tnij ścieżki na taktach Nożem (C) i usuwaj fragmenty Gumką (E), aby instrumenty wchodziły jeden po drugim.",
        "Przy wokalu wpisz tekst i sprawdź „Język wokalu”: przy „Auto” jest rozpoznawany po literach.",
        "ACE-Step wyrównuje każdy wynik do -1 dBFS, więc nowa partia przychodzi głośno: ścisz ją suwakiem głośności ścieżki.",
        "Aby dokończyć utwór w innym DAW, wyeksportuj „Stemy + Reaper” albo DAWproject.",
        "Przemalowanie, kontynuacja i cover mogą też działać na Stable Audio 3: wybierz go jako silnik w panelu. Uzupełnia i kontynuuje, słuchając dźwięku wokół zakresu, w kilka sekund, tylko podkłady. Dodawanie partii zostaje przy ACE-Step."
      ]
    },
    "toEnglish": "Na angielski",
    "toEnglishBusy": "Piszę…",
    "toEnglishDone": "Asystent przepisał to po angielsku; w razie potrzeby popraw.",
    "toEnglishFailed": "Asystent nie zdołał napisać opisu.",
    "toEnglishGpu": "Asystent promptów jest ustawiony na GPU i wyładowałby model. Przełącz go na Auto lub CPU na stronie Modele.",
    "toEnglishTitle": "Opisz w dowolnym języku: asystent promptów przepisze to po angielsku, tak jak model czyta najlepiej",
    "toEnglishUndo": "Cofnij"
  },
  "create": {
    "closeTool": "Zamknij",
    "deleteAsk": "Usunąć?",
    "details": "Szczegóły",
    "download": "Pobierz",
    "emptyAll": "Tutaj pojawią się Twoje piosenki",
    "emptyHint": "Wybierz silnik, wypełnij formularz albo napisz jedno zdanie w linii pomysłu nad nim i naciśnij Utwórz.",
    "emptyPeriod": "W tym okresie nic nie powstało",
    "engine": "Silnik",
    "engineTitle": "{name}: {status}",
    "engines": {
      "ace_step": "Szybki, covery",
      "stable_audio": "Dźwięki i pętle",
      "yue2": "Piosenki z wokalem"
    },
    "failed": "Nie wyszło. Wczytaj to do formularza i naciśnij Utwórz jeszcze raz.",
    "idea": {
      "chip": {
        "description": "Opis",
        "length": "Długość",
        "lyrics": "Tekst",
        "style": "Styl",
        "tempo": "Tempo i tonacja"
      },
      "describe": "Opisz",
      "dismiss": "Odrzuć",
      "formChanged": "Formularz został zmieniony.",
      "noAssistant": "Asystent promptów nie jest gotowy: pobierz jego model w Modele i ustawienia (koło zębate w nagłówku).",
      "noAssistantLink": "Pobierz w Modelach",
      "noAssistantNote": "Asystent promptów potrzebuje swojego modelu.",
      "placeholder": {
        "ace_step": "W jednym zdaniu: jakiej muzyki chcesz",
        "stable_audio": "W jednym zdaniu: co ma zabrzmieć",
        "yue2": "W jednym zdaniu: o czym jest piosenka"
      },
      "replaces": "Zastępuje to, co jest teraz w formularzu",
      "settings": "Ustawienia",
      "stop": "Stop",
      "stopping": "Zatrzymuję…",
      "undo": "Przywróć to, co było",
      "write": "Napisz tekst i styl",
      "writeSa": "Napisz opis",
      "writeShort": "Napisz",
      "writing": "Asystent pisze…",
      "written": "Wpisano do formularza poniżej.",
      "writtenOther": "Wpisano do formularza {name}.",
      "saKind": "Pisz",
      "saKinds": {
        "auto": "Auto: według pomysłu",
        "music": "Utwór muzyczny",
        "instrument": "Instrument solo",
        "one_shot": "Sampel one-shot",
        "sfx": "Efekt dźwiękowy"
      }
    },
    "lessDetails": "Mniej",
    "live": {
      "failed": "Wersja nie wyszła: {name}. {reason}",
      "queue": "Wersji w kolejce: {n}",
      "ready": "Wersja gotowa: {name}",
      "readyMany": "Wersje gotowe: {n}, {name}"
    },
    "loading": "Wczytuję utwory…",
    "making": "Tworzenie",
    "menu": {
      "made": "Utworzono {when}, długość {len}",
      "midi": "Do MIDI",
      "rename": "Zmień nazwę",
      "stems": "Rozdziel na stemy",
      "took": "zajęło {s} s"
    },
    "models": "Modele",
    "more": "Szczegóły i akcje",
    "pause": "Pauza",
    "peek": {
      "copied": "Skopiowano",
      "copy": "Kopiuj",
      "lines": "{n} wersów",
      "lyrics": "Tekst",
      "noLyrics": "Brak tekstu",
      "style": "Styl",
      "tags": "{n} tagów"
    },
    "period": "Okres",
    "periodHint": {
      "all": "Wszystko, co powstało do tej pory.",
      "today": "Wersje zrobione dziś. Oznaczone gwiazdką trafiają do Ulubionych w bibliotece.",
      "week": "Wersje z ostatnich siedmiu dni."
    },
    "periods": {
      "all": "Wszystko",
      "today": "Dziś",
      "week": "7 dni"
    },
    "play": "Odtwórz",
    "position": "Pozycja w utworze",
    "queued": "W kolejce",
    "reuse": "Wczytaj do formularza",
    "reuseInForm": "Wczytaj do formularza",
    "session": "Sesja",
    "showAll": "Pokaż wszystko: {n}",
    "showMore": "Pokaż więcej: {n}",
    "startAndCreate": "Uruchom {name} i utwórz",
    "startFailed": "{name} się nie uruchomił.",
    "startingEngine": "Uruchamiam {name}…",
    "startsOnCreate": "{name} nie działa teraz. Uruchomi się po naciśnięciu Utwórz; pierwsza wersja po uruchomieniu trwa dłużej.",
    "startsOnCreateOther": "{other} zajmuje teraz GPU. {name} uruchomi się po naciśnięciu Utwórz, a {other} zostanie zatrzymany. Pierwsza wersja po uruchomieniu trwa dłużej.",
    "stop": "Stop",
    "stopAsk": "Zatrzymać?",
    "stopConfirm": "Naciśnij ponownie, aby zatrzymać: to, co powstało do tej pory, przepadnie",
    "stopped": "Zatrzymano.",
    "styleAndLyrics": "Styl i tekst",
    "takeN": "Wersja {n}",
    "takeTitle": "{title}, wersja {n}",
    "takes": "Wersje: {n}",
    "toSession": "Do listy sesji, wersji: {n}",
    "untitled": "Bez tytułu",
    "wholeLibrary": "Cała biblioteka"
  },
  "favorite": {
    "add": "Dodaj do ulubionych",
    "remove": "Usuń z ulubionych"
  },
  "header": {
    "create": "Utwórz",
    "desc": {
      "create": "Piosenki, utwory instrumentalne i dźwięki",
      "library": "Wszystkie utwory: stworzone, wgrane i z edytora"
    },
    "gpuFree": "GPU wolne",
    "home": "Start",
    "languageCurrent": "Język interfejsu: {name}",
    "library": "Biblioteka",
    "more": "Więcej: język, modele, pomoc",
    "guide": {
      "mapTitle": "Części aplikacji",
      "map": {
        "idea": "Najprostsze wejście, tuż na stronie startowej: jedno zdanie i Komponuj, a lokalny model językowy pisze prompt dla silnika. Edytuj go i wygeneruj utwór.",
        "lora": "Dostrój ACE-Step na własnych utworach: wgraj audio, oznacz automatycznie, sprawdź opisy, wytrenuj i wyeksportuj. Otwiera się na stronie Utwórz, pod ACE-Step; gotowy adapter pojawia się w formularzu ACE-Step.",
        "yue": "Drugi silnik: pisze całą piosenkę z wokalem i potrafi zbudować ją wokół podanej melodii (zakładka Melodia, z SheetSage2). Zamienia też utwór na MIDI."
      },
      "gpu": [
        "Silniki nie mieszczą się razem na GPU, więc działa jeden naraz. Silnik wybiera się na stronie Utwórz i uruchamia po naciśnięciu Utwórz w jego formularzu; działający zostaje zatrzymany.",
        "Pierwsze uruchomienie trwa kilka minut, gdy model ładuje się do pamięci wideo. Przycisk stanu w nagłówku pokazuje silnik na GPU i zapełnienie pamięci wideo; kliknięcie pokazuje, kto ile zajmuje, przycisk Wyładuj i drogę do Modeli.",
        "Wyładowanie przerywa trwające generowanie lub trening, dlatego przycisk najpierw pyta."
      ],
      "steps": [
        {
          "title": "Otwórz ACE-Step",
          "text": "Przejdź do Utwórz i wybierz ACE-Step. Uruchamia się przy pierwszym naciśnięciu Utwórz; pierwsze uruchomienie trwa kilka minut."
        },
        {
          "title": "Opisz piosenkę",
          "text": "W zakładce Piosenka, Z opisu: wystarczy kilka zdań, gatunek, nastrój, o czym jest tekst. Wybierz długość i liczbę wersji."
        },
        {
          "title": "Wybierz najlepszą wersję",
          "text": "Wersje ustawiają się na liście sesji obok formularza (pod nim na telefonie). Wszystko, co powstało, samo trafia do biblioteki."
        },
        {
          "title": "Rozdziel na stemy",
          "text": "Wokal, perkusja, bas i reszta jednym kliknięciem: Rozdziel na stemy w menu wersji, zakładka Stemy i nuty w bibliotece albo wprost w edytorze."
        },
        {
          "title": "Zbuduj w edytorze",
          "text": "Ułóż stemy na ścieżkach, dodaj partie aranżerem AI, ustaw efekty."
        },
        {
          "title": "Eksportuj",
          "text": "Zgraj do WAV lub MP3 albo wyeksportuj ścieżki z projektem Reaper lub DAWproject."
        }
      ],
      "compare": [
        {
          "label": "Najlepszy do",
          "ace": "Szybkich piosenek i utworów instrumentalnych, wielu wariantów pod rząd",
          "yue": "Całej piosenki z wokalem za jednym razem",
          "sa3": "Utworów instrumentalnych, efektów dźwiękowych i sampli; uzupełnia i kontynuuje audio w edytorze"
        },
        {
          "label": "Praca na utworze",
          "ace": "Cover, przemalowanie fragmentu, dodanie partii, wyciągnięcie partii, kontynuacja",
          "yue": "Piosenka do melodii innego utworu: zakładka Melodia, z SheetSage2 lub plikiem MIDI",
          "sa3": "Przemalowanie zakresu, kontynuacja, cover w innym stylu (audio na audio); bez partii nad miksem"
        },
        {
          "label": "Własny styl",
          "ace": "LoRA wytrenowane na Twoich utworach",
          "yue": "Nie",
          "sa3": "Nie (obsługa LoRA jest planowana)"
        },
        {
          "label": "Długość",
          "ace": "Od 10 do 300 sekund, 1, 2 lub 4 wersje na przebieg",
          "yue": "Tak długo, jak trwa tekst, albo od 1 do 8 minut; od 1 do 4 wersji na przebieg",
          "sa3": "Do 6 minut (medium) lub 2 minut (small); 1, 2 lub 4 wersje na przebieg, sekundy na przebieg"
        },
        {
          "label": "MIDI",
          "ace": "Nie",
          "yue": "Utwór lub stem do MIDI (MuScriptor)",
          "sa3": "Nie"
        },
        {
          "label": "Licencja",
          "ace": "MIT: użycie komercyjne dozwolone; przed publikacją sprawdź aktualne warunki",
          "yue": "Tylko użycie niekomercyjne",
          "sa3": "Stability AI Community License: za darmo poniżej 1 mln USD rocznie; tylko instrumentalnie, bez wokalu"
        }
      ]
    },
    "helpSections": {
      "idea": {
        "title": "Komponowanie z pomysłu",
        "text": "Na stronie startowej opisz piosenkę, utwór instrumentalny lub dźwięk w jednym lub dwóch zdaniach i wybierz silnik; język tekstu i to, kto pisze prompt, są pod Więcej. W Komponuj asystent promptów, lokalny model Qwen3.5, pisze prompt w formacie silnika: tagi stylu, tekst w sekcjach, tempo i tonację. Edytuj go, generuj albo otwórz w formularzu silnika. Dźwięk omija asystenta i trafia prosto do Stable Audio. Na stronie Utwórz ten sam pomysł leży w linii pomysłu nad formularzem i pisze prosto do niego. Model i urządzenie asystenta ustawia się w Modele i ustawienia."
      },
      "engines": {
        "text": "Dźwięk generują trzy silniki, ACE-Step 1.5, YuE2-3B i Stable Audio 3, i nie mieszczą się razem na jednym GPU, więc działa jeden naraz. Wybierz silnik na stronie Utwórz: uruchamia się po naciśnięciu Utwórz, a działający zatrzymuje się sam. Kontrolka pokazuje jego stan; pierwsze uruchomienie może trwać kilka minut, gdy model ładuje się do pamięci wideo. Przycisk stanu w nagłówku pokazuje, co zajmuje GPU, i może to wyładować."
      },
      "ace": {
        "text": "W zakładce Piosenka opisz muzykę prostymi słowami (Z opisu) albo podaj tagi stylu i tekst ze znacznikami [Verse] / [Chorus] (Własny tekst i styl), albo zaznacz Bez wokalu. W zakładce Z utworu utwór referencyjny pozwala zrobić cover, przemalować fragment, wyciągnąć lub dodać partię albo dokończyć kompozycję. Długość to 10-300 s, z 1, 2 lub 4 wersjami na przebieg. Ustawienia mają tryb Prosty (kroki, długość, tempo, tryb, format) i Ręczny (każdy parametr); wytrenowane LoRA włącza się tam, z siłą od 0 do 1."
      },
      "yue": {
        "text": "YuE2-3B pisze całe piosenki z wokalem. Zakładka Piosenka zawiera tekst, styl, długość i jakość. Zakładka Melodia ustawia plan melodii: Bez planu idzie prosto do audio, Podążaj za melodią zachowuje podaną melodię i dopisuje akompaniament, Melodia i akordy najpierw pisze plan obu. SheetSage2 (Z utworu…) zapisuje melodię utworu jako zapis ABC, który można edytować i oddać z powrotem do YuE2."
      },
      "sa3": {
        "text": "Stable Audio 3 w kilka sekund tworzy muzykę instrumentalną i efekty dźwiękowe z opisu: wybierz Muzykę lub Dźwięk, opisz to tak, jak zrobiłaby to biblioteka sampli (gatunek, instrumenty, nastrój, tempo albo źródło dźwięku i sposób jego powstania), ustaw długość i liczbę wersji. Nie ma wokalu. Ten sam silnik obsługuje aranżer AI i Samples w edytorze, gdzie przemalowuje, kontynuuje i robi covery, słuchając audio po obu stronach zakresu. Główne wagi są objęte ograniczonym dostępem: zaakceptuj licencję na Hugging Face, zapisz token i pobierz model w Modele i ustawienia."
      },
      "lora": {
        "text": "Trening LoRA jest pod ACE-Step na stronie Utwórz, obok Generuj (na telefonie jako przełącznik nad formularzem). Trening wymaga działającego ACE-Step, a strona proponuje jego uruchomienie. Prowadzi przez cały proces dostrajania: wgranie audio, automatyczne oznaczanie, przegląd i edycja opisów, przetwarzanie wstępne, trening z postępem na żywo i eksport. Gotowy adapter trafia na listę LoRA w formularzu ACE-Step."
      },
      "stems": {
        "text": "Każdy zapisany utwór można jednym kliknięciem rozdzielić na cztery stemy (wokal, perkusja, bas, reszta): Rozdziel na stemy w menu wersji, zakładka Stemy i nuty w bibliotece albo ścieżka w edytorze. Stemy można otworzyć w edytorze jako gotowy projekt z czterema ścieżkami. Transkrypcja MIDI (MuScriptor) działa na pełnym miksie lub pojedynczym stemie; działa na silniku YuE2, więc YuE2 musi być zainstalowany."
      },
      "arranger": {
        "text": "Przycisk „Aranżer AI” w edytorze buduje utwór krok po kroku zamiast generować go w całości. „Dodaj partię” pisze nową partię (perkusja, bas, pad, smyczki itd.) na wybranych ścieżkach, „Przemaluj” przepisuje słaby zakres, „Kontynuuj” przedłuża utwór, „Cover” robi nową wersję w innym stylu. Każdy wariant ląduje na osobnej ścieżce: posłuchaj, zostaw najlepszy i przejdź do następnej partii. Partie dodaje model bazowy ACE-Step (około 4.8 GB) albo jego większa wersja bazowa XL (około 20 GB, wymaga karty 16 GB); oba są opcjonalne, a bez modelu bazowego aranżer proponuje jego instalację. Pozostałe tryby działają na turbo albo na Stable Audio 3, gdy wybierzesz go jako silnik: uzupełnia, kontynuuje i robi covery, słuchając otaczającego audio, tylko instrumentalnie."
      },
      "sfx": {
        "text": "Przycisk „Samples” w edytorze tworzy one-shoty (stopa, uderzenie, whoosh), pętle w tempie projektu i tekstury (deszcz, tłum, drone) w Stable Audio 3 z krótkiego opisu. Wyniki układają się w pasku: najpierw posłuchaj, potem dodaj wybrany na nową ścieżkę lub na zaznaczoną ścieżkę w miejscu kursora odtwarzania. Pętle są ucinane do pełnych taktów, ale model nie gwarantuje bezszwowego łączenia, więc sprawdź je w powtarzaniu. „Usuń z listy” kasuje dźwięki zadania z biblioteki i z dysku, z wyjątkiem tych, które w tej chwili leżą na ścieżce."
      }
    }
  },
  "home": {
    "allTracks": "Cała biblioteka",
    "compose": "Komponuj",
    "composeHere": "Asystent pisze prompt dla wybranego silnika; przed generowaniem możesz go edytować",
    "composeSound": "Asystent napisze prompt dźwięku z długością, a Stable Audio go stworzy",
    "engineLabel": "Silnik",
    "engines": "Albo przejdź od razu do silnika",
    "firstText": "Opisz piosenkę albo weź przykład:",
    "firstTitle": "Tutaj pojawią się Twoje utwory",
    "guide": "Jak działa komponowanie",
    "kind": {
      "instrumental": "Instrumentalny",
      "song": "Piosenka z wokalem",
      "sound": "Dźwięk"
    },
    "kindLabel": "Co stworzyć",
    "lead": "Wszystko działa na tym komputerze",
    "loading": "Wczytuję utwory",
    "more": "Więcej",
    "needPhrase": "Najpierw opisz muzykę",
    "title": "Co tworzymy?",
    "phraseLabel": "Opisz muzykę",
    "placeholderSound": "deszcz na blaszanym dachu nocą, blisko i spokojnie",
    "soundBySa3": "Dźwięki tworzy Stable Audio",
    "soundMissing": "Stable Audio nie jest zainstalowany"
  },
  "keyScale": {
    "hint": "ACE-Step zna tylko dur i moll. Dla tej skali dostaje najbliższą tonację ({key}) i nazwę skali w opisie: podpowiedź, nie gwarancja.",
    "mode": "Skala",
    "modes": {
      "blues": "Bluesowa",
      "dorian": "Dorycka",
      "double_harmonic": "Podwójna harmoniczna",
      "harmonic_minor": "Moll harmoniczna",
      "hungarian_minor": "Moll węgierska",
      "locrian": "Lokrycka",
      "lydian": "Lidyjska",
      "major": "Dur (jońska)",
      "major_pentatonic": "Pentatonika durowa",
      "melodic_minor": "Moll melodyczna",
      "minor": "Moll naturalna (eolska)",
      "minor_pentatonic": "Pentatonika molowa",
      "mixolydian": "Miksolidyjska",
      "phrygian": "Frygijska",
      "phrygian_dominant": "Frygijska dominanta"
    },
    "needTonic": "Najpierw wybierz dźwięk tonacji",
    "none": "Nie ma takiej skali",
    "notSet": "nie ustawiono",
    "search": "Wpisz, aby szukać",
    "tonic": "Tonika"
  },
  "libraryPage": {
    "aiPart": "Partia od aranżera AI",
    "collectionName": "Nazwa kolekcji",
    "confirmDeleteCollection": "Usunąć kolekcję?",
    "cot": {
      "full": "melodia i akordy",
      "melody": "podąża za melodią"
    },
    "delete": "Usuń",
    "deleteCollection": "Usuń kolekcję (utwory zostają)",
    "deleteFailed": "Nie udało się usunąć: {error}",
    "emptyCollection": "Otwórz utwór i dodaj go do tej kolekcji w zakładce O utworze.",
    "emptyFavorites": "Oznacz utwór gwiazdką, a pojawi się tutaj.",
    "emptyHere": "Na razie nic tu nie ma",
    "emptyHint": "Utwory, które tworzysz i wgrywasz, gromadzą się tutaj.",
    "facts": {
      "file": "Plik",
      "madeIn": "Utworzono w",
      "melody": "Melodia",
      "model": "Model"
    },
    "filters": {
      "all": "Wszystkie utwory",
      "favorites": "Ulubione",
      "midi": "Nuty (MIDI)",
      "score": "Zapis nutowy",
      "stems": "Stemy",
      "today": "Dziś"
    },
    "filtersLabel": "Filtry biblioteki",
    "groups": {
      "collections": "Kolekcje",
      "has": "Co ma utwór",
      "origin": "Utworzone przez",
      "tags": "Tagi"
    },
    "loadFailed": "Nie udało się wczytać biblioteki.",
    "newCollection": "+ Nowa kolekcja",
    "newest": "Najnowsze najpierw",
    "noCollections": "Nie ma jeszcze kolekcji: utwórz pierwszą przyciskiem Nowa kolekcja.",
    "nothingFound": "Nic nie znaleziono",
    "nothingFoundHint": "Spróbuj innego słowa lub innego filtra.",
    "oldest": "Najstarsze najpierw",
    "order": "Kolejność",
    "origins": {
      "editor": "Edytor",
      "upload": "Wgrane"
    },
    "period": "Okres",
    "pick": "Wybierz utwór: tutaj zobaczysz jego tekst, styl, stemy i nuty.",
    "renameCollection": "Zmień nazwę kolekcji",
    "retry": "Spróbuj ponownie",
    "reuseHint": "Otwiera Utwórz z tym tekstem, stylem i ustawieniami",
    "search": "Tytuł, styl lub wers tekstu",
    "showAll": "Pokaż wszystkie utwory",
    "sub": {
      "editor": "Z edytora",
      "engine": "Bez opisu",
      "upload": "Wgrany plik"
    },
    "tabs": {
      "about": "O utworze",
      "lyrics": "Tekst",
      "parts": "Stemy i nuty"
    },
    "take": "Wersja {n}",
    "title": "Biblioteka",
    "toCreate": "Stwórz pierwszy utwór",
    "today": "Dziś",
    "yesterday": "Wczoraj",
    "bulk": {
      "addTag": "Dodaj #{tag}",
      "clear": "Wyczyść zaznaczenie (Esc)",
      "collected": "Dodano {n} utwór do «{name}» | Dodano {n} utworów do «{name}»",
      "collection": "Kolekcja",
      "favorited": "Dodano {n} utwór do ulubionych | Dodano {n} utworów do ulubionych",
      "label": "Działania na zaznaczonych utworach",
      "newCollection": "Nowa kolekcja…",
      "noTags": "Nie ma jeszcze tagów: wpisz tag i naciśnij Enter.",
      "selectAll": "Zaznacz wszystko: {n}",
      "selectSong": "Zaznacz «{title}» ze wszystkimi dublami: {n}",
      "selectTrack": "Zaznacz «{title}»",
      "selected": "Zaznaczono: {n}",
      "tag": "Tag",
      "tagPlaceholder": "Nowy tag lub szukaj",
      "tagged": "Dodano #{tag} do {n} utworu | Dodano #{tag} do {n} utworów",
      "uncollected": "Usunięto {n} utwór z «{name}» | Usunięto {n} utworów z «{name}»",
      "unfavorited": "Usunięto {n} utwór z ulubionych | Usunięto {n} utworów z ulubionych",
      "untagged": "Zdjęto #{tag} z {n} utworu | Zdjęto #{tag} z {n} utworów"
    },
    "emptyTag": "Dodaj ten tag utworowi na karcie „O utworze” albo kilku naraz z paska zaznaczenia.",
    "tags": {
      "add": "Dodaj tag i naciśnij Enter",
      "added": "Dodano tag #{tag}",
      "confirmDelete": "Usunąć tag?",
      "delete": "Zdejmij tag ze wszystkich utworów",
      "remove": "Usuń tag #{tag}",
      "removed": "Usunięto tag #{tag}",
      "rename": "Zmień nazwę tagu"
    },
    "trash": {
      "confirmEmpty": "Usunąć wszystkie na stałe?",
      "confirmPurge": "Usunąć na stałe?",
      "deleted": "Usunięto: {when}",
      "dismiss": "Ukryj komunikat",
      "emptied": "Kosz jest teraz pusty",
      "empty": "Opróżnij kosz",
      "emptyHere": "Kosz jest pusty",
      "emptyHint": "Usunięte utwory czekają tu 30 dni, gdybyś chciał któryś odzyskać.",
      "loadFailed": "Nie udało się wczytać kosza: {error}",
      "moveHint": "Przenosi utwór do kosza: można go stamtąd przywrócić w ciągu 30 dni",
      "moved": "Przeniesiono {n} utwór do kosza | Przeniesiono {n} utworów do kosza",
      "note": "Utwory w koszu są usuwane na stałe po 30 dniach.",
      "purge": "Usuń na zawsze",
      "purged": "Usunięto na stałe {n} utwór | Usunięto na stałe {n} utworów",
      "restore": "Przywróć",
      "restored": "Przywrócono {n} utwór | Przywrócono {n} utworów",
      "title": "Kosz",
      "undo": "Cofnij"
    }
  },
  "midiPanel": {
    "betterWithVocals": "Działa na pełnym miksie; dla dokładnej melodii rozdziel utwór na stemy i najpierw rozpoznaj wokal.",
    "scoreEmpty": "W MIDI nie ma nut, z których można zrobić zapis.",
    "scoreFromFull": "z pełnego miksu",
    "scoreFromStems": "melodia z wokalu, akompaniament z basu i reszty",
    "scoreFromVocals": "melodia z wokalu",
    "scoreInserted": "Zapis jest w formularzu YuE2 ({from}).",
    "toScore": "Do zapisu YuE2",
    "toScoreHint": "Zamienia nuty w zapis ABC dla YuE2 i wstawia go do jego formularza: wokal staje się melodią, bas i reszta akompaniamentem i akordami."
  },
  "miniWave": {
    "percent": "{n}%",
    "timeOf": "{pos} z {total}"
  },
  "models": {
    "check": "Sprawdź",
    "checkBad": "Uszkodzone lub brakujące: {files}. Pobierz tę część ponownie.",
    "checkFailed": "Nie udało się sprawdzić: {error}",
    "checkOffline": "Nie udało się połączyć z Hugging Face, więc porównano tylko rozmiary.",
    "checkOkHash": "Wszystkie pliki ({n}) są kompletne; {h} zgodnych z SHA-256 podanym przez Hugging Face.",
    "checkOkRecord": "Wszystkie pliki ({n}) zgadzają się ze swoim zapisem pod względem rozmiaru.",
    "checkOkSize": "Wszystkie pliki ({n}) są kompletne (sprawdzone po rozmiarze i strukturze; nie ma listy sum kontrolnych do porównania).",
    "checkOutdated": "Kompletne, ale repozytorium ma teraz nowszą wersję: {files}. Pobierz ponownie, aby ją dostać.",
    "checkTitle": "Sprawdź, czy pliki są kompletne",
    "checking": "Sprawdzam…",
    "parts": {
      "yue2-bf16": {
        "name": "YuE2 bf16",
        "text": "Model bez kwantyzacji. Potrzebuje więcej pamięci wideo niż q8_0 (najwięcej z trzech)."
      }
    },
    "reinstall": "Pobierz ponownie",
    "reinstallAsk": "Pobrać {gb} GB jeszcze raz?",
    "reinstallNamed": "Pobierz ponownie {name}",
    "reinstallNo": "Zostaw",
    "reinstallTitle": "Pobierz jeszcze raz i zastąp pliki",
    "reinstallYes": "Pobierz ponownie",
    "yue2": {
      "noSettings": "Precyzję q8_0, q4_0 lub bf16 wybiera się przy każdym generowaniu w formularzu YuE2, obok Jakości."
    }
  },
  "params": {
    "changed": "Zmieniono",
    "consoleNote": "Wartości ustawione ręcznie są oznaczone. Reszta idzie z wartością domyślną.",
    "consoleTitle": "Konsola {name}",
    "default": "Domyślnie: {v}",
    "quick": "Szybki wybór: {group}",
    "reset": "Wróć do domyślnej",
    "resetOne": "Przywróć domyślną wartość: {name}",
    "simple": {
      "more": "Więcej: {n}",
      "normal": "Zwykle: {n}",
      "steps": "Kroki dekodowania",
      "stepsHint": "Więcej kroków trwa dłużej."
    }
  },
  "player": {
    "close": "Zamknij odtwarzacz",
    "label": "Odtwarzacz",
    "next": "Następny utwór",
    "prev": "Poprzedni utwór (od początku, jeśli utwór już trwa)"
  },
  "presets": {
    "button": "Preset",
    "confirmDelete": "Kliknij ponownie, aby usunąć {name}",
    "deleteAsk": "Usunąć?",
    "deleteOne": "Usuń preset {name}",
    "none": "Nie zapisano jeszcze presetów.",
    "saveCurrent": "Zapisz formularz jako preset",
    "title": "Presety: zapisane zestawy ustawień formularza"
  },
  "resources": {
    "ramOf": "RAM {used} z {total} GB",
    "state": {
      "error": "{model} zgłosił błąd",
      "running": "{model} działa",
      "starting": "{model} się uruchamia",
      "stopping": "{model} się zatrzymuje"
    },
    "vramOf": "Pamięć wideo {used} z {total} GB",
    "holder": {
      "cover": "Okładki (Z-Image Turbo)"
    }
  },
  "sa3Gen": {
    "badGuidanceWindow": "Guidance kończy się przy wyższym poziomie szumu, niż się zaczyna: obniż „kończy się przy” lub podnieś „zaczyna się przy”.",
    "formTabs": "Sekcje formularza",
    "kindLabel": "Rodzaj dźwięku",
    "lengthFromRef": "Długość wyznacza utwór referencyjny:",
    "lengthOwn": "własna: {v}",
    "lengthSeconds": "{n} s",
    "manual": {
      "apg": "Udział APG",
      "autoTags": "Tagi serwisowe",
      "cfg": "Zgodność z opisem",
      "cfgStartsAt": "Guidance zaczyna się przy poziomie szumu",
      "cfgStopsAt": "Guidance kończy się przy poziomie szumu",
      "chunked": "Dekoduj kawałkami",
      "chunkedAuto": "Auto",
      "duration": "Długość",
      "fromRef": "ustawia utwór referencyjny",
      "guidanceSub": "jak opis kieruje dźwiękiem; poziom szumu spada od 1 do 0 w trakcie generowania",
      "guidanceTitle": "Guidance",
      "needCfg": "gdy zgodność z opisem nie wynosi 1",
      "needTwo": "przy co najmniej dwóch wariantach",
      "negative": "Czego unikać",
      "normThreshold": "Limit kroku guidance",
      "off": "Nie",
      "on": "Tak",
      "padding": "Zapas długości",
      "perVariant": "Osobny opis na wariant",
      "resultSub": "długość i opis",
      "resultTitle": "Wynik",
      "sampler": "Sampler",
      "samplerAuto": "domyślny (pingpong)",
      "samplerAutoBase": "domyślny dla modelu",
      "samplerLoud": "Głośniej niż zwykle i z przesterem: w teście 1-2 % dźwięku uderzyło w sufit.",
      "samplerQuiet": "Około 7 dB ciszej niż zwykle.",
      "samplerSub": "jak liczony jest każdy krok",
      "samplerTitle": "Sampler",
      "scalePhi": "Złagodź guidance",
      "textOnly": "tylko bez utworu referencyjnego",
      "trim": "Utnij ciszę na początku"
    },
    "modelsAfterStart": "Lista modeli pojawi się, gdy silnik będzie działał.",
    "queuedNote": "Wersji w kolejce: {n}",
    "ref": {
      "modeLabel": "Co zrobić z referencją",
      "off": "Włącz, aby pracować na gotowym utworze: zrobić go od nowa, przerobić zakres lub go przedłużyć."
    },
    "simple": {
      "tagsOff": "Nie dodawaj",
      "tagsOn": "Dodaj"
    },
    "submitKind": {
      "music": "Utwórz muzykę",
      "sfx": "Utwórz dźwięk"
    },
    "tabChanged": "zmieniono",
    "tabs": {
      "ref": "Z utworu",
      "sound": "Opis",
      "tuning": "Ustawienia"
    },
    "advancedHint": "Kostka obok seeda znów go losuje; liczba powtarza ten dźwięk. Modele po dotrenowaniu są dostrojone do 8 kroków i zgodności 1; Czego unikać i grupa Guidance działają tylko wtedy, gdy zgodność z opisem nie wynosi 1.",
    "advancedHintBase": "Punkt kontrolny base: startuje przy 50 krokach i zgodności 7, więc Czego unikać działa; spróbuj tam „poor quality”.",
    "help": {
      "tips": [
        "Muzyka: gatunek, instrumenty i jak każdy brzmi, nastrój i energia, tempo w BPM.",
        "Dźwięk: co go wydaje, jak się dzieje i jak długo, gdzie stoi mikrofon i jak brzmi pomieszczenie.",
        "Tagi pomagają: TrackType: Music, VocalType: Instrumental, Genre: Funk, Instruments: Guitar, Saxophone; TrackType: Instrument dla partii solowej; TrackType: SFX dla dźwięku.",
        "Bez wokalu: model robi utwory instrumentalne; prompt z wokalem da co najwyżej tekstury bez słów.",
        "Wpisz seed, aby powtórzyć wynik; przy wciśniętej kostce każda wersja dostaje nowy."
      ]
    },
    "translateBtn": "Tylko przetłumacz",
    "translateHint": "Stable Audio rozumie tylko angielski: asystent może napisać z twojego tekstu prompt po angielsku albo go tylko przetłumaczyć.",
    "translateNoAssistant": "Asystent promptów nie jest gotowy: pobierz jego model w sekcji Modele.",
    "translateRunning": "Tłumaczenie…",
    "translateStopping": "Zatrzymywanie…",
    "translateStop": "Zatrzymaj",
    "translateDone": "Przetłumaczono na angielski.",
    "translateUndo": "Przywróć",
    "composeBtn": "Napisz prompt",
    "composeTitle": "Asystent przerobi opis w dowolnym języku na prompt dla Stable Audio: gatunek, instrumenty, brzmienie, tempo i długość",
    "composeRunning": "Piszę prompt…",
    "composeDone": "Prompt dla Stable Audio jest gotowy."
  },
  "tagInput": {
    "cleared": "Wszystkie tagi wyczyszczono",
    "removeTag": "Usuń {tag}",
    "removed": "Usunięto {tag}",
    "restored": "Tagi przywrócono",
    "undo": "Cofnij",
    "undoTitle": "Przywróć wyczyszczone tagi"
  },
  "yueGen": {
    "help": {
      "advanced": {
        "choices": [
          "Jakość (zakładka Piosenka): Szkic to model q4_0, Normalna q8_0, Finalna bf16 z 32 krokami dekodowania i zgodnością ze stylem 1.2.",
          "Długość (zakładka Piosenka): minuty zamieniają się w Nie krócej niż i Nie dłużej niż; model robi 25 tokenów na sekundę dźwięku.",
          "Śpiew: Stabilniej to Śmiałość 0.85, Śmielej 1.1.",
          "Powtórzenia: Mniej to Kara za powtórzenia 1.3 z Pamięcią powtórzeń 80.",
          "Zapis: Ostrożniej to Śmiałość zapisu 0.55."
        ],
        "choicesIntro": "Ustawiają te same wartości co poprawki poniżej, jednym kliknięciem.",
        "choicesTitle": "Wybory w zakładkach",
        "title": "Ustawienia",
        "lead": "Możesz je zostawić: to, czego nie zmienisz, idzie z domyślną wartością silnika, pokazaną w każdym wierszu w trybie Ręcznym. Mają znaczenie, gdy utwór wciąż wychodzi źle: ucięty, zapętlony, fałszywy. Znajdź swój przypadek poniżej i naciśnij Zastosuj: odpowiednie liczby same wpiszą się w pola.",
        "fixes": [
          {
            "id": "cutoff",
            "problem": "Utwór urywa się przed końcem tekstu",
            "fix": "Nie dłużej niż: 12000 tokenów, górna granica długości około 8 minut zamiast 6."
          },
          {
            "id": "offbrief",
            "problem": "Brzmienie nie pasuje do tagów",
            "fix": "Zgodność ze stylem: 1.2, aby model ściślej trzymał się opisu. Jeśli to nie pomaga, problemem są same tagi."
          },
          {
            "id": "loop",
            "problem": "Jedna fraza kręci się w kółko",
            "fix": "Kara za powtórzenia 1.3 i Pamięć powtórzeń 80: mocniejsza kara za powtórzenia i dłuższa pamięć o nich."
          },
          {
            "id": "offkey",
            "problem": "Fałszywe nuty, załamania głosu, szum",
            "fix": "Śmiałość 0.85 i 32 kroki dekodowania: mniej śmiałości, więcej przejść przy rysowaniu audio."
          },
          {
            "id": "melody",
            "problem": "Melodia jest niespójna",
            "fix": "Jeśli plan jest wyłączony, przełącza się na Melodia i akordy (już wybrany plan zostaje), a Zapis przechodzi na Ostrożniej (Śmiałość zapisu 0.55), więc zapis jest pisany ostrożniej. Albo weź melodię z utworu w zakładce Melodia: podany zapis zastępuje plan i wtedy liczy się tylko wybór planu."
          },
          {
            "id": "same",
            "problem": "Wszystkie wersje brzmią podobnie",
            "fix": "Włącza losowy seed. Jeśli to za mało, Śmiałość 1.1."
          },
          {
            "id": "final",
            "problem": "Chcę finalny render",
            "fix": "Jakość: Finalna, model bf16 (jeśli pobrany), 32 kroki i zgodność ze stylem 1.2. Zrób 2–3 wersje i zostaw najlepszą."
          }
        ],
        "fieldsIntro": "Pod każdym polem jest skala typowych wartości: znacznik nad nią to wartość domyślna dla audio, znacznik pod nią dla zapisu (tylko z planem melodii i bez podanego zapisu). Zapis wymaga rygoru, audio wymaga życia, stąd różne wartości domyślne.",
        "groups": [
          {
            "title": "Dokładność i jakość",
            "fields": [
              {
                "key": "cfg_scale",
                "name": "Zgodność ze stylem (CFG)",
                "text": "Jak posłusznie model idzie za tagami stylu. Jak głośność Twojego głosu w uchu muzyka: ciszej, grają swobodniej; głośniej, bliżej polecenia, ale sztywniej.",
                "left": "swobodniej",
                "right": "ściślej do tagów",
                "when": "1.2, gdy brzmienie ledwo pasuje do opisu. Powyżej 1.5: artefakty i „plastikowy” dźwięk."
              },
              {
                "key": "num_inference_steps",
                "name": "Kroki dekodowania",
                "text": "Ile przejść wykonuje model, zamieniając swój plan w gotowe audio. Jak warstwy farby: 8 to szybki szkic, 32 czysta warstwa końcowa.",
                "left": "szybciej",
                "right": "czyściej",
                "when": "8 dla szkiców, 32 dla wersji finalnej. Różnicy prawie nie słychać (około 4 s na utwór na RTX 4080); powyżej 32 dźwięk tylko się zmienia, nie poprawia."
              }
            ]
          },
          {
            "title": "Charakter wykonania",
            "fields": [
              {
                "key": "temperature",
                "name": "Śmiałość (temperature)",
                "text": "Śmiałość modelu (co najmniej 0.01: zero zatrzymuje silnik). Niska: gra „według nut”, równo i przewidywalnie; wysoka: improwizuje, czasem świetnie, czasem fałszywie.",
                "left": "stabilniej",
                "right": "śmielej",
                "when": "Fałsz: 0.85. Wszystkie wersje podobne: 1.1. Dziwny zapis: 0.5–0.6 dla zapisu."
              },
              {
                "key": "repetition_penalty",
                "name": "Kara za powtórzenia",
                "text": "Kara za powtarzanie tego, co już zagrano. Im wyższa, tym mocniej model unika „zacinającej się płyty”. Dla zapisu to prawie 1.0: powtórzenia są w notacji normalne.",
                "left": "powtórzenia dozwolone",
                "right": "bez powtórzeń",
                "when": "Zapętlenie: 1.3. Poniżej 1.1 grozi monotonne zapętlenie."
              }
            ]
          },
          {
            "title": "Długość utworu",
            "fields": [
              {
                "key": "min_tokens",
                "name": "Nie krócej niż",
                "text": "Model nie może skończyć przed tym punktem. Mniej więcej 25 jednostek na sekundę: 200 ≈ 8 sekund audio.",
                "left": "może być krótko",
                "right": "nie wcześniej niż",
                "when": "Utwór kończy się, zanim wszystko zaśpiewano: zwiększ."
              },
              {
                "key": "max_tokens",
                "name": "Nie dłużej niż",
                "text": "Górna granica długości. 9000 ≈ 6 minut piosenki; formularz przyjmuje do 15000. Więcej: dłuższe czekanie i więcej pamięci GPU.",
                "left": "krócej",
                "right": "dłużej",
                "when": "Urywa w pół frazy: 12000."
              }
            ]
          }
        ],
        "rareIntro": "Zmieniają to samo co Śmiałość lub Kara za powtórzenia, tylko subtelniej. Zwykle zostają bez zmian.",
        "rare": [
          {
            "key": "top_p",
            "name": "Odcięcie rzadkich wyborów (top-p)",
            "text": "Ile „rozsądnych” opcji model rozważa w każdym kroku: 1, wszystkie; 0.5, tylko najbardziej oczywiste."
          },
          {
            "key": "top_k",
            "name": "Kandydaci (top-k)",
            "text": "Twardy limit liczby opcji w każdym wyborze. Drugi filtr obok odcięcia rzadkich wyborów."
          },
          {
            "key": "penalty_window",
            "name": "Pamięć powtórzeń",
            "text": "Jak daleko wstecz model pamięta, co zagrał, licząc karę za powtórzenia. 50 ≈ 2 sekundy audio. Podnieś do 80 przy zapętleniu."
          }
        ]
      },
      "melody": {
        "lead": "YuE2 potrafi zaśpiewać tekst do podanej melodii. Trzyma ją zapis ABC: nuty zapisane jako tekst. Z zapisu w formacie, który tworzy aplikacja, piosenka wychodzi w tej samej tonacji, z tymi samymi śpiewanymi nutami i o tej samej długości: w naszym teście nuty zgadzały się w 93–99 %.",
        "roll": [
          "Posłuchaj odtwarza zapis na pianinie. Kliknięcie lub przeciągnięcie na roll wybiera początek, ⏮ wraca na początek.",
          "Różowe nuty to wokal (Vocal), niebieskie to akompaniament (Ins). Numery taktów i akordy biegną u góry.",
          "Ctrl + kółko myszy zmienia skalę, ⤢ otwiera duże okno z trzema oktawami klawiszy.",
          "Nuty pokazują ten sam zapis na pięciolinii; kliknięcie nuty ją odtwarza."
        ],
        "rollTitle": "Roll i nuty",
        "sources": [
          "Z utworu… — wybierz plik audio, a SheetSage2 zapisze jego melodię i akordy. Najlepiej działa na utworze z wyraźnym wokalem.",
          "Importuj MIDI — najwyższa partia staje się melodią, pozostałe kanały akompaniamentem i akordami, a tonacja jest wykrywana sama. Trzymaj melodię wokalu na osobnej ścieżce.",
          "Pianino — wybierz długość i naciskaj klawisze (na dole, po lewej od rolla, lub na klawiaturze MIDI): nuty następują po sobie.",
          "Z wersji utworu: Do MIDI w menu wersji albo zakładka Stemy i nuty w bibliotece, a potem Do zapisu YuE2. Wokal staje się melodią, bas i reszta akompaniamentem."
        ],
        "sourcesTitle": "Skąd wziąć melodię",
        "tips": [
          "Jedna nuta na sylabę: wers z 8 sylabami potrzebuje około 8 nut.",
          "Piosenka trwa tyle, ile nuty: 8 taktów 4/4 przy 100 BPM to około 20 sekund.",
          "Podążaj za melodią: model zachowuje Twoją melodię i dopisuje akompaniament; Melodia i akordy: buduje jedno i drugie z zapisu.",
          "Tonacja lub tempo w stylu nic nie dają: biorą się z nut.",
          "Edytuj tekst ABC ręcznie tylko, jeśli znasz format: model najlepiej czyta układ, który tworzy aplikacja (głosy Vocal i Ins)."
        ],
        "tipsTitle": "Dla wiernego wyniku",
        "title": "Melodia i zapis ABC"
      },
      "style": {
        "tips": [
          "Optymalnie jest 5–8 tagów: więcej zaczyna kolidować, mniej daje mniej przewidywalny wynik.",
          "Pisz tagi po angielsku, ale zacznij od języka piosenki (Russian, English, Spanish…): robią tak wszystkie przykłady samego silnika, a przepływy pomysłu dodają to za Ciebie.",
          "Przy planie melodii (Podążaj za melodią lub Melodia i akordy) styl nadal ma znaczenie: ustala brzmienie i aranżację, a melodia pochodzi z zapisu ABC."
        ]
      },
      "lyrics": {
        "tips": [
          "Przy planie melodii rytm wersów powinien z grubsza zgadzać się z zapisem ABC (sylaby na takt); w przeciwnym razie model musi rozciągać lub ściskać słowa, by pasowały do melodii.",
          "Krótkie wersy wpadają w melodię bardziej przewidywalnie niż długie.",
          "Powtarzaj refren słowo w słowo w każdym [Chorus]: dzięki temu zachowuje tę samą linię melodyczną w całym utworze."
        ]
      },
      "cot": {
        "title": "Plan melodii",
        "intro": "Plan melodii decyduje, czy model pisze plan muzyczny przed audio i jak używa zapisu ABC z zakładki Melodia.",
        "melodyNote": "Podaj melodię w zapisie ABC pod planem: Z utworu… (SheetSage2), plik MIDI albo pianino. Bez zapisu model pisze własny plan samej melodii.",
        "precisionNote": "Precyzja modelu (q8_0, q4_0, bf16) nie ma związku z planem: ustawia ją Jakość w zakładce Piosenka. q4_0 oszczędza pamięć wideo kosztem niewielkiej utraty jakości, niezależnie od planu.",
        "abcFooter": "Najłatwiej nie pisać ABC od zera, tylko wziąć je z utworu przez Z utworu… (SheetSage2), a potem ręcznie poprawić potrzebne takty."
      }
    },
    "length": {
      "auto": "Auto",
      "autoHint": "Tak długo, jak trwa tekst, do około 6 minut.",
      "hint": "Około {n} min: krótszy tekst jest śpiewany i grany do tej długości, dłuższy jest tam ucinany.",
      "label": "Długość",
      "minutes": "{n} min",
      "ownHint": "Ustawiona ręcznie w Ustawieniach (Min. / Maks. tokenów)."
    },
    "lines": "Wersów: {n}",
    "linesAbout": "Wersów: {n}, około {time}",
    "linesAboutHint": "Oszacowanie na podstawie Twoich wcześniejszych piosenek: około {s} s na wers. Dla długości Auto.",
    "manual": {
      "abcGiven": "zapis z zakładki Melodia",
      "changed": "Zmieniono {n} z {total}",
      "console": "Konsola: wszystkie grupy naraz",
      "consoleTitle": "Konsola YuE2",
      "done": "Gotowe",
      "groups": {
        "character": {
          "sub": "wokal i muzyka",
          "title": "Charakter"
        },
        "length": {
          "sub": "25 tokenów na sekundę",
          "title": "Długość"
        },
        "repeats": {
          "sub": "przeciw zapętleniom",
          "title": "Powtórzenia"
        },
        "score": {
          "sub": "jak model pisze plan melodii",
          "title": "Zapis"
        },
        "sound": {
          "sub": "model i dekodowanie",
          "title": "Dźwięk"
        }
      },
      "manual": "Ręczny",
      "params": {
        "cfg": "Zgodność ze stylem",
        "max_tokens": "Nie dłużej niż",
        "min_tokens": "Nie krócej niż",
        "penalty_window": "Pamięć powtórzeń",
        "precision": "Precyzja modelu",
        "repetition_penalty": "Kara za powtórzenia",
        "steps": "Kroki dekodowania",
        "temperature": "Śmiałość",
        "top_k": "Kandydaci",
        "top_p": "Odcięcie rzadkich wyborów"
      },
      "reset": "Resetuj",
      "resetAll": "Resetuj wszystko",
      "seconds": "{n} s",
      "seedRandom": "losowy",
      "sends": "Trafia do silnika",
      "sendsRest": "Wartości ustawione ręcznie są oznaczone. Czego nie ma w linii, zostaje przy domyślnej wartości silnika.",
      "simple": "Prosty"
    },
    "perf": {
      "manualNow": "(teraz ustawione ręcznie)",
      "repeats": {
        "hint": "Mniej, gdy jedna fraza kręci się w kółko.",
        "label": "Powtórzenia",
        "options": {
          "fewer": "Mniej",
          "normal": "Normalnie"
        }
      },
      "score": {
        "hint": "Ostrożniej, gdy melodia się rozłazi: model pisze zapis ostrożniej.",
        "label": "Zapis",
        "options": {
          "careful": "Ostrożniej",
          "normal": "Normalnie"
        }
      },
      "temperature": {
        "hint": "Stabilniej: mniej fałszów i załamań głosu. Śmielej: wersje bardziej różnią się od siebie.",
        "label": "Śpiew",
        "options": {
          "normal": "Normalnie",
          "steady": "Stabilniej",
          "varied": "Śmielej"
        }
      }
    },
    "planLabel": "Plan melodii",
    "planNames": {
      "full": "Melodia i akordy",
      "melody": "Podążaj za melodią",
      "off": "Bez planu"
    },
    "qualityHints": {
      "draft": "Model {model} zajmuje mniej pamięci wideo, brzmienie jest nieco prostsze: do wypróbowywania pomysłów.",
      "final": "Model {model}, 32 kroki dekodowania i bliżej tagów stylu (CFG 1.2): do gotowego utworu. Zrób 2–3 wersje i zostaw najlepszą. bf16 potrzebuje więcej pamięci wideo niż q8_0 (jego plik ma 7.3 GB wobec 4.3 GB).",
      "normal": "Model {model} ze zwykłymi ustawieniami: dobre brzmienie bez czekania.",
      "own": "Precyzja, kroki i CFG ręcznie."
    },
    "qualityLabel": "Jakość",
    "qualityNames": {
      "draft": "Szkic",
      "final": "Finalna",
      "normal": "Normalna",
      "own": "Własna"
    },
    "queued": "W kolejce, wersji: {n}",
    "scoreGivenNote": "Podany zapis zastępuje plan, więc próbkowanie zapisu nic nie robi i nie jest wysyłane.",
    "sections": {
      "bridge": "+ Bridge",
      "chorus": "+ Refren",
      "outro": "+ Outro",
      "verse": "+ Zwrotka"
    },
    "tabs": {
      "changed": "Zmienione względem domyślnych",
      "melody": "Melodia",
      "song": "Piosenka",
      "tuning": "Ustawienia"
    },
    "takes": "Wersje",
    "tuningTitle": "Ustawienia wydajności"
  },
  "acePage": {
    "openTrainingPage": "Otwórz trening LoRA"
  },
  "library": {
    "noTracks": "W bibliotece nie ma jeszcze utworów. Wgraj plik powyżej lub stwórz utwór w Utwórz."
  },
  "notInstalled": {
    "stableAudio": {
      "text": "Stable Audio 3 tworzy podkłady i efekty dźwiękowe oraz napędza przemalowanie, kontynuację i cover w edytorze. Pominięto go przy instalacji. Po zainstalowaniu pobierz model w Modelach i ustawieniach albo od razu w formularzu Stable Audio."
    }
  },
  "idea": {
    "guide": {
      "lead": "Jedno zdanie na wejściu, utwór na wyjściu, prosto na stronie głównej. Opisujesz piosenkę, podkład lub dźwięk własnymi słowami, lokalny model językowy pisze prompt w formacie wybranego silnika, edytujesz go, jeśli chcesz, a silnik tworzy utwór.",
      "steps": [
        {
          "title": "Opisz pomysł",
          "text": "Zdanie lub dwa: o czym jest piosenka, nastrój, kto śpiewa, gdzie i kiedy. Dla podkładu: gatunek, instrumenty i nastrój."
        },
        {
          "title": "Wybierz rodzaj i silnik",
          "text": "Piosenka z wokalem, podkład lub dźwięk, potem ACE-Step, YuE2 lub Stable Audio 3. Silnika, który nie robi tego rodzaju, nie można wybrać; dźwięk to zawsze Stable Audio."
        },
        {
          "title": "Skomponuj",
          "text": "Naciśnij Skomponuj: asystent pisze prompt tuż pod zdaniem i pokazuje etap, procent i tekst w miarę jego powstawania. Możesz go zatrzymać. Dźwięk pomija ten krok: Skomponuj otwiera formularz Stable Audio ze zdaniem."
        },
        {
          "title": "Edytuj prompt",
          "text": "Tagi, tekst, tempo, tonację i długość można zmienić od razu w polach."
        },
        {
          "title": "Generuj",
          "text": "Generuj wrzuca warianty do kolejki silnika, który uruchamia się, gdy przyjdzie ich pora, i otwiera Twórz: warianty pojawiają się na liście sesji, nazwane od pomysłu."
        }
      ],
      "writer": [
        "Asystent promptów to lokalny model językowy Qwen3.5. Trzyma się pomysłu i pisze tekst w języku pomysłu lub w tym, który wybierzesz. Jego model pobiera się na stronie Modele.",
        "W ACE-Step prompt może też napisać własny model językowy ACE-Step, gdy silnik działa. Jest szybszy, zwykle 5–20 s, ale częściej odbiega od pomysłu.",
        "Język tekstu domyślnie jest brany z liter pomysłu; możesz go wybrać w Więcej, tak samo jak to, kto pisze prompt. Na stronie Twórz jest w Ustawieniach linii pomysłu."
      ],
      "after": [
        "Kolejny wariant pisze prompt od nowa z tego samego pomysłu.",
        "Otwórz w formularzu wkłada prompt do formularza silnika na stronie Twórz, razem ze wszystkimi jego ustawieniami.",
        "Pomysł i prompt zostają, gdy opuścisz stronę lub ją odświeżysz. Po Generuj są czyszczone pod następny pomysł; Resetuj czyści je ręcznie.",
        "Na stronie Twórz ten sam pomysł jest w linii pomysłu nad formularzem: Napisz wkłada tekst i styl prosto do formularza (Opisz, w Stable Audio), a Przywróć poprzednie odtwarza formularz."
      ],
      "tips": [
        "Konkret bije ogólniki: „nocny pociąg z małego miasteczka” da więcej niż „smutna piosenka”.",
        "Chcesz konkretny gatunek, głos lub instrumenty? Nazwij je w pomyśle.",
        "Przeczytaj tekst przed generowaniem: mały model nie zawsze trafia z rymem i metrum.",
        "To nie ten dźwięk? Spróbuj innego silnika z tym samym pomysłem: prompt zostanie przepisany w jego formacie.",
        "Deszcz, uderzenie, kroki to dźwięki, nie muzyka: wybierz Dźwięk, a zdanie trafi prosto do formularza Stable Audio. Przy Podkładzie i Stable Audio 3 asystent sam rozpozna, że chodzi o dźwięk; ACE-Step zrobi z takiego pomysłu utwór."
      ]
    }
  },
  "sa3Weights": {
    "allOnModels": "Wszystkie modele, punkty kontrolne bazowe i ustawienia są na stronie Modele"
  },
  "autoTitle": {
    "accept": "Użyj",
    "another": "Inny",
    "bulk": "Zaproponuj tytuły",
    "bulkDone": "Nazwano {n} utwór | Nazwano {n} utworów",
    "bulkFailed": "Nazwano {n}, potem zatrzymano: {error} | Nazwano {n}, potem zatrzymano: {error}",
    "bulkHint": "Asystent nazywa kolejno każdy zaznaczony utwór; „Cofnij” przywraca dawne tytuły.",
    "bulkStopped": "Zatrzymano: nazwano {n} z {total}",
    "bulkUndone": "Przywrócono stary tytuł | Przywrócono stare tytuły: {n}",
    "cancel": "Anuluj",
    "failed": "Nie udało się wymyślić tytułu: {error}",
    "noAssistant": "Asystent promptów nie jest gotowy: pobierz jego model w sekcji Modele.",
    "progress": "Nazywam {done} z {total}",
    "stop": "Stop",
    "suggest": "Zaproponuj tytuł",
    "working": "Wymyślam tytuł…"
  },
  "covers": {
    "alt": "Okładka utworu {title}",
    "another": "Inna okładka",
    "bulk": "Utwórz okładki",
    "bulkDone": "Utworzono {n} okładkę | Utworzono {n} okładek",
    "bulkFailed": "{n} się nie udało",
    "bulkHint": "Okładka dla każdego zaznaczonego utworu, jedna po drugiej; utwór, który ją ma, dostaje nową.",
    "bulkProgress": "Okładki: {done} z {total}",
    "cancel": "Anuluj",
    "describe": "Co przedstawia obraz",
    "describeHint": "Scena w kilku słowach; najlepiej działa angielski. Tekstu na obrazie program unika sam.",
    "dismiss": "Odrzuć",
    "edit": "Edytuj opis…",
    "enable": "Twórz okładki albumów dla utworów",
    "enableHint": "Dodaje obraz do każdej piosenki w bibliotece, odtwarzaczu i sesji. Wyłączone: żadnych okładek ani przycisków okładek.",
    "engine": "Okładki (Z-Image Turbo)",
    "failed": "Okładka się nie udała: {error}",
    "fromAssistant": "Z pomysłu asystenta na ten utwór.",
    "installed": "zainstalowano",
    "loadingPrompt": "Czytam opis…",
    "make": "Utwórz okładkę",
    "making": "Tworzę okładkę…",
    "makingPct": "Tworzę okładkę… {pct}%",
    "model": "Model: Z-Image Turbo, {gb} GB",
    "notInstalled": "nie zainstalowano",
    "notInstalledHint": "Modelu okładek nie ma na tym komputerze. Zainstaluj go instalatorem (część Okładki) albo skryptem instalacyjnym.",
    "onButton": "Okładka powstaje tylko po naciśnięciu przycisku: w szczegółach utworu w bibliotece albo dla zaznaczonych utworów. Każda trwa od 5 do 10 sekund; w tym czasie GPU przełącza się na model okładek, a następna piosenka ładuje swój silnik z powrotem.",
    "parts": {
      "main": "Wagi Z-Image Turbo",
      "server": "Serwer obrazów (stable-diffusion.cpp)"
    },
    "queued": "Czeka w kolejce…",
    "remove": "Usuń okładkę",
    "removeConfirm": "Tak, usuń",
    "stop": "Stop",
    "title": "Okładki",
    "draw": "Narysuj",
    "withAssistant": "Zrób z asystentem",
    "withAssistantHint": "Asystent promptów pisze opis na podstawie twojego tekstu (w dowolnym języku) albo, gdy pole jest puste, piosenki; przed rysowaniem możesz go poprawić.",
    "putBack": "Przywróć",
    "anyLanguageHint": "Pisz w dowolnym języku: asystent zamieni to w opis zrozumiały dla modelu obrazów.",
    "fromSaved": "Opis, według którego narysowano ostatnią okładkę.",
    "noAssistant": "Asystent promptów nie jest gotowy: pobierz jego model w zakładce Modele.",
    "describing": "Opisuję obraz…",
    "describingPct": "Opisuję obraz… {pct}%",
    "describeFailed": "Asystent nie zdołał opisać obrazu: {error}",
    "bulkDescribing": "Opisuję {done} z {total}",
    "starting": "Uruchamiam model obrazów…"
  },
  "takeCompare": {
    "best": "★ Najlepsza",
    "failed": "Nie udało się wczytać",
    "keep": "Zachowaj najlepszą, resztę przenieś do kosza",
    "keepConfirm": "Przenieść {n} wersję do kosza? | Przenieść {n} wersji do kosza?",
    "keepNeedStar": "Oznacz gwiazdką najlepszą wersję, aby ją zachować.",
    "keepTooMany": "Oznacz gwiazdką tylko jedną wersję: tę do zachowania.",
    "keepWill": "Zachowuje {take}; druga trafia do kosza. | Zachowuje {take}; pozostałe {n} trafiają do kosza.",
    "kept": "Zachowano {take}; {n} wersję przeniesiono do kosza. | Zachowano {take}; {n} wersji przeniesiono do kosza.",
    "keys": "1–4 wybór wersji · Spacja odtwarzaj/pauza · ←/→ 5 s · Esc zamknij",
    "loading": "Wczytywanie…",
    "loadingAll": "wczytuję wersje…",
    "newestOf": "{shown} najnowsze z {total} wersji",
    "nowHearing": "Teraz gra: {take}",
    "open": "Porównaj",
    "openTitle": "Porównaj wersje tej piosenki, A/B",
    "position": "{at} z {total}",
    "restored": "Przywrócono {n} wersję | Przywrócono {n} wersji",
    "seed": "seed {seed}",
    "seek": "Pozycja",
    "takes": "Wersje",
    "tileLabel": "{letter}, wersja {n}",
    "title": "Porównanie wersji"
  }
}
