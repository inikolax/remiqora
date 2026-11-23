// Strings added after the first translation (machine-translated from en, 743 keys);
// merged into the other parts key by key (see ../mergeParts).
export default {
  "aceGen": {
    "addLora": "Tambah LoRA",
    "cfgIntervalOrder": "Panduan “dari” harus lebih kecil dari “sampai”.",
    "lengthAskedNote": "Durasi dikirim ke model sebagai permintaan. Tekan lagi pilihan tadi untuk menyerahkannya ke model.",
    "lengthByModelNote": "Dari deskripsi, model memilih durasinya sendiri. Pilih di sini untuk meminta durasi Anda.",
    "loraName": "Nama LoRA",
    "loraPath": "Folder adapter LoRA",
    "manual": {
      "adg": "Panduan adaptif (ADG)",
      "balancedOnly": "pada mode Seimbang",
      "baseOnly": "hanya model base dan SFT",
      "bpm": "Tempo",
      "cfgEnd": "Panduan sampai (bagian dari proses)",
      "cfgStart": "Panduan dari (bagian dari proses)",
      "cotCaption": "Perluas deskripsi",
      "cotCaptionHint": "Aktif: model bahasa boleh menulis ulang teks gaya Anda sebelum musik dibuat.",
      "cotLanguage": "Deteksi bahasa",
      "cotLanguagePicked": "nonaktif: bahasa pilihan Anda dipertahankan",
      "coverNoise": "Derau dicampur dengan sumber",
      "coverRepaintOnly": "untuk cover atau repaint",
      "infer": "Metode dekode",
      "latentCrossfade": "Sambungan di dalam model",
      "length": "Durasi",
      "lmCfg": "Kedekatan dengan prompt",
      "lmNegative": "Yang dihindari",
      "lmSub": "menulis rencana lagu dan melengkapi yang kurang",
      "lmTitle": "Model bahasa",
      "loraScale": "Kekuatan LoRA",
      "metaByModel": "model memilihnya dari deskripsi",
      "musicSub": "apa yang sudah diketahui tentang lagu sebelumnya",
      "musicTitle": "Musik",
      "myLoras": "LoRA saya: {n}",
      "needRef": "dengan lagu referensi",
      "noLm": "ACE-Step tidak memuatnya di GPU ini",
      "noLmWithRef": "tidak dipakai dengan lagu referensi",
      "ode": "ODE: hasilnya persis berulang",
      "off": "nonaktif",
      "pickLora": "pilih LoRA terlebih dahulu",
      "refSub": "cover dan repaint",
      "refTitle": "Lagu referensi",
      "repaintMode": "Mode repaint",
      "repaintModes": {
        "aggressive": "Berani",
        "balanced": "Seimbang",
        "conservative": "Hati-hati"
      },
      "repaintOnly": "untuk repaint satu rentang",
      "repaintStrength": "Kekuatan repaint",
      "resultSub": "cara menyerahkan hasil",
      "sde": "SDE: dengan unsur acak",
      "sdeBaseWarn": "Pada model base, SDE menghasilkan derau, bukan musik, dalam satu uji coba (32 langkah). Pada Turbo bisa dipakai, dengan suara lebih gelap.",
      "shift": "Pergeseran jadwal",
      "thinking": "Rencana dulu (thinking)",
      "tiled": "Dekode per potongan",
      "turboSteps": "Turbo menerima 1 sampai 8 langkah: lebih dari itu dipotong jadi 8",
      "wavCrossfade": "Sambungan di audio"
    },
    "modeDescribe": "Dari deskripsi",
    "modeLabel": "Mulai dari mana",
    "modeOwn": "Lirik dan gaya sendiri",
    "modelNote": "Turbo memakai 8 langkah. Model lain lebih lama; mengeluarkan atau menambah bagian tidak bisa di semuanya, dan tugas yang tidak bisa dilakukan model ditampilkan abu-abu di tab Dari sebuah lagu.",
    "noLmBaseNote": "Base dan SFT bergantung pada model itu untuk vokal yang bersih: pada mode ini suara bisa terdengar berderau dan jauh. Untuk vokal, ganti ke Lirik dan gaya sendiri lalu tulis liriknya, atau pilih Turbo.",
    "noLmNote": "Pada kartu grafis ini (8 GB atau kurang), ACE-Step tidak memuat model bahasanya, jadi deskripsi Anda dikirim ke model sebagai prompt gaya biasa, tanpa lirik yang ditulis.",
    "noVocal": "Tanpa vokal",
    "noVocalHint": "Instrumental: tidak perlu lirik, gaya di bawah menentukan musiknya.",
    "queuedStatus": "Dalam antrean, jumlah varian: {n}",
    "refFile": "Berkas audio referensi",
    "refOff": "Aktifkan untuk bekerja dari lagu jadi: cover, rentang yang diulang, bagian yang dikeluarkan atau ditambahkan.",
    "removeLoraConfirm": "Hapus?",
    "removeLoraNamed": "Hapus LoRA {name}",
    "repaintOrder": "Akhir rentang harus setelah awalnya.",
    "simple": {
      "auto": "otomatis",
      "fast": "cepat {n}",
      "formatHint": "mp3 lebih hemat ruang; wav dan flac menjaga suara tanpa kehilangan kualitas.",
      "key": "Mode",
      "keyHint": "Mayor terdengar lebih cerah, minor lebih gelap dan sendu. Nada dasar dan tangga nada lain dipilih di Manual.",
      "keyWish": "Dari deskripsi, model memilih nada dasarnya. Mode yang dipilih di sini dikirim sebagai permintaan.",
      "lengthHint": "Berapa lama lagunya berjalan.",
      "lengthWish": "Dari deskripsi, model memilih durasinya. Pilihan di sini dikirim sebagai permintaan, bukan jaminan.",
      "major": "mayor",
      "medium": "sedang {n}",
      "minor": "minor",
      "slow": "lambat {n}",
      "tempo": "Tempo",
      "tempoHint": "Ketukan per menit. “Otomatis” menyerahkannya ke model; angka pasti diatur di Manual.",
      "tempoWish": "Dari deskripsi, model memilih temponya. Pilihan di sini dikirim sebagai permintaan."
    },
    "tabChanged": "diubah",
    "tabs": {
      "ref": "Dari sebuah lagu",
      "song": "Lagu",
      "tuning": "Penyetelan"
    },
    "taskType": "Apa yang dilakukan pada lagu",
    "taskUnsupported": "Tidak didukung model ini",
    "help": {
      "style": {
        "tips": [
          "Optimalnya 5–9 tag: lebih sedikit dan model mengisi sendiri bagian kosongnya sehingga hasilnya kurang terduga; lebih banyak dan tag mulai bertabrakan.",
          "Taruh genre dan suasana di depan — keduanya membentuk karakter umum lagu lebih dari tag lainnya.",
          "Jangan campur tag yang bertentangan dalam satu kategori (mis. “aggressive” dan “dreamy” sekaligus) — model akan mengabaikan salah satu atau hasilnya jadi kacau.",
          "Lebih baik menulis tag dalam bahasa Inggris — data latihnya kebanyakan berbahasa Inggris, jadi akurasinya lebih tinggi, meski liriknya berbahasa Indonesia.",
          "Tempo yang diatur di Penyetelan (di Sederhana, atau angka pasti di Manual) lebih andal daripada tag teks seperti “120 bpm” di gaya: pakai bila tempo penting."
        ]
      },
      "lyrics": {
        "tips": [
          "Sesuaikan dengan durasi lagu: ~2 menit biasanya cukup untuk 2 bait + 2 refrein; untuk 3+ menit tambahkan bridge dan hook kedua — teks yang terlalu panjang untuk durasi pendek akan “dijejalkan” oleh model.",
          "Baris pendek (5–10 suku kata) cocok dengan melodi lebih terduga daripada yang panjang — jika sebuah baris kepanjangan, pecah jadi dua.",
          "Refrein yang berulang (teks persis sama di setiap [Chorus]) membantu model menjaga melodi yang sama untuknya sepanjang lagu.",
          "Untuk lagu instrumental penuh, centang “Tanpa vokal” daripada menulis lirik yang hanya berisi [Interlude]: itu lebih andal.",
          "Tanda baca (koma, elipsis) memengaruhi frasa dan jeda pada vokal — gunakan dengan sengaja, bukan hanya menurut aturan ejaan."
        ]
      },
      "remix": {
        "unavailable": "Skenario yang tersedia bergantung pada model terpilih — opsi yang tidak didukung di formulir ditampilkan abu-abu. Coba model lain (di tab Lagu atau di Penyetelan) jika Anda butuh skenario tertentu. Unggah berkas referensi dalam format yang bisa diambil audionya oleh model (wav/mp3/flac) — berkas yang sangat panjang (beberapa menit) bisa menambah waktu proses secara nyata."
      },
      "advanced": {
        "title": "Penyetelan",
        "rows": [
          {
            "param": "Sederhana dan Manual",
            "what": "Sederhana punya beberapa pilihan mudah: langkah dekode (tidak ada di Turbo), durasi, tempo (lambat 80, sedang 110, cepat 140), mode (mayor atau minor), dan format. Manual punya setiap parameter dalam grup, dan konsol menampilkan semuanya sekaligus."
          },
          {
            "param": "Format",
            "what": "Format berkas keluaran. mp3 lebih ringkas dan cukup untuk didengarkan; wav dan flac tanpa kehilangan kualitas tetapi 5–10 kali lebih besar."
          },
          {
            "param": "Tempo, nada dasar, birama",
            "what": "Parameter musik eksplisit. Jika dibiarkan otomatis, model mengambilnya dari teks gaya; atur manual hanya bila presisi penting (misalnya untuk mencampur dengan lagu lain). Birama adalah 2/4, 3/4, 4/4, atau 6/8. Dari deskripsi, model memilihnya sendiri: tempo atau nada dasar yang diatur di sini dikirim sebagai permintaan, dan birama diserahkan padanya."
          },
          {
            "param": "Bahasa vokal",
            "what": "Bahasa yang dipakai untuk menyanyikan vokal. Pada otomatis, bahasa diambil dari lirik, yang bisa salah pada lirik pendek atau ambigu: atur bila vokal keluar dalam bahasa yang salah. Bahasa yang dipilih manual dipertahankan, model bahasa tidak menggantinya."
          },
          {
            "param": "Langkah dekode",
            "what": "Jumlah langkah difusi. Lebih banyak bisa berarti audio lebih bersih tetapi pembuatan lebih lambat; setelah titik tertentu peningkatannya nyaris tak terdengar. Turbo menerima 1 sampai 8 (bawaan 8), model SFT 50, model base 32. Di Sederhana, Lainnya menggandakan jumlah biasa."
          },
          {
            "param": "Kedekatan dengan gaya",
            "what": "Skala panduan: seberapa ketat model mengikuti deskripsi Anda. Lebih tinggi mengikuti tag gaya lebih tepat, tetapi nilai yang sangat tinggi membuat suara kasar dan penuh artefak; lebih rendah lebih alami tetapi kurang terduga. Turbo tidak memakainya. Bawaannya 7, rentang yang masuk akal biasanya 3 sampai 12."
          },
          {
            "param": "Seed",
            "what": "Di bawah formulir, di samping Buat. Dengan dadu ditekan, setiap varian mendapat seed acak baru. Sebuah angka dengan pengaturan lain yang sama hampir mengulang hasilnya: berguna untuk mengganti satu tag gaya dan membandingkan."
          },
          {
            "param": "Model",
            "what": "Turbo lebih cepat dengan sedikit mengorbankan kualitas dan tidak melakukan semua tugas di tab Dari sebuah lagu; base dan SFT lebih lambat tetapi lebih akurat dan fleksibel. Model dipilih di tab Lagu atau di Manual."
          },
          {
            "param": "LoRA",
            "what": "Tambahan hasil fine-tune di atas model, misalnya untuk warna vokal atau subgenre tertentu. Kekuatannya (0 sampai 1) menentukan seberapa besar pengaruhnya: 1 adalah efek penuh seperti yang dimaksud pembuat adapter, lebih rendah mencampurnya lebih lembut. Adapter ditambahkan di LoRA saya di Manual, dengan nama dan folder."
          }
        ],
        "footer": "Apa pun yang tidak Anda ubah memakai bawaan engine: Anda tidak perlu mengatur semuanya untuk mendapat hasil bagus. Atur ulang mengembalikan baris-baris penyetelan dan membiarkan model serta durasi."
      }
    }
  },
  "aiPart": {
    "guide": {
      "scratch": [
        {
          "title": "Tempo, nada dasar, durasi",
          "text": "Di proyek kosong, atur BPM dan “Nada dasar”, serta durasi dalam detik di panel. 64 birama pada 120 BPM sama dengan 128 detik."
        },
        {
          "title": "Mulai dari drum",
          "text": "“Tambah bagian”, instrumen “Drum”. Bagian lain menjaga ritmenya mengikuti drum, jadi drum duluan."
        },
        {
          "title": "Bass, lalu harmoni",
          "text": "Bass, lalu akor: keyboard, pad. Biarkan drum tetap dicentang di daftar trek yang didengar model."
        },
        {
          "title": "Melodi dan warna",
          "text": "Lead, string, perkusi. Lima sampai tujuh bagian sudah cukup; lebih dari itu mix jadi sesak."
        },
        {
          "title": "Pilih dan atur volume",
          "text": "Simpan varian terbaik dari tiap bagian dan langsung turunkan ke level yang pas."
        },
        {
          "title": "Susun lagunya",
          "text": "Aktifkan “Magnet” dan penggaris dalam birama, potong bagian dengan Pisau dan hapus potongan dengan Penghapus: intro, bagian utama, jeda tanpa drum dan bass, penutup."
        }
      ],
      "scratchIntro": "Arranger bisa membangun lagu dari proyek kosong. Bagian ditambahkan satu per satu dan tiap bagian berikutnya mendengar yang sudah ada, jadi urutan penting.",
      "scratchTitle": "Lagu dari nol",
      "steps": [
        {
          "title": "Jalankan engine",
          "text": "Arranger berjalan di ACE-Step; repaint, lanjutkan, dan cover juga bisa berjalan di Stable Audio 3. Jika engine berhenti, panel menawarkan untuk menjalankannya dengan satu tombol, dan engine yang ada di GPU berhenti saat itu."
        },
        {
          "title": "Atur tempo dan nada dasar",
          "text": "Sebelum bagian pertama, atur BPM proyek dan “Nada dasar”: tonika dan tangga nada. Model menerimanya di setiap permintaan. Jangan ubah tempo setelah bagian-bagian pertama: bagian itu akan melenceng dari grid."
        },
        {
          "title": "Pilih mode",
          "text": "“Tambah bagian”, “Repaint”, “Lanjutkan”, atau “Cover”. Petunjuk di samping sakelar menjelaskan dalam satu baris apa yang akan dilakukan model."
        },
        {
          "title": "Deskripsikan yang Anda butuhkan",
          "text": "Untuk bagian baru, pilih instrumen. Di deskripsi, sebutkan bunyi dan cara memainkannya. Tulis dalam bahasa Anda sendiri: “Ke bahasa Inggris” menulis ulang sesuai cara model membacanya paling baik. Tanda “?” di samping kolom membuka kata dan contoh siap pakai."
        },
        {
          "title": "Centang yang didengar model",
          "text": "Model menyesuaikan diri dengan trek yang dicentang. Biarkan drum ikut: model mengikuti grid-nya."
        },
        {
          "title": "Tentukan di mana",
          "text": "Seluruh lagu atau area loop: aktifkan “Loop” dan seret area pada penggaris. “Repaint” hanya bekerja pada area loop."
        },
        {
          "title": "Buat dan pilih",
          "text": "Varian masuk ke trek baru. “Dengarkan” beralih ke sebuah varian, “Simpan” menghapus yang lain."
        }
      ],
      "tips": [
        "Deskripsi paling baik dalam bahasa Inggris, sebagai frasa pendek dipisah koma. Tulis dalam bahasa Anda sendiri dan tekan “Ke bahasa Inggris”; baca hasilnya dan perbaiki bila perlu.",
        "Deskripsikan satu bagian, bukan seluruh lagu: apa yang dimainkan instrumen dan bagaimana bunyinya.",
        "Bangun lagu bertahap: drum, lalu bass, lalu harmoni, lalu melodi. Setiap bagian berikutnya mendengar yang sebelumnya.",
        "Tidak puas dengan sebuah varian? Buat lagi: setiap proses memakai seed acak baru.",
        "Setelah tiap bagian baru, atur volumenya sebelum menambah yang berikutnya: bagian berikutnya mendengar mix seperti saat ini.",
        "Saat bagian-bagian siap, susun lagunya dari situ: potong trek per birama dengan Pisau (C) dan hapus potongan dengan Penghapus (E), agar instrumen masuk satu per satu.",
        "Untuk vokal, ketik liriknya dan periksa “Bahasa vokal”: pada “Otomatis” bahasa dibaca dari hurufnya.",
        "ACE-Step meratakan setiap hasil ke -1 dBFS, jadi bagian baru datang keras: turunkan dengan slider volume trek.",
        "Untuk menyelesaikan lagu di DAW lain, ekspor “Stem + Reaper” atau DAWproject.",
        "Repaint, lanjutkan, dan cover juga bisa berjalan di Stable Audio 3: pilih sebagai engine di panel. Ia mengisi dan melanjutkan dengan mendengarkan audio di sekitar rentang, dalam hitungan detik, hanya instrumental. Menambah bagian tetap di ACE-Step."
      ]
    },
    "toEnglish": "Ke bahasa Inggris",
    "toEnglishBusy": "Menulis…",
    "toEnglishDone": "Ditulis ulang dalam bahasa Inggris oleh asisten; edit bila perlu.",
    "toEnglishFailed": "Asisten tidak bisa menulis deskripsinya.",
    "toEnglishGpu": "Asisten prompt diatur berjalan di GPU dan akan membongkar model. Ganti ke Otomatis atau CPU di halaman Model.",
    "toEnglishTitle": "Deskripsikan dalam bahasa apa pun: asisten prompt menulis ulang dalam bahasa Inggris, cara model membacanya paling baik",
    "toEnglishUndo": "Urungkan"
  },
  "create": {
    "closeTool": "Tutup",
    "deleteAsk": "Hapus?",
    "details": "Detail",
    "download": "Unduh",
    "emptyAll": "Lagu-lagu Anda akan muncul di sini",
    "emptyHint": "Pilih engine, isi formulir, atau tulis satu frasa di baris ide di atasnya, lalu tekan Buat.",
    "emptyPeriod": "Tidak ada yang dibuat pada periode ini",
    "engine": "Engine",
    "engineTitle": "{name}: {status}",
    "engines": {
      "ace_step": "Cepat, cover",
      "stable_audio": "Suara dan loop",
      "yue2": "Lagu dengan vokal"
    },
    "failed": "Tidak berhasil. Muat ke formulir lalu tekan Buat lagi.",
    "idea": {
      "chip": {
        "description": "Deskripsi",
        "length": "Durasi",
        "lyrics": "Lirik",
        "style": "Gaya",
        "tempo": "Tempo dan nada dasar"
      },
      "describe": "Deskripsikan",
      "dismiss": "Tutup",
      "formChanged": "Formulir telah diubah.",
      "noAssistant": "Asisten prompt belum siap: unduh modelnya di Model dan pengaturan (ikon roda gigi di header).",
      "noAssistantLink": "Unduh di Model",
      "noAssistantNote": "Asisten prompt membutuhkan modelnya.",
      "placeholder": {
        "ace_step": "Dalam satu frasa: musik apa yang Anda inginkan",
        "stable_audio": "Dalam satu frasa: apa yang harus terdengar",
        "yue2": "Dalam satu frasa: tentang apa lagunya"
      },
      "replaces": "Menggantikan isi formulir saat ini",
      "settings": "Pengaturan",
      "stop": "Berhenti",
      "stopping": "Menghentikan…",
      "undo": "Kembalikan yang tadi",
      "write": "Tulis lirik dan gayanya",
      "writeSa": "Tulis deskripsinya",
      "writeShort": "Tulis",
      "writing": "Asisten sedang menulis…",
      "written": "Dimasukkan ke formulir di bawah.",
      "writtenOther": "Dimasukkan ke formulir {name}.",
      "saKind": "Tulis",
      "saKinds": {
        "auto": "Otomatis: sesuai ide",
        "music": "Trek musik",
        "instrument": "Instrumen solo",
        "one_shot": "Sampel one-shot",
        "sfx": "Efek suara"
      }
    },
    "lessDetails": "Lebih sedikit",
    "live": {
      "failed": "Varian gagal: {name}. {reason}",
      "queue": "Varian dalam antrean: {n}",
      "ready": "Varian siap: {name}",
      "readyMany": "Varian siap: {n}, {name}"
    },
    "loading": "Memuat lagu…",
    "making": "Membuat",
    "menu": {
      "made": "Dibuat {when}, durasi {len}",
      "midi": "Ke MIDI",
      "rename": "Ganti nama",
      "stems": "Pisahkan jadi stem",
      "took": "butuh {s} dtk"
    },
    "models": "Model",
    "more": "Detail dan aksi",
    "pause": "Jeda",
    "peek": {
      "copied": "Tersalin",
      "copy": "Salin",
      "lines": "{n} baris",
      "lyrics": "Lirik",
      "noLyrics": "Tanpa lirik",
      "style": "Gaya",
      "tags": "{n} tag"
    },
    "period": "Periode",
    "periodHint": {
      "all": "Semua yang sudah dibuat sejauh ini.",
      "today": "Varian yang dibuat hari ini. Yang diberi bintang berkumpul di Favorit dalam pustaka.",
      "week": "Varian dari tujuh hari terakhir."
    },
    "periods": {
      "all": "Semua",
      "today": "Hari ini",
      "week": "7 hari"
    },
    "play": "Putar",
    "position": "Posisi dalam lagu",
    "queued": "Antre",
    "reuse": "Muat ke formulir",
    "reuseInForm": "Muat ke formulir",
    "session": "Sesi",
    "showAll": "Tampilkan semua: {n}",
    "showMore": "Tampilkan lebih banyak: {n}",
    "startAndCreate": "Jalankan {name} dan buat",
    "startFailed": "{name} gagal dijalankan.",
    "startingEngine": "Menjalankan {name}…",
    "startsOnCreate": "{name} sedang tidak berjalan. Ia dijalankan saat Anda menekan Buat; varian pertama setelah dijalankan lebih lama.",
    "startsOnCreateOther": "{other} sedang memegang GPU. {name} dijalankan saat Anda menekan Buat, dan {other} berhenti. Varian pertama setelah dijalankan lebih lama.",
    "stop": "Berhenti",
    "stopAsk": "Berhenti?",
    "stopConfirm": "Tekan lagi untuk berhenti: yang sudah dibuat akan hilang",
    "stopped": "Dihentikan.",
    "styleAndLyrics": "Gaya dan lirik",
    "takeN": "Varian {n}",
    "takeTitle": "{title}, varian {n}",
    "takes": "Varian: {n}",
    "toSession": "Ke daftar sesi, varian: {n}",
    "untitled": "Tanpa judul",
    "wholeLibrary": "Seluruh pustaka"
  },
  "favorite": {
    "add": "Tambahkan ke favorit",
    "remove": "Hapus dari favorit"
  },
  "header": {
    "create": "Buat",
    "desc": {
      "create": "Lagu, instrumental, dan suara",
      "library": "Semua lagu: dibuat, diunggah, dan dari editor"
    },
    "gpuFree": "GPU kosong",
    "home": "Beranda",
    "languageCurrent": "Bahasa antarmuka: {name}",
    "library": "Pustaka",
    "more": "Lainnya: bahasa, model, bantuan",
    "guide": {
      "mapTitle": "Bagian-bagian aplikasi",
      "map": {
        "idea": "Cara termudah untuk masuk, langsung di beranda: satu frasa lalu Gubah, dan model bahasa lokal menulis prompt untuk engine. Edit lalu buat lagunya.",
        "lora": "Fine-tune ACE-Step dengan lagu Anda sendiri: unggah audio, beri label otomatis, periksa keterangan, latih, dan ekspor. Dibuka di halaman Buat, di bawah ACE-Step; adapter yang jadi muncul di formulir ACE-Step.",
        "yue": "Engine kedua: menulis lagu utuh dengan vokal dan bisa menyusunnya di sekitar melodi yang diberikan (tab Melodi, dengan SheetSage2). Juga mengubah lagu menjadi MIDI."
      },
      "gpu": [
        "Engine tidak muat di GPU bersamaan, jadi hanya satu yang berjalan pada satu waktu. Engine dipilih di halaman Buat dan dijalankan saat Anda menekan Buat di formulirnya; yang sedang berjalan berhenti.",
        "Start pertama butuh beberapa menit karena model dimuat ke memori video. Tombol status di header menunjukkan engine yang ada di GPU dan seberapa penuh memori video; klik untuk melihat siapa memakai berapa banyak memori, tombol Bongkar, dan jalan ke Model.",
        "Membongkar menghentikan pembuatan atau pelatihan yang sedang berjalan, jadi tombolnya bertanya dulu."
      ],
      "steps": [
        {
          "title": "Buka ACE-Step",
          "text": "Buka Buat dan pilih ACE-Step. Ia dijalankan pada penekanan Buat pertama; start pertama butuh beberapa menit."
        },
        {
          "title": "Deskripsikan lagunya",
          "text": "Di tab Lagu, Dari deskripsi: beberapa frasa sudah cukup, genre, suasana, tentang apa liriknya. Pilih durasi dan jumlah varian."
        },
        {
          "title": "Pilih varian terbaik",
          "text": "Varian berbaris di daftar sesi di samping formulir (di bawahnya di ponsel). Semua yang dibuat tersimpan otomatis ke pustaka."
        },
        {
          "title": "Pisahkan jadi stem",
          "text": "Vokal, drum, bass, dan lainnya dengan satu klik: Pisahkan jadi stem di menu sebuah varian, tab Stem dan not di pustaka, atau langsung di editor."
        },
        {
          "title": "Susun di editor",
          "text": "Tata stem di trek, tambahkan bagian dengan arranger AI, atur efeknya."
        },
        {
          "title": "Ekspor",
          "text": "Mixdown ke WAV atau MP3, atau ekspor trek dengan proyek Reaper atau DAWproject."
        }
      ],
      "compare": [
        {
          "label": "Paling cocok untuk",
          "ace": "Lagu dan instrumental cepat, banyak varian berturut-turut",
          "yue": "Satu lagu utuh dengan vokal sekali jalan",
          "sa3": "Instrumental, efek suara, dan sampel; mengisi dan melanjutkan audio di editor"
        },
        {
          "label": "Bekerja dari sebuah lagu",
          "ace": "Cover, repaint satu bagian, tambah bagian, ekstrak bagian, lanjutkan",
          "yue": "Lagu mengikuti melodi lagu lain: tab Melodi, dengan SheetSage2 atau berkas MIDI",
          "sa3": "Repaint satu rentang, lanjutkan, cover dalam gaya lain (audio ke audio); tanpa bagian di atas mix"
        },
        {
          "label": "Gaya Anda sendiri",
          "ace": "LoRA yang dilatih dari lagu Anda",
          "yue": "Tidak",
          "sa3": "Tidak (dukungan LoRA direncanakan)"
        },
        {
          "label": "Durasi",
          "ace": "10 sampai 300 detik, 1, 2, atau 4 varian per proses",
          "yue": "Selama yang dibutuhkan lirik, atau 1 sampai 8 menit; 1 sampai 4 varian per proses",
          "sa3": "Sampai 6 menit (medium) atau 2 menit (small); 1, 2, atau 4 varian per proses, detik per proses"
        },
        {
          "label": "MIDI",
          "ace": "Tidak",
          "yue": "Lagu atau stem ke MIDI (MuScriptor)",
          "sa3": "Tidak"
        },
        {
          "label": "Lisensi",
          "ace": "MIT: penggunaan komersial diizinkan; periksa syarat terbaru sebelum Anda merilis",
          "yue": "Hanya penggunaan nonkomersial",
          "sa3": "Stability AI Community License: gratis di bawah 1 juta USD per tahun; hanya instrumental, tanpa vokal"
        }
      ]
    },
    "helpSections": {
      "idea": {
        "title": "Menggubah dari sebuah ide",
        "text": "Di beranda, deskripsikan lagu, instrumental, atau suara dalam satu dua kalimat dan pilih engine; bahasa lirik dan siapa yang menulis prompt ada di Lainnya. Pada Gubah, asisten prompt, model Qwen3.5 lokal, menulis prompt dalam format engine: tag gaya, lirik per bagian, tempo, dan nada dasar. Edit, buat, atau buka di formulir engine. Suara melewati asisten dan langsung ke Stable Audio. Di halaman Buat, ide yang sama ada di baris ide di atas formulir dan menulis langsung ke dalamnya. Model dan perangkat asisten diatur di Model dan pengaturan."
      },
      "engines": {
        "text": "Tiga engine menghasilkan audio, ACE-Step 1.5, YuE2-3B, dan Stable Audio 3, dan tidak muat di satu GPU bersamaan, jadi hanya satu yang berjalan pada satu waktu. Pilih engine di halaman Buat: ia dijalankan saat Anda menekan Buat, dan yang sedang berjalan berhenti sendiri. Lampu menunjukkan statusnya; start pertama bisa butuh beberapa menit karena model dimuat ke memori video. Tombol status di header menunjukkan apa yang memegang GPU dan bisa membongkarnya."
      },
      "ace": {
        "text": "Di tab Lagu, deskripsikan musik dengan kata biasa (Dari deskripsi) atau berikan tag gaya dan lirik dengan penanda [Verse] / [Chorus] (Lirik dan gaya sendiri), atau centang Tanpa vokal. Di tab Dari sebuah lagu, lagu referensi dipakai untuk membuat cover, repaint satu bagian, mengekstrak atau menambah bagian, atau menyelesaikan komposisi. Durasi 10-300 dtk, dengan 1, 2, atau 4 varian per proses. Penyetelan punya Sederhana (langkah, durasi, tempo, mode, format) dan Manual (setiap parameter); LoRA yang sudah dilatih diaktifkan di sana, dengan kekuatan 0 sampai 1."
      },
      "yue": {
        "text": "YuE2-3B menulis lagu utuh dengan vokal. Tab Lagu berisi lirik, gaya, durasi, dan kualitas. Tab Melodi mengatur rencana melodi: Tanpa rencana langsung ke audio, Ikuti melodi mempertahankan melodi yang diberikan dan mengarang iringan, Melodi dan akor menulis dulu rencana untuk keduanya. SheetSage2 (Dari sebuah lagu…) menuliskan melodi sebuah lagu sebagai partitur ABC, yang bisa Anda edit dan berikan kembali ke YuE2."
      },
      "sa3": {
        "text": "Stable Audio 3 membuat musik instrumental dan efek suara dari deskripsi dalam hitungan detik: pilih Musik atau Suara, deskripsikan seperti pustaka sampel (genre, instrumen, suasana, tempo, atau sumber suara dan cara terjadinya), atur durasi dan jumlah varian. Tidak ada vokal. Engine yang sama melayani arranger AI dan Sampel di editor, tempat ia melakukan repaint, melanjutkan, dan membuat cover dengan mendengarkan audio di kedua sisi rentang. Bobot utamanya bersyarat (gated): setujui lisensi di Hugging Face, simpan token Anda, dan unduh model di Model dan pengaturan."
      },
      "lora": {
        "text": "Pelatihan LoRA ada di bawah ACE-Step di halaman Buat, di samping Buat (di ponsel, sebuah sakelar di atas formulir). Pelatihan memerlukan ACE-Step berjalan, dan halaman menawarkan untuk menjalankannya. Halaman ini memandu seluruh alur fine-tuning: unggah audio, pelabelan otomatis, tinjau dan edit deskripsi, praproses, pelatihan dengan progres langsung, dan ekspor. Adapter yang sudah jadi ditambahkan ke daftar LoRA di formulir ACE-Step."
      },
      "stems": {
        "text": "Lagu tersimpan mana pun bisa dipisahkan menjadi empat stem (vokal, drum, bass, lainnya) dengan satu klik: Pisahkan jadi stem di menu sebuah varian, tab Stem dan not di pustaka, atau sebuah trek di editor. Stem bisa dibuka di editor sebagai proyek empat trek yang siap pakai. Transkripsi MIDI (MuScriptor) bekerja pada mix penuh atau satu stem; ia berjalan di engine YuE2, jadi YuE2 harus terpasang."
      },
      "arranger": {
        "text": "Tombol “Arranger AI” di editor membangun sebuah karya selangkah demi selangkah, bukan menghasilkannya utuh. “Tambah bagian” menulis bagian baru (drum, bass, pad, string, dan seterusnya) di atas trek yang dipilih, “Repaint” menulis ulang rentang yang lemah, “Lanjutkan” meneruskan lagu, “Cover” membuat versi baru dalam gaya lain. Setiap varian masuk ke trek tersendiri: dengarkan, simpan yang terbaik, lalu lanjut ke bagian berikutnya. Bagian ditambahkan oleh model dasar ACE-Step (sekitar 4,8 GB) atau versi dasar XL yang lebih besar (sekitar 20 GB, perlu kartu 16 GB); keduanya opsional, dan tanpa model dasar arranger menawarkan untuk memasangnya. Mode lainnya berjalan di turbo, atau di Stable Audio 3 bila Anda memilihnya sebagai engine: ia mengisi, melanjutkan, dan membuat cover dengan mendengarkan audio di sekitarnya, hanya instrumental."
      },
      "sfx": {
        "text": "Tombol “Sampel” di editor membuat one-shot (kick, hit, whoosh), loop pada tempo proyek, dan tekstur (hujan, keramaian, drone) dengan Stable Audio 3, dari deskripsi singkat. Hasilnya berderet dalam satu strip: dengarkan dulu, lalu tambahkan yang Anda suka ke trek baru atau ke trek terpilih pada posisi playhead. Loop dipotong menjadi birama utuh tetapi model tidak menjamin sambungan yang mulus, jadi periksa dengan diputar berulang. “Hapus dari daftar” menghapus suara dari tugas tersebut dari pustaka dan disk, kecuali yang saat itu ada di sebuah trek."
      }
    }
  },
  "home": {
    "allTracks": "Seluruh pustaka",
    "compose": "Gubah",
    "composeHere": "Asisten menulis prompt untuk engine yang dipilih; Anda bisa mengeditnya sebelum membuat",
    "composeSound": "Asisten menulis prompt suara beserta durasinya, Stable Audio membuatnya",
    "engineLabel": "Engine",
    "engines": "Atau langsung ke sebuah engine",
    "firstText": "Deskripsikan sebuah lagu atau ambil contoh:",
    "firstTitle": "Lagu-lagu Anda akan muncul di sini",
    "guide": "Cara kerja menggubah",
    "kind": {
      "instrumental": "Instrumental",
      "song": "Lagu dengan vokal",
      "sound": "Suara"
    },
    "kindLabel": "Apa yang dibuat",
    "lead": "Semuanya berjalan di komputer ini",
    "loading": "Memuat lagu",
    "more": "Lainnya",
    "needPhrase": "Deskripsikan musiknya dulu",
    "title": "Mau bikin apa?",
    "phraseLabel": "Deskripsikan musiknya",
    "placeholderSound": "hujan di atap seng pada malam hari, dekat dan tenang",
    "soundBySa3": "Suara dibuat oleh Stable Audio",
    "soundMissing": "Stable Audio belum terpasang"
  },
  "keyScale": {
    "hint": "ACE-Step hanya mengenal mayor dan minor. Untuk tangga nada ini ia menerima nada dasar terdekat ({key}) dan nama tangga nada dalam deskripsi: sebuah petunjuk, bukan jaminan.",
    "mode": "Tangga nada",
    "modes": {
      "blues": "Blues",
      "dorian": "Dorian",
      "double_harmonic": "Harmonik ganda",
      "harmonic_minor": "Minor harmonik",
      "hungarian_minor": "Minor Hungaria",
      "locrian": "Locrian",
      "lydian": "Lydian",
      "major": "Mayor (Ionian)",
      "major_pentatonic": "Pentatonik mayor",
      "melodic_minor": "Minor melodik",
      "minor": "Minor natural (Aeolian)",
      "minor_pentatonic": "Pentatonik minor",
      "mixolydian": "Mixolydian",
      "phrygian": "Phrygian",
      "phrygian_dominant": "Phrygian dominan"
    },
    "needTonic": "Pilih nada dasarnya dulu",
    "none": "Tangga nada itu tidak ada",
    "notSet": "belum diatur",
    "search": "Ketik untuk mencari",
    "tonic": "Nada dasar"
  },
  "libraryPage": {
    "aiPart": "Bagian dari arranger AI",
    "collectionName": "Nama koleksi",
    "confirmDeleteCollection": "Hapus koleksi?",
    "cot": {
      "full": "melodi dan akor",
      "melody": "mengikuti melodi"
    },
    "delete": "Hapus",
    "deleteCollection": "Hapus koleksi (lagunya tetap ada)",
    "deleteFailed": "Tidak bisa menghapus: {error}",
    "emptyCollection": "Buka sebuah lagu dan tambahkan ke koleksi ini di tab Tentang.",
    "emptyFavorites": "Tandai lagu dengan bintang dan ia muncul di sini.",
    "emptyHere": "Belum ada apa-apa di sini",
    "emptyHint": "Lagu yang Anda buat dan unggah berkumpul di sini.",
    "facts": {
      "file": "Berkas",
      "madeIn": "Dibuat di",
      "melody": "Melodi",
      "model": "Model"
    },
    "filters": {
      "all": "Semua lagu",
      "favorites": "Favorit",
      "midi": "Not (MIDI)",
      "score": "Partitur",
      "stems": "Stem",
      "today": "Hari ini"
    },
    "filtersLabel": "Filter pustaka",
    "groups": {
      "collections": "Koleksi",
      "has": "Isi lagu",
      "origin": "Dibuat oleh",
      "tags": "Tag"
    },
    "loadFailed": "Pustaka tidak bisa dimuat.",
    "newCollection": "+ Koleksi baru",
    "newest": "Terbaru dulu",
    "noCollections": "Belum ada koleksi: buat yang pertama dengan Koleksi baru.",
    "nothingFound": "Tidak ditemukan",
    "nothingFoundHint": "Coba kata atau filter lain.",
    "oldest": "Terlama dulu",
    "order": "Urutan",
    "origins": {
      "editor": "Editor",
      "upload": "Diunggah"
    },
    "period": "Periode",
    "pick": "Pilih sebuah lagu: lirik, gaya, stem, dan not-nya tampil di sini.",
    "renameCollection": "Ganti nama koleksi",
    "retry": "Coba lagi",
    "reuseHint": "Membuka Buat dengan lirik, gaya, dan pengaturan ini",
    "search": "Judul, gaya, atau satu baris lirik",
    "showAll": "Tampilkan semua lagu",
    "sub": {
      "editor": "Dari editor",
      "engine": "Tanpa deskripsi",
      "upload": "Berkas yang diunggah"
    },
    "tabs": {
      "about": "Tentang",
      "lyrics": "Lirik",
      "parts": "Stem dan not"
    },
    "take": "Varian {n}",
    "title": "Pustaka",
    "toCreate": "Buat lagu pertama",
    "today": "Hari ini",
    "yesterday": "Kemarin",
    "bulk": {
      "addTag": "Tambahkan #{tag}",
      "clear": "Hapus pilihan (Esc)",
      "collected": "{n} lagu ditambahkan ke «{name}» | {n} lagu ditambahkan ke «{name}»",
      "collection": "Koleksi",
      "favorited": "{n} lagu ditambahkan ke favorit | {n} lagu ditambahkan ke favorit",
      "label": "Aksi untuk lagu yang dipilih",
      "newCollection": "Koleksi baru…",
      "noTags": "Belum ada tag: ketik satu dan tekan Enter.",
      "selectAll": "Pilih semua: {n}",
      "selectSong": "Pilih «{title}» beserta take-nya: {n}",
      "selectTrack": "Pilih «{title}»",
      "selected": "Dipilih: {n}",
      "tag": "Tag",
      "tagPlaceholder": "Tag baru, atau cari",
      "tagged": "#{tag} ditambahkan ke {n} lagu | #{tag} ditambahkan ke {n} lagu",
      "uncollected": "{n} lagu dikeluarkan dari «{name}» | {n} lagu dikeluarkan dari «{name}»",
      "unfavorited": "{n} lagu dihapus dari favorit | {n} lagu dihapus dari favorit",
      "untagged": "#{tag} dilepas dari {n} lagu | #{tag} dilepas dari {n} lagu"
    },
    "emptyTag": "Tambahkan tag ini ke sebuah lagu di tab Tentang, atau ke beberapa sekaligus lewat bilah pilihan.",
    "tags": {
      "add": "Tambahkan tag dan tekan Enter",
      "added": "Tag #{tag} ditambahkan",
      "confirmDelete": "Hapus tag?",
      "delete": "Lepas tag dari semua lagu",
      "remove": "Hapus tag #{tag}",
      "removed": "Tag #{tag} dihapus",
      "rename": "Ganti nama tag"
    },
    "trash": {
      "confirmEmpty": "Hapus semuanya secara permanen?",
      "confirmPurge": "Hapus secara permanen?",
      "deleted": "Dihapus: {when}",
      "dismiss": "Sembunyikan pemberitahuan",
      "emptied": "Sampah sekarang kosong",
      "empty": "Kosongkan sampah",
      "emptyHere": "Sampah kosong",
      "emptyHint": "Lagu yang dihapus menunggu di sini selama 30 hari, kalau-kalau kamu butuh salah satunya.",
      "loadFailed": "Gagal memuat sampah: {error}",
      "moveHint": "Memindahkan lagu ke sampah: bisa dipulihkan dari sana selama 30 hari",
      "moved": "{n} lagu dipindahkan ke sampah | {n} lagu dipindahkan ke sampah",
      "note": "Lagu di sampah dihapus permanen setelah 30 hari.",
      "purge": "Hapus selamanya",
      "purged": "{n} lagu dihapus permanen | {n} lagu dihapus permanen",
      "restore": "Pulihkan",
      "restored": "{n} lagu dipulihkan | {n} lagu dipulihkan",
      "title": "Sampah",
      "undo": "Urungkan"
    }
  },
  "midiPanel": {
    "betterWithVocals": "Bekerja dari mix penuh; untuk melodi yang tepat, pisahkan lagu menjadi stem dan kenali vokalnya lebih dulu.",
    "scoreEmpty": "MIDI tidak punya not untuk dibuat menjadi partitur.",
    "scoreFromFull": "dari mix penuh",
    "scoreFromStems": "melodi dari vokal, iringan dari bass dan sisanya",
    "scoreFromVocals": "melodi dari vokal",
    "scoreInserted": "Partitur ada di formulir YuE2 ({from}).",
    "toScore": "Ke partitur YuE2",
    "toScoreHint": "Mengubah not menjadi partitur ABC untuk YuE2 dan memasukkannya ke formulirnya: vokal menjadi melodi, bass dan sisanya menjadi iringan dan akor."
  },
  "miniWave": {
    "percent": "{n}%",
    "timeOf": "{pos} dari {total}"
  },
  "models": {
    "check": "Periksa",
    "checkBad": "Rusak atau hilang: {files}. Unduh ulang bagian ini.",
    "checkFailed": "Tidak bisa memeriksa: {error}",
    "checkOffline": "Hugging Face tidak bisa dijangkau, jadi hanya ukuran yang dibandingkan.",
    "checkOkHash": "Semua {n} berkas utuh; {h} cocok dengan SHA-256 yang dicantumkan Hugging Face.",
    "checkOkRecord": "Semua {n} berkas cocok dengan catatannya menurut ukuran.",
    "checkOkSize": "Semua {n} berkas utuh (diperiksa lewat ukuran dan struktur; tidak ada daftar checksum untuk dibandingkan).",
    "checkOutdated": "Utuh, tetapi repositori kini memegang versi lebih baru dari: {files}. Unduh ulang untuk mendapatkannya.",
    "checkTitle": "Periksa apakah berkasnya utuh",
    "checking": "Memeriksa…",
    "parts": {
      "yue2-bf16": {
        "name": "YuE2 bf16",
        "text": "Model tanpa kuantisasi. Butuh memori video lebih banyak daripada q8_0 (paling banyak dari ketiganya)."
      }
    },
    "reinstall": "Unduh ulang",
    "reinstallAsk": "Ambil {gb} GB lagi?",
    "reinstallNamed": "Unduh ulang {name}",
    "reinstallNo": "Pertahankan",
    "reinstallTitle": "Unduh lagi dan ganti berkasnya",
    "reinstallYes": "Unduh ulang",
    "yue2": {
      "noSettings": "Presisi q8_0, q4_0, atau bf16 dipilih untuk setiap pembuatan di formulir YuE2, lewat Kualitas."
    }
  },
  "params": {
    "changed": "Diubah",
    "consoleNote": "Nilai yang diatur manual ditandai. Sisanya memakai bawaan.",
    "consoleTitle": "Konsol {name}",
    "default": "Bawaan: {v}",
    "quick": "Pilihan cepat: {group}",
    "reset": "Kembali ke bawaan",
    "resetOne": "Kembalikan {name} ke bawaan",
    "simple": {
      "more": "Lainnya: {n}",
      "normal": "Biasanya: {n}",
      "steps": "Langkah dekode",
      "stepsHint": "Lebih banyak langkah butuh waktu lebih lama."
    }
  },
  "player": {
    "close": "Tutup pemutar",
    "label": "Pemutar",
    "next": "Lagu berikutnya",
    "prev": "Lagu sebelumnya (ke awal lagu, jika sedang diputar)"
  },
  "presets": {
    "button": "Preset",
    "confirmDelete": "Klik lagi untuk menghapus {name}",
    "deleteAsk": "Hapus?",
    "deleteOne": "Hapus preset {name}",
    "none": "Belum ada preset tersimpan.",
    "saveCurrent": "Simpan formulir sebagai preset",
    "title": "Preset: kumpulan pengaturan formulir yang tersimpan"
  },
  "resources": {
    "ramOf": "RAM {used} dari {total} GB",
    "state": {
      "error": "{model} melaporkan galat",
      "running": "{model} sedang berjalan",
      "starting": "{model} sedang dijalankan",
      "stopping": "{model} sedang berhenti"
    },
    "vramOf": "Memori video {used} dari {total} GB",
    "holder": {
      "cover": "Sampul (Z-Image Turbo)"
    }
  },
  "sa3Gen": {
    "badGuidanceWindow": "Panduan berhenti pada tingkat derau yang lebih tinggi dari awalnya: turunkan “berhenti di” atau naikkan “mulai di”.",
    "formTabs": "Bagian formulir",
    "kindLabel": "Jenis audio",
    "lengthFromRef": "Lagu referensi menentukan durasinya:",
    "lengthOwn": "sendiri: {v}",
    "lengthSeconds": "{n} dtk",
    "manual": {
      "apg": "Porsi APG",
      "autoTags": "Tag layanan",
      "cfg": "Kedekatan dengan deskripsi",
      "cfgStartsAt": "Panduan mulai pada tingkat derau",
      "cfgStopsAt": "Panduan berhenti pada tingkat derau",
      "chunked": "Dekode per bagian",
      "chunkedAuto": "Otomatis",
      "duration": "Durasi",
      "fromRef": "ditentukan lagu referensi",
      "guidanceSub": "bagaimana deskripsi mengarahkan suara; tingkat derau turun dari 1 ke 0 selama proses",
      "guidanceTitle": "Panduan",
      "needCfg": "bila Kedekatan dengan deskripsi bukan 1",
      "needTwo": "dengan dua varian atau lebih",
      "negative": "Yang dihindari",
      "normThreshold": "Batas untuk satu langkah panduan",
      "off": "Tidak",
      "on": "Ya",
      "padding": "Ruang tambahan durasi",
      "perVariant": "Satu deskripsi per varian",
      "resultSub": "durasi dan deskripsi",
      "resultTitle": "Hasil",
      "sampler": "Sampler",
      "samplerAuto": "bawaan (pingpong)",
      "samplerAutoBase": "bawaan model",
      "samplerLoud": "Lebih keras dari biasanya dan terpotong: dalam satu uji coba 1-2% suara mencapai batas atas.",
      "samplerQuiet": "Sekitar 7 dB lebih pelan dari biasanya.",
      "samplerSub": "cara tiap langkah dihitung",
      "samplerTitle": "Sampler",
      "scalePhi": "Lembutkan panduan",
      "textOnly": "hanya tanpa lagu referensi",
      "trim": "Potong keheningan di awal"
    },
    "modelsAfterStart": "Daftar model tampil setelah engine berjalan.",
    "queuedNote": "Varian dalam antrean: {n}",
    "ref": {
      "modeLabel": "Apa yang dilakukan pada referensi",
      "off": "Aktifkan untuk bekerja dari lagu jadi: buat ulang, ulangi satu rentang, atau lanjutkan."
    },
    "simple": {
      "tagsOff": "Jangan tambahkan",
      "tagsOn": "Tambahkan"
    },
    "submitKind": {
      "music": "Buat musik",
      "sfx": "Buat suara"
    },
    "tabChanged": "diubah",
    "tabs": {
      "ref": "Dari sebuah lagu",
      "sound": "Deskripsi",
      "tuning": "Penyetelan"
    },
    "advancedHint": "Dadu di samping seed membuatnya acak lagi; sebuah angka mengulang suara itu. Model pasca-latih disetel untuk 8 langkah dan kedekatan 1; Yang dihindari dan grup Panduan hanya bekerja bila Kedekatan dengan deskripsi bukan 1.",
    "advancedHintBase": "Checkpoint base: mulai dari 50 langkah dan kedekatan 7, jadi Yang dihindari berfungsi; coba “poor quality” di sana.",
    "help": {
      "tips": [
        "Musik: genre, instrumen dan bunyi masing-masing, suasana dan energi, tempo dalam BPM.",
        "Suara: apa yang membuatnya, bagaimana terjadinya dan berapa lama, di mana mikrofon dan bagaimana bunyi ruangannya.",
        "Tag membantu: TrackType: Music, VocalType: Instrumental, Genre: Funk, Instruments: Guitar, Saxophone; TrackType: Instrument untuk bagian solo; TrackType: SFX untuk suara.",
        "Tanpa vokal: model membuat instrumental; prompt vokal paling banter menghasilkan tekstur tanpa kata.",
        "Ketik seed untuk mengulang hasil; dengan dadu ditekan setiap varian mendapat seed baru."
      ]
    },
    "translateBtn": "Terjemahkan saja",
    "translateHint": "Stable Audio hanya memahami bahasa Inggris: asisten bisa menulis prompt bahasa Inggris dari teks Anda, atau sekadar menerjemahkannya.",
    "translateNoAssistant": "Asisten prompt belum siap: unduh modelnya di Model.",
    "translateRunning": "Menerjemahkan…",
    "translateStopping": "Menghentikan…",
    "translateStop": "Hentikan",
    "translateDone": "Diterjemahkan ke bahasa Inggris.",
    "translateUndo": "Kembalikan",
    "composeBtn": "Tulis prompt",
    "composeTitle": "Asisten mengubah deskripsi dalam bahasa apa pun menjadi prompt untuk Stable Audio: genre, instrumen, suara, tempo, dan durasi",
    "composeRunning": "Menulis prompt…",
    "composeDone": "Prompt untuk Stable Audio sudah jadi."
  },
  "tagInput": {
    "cleared": "Semua tag dihapus",
    "removeTag": "Hapus {tag}",
    "removed": "{tag} dihapus",
    "restored": "Tag dipulihkan",
    "undo": "Urungkan",
    "undoTitle": "Kembalikan tag yang dihapus"
  },
  "yueGen": {
    "help": {
      "advanced": {
        "choices": [
          "Kualitas (tab Lagu): Draf adalah model q4_0, Normal q8_0, Akhir bf16 dengan 32 langkah dekode dan kedekatan dengan gaya 1,2.",
          "Durasi (tab Lagu): menit berubah menjadi Tidak lebih pendek dari dan Tidak lebih panjang dari; model membuat 25 token per detik suara.",
          "Nyanyian: Lebih stabil adalah Keberanian 0,85, Lebih berani 1,1.",
          "Pengulangan: Lebih sedikit adalah Penalti pengulangan 1,3 dengan Memori pengulangan 80.",
          "Partitur: Lebih hati-hati adalah Keberanian partitur 0,55."
        ],
        "choicesIntro": "Pilihan ini mengatur nilai yang sama dengan perbaikan di bawah, dalam satu klik.",
        "choicesTitle": "Pilihan di dalam tab",
        "title": "Penyetelan",
        "lead": "Anda boleh membiarkannya: apa pun yang tidak Anda ubah memakai bawaan engine, tampil di setiap baris di Manual. Pengaturan ini penting saat sebuah lagu terus keluar salah: terpotong, berputar, fals. Temukan kasus Anda di bawah dan tekan Terapkan: angka yang tepat masuk ke kolom dengan sendirinya.",
        "fixes": [
          {
            "id": "cutoff",
            "problem": "Lagu terpotong sebelum lirik selesai",
            "fix": "Tidak lebih panjang dari: 12000 token, batas durasi sekitar 8 menit, bukan 6."
          },
          {
            "id": "offbrief",
            "problem": "Suara tidak cocok dengan tag",
            "fix": "Kedekatan dengan gaya: 1,2, agar model mengikuti deskripsi lebih ketat. Jika itu tidak membantu, masalahnya ada di tag itu sendiri."
          },
          {
            "id": "loop",
            "problem": "Satu frasa berputar terus",
            "fix": "Penalti pengulangan 1,3 dan Memori pengulangan 80: penalti pengulangan lebih kuat dan ingatan lebih panjang."
          },
          {
            "id": "offkey",
            "problem": "Not fals, suara pecah, derau",
            "fix": "Keberanian 0,85 dan 32 langkah dekode: kurang berani, lebih banyak lintasan untuk merender audio."
          },
          {
            "id": "melody",
            "problem": "Melodi tidak koheren",
            "fix": "Jika rencana nonaktif, ia beralih ke Melodi dan akor (rencana yang sudah Anda pilih tetap), dan Partitur menjadi Lebih hati-hati (Keberanian partitur 0,55), jadi partitur ditulis lebih cermat. Atau ambil melodi dari sebuah lagu di tab Melodi: partitur yang diberikan menggantikan rencana, dan saat itu hanya pilihan rencana yang berpengaruh."
          },
          {
            "id": "same",
            "problem": "Semua varian terdengar mirip",
            "fix": "Mengaktifkan seed acak. Jika belum cukup, Keberanian 1,1."
          },
          {
            "id": "final",
            "problem": "Saya ingin render akhir",
            "fix": "Kualitas: Akhir, model bf16 (bila sudah diunduh), 32 langkah dan kedekatan dengan gaya 1,2. Buat 2–3 varian dan simpan yang terbaik."
          }
        ],
        "fieldsIntro": "Di bawah setiap kolom ada skala nilai khas: tanda di atasnya adalah bawaan untuk audio, tanda di bawahnya untuk partitur (hanya dengan rencana melodi dan tanpa partitur yang diberikan). Partitur butuh ketelitian, audio butuh kehidupan, maka bawaannya berbeda.",
        "groups": [
          {
            "title": "Akurasi dan kualitas",
            "fields": [
              {
                "key": "cfg_scale",
                "name": "Kedekatan dengan gaya (CFG)",
                "text": "Seberapa patuh model mengikuti tag gaya. Seperti volume suara Anda di telinga musisi: pelan — mereka bermain lebih bebas, keras — lebih dekat ke arahan, tetapi lebih kaku.",
                "left": "lebih bebas",
                "right": "lebih ketat ke tag",
                "when": "1,2 jika suara nyaris tidak cocok dengan deskripsi. Di atas 1,5 — artefak dan suara “plastik”."
              },
              {
                "key": "num_inference_steps",
                "name": "Langkah dekode",
                "text": "Berapa lintasan yang dilakukan model untuk mengubah rencananya menjadi audio jadi. Seperti lapisan cat: 8 adalah sketsa cepat, 32 lapisan akhir yang bersih.",
                "left": "lebih cepat",
                "right": "lebih bersih",
                "when": "8 untuk draf, 32 untuk hasil akhir. Bedanya nyaris tak terdengar (sekitar 4 dtk per lagu di RTX 4080); lebih dari 32 suaranya hanya berubah, tidak membaik."
              }
            ]
          },
          {
            "title": "Karakter penampilan",
            "fields": [
              {
                "key": "temperature",
                "name": "Keberanian (temperature)",
                "text": "Keberanian model (minimal 0,01: nol menghentikan engine). Rendah — bermain “sesuai buku”, rata dan terduga; tinggi — berimprovisasi, kadang brilian, kadang fals.",
                "left": "lebih stabil",
                "right": "lebih berani",
                "when": "Fals: 0,85. Semua varian mirip: 1,1. Partitur aneh: 0,5–0,6 untuk partitur."
              },
              {
                "key": "repetition_penalty",
                "name": "Penalti pengulangan",
                "text": "Penalti untuk mengulang apa yang sudah dimainkan. Makin tinggi, makin keras model menghindari “piringan hitam macet”. Untuk partitur nilainya nyaris 1,0 — pengulangan itu wajar dalam notasi.",
                "left": "pengulangan boleh",
                "right": "tanpa pengulangan",
                "when": "Berputar: 1,3. Di bawah 1,1 ada risiko putaran monoton."
              }
            ]
          },
          {
            "title": "Durasi lagu",
            "fields": [
              {
                "key": "min_tokens",
                "name": "Tidak lebih pendek dari",
                "text": "Model tidak bisa selesai sebelum ini. Kira-kira 25 unit per detik: 200 ≈ 8 detik audio.",
                "left": "boleh pendek",
                "right": "tidak sebelum",
                "when": "Lagu berakhir sebelum semuanya dinyanyikan: naikkan."
              },
              {
                "key": "max_tokens",
                "name": "Tidak lebih panjang dari",
                "text": "Batas durasi. 9000 ≈ 6 menit lagu; formulir menerima sampai 15000. Lebih — menunggu lebih lama dan memori GPU lebih banyak.",
                "left": "lebih pendek",
                "right": "lebih panjang",
                "when": "Terpotong di tengah frasa: 12000."
              }
            ]
          }
        ],
        "rareIntro": "Pengaturan ini mengubah hal yang sama dengan Keberanian atau Penalti pengulangan, hanya lebih halus. Biasanya dibiarkan.",
        "rare": [
          {
            "key": "top_p",
            "name": "Batas pilihan langka (top-p)",
            "text": "Berapa banyak opsi “masuk akal” yang dipertimbangkan model di setiap langkah: 1 — semuanya, 0,5 — hanya yang paling jelas."
          },
          {
            "key": "top_k",
            "name": "Kandidat (top-k)",
            "text": "Batas keras jumlah opsi di setiap pilihan. Filter kedua di samping batas pilihan langka."
          },
          {
            "key": "penalty_window",
            "name": "Memori pengulangan",
            "text": "Seberapa jauh ke belakang model mengingat apa yang dimainkannya saat menghitung penalti pengulangan. 50 ≈ 2 detik audio. Naikkan ke 80 saat berputar."
          }
        ]
      },
      "melody": {
        "lead": "YuE2 bisa menyanyikan lirik mengikuti melodi yang Anda berikan. Partitur ABC menyimpannya: not yang ditulis sebagai teks. Dari partitur dalam format yang ditulis aplikasi, lagunya keluar dengan nada dasar yang sama, not nyanyian yang sama, dan durasi yang sama: dalam uji kami, not cocok 93–99 %.",
        "roll": [
          "Dengarkan memutar partitur di piano. Klik atau seret pada roll untuk memilih titik mulai, ⏮ kembali ke awal.",
          "Not merah muda adalah vokal (Vocal), yang biru adalah iringan (Ins). Nomor birama dan akor berjalan di bagian atas.",
          "Ctrl + roda mouse untuk zoom, ⤢ membuka jendela besar dengan tuts tiga oktaf.",
          "Notasi balok menampilkan partitur yang sama pada paranada; klik sebuah not untuk memutarnya."
        ],
        "rollTitle": "Roll dan not",
        "sources": [
          "Dari sebuah lagu… — pilih berkas audio dan SheetSage2 menuliskan melodi dan akornya. Lagu dengan vokal yang jelas paling bagus.",
          "Impor MIDI — suara tertinggi menjadi melodi, kanal lain menjadi iringan dan akor, dan nada dasar ditemukan otomatis. Simpan melodi vokal di trek tersendiri.",
          "Piano — pilih durasi dan tekan tuts (di bawah, di kiri roll, atau pada keyboard MIDI): not saling menyambung.",
          "Dari sebuah lagu jadi: Ke MIDI di menu sebuah varian, atau tab Stem dan not di pustaka, lalu Ke partitur YuE2. Vokal menjadi melodi, bass dan sisanya menjadi iringan."
        ],
        "sourcesTitle": "Dari mana melodi berasal",
        "tips": [
          "Satu not per suku kata: baris 8 suku kata butuh sekitar 8 not.",
          "Lagunya sepanjang notnya: 8 birama 4/4 pada 100 BPM sekitar 20 detik.",
          "Ikuti melodi: model mempertahankan melodi Anda dan mengarang iringan; Melodi dan akor: ia membangun keduanya dari partitur.",
          "Nada dasar atau tempo dalam gaya tidak berpengaruh: keduanya diambil dari not.",
          "Edit teks ABC manual hanya jika Anda tahu formatnya: model membaca paling baik tata letak yang ditulis aplikasi (suara Vocal dan Ins)."
        ],
        "tipsTitle": "Agar hasilnya dekat",
        "title": "Melodi dan partitur ABC"
      },
      "style": {
        "tips": [
          "Optimalnya 5–8 tag — lebih banyak mulai bertabrakan, lebih sedikit membuat hasil kurang terduga.",
          "Tulis tag dalam bahasa Inggris, tetapi mulai dengan bahasa lagunya (Russian, English, Spanish…): contoh dari engine sendiri semuanya begitu, dan alur ide menambahkannya untuk Anda.",
          "Dengan rencana melodi (Ikuti melodi atau Melodi dan akor) gaya tetap penting: ia menentukan warna suara dan aransemen, sedangkan melodi berasal dari partitur ABC."
        ]
      },
      "lyrics": {
        "tips": [
          "Dengan rencana melodi, ritme baris sebaiknya kira-kira cocok dengan partitur ABC (suku kata per birama); jika tidak, model harus meregangkan atau memampatkan kata agar pas dengan melodi.",
          "Baris pendek cocok dengan melodi lebih terduga daripada yang panjang.",
          "Ulangi refrein persis sama di setiap [Chorus] — ini menjaga garis melodi yang sama untuknya sepanjang lagu."
        ]
      },
      "cot": {
        "title": "Rencana melodi",
        "intro": "Rencana melodi menentukan apakah model menulis rencana musik sebelum audio, dan bagaimana ia memakai partitur ABC di tab Melodi.",
        "melodyNote": "Berikan melodi di partitur ABC di bawah rencana: Dari sebuah lagu… (SheetSage2), berkas MIDI, atau piano. Tanpa partitur, model menulis rencana khusus melodinya sendiri.",
        "precisionNote": "Presisi model (q8_0, q4_0, bf16) tidak ada hubungannya dengan rencana: Kualitas di tab Lagu yang mengaturnya. q4_0 menghemat memori video dengan sedikit penurunan kualitas, apa pun rencananya.",
        "abcFooter": "Cara termudah adalah tidak menulis ABC dari nol, tetapi mengambilnya dari lagu dengan Dari sebuah lagu… (SheetSage2), lalu merapikan manual birama yang perlu."
      }
    },
    "length": {
      "auto": "Otomatis",
      "autoHint": "Selama yang dibutuhkan lirik, sampai sekitar 6 menit.",
      "hint": "Sekitar {n} menit: lirik yang lebih pendek dinyanyikan dan dimainkan terus sampai durasi itu, yang lebih panjang dipotong di sana.",
      "label": "Durasi",
      "minutes": "{n} mnt",
      "ownHint": "Diatur manual di Penyetelan (Min / Max token)."
    },
    "lines": "Baris: {n}",
    "linesAbout": "Baris: {n}, sekitar {time}",
    "linesAboutHint": "Perkiraan dari lagu-lagu Anda sebelumnya: sekitar {s} dtk per baris. Untuk durasi Otomatis.",
    "manual": {
      "abcGiven": "partitur dari tab Melodi",
      "changed": "{n} dari {total} diubah",
      "console": "Konsol: semua grup sekaligus",
      "consoleTitle": "Konsol YuE2",
      "done": "Selesai",
      "groups": {
        "character": {
          "sub": "vokal dan musik",
          "title": "Karakter"
        },
        "length": {
          "sub": "25 token per detik",
          "title": "Durasi"
        },
        "repeats": {
          "sub": "melawan pengulangan",
          "title": "Pengulangan"
        },
        "score": {
          "sub": "cara model menulis rencana melodi",
          "title": "Partitur"
        },
        "sound": {
          "sub": "model dan dekode",
          "title": "Suara"
        }
      },
      "manual": "Manual",
      "params": {
        "cfg": "Kedekatan dengan gaya",
        "max_tokens": "Tidak lebih panjang dari",
        "min_tokens": "Tidak lebih pendek dari",
        "penalty_window": "Memori pengulangan",
        "precision": "Presisi model",
        "repetition_penalty": "Penalti pengulangan",
        "steps": "Langkah dekode",
        "temperature": "Keberanian",
        "top_k": "Kandidat",
        "top_p": "Batas pilihan langka"
      },
      "reset": "Atur ulang",
      "resetAll": "Atur ulang semua",
      "seconds": "{n} dtk",
      "seedRandom": "acak",
      "sends": "Dikirim ke engine",
      "sendsRest": "Nilai yang diatur manual ditandai. Yang tidak ada di baris ini diserahkan ke bawaan engine.",
      "simple": "Sederhana"
    },
    "perf": {
      "manualNow": "(sekarang diatur manual)",
      "repeats": {
        "hint": "Lebih sedikit, bila satu frasa berputar terus.",
        "label": "Pengulangan",
        "options": {
          "fewer": "Lebih sedikit",
          "normal": "Normal"
        }
      },
      "score": {
        "hint": "Lebih hati-hati, bila melodi melantur: model menulis partitur dengan lebih cermat.",
        "label": "Partitur",
        "options": {
          "careful": "Lebih hati-hati",
          "normal": "Normal"
        }
      },
      "temperature": {
        "hint": "Lebih stabil: lebih sedikit not fals dan suara pecah. Lebih berani: antarvarian lebih berbeda.",
        "label": "Nyanyian",
        "options": {
          "normal": "Normal",
          "steady": "Lebih stabil",
          "varied": "Lebih berani"
        }
      }
    },
    "planLabel": "Rencana melodi",
    "planNames": {
      "full": "Melodi dan akor",
      "melody": "Ikuti melodi",
      "off": "Tanpa rencana"
    },
    "qualityHints": {
      "draft": "Model {model} memakai lebih sedikit memori video, suaranya sedikit lebih polos: untuk mencoba ide.",
      "final": "Model {model}, 32 langkah dekode dan lebih dekat ke tag gaya (CFG 1,2): untuk lagu jadi. Buat 2–3 varian dan simpan yang terbaik. bf16 butuh memori video lebih banyak daripada q8_0 (berkasnya 7,3 GB dibanding 4,3 GB).",
      "normal": "Model {model} dengan pengaturan biasa: suara bagus tanpa menunggu lama.",
      "own": "Presisi, langkah, dan CFG diatur manual."
    },
    "qualityLabel": "Kualitas",
    "qualityNames": {
      "draft": "Draf",
      "final": "Akhir",
      "normal": "Normal",
      "own": "Sendiri"
    },
    "queued": "Dalam antrean, varian: {n}",
    "scoreGivenNote": "Partitur yang diberikan menggantikan rencana, jadi pengambilan sampel partitur tidak berpengaruh dan tidak dikirim.",
    "sections": {
      "bridge": "+ Bridge",
      "chorus": "+ Chorus",
      "outro": "+ Outro",
      "verse": "+ Verse"
    },
    "tabs": {
      "changed": "Berbeda dari bawaan",
      "melody": "Melodi",
      "song": "Lagu",
      "tuning": "Penyetelan"
    },
    "takes": "Varian",
    "tuningTitle": "Pengaturan penampilan"
  },
  "acePage": {
    "openTrainingPage": "Buka pelatihan LoRA"
  },
  "library": {
    "noTracks": "Pustaka belum punya lagu. Unggah berkas di atas atau buat lagu di Buat."
  },
  "notInstalled": {
    "stableAudio": {
      "text": "Stable Audio 3 membuat instrumental dan efek suara serta menjalankan repaint, lanjutkan, dan cover di editor. Ia dilewati saat pemasangan. Setelah terpasang, unduh model di Model dan pengaturan atau langsung di formulir Stable Audio."
    }
  },
  "idea": {
    "guide": {
      "lead": "Satu frasa masuk, satu lagu keluar, langsung di beranda. Anda mendeskripsikan lagu, instrumental, atau suara dengan kata-kata sendiri, model bahasa lokal menulis prompt dalam format engine yang dipilih, Anda mengeditnya bila mau, dan engine membuat lagunya.",
      "steps": [
        {
          "title": "Deskripsikan idenya",
          "text": "Satu dua kalimat: tentang apa lagunya, suasana, siapa yang menyanyi, di mana dan kapan. Untuk instrumental: genre, instrumen, dan suasana."
        },
        {
          "title": "Pilih jenis dan engine",
          "text": "Lagu dengan vokal, instrumental, atau suara, lalu ACE-Step, YuE2, atau Stable Audio 3. Engine yang tidak membuat jenis itu tidak bisa dipilih; suara selalu milik Stable Audio."
        },
        {
          "title": "Gubah",
          "text": "Tekan Gubah: asisten menulis prompt tepat di bawah frasa dan menampilkan tahap, persen, dan teks saat bertambah. Anda bisa menghentikannya. Suara melewati langkah ini: Gubah membuka formulir Stable Audio dengan frasa itu."
        },
        {
          "title": "Edit prompt",
          "text": "Tag, lirik, tempo, nada dasar, dan durasi bisa diubah langsung di kolom."
        },
        {
          "title": "Buat",
          "text": "Buat memasukkan varian ke antrean engine, yang menjalankan engine saat tiba gilirannya, dan membuka Buat: varian muncul di daftar sesi, dinamai sesuai ide."
        }
      ],
      "writer": [
        "Asisten prompt adalah model bahasa lokal, Qwen3.5. Ia berpegang pada ide dan menulis lirik dalam bahasa ide itu atau bahasa yang Anda pilih. Modelnya diunduh di halaman Model.",
        "Untuk ACE-Step, model bahasa milik ACE-Step juga bisa menulis prompt selagi engine berjalan. Lebih cepat, biasanya 5–20 dtk, tetapi lebih sering menyimpang dari ide.",
        "Bahasa lirik secara bawaan diambil dari huruf pada ide; Anda bisa memilihnya di Lainnya, begitu juga siapa yang menulis prompt. Di halaman Buat ada di Pengaturan pada baris ide."
      ],
      "after": [
        "Varian lain menulis ulang prompt dari ide yang sama.",
        "Buka di formulir memasukkan prompt ke formulir engine di halaman Buat, lengkap dengan semua pengaturannya.",
        "Ide dan prompt tetap ada saat Anda meninggalkan halaman atau memuat ulang. Setelah Buat keduanya dikosongkan untuk ide berikutnya; Atur ulang mengosongkannya manual.",
        "Di halaman Buat, ide yang sama ada di baris ide di atas formulir: Tulis memasukkan lirik dan gaya langsung ke formulir (Deskripsikan, untuk Stable Audio), dan Kembalikan yang tadi memulihkan formulir."
      ],
      "tips": [
        "Hal spesifik mengalahkan kata umum: “kereta malam meninggalkan kota kecil” memberi lebih banyak daripada “lagu sedih”.",
        "Ingin genre, suara, atau instrumen tertentu? Sebutkan dalam ide.",
        "Baca liriknya sebelum membuat: model kecil tidak selalu benar soal rima dan matra.",
        "Bukan suara yang Anda mau? Coba engine lain dengan ide yang sama: prompt ditulis ulang dalam formatnya.",
        "Hujan, sebuah pukulan, langkah kaki adalah suara, bukan musik: pilih Suara, dan frasa langsung masuk ke formulir Stable Audio. Dengan Instrumental dan Stable Audio 3, asisten sendiri menyimpulkan bahwa suara yang diinginkan; ACE-Step membuat lagu dari ide seperti itu."
      ]
    }
  },
  "sa3Weights": {
    "allOnModels": "Semua model, checkpoint base, dan pengaturan ada di halaman Model"
  },
  "autoTitle": {
    "accept": "Pakai",
    "another": "Yang lain",
    "bulk": "Sarankan judul",
    "bulkDone": "{n} lagu diberi nama | {n} lagu diberi nama",
    "bulkFailed": "{n} diberi nama, lalu berhenti: {error} | {n} diberi nama, lalu berhenti: {error}",
    "bulkHint": "Asisten memberi nama tiap lagu terpilih satu per satu; Urungkan mengembalikan judul lama.",
    "bulkStopped": "Dihentikan: {n} dari {total} diberi nama",
    "bulkUndone": "Judul lama dipulihkan | Judul lama dipulihkan: {n}",
    "cancel": "Batal",
    "failed": "Tidak bisa memikirkan judul: {error}",
    "noAssistant": "Asisten prompt belum siap: unduh modelnya di Model.",
    "progress": "Memberi nama {done} dari {total}",
    "stop": "Berhenti",
    "suggest": "Sarankan judul",
    "working": "Memikirkan judul…"
  },
  "covers": {
    "alt": "Sampul {title}",
    "another": "Sampul lain",
    "bulk": "Buat sampul",
    "bulkDone": "{n} sampul dibuat | {n} sampul dibuat",
    "bulkFailed": "{n} tidak berhasil",
    "bulkHint": "Satu sampul untuk tiap lagu terpilih, satu per satu; lagu yang sudah punya sampul mendapat yang baru.",
    "bulkProgress": "Sampul: {done} dari {total}",
    "cancel": "Batal",
    "describe": "Apa yang ditampilkan gambar",
    "describeHint": "Satu adegan dalam beberapa kata; bahasa Inggris paling baik. Teks di dalam gambar dihindari secara otomatis.",
    "dismiss": "Tutup",
    "edit": "Edit deskripsi…",
    "enable": "Buat sampul album untuk lagu",
    "enableHint": "Menambahkan gambar ke setiap lagu di pustaka, pemutar, dan sesi. Mati: tidak ada sampul dan tidak ada tombol sampul di mana pun.",
    "engine": "Sampul (Z-Image Turbo)",
    "failed": "Sampul tidak berhasil: {error}",
    "fromAssistant": "Dari ide asisten untuk lagu ini.",
    "installed": "terpasang",
    "loadingPrompt": "Membaca deskripsi…",
    "make": "Buat sampul",
    "making": "Membuat sampul…",
    "makingPct": "Membuat sampul… {pct}%",
    "model": "Model: Z-Image Turbo, {gb} GB",
    "notInstalled": "belum terpasang",
    "notInstalledHint": "Model sampul tidak ada di komputer ini. Pasang dengan installer (bagian Sampul) atau skrip penyiapan.",
    "onButton": "Sampul hanya dibuat saat Anda menekan tombol: di detail lagu di pustaka, atau untuk lagu terpilih. Tiap sampul butuh 5 sampai 10 detik; selama itu GPU beralih ke model sampul, dan lagu berikutnya memuat kembali mesinnya.",
    "parts": {
      "main": "Bobot Z-Image Turbo",
      "server": "Server gambar (stable-diffusion.cpp)"
    },
    "queued": "Menunggu dalam antrean…",
    "remove": "Hapus sampul",
    "removeConfirm": "Ya, hapus",
    "stop": "Berhenti",
    "title": "Sampul",
    "draw": "Gambar",
    "withAssistant": "Buat dengan asisten",
    "withAssistantHint": "Asisten prompt menulis deskripsi dari teks Anda (dalam bahasa apa pun) atau, jika kolom kosong, dari lagunya; Anda bisa mengeditnya sebelum menggambar.",
    "putBack": "Kembalikan",
    "anyLanguageHint": "Tulis dalam bahasa apa pun: asisten mengubahnya menjadi deskripsi yang dipahami model gambar.",
    "fromSaved": "Deskripsi yang dipakai untuk menggambar sampul terakhir.",
    "noAssistant": "Asisten prompt belum siap: unduh modelnya di Model.",
    "describing": "Mendeskripsikan gambar…",
    "describingPct": "Mendeskripsikan gambar… {pct}%",
    "describeFailed": "Asisten tidak dapat mendeskripsikan gambar: {error}",
    "bulkDescribing": "Mendeskripsikan {done} dari {total}",
    "starting": "Memulai model gambar…"
  },
  "takeCompare": {
    "best": "★ Terbaik",
    "failed": "Tidak bisa dimuat",
    "keep": "Simpan yang terbaik, pindahkan sisanya ke tempat sampah",
    "keepConfirm": "Pindahkan {n} varian ke tempat sampah? | Pindahkan {n} varian ke tempat sampah?",
    "keepNeedStar": "Beri bintang pada varian terbaik untuk menyimpannya.",
    "keepTooMany": "Beri bintang hanya satu varian: yang akan disimpan.",
    "keepWill": "Menyimpan {take}; satu lainnya masuk tempat sampah. | Menyimpan {take}; {n} lainnya masuk tempat sampah.",
    "kept": "{take} disimpan; {n} varian dipindahkan ke tempat sampah. | {take} disimpan; {n} varian dipindahkan ke tempat sampah.",
    "keys": "1–4 pilih varian · Spasi putar/jeda · ←/→ 5 dtk · Esc tutup",
    "loading": "Memuat…",
    "loadingAll": "memuat varian…",
    "newestOf": "{shown} terbaru dari {total} varian",
    "nowHearing": "Sedang diputar: {take}",
    "open": "Bandingkan",
    "openTitle": "Bandingkan varian lagu ini, A/B",
    "position": "{at} dari {total}",
    "restored": "{n} varian dipulihkan | {n} varian dipulihkan",
    "seed": "seed {seed}",
    "seek": "Posisi",
    "takes": "Varian",
    "tileLabel": "{letter}, varian {n}",
    "title": "Bandingkan varian"
  }
}
