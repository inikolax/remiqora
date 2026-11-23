// Strings added after the first translation (machine-translated from en, 743 keys);
// merged into the other parts key by key (see ../mergeParts).
export default {
  "aceGen": {
    "addLora": "Ajouter la LoRA",
    "cfgIntervalOrder": "Le « début » du guidage doit être inférieur à la « fin ».",
    "lengthAskedNote": "La durée est transmise au modèle comme un souhait. Cliquez de nouveau sur celle choisie pour la laisser au modèle.",
    "lengthByModelNote": "À partir d’une description, le modèle choisit lui-même la durée. Choisissez-en une ici pour demander la vôtre.",
    "loraName": "Nom de la LoRA",
    "loraPath": "Dossier de l’adaptateur LoRA",
    "manual": {
      "adg": "Guidage adaptatif (ADG)",
      "balancedOnly": "en mode Équilibré",
      "baseOnly": "modèles base et SFT uniquement",
      "bpm": "Tempo",
      "cfgEnd": "Guidage jusqu’à (part du trajet)",
      "cfgStart": "Guidage à partir de (part du trajet)",
      "cotCaption": "Étoffer la description",
      "cotCaptionHint": "Activé : le modèle de langage peut réécrire votre texte de style avant la création de la musique.",
      "cotLanguage": "Détecter la langue",
      "cotLanguagePicked": "désactivé : la langue choisie est conservée",
      "coverNoise": "Bruit mêlé à la source",
      "coverRepaintOnly": "pour une reprise ou un repaint",
      "infer": "Méthode de décodage",
      "latentCrossfade": "Raccord dans le modèle",
      "length": "Durée",
      "lmCfg": "Fidélité au prompt",
      "lmNegative": "Ce qu’il faut éviter",
      "lmSub": "écrit le plan du morceau et complète ce qui manque",
      "lmTitle": "Modèle de langage",
      "loraScale": "Force de la LoRA",
      "metaByModel": "le modèle le choisit d’après la description",
      "musicSub": "ce que l’on sait du morceau à l’avance",
      "musicTitle": "Musique",
      "myLoras": "Mes LoRA : {n}",
      "needRef": "avec un morceau de référence",
      "noLm": "ACE-Step ne le charge pas sur ce GPU",
      "noLmWithRef": "non utilisé avec un morceau de référence",
      "ode": "ODE : se répète à l’identique",
      "off": "désactivé",
      "pickLora": "choisissez d’abord une LoRA",
      "refSub": "reprise et repaint",
      "refTitle": "Morceau de référence",
      "repaintMode": "Mode repaint",
      "repaintModes": {
        "aggressive": "Audacieux",
        "balanced": "Équilibré",
        "conservative": "Prudent"
      },
      "repaintOnly": "pour repeindre une zone",
      "repaintStrength": "Force du repaint",
      "resultSub": "comment le rendre",
      "sde": "SDE : avec du hasard",
      "sdeBaseWarn": "Sur un modèle base, SDE a donné du bruit au lieu de musique lors d’un test (32 étapes). Sur Turbo, cela marche, avec un son plus sombre.",
      "shift": "Décalage du calendrier",
      "thinking": "D’abord un plan (thinking)",
      "tiled": "Décoder par tuiles",
      "turboSteps": "Turbo prend de 1 à 8 étapes : au-delà, on coupe à 8",
      "wavCrossfade": "Raccord dans l’audio"
    },
    "modeDescribe": "À partir d’une description",
    "modeLabel": "Point de départ",
    "modeOwn": "Paroles et style personnels",
    "modelNote": "Turbo prend 8 étapes. Les autres modèles sont plus longs ; retirer ou ajouter une partie ne marche pas sur tous, et les tâches qu’un modèle ne sait pas faire sont grisées dans l’onglet À partir d’un morceau.",
    "noLmBaseNote": "Base et SFT s’appuient sur ce modèle pour un chant propre : dans ce mode, la voix peut sonner bruitée et lointaine. Pour le chant, passez à Paroles et style personnels et écrivez les paroles, ou choisissez Turbo.",
    "noLmNote": "Sur cette carte graphique (8 Go ou moins), ACE-Step ne charge pas son modèle de langage : votre description est donc transmise au modèle comme un simple prompt de style, sans paroles écrites.",
    "noVocal": "Sans voix",
    "noVocalHint": "Un instrumental : pas de paroles nécessaires, le style ci-dessous définit la musique.",
    "queuedStatus": "En attente, variantes : {n}",
    "refFile": "Fichier audio de référence",
    "refOff": "Activez-le pour partir d’un morceau terminé : une reprise, une zone refaite, une partie retirée ou ajoutée.",
    "removeLoraConfirm": "Retirer ?",
    "removeLoraNamed": "Retirer la LoRA {name}",
    "repaintOrder": "La fin de la zone doit venir après son début.",
    "simple": {
      "auto": "auto",
      "fast": "rapide {n}",
      "formatHint": "mp3 prend moins de place ; wav et flac gardent le son sans perte.",
      "key": "Mode",
      "keyHint": "Majeur sonne plus clair, mineur plus sombre et plus triste. La tonique et les autres gammes se choisissent dans Manuel.",
      "keyWish": "À partir d’une description, le modèle choisit la tonalité. Un mode choisi ici lui est transmis comme un souhait.",
      "lengthHint": "La durée du morceau.",
      "lengthWish": "À partir d’une description, le modèle choisit la durée. Celle choisie ici lui est transmise comme un souhait, pas comme une garantie.",
      "major": "majeur",
      "medium": "moyen {n}",
      "minor": "mineur",
      "slow": "lent {n}",
      "tempo": "Tempo",
      "tempoHint": "Battements par minute. « Auto » le laisse au modèle ; un nombre exact se règle dans Manuel.",
      "tempoWish": "À partir d’une description, le modèle choisit le tempo. Celui choisi ici lui est transmis comme un souhait."
    },
    "tabChanged": "modifié",
    "tabs": {
      "ref": "À partir d’un morceau",
      "song": "Morceau",
      "tuning": "Réglages"
    },
    "taskType": "Que faire du morceau",
    "taskUnsupported": "Non pris en charge par ce modèle",
    "help": {
      "style": {
        "tips": [
          "L’idéal est de 5–9 tags : avec moins, le modèle comble lui-même les blancs et le résultat est moins prévisible ; avec plus, les tags se contredisent.",
          "Mettez le genre et l’ambiance en premier — ils façonnent le caractère général du morceau plus que les autres tags.",
          "Ne mélangez pas de tags contradictoires dans une même catégorie (par ex. « aggressive » et « dreamy » à la fois) — le modèle en ignorera un ou le résultat sera confus.",
          "Il vaut mieux écrire les tags en anglais — les données d’entraînement sont surtout en anglais, la précision est donc meilleure, même si les paroles sont en français.",
          "Un tempo réglé dans Réglages (dans Simple, ou comme nombre exact dans Manuel) est plus fiable qu’un tag texte comme « 120 bpm » dans le style : utilisez-le quand le tempo compte."
        ]
      },
      "lyrics": {
        "tips": [
          "Adaptez-les à la durée du morceau : ~2 minutes suffisent en général pour 2 couplets + 2 refrains ; pour 3 minutes et plus, ajoutez un pont et un deuxième hook — un texte trop long pour une durée courte sera « entassé » par le modèle.",
          "Des lignes courtes (5–10 syllabes) suivent la mélodie de façon plus prévisible que des longues — si une ligne est trop longue, coupez-la en deux.",
          "Un refrain qui se répète (texte identique mot pour mot dans chaque [Chorus]) aide le modèle à garder la même mélodie pour lui tout au long du morceau.",
          "Pour un morceau entièrement instrumental, cochez « Sans voix » au lieu d’écrire des paroles qui ne sont que [Interlude] : c’est plus fiable.",
          "La ponctuation (virgules, points de suspension) influence le phrasé et les pauses du chant — utilisez-la à dessein, pas seulement selon les règles d’orthographe."
        ]
      },
      "remix": {
        "unavailable": "L’ensemble des scénarios disponibles dépend du modèle sélectionné — les options non prises en charge dans le formulaire sont grisées. Essayez un autre modèle (dans l’onglet Morceau ou dans Réglages) si vous avez besoin d’un scénario précis. Importez le fichier de référence dans un format dont le modèle peut extraire l’audio (wav/mp3/flac) — les fichiers très longs (plusieurs minutes) peuvent augmenter sensiblement le temps de traitement."
      },
      "advanced": {
        "title": "Réglages",
        "rows": [
          {
            "param": "Simple et Manuel",
            "what": "Simple propose quelques choix simples : étapes de décodage (pas sur Turbo), durée, tempo (lent 80, moyen 110, rapide 140), mode (majeur ou mineur) et format. Manuel a tous les paramètres par groupes, et la console les montre tous à la fois."
          },
          {
            "param": "Format",
            "what": "Le format du fichier de sortie. mp3 est plus compact et suffit pour écouter ; wav et flac sont sans perte mais 5 à 10 fois plus gros."
          },
          {
            "param": "Tempo, tonalité, mesure",
            "what": "Des paramètres musicaux explicites. Laissés sur auto, le modèle les tire du texte de style ; ne les réglez à la main que si la précision compte (pour mixer avec d’autres morceaux, par exemple). La mesure est 2/4, 3/4, 4/4 ou 6/8. À partir d’une description, le modèle les choisit lui-même : un tempo ou une tonalité réglés ici lui sont transmis comme un souhait, et la mesure lui est laissée."
          },
          {
            "param": "Langue du chant",
            "what": "La langue dans laquelle la voix chante. Sur auto, elle est tirée des paroles, ce qui peut se tromper sur des paroles courtes ou ambiguës : réglez-la si la voix sort dans la mauvaise langue. Une langue choisie à la main est conservée, le modèle de langage ne la remplace pas."
          },
          {
            "param": "Étapes de décodage",
            "what": "Le nombre d’étapes de diffusion. Plus peut donner un audio plus propre mais une génération plus lente ; passé un certain point, le gain s’entend à peine. Turbo prend de 1 à 8 (8 par défaut), les modèles SFT 50, les modèles base 32. Dans Simple, Plus double le nombre habituel."
          },
          {
            "param": "Fidélité au style",
            "what": "L’échelle de guidage : avec quelle rigueur le modèle suit votre description. Plus haut suit les tags de style plus précisément, mais des valeurs très hautes rendent le son dur et plein d’artefacts ; plus bas est plus naturel mais moins prévisible. Turbo ne l’utilise pas. Le défaut est 7, une plage raisonnable va en général de 3 à 12."
          },
          {
            "param": "Seed",
            "what": "Sous le formulaire, à côté de Créer. Avec le dé enfoncé, chaque variante reçoit un nouveau seed aléatoire. Un nombre avec les mêmes autres réglages répète presque le résultat : pratique pour changer un tag de style et comparer."
          },
          {
            "param": "Modèle",
            "what": "Turbo est plus rapide au prix d’un peu de qualité et ne fait pas toutes les tâches de l’onglet À partir d’un morceau ; base et SFT sont plus lents mais plus précis et plus souples. Le modèle se choisit dans l’onglet Morceau ou dans Manuel."
          },
          {
            "param": "LoRA",
            "what": "Un complément affiné par-dessus le modèle, pour un timbre de voix ou un sous-genre particulier, par exemple. Sa force (de 0 à 1) fixe son influence sur le résultat : 1 est l’effet complet voulu par l’auteur de l’adaptateur, plus bas le mêle plus doucement. Les adaptateurs s’ajoutent sous Mes LoRA dans Manuel, avec un nom et un dossier."
          }
        ],
        "footer": "Ce que vous ne touchez pas reste au défaut du moteur : vous n’avez pas à tout régler pour obtenir un bon résultat. Réinitialiser remet les lignes propres aux réglages et ne touche ni au modèle ni à la durée."
      }
    }
  },
  "aiPart": {
    "guide": {
      "scratch": [
        {
          "title": "Tempo, tonalité, durée",
          "text": "Dans un projet vide, réglez le BPM et la « Tonalité », et la durée en secondes dans le panneau. 64 mesures à 120 BPM font 128 secondes."
        },
        {
          "title": "Commencer par la batterie",
          "text": "« Ajouter une partie », instrument « Batterie ». Les autres parties gardent leur rythme sur la batterie : elle passe donc en premier."
        },
        {
          "title": "Basse, puis harmonie",
          "text": "La basse, puis les accords : clavier, pad. Gardez la batterie cochée dans la liste des pistes que le modèle écoute."
        },
        {
          "title": "Mélodie et couleur",
          "text": "Lead, cordes, percussions. Cinq à sept parties suffisent ; au-delà, le mix devient encombré."
        },
        {
          "title": "Choisir et régler le volume",
          "text": "Gardez la meilleure variante de chaque partie et ramenez-la tout de suite à un niveau adapté."
        },
        {
          "title": "Construire le morceau",
          "text": "Activez « Magnétisme » et la règle en mesures, coupez les parties avec le Couteau et retirez des morceaux avec la Gomme : une intro, la partie principale, un break sans batterie ni basse, une fin."
        }
      ],
      "scratchIntro": "L’arrangeur peut construire un morceau à partir d’un projet vide. Les parties s’ajoutent une à une et chaque nouvelle écoute celles déjà en place : l’ordre compte donc.",
      "scratchTitle": "Un morceau de zéro",
      "steps": [
        {
          "title": "Démarrer le moteur",
          "text": "L’arrangeur tourne sur ACE-Step ; repaint, prolongement et reprise peuvent aussi tourner sur Stable Audio 3. Si le moteur est arrêté, le panneau propose de le démarrer d’un bouton, et le moteur présent sur le GPU s’arrête alors."
        },
        {
          "title": "Régler le tempo et la tonalité",
          "text": "Avant la première partie, réglez le BPM du projet et la « Tonalité » : tonique et gamme. Le modèle les reçoit à chaque requête. Ne changez pas le tempo après les premières parties : elles sortiraient de la grille."
        },
        {
          "title": "Choisir un mode",
          "text": "« Ajouter une partie », « Repaint », « Prolonger » ou « Reprise ». L’indication à côté du sélecteur dit en une ligne ce que fera le modèle."
        },
        {
          "title": "Décrire ce qu’il vous faut",
          "text": "Pour une nouvelle partie, choisissez l’instrument. Dans la description, nommez le son et le jeu. Écrivez dans votre langue : « En anglais » la réécrit comme le modèle la lit le mieux. Le « ? » près du champ ouvre des mots et des exemples prêts."
        },
        {
          "title": "Cocher ce que le modèle entend",
          "text": "Le modèle s’ajuste aux pistes cochées. Gardez la batterie : le modèle suit sa grille."
        },
        {
          "title": "Dire où",
          "text": "Tout le morceau ou la zone de boucle : activez « Boucle » et faites glisser la zone sur la règle. « Repaint » ne travaille que sur la zone de boucle."
        },
        {
          "title": "Générer et choisir",
          "text": "Les variantes arrivent sur de nouvelles pistes. « Écouter » passe à une variante, « Garder » supprime les autres."
        }
      ],
      "tips": [
        "La description marche mieux en anglais, en courtes phrases séparées par des virgules. Écrivez dans votre langue et cliquez sur « En anglais » ; lisez le résultat et corrigez-le si besoin.",
        "Décrivez une partie, pas tout le morceau : ce que joue l’instrument et comment il sonne.",
        "Construisez le morceau par étapes : batterie, puis basse, puis harmonie, puis mélodie. Chaque partie suivante entend les précédentes.",
        "Pas satisfait d’une variante ? Générez de nouveau : chaque exécution utilise de nouveaux seeds aléatoires.",
        "Après chaque nouvelle partie, réglez son volume avant d’ajouter la suivante : la partie suivante entend le mix tel qu’il est maintenant.",
        "Quand les parties sont prêtes, construisez-en le morceau : coupez les pistes sur les mesures avec le Couteau (C) et retirez des morceaux avec la Gomme (E), pour que les instruments entrent l’un après l’autre.",
        "Pour la voix, saisissez les paroles et vérifiez la « Langue du chant » : sur « Auto », elle est lue d’après les lettres.",
        "ACE-Step cale chaque résultat à -1 dBFS, donc une nouvelle partie arrive fort : baissez-la avec le curseur de volume de la piste.",
        "Pour terminer le morceau dans une autre DAW, exportez « Stems + Reaper » ou DAWproject.",
        "Repaint, prolongement et reprise peuvent aussi tourner sur Stable Audio 3 : choisissez-le comme moteur dans le panneau. Il complète et prolonge en écoutant l’audio autour de la zone, en quelques secondes, instrumental uniquement. L’ajout d’une partie reste à ACE-Step."
      ]
    },
    "toEnglish": "En anglais",
    "toEnglishBusy": "Écriture…",
    "toEnglishDone": "Réécrit en anglais par l’assistant ; modifiez-le si besoin.",
    "toEnglishFailed": "L’assistant n’a pas pu écrire la description.",
    "toEnglishGpu": "L’assistant de prompt est réglé sur le GPU et déchargerait le modèle. Passez-le sur Auto ou CPU dans la page Modèles.",
    "toEnglishTitle": "Décrivez-le dans n’importe quelle langue : l’assistant de prompt le réécrit en anglais, comme le modèle le lit le mieux",
    "toEnglishUndo": "Annuler"
  },
  "create": {
    "closeTool": "Fermer",
    "deleteAsk": "Supprimer ?",
    "details": "Détails",
    "download": "Télécharger",
    "emptyAll": "Vos morceaux apparaîtront ici",
    "emptyHint": "Choisissez un moteur, remplissez le formulaire ou écrivez une phrase dans la ligne d’idée au-dessus, puis cliquez sur Créer.",
    "emptyPeriod": "Rien n’a été créé sur cette période",
    "engine": "Moteur",
    "engineTitle": "{name} : {status}",
    "engines": {
      "ace_step": "Rapide, reprises",
      "stable_audio": "Sons et boucles",
      "yue2": "Chansons avec voix"
    },
    "failed": "Ça n’a pas marché. Chargez-le dans le formulaire et cliquez de nouveau sur Créer.",
    "idea": {
      "chip": {
        "description": "Description",
        "length": "Durée",
        "lyrics": "Paroles",
        "style": "Style",
        "tempo": "Tempo et tonalité"
      },
      "describe": "Décrire",
      "dismiss": "Fermer",
      "formChanged": "Le formulaire a été modifié.",
      "noAssistant": "L’assistant de prompt n’est pas prêt : téléchargez son modèle dans Modèles et réglages (l’engrenage dans l’en-tête).",
      "noAssistantLink": "Télécharger dans Modèles",
      "noAssistantNote": "L’assistant de prompt a besoin de son modèle.",
      "placeholder": {
        "ace_step": "En une phrase : la musique que vous voulez",
        "stable_audio": "En une phrase : ce qui doit sonner",
        "yue2": "En une phrase : le sujet de la chanson"
      },
      "replaces": "Remplace ce qui est dans le formulaire",
      "settings": "Réglages",
      "stop": "Stop",
      "stopping": "Arrêt…",
      "undo": "Remettre ce qui était là",
      "write": "Écrire les paroles et le style",
      "writeSa": "Écrire la description",
      "writeShort": "Écrire",
      "writing": "L’assistant écrit…",
      "written": "Placé dans le formulaire ci-dessous.",
      "writtenOther": "Placé dans le formulaire {name}.",
      "saKind": "Écrire",
      "saKinds": {
        "auto": "Auto : selon l'idée",
        "music": "Morceau de musique",
        "instrument": "Instrument solo",
        "one_shot": "Échantillon one-shot",
        "sfx": "Effet sonore"
      }
    },
    "lessDetails": "Moins",
    "live": {
      "failed": "Variante échouée : {name}. {reason}",
      "queue": "Variantes en attente : {n}",
      "ready": "Variante prête : {name}",
      "readyMany": "Variantes prêtes : {n}, {name}"
    },
    "loading": "Chargement des morceaux…",
    "making": "Création",
    "menu": {
      "made": "Créé {when}, durée {len}",
      "midi": "En MIDI",
      "rename": "Renommer",
      "stems": "Séparer en stems",
      "took": "a pris {s} s"
    },
    "models": "Modèles",
    "more": "Détails et actions",
    "pause": "Pause",
    "peek": {
      "copied": "Copié",
      "copy": "Copier",
      "lines": "{n} lignes",
      "lyrics": "Paroles",
      "noLyrics": "Pas de paroles",
      "style": "Style",
      "tags": "{n} tags"
    },
    "period": "Période",
    "periodHint": {
      "all": "Tout ce qui a été créé jusqu’ici.",
      "today": "Variantes créées aujourd’hui. Celles marquées d’une étoile se retrouvent dans Favoris, dans la bibliothèque.",
      "week": "Variantes des sept derniers jours."
    },
    "periods": {
      "all": "Tout",
      "today": "Aujourd’hui",
      "week": "7 jours"
    },
    "play": "Lire",
    "position": "Position dans le morceau",
    "queued": "En attente",
    "reuse": "Charger dans le formulaire",
    "reuseInForm": "Charger dans le formulaire",
    "session": "Session",
    "showAll": "Tout afficher : {n}",
    "showMore": "Afficher plus : {n}",
    "startAndCreate": "Démarrer {name} et créer",
    "startFailed": "{name} n’a pas démarré.",
    "startingEngine": "Démarrage de {name}…",
    "startsOnCreate": "{name} ne tourne pas pour l’instant. Il démarre quand vous cliquez sur Créer ; la première variante après un démarrage est plus longue.",
    "startsOnCreateOther": "{other} occupe le GPU en ce moment. {name} démarre quand vous cliquez sur Créer, et {other} s’arrête. La première variante après un démarrage est plus longue.",
    "stop": "Stop",
    "stopAsk": "Arrêter ?",
    "stopConfirm": "Cliquez encore pour arrêter : ce qui a été créé jusque-là sera perdu",
    "stopped": "Arrêté.",
    "styleAndLyrics": "Style et paroles",
    "takeN": "Variante {n}",
    "takeTitle": "{title}, variante {n}",
    "takes": "Variantes : {n}",
    "toSession": "Vers la liste de session, variantes : {n}",
    "untitled": "Sans titre",
    "wholeLibrary": "Toute la bibliothèque"
  },
  "favorite": {
    "add": "Ajouter aux favoris",
    "remove": "Retirer des favoris"
  },
  "header": {
    "create": "Créer",
    "desc": {
      "create": "Chansons, instrumentaux et sons",
      "library": "Tous les morceaux : créés, importés et venant de l’éditeur"
    },
    "gpuFree": "Le GPU est libre",
    "home": "Accueil",
    "languageCurrent": "Langue de l’interface : {name}",
    "library": "Bibliothèque",
    "more": "Plus : langue, modèles, aide",
    "guide": {
      "mapTitle": "Les parties de l’application",
      "map": {
        "idea": "Le moyen le plus simple, directement sur la page d’accueil : une phrase et Composer, et un modèle de langage local écrit le prompt pour le moteur. Modifiez-le et créez le morceau.",
        "lora": "Affinez ACE-Step sur vos propres morceaux : importez de l’audio, étiquetez automatiquement, vérifiez les descriptions, entraînez et exportez. Cela s’ouvre sur la page Créer, sous ACE-Step ; l’adaptateur terminé apparaît dans le formulaire ACE-Step.",
        "yue": "Le deuxième moteur : écrit une chanson entière avec chant et peut la construire autour d’une mélodie donnée (onglet Mélodie, avec SheetSage2). Il transforme aussi un morceau en MIDI."
      },
      "gpu": [
        "Les moteurs ne tiennent pas ensemble sur le GPU, donc un seul tourne à la fois. Un moteur se choisit sur la page Créer et démarre quand vous cliquez sur Créer dans son formulaire ; celui qui tournait s’arrête.",
        "Le premier démarrage prend quelques minutes, le temps que le modèle se charge dans la mémoire vidéo. Le bouton d’état dans l’en-tête montre le moteur présent sur le GPU et le remplissage de la mémoire vidéo ; un clic montre qui occupe quelle quantité de mémoire, le bouton Décharger et le chemin vers Modèles.",
        "Décharger arrête une génération ou un entraînement en cours, c’est pourquoi le bouton demande d’abord confirmation."
      ],
      "steps": [
        {
          "title": "Ouvrir ACE-Step",
          "text": "Allez dans Créer et choisissez ACE-Step. Il démarre au premier clic sur Créer ; le premier démarrage prend quelques minutes."
        },
        {
          "title": "Décrire la chanson",
          "text": "Dans l’onglet Morceau, À partir d’une description : quelques phrases suffisent, le genre, l’ambiance, le sujet des paroles. Choisissez la durée et le nombre de variantes."
        },
        {
          "title": "Choisir la meilleure variante",
          "text": "Les variantes s’alignent dans la liste de session à côté du formulaire (en dessous sur téléphone). Tout ce qui est créé est enregistré tout seul dans la bibliothèque."
        },
        {
          "title": "Séparer en stems",
          "text": "Voix, batterie, basse et autres en un clic : Séparer en stems dans le menu d’une variante, l’onglet Stems et notes de la bibliothèque, ou directement dans l’éditeur."
        },
        {
          "title": "Construire dans l’éditeur",
          "text": "Placez les stems sur des pistes, ajoutez des parties avec l’arrangeur IA, réglez les effets."
        },
        {
          "title": "Exporter",
          "text": "Mixez en WAV ou MP3, ou exportez les pistes avec un projet Reaper ou DAWproject."
        }
      ],
      "compare": [
        {
          "label": "Idéal pour",
          "ace": "Des chansons et instrumentaux rapides, beaucoup de variantes à la suite",
          "yue": "Une chanson entière avec voix d’un seul coup",
          "sa3": "Instrumentaux, effets sonores et samples ; complète et prolonge l’audio dans l’éditeur"
        },
        {
          "label": "Travail à partir d’un morceau",
          "ace": "Reprise, repaint d’une section, ajout d’une partie, extraction d’une partie, prolongement",
          "yue": "Une chanson sur la mélodie d’un autre morceau : onglet Mélodie, avec SheetSage2 ou un fichier MIDI",
          "sa3": "Repaint d’une zone, prolongement, reprise dans un autre style (audio vers audio) ; pas de parties par-dessus un mix"
        },
        {
          "label": "Votre propre style",
          "ace": "Une LoRA entraînée sur vos morceaux",
          "yue": "Non",
          "sa3": "Non (la prise en charge des LoRA est prévue)"
        },
        {
          "label": "Durée",
          "ace": "De 10 à 300 secondes, 1, 2 ou 4 variantes par exécution",
          "yue": "Aussi long que les paroles l’exigent, ou de 1 à 8 minutes ; 1 à 4 variantes par exécution",
          "sa3": "Jusqu’à 6 minutes (medium) ou 2 minutes (small) ; 1, 2 ou 4 variantes par exécution, en secondes par exécution"
        },
        {
          "label": "MIDI",
          "ace": "Non",
          "yue": "Un morceau ou un stem en MIDI (MuScriptor)",
          "sa3": "Non"
        },
        {
          "label": "Licence",
          "ace": "MIT : usage commercial autorisé ; vérifiez les conditions actuelles avant de publier",
          "yue": "Usage non commercial uniquement",
          "sa3": "Stability AI Community License : gratuite sous 1 M USD par an ; instrumental uniquement, sans voix"
        }
      ]
    },
    "helpSections": {
      "idea": {
        "title": "Composer à partir d’une idée",
        "text": "Sur la page d’accueil, décrivez une chanson, un instrumental ou un son en une phrase ou deux et choisissez le moteur ; la langue des paroles et qui écrit le prompt se trouvent sous Plus. Avec Composer, l’assistant de prompt, un modèle Qwen3.5 local, écrit le prompt au format du moteur : tags de style, paroles par sections, tempo et tonalité. Modifiez-le, générez, ou ouvrez-le dans le formulaire du moteur. Un son saute l’assistant et va directement à Stable Audio. Sur la page Créer, la même idée se trouve dans la ligne d’idée au-dessus du formulaire et écrit directement dedans. Le modèle et le périphérique de l’assistant se règlent dans Modèles et réglages."
      },
      "engines": {
        "text": "Trois moteurs génèrent de l’audio, ACE-Step 1.5, YuE2-3B et Stable Audio 3, et ils ne tiennent pas ensemble sur un GPU, donc un seul tourne à la fois. Choisissez un moteur sur la page Créer : il démarre quand vous cliquez sur Créer, et celui qui tournait s’arrête de lui-même. Le voyant indique son état ; le premier démarrage peut prendre quelques minutes, le temps que le modèle se charge dans la mémoire vidéo. Le bouton d’état dans l’en-tête montre ce qui occupe le GPU et peut le décharger."
      },
      "ace": {
        "text": "Dans l’onglet Morceau, décrivez la musique avec des mots simples (À partir d’une description) ou donnez des tags de style et des paroles avec les marqueurs [Verse] / [Chorus] (Paroles et style personnels), ou cochez Sans voix. Dans l’onglet À partir d’un morceau, un morceau de référence permet de faire une reprise, de repeindre une section, d’extraire ou d’ajouter une partie, ou de terminer une composition. La durée va de 10 à 300 s, avec 1, 2 ou 4 variantes par exécution. Réglages propose Simple (étapes, durée, tempo, mode, format) et Manuel (chaque paramètre) ; une LoRA entraînée s’y active, avec une force de 0 à 1."
      },
      "yue": {
        "text": "YuE2-3B écrit des chansons entières avec voix. L’onglet Morceau contient les paroles, le style, la durée et la qualité. L’onglet Mélodie règle le plan mélodique : Sans plan va directement à l’audio, Suivre une mélodie garde une mélodie donnée et invente l’accompagnement, Mélodie et accords écrit d’abord un plan des deux. SheetSage2 (Depuis un morceau…) note la mélodie d’un morceau sous forme de partition ABC, que vous pouvez modifier et redonner à YuE2."
      },
      "sa3": {
        "text": "Stable Audio 3 crée en quelques secondes de la musique instrumentale et des effets sonores à partir d’une description : choisissez Musique ou Son, décrivez-le comme le ferait une bibliothèque de samples (genre, instruments, ambiance, tempo, ou la source d’un son et la façon dont il est produit), réglez la durée et le nombre de variantes. Il n’y a pas de voix. Le même moteur sert l’arrangeur IA et les Samples de l’éditeur, où il repeint, prolonge et fait des reprises en écoutant l’audio des deux côtés de la zone. Les poids principaux sont protégés : acceptez la licence sur Hugging Face, enregistrez votre token et téléchargez un modèle dans Modèles et réglages."
      },
      "lora": {
        "text": "L’entraînement de LoRA se trouve sous ACE-Step sur la page Créer, à côté de Générer (sur téléphone, un sélecteur au-dessus du formulaire). L’entraînement demande qu’ACE-Step tourne, et la page propose de le démarrer. Il parcourt toute la chaîne d’affinage : import de l’audio, étiquetage automatique, vérification et modification des descriptions, prétraitement, entraînement avec progression en direct, et export. Un adaptateur terminé est ajouté à la liste des LoRA dans le formulaire ACE-Step."
      },
      "stems": {
        "text": "Tout morceau enregistré peut être séparé en quatre stems (voix, batterie, basse, autres) en un clic : Séparer en stems dans le menu d’une variante, l’onglet Stems et notes de la bibliothèque, ou une piste dans l’éditeur. Les stems peuvent s’ouvrir dans l’éditeur comme un projet de quatre pistes prêt à l’emploi. La transcription MIDI (MuScriptor) fonctionne sur le mix complet ou sur un seul stem ; elle tourne sur le moteur YuE2, donc YuE2 doit être installé."
      },
      "arranger": {
        "text": "Le bouton « Arrangeur IA » de l’éditeur construit un morceau pas à pas au lieu de le générer d’un bloc. « Ajouter une partie » écrit une nouvelle partie (batterie, basse, pad, cordes, etc.) par-dessus les pistes choisies, « Repaint » réécrit une zone faible, « Prolonger » poursuit le morceau, « Reprise » crée une nouvelle version dans un autre style. Chaque variante arrive sur sa propre piste : écoutez, gardez la meilleure et passez à la partie suivante. Les parties sont ajoutées par le modèle base d’ACE-Step (environ 4,8 Go) ou par sa version XL base plus grande (environ 20 Go, demande une carte de 16 Go) ; les deux sont facultatifs, et sans le modèle base, l’arrangeur propose de l’installer. Les autres modes tournent sur turbo, ou sur Stable Audio 3 quand vous le choisissez comme moteur : il complète, prolonge et fait des reprises en écoutant l’audio environnant, instrumental uniquement."
      },
      "sfx": {
        "text": "Le bouton « Samples » de l’éditeur crée avec Stable Audio 3, à partir d’une courte description, des one-shots (une grosse caisse, un coup, un whoosh), des boucles au tempo du projet et des textures (pluie, foule, drone). Les résultats s’alignent dans une bande : écoutez d’abord, puis ajoutez celui qui vous plaît à une nouvelle piste ou à la piste sélectionnée à la position de lecture. Les boucles sont coupées en mesures entières, mais le modèle ne garantit pas un raccord parfait : vérifiez-les en boucle. « Retirer de la liste » supprime les sons de la tâche de la bibliothèque et du disque, sauf ceux qui sont sur une piste à ce moment-là."
      }
    }
  },
  "home": {
    "allTracks": "Toute la bibliothèque",
    "compose": "Composer",
    "composeHere": "L’assistant écrit le prompt pour le moteur choisi ; vous pouvez le modifier avant de générer",
    "composeSound": "L’assistant écrit un prompt de son avec sa durée, Stable Audio le crée",
    "engineLabel": "Moteur",
    "engines": "Ou allez directement à un moteur",
    "firstText": "Décrivez une chanson ou prenez un exemple :",
    "firstTitle": "Vos morceaux apparaîtront ici",
    "guide": "Comment fonctionne la composition",
    "kind": {
      "instrumental": "Instrumental",
      "song": "Chanson avec voix",
      "sound": "Son"
    },
    "kindLabel": "Que créer",
    "lead": "Tout tourne sur cet ordinateur",
    "loading": "Chargement des morceaux",
    "more": "Plus",
    "needPhrase": "Décrivez d’abord la musique",
    "title": "Que va-t-on créer ?",
    "phraseLabel": "Décrivez la musique",
    "placeholderSound": "pluie sur un toit de tôle la nuit, proche et calme",
    "soundBySa3": "Les sons sont créés par Stable Audio",
    "soundMissing": "Stable Audio n’est pas installé"
  },
  "keyScale": {
    "hint": "ACE-Step ne connaît que majeur et mineur. Pour cette gamme, il reçoit la tonalité la plus proche ({key}) et le nom de la gamme dans la description : une indication, pas une garantie.",
    "mode": "Gamme",
    "modes": {
      "blues": "Blues",
      "dorian": "Dorien",
      "double_harmonic": "Double harmonique",
      "harmonic_minor": "Mineur harmonique",
      "hungarian_minor": "Mineur hongrois",
      "locrian": "Locrien",
      "lydian": "Lydien",
      "major": "Majeur (ionien)",
      "major_pentatonic": "Pentatonique majeure",
      "melodic_minor": "Mineur mélodique",
      "minor": "Mineur naturel (éolien)",
      "minor_pentatonic": "Pentatonique mineure",
      "mixolydian": "Mixolydien",
      "phrygian": "Phrygien",
      "phrygian_dominant": "Phrygien dominant"
    },
    "needTonic": "Choisissez d’abord la note de la tonalité",
    "none": "Aucune gamme de ce nom",
    "notSet": "non défini",
    "search": "Tapez pour chercher",
    "tonic": "Tonique"
  },
  "libraryPage": {
    "aiPart": "Une partie de l’arrangeur IA",
    "collectionName": "Nom de la collection",
    "confirmDeleteCollection": "Supprimer la collection ?",
    "cot": {
      "full": "mélodie et accords",
      "melody": "suit une mélodie"
    },
    "delete": "Supprimer",
    "deleteCollection": "Supprimer la collection (ses morceaux restent)",
    "deleteFailed": "Suppression impossible : {error}",
    "emptyCollection": "Ouvrez un morceau et ajoutez-le à cette collection dans son onglet À propos.",
    "emptyFavorites": "Marquez un morceau avec l’étoile et il apparaît ici.",
    "emptyHere": "Rien ici pour l’instant",
    "emptyHint": "Les morceaux que vous créez et importez se rassemblent ici.",
    "facts": {
      "file": "Fichier",
      "madeIn": "Créé dans",
      "melody": "Mélodie",
      "model": "Modèle"
    },
    "filters": {
      "all": "Tous les morceaux",
      "favorites": "Favoris",
      "midi": "Notes (MIDI)",
      "score": "Partition",
      "stems": "Stems",
      "today": "Aujourd’hui"
    },
    "filtersLabel": "Filtres de la bibliothèque",
    "groups": {
      "collections": "Collections",
      "has": "Ce que contient le morceau",
      "origin": "Créé par",
      "tags": "Tags"
    },
    "loadFailed": "Impossible de charger la bibliothèque.",
    "newCollection": "+ Nouvelle collection",
    "newest": "Plus récents d’abord",
    "noCollections": "Pas encore de collections : créez la première avec Nouvelle collection.",
    "nothingFound": "Rien trouvé",
    "nothingFoundHint": "Essayez un autre mot ou un autre filtre.",
    "oldest": "Plus anciens d’abord",
    "order": "Ordre",
    "origins": {
      "editor": "Éditeur",
      "upload": "Importé"
    },
    "period": "Période",
    "pick": "Choisissez un morceau : ses paroles, son style, ses stems et ses notes s’affichent ici.",
    "renameCollection": "Renommer la collection",
    "retry": "Réessayer",
    "reuseHint": "Ouvre Créer avec ces paroles, ce style et ces réglages",
    "search": "Titre, style ou une ligne des paroles",
    "showAll": "Afficher tous les morceaux",
    "sub": {
      "editor": "Venant de l’éditeur",
      "engine": "Sans description",
      "upload": "Fichier importé"
    },
    "tabs": {
      "about": "À propos",
      "lyrics": "Paroles",
      "parts": "Stems et notes"
    },
    "take": "Variante {n}",
    "title": "Bibliothèque",
    "toCreate": "Créer le premier morceau",
    "today": "Aujourd’hui",
    "yesterday": "Hier",
    "bulk": {
      "addTag": "Ajouter #{tag}",
      "clear": "Effacer la sélection (Échap)",
      "collected": "{n} morceau ajouté à «{name}» | {n} morceaux ajoutés à «{name}»",
      "collection": "Collection",
      "favorited": "{n} morceau ajouté aux favoris | {n} morceaux ajoutés aux favoris",
      "label": "Actions sur les morceaux sélectionnés",
      "newCollection": "Nouvelle collection…",
      "noTags": "Aucun tag pour l’instant : saisissez-en un et appuyez sur Entrée.",
      "selectAll": "Tout sélectionner : {n}",
      "selectSong": "Sélectionner «{title}» avec ses prises : {n}",
      "selectTrack": "Sélectionner «{title}»",
      "selected": "Sélectionnés : {n}",
      "tag": "Tag",
      "tagPlaceholder": "Un nouveau tag, ou en chercher un",
      "tagged": "#{tag} ajouté à {n} morceau | #{tag} ajouté à {n} morceaux",
      "uncollected": "{n} morceau retiré de «{name}» | {n} morceaux retirés de «{name}»",
      "unfavorited": "{n} morceau retiré des favoris | {n} morceaux retirés des favoris",
      "untagged": "#{tag} retiré de {n} morceau | #{tag} retiré de {n} morceaux"
    },
    "emptyTag": "Ajoutez ce tag à un morceau dans son onglet À propos, ou à plusieurs d’un coup depuis la barre de sélection.",
    "tags": {
      "add": "Ajoutez un tag et appuyez sur Entrée",
      "added": "Tag #{tag} ajouté",
      "confirmDelete": "Supprimer le tag ?",
      "delete": "Retirer le tag de tous les morceaux",
      "remove": "Retirer le tag #{tag}",
      "removed": "Tag #{tag} retiré",
      "rename": "Renommer le tag"
    },
    "trash": {
      "confirmEmpty": "Tout supprimer définitivement ?",
      "confirmPurge": "Supprimer définitivement ?",
      "deleted": "Supprimé : {when}",
      "dismiss": "Masquer l’avis",
      "emptied": "La corbeille est vide maintenant",
      "empty": "Vider la corbeille",
      "emptyHere": "La corbeille est vide",
      "emptyHint": "Les morceaux supprimés attendent ici 30 jours, au cas où vous en voudriez un.",
      "loadFailed": "Impossible de charger la corbeille : {error}",
      "moveHint": "Déplace le morceau dans la corbeille : il pourra y être restauré pendant 30 jours",
      "moved": "{n} morceau déplacé dans la corbeille | {n} morceaux déplacés dans la corbeille",
      "note": "Les morceaux de la corbeille sont supprimés définitivement après 30 jours.",
      "purge": "Supprimer définitivement",
      "purged": "{n} morceau supprimé définitivement | {n} morceaux supprimés définitivement",
      "restore": "Restaurer",
      "restored": "{n} morceau restauré | {n} morceaux restaurés",
      "title": "Corbeille",
      "undo": "Annuler"
    }
  },
  "midiPanel": {
    "betterWithVocals": "Travaille à partir du mix complet ; pour une mélodie exacte, séparez d’abord le morceau en stems et reconnaissez la voix.",
    "scoreEmpty": "Le MIDI n’a pas de notes pour faire une partition.",
    "scoreFromFull": "à partir du mix complet",
    "scoreFromStems": "mélodie tirée de la voix, accompagnement tiré de la basse et du reste",
    "scoreFromVocals": "mélodie tirée de la voix",
    "scoreInserted": "La partition est dans le formulaire YuE2 ({from}).",
    "toScore": "Vers une partition YuE2",
    "toScoreHint": "Transforme les notes en partition ABC pour YuE2 et la place dans son formulaire : la voix devient la mélodie, la basse et le reste l’accompagnement et les accords."
  },
  "miniWave": {
    "percent": "{n} %",
    "timeOf": "{pos} sur {total}"
  },
  "models": {
    "check": "Vérifier",
    "checkBad": "Endommagé ou manquant : {files}. Retéléchargez cette partie.",
    "checkFailed": "Vérification impossible : {error}",
    "checkOffline": "Hugging Face était injoignable, seules les tailles ont donc été comparées.",
    "checkOkHash": "Les {n} fichiers sont complets ; {h} correspondaient au SHA-256 indiqué par Hugging Face.",
    "checkOkRecord": "Les {n} fichiers correspondent à leur enregistrement par la taille.",
    "checkOkSize": "Les {n} fichiers sont complets (vérifiés par la taille et la structure ; il n’y a pas de liste de sommes de contrôle à comparer).",
    "checkOutdated": "Complet, mais le dépôt contient maintenant une version plus récente de : {files}. Retéléchargez pour l’obtenir.",
    "checkTitle": "Vérifier que les fichiers sont complets",
    "checking": "Vérification…",
    "parts": {
      "yue2-bf16": {
        "name": "YuE2 bf16",
        "text": "Le modèle non quantifié. Demande plus de mémoire vidéo que q8_0 (le plus des trois)."
      }
    },
    "reinstall": "Retélécharger",
    "reinstallAsk": "Récupérer {gb} Go de nouveau ?",
    "reinstallNamed": "Retélécharger {name}",
    "reinstallNo": "Garder",
    "reinstallTitle": "Le télécharger de nouveau et remplacer les fichiers",
    "reinstallYes": "Retélécharger",
    "yue2": {
      "noSettings": "La précision q8_0, q4_0 ou bf16 se choisit pour chaque génération dans le formulaire YuE2, avec Qualité."
    }
  },
  "params": {
    "changed": "Modifié",
    "consoleNote": "Les valeurs réglées à la main sont marquées. Le reste garde sa valeur par défaut.",
    "consoleTitle": "Console {name}",
    "default": "Par défaut : {v}",
    "quick": "Choix rapide : {group}",
    "reset": "Revenir au défaut",
    "resetOne": "Remettre {name} par défaut",
    "simple": {
      "more": "Plus : {n}",
      "normal": "Habituel : {n}",
      "steps": "Étapes de décodage",
      "stepsHint": "Plus d’étapes prennent plus de temps."
    }
  },
  "player": {
    "close": "Fermer le lecteur",
    "label": "Lecteur",
    "next": "Morceau suivant",
    "prev": "Morceau précédent (depuis le début, si le morceau est en cours)"
  },
  "presets": {
    "button": "Préréglage",
    "confirmDelete": "Cliquez encore pour supprimer {name}",
    "deleteAsk": "Supprimer ?",
    "deleteOne": "Supprimer le préréglage {name}",
    "none": "Aucun préréglage enregistré pour l’instant.",
    "saveCurrent": "Enregistrer le formulaire comme préréglage",
    "title": "Préréglages : jeux de réglages du formulaire enregistrés"
  },
  "resources": {
    "ramOf": "RAM {used} sur {total} Go",
    "state": {
      "error": "{model} a signalé une erreur",
      "running": "{model} tourne",
      "starting": "{model} démarre",
      "stopping": "{model} s’arrête"
    },
    "vramOf": "Mémoire vidéo {used} sur {total} Go",
    "holder": {
      "cover": "Pochettes (Z-Image Turbo)"
    }
  },
  "sa3Gen": {
    "badGuidanceWindow": "Le guidage s’arrête à un niveau de bruit plus élevé que celui où il commence : baissez « s’arrête à » ou augmentez « commence à ».",
    "formTabs": "Sections du formulaire",
    "kindLabel": "Type d’audio",
    "lengthFromRef": "Le morceau de référence fixe la durée :",
    "lengthOwn": "propre : {v}",
    "lengthSeconds": "{n} s",
    "manual": {
      "apg": "Part d’APG",
      "autoTags": "Tags de service",
      "cfg": "Fidélité à la description",
      "cfgStartsAt": "Le guidage commence au niveau de bruit",
      "cfgStopsAt": "Le guidage s’arrête au niveau de bruit",
      "chunked": "Décoder par blocs",
      "chunkedAuto": "Auto",
      "duration": "Durée",
      "fromRef": "fixée par le morceau de référence",
      "guidanceSub": "comment la description oriente le son ; le niveau de bruit passe de 1 à 0 pendant l’exécution",
      "guidanceTitle": "Guidage",
      "needCfg": "quand la Fidélité à la description n’est pas 1",
      "needTwo": "avec deux variantes ou plus",
      "negative": "Ce qu’il faut éviter",
      "normThreshold": "Plafond d’un pas de guidage",
      "off": "Non",
      "on": "Oui",
      "padding": "Marge de durée",
      "perVariant": "Une description par variante",
      "resultSub": "la durée et la description",
      "resultTitle": "Résultat",
      "sampler": "Sampler",
      "samplerAuto": "par défaut (pingpong)",
      "samplerAutoBase": "le défaut du modèle",
      "samplerLoud": "Plus fort que d’habitude et écrêté : lors d’un test, 1 à 2 % du son touchaient le plafond.",
      "samplerQuiet": "Environ 7 dB plus faible que d’habitude.",
      "samplerSub": "comment chaque étape est calculée",
      "samplerTitle": "Sampler",
      "scalePhi": "Adoucir le guidage",
      "textOnly": "sans morceau de référence uniquement",
      "trim": "Couper le silence au début"
    },
    "modelsAfterStart": "La liste des modèles s’affiche une fois le moteur lancé.",
    "queuedNote": "Variantes en attente : {n}",
    "ref": {
      "modeLabel": "Que faire de la référence",
      "off": "Activez-le pour partir d’un morceau terminé : le refaire, retravailler une zone ou le prolonger."
    },
    "simple": {
      "tagsOff": "Ne pas ajouter",
      "tagsOn": "Ajouter"
    },
    "submitKind": {
      "music": "Créer de la musique",
      "sfx": "Créer un son"
    },
    "tabChanged": "modifié",
    "tabs": {
      "ref": "À partir d’un morceau",
      "sound": "Description",
      "tuning": "Réglages"
    },
    "advancedHint": "Le dé à côté du seed le rend de nouveau aléatoire ; un nombre répète ce son. Les modèles post-entraînés sont réglés pour 8 étapes et une fidélité de 1 ; Ce qu’il faut éviter et le groupe Guidage ne marchent que si la Fidélité à la description n’est pas 1.",
    "advancedHintBase": "Un checkpoint base : il démarre à 50 étapes et une fidélité de 7, donc Ce qu’il faut éviter marche ; essayez « poor quality » à cet endroit.",
    "help": {
      "tips": [
        "Musique : genre, instruments et leur sonorité, ambiance et énergie, tempo en BPM.",
        "Un son : ce qui le produit, comment cela se passe et pendant combien de temps, où est le micro et comment sonne la pièce.",
        "Les tags aident : TrackType: Music, VocalType: Instrumental, Genre: Funk, Instruments: Guitar, Saxophone ; TrackType: Instrument pour une partie solo ; TrackType: SFX pour un son.",
        "Pas de voix : le modèle fait des instrumentaux ; un prompt vocal donne au mieux des textures sans paroles.",
        "Saisissez un seed pour répéter un résultat ; avec le dé enfoncé, chaque variante en reçoit un nouveau."
      ]
    },
    "translateBtn": "Traduire seulement",
    "translateHint": "Stable Audio ne comprend que l’anglais : l’assistant peut écrire un prompt en anglais à partir de votre texte, ou simplement le traduire.",
    "translateNoAssistant": "L'assistant de prompts n'est pas prêt : téléchargez son modèle dans Modèles.",
    "translateRunning": "Traduction en cours…",
    "translateStopping": "Arrêt en cours…",
    "translateStop": "Arrêter",
    "translateDone": "Traduit en anglais.",
    "translateUndo": "Rétablir",
    "composeBtn": "Écrire le prompt",
    "composeTitle": "L’assistant transforme la description, dans n’importe quelle langue, en prompt pour Stable Audio : genre, instruments, son, tempo et durée",
    "composeRunning": "Écriture du prompt…",
    "composeDone": "Le prompt pour Stable Audio est prêt."
  },
  "tagInput": {
    "cleared": "Tous les tags effacés",
    "removeTag": "Retirer {tag}",
    "removed": "{tag} retiré",
    "restored": "Tags rétablis",
    "undo": "Annuler",
    "undoTitle": "Rétablir les tags effacés"
  },
  "yueGen": {
    "help": {
      "advanced": {
        "choices": [
          "Qualité (onglet Morceau) : Brouillon est le modèle q4_0, Normal q8_0, Final bf16 avec 32 étapes de décodage et une fidélité au style de 1,2.",
          "Durée (onglet Morceau) : les minutes deviennent « Pas plus court que » et « Pas plus long que » ; le modèle produit 25 tokens par seconde de son.",
          "Chant : Plus stable est une Audace de 0,85, Plus audacieux 1,1.",
          "Répétitions : Moins est une Pénalité de répétition de 1,3 avec une Mémoire des répétitions de 80.",
          "Partition : Plus prudent est une Audace de partition de 0,55."
        ],
        "choicesIntro": "Ils règlent les mêmes valeurs que les corrections ci-dessous, en un clic.",
        "choicesTitle": "Les choix dans les onglets",
        "title": "Réglages",
        "lead": "Vous pouvez n’y pas toucher : ce que vous ne changez pas reste au défaut du moteur, indiqué sur chaque ligne dans Manuel. Ils comptent quand un morceau sort sans cesse mal : coupé court, en boucle, faux. Trouvez votre cas ci-dessous et cliquez sur Appliquer : les bons nombres vont d’eux-mêmes dans les champs.",
        "fixes": [
          {
            "id": "cutoff",
            "problem": "Le morceau s’arrête avant la fin des paroles",
            "fix": "Pas plus long que : 12000 tokens, un plafond de durée d’environ 8 minutes au lieu de 6."
          },
          {
            "id": "offbrief",
            "problem": "Le son ne correspond pas aux tags",
            "fix": "Fidélité au style : 1,2, pour que le modèle suive la description plus strictement. Si cela n’aide pas, ce sont les tags eux-mêmes le problème."
          },
          {
            "id": "loop",
            "problem": "Une phrase tourne en boucle",
            "fix": "Pénalité de répétition 1,3 et Mémoire des répétitions 80 : une pénalité plus forte pour les répétitions et une mémoire plus longue de celles-ci."
          },
          {
            "id": "offkey",
            "problem": "Fausses notes, cassures de voix, bruit",
            "fix": "Audace 0,85 et 32 étapes de décodage : moins d’audace, plus de passes pour rendre l’audio."
          },
          {
            "id": "melody",
            "problem": "La mélodie est incohérente",
            "fix": "Si le plan est désactivé, il passe à Mélodie et accords (un plan déjà choisi reste), et Partition passe à Plus prudent (Audace de partition 0,55), de sorte que la partition est écrite avec plus de précaution. Ou prenez une mélodie dans un morceau, dans l’onglet Mélodie : une partition donnée remplace le plan, et alors seul le choix du plan compte."
          },
          {
            "id": "same",
            "problem": "Toutes les variantes se ressemblent",
            "fix": "Active le seed aléatoire. Si cela ne suffit pas, Audace 1,1."
          },
          {
            "id": "final",
            "problem": "Je veux le rendu final",
            "fix": "Qualité : Final, le modèle bf16 (une fois téléchargé), 32 étapes et fidélité au style 1,2. Faites 2–3 variantes et gardez la meilleure."
          }
        ],
        "fieldsIntro": "Sous chaque champ se trouve une échelle de valeurs typiques : le repère au-dessus est le défaut pour l’audio, celui en dessous le défaut pour la partition (uniquement avec un plan mélodique et sans partition donnée). Une partition demande de la rigueur, l’audio demande de la vie, d’où les défauts différents.",
        "groups": [
          {
            "title": "Précision et qualité",
            "fields": [
              {
                "key": "cfg_scale",
                "name": "Fidélité au style (CFG)",
                "text": "Avec quelle docilité le modèle suit les tags de style. Comme le volume de votre voix dans l’oreille d’un musicien : plus bas — il joue plus librement, plus haut — plus près de la consigne, mais plus raide.",
                "left": "plus libre",
                "right": "plus strict sur les tags",
                "when": "1,2 si le son correspond à peine à la description. Au-dessus de 1,5 — artefacts et son « plastique »."
              },
              {
                "key": "num_inference_steps",
                "name": "Étapes de décodage",
                "text": "Combien de passes le modèle fait pour transformer son plan en audio fini. Comme des couches de peinture : 8 est une esquisse rapide, 32 une dernière couche propre.",
                "left": "plus rapide",
                "right": "plus propre",
                "when": "8 pour les brouillons, 32 pour le final. La différence s’entend à peine (environ 4 s par morceau sur une RTX 4080) ; au-delà de 32, le son change seulement, il ne s’améliore pas."
              }
            ]
          },
          {
            "title": "Caractère de l’interprétation",
            "fields": [
              {
                "key": "temperature",
                "name": "Audace (temperature)",
                "text": "L’audace du modèle (au moins 0,01 : zéro arrête le moteur). Bas — joue « selon le manuel », régulier et prévisible ; haut — improvise, parfois brillamment, parfois faux.",
                "left": "plus stable",
                "right": "plus audacieux",
                "when": "Fausses notes : 0,85. Toutes les variantes semblables : 1,1. Une partition étrange : 0,5–0,6 pour la partition."
              },
              {
                "key": "repetition_penalty",
                "name": "Pénalité de répétition",
                "text": "Une pénalité pour la répétition de ce qui a déjà été joué. Plus elle est haute, plus le modèle évite le « disque rayé ». Pour la partition, elle est proche de 1,0 — les répétitions sont normales en notation.",
                "left": "répétitions permises",
                "right": "pas de répétitions",
                "when": "Boucle : 1,3. En dessous de 1,1, risque de boucles monotones."
              }
            ]
          },
          {
            "title": "Durée du morceau",
            "fields": [
              {
                "key": "min_tokens",
                "name": "Pas plus court que",
                "text": "Le modèle ne peut pas finir avant. Environ 25 unités par seconde : 200 ≈ 8 secondes d’audio.",
                "left": "peut être court",
                "right": "pas avant",
                "when": "Le morceau finit avant d’avoir tout chanté : augmentez-le."
              },
              {
                "key": "max_tokens",
                "name": "Pas plus long que",
                "text": "Plafond de durée. 9000 ≈ 6 minutes de chanson ; le formulaire accepte jusqu’à 15000. Plus — une attente plus longue et plus de mémoire GPU.",
                "left": "plus court",
                "right": "plus long",
                "when": "Coupe au milieu d’une phrase : 12000."
              }
            ]
          }
        ],
        "rareIntro": "Ils changent les mêmes choses que l’Audace ou la Pénalité de répétition, mais plus finement. On n’y touche d’habitude pas.",
        "rare": [
          {
            "key": "top_p",
            "name": "Seuil des choix rares (top-p)",
            "text": "Combien d’options « raisonnables » le modèle considère à chaque étape : 1 — toutes, 0,5 — seulement les plus évidentes."
          },
          {
            "key": "top_k",
            "name": "Candidats (top-k)",
            "text": "Un plafond strict sur le nombre d’options à chaque choix. Un second filtre à côté du seuil des choix rares."
          },
          {
            "key": "penalty_window",
            "name": "Mémoire des répétitions",
            "text": "Jusqu’où le modèle se souvient de ce qu’il a joué pour calculer la pénalité de répétition. 50 ≈ 2 secondes d’audio. Montez à 80 en cas de boucle."
          }
        ]
      },
      "melody": {
        "lead": "YuE2 peut chanter les paroles sur une mélodie que vous lui donnez. La partition ABC la contient : des notes écrites sous forme de texte. À partir d’une partition au format que l’application écrit, le morceau sort dans la même tonalité, avec les mêmes notes chantées et la même durée : lors de notre test, les notes correspondaient à 93–99 %.",
        "roll": [
          "Écouter joue la partition au piano. Un clic ou un glissement sur le piano roll choisit où commencer, ⏮ revient au début.",
          "Les notes roses sont la voix (Vocal), les bleues l’accompagnement (Ins). Les numéros de mesure et les accords défilent en haut.",
          "Ctrl + molette zoome, ⤢ ouvre la grande fenêtre avec trois octaves de touches.",
          "Partition affiche la même partition sur des portées ; un clic sur une note la joue."
        ],
        "rollTitle": "Le piano roll et les notes",
        "sources": [
          "Depuis un morceau… — choisissez un fichier audio et SheetSage2 note sa mélodie et ses accords. Un morceau avec une voix bien claire marche le mieux.",
          "Importer un MIDI — la partie la plus aiguë devient la mélodie, les autres canaux l’accompagnement et les accords, et la tonalité est trouvée toute seule. Gardez la mélodie chantée sur une piste à part.",
          "Piano — choisissez une durée et appuyez sur des touches (en bas, à gauche du piano roll, ou sur un clavier MIDI) : les notes s’enchaînent.",
          "Depuis un morceau : En MIDI dans le menu d’une variante, ou l’onglet Stems et notes de la bibliothèque, puis Vers une partition YuE2. La voix devient la mélodie, la basse et le reste l’accompagnement."
        ],
        "sourcesTitle": "D’où vient une mélodie",
        "tips": [
          "Une note par syllabe : une ligne de 8 syllabes demande environ 8 notes.",
          "Le morceau dure autant que les notes : 8 mesures à 4/4 à 100 BPM font environ 20 secondes.",
          "Suivre une mélodie : le modèle garde votre mélodie et invente l’accompagnement ; Mélodie et accords : il construit les deux à partir de la partition.",
          "Une tonalité ou un tempo dans le style ne change rien : ils viennent des notes.",
          "Ne modifiez le texte ABC à la main que si vous connaissez le format : le modèle lit mieux la disposition que l’application écrit (voix Vocal et Ins)."
        ],
        "tipsTitle": "Pour un résultat proche",
        "title": "La mélodie et la partition ABC"
      },
      "style": {
        "tips": [
          "L’idéal est de 5–8 tags — plus, ils se contredisent, moins donne un résultat moins prévisible.",
          "Écrivez les tags en anglais, mais commencez par la langue de la chanson (Russian, English, Spanish…) : les exemples du moteur le font tous, et les parcours d’idée l’ajoutent pour vous.",
          "Avec un plan mélodique (Suivre une mélodie ou Mélodie et accords), le style compte toujours : il fixe le timbre et l’arrangement, tandis que la mélodie vient de la partition ABC."
        ]
      },
      "lyrics": {
        "tips": [
          "Avec un plan mélodique, le rythme des lignes doit à peu près correspondre à la partition ABC (syllabes par mesure) ; sinon le modèle doit étirer ou comprimer les mots pour les faire entrer dans la mélodie.",
          "Des lignes courtes suivent la mélodie de façon plus prévisible que des longues.",
          "Répétez le refrain mot pour mot dans chaque [Chorus] — cela garde la même ligne mélodique pour lui tout au long du morceau."
        ]
      },
      "cot": {
        "title": "Le plan mélodique",
        "intro": "Le plan mélodique décide si le modèle écrit un plan musical avant l’audio, et comment il utilise la partition ABC de l’onglet Mélodie.",
        "melodyNote": "Donnez la mélodie dans la partition ABC sous le plan : Depuis un morceau… (SheetSage2), un fichier MIDI ou le piano. Sans partition, le modèle écrit son propre plan de mélodie seule.",
        "precisionNote": "La précision du modèle (q8_0, q4_0, bf16) n’a rien à voir avec le plan : la Qualité de l’onglet Morceau la fixe. q4_0 économise la mémoire vidéo pour une petite perte de qualité, quel que soit le plan.",
        "abcFooter": "Le plus simple n’est pas d’écrire l’ABC de zéro, mais de le prendre dans un morceau avec Depuis un morceau… (SheetSage2), puis de retoucher à la main les mesures voulues."
      }
    },
    "length": {
      "auto": "Auto",
      "autoHint": "Aussi long que les paroles l’exigent, jusqu’à environ 6 minutes.",
      "hint": "Environ {n} min : un texte plus court est chanté et joué jusqu’à cette durée, un texte plus long est coupé là.",
      "label": "Durée",
      "minutes": "{n} min",
      "ownHint": "Réglée à la main dans Réglages (Min / Max tokens)."
    },
    "lines": "Lignes : {n}",
    "linesAbout": "Lignes : {n}, environ {time}",
    "linesAboutHint": "Une estimation d’après vos morceaux précédents : environ {s} s par ligne. Pour la durée Auto.",
    "manual": {
      "abcGiven": "la partition de l’onglet Mélodie",
      "changed": "{n} sur {total} modifiés",
      "console": "Console : tous les groupes à la fois",
      "consoleTitle": "Console YuE2",
      "done": "Terminé",
      "groups": {
        "character": {
          "sub": "la voix et la musique",
          "title": "Caractère"
        },
        "length": {
          "sub": "25 tokens par seconde",
          "title": "Durée"
        },
        "repeats": {
          "sub": "contre les boucles",
          "title": "Répétitions"
        },
        "score": {
          "sub": "comment le modèle écrit le plan mélodique",
          "title": "Partition"
        },
        "sound": {
          "sub": "le modèle et le décodage",
          "title": "Son"
        }
      },
      "manual": "Manuel",
      "params": {
        "cfg": "Fidélité au style",
        "max_tokens": "Pas plus long que",
        "min_tokens": "Pas plus court que",
        "penalty_window": "Mémoire des répétitions",
        "precision": "Précision du modèle",
        "repetition_penalty": "Pénalité de répétition",
        "steps": "Étapes de décodage",
        "temperature": "Audace",
        "top_k": "Candidats",
        "top_p": "Seuil des choix rares"
      },
      "reset": "Réinitialiser",
      "resetAll": "Tout réinitialiser",
      "seconds": "{n} s",
      "seedRandom": "aléatoire",
      "sends": "Part vers le moteur",
      "sendsRest": "Les valeurs réglées à la main sont marquées. Ce qui n’est pas dans la ligne reste au défaut du moteur.",
      "simple": "Simple"
    },
    "perf": {
      "manualNow": "(réglé à la main pour l’instant)",
      "repeats": {
        "hint": "Moins, quand une phrase tourne en rond.",
        "label": "Répétitions",
        "options": {
          "fewer": "Moins",
          "normal": "Normal"
        }
      },
      "score": {
        "hint": "Plus prudent, quand la mélodie divague : le modèle écrit la partition avec plus de précaution.",
        "label": "Partition",
        "options": {
          "careful": "Plus prudent",
          "normal": "Normal"
        }
      },
      "temperature": {
        "hint": "Plus stable : moins de fausses notes et de cassures dans la voix. Plus audacieux : les variantes diffèrent davantage entre elles.",
        "label": "Chant",
        "options": {
          "normal": "Normal",
          "steady": "Plus stable",
          "varied": "Plus audacieux"
        }
      }
    },
    "planLabel": "Plan mélodique",
    "planNames": {
      "full": "Mélodie et accords",
      "melody": "Suivre une mélodie",
      "off": "Sans plan"
    },
    "qualityHints": {
      "draft": "Le modèle {model} prend moins de mémoire vidéo, le son est un peu plus simple : pour essayer des idées.",
      "final": "Le modèle {model}, 32 étapes de décodage et plus proche des tags de style (CFG 1,2) : pour un morceau final. Faites 2–3 variantes et gardez la meilleure. bf16 demande plus de mémoire vidéo que q8_0 (son fichier fait 7,3 Go contre 4,3 Go).",
      "normal": "Le modèle {model} avec les réglages habituels : un bon son sans trop attendre.",
      "own": "Précision, étapes et CFG à la main."
    },
    "qualityLabel": "Qualité",
    "qualityNames": {
      "draft": "Brouillon",
      "final": "Final",
      "normal": "Normal",
      "own": "Perso"
    },
    "queued": "En attente, variantes : {n}",
    "scoreGivenNote": "La partition donnée remplace le plan : l’échantillonnage de la partition ne fait donc rien et n’est pas envoyé.",
    "sections": {
      "bridge": "+ Bridge",
      "chorus": "+ Chorus",
      "outro": "+ Outro",
      "verse": "+ Verse"
    },
    "tabs": {
      "changed": "Modifié par rapport aux défauts",
      "melody": "Mélodie",
      "song": "Morceau",
      "tuning": "Réglages"
    },
    "takes": "Variantes",
    "tuningTitle": "Réglages de performance"
  },
  "acePage": {
    "openTrainingPage": "Ouvrir l’entraînement de LoRA"
  },
  "library": {
    "noTracks": "La bibliothèque n’a pas encore de morceaux. Importez un fichier ci-dessus ou créez un morceau dans Créer."
  },
  "notInstalled": {
    "stableAudio": {
      "text": "Stable Audio 3 crée des instrumentaux et des effets sonores et alimente le repaint, le prolongement et la reprise de l’éditeur. Il a été omis à l’installation. Une fois installé, téléchargez un modèle dans Modèles et réglages ou directement dans le formulaire de Stable Audio."
    }
  },
  "idea": {
    "guide": {
      "lead": "Une phrase en entrée, un morceau en sortie, directement sur la page d’accueil. Vous décrivez une chanson, un instrumental ou un son avec vos mots, un modèle de langage local écrit le prompt au format du moteur choisi, vous le modifiez si vous voulez, et le moteur crée le morceau.",
      "steps": [
        {
          "title": "Décrire l’idée",
          "text": "Une phrase ou deux : le sujet de la chanson, l’ambiance, qui chante, où et quand. Pour un instrumental : le genre, les instruments et l’ambiance."
        },
        {
          "title": "Choisir le type et le moteur",
          "text": "Chanson avec voix, instrumental ou son, puis ACE-Step, YuE2 ou Stable Audio 3. Un moteur qui ne fait pas ce type ne peut pas être choisi ; un son revient toujours à Stable Audio."
        },
        {
          "title": "Composer",
          "text": "Cliquez sur Composer : l’assistant écrit le prompt juste sous la phrase et montre l’étape, le pourcentage et le texte au fur et à mesure. Vous pouvez l’arrêter. Un son saute cette étape : Composer ouvre le formulaire de Stable Audio avec la phrase."
        },
        {
          "title": "Modifier le prompt",
          "text": "Les tags, les paroles, le tempo, la tonalité et la durée se changent directement dans les champs."
        },
        {
          "title": "Générer",
          "text": "Générer place les variantes dans la file du moteur, qui le démarre quand leur tour vient, et ouvre Créer : les variantes apparaissent dans la liste de session, nommées d’après l’idée."
        }
      ],
      "writer": [
        "L’assistant de prompt est un modèle de langage local, Qwen3.5. Il reste fidèle à l’idée et écrit les paroles dans la langue de l’idée ou celle que vous choisissez. Son modèle se télécharge sur la page Modèles.",
        "Pour ACE-Step, le propre modèle de langage d’ACE-Step peut aussi écrire le prompt tant que le moteur tourne. C’est plus rapide, en général 5–20 s, mais il s’écarte plus souvent de l’idée.",
        "La langue des paroles est tirée par défaut des lettres de l’idée ; vous pouvez la choisir sous Plus, ainsi que qui écrit le prompt. Sur la page Créer, elle se trouve sous les Réglages de la ligne d’idée."
      ],
      "after": [
        "Une autre variante réécrit le prompt à partir de la même idée.",
        "Ouvrir dans le formulaire place le prompt dans le formulaire du moteur sur la page Créer, avec tous ses réglages.",
        "L’idée et le prompt restent quand vous quittez la page ou la rechargez. Après Générer, ils sont effacés pour la prochaine idée ; Réinitialiser les efface à la main.",
        "Sur la page Créer, la même idée se trouve dans la ligne d’idée au-dessus du formulaire : Écrire place les paroles et le style directement dans le formulaire (Décrire, pour Stable Audio), et Remettre ce qui était là rétablit le formulaire."
      ],
      "tips": [
        "Le concret vaut mieux que les mots généraux : « un train de nuit quittant une petite ville » donne plus que « une chanson triste ».",
        "Vous voulez un genre, une voix ou des instruments précis ? Nommez-les dans l’idée.",
        "Lisez les paroles avant de générer : un petit modèle ne réussit pas toujours la rime et la métrique.",
        "Ce n’est pas le son voulu ? Essayez un autre moteur sur la même idée : le prompt est réécrit à son format.",
        "La pluie, un coup, des pas sont des sons, pas de la musique : choisissez Son, et la phrase va directement dans le formulaire de Stable Audio. Avec Instrumental et Stable Audio 3, l’assistant comprend tout seul qu’un son est voulu ; ACE-Step fait un morceau à partir d’une telle idée."
      ]
    }
  },
  "sa3Weights": {
    "allOnModels": "Tous les modèles, les checkpoints base et les réglages sont sur la page Modèles"
  },
  "autoTitle": {
    "accept": "L’utiliser",
    "another": "Une autre",
    "bulk": "Suggérer des titres",
    "bulkDone": "{n} morceau nommé | {n} morceaux nommés",
    "bulkFailed": "{n} nommés, puis arrêt : {error} | {n} nommés, puis arrêt : {error}",
    "bulkHint": "L’assistant nomme chaque morceau sélectionné à tour de rôle ; « Annuler » remet les anciens titres.",
    "bulkStopped": "Arrêté : {n} sur {total} nommés",
    "bulkUndone": "Ancien titre restauré | Anciens titres restaurés : {n}",
    "cancel": "Annuler",
    "failed": "Impossible de trouver un titre : {error}",
    "noAssistant": "L’assistant de prompts n’est pas prêt : téléchargez son modèle dans Modèles.",
    "progress": "Nomination de {done} sur {total}",
    "stop": "Arrêter",
    "suggest": "Suggérer un titre",
    "working": "Recherche d’un titre…"
  },
  "covers": {
    "alt": "Pochette de {title}",
    "another": "Une autre pochette",
    "bulk": "Créer des pochettes",
    "bulkDone": "{n} pochette créée | {n} pochettes créées",
    "bulkFailed": "{n} n’ont pas abouti",
    "bulkHint": "Une pochette pour chaque morceau sélectionné, l’une après l’autre ; un morceau qui en a déjà une en reçoit une nouvelle.",
    "bulkProgress": "Pochettes : {done} sur {total}",
    "cancel": "Annuler",
    "describe": "Ce que montre l’image",
    "describeHint": "Une scène en quelques mots ; l’anglais fonctionne le mieux. Le texte dans l’image est évité automatiquement.",
    "dismiss": "Fermer",
    "edit": "Modifier la description…",
    "enable": "Créer des pochettes d’album pour les morceaux",
    "enableHint": "Ajoute une image à chaque morceau de la bibliothèque, du lecteur et de la session. Désactivé : aucune pochette et aucun bouton de pochette nulle part.",
    "engine": "Pochettes (Z-Image Turbo)",
    "failed": "La pochette n’a pas abouti : {error}",
    "fromAssistant": "D’après l’idée de l’assistant pour ce morceau.",
    "installed": "installé",
    "loadingPrompt": "Lecture de la description…",
    "make": "Créer une pochette",
    "making": "Création de la pochette…",
    "makingPct": "Création de la pochette… {pct} %",
    "model": "Modèle : Z-Image Turbo, {gb} Go",
    "notInstalled": "non installé",
    "notInstalledHint": "Le modèle de pochettes n’est pas sur cet ordinateur. Installez-le avec l’installateur (la partie Pochettes) ou le script d’installation.",
    "onButton": "Une pochette n’est créée que lorsque vous appuyez sur un bouton : dans les détails d’un morceau de la bibliothèque, ou pour les morceaux sélectionnés. Chacune prend 5 à 10 secondes ; pendant ce temps le GPU passe au modèle de pochettes, et le morceau suivant recharge son moteur.",
    "parts": {
      "main": "Poids de Z-Image Turbo",
      "server": "Serveur d’images (stable-diffusion.cpp)"
    },
    "queued": "En attente dans la file…",
    "remove": "Supprimer la pochette",
    "removeConfirm": "Oui, supprimer",
    "stop": "Arrêter",
    "title": "Pochettes",
    "draw": "Dessiner",
    "withAssistant": "Faire avec l’assistant",
    "withAssistantHint": "L’assistant de prompts écrit une description à partir de votre texte (dans n’importe quelle langue) ou, si le champ est vide, de la chanson ; vous pouvez la modifier avant de dessiner.",
    "putBack": "Rétablir",
    "anyLanguageHint": "Écrivez dans n’importe quelle langue : l’assistant en fait une description que le modèle d’images comprend.",
    "fromSaved": "La description d’après laquelle la dernière pochette a été dessinée.",
    "noAssistant": "L’assistant de prompts n’est pas prêt : téléchargez son modèle dans Modèles.",
    "describing": "Description de l’image…",
    "describingPct": "Description de l’image… {pct} %",
    "describeFailed": "L’assistant n’a pas pu décrire l’image : {error}",
    "bulkDescribing": "Description {done} sur {total}",
    "starting": "Démarrage du modèle d’images…"
  },
  "takeCompare": {
    "best": "★ Meilleure",
    "failed": "Chargement impossible",
    "keep": "Garder la meilleure, mettre les autres à la corbeille",
    "keepConfirm": "Mettre {n} variante à la corbeille ? | Mettre {n} variantes à la corbeille ?",
    "keepNeedStar": "Mettez une étoile à la meilleure variante pour la garder.",
    "keepTooMany": "Mettez une étoile à une seule variante : celle à garder.",
    "keepWill": "Garde {take} ; l’autre va à la corbeille. | Garde {take} ; les {n} autres vont à la corbeille.",
    "kept": "{take} gardée ; {n} variante mise à la corbeille. | {take} gardée ; {n} variantes mises à la corbeille.",
    "keys": "1–4 choisir une variante · Espace lecture/pause · ←/→ 5 s · Échap fermer",
    "loading": "Chargement…",
    "loadingAll": "chargement des variantes…",
    "newestOf": "Les {shown} plus récentes sur {total} variantes",
    "nowHearing": "En lecture : {take}",
    "open": "Comparer",
    "openTitle": "Comparer les variantes de ce morceau, A/B",
    "position": "{at} sur {total}",
    "restored": "{n} variante restaurée | {n} variantes restaurées",
    "seed": "seed {seed}",
    "seek": "Position",
    "takes": "Variantes",
    "tileLabel": "{letter}, variante {n}",
    "title": "Comparer les variantes"
  }
}
