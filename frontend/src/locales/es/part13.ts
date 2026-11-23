// Notes workspace and help, and the strings added or reworded after part12 (machine-translated from en); merged last, key by key.
export default {
  "aceGen": {
    "closeness": "Cuánto se acerca al original",
    "closenessHigh": "Más libre",
    "closenessHint": "A la izquierda el resultado conserva la melodía y el arreglo de la fuente; a la derecha el modelo cambia más.",
    "closenessLow": "Más cerca del original",
    "loraSimple": "LoRA",
    "loraTrain": "Entrenar la tuya",
    "modelDefault": "{name} (por defecto)",
    "refChoose": "Elegir un archivo",
    "refDrop": "Suelta aquí el audio o elígelo de la biblioteca",
    "refFromLibrary": "De la biblioteca",
    "refLoading": "Cargando el tema…",
    "refNeeded": "Elige aquí un tema, o vuelve a la pestaña Canción para una canción nueva.",
    "refOff": "Toma un tema terminado: un cover, un rango rehecho, una parte quitada o añadida. Sin un tema el formulario crea una canción nueva.",
    "refRemove": "Quitar"
  },
  "aiPart": {
    "guide": {
      "hears": [
        "Los tracks marcados se mezclan en un solo track estéreo: con los volúmenes de los tracks, los fundidos y el ajuste de tempo (W), pero sin efectos y sin tener en cuenta los botones M y S.",
        "El tempo sale del campo BPM del proyecto, no de los clips: ajústalo al material. La tonalidad sale de «Tonalidad»; en «Auto» el modelo la encuentra por sí mismo.",
        "ACE-Step solo conoce mayor y menor. Para cualquier otra escala el modelo recibe la tonalidad más cercana y el nombre de la escala en la descripción: una pista, no una garantía.",
        "Los tracks con variantes que aún esperan una elección no se ofrecen: son borradores.",
        "El modelo no acepta un rango de más de 10 minutos: selecciona un fragmento más corto."
      ],
      "limits": [
        "«Añadir una parte» funciona solo con el modelo base de ACE-Step (unos 4,8 GB). En la app de escritorio es una opción de la instalación; si se omitió, el arreglista muestra un botón Instalar. Con los scripts, setup_models imprime el comando al final.",
        "base es más lento que turbo: en una RTX 4080 una variante para un tema de 2-3 minutos tarda unos 10 segundos, y la primera ejecución tarda más mientras se carga el modelo.",
        "El modelo respeta mejor la tonalidad y los acordes de lo que oye que las ideas rítmicas: «toca en los huecos de la voz» puede no salir.",
        "La calidad del sonido es la que da el modelo. No existe MIDI a audio: el modelo trabaja solo con audio.",
        "Si xl-base está instalado, aparece en la lista de modelos; en una tarjeta de 16 GB ocupa casi toda la memoria de vídeo. Para añadir partes usa base: en las mediciones xl-base devolvió ruido en cerca de una variante de cada cinco, base en una de cada veinticinco.",
        "Descartar el ruido cuesta tiempo: cuando se descarta una variante se envía la petición otra vez y la generación tarda más. La batería, la percusión y los efectos no se comprueban: por naturaleza son parecidos al ruido."
      ],
      "variants": [
        {
          "term": "Escuchar",
          "text": "cambia a esta variante, silencia las demás y reproduce desde el inicio del rango."
        },
        {
          "term": "Conservar",
          "text": "conserva la variante y quita las demás. En un repintado, una continuación o un cover, la variante conservada sustituye al original en el rango."
        },
        {
          "term": "Quitar todas",
          "text": "quita todas las variantes y deja los tracks como estaban."
        },
        {
          "term": "Copia del contexto",
          "text": "marca una variante en la que el modelo devolvió casi la mezcla que oyó en lugar de una parte nueva. Genera de nuevo."
        },
        {
          "term": "Ruido",
          "text": "marca una variante en la que el modelo devolvió siseo en lugar de una parte. El arreglista descarta esas variantes por sí mismo y pide reemplazos, hasta dos veces; la marca queda solo en lo que volvió tras los reintentos."
        },
        {
          "term": "Ctrl+Z",
          "text": "deshace tanto la inserción de las variantes como la elección. Los archivos de las variantes descartadas salen de la biblioteca solo cuando se guarda el proyecto, y solo si ningún clip los usa."
        }
      ]
    }
  },
  "covers": {
    "after": {
      "hintSa": "Después de generar: una portada para todas las tomas. Ocupa la GPU otros ~30 s."
    },
    "studio": {
      "errChanged": "Mientras tanto se volvió a crear la portada. Guarda otra vez.",
      "errLoad": "No se pudo cargar la imagen de la portada. Inténtalo de nuevo.",
      "errNoCover": "Este tema no tiene portada donde poner el texto.",
      "errSave": "No se pudo guardar el texto. Inténtalo de nuevo."
    }
  },
  "create": {
    "failed": "No salió bien. Pulsa Repetir con estos ajustes y luego Crear otra vez.",
    "madeAt": "a las {time}",
    "menu": {
      "midi": "Notas a MIDI"
    },
    "notes": {
      "cardTitle": "Notas",
      "draw": "Dibujar",
      "drawNote": "«Dibujar» abre Notas a la derecha con un esqueleto a partir de la letra: secciones según las etiquetas [Verse], [Chorus], un acorde provisional por compás.",
      "emptyLead": "Sin notas YuE2 escribe la melodía por su cuenta. Con notas canta la tuya.",
      "emptyTitle": "Aún no hay notas",
      "fromSong": "De una canción",
      "fromSongDots": "De una canción…",
      "hasScore": "el formulario tiene una partitura",
      "importMidi": "Importar MIDI",
      "open": "Abrir notas",
      "openHere": "Las notas están abiertas a la derecha.",
      "openNote": "Los cambios en las notas van directamente al formulario: pulsa «{button}» y YuE2 las toma.",
      "openSection": "Abrir esta sección en Notas",
      "openTakeTip": "La partitura de esta toma en el espacio Notas: escucha, compara, edita y luego llévala al formulario si quieres",
      "rail": "Notas",
      "railTip": "Notas de YuE2: el editor de partituras a la derecha, en lugar de la Sesión",
      "remarks": "{n} observación de la revisión: {list} | {n} observaciones de la revisión: {list}",
      "takeTitle": "{title} · Toma {n}"
    },
    "rail": {
      "ace_step": "ACE",
      "generate": "Crear",
      "lora": "LoRA",
      "models": "Modelos",
      "stable_audio": "Sonido",
      "yue2": "YuE2"
    },
    "reuse": "Repetir con estos ajustes",
    "reuseInForm": "Repetir con estos ajustes"
  },
  "editor": {
    "clipInTrash": "Track en la papelera",
    "clipInTrashHint": "El track de este clip está en la papelera de la biblioteca: aún suena, pero la papelera lo elimina definitivamente a los 30 días.",
    "guide": {
      "clip": [
        "Arrastrar mueve un clip, los bordes lo recortan. La forma de onda no se comprime al recortar: ves exactamente el audio que queda. El archivo original nunca cambia.",
        "Los botones de un clip están sobre la forma de onda y aparecen al pasar el cursor o cuando el clip está seleccionado; los activados siempre se ven. M silencia el clip, S deja oír solo ese, W lo ajusta al tempo del proyecto, la cruz lo elimina.",
        "Los tiradores de los bordes fijan los fundidos. Sin ellos cada borde recibe un microfundido de 15 ms para que un corte no haga clic.",
        "Herramientas en el transporte: Seleccionar (V) mueve y recorta clips, el Cuchillo (C) corta un clip donde haces clic, el Borrador (E) quita el trozo sobre el que arrastras, o el clip entero con un clic. El Cuchillo y el Borrador se ajustan a la cuadrícula y a los bordes de los clips; Esc vuelve a Seleccionar.",
        "S corta el clip seleccionado en el cursor de reproducción, o todos los clips bajo el cursor cuando no hay nada seleccionado. Ctrl+D pone una copia justo después del clip.",
        "Los clips son translúcidos: la cuadrícula de la línea de tiempo se ve a través de ellos."
      ],
      "lane": [
        "Cambia el nombre de un track directamente en su cabecera. M lo silencia, S deja oír solo ese.",
        "Color: selecciona el track y haz clic en un punto sobre la lista de tracks.",
        "Un track que reproduce una canción entera se puede dividir en stems con el botón junto a M y S: voz, batería, bajo y otros lo sustituyen.",
        "La cruz quita el track; Ctrl+Z lo devuelve.",
        "La altura de los tracks se ajusta con el control deslizante de flechas en el transporte o con Alt y la rueda del ratón: cuanto más alto el track, mayor la forma de onda. Una misma altura para todos los tracks."
      ],
      "steps": [
        {
          "title": "Añadir tracks",
          "text": "El botón «Track» abre la biblioteca: añade un tema entero o como stems. Un archivo de tu ordenador se puede soltar directamente sobre un track."
        },
        {
          "title": "Ordenar los clips",
          "text": "Arrastra los clips y recórtalos por los bordes. El Cuchillo (C) corta un clip donde haces clic, el Borrador (E) quita el trozo sobre el que arrastras. Los fundidos se tiran de los tiradores en los bordes del clip."
        },
        {
          "title": "Ajustar el tempo",
          "text": "El campo BPM fija el tempo del proyecto, el botón W de un clip lo ajusta a ese tempo. «Imán» activa el ajuste a la cuadrícula, y el interruptor «0:00 | 1 | 2» elige qué cuentan la regla y la cuadrícula: segundos o compases."
        },
        {
          "title": "Mezclar",
          "text": "Volumen y panorama del track, ocho efectos en cada track y en el máster. El botón «Mezclador» muestra el mezclador."
        },
        {
          "title": "Guardar",
          "text": "No hay guardado automático: «Guardar» o Ctrl+S. Si sales de la página con cambios sin guardar, el editor te avisa."
        },
        {
          "title": "Exportar",
          "text": "WAV o MP3 a la biblioteca, o stems con un proyecto de Reaper o DAWproject para terminar en tu propio DAW."
        }
      ],
      "tempo": [
        "El tempo de un clip se detecta al añadirlo, a partir de sus primeros 30 segundos. El detector es sencillo y puede fallar con material complejo.",
        "W estira el clip al BPM del proyecto sin cambiar su tono.",
        "Los clips se pegan a los bordes de otros clips y al inicio de la línea de tiempo. «Imán» añade el ajuste a la cuadrícula. El interruptor «0:00 | 1 | 2» elige qué cuentan la cuadrícula y la regla: segundos, o compases y tiempos del BPM del proyecto (4/4). El paso de la cuadrícula sigue el zoom; las líneas en las marcas de la regla son más brillantes.",
        "«Bucle» repite la región de la regla: muévela entera o arrastra sus bordes. La misma región es la selección para el arreglista de IA. Haz clic en la regla para saltar a ese punto."
      ]
    },
    "help": {
      "title": "Ayuda del editor"
    },
    "hotkeys": {
      "keys": [
        {
          "keys": "Space",
          "action": "Reproducir y pausar"
        },
        {
          "keys": "S",
          "action": "Cortar un clip en el cursor de reproducción"
        },
        {
          "keys": "V / C / E",
          "action": "Herramienta: seleccionar, cuchillo, borrador"
        },
        {
          "keys": "Del",
          "action": "Eliminar el clip seleccionado"
        },
        {
          "keys": "Ctrl+D",
          "action": "Duplicar el clip seleccionado"
        },
        {
          "keys": "Ctrl+Z",
          "action": "Deshacer, hasta 30 pasos"
        },
        {
          "keys": "Ctrl+Y / Ctrl+Shift+Z",
          "action": "Rehacer"
        },
        {
          "keys": "Ctrl+S",
          "action": "Guardar el proyecto"
        },
        {
          "keys": "Esc",
          "action": "Quitar la selección y volver a la herramienta Seleccionar"
        },
        {
          "keys": "← →",
          "action": "El cursor de reproducción un paso de la cuadrícula, cuatro con Shift"
        },
        {
          "keys": "Home / End",
          "action": "Al inicio o al final"
        },
        {
          "keys": "+ / −",
          "action": "Zoom"
        },
        {
          "keys": "Tab",
          "action": "Siguiente clip, track o tirador"
        }
      ],
      "mouse": [
        {
          "keys": "Ctrl+rueda",
          "action": "Zoom"
        },
        {
          "keys": "Alt+rueda",
          "action": "Altura de los tracks"
        },
        {
          "keys": "Clic con el cuchillo",
          "action": "Cortar el clip en ese punto"
        },
        {
          "keys": "Arrastrar con el borrador",
          "action": "Quitar ese trozo del clip; un clic quita el clip entero"
        },
        {
          "keys": "Shift+arrastrar",
          "action": "Desplazar la línea de tiempo; el botón central también funciona"
        },
        {
          "keys": "Clic en la regla",
          "action": "Saltar a ese punto"
        },
        {
          "keys": "Archivo sobre un track",
          "action": "Añadir un clip de tu ordenador en ese punto"
        }
      ]
    },
    "restoreFromTrash": "Restaurar de la papelera",
    "trashedSources": "Un clip reproduce un track de la papelera: {names}. La papelera lo elimina definitivamente a los 30 días. | {n} clips reproducen tracks de la papelera: {names}. La papelera los elimina definitivamente a los 30 días."
  },
  "footer": {
    "muscriptorNote": "Convierte un tema o un stem en MIDI. Los pesos son solo para uso no comercial; consulta la ficha del modelo.",
    "qwenNote": "El asistente de prompts: escribe el prompt a partir de una idea, títulos y descripciones de portadas.",
    "sa3Note": "Instrumentales y efectos de sonido. Gratis para uso personal y comercial por debajo de 1 M USD de ingresos anuales; por encima hace falta una licencia empresarial.",
    "sdcppNote": "Ejecuta el modelo de portadas.",
    "sheetsageNote": "Escribe la melodía de un tema como partitura (Notas, «De una canción…»). Los pesos son solo para uso no comercial; consulta la ficha del modelo.",
    "zimageNote": "Dibuja las portadas. Su codificador de texto Qwen3-4B-Instruct también es Apache-2.0."
  },
  "header": {
    "guide": {
      "map": {
        "ace": "Canciones rápidas e instrumentales a partir de una descripción, etiquetas y letra; con un tema de referencia también un cover, una sección repintada, una parte añadida o extraída, una continuación.",
        "sa3": "Instrumentales y efectos de sonido a partir de una descripción, con rapidez. En el arreglista de IA del editor repinta, continúa y hace covers escuchando el audio alrededor del rango.",
        "yue": "Escribe una canción entera con voz y puede construirla en torno a una melodía dada (la pestaña Melodía y el espacio Notas, con SheetSage2). También convierte un tema en MIDI."
      },
      "steps": [
        {
          "title": "Elige un motor",
          "text": "Ve a Crear: los motores están a la izquierda, YuE2, ACE-Step y Stable Audio. Para una primera canción con voz toma YuE2. Arranca con la primera pulsación de Crear; el primer arranque tarda unos minutos."
        },
        {
          "title": "Describe la canción",
          "text": "En la pestaña Canción escribe la letra y el estilo, o escribe la idea en una frase en la línea sobre el formulario y el asistente rellena los campos. Elige la duración y cuántas tomas."
        },
        {
          "title": "Elige la mejor toma",
          "text": "Las tomas se alinean en la lista de la sesión junto al formulario (debajo en un móvil). Todo lo creado se guarda en la biblioteca automáticamente."
        },
        {
          "title": "Divide en stems",
          "text": "Voz, batería, bajo y otros con un clic: Dividir en stems en el menú de una toma, la pestaña Stems y notas de la biblioteca, o directamente en el editor."
        },
        {
          "title": "Constrúyela en el editor",
          "text": "Coloca los stems en pistas, añade partes con el arreglista de IA, ajusta los efectos."
        },
        {
          "title": "Exporta",
          "text": "Mezcla a WAV o MP3, o exporta las pistas con un proyecto de Reaper o DAWproject."
        }
      ],
      "tips": [
        "¿No sabes cómo describir un estilo? Empieza por la página de inicio: describe la música en una frase, el asistente escribe el prompt y tú lo editas.",
        "¿Casi, pero no del todo? Repintar una sección suele ser más rápido que generar de nuevo.",
        "El tema de referencia para un cover o una parte nueva puede venir directamente de la biblioteca.",
        "Cada sección tiene su propio botón de ayuda; el editor tiene además una hoja de atajos aparte.",
        "El editor no guarda automáticamente: pulsa Guardar antes de salir de la página; si lo olvidas, el editor te lo pregunta."
      ]
    },
    "helpSections": {
      "covers": {
        "text": "Una portada se dibuja en este ordenador con el modelo Z-Image Turbo. Marca Crear una portada bajo el formulario y una portada para todas las tomas llega después de la canción; o créala más tarde con el botón de la tarjeta de un tema en la biblioteca, también para varios temas seleccionados a la vez. Diseñar la portada cambia la descripción de la imagen y añade un texto con el título. El modelo de portadas se instala aparte: consulta Modelos y ajustes.",
        "title": "Portadas"
      },
      "downloads": {
        "text": "Un tema se descarga como MP3 (320 kbit/s, con la portada y las etiquetas, suena en cualquier sitio), FLAC (sin pérdida, con la portada y las etiquetas) o WAV (la fuente para un DAW, sin portada). Elige el formato en el menú Descargar de una toma o de un tema, se recuerda; también se puede fijar en Modelos y ajustes, General. El nombre del artista va a las etiquetas.",
        "title": "Formatos de descarga"
      },
      "engines": {
        "text": "Tres motores generan audio, YuE2-3B, ACE-Step 1.5 y Stable Audio 3, y no caben juntos en una GPU, así que funciona uno a la vez. Elige un motor en la página Crear: arranca al pulsar Crear, y el que estaba en marcha se detiene solo. El indicador muestra su estado; el primer arranque puede tardar unos minutos mientras el modelo se carga en la memoria de vídeo. El botón de estado de la cabecera muestra qué ocupa la GPU y puede descargarlo."
      },
      "library": {
        "text": "Cada tema, sea generado, subido o exportado desde el editor, va a una biblioteca compartida que puede usar cualquier módulo, así que un tema creado por cualquier motor se puede dividir en stems, transcribir y mezclar sin salir de la app."
      },
      "notes": {
        "more": "Más sobre las notas",
        "text": "Notas es el espacio de trabajo de YuE2: el botón Notas bajo YuE2 en la barra de Crear. Muestra y edita la melodía de la canción como partitura; la partitura puede venir de un tema terminado (De una canción…, SheetSage2) o de un archivo MIDI y va al formulario de YuE2, en la pestaña Melodía.",
        "title": "Notas"
      },
      "trash": {
        "text": "Los temas eliminados van a la papelera de la biblioteca y se quedan allí 30 días: restáuralos desde ahí o elimínalos definitivamente. Selecciona varios temas para moverlos a la papelera a la vez, ponerles etiquetas, crear portadas o nombrarlos. La biblioteca filtra por etiquetas.",
        "title": "Papelera y etiquetas"
      }
    }
  },
  "home": {
    "allTracks": "Abrir la biblioteca"
  },
  "idea": {
    "languageAutoIdea": "Auto (según la idea)",
    "writer": "Quién escribe la letra y el estilo:",
    "writerAce": "El propio ACE-Step"
  },
  "libraryPage": {
    "filters": {
      "midi": "MIDI",
      "score": "Notas"
    },
    "filtersToggle": "Filtros",
    "openEditor": "Abrir en el editor",
    "openEditorFailed": "No se pudo abrir en el editor: {error}",
    "openEditorHint": "Un proyecto nuevo del editor con este tema en una pista",
    "promptTitle": "El tema no tiene nombre propio: se muestra una línea de su letra.",
    "score": {
      "download": "Descargar .abc",
      "failed": "No se pudieron cargar las notas: {error}",
      "hint": "La partitura ABC con la que YuE2 cantó este tema",
      "open": "Abrir en Notas",
      "openHint": "Una copia de la partitura en Notas, en la página Crear; las notas del formulario se quedan como están",
      "title": "Notas"
    },
    "trash": {
      "loading": "Cargando…"
    },
    "usage": {
      "bulk": "{n} temas se usan en proyectos del editor: {names}. En la papelera seguirán sonando, pero si vacías la papelera sus clips desaparecen de los proyectos. ¿Eliminar?",
      "more": " (y {n} más)",
      "purge": "¿Eliminar definitivamente? Se usa en proyectos del editor: {names}. Sus clips desaparecerán de los proyectos.",
      "single": "El tema se usa en el proyecto del editor «{name}»{more}. En la papelera seguirá sonando, pero si vacías la papelera el clip desaparece del proyecto. ¿Eliminar?"
    },
    "yueLicence": "YuE2: licencia no comercial (CC BY-NC 4.0)",
    "yueLicenceHint": "Las canciones de YuE2 no se pueden vender ni usar comercialmente. Detalles: Modelos y licencias."
  },
  "midiPanel": {
    "recognize": "Notas a MIDI"
  },
  "models": {
    "general": {
      "artist": "Nombre del artista",
      "artistHint": "Se escribe en las etiquetas de los temas descargados. El mismo nombre que en el pie de página.",
      "artistSave": "Guardar",
      "artistSaved": "Guardado",
      "autoCover": "Crear una portada después de la canción",
      "autoCoverHint": "El valor inicial de la casilla Crear una portada bajo los formularios de los motores.",
      "autoCoverOff": "Las portadas están desactivadas o su modelo no está instalado: consulta Portadas.",
      "formatHint": "El formato de los botones Descargar en la sesión y la biblioteca. Un formato elegido en un menú de descarga también se recuerda aquí.",
      "languageHint": "La misma elección que el botón de idioma de la cabecera.",
      "nav": "General",
      "title": "Ajustes generales"
    },
    "showMore": "{n} más, sin descargar: {names} ▾"
  },
  "notesHelp": {
    "actions": {
      "checks": "Mostrar la revisión",
      "draw": "Abrir «Dibujar desde cero»",
      "musicianOff": "Ocultar los números romanos",
      "musicianOn": "Mostrar los números romanos",
      "simple": "Abrir la vista simple",
      "snapIsOn": "«En tonalidad» está activado",
      "snapOn": "Activar «En tonalidad»"
    },
    "fig": {
      "at": "tempo 95, 4/4",
      "barTime": "1 compás ≈ 2,5 s",
      "beats": "4 tiempos: uno-dos-tres-cuatro",
      "brk": "pausa",
      "chordsTitle": "Acordes sobre los compases",
      "counter": "5 síl. · 6 notas",
      "fourBars": "4 compases ≈ 10 s",
      "higher": "más agudo",
      "inKey": "notas de la tonalidad",
      "ins": "Instrumento",
      "intro": "intro",
      "longer": "nota larga",
      "lower": "más grave",
      "lyricsTags": "Etiquetas en la letra",
      "melisma": "alargada",
      "octaveNote": "una voz masculina canta una octava por debajo de las notas escritas",
      "offKey": "fuera de la tonalidad",
      "partsRibbon": "Secciones en las notas",
      "pause": "silencio",
      "picker": "Los que encajan",
      "shorter": "corta",
      "sing": "la voz canta",
      "snapped": "cae aquí",
      "sung": "cantado",
      "syllables": [
        "Tú",
        "e",
        "res",
        "mi",
        "sol"
      ],
      "time": "tiempo →",
      "vocal": "Voz",
      "written": "escrito"
    },
    "firstTime": "¿Primera vez con las notas?",
    "open": "Ayuda de Notas",
    "openTip": "En palabras sencillas: cómo dibujar una melodía y cómo la canta YuE2",
    "sections": {
      "checks": {
        "head": {
          "check": "Qué dice",
          "fix": "Qué hacer",
          "means": "Qué significa"
        },
        "intro": "La revisión es la línea al pie de Notas: haz clic en ella para abrir la lista. Amarillo significa «conviene revisar», verde todo bien, gris solo una nota. Donde la solución es evidente hay un botón Corregir; Mostrar selecciona las notas o los compases en cuestión. Ctrl+Z deshace cualquier corrección.",
        "rows": [
          {
            "check": "Sin tonalidad ni tempo",
            "means": "YuE2 no sabe en qué tonalidad ni a qué velocidad cantar.",
            "fix": "Elígelos en los chips de arriba."
          },
          {
            "check": "Compases sin acorde",
            "means": "YuE2 está acostumbrado a un acorde en cada compás.",
            "fix": "Pulsa Corregir sin miedo: el acorde anterior pasa a los compases vacíos."
          },
          {
            "check": "La voz no tiene notas",
            "means": "No hay melodía: YuE2 se la inventará.",
            "fix": "Dibuja la melodía con el lápiz o usa uno de los inicios rápidos."
          },
          {
            "check": "Menos notas que sílabas en la letra",
            "means": "Muchas menos notas que sílabas: YuE2 inventa el resto y puede alejarse de tus notas.",
            "fix": "Añade notas (en la vista simple, el botón «añadir») o usa «De una canción…»."
          },
          {
            "check": "Notas por encima o por debajo de la voz",
            "means": "Difícil para el cantante; YuE2 puede forzar o cambiar de octava.",
            "fix": "Primero comprueba que está elegida la voz correcta, masculina o femenina. Luego pulsa Corregir: la melodía se desplaza por octavas hasta entrar en el registro."
          },
          {
            "check": "Las secciones no coinciden con la letra",
            "means": "Hay más o menos secciones en las notas que etiquetas en la letra: las líneas caen en lugares equivocados.",
            "fix": "Corregir añade las secciones que faltan al final; después revisa el orden. Quita tú las secciones sobrantes o ajusta las etiquetas de la letra."
          },
          {
            "check": "El instrumento suena junto con la voz",
            "means": "Es una nota, no un error: normalmente el instrumento calla mientras canta la voz.",
            "fix": "Nada, si es lo que quieres. Si no, borra las notas del instrumento en esos compases."
          },
          {
            "check": "El ABC es largo",
            "means": "Una partitura muy larga ocupa gran parte del prompt de YuE2.",
            "fix": "Acorta la canción o quita notas de instrumento innecesarias."
          }
        ],
        "tip": "Los elementos verdes no necesitan nada. Cuando no queden observaciones, puedes pulsar Crear.",
        "title": "Revisión para YuE2",
        "toc": "Revisión para YuE2"
      },
      "chords": {
        "note": "YuE2 usa los acordes solo con el plan «Melodía y acordes». Con «Seguir una melodía» el modelo elige el acompañamiento por su cuenta, y tus acordes quedan como una pista para ti.",
        "p": [
          "Un <b>acorde</b> es un conjunto de sonidos tocados a la vez. El acompañamiento se apoya en él: guitarra, teclados, bajo. Los acordes van en una fila sobre las notas, normalmente uno por compás.",
          "Haz clic en el acorde de un compás (o en un hueco vacío de la fila) para elegir otro. Primero aparecen los que <b>encajan</b>: acordes de tu tonalidad, que YuE2 respeta mejor. Debajo están «Frecuentes en menor» o «Frecuentes en mayor» y «Más» para experimentar. «Escuchar» reproduce el acorde, «Dos por compás» divide el compás en dos acordes.",
          "¿No sabes qué elegir? Quédate con lo que pone «Dibujar desde cero»: una progresión de cuatro acordes probada.",
          "<b>Para músicos</b> — el interruptor bajo la cuadrícula muestra números romanos en los acordes (I, IV, V, vi…): el grado del acorde en la tonalidad. Es para quien conoce la teoría; los demás no lo necesitan."
        ],
        "title": "Acordes",
        "toc": "Acordes"
      },
      "faq": {
        "items": [
          {
            "q": "¿Necesito saber leer música?",
            "a": "No. Basta con oír «más agudo — más grave» y «más largo — más corto». Activa «En tonalidad» y no habrá notas equivocadas."
          },
          {
            "q": "¿Por qué la voz masculina canta más grave de lo dibujado?",
            "a": "YuE2 escribe las melodías masculinas una octava por encima de donde se cantan. Es normal; no hace falta bajar las notas."
          },
          {
            "q": "¿Se guardan las notas en algún sitio?",
            "a": "Sí, son las notas del formulario: cada cambio va directamente al formulario y Ctrl+Z lo deshace. No hay un guardado aparte: pulsa Crear y YuE2 las toma."
          },
          {
            "q": "¿Cuánto durará la canción?",
            "a": "Lo que duren sus compases. A tempo 95 en 4/4 un compás dura unos 2,5 segundos: 16 compases son unos 40 segundos, 64 compases unos 2,7 minutos."
          },
          {
            "q": "¿Por qué YuE2 no cantó exactamente mis notas?",
            "a": "El modelo sigue las notas de cerca, pero no es un sintetizador: puede adornar la melodía, desplazar una sílaba, cantar una octava más grave. Si difiere mucho, mira la receta «La canción no sigue las notas»."
          },
          {
            "q": "¿Tengo que dibujar la batería y el bajo?",
            "a": "No. Solo la voz y, si quieres, una línea de instrumento en la intro y en las pausas. YuE2 toca el resto a partir del estilo."
          },
          {
            "q": "¿Qué es el texto ABC de abajo?",
            "a": "Las mismas notas escritas con letras: es lo que recibe YuE2. El editor lo escribe solo; edítalo a mano solo si conoces el formato."
          },
          {
            "q": "¿Cómo escucho sin crear una canción?",
            "a": "Escuchar (Space) reproduce las notas con un piano. El metrónomo marca los tiempos, Repetir repite los compases marcados."
          },
          {
            "q": "¿Puedo tomar las notas de una toma terminada?",
            "a": "Sí: «Abrir notas» en una toma las abre como copia. Edita, escucha y pulsa «Al formulario» para crear una toma nueva con ellas."
          }
        ],
        "title": "Preguntas frecuentes",
        "toc": "Preguntas frecuentes"
      },
      "key": {
        "p": [
          "Una <b>tonalidad</b> es un conjunto de siete sonidos que se llevan bien. Una melodía hecha con ellos suena bien, mientras que un sonido fuera del conjunto chirría como una nota falsa.",
          "El <b>menor</b> suena más triste y dramático, el <b>mayor</b> más brillante y alegre. La letra (C, D, A…) es el sonido del que parte el conjunto. De oído apenas importa; lo que importa es que sea cómodo de cantar.",
          "Las filas de la cuadrícula que pertenecen a la tonalidad están resaltadas. Activa <b>«En tonalidad»</b> y el lápiz no te dejará colocar una nota equivocada: cae en la fila más cercana que encaja. Es la forma más fácil de no desafinar nunca. ¿Necesitas una nota ajena? Mantén Shift.",
          "La tonalidad se cambia en el chip Tonalidad de arriba. Con «Mover también las notas y los acordes» activado, toda la canción se desplaza y suena más aguda o más grave."
        ],
        "tempo": [
          "El <b>tempo</b> son los pulsos por minuto (BPM). 70–90 es tranquilo, 95–120 moderado, 130 o más rápido. YuE2 toma el tempo de las notas; un tempo en el texto del estilo no tiene efecto.",
          "El <b>compás</b> (la indicación de compás) es cuántos tiempos tiene cada compás. El 4/4 es casi todo el pop y el rock, el 3/4 un vals, el 6/8 una sensación de balanceo, baladas. ¿No estás seguro? Deja 4/4.",
          "La <b>duración</b> es cuántos compases tiene la canción. El audio sigue las notas: 8 compases de 4/4 a tempo 95 son unos 20 segundos."
        ],
        "tempoTitle": "Tempo y compás",
        "title": "Tonalidad, tempo y compás",
        "toc": "Tonalidad y tempo"
      },
      "lanes": {
        "p": [
          "Las notas tienen dos pistas. La <b>Voz</b> (notas rosa-violeta) es lo que canta el cantante. El <b>Instrumento</b> (verde azulado) es una línea melódica de un instrumento: la intro, las pausas, el final.",
          "El lápiz escribe en la pista activa: haz clic en la otra para cambiar. «Silenciar» y «Solo esta pista» solo cambian lo que oyes aquí; no afectan a la canción.",
          "<b>Por qué el instrumento suele callar mientras canta la voz.</b> Así están hechas las propias partituras de YuE2: el instrumento llena los lugares sin voz. Si suena sobre el canto, YuE2 puede confundirse sobre qué cantar. La revisión señala esos compases: es una nota, no un error.",
          "La batería, el bajo y el acompañamiento no hace falta dibujarlos: YuE2 los toca por su cuenta a partir del estilo y de los acordes."
        ],
        "title": "Voz e Instrumento",
        "toc": "Voz e Instrumento",
        "voice": [
          "El interruptor Masculina / Femenina de la pista de Voz fija un registro cómodo para el cantante. Las notas fuera de él reciben un contorno rojo, y la revisión ofrece devolverlas. Si el estilo dice female o female vocals, el interruptor se ajusta solo.",
          "<b>La voz masculina de YuE2 canta una octava por debajo de las notas escritas.</b> Es normal: YuE2 escribe así las melodías también en sus propias partituras. Por eso una melodía masculina se ve aguda en el editor: no la bajes a propósito, o el cantante caerá a los graves.",
          "Al importar MIDI, «Ajustar la octava a la voz» hace este desplazamiento por ti."
        ],
        "voiceTitle": "Voz masculina o femenina"
      },
      "parts": {
        "p": [
          "Una canción se compone de secciones: intro, estrofa, pre-estribillo, estribillo, puente, interludio, outro. En el editor son la cinta de colores sobre los compases.",
          "Las secciones están unidas a las etiquetas de la letra: [Verse] es una estrofa, [Chorus] un estribillo, [Bridge] un puente, etcétera. Así sabe YuE2 qué líneas cantar en qué lugar de las notas. Por eso el número y el orden de las secciones deben coincidir con las etiquetas de la letra: la revisión lo vigila.",
          "Al hacer clic en una sección se abre su menú: tipo, nombre, «Repetir la sección» (un segundo estribillo en un segundo), «Añadir una sección después», «Mostrar la sección entera», «Eliminar con sus compases». El borde de una sección se puede arrastrar.",
          "<b>«Marcar las secciones según la letra».</b> Tras una importación MIDI normalmente no hay secciones. Si la letra tiene etiquetas, el editor ofrece marcar las notas según ellas con un botón: los compases se dividen por las etiquetas de la letra, en orden."
        ],
        "tip": "Habitual para YuE2: intro y puente 4–8 compases, estrofa y estribillo 8–16.",
        "title": "Secciones de la canción",
        "toc": "Secciones de la canción"
      },
      "recipes": {
        "intro": "Deseos frecuentes y qué hacer en cada caso, paso a paso.",
        "items": [
          {
            "title": "Quiero el estribillo más agudo",
            "steps": [
              "Muestra el estribillo: haz clic en la sección Estribillo → «Mostrar la sección entera».",
              "Con Seleccionar, dibuja un marco alrededor de las notas del estribillo en la pista de Voz.",
              "Pulsa ↑: cada pulsación sube un semitono. 3–5 semitonos se notan claramente; Shift + ↑ salta una octava.",
              "O en la vista simple: los botones «Subir la línea un grado de la escala» en cada línea del estribillo.",
              "Mira la revisión: las notas no deben salirse del registro de la voz."
            ]
          },
          {
            "title": "La canción no sigue las notas",
            "steps": [
              "Comprueba el plan en la pestaña Melodía: debe ser «Seguir una melodía» o «Melodía y acordes», no «Sin plan».",
              "Abre la revisión. Las causas habituales son «Menos notas que sílabas» y «Las secciones no coinciden con la letra».",
              "Una nota por sílaba: en la vista simple el contador de cada línea debe coincidir.",
              "Una voz masculina canta una octava por debajo de las notas escritas: compara la forma de la melodía, no su altura.",
              "Haz 2–3 tomas: el modelo aún improvisa un poco, y una toma suele quedar más cerca."
            ]
          },
          {
            "title": "La melodía es aburrida",
            "steps": [
              "Sube el estribillo 3–5 semitonos sobre la estrofa: eso es lo que lo hace «despegar».",
              "Mezcla notas largas y cortas: unas cuantas cortas y luego una nota larga al final de la línea.",
              "Añade un salto: una nota claramente más aguda que sus vecinas, en la palabra más importante.",
              "Repite una buena frase con Ctrl+C y Ctrl+V. La repetición hace pegadiza una melodía.",
              "Termina una línea en una nota de la tonalidad (una fila resaltada): así la frase suena acabada."
            ]
          },
          {
            "title": "Las palabras no caben",
            "steps": [
              "Abre «Simple»: una línea apretada muestra «faltan notas».",
              "Pulsa «añadir»: se dividen las notas más largas.",
              "O divide tú las notas largas con la herramienta Dividir (C).",
              "Si la línea sigue apretada, dale más espacio: arrastra el borde de la sección o usa «Añadir una sección después». O acorta la línea de la letra."
            ]
          },
          {
            "title": "Quiero la melodía de otra canción",
            "steps": [
              "Tienes un archivo de audio: «De una canción…». SheetSage2 transcribe la melodía y los acordes.",
              "Tienes un MIDI: «Importar MIDI». Elige la parte de la voz como Voz, activa «Ajustar la octava a la voz» e indica el tempo real de la canción.",
              "Ya es una toma de YuE2: «Abrir notas» en la toma y luego «Al formulario».",
              "Después de importar: «Marcar las secciones según la letra» y luego la revisión.",
              "Probablemente tus palabras caerán de otra manera que en el original: ajústalas en la vista simple."
            ]
          }
        ],
        "title": "Recetas",
        "toc": "Recetas"
      },
      "roll": {
        "head": {
          "key": "Tecla",
          "what": "Qué hace"
        },
        "keys": [
          {
            "key": "Space",
            "what": "Reproducir o pausar"
          },
          {
            "key": "Home",
            "what": "Volver al inicio"
          },
          {
            "key": "B · V · E · C",
            "what": "Lápiz · Seleccionar · Borrador · Dividir"
          },
          {
            "key": "1 2 3 4 5",
            "what": "Duración de una nota nueva: 1/16, 1/8, 1/4, 1/2, redonda"
          },
          {
            "key": "6",
            "what": "Un silencio en lugar de una nota"
          },
          {
            "key": "K",
            "what": "Activar o desactivar «En tonalidad»"
          },
          {
            "key": "L",
            "what": "Repetir los compases marcados"
          },
          {
            "key": "F",
            "what": "Pantalla completa"
          },
          {
            "key": "↑ ↓",
            "what": "Notas seleccionadas un semitono arriba o abajo"
          },
          {
            "key": "Shift + ↑ ↓",
            "what": "Notas seleccionadas una octava arriba o abajo"
          },
          {
            "key": "← →",
            "what": "Mover la selección (o el cursor) un paso de la cuadrícula"
          },
          {
            "key": "Shift + ← →",
            "what": "Mover un compás entero"
          },
          {
            "key": "Delete",
            "what": "Eliminar la selección"
          },
          {
            "key": "Ctrl + Z · Ctrl + Shift + Z",
            "what": "Deshacer · rehacer"
          },
          {
            "key": "Ctrl + C · Ctrl + V",
            "what": "Copiar · pegar en el cursor"
          },
          {
            "key": "Ctrl + D",
            "what": "Duplicar la selección"
          },
          {
            "key": "Ctrl + A",
            "what": "Seleccionar todas las notas de la pista"
          },
          {
            "key": "Esc",
            "what": "Quitar la selección"
          },
          {
            "key": "Shift al dibujar",
            "what": "Colocar una nota fuera de la tonalidad"
          },
          {
            "key": "Alt al dibujar",
            "what": "Borrar"
          },
          {
            "key": "Ctrl + rueda",
            "what": "Acercar o alejar"
          },
          {
            "key": "Shift + rueda",
            "what": "Desplazar hacia los lados"
          }
        ],
        "keysHint": "Funcionan mientras el foco está en el editor de notas, no en un campo de texto.",
        "keysTitle": "Atajos de teclado",
        "p": [
          "El piano roll es una tira que corre de izquierda a derecha, como el tiempo. Cada barra es una nota.",
          "<b>Más arriba en la pantalla significa un sonido más agudo.</b> Las teclas de piano de la izquierda indican qué nota es.",
          "<b>Una barra más larga significa un sonido más largo.</b> El espacio vacío entre notas es un silencio: la voz calla.",
          "Un <b>compás</b> es el tramo entre las líneas verticales gruesas; los números de compás están arriba. En 4/4 un compás tiene cuatro tiempos: cuatro pasos que podrías marcar con palmas. A tempo 95 un compás dura unos 2,5 segundos, así que 16 compases son unos 40 segundos de canción.",
          "La <b>cuadrícula</b> son las líneas finas dentro de un compás. Las notas se pegan a ellas, así que el ritmo sale regular. Una cuadrícula más fina permite colocar una nota con más precisión.",
          "El <b>cursor</b> es la línea vertical donde empieza Escuchar. Haz clic en la regla de compases para colocarlo. Arrastra por la regla para marcar los compases que se repiten."
        ],
        "title": "Cómo leer el piano roll",
        "toc": "Leer el piano roll",
        "tools": [
          "<b>Lápiz (B)</b> — un clic coloca una nota de la duración elegida; arrastrar a la derecha la alarga.",
          "<b>Seleccionar (V)</b> — haz clic en una nota o dibuja un marco alrededor de varias. Las notas seleccionadas se pueden arrastrar, mover con las flechas y cambiar de duración por su borde derecho.",
          "<b>Borrador (E)</b> — haz clic o pasa sobre las notas para quitarlas. Mantener Alt convierte cualquier herramienta en borrador.",
          "<b>Dividir (C)</b> — parte una nota en dos sobre la cuadrícula. Útil cuando un sonido largo debe llevar dos sílabas.",
          "<b>Duración</b> — la duración de una nota nueva: 1/4 es un tiempo, 1/8 medio tiempo, 1/2 dos tiempos. «Silencio» dibuja silencios."
        ],
        "toolsTitle": "Herramientas",
        "views": [
          "<b>Piano roll</b> — la vista principal, donde se dibuja y se edita.",
          "<b>Partitura</b> — las mismas notas como en un libro de música, para quien lee música: para ver y escuchar.",
          "<b>Simple</b> — la melodía como puntos sobre la letra; mira «Vista simple»."
        ],
        "viewsTitle": "Tres vistas"
      },
      "simple": {
        "p": [
          "«Simple» es la vista para quien encuentra difícil el piano roll. Cada línea de la letra es una tarjeta: los puntos están sobre las sílabas, y la línea entre ellos muestra hacia dónde va la melodía: arriba o abajo.",
          "<b>Arrastra un punto arriba o abajo</b> (o selecciónalo y pulsa ↑ ↓) para subir o bajar la nota. Con «En tonalidad» el punto solo pasa por las notas de la tonalidad, nunca fuera. Hacer clic en una sílaba reproduce su nota.",
          "El <b>contador</b> «5 síl. · 5 notas» muestra si hay notas suficientes para las palabras. Lo mejor es una nota por sílaba.",
          "<b>«+1 cantada como melisma»</b> — más notas que sílabas: las sobrantes se cantan alargadas sobre una sílaba («ye-e-eah»). Está bien y a menudo queda precioso.",
          "<b>«Faltan notas — añadir»</b> — más sílabas que notas. El botón «añadir» divide las notas más largas de la línea para que cada sílaba tenga la suya.",
          "El ritmo, es decir, la duración de las notas, no se cambia aquí: para eso usa el piano roll. Los botones de una línea la reproducen y mueven la línea entera arriba o abajo."
        ],
        "title": "Vista simple: la melodía sobre las palabras",
        "toc": "Vista simple"
      },
      "start": {
        "also": [
          "<b>Tocar en el piano</b> — con el teclado en pantalla o uno MIDI: las notas se escriben una tras otra desde el cursor.",
          "<b>Pegar ABC</b> — si la melodía ya existe como ABC (el menú Importar).",
          "<b>Las notas de una toma</b> — una toma terminada de YuE2 tiene «Abrir notas»: su partitura se abre como copia. Escúchala y edítala; el formulario no cambia. «Al formulario» lleva estas notas al formulario, «Cerrar» vuelve a las notas del formulario."
        ],
        "alsoTitle": "Más formas",
        "intro": "¿Aún no hay notas? Las tres formas están en la pantalla vacía de Notas.",
        "sparse": "YuE2 canta una nota por sílaba. Si una transcripción MIDI tiene muchas menos notas que sílabas tiene la letra (las transcripciones automáticas suelen tenerlas), el modelo tiene que inventar el resto y la canción deja de seguir las notas. La revisión lo advierte. Completa la melodía en el piano roll o en la vista simple, o toma las notas «De una canción…».",
        "sparseTitle": "Por qué un MIDI «escaso» da malos resultados",
        "title": "Tres inicios rápidos",
        "toc": "Tres inicios rápidos",
        "ways": [
          {
            "title": "Dibujar desde cero",
            "text": "Elige una tonalidad, un tempo y un compás, y el editor construye un esqueleto a partir de la letra: secciones según las etiquetas [Verse] y [Chorus], un número adecuado de compases y acordes provisionales. Solo queda dibujar la melodía de la voz con el lápiz. La mejor forma cuando la melodía está en tu cabeza."
          },
          {
            "title": "De una canción…",
            "text": "Elige un archivo de audio y SheetSage2 transcribe su melodía, acordes y secciones. Tarda uno o dos minutos. Funciona mejor con un tema de voz clara, sin coro ni ruido. Después edita como quieras."
          },
          {
            "title": "Importar MIDI",
            "text": "Suelta un archivo .mid de un DAW, una aplicación de notación o una web. En el selector elige qué parte será la Voz y cuál el Instrumento; la batería y el resto se descartan, y de los acordes se toma la nota más aguda. «Ajustar la octava a la voz» desplaza la melodía como la escribe YuE2. El campo de tempo: las transcripciones suelen guardarse a 120 BPM aunque la canción sea más rápida o más lenta; indica el tempo real y las notas caerán donde suenan."
          }
        ]
      },
      "what": {
        "head": {
          "name": "Plan",
          "text": "Qué hace YuE2",
          "when": "Cuándo elegirlo"
        },
        "p": [
          "Las notas son la melodía de la canción dibujada como barras: qué sonido cantar, cuándo empezar y cuánto mantenerlo. No necesitas saber leer música: basta con oír qué sonido es más agudo y cuál más grave.",
          "<b>Sin notas</b> YuE2 se inventa la melodía. Cada toma es distinta y no se puede saber de antemano cómo se cantará una línea.",
          "<b>Con notas</b> YuE2 canta tu melodía. En nuestras pruebas el modelo acertó las notas dibujadas el 98 % de las veces, mantuvo las subidas y bajadas de la melodía y respetó la duración: tantos compases como dibujes, tanto canta.",
          "En el formulario las notas se guardan como texto ABC: las mismas notas escritas con letras. El editor lo escribe por ti; no tienes que tocarlo."
        ],
        "plans": [
          {
            "name": "Sin plan",
            "text": "Se inventa la melodía y el acompañamiento y va directo al audio.",
            "when": "Cuando no hay notas y solo quieres oír ideas. En cuanto el formulario tiene notas, la app cambia el plan a «Seguir una melodía» por sí sola."
          },
          {
            "name": "Seguir una melodía",
            "text": "Canta tu melodía y se inventa el acompañamiento. Tus acordes no se usan.",
            "when": "Casi siempre, una vez dibujada la voz. La opción más segura."
          },
          {
            "name": "Melodía y acordes",
            "text": "Toma tanto tu melodía como tus acordes.",
            "when": "Cuando has elegido acordes y quieres justo esa armonía."
          }
        ],
        "plansIntro": "El plan se elige en el formulario, en la pestaña Melodía. Le dice a YuE2 qué hacer con tus notas.",
        "plansTitle": "Los tres planes de melodía",
        "title": "Qué son las notas y por qué las necesita YuE2",
        "toc": "Por qué notas"
      }
    },
    "title": "Ayuda de Notas",
    "toc": "Contenido",
    "tocPick": "Sección de la ayuda"
  },
  "player": {
    "mute": "Silenciar",
    "unmute": "Activar el sonido",
    "volume": "Volumen"
  },
  "sa3Gen": {
    "promptHint": "El inglés funciona mejor; el asistente Describir traduce. Indica el género, los instrumentos, el ambiente y el tempo; para un sonido, su fuente, cómo se produce y la sala."
  },
  "score": {
    "checks": {
      "sparseVocal": "Menos notas que sílabas en la letra: YuE2 inventará el resto",
      "sparseVocalSub": "{notes} notas, {syllables} sílabas. Mejor dibuja el resto de la melodía o usa «De una canción…»"
    },
    "lane": {
      "femaleAbbr": "Fem.",
      "insShort": "Instr.",
      "maleAbbr": "Masc.",
      "voiceFemale": "Voz: femenina",
      "voiceMale": "Voz: masculina"
    },
    "midi": {
      "fitOctave": "Ajustar la octava a la voz",
      "fitOctaveHint": "YuE2 escribe una melodía aproximadamente una octava por encima de donde se canta, mientras que una transcripción MIDI tiene la altura cantada. Toda la parte vocal se mueve por octavas enteras.",
      "markSections": "Marcar las secciones según la letra",
      "movedDown": "La voz se bajó {n} octava. | La voz se bajó {n} octavas.",
      "movedUp": "La voz se subió {n} octava. | La voz se subió {n} octavas.",
      "noSections": "El MIDI no tiene secciones de la canción. Etiquetas de la letra: {tags}.",
      "octaveDown": "−{n} octava | −{n} octavas",
      "octaveNone": "octava como en el archivo",
      "octaveUp": "+{n} octava | +{n} octavas",
      "tempoFile": "del archivo",
      "tempoHint": "El archivo indica {bpm} BPM. Las transcripciones suelen guardarse a 120 sea cual sea el tempo de la canción: fija el tempo de la canción y las notas se colocan según cuándo suenan.",
      "tempoTrack": "del tema «{title}»"
    },
    "overview": {
      "pickHint": "Abrir estos compases en Notas"
    },
    "toolbar": {
      "musician": "Para músicos",
      "musicianTip": "Mostrar los grados de los acordes (I, IV, V…): teoría musical para quien la conoce"
    },
    "workspace": {
      "backTip": "Volver a la sesión; las notas se quedan en el formulario",
      "copyBadge": "copia de la toma",
      "copyBadgeTip": "Una copia de las notas de la toma: el formulario no cambia hasta «Al formulario»",
      "copyLead": "Escucha y edita aquí: el formulario no cambia hasta que pulses «Al formulario». «Cerrar» vuelve a las notas del formulario.",
      "copyTitle": "Notas de la toma «{title}»",
      "form": "Formulario",
      "formBadge": "notas del formulario",
      "formBadgeTip": "Estas son las notas del formulario: los cambios van al formulario al instante (Ctrl+Z los deshace)",
      "label": "Notas",
      "replaceConfirm": "El formulario ya tiene otras notas. ¿Reemplazarlas por las notas de esta toma? (Ctrl+Z las devuelve)",
      "title": "Notas",
      "toForm": "Al formulario"
    }
  },
  "takeCompare": {
    "seed": "Seed {seed}"
  },
  "yueGen": {
    "abcScore": "Notas",
    "help": {
      "melody": {
        "sources": [
          "De una canción… — elige un archivo de audio y SheetSage2 escribe su melodía y sus acordes. Funciona mejor con una canción de voz clara.",
          "Importar MIDI — la parte más aguda pasa a ser la melodía, los demás canales el acompañamiento y los acordes, y la tonalidad se encuentra sola. Mantén la melodía vocal en una pista propia.",
          "Piano — elige una duración y pulsa teclas (abajo, a la izquierda del roll, o en un teclado MIDI): las notas se siguen una a otra.",
          "De un tema: Notas a MIDI en el menú de una toma, o la pestaña Stems y notas de la biblioteca, y luego A una partitura de YuE2. La voz pasa a ser la melodía, el bajo y el resto el acompañamiento."
        ]
      }
    },
    "unloadSheetSage": "Liberar la tarjeta de vídeo después de extraer la melodía"
  }
}
