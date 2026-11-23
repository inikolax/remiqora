// Notes workspace and help, and the strings added or reworded after part12 (machine-translated from en); merged last, key by key.
export default {
  "aceGen": {
    "closeness": "Orijinale ne kadar yakın",
    "closenessHigh": "Daha özgür",
    "closenessHint": "Solda sonuç kaynağın melodisini ve aranjmanını korur; sağda model daha çok değiştirir.",
    "closenessLow": "Orijinale daha yakın",
    "loraSimple": "LoRA",
    "loraTrain": "Kendininkini eğit",
    "modelDefault": "{name} (varsayılan)",
    "refChoose": "Bir dosya seç",
    "refDrop": "Sesi buraya bırak veya kütüphaneden seç",
    "refFromLibrary": "Kütüphaneden",
    "refLoading": "Parça yükleniyor…",
    "refNeeded": "Buradan bir parça seç veya yeni bir şarkı için Şarkı sekmesine dön.",
    "refOff": "Hazır bir parça al: cover, yeniden yapılan bir aralık, çıkarılan ya da eklenen bir parti. Parça olmadan form yeni bir şarkı yapar.",
    "refRemove": "Kaldır"
  },
  "aiPart": {
    "guide": {
      "hears": [
        "İşaretli izler tek bir stereo ize karıştırılır: iz seviyeleri, fade’ler ve tempo uydurmasıyla (W), ama efektsiz ve M ile S düğmeleri yok sayılarak.",
        "Tempo kliplerden değil, proje BPM alanından gelir: onu malzemeye uyacak şekilde ayarla. Ton “Ton”dan gelir; “Otomatik”te model onu kendisi bulur.",
        "ACE-Step yalnızca majör ve minör bilir. Başka her gam için model en yakın tonu ve gamın adını açıklamada alır: bir ipucu, garanti değil.",
        "Seçim bekleyen varyantları olan izler sunulmaz: bunlar taslaktır.",
        "Model 10 dakikadan uzun bir aralığı almaz: daha kısa bir parça seç."
      ],
      "limits": [
        "“Parti ekle” yalnızca ACE-Step base modelinde çalışır (yaklaşık 4,8 GB). Masaüstü uygulamasında kurulumda bir seçenektir; atlandıysa aranjör bir Kur düğmesi gösterir. Betiklerle setup_models bunun komutunu sonunda yazdırır.",
        "base, turbo’dan yavaştır: RTX 4080’de 2-3 dakikalık bir parça için bir varyant yaklaşık 10 saniye sürer ve model yüklenirken ilk çalıştırma daha uzun sürer.",
        "Model, duyduğunun tonunu ve akorlarını ritmik fikirlerden daha iyi korur: “vokalin boşluklarında çalar” çıkmayabilir.",
        "Ses kalitesi modelin verdiği kadardır. MIDI’den sese yok: model yalnızca sesle çalışır.",
        "xl-base kuruluysa model listesinde görünür; 16 GB’lık bir kartta neredeyse bütün video belleğini alır. Parti eklemek için base kullan: ölçümlerde xl-base beş varyantın yaklaşık birinde gürültü döndürdü, base yirmi beşte birinde.",
        "Gürültüyü elemek zaman alır: bir varyant elenince istek yeniden gönderilir ve üretim uzar. Davul, perkisyon ve efektler denetlenmez: doğaları gereği gürültü benzeridir."
      ],
      "variants": [
        {
          "term": "Dinle",
          "text": "bu varyanta geçer, diğerlerini susturur ve aralığın başından çalar."
        },
        {
          "term": "Tut",
          "text": "varyantı tutar ve diğerlerini kaldırır. Yeniden boyama, devam ettirme veya cover için tutulan varyant aralıkta orijinalin yerini alır."
        },
        {
          "term": "Hepsini kaldır",
          "text": "bütün varyantları kaldırır ve izleri eskisi gibi geri koyar."
        },
        {
          "term": "Bağlam kopyası",
          "text": "modelin yeni bir parti yerine duyduğu miksi neredeyse aynen döndürdüğü bir varyantı işaretler. Yeniden üret."
        },
        {
          "term": "Gürültü",
          "text": "modelin parti yerine tıslama döndürdüğü bir varyantı işaretler. Aranjör bu tür varyantları kendisi eler ve yenilerini ister, en çok iki kez; işaret yalnızca denemelerden sonra gelenlerde kalır."
        },
        {
          "term": "Ctrl+Z",
          "text": "hem varyantların eklenmesini hem de seçimi geri alır. Atılan varyantların dosyaları kütüphaneden yalnızca proje kaydedilince ve hiçbir klip kullanmıyorsa kalkar."
        }
      ]
    }
  },
  "covers": {
    "after": {
      "hintSa": "Üretimden sonra: tüm varyantlar için tek kapak. GPU’yu yaklaşık 30 sn daha alır."
    },
    "studio": {
      "errChanged": "Kapak bu arada yeniden yapıldı. Bir kez daha kaydet.",
      "errLoad": "Kapak resmi yüklenemedi. Yeniden dene.",
      "errNoCover": "Bu parçanın yazının konacağı bir kapağı yok.",
      "errSave": "Yazı kaydedilemedi. Yeniden dene."
    }
  },
  "create": {
    "failed": "Olmadı. Bu ayarları yeniden kullan’a bas, sonra yine Oluştur’a.",
    "madeAt": "{time}’de",
    "menu": {
      "midi": "Notalardan MIDI’ye"
    },
    "notes": {
      "cardTitle": "Notalar",
      "draw": "Çiz",
      "drawNote": "“Çiz”, sağda Notalar’ı sözlerden bir iskeletle açar: [Verse], [Chorus] etiketlerinden bölümler, ölçü başına bir yer tutucu akor.",
      "emptyLead": "Notasız YuE2 melodiyi kendisi yazar. Notalarla seninkini söyler.",
      "emptyTitle": "Henüz nota yok",
      "fromSong": "Bir şarkıdan",
      "fromSongDots": "Bir şarkıdan…",
      "hasScore": "formda bir partisyon var",
      "importMidi": "MIDI içe aktar",
      "open": "Notaları aç",
      "openHere": "Notalar sağda açık.",
      "openNote": "Notalardaki düzenlemeler doğrudan forma gider — “{button}”a bas, YuE2 onları alır.",
      "openSection": "Bu bölümü Notalar’da aç",
      "openTakeTip": "Bu varyantın partisyonu Notalar çalışma alanında — dinle, karşılaştır, düzenle, istersen sonra forma al",
      "rail": "Notalar",
      "railTip": "YuE2 notaları — sağdaki partisyon editörü, Oturum’un yerine",
      "remarks": "{n} kontrol uyarısı: {list} | {n} kontrol uyarısı: {list}",
      "takeTitle": "{title} · Varyant {n}"
    },
    "rail": {
      "ace_step": "ACE",
      "generate": "Üret",
      "lora": "LoRA",
      "models": "Modeller",
      "stable_audio": "Ses",
      "yue2": "YuE2"
    },
    "reuse": "Bu ayarları yeniden kullan",
    "reuseInForm": "Bu ayarları yeniden kullan"
  },
  "editor": {
    "clipInTrash": "Parça çöp kutusunda",
    "clipInTrashHint": "Bu klibin parçası kütüphanenin çöp kutusunda: hâlâ çalar, ama çöp kutusu onu 30 gün sonra kalıcı olarak siler.",
    "guide": {
      "clip": [
        "Sürüklemek bir klibi taşır, kenarları onu kırpar. Kırparken dalga biçimi sıkıştırılmaz: kalan sesi tam olarak görürsün. Kaynak dosya asla değişmez.",
        "Bir klipteki düğmeler dalga biçiminin üstünde durur ve üzerine gelince ya da klip seçiliyken görünür; açık olanlar her zaman görünür. M klibi susturur, S yalnızca onu duyulur bırakır, W onu proje temposuna uydurur, çarpı onu siler.",
        "Kenar tutamaçları fade’leri ayarlar. Onlar olmadan her kenar, bir kesik tıklamasın diye 15 ms’lik bir mikro fade alır.",
        "Transporttaki araçlar: Seç (V) klipleri taşır ve kırpar, Bıçak (C) klibi tıkladığın yerden keser, Silgi (E) üzerinden sürüklediğin parçayı veya tıklayınca bütün klibi siler. Bıçak ve Silgi ızgaraya ve klip kenarlarına yapışır; Esc Seç’e geri döndürür.",
        "S, seçili klibi oynatma kafasında keser veya hiçbir şey seçili değilse oynatma kafasının altındaki her klibi keser. Ctrl+D kliptan hemen sonra bir kopya koyar.",
        "Klipler yarı saydamdır: zaman çizelgesinin ızgarası içlerinden görünür."
      ],
      "lane": [
        "Bir izi doğrudan başlığında yeniden adlandır. M onu susturur, S yalnızca onu duyulur bırakır.",
        "Renk: izi seç ve iz listesinin üstündeki bir noktaya tıkla.",
        "Bütün bir şarkıyı çalan bir iz, M ve S’nin yanındaki düğmeyle stem’lere ayrılabilir: vokal, davul, bas ve diğer onun yerini alır.",
        "Çarpı izi kaldırır; Ctrl+Z onu geri getirir.",
        "İz yüksekliği transporttaki oklu kaydırıcıyla veya Alt ve fare tekerleğiyle ayarlanır: iz ne kadar yüksekse dalga biçimi o kadar büyüktür. Bütün izler için tek yükseklik."
      ],
      "steps": [
        {
          "title": "İz ekle",
          "text": "“İz” düğmesi kütüphaneyi açar: bir parçayı bütün olarak veya stem’ler halinde ekle. Bilgisayarından bir dosya doğrudan bir ize bırakılabilir."
        },
        {
          "title": "Klipleri diz",
          "text": "Klipleri sürükle ve kenarlarından kırp. Bıçak (C) klibi tıkladığın yerden keser, Silgi (E) üzerinden sürüklediğin parçayı siler. Fade’ler klip kenarlarındaki tutamaçlardan çekilir."
        },
        {
          "title": "Tempoyu uydur",
          "text": "BPM alanı proje temposunu ayarlar, bir klipteki W düğmesi onu bu tempoya uydurur. “Mıknatıs” ızgaraya yapışmayı açar ve “0:00 | 1 | 2” anahtarı cetvelin ve ızgaranın neyi saydığını seçer: saniyeleri veya ölçüleri."
        },
        {
          "title": "Mikle",
          "text": "İz seviyesi ve panorama, her izde ve masterda sekiz efekt. “Mikser” düğmesi mikseri gösterir."
        },
        {
          "title": "Kaydet",
          "text": "Otomatik kaydetme yok: “Kaydet” veya Ctrl+S. Kaydedilmemiş değişikliklerle sayfadan ayrılırsan editör seni uyarır."
        },
        {
          "title": "Dışa aktar",
          "text": "Kütüphaneye WAV veya MP3, ya da kendi DAW’ında bitirmek için bir Reaper projesi veya DAWproject’li stem’ler."
        }
      ],
      "tempo": [
        "Bir klibin tempo değeri, eklenirken ilk 30 saniyesinden bulunur. Algılayıcı basittir ve karmaşık malzemede yanılabilir.",
        "W klibi perdesini değiştirmeden proje BPM’ine uzatır.",
        "Klipler diğer kliplerin kenarlarına ve zaman çizelgesinin başına yapışır. “Mıknatıs” ızgaraya yapışmayı ekler. “0:00 | 1 | 2” anahtarı ızgaranın ve cetvelin neyi saydığını seçer: saniyeleri veya proje BPM’inin (4/4) ölçülerini ve vuruşlarını. Izgara adımı yakınlaştırmayı izler; cetvel işaretlerindeki çizgiler daha parlaktır.",
        "“Döngü” cetveldeki bölgeyi tekrarlar: bütününü taşı veya kenarlarını sürükle. Aynı bölge yapay zeka aranjörü için seçimdir. Aramak için cetvele tıkla."
      ]
    },
    "help": {
      "title": "Editör yardımı"
    },
    "hotkeys": {
      "keys": [
        {
          "keys": "Space",
          "action": "Çal ve duraklat"
        },
        {
          "keys": "S",
          "action": "Bir klibi oynatma kafasında kes"
        },
        {
          "keys": "V / C / E",
          "action": "Araç: seç, bıçak, silgi"
        },
        {
          "keys": "Del",
          "action": "Seçili klibi sil"
        },
        {
          "keys": "Ctrl+D",
          "action": "Seçili klibi çoğalt"
        },
        {
          "keys": "Ctrl+Z",
          "action": "Geri al, 30 adıma kadar"
        },
        {
          "keys": "Ctrl+Y / Ctrl+Shift+Z",
          "action": "Yinele"
        },
        {
          "keys": "Ctrl+S",
          "action": "Projeyi kaydet"
        },
        {
          "keys": "Esc",
          "action": "Seçimi temizle ve Seç aracına dön"
        },
        {
          "keys": "← →",
          "action": "Oynatma kafası bir ızgara adımı, Shift ile dört"
        },
        {
          "keys": "Home / End",
          "action": "Başa veya sona"
        },
        {
          "keys": "+ / −",
          "action": "Yakınlaştır"
        },
        {
          "keys": "Tab",
          "action": "Sonraki klip, iz veya tutamaç"
        }
      ],
      "mouse": [
        {
          "keys": "Ctrl+tekerlek",
          "action": "Yakınlaştır"
        },
        {
          "keys": "Alt+tekerlek",
          "action": "İz yüksekliği"
        },
        {
          "keys": "Bıçak tıklaması",
          "action": "Klibi o noktada kes"
        },
        {
          "keys": "Silgi sürüklemesi",
          "action": "Klibin o parçasını sil; tıklama bütün klibi siler"
        },
        {
          "keys": "Shift+sürükle",
          "action": "Zaman çizelgesini kaydır; orta düğme de çalışır"
        },
        {
          "keys": "Cetvele tıkla",
          "action": "Ara"
        },
        {
          "keys": "Bir ize dosya",
          "action": "Bilgisayarından o noktaya bir klip ekle"
        }
      ]
    },
    "restoreFromTrash": "Çöp kutusundan geri yükle",
    "trashedSources": "Bir klip çöp kutusundaki bir parçayı çalıyor: {names}. Çöp kutusu onu 30 gün sonra kalıcı olarak siler. | {n} klip çöp kutusundaki parçaları çalıyor: {names}. Çöp kutusu onları 30 gün sonra kalıcı olarak siler."
  },
  "footer": {
    "muscriptorNote": "Bir parçayı veya stem’i MIDI’ye çevirir. Ağırlıklar yalnızca ticari olmayan kullanım içindir; model kartına bak.",
    "qwenNote": "Prompt asistanı: prompt’u, başlıkları ve kapak açıklamalarını bir fikirden yazar.",
    "sa3Note": "Enstrümantaller ve ses efektleri. Yıllık geliri 1 milyon USD’nin altında kişisel ve ticari kullanım için ücretsiz; bunun üstünde kurumsal lisans gerekir.",
    "sdcppNote": "Kapak modelini çalıştırır.",
    "sheetsageNote": "Bir parçanın melodisini partisyon olarak yazar (Notalar, “Bir şarkıdan…”). Ağırlıklar yalnızca ticari olmayan kullanım içindir; model kartına bak.",
    "zimageNote": "Kapakları çizer. Metin kodlayıcısı Qwen3-4B-Instruct de Apache-2.0’dır."
  },
  "header": {
    "guide": {
      "map": {
        "ace": "Bir açıklamadan, etiketlerden ve sözlerden hızlı şarkılar ve enstrümantaller; bir referans parçayla ayrıca cover, yeniden boyanan bir bölüm, eklenen veya çıkarılan bir parti, devam.",
        "sa3": "Bir açıklamadan hızlıca enstrümantaller ve ses efektleri. Editörün yapay zeka aranjöründe aralığın çevresindeki sesi dinleyerek yeniden boyar, devam ettirir ve cover yapar.",
        "yue": "Vokalli bütün bir şarkı yazar ve onu verilen bir melodinin etrafında kurabilir (Melodi sekmesi ve Notalar çalışma alanı, SheetSage2 ile). Ayrıca bir parçayı MIDI’ye çevirir."
      },
      "steps": [
        {
          "title": "Bir motor seç",
          "text": "Üret’e git: motorlar solda, YuE2, ACE-Step ve Stable Audio. Vokalli ilk şarkı için YuE2’yi al. Oluştur’a ilk basışta başlar; ilk başlatma birkaç dakika sürer."
        },
        {
          "title": "Şarkıyı tarif et",
          "text": "Şarkı sekmesinde sözleri ve stili yaz, ya da fikri formun üstündeki satıra tek cümleyle yaz, asistan alanları doldursun. Süreyi ve kaç varyant olacağını seç."
        },
        {
          "title": "En iyi varyantı seç",
          "text": "Varyantlar formun yanındaki oturum listesinde sıralanır (telefonda altında). Yapılan her şey kendiliğinden kütüphaneye kaydedilir."
        },
        {
          "title": "Stem’lere ayır",
          "text": "Vokal, davul, bas ve diğer tek tıkla: bir varyantın menüsünde Stem’lere ayır, kütüphanede Stem’ler ve notalar sekmesi veya doğrudan editörde."
        },
        {
          "title": "Editörde kur",
          "text": "Stem’leri izlere diz, yapay zeka aranjörüyle partiler ekle, efektleri ayarla."
        },
        {
          "title": "Dışa aktar",
          "text": "WAV veya MP3’e miksle, ya da izleri bir Reaper projesi veya DAWproject ile dışa aktar."
        }
      ],
      "tips": [
        "Bir stili nasıl tarif edeceğinden emin değil misin? Ana sayfadan başla: müziği bir cümleyle tarif et, asistan prompt’u yazar ve sen düzenlersin.",
        "Yakın ama tam değil mi? Tek bir bölümü yeniden boyamak çoğu zaman yeniden üretmekten hızlıdır.",
        "Bir cover veya yeni bir parti için referans parça doğrudan kütüphaneden gelebilir.",
        "Her bölümün kendi yardım düğmesi var; editörün ayrıca ayrı bir kısayol sayfası da var.",
        "Editör otomatik kaydetmez: sayfadan ayrılmadan önce Kaydet’e bas; unutursan editör sorar."
      ]
    },
    "helpSections": {
      "covers": {
        "text": "Kapak bu bilgisayarda Z-Image Turbo modeliyle çizilir. Formun altında Kapak yap’ı işaretle; şarkıdan sonra tüm varyantlar için tek kapak gelir; ya da sonra kütüphanede parçanın kartındaki düğmeyle yap, seçili birkaç parça için de aynı anda. Kapağı tasarla, resmin açıklamasını değiştirir ve başlığıyla bir yazı ekler. Kapak modeli ayrıca kurulur: bkz. Modeller ve ayarlar.",
        "title": "Kapaklar"
      },
      "downloads": {
        "text": "Bir parça MP3 (320 kbit/s, kapak ve etiketlerle, her yerde çalar), FLAC (kayıpsız, kapak ve etiketlerle) veya WAV (bir DAW için kaynak, kapaksız) olarak iner. Biçimi bir varyantın veya parçanın İndir menüsünden seç, hatırlanır; Modeller ve ayarlar, Genel’de de ayarlanabilir. Sanatçı adı etiketlere yazılır.",
        "title": "İndirme biçimleri"
      },
      "engines": {
        "text": "Üç motor ses üretir, YuE2-3B, ACE-Step 1.5 ve Stable Audio 3, ve bir GPU’ya birlikte sığmazlar, bu yüzden aynı anda biri çalışır. Üret sayfasında bir motor seç: Oluştur’a bastığında başlar ve çalışan kendiliğinden durur. Işık durumunu gösterir; model video belleğine yüklenirken ilk başlatma birkaç dakika sürebilir. Üstbilgideki durum düğmesi GPU’yu neyin tuttuğunu gösterir ve onu boşaltabilir."
      },
      "library": {
        "text": "Her parça, ister üretilmiş, ister yüklenmiş, ister editörden dışa aktarılmış olsun, her modülün kullanabildiği tek bir ortak kütüphaneye girer; böylece herhangi bir motorla yapılmış bir parça uygulamadan çıkmadan stem’lere ayrılabilir, notaya dökülebilir ve mikslenebilir."
      },
      "notes": {
        "more": "Notalar hakkında daha fazlası",
        "text": "Notalar YuE2’nin çalışma alanıdır: Üret çubuğunda YuE2’nin altındaki Notalar düğmesi. Şarkının melodisini partisyon olarak gösterir ve düzenler; partisyon hazır bir parçadan (Bir şarkıdan…, SheetSage2) veya bir MIDI dosyasından gelebilir ve YuE2’nin formuna Melodi sekmesinden gider.",
        "title": "Notalar"
      },
      "trash": {
        "text": "Silinen parçalar kütüphanenin çöp kutusuna gider ve orada 30 gün kalır: oradan geri yükle veya kalıcı olarak sil. Birkaç parçayı aynı anda çöp kutusuna taşımak, etiketlemek, kapak yapmak veya adlandırmak için seç. Kütüphane etiketlere göre süzülür.",
        "title": "Çöp kutusu ve etiketler"
      }
    }
  },
  "home": {
    "allTracks": "Kütüphaneyi aç"
  },
  "idea": {
    "languageAutoIdea": "Otomatik (fikre göre)",
    "writer": "Sözleri ve stili kim yazar:",
    "writerAce": "ACE-Step’in kendisi"
  },
  "libraryPage": {
    "filters": {
      "midi": "MIDI",
      "score": "Notalar"
    },
    "filtersToggle": "Filtreler",
    "openEditor": "Editörde aç",
    "openEditorFailed": "Editörde açılamadı: {error}",
    "openEditorHint": "Bu parçanın bir izde olduğu yeni bir editör projesi",
    "promptTitle": "Parçanın kendi adı yok: sözlerinden bir satır gösteriliyor.",
    "score": {
      "download": ".abc indir",
      "failed": "Notalar yüklenemedi: {error}",
      "hint": "YuE2’nin bu parçayı söylediği ABC partisyonu",
      "open": "Notalar’da aç",
      "openHint": "Üret sayfasındaki Notalar’da partisyonun bir kopyası; formun notaları olduğu gibi kalır",
      "title": "Notalar"
    },
    "trash": {
      "loading": "Yükleniyor…"
    },
    "usage": {
      "bulk": "{n} parça editör projelerinde kullanılıyor: {names}. Çöp kutusunda hâlâ çalarlar, ama çöp kutusunu boşaltırsan projelerdeki klipleri kaybolur. Silinsin mi?",
      "more": " (ve {n} tane daha)",
      "purge": "Kalıcı olarak silinsin mi? Editör projelerinde kullanılıyor: {names}. Projelerdeki klipleri kaybolacak.",
      "single": "Parça “{name}” editör projesinde kullanılıyor{more}. Çöp kutusunda hâlâ çalar, ama çöp kutusunu boşaltırsan projedeki klip kaybolur. Silinsin mi?"
    },
    "yueLicence": "YuE2: ticari olmayan lisans (CC BY-NC 4.0)",
    "yueLicenceHint": "YuE2 şarkıları satılamaz veya ticari amaçla kullanılamaz. Ayrıntılar: Modeller ve lisanslar."
  },
  "midiPanel": {
    "recognize": "Notalardan MIDI’ye"
  },
  "models": {
    "general": {
      "artist": "Sanatçı adı",
      "artistHint": "İndirilen parçaların etiketlerine yazılır. Alt bilgideki ad ile aynı.",
      "artistSave": "Kaydet",
      "artistSaved": "Kaydedildi",
      "autoCover": "Şarkıdan sonra kapak yap",
      "autoCoverHint": "Motor formlarının altındaki Kapak yap kutusunun başlangıç değeri.",
      "autoCoverOff": "Kapaklar kapalı veya modelleri kurulu değil: bkz. Kapaklar.",
      "formatHint": "Oturumdaki ve kütüphanedeki İndir düğmelerinin biçimi. Bir indirme menüsünde seçilen biçim burada da hatırlanır.",
      "languageHint": "Üstbilgideki dil düğmesiyle aynı seçim.",
      "nav": "Genel",
      "title": "Genel ayarlar"
    },
    "showMore": "{n} tane daha, indirilmedi: {names} ▾"
  },
  "notesHelp": {
    "actions": {
      "checks": "Kontrolü göster",
      "draw": "“Sıfırdan çiz”i aç",
      "musicianOff": "Romen rakamlarını gizle",
      "musicianOn": "Romen rakamlarını göster",
      "simple": "Basit görünümü aç",
      "snapIsOn": "“Tonda” açık",
      "snapOn": "“Tonda”yı aç"
    },
    "fig": {
      "at": "tempo 95, 4/4",
      "barTime": "1 ölçü ≈ 2,5 sn",
      "beats": "4 vuruş: bir-iki-üç-dört",
      "brk": "ara",
      "chordsTitle": "Ölçülerin üstünde akorlar",
      "counter": "5 hece · 6 nota",
      "fourBars": "4 ölçü ≈ 10 sn",
      "higher": "daha tiz",
      "inKey": "tonun notaları",
      "ins": "Enstrüman",
      "intro": "intro",
      "longer": "uzun nota",
      "lower": "daha pes",
      "lyricsTags": "Sözlerdeki etiketler",
      "melisma": "uzatılan",
      "octaveNote": "erkek sesi, yazılı notaların bir oktav altından söyler",
      "offKey": "tonun dışında",
      "partsRibbon": "Notalardaki bölümler",
      "pause": "es",
      "picker": "Uyanlar",
      "shorter": "kısa",
      "sing": "ses söylüyor",
      "snapped": "buraya oturur",
      "sung": "söylenen",
      "syllables": [
        "Gü",
        "ne",
        "şim",
        "sen",
        "sin"
      ],
      "time": "zaman →",
      "vocal": "Vokal",
      "written": "yazılan"
    },
    "firstTime": "Notalarda yeni misin?",
    "open": "Notalar yardımı",
    "openTip": "Sade bir dille: melodi nasıl çizilir ve YuE2 onu nasıl söyler",
    "sections": {
      "checks": {
        "head": {
          "check": "Ne yazıyor",
          "fix": "Ne yapmalı",
          "means": "Ne anlama geliyor"
        },
        "intro": "Kontrol, Notalar’ın altındaki satırdır: listeyi açmak için tıkla. Sarı “bir göz at”, yeşil “her şey yolunda”, gri yalnızca bir not demektir. Çözüm belli olduğunda bir Düzelt düğmesi vardır; Göster ilgili notaları veya ölçüleri seçer. Ctrl+Z her düzeltmeyi geri alır.",
        "rows": [
          {
            "check": "Ton veya tempo yok",
            "means": "YuE2 hangi tonda ve ne kadar hızlı söyleyeceğini bilmiyor.",
            "fix": "Bunları üstteki çiplerden seç."
          },
          {
            "check": "Akorsuz ölçüler",
            "means": "YuE2 her ölçüde bir akora alışkın.",
            "fix": "Düzelt’e rahatça bas: önceki akor boş ölçülere devam eder."
          },
          {
            "check": "Vokalde nota yok",
            "means": "Melodi yok — YuE2 bir tane uyduracak.",
            "fix": "Melodiyi kalemle çiz veya hızlı başlangıçlardan birini kullan."
          },
          {
            "check": "Sözlerde hecelerden az nota var",
            "means": "Hecelerden çok daha az nota var: YuE2 gerisini uydurur ve notalarından uzaklaşabilir.",
            "fix": "Notaları tamamla (basit görünümde “ekle” düğmesiyle) veya “Bir şarkıdan…”ı kullan."
          },
          {
            "check": "Sesin üstünde veya altında notalar",
            "means": "Şarkıcı için zor; YuE2 zorlanabilir veya oktav değiştirebilir.",
            "fix": "Önce doğru sesin, erkek ya da kadının seçili olduğunu kontrol et. Sonra Düzelt’e bas: melodi oktavlarla aralığa taşınır."
          },
          {
            "check": "Bölümler sözlerle eşleşmiyor",
            "means": "Notalarda sözlerdeki etiketlerden fazla ya da az bölüm var: satırlar yanlış yerlere düşer.",
            "fix": "Düzelt eksik bölümleri sona ekler — sonra sırayı kontrol et. Fazla bölümleri kendin sil veya sözlerdeki etiketleri düzelt."
          },
          {
            "check": "Enstrüman sesle birlikte çalıyor",
            "means": "Bir not, hata değil: genelde ses söylerken enstrüman susar.",
            "fix": "Bilerek yaptıysan hiçbir şey. Aksi halde o ölçülerdeki enstrüman notalarını sil."
          },
          {
            "check": "ABC uzun",
            "means": "Çok uzun bir partisyon YuE2’nin isteminin büyük bir kısmını kaplar.",
            "fix": "Şarkıyı kısalt veya fazla enstrüman notalarını sil."
          }
        ],
        "tip": "Yeşil maddeler için bir şey gerekmez. Hiç uyarı kalmayınca Oluştur’a basabilirsin.",
        "title": "YuE2 için kontrol",
        "toc": "YuE2 için kontrol"
      },
      "chords": {
        "note": "YuE2 akorları yalnızca “Melodi ve akorlar” planıyla kullanır. “Melodiyi izle” ile model eşliği kendisi seçer ve akorların senin için bir ipucu olarak kalır.",
        "p": [
          "<b>Akor</b>, birlikte çalınan birkaç sestir. Eşlik onun üzerine kurulur: gitar, klavye, bas. Akorlar notaların üstünde bir sıra halinde durur, genelde ölçü başına bir tane.",
          "Başka bir akor seçmek için bir ölçünün akoruna (veya sıradaki boş bir yere) tıkla. <b>Uyanlar</b> başta gelir: tonunun akorları, YuE2’nin en iyi koruduğu akorlar. Aşağıda “Minörde yaygın” veya “Majörde yaygın” ve denemek için “Daha fazla” var. “Dinle” akoru çalar, “Ölçüde iki” ölçüyü iki akora böler.",
          "Ne seçeceğinden emin değil misin? “Sıfırdan çiz”in koyduğunu bırak: denenmiş dört akorluk bir dizi.",
          "<b>Müzisyenler için</b> — ızgaranın altındaki anahtar akorların üstünde Romen rakamlarını gösterir (I, IV, V, vi…): akorun tondaki derecesi. Teoriyi bilenler içindir; başkasının buna ihtiyacı yok."
        ],
        "title": "Akorlar",
        "toc": "Akorlar"
      },
      "faq": {
        "items": [
          {
            "q": "Nota okumam gerekiyor mu?",
            "a": "Hayır. “Daha tiz — daha pes” ve “daha uzun — daha kısa” duymak yeter. “Tonda”yı aç, yanlış nota olmaz."
          },
          {
            "q": "Erkek sesi neden çizilenden daha pes söylüyor?",
            "a": "YuE2 erkek melodilerini söylendikleri yerin bir oktav üstüne yazar. Bu normal; notaları indirmene gerek yok."
          },
          {
            "q": "Notalar bir yere kaydediliyor mu?",
            "a": "Evet, bunlar formun notalarıdır: her değişiklik doğrudan forma gider ve Ctrl+Z onu geri alır. Ayrı kaydetme yok — Oluştur’a bas, YuE2 onları alır."
          },
          {
            "q": "Şarkı ne kadar sürecek?",
            "a": "Ölçüleri kadar. 4/4’te tempo 95’te bir ölçü yaklaşık 2,5 saniye sürer: 16 ölçü yaklaşık 40 saniye, 64 ölçü yaklaşık 2,7 dakikadır."
          },
          {
            "q": "YuE2 neden tam benim notalarımı söylemedi?",
            "a": "Model notaları yakından izler, ama bir sentezleyici değildir: melodiyi süsleyebilir, bir heceyi kaydırabilir, bir oktav aşağıdan söyleyebilir. Çok farklıysa “Şarkı notaları izlemiyor” tarifine bak."
          },
          {
            "q": "Davul ve bas çizmem gerekiyor mu?",
            "a": "Hayır. Yalnızca ses ve istersen introda ve aralarda bir enstrüman hattı. Gerisini YuE2 stile göre çalar."
          },
          {
            "q": "Aşağıdaki ABC metni nedir?",
            "a": "Aynı notaların harflerle yazılmış hali — YuE2’nin aldığı budur. Editör onu kendisi yazar; yalnızca biçimi biliyorsan elle düzenle."
          },
          {
            "q": "Şarkı yapmadan nasıl dinlerim?",
            "a": "Dinle (Space) notaları piyanoda çalar. Metronom vuruşları tıkırdatır, Döngü işaretli ölçüleri tekrarlar."
          },
          {
            "q": "Hazır bir varyantın notalarını alabilir miyim?",
            "a": "Evet: bir varyanttaki “Notaları aç” onları kopya olarak açar. Düzenle, dinle ve onlardan yeni bir varyant yapmak için “Forma” düğmesine bas."
          }
        ],
        "title": "Sık sorulan sorular",
        "toc": "SSS"
      },
      "key": {
        "p": [
          "<b>Ton</b>, birbiriyle uyumlu yedi sestir. Onlardan kurulan bir melodi doğru duyulur, kümenin dışındaki bir ses ise yanlış nota gibi tırmalar.",
          "<b>Minör</b> daha hüzünlü ve dramatik, <b>majör</b> daha parlak ve neşeli duyulur. Harf (Do, Re, La…) kümenin başladığı sestir. Kulakla pek önemi yok; önemli olan söylemenin rahat olmasıdır.",
          "Izgarada tona ait satırlar vurgulanır. <b>“Tonda”yı</b> aç, kalem yanlış nota koymana izin vermez: nota en yakın uygun satıra oturur. Hiç yanlış söylememenin en kolay yolu budur. Dışarıdan bir nota mı lazım? Shift’e bas.",
          "Ton, üstteki Ton çipinden değiştirilir. “Notaları ve akorları da kaydır” açıkken bütün şarkı kayar ve daha tiz ya da daha pes duyulur."
        ],
        "tempo": [
          "<b>Tempo</b>, dakikadaki vuruş sayısıdır (BPM). 70–90 sakin, 95–120 orta, 130 ve üstü hızlıdır. YuE2 tempoyu notalardan alır; stil metnindeki tempo etki etmez.",
          "<b>Usul</b>, bir ölçüde kaç vuruş olduğudur. 4/4 neredeyse bütün pop ve rock, 3/4 vals, 6/8 sallanan bir his, baladlardır. Emin değil misin? 4/4’ü bırak.",
          "<b>Uzunluk</b>, şarkının kaç ölçü olduğudur. Ses notaları izler: tempo 95’te 4/4’lük 8 ölçü yaklaşık 20 saniyedir."
        ],
        "tempoTitle": "Tempo ve usul",
        "title": "Ton, tempo ve usul",
        "toc": "Ton ve tempo"
      },
      "lanes": {
        "p": [
          "Notaların iki sesi (kanalı) var. <b>Vokal</b> (mor-pembe notalar) şarkıcının söylediğidir. <b>Enstrüman</b> (turkuaz) bir enstrümanın tek melodik hattıdır: intro, aralar, bitiş.",
          "Kalem etkin sese yazar — geçmek için diğerine tıkla. “Sessize al” ve “Yalnızca bu ses” sadece burada duyduğunu değiştirir; şarkıyı etkilemez.",
          "<b>Ses söylerken enstrüman neden genelde susar.</b> YuE2’nin kendi partisyonları böyle yapılır: enstrüman sessiz yerleri doldurur. Şarkının üstüne çalarsa YuE2 neyi söyleyeceğini karıştırabilir. Kontrol bu tür ölçüleri gösterir — bu bir nottur, hata değil.",
          "Davul, bas ve eşliği çizmen gerekmez: YuE2 onları stilden ve akorlardan kendisi çalar."
        ],
        "title": "Vokal ve Enstrüman",
        "toc": "Vokal ve Enstrüman",
        "voice": [
          "Vokal sesindeki Erkek / Kadın anahtarı şarkıcı için rahat bir aralık belirler. Aralığın dışındaki notalar kırmızı çerçeve alır ve kontrol onları geri getirmeyi önerir. Stilde female veya female vocals yazıyorsa anahtar kendisi ayarlanır.",
          "<b>YuE2’nin erkek sesi, yazılı notaların bir oktav altından söyler.</b> Bu normal: YuE2 kendi partisyonlarında da melodileri böyle yazar. Bu yüzden bir erkek melodisi editörde tiz görünür — bilerek indirme, yoksa şarkıcı bas sese düşer.",
          "MIDI içe aktarırken “Oktavı sese uydur” bu kaydırmayı senin için yapar."
        ],
        "voiceTitle": "Erkek veya kadın sesi"
      },
      "parts": {
        "p": [
          "Bir şarkı bölümlerden oluşur: intro, kıta, ön nakarat, nakarat, köprü, ara, outro. Editörde bunlar ölçülerin üstündeki renkli şerittir.",
          "Bölümler sözlerdeki etiketlere bağlıdır: [Verse] bir kıta, [Chorus] bir nakarat, [Bridge] bir köprüdür vb. YuE2 notalarda hangi satırı nerede söyleyeceğini böyle bilir. Bu yüzden bölümlerin sayısı ve sırası sözlerdeki etiketlerle eşleşmeli — kontrol bunu izler.",
          "Bir bölüme tıklamak menüsünü açar: tür, ad, “Bölümü tekrarla” (ikinci bir nakarat saniyeler içinde), “Sonrasına bölüm ekle”, “Bütün bölümü göster”, “Ölçüleriyle sil”. Bir bölümün kenarı sürüklenebilir.",
          "<b>“Bölümleri sözlere göre işaretle”.</b> MIDI içe aktarıldıktan sonra genelde bölüm olmaz. Sözlerde etiket varsa editör notaları bunlara göre tek düğmeyle işaretlemeyi önerir: ölçüler sözlerin etiketlerine göre sırayla bölünür."
        ],
        "tip": "YuE2 için olağan: intro ve köprü 4–8 ölçü, kıta ve nakarat 8–16.",
        "title": "Şarkı bölümleri",
        "toc": "Şarkı bölümleri"
      },
      "recipes": {
        "intro": "Sık istenenler ve bunlar için adım adım ne yapılacağı.",
        "items": [
          {
            "title": "Nakarat daha tiz olsun istiyorum",
            "steps": [
              "Nakaratı göster: Nakarat bölümüne tıkla → “Bütün bölümü göster”.",
              "Seç ile Vokal sesinde nakarat notalarının çevresine bir çerçeve çiz.",
              "↑’ya bas: her basış bir yarım ton yukarıdır. 3–5 yarım ton açıkça duyulur; Shift + ↑ bir oktav atlar.",
              "Veya basit görünümde: her nakarat satırındaki “Bir gam basamağı yukarı” düğmeleri.",
              "Kontrole bak: notalar ses aralığından çıkmamalı."
            ]
          },
          {
            "title": "Şarkı notaları izlemiyor",
            "steps": [
              "Melodi sekmesindeki planı kontrol et: “Plan yok” değil, “Melodiyi izle” veya “Melodi ve akorlar” olmalı.",
              "Kontrolü aç. Sık nedenler “Hecelerden az nota” ve “Bölümler sözlerle eşleşmiyor”dur.",
              "Hece başına bir nota: basit görünümde her satırın sayacı eşleşmeli.",
              "Erkek sesi yazılı notaların bir oktav altından söyler — melodinin yüksekliğini değil, şeklini karşılaştır.",
              "2–3 varyant yap: model yine de biraz doğaçlama yapar ve çoğunlukla biri daha yakın olur."
            ]
          },
          {
            "title": "Melodi sıkıcı",
            "steps": [
              "Nakaratı kıtanın 3–5 yarım ton üstüne çıkar — “havalanmasını” sağlayan budur.",
              "Uzun ve kısa notaları karıştır: birkaç kısa, sonra satır sonunda bir uzun nota.",
              "Bir sıçrama ekle: en önemli kelimede komşularından belirgin şekilde tiz bir nota.",
              "İyi bir cümleyi Ctrl+C ve Ctrl+V ile tekrarla. Tekrar bir melodiyi akılda kalıcı yapar.",
              "Bir satırı tonun bir notasında (vurgulu bir satır) bitir — cümle o zaman bitmiş duyulur."
            ]
          },
          {
            "title": "Sözler sığmıyor",
            "steps": [
              "“Basit”i aç: sıkışık bir satırda “eksik notalar” yazar.",
              "“ekle”ye bas — en uzun notalar bölünür.",
              "Veya uzun notaları Böl aracıyla (C) kendin böl.",
              "Satır hâlâ sıkışıksa ona daha çok yer ver: bölümün kenarını sürükle veya “Sonrasına bölüm ekle”yi kullan. Ya da söz satırını kısalt."
            ]
          },
          {
            "title": "Başka bir şarkının melodisini istiyorum",
            "steps": [
              "Elinde bir ses dosyası var — “Bir şarkıdan…”: SheetSage2 melodiyi ve akorları yazıya döker.",
              "Elinde bir MIDI var — “MIDI içe aktar”: vokal partisini Vokal olarak seç, “Oktavı sese uydur”u aç ve şarkının gerçek temposunu gir.",
              "Zaten bir YuE2 varyantı — varyanttaki “Notaları aç”, sonra “Forma”.",
              "İçe aktardıktan sonra: “Bölümleri sözlere göre işaretle”, sonra kontrol.",
              "Sözlerin büyük olasılıkla orijinalden farklı düşecek — bunları basit görünümde ayarla."
            ]
          }
        ],
        "title": "Tarifler",
        "toc": "Tarifler"
      },
      "roll": {
        "head": {
          "key": "Tuş",
          "what": "Ne yapar"
        },
        "keys": [
          {
            "key": "Space",
            "what": "Çal veya duraklat"
          },
          {
            "key": "Home",
            "what": "Başa dön"
          },
          {
            "key": "B · V · E · C",
            "what": "Kalem · Seç · Silgi · Böl"
          },
          {
            "key": "1 2 3 4 5",
            "what": "Yeni notanın uzunluğu: 1/16, 1/8, 1/4, 1/2, bütün"
          },
          {
            "key": "6",
            "what": "Nota yerine es"
          },
          {
            "key": "K",
            "what": "“Tonda”yı aç veya kapat"
          },
          {
            "key": "L",
            "what": "İşaretli ölçüleri döngüye al"
          },
          {
            "key": "F",
            "what": "Tam ekran"
          },
          {
            "key": "↑ ↓",
            "what": "Seçili notalar bir yarım ton yukarı veya aşağı"
          },
          {
            "key": "Shift + ↑ ↓",
            "what": "Seçili notalar bir oktav yukarı veya aşağı"
          },
          {
            "key": "← →",
            "what": "Seçimi (veya imleci) bir ızgara adımı kaydır"
          },
          {
            "key": "Shift + ← →",
            "what": "Bütün bir ölçü kaydır"
          },
          {
            "key": "Delete",
            "what": "Seçimi sil"
          },
          {
            "key": "Ctrl + Z · Ctrl + Shift + Z",
            "what": "Geri al · yinele"
          },
          {
            "key": "Ctrl + C · Ctrl + V",
            "what": "Kopyala · imlece yapıştır"
          },
          {
            "key": "Ctrl + D",
            "what": "Seçimi çoğalt"
          },
          {
            "key": "Ctrl + A",
            "what": "Sesin bütün notalarını seç"
          },
          {
            "key": "Esc",
            "what": "Seçimi temizle"
          },
          {
            "key": "Çizerken Shift",
            "what": "Tonun dışına nota koy"
          },
          {
            "key": "Çizerken Alt",
            "what": "Sil"
          },
          {
            "key": "Ctrl + tekerlek",
            "what": "Yakınlaştır veya uzaklaştır"
          },
          {
            "key": "Shift + tekerlek",
            "what": "Yana kaydır"
          }
        ],
        "keysHint": "Odak nota editöründeyken çalışırlar, bir metin alanındayken değil.",
        "keysTitle": "Klavye kısayolları",
        "p": [
          "Piyano rulosu, zaman gibi soldan sağa uzanan bir şerittir. Üzerindeki her çubuk bir notadır.",
          "<b>Ekranda yukarıda olan, daha tiz bir ses demektir.</b> Soldaki piyano tuşları hangi nota olduğunu gösterir.",
          "<b>Daha uzun çubuk, daha uzun ses demektir.</b> Notalar arasındaki boşluk bir estir: ses susar.",
          "<b>Ölçü</b>, kalın dikey çizgiler arasındaki aralıktır; ölçü numaraları üsttedir. 4/4’te bir ölçüde dört vuruş var — ritim tutabileceğin dört adım. Tempo 95’te bir ölçü yaklaşık 2,5 saniye sürer, yani 16 ölçü kabaca 40 saniyelik şarkıdır.",
          "<b>Izgara</b>, bir ölçünün içindeki ince çizgilerdir. Notalar onlara yapışır, böylece ritim düzgün çıkar. Daha ince bir ızgara notayı daha hassas koymana izin verir.",
          "<b>İmleç</b>, Çal’ın başladığı dikey çizgidir. Yerleştirmek için ölçü cetveline tıkla. Döngüye alınacak ölçüleri işaretlemek için cetvel boyunca sürükle."
        ],
        "title": "Piyano rulosu nasıl okunur",
        "toc": "Piyano rulosunu okumak",
        "tools": [
          "<b>Kalem (B)</b> — tıklama seçilen uzunlukta bir nota koyar; sağa sürüklemek uzatır.",
          "<b>Seç (V)</b> — bir notaya tıkla veya birkaçının çevresine çerçeve çiz. Seçili notalar sürüklenebilir, ok tuşlarıyla taşınabilir ve sağ kenarlarından yeniden boyutlandırılabilir.",
          "<b>Silgi (E)</b> — notaları silmek için üzerlerine tıkla veya sürükle. Alt’a basılı tutmak her aracı silgiye çevirir.",
          "<b>Böl (C)</b> — bir notayı ızgara boyunca ikiye böler. Uzun bir sesin iki heceyi taşıması gerektiğinde işe yarar.",
          "<b>Uzunluk</b> — yeni notanın uzunluğu: 1/4 bir vuruş, 1/8 yarım vuruş, 1/2 iki vuruştur. “Es” sessizlik çizer."
        ],
        "toolsTitle": "Araçlar",
        "views": [
          "<b>Piyano rulosu</b> — çizip düzenlediğin ana görünüm.",
          "<b>Notalar</b> — aynı notalar bir nota kitabındaki gibi, nota okuyanlar için: bakmak ve dinlemek için.",
          "<b>Basit</b> — sözlerin üstünde noktalar halinde melodi; bkz. “Basit görünüm”."
        ],
        "viewsTitle": "Üç görünüm"
      },
      "simple": {
        "p": [
          "“Basit”, piyano rulosunu zor bulanlar için görünümdür. Her söz satırı bir karttır: noktalar hecelerin üstünde durur ve aralarındaki çizgi melodinin nereye gittiğini gösterir — yukarı veya aşağı.",
          "<b>Bir noktayı yukarı veya aşağı sürükle</b> (veya seçip ↑ ↓’ye bas) notayı yükseltmek veya alçaltmak için. “Tonda” açıkken nokta yalnızca tonun notalarında gezer, asla dışına çıkmaz. Bir heceye tıklamak notasını çalar.",
          "“5 hece · 5 nota” <b>sayacı</b> sözler için yeterli nota olup olmadığını gösterir. En iyisi hece başına bir nota.",
          "<b>“+1 melisma olarak söylenir”</b> — hecelerden çok nota: fazlalar tek bir heceye uzatılarak söylenir (“ye-e-eah”). Bu sorun değil, çoğu zaman güzeldir.",
          "<b>“Eksik notalar — ekle”</b> — notalardan çok hece. “ekle” düğmesi satırın en uzun notalarını böler, böylece her hece kendi notasını alır.",
          "Ritim, yani nota uzunlukları burada değişmez — bunun için piyano rulosunu kullan. Bir satırdaki düğmeler onu çalar ve bütün satırı yukarı veya aşağı taşır."
        ],
        "title": "Basit görünüm: sözlerin üstünde melodi",
        "toc": "Basit görünüm"
      },
      "start": {
        "also": [
          "<b>Piyano çal</b> — ekrandaki veya bir MIDI klavyede: notalar imleçten itibaren art arda yazılır.",
          "<b>ABC yapıştır</b> — melodi zaten ABC olarak varsa (İçe aktar menüsü).",
          "<b>Bir varyantın notaları</b> — hazır bir YuE2 varyantında “Notaları aç” vardır: partisyonu kopya olarak açılır. Dinle ve düzenle; form değişmez. “Forma” bu notaları forma alır, “Kapat” formun notalarına döndürür."
        ],
        "alsoTitle": "Başka yollar",
        "intro": "Henüz nota yok mu? Üç yol da boş Notalar ekranında.",
        "sparse": "YuE2 hece başına bir nota söyler. Bir MIDI transkripsiyonunda sözlerdeki hece sayısından çok daha az nota varsa (otomatik transkripsiyonlarda sık olur), model gerisini uydurmak zorunda kalır ve şarkı notaları izlemeyi bırakır. Kontrol bu konuda uyarır. Melodiyi piyano rulosunda veya basit görünümde tamamla — ya da notaları “Bir şarkıdan…” ile al.",
        "sparseTitle": "“Seyrek” bir MIDI neden zayıf sonuç verir",
        "title": "Üç hızlı başlangıç",
        "toc": "Üç hızlı başlangıç",
        "ways": [
          {
            "title": "Sıfırdan çiz",
            "text": "Bir ton, tempo ve usul seç; editör sözlerden bir çerçeve kurar: [Verse] ve [Chorus] etiketlerine göre bölümler, uygun sayıda ölçü ve yer tutucu akorlar. Geriye vokal melodisini kalemle çizmek kalır. Melodi kafandayken en iyi yol."
          },
          {
            "title": "Bir şarkıdan…",
            "text": "Bir ses dosyası seç; SheetSage2 melodisini, akorlarını ve bölümlerini yazıya döker. Bir iki dakika sürer. Net bir vokalli, koro ve gürültüsüz bir parçada en iyi çalışır. Sonra istediğin gibi düzenle."
          },
          {
            "title": "MIDI içe aktar",
            "text": "Bir DAW’dan, bir nota uygulamasından veya bir web sitesinden .mid dosyasını bırak. Seçicide hangi partinin Vokal, hangisinin Enstrüman olacağını seç; davul ve gerisi atılır, akorlardan en üst nota alınır. “Oktavı sese uydur” melodiyi YuE2’nin yazdığı gibi kaydırır. Tempo alanı: şarkı daha hızlı ya da yavaş olsa da transkripsiyonlar çoğu zaman 120 BPM ile kaydedilir — gerçek tempoyu gir, notalar duyuldukları yere oturur."
          }
        ]
      },
      "what": {
        "head": {
          "name": "Plan",
          "text": "YuE2 ne yapar",
          "when": "Ne zaman seçilir"
        },
        "p": [
          "Notalar, çubuklarla çizilmiş şarkının melodisidir: hangi sesin söyleneceği, ne zaman başlanacağı ve ne kadar tutulacağı. Nota okumana gerek yok — hangi sesin daha tiz, hangisinin daha pes olduğunu duymak yeter.",
          "<b>Notasız</b> YuE2 melodiyi kendisi uydurur. Her varyant farklıdır ve bir satırın nasıl söyleneceğini önceden bilemezsin.",
          "<b>Notalarla</b> YuE2 senin melodini söyler. Testlerimizde model çizilen notaların %98’ini tutturdu, melodinin inişlerini çıkışlarını ve uzunluğu korudu: kaç ölçü çizersen o kadar söyler.",
          "Formda notalar ABC metni olarak tutulur — aynı notaların harflerle yazılmış hali. Editör onu senin için yazar; dokunman gerekmez."
        ],
        "plans": [
          {
            "name": "Plan yok",
            "text": "Melodiyi ve eşliği kendisi uydurur ve doğrudan sese geçer.",
            "when": "Nota yoksa ve sadece fikirleri duymak istiyorsan. Formda nota olur olmaz uygulama planı kendiliğinden “Melodiyi izle”ye geçirir."
          },
          {
            "name": "Melodiyi izle",
            "text": "Senin melodini söyler ve eşliği kendisi uydurur. Akorların kullanılmaz.",
            "when": "Sesi çizdikten sonra neredeyse her zaman. En güvenli seçim."
          },
          {
            "name": "Melodi ve akorlar",
            "text": "Hem senin melodini hem de akorlarını alır.",
            "when": "Akorları seçtiysen ve tam o armoniyi istiyorsan."
          }
        ],
        "plansIntro": "Plan formda, Melodi sekmesinde seçilir. YuE2’ye notalarınla ne yapacağını söyler.",
        "plansTitle": "Üç melodi planı",
        "title": "Notalar nedir ve YuE2’nin neden onlara ihtiyacı var",
        "toc": "Notalar neden"
      }
    },
    "title": "Notalar yardımı",
    "toc": "İçindekiler",
    "tocPick": "Yardım bölümü"
  },
  "player": {
    "mute": "Sessize al",
    "unmute": "Sesi aç",
    "volume": "Ses düzeyi"
  },
  "sa3Gen": {
    "promptHint": "İngilizce en iyi sonucu verir; Tarif et asistanı çevirir. Türü, enstrümanları, ruh halini ve temposunu yaz; bir ses için kaynağını, nasıl oluştuğunu ve mekânı."
  },
  "score": {
    "checks": {
      "sparseVocal": "Sözlerde hecelerden az nota var — YuE2 gerisini uyduracak",
      "sparseVocalSub": "{notes} nota, {syllables} hece. Melodinin kalanını çizmek veya “Bir şarkıdan…”ı kullanmak daha iyi"
    },
    "lane": {
      "femaleAbbr": "Kad.",
      "insShort": "Enst.",
      "maleAbbr": "Erk.",
      "voiceFemale": "Ses: kadın",
      "voiceMale": "Ses: erkek"
    },
    "midi": {
      "fitOctave": "Oktavı sese uydur",
      "fitOctaveHint": "YuE2 bir melodiyi söylendiği yerin yaklaşık bir oktav üstüne yazar, oysa bir MIDI transkripsiyonunda söylenen perde vardır. Bütün vokal partisi tam oktavlarla kayar.",
      "markSections": "Bölümleri sözlere göre işaretle",
      "movedDown": "Vokal {n} oktav aşağı taşındı. | Vokal {n} oktav aşağı taşındı.",
      "movedUp": "Vokal {n} oktav yukarı taşındı. | Vokal {n} oktav yukarı taşındı.",
      "noSections": "MIDI’de şarkı bölümü yok. Söz etiketleri: {tags}.",
      "octaveDown": "−{n} oktav | −{n} oktav",
      "octaveNone": "oktav dosyadaki gibi",
      "octaveUp": "+{n} oktav | +{n} oktav",
      "tempoFile": "dosyadan",
      "tempoHint": "Dosya {bpm} BPM diyor. Transkripsiyonlar şarkının temposu ne olursa olsun çoğu zaman 120’de kaydedilir: şarkının temposunu ayarla, notalar duyuldukları yere yerleşir.",
      "tempoTrack": "“{title}” parçasından"
    },
    "overview": {
      "pickHint": "Bu ölçüleri Notalar’da aç"
    },
    "toolbar": {
      "musician": "Müzisyenler için",
      "musicianTip": "Akor derecelerini göster (I, IV, V…) — bilenler için müzik teorisi"
    },
    "workspace": {
      "backTip": "Oturuma dön; notalar formda kalır",
      "copyBadge": "varyantın kopyası",
      "copyBadgeTip": "Varyantın notalarının bir kopyası: “Forma”ya kadar form değişmez",
      "copyLead": "Burada dinle ve düzenle — “Forma”ya basana kadar form değişmez. “Kapat” formun notalarına döndürür.",
      "copyTitle": "“{title}” varyantının notaları",
      "form": "Form",
      "formBadge": "formun notaları",
      "formBadgeTip": "Bunlar formun notaları: düzenlemeler hemen forma gider (Ctrl+Z geri alır)",
      "label": "Notalar",
      "replaceConfirm": "Formda zaten başka notalar var. Bunların yerine bu varyantın notaları konsun mu? (Ctrl+Z onları geri getirir)",
      "title": "Notalar",
      "toForm": "Forma"
    }
  },
  "takeCompare": {
    "seed": "Seed {seed}"
  },
  "yueGen": {
    "abcScore": "Notalar",
    "help": {
      "melody": {
        "sources": [
          "Bir şarkıdan… — bir ses dosyası seç; SheetSage2 melodisini ve akorlarını yazar. Net bir vokalli şarkı en iyi çalışır.",
          "MIDI içe aktar — en yüksek parti melodi olur, diğer kanallar eşlik ve akorlar olur ve ton kendiliğinden bulunur. Vokal melodisini ayrı bir izde tut.",
          "Piyano — bir uzunluk seç ve tuşlara bas (aşağıda, rulonun solunda veya bir MIDI klavyede): notalar art arda gelir.",
          "Bir parçadan: bir varyantın menüsünde Notalardan MIDI’ye, ya da kütüphanede Stem’ler ve notalar sekmesi, sonra YuE2 partisyonuna. Vokal melodi olur, bas ve gerisi eşlik."
        ]
      }
    },
    "unloadSheetSage": "Melodiyi çıkardıktan sonra ekran kartını boşalt"
  }
}
