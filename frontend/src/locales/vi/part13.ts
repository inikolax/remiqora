// Notes workspace and help, and the strings added or reworded after part12 (machine-translated from en); merged last, key by key.
export default {
  "aceGen": {
    "closeness": "Mức độ gần với bản gốc",
    "closenessHigh": "Tự do hơn",
    "closenessHint": "Càng sang trái, kết quả càng giữ giai điệu và phần phối của nguồn; càng sang phải, mô hình thay đổi càng nhiều.",
    "closenessLow": "Gần bản gốc hơn",
    "loraSimple": "LoRA",
    "loraTrain": "Huấn luyện của riêng bạn",
    "modelDefault": "{name} (mặc định)",
    "refChoose": "Chọn một tệp",
    "refDrop": "Thả âm thanh vào đây hoặc chọn từ thư viện",
    "refFromLibrary": "Từ thư viện",
    "refLoading": "Đang tải bản nhạc…",
    "refNeeded": "Chọn một bản nhạc ở đây, hoặc quay lại tab Bài hát để tạo bài hát mới.",
    "refOff": "Lấy một bản nhạc đã xong: một bản cover, một đoạn được vẽ lại, một phần được lấy ra hoặc thêm vào. Không có bản nhạc thì biểu mẫu tạo một bài hát mới.",
    "refRemove": "Gỡ bỏ"
  },
  "aiPart": {
    "guide": {
      "hears": [
        "Các bản nhạc được đánh dấu sẽ được trộn thành một bản stereo: kèm âm lượng của từng bản, fade và khớp tempo (W), nhưng không có hiệu ứng và bỏ qua các nút M và S.",
        "Tempo lấy từ ô BPM của dự án, không phải từ các clip: hãy đặt cho khớp với tư liệu. Giọng lấy từ «Giọng»; ở «Tự động», mô hình tự tìm.",
        "ACE-Step chỉ biết trưởng và thứ. Với bất kỳ gam nào khác, mô hình nhận giọng gần nhất và tên gam trong phần mô tả: một gợi ý, không phải bảo đảm.",
        "Các bản nhạc có biến thể đang chờ chọn sẽ không được đưa vào: chúng là bản nháp.",
        "Mô hình không nhận đoạn dài hơn 10 phút: hãy chọn một đoạn ngắn hơn."
      ],
      "limits": [
        "«Thêm một phần» chỉ chạy trên mô hình base của ACE-Step (khoảng 4,8 GB). Trong ứng dụng desktop, đó là một tùy chọn khi cài đặt; nếu bị bỏ qua, arranger sẽ hiện nút Cài đặt. Với các script, setup_models in lệnh cho việc đó ở cuối.",
        "base chậm hơn turbo: trên RTX 4080, một biến thể cho bản nhạc dài 2–3 phút mất khoảng 10 giây, và lần chạy đầu lâu hơn do phải tải mô hình.",
        "Mô hình giữ giọng và hợp âm của những gì nó nghe tốt hơn là các ý tưởng về nhịp điệu: «chơi trong các khoảng trống của giọng hát» có thể không thành.",
        "Chất lượng âm thanh là những gì mô hình cho ra. Không có chuyển MIDI thành âm thanh: mô hình chỉ làm việc với âm thanh.",
        "Nếu xl-base đã được cài, nó xuất hiện trong danh sách mô hình; trên card 16 GB nó chiếm gần hết bộ nhớ video. Để thêm các phần, hãy dùng base: theo các phép đo, xl-base trả về tạp âm ở khoảng một biến thể trong năm, base một trong hai mươi lăm.",
        "Loại bỏ tạp âm tốn thời gian: khi một biến thể bị loại, yêu cầu được gửi lại và quá trình tạo lâu hơn. Trống, bộ gõ và hiệu ứng không được kiểm tra: bản chất của chúng giống tạp âm."
      ],
      "variants": [
        {
          "term": "Nghe",
          "text": "chuyển sang biến thể này, tắt tiếng các biến thể khác và phát từ đầu đoạn."
        },
        {
          "term": "Giữ",
          "text": "giữ biến thể và xóa các biến thể khác. Với vẽ lại, nối tiếp hoặc cover, biến thể được giữ thay thế bản gốc trong đoạn."
        },
        {
          "term": "Xóa tất cả",
          "text": "xóa mọi biến thể và trả các rãnh về như cũ."
        },
        {
          "term": "Bản sao ngữ cảnh",
          "text": "đánh dấu một biến thể mà mô hình trả về gần như bản trộn nó đã nghe thay vì một phần mới. Hãy tạo lại."
        },
        {
          "term": "Tạp âm",
          "text": "đánh dấu một biến thể mà mô hình trả về tiếng xì thay vì một phần nhạc. Arranger tự loại những biến thể như vậy và yêu cầu bản thay thế, tối đa hai lần; dấu chỉ còn lại ở những gì nhận được sau các lần thử lại."
        },
        {
          "term": "Ctrl+Z",
          "text": "hoàn tác cả việc chèn các biến thể lẫn lựa chọn. Tệp của các biến thể bị loại chỉ rời khỏi thư viện khi dự án được lưu, và chỉ nếu không clip nào dùng chúng."
        }
      ]
    }
  },
  "covers": {
    "after": {
      "hintSa": "Sau khi tạo: một ảnh bìa cho tất cả các bản tạo. Chiếm GPU thêm khoảng 30 giây."
    },
    "studio": {
      "errChanged": "Trong lúc đó ảnh bìa đã được tạo lại. Hãy lưu thêm một lần nữa.",
      "errLoad": "Không tải được ảnh bìa. Hãy thử lại.",
      "errNoCover": "Bản nhạc này không có ảnh bìa để đặt chú thích lên.",
      "errSave": "Không lưu được chú thích. Hãy thử lại."
    }
  },
  "create": {
    "failed": "Không thành công. Nhấn Dùng lại các cài đặt này, rồi nhấn Tạo lần nữa.",
    "madeAt": "lúc {time}",
    "menu": {
      "midi": "Nốt nhạc thành MIDI"
    },
    "notes": {
      "cardTitle": "Nốt nhạc",
      "draw": "Vẽ",
      "drawNote": "«Vẽ» mở Nốt nhạc ở bên phải với một khung dựng từ lời bài hát: các phần theo thẻ [Verse], [Chorus], một hợp âm tạm cho mỗi ô nhịp.",
      "emptyLead": "Không có nốt, YuE2 tự viết giai điệu. Có nốt, nó hát giai điệu của bạn.",
      "emptyTitle": "Chưa có nốt nào",
      "fromSong": "Từ một bài hát",
      "fromSongDots": "Từ một bài hát…",
      "hasScore": "biểu mẫu có bản nhạc",
      "importMidi": "Nhập MIDI",
      "open": "Mở nốt nhạc",
      "openHere": "Nốt nhạc đang mở ở bên phải.",
      "openNote": "Các chỉnh sửa nốt nhạc đi thẳng vào biểu mẫu — nhấn «{button}» và YuE2 sẽ lấy chúng.",
      "openSection": "Mở phần này trong Nốt nhạc",
      "openTakeTip": "Bản nhạc của bản tạo này trong không gian Nốt nhạc — nghe, so sánh, chỉnh sửa, rồi đưa vào biểu mẫu nếu muốn",
      "rail": "Nốt nhạc",
      "railTip": "Nốt nhạc YuE2 — trình soạn bản nhạc ở bên phải, thay cho Phiên",
      "remarks": "{n} mục cần xem: {list} | {n} mục cần xem: {list}",
      "takeTitle": "{title} · Bản {n}"
    },
    "rail": {
      "ace_step": "ACE",
      "generate": "Tạo",
      "lora": "LoRA",
      "models": "Mô hình",
      "stable_audio": "Âm thanh",
      "yue2": "YuE2"
    },
    "reuse": "Dùng lại các cài đặt này",
    "reuseInForm": "Dùng lại các cài đặt này"
  },
  "editor": {
    "clipInTrash": "Bản nhạc nằm trong thùng rác",
    "clipInTrashHint": "Bản nhạc của clip này nằm trong thùng rác của thư viện: nó vẫn phát, nhưng thùng rác sẽ xóa vĩnh viễn sau 30 ngày.",
    "guide": {
      "clip": [
        "Kéo để di chuyển clip, các cạnh để cắt xén nó. Dạng sóng không bị nén khi bạn cắt xén: bạn thấy đúng phần âm thanh còn lại. Tệp nguồn không bao giờ thay đổi.",
        "Các nút trên clip nằm đè lên dạng sóng và hiện khi rê chuột hoặc khi clip được chọn; những nút đang bật luôn hiện. M tắt tiếng clip, S chỉ để nghe mình nó, W khớp nó với tempo dự án, dấu chéo xóa nó.",
        "Các tay nắm ở cạnh đặt fade. Nếu không có chúng, mỗi cạnh có một micro-fade 15 ms để chỗ cắt không bị tạch.",
        "Công cụ trên thanh transport: Chọn (V) di chuyển và cắt xén clip, Dao (C) cắt clip tại chỗ bạn nhấp, Cục tẩy (E) xóa đoạn bạn kéo qua, hoặc cả clip khi nhấp. Dao và Cục tẩy bám vào lưới và các cạnh clip; Esc quay lại Chọn.",
        "S cắt clip đang chọn tại đầu phát, hoặc mọi clip dưới đầu phát khi không chọn gì. Ctrl+D đặt một bản sao ngay sau clip.",
        "Các clip trong mờ: lưới của dòng thời gian lộ ra qua chúng."
      ],
      "lane": [
        "Đổi tên rãnh ngay trong tiêu đề của nó. M tắt tiếng nó, S chỉ để nghe mình nó.",
        "Màu: chọn rãnh và nhấp vào một chấm phía trên danh sách rãnh.",
        "Một rãnh phát cả bài hát có thể được tách thành các stem bằng nút cạnh M và S: giọng hát, trống, bass và phần còn lại sẽ thay thế nó.",
        "Dấu chéo xóa rãnh; Ctrl+Z đưa nó trở lại.",
        "Chiều cao rãnh được đặt bằng thanh trượt mũi tên trên thanh transport hoặc bằng Alt và con lăn chuột: rãnh càng cao, dạng sóng càng lớn. Một chiều cao cho mọi rãnh."
      ],
      "steps": [
        {
          "title": "Thêm rãnh",
          "text": "Nút «Rãnh» mở thư viện: thêm một bản nhạc nguyên vẹn hoặc dưới dạng stem. Có thể thả một tệp từ máy tính thẳng lên một rãnh."
        },
        {
          "title": "Sắp xếp các clip",
          "text": "Kéo các clip và cắt xén chúng bằng các cạnh. Dao (C) cắt clip tại chỗ bạn nhấp, Cục tẩy (E) xóa đoạn bạn kéo qua. Fade được kéo từ các tay nắm ở cạnh clip."
        },
        {
          "title": "Khớp tempo",
          "text": "Ô BPM đặt tempo của dự án, nút W trên clip khớp nó với tempo đó. «Nam châm» bật chế độ bám vào lưới, và công tắc «0:00 | 1 | 2» chọn thước và lưới đếm gì: giây hay ô nhịp."
        },
        {
          "title": "Phối trộn",
          "text": "Âm lượng và pan của rãnh, tám hiệu ứng trên mỗi rãnh và trên master. Nút «Mixer» hiện bàn trộn."
        },
        {
          "title": "Lưu",
          "text": "Không có tự động lưu: «Lưu» hoặc Ctrl+S. Nếu bạn rời trang khi còn thay đổi chưa lưu, trình chỉnh sửa sẽ cảnh báo."
        },
        {
          "title": "Xuất",
          "text": "WAV hoặc MP3 vào thư viện, hoặc các stem kèm dự án Reaper hay DAWproject để hoàn thiện trong DAW của riêng bạn."
        }
      ],
      "tempo": [
        "Tempo của clip được phát hiện khi thêm vào, từ 30 giây đầu của nó. Bộ phát hiện đơn giản và có thể sai với tư liệu phức tạp.",
        "W kéo giãn clip theo BPM của dự án mà không đổi cao độ.",
        "Các clip bám vào cạnh của các clip khác và vào đầu dòng thời gian. «Nam châm» thêm chế độ bám vào lưới. Công tắc «0:00 | 1 | 2» chọn lưới và thước đếm gì: giây, hoặc ô nhịp và phách theo BPM của dự án (4/4). Bước lưới theo mức thu phóng; các đường ở vạch thước sáng hơn.",
        "«Lặp» lặp lại vùng trên thước: di chuyển cả vùng hoặc kéo các cạnh của nó. Cùng vùng đó là vùng chọn cho AI arranger. Nhấp vào thước để tua."
      ]
    },
    "help": {
      "title": "Trợ giúp trình chỉnh sửa"
    },
    "hotkeys": {
      "keys": [
        {
          "keys": "Space",
          "action": "Phát và tạm dừng"
        },
        {
          "keys": "S",
          "action": "Cắt clip tại đầu phát"
        },
        {
          "keys": "V / C / E",
          "action": "Công cụ: chọn, dao, cục tẩy"
        },
        {
          "keys": "Del",
          "action": "Xóa clip đang chọn"
        },
        {
          "keys": "Ctrl+D",
          "action": "Nhân đôi clip đang chọn"
        },
        {
          "keys": "Ctrl+Z",
          "action": "Hoàn tác, tối đa 30 bước"
        },
        {
          "keys": "Ctrl+Y / Ctrl+Shift+Z",
          "action": "Làm lại"
        },
        {
          "keys": "Ctrl+S",
          "action": "Lưu dự án"
        },
        {
          "keys": "Esc",
          "action": "Bỏ chọn và quay lại công cụ Chọn"
        },
        {
          "keys": "← →",
          "action": "Đầu phát một bước lưới, bốn bước với Shift"
        },
        {
          "keys": "Home / End",
          "action": "Về đầu hoặc về cuối"
        },
        {
          "keys": "+ / −",
          "action": "Thu phóng"
        },
        {
          "keys": "Tab",
          "action": "Clip, rãnh hoặc tay nắm tiếp theo"
        }
      ],
      "mouse": [
        {
          "keys": "Ctrl+con lăn",
          "action": "Thu phóng"
        },
        {
          "keys": "Alt+con lăn",
          "action": "Chiều cao rãnh"
        },
        {
          "keys": "Nhấp bằng Dao",
          "action": "Cắt clip tại chỗ đó"
        },
        {
          "keys": "Kéo bằng Cục tẩy",
          "action": "Xóa đoạn đó của clip; nhấp sẽ xóa cả clip"
        },
        {
          "keys": "Shift+kéo",
          "action": "Cuộn dòng thời gian; nút giữa cũng dùng được"
        },
        {
          "keys": "Nhấp vào thước",
          "action": "Tua"
        },
        {
          "keys": "Thả tệp lên rãnh",
          "action": "Thêm một clip từ máy tính tại chỗ đó"
        }
      ]
    },
    "restoreFromTrash": "Khôi phục từ thùng rác",
    "trashedSources": "Một clip phát bản nhạc nằm trong thùng rác: {names}. Thùng rác xóa vĩnh viễn sau 30 ngày. | {n} clip phát các bản nhạc nằm trong thùng rác: {names}. Thùng rác xóa vĩnh viễn chúng sau 30 ngày."
  },
  "footer": {
    "muscriptorNote": "Chuyển một bản nhạc hoặc một stem thành MIDI. Trọng số chỉ dành cho mục đích phi thương mại; xem thẻ mô hình.",
    "qwenNote": "Trợ lý prompt: viết prompt từ một ý tưởng, tiêu đề và mô tả ảnh bìa.",
    "sa3Note": "Nhạc không lời và hiệu ứng âm thanh. Miễn phí cho cá nhân và thương mại dưới 1M USD doanh thu hằng năm; trên mức đó cần giấy phép doanh nghiệp.",
    "sdcppNote": "Chạy mô hình ảnh bìa.",
    "sheetsageNote": "Ghi giai điệu của một bản nhạc thành bản nhạc (Nốt nhạc, «Từ một bài hát…»). Trọng số chỉ dành cho mục đích phi thương mại; xem thẻ mô hình.",
    "zimageNote": "Vẽ các ảnh bìa. Bộ mã hóa văn bản Qwen3-4B-Instruct của nó cũng là Apache-2.0."
  },
  "header": {
    "guide": {
      "map": {
        "ace": "Bài hát và nhạc không lời nhanh từ mô tả, thẻ và lời bài hát; với bản nhạc tham chiếu còn có cover, đoạn được vẽ lại, phần được thêm vào hoặc lấy ra, phần nối tiếp.",
        "sa3": "Nhạc không lời và hiệu ứng âm thanh từ mô tả, nhanh. Trong AI arranger của trình chỉnh sửa, nó vẽ lại, nối tiếp và làm cover bằng cách nghe âm thanh xung quanh đoạn.",
        "yue": "Viết cả một bài hát có giọng hát và có thể dựng nó quanh một giai điệu cho trước (tab Giai điệu và không gian Nốt nhạc, với SheetSage2). Nó cũng chuyển một bản nhạc thành MIDI."
      },
      "steps": [
        {
          "title": "Chọn một engine",
          "text": "Vào Tạo: các engine nằm bên trái, YuE2, ACE-Step và Stable Audio. Cho bài hát đầu tiên có giọng hát, hãy chọn YuE2. Nó khởi động ngay lần nhấn Tạo đầu tiên; lần khởi động đầu mất vài phút."
        },
        {
          "title": "Mô tả bài hát",
          "text": "Ở tab Bài hát, nhập lời và phong cách, hoặc viết ý tưởng trong một câu ở dòng phía trên biểu mẫu và trợ lý sẽ điền các trường. Chọn độ dài và số bản tạo."
        },
        {
          "title": "Chọn bản tạo hay nhất",
          "text": "Các bản tạo xếp thành danh sách phiên cạnh biểu mẫu (bên dưới nó trên điện thoại). Mọi thứ đã tạo đều tự lưu vào thư viện."
        },
        {
          "title": "Tách thành các stem",
          "text": "Giọng hát, trống, bass và phần còn lại chỉ với một cú nhấp: Tách thành các stem trong menu của một bản tạo, tab Stem và nốt nhạc trong thư viện, hoặc ngay trong trình chỉnh sửa."
        },
        {
          "title": "Dựng trong trình chỉnh sửa",
          "text": "Xếp các stem lên các rãnh, thêm các phần bằng AI arranger, thiết lập hiệu ứng."
        },
        {
          "title": "Xuất",
          "text": "Trộn ra WAV hoặc MP3, hoặc xuất các rãnh kèm dự án Reaper hay DAWproject."
        }
      ],
      "tips": [
        "Không biết mô tả phong cách thế nào? Hãy bắt đầu ở trang chủ: mô tả âm nhạc trong một câu, trợ lý viết prompt và bạn chỉnh sửa nó.",
        "Gần được rồi nhưng chưa hẳn? Vẽ lại một đoạn thường nhanh hơn tạo lại từ đầu.",
        "Bản nhạc tham chiếu cho cover hoặc phần mới có thể lấy thẳng từ thư viện.",
        "Mỗi mục đều có nút trợ giúp riêng; trình chỉnh sửa còn có bảng phím tắt riêng.",
        "Trình chỉnh sửa không tự động lưu: hãy nhấn Lưu trước khi rời trang; nếu quên, trình chỉnh sửa sẽ hỏi."
      ]
    },
    "helpSections": {
      "covers": {
        "text": "Ảnh bìa được vẽ ngay trên máy tính này bởi mô hình Z-Image Turbo. Đánh dấu Tạo ảnh bìa dưới biểu mẫu và một ảnh bìa cho tất cả các bản tạo sẽ đến sau bài hát; hoặc tạo sau bằng nút trên thẻ của một bản nhạc trong thư viện, cũng được cho nhiều bản nhạc được chọn cùng lúc. Thiết kế ảnh bìa đổi mô tả của bức ảnh và thêm chú thích với tiêu đề. Mô hình ảnh bìa được cài riêng: xem Mô hình và cài đặt.",
        "title": "Ảnh bìa"
      },
      "downloads": {
        "text": "Một bản nhạc được tải về dưới dạng MP3 (320 kbit/s, kèm ảnh bìa và thẻ, phát được ở mọi nơi), FLAC (lossless, kèm ảnh bìa và thẻ) hoặc WAV (nguồn cho DAW, không có ảnh bìa). Chọn định dạng trong menu Tải về của một bản tạo hoặc một bản nhạc, nó được ghi nhớ; cũng có thể đặt trong Mô hình và cài đặt, Chung. Tên nghệ sĩ được ghi vào thẻ.",
        "title": "Định dạng tải về"
      },
      "engines": {
        "text": "Ba engine tạo âm thanh, YuE2-3B, ACE-Step 1.5 và Stable Audio 3, và chúng không vừa cùng lúc trên một GPU, nên mỗi lần chỉ chạy một. Chọn một engine ở trang Tạo: nó khởi động khi bạn nhấn Tạo, và engine đang chạy tự dừng. Đèn cho biết trạng thái của nó; lần khởi động đầu có thể mất vài phút khi mô hình nạp vào bộ nhớ video. Nút trạng thái ở tiêu đề cho biết cái gì đang giữ GPU và có thể giải phóng nó."
      },
      "library": {
        "text": "Mọi bản nhạc, dù được tạo ra, tải lên hay xuất từ trình chỉnh sửa, đều vào một thư viện chung mà mọi mô-đun đều dùng được, nên bản nhạc làm bởi bất kỳ engine nào cũng có thể được tách stem, chuyển âm và phối trộn mà không cần rời ứng dụng."
      },
      "notes": {
        "more": "Thêm về nốt nhạc",
        "text": "Nốt nhạc là không gian làm việc của YuE2: nút Nốt nhạc dưới YuE2 trong thanh bên của Tạo. Nó hiển thị và chỉnh sửa giai điệu của bài hát dưới dạng bản nhạc; bản nhạc có thể đến từ một bản tạo đã xong (Từ một bài hát…, SheetSage2) hoặc một tệp MIDI và đi vào biểu mẫu của YuE2 ở tab Giai điệu.",
        "title": "Nốt nhạc"
      },
      "trash": {
        "text": "Các bản nhạc đã xóa vào thùng rác của thư viện và ở đó 30 ngày: khôi phục chúng từ đó hoặc xóa vĩnh viễn. Chọn nhiều bản nhạc để chuyển vào thùng rác cùng lúc, gắn thẻ, tạo ảnh bìa hoặc đặt tên. Thư viện lọc theo thẻ.",
        "title": "Thùng rác và thẻ"
      }
    }
  },
  "home": {
    "allTracks": "Mở thư viện"
  },
  "idea": {
    "languageAutoIdea": "Tự động (theo ý tưởng)",
    "writer": "Ai viết lời và phong cách:",
    "writerAce": "chính ACE-Step"
  },
  "libraryPage": {
    "filters": {
      "midi": "MIDI",
      "score": "Nốt nhạc"
    },
    "filtersToggle": "Bộ lọc",
    "openEditor": "Mở trong trình chỉnh sửa",
    "openEditorFailed": "Không mở được trong trình chỉnh sửa: {error}",
    "openEditorHint": "Một dự án trình chỉnh sửa mới với bản nhạc này trên một rãnh",
    "promptTitle": "Bản nhạc không có tên riêng: hiển thị một dòng lời của nó.",
    "score": {
      "download": "Tải .abc",
      "failed": "Không tải được nốt nhạc: {error}",
      "hint": "Bản nhạc ABC mà YuE2 đã dựa vào để hát bản nhạc này",
      "open": "Mở trong Nốt nhạc",
      "openHint": "Một bản sao của bản nhạc trong Nốt nhạc ở trang Tạo; nốt nhạc của biểu mẫu giữ nguyên",
      "title": "Nốt nhạc"
    },
    "trash": {
      "loading": "Đang tải…"
    },
    "usage": {
      "bulk": "{n} bản nhạc đang được dùng trong các dự án trình chỉnh sửa: {names}. Trong thùng rác chúng vẫn phát, nhưng nếu bạn dọn thùng rác thì các clip của chúng trong dự án sẽ biến mất. Xóa?",
      "more": " (và {n} bản nữa)",
      "purge": "Xóa vĩnh viễn? Đang được dùng trong các dự án trình chỉnh sửa: {names}. Các clip của chúng trong dự án sẽ biến mất.",
      "single": "Bản nhạc đang được dùng trong dự án trình chỉnh sửa «{name}»{more}. Trong thùng rác nó vẫn phát, nhưng nếu bạn dọn thùng rác thì clip trong dự án sẽ biến mất. Xóa?"
    },
    "yueLicence": "YuE2: giấy phép phi thương mại (CC BY-NC 4.0)",
    "yueLicenceHint": "Các bài hát của YuE2 không được bán hoặc dùng cho mục đích thương mại. Chi tiết: Mô hình và giấy phép."
  },
  "midiPanel": {
    "recognize": "Nốt nhạc thành MIDI"
  },
  "models": {
    "general": {
      "artist": "Tên nghệ sĩ",
      "artistHint": "Được ghi vào thẻ của các bản nhạc tải về. Cùng tên như ở chân trang.",
      "artistSave": "Lưu",
      "artistSaved": "Đã lưu",
      "autoCover": "Tạo ảnh bìa sau bài hát",
      "autoCoverHint": "Giá trị ban đầu của ô Tạo ảnh bìa dưới biểu mẫu của các engine.",
      "autoCoverOff": "Ảnh bìa đang tắt hoặc mô hình của chúng chưa được cài: xem Ảnh bìa.",
      "formatHint": "Định dạng của các nút Tải về trong phiên và thư viện. Định dạng chọn trong một menu tải về cũng được ghi nhớ ở đây.",
      "languageHint": "Cùng lựa chọn với nút ngôn ngữ ở tiêu đề.",
      "nav": "Chung",
      "title": "Cài đặt chung"
    },
    "showMore": "{n} nữa, chưa tải về: {names} ▾"
  },
  "notesHelp": {
    "actions": {
      "checks": "Hiện phần kiểm tra",
      "draw": "Mở «Vẽ từ đầu»",
      "musicianOff": "Ẩn số La Mã",
      "musicianOn": "Hiện số La Mã",
      "simple": "Mở chế độ đơn giản",
      "snapIsOn": "«Trong giọng» đang bật",
      "snapOn": "Bật «Trong giọng»"
    },
    "fig": {
      "at": "tempo 95, 4/4",
      "barTime": "1 ô nhịp ≈ 2,5 giây",
      "beats": "4 phách: một-hai-ba-bốn",
      "brk": "đoạn nghỉ",
      "chordsTitle": "Hợp âm trên các ô nhịp",
      "counter": "5 âm tiết · 6 nốt",
      "fourBars": "4 ô nhịp ≈ 10 giây",
      "higher": "cao hơn",
      "inKey": "nốt của giọng",
      "ins": "Nhạc cụ",
      "intro": "intro",
      "longer": "nốt dài",
      "lower": "thấp hơn",
      "lyricsTags": "Thẻ trong lời bài hát",
      "melisma": "kéo dài",
      "octaveNote": "giọng nam hát thấp hơn các nốt được viết một quãng tám",
      "offKey": "ngoài giọng",
      "partsRibbon": "Các phần trong bản nhạc",
      "pause": "dấu lặng",
      "picker": "Phù hợp",
      "shorter": "ngắn",
      "sing": "giọng hát đang hát",
      "snapped": "rơi vào đây",
      "sung": "được hát",
      "syllables": [
        "Mặt",
        "trời",
        "của",
        "em",
        "ơi"
      ],
      "time": "thời gian →",
      "vocal": "Giọng hát",
      "written": "được viết"
    },
    "firstTime": "Lần đầu dùng nốt nhạc?",
    "open": "Trợ giúp về nốt nhạc",
    "openTip": "Nói đơn giản: cách vẽ một giai điệu và cách YuE2 hát nó",
    "sections": {
      "checks": {
        "head": {
          "check": "Nó báo gì",
          "fix": "Nên làm gì",
          "means": "Ý nghĩa"
        },
        "intro": "Phần kiểm tra là dòng ở cuối màn hình Nốt nhạc: nhấp vào để mở danh sách. Màu vàng nghĩa là «nên xem qua», xanh lá là mọi thứ ổn, xám chỉ là ghi chú. Khi cách sửa đã rõ sẽ có nút Sửa; nút Hiện chọn các nốt hoặc ô nhịp liên quan. Ctrl+Z hoàn tác mọi thao tác sửa.",
        "rows": [
          {
            "check": "Chưa có giọng hoặc tempo",
            "means": "YuE2 không biết hát ở giọng nào và nhanh đến đâu.",
            "fix": "Chọn chúng trên các chip ở phía trên."
          },
          {
            "check": "Ô nhịp chưa có hợp âm",
            "means": "YuE2 quen với một hợp âm ở mỗi ô nhịp.",
            "fix": "Cứ nhấn Sửa: hợp âm trước đó sẽ được kéo sang các ô nhịp trống."
          },
          {
            "check": "Giọng hát chưa có nốt nào",
            "means": "Chưa có giai điệu — YuE2 sẽ tự nghĩ ra một giai điệu.",
            "fix": "Vẽ giai điệu bằng bút chì hoặc dùng một trong các cách bắt đầu nhanh."
          },
          {
            "check": "Số nốt ít hơn số âm tiết trong lời bài hát",
            "means": "Số nốt ít hơn nhiều so với số âm tiết: YuE2 tự nghĩ ra phần còn lại và có thể lệch khỏi các nốt của bạn.",
            "fix": "Bổ sung nốt (ở chế độ đơn giản, dùng nút «thêm») hoặc dùng «Từ một bài hát…»."
          },
          {
            "check": "Các nốt cao hoặc thấp hơn giọng hát",
            "means": "Người hát khó hát; YuE2 có thể bị gắng sức hoặc nhảy sang quãng tám khác.",
            "fix": "Trước hết kiểm tra đã chọn đúng giọng nam hay nữ chưa. Sau đó nhấn Sửa: giai điệu sẽ được dời theo quãng tám vào đúng âm vực."
          },
          {
            "check": "Các phần không khớp với lời bài hát",
            "means": "Số phần trong bản nhạc nhiều hơn hoặc ít hơn số thẻ trong lời bài hát: các dòng lời rơi sai chỗ.",
            "fix": "Sửa sẽ thêm các phần còn thiếu ở cuối — sau đó hãy kiểm tra thứ tự. Các phần thừa thì tự xóa hoặc chỉnh lại thẻ trong lời bài hát."
          },
          {
            "check": "Nhạc cụ chơi cùng giọng hát",
            "means": "Chỉ là ghi chú, không phải lỗi: thường nhạc cụ im lặng khi giọng hát đang hát.",
            "fix": "Không cần làm gì nếu bạn muốn như vậy. Nếu không, hãy xóa các nốt của nhạc cụ ở những ô nhịp đó."
          },
          {
            "check": "ABC quá dài",
            "means": "Một bản nhạc rất dài chiếm nhiều chỗ trong prompt của YuE2.",
            "fix": "Rút ngắn bài hát hoặc xóa bớt các nốt thừa của nhạc cụ."
          }
        ],
        "tip": "Các mục màu xanh lá không cần làm gì. Khi không còn mục nào cần xem, bạn có thể nhấn Tạo.",
        "title": "Kiểm tra cho YuE2",
        "toc": "Kiểm tra cho YuE2"
      },
      "chords": {
        "note": "YuE2 chỉ dùng hợp âm với kế hoạch «Giai điệu và hợp âm». Với «Theo một giai điệu», mô hình tự chọn phần đệm, còn hợp âm của bạn chỉ là gợi ý cho chính bạn.",
        "p": [
          "<b>Hợp âm</b> là nhiều âm được chơi cùng lúc. Phần đệm dựa trên nó: guitar, keys, bass. Các hợp âm nằm thành một hàng phía trên các nốt, thường là một hợp âm cho mỗi ô nhịp.",
          "Nhấp vào hợp âm của một ô nhịp (hoặc một chỗ trống trong hàng) để chọn hợp âm khác. Các hợp âm <b>phù hợp</b> hiện lên đầu: hợp âm của giọng bạn, thứ YuE2 giữ tốt nhất. Bên dưới là «Thường gặp ở giọng thứ» hoặc «Thường gặp ở giọng trưởng» và «Thêm» để thử nghiệm. «Nghe» phát hợp âm, «Hai hợp âm trong một ô nhịp» chia ô nhịp thành hai hợp âm.",
          "Không biết chọn gì? Cứ giữ những gì «Vẽ từ đầu» đặt vào: một chuỗi bốn hợp âm đã được kiểm chứng.",
          "<b>Dành cho người biết nhạc</b> — công tắc dưới lưới hiện số La Mã ở các hợp âm (I, IV, V, vi…): bậc của hợp âm trong giọng. Nó dành cho những ai biết lý thuyết; người khác không cần đến."
        ],
        "title": "Hợp âm",
        "toc": "Hợp âm"
      },
      "faq": {
        "items": [
          {
            "q": "Tôi có cần biết đọc nhạc không?",
            "a": "Không. Chỉ cần nghe được «cao hơn — thấp hơn» và «dài hơn — ngắn hơn». Hãy bật «Trong giọng» và sẽ không có nốt sai."
          },
          {
            "q": "Tại sao giọng nam hát thấp hơn những gì đã vẽ?",
            "a": "YuE2 viết giai điệu giọng nam cao hơn nơi chúng được hát một quãng tám. Đó là bình thường; không cần hạ các nốt xuống."
          },
          {
            "q": "Các nốt được lưu ở đâu đó không?",
            "a": "Có, chúng là nốt nhạc của biểu mẫu: mọi thay đổi đi thẳng vào biểu mẫu, và Ctrl+Z hoàn tác được. Không cần lưu riêng — nhấn Tạo là YuE2 lấy chúng."
          },
          {
            "q": "Bài hát sẽ dài bao lâu?",
            "a": "Dài bằng số ô nhịp của nó. Ở tempo 95 nhịp 4/4, một ô nhịp kéo dài khoảng 2,5 giây: 16 ô nhịp là khoảng 40 giây, 64 ô nhịp khoảng 2,7 phút."
          },
          {
            "q": "Tại sao YuE2 không hát đúng từng nốt của tôi?",
            "a": "Mô hình bám sát các nốt, nhưng nó không phải bộ tổng hợp âm thanh: nó có thể tô điểm giai điệu, dời một âm tiết, hát thấp hơn một quãng tám. Nếu khác nhiều, hãy xem công thức «Bài hát không bám theo các nốt»."
          },
          {
            "q": "Tôi có cần vẽ trống và bass không?",
            "a": "Không. Chỉ cần giọng hát và, nếu muốn, một dòng nhạc cụ ở intro và các đoạn nghỉ. YuE2 chơi phần còn lại theo phong cách."
          },
          {
            "q": "Văn bản ABC ở dưới cùng là gì?",
            "a": "Cũng chính các nốt đó nhưng viết bằng chữ cái — đó là thứ YuE2 nhận được. Trình soạn thảo tự viết nó; chỉ sửa tay nếu bạn biết định dạng này."
          },
          {
            "q": "Làm sao nghe mà không cần tạo bài hát?",
            "a": "Nghe (Space) phát các nốt bằng tiếng piano. Metronome gõ nhịp các phách, Lặp lặp lại các ô nhịp đã đánh dấu."
          },
          {
            "q": "Tôi có thể lấy nốt nhạc của một bản tạo đã xong không?",
            "a": "Có: «Mở nốt nhạc» ở một bản tạo sẽ mở chúng dưới dạng bản sao. Sửa, nghe rồi nhấn «Vào biểu mẫu» để tạo một bản mới từ chúng."
          }
        ],
        "title": "Câu hỏi thường gặp",
        "toc": "Hỏi đáp"
      },
      "key": {
        "p": [
          "<b>Giọng</b> là một bộ bảy âm hòa hợp với nhau. Giai điệu làm từ chúng nghe đúng, còn một âm ngoài bộ thì chói tai như nốt sai.",
          "<b>Thứ</b> nghe buồn và kịch tính hơn, <b>trưởng</b> tươi sáng và phấn chấn hơn. Chữ cái (C, D, A…) là âm mà bộ âm bắt đầu. Nghe bằng tai thì gần như không quan trọng; điều quan trọng là hát có thoải mái không.",
          "Các hàng của lưới thuộc giọng được tô sáng. Bật <b>«Trong giọng»</b> và bút chì sẽ không cho bạn đặt nốt sai: nó rơi vào hàng phù hợp gần nhất. Đó là cách dễ nhất để không bao giờ hát lệch. Cần một nốt ngoài giọng? Giữ Shift.",
          "Giọng được đổi trên chip Giọng ở phía trên. Khi bật «Dịch cả nốt và hợp âm», toàn bộ bài hát dịch đi và nghe cao hơn hoặc thấp hơn."
        ],
        "tempo": [
          "<b>Tempo</b> là số phách mỗi phút (BPM). 70–90 là chậm rãi, 95–120 vừa, từ 130 trở lên là nhanh. YuE2 lấy tempo từ các nốt; tempo ghi trong văn bản phong cách không có tác dụng.",
          "<b>Nhịp</b> cho biết một ô nhịp có bao nhiêu phách. 4/4 dùng cho hầu hết nhạc pop và rock, 3/4 là điệu waltz, 6/8 là cảm giác đung đưa, các bản ballad. Không chắc? Cứ giữ 4/4.",
          "<b>Độ dài</b> là số ô nhịp của bài hát. Âm thanh theo các nốt: 8 ô nhịp 4/4 ở tempo 95 dài khoảng 20 giây."
        ],
        "tempoTitle": "Tempo và nhịp",
        "title": "Giọng, tempo và nhịp",
        "toc": "Giọng và tempo"
      },
      "lanes": {
        "p": [
          "Bản nhạc có hai rãnh. <b>Giọng hát</b> (các nốt màu tím hồng) là phần người hát hát. <b>Nhạc cụ</b> (màu xanh ngọc) là một dòng giai điệu của nhạc cụ: intro, các đoạn nghỉ, phần kết.",
          "Bút chì ghi vào rãnh đang hoạt động — nhấp vào rãnh kia để chuyển. «Tắt tiếng» và «Chỉ rãnh này» chỉ đổi những gì bạn nghe ở đây; chúng không ảnh hưởng đến bài hát.",
          "<b>Vì sao nhạc cụ thường im lặng khi giọng hát đang hát.</b> Các bản nhạc của chính YuE2 được làm như vậy: nhạc cụ lấp những chỗ không có giọng. Nếu nó chơi đè lên lúc hát, YuE2 có thể lẫn không biết hát gì. Phần kiểm tra chỉ ra những ô nhịp như vậy — đó là ghi chú, không phải lỗi.",
          "Trống, bass và phần đệm không cần vẽ: YuE2 tự chơi chúng theo phong cách và các hợp âm."
        ],
        "title": "Giọng hát và Nhạc cụ",
        "toc": "Giọng hát và Nhạc cụ",
        "voice": [
          "Công tắc Nam / Nữ trên rãnh Giọng hát đặt âm vực thoải mái cho người hát. Các nốt ngoài âm vực có viền đỏ, và phần kiểm tra đề nghị đưa chúng trở lại. Nếu phong cách ghi female hoặc female vocals, công tắc tự đặt.",
          "<b>Giọng nam của YuE2 hát thấp hơn các nốt được viết một quãng tám.</b> Đó là bình thường: YuE2 cũng viết giai điệu như vậy trong các bản nhạc của chính nó. Vì thế giai điệu giọng nam trông cao trong trình soạn thảo — đừng cố tình hạ xuống, nếu không người hát sẽ rơi xuống âm trầm.",
          "Khi nhập MIDI, «Chỉnh quãng tám cho khớp giọng hát» sẽ thực hiện phép dời này cho bạn."
        ],
        "voiceTitle": "Giọng nam hay nữ"
      },
      "parts": {
        "p": [
          "Một bài hát gồm các phần: intro, verse, pre-chorus, chorus, bridge, interlude, outro. Trong trình soạn thảo, chúng là dải màu phía trên các ô nhịp.",
          "Các phần gắn với các thẻ trong lời bài hát: [Verse] là verse, [Chorus] là chorus, [Bridge] là bridge, v.v. Nhờ vậy YuE2 biết hát các dòng lời nào ở chỗ nào của bản nhạc. Vì thế số lượng và thứ tự các phần phải khớp với các thẻ trong lời bài hát — phần kiểm tra theo dõi điều đó.",
          "Nhấp vào một phần sẽ mở menu của nó: loại, tên, «Lặp lại phần này» (chorus thứ hai chỉ trong một giây), «Thêm một phần phía sau», «Hiện toàn bộ phần», «Xóa cùng các ô nhịp». Có thể kéo cạnh của một phần.",
          "<b>«Đánh dấu các phần theo lời bài hát».</b> Sau khi nhập MIDI thường không có phần nào. Nếu lời bài hát có thẻ, trình soạn thảo đề nghị đánh dấu các nốt theo chúng chỉ bằng một nút: các ô nhịp được chia theo thẻ của lời bài hát theo thứ tự."
        ],
        "tip": "Thường dùng cho YuE2: intro và bridge 4–8 ô nhịp, verse và chorus 8–16.",
        "title": "Các phần của bài hát",
        "toc": "Các phần của bài hát"
      },
      "recipes": {
        "intro": "Những mong muốn thường gặp và cách làm, từng bước một.",
        "items": [
          {
            "title": "Tôi muốn chorus cao hơn",
            "steps": [
              "Hiện chorus: nhấp vào phần Chorus → «Hiện toàn bộ phần».",
              "Với công cụ Chọn, kéo khung quanh các nốt của chorus trên rãnh Giọng hát.",
              "Nhấn ↑: mỗi lần nhấn lên một nửa cung. 3–5 nửa cung đã nghe rõ; Shift + ↑ nhảy một quãng tám.",
              "Hoặc ở chế độ đơn giản: các nút «Nâng lên một bậc gam» ở mỗi dòng của chorus.",
              "Xem phần kiểm tra: các nốt không được ra khỏi âm vực của giọng hát."
            ]
          },
          {
            "title": "Bài hát không bám theo các nốt",
            "steps": [
              "Kiểm tra kế hoạch ở tab Giai điệu: phải là «Theo một giai điệu» hoặc «Giai điệu và hợp âm», không phải «Không có kế hoạch».",
              "Mở phần kiểm tra. Nguyên nhân thường gặp là «Số nốt ít hơn số âm tiết» và «Các phần không khớp với lời bài hát».",
              "Một nốt cho mỗi âm tiết: ở chế độ đơn giản, bộ đếm của mỗi dòng phải khớp nhau.",
              "Giọng nam hát thấp hơn các nốt được viết một quãng tám — hãy so sánh hình dáng của giai điệu, không phải độ cao.",
              "Tạo 2–3 bản: mô hình vẫn ngẫu hứng đôi chút, và thường có một bản sát hơn."
            ]
          },
          {
            "title": "Giai điệu nhàm chán",
            "steps": [
              "Nâng chorus cao hơn verse 3–5 nửa cung — đó là điều khiến nó «bay lên».",
              "Trộn nốt dài và nốt ngắn: vài nốt ngắn, rồi một nốt dài ở cuối dòng.",
              "Thêm một bước nhảy: một nốt cao hơn rõ rệt so với các nốt bên cạnh, đặt ở từ quan trọng nhất.",
              "Lặp lại một câu nhạc hay bằng Ctrl+C và Ctrl+V. Sự lặp lại làm giai điệu dễ nhớ.",
              "Kết một dòng ở một nốt của giọng (hàng được tô sáng) — khi đó câu nhạc nghe có vẻ trọn vẹn."
            ]
          },
          {
            "title": "Lời không vừa",
            "steps": [
              "Mở «Đơn giản»: một dòng bị chật sẽ hiện «thiếu nốt».",
              "Nhấn «thêm» — các nốt dài nhất sẽ được tách ra.",
              "Hoặc tự tách các nốt dài bằng công cụ Cắt (C).",
              "Nếu dòng vẫn chật, hãy cho nó nhiều chỗ hơn: kéo cạnh của phần hoặc dùng «Thêm một phần phía sau». Hoặc rút ngắn dòng lời."
            ]
          },
          {
            "title": "Tôi muốn giai điệu của một bài hát khác",
            "steps": [
              "Có một tệp âm thanh — «Từ một bài hát…»: SheetSage2 ghi lại giai điệu và hợp âm.",
              "Có một tệp MIDI — «Nhập MIDI»: chọn phần giọng hát làm Giọng hát, bật «Chỉnh quãng tám cho khớp giọng hát» và nhập tempo thật của bài hát.",
              "Đó đã là một bản tạo của YuE2 — «Mở nốt nhạc» ở bản tạo, rồi «Vào biểu mẫu».",
              "Sau khi nhập: «Đánh dấu các phần theo lời bài hát», rồi phần kiểm tra.",
              "Lời của bạn nhiều khả năng sẽ rơi khác với bản gốc — hãy chỉnh chúng ở chế độ đơn giản."
            ]
          }
        ],
        "title": "Công thức",
        "toc": "Công thức"
      },
      "roll": {
        "head": {
          "key": "Phím",
          "what": "Tác dụng"
        },
        "keys": [
          {
            "key": "Space",
            "what": "Phát hoặc tạm dừng"
          },
          {
            "key": "Home",
            "what": "Về đầu"
          },
          {
            "key": "B · V · E · C",
            "what": "Bút chì · Chọn · Cục tẩy · Cắt"
          },
          {
            "key": "1 2 3 4 5",
            "what": "Độ dài nốt mới: 1/16, 1/8, 1/4, 1/2, nguyên"
          },
          {
            "key": "6",
            "what": "Dấu lặng thay cho nốt"
          },
          {
            "key": "K",
            "what": "Bật hoặc tắt «Trong giọng»"
          },
          {
            "key": "L",
            "what": "Lặp các ô nhịp đã đánh dấu"
          },
          {
            "key": "F",
            "what": "Toàn màn hình"
          },
          {
            "key": "↑ ↓",
            "what": "Các nốt đã chọn lên hoặc xuống một nửa cung"
          },
          {
            "key": "Shift + ↑ ↓",
            "what": "Các nốt đã chọn lên hoặc xuống một quãng tám"
          },
          {
            "key": "← →",
            "what": "Di chuyển vùng chọn (hoặc con trỏ) một bước lưới"
          },
          {
            "key": "Shift + ← →",
            "what": "Di chuyển cả một ô nhịp"
          },
          {
            "key": "Delete",
            "what": "Xóa vùng chọn"
          },
          {
            "key": "Ctrl + Z · Ctrl + Shift + Z",
            "what": "Hoàn tác · làm lại"
          },
          {
            "key": "Ctrl + C · Ctrl + V",
            "what": "Sao chép · dán tại con trỏ"
          },
          {
            "key": "Ctrl + D",
            "what": "Nhân đôi vùng chọn"
          },
          {
            "key": "Ctrl + A",
            "what": "Chọn tất cả các nốt của rãnh"
          },
          {
            "key": "Esc",
            "what": "Bỏ chọn"
          },
          {
            "key": "Shift khi vẽ",
            "what": "Đặt một nốt ngoài giọng"
          },
          {
            "key": "Alt khi vẽ",
            "what": "Xóa"
          },
          {
            "key": "Ctrl + con lăn",
            "what": "Phóng to hoặc thu nhỏ"
          },
          {
            "key": "Shift + con lăn",
            "what": "Cuộn ngang"
          }
        ],
        "keysHint": "Chúng hoạt động khi tiêu điểm nằm trong trình soạn thảo nốt, không phải trong ô nhập văn bản.",
        "keysTitle": "Phím tắt",
        "p": [
          "Piano roll là một dải chạy từ trái sang phải, như thời gian. Mỗi thanh trên đó là một nốt.",
          "<b>Càng cao trên màn hình thì âm càng cao.</b> Các phím piano bên trái cho biết đó là nốt nào.",
          "<b>Thanh càng dài thì âm càng dài.</b> Khoảng trống giữa các nốt là dấu lặng: giọng hát im lặng.",
          "Một <b>ô nhịp</b> là đoạn giữa các đường dọc đậm; số ô nhịp ở phía trên. Ở nhịp 4/4, một ô nhịp có bốn phách — bốn bước bạn có thể vỗ tay theo. Ở tempo 95, một ô nhịp kéo dài khoảng 2,5 giây, nên 16 ô nhịp là khoảng 40 giây bài hát.",
          "<b>Lưới</b> là các đường mảnh bên trong một ô nhịp. Các nốt bám vào chúng, nên nhịp điệu ra đều. Lưới mịn hơn cho phép đặt nốt chính xác hơn.",
          "<b>Con trỏ</b> là đường dọc nơi Nghe bắt đầu. Nhấp vào thước ô nhịp để đặt nó. Kéo dọc theo thước để đánh dấu các ô nhịp cần lặp."
        ],
        "title": "Cách đọc piano roll",
        "toc": "Đọc piano roll",
        "tools": [
          "<b>Bút chì (B)</b> — một cú nhấp đặt một nốt có độ dài đã chọn; kéo sang phải làm nó dài hơn.",
          "<b>Chọn (V)</b> — nhấp vào một nốt hoặc kéo khung quanh nhiều nốt. Các nốt đã chọn có thể kéo, di chuyển bằng phím mũi tên và đổi độ dài bằng cạnh phải.",
          "<b>Cục tẩy (E)</b> — nhấp hoặc lướt qua các nốt để xóa chúng. Giữ Alt biến mọi công cụ thành cục tẩy.",
          "<b>Cắt (C)</b> — tách một nốt làm đôi theo lưới. Tiện khi một âm dài phải mang hai âm tiết.",
          "<b>Độ dài</b> — độ dài của nốt mới: 1/4 là một phách, 1/8 nửa phách, 1/2 hai phách. «Dấu lặng» vẽ ra khoảng im lặng."
        ],
        "toolsTitle": "Công cụ",
        "views": [
          "<b>Piano roll</b> — chế độ xem chính, nơi bạn vẽ và chỉnh sửa.",
          "<b>Bản nhạc</b> — cũng các nốt đó như trong sách nhạc, dành cho người đọc được nốt: để xem và nghe.",
          "<b>Đơn giản</b> — giai điệu dưới dạng các chấm trên lời bài hát; xem «Chế độ đơn giản»."
        ],
        "viewsTitle": "Ba chế độ xem"
      },
      "simple": {
        "p": [
          "«Đơn giản» là chế độ dành cho những ai thấy piano roll khó. Mỗi dòng lời là một thẻ: các chấm nằm trên các âm tiết, và đường nối giữa chúng cho thấy giai điệu đi đâu — lên hay xuống.",
          "<b>Kéo một chấm lên hoặc xuống</b> (hoặc chọn nó rồi nhấn ↑ ↓) để nâng hoặc hạ nốt. Với «Trong giọng», chấm chỉ bước qua các nốt của giọng, không bao giờ ra ngoài. Nhấp vào một âm tiết sẽ phát nốt của nó.",
          "<b>Bộ đếm</b> «5 âm tiết · 5 nốt» cho biết số nốt có đủ cho lời không. Tốt nhất là một nốt cho mỗi âm tiết.",
          "<b>«+1 hát kéo dài (melisma)»</b> — nốt nhiều hơn âm tiết: các nốt thừa được hát kéo dài trên một âm tiết («ye-e-eah»). Như vậy là ổn và thường rất hay.",
          "<b>«Thiếu nốt — thêm»</b> — âm tiết nhiều hơn nốt. Nút «thêm» tách các nốt dài nhất của dòng để mỗi âm tiết có nốt riêng.",
          "Nhịp điệu, tức độ dài các nốt, không đổi ở đây — hãy dùng piano roll cho việc đó. Các nút ở mỗi dòng phát dòng đó và dời cả dòng lên hoặc xuống."
        ],
        "title": "Chế độ đơn giản: giai điệu trên lời",
        "toc": "Chế độ đơn giản"
      },
      "start": {
        "also": [
          "<b>Chơi bằng piano</b> — trên bàn phím màn hình hoặc bàn phím MIDI: các nốt được ghi nối tiếp nhau từ vị trí con trỏ.",
          "<b>Dán ABC</b> — nếu giai điệu đã có sẵn dưới dạng ABC (menu Nhập).",
          "<b>Nốt nhạc của một bản tạo</b> — một bản tạo YuE2 đã xong có «Mở nốt nhạc»: bản nhạc của nó mở ra dưới dạng bản sao. Hãy nghe và chỉnh sửa; biểu mẫu không đổi. «Vào biểu mẫu» đưa các nốt này vào biểu mẫu, «Đóng» quay lại nốt nhạc của biểu mẫu."
        ],
        "alsoTitle": "Thêm cách khác",
        "intro": "Chưa có nốt nào? Cả ba cách đều nằm trên màn hình Nốt nhạc trống.",
        "sparse": "YuE2 hát một nốt cho mỗi âm tiết. Nếu một bản chuyển MIDI có số nốt ít hơn nhiều so với số âm tiết của lời (các bản chuyển tự động thường như vậy), mô hình phải tự nghĩ ra phần còn lại, và bài hát thôi bám theo các nốt. Phần kiểm tra cảnh báo về điều này. Hãy bổ sung giai điệu trong piano roll hoặc chế độ đơn giản — hoặc lấy nốt «Từ một bài hát…».",
        "sparseTitle": "Vì sao MIDI «thưa» cho kết quả yếu",
        "title": "Ba cách bắt đầu nhanh",
        "toc": "Ba cách bắt đầu nhanh",
        "ways": [
          {
            "title": "Vẽ từ đầu",
            "text": "Chọn giọng, tempo và nhịp, và trình soạn thảo dựng một khung từ lời bài hát: các phần theo thẻ [Verse] và [Chorus], số ô nhịp phù hợp và các hợp âm tạm. Việc còn lại là vẽ giai điệu giọng hát bằng bút chì. Cách tốt nhất khi giai điệu đã có trong đầu."
          },
          {
            "title": "Từ một bài hát…",
            "text": "Chọn một tệp âm thanh và SheetSage2 chuyển giai điệu, hợp âm và các phần của nó thành bản nhạc. Mất một hai phút. Hiệu quả nhất với bản nhạc có giọng hát rõ, không có hợp xướng hay tạp âm. Sau đó chỉnh sửa tùy ý."
          },
          {
            "title": "Nhập MIDI",
            "text": "Thả một tệp .mid từ DAW, ứng dụng soạn nhạc hoặc một trang web. Trong hộp chọn, hãy chọn phần nào thành Giọng hát và phần nào thành Nhạc cụ; trống và phần còn lại bị bỏ, còn với hợp âm thì lấy nốt cao nhất. «Chỉnh quãng tám cho khớp giọng hát» dời giai điệu theo cách YuE2 viết. Ô tempo: các bản chuyển thường được lưu ở 120 BPM dù bài hát nhanh hơn hay chậm hơn — hãy nhập tempo thật và các nốt sẽ rơi đúng chỗ chúng vang lên."
          }
        ]
      },
      "what": {
        "head": {
          "name": "Kế hoạch",
          "text": "YuE2 làm gì",
          "when": "Khi nào nên chọn"
        },
        "p": [
          "Nốt nhạc là giai điệu của bài hát được vẽ thành các thanh: hát âm nào, bắt đầu khi nào và giữ bao lâu. Bạn không cần biết đọc nhạc — chỉ cần nghe được âm nào cao hơn, âm nào thấp hơn.",
          "<b>Không có nốt</b> thì YuE2 tự nghĩ ra giai điệu. Mỗi bản tạo một khác, và bạn không thể biết trước một dòng sẽ được hát thế nào.",
          "<b>Có nốt</b> thì YuE2 hát giai điệu của bạn. Trong các thử nghiệm của chúng tôi, mô hình trúng các nốt đã vẽ 98% số lần, giữ được lên xuống của giai điệu và giữ được độ dài: bạn vẽ bao nhiêu ô nhịp thì nó hát bấy nhiêu.",
          "Trong biểu mẫu, các nốt được lưu dưới dạng văn bản ABC — cũng các nốt đó nhưng viết bằng chữ cái. Trình soạn thảo viết nó cho bạn; bạn không cần đụng đến."
        ],
        "plans": [
          {
            "name": "Không có kế hoạch",
            "text": "Tự nghĩ ra giai điệu và phần đệm rồi đi thẳng tới âm thanh.",
            "when": "Khi chưa có nốt nào và bạn chỉ muốn nghe thử ý tưởng. Ngay khi biểu mẫu có nốt, ứng dụng tự chuyển kế hoạch sang «Theo một giai điệu»."
          },
          {
            "name": "Theo một giai điệu",
            "text": "Hát giai điệu của bạn và tự nghĩ ra phần đệm. Các hợp âm của bạn không được dùng.",
            "when": "Hầu như luôn luôn, sau khi bạn đã vẽ giọng hát. Lựa chọn an toàn nhất."
          },
          {
            "name": "Giai điệu và hợp âm",
            "text": "Lấy cả giai điệu và hợp âm của bạn.",
            "when": "Khi bạn đã chọn hợp âm và muốn đúng phần hòa âm đó."
          }
        ],
        "plansIntro": "Kế hoạch được chọn trong biểu mẫu, ở tab Giai điệu. Nó cho YuE2 biết phải làm gì với các nốt của bạn.",
        "plansTitle": "Ba kế hoạch giai điệu",
        "title": "Nốt nhạc là gì và vì sao YuE2 cần chúng",
        "toc": "Vì sao cần nốt nhạc"
      }
    },
    "title": "Trợ giúp về nốt nhạc",
    "toc": "Mục lục",
    "tocPick": "Mục trợ giúp"
  },
  "player": {
    "mute": "Tắt tiếng",
    "unmute": "Bật tiếng",
    "volume": "Âm lượng"
  },
  "sa3Gen": {
    "promptHint": "Tiếng Anh cho kết quả tốt nhất; trợ lý Mô tả sẽ dịch. Nêu thể loại, nhạc cụ, tâm trạng và tempo; với một âm thanh, hãy nêu nguồn của nó, nó xảy ra thế nào và không gian."
  },
  "score": {
    "checks": {
      "sparseVocal": "Số nốt ít hơn số âm tiết trong lời bài hát — YuE2 sẽ tự nghĩ ra phần còn lại",
      "sparseVocalSub": "{notes} nốt, {syllables} âm tiết. Nên vẽ nốt phần giai điệu còn lại hoặc dùng «Từ một bài hát…»"
    },
    "lane": {
      "femaleAbbr": "Nữ",
      "insShort": "Nhạc cụ",
      "maleAbbr": "Nam",
      "voiceFemale": "Giọng: nữ",
      "voiceMale": "Giọng: nam"
    },
    "midi": {
      "fitOctave": "Chỉnh quãng tám cho khớp giọng hát",
      "fitOctaveHint": "YuE2 viết giai điệu cao hơn nơi nó được hát khoảng một quãng tám, trong khi bản chuyển MIDI có cao độ thực tế khi hát. Toàn bộ phần giọng hát được dời theo từng quãng tám nguyên.",
      "markSections": "Đánh dấu các phần theo lời bài hát",
      "movedDown": "Giọng hát đã được hạ xuống {n} quãng tám. | Giọng hát đã được hạ xuống {n} quãng tám.",
      "movedUp": "Giọng hát đã được nâng lên {n} quãng tám. | Giọng hát đã được nâng lên {n} quãng tám.",
      "noSections": "MIDI không có các phần của bài hát. Thẻ của lời: {tags}.",
      "octaveDown": "−{n} quãng tám | −{n} quãng tám",
      "octaveNone": "quãng tám như trong tệp",
      "octaveUp": "+{n} quãng tám | +{n} quãng tám",
      "tempoFile": "từ tệp",
      "tempoHint": "Tệp ghi {bpm} BPM. Các bản chuyển thường được lưu ở 120 bất kể tempo của bài hát: hãy đặt tempo của bài hát và các nốt sẽ được đặt theo lúc chúng vang lên.",
      "tempoTrack": "từ bản nhạc «{title}»"
    },
    "overview": {
      "pickHint": "Mở các ô nhịp này trong Nốt nhạc"
    },
    "toolbar": {
      "musician": "Cho người biết nhạc",
      "musicianTip": "Hiện các bậc hợp âm (I, IV, V…) — lý thuyết âm nhạc cho ai biết"
    },
    "workspace": {
      "backTip": "Quay lại phiên; các nốt vẫn ở trong biểu mẫu",
      "copyBadge": "bản sao của bản tạo",
      "copyBadgeTip": "Một bản sao nốt nhạc của bản tạo: biểu mẫu không đổi cho đến khi nhấn «Vào biểu mẫu»",
      "copyLead": "Nghe và chỉnh sửa ở đây — biểu mẫu không đổi cho đến khi bạn nhấn «Vào biểu mẫu». «Đóng» quay lại nốt nhạc của biểu mẫu.",
      "copyTitle": "Nốt nhạc của bản tạo «{title}»",
      "form": "Biểu mẫu",
      "formBadge": "nốt nhạc của biểu mẫu",
      "formBadgeTip": "Đây là nốt nhạc của biểu mẫu: các chỉnh sửa đi vào biểu mẫu ngay (Ctrl+Z hoàn tác chúng)",
      "label": "Nốt nhạc",
      "replaceConfirm": "Biểu mẫu đã có các nốt khác. Thay chúng bằng nốt nhạc của bản tạo này? (Ctrl+Z đưa chúng trở lại)",
      "title": "Nốt nhạc",
      "toForm": "Vào biểu mẫu"
    }
  },
  "takeCompare": {
    "seed": "Seed {seed}"
  },
  "yueGen": {
    "abcScore": "Nốt nhạc",
    "help": {
      "melody": {
        "sources": [
          "Từ một bài hát… — chọn một tệp âm thanh và SheetSage2 ghi lại giai điệu và hợp âm của nó. Bài hát có giọng hát rõ cho kết quả tốt nhất.",
          "Nhập MIDI — phần cao nhất trở thành giai điệu, các kênh khác thành phần đệm và hợp âm, và giọng được tự tìm. Hãy để giai điệu giọng hát trên một rãnh riêng.",
          "Piano — chọn độ dài và nhấn phím (bên dưới, bên trái piano roll, hoặc trên bàn phím MIDI): các nốt nối tiếp nhau.",
          "Từ một bản nhạc: Nốt nhạc thành MIDI trong menu của một bản tạo, hoặc tab Stem và nốt nhạc trong thư viện, rồi Thành bản nhạc YuE2. Giọng hát thành giai điệu, bass và phần còn lại thành phần đệm."
        ]
      }
    },
    "unloadSheetSage": "Giải phóng card đồ họa sau khi trích giai điệu"
  }
}
