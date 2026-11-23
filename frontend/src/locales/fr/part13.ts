// Notes workspace and help, and the strings added or reworded after part12 (machine-translated from en); merged last, key by key.
export default {
  "aceGen": {
    "closeness": "Proximité avec l’original",
    "closenessHigh": "Plus libre",
    "closenessHint": "À gauche, le résultat garde la mélodie et l’arrangement de la source ; à droite, le modèle change davantage.",
    "closenessLow": "Plus proche de l’original",
    "loraSimple": "LoRA",
    "loraTrain": "Entraîner le vôtre",
    "modelDefault": "{name} (par défaut)",
    "refChoose": "Choisir un fichier",
    "refDrop": "Déposez de l’audio ici ou choisissez-le dans la bibliothèque",
    "refFromLibrary": "De la bibliothèque",
    "refLoading": "Chargement du morceau…",
    "refNeeded": "Choisissez un morceau ici, ou retournez sur l’onglet Morceau pour un nouveau morceau.",
    "refOff": "Prenez un morceau terminé : une reprise, une zone refaite, une partie retirée ou ajoutée. Sans morceau, le formulaire crée un nouveau morceau.",
    "refRemove": "Retirer"
  },
  "aiPart": {
    "guide": {
      "hears": [
        "Les pistes cochées sont mixées en une seule piste stéréo : avec les volumes des pistes, les fondus et l’ajustement du tempo (W), mais sans effets et sans tenir compte des boutons M et S.",
        "Le tempo vient du champ BPM du projet, pas des clips : réglez-le pour qu’il corresponde au matériau. La tonalité vient de « Tonalité » ; sur « Auto », le modèle la trouve lui-même.",
        "ACE-Step ne connaît que le majeur et le mineur. Pour toute autre gamme, le modèle reçoit la tonalité la plus proche et le nom de la gamme dans la description : un indice, pas une garantie.",
        "Les pistes dont les variantes attendent encore un choix ne sont pas proposées : ce sont des brouillons.",
        "Le modèle n’accepte pas une zone de plus de 10 minutes : sélectionnez un fragment plus court."
      ],
      "limits": [
        "« Ajouter une partie » ne fonctionne qu’avec le modèle de base d’ACE-Step (environ 4,8 Go). Dans l’appli de bureau, c’est une option à l’installation ; si elle a été omise, l’arrangeur affiche un bouton Installer. Avec les scripts, setup_models affiche la commande correspondante à la fin.",
        "Le modèle base est plus lent que turbo : sur une RTX 4080, une variante pour un morceau de 2-3 minutes prend environ 10 secondes, et le premier lancement est plus long, le temps de charger le modèle.",
        "Le modèle respecte mieux la tonalité et les accords de ce qu’il entend que les idées rythmiques : « joue dans les creux de la voix » peut ne pas fonctionner.",
        "La qualité du son est celle que donne le modèle. Il n’y a pas de MIDI vers audio : le modèle ne travaille qu’avec de l’audio.",
        "Si xl-base est installé, il apparaît dans la liste des modèles ; sur une carte de 16 Go, il prend presque toute la mémoire vidéo. Pour ajouter des parties, utilisez base : dans les mesures, xl-base a renvoyé du bruit dans environ une variante sur cinq, base dans une sur vingt-cinq.",
        "Écarter le bruit coûte du temps : quand une variante est écartée, la requête est renvoyée et la génération est plus longue. La batterie, les percussions et les effets ne sont pas contrôlés : ils sont bruités par nature."
      ],
      "variants": [
        {
          "term": "Écouter",
          "text": "passe sur cette variante, coupe les autres et joue depuis le début de la zone."
        },
        {
          "term": "Garder",
          "text": "garde la variante et retire les autres. Pour une repeinture, une continuation ou une reprise, la variante gardée remplace l’original dans la zone."
        },
        {
          "term": "Tout retirer",
          "text": "retire toutes les variantes et remet les pistes comme elles étaient."
        },
        {
          "term": "Copie du contexte",
          "text": "marque une variante où le modèle a renvoyé presque le mix qu’il entendait au lieu d’une nouvelle partie. Générez à nouveau."
        },
        {
          "term": "Bruit",
          "text": "marque une variante où le modèle a renvoyé du souffle au lieu d’une partie. L’arrangeur écarte seul ces variantes et en demande de remplacement, jusqu’à deux fois ; la marque ne reste que sur ce qui est revenu après les nouvelles tentatives."
        },
        {
          "term": "Ctrl+Z",
          "text": "annule à la fois l’insertion des variantes et le choix. Les fichiers des variantes écartées ne quittent la bibliothèque qu’à l’enregistrement du projet, et seulement si aucun clip ne les utilise."
        }
      ]
    }
  },
  "covers": {
    "after": {
      "hintSa": "Après la génération : une pochette pour toutes les variantes. Occupe le GPU environ 30 s de plus."
    },
    "studio": {
      "errChanged": "La pochette a été refaite entre-temps. Enregistrez encore une fois.",
      "errLoad": "Impossible de charger l’image de la pochette. Réessayez.",
      "errNoCover": "Ce morceau n’a pas de pochette sur laquelle mettre la légende.",
      "errSave": "Impossible d’enregistrer la légende. Réessayez."
    }
  },
  "create": {
    "failed": "Ça n’a pas marché. Cliquez sur Répéter avec ces réglages, puis de nouveau sur Créer.",
    "madeAt": "à {time}",
    "menu": {
      "midi": "Notes en MIDI"
    },
    "notes": {
      "cardTitle": "Notes",
      "draw": "Dessiner",
      "drawNote": "« Dessiner » ouvre Notes à droite avec un squelette tiré des paroles : des sections d’après les balises [Verse], [Chorus], un accord provisoire par mesure.",
      "emptyLead": "Sans notes, YuE2 écrit lui-même la mélodie. Avec des notes, il chante la vôtre.",
      "emptyTitle": "Pas encore de notes",
      "fromSong": "D’un morceau",
      "fromSongDots": "D’un morceau…",
      "hasScore": "le formulaire a une partition",
      "importMidi": "Importer du MIDI",
      "open": "Ouvrir les notes",
      "openHere": "Les notes sont ouvertes à droite.",
      "openNote": "Les modifications des notes vont directement dans le formulaire : cliquez sur « {button} » et YuE2 les prend.",
      "openSection": "Ouvrir cette section dans Notes",
      "openTakeTip": "La partition de cette variante dans l’espace Notes : écoutez, comparez, modifiez, puis mettez-la dans le formulaire si vous voulez",
      "rail": "Notes",
      "railTip": "Notes YuE2 : l’éditeur de partition à droite, à la place de la Session",
      "remarks": "{n} remarque de la vérification : {list} | {n} remarques de la vérification : {list}",
      "takeTitle": "{title} · Variante {n}"
    },
    "rail": {
      "ace_step": "ACE",
      "generate": "Créer",
      "lora": "LoRA",
      "models": "Modèles",
      "stable_audio": "Son",
      "yue2": "YuE2"
    },
    "reuse": "Répéter avec ces réglages",
    "reuseInForm": "Répéter avec ces réglages"
  },
  "editor": {
    "clipInTrash": "Morceau dans la corbeille",
    "clipInTrashHint": "Le morceau de ce clip est dans la corbeille de la bibliothèque : il se lit encore, mais la corbeille le supprime définitivement au bout de 30 jours.",
    "guide": {
      "clip": [
        "Glisser déplace un clip, ses bords le rognent. La forme d’onde n’est pas écrasée pendant le rognage : vous voyez exactement l’audio qui reste. Le fichier source ne change jamais.",
        "Les boutons d’un clip se superposent à la forme d’onde et s’affichent au survol ou quand le clip est sélectionné ; ceux qui sont activés sont toujours visibles. M coupe le son du clip, S ne laisse que lui audible, W l’ajuste au tempo du projet, la croix le supprime.",
        "Les poignées des bords règlent les fondus. Sans elles, chaque bord reçoit un micro-fondu de 15 ms pour qu’une coupe ne claque pas.",
        "Outils dans le transport : Sélection (V) déplace et rogne les clips, le Couteau (C) coupe un clip là où vous cliquez, la Gomme (E) retire la partie sur laquelle vous glissez, ou le clip entier d’un clic. Le Couteau et la Gomme s’accrochent à la grille et aux bords des clips ; Esc revient à Sélection.",
        "S coupe le clip sélectionné à la tête de lecture, ou tous les clips sous la tête de lecture quand rien n’est sélectionné. Ctrl+D place une copie juste après le clip.",
        "Les clips sont translucides : la grille de la timeline se voit à travers."
      ],
      "lane": [
        "Renommez une piste directement dans son en-tête. M la coupe, S ne laisse qu’elle audible.",
        "Couleur : sélectionnez la piste et cliquez sur un point au-dessus de la liste des pistes.",
        "Une piste qui joue un morceau entier peut être séparée en stems avec le bouton à côté de M et S : la voix, la batterie, la basse et le reste la remplacent.",
        "La croix retire la piste ; Ctrl+Z la ramène.",
        "La hauteur des pistes se règle avec le curseur à flèches dans le transport ou avec Alt et la molette : plus la piste est haute, plus la forme d’onde est grande. Une seule hauteur pour toutes les pistes."
      ],
      "steps": [
        {
          "title": "Ajouter des pistes",
          "text": "Le bouton « Piste » ouvre la bibliothèque : ajoutez un morceau entier ou en stems. Un fichier de votre ordinateur peut être déposé directement sur une piste."
        },
        {
          "title": "Arranger les clips",
          "text": "Faites glisser les clips et rognez-les par leurs bords. Le Couteau (C) coupe un clip là où vous cliquez, la Gomme (E) retire la partie sur laquelle vous glissez. Les fondus se tirent depuis les poignées aux bords des clips."
        },
        {
          "title": "Ajuster le tempo",
          "text": "Le champ BPM règle le tempo du projet, le bouton W d’un clip l’ajuste à ce tempo. « Magnétisme » active l’accrochage à la grille, et le commutateur « 0:00 | 1 | 2 » choisit ce que comptent la règle et la grille : des secondes ou des mesures."
        },
        {
          "title": "Mixer",
          "text": "Volume et panoramique des pistes, huit effets sur chaque piste et sur le master. Le bouton « Mixeur » affiche le mixeur."
        },
        {
          "title": "Enregistrer",
          "text": "Il n’y a pas d’enregistrement automatique : « Enregistrer » ou Ctrl+S. Si vous quittez la page avec des modifications non enregistrées, l’éditeur vous prévient."
        },
        {
          "title": "Exporter",
          "text": "WAV ou MP3 dans la bibliothèque, ou des stems avec un projet Reaper ou DAWproject pour terminer dans votre propre DAW."
        }
      ],
      "tempo": [
        "Le tempo d’un clip est détecté à son ajout, d’après ses 30 premières secondes. Le détecteur est simple et peut se tromper sur un matériau complexe.",
        "W étire le clip au BPM du projet sans changer sa hauteur.",
        "Les clips s’accrochent aux bords des autres clips et au début de la timeline. « Magnétisme » ajoute l’accrochage à la grille. Le commutateur « 0:00 | 1 | 2 » choisit ce que comptent la grille et la règle : des secondes, ou des mesures et des temps au BPM du projet (4/4). Le pas de la grille suit le zoom ; les lignes aux repères de la règle sont plus claires.",
        "« Boucle » répète la zone de la règle : déplacez-la en entier ou faites glisser ses bords. La même zone sert de sélection pour l’arrangeur IA. Cliquez sur la règle pour vous positionner."
      ]
    },
    "help": {
      "title": "Aide de l’éditeur"
    },
    "hotkeys": {
      "keys": [
        {
          "keys": "Espace",
          "action": "Lecture et pause"
        },
        {
          "keys": "S",
          "action": "Couper un clip à la tête de lecture"
        },
        {
          "keys": "V / C / E",
          "action": "Outil : sélection, couteau, gomme"
        },
        {
          "keys": "Suppr",
          "action": "Supprimer le clip sélectionné"
        },
        {
          "keys": "Ctrl+D",
          "action": "Dupliquer le clip sélectionné"
        },
        {
          "keys": "Ctrl+Z",
          "action": "Annuler, jusqu’à 30 étapes"
        },
        {
          "keys": "Ctrl+Y / Ctrl+Shift+Z",
          "action": "Rétablir"
        },
        {
          "keys": "Ctrl+S",
          "action": "Enregistrer le projet"
        },
        {
          "keys": "Esc",
          "action": "Effacer la sélection et revenir à l’outil Sélection"
        },
        {
          "keys": "← →",
          "action": "Tête de lecture d’un pas de grille, de quatre avec Shift"
        },
        {
          "keys": "Home / End",
          "action": "Au début ou à la fin"
        },
        {
          "keys": "+ / −",
          "action": "Zoom"
        },
        {
          "keys": "Tab",
          "action": "Clip, piste ou poignée suivant"
        }
      ],
      "mouse": [
        {
          "keys": "Ctrl+molette",
          "action": "Zoom"
        },
        {
          "keys": "Alt+molette",
          "action": "Hauteur des pistes"
        },
        {
          "keys": "Clic du couteau",
          "action": "Couper le clip à cet endroit"
        },
        {
          "keys": "Glisser de la gomme",
          "action": "Retirer cette partie du clip ; un clic retire le clip entier"
        },
        {
          "keys": "Shift+glisser",
          "action": "Faire défiler la timeline ; le bouton du milieu fonctionne aussi"
        },
        {
          "keys": "Clic sur la règle",
          "action": "Se positionner"
        },
        {
          "keys": "Fichier sur une piste",
          "action": "Ajouter un clip depuis votre ordinateur à cet endroit"
        }
      ]
    },
    "restoreFromTrash": "Restaurer depuis la corbeille",
    "trashedSources": "Un clip joue un morceau de la corbeille : {names}. La corbeille le supprime définitivement au bout de 30 jours. | {n} clips jouent des morceaux de la corbeille : {names}. La corbeille les supprime définitivement au bout de 30 jours."
  },
  "footer": {
    "muscriptorNote": "Transforme un morceau ou un stem en MIDI. Les poids sont réservés à un usage non commercial ; voir la fiche du modèle.",
    "qwenNote": "L’assistant de prompt : écrit le prompt à partir d’une idée, des titres et des descriptions de pochettes.",
    "sa3Note": "Instrumentaux et effets sonores. Gratuit pour un usage personnel et commercial sous 1 M USD de revenu annuel ; au-delà, une licence entreprise est nécessaire.",
    "sdcppNote": "Fait tourner le modèle de pochettes.",
    "sheetsageNote": "Note la mélodie d’un morceau sous forme de partition (Notes, « D’un morceau… »). Les poids sont réservés à un usage non commercial ; voir la fiche du modèle.",
    "zimageNote": "Dessine les pochettes. Son encodeur de texte Qwen3-4B-Instruct est lui aussi sous Apache-2.0."
  },
  "header": {
    "guide": {
      "map": {
        "ace": "Des morceaux et instrumentaux rapides à partir d’une description, de tags et de paroles ; avec un morceau de référence, aussi une reprise, une zone repeinte, une partie ajoutée ou extraite, une continuation.",
        "sa3": "Des instrumentaux et effets sonores à partir d’une description, rapidement. Dans l’arrangeur IA de l’éditeur, il repeint, prolonge et fait des reprises en écoutant l’audio autour de la zone.",
        "yue": "Écrit un morceau entier avec chant et peut le construire autour d’une mélodie donnée (l’onglet Mélodie et l’espace Notes, avec SheetSage2). Il transforme aussi un morceau en MIDI."
      },
      "steps": [
        {
          "title": "Choisir un moteur",
          "text": "Allez dans Créer : les moteurs sont à gauche, YuE2, ACE-Step et Stable Audio. Pour un premier morceau avec chant, prenez YuE2. Il démarre au premier clic sur Créer ; le premier démarrage prend quelques minutes."
        },
        {
          "title": "Décrire le morceau",
          "text": "Sur l’onglet Morceau, saisissez les paroles et le style, ou écrivez l’idée en une phrase dans la ligne au-dessus du formulaire et l’assistant remplit les champs. Choisissez la durée et le nombre de variantes."
        },
        {
          "title": "Choisir la meilleure variante",
          "text": "Les variantes s’alignent dans la liste de la session à côté du formulaire (en dessous sur un téléphone). Tout ce qui est créé est enregistré seul dans la bibliothèque."
        },
        {
          "title": "Séparer en stems",
          "text": "Voix, batterie, basse et le reste en un clic : Séparer en stems dans le menu d’une variante, l’onglet Stems et notes de la bibliothèque, ou directement dans l’éditeur."
        },
        {
          "title": "Construire dans l’éditeur",
          "text": "Disposez les stems sur des pistes, ajoutez des parties avec l’arrangeur IA, réglez les effets."
        },
        {
          "title": "Exporter",
          "text": "Mixez en WAV ou MP3, ou exportez les pistes avec un projet Reaper ou DAWproject."
        }
      ],
      "tips": [
        "Vous ne savez pas comment décrire un style ? Commencez sur la page d’accueil : décrivez la musique en une phrase, l’assistant écrit le prompt et vous le modifiez.",
        "Presque, mais pas tout à fait ? Repeindre une seule zone est souvent plus rapide que de générer à nouveau.",
        "Le morceau de référence pour une reprise ou une nouvelle partie peut venir directement de la bibliothèque.",
        "Chaque section a son propre bouton d’aide ; l’éditeur a aussi une feuille de raccourcis à part.",
        "L’éditeur n’enregistre pas automatiquement : cliquez sur Enregistrer avant de quitter la page ; si vous oubliez, l’éditeur vous le demande."
      ]
    },
    "helpSections": {
      "covers": {
        "text": "Une pochette est dessinée sur cet ordinateur par le modèle Z-Image Turbo. Cochez Créer une pochette sous le formulaire et une pochette pour toutes les variantes vient après le morceau ; ou créez-la plus tard avec le bouton sur la fiche d’un morceau dans la bibliothèque, aussi pour plusieurs morceaux sélectionnés à la fois. Concevoir la pochette change la description de l’image et ajoute une légende avec le titre. Le modèle de pochettes s’installe séparément : voir Modèles et réglages.",
        "title": "Pochettes"
      },
      "downloads": {
        "text": "Un morceau se télécharge en MP3 (320 kbit/s, avec la pochette et les tags, lisible partout), FLAC (sans perte, avec la pochette et les tags) ou WAV (l’original pour une DAW, sans pochette). Choisissez le format dans le menu Télécharger d’une variante ou d’un morceau, il est mémorisé ; on peut aussi le régler dans Modèles et réglages, Général. Le nom de l’artiste va dans les tags.",
        "title": "Formats de téléchargement"
      },
      "engines": {
        "text": "Trois moteurs génèrent l’audio, YuE2-3B, ACE-Step 1.5 et Stable Audio 3, et ils ne tiennent pas ensemble sur un seul GPU : un seul tourne à la fois. Choisissez un moteur sur la page Créer : il démarre quand vous cliquez sur Créer, et celui qui tournait s’arrête seul. Le voyant indique son état ; le premier démarrage peut prendre quelques minutes, le temps que le modèle se charge en mémoire vidéo. Le bouton d’état dans l’en-tête montre ce qui occupe le GPU et peut le décharger."
      },
      "library": {
        "text": "Chaque morceau, qu’il soit généré, importé ou exporté depuis l’éditeur, va dans une bibliothèque commune que tous les modules peuvent utiliser : un morceau créé par n’importe quel moteur peut donc être séparé en stems, transcrit et mixé sans quitter l’appli."
      },
      "notes": {
        "more": "En savoir plus sur les notes",
        "text": "Notes est l’espace de travail de YuE2 : le bouton Notes sous YuE2 dans le rail de Créer. Il affiche et modifie la mélodie du morceau sous forme de partition ; la partition peut venir d’un morceau terminé (D’un morceau…, SheetSage2) ou d’un fichier MIDI et passe dans le formulaire de YuE2, sur l’onglet Mélodie.",
        "title": "Notes"
      },
      "trash": {
        "text": "Les morceaux supprimés vont dans la corbeille de la bibliothèque et y restent 30 jours : restaurez-les de là ou supprimez-les définitivement. Sélectionnez plusieurs morceaux pour les mettre à la corbeille d’un coup, leur ajouter des tags, créer des pochettes ou les nommer. La bibliothèque se filtre par tags.",
        "title": "Corbeille et tags"
      }
    }
  },
  "home": {
    "allTracks": "Ouvrir la bibliothèque"
  },
  "idea": {
    "languageAutoIdea": "Auto (d’après l’idée)",
    "writer": "Qui écrit les paroles et le style :",
    "writerAce": "ACE-Step lui-même"
  },
  "libraryPage": {
    "filters": {
      "midi": "MIDI",
      "score": "Notes"
    },
    "filtersToggle": "Filtres",
    "openEditor": "Ouvrir dans l’éditeur",
    "openEditorFailed": "Impossible d’ouvrir dans l’éditeur : {error}",
    "openEditorHint": "Un nouveau projet d’éditeur avec ce morceau sur une piste",
    "promptTitle": "Le morceau n’a pas de nom propre : une ligne de ses paroles est affichée.",
    "score": {
      "download": "Télécharger .abc",
      "failed": "Impossible de charger les notes : {error}",
      "hint": "La partition ABC à partir de laquelle YuE2 a chanté ce morceau",
      "open": "Ouvrir dans Notes",
      "openHint": "Une copie de la partition dans Notes sur la page Créer ; les notes du formulaire restent telles quelles",
      "title": "Notes"
    },
    "trash": {
      "loading": "Chargement…"
    },
    "usage": {
      "bulk": "{n} morceaux sont utilisés dans des projets d’éditeur : {names}. À la corbeille, ils se liront encore, mais si vous videz la corbeille, leurs clips dans les projets disparaissent. Supprimer ?",
      "more": " (et {n} de plus)",
      "purge": "Supprimer définitivement ? Utilisé dans des projets d’éditeur : {names}. Leurs clips dans les projets disparaîtront.",
      "single": "Le morceau est utilisé dans le projet d’éditeur « {name} »{more}. À la corbeille, il se lira encore, mais si vous videz la corbeille, le clip dans le projet disparaît. Supprimer ?"
    },
    "yueLicence": "YuE2 : licence non commerciale (CC BY-NC 4.0)",
    "yueLicenceHint": "Les morceaux YuE2 ne peuvent pas être vendus ni utilisés commercialement. Détails : Modèles et licences."
  },
  "midiPanel": {
    "recognize": "Notes en MIDI"
  },
  "models": {
    "general": {
      "artist": "Nom de l’artiste",
      "artistHint": "Écrit dans les tags des morceaux téléchargés. Le même nom que dans le pied de page.",
      "artistSave": "Enregistrer",
      "artistSaved": "Enregistré",
      "autoCover": "Créer une pochette après le morceau",
      "autoCoverHint": "La valeur de départ de la case Créer une pochette sous les formulaires des moteurs.",
      "autoCoverOff": "Les pochettes sont désactivées ou leur modèle n’est pas installé : voir Pochettes.",
      "formatHint": "Le format des boutons Télécharger dans la session et la bibliothèque. Un format choisi dans un menu de téléchargement est aussi mémorisé ici.",
      "languageHint": "Le même choix que le bouton de langue dans l’en-tête.",
      "nav": "Général",
      "title": "Réglages généraux"
    },
    "showMore": "{n} de plus, non téléchargés : {names} ▾"
  },
  "notesHelp": {
    "actions": {
      "checks": "Afficher la vérification",
      "draw": "Ouvrir « Dessiner de zéro »",
      "musicianOff": "Masquer les chiffres romains",
      "musicianOn": "Afficher les chiffres romains",
      "simple": "Ouvrir l’affichage simple",
      "snapIsOn": "« Dans la tonalité » est activé",
      "snapOn": "Activer « Dans la tonalité »"
    },
    "fig": {
      "at": "tempo 95, 4/4",
      "barTime": "1 mesure ≈ 2,5 s",
      "beats": "4 temps : un-deux-trois-quatre",
      "brk": "pont",
      "chordsTitle": "Les accords sur les mesures",
      "counter": "5 syll. · 6 notes",
      "fourBars": "4 mesures ≈ 10 s",
      "higher": "plus haut",
      "inKey": "notes de la tonalité",
      "ins": "Instrument",
      "intro": "intro",
      "longer": "note longue",
      "lower": "plus bas",
      "lyricsTags": "Balises dans les paroles",
      "melisma": "tenue",
      "octaveNote": "une voix d’homme chante une octave sous les notes écrites",
      "offKey": "hors tonalité",
      "partsRibbon": "Les sections dans les notes",
      "pause": "silence",
      "picker": "Adaptés",
      "shorter": "courte",
      "sing": "la voix chante",
      "snapped": "se pose ici",
      "sung": "chanté",
      "syllables": [
        "Tu",
        "es",
        "mon",
        "so",
        "leil"
      ],
      "time": "temps →",
      "vocal": "Voix",
      "written": "écrit"
    },
    "firstTime": "Les notes, c’est nouveau pour vous ?",
    "open": "Aide sur les notes",
    "openTip": "En termes simples : comment dessiner une mélodie et comment YuE2 la chante",
    "sections": {
      "checks": {
        "head": {
          "check": "Ce qui est indiqué",
          "fix": "Que faire",
          "means": "Ce que cela signifie"
        },
        "intro": "La vérification est la ligne en bas de Notes : cliquez dessus pour ouvrir la liste. Le jaune veut dire « à regarder », le vert « tout est bon », le gris « simple remarque ». Quand la correction est évidente, un bouton Corriger apparaît ; Afficher sélectionne les notes ou les mesures concernées. Ctrl+Z annule n’importe quelle correction.",
        "rows": [
          {
            "check": "Ni tonalité ni tempo",
            "means": "YuE2 ne sait pas dans quelle tonalité ni à quelle vitesse chanter.",
            "fix": "Choisissez-les sur les pastilles en haut."
          },
          {
            "check": "Mesures sans accord",
            "means": "YuE2 est habitué à un accord à chaque mesure.",
            "fix": "Cliquez sur Corriger sans souci : l’accord précédent se prolonge dans les mesures vides."
          },
          {
            "check": "La voix n’a pas de notes",
            "means": "Il n’y a pas de mélodie : YuE2 en inventera une.",
            "fix": "Dessinez la mélodie au crayon ou utilisez l’un des départs rapides."
          },
          {
            "check": "Moins de notes que de syllabes dans les paroles",
            "means": "Bien moins de notes que de syllabes : YuE2 invente le reste et peut s’écarter de vos notes.",
            "fix": "Ajoutez des notes (dans l’affichage simple, le bouton « ajouter ») ou utilisez « D’un morceau… »."
          },
          {
            "check": "Notes au-dessus ou en dessous de la voix",
            "means": "Difficile pour le chanteur ; YuE2 peut forcer ou changer d’octave.",
            "fix": "Vérifiez d’abord que la bonne voix est choisie, homme ou femme. Cliquez ensuite sur Corriger : la mélodie est ramenée dans la tessiture par octaves."
          },
          {
            "check": "Les sections ne correspondent pas aux paroles",
            "means": "Il y a plus ou moins de sections dans les notes que de balises dans les paroles : les lignes tombent aux mauvais endroits.",
            "fix": "Corriger ajoute les sections manquantes à la fin ; vérifiez ensuite l’ordre. Supprimez vous-même les sections en trop ou ajustez les balises dans les paroles."
          },
          {
            "check": "L’instrument joue en même temps que la voix",
            "means": "Une remarque, pas une erreur : en général l’instrument se tait pendant que la voix chante.",
            "fix": "Rien, si c’est voulu. Sinon, effacez les notes de l’instrument dans ces mesures."
          },
          {
            "check": "L’ABC est long",
            "means": "Une partition très longue occupe une grande part du prompt de YuE2.",
            "fix": "Raccourcissez le morceau ou retirez les notes d’instrument superflues."
          }
        ],
        "tip": "Les lignes vertes n’ont besoin de rien. Quand il ne reste plus de remarques, vous pouvez cliquer sur Créer.",
        "title": "Vérification pour YuE2",
        "toc": "Vérification pour YuE2"
      },
      "chords": {
        "note": "YuE2 n’utilise les accords qu’avec le plan « Mélodie et accords ». Avec « Suivre une mélodie », le modèle choisit lui-même l’accompagnement, et vos accords ne sont qu’un repère pour vous.",
        "p": [
          "Un <b>accord</b> est un ensemble de sons joués ensemble. L’accompagnement s’appuie dessus : guitare, claviers, basse. Les accords sont alignés au-dessus des notes, en général un par mesure.",
          "Cliquez sur l’accord d’une mesure (ou sur un endroit vide de la rangée) pour en choisir un autre. Les <b>adaptés</b> viennent en premier : les accords de votre tonalité, que YuE2 conserve le mieux. Plus bas se trouvent « Courants en mineur » ou « Courants en majeur » et « Plus » pour expérimenter. « Écouter » joue l’accord, « Deux dans une mesure » partage la mesure en deux accords.",
          "Vous ne savez pas quoi choisir ? Gardez ce que met « Dessiner de zéro » : une progression éprouvée de quatre accords.",
          "<b>Pour les musiciens</b> — le commutateur sous la grille affiche les chiffres romains sur les accords (I, IV, V, vi…) : le degré de l’accord dans la tonalité. C’est pour ceux qui connaissent la théorie ; les autres n’en ont pas besoin."
        ],
        "title": "Accords",
        "toc": "Accords"
      },
      "faq": {
        "items": [
          {
            "q": "Faut-il savoir lire la musique ?",
            "a": "Non. Il suffit d’entendre « plus haut — plus bas » et « plus long — plus court ». Activez « Dans la tonalité » et il n’y aura pas de fausses notes."
          },
          {
            "q": "Pourquoi la voix d’homme chante-t-elle plus bas que ce que j’ai dessiné ?",
            "a": "YuE2 écrit les mélodies masculines une octave au-dessus de l’endroit où elles sont chantées. C’est normal ; inutile de baisser les notes."
          },
          {
            "q": "Les notes sont-elles enregistrées quelque part ?",
            "a": "Oui, ce sont les notes du formulaire : chaque modification va directement dans le formulaire, et Ctrl+Z l’annule. Pas d’enregistrement séparé : cliquez sur Créer et YuE2 les prend."
          },
          {
            "q": "Combien de temps durera le morceau ?",
            "a": "Autant que ses mesures. À tempo 95 en 4/4, une mesure dure environ 2,5 secondes : 16 mesures font environ 40 secondes, 64 mesures environ 2,7 minutes."
          },
          {
            "q": "Pourquoi YuE2 n’a-t-il pas chanté exactement mes notes ?",
            "a": "Le modèle suit les notes de près, mais ce n’est pas un synthétiseur : il peut orner la mélodie, décaler une syllabe, chanter une octave plus bas. S’il s’écarte beaucoup, voyez la recette « Le morceau ne suit pas les notes »."
          },
          {
            "q": "Faut-il dessiner la batterie et la basse ?",
            "a": "Non. Seulement la voix et, si vous voulez, une ligne d’instrument dans l’intro et les ponts. YuE2 joue le reste d’après le style."
          },
          {
            "q": "Qu’est-ce que le texte ABC en bas ?",
            "a": "Les mêmes notes écrites en lettres : c’est ce que reçoit YuE2. L’éditeur l’écrit lui-même ; ne le modifiez à la main que si vous connaissez le format."
          },
          {
            "q": "Comment écouter sans créer de morceau ?",
            "a": "Lecture (Espace) joue les notes au piano. Le métronome marque les temps, Boucle répète les mesures marquées."
          },
          {
            "q": "Puis-je reprendre les notes d’une variante terminée ?",
            "a": "Oui : « Ouvrir les notes » sur une variante les ouvre en copie. Modifiez, écoutez et cliquez sur « Vers le formulaire » pour faire une nouvelle variante à partir d’elles."
          }
        ],
        "title": "Questions fréquentes",
        "toc": "FAQ"
      },
      "key": {
        "p": [
          "Une <b>tonalité</b> est un ensemble de sept sons qui vont bien ensemble. Une mélodie faite de ces sons sonne juste, alors qu’un son hors de l’ensemble grince comme une fausse note.",
          "Le <b>mineur</b> sonne plus triste et plus dramatique, le <b>majeur</b> plus lumineux et plus enjoué. La lettre (do, ré, la… ou C, D, A…) est le son d’où part l’ensemble. À l’oreille cela compte à peine ; ce qui compte, c’est que ce soit confortable à chanter.",
          "Les lignes de la grille qui appartiennent à la tonalité sont mises en évidence. Activez <b>« Dans la tonalité »</b> et le crayon ne vous laissera pas poser une fausse note : elle tombe sur la ligne la plus proche qui convient. C’est le moyen le plus simple de ne jamais chanter faux. Besoin d’une note hors tonalité ? Maintenez Shift.",
          "La tonalité se change sur la pastille Tonalité en haut. Avec « Déplace aussi les notes et les accords » activé, tout le morceau se décale et sonne plus haut ou plus bas."
        ],
        "tempo": [
          "Le <b>tempo</b> est le nombre de battements par minute (BPM). 70–90 est calme, 95–120 moyen, 130 et plus rapide. YuE2 prend le tempo dans les notes ; un tempo dans le texte du style n’a aucun effet.",
          "La <b>mesure</b> (signature rythmique) indique combien de temps compte une mesure. 4/4 convient à presque toute la pop et le rock, 3/4 est une valse, 6/8 un balancement, les ballades. Pas sûr ? Gardez 4/4.",
          "La <b>durée</b> est le nombre de mesures du morceau. L’audio suit les notes : 8 mesures en 4/4 à tempo 95 font environ 20 secondes."
        ],
        "tempoTitle": "Tempo et mesure",
        "title": "Tonalité, tempo et mesure",
        "toc": "Tonalité et tempo"
      },
      "lanes": {
        "p": [
          "Les notes ont deux voies. La <b>Voix</b> (notes violet-rose) est ce que chante le chanteur. L’<b>Instrument</b> (turquoise) est une ligne mélodique d’un instrument : l’intro, les ponts, la fin.",
          "Le crayon écrit dans la voie active : cliquez sur l’autre pour changer. « Muet » et « Solo » ne changent que ce que vous entendez ici ; ils n’affectent pas le morceau.",
          "<b>Pourquoi l’instrument se tait en général pendant que la voix chante.</b> C’est ainsi que sont faites les partitions de YuE2 lui-même : l’instrument remplit les endroits sans voix. S’il joue par-dessus le chant, YuE2 peut s’embrouiller sur ce qu’il doit chanter. La vérification signale ces mesures : c’est une remarque, pas une erreur.",
          "La batterie, la basse et l’accompagnement n’ont pas besoin d’être dessinés : YuE2 les joue lui-même d’après le style et les accords."
        ],
        "title": "Voix et Instrument",
        "toc": "Voix et Instrument",
        "voice": [
          "Le commutateur Homme / Femme sur la voie Voix règle une tessiture confortable pour le chanteur. Les notes hors de cette tessiture reçoivent un contour rouge, et la vérification propose de les ramener. Si le style indique une voix féminine, le commutateur se règle tout seul.",
          "<b>La voix d’homme de YuE2 chante une octave sous les notes écrites.</b> C’est normal : YuE2 écrit aussi les mélodies ainsi dans ses propres partitions. Une mélodie masculine paraît donc haute dans l’éditeur ; ne la baissez pas exprès, sinon le chanteur tombe dans les graves.",
          "À l’importation d’un MIDI, « Ramener l’octave à la voix » fait ce décalage pour vous."
        ],
        "voiceTitle": "Voix d’homme ou de femme"
      },
      "parts": {
        "p": [
          "Un morceau est fait de sections : intro, couplet, pré-refrain, refrain, pont, interlude, outro. Dans l’éditeur, ce sont les rubans colorés au-dessus des mesures.",
          "Les sections sont liées aux balises des paroles : [Verse] est un couplet, [Chorus] un refrain, [Bridge] un pont, et ainsi de suite. C’est ainsi que YuE2 sait quelles lignes chanter à quel endroit des notes. Le nombre et l’ordre des sections doivent donc correspondre aux balises des paroles : la vérification y veille.",
          "Un clic sur une section ouvre son menu : type, nom, « Répéter la section » (un deuxième refrain en une seconde), « Ajouter une section après », « Afficher toute la section », « Supprimer avec ses mesures ». On peut faire glisser le bord d’une section.",
          "<b>« Marquer les sections selon les paroles ».</b> Après un import MIDI, il n’y a en général pas de sections. Si les paroles ont des balises, l’éditeur propose de marquer les notes d’après elles en un bouton : les mesures sont découpées selon les balises des paroles, dans l’ordre."
        ],
        "tip": "Usuel pour YuE2 : intro et pont 4–8 mesures, couplet et refrain 8–16.",
        "title": "Sections du morceau",
        "toc": "Sections du morceau"
      },
      "recipes": {
        "intro": "Les envies courantes et ce qu’il faut faire, pas à pas.",
        "items": [
          {
            "title": "Je veux le refrain plus haut",
            "steps": [
              "Affichez le refrain : cliquez sur la section Refrain → « Afficher toute la section ».",
              "Avec Sélection, tracez un cadre autour des notes du refrain dans la voie Voix.",
              "Appuyez sur ↑ : chaque pression monte d’un demi-ton. 3–5 demi-tons s’entendent nettement ; Shift + ↑ saute d’une octave.",
              "Ou dans l’affichage simple : les boutons « Monter d’un degré de la gamme » sur chaque ligne du refrain.",
              "Regardez la vérification : les notes ne doivent pas sortir de la tessiture de la voix."
            ]
          },
          {
            "title": "Le morceau ne suit pas les notes",
            "steps": [
              "Vérifiez le plan sur l’onglet Mélodie : il doit être « Suivre une mélodie » ou « Mélodie et accords », pas « Sans plan ».",
              "Ouvrez la vérification. Les causes courantes sont « Moins de notes que de syllabes » et « Les sections ne correspondent pas aux paroles ».",
              "Une note par syllabe : dans l’affichage simple, le compteur de chaque ligne doit concorder.",
              "Une voix d’homme chante une octave sous les notes écrites : comparez la forme de la mélodie, pas sa hauteur.",
              "Faites 2–3 variantes : le modèle improvise encore un peu, et l’une d’elles est en général plus proche."
            ]
          },
          {
            "title": "La mélodie est ennuyeuse",
            "steps": [
              "Montez le refrain de 3–5 demi-tons au-dessus du couplet : c’est ce qui le fait « décoller ».",
              "Mélangez notes longues et courtes : quelques courtes, puis une note longue en fin de ligne.",
              "Ajoutez un saut : une note nettement plus haute que ses voisines, sur le mot le plus important.",
              "Répétez une bonne phrase avec Ctrl+C et Ctrl+V. La répétition rend une mélodie accrocheuse.",
              "Terminez une ligne sur une note de la tonalité (une ligne mise en évidence) : la phrase sonne alors achevée."
            ]
          },
          {
            "title": "Les paroles ne rentrent pas",
            "steps": [
              "Ouvrez « Simple » : une ligne trop chargée affiche « notes manquantes ».",
              "Cliquez sur « ajouter » : les notes les plus longues sont coupées.",
              "Ou coupez vous-même les notes longues avec l’outil Couper (C).",
              "Si la ligne est encore trop chargée, donnez-lui plus de place : faites glisser le bord de la section ou utilisez « Ajouter une section après ». Ou raccourcissez la ligne de paroles."
            ]
          },
          {
            "title": "Je veux la mélodie d’un autre morceau",
            "steps": [
              "Vous avez un fichier audio — « D’un morceau… » : SheetSage2 transcrit la mélodie et les accords.",
              "Vous avez un MIDI — « Importer du MIDI » : choisissez la partie vocale comme Voix, activez « Ramener l’octave à la voix » et saisissez le vrai tempo du morceau.",
              "C’est déjà une variante de YuE2 — « Ouvrir les notes » sur la variante, puis « Vers le formulaire ».",
              "Après l’import : « Marquer les sections selon les paroles », puis la vérification.",
              "Vos paroles tomberont probablement autrement que dans l’original : ajustez-les dans l’affichage simple."
            ]
          }
        ],
        "title": "Recettes",
        "toc": "Recettes"
      },
      "roll": {
        "head": {
          "key": "Touche",
          "what": "Ce qu’elle fait"
        },
        "keys": [
          {
            "key": "Espace",
            "what": "Lecture ou pause"
          },
          {
            "key": "Home",
            "what": "Retour au début"
          },
          {
            "key": "B · V · E · C",
            "what": "Crayon · Sélection · Gomme · Couper"
          },
          {
            "key": "1 2 3 4 5",
            "what": "Durée d’une nouvelle note : 1/16, 1/8, 1/4, 1/2, ronde"
          },
          {
            "key": "6",
            "what": "Un silence au lieu d’une note"
          },
          {
            "key": "K",
            "what": "Activer ou désactiver « Dans la tonalité »"
          },
          {
            "key": "L",
            "what": "Boucle sur les mesures marquées"
          },
          {
            "key": "F",
            "what": "Plein écran"
          },
          {
            "key": "↑ ↓",
            "what": "Notes sélectionnées d’un demi-ton vers le haut ou le bas"
          },
          {
            "key": "Shift + ↑ ↓",
            "what": "Notes sélectionnées d’une octave vers le haut ou le bas"
          },
          {
            "key": "← →",
            "what": "Déplacer la sélection (ou le curseur) d’un pas de grille"
          },
          {
            "key": "Shift + ← →",
            "what": "Déplacer d’une mesure entière"
          },
          {
            "key": "Delete",
            "what": "Supprimer la sélection"
          },
          {
            "key": "Ctrl + Z · Ctrl + Shift + Z",
            "what": "Annuler · rétablir"
          },
          {
            "key": "Ctrl + C · Ctrl + V",
            "what": "Copier · coller au curseur"
          },
          {
            "key": "Ctrl + D",
            "what": "Dupliquer la sélection"
          },
          {
            "key": "Ctrl + A",
            "what": "Sélectionner toutes les notes de la voie"
          },
          {
            "key": "Esc",
            "what": "Effacer la sélection"
          },
          {
            "key": "Shift en dessinant",
            "what": "Poser une note hors tonalité"
          },
          {
            "key": "Alt en dessinant",
            "what": "Effacer"
          },
          {
            "key": "Ctrl + molette",
            "what": "Zoom avant ou arrière"
          },
          {
            "key": "Shift + molette",
            "what": "Défiler latéralement"
          }
        ],
        "keysHint": "Elles fonctionnent quand le focus est dans l’éditeur de notes, pas dans un champ de texte.",
        "keysTitle": "Raccourcis clavier",
        "p": [
          "Le piano roll est une bande qui va de gauche à droite, comme le temps. Chaque barre qui s’y trouve est une note.",
          "<b>Plus haut à l’écran, son plus aigu.</b> Les touches de piano à gauche indiquent de quelle note il s’agit.",
          "<b>Une barre plus longue, un son plus long.</b> L’espace vide entre les notes est un silence : la voix se tait.",
          "Une <b>mesure</b> est l’intervalle entre les épaisses lignes verticales ; les numéros de mesure sont en haut. En 4/4, une mesure a quatre temps — quatre pas sur lesquels on pourrait taper dans les mains. À tempo 95, une mesure dure environ 2,5 secondes, donc 16 mesures font à peu près 40 secondes de morceau.",
          "La <b>grille</b> est formée des fines lignes à l’intérieur d’une mesure. Les notes s’y accrochent, et le rythme sort régulier. Une grille plus fine permet de placer une note plus précisément.",
          "Le <b>curseur</b> est la ligne verticale où démarre la lecture. Cliquez sur la règle des mesures pour le placer. Faites glisser le long de la règle pour marquer des mesures à répéter en boucle."
        ],
        "title": "Comment lire le piano roll",
        "toc": "Lire le piano roll",
        "tools": [
          "<b>Crayon (B)</b> — un clic pose une note de la durée choisie ; glisser vers la droite l’allonge.",
          "<b>Sélection (V)</b> — cliquez sur une note ou tracez un cadre autour de plusieurs. Les notes sélectionnées peuvent être glissées, déplacées avec les flèches et redimensionnées par leur bord droit.",
          "<b>Gomme (E)</b> — cliquez ou balayez des notes pour les retirer. Maintenir Alt transforme n’importe quel outil en gomme.",
          "<b>Couper (C)</b> — coupe une note en deux sur la grille. Pratique quand un long son doit porter deux syllabes.",
          "<b>Durée</b> — la durée d’une nouvelle note : 1/4 est un temps, 1/8 un demi-temps, 1/2 deux temps. « Silence » dessine du silence."
        ],
        "toolsTitle": "Outils",
        "views": [
          "<b>Piano roll</b> — l’affichage principal, où l’on dessine et modifie.",
          "<b>Partition</b> — les mêmes notes que dans un livre de musique, pour ceux qui lisent les notes : pour regarder et écouter.",
          "<b>Simple</b> — la mélodie sous forme de points au-dessus des paroles ; voir « Affichage simple »."
        ],
        "viewsTitle": "Trois affichages"
      },
      "simple": {
        "p": [
          "« Simple » est l’affichage pour ceux qui trouvent le piano roll difficile. Chaque ligne de paroles est une carte : des points se tiennent au-dessus des syllabes, et la ligne qui les relie montre où va la mélodie — vers le haut ou vers le bas.",
          "<b>Faites glisser un point vers le haut ou le bas</b> (ou choisissez-le et appuyez sur ↑ ↓) pour monter ou baisser la note. Avec « Dans la tonalité », le point ne passe que par les notes de la tonalité, jamais hors d’elle. Un clic sur une syllabe joue sa note.",
          "Le <b>compteur</b> « 5 syll. · 5 notes » montre s’il y a assez de notes pour les paroles. Le mieux est une note par syllabe.",
          "<b>« +1 chantée en mélisme »</b> — plus de notes que de syllabes : les notes en trop sont chantées étirées sur une seule syllabe (« yeah-eah-eah »). C’est très bien et souvent joli.",
          "<b>« Notes manquantes — ajouter »</b> — plus de syllabes que de notes. Le bouton « ajouter » coupe les notes les plus longues de la ligne pour que chaque syllabe ait la sienne.",
          "Le rythme, c’est-à-dire les durées des notes, ne se change pas ici : utilisez le piano roll pour cela. Les boutons d’une ligne la jouent et la montent ou la baissent tout entière."
        ],
        "title": "Affichage simple : la mélodie sur les paroles",
        "toc": "Affichage simple"
      },
      "start": {
        "also": [
          "<b>Jouer au piano</b> — sur le clavier à l’écran ou un clavier MIDI : les notes s’écrivent l’une après l’autre à partir du curseur.",
          "<b>Coller de l’ABC</b> — si la mélodie existe déjà en ABC (menu Importer).",
          "<b>Les notes d’une variante</b> — une variante YuE2 terminée a « Ouvrir les notes » : sa partition s’ouvre en copie. Écoutez-la et modifiez-la ; le formulaire ne change pas. « Vers le formulaire » reprend ces notes dans le formulaire, « Fermer » revient aux notes du formulaire."
        ],
        "alsoTitle": "D’autres façons",
        "intro": "Pas encore de notes ? Les trois façons se trouvent sur l’écran Notes vide.",
        "sparse": "YuE2 chante une note par syllabe. Si une transcription MIDI a bien moins de notes que les paroles n’ont de syllabes (c’est souvent le cas des transcriptions automatiques), le modèle doit inventer le reste, et le morceau cesse de suivre les notes. La vérification vous en avertit. Complétez la mélodie dans le piano roll ou l’affichage simple, ou prenez les notes « D’un morceau… ».",
        "sparseTitle": "Pourquoi un MIDI « clairsemé » donne de faibles résultats",
        "title": "Trois départs rapides",
        "toc": "Trois départs rapides",
        "ways": [
          {
            "title": "Dessiner de zéro",
            "text": "Choisissez une tonalité, un tempo et une mesure, et l’éditeur construit un cadre à partir des paroles : des sections d’après les balises [Verse] et [Chorus], un nombre de mesures adapté et des accords provisoires. Il ne reste plus qu’à dessiner la mélodie vocale au crayon. La meilleure façon quand la mélodie est dans votre tête."
          },
          {
            "title": "D’un morceau…",
            "text": "Choisissez un fichier audio et SheetSage2 transcrit sa mélodie, ses accords et ses sections. Cela prend une minute ou deux. Fonctionne mieux sur un morceau à voix claire, sans chœur ni bruit. Modifiez ensuite à votre guise."
          },
          {
            "title": "Importer du MIDI",
            "text": "Déposez un fichier .mid venant d’un DAW, d’une appli de notation ou d’un site web. Dans le sélecteur, choisissez quelle partie devient la Voix et laquelle l’Instrument ; la batterie et le reste sont écartés, et des accords on garde la note la plus haute. « Ramener l’octave à la voix » décale la mélodie comme YuE2 l’écrit. Le champ du tempo : les transcriptions sont souvent enregistrées à 120 BPM alors que le morceau est plus rapide ou plus lent — saisissez le vrai tempo et les notes tombent là où elles sonnent."
          }
        ]
      },
      "what": {
        "head": {
          "name": "Plan",
          "text": "Ce que fait YuE2",
          "when": "Quand le choisir"
        },
        "p": [
          "Les notes sont la mélodie du morceau dessinée sous forme de barres : quel son chanter, quand commencer et combien de temps le tenir. Inutile de savoir lire la musique : il suffit d’entendre quel son est plus haut et lequel est plus bas.",
          "<b>Sans notes</b>, YuE2 invente la mélodie lui-même. Chaque variante est différente, et on ne peut pas savoir à l’avance comment une ligne sera chantée.",
          "<b>Avec des notes</b>, YuE2 chante votre mélodie. Dans nos essais, le modèle a touché les notes dessinées dans 98 % des cas, a gardé les montées et descentes de la mélodie ainsi que la durée : autant de mesures que vous en dessinez, autant il en chante.",
          "Dans le formulaire, les notes sont conservées sous forme de texte ABC — les mêmes notes écrites en lettres. L’éditeur l’écrit pour vous ; vous n’avez pas à y toucher."
        ],
        "plans": [
          {
            "name": "Sans plan",
            "text": "Invente lui-même la mélodie et l’accompagnement et passe directement à l’audio.",
            "when": "Quand il n’y a pas de notes et que vous voulez simplement entendre des idées. Dès que le formulaire a des notes, l’appli passe seule le plan sur « Suivre une mélodie »."
          },
          {
            "name": "Suivre une mélodie",
            "text": "Chante votre mélodie et invente lui-même l’accompagnement. Vos accords ne sont pas utilisés.",
            "when": "Presque toujours une fois la voix dessinée. Le choix le plus sûr."
          },
          {
            "name": "Mélodie et accords",
            "text": "Prend à la fois votre mélodie et vos accords.",
            "when": "Quand vous avez choisi des accords et que vous voulez exactement cette harmonie."
          }
        ],
        "plansIntro": "Le plan se choisit dans le formulaire, sur l’onglet Mélodie. Il dit à YuE2 quoi faire de vos notes.",
        "plansTitle": "Les trois plans mélodiques",
        "title": "Ce que sont les notes et pourquoi YuE2 en a besoin",
        "toc": "Pourquoi des notes"
      }
    },
    "title": "Aide sur les notes",
    "toc": "Sommaire",
    "tocPick": "Section de l’aide"
  },
  "player": {
    "mute": "Couper le son",
    "unmute": "Rétablir le son",
    "volume": "Volume"
  },
  "sa3Gen": {
    "promptHint": "L’anglais fonctionne le mieux ; l’assistant Décrire traduit. Nommez le genre, les instruments, l’ambiance et le tempo ; pour un son, sa source, la façon dont il se produit et la pièce."
  },
  "score": {
    "checks": {
      "sparseVocal": "Moins de notes que de syllabes dans les paroles : YuE2 inventera le reste",
      "sparseVocalSub": "{notes} notes, {syllables} syllabes. Mieux vaut dessiner le reste de la mélodie ou utiliser « D’un morceau… »"
    },
    "lane": {
      "femaleAbbr": "Fem.",
      "insShort": "Instr.",
      "maleAbbr": "Hom.",
      "voiceFemale": "Voix : femme",
      "voiceMale": "Voix : homme"
    },
    "midi": {
      "fitOctave": "Ramener l’octave à la voix",
      "fitOctaveHint": "YuE2 écrit une mélodie environ une octave au-dessus de l’endroit où elle est chantée, alors qu’une transcription MIDI a la hauteur chantée. Toute la partie vocale se déplace par octaves entières.",
      "markSections": "Marquer les sections selon les paroles",
      "movedDown": "La voix a été descendue de {n} octave. | La voix a été descendue de {n} octaves.",
      "movedUp": "La voix a été montée de {n} octave. | La voix a été montée de {n} octaves.",
      "noSections": "Le MIDI n’a pas de sections de morceau. Balises des paroles : {tags}.",
      "octaveDown": "−{n} octave | −{n} octaves",
      "octaveNone": "octave comme dans le fichier",
      "octaveUp": "+{n} octave | +{n} octaves",
      "tempoFile": "du fichier",
      "tempoHint": "Le fichier indique {bpm} BPM. Les transcriptions sont souvent enregistrées à 120 quel que soit le tempo du morceau : réglez le tempo du morceau et les notes se placent selon le moment où elles sonnent.",
      "tempoTrack": "du morceau « {title} »"
    },
    "overview": {
      "pickHint": "Ouvrir ces mesures dans Notes"
    },
    "toolbar": {
      "musician": "Pour les musiciens",
      "musicianTip": "Afficher les degrés des accords (I, IV, V…) : de la théorie musicale pour ceux qui la connaissent"
    },
    "workspace": {
      "backTip": "Retour à la session ; les notes restent dans le formulaire",
      "copyBadge": "copie de la variante",
      "copyBadgeTip": "Une copie des notes de la variante : le formulaire ne change pas avant « Vers le formulaire »",
      "copyLead": "Écoutez et modifiez ici : le formulaire ne change pas tant que vous ne cliquez pas sur « Vers le formulaire ». « Fermer » revient aux notes du formulaire.",
      "copyTitle": "Notes de la variante « {title} »",
      "form": "Formulaire",
      "formBadge": "notes du formulaire",
      "formBadgeTip": "Ce sont les notes du formulaire : les modifications y vont aussitôt (Ctrl+Z les annule)",
      "label": "Notes",
      "replaceConfirm": "Le formulaire a déjà d’autres notes. Les remplacer par celles de cette variante ? (Ctrl+Z les ramène)",
      "title": "Notes",
      "toForm": "Vers le formulaire"
    }
  },
  "takeCompare": {
    "seed": "Seed {seed}"
  },
  "yueGen": {
    "abcScore": "Notes",
    "help": {
      "melody": {
        "sources": [
          "D’un morceau… — choisissez un fichier audio et SheetSage2 note sa mélodie et ses accords. Un morceau à voix claire donne les meilleurs résultats.",
          "Importer du MIDI — la partie la plus haute devient la mélodie, les autres canaux l’accompagnement et les accords, et la tonalité est trouvée seule. Gardez la mélodie vocale sur une piste à part.",
          "Piano — choisissez une durée et appuyez sur les touches (en bas, à gauche du roll, ou sur un clavier MIDI) : les notes se suivent.",
          "D’un morceau : Notes en MIDI dans le menu d’une variante, ou l’onglet Stems et notes dans la bibliothèque, puis Vers une partition YuE2. La voix devient la mélodie, la basse et le reste l’accompagnement."
        ]
      }
    },
    "unloadSheetSage": "Libérer la carte vidéo après l’extraction de la mélodie"
  }
}
