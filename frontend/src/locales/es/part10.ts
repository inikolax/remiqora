// Strings added after the first translation (machine-translated from en, 743 keys);
// merged into the other parts key by key (see ../mergeParts).
export default {
  "aceGen": {
    "addLora": "Añadir el LoRA",
    "cfgIntervalOrder": "La guía «desde» debe ser menor que «hasta».",
    "lengthAskedNote": "La duración llega al modelo como un deseo. Pulsa de nuevo la elegida para dejarla al modelo.",
    "lengthByModelNote": "Con una descripción, el modelo elige la duración. Elige una aquí para pedir la tuya.",
    "loraName": "Nombre del LoRA",
    "loraPath": "Carpeta del adaptador LoRA",
    "manual": {
      "adg": "Guía adaptativa (ADG)",
      "balancedOnly": "en el modo Equilibrado",
      "baseOnly": "solo modelos base y SFT",
      "bpm": "Tempo",
      "cfgEnd": "Guía hasta (parte del recorrido)",
      "cfgStart": "Guía desde (parte del recorrido)",
      "cotCaption": "Ampliar la descripción",
      "cotCaptionHint": "Activado: el modelo de lenguaje puede reescribir tu texto de estilo antes de crear la música.",
      "cotLanguage": "Detectar el idioma",
      "cotLanguagePicked": "desactivado: se mantiene el idioma elegido",
      "coverNoise": "Ruido mezclado con el original",
      "coverRepaintOnly": "para una versión o un repintado",
      "infer": "Método de decodificación",
      "latentCrossfade": "Unión dentro del modelo",
      "length": "Duración",
      "lmCfg": "Cercanía a la indicación",
      "lmNegative": "Qué evitar",
      "lmSub": "escribe el plan del tema y completa lo que falta",
      "lmTitle": "Modelo de lenguaje",
      "loraScale": "Intensidad del LoRA",
      "metaByModel": "el modelo lo elige a partir de la descripción",
      "musicSub": "lo que se sabe del tema de antemano",
      "musicTitle": "Música",
      "myLoras": "Mis LoRA: {n}",
      "needRef": "con un tema de referencia",
      "noLm": "ACE-Step no lo carga en esta GPU",
      "noLmWithRef": "no se usa con un tema de referencia",
      "ode": "ODE: se repite exactamente",
      "off": "desactivado",
      "pickLora": "elige antes un LoRA",
      "refSub": "versión y repintado",
      "refTitle": "Tema de referencia",
      "repaintMode": "Modo de repintado",
      "repaintModes": {
        "aggressive": "Audaz",
        "balanced": "Equilibrado",
        "conservative": "Cuidadoso"
      },
      "repaintOnly": "para repintar un rango",
      "repaintStrength": "Intensidad del repintado",
      "resultSub": "cómo entregarlo",
      "sde": "SDE: con aleatoriedad",
      "sdeBaseWarn": "En un modelo base, SDE dio ruido en lugar de música en una prueba (32 pasos). En Turbo funciona, con un sonido más oscuro.",
      "shift": "Desplazamiento del calendario",
      "thinking": "Primero un plan (thinking)",
      "tiled": "Decodificar por fragmentos",
      "turboSteps": "Turbo admite de 1 a 8 pasos: más se recortan a 8",
      "wavCrossfade": "Unión en el audio"
    },
    "modeDescribe": "Desde una descripción",
    "modeLabel": "Por dónde empezar",
    "modeOwn": "Letra y estilo propios",
    "modelNote": "Turbo usa 8 pasos. Los otros modelos tardan más; quitar o añadir una parte no funciona en todos, y las tareas que un modelo no puede hacer aparecen en gris en la pestaña De un tema.",
    "noLmBaseNote": "Base y SFT dependen de ese modelo para voces limpias: en este modo la voz puede sonar ruidosa y lejana. Para voces, cambia a Letra y estilo propios y escribe la letra, o elige Turbo.",
    "noLmNote": "En esta tarjeta gráfica (8 GB o menos) ACE-Step no carga su modelo de lenguaje, así que tu descripción llega al modelo como un simple prompt de estilo, sin letra escrita.",
    "noVocal": "Sin voz",
    "noVocalHint": "Un instrumental: no hace falta letra, el estilo de abajo define la música.",
    "queuedStatus": "En la cola, tomas: {n}",
    "refFile": "Archivo de audio de referencia",
    "refOff": "Actívalo para trabajar a partir de un tema terminado: una versión, un rango rehecho, una parte quitada o añadida.",
    "removeLoraConfirm": "¿Quitar?",
    "removeLoraNamed": "Quitar el LoRA {name}",
    "repaintOrder": "El final del rango debe ir después de su inicio.",
    "simple": {
      "auto": "auto",
      "fast": "rápido {n}",
      "formatHint": "mp3 ocupa menos; wav y flac conservan el sonido sin pérdidas.",
      "key": "Modo",
      "keyHint": "Mayor suena más brillante, menor más oscuro y triste. La tónica y otras escalas se eligen en Manual.",
      "keyWish": "Con una descripción, el modelo elige la tonalidad. Un modo elegido aquí le llega como un deseo.",
      "lengthHint": "Cuánto dura el tema.",
      "lengthWish": "Con una descripción, el modelo elige la duración. La que elijas aquí le llega como un deseo, no como una garantía.",
      "major": "mayor",
      "medium": "medio {n}",
      "minor": "menor",
      "slow": "lento {n}",
      "tempo": "Tempo",
      "tempoHint": "Pulsos por minuto. «Auto» lo deja al modelo; un número exacto se fija en Manual.",
      "tempoWish": "Con una descripción, el modelo elige el tempo. El que elijas aquí le llega como un deseo."
    },
    "tabChanged": "cambiado",
    "tabs": {
      "ref": "De un tema",
      "song": "Canción",
      "tuning": "Ajustes"
    },
    "taskType": "Qué hacer con el tema",
    "taskUnsupported": "No lo admite este modelo",
    "help": {
      "style": {
        "tips": [
          "Lo óptimo son 5–9 etiquetas: con menos, el modelo rellena los huecos por su cuenta y el resultado es menos predecible; con más, las etiquetas empiezan a chocar entre sí.",
          "Pon primero el género y el ambiente: dan forma al carácter general del tema más que el resto de las etiquetas.",
          "No mezcles etiquetas contradictorias en una misma categoría (p. ej. «agresivo» y «soñador» a la vez): el modelo ignorará una o el resultado quedará confuso.",
          "Es mejor escribir las etiquetas en inglés: los datos de entrenamiento son sobre todo en inglés, así que la precisión es mayor, aunque la letra esté en ruso.",
          "Un tempo fijado en Ajustes (en Simple, o como número exacto en Manual) es más fiable que una etiqueta de texto como «120 bpm» en el estilo: úsalo cuando el tempo importe."
        ]
      },
      "lyrics": {
        "tips": [
          "Ajústala a la duración del tema: unos 2 minutos suelen bastar para 2 estrofas + 2 estribillos; para 3+ minutos añade un puente y un segundo gancho. Un texto demasiado largo para una duración corta lo «apretará» el modelo.",
          "Las líneas cortas (5–10 sílabas) encajan en la melodía de forma más predecible que las largas: si una línea se alarga, pártela en dos.",
          "Un estribillo que se repite (texto idéntico palabra por palabra en cada [Chorus]) ayuda al modelo a mantener la misma melodía en todo el tema.",
          "Para un tema totalmente instrumental, marca «Sin voz» en lugar de escribir una letra que solo sea [Interlude]: es más fiable.",
          "La puntuación (comas, puntos suspensivos) afecta al fraseo y a las pausas de la voz: úsala con intención, no solo por las reglas de ortografía."
        ]
      },
      "remix": {
        "unavailable": "El conjunto de escenarios disponibles depende del modelo elegido: las opciones no admitidas aparecen en gris en el formulario. Prueba con otro modelo (en la pestaña Canción o en Ajustes) si necesitas un escenario concreto. Sube el archivo de referencia en un formato del que el modelo pueda extraer audio (wav/mp3/flac): los archivos muy largos (varios minutos) pueden aumentar notablemente el tiempo de procesamiento."
      },
      "advanced": {
        "title": "Ajustes",
        "rows": [
          {
            "param": "Simple y Manual",
            "what": "Simple tiene unas pocas opciones claras: pasos de decodificación (no en Turbo), duración, tempo (lento 80, medio 110, rápido 140), modo (mayor o menor) y formato. Manual tiene cada parámetro en grupos, y la consola los muestra todos a la vez."
          },
          {
            "param": "Formato",
            "what": "El formato del archivo de salida. mp3 es más compacto y basta para escuchar; wav y flac no tienen pérdidas pero pesan de 5 a 10 veces más."
          },
          {
            "param": "Tempo, tonalidad, compás",
            "what": "Parámetros musicales explícitos. Si los dejas en auto, el modelo los toma del texto de estilo; fíjalos a mano solo cuando importe la precisión (para mezclar con otros temas, por ejemplo). El compás es 2/4, 3/4, 4/4 o 6/8. Con una descripción, el modelo los elige él mismo: un tempo o una tonalidad fijados aquí le llegan como un deseo, y el compás se lo deja a él."
          },
          {
            "param": "Idioma de la voz",
            "what": "El idioma en que se canta. En auto se toma de la letra, lo que puede fallar con letras cortas o ambiguas: fíjalo si la voz sale en el idioma equivocado. Un idioma elegido a mano se conserva, el modelo de lenguaje no lo sustituye."
          },
          {
            "param": "Pasos de decodificación",
            "what": "El número de pasos de difusión. Más puede dar un audio más limpio pero una generación más lenta; pasado cierto punto la mejora apenas se oye. Turbo admite de 1 a 8 (8 por defecto), los modelos SFT 50, los modelos base 32. En Simple, Más duplica el número habitual."
          },
          {
            "param": "Cercanía al estilo",
            "what": "La escala de guía: con qué rigor sigue el modelo tu descripción. Más alta sigue con más precisión las etiquetas de estilo, pero valores muy altos hacen el sonido áspero y lleno de artefactos; más baja es más natural pero menos predecible. Turbo no la usa. El valor predeterminado es 7, un rango razonable suele ser de 3 a 12."
          },
          {
            "param": "Seed",
            "what": "Bajo el formulario, junto a Crear. Con el dado pulsado cada toma recibe una seed aleatoria nueva. Un número con el resto de ajustes iguales repite casi el resultado: útil para cambiar una etiqueta de estilo y comparar."
          },
          {
            "param": "Modelo",
            "what": "Turbo es más rápido a costa de algo de calidad y no hace todas las tareas de la pestaña De un tema; base y SFT son más lentos pero más precisos y flexibles. El modelo se elige en la pestaña Canción o en Manual."
          },
          {
            "param": "LoRA",
            "what": "Un complemento ajustado sobre el modelo, para un timbre de voz o un subgénero concretos, por ejemplo. Su intensidad (de 0 a 1) marca cuánto influye en el resultado: 1 es el efecto completo que pretendía el autor del adaptador, menos lo mezcla con más suavidad. Los adaptadores se añaden en Mis LoRA, en Manual, con un nombre y una carpeta."
          }
        ],
        "footer": "Lo que no toques va con el valor predeterminado del motor: no hace falta fijarlo todo para obtener un buen resultado. Restablecer devuelve las filas propias de los ajustes y no toca el modelo ni la duración."
      }
    }
  },
  "aiPart": {
    "guide": {
      "scratch": [
        {
          "title": "Tempo, tonalidad, duración",
          "text": "En un proyecto vacío fija los BPM y la «Tonalidad», y la duración en segundos en el panel. 64 compases a 120 BPM son 128 segundos."
        },
        {
          "title": "Empieza por la batería",
          "text": "«Añadir una parte», instrumento «Batería». Las demás partes siguen el ritmo de la batería, así que va primero."
        },
        {
          "title": "Bajo y luego armonía",
          "text": "Bajo y después acordes: teclado, pad. Deja la batería marcada en la lista de pistas que oye el modelo."
        },
        {
          "title": "Melodía y color",
          "text": "Lead, cuerdas, percusión. Bastan de cinco a siete partes; con más, la mezcla se satura."
        },
        {
          "title": "Elige y ajusta el volumen",
          "text": "Quédate con la mejor variante de cada parte y bájala enseguida a un nivel adecuado."
        },
        {
          "title": "Construye la canción",
          "text": "Activa «Imán» y la regla en compases, corta las partes con el Cuchillo y quita trozos con la Goma: una intro, la parte principal, un descanso sin batería ni bajo, un final."
        }
      ],
      "scratchIntro": "El arreglista puede construir un tema desde un proyecto vacío. Las partes se añaden una a una y cada nueva oye las que ya están, así que el orden importa.",
      "scratchTitle": "Un tema desde cero",
      "steps": [
        {
          "title": "Inicia el motor",
          "text": "El arreglista funciona con ACE-Step; repintar, continuar y cover también pueden usar Stable Audio 3. Si el motor está detenido, el panel ofrece iniciarlo con un botón, y entonces se detiene el motor que estaba en la GPU."
        },
        {
          "title": "Fija el tempo y la tonalidad",
          "text": "Antes de la primera parte, fija el BPM del proyecto y la \"Tonalidad\": tónica y escala. El modelo las recibe en cada petición. No cambies el tempo después de las primeras partes: se saldrían de la cuadrícula."
        },
        {
          "title": "Elige un modo",
          "text": "\"Añadir una parte\", \"Repintar\", \"Continuar\" o \"Cover\". La pista junto al selector dice en una línea qué hará el modelo."
        },
        {
          "title": "Describe lo que necesitas",
          "text": "Para una parte nueva, elige el instrumento. En la descripción, nombra el sonido y la interpretación. Escribe en tu idioma: \"Al inglés\" lo reescribe como mejor lo lee el modelo. El \"?\" junto al campo abre palabras y ejemplos listos."
        },
        {
          "title": "Marca lo que oye el modelo",
          "text": "El modelo se ajusta a las pistas marcadas. Deja la batería: el modelo sigue su cuadrícula."
        },
        {
          "title": "Indica dónde",
          "text": "Todo el tema o la región de bucle: activa \"Bucle\" y arrastra la región en la regla. \"Repintar\" solo funciona en la región de bucle."
        },
        {
          "title": "Genera y elige",
          "text": "Las variantes caen en pistas nuevas. \"Escuchar\" cambia a una variante, \"Conservar\" elimina las demás."
        }
      ],
      "tips": [
        "La descripción funciona mejor en inglés, con frases cortas separadas por comas. Escribe en tu idioma y pulsa \"Al inglés\"; lee el resultado y corrígelo si hace falta.",
        "Describe una parte, no todo el tema: qué toca el instrumento y cómo suena.",
        "Construye el tema por pasos: batería, luego bajo, armonía y melodía. Cada parte nueva oye las anteriores.",
        "¿No te convence una variante? Genera de nuevo: cada ejecución usa seeds aleatorios nuevos.",
        "Tras cada parte nueva, ajusta su volumen antes de añadir la siguiente: la siguiente parte oye la mezcla tal como está ahora.",
        "Cuando las partes estén listas, construye la canción con ellas: corta las pistas por compases con el Cuchillo (C) y elimina trozos con la Goma (E), para que los instrumentos entren uno tras otro.",
        "Para voces, escribe la letra y revisa \"Idioma de la voz\": en \"Auto\" se detecta por las letras.",
        "ACE-Step nivela cada resultado a -1 dBFS, así que una parte nueva llega fuerte: bájala con el control de volumen de la pista.",
        "Para terminar el tema en otro DAW, exporta \"Stems + Reaper\" o DAWproject.",
        "Repintar, continuar y cover también pueden usar Stable Audio 3: elígelo como motor en el panel. Rellena y continúa escuchando el audio alrededor del rango, en segundos, solo instrumental. Añadir una parte se queda con ACE-Step."
      ]
    },
    "toEnglish": "Al inglés",
    "toEnglishBusy": "Escribiendo…",
    "toEnglishDone": "Reescrito en inglés por el asistente; edítalo si hace falta.",
    "toEnglishFailed": "El asistente no pudo escribir la descripción.",
    "toEnglishGpu": "El asistente de prompts está configurado para usar la GPU y descargaría el modelo. Cámbialo a Auto o CPU en la página Modelos.",
    "toEnglishTitle": "Descríbelo en cualquier idioma: el asistente de prompts lo reescribe en inglés, como mejor lo lee el modelo",
    "toEnglishUndo": "Deshacer"
  },
  "create": {
    "closeTool": "Cerrar",
    "deleteAsk": "¿Eliminar?",
    "details": "Detalles",
    "download": "Descargar",
    "emptyAll": "Tus canciones aparecerán aquí",
    "emptyHint": "Elige un motor, rellena el formulario o escribe una frase en la línea de idea de arriba, y pulsa Crear.",
    "emptyPeriod": "No se hizo nada en este período",
    "engine": "Motor",
    "engineTitle": "{name}: {status}",
    "engines": {
      "ace_step": "Rápido, versiones",
      "stable_audio": "Sonidos y bucles",
      "yue2": "Canciones con voz"
    },
    "failed": "No funcionó. Cárgalo en el formulario y pulsa Crear de nuevo.",
    "idea": {
      "chip": {
        "description": "Descripción",
        "length": "Duración",
        "lyrics": "Letra",
        "style": "Estilo",
        "tempo": "Tempo y tonalidad"
      },
      "describe": "Describir",
      "dismiss": "Descartar",
      "formChanged": "Se cambió el formulario.",
      "noAssistant": "El asistente de prompts no está listo: descarga su modelo en Modelos y ajustes (el engranaje de la cabecera).",
      "noAssistantLink": "Descargarlo en Modelos",
      "noAssistantNote": "El asistente de prompts necesita su modelo.",
      "placeholder": {
        "ace_step": "En una frase: qué música quieres",
        "stable_audio": "En una frase: qué debe sonar",
        "yue2": "En una frase: de qué trata la canción"
      },
      "replaces": "Sustituye lo que hay ahora en el formulario",
      "settings": "Ajustes",
      "stop": "Detener",
      "stopping": "Deteniendo…",
      "undo": "Volver a lo que había",
      "write": "Escribir la letra y el estilo",
      "writeSa": "Escribir la descripción",
      "writeShort": "Escribir",
      "writing": "El asistente está escribiendo…",
      "written": "Puesto en el formulario de abajo.",
      "writtenOther": "Puesto en el formulario de {name}.",
      "saKind": "Escribir",
      "saKinds": {
        "auto": "Auto: según la idea",
        "music": "Pista musical",
        "instrument": "Instrumento solista",
        "one_shot": "Muestra one-shot",
        "sfx": "Efecto de sonido"
      }
    },
    "lessDetails": "Menos",
    "live": {
      "failed": "Falló la toma: {name}. {reason}",
      "queue": "Tomas en la cola: {n}",
      "ready": "Toma lista: {name}",
      "readyMany": "Tomas listas: {n}, {name}"
    },
    "loading": "Cargando temas…",
    "making": "Creando",
    "menu": {
      "made": "Creado {when}, duración {len}",
      "midi": "A MIDI",
      "rename": "Renombrar",
      "stems": "Separar en stems",
      "took": "tardó {s} s"
    },
    "models": "Modelos",
    "more": "Detalles y acciones",
    "pause": "Pausa",
    "peek": {
      "copied": "Copiado",
      "copy": "Copiar",
      "lines": "{n} líneas",
      "lyrics": "Letra",
      "noLyrics": "Sin letra",
      "style": "Estilo",
      "tags": "{n} etiquetas"
    },
    "period": "Período",
    "periodHint": {
      "all": "Todo lo creado hasta ahora.",
      "today": "Tomas hechas hoy. Las marcadas con estrella se reúnen en Favoritos de la biblioteca.",
      "week": "Tomas de los últimos siete días."
    },
    "periods": {
      "all": "Todo",
      "today": "Hoy",
      "week": "7 días"
    },
    "play": "Reproducir",
    "position": "Posición en el tema",
    "queued": "En cola",
    "reuse": "Cargar en el formulario",
    "reuseInForm": "Cargar en el formulario",
    "session": "Sesión",
    "showAll": "Mostrar todo: {n}",
    "showMore": "Mostrar más: {n}",
    "startAndCreate": "Iniciar {name} y crear",
    "startFailed": "{name} no se inició.",
    "startingEngine": "Iniciando {name}…",
    "startsOnCreate": "{name} no está en marcha ahora. Se inicia al pulsar Crear; la primera toma tras el inicio tarda más.",
    "startsOnCreateOther": "{other} ocupa ahora la GPU. {name} se inicia al pulsar Crear y {other} se detiene. La primera toma tras el inicio tarda más.",
    "stop": "Detener",
    "stopAsk": "¿Detener?",
    "stopConfirm": "Pulsa otra vez para detener: lo hecho hasta ahora se pierde",
    "stopped": "Detenido.",
    "styleAndLyrics": "Estilo y letra",
    "takeN": "Toma {n}",
    "takeTitle": "{title}, toma {n}",
    "takes": "Tomas: {n}",
    "toSession": "A la lista de la sesión, tomas: {n}",
    "untitled": "Sin título",
    "wholeLibrary": "Toda la biblioteca"
  },
  "favorite": {
    "add": "Añadir a favoritos",
    "remove": "Quitar de favoritos"
  },
  "header": {
    "create": "Crear",
    "desc": {
      "create": "Canciones, instrumentales y sonidos",
      "library": "Todos los temas: creados, subidos y del editor"
    },
    "gpuFree": "GPU libre",
    "home": "Inicio",
    "languageCurrent": "Idioma de la interfaz: {name}",
    "library": "Biblioteca",
    "more": "Más: idioma, modelos, ayuda",
    "guide": {
      "mapTitle": "Las partes de la aplicación",
      "map": {
        "idea": "La forma más simple de entrar, en la propia página de inicio: una frase y Componer, y un modelo de lenguaje local escribe el prompt para el motor. Edítalo y genera el tema.",
        "lora": "Ajusta ACE-Step con tus propios temas: sube audio, etiqueta automáticamente, revisa las descripciones, entrena y exporta. Se abre en la página Crear, bajo ACE-Step; el adaptador terminado aparece en el formulario de ACE-Step.",
        "yue": "El segundo motor: escribe una canción entera con voz y puede construirla en torno a una melodía dada (la pestaña Melodía, con SheetSage2). También convierte un tema en MIDI."
      },
      "gpu": [
        "Los motores no caben juntos en la GPU, así que funciona uno a la vez. El motor se elige en la página Crear y se inicia al pulsar Crear en su formulario; el que estaba en marcha se detiene.",
        "El primer inicio tarda unos minutos mientras el modelo se carga en la memoria de vídeo. El botón de estado de la cabecera muestra el motor que está en la GPU y cuánta memoria de vídeo está ocupada; un clic muestra quién ocupa cuánta, el botón Descargar y el acceso a Modelos.",
        "Descargar detiene una generación o un entrenamiento en curso, por eso el botón pregunta antes."
      ],
      "steps": [
        {
          "title": "Abre ACE-Step",
          "text": "Ve a Crear y elige ACE-Step. Se inicia con la primera pulsación de Crear; el primer inicio tarda unos minutos."
        },
        {
          "title": "Describe la canción",
          "text": "En la pestaña Canción, Desde una descripción: bastan un par de frases, el género, el ambiente, de qué trata la letra. Elige la duración y cuántas tomas."
        },
        {
          "title": "Elige la mejor toma",
          "text": "Las tomas se alinean en la lista de la sesión junto al formulario (debajo en un teléfono). Todo lo creado se guarda solo en la biblioteca."
        },
        {
          "title": "Sepáralo en stems",
          "text": "Voz, batería, bajo y otros con un clic: Separar en stems en el menú de una toma, la pestaña Stems y notas de la biblioteca, o directamente en el editor."
        },
        {
          "title": "Constrúyelo en el editor",
          "text": "Coloca los stems en pistas, añade partes con el arreglista de IA, configura los efectos."
        },
        {
          "title": "Exporta",
          "text": "Mezcla a WAV o MP3, o exporta las pistas con un proyecto de Reaper o DAWproject."
        }
      ],
      "compare": [
        {
          "label": "Ideal para",
          "ace": "Canciones e instrumentales rápidos, muchas variantes seguidas",
          "yue": "Una canción entera con voz de una vez",
          "sa3": "Instrumentales, efectos de sonido y samples; rellena y continúa audio en el editor"
        },
        {
          "label": "Trabajar con un tema",
          "ace": "Versión, repintar una sección, añadir una parte, extraer una parte, continuar",
          "yue": "Una canción con la melodía de otro tema: la pestaña Melodía, con SheetSage2 o un archivo MIDI",
          "sa3": "Repintar un rango, continuar, una versión en otro estilo (audio a audio); sin partes sobre una mezcla"
        },
        {
          "label": "Tu propio estilo",
          "ace": "Un LoRA entrenado con tus temas",
          "yue": "No",
          "sa3": "No (el soporte de LoRA está previsto)"
        },
        {
          "label": "Duración",
          "ace": "De 10 a 300 segundos, 1, 2 o 4 tomas por ejecución",
          "yue": "Lo que dure la letra, o de 1 a 8 minutos; de 1 a 4 tomas por ejecución",
          "sa3": "Hasta 6 minutos (medium) o 2 minutos (small); 1, 2 o 4 tomas por ejecución, segundos por ejecución"
        },
        {
          "label": "MIDI",
          "ace": "No",
          "yue": "Un tema o stem a MIDI (MuScriptor)",
          "sa3": "No"
        },
        {
          "label": "Licencia",
          "ace": "MIT: uso comercial permitido; revisa los términos actuales antes de publicar",
          "yue": "Solo uso no comercial",
          "sa3": "Stability AI Community License: gratis por debajo de 1 M USD al año; solo instrumental, sin voz"
        }
      ]
    },
    "helpSections": {
      "idea": {
        "title": "Componer a partir de una idea",
        "text": "En la página de inicio, describe una canción, un instrumental o un sonido en una o dos frases y elige el motor; el idioma de la letra y quién escribe el prompt están en Más. En Componer, el asistente de prompts, un modelo local Qwen3.5, escribe el prompt en el formato del motor: etiquetas de estilo, letra por secciones, tempo y tonalidad. Edítalo, genera, o ábrelo en el formulario del motor. Un sonido se salta el asistente y va directo a Stable Audio. En la página Crear la misma idea está en la línea de idea sobre el formulario y escribe directamente en él. El modelo y el dispositivo del asistente se configuran en Modelos y ajustes."
      },
      "engines": {
        "text": "Tres motores generan audio, ACE-Step 1.5, YuE2-3B y Stable Audio 3, y no caben juntos en una GPU, así que funciona uno a la vez. Elige un motor en la página Crear: se inicia al pulsar Crear y el que estaba en marcha se detiene solo. La luz muestra su estado; el primer inicio puede tardar unos minutos mientras el modelo se carga en la memoria de vídeo. El botón de estado de la cabecera muestra qué ocupa la GPU y puede descargarlo."
      },
      "ace": {
        "text": "En la pestaña Canción, describe la música con palabras sencillas (Desde una descripción) o da etiquetas de estilo y letra con marcadores [Verse] / [Chorus] (Letra y estilo propios), o marca Sin voz. En la pestaña De un tema, un tema de referencia sirve para hacer una versión, repintar una sección, extraer o añadir una parte, o terminar una composición. La duración es de 10 a 300 s, con 1, 2 o 4 tomas por ejecución. Ajustes tiene Simple (pasos, duración, tempo, modo, formato) y Manual (cada parámetro); allí se activa un LoRA entrenado, con una intensidad de 0 a 1."
      },
      "yue": {
        "text": "YuE2-3B escribe canciones enteras con voz. La pestaña Canción contiene la letra, el estilo, la duración y la calidad. La pestaña Melodía fija el plan de melodía: Sin plan va directo al audio, Seguir una melodía conserva una melodía dada e inventa el acompañamiento, Melodía y acordes escribe primero un plan de ambos. SheetSage2 (De un tema…) escribe la melodía de un tema como una partitura ABC, que puedes editar y devolver a YuE2."
      },
      "sa3": {
        "text": "Stable Audio 3 crea música instrumental y efectos de sonido a partir de una descripción en segundos: elige Música o Sonido, descríbelo como lo haría una biblioteca de samples (género, instrumentos, ambiente, tempo, o la fuente de un sonido y cómo se produce), fija la duración y el número de tomas. No hay voces. El mismo motor sirve al arreglista de IA y a los Samples del editor, donde repinta, continúa y hace versiones escuchando el audio a ambos lados del rango. Los pesos principales tienen acceso restringido: acepta la licencia en Hugging Face, guarda tu token y descarga un modelo en Modelos y ajustes."
      },
      "lora": {
        "text": "El entrenamiento de LoRA está bajo ACE-Step en la página Crear, junto a Generar (en un teléfono, un interruptor sobre el formulario). El entrenamiento necesita ACE-Step en marcha, y la página ofrece iniciarlo. Recorre todo el proceso de ajuste fino: subir audio, etiquetado automático, revisar y editar las descripciones, preprocesado, entrenamiento con progreso en directo y exportación. Un adaptador terminado se añade a la lista de LoRA del formulario de ACE-Step."
      },
      "stems": {
        "text": "Cualquier tema guardado se puede separar en cuatro stems (voz, batería, bajo, otros) con un clic: Separar en stems en el menú de una toma, la pestaña Stems y notas de la biblioteca, o una pista del editor. Los stems pueden abrirse en el editor como un proyecto de cuatro pistas ya listo. La transcripción a MIDI (MuScriptor) funciona con la mezcla completa o con un solo stem; se ejecuta en el motor YuE2, así que YuE2 debe estar instalado."
      },
      "arranger": {
        "text": "El botón «Arreglista de IA» del editor construye una pieza paso a paso en lugar de generarla entera. «Añadir una parte» escribe una parte nueva (batería, bajo, pad, cuerdas, etc.) sobre las pistas elegidas, «Repintar» reescribe un rango débil, «Continuar» sigue el tema, «Versión» crea una nueva versión en otro estilo. Cada variante cae en su propia pista: escucha, quédate con la mejor y pasa a la siguiente parte. Las partes las añade el modelo base de ACE-Step (unos 4.8 GB) o su versión base XL, más grande (unos 20 GB, necesita una tarjeta de 16 GB); ambos son opcionales, y sin el modelo base el arreglista ofrece instalarlo. Los otros modos funcionan con turbo, o con Stable Audio 3 cuando lo eliges como motor: rellena, continúa y hace versiones escuchando el audio de alrededor, solo instrumental."
      },
      "sfx": {
        "text": "El botón «Samples» del editor crea one-shots (un bombo, un golpe, un whoosh), bucles al tempo del proyecto y texturas (lluvia, una multitud, un drone) con Stable Audio 3, a partir de una descripción corta. Los resultados se alinean en una tira: escucha primero y luego añade el que te guste a una pista nueva o a la pista seleccionada en el cursor de reproducción. Los bucles se cortan en compases enteros, pero el modelo no garantiza una unión perfecta, así que compruébalos en repetición. «Quitar de la lista» elimina los sonidos del trabajo de la biblioteca y del disco, salvo los que estén en una pista en ese momento."
      }
    }
  },
  "home": {
    "allTracks": "Toda la biblioteca",
    "compose": "Componer",
    "composeHere": "El asistente escribe el prompt para el motor elegido; puedes editarlo antes de generar",
    "composeSound": "El asistente escribe un prompt de sonido con su duración y Stable Audio lo crea",
    "engineLabel": "Motor",
    "engines": "O ve directo a un motor",
    "firstText": "Describe una canción o toma un ejemplo:",
    "firstTitle": "Tus temas aparecerán aquí",
    "guide": "Cómo funciona la composición",
    "kind": {
      "instrumental": "Instrumental",
      "song": "Canción con voz",
      "sound": "Sonido"
    },
    "kindLabel": "Qué crear",
    "lead": "Todo funciona en este ordenador",
    "loading": "Cargando los temas",
    "more": "Más",
    "needPhrase": "Describe primero la música",
    "title": "¿Qué hacemos?",
    "phraseLabel": "Describe la música",
    "placeholderSound": "lluvia sobre un tejado de chapa por la noche, cercana y tranquila",
    "soundBySa3": "Los sonidos los crea Stable Audio",
    "soundMissing": "Stable Audio no está instalado"
  },
  "keyScale": {
    "hint": "ACE-Step solo conoce mayor y menor. Para esta escala recibe la tonalidad más cercana ({key}) y el nombre de la escala en la descripción: una pista, no una garantía.",
    "mode": "Escala",
    "modes": {
      "blues": "Blues",
      "dorian": "Dórica",
      "double_harmonic": "Doble armónica",
      "harmonic_minor": "Menor armónica",
      "hungarian_minor": "Menor húngara",
      "locrian": "Locria",
      "lydian": "Lidia",
      "major": "Mayor (jónica)",
      "major_pentatonic": "Pentatónica mayor",
      "melodic_minor": "Menor melódica",
      "minor": "Menor natural (eolia)",
      "minor_pentatonic": "Pentatónica menor",
      "mixolydian": "Mixolidia",
      "phrygian": "Frigia",
      "phrygian_dominant": "Frigia dominante"
    },
    "needTonic": "Elige primero la nota de la tonalidad",
    "none": "No existe esa escala",
    "notSet": "sin definir",
    "search": "Escribe para buscar",
    "tonic": "Tónica"
  },
  "libraryPage": {
    "aiPart": "Una parte del arreglista de IA",
    "collectionName": "Nombre de la colección",
    "confirmDeleteCollection": "¿Quitar la colección?",
    "cot": {
      "full": "melodía y acordes",
      "melody": "sigue una melodía"
    },
    "delete": "Eliminar",
    "deleteCollection": "Quitar la colección (sus temas se quedan)",
    "deleteFailed": "No se pudo eliminar: {error}",
    "emptyCollection": "Abre un tema y añádelo a esta colección en su pestaña Acerca de.",
    "emptyFavorites": "Marca un tema con la estrella y aparecerá aquí.",
    "emptyHere": "Aún no hay nada aquí",
    "emptyHint": "Los temas que creas y subes se reúnen aquí.",
    "facts": {
      "file": "Archivo",
      "madeIn": "Creado en",
      "melody": "Melodía",
      "model": "Modelo"
    },
    "filters": {
      "all": "Todos los temas",
      "favorites": "Favoritos",
      "midi": "Notas (MIDI)",
      "score": "Partitura",
      "stems": "Stems",
      "today": "Hoy"
    },
    "filtersLabel": "Filtros de la biblioteca",
    "groups": {
      "collections": "Colecciones",
      "has": "Qué tiene el tema",
      "origin": "Creado por",
      "tags": "Etiquetas"
    },
    "loadFailed": "No se pudo cargar la biblioteca.",
    "newCollection": "+ Nueva colección",
    "newest": "Más recientes primero",
    "noCollections": "Aún no hay colecciones: crea la primera con Nueva colección.",
    "nothingFound": "No se encontró nada",
    "nothingFoundHint": "Prueba con otra palabra u otro filtro.",
    "oldest": "Más antiguos primero",
    "order": "Orden",
    "origins": {
      "editor": "Editor",
      "upload": "Subido"
    },
    "period": "Período",
    "pick": "Elige un tema: aquí se muestran su letra, estilo, stems y notas.",
    "renameCollection": "Renombrar la colección",
    "retry": "Reintentar",
    "reuseHint": "Abre Crear con esta letra, estilo y ajustes",
    "search": "Título, estilo o una línea de la letra",
    "showAll": "Mostrar todos los temas",
    "sub": {
      "editor": "Del editor",
      "engine": "Sin descripción",
      "upload": "Archivo subido"
    },
    "tabs": {
      "about": "Acerca de",
      "lyrics": "Letra",
      "parts": "Stems y notas"
    },
    "take": "Toma {n}",
    "title": "Biblioteca",
    "toCreate": "Crea el primer tema",
    "today": "Hoy",
    "yesterday": "Ayer",
    "bulk": {
      "addTag": "Añadir #{tag}",
      "clear": "Quitar la selección (Esc)",
      "collected": "{n} tema añadido a «{name}» | {n} temas añadidos a «{name}»",
      "collection": "Colección",
      "favorited": "{n} tema añadido a favoritos | {n} temas añadidos a favoritos",
      "label": "Acciones con los temas seleccionados",
      "newCollection": "Nueva colección…",
      "noTags": "Aún no hay etiquetas: escribe una y pulsa Enter.",
      "selectAll": "Seleccionar todo: {n}",
      "selectSong": "Seleccionar «{title}» con sus tomas: {n}",
      "selectTrack": "Seleccionar «{title}»",
      "selected": "Seleccionados: {n}",
      "tag": "Etiqueta",
      "tagPlaceholder": "Una etiqueta nueva, o busca una",
      "tagged": "#{tag} añadida a {n} tema | #{tag} añadida a {n} temas",
      "uncollected": "{n} tema quitado de «{name}» | {n} temas quitados de «{name}»",
      "unfavorited": "{n} tema quitado de favoritos | {n} temas quitados de favoritos",
      "untagged": "#{tag} quitada de {n} tema | #{tag} quitada de {n} temas"
    },
    "emptyTag": "Añade esta etiqueta a un tema en su pestaña Acerca de, o a varios a la vez desde la barra de selección.",
    "tags": {
      "add": "Añade una etiqueta y pulsa Enter",
      "added": "Etiqueta #{tag} añadida",
      "confirmDelete": "¿Eliminar la etiqueta?",
      "delete": "Quitar la etiqueta de todos los temas",
      "remove": "Quitar la etiqueta #{tag}",
      "removed": "Etiqueta #{tag} eliminada",
      "rename": "Renombrar la etiqueta"
    },
    "trash": {
      "confirmEmpty": "¿Eliminarlos todos definitivamente?",
      "confirmPurge": "¿Eliminar definitivamente?",
      "deleted": "Eliminado: {when}",
      "dismiss": "Ocultar el aviso",
      "emptied": "La papelera está vacía ahora",
      "empty": "Vaciar la papelera",
      "emptyHere": "La papelera está vacía",
      "emptyHint": "Los temas eliminados esperan aquí 30 días, por si quieres recuperar alguno.",
      "loadFailed": "No se pudo cargar la papelera: {error}",
      "moveHint": "Mueve el tema a la papelera: se puede restaurar desde allí durante 30 días",
      "moved": "{n} tema movido a la papelera | {n} temas movidos a la papelera",
      "note": "Los temas de la papelera se eliminan definitivamente a los 30 días.",
      "purge": "Eliminar para siempre",
      "purged": "{n} tema eliminado definitivamente | {n} temas eliminados definitivamente",
      "restore": "Restaurar",
      "restored": "{n} tema restaurado | {n} temas restaurados",
      "title": "Papelera",
      "undo": "Deshacer"
    }
  },
  "midiPanel": {
    "betterWithVocals": "Funciona con la mezcla completa; para una melodía exacta, separa el tema en stems y reconoce primero la voz.",
    "scoreEmpty": "El MIDI no tiene notas para hacer una partitura.",
    "scoreFromFull": "de la mezcla completa",
    "scoreFromStems": "melodía de la voz, acompañamiento del bajo y el resto",
    "scoreFromVocals": "melodía de la voz",
    "scoreInserted": "La partitura está en el formulario de YuE2 ({from}).",
    "toScore": "A una partitura de YuE2",
    "toScoreHint": "Convierte las notas en una partitura ABC para YuE2 y la pone en su formulario: la voz pasa a ser la melodía, el bajo y el resto el acompañamiento y los acordes."
  },
  "miniWave": {
    "percent": "{n}%",
    "timeOf": "{pos} de {total}"
  },
  "models": {
    "check": "Comprobar",
    "checkBad": "Dañados o ausentes: {files}. Vuelve a descargar esta parte.",
    "checkFailed": "No se pudo comprobar: {error}",
    "checkOffline": "No se pudo acceder a Hugging Face, así que solo se compararon los tamaños.",
    "checkOkHash": "Los {n} archivos están completos; {h} coincidieron con el SHA-256 que indica Hugging Face.",
    "checkOkRecord": "Los {n} archivos coinciden con su registro por tamaño.",
    "checkOkSize": "Los {n} archivos están completos (comprobado por tamaño y estructura; no hay lista de sumas de verificación con la que comparar).",
    "checkOutdated": "Completo, pero el repositorio tiene ahora una versión más nueva de: {files}. Vuelve a descargar para obtenerla.",
    "checkTitle": "Comprobar que los archivos están completos",
    "checking": "Comprobando…",
    "parts": {
      "yue2-bf16": {
        "name": "YuE2 bf16",
        "text": "El modelo sin cuantizar. Necesita más memoria de vídeo que q8_0 (la mayor de las tres)."
      }
    },
    "reinstall": "Volver a descargar",
    "reinstallAsk": "¿Descargar {gb} GB de nuevo?",
    "reinstallNamed": "Volver a descargar {name}",
    "reinstallNo": "Conservar",
    "reinstallTitle": "Descargarlo otra vez y reemplazar los archivos",
    "reinstallYes": "Volver a descargar",
    "yue2": {
      "noSettings": "La precisión q8_0, q4_0 o bf16 se elige en cada generación en el formulario de YuE2, junto a Calidad."
    }
  },
  "params": {
    "changed": "Cambiado",
    "consoleNote": "Los valores fijados a mano están marcados. El resto va con su valor predeterminado.",
    "consoleTitle": "Consola de {name}",
    "default": "Predeterminado: {v}",
    "quick": "Elección rápida: {group}",
    "reset": "Volver al valor predeterminado",
    "resetOne": "Devolver {name} al valor predeterminado",
    "simple": {
      "more": "Más: {n}",
      "normal": "Habitual: {n}",
      "steps": "Pasos de decodificación",
      "stepsHint": "Más pasos tardan más."
    }
  },
  "player": {
    "close": "Cerrar el reproductor",
    "label": "Reproductor",
    "next": "Tema siguiente",
    "prev": "Tema anterior (desde el principio, si el tema ya está avanzado)"
  },
  "presets": {
    "button": "Preajuste",
    "confirmDelete": "Haz clic otra vez para eliminar {name}",
    "deleteAsk": "¿Eliminar?",
    "deleteOne": "Eliminar el preajuste {name}",
    "none": "Aún no hay preajustes guardados.",
    "saveCurrent": "Guardar el formulario como preajuste",
    "title": "Preajustes: conjuntos guardados de ajustes del formulario"
  },
  "resources": {
    "ramOf": "RAM {used} de {total} GB",
    "state": {
      "error": "{model} informó de un error",
      "running": "{model} está en marcha",
      "starting": "{model} se está iniciando",
      "stopping": "{model} se está deteniendo"
    },
    "vramOf": "Memoria de vídeo {used} de {total} GB",
    "holder": {
      "cover": "Portadas (Z-Image Turbo)"
    }
  },
  "sa3Gen": {
    "badGuidanceWindow": "La guía se detiene con un nivel de ruido mayor que con el que empieza: baja «se detiene en» o sube «empieza en».",
    "formTabs": "Secciones del formulario",
    "kindLabel": "Tipo de audio",
    "lengthFromRef": "El tema de referencia fija la duración:",
    "lengthOwn": "propia: {v}",
    "lengthSeconds": "{n} s",
    "manual": {
      "apg": "Parte de APG",
      "autoTags": "Etiquetas de servicio",
      "cfg": "Cercanía a la descripción",
      "cfgStartsAt": "La guía empieza en el nivel de ruido",
      "cfgStopsAt": "La guía se detiene en el nivel de ruido",
      "chunked": "Decodificar por trozos",
      "chunkedAuto": "Auto",
      "duration": "Duración",
      "fromRef": "fijado por el tema de referencia",
      "guidanceSub": "cómo la descripción orienta el sonido; el nivel de ruido baja de 1 a 0 durante la ejecución",
      "guidanceTitle": "Guía",
      "needCfg": "cuando la cercanía a la descripción no es 1",
      "needTwo": "con dos variantes o más",
      "negative": "Qué evitar",
      "normThreshold": "Límite de un paso de guía",
      "off": "No",
      "on": "Sí",
      "padding": "Margen de duración",
      "perVariant": "Una descripción por variante",
      "resultSub": "la duración y la descripción",
      "resultTitle": "Resultado",
      "sampler": "Sampler",
      "samplerAuto": "predeterminado (pingpong)",
      "samplerAutoBase": "el predeterminado del modelo",
      "samplerLoud": "Más fuerte de lo normal y recortado: en una prueba el 1-2 % del sonido tocó el techo.",
      "samplerQuiet": "Unos 7 dB más bajo de lo normal.",
      "samplerSub": "cómo se calcula cada paso",
      "samplerTitle": "Sampler",
      "scalePhi": "Suavizar la guía",
      "textOnly": "solo sin un tema de referencia",
      "trim": "Recortar el silencio del inicio"
    },
    "modelsAfterStart": "La lista de modelos aparece cuando el motor está en marcha.",
    "queuedNote": "Tomas en la cola: {n}",
    "ref": {
      "modeLabel": "Qué hacer con la referencia",
      "off": "Actívalo para trabajar a partir de un tema terminado: rehacerlo, rehacer un rango o continuarlo."
    },
    "simple": {
      "tagsOff": "No añadir",
      "tagsOn": "Añadir"
    },
    "submitKind": {
      "music": "Crear música",
      "sfx": "Crear un sonido"
    },
    "tabChanged": "cambiado",
    "tabs": {
      "ref": "De un tema",
      "sound": "Descripción",
      "tuning": "Ajustes"
    },
    "advancedHint": "El dado junto a la seed la vuelve aleatoria de nuevo; un número repite ese sonido. Los modelos postentrenados están ajustados para 8 pasos y cercanía 1; Qué evitar y el grupo Guía solo funcionan cuando la cercanía a la descripción no es 1.",
    "advancedHintBase": "Un checkpoint base: empieza con 50 pasos y cercanía 7, así que Qué evitar funciona; prueba con «poor quality» ahí.",
    "help": {
      "tips": [
        "Música: género, instrumentos y cómo suena cada uno, ambiente y energía, tempo en BPM.",
        "Un sonido: qué lo produce, cómo ocurre y cuánto dura, dónde está el micrófono y cómo suena la sala.",
        "Las etiquetas ayudan: TrackType: Music, VocalType: Instrumental, Genre: Funk, Instruments: Guitar, Saxophone; TrackType: Instrument para una parte solista; TrackType: SFX para un sonido.",
        "Sin voz: el modelo hace instrumentales; un prompt con voz da, como mucho, texturas sin palabras.",
        "Escribe una seed para repetir un resultado; con el dado pulsado cada toma recibe una nueva."
      ]
    },
    "translateBtn": "Solo traducir",
    "translateHint": "Stable Audio solo entiende inglés: el asistente puede escribir un prompt en inglés a partir de tu texto o simplemente traducirlo.",
    "translateNoAssistant": "El asistente de prompts no está listo: descarga su modelo en Modelos.",
    "translateRunning": "Traduciendo…",
    "translateStopping": "Deteniendo…",
    "translateStop": "Detener",
    "translateDone": "Traducido al inglés.",
    "translateUndo": "Restaurar",
    "composeBtn": "Escribir el prompt",
    "composeTitle": "El asistente convierte la descripción, en cualquier idioma, en un prompt para Stable Audio: género, instrumentos, sonido, tempo y duración",
    "composeRunning": "Escribiendo el prompt…",
    "composeDone": "El prompt para Stable Audio está listo."
  },
  "tagInput": {
    "cleared": "Todas las etiquetas borradas",
    "removeTag": "Quitar {tag}",
    "removed": "{tag} quitada",
    "restored": "Etiquetas restauradas",
    "undo": "Deshacer",
    "undoTitle": "Recuperar las etiquetas borradas"
  },
  "yueGen": {
    "help": {
      "advanced": {
        "choices": [
          "Calidad (pestaña Canción): Borrador es el modelo q4_0, Normal q8_0, Final bf16 con 32 pasos de decodificación y cercanía al estilo 1.2.",
          "Duración (pestaña Canción): los minutos se convierten en No menos de y No más de; el modelo produce 25 tokens por segundo de sonido.",
          "Canto: Más estable es Atrevimiento 0.85, Más atrevido 1.1.",
          "Repeticiones: Menos es Penalización de repetición 1.3 con Memoria de repetición 80.",
          "Partitura: Más cuidadosa es un Atrevimiento de partitura de 0.55."
        ],
        "choicesIntro": "Fijan los mismos valores que los arreglos de abajo, con un clic.",
        "choicesTitle": "Las opciones de las pestañas",
        "title": "Ajustes",
        "lead": "Puedes dejarlos como están: lo que no cambies va con el valor predeterminado del motor, que se muestra en cada fila de Manual. Importan cuando un tema sale mal una y otra vez: cortado, en bucle, desafinado. Busca tu caso abajo y pulsa Aplicar: los números correctos se ponen solos en los campos.",
        "fixes": [
          {
            "id": "cutoff",
            "problem": "El tema se corta antes de que acabe la letra",
            "fix": "No más de: 12000 tokens, un techo de duración de unos 8 minutos en lugar de 6."
          },
          {
            "id": "offbrief",
            "problem": "El sonido no coincide con las etiquetas",
            "fix": "Cercanía al estilo: 1.2, para que el modelo siga la descripción con más rigor. Si eso no ayuda, el problema son las propias etiquetas."
          },
          {
            "id": "loop",
            "problem": "Una frase se repite una y otra vez",
            "fix": "Penalización de repetición 1.3 y Memoria de repetición 80: una penalización más fuerte por las repeticiones y una memoria más larga de ellas."
          },
          {
            "id": "offkey",
            "problem": "Notas desafinadas, quiebres en la voz, ruido",
            "fix": "Atrevimiento 0.85 y 32 pasos de decodificación: menos atrevimiento, más pasadas al dibujar el audio."
          },
          {
            "id": "melody",
            "problem": "La melodía es incoherente",
            "fix": "Si el plan está desactivado, pasa a Melodía y acordes (un plan que ya hayas elegido se queda), y Partitura pasa a Más cuidadosa (Atrevimiento de partitura 0.55), de modo que la partitura se escribe con más cautela. O toma una melodía de un tema en la pestaña Melodía: una partitura dada sustituye al plan, y entonces solo importa la elección del plan."
          },
          {
            "id": "same",
            "problem": "Todas las tomas suenan igual",
            "fix": "Activa la seed aleatoria. Si no basta, Atrevimiento 1.1."
          },
          {
            "id": "final",
            "problem": "Quiero el render final",
            "fix": "Calidad: Final, el modelo bf16 (si está descargado), 32 pasos y cercanía al estilo 1.2. Haz 2–3 tomas y quédate con la mejor."
          }
        ],
        "fieldsIntro": "Bajo cada campo hay una escala de valores típicos: la marca de arriba es el valor predeterminado para el audio, la de abajo el de la partitura (solo con un plan de melodía y sin partitura dada). Una partitura necesita rigor, el audio necesita vida, de ahí los distintos valores predeterminados.",
        "groups": [
          {
            "title": "Precisión y calidad",
            "fields": [
              {
                "key": "cfg_scale",
                "name": "Cercanía al estilo (CFG)",
                "text": "Con qué obediencia sigue el modelo las etiquetas de estilo. Como el volumen de tu voz en el oído de un músico: más bajo, tocan con más libertad; más alto, más fieles a lo pedido, pero más rígidos.",
                "left": "más libre",
                "right": "más fiel a las etiquetas",
                "when": "1.2 si el sonido apenas coincide con la descripción. Por encima de 1.5: artefactos y un sonido «de plástico»."
              },
              {
                "key": "num_inference_steps",
                "name": "Pasos de decodificación",
                "text": "Cuántas pasadas hace el modelo para convertir su plan en audio terminado. Como capas de pintura: 8 es un boceto rápido, 32 una capa final limpia.",
                "left": "más rápido",
                "right": "más limpio",
                "when": "8 para borradores, 32 para el final. La diferencia apenas se oye (unos 4 s por tema en una RTX 4080); más allá de 32 el sonido solo cambia, no mejora."
              }
            ]
          },
          {
            "title": "Carácter de la interpretación",
            "fields": [
              {
                "key": "temperature",
                "name": "Atrevimiento (temperature)",
                "text": "El atrevimiento del modelo (al menos 0.01: cero detiene el motor). Bajo: toca «al pie de la letra», parejo y predecible; alto: improvisa, a veces con brillantez, a veces desafinando.",
                "left": "más estable",
                "right": "más atrevido",
                "when": "Desafinado: 0.85. Todas las tomas iguales: 1.1. Una partitura rara: 0.5–0.6 para la partitura."
              },
              {
                "key": "repetition_penalty",
                "name": "Penalización de repetición",
                "text": "Una penalización por repetir lo que ya se tocó. Cuanto más alta, más evita el modelo el «disco rayado». Para la partitura es casi 1.0: las repeticiones son normales en la notación.",
                "left": "repeticiones permitidas",
                "right": "sin repeticiones",
                "when": "En bucle: 1.3. Por debajo de 1.1 hay riesgo de bucles monótonos."
              }
            ]
          },
          {
            "title": "Duración del tema",
            "fields": [
              {
                "key": "min_tokens",
                "name": "No menos de",
                "text": "El modelo no puede terminar antes de este punto. Unas 25 unidades por segundo: 200 ≈ 8 segundos de audio.",
                "left": "puede ser corto",
                "right": "no antes de",
                "when": "El tema acaba antes de haberlo cantado todo: súbelo."
              },
              {
                "key": "max_tokens",
                "name": "No más de",
                "text": "Techo de duración. 9000 ≈ 6 minutos de canción; el formulario admite hasta 15000. Más: más espera y más memoria de GPU.",
                "left": "más corto",
                "right": "más largo",
                "when": "Se corta a mitad de frase: 12000."
              }
            ]
          }
        ],
        "rareIntro": "Cambian lo mismo que Atrevimiento o Penalización de repetición, solo que con más finura. Normalmente se dejan como están.",
        "rare": [
          {
            "key": "top_p",
            "name": "Corte de elecciones raras (top-p)",
            "text": "Cuántas opciones «sensatas» considera el modelo en cada paso: 1, todas; 0.5, solo las más obvias."
          },
          {
            "key": "top_k",
            "name": "Candidatos (top-k)",
            "text": "Un tope duro al número de opciones en cada elección. Un segundo filtro junto al corte de elecciones raras."
          },
          {
            "key": "penalty_window",
            "name": "Memoria de repetición",
            "text": "Cuánto hacia atrás recuerda el modelo lo que tocó al calcular la penalización de repetición. 50 ≈ 2 segundos de audio. Súbela a 80 si hay bucles."
          }
        ]
      },
      "melody": {
        "lead": "YuE2 puede cantar la letra con una melodía que le des. La partitura ABC la contiene: notas escritas como texto. A partir de una partitura en el formato que escribe la app, la canción sale en la misma tonalidad, con las mismas notas cantadas y la misma duración: en nuestra prueba las notas coincidieron en un 93–99 %.",
        "roll": [
          "Escuchar reproduce la partitura en un piano. Un clic o un arrastre en el roll elige dónde empezar, ⏮ vuelve al principio.",
          "Las notas rosas son la voz (Vocal), las azules el acompañamiento (Ins). Los números de compás y los acordes van arriba.",
          "Ctrl + rueda del ratón hace zoom, ⤢ abre la ventana grande con tres octavas de teclas.",
          "Partitura muestra la misma partitura en pentagramas; un clic en una nota la reproduce."
        ],
        "rollTitle": "El roll y las notas",
        "sources": [
          "De un tema… — elige un archivo de audio y SheetSage2 escribe su melodía y sus acordes. Funciona mejor con un tema de voz clara.",
          "Importar MIDI — la parte más aguda pasa a ser la melodía, los otros canales el acompañamiento y los acordes, y la tonalidad se detecta sola. Mantén la melodía vocal en una pista propia.",
          "Piano — elige una duración y pulsa teclas (abajo, a la izquierda del roll, o en un teclado MIDI): las notas van una tras otra.",
          "De un tema creado: A MIDI en el menú de una toma, o la pestaña Stems y notas de la biblioteca, y luego A una partitura de YuE2. La voz pasa a ser la melodía, el bajo y el resto el acompañamiento."
        ],
        "sourcesTitle": "De dónde sale una melodía",
        "tips": [
          "Una nota por sílaba: una línea de 8 sílabas necesita unas 8 notas.",
          "La canción dura lo que duran las notas: 8 compases de 4/4 a 100 BPM son unos 20 segundos.",
          "Seguir una melodía: el modelo conserva tu melodía e inventa el acompañamiento; Melodía y acordes: construye ambos a partir de la partitura.",
          "Una tonalidad o un tempo en el estilo no hacen nada: vienen de las notas.",
          "Edita el texto ABC a mano solo si conoces el formato: el modelo lee mejor la disposición que escribe la app (voces Vocal e Ins)."
        ],
        "tipsTitle": "Para un resultado fiel",
        "title": "Melodía y partitura ABC"
      },
      "style": {
        "tips": [
          "Lo óptimo son 5–8 etiquetas: con más empiezan a chocar, con menos el resultado es menos predecible.",
          "Escribe las etiquetas en inglés, pero empieza por el idioma de la canción (Russian, English, Spanish…): los ejemplos del propio motor lo hacen todos, y los flujos de idea lo añaden por ti.",
          "Con un plan de melodía (Seguir una melodía o Melodía y acordes) el estilo sigue importando: define el timbre y el arreglo, mientras que la melodía sale de la partitura ABC."
        ]
      },
      "lyrics": {
        "tips": [
          "Con un plan de melodía, el ritmo de las líneas debe coincidir más o menos con la partitura ABC (sílabas por compás); si no, el modelo tiene que estirar o comprimir las palabras para que encajen en la melodía.",
          "Las líneas cortas encajan en la melodía de forma más predecible que las largas.",
          "Repite el estribillo palabra por palabra en cada [Chorus]: así mantiene la misma línea melódica en todo el tema."
        ]
      },
      "cot": {
        "title": "El plan de melodía",
        "intro": "El plan de melodía decide si el modelo escribe un plan musical antes del audio, y cómo usa la partitura ABC de la pestaña Melodía.",
        "melodyNote": "Da la melodía en la partitura ABC bajo el plan: De un tema… (SheetSage2), un archivo MIDI o el piano. Sin partitura, el modelo escribe su propio plan solo de melodía.",
        "precisionNote": "La precisión del modelo (q8_0, q4_0, bf16) no tiene que ver con el plan: la fija Calidad en la pestaña Canción. q4_0 ahorra memoria de vídeo a costa de un poco de calidad, sea cual sea el plan.",
        "abcFooter": "Lo más fácil no es escribir ABC desde cero, sino tomarlo de un tema con De un tema… (SheetSage2) y retocar a mano los compases que necesites."
      }
    },
    "length": {
      "auto": "Auto",
      "autoHint": "Lo que dure la letra, hasta unos 6 minutos.",
      "hint": "Unos {n} min: una letra más corta se canta y se toca hasta esa duración, una más larga se corta ahí.",
      "label": "Duración",
      "minutes": "{n} min",
      "ownHint": "Fijada a mano en Ajustes (Mín. / Máx. de tokens)."
    },
    "lines": "Líneas: {n}",
    "linesAbout": "Líneas: {n}, unos {time}",
    "linesAboutHint": "Una estimación según tus canciones anteriores: unos {s} s por línea. Para la duración Auto.",
    "manual": {
      "abcGiven": "la partitura de la pestaña Melodía",
      "changed": "{n} de {total} cambiados",
      "console": "Consola: todos los grupos a la vez",
      "consoleTitle": "Consola de YuE2",
      "done": "Hecho",
      "groups": {
        "character": {
          "sub": "la voz y la música",
          "title": "Carácter"
        },
        "length": {
          "sub": "25 tokens por segundo",
          "title": "Duración"
        },
        "repeats": {
          "sub": "contra los bucles",
          "title": "Repeticiones"
        },
        "score": {
          "sub": "cómo escribe el modelo el plan de la melodía",
          "title": "Partitura"
        },
        "sound": {
          "sub": "el modelo y la decodificación",
          "title": "Sonido"
        }
      },
      "manual": "Manual",
      "params": {
        "cfg": "Cercanía al estilo",
        "max_tokens": "No más de",
        "min_tokens": "No menos de",
        "penalty_window": "Memoria de repetición",
        "precision": "Precisión del modelo",
        "repetition_penalty": "Penalización de repetición",
        "steps": "Pasos de decodificación",
        "temperature": "Atrevimiento",
        "top_k": "Candidatos",
        "top_p": "Corte de elecciones raras"
      },
      "reset": "Restablecer",
      "resetAll": "Restablecer todo",
      "seconds": "{n} s",
      "seedRandom": "aleatoria",
      "sends": "Va al motor",
      "sendsRest": "Los valores fijados a mano están marcados. Lo que no está en la línea se deja al valor predeterminado del motor.",
      "simple": "Simple"
    },
    "perf": {
      "manualNow": "(fijado a mano ahora)",
      "repeats": {
        "hint": "Menos, cuando una frase da vueltas y vueltas.",
        "label": "Repeticiones",
        "options": {
          "fewer": "Menos",
          "normal": "Normal"
        }
      },
      "score": {
        "hint": "Más cuidadosa, cuando la melodía divaga: el modelo escribe la partitura con más cautela.",
        "label": "Partitura",
        "options": {
          "careful": "Más cuidadosa",
          "normal": "Normal"
        }
      },
      "temperature": {
        "hint": "Más estable: menos notas falsas y quiebres en la voz. Más atrevido: las tomas se diferencian más entre sí.",
        "label": "Canto",
        "options": {
          "normal": "Normal",
          "steady": "Más estable",
          "varied": "Más atrevido"
        }
      }
    },
    "planLabel": "Plan de melodía",
    "planNames": {
      "full": "Melodía y acordes",
      "melody": "Seguir una melodía",
      "off": "Sin plan"
    },
    "qualityHints": {
      "draft": "El modelo {model} usa menos memoria de vídeo y suena algo más simple: para probar ideas.",
      "final": "El modelo {model}, 32 pasos de decodificación y más cercano a las etiquetas de estilo (CFG 1.2): para un tema terminado. Haz 2–3 tomas y quédate con la mejor. bf16 necesita más memoria de vídeo que q8_0 (su archivo pesa 7.3 GB frente a 4.3 GB).",
      "normal": "El modelo {model} con los ajustes habituales: buen sonido sin esperar.",
      "own": "Precisión, pasos y CFG a mano."
    },
    "qualityLabel": "Calidad",
    "qualityNames": {
      "draft": "Borrador",
      "final": "Final",
      "normal": "Normal",
      "own": "Propia"
    },
    "queued": "En la cola, tomas: {n}",
    "scoreGivenNote": "La partitura dada sustituye al plan, así que el muestreo de la partitura no hace nada y no se envía.",
    "sections": {
      "bridge": "+ Puente",
      "chorus": "+ Estribillo",
      "outro": "+ Final",
      "verse": "+ Estrofa"
    },
    "tabs": {
      "changed": "Cambiado respecto a lo habitual",
      "melody": "Melodía",
      "song": "Canción",
      "tuning": "Ajustes"
    },
    "takes": "Tomas",
    "tuningTitle": "Ajustes de rendimiento"
  },
  "acePage": {
    "openTrainingPage": "Abrir el entrenamiento de LoRA"
  },
  "library": {
    "noTracks": "La biblioteca aún no tiene temas. Sube un archivo arriba o crea un tema en Crear."
  },
  "notInstalled": {
    "stableAudio": {
      "text": "Stable Audio 3 crea instrumentales y efectos de sonido, y mueve el repintado, la continuación y el cover del editor. Se omitió en la instalación. Una vez instalado, descarga un modelo en Modelos y ajustes o directamente en el formulario de Stable Audio."
    }
  },
  "idea": {
    "guide": {
      "lead": "Una frase de entrada, un tema de salida, en la página de inicio. Describes una canción, un instrumental o un sonido con tus palabras, un modelo de lenguaje local escribe el prompt en el formato del motor elegido, lo editas si quieres y el motor crea el tema.",
      "steps": [
        {
          "title": "Describe la idea",
          "text": "Una o dos frases: de qué trata la canción, el ambiente, quién canta, dónde y cuándo. Para un instrumental: el género, los instrumentos y el ambiente."
        },
        {
          "title": "Elige el tipo y el motor",
          "text": "Canción con voz, instrumental o sonido, y luego ACE-Step, YuE2 o Stable Audio 3. No se puede elegir un motor que no hace ese tipo; un sonido siempre es de Stable Audio."
        },
        {
          "title": "Componer",
          "text": "Pulsa Componer: el asistente escribe el prompt justo debajo de la frase y muestra la etapa, el porcentaje y el texto a medida que crece. Puedes detenerlo. Un sonido se salta este paso: Componer abre el formulario de Stable Audio con la frase."
        },
        {
          "title": "Edita el prompt",
          "text": "Las etiquetas, la letra, el tempo, la tonalidad y la duración se pueden cambiar directamente en los campos."
        },
        {
          "title": "Generar",
          "text": "Generar pone las variantes en la cola del motor, que lo inicia cuando les toca, y abre Crear: las variantes aparecen en la lista de la sesión, con el nombre de la idea."
        }
      ],
      "writer": [
        "El asistente de prompts es un modelo de lenguaje local, Qwen3.5. Se ciñe a la idea y escribe la letra en el idioma de la idea o en el que elijas. Su modelo se descarga en la página Modelos.",
        "Con ACE-Step, el propio modelo de lenguaje de ACE-Step también puede escribir el prompt mientras el motor está en marcha. Es más rápido, normalmente 5–20 s, pero se desvía más de la idea.",
        "El idioma de la letra se toma de las letras de la idea por defecto; puedes elegirlo en Más, igual que quién escribe el prompt. En la página Crear está en los Ajustes de la línea de la idea."
      ],
      "after": [
        "Otra variante escribe el prompt de nuevo a partir de la misma idea.",
        "Abrir en el formulario pasa el prompt al formulario del motor en la página Crear, con todos sus ajustes.",
        "La idea y el prompt se conservan si sales de la página o la recargas. Tras Generar se borran para la siguiente idea; Restablecer los borra a mano.",
        "En la página Crear la misma idea está en la línea de la idea sobre el formulario: Escribir pone la letra y el estilo directamente en el formulario (Describir, en Stable Audio), y Volver a lo anterior restaura el formulario."
      ],
      "tips": [
        "Lo concreto vence a lo general: \"un tren nocturno que sale de un pueblo pequeño\" da más que \"una canción triste\".",
        "¿Quieres un género, una voz o unos instrumentos concretos? Nómbralos en la idea.",
        "Lee la letra antes de generar: un modelo pequeño no siempre acierta con la rima y la métrica.",
        "¿No es el sonido que querías? Prueba otro motor con la misma idea: el prompt se reescribe en su formato.",
        "La lluvia, un golpe, unos pasos son sonidos, no música: elige Sonido y la frase va directa al formulario de Stable Audio. Con Instrumental y Stable Audio 3 el asistente deduce solo que quieres un sonido; ACE-Step crea un tema a partir de una idea así."
      ]
    }
  },
  "sa3Weights": {
    "allOnModels": "Todos los modelos, los checkpoints base y los ajustes están en la página Modelos"
  },
  "autoTitle": {
    "accept": "Usarlo",
    "another": "Otro",
    "bulk": "Sugerir títulos",
    "bulkDone": "{n} pista nombrada | {n} pistas nombradas",
    "bulkFailed": "{n} nombradas, y luego se detuvo: {error} | {n} nombradas, y luego se detuvo: {error}",
    "bulkHint": "El asistente pone nombre a cada pista seleccionada, una tras otra; «Deshacer» devuelve los títulos anteriores.",
    "bulkStopped": "Detenido: {n} de {total} nombradas",
    "bulkUndone": "Título anterior restaurado | Títulos anteriores restaurados: {n}",
    "cancel": "Cancelar",
    "failed": "No se pudo pensar un título: {error}",
    "noAssistant": "El asistente de prompts no está listo: descarga su modelo en Modelos.",
    "progress": "Nombrando {done} de {total}",
    "stop": "Detener",
    "suggest": "Sugerir un título",
    "working": "Pensando un título…"
  },
  "covers": {
    "alt": "Portada de {title}",
    "another": "Otra portada",
    "bulk": "Crear portadas",
    "bulkDone": "{n} portada creada | {n} portadas creadas",
    "bulkFailed": "{n} no salieron bien",
    "bulkHint": "Una portada para cada pista seleccionada, una tras otra; una pista que ya tiene una recibe una nueva.",
    "bulkProgress": "Portadas: {done} de {total}",
    "cancel": "Cancelar",
    "describe": "Qué muestra la imagen",
    "describeHint": "Una escena en pocas palabras; el inglés funciona mejor. El texto en la imagen se evita solo.",
    "dismiss": "Descartar",
    "edit": "Editar la descripción…",
    "enable": "Crear portadas de álbum para las pistas",
    "enableHint": "Añade una imagen a cada canción de la biblioteca, el reproductor y la sesión. Desactivado: sin portadas y sin botones de portada en ningún sitio.",
    "engine": "Portadas (Z-Image Turbo)",
    "failed": "La portada no salió bien: {error}",
    "fromAssistant": "De la idea del asistente para esta pista.",
    "installed": "instalado",
    "loadingPrompt": "Leyendo la descripción…",
    "make": "Crear una portada",
    "making": "Creando la portada…",
    "makingPct": "Creando la portada… {pct} %",
    "model": "Modelo: Z-Image Turbo, {gb} GB",
    "notInstalled": "no instalado",
    "notInstalledHint": "El modelo de portadas no está en este equipo. Instálalo con el instalador (la parte Portadas) o con el script de instalación.",
    "onButton": "Una portada se crea solo cuando pulsas un botón: en los detalles de una pista de la biblioteca o para las pistas seleccionadas. Cada una tarda de 5 a 10 segundos; durante ese tiempo la GPU cambia al modelo de portadas, y la siguiente canción vuelve a cargar su motor.",
    "parts": {
      "main": "Pesos de Z-Image Turbo",
      "server": "Servidor de imágenes (stable-diffusion.cpp)"
    },
    "queued": "En espera en la cola…",
    "remove": "Quitar la portada",
    "removeConfirm": "Sí, quitar",
    "stop": "Detener",
    "title": "Portadas",
    "draw": "Dibujar",
    "withAssistant": "Hacerlo con el asistente",
    "withAssistantHint": "El asistente de prompts escribe una descripción a partir de tu texto (en cualquier idioma) o, con el campo vacío, de la canción; puedes editarla antes de dibujar.",
    "putBack": "Restaurar",
    "anyLanguageHint": "Escribe en cualquier idioma: el asistente lo convierte en una descripción que el modelo de imágenes entiende.",
    "fromSaved": "La descripción con la que se dibujó la última portada.",
    "noAssistant": "El asistente de prompts no está listo: descarga su modelo en Modelos.",
    "describing": "Describiendo la imagen…",
    "describingPct": "Describiendo la imagen… {pct}%",
    "describeFailed": "El asistente no pudo describir la imagen: {error}",
    "bulkDescribing": "Describiendo {done} de {total}",
    "starting": "Iniciando el modelo de imágenes…"
  },
  "takeCompare": {
    "best": "★ Mejor",
    "failed": "No se pudo cargar",
    "keep": "Conservar la mejor, mover las demás a la papelera",
    "keepConfirm": "¿Mover {n} toma a la papelera? | ¿Mover {n} tomas a la papelera?",
    "keepNeedStar": "Marca con una estrella la mejor toma para conservarla.",
    "keepTooMany": "Marca con estrella solo una toma: la que se conserva.",
    "keepWill": "Conserva {take}; la otra va a la papelera. | Conserva {take}; las otras {n} van a la papelera.",
    "kept": "Conservada {take}; {n} toma movida a la papelera. | Conservada {take}; {n} tomas movidas a la papelera.",
    "keys": "1–4 elegir toma · Espacio reproducir/pausa · ←/→ 5 s · Esc cerrar",
    "loading": "Cargando…",
    "loadingAll": "cargando las tomas…",
    "newestOf": "Las {shown} más recientes de {total} tomas",
    "nowHearing": "Sonando: {take}",
    "open": "Comparar",
    "openTitle": "Comparar las tomas de esta canción, A/B",
    "position": "{at} de {total}",
    "restored": "{n} toma restaurada | {n} tomas restauradas",
    "seed": "semilla {seed}",
    "seek": "Posición",
    "takes": "Tomas",
    "tileLabel": "{letter}, toma {n}",
    "title": "Comparar tomas"
  }
}
