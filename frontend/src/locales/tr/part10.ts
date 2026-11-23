// Strings added after the first translation (machine-translated from en, 743 keys);
// merged into the other parts key by key (see ../mergeParts).
export default {
  "aceGen": {
    "addLora": "LoRA ekle",
    "cfgIntervalOrder": "Yönlendirmenin “başlangıcı” “bitişinden” küçük olmalı.",
    "lengthAskedNote": "Süre modele bir istek olarak gider. Seçtiğinize yeniden basarsanız süreyi modele bırakırsınız.",
    "lengthByModelNote": "Açıklamadan model süreyi kendisi seçer. Kendi süreniz için buradan bir değer seçin.",
    "loraName": "LoRA adı",
    "loraPath": "LoRA adaptör klasörü",
    "manual": {
      "adg": "Uyarlanabilir yönlendirme (ADG)",
      "balancedOnly": "Dengeli modda",
      "baseOnly": "yalnızca base ve SFT modellerinde",
      "bpm": "Tempo",
      "cfgEnd": "Yönlendirme bitişi (yolun payı)",
      "cfgStart": "Yönlendirme başlangıcı (yolun payı)",
      "cotCaption": "Açıklamayı genişlet",
      "cotCaptionHint": "Açık: dil modeli müzik yapılmadan önce stil metninizi yeniden yazabilir.",
      "cotLanguage": "Dili algıla",
      "cotLanguagePicked": "kapalı: seçtiğiniz dil korunur",
      "coverNoise": "Kaynağa karıştırılan gürültü",
      "coverRepaintOnly": "cover ya da yeniden boyama için",
      "infer": "Çözme yöntemi",
      "latentCrossfade": "Modelin içindeki dikiş",
      "length": "Süre",
      "lmCfg": "Prompt’a yakınlık",
      "lmNegative": "Nelerden kaçınılacak",
      "lmSub": "şarkı planını yazar ve eksikleri doldurur",
      "lmTitle": "Dil modeli",
      "loraScale": "LoRA gücü",
      "metaByModel": "model bunu açıklamadan seçer",
      "musicSub": "şarkı hakkında önceden bilinenler",
      "musicTitle": "Müzik",
      "myLoras": "LoRA’larım: {n}",
      "needRef": "referans parçayla",
      "noLm": "ACE-Step bunu bu GPU’da yüklemiyor",
      "noLmWithRef": "referans parçayla kullanılmaz",
      "ode": "ODE: tam tekrarlanır",
      "off": "kapalı",
      "pickLora": "önce bir LoRA seçin",
      "refSub": "cover ve yeniden boyama",
      "refTitle": "Referans parça",
      "repaintMode": "Yeniden boyama modu",
      "repaintModes": {
        "aggressive": "Cesur",
        "balanced": "Dengeli",
        "conservative": "Temkinli"
      },
      "repaintOnly": "bir aralığı yeniden boyamak için",
      "repaintStrength": "Yeniden boyama gücü",
      "resultSub": "sonucun nasıl teslim edileceği",
      "sde": "SDE: rastgelelikle",
      "sdeBaseWarn": "Base modelde SDE bir testte (32 adım) müzik yerine gürültü verdi. Turbo’da çalışıyor, sesi daha koyu.",
      "shift": "Program kaydırması",
      "thinking": "Önce plan (thinking)",
      "tiled": "Parçalar halinde çöz",
      "turboSteps": "Turbo 1 ile 8 adım alır: fazlası 8’e kırpılır",
      "wavCrossfade": "Sesteki dikiş"
    },
    "modeDescribe": "Bir açıklamadan",
    "modeLabel": "Neyle başlanacak",
    "modeOwn": "Kendi söz metnim ve stilim",
    "modelNote": "Turbo 8 adım alır. Diğer modeller daha uzun sürer; bir bölümü çıkarma ya da ekleme hepsinde çalışmaz ve modelin yapamadığı görevler Bir parçadan sekmesinde gri görünür.",
    "noLmBaseNote": "Base ve SFT temiz vokal için bu modele dayanır: bu modda ses gürültülü ve uzak gelebilir. Vokal için Kendi söz metnim ve stilim’e geçip söz metnini yazın ya da Turbo’yu seçin.",
    "noLmNote": "Bu ekran kartında (8 GB ya da daha az) ACE-Step dil modelini yüklemez; bu yüzden açıklamanız söz metni yazılmadan, düz bir stil prompt’u olarak modele gider.",
    "noVocal": "Vokal yok",
    "noVocalHint": "Enstrümantal: söz metni gerekmez, müziği aşağıdaki stil belirler.",
    "queuedStatus": "Sırada, varyant: {n}",
    "refFile": "Referans ses dosyası",
    "refOff": "Bitmiş bir parçadan çalışmak için açın: cover, yeniden yapılan bir aralık, çıkarılan ya da eklenen bir bölüm.",
    "removeLoraConfirm": "Kaldırılsın mı?",
    "removeLoraNamed": "{name} LoRA’sını kaldır",
    "repaintOrder": "Aralığın bitişi başlangıcından sonra olmalı.",
    "simple": {
      "auto": "oto",
      "fast": "hızlı {n}",
      "formatHint": "mp3 daha az yer kaplar; wav ve flac sesi kayıpsız tutar.",
      "key": "Kip",
      "keyHint": "Majör daha parlak, minör daha koyu ve hüzünlü duyulur. Ana ses ve diğer dizileri Manuel’de seçersiniz.",
      "keyWish": "Açıklamadan model tonu kendisi seçer. Buradan seçtiğiniz kip ona bir istek olarak gider.",
      "lengthHint": "Parçanın ne kadar süreceği.",
      "lengthWish": "Açıklamadan model süreyi seçer. Buradan seçtiğiniz süre ona bir istek olarak gider, garanti değildir.",
      "major": "majör",
      "medium": "orta {n}",
      "minor": "minör",
      "slow": "yavaş {n}",
      "tempo": "Tempo",
      "tempoHint": "Dakikadaki vuruş sayısı. “Oto” modele bırakır; tam bir sayı Manuel’de girilir.",
      "tempoWish": "Açıklamadan model tempoyu seçer. Buradan seçtiğiniz tempo ona bir istek olarak gider."
    },
    "tabChanged": "değişti",
    "tabs": {
      "ref": "Bir parçadan",
      "song": "Şarkı",
      "tuning": "İnce ayar"
    },
    "taskType": "Parçayla ne yapılacak",
    "taskUnsupported": "Bu model desteklemiyor",
    "help": {
      "style": {
        "tips": [
          "En uygunu 5–9 etikettir: daha azında model boşlukları kendisi doldurur ve sonuç daha az öngörülebilir olur; daha fazlasında etiketler birbiriyle çelişmeye başlar.",
          "Önce tür ve ruh halini yazın — parçanın genel karakterini diğer etiketlerden daha çok onlar şekillendirir.",
          "Aynı kategoride çelişen etiketleri karıştırmayın (örneğin aynı anda “aggressive” ve “dreamy”) — model ya birini yok sayar ya da sonuç bulanık olur.",
          "Etiketleri İngilizce yazmak daha iyidir — eğitim verisi çoğunlukla İngilizce olduğundan, söz metni Rusça olsa bile doğruluk daha yüksektir.",
          "İnce ayarda ayarlanan bir tempo (Basit’te ya da Manuel’de tam bir sayı olarak), stilde “120 bpm” gibi bir metin etiketinden daha güvenilirdir: tempo önemliyse onu kullanın."
        ]
      },
      "lyrics": {
        "tips": [
          "Parça süresine uyun: 2 verse + 2 chorus için genelde ~2 dakika yeter; 3+ dakika için bir bridge ve ikinci bir hook ekleyin — kısa bir süre için fazla uzun bir metni model “sıkıştırır”.",
          "Kısa satırlar (5–10 hece) melodiye uzunlardan daha öngörülebilir oturur — bir satır uzarsa ikiye bölün.",
          "Tekrarlayan bir chorus (her [Chorus]’ta kelimesi kelimesine aynı metin) modelin parça boyunca ona aynı melodiyi vermesine yardım eder.",
          "Tamamen enstrümantal bir parça için yalnızca [Interlude] olan bir söz metni yazmak yerine “Vokal yok”u işaretleyin: daha güvenilirdir.",
          "Noktalama (virgüller, üç nokta) vokalin cümleleme ve duraklamalarını etkiler — yalnızca yazım kurallarına göre değil, bilerek kullanın."
        ]
      },
      "remix": {
        "unavailable": "Kullanılabilir senaryoların kümesi seçilen modele bağlıdır — formda desteklenmeyen seçenekler gri görünür. Belirli bir senaryo gerekiyorsa başka bir model deneyin (Şarkı sekmesinde ya da İnce ayarda). Referans dosyasını modelin sesi çıkarabildiği bir biçimde yükleyin (wav/mp3/flac) — çok uzun dosyalar (birkaç dakika) işlem süresini gözle görülür biçimde artırabilir."
      },
      "advanced": {
        "title": "İnce ayar",
        "rows": [
          {
            "param": "Basit ve Manuel",
            "what": "Basit’te birkaç sade seçim var: çözme adımları (Turbo’da yok), süre, tempo (yavaş 80, orta 110, hızlı 140), kip (majör ya da minör) ve biçim. Manuel’de her parametre gruplar halinde var ve konsol hepsini birden gösterir."
          },
          {
            "param": "Biçim",
            "what": "Çıkış dosyası biçimi. mp3 daha derli toplu ve dinlemek için yeterlidir; wav ve flac kayıpsızdır ama 5–10 kat büyüktür."
          },
          {
            "param": "Tempo, ton, ölçü",
            "what": "Açık müzikal parametreler. Oto bırakılırsa model bunları stil metninden alır; yalnızca kesinlik gerekince (örneğin diğer parçalarla miksleme için) elle ayarlayın. Ölçü 2/4, 3/4, 4/4 ya da 6/8’dir. Bir açıklamadan model bunları kendisi seçer: burada ayarlanan tempo ya da ton ona bir istek olarak gider, ölçü ise ona bırakılır."
          },
          {
            "param": "Vokal dili",
            "what": "Vokalin söylendiği dil. Oto’da söz metninden alınır; bu kısa ya da belirsiz sözlerde yanılabilir: vokal yanlış dilde çıkarsa ayarlayın. Elle seçilen dil korunur, dil modeli onun yerine bir şey koymaz."
          },
          {
            "param": "Çözme adımları",
            "what": "Difüzyon adımlarının sayısı. Daha fazlası daha temiz ses anlamına gelebilir ama üretim yavaşlar; bir noktadan sonra kazanç neredeyse duyulmaz. Turbo 1 ile 8 alır (varsayılan 8), SFT modelleri 50, base modeller 32. Basit’te Fazla olağan sayının iki katıdır."
          },
          {
            "param": "Stile yakınlık",
            "what": "Yönlendirme ölçeği: modelin açıklamanızı ne kadar sıkı izlediği. Yükseği stil etiketlerini daha kesin izler, ama çok yüksek değerler sesi sert ve artefaktlarla dolu yapar; düşüğü daha doğal ama daha az öngörülebilirdir. Turbo bunu kullanmaz. Varsayılan 7’dir, makul aralık genelde 3 ile 12’dir."
          },
          {
            "param": "Seed",
            "what": "Formun altında, Oluştur’un yanında. Zar basılıyken her varyant yeni bir rastgele seed alır. Diğer ayarlar aynıyken bir sayı sonucu neredeyse tekrarlar: tek bir stil etiketini değiştirip karşılaştırmak için kullanışlıdır."
          },
          {
            "param": "Model",
            "what": "Turbo kaliteden biraz taviz vererek daha hızlıdır ve Bir parçadan sekmesindeki her işi yapmaz; base ve SFT daha yavaş ama daha doğru ve esnektir. Model Şarkı sekmesinde ya da Manuel’de seçilir."
          },
          {
            "param": "LoRA",
            "what": "Modelin üzerine bir ince ayar eklentisi, örneğin belirli bir vokal tınısı ya da alt tür için. Gücü (0 ile 1) sonucu ne kadar etkilediğini belirler: 1, adaptörün yazarının amaçladığı tam etkidir, düşük değerler daha yumuşak karıştırır. Adaptörler Manuel’de Benim LoRA’larım altında bir ad ve bir klasörle eklenir."
          }
        ],
        "footer": "Dokunmadığınız her şey motorun varsayılanıyla gider: iyi bir sonuç için hepsini ayarlamanız gerekmez. Sıfırla, ince ayarın kendi satırlarını geri getirir; modele ve süreye dokunmaz."
      }
    }
  },
  "aiPart": {
    "guide": {
      "scratch": [
        {
          "title": "Tempo, ton, süre",
          "text": "Boş bir projede BPM’i ve “Ton”u, panelde de süreyi saniye olarak ayarlayın. 120 BPM’de 64 ölçü 128 saniyedir."
        },
        {
          "title": "Davulla başlayın",
          "text": "“Partisyon ekle”, enstrüman “Davul”. Diğer partisyonlar ritmi davuldan alır, bu yüzden önce davul gelir."
        },
        {
          "title": "Önce bas, sonra armoni",
          "text": "Bas, sonra akorlar: klavye, pad. Modelin duyduğu izler listesinde davulu işaretli tutun."
        },
        {
          "title": "Melodi ve renk",
          "text": "Lead, yaylılar, perküsyon. Beş ila yedi partisyon yeter; fazlası miksi kalabalıklaştırır."
        },
        {
          "title": "Seçin ve sesi ayarlayın",
          "text": "Her partisyonun en iyi varyantını tutun ve hemen uygun seviyeye indirin."
        },
        {
          "title": "Şarkıyı kurun",
          "text": "“Mıknatıs”ı ve ölçü cetvelini açın, partisyonları Bıçakla kesin, parçaları Silgiyle çıkarın: giriş, ana bölüm, davulsuz ve bassız bir ara, bitiş."
        }
      ],
      "scratchIntro": "Aranjör boş bir projeden parça kurabilir. Partisyonlar tek tek eklenir ve her yenisi öncekileri duyar, bu yüzden sıra önemlidir.",
      "scratchTitle": "Sıfırdan bir parça",
      "steps": [
        {
          "title": "Motoru başlatın",
          "text": "Aranjör ACE-Step üzerinde çalışır; yeniden boyama, devam ettirme ve cover Stable Audio 3’te de çalışabilir. Motor durmuşsa panel onu tek düğmeyle başlatmayı önerir ve o zaman GPU’daki motor durur."
        },
        {
          "title": "Tempoyu ve tonu ayarlayın",
          "text": "İlk partisyondan önce proje BPM’ini ve “Ton”u ayarlayın: ana ses ve dizi. Model bunları her istekte alır. İlk partisyonlardan sonra tempoyu değiştirmeyin: ızgaradan kayarlar."
        },
        {
          "title": "Bir mod seçin",
          "text": "“Partisyon ekle”, “Yeniden boya”, “Devam ettir” ya da “Cover”. Anahtarın yanındaki ipucu modelin ne yapacağını tek satırda söyler."
        },
        {
          "title": "Neye ihtiyacınız olduğunu tarif edin",
          "text": "Yeni bir partisyon için enstrümanı seçin. Açıklamada sesi ve çalışı adlandırın. Kendi dilinizde yazın: “İngilizceye” onu modelin en iyi okuduğu şekilde yeniden yazar. Alandaki “?” sözcükleri ve hazır örnekleri açar."
        },
        {
          "title": "Modelin duyduklarını işaretleyin",
          "text": "Model kendisini işaretli izlere uydurur. Davulu işaretli tutun: model onun ızgarasını izler."
        },
        {
          "title": "Nerede olduğunu söyleyin",
          "text": "Tüm parça ya da döngü bölgesi: “Döngü”yü açın ve bölgeyi cetvel üzerinde sürükleyin. “Yeniden boya” yalnızca döngü bölgesinde çalışır."
        },
        {
          "title": "Üretin ve seçin",
          "text": "Varyantlar yeni izlere düşer. “Dinle” bir varyanta geçer, “Tut” diğerlerini kaldırır."
        }
      ],
      "tips": [
        "Açıklama en iyi İngilizce, virgülle ayrılmış kısa ifadelerle çalışır. Kendi dilinizde yazın ve “İngilizceye”ye basın; sonucu okuyun ve gerekirse düzeltin.",
        "Tüm parçayı değil, tek bir partisyonu tarif edin: enstrüman ne çalıyor ve nasıl ses veriyor.",
        "Parçayı adım adım kurun: davul, sonra bas, sonra armoni, sonra melodi. Her yeni partisyon öncekileri duyar.",
        "Bir varyanttan memnun değil misiniz? Yeniden üretin: her çalıştırma yeni rastgele seed’ler kullanır.",
        "Her yeni partisyondan sonra, bir sonrakini eklemeden önce sesini ayarlayın: sonraki partisyon miksi şu anki hâliyle duyar.",
        "Partisyonlar hazır olunca şarkıyı onlardan kurun: izleri ölçülerden Bıçakla (C) kesin ve parçaları Silgiyle (E) çıkarın, böylece enstrümanlar tek tek devreye girer.",
        "Vokal için söz metnini yazın ve “Vokal dili”ni kontrol edin: “Oto”da harflerden okunur.",
        "ACE-Step her sonucu -1 dBFS’ye eşitler, bu yüzden yeni bir partisyon yüksek gelir: iz ses kaydırıcısıyla düşürün.",
        "Parçayı başka bir DAW’da bitirmek için “Stem’ler + Reaper” ya da DAWproject olarak dışa aktarın.",
        "Yeniden boyama, devam ettirme ve cover Stable Audio 3’te de çalışabilir: panelde motor olarak onu seçin. Aralığın çevresindeki sesi dinleyerek saniyeler içinde doldurur ve devam ettirir, yalnızca enstrümantal. Partisyon eklemek ACE-Step’te kalır."
      ]
    },
    "toEnglish": "İngilizceye",
    "toEnglishBusy": "Yazılıyor…",
    "toEnglishDone": "Asistan İngilizce olarak yeniden yazdı; gerekirse düzenleyin.",
    "toEnglishFailed": "Asistan açıklamayı yazamadı.",
    "toEnglishGpu": "Prompt asistanı GPU’da çalışacak şekilde ayarlı ve modeli bellekten atardı. Modeller sayfasında Oto ya da CPU’ya geçirin.",
    "toEnglishTitle": "Herhangi bir dilde anlatın: prompt asistanı onu modelin en iyi okuduğu şekilde İngilizce yazar",
    "toEnglishUndo": "Geri al"
  },
  "create": {
    "closeTool": "Kapat",
    "deleteAsk": "Silinsin mi?",
    "details": "Ayrıntılar",
    "download": "İndir",
    "emptyAll": "Şarkılarınız burada görünecek",
    "emptyHint": "Bir motor seçin, formu doldurun ya da üstündeki fikir satırına tek bir cümle yazın ve Oluştur’a basın.",
    "emptyPeriod": "Bu dönemde hiçbir şey yapılmadı",
    "engine": "Motor",
    "engineTitle": "{name}: {status}",
    "engines": {
      "ace_step": "Hızlı, cover’lar",
      "stable_audio": "Sesler ve loop’lar",
      "yue2": "Vokalli şarkılar"
    },
    "failed": "Olmadı. Forma yükleyin ve Oluştur’a yeniden basın.",
    "idea": {
      "chip": {
        "description": "Açıklama",
        "length": "Süre",
        "lyrics": "Söz metni",
        "style": "Stil",
        "tempo": "Tempo ve ton"
      },
      "describe": "Tarif et",
      "dismiss": "Kapat",
      "formChanged": "Form değiştirildi.",
      "noAssistant": "Prompt asistanı hazır değil: modelini Modeller ve ayarlar’dan indirin (başlıktaki dişli).",
      "noAssistantLink": "Modeller’den indirin",
      "noAssistantNote": "Prompt asistanının modeli gerekli.",
      "placeholder": {
        "ace_step": "Tek cümleyle: nasıl bir müzik istiyorsunuz",
        "stable_audio": "Tek cümleyle: ne duyulmalı",
        "yue2": "Tek cümleyle: şarkı neyi anlatıyor"
      },
      "replaces": "Formda şu an olanın yerine geçer",
      "settings": "Ayarlar",
      "stop": "Durdur",
      "stopping": "Durduruluyor…",
      "undo": "Önceki hâli geri getir",
      "write": "Söz metnini ve stili yaz",
      "writeSa": "Açıklamayı yaz",
      "writeShort": "Yaz",
      "writing": "Asistan yazıyor…",
      "written": "Aşağıdaki forma yerleştirildi.",
      "writtenOther": "{name} formuna yerleştirildi.",
      "saKind": "Yazılacak",
      "saKinds": {
        "auto": "Otomatik: fikre göre",
        "music": "Müzik parçası",
        "instrument": "Solo enstrüman",
        "one_shot": "Tek vuruş örneği",
        "sfx": "Ses efekti"
      }
    },
    "lessDetails": "Daha az",
    "live": {
      "failed": "Varyant başarısız: {name}. {reason}",
      "queue": "Sıradaki varyantlar: {n}",
      "ready": "Varyant hazır: {name}",
      "readyMany": "Hazır varyantlar: {n}, {name}"
    },
    "loading": "Parçalar yükleniyor…",
    "making": "Yapılıyor",
    "menu": {
      "made": "{when} yapıldı, süre {len}",
      "midi": "MIDI’ye",
      "rename": "Yeniden adlandır",
      "stems": "Stem’lere ayır",
      "took": "{s} sn sürdü"
    },
    "models": "Modeller",
    "more": "Ayrıntılar ve işlemler",
    "pause": "Duraklat",
    "peek": {
      "copied": "Kopyalandı",
      "copy": "Kopyala",
      "lines": "{n} satır",
      "lyrics": "Söz metni",
      "noLyrics": "Söz metni yok",
      "style": "Stil",
      "tags": "{n} etiket"
    },
    "period": "Dönem",
    "periodHint": {
      "all": "Şimdiye kadar yapılan her şey.",
      "today": "Bugün yapılan varyantlar. Yıldızlılar kütüphanede Favoriler altında toplanır.",
      "week": "Son yedi günün varyantları."
    },
    "periods": {
      "all": "Tümü",
      "today": "Bugün",
      "week": "7 gün"
    },
    "play": "Çal",
    "position": "Parçadaki konum",
    "queued": "Sırada",
    "reuse": "Forma yükle",
    "reuseInForm": "Forma yükle",
    "session": "Oturum",
    "showAll": "Tümünü göster: {n}",
    "showMore": "Daha fazla göster: {n}",
    "startAndCreate": "{name} motorunu başlat ve oluştur",
    "startFailed": "{name} başlamadı.",
    "startingEngine": "{name} başlatılıyor…",
    "startsOnCreate": "{name} şu an çalışmıyor. Oluştur’a bastığınızda başlar; başlatmadan sonraki ilk varyant daha uzun sürer.",
    "startsOnCreateOther": "GPU’yu şu an {other} tutuyor. Oluştur’a bastığınızda {name} başlar ve {other} durur. Başlatmadan sonraki ilk varyant daha uzun sürer.",
    "stop": "Durdur",
    "stopAsk": "Durdurulsun mu?",
    "stopConfirm": "Durdurmak için yeniden basın: şimdiye kadar yapılanlar kaybolur",
    "stopped": "Durduruldu.",
    "styleAndLyrics": "Stil ve söz metni",
    "takeN": "Varyant {n}",
    "takeTitle": "{title}, varyant {n}",
    "takes": "Varyant: {n}",
    "toSession": "Oturum listesine, varyant: {n}",
    "untitled": "Adsız",
    "wholeLibrary": "Tüm kütüphane"
  },
  "favorite": {
    "add": "Favorilere ekle",
    "remove": "Favorilerden çıkar"
  },
  "header": {
    "create": "Oluştur",
    "desc": {
      "create": "Şarkılar, enstrümantaller ve sesler",
      "library": "Her parça: yapılan, yüklenen ve editörden gelen"
    },
    "gpuFree": "GPU boşta",
    "home": "Ana sayfa",
    "languageCurrent": "Arayüz dili: {name}",
    "library": "Kütüphane",
    "more": "Daha fazla: dil, modeller, yardım",
    "guide": {
      "mapTitle": "Uygulamanın bölümleri",
      "map": {
        "idea": "İçeri girmenin en basit yolu, doğrudan ana sayfada: tek bir cümle ve Besteyle, yerel bir dil modeli motor için prompt’u yazar. Düzenleyin ve parçayı üretin.",
        "lora": "ACE-Step’i kendi parçalarınızla ince ayarlayın: ses yükleyin, otomatik etiketleyin, açıklamaları kontrol edin, eğitin ve dışa aktarın. Oluştur sayfasında ACE-Step’in altında açılır; bitmiş adaptör ACE-Step formunda görünür.",
        "yue": "İkinci motor: vokalli bütün bir şarkı yazar ve verilen bir melodinin etrafında kurabilir (SheetSage2 ile Melodi sekmesi). Ayrıca bir parçayı MIDI’ye çevirir."
      },
      "gpu": [
        "Motorlar GPU’ya birlikte sığmaz, bu yüzden aynı anda yalnızca biri çalışır. Motor Oluştur sayfasında seçilir ve formundaki Oluştur’a bastığınızda başlar; çalışan durur.",
        "İlk başlatma, model video belleğine yüklenirken birkaç dakika sürer. Başlıktaki durum düğmesi GPU’daki motoru ve video belleğinin ne kadar dolu olduğunu gösterir; tıklayınca kimin ne kadar bellek tuttuğu, Bellekten at düğmesi ve Modeller’e giden yol görünür.",
        "Bellekten atmak çalışan bir üretimi ya da eğitimi durdurur, bu yüzden düğme önce sorar."
      ],
      "steps": [
        {
          "title": "ACE-Step’i açın",
          "text": "Oluştur’a gidin ve ACE-Step’i seçin. Oluştur’a ilk bastığınızda başlar; ilk başlatma birkaç dakika sürer."
        },
        {
          "title": "Şarkıyı tarif edin",
          "text": "Şarkı sekmesinde, Bir açıklamadan: birkaç cümle yeter; tür, ruh hali, söz metninin konusu. Süreyi ve kaç varyant isteyeceğinizi seçin."
        },
        {
          "title": "En iyi varyantı seçin",
          "text": "Varyantlar formun yanındaki oturum listesinde sıralanır (telefonda altında). Yapılan her şey kendiliğinden kütüphaneye kaydedilir."
        },
        {
          "title": "Stem’lere ayırın",
          "text": "Vokal, davul, bas ve diğerleri tek tıkla: bir varyantın menüsünde Stem’lere ayır, kütüphanede Stem’ler ve notalar sekmesi ya da doğrudan editörde."
        },
        {
          "title": "Editörde kurun",
          "text": "Stem’leri kanallara dizin, yapay zeka aranjörüyle partisyonlar ekleyin, efektleri ayarlayın."
        },
        {
          "title": "Dışa aktarın",
          "text": "WAV ya da MP3 olarak miksleyin ya da kanalları bir Reaper projesi veya DAWproject ile dışa aktarın."
        }
      ],
      "compare": [
        {
          "label": "En uygun olduğu iş",
          "ace": "Hızlı şarkılar ve enstrümantaller, art arda çok sayıda varyant",
          "yue": "Vokalli bütün bir şarkı tek seferde",
          "sa3": "Enstrümantaller, ses efektleri ve sample’lar; editörde sesi doldurur ve devam ettirir"
        },
        {
          "label": "Bir parçadan çalışma",
          "ace": "Cover, bir bölümü yeniden boyama, partisyon ekleme, partisyon çıkarma, devam ettirme",
          "yue": "Başka bir parçanın melodisine şarkı: Melodi sekmesi, SheetSage2 ya da bir MIDI dosyasıyla",
          "sa3": "Bir aralığı yeniden boyama, devam ettirme, başka stilde cover (ses-ses); miksin üstüne partisyon yok"
        },
        {
          "label": "Kendi stiliniz",
          "ace": "Kendi parçalarınızla eğitilmiş bir LoRA",
          "yue": "Yok",
          "sa3": "Yok (LoRA desteği planlanıyor)"
        },
        {
          "label": "Süre",
          "ace": "10 ila 300 saniye, her çalıştırmada 1, 2 veya 4 varyant",
          "yue": "Söz metni ne kadar sürerse o kadar, ya da 1 ila 8 dakika; her çalıştırmada 1 ila 4 varyant",
          "sa3": "6 dakikaya (medium) veya 2 dakikaya (small) kadar; her çalıştırmada 1, 2 veya 4 varyant, çalıştırma başına saniyeler"
        },
        {
          "label": "MIDI",
          "ace": "Yok",
          "yue": "Bir parça ya da stem MIDI’ye (MuScriptor)",
          "sa3": "Yok"
        },
        {
          "label": "Lisans",
          "ace": "MIT: ticari kullanıma izin verilir; yayımlamadan önce güncel koşulları kontrol edin",
          "yue": "Yalnızca ticari olmayan kullanım",
          "sa3": "Stability AI Community License: yılda 1 milyon USD’nin altında ücretsiz; yalnızca enstrümantal, vokal yok"
        }
      ]
    },
    "helpSections": {
      "idea": {
        "title": "Bir fikirden beste",
        "text": "Ana sayfada bir şarkıyı, enstrümantali ya da sesi bir iki cümleyle tarif edin ve motoru seçin; söz metni dili ve prompt’u kimin yazacağı Daha fazla altındadır. Besteyle’de prompt asistanı, yerel bir Qwen3.5 modeli, prompt’u motorun biçiminde yazar: stil etiketleri, bölümlere ayrılmış söz metni, tempo ve ton. Düzenleyin, üretin ya da motorun formunda açın. Ses asistanı atlar ve doğrudan Stable Audio’ya gider. Oluştur sayfasında aynı fikir formun üstündeki fikir satırındadır ve doğrudan forma yazar. Asistanın modeli ve cihazı Modeller ve ayarlar’dan ayarlanır."
      },
      "engines": {
        "text": "Ses üreten üç motor var, ACE-Step 1.5, YuE2-3B ve Stable Audio 3, ve bunlar bir GPU’ya birlikte sığmaz, bu yüzden aynı anda yalnızca biri çalışır. Oluştur sayfasında bir motor seçin: Oluştur’a bastığınızda başlar ve çalışan kendiliğinden durur. Işık durumunu gösterir; model video belleğine yüklenirken ilk başlatma birkaç dakika sürebilir. Başlıktaki durum düğmesi GPU’yu neyin tuttuğunu gösterir ve bellekten atabilir."
      },
      "ace": {
        "text": "Şarkı sekmesinde müziği sade sözlerle tarif edin (Bir açıklamadan) ya da stil etiketlerini ve [Verse] / [Chorus] işaretli söz metnini verin (Kendi söz metnim ve stilim), ya da Vokal yok’u işaretleyin. Bir parçadan sekmesinde bir referans parça cover yapar, bir bölümü yeniden boyar, bir partisyonu çıkarır ya da ekler ya da bir kompozisyonu tamamlar. Süre 10-300 sn, her çalıştırmada 1, 2 veya 4 varyant. İnce ayarda Basit (adımlar, süre, tempo, kip, biçim) ve Manuel (her parametre) vardır; eğitilmiş bir LoRA orada, 0 ile 1 arasında bir güçle açılır."
      },
      "yue": {
        "text": "YuE2-3B vokalli bütün şarkılar yazar. Şarkı sekmesinde söz metni, stil, süre ve kalite var. Melodi sekmesi melodi planını belirler: Plan yok doğrudan sese gider, Melodiyi izle verilen melodiyi korur ve eşliği uydurur, Melodi ve akorlar önce ikisinin de planını yazar. SheetSage2 (Bir şarkıdan…) bir parçanın melodisini ABC partisyonu olarak yazar; bunu düzenleyip YuE2’ye geri verebilirsiniz."
      },
      "sa3": {
        "text": "Stable Audio 3 bir açıklamadan saniyeler içinde enstrümantal müzik ve ses efektleri yapar: Müzik ya da Ses seçin, bir sample kütüphanesinin yapacağı gibi tarif edin (tür, enstrümanlar, ruh hali, tempo ya da bir sesin kaynağı ve nasıl çıktığı), süreyi ve varyant sayısını ayarlayın. Vokal yoktur. Aynı motor editörün yapay zeka aranjörüne ve Sample’lara da hizmet eder; aralığın iki yanındaki sesi dinleyerek yeniden boyar, devam ettirir ve cover yapar. Ana ağırlıklar kapılıdır: Hugging Face’te lisansı kabul edin, belirtecinizi kaydedin ve Modeller ve ayarlar’dan bir model indirin."
      },
      "lora": {
        "text": "LoRA eğitimi Oluştur sayfasında ACE-Step’in altında, Üret’in yanında bulunur (telefonda formun üstündeki bir anahtar). Eğitim için ACE-Step’in çalışması gerekir ve sayfa onu başlatmayı önerir. Tüm ince ayar hattını adım adım izler: ses yükleme, otomatik etiketleme, açıklamaları gözden geçirip düzenleme, ön işleme, canlı ilerlemeyle eğitim ve dışa aktarma. Bitmiş bir adaptör ACE-Step formundaki LoRA listesine eklenir."
      },
      "stems": {
        "text": "Kaydedilmiş her parça tek tıkla dört stem’e (vokal, davul, bas, diğer) ayrılabilir: bir varyantın menüsünde Stem’lere ayır, kütüphanede Stem’ler ve notalar sekmesi ya da editördeki bir iz. Stem’ler editörde hazır dört izli bir proje olarak açılabilir. MIDI’ye dönüştürme (MuScriptor) tam mikste ya da tek bir stem’de çalışır; YuE2 motorunda çalışır, bu yüzden YuE2’nin kurulu olması gerekir."
      },
      "arranger": {
        "text": "Editördeki “Yapay zeka aranjörü” düğmesi bir parçayı bütün olarak üretmek yerine adım adım kurar. “Partisyon ekle” seçili izlerin üzerine yeni bir partisyon yazar (davul, bas, pad, yaylılar vb.), “Yeniden boya” zayıf bir aralığı yeniden yazar, “Devam ettir” parçayı sürdürür, “Cover” başka bir stilde yeni bir sürüm yapar. Her varyant kendi izine düşer: dinleyin, en iyisini tutun ve sonraki partisyona geçin. Partisyonları ACE-Step base modeli (yaklaşık 4,8 GB) ya da onun daha büyük XL base sürümü (yaklaşık 20 GB, 16 GB’lık bir kart gerekir) ekler; ikisi de isteğe bağlıdır ve base model yoksa aranjör onu kurmayı önerir. Diğer modlar turbo üzerinde çalışır, ya da motor olarak seçerseniz Stable Audio 3 üzerinde: çevredeki sesi dinleyerek doldurur, devam ettirir ve cover yapar, yalnızca enstrümantal."
      },
      "sfx": {
        "text": "Editördeki “Sample’lar” düğmesi, kısa bir açıklamadan Stable Audio 3 ile tek vuruşluk sesler (kick, vuruş, whoosh), proje temposunda loop’lar ve dokular (yağmur, kalabalık, drone) yapar. Sonuçlar bir şeritte sıralanır: önce dinleyin, sonra beğendiğinizi yeni bir ize ya da seçili ize imleç konumunda ekleyin. Loop’lar tam ölçülere kesilir ama model kesintisiz birleşmeyi garanti etmez, bu yüzden tekrarda kontrol edin. “Listeden kaldır” işin seslerini kütüphaneden ve diskten siler; o anda bir kanalda olanlar hariç."
      }
    }
  },
  "home": {
    "allTracks": "Tüm kütüphane",
    "compose": "Besteyle",
    "composeHere": "Asistan seçilen motor için prompt’u yazar; üretmeden önce düzenleyebilirsiniz",
    "composeSound": "Asistan süresiyle birlikte bir ses promptu yazar, Stable Audio onu üretir",
    "engineLabel": "Motor",
    "engines": "Ya da doğrudan bir motora geçin",
    "firstText": "Bir şarkıyı tarif edin ya da bir örnek alın:",
    "firstTitle": "Parçalarınız burada görünecek",
    "guide": "Beste nasıl çalışır",
    "kind": {
      "instrumental": "Enstrümantal",
      "song": "Vokalli şarkı",
      "sound": "Ses"
    },
    "kindLabel": "Ne yapılacak",
    "lead": "Her şey bu bilgisayarda çalışır",
    "loading": "Parçalar yükleniyor",
    "more": "Daha fazla",
    "needPhrase": "Önce müziği tarif edin",
    "title": "Ne yapalım?",
    "phraseLabel": "Müziği tarif edin",
    "placeholderSound": "geceleyin teneke çatıda yağmur, yakın ve sakin",
    "soundBySa3": "Sesleri Stable Audio yapar",
    "soundMissing": "Stable Audio kurulu değil"
  },
  "keyScale": {
    "hint": "ACE-Step yalnızca majör ve minörü bilir. Bu dizi için en yakın tonu ({key}) ve dizinin adını açıklamada alır: bir ipucu, garanti değil.",
    "mode": "Dizi",
    "modes": {
      "blues": "Blues",
      "dorian": "Dorian",
      "double_harmonic": "Çift harmonik",
      "harmonic_minor": "Armonik minör",
      "hungarian_minor": "Macar minörü",
      "locrian": "Lokriyen",
      "lydian": "Lidyen",
      "major": "Majör (İyonyen)",
      "major_pentatonic": "Majör pentatonik",
      "melodic_minor": "Melodik minör",
      "minor": "Doğal minör (Eolyen)",
      "minor_pentatonic": "Minör pentatonik",
      "mixolydian": "Miksolidyen",
      "phrygian": "Frigyen",
      "phrygian_dominant": "Frigyen dominant"
    },
    "needTonic": "Önce ana sesi seçin",
    "none": "Böyle bir dizi yok",
    "notSet": "ayarlanmadı",
    "search": "Aramak için yazın",
    "tonic": "Ana ses"
  },
  "libraryPage": {
    "aiPart": "Yapay zeka aranjöründen bir partisyon",
    "collectionName": "Koleksiyon adı",
    "confirmDeleteCollection": "Koleksiyon kaldırılsın mı?",
    "cot": {
      "full": "melodi ve akorlar",
      "melody": "melodiyi izler"
    },
    "delete": "Sil",
    "deleteCollection": "Koleksiyonu kaldır (parçalar kalır)",
    "deleteFailed": "Silinemedi: {error}",
    "emptyCollection": "Bir parçayı açın ve Hakkında sekmesinden bu koleksiyona ekleyin.",
    "emptyFavorites": "Bir parçayı yıldızla işaretleyin, burada görünür.",
    "emptyHere": "Burada henüz bir şey yok",
    "emptyHint": "Yaptığınız ve yüklediğiniz parçalar burada toplanır.",
    "facts": {
      "file": "Dosya",
      "madeIn": "Yapıldığı yer",
      "melody": "Melodi",
      "model": "Model"
    },
    "filters": {
      "all": "Tüm parçalar",
      "favorites": "Favoriler",
      "midi": "Notalar (MIDI)",
      "score": "Partisyon",
      "stems": "Stem’ler",
      "today": "Bugün"
    },
    "filtersLabel": "Kütüphane filtreleri",
    "groups": {
      "collections": "Koleksiyonlar",
      "has": "Parçada ne var",
      "origin": "Yapan",
      "tags": "Etiketler"
    },
    "loadFailed": "Kütüphane yüklenemedi.",
    "newCollection": "+ Yeni koleksiyon",
    "newest": "Önce en yeni",
    "noCollections": "Henüz koleksiyon yok: Yeni koleksiyon ile ilkini oluşturun.",
    "nothingFound": "Hiçbir şey bulunamadı",
    "nothingFoundHint": "Başka bir sözcük ya da başka bir filtre deneyin.",
    "oldest": "Önce en eski",
    "order": "Sıralama",
    "origins": {
      "editor": "Editör",
      "upload": "Yüklenen"
    },
    "period": "Dönem",
    "pick": "Bir parça seçin: söz metni, stili, stem’leri ve notaları burada görünür.",
    "renameCollection": "Koleksiyonu yeniden adlandır",
    "retry": "Yeniden dene",
    "reuseHint": "Oluştur’u bu söz metni, stil ve ayarlarla açar",
    "search": "Başlık, stil ya da söz metninden bir satır",
    "showAll": "Tüm parçaları göster",
    "sub": {
      "editor": "Editörden",
      "engine": "Açıklama yok",
      "upload": "Yüklenen dosya"
    },
    "tabs": {
      "about": "Hakkında",
      "lyrics": "Söz metni",
      "parts": "Stem’ler ve notalar"
    },
    "take": "Varyant {n}",
    "title": "Kütüphane",
    "toCreate": "İlk parçayı yapın",
    "today": "Bugün",
    "yesterday": "Dün",
    "bulk": {
      "addTag": "#{tag} ekle",
      "clear": "Seçimi temizle (Esc)",
      "collected": "{n} parça «{name}» koleksiyonuna eklendi | {n} parça «{name}» koleksiyonuna eklendi",
      "collection": "Koleksiyon",
      "favorited": "{n} parça favorilere eklendi | {n} parça favorilere eklendi",
      "label": "Seçili parçalarla ilgili işlemler",
      "newCollection": "Yeni koleksiyon…",
      "noTags": "Henüz etiket yok: bir etiket yazıp Enter’a basın.",
      "selectAll": "Tümünü seç: {n}",
      "selectSong": "«{title}» parçasını kayıtlarıyla seç: {n}",
      "selectTrack": "«{title}» parçasını seç",
      "selected": "Seçili: {n}",
      "tag": "Etiket",
      "tagPlaceholder": "Yeni bir etiket ya da ara",
      "tagged": "#{tag} etiketi {n} parçaya eklendi | #{tag} etiketi {n} parçaya eklendi",
      "uncollected": "{n} parça «{name}» koleksiyonundan çıkarıldı | {n} parça «{name}» koleksiyonundan çıkarıldı",
      "unfavorited": "{n} parça favorilerden çıkarıldı | {n} parça favorilerden çıkarıldı",
      "untagged": "#{tag} etiketi {n} parçadan kaldırıldı | #{tag} etiketi {n} parçadan kaldırıldı"
    },
    "emptyTag": "Bu etiketi bir parçaya Hakkında sekmesinden, birden çok parçaya ise seçim çubuğundan ekleyin.",
    "tags": {
      "add": "Bir etiket ekleyin ve Enter’a basın",
      "added": "#{tag} etiketi eklendi",
      "confirmDelete": "Etiket silinsin mi?",
      "delete": "Etiketi tüm parçalardan kaldır",
      "remove": "#{tag} etiketini kaldır",
      "removed": "#{tag} etiketi kaldırıldı",
      "rename": "Etiketi yeniden adlandır"
    },
    "trash": {
      "confirmEmpty": "Hepsi kalıcı olarak silinsin mi?",
      "confirmPurge": "Kalıcı olarak silinsin mi?",
      "deleted": "Silindi: {when}",
      "dismiss": "Bildirimi gizle",
      "emptied": "Çöp kutusu artık boş",
      "empty": "Çöp kutusunu boşalt",
      "emptyHere": "Çöp kutusu boş",
      "emptyHint": "Silinen parçalar, geri isteyebilirsiniz diye burada 30 gün bekler.",
      "loadFailed": "Çöp kutusu yüklenemedi: {error}",
      "moveHint": "Parçayı çöp kutusuna taşır: 30 gün boyunca oradan geri yüklenebilir",
      "moved": "{n} parça çöp kutusuna taşındı | {n} parça çöp kutusuna taşındı",
      "note": "Çöp kutusundaki parçalar 30 gün sonra kalıcı olarak silinir.",
      "purge": "Kalıcı olarak sil",
      "purged": "{n} parça kalıcı olarak silindi | {n} parça kalıcı olarak silindi",
      "restore": "Geri yükle",
      "restored": "{n} parça geri yüklendi | {n} parça geri yüklendi",
      "title": "Çöp kutusu",
      "undo": "Geri al"
    }
  },
  "midiPanel": {
    "betterWithVocals": "Tam mikse göre çalışır; tam bir melodi için parçayı önce stem’lere ayırın ve vokali tanıtın.",
    "scoreEmpty": "MIDI’de partisyon yapılacak nota yok.",
    "scoreFromFull": "tam mikse göre",
    "scoreFromStems": "melodi vokalden, eşlik bas ve diğerlerinden",
    "scoreFromVocals": "melodi vokalden",
    "scoreInserted": "Partisyon YuE2 formunda ({from}).",
    "toScore": "YuE2 partisyonuna",
    "toScoreHint": "Notaları YuE2 için bir ABC partisyonuna çevirir ve formuna yerleştirir: vokal melodi, bas ve diğerleri eşlik ve akorlar olur."
  },
  "miniWave": {
    "percent": "{n}%",
    "timeOf": "{pos} / {total}"
  },
  "models": {
    "check": "Kontrol et",
    "checkBad": "Hasarlı ya da eksik: {files}. Bu parçayı yeniden indirin.",
    "checkFailed": "Kontrol edilemedi: {error}",
    "checkOffline": "Hugging Face’e ulaşılamadı, bu yüzden yalnızca boyutlar karşılaştırıldı.",
    "checkOkHash": "{n} dosyanın hepsi tam; {h} tanesi Hugging Face’in listelediği SHA-256 ile eşleşti.",
    "checkOkRecord": "{n} dosyanın hepsi boyut olarak kayıtla eşleşiyor.",
    "checkOkSize": "{n} dosyanın hepsi tam (boyut ve yapıya göre kontrol edildi; karşılaştırılacak bir sağlama listesi yok).",
    "checkOutdated": "Tam, ancak depoda şunun daha yeni bir sürümü var: {files}. Almak için yeniden indirin.",
    "checkTitle": "Dosyaların tam olduğunu kontrol et",
    "checking": "Kontrol ediliyor…",
    "parts": {
      "yue2-bf16": {
        "name": "YuE2 bf16",
        "text": "Nicemlenmemiş model. q8_0’dan daha fazla video belleği ister (üçünün en çoğu)."
      }
    },
    "reinstall": "Yeniden indir",
    "reinstallAsk": "{gb} GB yeniden indirilsin mi?",
    "reinstallNamed": "{name} yeniden indir",
    "reinstallNo": "Kalsın",
    "reinstallTitle": "Yeniden indir ve dosyaların yerine koy",
    "reinstallYes": "Yeniden indir",
    "yue2": {
      "noSettings": "q8_0, q4_0 ya da bf16 hassasiyeti her üretim için YuE2 formunda, Kalite ile seçilir."
    }
  },
  "params": {
    "changed": "Değişti",
    "consoleNote": "Elle ayarlanan değerler işaretlidir. Gerisi varsayılanıyla gider.",
    "consoleTitle": "{name} konsolu",
    "default": "Varsayılan: {v}",
    "quick": "Hızlı seçim: {group}",
    "reset": "Varsayılana dön",
    "resetOne": "{name} değerini varsayılana döndür",
    "simple": {
      "more": "Fazla: {n}",
      "normal": "Olağan: {n}",
      "steps": "Çözme adımları",
      "stepsHint": "Daha çok adım daha uzun sürer."
    }
  },
  "player": {
    "close": "Oynatıcıyı kapat",
    "label": "Oynatıcı",
    "next": "Sonraki parça",
    "prev": "Önceki parça (parça ilerlemişse baştan)"
  },
  "presets": {
    "button": "Hazır ayar",
    "confirmDelete": "{name} silmek için yeniden tıklayın",
    "deleteAsk": "Silinsin mi?",
    "deleteOne": "{name} hazır ayarını sil",
    "none": "Henüz kayıtlı hazır ayar yok.",
    "saveCurrent": "Formu hazır ayar olarak kaydet",
    "title": "Hazır ayarlar: formun ayarlarının kayıtlı setleri"
  },
  "resources": {
    "ramOf": "RAM {used} / {total} GB",
    "state": {
      "error": "{model} bir hata bildirdi",
      "running": "{model} çalışıyor",
      "starting": "{model} başlıyor",
      "stopping": "{model} duruyor"
    },
    "vramOf": "Video belleği {used} / {total} GB",
    "holder": {
      "cover": "Kapaklar (Z-Image Turbo)"
    }
  },
  "sa3Gen": {
    "badGuidanceWindow": "Yönlendirme, başladığından daha yüksek bir gürültü seviyesinde duruyor: “duruş”u düşürün ya da “başlangıç”ı yükseltin.",
    "formTabs": "Formun bölümleri",
    "kindLabel": "Ses türü",
    "lengthFromRef": "Süreyi referans parça belirler:",
    "lengthOwn": "kendi süreniz: {v}",
    "lengthSeconds": "{n} sn",
    "manual": {
      "apg": "APG payı",
      "autoTags": "Servis etiketleri",
      "cfg": "Açıklamaya yakınlık",
      "cfgStartsAt": "Yönlendirme şu gürültü seviyesinde başlar",
      "cfgStopsAt": "Yönlendirme şu gürültü seviyesinde durur",
      "chunked": "Parçalar halinde çöz",
      "chunkedAuto": "Oto",
      "duration": "Süre",
      "fromRef": "referans parça belirler",
      "guidanceSub": "açıklamanın sesi nasıl yönlendirdiği; gürültü seviyesi çalışma boyunca 1’den 0’a düşer",
      "guidanceTitle": "Yönlendirme",
      "needCfg": "Açıklamaya yakınlık 1 değilken",
      "needTwo": "iki ya da daha fazla varyantla",
      "negative": "Nelerden kaçınılacak",
      "normThreshold": "Yönlendirme adımı sınırı",
      "off": "Hayır",
      "on": "Evet",
      "padding": "Süre payı",
      "perVariant": "Varyant başına bir açıklama",
      "resultSub": "süre ve açıklama",
      "resultTitle": "Sonuç",
      "sampler": "Örnekleyici",
      "samplerAuto": "varsayılan (pingpong)",
      "samplerAutoBase": "modelin varsayılanı",
      "samplerLoud": "Olağandan yüksek ve kırpılmış: bir testte sesin %1-2’si tavana çarptı.",
      "samplerQuiet": "Olağandan yaklaşık 7 dB daha kısık.",
      "samplerSub": "her adımın nasıl hesaplandığı",
      "samplerTitle": "Örnekleyici",
      "scalePhi": "Yönlendirmeyi yumuşat",
      "textOnly": "yalnızca referans parça olmadan",
      "trim": "Baştaki sessizliği kes"
    },
    "modelsAfterStart": "Modellerin listesi motor çalışınca görünür.",
    "queuedNote": "Sıradaki varyantlar: {n}",
    "ref": {
      "modeLabel": "Referansla ne yapılacak",
      "off": "Bitmiş bir parçadan çalışmak için açın: yeniden yapın, bir aralığı yeniden yapın ya da devam ettirin."
    },
    "simple": {
      "tagsOff": "Ekleme",
      "tagsOn": "Ekle"
    },
    "submitKind": {
      "music": "Müzik oluştur",
      "sfx": "Ses oluştur"
    },
    "tabChanged": "değişti",
    "tabs": {
      "ref": "Bir parçadan",
      "sound": "Açıklama",
      "tuning": "İnce ayar"
    },
    "advancedHint": "Seed’in yanındaki zar onu yeniden rastgele yapar; bir sayı o sesi tekrarlar. Eğitim sonrası modeller 8 adım ve yakınlık 1 için ayarlıdır; Nelerden kaçınılacak ve Yönlendirme grubu yalnızca Açıklamaya yakınlık 1 değilken çalışır.",
    "advancedHintBase": "Bir base checkpoint: 50 adım ve yakınlık 7 ile başlar, bu yüzden Nelerden kaçınılacak çalışır; oraya “poor quality” deneyin.",
    "help": {
      "tips": [
        "Müzik: tür, enstrümanlar ve her birinin sesi, ruh hali ve enerji, BPM cinsinden tempo.",
        "Bir ses: neyin çıkardığı, nasıl ve ne kadar sürdüğü, mikrofonun nerede olduğu ve odanın nasıl ses verdiği.",
        "Etiketler yardımcı olur: TrackType: Music, VocalType: Instrumental, Genre: Funk, Instruments: Guitar, Saxophone; solo bir partisyon için TrackType: Instrument; bir ses için TrackType: SFX.",
        "Vokal yok: model enstrümantaller yapar; vokalli bir prompt en fazla sözsüz dokular verir.",
        "Bir sonucu tekrarlamak için seed yazın; zar basılıyken her varyant yenisini alır."
      ]
    },
    "translateBtn": "Yalnızca çevir",
    "translateHint": "Stable Audio yalnızca İngilizce anlar: asistan metninizden İngilizce bir prompt yazabilir ya da sadece çevirebilir.",
    "translateNoAssistant": "İstem asistanı hazır değil: modelini Modeller bölümünden indirin.",
    "translateRunning": "Çevriliyor…",
    "translateStopping": "Durduruluyor…",
    "translateStop": "Durdur",
    "translateDone": "İngilizceye çevrildi.",
    "translateUndo": "Geri al",
    "composeBtn": "Prompt yaz",
    "composeTitle": "Asistan, herhangi bir dildeki açıklamayı Stable Audio için bir prompta dönüştürür: tür, enstrümanlar, ses, tempo ve süre",
    "composeRunning": "Prompt yazılıyor…",
    "composeDone": "Stable Audio promptu hazır."
  },
  "tagInput": {
    "cleared": "Tüm etiketler temizlendi",
    "removeTag": "{tag} kaldır",
    "removed": "{tag} kaldırıldı",
    "restored": "Etiketler geri getirildi",
    "undo": "Geri al",
    "undoTitle": "Temizlenen etiketleri geri getir"
  },
  "yueGen": {
    "help": {
      "advanced": {
        "choices": [
          "Kalite (Şarkı sekmesi): Taslak q4_0 modeli, Normal q8_0, Final ise bf16 ile 32 çözme adımı ve stile yakınlık 1.2’dir.",
          "Süre (Şarkı sekmesi): dakikalar Şundan kısa olmasın ve Şundan uzun olmasın değerlerine dönüşür; model saniyede 25 token ses üretir.",
          "Şarkı söyleme: Daha dengeli Cesaret 0.85, Daha cesur 1.1’dir.",
          "Tekrarlar: Daha az, Tekrar cezası 1.3 ve Tekrar belleği 80’dir.",
          "Partisyon: Daha dikkatli, partisyon Cesareti 0.55’tir."
        ],
        "choicesIntro": "Aşağıdaki çözümlerle aynı değerleri tek tıkla ayarlarlar.",
        "choicesTitle": "Sekmelerdeki seçimler",
        "title": "İnce ayar",
        "lead": "Bunlara dokunmayabilirsiniz: değiştirmediğiniz her şey motorun varsayılanıyla gider; Manuel’de her satırda görünür. Bir parça sürekli yanlış çıktığında önem kazanırlar: yarıda kesilen, döngüye giren, tonu tutmayan. Durumunuzu aşağıda bulun ve Uygula’ya basın: doğru sayılar alanlara kendiliğinden girer.",
        "fixes": [
          {
            "id": "cutoff",
            "problem": "Parça söz metni bitmeden kesiliyor",
            "fix": "Şundan uzun olmasın: 12000 token, 6 yerine yaklaşık 8 dakikalık bir süre tavanı."
          },
          {
            "id": "offbrief",
            "problem": "Ses etiketlere uymuyor",
            "fix": "Stile yakınlık: 1.2, böylece model açıklamayı daha sıkı izler. Bu yardımcı olmazsa sorun etiketlerin kendisindedir."
          },
          {
            "id": "loop",
            "problem": "Tek bir cümle durmadan dönüyor",
            "fix": "Tekrar cezası 1.3 ve Tekrar belleği 80: tekrarlar için daha güçlü bir ceza ve onların daha uzun bir hatırlanması."
          },
          {
            "id": "offkey",
            "problem": "Yanlış notalar, vokalde çatlamalar, gürültü",
            "fix": "Cesaret 0.85 ve 32 çözme adımı: daha az cesaret, sesi işleyen daha çok geçiş."
          },
          {
            "id": "melody",
            "problem": "Melodi tutarsız",
            "fix": "Plan kapalıysa Melodi ve akorlar’a geçer (önceden seçtiğiniz plan kalır) ve Partisyon Daha dikkatli’ye geçer (partisyon Cesareti 0.55), böylece partisyon daha temkinli yazılır. Ya da Melodi sekmesinde bir şarkıdan melodi alın: verilen partisyon planın yerine geçer ve o zaman yalnızca plan seçimi önemlidir."
          },
          {
            "id": "same",
            "problem": "Tüm varyantlar birbirine benziyor",
            "fix": "Rastgele seed’i açar. Bu yetmezse Cesaret 1.1."
          },
          {
            "id": "final",
            "problem": "Son hâlini istiyorum",
            "fix": "Kalite: Final, bf16 modeli (indirilmişse), 32 adım ve stile yakınlık 1.2. 2–3 varyant yapın ve en iyisini tutun."
          }
        ],
        "fieldsIntro": "Her alanın altında tipik değerlerin bir ölçeği var: üstündeki işaret ses için varsayılandır, altındaki işaret partisyon içindir (yalnızca bir melodi planıyla ve verilmiş partisyon yokken). Partisyon titizlik ister, ses canlılık, bu yüzden varsayılanlar farklıdır.",
        "groups": [
          {
            "title": "Doğruluk ve kalite",
            "fields": [
              {
                "key": "cfg_scale",
                "name": "Stile yakınlık (CFG)",
                "text": "Modelin stil etiketlerini ne kadar itaatkâr izlediği. Bir müzisyenin kulağındaki sesinizin yüksekliği gibi: kısıkken daha serbest çalar, yüksekken görevlendirmeye daha yakın ama daha katıdır.",
                "left": "daha serbest",
                "right": "etiketlere daha sıkı",
                "when": "Ses açıklamaya pek uymuyorsa 1.2. 1.5’in üstü — artefaktlar ve “plastik” bir ses."
              },
              {
                "key": "num_inference_steps",
                "name": "Çözme adımları",
                "text": "Modelin planını bitmiş sese çevirirken kaç geçiş yaptığı. Boya katları gibi: 8 hızlı bir taslak, 32 temiz bir son kat.",
                "left": "daha hızlı",
                "right": "daha temiz",
                "when": "Taslaklar için 8, final için 32. Fark neredeyse duyulmaz (bir RTX 4080’de parça başına yaklaşık 4 sn); 32’nin ötesinde ses yalnızca değişir, iyileşmez."
              }
            ]
          },
          {
            "title": "Performansın karakteri",
            "fields": [
              {
                "key": "temperature",
                "name": "Cesaret (temperature)",
                "text": "Modelin cesareti (en az 0.01: sıfır motoru durdurur). Düşük — “kitabına göre” çalar, düzgün ve öngörülebilir; yüksek — doğaçlama yapar, bazen parlak, bazen yanlış notayla.",
                "left": "daha dengeli",
                "right": "daha cesur",
                "when": "Yanlış notalar: 0.85. Tüm varyantlar aynı: 1.1. Garip bir partisyon: partisyon için 0.5–0.6."
              },
              {
                "key": "repetition_penalty",
                "name": "Tekrar cezası",
                "text": "Daha önce çalınanı tekrarlamak için bir ceza. Ne kadar yüksekse model “takılmış plak”tan o kadar kaçınır. Partisyon için neredeyse 1.0’dır — notasyonda tekrarlar normaldir.",
                "left": "tekrarlara izin var",
                "right": "tekrar yok",
                "when": "Döngü: 1.3. 1.1’in altında monoton döngü riski."
              }
            ]
          },
          {
            "title": "Parça süresi",
            "fields": [
              {
                "key": "min_tokens",
                "name": "Şundan kısa olmasın",
                "text": "Model bundan önce bitiremez. Saniyede kabaca 25 birim: 200 ≈ 8 saniyelik ses.",
                "left": "kısa olabilir",
                "right": "bundan önce olmaz",
                "when": "Parça hepsini söylemeden bitiyorsa: yükseltin."
              },
              {
                "key": "max_tokens",
                "name": "Şundan uzun olmasın",
                "text": "Süre tavanı. 9000 ≈ 6 dakikalık şarkı; form 15000’e kadar kabul eder. Daha fazlası — daha uzun bekleme ve daha çok GPU belleği.",
                "left": "daha kısa",
                "right": "daha uzun",
                "when": "Cümlenin ortasında kesiliyorsa: 12000."
              }
            ]
          }
        ],
        "rareIntro": "Bunlar Cesaret ya da Tekrar cezasıyla aynı şeyleri değiştirir, yalnızca daha ince. Genelde dokunulmaz.",
        "rare": [
          {
            "key": "top_p",
            "name": "Nadir seçim eşiği (top-p)",
            "text": "Modelin her adımda kaç “makul” seçeneği değerlendirdiği: 1 — hepsi, 0.5 — yalnızca en bariz olanlar."
          },
          {
            "key": "top_k",
            "name": "Adaylar (top-k)",
            "text": "Her seçimdeki seçenek sayısı için sert bir sınır. Nadir seçim eşiğinin yanında ikinci bir filtre."
          },
          {
            "key": "penalty_window",
            "name": "Tekrar belleği",
            "text": "Model tekrar cezasını hesaplarken çaldığı şeyi ne kadar geriye kadar hatırlar. 50 ≈ 2 saniyelik ses. Döngüdeyken 80’e yükseltin."
          }
        ]
      },
      "melody": {
        "lead": "YuE2 söz metnini verdiğiniz bir melodiyle söyleyebilir. Melodiyi ABC partisyonu tutar: metin olarak yazılmış notalar. Uygulamanın yazdığı biçimdeki bir partisyondan şarkı aynı tonda, aynı söylenen notalarla ve aynı sürede çıkar: testimizde notalar %93–99 eşleşti.",
        "roll": [
          "Dinle partisyonu piyanoda çalar. Rulo üzerinde tıklamak ya da sürüklemek nereden başlanacağını seçer, ⏮ en başa döner.",
          "Pembe notalar vokal (Vocal), mavi olanlar eşliktir (Ins). Ölçü numaraları ve akorlar üstte akar.",
          "Ctrl + fare tekerleği yakınlaştırır, ⤢ üç oktavlık tuşlarla büyük pencereyi açar.",
          "Nota kâğıdı aynı partisyonu portelerde gösterir; bir notaya tıklamak onu çalar."
        ],
        "rollTitle": "Rulo ve notalar",
        "sources": [
          "Bir şarkıdan… — bir ses dosyası seçin, SheetSage2 melodisini ve akorlarını yazıya döker. Vokali net olan bir şarkı en iyi sonucu verir.",
          "MIDI içe aktar — en tiz partisyon melodi olur, diğer kanallar eşlik ve akorlar olur, ton kendiliğinden bulunur. Vokal melodiyi ayrı bir izde tutun.",
          "Piyano — bir süre seçin ve tuşlara basın (aşağıda, rulonun solunda ya da bir MIDI klavyede): notalar peş peşe gelir.",
          "Bir parçadan: bir varyantın menüsünde MIDI’ye, ya da kütüphanede Stem’ler ve notalar sekmesi, sonra YuE2 partisyonuna. Vokal melodi, bas ve diğerleri eşlik olur."
        ],
        "sourcesTitle": "Melodi nereden gelir",
        "tips": [
          "Hece başına bir nota: 8 heceli bir satır yaklaşık 8 nota ister.",
          "Şarkı notalar kadar uzun olur: 100 BPM’de 4/4’lük 8 ölçü yaklaşık 20 saniyedir.",
          "Melodiyi izle: model melodinizi korur ve eşliği uydurur; Melodi ve akorlar: ikisini de partisyondan kurar.",
          "Stildeki ton ya da tempo bir şey yapmaz: onlar notalardan gelir.",
          "ABC metnini yalnızca biçimi biliyorsanız elle düzenleyin: model en iyi uygulamanın yazdığı düzeni okur (Vocal ve Ins sesleri)."
        ],
        "tipsTitle": "Yakın bir sonuç için",
        "title": "Melodi ve ABC partisyonu"
      },
      "style": {
        "tips": [
          "En uygunu 5–8 etikettir — fazlası çelişmeye başlar, azı sonucu daha az öngörülebilir yapar.",
          "Etiketleri İngilizce yazın ama şarkının diliyle başlayın (Russian, English, Spanish…): motorun kendi örneklerinin hepsi böyle yapar ve fikir akışları bunu sizin için ekler.",
          "Bir melodi planıyla (Melodiyi izle ya da Melodi ve akorlar) stil yine de önemlidir: tınıyı ve aranjmanı belirler, melodi ise ABC partisyonundan gelir."
        ]
      },
      "lyrics": {
        "tips": [
          "Bir melodi planıyla satırların ritmi kabaca ABC partisyonuyla (ölçü başına hece) eşleşmelidir; yoksa model sözcükleri melodiye uydurmak için uzatmak ya da sıkıştırmak zorunda kalır.",
          "Kısa satırlar melodiye uzunlardan daha öngörülebilir oturur.",
          "Chorus’u her [Chorus]’ta kelimesi kelimesine tekrarlayın — bu, parça boyunca ona aynı melodik çizgiyi korutur."
        ]
      },
      "cot": {
        "title": "Melodi planı",
        "intro": "Melodi planı, modelin sesten önce bir müzikal plan yazıp yazmayacağını ve Melodi sekmesindeki ABC partisyonunu nasıl kullanacağını belirler.",
        "melodyNote": "Melodiyi planın altındaki ABC partisyonunda verin: Bir şarkıdan… (SheetSage2), bir MIDI dosyası ya da piyano. Partisyon yoksa model yalnızca melodiden oluşan kendi planını yazar.",
        "precisionNote": "Model hassasiyetinin (q8_0, q4_0, bf16) plana bir ilgisi yoktur: onu Şarkı sekmesindeki Kalite belirler. q4_0, plan ne olursa olsun, kaliteden küçük bir ödünle video belleğinden tasarruf sağlar.",
        "abcFooter": "En kolayı ABC’yi sıfırdan yazmak değil, Bir şarkıdan… (SheetSage2) ile bir şarkıdan almak, sonra gereken ölçüleri elle rötuşlamaktır."
      }
    },
    "length": {
      "auto": "Oto",
      "autoHint": "Söz metni ne kadar sürerse o kadar, yaklaşık 6 dakikaya kadar.",
      "hint": "Yaklaşık {n} dk: daha kısa bir söz metni o süreye kadar söylenir ve çalınır, daha uzunu orada kesilir.",
      "label": "Süre",
      "minutes": "{n} dk",
      "ownHint": "İnce ayarda elle ayarlanır (Min / Maks token)."
    },
    "lines": "Satır: {n}",
    "linesAbout": "Satır: {n}, yaklaşık {time}",
    "linesAboutHint": "Önceki şarkılarınıza göre bir tahmin: satır başına yaklaşık {s} sn. Oto süre için.",
    "manual": {
      "abcGiven": "Melodi sekmesindeki partisyon",
      "changed": "{total} içinden {n} değişti",
      "console": "Konsol: tüm gruplar birden",
      "consoleTitle": "YuE2 konsolu",
      "done": "Bitti",
      "groups": {
        "character": {
          "sub": "vokal ve müzik",
          "title": "Karakter"
        },
        "length": {
          "sub": "saniyede 25 token",
          "title": "Süre"
        },
        "repeats": {
          "sub": "döngüye karşı",
          "title": "Tekrarlar"
        },
        "score": {
          "sub": "modelin melodi planını nasıl yazdığı",
          "title": "Partisyon"
        },
        "sound": {
          "sub": "model ve çözme",
          "title": "Ses"
        }
      },
      "manual": "Manuel",
      "params": {
        "cfg": "Stile yakınlık",
        "max_tokens": "Şundan uzun olmasın",
        "min_tokens": "Şundan kısa olmasın",
        "penalty_window": "Tekrar belleği",
        "precision": "Model hassasiyeti",
        "repetition_penalty": "Tekrar cezası",
        "steps": "Çözme adımları",
        "temperature": "Cesaret",
        "top_k": "Adaylar",
        "top_p": "Nadir seçim eşiği"
      },
      "reset": "Sıfırla",
      "resetAll": "Tümünü sıfırla",
      "seconds": "{n} sn",
      "seedRandom": "rastgele",
      "sends": "Motora gider",
      "sendsRest": "Elle ayarlanan değerler işaretlidir. Satırda olmayan her şey motorun varsayılanına bırakılır.",
      "simple": "Basit"
    },
    "perf": {
      "manualNow": "(şu an elle ayarlı)",
      "repeats": {
        "hint": "Daha az, bir cümle dönüp dururken.",
        "label": "Tekrarlar",
        "options": {
          "fewer": "Daha az",
          "normal": "Normal"
        }
      },
      "score": {
        "hint": "Daha dikkatli, melodi dağılırken: model partisyonu daha temkinli yazar.",
        "label": "Partisyon",
        "options": {
          "careful": "Daha dikkatli",
          "normal": "Normal"
        }
      },
      "temperature": {
        "hint": "Daha dengeli: daha az yanlış nota ve seste çatlama. Daha cesur: varyantlar birbirinden daha çok ayrılır.",
        "label": "Şarkı söyleme",
        "options": {
          "normal": "Normal",
          "steady": "Daha dengeli",
          "varied": "Daha cesur"
        }
      }
    },
    "planLabel": "Melodi planı",
    "planNames": {
      "full": "Melodi ve akorlar",
      "melody": "Melodiyi izle",
      "off": "Plan yok"
    },
    "qualityHints": {
      "draft": "{model} modeli daha az video belleği alır, ses biraz sadedir: fikir denemek için.",
      "final": "{model} modeli, 32 çözme adımı ve stil etiketlerine daha yakın (CFG 1.2): bitmiş bir parça için. 2–3 varyant yapın, en iyisini tutun. bf16, q8_0’dan daha fazla video belleği ister (dosyası 4.3 GB’a karşı 7.3 GB).",
      "normal": "{model} modeli olağan ayarlarla: beklemeden iyi ses.",
      "own": "Hassasiyet, adım ve CFG elle."
    },
    "qualityLabel": "Kalite",
    "qualityNames": {
      "draft": "Taslak",
      "final": "Final",
      "normal": "Normal",
      "own": "Kendi"
    },
    "queued": "Sırada, varyant: {n}",
    "scoreGivenNote": "Verilen partisyon planın yerine geçer; bu yüzden partisyon örneklemesi bir şey yapmaz ve gönderilmez.",
    "sections": {
      "bridge": "+ Bridge",
      "chorus": "+ Chorus",
      "outro": "+ Outro",
      "verse": "+ Verse"
    },
    "tabs": {
      "changed": "Varsayılanlardan değişti",
      "melody": "Melodi",
      "song": "Şarkı",
      "tuning": "İnce ayar"
    },
    "takes": "Varyant",
    "tuningTitle": "Performans ayarları"
  },
  "acePage": {
    "openTrainingPage": "LoRA eğitimini aç"
  },
  "library": {
    "noTracks": "Kütüphanede henüz parça yok. Yukarıdan bir dosya yükleyin ya da Oluştur’da bir parça yapın."
  },
  "notInstalled": {
    "stableAudio": {
      "text": "Stable Audio 3 enstrümantaller ve ses efektleri yapar ve editörün yeniden boyama, devam ettirme ve cover işlevlerini çalıştırır. Kurulumda dışarıda bırakıldı. Kurulduktan sonra Modeller ve ayarlar’dan ya da doğrudan Stable Audio’nun formundan bir model indirin."
    }
  },
  "idea": {
    "guide": {
      "lead": "Tek cümle girer, bir parça çıkar, doğrudan ana sayfada. Bir şarkıyı, enstrümantali ya da sesi kendi sözlerinizle tarif edersiniz, yerel bir dil modeli seçilen motorun biçiminde prompt’u yazar, isterseniz düzenlersiniz ve motor parçayı yapar.",
      "steps": [
        {
          "title": "Fikri tarif edin",
          "text": "Bir iki cümle: şarkı neyi anlatıyor, ruh hali, kim söylüyor, nerede ve ne zaman. Bir enstrümantal için: tür, enstrümanlar ve ruh hali."
        },
        {
          "title": "Türü ve motoru seçin",
          "text": "Vokalli şarkı, enstrümantal ya da ses; sonra ACE-Step, YuE2 veya Stable Audio 3. O türü yapmayan bir motor seçilemez; ses her zaman Stable Audio’nundur."
        },
        {
          "title": "Besteleyin",
          "text": "Besteyle’ye basın: asistan prompt’u doğrudan cümlenin altına yazar ve büyüdükçe aşamayı, yüzdeyi ve metni gösterir. Durdurabilirsiniz. Ses bu adımı atlar: Besteyle, Stable Audio’nun formunu cümleyle açar."
        },
        {
          "title": "Prompt’u düzenleyin",
          "text": "Etiketler, söz metni, tempo, ton ve süre doğrudan alanlarda değiştirilebilir."
        },
        {
          "title": "Üretin",
          "text": "Üret, varyantları sırası gelince motoru başlatan motorun kuyruğuna koyar ve Oluştur’u açar: varyantlar oturum listesinde, fikre göre adlandırılmış olarak görünür."
        }
      ],
      "writer": [
        "Prompt asistanı yerel bir dil modelidir, Qwen3.5. Fikre sadık kalır ve söz metnini fikrin dilinde ya da seçtiğiniz dilde yazar. Modelini Modeller sayfasından indirirsiniz.",
        "ACE-Step için, motor çalışırken ACE-Step’in kendi dil modeli de prompt’u yazabilir. Daha hızlıdır, genelde 5–20 sn, ama fikirden daha sık sapar.",
        "Söz metni dili varsayılan olarak fikrin harflerinden alınır; Daha fazla altından seçebilirsiniz, prompt’u kimin yazacağını da. Oluştur sayfasında fikir satırının Ayarlar’ının altındadır."
      ],
      "after": [
        "Başka bir varyant, prompt’u aynı fikirden yeniden yazar.",
        "Formda aç, prompt’u Oluştur sayfasındaki motorun formuna tüm ayarlarıyla yerleştirir.",
        "Fikir ve prompt, sayfadan ayrıldığınızda ya da sayfayı yenilediğinizde kalır. Üret’ten sonra bir sonraki fikir için temizlenir; Sıfırla bunları elle temizler.",
        "Oluştur sayfasında aynı fikir formun üstündeki fikir satırındadır: Yaz söz metnini ve stili doğrudan forma koyar (Stable Audio için Tarif et), Önceki hâli geri getir ise formu geri yükler."
      ],
      "tips": [
        "Somut ayrıntılar genel sözcüklerden iyidir: “küçük bir kasabadan çıkan gece treni”, “hüzünlü bir şarkı”dan daha fazlasını verir.",
        "Belirli bir tür, ses ya da enstrüman mı istiyorsunuz? Bunları fikirde adlandırın.",
        "Üretmeden önce söz metnini okuyun: küçük bir model kafiyeyi ve ölçüyü her zaman tutturamaz.",
        "İstediğiniz ses bu değil mi? Aynı fikirde başka bir motor deneyin: prompt onun biçiminde yeniden yazılır.",
        "Yağmur, bir vuruş, ayak sesleri müzik değil sestir: Ses’i seçin, cümle doğrudan Stable Audio’nun formuna gider. Enstrümantal ve Stable Audio 3 ile asistan bir sesin istendiğini kendisi anlar; ACE-Step böyle bir fikirden bir parça yapar."
      ]
    }
  },
  "sa3Weights": {
    "allOnModels": "Her model, base checkpoint’ler ve ayarlar Modeller sayfasında"
  },
  "autoTitle": {
    "accept": "Kullan",
    "another": "Başka biri",
    "bulk": "Başlık öner",
    "bulkDone": "{n} parça adlandırıldı | {n} parça adlandırıldı",
    "bulkFailed": "{n} adlandırıldı, sonra durdu: {error} | {n} adlandırıldı, sonra durdu: {error}",
    "bulkHint": "Asistan seçili parçaları sırayla adlandırır; Geri al eski başlıkları geri getirir.",
    "bulkStopped": "Durduruldu: {total} içinden {n} adlandırıldı",
    "bulkUndone": "Eski başlık geri yüklendi | Eski başlıklar geri yüklendi: {n}",
    "cancel": "İptal",
    "failed": "Başlık düşünülemedi: {error}",
    "noAssistant": "İstem asistanı hazır değil: modelini Modeller bölümünden indirin.",
    "progress": "{total} içinden {done} adlandırılıyor",
    "stop": "Durdur",
    "suggest": "Başlık öner",
    "working": "Başlık düşünülüyor…"
  },
  "covers": {
    "alt": "{title} kapağı",
    "another": "Başka bir kapak",
    "bulk": "Kapak yap",
    "bulkDone": "{n} kapak yapıldı | {n} kapak yapıldı",
    "bulkFailed": "{n} tanesi olmadı",
    "bulkHint": "Seçili her parça için sırayla bir kapak; kapağı olan parça yenisini alır.",
    "bulkProgress": "Kapaklar: {total} içinden {done}",
    "cancel": "İptal",
    "describe": "Resim neyi gösteriyor",
    "describeHint": "Birkaç kelimelik bir sahne; en iyisi İngilizce. Resimdeki yazıdan kendiliğinden kaçınılır.",
    "dismiss": "Kapat",
    "edit": "Açıklamayı düzenle…",
    "enable": "Parçalar için albüm kapağı yap",
    "enableHint": "Kitaplıktaki, oynatıcıdaki ve oturumdaki her şarkıya bir resim ekler. Kapalıysa: hiçbir yerde kapak ve kapak düğmesi olmaz.",
    "engine": "Kapaklar (Z-Image Turbo)",
    "failed": "Kapak olmadı: {error}",
    "fromAssistant": "Asistanın bu parça için fikrinden.",
    "installed": "yüklü",
    "loadingPrompt": "Açıklama okunuyor…",
    "make": "Kapak yap",
    "making": "Kapak yapılıyor…",
    "makingPct": "Kapak yapılıyor… %{pct}",
    "model": "Model: Z-Image Turbo, {gb} GB",
    "notInstalled": "yüklü değil",
    "notInstalledHint": "Kapak modeli bu bilgisayarda yok. Yükleyiciyle (Kapaklar bölümü) veya kurulum betiğiyle yükleyin.",
    "onButton": "Kapak yalnızca bir düğmeye bastığınızda yapılır: kitaplıkta parçanın ayrıntılarında ya da seçili parçalar için. Her biri 5 ila 10 saniye sürer; bu sürede GPU kapak modeline geçer ve sonraki şarkı motorunu yeniden yükler.",
    "parts": {
      "main": "Z-Image Turbo ağırlıkları",
      "server": "Görsel sunucusu (stable-diffusion.cpp)"
    },
    "queued": "Sırada bekliyor…",
    "remove": "Kapağı kaldır",
    "removeConfirm": "Evet, kaldır",
    "stop": "Durdur",
    "title": "Kapaklar",
    "draw": "Çiz",
    "withAssistant": "Asistanla yap",
    "withAssistantHint": "Prompt asistanı metninizden (herhangi bir dilde) ya da alan boşsa şarkıdan bir açıklama yazar; çizmeden önce düzenleyebilirsiniz.",
    "putBack": "Geri al",
    "anyLanguageHint": "Herhangi bir dilde yazın: asistan bunu görsel modelinin anladığı bir açıklamaya çevirir.",
    "fromSaved": "Son kapağın çizildiği açıklama.",
    "noAssistant": "Prompt asistanı hazır değil: modelini Modeller bölümünden indirin.",
    "describing": "Görsel tarif ediliyor…",
    "describingPct": "Görsel tarif ediliyor… %{pct}",
    "describeFailed": "Asistan görseli tarif edemedi: {error}",
    "bulkDescribing": "Tarif ediliyor: {done} / {total}",
    "starting": "Görsel modeli başlatılıyor…"
  },
  "takeCompare": {
    "best": "★ En iyi",
    "failed": "Yüklenemedi",
    "keep": "En iyisini tut, diğerlerini çöp kutusuna taşı",
    "keepConfirm": "{n} varyant çöp kutusuna taşınsın mı? | {n} varyant çöp kutusuna taşınsın mı?",
    "keepNeedStar": "Tutmak için en iyi varyanta yıldız verin.",
    "keepTooMany": "Yalnızca bir varyanta yıldız verin: tutulacak olana.",
    "keepWill": "{take} tutulur; diğeri çöp kutusuna gider. | {take} tutulur; diğer {n} çöp kutusuna gider.",
    "kept": "{take} tutuldu; {n} varyant çöp kutusuna taşındı. | {take} tutuldu; {n} varyant çöp kutusuna taşındı.",
    "keys": "1–4 varyant seç · Boşluk oynat/duraklat · ←/→ 5 sn · Esc kapat",
    "loading": "Yükleniyor…",
    "loadingAll": "varyantlar yükleniyor…",
    "newestOf": "{total} varyanttan en yeni {shown}",
    "nowHearing": "Şimdi çalıyor: {take}",
    "open": "Karşılaştır",
    "openTitle": "Bu şarkının varyantlarını karşılaştır, A/B",
    "position": "{total} içinden {at}",
    "restored": "{n} varyant geri yüklendi | {n} varyant geri yüklendi",
    "seed": "seed {seed}",
    "seek": "Konum",
    "takes": "Varyantlar",
    "tileLabel": "{letter}, varyant {n}",
    "title": "Varyantları karşılaştır"
  }
}
