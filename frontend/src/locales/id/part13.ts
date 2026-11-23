// Notes workspace and help, and the strings added or reworded after part12 (machine-translated from en); merged last, key by key.
export default {
  "aceGen": {
    "closeness": "Seberapa dekat dengan aslinya",
    "closenessHigh": "Lebih bebas",
    "closenessHint": "Ke kiri hasilnya mempertahankan melodi dan aransemen sumber; ke kanan model mengubah lebih banyak.",
    "closenessLow": "Lebih dekat dengan aslinya",
    "loraSimple": "LoRA",
    "loraTrain": "Latih milik Anda sendiri",
    "modelDefault": "{name} (bawaan)",
    "refChoose": "Pilih berkas",
    "refDrop": "Letakkan audio di sini atau pilih dari pustaka",
    "refFromLibrary": "Dari pustaka",
    "refLoading": "Memuat lagu…",
    "refNeeded": "Pilih lagu di sini, atau kembali ke tab Lagu untuk lagu baru.",
    "refOff": "Ambil lagu jadi: cover, rentang yang diulang, bagian yang dikeluarkan atau ditambahkan. Tanpa lagu, formulir membuat lagu baru.",
    "refRemove": "Hapus"
  },
  "aiPart": {
    "guide": {
      "hears": [
        "Trek yang dicentang dicampur menjadi satu trek stereo: dengan volume trek, fade, dan penyesuaian tempo (W), tetapi tanpa efek dan mengabaikan tombol M dan S.",
        "Tempo diambil dari kolom BPM proyek, bukan dari klip: atur agar sesuai dengan materinya. Nada dasar diambil dari “Nada dasar”; pada “Otomatis” model menemukannya sendiri.",
        "ACE-Step hanya mengenal mayor dan minor. Untuk tangga nada lain model menerima nada dasar terdekat dan nama tangga nada di deskripsi: petunjuk, bukan jaminan.",
        "Trek dengan varian yang masih menunggu pilihan tidak ditawarkan: itu masih draf.",
        "Model tidak menerima rentang yang lebih panjang dari 10 menit: pilih potongan yang lebih pendek."
      ],
      "limits": [
        "“Tambah bagian” hanya berjalan pada model dasar ACE-Step (sekitar 4,8 GB). Di aplikasi desktop ini adalah opsi saat instalasi; jika dilewati, arranger menampilkan tombol Instal. Dengan skrip, setup_models mencetak perintahnya di bagian akhir.",
        "base lebih lambat daripada turbo: pada RTX 4080 satu varian untuk lagu 2-3 menit memakan sekitar 10 detik, dan proses pertama lebih lama karena model dimuat.",
        "Model lebih setia pada nada dasar dan akor dari yang didengarnya daripada pada ide ritmis: “bermain di sela-sela vokal” mungkin tidak berhasil.",
        "Kualitas suara adalah apa pun yang diberikan model. Tidak ada MIDI ke audio: model hanya bekerja dengan audio.",
        "Jika xl-base terpasang, ia muncul di daftar model; pada kartu 16 GB ia memakai hampir seluruh memori video. Untuk menambah bagian pakai base: dalam pengukuran xl-base mengembalikan derau pada sekitar satu dari lima varian, base satu dari dua puluh lima.",
        "Membuang derau memakan waktu: ketika sebuah varian dibuang permintaan dikirim ulang, dan generasi menjadi lebih lama. Drum, perkusi, dan efek tidak diperiksa: sifatnya memang menyerupai derau."
      ],
      "variants": [
        {
          "term": "Dengarkan",
          "text": "beralih ke varian ini, membisukan yang lain, dan memutar dari awal rentang."
        },
        {
          "term": "Simpan",
          "text": "menyimpan varian dan menghapus yang lain. Untuk repaint, lanjutan, atau cover, varian yang disimpan menggantikan aslinya di rentang itu."
        },
        {
          "term": "Hapus semua",
          "text": "menghapus setiap varian dan mengembalikan trek seperti semula."
        },
        {
          "term": "Salinan konteks",
          "text": "menandai varian yang modelnya mengembalikan hampir mix yang didengarnya, bukan bagian baru. Hasilkan lagi."
        },
        {
          "term": "Derau",
          "text": "menandai varian yang modelnya mengembalikan desis, bukan bagian. Arranger membuang varian semacam itu sendiri dan meminta penggantinya, hingga dua kali; tanda hanya tersisa pada yang datang setelah percobaan ulang."
        },
        {
          "term": "Ctrl+Z",
          "text": "membatalkan baik penyisipan varian maupun pilihannya. Berkas varian yang dibuang meninggalkan pustaka hanya saat proyek disimpan, dan hanya jika tidak ada klip yang memakainya."
        }
      ]
    }
  },
  "covers": {
    "after": {
      "hintSa": "Setelah generasi: satu cover untuk semua take. Memakai GPU sekitar 30 dtk lagi."
    },
    "studio": {
      "errChanged": "Cover dibuat ulang sementara itu. Simpan sekali lagi.",
      "errLoad": "Gambar cover tidak bisa dimuat. Coba lagi.",
      "errNoCover": "Lagu ini tidak punya cover untuk diberi teks.",
      "errSave": "Teks tidak bisa disimpan. Coba lagi."
    }
  },
  "create": {
    "failed": "Tidak berhasil. Tekan Pakai pengaturan ini lagi, lalu Buat lagi.",
    "madeAt": "pukul {time}",
    "menu": {
      "midi": "Not ke MIDI"
    },
    "notes": {
      "cardTitle": "Not",
      "draw": "Gambar",
      "drawNote": "“Gambar” membuka Not di sebelah kanan dengan kerangka dari lirik: bagian dari tag [Verse], [Chorus], satu akor sementara per birama.",
      "emptyLead": "Tanpa not YuE2 menulis melodinya sendiri. Dengan not ia menyanyikan melodi Anda.",
      "emptyTitle": "Belum ada not",
      "fromSong": "Dari lagu",
      "fromSongDots": "Dari lagu…",
      "hasScore": "formulir punya partitur",
      "importMidi": "Impor MIDI",
      "open": "Buka not",
      "openHere": "Not terbuka di sebelah kanan.",
      "openNote": "Perubahan pada not langsung masuk ke formulir — tekan “{button}” dan YuE2 mengambilnya.",
      "openSection": "Buka bagian ini di Not",
      "openTakeTip": "Partitur take ini di ruang kerja Not — dengarkan, bandingkan, sunting, lalu masukkan ke formulir jika mau",
      "rail": "Not",
      "railTip": "Not YuE2 — editor partitur di sebelah kanan, menggantikan Sesi",
      "remarks": "{n} catatan pemeriksaan: {list} | {n} catatan pemeriksaan: {list}",
      "takeTitle": "{title} · Take {n}"
    },
    "rail": {
      "ace_step": "ACE",
      "generate": "Buat",
      "lora": "LoRA",
      "models": "Model",
      "stable_audio": "Suara",
      "yue2": "YuE2"
    },
    "reuse": "Pakai pengaturan ini lagi",
    "reuseInForm": "Pakai pengaturan ini lagi"
  },
  "editor": {
    "clipInTrash": "Lagu ada di tempat sampah",
    "clipInTrashHint": "Lagu klip ini ada di tempat sampah pustaka: masih bisa diputar, tetapi tempat sampah menghapusnya permanen setelah 30 hari.",
    "guide": {
      "clip": [
        "Menyeret memindahkan klip, tepinya memangkasnya. Gelombang tidak dipadatkan saat Anda memangkas: Anda melihat persis audio yang tersisa. Berkas sumber tidak pernah berubah.",
        "Tombol di klip berada di atas gelombang dan muncul saat kursor di atasnya atau saat klip dipilih; yang aktif selalu terlihat. M membisukan klip, S membuat hanya klip itu yang terdengar, W menyesuaikannya dengan tempo proyek, tanda silang menghapusnya.",
        "Pegangan tepi mengatur fade. Tanpanya setiap tepi mendapat micro-fade 15 ms agar potongan tidak berklik.",
        "Alat di transport: Pilih (V) memindah dan memangkas klip, Pisau (C) memotong klip di tempat Anda mengklik, Penghapus (E) menghapus potongan yang Anda seret, atau seluruh klip saat diklik. Pisau dan Penghapus menempel ke grid dan ke tepi klip; Esc kembali ke Pilih.",
        "S memotong klip terpilih di playhead, atau setiap klip di bawah playhead bila tidak ada yang dipilih. Ctrl+D menaruh salinan tepat setelah klip.",
        "Klip bersifat tembus pandang: grid timeline terlihat melaluinya."
      ],
      "lane": [
        "Ganti nama trek langsung di headernya. M membisukannya, S membuat hanya trek itu yang terdengar.",
        "Warna: pilih trek lalu klik titik di atas daftar trek.",
        "Trek yang memutar seluruh lagu bisa dipisah menjadi stem dengan tombol di sebelah M dan S: vokal, drum, bass, dan lainnya menggantikannya.",
        "Tanda silang menghapus trek; Ctrl+Z mengembalikannya.",
        "Tinggi trek diatur dengan penggeser panah di transport atau dengan Alt dan roda mouse: makin tinggi trek, makin besar gelombangnya. Satu tinggi untuk semua trek."
      ],
      "steps": [
        {
          "title": "Tambah trek",
          "text": "Tombol “Trek” membuka pustaka: tambahkan lagu utuh atau sebagai stem. Berkas dari komputer Anda bisa diletakkan langsung ke sebuah trek."
        },
        {
          "title": "Susun klip",
          "text": "Seret klip dan pangkas dari tepinya. Pisau (C) memotong klip di tempat Anda mengklik, Penghapus (E) menghapus potongan yang Anda seret. Fade ditarik dari pegangan di tepi klip."
        },
        {
          "title": "Sesuaikan tempo",
          "text": "Kolom BPM menetapkan tempo proyek, tombol W pada klip menyesuaikannya dengan tempo itu. “Magnet” mengaktifkan penempelan ke grid, dan sakelar “0:00 | 1 | 2” memilih apa yang dihitung penggaris dan grid: detik atau birama."
        },
        {
          "title": "Mixing",
          "text": "Volume dan pan trek, delapan efek di setiap trek dan di master. Tombol “Mixer” menampilkan mixer."
        },
        {
          "title": "Simpan",
          "text": "Tidak ada simpan otomatis: “Simpan” atau Ctrl+S. Jika Anda meninggalkan halaman dengan perubahan yang belum disimpan, editor memperingatkan Anda."
        },
        {
          "title": "Ekspor",
          "text": "WAV atau MP3 ke pustaka, atau stem dengan proyek Reaper atau DAWproject untuk diselesaikan di DAW Anda sendiri."
        }
      ],
      "tempo": [
        "Tempo klip dideteksi saat ditambahkan, dari 30 detik pertamanya. Pendeteksinya sederhana dan bisa meleset pada materi yang rumit.",
        "W meregangkan klip ke BPM proyek tanpa mengubah nadanya.",
        "Klip menempel ke tepi klip lain dan ke awal timeline. “Magnet” menambah penempelan ke grid. Sakelar “0:00 | 1 | 2” memilih apa yang dihitung grid dan penggaris: detik, atau birama dan ketukan menurut BPM proyek (4/4). Langkah grid mengikuti zoom; garis di tanda penggaris lebih terang.",
        "“Ulang” mengulang wilayah di penggaris: pindahkan seluruhnya atau seret tepinya. Wilayah yang sama menjadi pilihan untuk arranger AI. Klik penggaris untuk melompat."
      ]
    },
    "help": {
      "title": "Bantuan editor"
    },
    "hotkeys": {
      "keys": [
        {
          "keys": "Space",
          "action": "Putar dan jeda"
        },
        {
          "keys": "S",
          "action": "Potong klip di playhead"
        },
        {
          "keys": "V / C / E",
          "action": "Alat: pilih, pisau, penghapus"
        },
        {
          "keys": "Del",
          "action": "Hapus klip terpilih"
        },
        {
          "keys": "Ctrl+D",
          "action": "Gandakan klip terpilih"
        },
        {
          "keys": "Ctrl+Z",
          "action": "Urungkan, hingga 30 langkah"
        },
        {
          "keys": "Ctrl+Y / Ctrl+Shift+Z",
          "action": "Ulangi"
        },
        {
          "keys": "Ctrl+S",
          "action": "Simpan proyek"
        },
        {
          "keys": "Esc",
          "action": "Hapus pilihan dan kembali ke alat Pilih"
        },
        {
          "keys": "← →",
          "action": "Playhead satu langkah grid, empat dengan Shift"
        },
        {
          "keys": "Home / End",
          "action": "Ke awal atau ke akhir"
        },
        {
          "keys": "+ / −",
          "action": "Zoom"
        },
        {
          "keys": "Tab",
          "action": "Klip, trek, atau pegangan berikutnya"
        }
      ],
      "mouse": [
        {
          "keys": "Ctrl+roda",
          "action": "Zoom"
        },
        {
          "keys": "Alt+roda",
          "action": "Tinggi trek"
        },
        {
          "keys": "Klik pisau",
          "action": "Potong klip di tempat itu"
        },
        {
          "keys": "Seret penghapus",
          "action": "Hapus potongan klip itu; klik menghapus seluruh klip"
        },
        {
          "keys": "Shift+seret",
          "action": "Gulir timeline; tombol tengah juga bisa"
        },
        {
          "keys": "Klik penggaris",
          "action": "Lompat"
        },
        {
          "keys": "Berkas ke trek",
          "action": "Tambah klip dari komputer Anda di tempat itu"
        }
      ]
    },
    "restoreFromTrash": "Pulihkan dari tempat sampah",
    "trashedSources": "Sebuah klip memutar lagu dari tempat sampah: {names}. Tempat sampah menghapusnya permanen setelah 30 hari. | {n} klip memutar lagu dari tempat sampah: {names}. Tempat sampah menghapusnya permanen setelah 30 hari."
  },
  "footer": {
    "muscriptorNote": "Mengubah lagu atau stem menjadi MIDI. Bobotnya hanya untuk penggunaan nonkomersial; lihat kartu model.",
    "qwenNote": "Asisten prompt: menulis prompt dari sebuah ide, judul, dan deskripsi cover.",
    "sa3Note": "Instrumental dan efek suara. Gratis untuk penggunaan pribadi dan komersial di bawah pendapatan tahunan 1 juta USD; di atas itu diperlukan lisensi enterprise.",
    "sdcppNote": "Menjalankan model cover.",
    "sheetsageNote": "Menuliskan melodi sebuah lagu sebagai partitur (Not, “Dari lagu…”). Bobotnya hanya untuk penggunaan nonkomersial; lihat kartu model.",
    "zimageNote": "Menggambar cover. Encoder teksnya, Qwen3-4B-Instruct, juga berlisensi Apache-2.0."
  },
  "header": {
    "guide": {
      "map": {
        "ace": "Lagu dan instrumental cepat dari deskripsi, tag, dan lirik; dengan lagu referensi juga cover, bagian yang dilukis ulang, bagian yang ditambah atau diekstrak, dan lanjutan.",
        "sa3": "Instrumental dan efek suara dari deskripsi, dengan cepat. Di arranger AI editor ia melakukan repaint, melanjutkan, dan membuat cover dengan mendengarkan audio di sekitar rentang.",
        "yue": "Menulis lagu utuh dengan vokal dan bisa membangunnya di sekitar melodi yang diberikan (tab Melodi dan ruang kerja Not, dengan SheetSage2). Ia juga mengubah lagu menjadi MIDI."
      },
      "steps": [
        {
          "title": "Pilih engine",
          "text": "Buka Buat: engine ada di kiri, YuE2, ACE-Step, dan Stable Audio. Untuk lagu pertama dengan vokal pilih YuE2. Ia mulai pada penekanan Buat yang pertama; start pertama butuh beberapa menit."
        },
        {
          "title": "Deskripsikan lagunya",
          "text": "Di tab Lagu ketik lirik dan gaya, atau tulis ide dalam satu kalimat di baris di atas formulir dan asisten mengisi kolomnya. Pilih durasi dan jumlah take."
        },
        {
          "title": "Pilih take terbaik",
          "text": "Take berderet di daftar sesi di samping formulir (di bawahnya pada ponsel). Semua yang dibuat tersimpan ke pustaka dengan sendirinya."
        },
        {
          "title": "Pisahkan jadi stem",
          "text": "Vokal, drum, bass, dan lainnya dalam satu klik: Pisahkan jadi stem di menu sebuah take, tab Stem dan not di pustaka, atau langsung di editor."
        },
        {
          "title": "Susun di editor",
          "text": "Letakkan stem di trek, tambah bagian dengan arranger AI, atur efeknya."
        },
        {
          "title": "Ekspor",
          "text": "Mixdown ke WAV atau MP3, atau ekspor trek dengan proyek Reaper atau DAWproject."
        }
      ],
      "tips": [
        "Tidak yakin cara mendeskripsikan gaya? Mulai dari halaman utama: deskripsikan musiknya dalam satu kalimat, asisten menulis prompt dan Anda menyuntingnya.",
        "Hampir tapi belum pas? Melukis ulang satu bagian sering lebih cepat daripada menghasilkan lagi.",
        "Lagu referensi untuk cover atau bagian baru bisa langsung diambil dari pustaka.",
        "Setiap bagian punya tombol bantuannya sendiri; editor juga punya lembar pintasan tersendiri.",
        "Editor tidak menyimpan otomatis: tekan Simpan sebelum meninggalkan halaman; jika lupa, editor akan bertanya."
      ]
    },
    "helpSections": {
      "covers": {
        "text": "Cover digambar di komputer ini oleh model Z-Image Turbo. Centang Buat cover di bawah formulir dan satu cover untuk semua take muncul setelah lagunya; atau buat nanti dengan tombol di kartu sebuah lagu di pustaka, juga untuk beberapa lagu terpilih sekaligus. Desain cover mengubah deskripsi gambar dan menambahkan teks dengan judul. Model cover dipasang terpisah: lihat Model dan pengaturan.",
        "title": "Cover"
      },
      "downloads": {
        "text": "Sebuah lagu diunduh sebagai MP3 (320 kbit/s, dengan cover dan tag, bisa diputar di mana saja), FLAC (tanpa kehilangan kualitas, dengan cover dan tag) atau WAV (sumber untuk DAW, tanpa cover). Pilih formatnya di menu Unduh pada sebuah take atau lagu, pilihan itu diingat; juga bisa diatur di Model dan pengaturan, Umum. Nama artis masuk ke tag.",
        "title": "Format unduhan"
      },
      "engines": {
        "text": "Tiga engine menghasilkan audio, YuE2-3B, ACE-Step 1.5, dan Stable Audio 3, dan ketiganya tidak muat bersama di satu GPU, jadi satu berjalan pada satu waktu. Pilih engine di halaman Buat: ia mulai saat Anda menekan Buat, dan yang sedang berjalan berhenti sendiri. Lampunya menunjukkan statusnya; start pertama bisa butuh beberapa menit selama model dimuat ke memori video. Tombol status di header menunjukkan apa yang memegang GPU dan bisa membongkarnya."
      },
      "library": {
        "text": "Setiap lagu, baik yang dibuat, diunggah, maupun diekspor dari editor, masuk ke satu pustaka bersama yang bisa dipakai setiap modul, jadi lagu yang dibuat oleh engine mana pun bisa dipisahkan menjadi stem, ditranskripsi, dan di-mixing tanpa meninggalkan aplikasi."
      },
      "notes": {
        "more": "Selengkapnya tentang not",
        "text": "Not adalah ruang kerja YuE2: tombol Not di bawah YuE2 pada rel Buat. Ia menampilkan dan menyunting melodi lagu sebagai partitur; partitur bisa berasal dari lagu jadi (Dari lagu…, SheetSage2) atau berkas MIDI dan masuk ke formulir YuE2 di tab Melodi.",
        "title": "Not"
      },
      "trash": {
        "text": "Lagu yang dihapus masuk ke tempat sampah pustaka dan tinggal di sana selama 30 hari: pulihkan dari sana atau hapus permanen. Pilih beberapa lagu untuk memindahkannya ke tempat sampah sekaligus, memberi tag, membuat cover, atau menamainya. Pustaka bisa disaring menurut tag.",
        "title": "Tempat sampah dan tag"
      }
    }
  },
  "home": {
    "allTracks": "Buka pustaka"
  },
  "idea": {
    "languageAutoIdea": "Otomatis (dari ide)",
    "writer": "Siapa yang menulis lirik dan gaya:",
    "writerAce": "ACE-Step sendiri"
  },
  "libraryPage": {
    "filters": {
      "midi": "MIDI",
      "score": "Not"
    },
    "filtersToggle": "Filter",
    "openEditor": "Buka di editor",
    "openEditorFailed": "Tidak bisa membuka di editor: {error}",
    "openEditorHint": "Proyek editor baru dengan lagu ini di sebuah trek",
    "promptTitle": "Lagu ini tidak punya nama sendiri: yang ditampilkan satu baris liriknya.",
    "score": {
      "download": "Unduh .abc",
      "failed": "Tidak bisa memuat not: {error}",
      "hint": "Partitur ABC yang dipakai YuE2 untuk menyanyikan lagu ini",
      "open": "Buka di Not",
      "openHint": "Salinan partitur di Not pada halaman Buat; not formulir tidak berubah",
      "title": "Not"
    },
    "trash": {
      "loading": "Memuat…"
    },
    "usage": {
      "bulk": "{n} lagu dipakai di proyek editor: {names}. Di tempat sampah lagu itu masih bisa diputar, tetapi jika tempat sampah dikosongkan, klipnya di proyek akan hilang. Hapus?",
      "more": " (dan {n} lagi)",
      "purge": "Hapus permanen? Dipakai di proyek editor: {names}. Klipnya di proyek akan hilang.",
      "single": "Lagu ini dipakai di proyek editor “{name}”{more}. Di tempat sampah ia masih bisa diputar, tetapi jika tempat sampah dikosongkan, klipnya di proyek hilang. Hapus?"
    },
    "yueLicence": "YuE2: lisensi nonkomersial (CC BY-NC 4.0)",
    "yueLicenceHint": "Lagu YuE2 tidak boleh dijual atau dipakai secara komersial. Detail: Model dan lisensi."
  },
  "midiPanel": {
    "recognize": "Not ke MIDI"
  },
  "models": {
    "general": {
      "artist": "Nama artis",
      "artistHint": "Ditulis ke tag lagu yang diunduh. Nama yang sama dengan di footer.",
      "artistSave": "Simpan",
      "artistSaved": "Tersimpan",
      "autoCover": "Buat cover setelah lagu",
      "autoCoverHint": "Nilai awal kotak Buat cover di bawah formulir engine.",
      "autoCoverOff": "Cover nonaktif atau modelnya belum terpasang: lihat Cover.",
      "formatHint": "Format tombol Unduh di sesi dan pustaka. Format yang dipilih di menu unduhan juga diingat di sini.",
      "languageHint": "Pilihan yang sama dengan tombol bahasa di header.",
      "nav": "Umum",
      "title": "Pengaturan umum"
    },
    "showMore": "{n} lagi, belum diunduh: {names} ▾"
  },
  "notesHelp": {
    "actions": {
      "checks": "Tampilkan pemeriksaan",
      "draw": "Buka “Gambar dari nol”",
      "musicianOff": "Sembunyikan angka Romawi",
      "musicianOn": "Tampilkan angka Romawi",
      "simple": "Buka tampilan sederhana",
      "snapIsOn": "“Dalam nada” aktif",
      "snapOn": "Aktifkan “Dalam nada”"
    },
    "fig": {
      "at": "tempo 95, 4/4",
      "barTime": "1 birama ≈ 2,5 dtk",
      "beats": "4 ketukan: satu-dua-tiga-empat",
      "brk": "jeda instrumen",
      "chordsTitle": "Akor di atas birama",
      "counter": "5 suku kata · 6 not",
      "fourBars": "4 birama ≈ 10 dtk",
      "higher": "lebih tinggi",
      "inKey": "not nada dasar",
      "ins": "Instrumen",
      "intro": "intro",
      "longer": "not panjang",
      "lower": "lebih rendah",
      "lyricsTags": "Tag di lirik",
      "melisma": "ditahan",
      "octaveNote": "suara pria bernyanyi satu oktaf di bawah not yang tertulis",
      "offKey": "di luar nada",
      "partsRibbon": "Bagian di not",
      "pause": "jeda",
      "picker": "Yang cocok",
      "shorter": "pendek",
      "sing": "suara bernyanyi",
      "snapped": "mendarat di sini",
      "sung": "dinyanyikan",
      "syllables": [
        "Ku",
        "ingin",
        "ter",
        "bang",
        "tinggi"
      ],
      "time": "waktu →",
      "vocal": "Vokal",
      "written": "tertulis"
    },
    "firstTime": "Baru mengenal not?",
    "open": "Bantuan Not",
    "openTip": "Dengan kata sederhana: cara menggambar melodi dan cara YuE2 menyanyikannya",
    "sections": {
      "checks": {
        "head": {
          "check": "Yang tertulis",
          "fix": "Yang harus dilakukan",
          "means": "Artinya"
        },
        "intro": "Pemeriksaan adalah baris di bagian bawah Not: klik untuk membuka daftarnya. Kuning berarti “perlu dilihat”, hijau semuanya baik, abu-abu hanya catatan. Jika perbaikannya jelas, ada tombol Perbaiki; Tampilkan memilih not atau birama yang dimaksud. Ctrl+Z membatalkan setiap perbaikan.",
        "rows": [
          {
            "check": "Tanpa nada dasar atau tempo",
            "means": "YuE2 tidak tahu harus bernyanyi di nada dasar apa dan seberapa cepat.",
            "fix": "Pilih keduanya di chip di bagian atas."
          },
          {
            "check": "Birama tanpa akor",
            "means": "YuE2 terbiasa dengan satu akor di setiap birama.",
            "fix": "Tekan Perbaiki tanpa khawatir: akor sebelumnya diteruskan ke birama kosong."
          },
          {
            "check": "Vokal belum punya not",
            "means": "Belum ada melodi — YuE2 akan mengarang sendiri.",
            "fix": "Gambar melodinya dengan pensil atau pakai salah satu awal cepat."
          },
          {
            "check": "Not lebih sedikit daripada suku kata di lirik",
            "means": "Not jauh lebih sedikit daripada suku kata: YuE2 mengarang sisanya dan bisa menyimpang dari not Anda.",
            "fix": "Isi not (di tampilan sederhana, tombol “tambah”) atau pakai “Dari lagu…”."
          },
          {
            "check": "Not di atas atau di bawah jangkauan suara",
            "means": "Sulit bagi penyanyi; YuE2 bisa kewalahan atau berpindah oktaf.",
            "fix": "Pertama pastikan suara yang dipilih sudah benar, pria atau wanita. Lalu tekan Perbaiki: melodi digeser per oktaf ke dalam jangkauan."
          },
          {
            "check": "Bagian tidak cocok dengan lirik",
            "means": "Bagian di not lebih banyak atau lebih sedikit daripada tag di lirik: baris jatuh di tempat yang salah.",
            "fix": "Perbaiki menambahkan bagian yang kurang di akhir — lalu periksa urutannya. Hapus bagian berlebih sendiri atau sesuaikan tag di lirik."
          },
          {
            "check": "Instrumen ikut bermain bersama suara",
            "means": "Hanya catatan, bukan kesalahan: biasanya instrumen diam saat suara bernyanyi.",
            "fix": "Tidak perlu apa-apa jika memang disengaja. Jika tidak, hapus not instrumen di birama itu."
          },
          {
            "check": "ABC-nya panjang",
            "means": "Partitur yang sangat panjang memakan banyak porsi prompt YuE2.",
            "fix": "Persingkat lagunya atau hapus not instrumen yang berlebih."
          }
        ],
        "tip": "Butir hijau tidak perlu diapa-apakan. Jika sudah tidak ada catatan, Anda bisa menekan Buat.",
        "title": "Pemeriksaan untuk YuE2",
        "toc": "Pemeriksaan untuk YuE2"
      },
      "chords": {
        "note": "YuE2 memakai akor hanya dengan rencana “Melodi dan akor”. Dengan “Ikuti melodi” model memilih iringannya sendiri, dan akor Anda hanya menjadi petunjuk bagi Anda.",
        "p": [
          "<b>Akor</b> adalah beberapa nada yang dibunyikan bersamaan. Iringan bertumpu padanya: gitar, keyboard, bass. Akor berderet di atas not, biasanya satu per birama.",
          "Klik akor sebuah birama (atau tempat kosong di barisnya) untuk memilih yang lain. Yang <b>cocok</b> muncul lebih dulu: akor dari nada dasar Anda, yang paling terjaga oleh YuE2. Di bawahnya ada “Lazim di minor” atau “Lazim di mayor” dan “Lainnya” untuk bereksperimen. “Dengarkan” memutar akornya, “Dua per birama” membagi birama menjadi dua akor.",
          "Tidak yakin harus memilih apa? Pertahankan yang dimasukkan “Gambar dari nol”: progresi empat akor yang teruji.",
          "<b>Untuk musisi</b> — sakelar di bawah grid menampilkan angka Romawi di akor (I, IV, V, vi…): tingkat akor dalam nada dasar. Ini untuk yang paham teorinya; yang lain tidak memerlukannya."
        ],
        "title": "Akor",
        "toc": "Akor"
      },
      "faq": {
        "items": [
          {
            "q": "Apakah saya perlu bisa membaca not?",
            "a": "Tidak. Cukup bisa mendengar “lebih tinggi — lebih rendah” dan “lebih panjang — lebih pendek”. Aktifkan “Dalam nada” dan tidak akan ada not yang fals."
          },
          {
            "q": "Mengapa suara pria bernyanyi lebih rendah daripada yang digambar?",
            "a": "YuE2 menulis melodi pria satu oktaf di atas tempat melodi itu dinyanyikan. Itu normal; tidak perlu menurunkan not."
          },
          {
            "q": "Apakah not disimpan di suatu tempat?",
            "a": "Ya, itulah not milik formulir: setiap perubahan langsung masuk ke formulir, dan Ctrl+Z membatalkannya. Tidak ada penyimpanan terpisah — tekan Buat dan YuE2 mengambilnya."
          },
          {
            "q": "Berapa lama lagunya nanti?",
            "a": "Sepanjang jumlah biramanya. Pada tempo 95 dalam 4/4 satu birama berlangsung sekitar 2,5 detik: 16 birama sekitar 40 detik, 64 birama sekitar 2,7 menit."
          },
          {
            "q": "Mengapa YuE2 tidak menyanyikan persis not saya?",
            "a": "Model mengikuti not dengan cermat, tetapi ia bukan synthesizer: ia bisa menghias melodi, menggeser satu suku kata, atau bernyanyi satu oktaf lebih rendah. Jika bedanya jauh, lihat resep “Lagu tidak mengikuti not”."
          },
          {
            "q": "Apakah saya perlu menggambar drum dan bass?",
            "a": "Tidak. Cukup suaranya dan, jika mau, satu baris instrumen di intro dan jeda. Sisanya dimainkan YuE2 sesuai gaya."
          },
          {
            "q": "Teks ABC di bagian bawah itu apa?",
            "a": "Not yang sama yang ditulis dengan huruf — itulah yang diterima YuE2. Editor menulisnya sendiri; sunting manual hanya jika Anda tahu formatnya."
          },
          {
            "q": "Bagaimana cara mendengarkan tanpa membuat lagu?",
            "a": "Putar (Space) memainkan not dengan piano. Metronom membunyikan ketukan, Ulang mengulang birama yang ditandai."
          },
          {
            "q": "Bisakah saya mengambil not dari take yang sudah jadi?",
            "a": "Bisa: “Buka not” pada sebuah take membukanya sebagai salinan. Sunting, dengarkan, lalu tekan “Ke formulir” untuk membuat take baru darinya."
          }
        ],
        "title": "Pertanyaan yang sering diajukan",
        "toc": "FAQ"
      },
      "key": {
        "p": [
          "<b>Nada dasar</b> adalah kumpulan tujuh nada yang selaras. Melodi yang dibuat dari nada-nada itu terdengar benar, sedangkan nada di luar kumpulan itu terdengar sumbang seperti not yang salah.",
          "<b>Minor</b> terdengar lebih sendu dan dramatis, <b>mayor</b> lebih cerah dan bersemangat. Huruf (C, D, A…) adalah nada tempat kumpulan itu dimulai. Bagi telinga hampir tidak berpengaruh; yang penting adalah apakah nyaman dinyanyikan.",
          "Baris grid yang termasuk nada dasar diberi sorotan. Aktifkan <b>“Dalam nada”</b> dan pensil tidak akan membiarkan Anda menaruh not yang salah: not mendarat di baris terdekat yang cocok. Ini cara termudah agar tidak pernah fals. Butuh not di luar nada? Tahan Shift.",
          "Nada dasar diubah di chip Nada dasar di bagian atas. Dengan “Geser juga not dan akor” aktif, seluruh lagu bergeser dan terdengar lebih tinggi atau lebih rendah."
        ],
        "tempo": [
          "<b>Tempo</b> adalah jumlah ketukan per menit (BPM). 70–90 tenang, 95–120 sedang, 130 ke atas cepat. YuE2 mengambil tempo dari not; tempo di teks gaya tidak berpengaruh.",
          "<b>Birama</b> (tanda birama) adalah jumlah ketukan dalam satu birama. 4/4 dipakai hampir di semua pop dan rock, 3/4 adalah waltz, 6/8 terasa berayun, untuk balada. Tidak yakin? Pertahankan 4/4.",
          "<b>Durasi</b> adalah jumlah birama lagu. Audionya mengikuti not: 8 birama 4/4 pada tempo 95 sekitar 20 detik."
        ],
        "tempoTitle": "Tempo dan birama",
        "title": "Nada dasar, tempo, dan birama",
        "toc": "Nada dasar dan tempo"
      },
      "lanes": {
        "p": [
          "Not memiliki dua trek. <b>Vokal</b> (not ungu-merah muda) adalah yang dinyanyikan penyanyi. <b>Instrumen</b> (teal) adalah satu baris melodi sebuah instrumen: intro, jeda, penutup.",
          "Pensil menulis ke trek yang aktif — klik trek lain untuk berpindah. “Bisukan” dan “Hanya trek ini” hanya mengubah apa yang Anda dengar di sini; tidak memengaruhi lagu.",
          "<b>Mengapa instrumen biasanya diam saat suara bernyanyi.</b> Begitulah partitur YuE2 sendiri dibuat: instrumen mengisi bagian yang tanpa suara. Jika ia bermain di atas nyanyian, YuE2 bisa bingung apa yang harus dinyanyikan. Pemeriksaan menunjuk birama semacam itu — itu catatan, bukan kesalahan.",
          "Drum, bass, dan iringan tidak perlu digambar: YuE2 memainkannya sendiri sesuai gaya dan akor."
        ],
        "title": "Vokal dan Instrumen",
        "toc": "Vokal dan Instrumen",
        "voice": [
          "Sakelar Pria / Wanita di trek Vokal menetapkan jangkauan yang nyaman bagi penyanyi. Not di luar jangkauan diberi garis tepi merah, dan pemeriksaan menawarkan untuk mengembalikannya. Jika gaya menyebut female atau female vocals, sakelar mengatur dirinya sendiri.",
          "<b>Suara pria di YuE2 bernyanyi satu oktaf di bawah not yang tertulis.</b> Itu normal: YuE2 juga menulis melodi seperti itu di partiturnya sendiri. Jadi melodi pria tampak tinggi di editor — jangan sengaja menurunkannya, atau penyanyi akan jatuh ke nada bass.",
          "Saat mengimpor MIDI, “Sesuaikan oktaf dengan suara” melakukan pergeseran ini untuk Anda."
        ],
        "voiceTitle": "Suara pria atau wanita"
      },
      "parts": {
        "p": [
          "Sebuah lagu tersusun dari bagian: intro, bait, pra-reff, reff, bridge, interlude, outro. Di editor bagian-bagian itu adalah pita berwarna di atas birama.",
          "Bagian terhubung dengan tag di lirik: [Verse] adalah bait, [Chorus] reff, [Bridge] bridge, dan seterusnya. Dengan begitu YuE2 tahu baris mana yang dinyanyikan di mana pada not. Maka jumlah dan urutan bagian harus cocok dengan tag di lirik — pemeriksaan mengawasinya.",
          "Mengklik sebuah bagian membuka menunya: jenis, nama, “Ulangi bagian” (reff kedua dalam sekali klik), “Tambah bagian setelahnya”, “Tampilkan seluruh bagian”, “Hapus beserta birama-biramanya”. Tepi sebuah bagian bisa diseret.",
          "<b>“Tandai bagian menurut lirik”.</b> Setelah impor MIDI biasanya tidak ada bagian. Jika lirik punya tag, editor menawarkan untuk menandai not menurutnya dengan satu tombol: birama dibagi menurut tag lirik secara berurutan."
        ],
        "tip": "Lazimnya untuk YuE2: intro dan bridge 4–8 birama, bait dan reff 8–16.",
        "title": "Bagian lagu",
        "toc": "Bagian lagu"
      },
      "recipes": {
        "intro": "Keinginan yang umum dan apa yang harus dilakukan, langkah demi langkah.",
        "items": [
          {
            "title": "Saya ingin reff lebih tinggi",
            "steps": [
              "Tampilkan reff: klik bagian Reff → “Tampilkan seluruh bagian”.",
              "Dengan Pilih, buat bingkai di sekeliling not reff di trek Vokal.",
              "Tekan ↑: setiap tekan naik setengah nada. 3–5 setengah nada terdengar jelas; Shift + ↑ melompat satu oktaf.",
              "Atau di tampilan sederhana: tombol “Naikkan satu tingkat tangga nada” di setiap baris reff.",
              "Lihat pemeriksaan: not tidak boleh keluar dari jangkauan suara."
            ]
          },
          {
            "title": "Lagu tidak mengikuti not",
            "steps": [
              "Periksa rencana di tab Melodi: harusnya “Ikuti melodi” atau “Melodi dan akor”, bukan “Tanpa rencana”.",
              "Buka pemeriksaan. Penyebab umum adalah “Not lebih sedikit daripada suku kata” dan “Bagian tidak cocok dengan lirik”.",
              "Satu not per suku kata: di tampilan sederhana penghitung tiap baris harus cocok.",
              "Suara pria bernyanyi satu oktaf di bawah not yang tertulis — bandingkan bentuk melodinya, bukan ketinggiannya.",
              "Buat 2–3 take: model masih sedikit berimprovisasi, dan salah satu take biasanya lebih dekat."
            ]
          },
          {
            "title": "Melodinya membosankan",
            "steps": [
              "Angkat reff 3–5 setengah nada di atas bait — itulah yang membuatnya “lepas landas”.",
              "Campur not panjang dan pendek: beberapa yang pendek, lalu satu not panjang di akhir baris.",
              "Tambahkan lompatan: satu not yang jelas lebih tinggi daripada tetangganya, pada kata terpenting.",
              "Ulangi frasa yang bagus dengan Ctrl+C dan Ctrl+V. Pengulangan membuat melodi mudah diingat.",
              "Akhiri baris pada not nada dasar (baris yang disorot) — frasa pun terdengar selesai."
            ]
          },
          {
            "title": "Kata-katanya tidak muat",
            "steps": [
              "Buka “Sederhana”: baris yang penuh sesak menampilkan “not kurang”.",
              "Tekan “tambah” — not-not terpanjang dibelah.",
              "Atau belah sendiri not panjang dengan alat Belah (C).",
              "Jika baris masih sesak, beri ruang lebih: seret tepi bagian atau pakai “Tambah bagian setelahnya”. Atau persingkat baris liriknya."
            ]
          },
          {
            "title": "Saya ingin melodi lagu lain",
            "steps": [
              "Punya berkas audio — “Dari lagu…”: SheetSage2 menuliskan melodi dan akornya.",
              "Punya MIDI — “Impor MIDI”: pilih bagian vokal sebagai Vokal, aktifkan “Sesuaikan oktaf dengan suara” dan masukkan tempo asli lagunya.",
              "Sudah berupa take YuE2 — “Buka not” pada take, lalu “Ke formulir”.",
              "Setelah impor: “Tandai bagian menurut lirik”, lalu pemeriksaan.",
              "Kata-kata Anda kemungkinan jatuh berbeda dari aslinya — sesuaikan di tampilan sederhana."
            ]
          }
        ],
        "title": "Resep",
        "toc": "Resep"
      },
      "roll": {
        "head": {
          "key": "Tombol",
          "what": "Fungsinya"
        },
        "keys": [
          {
            "key": "Space",
            "what": "Putar atau jeda"
          },
          {
            "key": "Home",
            "what": "Kembali ke awal"
          },
          {
            "key": "B · V · E · C",
            "what": "Pensil · Pilih · Penghapus · Belah"
          },
          {
            "key": "1 2 3 4 5",
            "what": "Panjang not baru: 1/16, 1/8, 1/4, 1/2, penuh"
          },
          {
            "key": "6",
            "what": "Jeda, bukan not"
          },
          {
            "key": "K",
            "what": "Aktifkan atau matikan “Dalam nada”"
          },
          {
            "key": "L",
            "what": "Ulang birama yang ditandai"
          },
          {
            "key": "F",
            "what": "Layar penuh"
          },
          {
            "key": "↑ ↓",
            "what": "Not terpilih naik atau turun setengah nada"
          },
          {
            "key": "Shift + ↑ ↓",
            "what": "Not terpilih naik atau turun satu oktaf"
          },
          {
            "key": "← →",
            "what": "Geser pilihan (atau kursor) satu langkah grid"
          },
          {
            "key": "Shift + ← →",
            "what": "Geser satu birama penuh"
          },
          {
            "key": "Delete",
            "what": "Hapus pilihan"
          },
          {
            "key": "Ctrl + Z · Ctrl + Shift + Z",
            "what": "Urungkan · ulangi"
          },
          {
            "key": "Ctrl + C · Ctrl + V",
            "what": "Salin · tempel di kursor"
          },
          {
            "key": "Ctrl + D",
            "what": "Gandakan pilihan"
          },
          {
            "key": "Ctrl + A",
            "what": "Pilih semua not di trek"
          },
          {
            "key": "Esc",
            "what": "Hapus pilihan"
          },
          {
            "key": "Shift saat menggambar",
            "what": "Taruh not di luar nada"
          },
          {
            "key": "Alt saat menggambar",
            "what": "Hapus"
          },
          {
            "key": "Ctrl + roda",
            "what": "Perbesar atau perkecil"
          },
          {
            "key": "Shift + roda",
            "what": "Gulir ke samping"
          }
        ],
        "keysHint": "Berfungsi saat fokus ada di editor not, bukan di kolom teks.",
        "keysTitle": "Pintasan keyboard",
        "p": [
          "Piano roll adalah jalur yang berjalan dari kiri ke kanan, seperti waktu. Setiap batang di atasnya adalah satu not.",
          "<b>Lebih tinggi di layar berarti nada lebih tinggi.</b> Tuts piano di kiri menunjukkan not apa itu.",
          "<b>Batang yang lebih panjang berarti bunyi yang lebih panjang.</b> Ruang kosong di antara not adalah jeda: suara diam.",
          "<b>Birama</b> adalah bentangan di antara garis vertikal tebal; nomor birama ada di atas. Dalam 4/4 satu birama punya empat ketukan — empat langkah yang bisa Anda tepuki. Pada tempo 95 satu birama berlangsung sekitar 2,5 detik, jadi 16 birama kira-kira 40 detik lagu.",
          "<b>Grid</b> adalah garis tipis di dalam birama. Not menempel padanya, sehingga ritmenya rata. Grid yang lebih halus memungkinkan Anda menaruh not dengan lebih tepat.",
          "<b>Kursor</b> adalah garis vertikal tempat Putar dimulai. Klik penggaris birama untuk menaruhnya. Seret sepanjang penggaris untuk menandai birama yang akan diulang."
        ],
        "title": "Cara membaca piano roll",
        "toc": "Membaca piano roll",
        "tools": [
          "<b>Pensil (B)</b> — klik menaruh not dengan panjang yang dipilih; menyeret ke kanan memperpanjangnya.",
          "<b>Pilih (V)</b> — klik sebuah not atau buat bingkai di sekeliling beberapa not. Not terpilih bisa diseret, digeser dengan tombol panah, dan diubah ukurannya dari tepi kanan.",
          "<b>Penghapus (E)</b> — klik atau sapukan di atas not untuk menghapusnya. Menahan Alt mengubah alat apa pun menjadi penghapus.",
          "<b>Belah (C)</b> — membelah sebuah not menjadi dua sepanjang grid. Berguna ketika satu bunyi panjang harus membawa dua suku kata.",
          "<b>Panjang</b> — panjang not baru: 1/4 satu ketukan, 1/8 setengah ketukan, 1/2 dua ketukan. “Jeda” menggambar keheningan."
        ],
        "toolsTitle": "Alat",
        "views": [
          "<b>Piano roll</b> — tampilan utama, tempat Anda menggambar dan menyunting.",
          "<b>Not</b> — not yang sama seperti di buku musik, untuk yang membaca not: untuk dilihat dan didengar.",
          "<b>Sederhana</b> — melodi sebagai titik di atas lirik; lihat “Tampilan sederhana”."
        ],
        "viewsTitle": "Tiga tampilan"
      },
      "simple": {
        "p": [
          "“Sederhana” adalah tampilan untuk yang merasa piano roll sulit. Setiap baris lirik menjadi kartu: titik berada di atas suku kata, dan garis di antaranya menunjukkan ke mana melodi bergerak — naik atau turun.",
          "<b>Seret titik ke atas atau bawah</b> (atau pilih lalu tekan ↑ ↓) untuk menaikkan atau menurunkan not. Dengan “Dalam nada” titik hanya melangkah melalui not nada dasar, tidak pernah di luarnya. Mengklik suku kata memutar notnya.",
          "<b>Penghitung</b> “5 suku kata · 5 not” menunjukkan apakah not cukup untuk kata-katanya. Yang terbaik adalah satu not per suku kata.",
          "<b>“+1 dinyanyikan sebagai melisma”</b> — not lebih banyak daripada suku kata: yang berlebih dinyanyikan memanjang pada satu suku kata (“ye-e-eah”). Itu tidak masalah dan sering indah.",
          "<b>“Not kurang — tambah”</b> — suku kata lebih banyak daripada not. Tombol “tambah” membelah not terpanjang di baris itu agar setiap suku kata mendapat notnya sendiri.",
          "Ritme, yaitu panjang not, tidak diubah di sini — pakai piano roll untuk itu. Tombol di sebuah baris memutarnya dan menggeser seluruh baris naik atau turun."
        ],
        "title": "Tampilan sederhana: melodi di atas kata-kata",
        "toc": "Tampilan sederhana"
      },
      "start": {
        "also": [
          "<b>Mainkan piano</b> — di layar atau dengan keyboard MIDI: not ditulis satu demi satu mulai dari kursor.",
          "<b>Tempel ABC</b> — jika melodinya sudah ada sebagai ABC (menu Impor).",
          "<b>Not sebuah take</b> — take YuE2 yang sudah jadi punya “Buka not”: partiturnya terbuka sebagai salinan. Dengarkan dan sunting; formulir tidak berubah. “Ke formulir” membawa not ini ke formulir, “Tutup” kembali ke not formulir."
        ],
        "alsoTitle": "Cara lain",
        "intro": "Belum ada not? Ketiga caranya ada di layar Not yang kosong.",
        "sparse": "YuE2 menyanyikan satu not per suku kata. Jika transkripsi MIDI punya not yang jauh lebih sedikit daripada suku kata lirik (transkripsi otomatis sering begitu), model harus mengarang sisanya, dan lagu berhenti mengikuti not. Pemeriksaan memperingatkannya. Lengkapi melodi di piano roll atau tampilan sederhana — atau ambil not “Dari lagu…”.",
        "sparseTitle": "Mengapa MIDI yang “jarang” memberi hasil lemah",
        "title": "Tiga awal cepat",
        "toc": "Tiga awal cepat",
        "ways": [
          {
            "title": "Gambar dari nol",
            "text": "Pilih nada dasar, tempo, dan birama, lalu editor membangun kerangka dari lirik: bagian menurut tag [Verse] dan [Chorus], jumlah birama yang pas, dan akor sementara. Tinggal menggambar melodi vokal dengan pensil. Cara terbaik ketika melodinya ada di kepala Anda."
          },
          {
            "title": "Dari lagu…",
            "text": "Pilih berkas audio dan SheetSage2 mentranskripsikan melodi, akor, dan bagiannya. Butuh satu dua menit. Paling baik pada lagu dengan vokal yang jelas, tanpa paduan suara atau derau. Lalu sunting sesuka Anda."
          },
          {
            "title": "Impor MIDI",
            "text": "Letakkan berkas .mid dari DAW, aplikasi notasi, atau situs web. Di pemilih tentukan bagian mana yang menjadi Vokal dan mana yang menjadi Instrumen; drum dan sisanya dibuang, dan dari akor diambil not teratas. “Sesuaikan oktaf dengan suara” menggeser melodi seperti cara YuE2 menulisnya. Kolom tempo: transkripsi sering disimpan pada 120 BPM padahal lagunya lebih cepat atau lebih lambat — masukkan tempo yang sebenarnya dan not jatuh di tempat bunyinya."
          }
        ]
      },
      "what": {
        "head": {
          "name": "Rencana",
          "text": "Yang dilakukan YuE2",
          "when": "Kapan dipilih"
        },
        "p": [
          "Not adalah melodi lagu yang digambar sebagai batang: nada mana yang dinyanyikan, kapan mulai, dan berapa lama ditahan. Anda tidak perlu bisa membaca not — cukup bisa mendengar nada mana yang lebih tinggi dan mana yang lebih rendah.",
          "<b>Tanpa not</b> YuE2 mengarang melodinya sendiri. Setiap take berbeda, dan Anda tidak bisa tahu sebelumnya bagaimana sebuah baris akan dinyanyikan.",
          "<b>Dengan not</b> YuE2 menyanyikan melodi Anda. Dalam pengujian kami model mengenai not yang digambar 98% dari waktu, mempertahankan naik-turunnya melodi dan mempertahankan panjangnya: sebanyak birama yang Anda gambar, sebanyak itu yang ia nyanyikan.",
          "Di formulir not disimpan sebagai teks ABC — not yang sama yang ditulis dengan huruf. Editor menulisnya untuk Anda; Anda tidak perlu menyentuhnya."
        ],
        "plans": [
          {
            "name": "Tanpa rencana",
            "text": "Mengarang melodi dan iringan sendiri dan langsung ke audio.",
            "when": "Ketika belum ada not dan Anda hanya ingin mendengar ide. Begitu formulir punya not, aplikasi mengganti rencana ke “Ikuti melodi” dengan sendirinya."
          },
          {
            "name": "Ikuti melodi",
            "text": "Menyanyikan melodi Anda dan mengarang iringan sendiri. Akor Anda tidak dipakai.",
            "when": "Hampir selalu setelah Anda menggambar suaranya. Pilihan paling aman."
          },
          {
            "name": "Melodi dan akor",
            "text": "Memakai melodi sekaligus akor Anda.",
            "when": "Ketika Anda sudah memilih akor dan menginginkan harmoni persis itu."
          }
        ],
        "plansIntro": "Rencana dipilih di formulir, pada tab Melodi. Ia memberi tahu YuE2 apa yang harus dilakukan dengan not Anda.",
        "plansTitle": "Tiga rencana melodi",
        "title": "Apa itu not dan mengapa YuE2 memerlukannya",
        "toc": "Mengapa not"
      }
    },
    "title": "Bantuan Not",
    "toc": "Daftar isi",
    "tocPick": "Bagian bantuan"
  },
  "player": {
    "mute": "Bisukan",
    "unmute": "Bunyikan",
    "volume": "Volume"
  },
  "sa3Gen": {
    "promptHint": "Bahasa Inggris paling baik; asisten Deskripsikan menerjemahkan. Sebutkan genre, instrumen, suasana, dan tempo; untuk suara, sumbernya, cara terjadinya, dan ruangannya."
  },
  "score": {
    "checks": {
      "sparseVocal": "Not lebih sedikit daripada suku kata di lirik — YuE2 akan mengarang sisanya",
      "sparseVocalSub": "{notes} not, {syllables} suku kata. Lebih baik gambar sisa melodinya atau pakai “Dari lagu…”"
    },
    "lane": {
      "femaleAbbr": "Wan.",
      "insShort": "Instr.",
      "maleAbbr": "Pria",
      "voiceFemale": "Suara: wanita",
      "voiceMale": "Suara: pria"
    },
    "midi": {
      "fitOctave": "Sesuaikan oktaf dengan suara",
      "fitOctaveHint": "YuE2 menulis melodi sekitar satu oktaf di atas tempat melodi itu dinyanyikan, sedangkan transkripsi MIDI punya nada yang dinyanyikan. Seluruh bagian vokal bergeser dalam oktaf penuh.",
      "markSections": "Tandai bagian menurut lirik",
      "movedDown": "Vokal diturunkan {n} oktaf. | Vokal diturunkan {n} oktaf.",
      "movedUp": "Vokal dinaikkan {n} oktaf. | Vokal dinaikkan {n} oktaf.",
      "noSections": "MIDI tidak punya bagian lagu. Tag lirik: {tags}.",
      "octaveDown": "−{n} oktaf | −{n} oktaf",
      "octaveNone": "oktaf seperti di berkas",
      "octaveUp": "+{n} oktaf | +{n} oktaf",
      "tempoFile": "dari berkas",
      "tempoHint": "Berkas menyebut {bpm} BPM. Transkripsi sering disimpan pada 120 berapa pun tempo lagunya: atur tempo lagu dan not ditempatkan menurut kapan bunyinya.",
      "tempoTrack": "dari lagu “{title}”"
    },
    "overview": {
      "pickHint": "Buka birama ini di Not"
    },
    "toolbar": {
      "musician": "Untuk musisi",
      "musicianTip": "Tampilkan tingkat akor (I, IV, V…) — teori musik bagi yang paham"
    },
    "workspace": {
      "backTip": "Kembali ke sesi; not tetap di formulir",
      "copyBadge": "salinan take",
      "copyBadgeTip": "Salinan not take: formulir tidak berubah sampai “Ke formulir”",
      "copyLead": "Dengarkan dan sunting di sini — formulir tidak berubah sampai Anda menekan “Ke formulir”. “Tutup” kembali ke not formulir.",
      "copyTitle": "Not take “{title}”",
      "form": "Formulir",
      "formBadge": "not formulir",
      "formBadgeTip": "Ini not formulir: perubahan langsung masuk ke formulir (Ctrl+Z membatalkannya)",
      "label": "Not",
      "replaceConfirm": "Formulir sudah punya not lain. Ganti dengan not take ini? (Ctrl+Z mengembalikannya)",
      "title": "Not",
      "toForm": "Ke formulir"
    }
  },
  "takeCompare": {
    "seed": "Seed {seed}"
  },
  "yueGen": {
    "abcScore": "Not",
    "help": {
      "melody": {
        "sources": [
          "Dari lagu… — pilih berkas audio dan SheetSage2 menuliskan melodi dan akornya. Lagu dengan vokal yang jelas paling baik.",
          "Impor MIDI — bagian tertinggi menjadi melodi, kanal lain menjadi iringan dan akor, dan nada dasar ditemukan sendiri. Simpan melodi vokal di trek tersendiri.",
          "Piano — pilih panjang lalu tekan tuts (di bawah, di kiri piano roll, atau di keyboard MIDI): not berurutan satu demi satu.",
          "Dari sebuah lagu: Not ke MIDI di menu sebuah take, atau tab Stem dan not di pustaka, lalu Ke partitur YuE2. Vokal menjadi melodi, bass dan sisanya menjadi iringan."
        ]
      }
    },
    "unloadSheetSage": "Bebaskan kartu video setelah mengekstrak melodi"
  }
}
