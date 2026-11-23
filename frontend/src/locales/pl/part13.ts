// Notes workspace and help, and the strings added or reworded after part12 (machine-translated from en); merged last, key by key.
export default {
  "aceGen": {
    "closeness": "Jak blisko oryginału",
    "closenessHigh": "Swobodniej",
    "closenessHint": "Z lewej wynik zachowuje melodię i aranżację źródła; z prawej model zmienia więcej.",
    "closenessLow": "Bliżej oryginału",
    "loraSimple": "LoRA",
    "loraTrain": "Wytrenuj własną",
    "modelDefault": "{name} (domyślny)",
    "refChoose": "Wybierz plik",
    "refDrop": "Upuść tu audio albo wybierz je z biblioteki",
    "refFromLibrary": "Z biblioteki",
    "refLoading": "Wczytywanie utworu…",
    "refNeeded": "Wybierz tu utwór albo wróć na kartę Utwór, aby zrobić nowy.",
    "refOff": "Weź gotowy utwór: cover, przerobiony fragment, wyjętą lub dodaną partię. Bez utworu formularz tworzy nową piosenkę.",
    "refRemove": "Usuń"
  },
  "aiPart": {
    "guide": {
      "hears": [
        "Zaznaczone ścieżki są miksowane w jeden utwór stereo: z głośnością ścieżek, fade'ami i dopasowaniem tempa (W), ale bez efektów i z pominięciem przycisków M i S.",
        "Tempo pochodzi z pola BPM projektu, nie z klipów: ustaw je zgodnie z materiałem. Tonacja pochodzi z pola «Tonacja»; przy «Auto» model sam ją znajduje.",
        "ACE-Step zna tylko dur i moll. Dla każdej innej skali model dostaje najbliższą tonację i nazwę skali w opisie: to wskazówka, nie gwarancja.",
        "Ścieżki z wariantami, które wciąż czekają na wybór, nie są oferowane: to szkice.",
        "Model nie przyjmie fragmentu dłuższego niż 10 minut: zaznacz krótszy."
      ],
      "limits": [
        "«Dodaj partię» działa tylko na modelu bazowym ACE-Step (około 4,8 GB). W aplikacji desktopowej to opcja przy instalacji; jeśli ją pominięto, aranżer pokazuje przycisk Zainstaluj. Ze skryptami setup_models na końcu wypisuje do tego polecenie.",
        "base jest wolniejszy niż turbo: na RTX 4080 wariant dla utworu 2–3 minutowego trwa około 10 sekund, a pierwsze uruchomienie dłużej, bo ładuje się model.",
        "Model lepiej trzyma się tonacji i akordów tego, co słyszy, niż pomysłów rytmicznych: «gra w przerwach wokalu» może nie wyjść.",
        "Jakość dźwięku jest taka, jaką da model. Nie ma MIDI do audio: model pracuje tylko z dźwiękiem.",
        "Jeśli zainstalowano xl-base, pojawia się na liście modeli; na karcie 16 GB zajmuje prawie całą pamięć wideo. Do dodawania partii używaj base: w pomiarach xl-base zwracał szum w około jednym wariancie na pięć, base w jednym na dwadzieścia pięć.",
        "Odrzucanie szumu kosztuje czas: gdy wariant jest odrzucony, żądanie idzie ponownie i generowanie trwa dłużej. Perkusja, perkusjonalia i efekty nie są sprawdzane: z natury przypominają szum."
      ],
      "variants": [
        {
          "term": "Posłuchaj",
          "text": "przełącza na ten wariant, wycisza pozostałe i odtwarza od początku zakresu."
        },
        {
          "term": "Zostaw",
          "text": "zostawia wariant i usuwa pozostałe. Przy przemalowaniu, kontynuacji lub coverze zostawiony wariant zastępuje oryginał w zakresie."
        },
        {
          "term": "Usuń wszystkie",
          "text": "usuwa wszystkie warianty i przywraca ścieżki do stanu sprzed."
        },
        {
          "term": "Kopia kontekstu",
          "text": "oznacza wariant, w którym model zwrócił prawie ten miks, który usłyszał, zamiast nowej partii. Wygeneruj ponownie."
        },
        {
          "term": "Szum",
          "text": "oznacza wariant, w którym model zwrócił syczenie zamiast partii. Aranżer sam odrzuca takie warianty i prosi o zamienniki, do dwóch razy; oznaczenie zostaje tylko przy tym, co wróciło po ponowieniach."
        },
        {
          "term": "Ctrl+Z",
          "text": "cofa zarówno wstawienie wariantów, jak i wybór. Pliki odrzuconych wariantów opuszczają bibliotekę dopiero przy zapisie projektu i tylko jeśli żaden klip ich nie używa."
        }
      ]
    }
  },
  "covers": {
    "after": {
      "hintSa": "Po wygenerowaniu: jedna okładka dla wszystkich wersji. Zajmuje GPU na kolejne ~30 s."
    },
    "studio": {
      "errChanged": "Okładka została w międzyczasie zrobiona od nowa. Zapisz jeszcze raz.",
      "errLoad": "Nie udało się wczytać obrazu okładki. Spróbuj ponownie.",
      "errNoCover": "Ten utwór nie ma okładki, na której można umieścić napis.",
      "errSave": "Nie udało się zapisać napisu. Spróbuj ponownie."
    }
  },
  "create": {
    "failed": "Nie wyszło. Naciśnij Powtórz z tymi ustawieniami, potem znów Utwórz.",
    "madeAt": "o {time}",
    "menu": {
      "midi": "Nuty do MIDI"
    },
    "notes": {
      "cardTitle": "Nuty",
      "draw": "Narysuj",
      "drawNote": "«Narysuj» otwiera Nuty po prawej ze szkieletem z tekstu: sekcje z tagów [Verse], [Chorus], akord zastępczy w każdym takcie.",
      "emptyLead": "Bez nut YuE2 sam pisze melodię. Z nutami śpiewa twoją.",
      "emptyTitle": "Jeszcze nie ma nut",
      "fromSong": "Z utworu",
      "fromSongDots": "Z utworu…",
      "hasScore": "formularz ma partyturę",
      "importMidi": "Importuj MIDI",
      "open": "Otwórz nuty",
      "openHere": "Nuty są otwarte po prawej.",
      "openNote": "Zmiany w nutach trafiają prosto do formularza — naciśnij «{button}», a YuE2 je weźmie.",
      "openSection": "Otwórz tę sekcję w Nutach",
      "openTakeTip": "Partytura tej wersji w przestrzeni Nuty — słuchaj, porównuj, edytuj, a potem wstaw ją do formularza, jeśli chcesz",
      "rail": "Nuty",
      "railTip": "Nuty YuE2 — edytor partytury po prawej, w miejsce Sesji",
      "remarks": "Uwagi ze sprawdzenia ({n}): {list} | Uwagi ze sprawdzenia ({n}): {list}",
      "takeTitle": "{title} · Wersja {n}"
    },
    "rail": {
      "ace_step": "ACE",
      "generate": "Utwórz",
      "lora": "LoRA",
      "models": "Modele",
      "stable_audio": "Dźwięk",
      "yue2": "YuE2"
    },
    "reuse": "Powtórz z tymi ustawieniami",
    "reuseInForm": "Powtórz z tymi ustawieniami"
  },
  "editor": {
    "clipInTrash": "Utwór w koszu",
    "clipInTrashHint": "Utwór tego klipu jest w koszu biblioteki: wciąż gra, ale kosz usuwa go na zawsze po 30 dniach.",
    "guide": {
      "clip": [
        "Przeciąganie przesuwa klip, krawędzie go przycinają. Przebieg fali nie jest ściskany podczas przycinania: widzisz dokładnie pozostałe audio. Plik źródłowy nigdy się nie zmienia.",
        "Przyciski na klipie leżą nad przebiegiem fali i pojawiają się po najechaniu lub gdy klip jest zaznaczony; włączone są widoczne zawsze. M wycisza klip, S zostawia słyszalny tylko jego, W dopasowuje go do tempa projektu, krzyżyk go usuwa.",
        "Uchwyty na krawędziach ustawiają fade'y. Bez nich każda krawędź dostaje mikro-fade 15 ms, żeby cięcie nie trzaskało.",
        "Narzędzia w pasku transportu: Zaznacz (V) przesuwa i przycina klipy, Nóż (C) tnie klip tam, gdzie klikniesz, Gumka (E) usuwa kawałek, po którym przeciągniesz, albo cały klip po kliknięciu. Nóż i Gumka przyciągają do siatki i krawędzi klipów; Esc wraca do Zaznacz.",
        "S tnie zaznaczony klip w miejscu kursora odtwarzania albo każdy klip pod kursorem, gdy nic nie jest zaznaczone. Ctrl+D wstawia kopię zaraz za klipem.",
        "Klipy są półprzezroczyste: siatka osi czasu prześwituje przez nie."
      ],
      "lane": [
        "Zmień nazwę ścieżki prosto w jej nagłówku. M ją wycisza, S zostawia słyszalną tylko ją.",
        "Kolor: zaznacz ścieżkę i kliknij kropkę nad listą ścieżek.",
        "Ścieżkę z całym utworem można rozdzielić na stemy przyciskiem obok M i S: wokal, perkusja, bas i reszta ją zastępują.",
        "Krzyżyk usuwa ścieżkę; Ctrl+Z ją przywraca.",
        "Wysokość ścieżek ustawia suwak ze strzałkami w pasku transportu albo Alt i kółko myszy: im wyższa ścieżka, tym większy przebieg fali. Jedna wysokość dla wszystkich ścieżek."
      ],
      "steps": [
        {
          "title": "Dodaj ścieżki",
          "text": "Przycisk «Ścieżka» otwiera bibliotekę: dodaj utwór w całości lub jako stemy. Plik z komputera można upuścić prosto na ścieżkę."
        },
        {
          "title": "Ułóż klipy",
          "text": "Przeciągaj klipy i przycinaj je za krawędzie. Nóż (C) tnie klip tam, gdzie klikniesz, Gumka (E) usuwa kawałek, po którym przeciągniesz. Fade'y ciągnie się za uchwyty na krawędziach klipów."
        },
        {
          "title": "Dopasuj tempo",
          "text": "Pole BPM ustawia tempo projektu, przycisk W na klipie dopasowuje go do tego tempa. «Magnes» włącza przyciąganie do siatki, a przełącznik «0:00 | 1 | 2» wybiera, co liczą linijka i siatka: sekundy czy takty."
        },
        {
          "title": "Miksuj",
          "text": "Głośność i panorama ścieżki, osiem efektów na każdej ścieżce i na masterze. Przycisk «Mikser» pokazuje mikser."
        },
        {
          "title": "Zapisz",
          "text": "Nie ma autozapisu: «Zapisz» albo Ctrl+S. Jeśli opuszczasz stronę z niezapisanymi zmianami, edytor ostrzega."
        },
        {
          "title": "Eksportuj",
          "text": "WAV lub MP3 do biblioteki albo stemy z projektem Reaper lub DAWproject, aby dokończyć we własnym DAW."
        }
      ],
      "tempo": [
        "Tempo klipu jest wykrywane przy dodawaniu, z jego pierwszych 30 sekund. Detektor jest prosty i na złożonym materiale może się pomylić.",
        "W rozciąga klip do BPM projektu bez zmiany wysokości dźwięku.",
        "Klipy przyklejają się do krawędzi innych klipów i do początku osi czasu. «Magnes» dodaje przyciąganie do siatki. Przełącznik «0:00 | 1 | 2» wybiera, co liczą siatka i linijka: sekundy albo takty i miary według BPM projektu (4/4). Krok siatki podąża za powiększeniem; linie przy znacznikach linijki są jaśniejsze.",
        "«Pętla» powtarza obszar na linijce: przesuń go w całości albo przeciągnij jego krawędzie. Ten sam obszar jest zaznaczeniem dla aranżera AI. Kliknij linijkę, aby przewinąć."
      ]
    },
    "help": {
      "title": "Pomoc do edytora"
    },
    "hotkeys": {
      "keys": [
        {
          "keys": "Space",
          "action": "Odtwarzaj i wstrzymaj"
        },
        {
          "keys": "S",
          "action": "Potnij klip w miejscu kursora odtwarzania"
        },
        {
          "keys": "V / C / E",
          "action": "Narzędzie: zaznacz, nóż, gumka"
        },
        {
          "keys": "Del",
          "action": "Usuń zaznaczony klip"
        },
        {
          "keys": "Ctrl+D",
          "action": "Zduplikuj zaznaczony klip"
        },
        {
          "keys": "Ctrl+Z",
          "action": "Cofnij, do 30 kroków"
        },
        {
          "keys": "Ctrl+Y / Ctrl+Shift+Z",
          "action": "Ponów"
        },
        {
          "keys": "Ctrl+S",
          "action": "Zapisz projekt"
        },
        {
          "keys": "Esc",
          "action": "Wyczyść zaznaczenie i wróć do narzędzia Zaznacz"
        },
        {
          "keys": "← →",
          "action": "Kursor odtwarzania o jeden krok siatki, o cztery z Shift"
        },
        {
          "keys": "Home / End",
          "action": "Na początek lub na koniec"
        },
        {
          "keys": "+ / −",
          "action": "Powiększenie"
        },
        {
          "keys": "Tab",
          "action": "Następny klip, ścieżka lub uchwyt"
        }
      ],
      "mouse": [
        {
          "keys": "Ctrl+kółko",
          "action": "Powiększenie"
        },
        {
          "keys": "Alt+kółko",
          "action": "Wysokość ścieżki"
        },
        {
          "keys": "Kliknięcie nożem",
          "action": "Potnij klip w tym miejscu"
        },
        {
          "keys": "Przeciągnięcie gumką",
          "action": "Usuń ten kawałek klipu; kliknięcie usuwa cały klip"
        },
        {
          "keys": "Shift+przeciągnięcie",
          "action": "Przewijaj oś czasu; środkowy przycisk też działa"
        },
        {
          "keys": "Kliknięcie linijki",
          "action": "Przewiń"
        },
        {
          "keys": "Plik na ścieżkę",
          "action": "Dodaj klip z komputera w tym miejscu"
        }
      ]
    },
    "restoreFromTrash": "Przywróć z kosza",
    "trashedSources": "Klip odtwarza utwór z kosza: {names}. Kosz usuwa go na zawsze po 30 dniach. | Klipy odtwarzają utwory z kosza ({n}): {names}. Kosz usuwa je na zawsze po 30 dniach."
  },
  "footer": {
    "muscriptorNote": "Zamienia utwór lub stem na MIDI. Wagi są wyłącznie do użytku niekomercyjnego; zobacz kartę modelu.",
    "qwenNote": "Asystent promptów: pisze prompt z pomysłu, tytuły i opisy okładek.",
    "sa3Note": "Instrumentale i efekty dźwiękowe. Za darmo do użytku osobistego i komercyjnego poniżej 1 mln USD rocznego przychodu; powyżej potrzebna jest licencja enterprise.",
    "sdcppNote": "Uruchamia model okładek.",
    "sheetsageNote": "Zapisuje melodię utworu jako partyturę (Nuty, «Z utworu…»). Wagi są wyłącznie do użytku niekomercyjnego; zobacz kartę modelu.",
    "zimageNote": "Rysuje okładki. Jego enkoder tekstu Qwen3-4B-Instruct również ma licencję Apache-2.0."
  },
  "header": {
    "guide": {
      "map": {
        "ace": "Szybkie piosenki i instrumentale z opisu, tagów i tekstu; z utworem referencyjnym także cover, przemalowany fragment, dodana lub wyjęta partia, kontynuacja.",
        "sa3": "Instrumentale i efekty dźwiękowe z opisu, szybko. W aranżerze AI edytora przemalowuje, kontynuuje i robi covery, słuchając audio wokół zakresu.",
        "yue": "Pisze całą piosenkę z wokalem i potrafi zbudować ją wokół zadanej melodii (karta Melodia i przestrzeń Nuty, z SheetSage2). Zamienia też utwór na MIDI."
      },
      "steps": [
        {
          "title": "Wybierz silnik",
          "text": "Przejdź do Utwórz: silniki są po lewej, YuE2, ACE-Step i Stable Audio. Na pierwszą piosenkę z wokalem weź YuE2. Startuje przy pierwszym naciśnięciu Utwórz; pierwszy start trwa kilka minut."
        },
        {
          "title": "Opisz piosenkę",
          "text": "Na karcie Utwór wpisz tekst i styl albo zapisz pomysł jednym zdaniem w linii nad formularzem, a asystent wypełni pola. Wybierz długość i liczbę wersji."
        },
        {
          "title": "Wybierz najlepszą wersję",
          "text": "Wersje ustawiają się na liście sesji obok formularza (pod nim na telefonie). Wszystko, co powstało, samo zapisuje się w bibliotece."
        },
        {
          "title": "Rozdziel na stemy",
          "text": "Wokal, perkusja, bas i reszta jednym kliknięciem: Rozdziel na stemy w menu wersji, karta Stemy i nuty w bibliotece albo prosto w edytorze."
        },
        {
          "title": "Zbuduj w edytorze",
          "text": "Rozmieść stemy na ścieżkach, dodaj partie aranżerem AI, ustaw efekty."
        },
        {
          "title": "Eksportuj",
          "text": "Zgraj miks do WAV lub MP3 albo wyeksportuj ścieżki z projektem Reaper lub DAWproject."
        }
      ],
      "tips": [
        "Nie wiesz, jak opisać styl? Zacznij na stronie głównej: opisz muzykę jednym zdaniem, asystent napisze prompt, a ty go poprawisz.",
        "Blisko, ale jeszcze nie to? Przemalowanie jednej sekcji bywa szybsze niż generowanie od nowa.",
        "Utwór referencyjny dla covera lub nowej partii może pochodzić prosto z biblioteki.",
        "Każda sekcja ma własny przycisk pomocy; edytor ma też osobną ściągawkę skrótów.",
        "Edytor nie zapisuje automatycznie: naciśnij Zapisz, zanim opuścisz stronę; jeśli zapomnisz, edytor zapyta."
      ]
    },
    "helpSections": {
      "covers": {
        "text": "Okładkę rysuje na tym komputerze model Z-Image Turbo. Zaznacz Zrób okładkę pod formularzem, a jedna okładka dla wszystkich wersji pojawi się po piosence; albo zrób ją później przyciskiem na karcie utworu w bibliotece, także dla kilku zaznaczonych utworów naraz. Zaprojektuj okładkę zmienia opis obrazu i dodaje napis z tytułem. Model okładek instaluje się osobno: zobacz Modele i ustawienia.",
        "title": "Okładki"
      },
      "downloads": {
        "text": "Utwór pobiera się jako MP3 (320 kbit/s, z okładką i tagami, gra wszędzie), FLAC (bezstratny, z okładką i tagami) lub WAV (źródło dla DAW, bez okładki). Format wybierasz w menu Pobierz przy wersji lub utworze, jest zapamiętywany; można go też ustawić w Modele i ustawienia, Ogólne. Nazwa wykonawcy trafia do tagów.",
        "title": "Formaty pobierania"
      },
      "engines": {
        "text": "Dźwięk generują trzy silniki, YuE2-3B, ACE-Step 1.5 i Stable Audio 3, a razem nie mieszczą się na jednym GPU, więc działa jeden naraz. Wybierz silnik na stronie Utwórz: startuje, gdy naciśniesz Utwórz, a działający zatrzymuje się sam. Lampka pokazuje jego stan; pierwszy start może trwać kilka minut, gdy model ładuje się do pamięci wideo. Przycisk stanu w nagłówku pokazuje, co zajmuje GPU, i może to zwolnić."
      },
      "library": {
        "text": "Każdy utwór, wygenerowany, wgrany czy wyeksportowany z edytora, trafia do jednej wspólnej biblioteki, z której korzysta każdy moduł, więc utwór z dowolnego silnika można rozdzielić na stemy, przepisać i zmiksować bez wychodzenia z aplikacji."
      },
      "notes": {
        "more": "Więcej o nutach",
        "text": "Nuty to przestrzeń robocza YuE2: przycisk Nuty pod YuE2 w pasku Utwórz. Pokazuje i edytuje melodię piosenki jako partyturę; partytura może pochodzić z gotowego utworu (Z utworu…, SheetSage2) lub z pliku MIDI i trafia do formularza YuE2 na karcie Melodia.",
        "title": "Nuty"
      },
      "trash": {
        "text": "Usunięte utwory trafiają do kosza biblioteki i zostają tam na 30 dni: przywróć je stamtąd albo usuń na zawsze. Zaznacz kilka utworów, aby naraz przenieść je do kosza, otagować, zrobić okładki lub nadać im nazwy. Biblioteka filtruje po tagach.",
        "title": "Kosz i tagi"
      }
    }
  },
  "home": {
    "allTracks": "Otwórz bibliotekę"
  },
  "idea": {
    "languageAutoIdea": "Auto (z pomysłu)",
    "writer": "Kto pisze tekst i styl:",
    "writerAce": "sam ACE-Step"
  },
  "libraryPage": {
    "filters": {
      "midi": "MIDI",
      "score": "Nuty"
    },
    "filtersToggle": "Filtry",
    "openEditor": "Otwórz w edytorze",
    "openEditorFailed": "Nie udało się otworzyć w edytorze: {error}",
    "openEditorHint": "Nowy projekt edytora z tym utworem na ścieżce",
    "promptTitle": "Utwór nie ma własnej nazwy: pokazano linijkę jego tekstu.",
    "score": {
      "download": "Pobierz .abc",
      "failed": "Nie udało się wczytać nut: {error}",
      "hint": "Partytura ABC, z której YuE2 zaśpiewał ten utwór",
      "open": "Otwórz w Nutach",
      "openHint": "Kopia partytury w Nutach na stronie Utwórz; nuty formularza zostają, jak były",
      "title": "Nuty"
    },
    "trash": {
      "loading": "Wczytywanie…"
    },
    "usage": {
      "bulk": "Utwory użyte w projektach edytora: {n}. {names}. W koszu nadal będą grać, ale jeśli opróżnisz kosz, ich klipy w projektach znikną. Usunąć?",
      "more": " (i jeszcze {n})",
      "purge": "Usunąć na zawsze? Używany w projektach edytora: {names}. Jego klipy w projektach znikną.",
      "single": "Utwór jest użyty w projekcie edytora «{name}»{more}. W koszu nadal będzie grał, ale jeśli opróżnisz kosz, klip w projekcie zniknie. Usunąć?"
    },
    "yueLicence": "YuE2: licencja niekomercyjna (CC BY-NC 4.0)",
    "yueLicenceHint": "Piosenek YuE2 nie wolno sprzedawać ani używać komercyjnie. Szczegóły: Modele i licencje."
  },
  "midiPanel": {
    "recognize": "Nuty do MIDI"
  },
  "models": {
    "general": {
      "artist": "Nazwa wykonawcy",
      "artistHint": "Zapisywana w tagach pobranych utworów. Ta sama nazwa co w stopce.",
      "artistSave": "Zapisz",
      "artistSaved": "Zapisano",
      "autoCover": "Zrób okładkę po piosence",
      "autoCoverHint": "Wartość początkowa pola Zrób okładkę pod formularzami silników.",
      "autoCoverOff": "Okładki są wyłączone albo ich model nie jest zainstalowany: zobacz Okładki.",
      "formatHint": "Format przycisków Pobierz w sesji i bibliotece. Format wybrany w menu pobierania jest tu również zapamiętywany.",
      "languageHint": "Ten sam wybór co przycisk języka w nagłówku.",
      "nav": "Ogólne",
      "title": "Ustawienia ogólne"
    },
    "showMore": "Jeszcze {n}, niepobrane: {names} ▾"
  },
  "notesHelp": {
    "actions": {
      "checks": "Pokaż sprawdzenie",
      "draw": "Otwórz «Narysuj od zera»",
      "musicianOff": "Ukryj cyfry rzymskie",
      "musicianOn": "Pokaż cyfry rzymskie",
      "simple": "Otwórz widok prosty",
      "snapIsOn": "«W tonacji» jest włączone",
      "snapOn": "Włącz «W tonacji»"
    },
    "fig": {
      "at": "tempo 95, 4/4",
      "barTime": "1 takt ≈ 2,5 s",
      "beats": "4 miary: raz-dwa-trzy-cztery",
      "brk": "przerwa",
      "chordsTitle": "Akordy nad taktami",
      "counter": "5 sylab · 6 nut",
      "fourBars": "4 takty ≈ 10 s",
      "higher": "wyżej",
      "inKey": "nuty tonacji",
      "ins": "Instrument",
      "intro": "intro",
      "longer": "długa nuta",
      "lower": "niżej",
      "lyricsTags": "Tagi w tekście",
      "melisma": "przeciągnięta",
      "octaveNote": "męski głos śpiewa oktawę niżej niż zapisane nuty",
      "offKey": "poza tonacją",
      "partsRibbon": "Części w nutach",
      "pause": "pauza",
      "picker": "Pasujące",
      "shorter": "krótka",
      "sing": "głos śpiewa",
      "snapped": "ląduje tutaj",
      "sung": "zaśpiewane",
      "syllables": [
        "Ty",
        "je",
        "steś",
        "mo",
        "im"
      ],
      "time": "czas →",
      "vocal": "Wokal",
      "written": "zapisane"
    },
    "firstTime": "Pierwszy raz z nutami?",
    "open": "Pomoc do nut",
    "openTip": "Prostymi słowami: jak narysować melodię i jak YuE2 ją śpiewa",
    "sections": {
      "checks": {
        "head": {
          "check": "Co mówi",
          "fix": "Co zrobić",
          "means": "Co to znaczy"
        },
        "intro": "Sprawdzenie to pasek na dole Nut: kliknij go, aby otworzyć listę. Żółty znaczy «warto spojrzeć», zielony «wszystko dobrze», szary to zwykła uwaga. Gdy poprawka jest oczywista, jest przycisk Popraw; Pokaż zaznacza nuty lub takty, o które chodzi. Ctrl+Z cofa każdą poprawkę.",
        "rows": [
          {
            "check": "Brak tonacji lub tempa",
            "means": "YuE2 nie wie, w jakiej tonacji i jak szybko śpiewać.",
            "fix": "Wybierz je na chipach u góry."
          },
          {
            "check": "Takty bez akordu",
            "means": "YuE2 jest przyzwyczajony do akordu w każdym takcie.",
            "fix": "Naciśnij Popraw bez obaw: poprzedni akord przechodzi na puste takty."
          },
          {
            "check": "Wokal nie ma nut",
            "means": "Nie ma melodii — YuE2 wymyśli ją sam.",
            "fix": "Narysuj melodię ołówkiem albo użyj jednego z szybkich startów."
          },
          {
            "check": "Mniej nut niż sylab w tekście",
            "means": "Znacznie mniej nut niż sylab: YuE2 dopowie resztę i może odejść od twoich nut.",
            "fix": "Dopisz nuty (w widoku prostym przyciskiem «dodaj») albo użyj «Z utworu…»."
          },
          {
            "check": "Nuty powyżej lub poniżej głosu",
            "means": "Trudne dla śpiewaka; YuE2 może się męczyć albo zmieniać oktawy.",
            "fix": "Najpierw sprawdź, czy wybrany jest właściwy głos, męski czy żeński. Potem naciśnij Popraw: melodia przesunie się o oktawy do zakresu."
          },
          {
            "check": "Części nie zgadzają się z tekstem",
            "means": "W nutach jest więcej lub mniej części niż tagów w tekście: wersy trafiają w złe miejsca.",
            "fix": "Popraw dodaje brakujące części na końcu — potem sprawdź kolejność. Zbędne części usuń sam albo dostosuj tagi w tekście."
          },
          {
            "check": "Instrument gra razem z głosem",
            "means": "To uwaga, nie błąd: zwykle instrument milczy, gdy śpiewa głos.",
            "fix": "Nic, jeśli tak ma być. W przeciwnym razie wymaż nuty instrumentu w tych taktach."
          },
          {
            "check": "ABC jest długie",
            "means": "Bardzo długi zapis nut zajmuje dużo miejsca w prompcie YuE2.",
            "fix": "Skróć utwór albo usuń zbędne nuty instrumentu."
          }
        ],
        "tip": "Zielone pozycje niczego nie wymagają. Gdy nie zostanie żadnych uwag, możesz nacisnąć Utwórz.",
        "title": "Sprawdzenie dla YuE2",
        "toc": "Sprawdzenie dla YuE2"
      },
      "chords": {
        "note": "YuE2 używa akordów tylko z planem «Melodia i akordy». Z planem «Podążaj za melodią» model sam dobiera akompaniament, a twoje akordy zostają podpowiedzią dla ciebie.",
        "p": [
          "<b>Akord</b> to kilka dźwięków zagranych razem. Na nim opiera się akompaniament: gitara, klawisze, bas. Akordy stoją w rzędzie nad nutami, zwykle jeden na takt.",
          "Kliknij akord taktu (albo puste miejsce w rzędzie), aby wybrać inny. Na początku są <b>pasujące</b>: akordy twojej tonacji, których YuE2 trzyma się najlepiej. Niżej są «Częste w molu» lub «Częste w durze» oraz «Więcej» do eksperymentów. «Posłuchaj» odtwarza akord, «Dwa w takcie» dzieli takt na dwa akordy.",
          "Nie wiesz, co wybrać? Zostaw to, co wstawia «Narysuj od zera»: sprawdzony ciąg czterech akordów.",
          "<b>Dla muzyków</b> — przełącznik pod siatką pokazuje przy akordach cyfry rzymskie (I, IV, V, vi…): stopień akordu w tonacji. To dla tych, którzy znają teorię; reszta może go nie używać."
        ],
        "title": "Akordy",
        "toc": "Akordy"
      },
      "faq": {
        "items": [
          {
            "q": "Czy muszę umieć czytać nuty?",
            "a": "Nie. Wystarczy usłyszeć «wyżej — niżej» i «dłużej — krócej». Włącz «W tonacji», a nie będzie fałszywych nut."
          },
          {
            "q": "Dlaczego męski głos śpiewa niżej, niż narysowano?",
            "a": "YuE2 zapisuje męskie melodie oktawę wyżej, niż się je śpiewa. To normalne; nie trzeba obniżać nut."
          },
          {
            "q": "Czy nuty są gdzieś zapisywane?",
            "a": "Tak, to nuty formularza: każda zmiana trafia od razu do formularza, a Ctrl+Z ją cofa. Osobnego zapisu nie ma — naciśnij Utwórz i YuE2 je weźmie."
          },
          {
            "q": "Jak długi będzie utwór?",
            "a": "Tak długi jak jego takty. Przy tempie 95 w 4/4 takt trwa około 2,5 sekundy: 16 taktów to około 40 sekund, 64 takty około 2,7 minuty."
          },
          {
            "q": "Dlaczego YuE2 nie zaśpiewał dokładnie moich nut?",
            "a": "Model trzyma się nut blisko, ale to nie syntezator: może ozdobić melodię, przesunąć sylabę, zaśpiewać oktawę niżej. Jeśli bardzo się różni, zobacz przepis «Utwór nie trzyma się nut»."
          },
          {
            "q": "Czy muszę rysować perkusję i bas?",
            "a": "Nie. Tylko głos i, jeśli chcesz, linię instrumentu w intro i przerwach. Resztę YuE2 zagra ze stylu."
          },
          {
            "q": "Co to za tekst ABC na dole?",
            "a": "Te same nuty zapisane literami — to właśnie dostaje YuE2. Edytor pisze go sam; edytuj ręcznie tylko wtedy, gdy znasz format."
          },
          {
            "q": "Jak posłuchać bez tworzenia utworu?",
            "a": "Odtwarzaj (Space) gra nuty na pianinie. Metronom wybija miary, Pętla powtarza zaznaczone takty."
          },
          {
            "q": "Czy mogę wziąć nuty gotowej wersji?",
            "a": "Tak: «Otwórz nuty» przy wersji otwiera je jako kopię. Edytuj, słuchaj i naciśnij «Do formularza», aby zrobić z nich nową wersję."
          }
        ],
        "title": "Najczęstsze pytania",
        "toc": "Pytania"
      },
      "key": {
        "p": [
          "<b>Tonacja</b> to zestaw siedmiu dźwięków, które do siebie pasują. Melodia z nich brzmi dobrze, a dźwięk spoza zestawu drażni jak fałszywa nuta.",
          "<b>Moll</b> brzmi smutniej i bardziej dramatycznie, <b>dur</b> jaśniej i radośniej. Litera (C, D, A…) to dźwięk, od którego zaczyna się zestaw. Na słuch prawie nie ma to znaczenia; liczy się to, czy wygodnie się śpiewa.",
          "Wiersze siatki należące do tonacji są podświetlone. Włącz <b>«W tonacji»</b>, a ołówek nie pozwoli postawić fałszywej nuty: trafi ona w najbliższy pasujący wiersz. To najłatwiejszy sposób, by nigdy nie fałszować. Potrzebna nuta spoza tonacji? Przytrzymaj Shift.",
          "Tonację zmienia się na chipie Tonacja u góry. Z włączonym «Przesuń też nuty i akordy» cały utwór się przesuwa i brzmi wyżej lub niżej."
        ],
        "tempo": [
          "<b>Tempo</b> to liczba uderzeń na minutę (BPM). 70–90 jest spokojne, 95–120 umiarkowane, 130 i więcej szybkie. YuE2 bierze tempo z nut; tempo w tekście stylu nie działa.",
          "<b>Metrum</b> to liczba miar w takcie. 4/4 to prawie cały pop i rock, 3/4 walc, 6/8 kołyszące wrażenie, ballady. Nie wiesz? Zostaw 4/4.",
          "<b>Długość</b> to liczba taktów utworu. Dźwięk podąża za nutami: 8 taktów 4/4 przy tempie 95 to około 20 sekund."
        ],
        "tempoTitle": "Tempo i metrum",
        "title": "Tonacja, tempo i metrum",
        "toc": "Tonacja i tempo"
      },
      "lanes": {
        "p": [
          "Nuty mają dwie ścieżki. <b>Wokal</b> (nuty fioletowo-różowe) to to, co śpiewa śpiewak. <b>Instrument</b> (morski) to jedna linia melodyczna instrumentu: intro, przerwy, zakończenie.",
          "Ołówek pisze na aktywnej ścieżce — kliknij drugą, aby przełączyć. «Wycisz» i «Tylko ta ścieżka» zmieniają jedynie to, co słychać tutaj; nie wpływają na utwór.",
          "<b>Dlaczego instrument zwykle milczy, gdy śpiewa głos.</b> Tak są zrobione własne partytury YuE2: instrument wypełnia miejsca bez głosu. Jeśli gra na śpiewie, YuE2 może pomylić, co śpiewać. Sprawdzenie wskazuje takie takty — to uwaga, nie błąd.",
          "Perkusji, basu i akompaniamentu nie trzeba rysować: YuE2 gra je sam ze stylu i akordów."
        ],
        "title": "Wokal i Instrument",
        "toc": "Wokal i Instrument",
        "voice": [
          "Przełącznik Męski / Żeński na ścieżce Wokal ustawia wygodny zakres dla śpiewaka. Nuty poza nim dostają czerwony obrys, a sprawdzenie proponuje je przywrócić. Jeśli w stylu jest female lub female vocals, przełącznik ustawia się sam.",
          "<b>Męski głos YuE2 śpiewa oktawę niżej niż zapisane nuty.</b> To normalne: YuE2 tak zapisuje melodie także we własnych partyturach. Dlatego męska melodia w edytorze wygląda wysoko — nie obniżaj jej celowo, bo śpiewak spadnie w bas.",
          "Przy imporcie MIDI «Dopasuj oktawę do głosu» robi to przesunięcie za ciebie."
        ],
        "voiceTitle": "Głos męski czy żeński"
      },
      "parts": {
        "p": [
          "Utwór składa się z części: intro, zwrotka, pre-refren, refren, bridge, przejście, outro. W edytorze to kolorowa wstęga nad taktami.",
          "Części są powiązane z tagami w tekście: [Verse] to zwrotka, [Chorus] refren, [Bridge] bridge i tak dalej. Dzięki temu YuE2 wie, które wersy śpiewać w których miejscach nut. Dlatego liczba i kolejność części powinny zgadzać się z tagami w tekście — pilnuje tego sprawdzenie.",
          "Kliknięcie części otwiera jej menu: typ, nazwa, «Powtórz sekcję» (drugi refren w sekundę), «Dodaj sekcję po», «Pokaż całą sekcję», «Usuń razem z taktami». Krawędź części można przeciągać.",
          "<b>«Oznacz części według tekstu».</b> Po imporcie MIDI zwykle nie ma części. Jeśli tekst ma tagi, edytor jednym przyciskiem proponuje oznaczyć nuty według nich: takty są dzielone według tagów tekstu po kolei."
        ],
        "tip": "Typowo dla YuE2: intro i bridge 4–8 taktów, zwrotka i refren 8–16.",
        "title": "Części utworu",
        "toc": "Części utworu"
      },
      "recipes": {
        "intro": "Częste życzenia i co zrobić, krok po kroku.",
        "items": [
          {
            "title": "Chcę refren wyżej",
            "steps": [
              "Pokaż refren: kliknij część Refren → «Pokaż całą sekcję».",
              "Narzędziem Zaznacz obrysuj ramką nuty refrenu na ścieżce Wokal.",
              "Naciśnij ↑: każde naciśnięcie to półton w górę. 3–5 półtonów jest wyraźnie słychać; Shift + ↑ skacze o oktawę.",
              "Albo w widoku prostym: przyciski «Podciągnij o stopień» przy każdym wersie refrenu.",
              "Spójrz na sprawdzenie: nuty nie powinny wychodzić poza zakres głosu."
            ]
          },
          {
            "title": "Utwór nie trzyma się nut",
            "steps": [
              "Sprawdź plan na karcie Melodia: powinien to być «Podążaj za melodią» lub «Melodia i akordy», nie «Bez planu».",
              "Otwórz sprawdzenie. Częste przyczyny to «Mniej nut niż sylab» i «Części nie zgadzają się z tekstem».",
              "Jedna nuta na sylabę: w widoku prostym licznik każdego wersu powinien się zgadzać.",
              "Męski głos śpiewa oktawę niżej niż zapisane nuty — porównuj kształt melodii, nie jej wysokość.",
              "Zrób 2–3 wersje: model wciąż trochę improwizuje i jedna wersja jest zwykle bliższa."
            ]
          },
          {
            "title": "Melodia jest nudna",
            "steps": [
              "Podnieś refren o 3–5 półtonów nad zwrotkę — to sprawia, że «wzlatuje».",
              "Mieszaj długie i krótkie nuty: kilka krótkich, potem jedna długa na końcu wersu.",
              "Dodaj skok: jedna nuta wyraźnie wyżej niż sąsiednie, na najważniejszym słowie.",
              "Powtórz dobrą frazę przez Ctrl+C i Ctrl+V. Powtórzenie sprawia, że melodia wpada w ucho.",
              "Zakończ wers na nucie tonacji (podświetlony wiersz) — fraza brzmi wtedy na skończoną."
            ]
          },
          {
            "title": "Słowa się nie mieszczą",
            "steps": [
              "Otwórz «Prosty»: zatłoczony wers pokazuje «brakuje nut».",
              "Naciśnij «dodaj» — najdłuższe nuty zostaną podzielone.",
              "Albo sam podziel długie nuty narzędziem Podziel (C).",
              "Jeśli wers wciąż jest ciasny, daj mu więcej miejsca: przeciągnij krawędź części lub użyj «Dodaj sekcję po». Albo skróć wers tekstu."
            ]
          },
          {
            "title": "Chcę melodię innego utworu",
            "steps": [
              "Masz plik audio — «Z utworu…»: SheetSage2 przepisze melodię i akordy.",
              "Masz MIDI — «Importuj MIDI»: wybierz partię wokalną jako Wokal, włącz «Dopasuj oktawę do głosu» i wpisz prawdziwe tempo utworu.",
              "To już wersja YuE2 — «Otwórz nuty» przy wersji, potem «Do formularza».",
              "Po imporcie: «Oznacz części według tekstu», potem sprawdzenie.",
              "Twoje słowa prawdopodobnie ułożą się inaczej niż w oryginale — dopasuj je w widoku prostym."
            ]
          }
        ],
        "title": "Przepisy",
        "toc": "Przepisy"
      },
      "roll": {
        "head": {
          "key": "Klawisz",
          "what": "Co robi"
        },
        "keys": [
          {
            "key": "Space",
            "what": "Odtwarzaj lub wstrzymaj"
          },
          {
            "key": "Home",
            "what": "Z powrotem na początek"
          },
          {
            "key": "B · V · E · C",
            "what": "Ołówek · Zaznacz · Gumka · Podziel"
          },
          {
            "key": "1 2 3 4 5",
            "what": "Długość nowej nuty: 1/16, 1/8, 1/4, 1/2, cała"
          },
          {
            "key": "6",
            "what": "Pauza zamiast nuty"
          },
          {
            "key": "K",
            "what": "Włącz lub wyłącz «W tonacji»"
          },
          {
            "key": "L",
            "what": "Zapętl zaznaczone takty"
          },
          {
            "key": "F",
            "what": "Pełny ekran"
          },
          {
            "key": "↑ ↓",
            "what": "Zaznaczone nuty o półton w górę lub w dół"
          },
          {
            "key": "Shift + ↑ ↓",
            "what": "Zaznaczone nuty o oktawę w górę lub w dół"
          },
          {
            "key": "← →",
            "what": "Przesuń zaznaczenie (lub kursor) o jeden krok siatki"
          },
          {
            "key": "Shift + ← →",
            "what": "Przesuń o cały takt"
          },
          {
            "key": "Delete",
            "what": "Usuń zaznaczenie"
          },
          {
            "key": "Ctrl + Z · Ctrl + Shift + Z",
            "what": "Cofnij · ponów"
          },
          {
            "key": "Ctrl + C · Ctrl + V",
            "what": "Kopiuj · wklej przy kursorze"
          },
          {
            "key": "Ctrl + D",
            "what": "Zduplikuj zaznaczenie"
          },
          {
            "key": "Ctrl + A",
            "what": "Zaznacz wszystkie nuty ścieżki"
          },
          {
            "key": "Esc",
            "what": "Wyczyść zaznaczenie"
          },
          {
            "key": "Shift przy rysowaniu",
            "what": "Postaw nutę poza tonacją"
          },
          {
            "key": "Alt przy rysowaniu",
            "what": "Wymaż"
          },
          {
            "key": "Ctrl + kółko",
            "what": "Powiększ lub pomniejsz"
          },
          {
            "key": "Shift + kółko",
            "what": "Przewijaj na boki"
          }
        ],
        "keysHint": "Działają, gdy fokus jest w edytorze nut, a nie w polu tekstowym.",
        "keysTitle": "Skróty klawiszowe",
        "p": [
          "Piano roll to pas biegnący od lewej do prawej, jak czas. Każdy słupek na nim to jedna nuta.",
          "<b>Wyżej na ekranie znaczy wyższy dźwięk.</b> Klawisze pianina po lewej pokazują, o jaką nutę chodzi.",
          "<b>Dłuższy słupek znaczy dłuższy dźwięk.</b> Puste miejsce między nutami to pauza: głos milczy.",
          "<b>Takt</b> to odcinek między grubymi pionowymi liniami; numery taktów są u góry. W 4/4 takt ma cztery miary — cztery kroki, do których można klaskać. Przy tempie 95 jeden takt trwa około 2,5 sekundy, więc 16 taktów to mniej więcej 40 sekund utworu.",
          "<b>Siatka</b> to cienkie linie wewnątrz taktu. Nuty do nich przylegają, więc rytm wychodzi równy. Drobniejsza siatka pozwala postawić nutę dokładniej.",
          "<b>Kursor</b> to pionowa linia, od której startuje Odtwarzaj. Kliknij linijkę taktów, aby go ustawić. Przeciągnij po linijce, aby zaznaczyć takty do zapętlenia."
        ],
        "title": "Jak czytać piano roll",
        "toc": "Czytanie piano roll",
        "tools": [
          "<b>Ołówek (B)</b> — kliknięcie stawia nutę wybranej długości; przeciągnięcie w prawo ją wydłuża.",
          "<b>Zaznacz (V)</b> — kliknij nutę albo obrysuj ramką kilka. Zaznaczone nuty można przeciągać, przesuwać strzałkami i zmieniać ich długość za prawą krawędź.",
          "<b>Gumka (E)</b> — kliknij albo przeciągnij po nutach, aby je usunąć. Przytrzymanie Alt zamienia każde narzędzie w gumkę.",
          "<b>Podziel (C)</b> — dzieli nutę na dwie wzdłuż siatki. Przydatne, gdy jeden długi dźwięk ma unieść dwie sylaby.",
          "<b>Długość</b> — długość nowej nuty: 1/4 to jedna miara, 1/8 pół miary, 1/2 dwie miary. «Pauza» rysuje ciszę."
        ],
        "toolsTitle": "Narzędzia",
        "views": [
          "<b>Piano roll</b> — główny widok, w którym rysujesz i edytujesz.",
          "<b>Pięciolinia</b> — te same nuty jak w zeszycie nutowym, dla tych, którzy czytają nuty: do oglądania i słuchania.",
          "<b>Prosty</b> — melodia jako kropki nad tekstem; zobacz «Widok prosty»."
        ],
        "viewsTitle": "Trzy widoki"
      },
      "simple": {
        "p": [
          "«Prosty» to widok dla tych, którym piano roll sprawia trudność. Każdy wers tekstu to karta: kropki stoją nad sylabami, a linia między nimi pokazuje, dokąd idzie melodia — w górę czy w dół.",
          "<b>Przeciągnij kropkę w górę lub w dół</b> (albo wybierz ją i naciśnij ↑ ↓), aby podnieść lub obniżyć nutę. Z «W tonacji» kropka stąpa tylko po nutach tonacji, nigdy poza nią. Kliknięcie sylaby odtwarza jej nutę.",
          "<b>Licznik</b> «5 sylab · 5 nut» pokazuje, czy nut wystarcza na słowa. Najlepiej jedna nuta na sylabę.",
          "<b>«+1 śpiewane jako melizmat»</b> — więcej nut niż sylab: nadmiarowe są śpiewane przeciągnięte na jednej sylabie («jee-e-eah»). To w porządku i często piękne.",
          "<b>«Brakuje nut — dodaj»</b> — więcej sylab niż nut. Przycisk «dodaj» dzieli najdłuższe nuty wersu, aby każda sylaba dostała własną.",
          "Rytm, czyli długości nut, nie zmienia się tutaj — do tego służy piano roll. Przyciski przy wersie odtwarzają go i przesuwają cały wers w górę lub w dół."
        ],
        "title": "Widok prosty: melodia nad słowami",
        "toc": "Widok prosty"
      },
      "start": {
        "also": [
          "<b>Zagraj na pianinie</b> — na ekranowym lub MIDI: nuty zapisują się jedna po drugiej od kursora.",
          "<b>Wklej ABC</b> — jeśli melodia już istnieje jako ABC (menu Import).",
          "<b>Nuty wersji</b> — gotowa wersja YuE2 ma «Otwórz nuty»: jej partytura otwiera się jako kopia. Słuchaj i edytuj ją; formularz się nie zmienia. «Do formularza» przenosi te nuty do formularza, «Zamknij» wraca do nut formularza."
        ],
        "alsoTitle": "Inne sposoby",
        "intro": "Jeszcze nie ma nut? Wszystkie trzy sposoby są na pustym ekranie Nut.",
        "sparse": "YuE2 śpiewa jedną nutę na sylabę. Jeśli transkrypcja MIDI ma znacznie mniej nut, niż tekst ma sylab (automatyczne transkrypcje często tak mają), model musi dopowiedzieć resztę i utwór przestaje trzymać się nut. Sprawdzenie ostrzega o tym. Uzupełnij melodię w piano roll lub widoku prostym — albo weź nuty «Z utworu…».",
        "sparseTitle": "Dlaczego «rzadkie» MIDI daje słabe wyniki",
        "title": "Trzy szybkie starty",
        "toc": "Trzy szybkie starty",
        "ways": [
          {
            "title": "Narysuj od zera",
            "text": "Wybierz tonację, tempo i metrum, a edytor zbuduje szkielet z tekstu: części według tagów [Verse] i [Chorus], odpowiednią liczbę taktów i akordy zastępcze. Zostaje tylko narysować ołówkiem melodię wokalu. Najlepszy sposób, gdy melodia jest w głowie."
          },
          {
            "title": "Z utworu…",
            "text": "Wybierz plik audio, a SheetSage2 przepisze jego melodię, akordy i części. Trwa to minutę lub dwie. Działa najlepiej na utworze z wyraźnym wokalem, bez chóru i szumu. Potem edytuj, jak chcesz."
          },
          {
            "title": "Importuj MIDI",
            "text": "Upuść plik .mid z DAW, programu do notacji lub ze strony. W oknie wyboru wskaż, która partia zostanie Wokalem, a która Instrumentem; perkusja i reszta są odrzucane, a z akordów brana jest najwyższa nuta. «Dopasuj oktawę do głosu» przesuwa melodię tak, jak zapisuje ją YuE2. Pole tempa: transkrypcje często są zapisane w 120 BPM, choć utwór jest szybszy lub wolniejszy — wpisz prawdziwe tempo, a nuty trafią tam, gdzie brzmią."
          }
        ]
      },
      "what": {
        "head": {
          "name": "Plan",
          "text": "Co robi YuE2",
          "when": "Kiedy wybrać"
        },
        "p": [
          "Nuty to melodia utworu narysowana słupkami: jaki dźwięk zaśpiewać, kiedy zacząć i jak długo trzymać. Nie musisz czytać nut — wystarczy słyszeć, który dźwięk jest wyższy, a który niższy.",
          "<b>Bez nut</b> YuE2 sam wymyśla melodię. Każda wersja jest inna i nie da się z góry powiedzieć, jak zostanie zaśpiewany wers.",
          "<b>Z nutami</b> YuE2 śpiewa twoją melodię. W naszych testach model trafiał w narysowane nuty w 98% przypadków, zachowywał wzloty i spadki melodii oraz długość: ile taktów narysujesz, tyle zaśpiewa.",
          "W formularzu nuty są przechowywane jako tekst ABC — te same nuty zapisane literami. Edytor pisze go za ciebie; nie musisz go ruszać."
        ],
        "plans": [
          {
            "name": "Bez planu",
            "text": "Sam wymyśla melodię i akompaniament i od razu przechodzi do dźwięku.",
            "when": "Gdy nie ma nut i chcesz po prostu usłyszeć pomysły. Gdy tylko formularz ma nuty, aplikacja sama przełącza plan na «Podążaj za melodią»."
          },
          {
            "name": "Podążaj za melodią",
            "text": "Śpiewa twoją melodię i sam wymyśla akompaniament. Twoje akordy nie są używane.",
            "when": "Prawie zawsze, gdy narysujesz głos. Najbezpieczniejszy wybór."
          },
          {
            "name": "Melodia i akordy",
            "text": "Bierze i twoją melodię, i twoje akordy.",
            "when": "Gdy wybrałeś akordy i chcesz dokładnie tej harmonii."
          }
        ],
        "plansIntro": "Plan wybiera się w formularzu, na karcie Melodia. Mówi YuE2, co zrobić z twoimi nutami.",
        "plansTitle": "Trzy plany melodii",
        "title": "Czym są nuty i po co YuE2 ich potrzebuje",
        "toc": "Po co nuty"
      }
    },
    "title": "Pomoc do nut",
    "toc": "Spis treści",
    "tocPick": "Rozdział pomocy"
  },
  "player": {
    "mute": "Wycisz",
    "unmute": "Włącz dźwięk",
    "volume": "Głośność"
  },
  "sa3Gen": {
    "promptHint": "Najlepiej działa angielski; asystent Opisz tłumaczy. Podaj gatunek, instrumenty, nastrój i tempo; dla dźwięku jego źródło, jak powstaje i pomieszczenie."
  },
  "score": {
    "checks": {
      "sparseVocal": "Mniej nut niż sylab w tekście — YuE2 dopowie resztę",
      "sparseVocalSub": "Nut: {notes}, sylab: {syllables}. Lepiej dorysuj resztę melodii albo użyj «Z utworu…»"
    },
    "lane": {
      "femaleAbbr": "Żeń.",
      "insShort": "Instr.",
      "maleAbbr": "Męs.",
      "voiceFemale": "Głos: żeński",
      "voiceMale": "Głos: męski"
    },
    "midi": {
      "fitOctave": "Dopasuj oktawę do głosu",
      "fitOctaveHint": "YuE2 zapisuje melodię mniej więcej oktawę wyżej, niż się ją śpiewa, a transkrypcja MIDI ma wysokość śpiewaną. Cała partia wokalna przesuwa się o całe oktawy.",
      "markSections": "Oznacz części według tekstu",
      "movedDown": "Wokal przesunięto w dół (oktawy: {n}). | Wokal przesunięto w dół (oktawy: {n}).",
      "movedUp": "Wokal przesunięto w górę (oktawy: {n}). | Wokal przesunięto w górę (oktawy: {n}).",
      "noSections": "MIDI nie ma części piosenki. Tagi tekstu: {tags}.",
      "octaveDown": "−{n} okt. | −{n} okt.",
      "octaveNone": "oktawa jak w pliku",
      "octaveUp": "+{n} okt. | +{n} okt.",
      "tempoFile": "z pliku",
      "tempoHint": "Plik podaje {bpm} BPM. Transkrypcje często zapisuje się w 120 niezależnie od tempa piosenki: ustaw tempo piosenki, a nuty zostaną ułożone według tego, kiedy brzmią.",
      "tempoTrack": "z utworu «{title}»"
    },
    "overview": {
      "pickHint": "Otwórz te takty w Nutach"
    },
    "toolbar": {
      "musician": "Dla muzyków",
      "musicianTip": "Pokaż stopnie akordów (I, IV, V…) — teoria muzyki dla tych, którzy ją znają"
    },
    "workspace": {
      "backTip": "Wróć do sesji; nuty zostają w formularzu",
      "copyBadge": "kopia wersji",
      "copyBadgeTip": "Kopia nut wersji: formularz nie zmienia się aż do «Do formularza»",
      "copyLead": "Słuchaj i edytuj tutaj — formularz nie zmienia się, dopóki nie naciśniesz «Do formularza». «Zamknij» wraca do nut formularza.",
      "copyTitle": "Nuty wersji «{title}»",
      "form": "Formularz",
      "formBadge": "nuty formularza",
      "formBadgeTip": "To nuty formularza: zmiany trafiają do niego od razu (Ctrl+Z je cofa)",
      "label": "Nuty",
      "replaceConfirm": "Formularz ma już inne nuty. Zastąpić je nutami tej wersji? (Ctrl+Z je przywróci)",
      "title": "Nuty",
      "toForm": "Do formularza"
    }
  },
  "takeCompare": {
    "seed": "Seed {seed}"
  },
  "yueGen": {
    "abcScore": "Nuty",
    "help": {
      "melody": {
        "sources": [
          "Z utworu… — wybierz plik audio, a SheetSage2 zapisze jego melodię i akordy. Najlepiej działa piosenka z wyraźnym wokalem.",
          "Importuj MIDI — najwyższa partia staje się melodią, pozostałe kanały akompaniamentem i akordami, a tonacja jest znajdowana sama. Trzymaj melodię wokalu na osobnej ścieżce.",
          "Pianino — wybierz długość i naciskaj klawisze (poniżej, na lewo od piano roll, albo na klawiaturze MIDI): nuty następują jedna po drugiej.",
          "Z utworu: Nuty do MIDI w menu wersji albo karta Stemy i nuty w bibliotece, potem Do partytury YuE2. Wokal staje się melodią, bas i reszta akompaniamentem."
        ]
      }
    },
    "unloadSheetSage": "Zwolnij kartę graficzną po wydobyciu melodii"
  }
}
