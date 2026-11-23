// Strings added after the first translation (machine-translated from en, 743 keys);
// merged into the other parts key by key (see ../mergeParts).
export default {
  "aceGen": {
    "addLora": "Thêm LoRA",
    "cfgIntervalOrder": "Mức dẫn hướng “từ” phải nhỏ hơn “đến”.",
    "lengthAskedNote": "Độ dài được gửi tới mô hình như một mong muốn. Nhấn lại mục đã chọn để để mô hình tự quyết.",
    "lengthByModelNote": "Với mô tả, mô hình tự chọn độ dài. Chọn ở đây để yêu cầu độ dài của bạn.",
    "loraName": "Tên LoRA",
    "loraPath": "Thư mục adapter LoRA",
    "manual": {
      "adg": "Dẫn hướng thích ứng (ADG)",
      "balancedOnly": "ở chế độ Cân bằng",
      "baseOnly": "chỉ mô hình base và SFT",
      "bpm": "Nhịp độ",
      "cfgEnd": "Dẫn hướng đến (phần quãng đường)",
      "cfgStart": "Dẫn hướng từ (phần quãng đường)",
      "cotCaption": "Mở rộng mô tả",
      "cotCaptionHint": "Bật: mô hình ngôn ngữ có thể viết lại văn bản phong cách của bạn trước khi tạo nhạc.",
      "cotLanguage": "Tự nhận diện ngôn ngữ",
      "cotLanguagePicked": "tắt: giữ ngôn ngữ bạn đã chọn",
      "coverNoise": "Nhiễu trộn với nguồn",
      "coverRepaintOnly": "cho cover hoặc vẽ lại",
      "infer": "Phương pháp giải mã",
      "latentCrossfade": "Mối nối trong mô hình",
      "length": "Độ dài",
      "lmCfg": "Độ bám sát prompt",
      "lmNegative": "Điều cần tránh",
      "lmSub": "viết kế hoạch bài hát và bổ sung phần còn thiếu",
      "lmTitle": "Mô hình ngôn ngữ",
      "loraScale": "Cường độ LoRA",
      "metaByModel": "mô hình tự chọn từ mô tả",
      "musicSub": "những gì đã biết về bài hát từ trước",
      "musicTitle": "Âm nhạc",
      "myLoras": "LoRA của tôi: {n}",
      "needRef": "cần bản nhạc tham chiếu",
      "noLm": "ACE-Step không nạp nó trên GPU này",
      "noLmWithRef": "không dùng với bản nhạc tham chiếu",
      "ode": "ODE: lặp lại chính xác",
      "off": "tắt",
      "pickLora": "hãy chọn một LoRA trước",
      "refSub": "cover và vẽ lại",
      "refTitle": "Bản nhạc tham chiếu",
      "repaintMode": "Chế độ vẽ lại",
      "repaintModes": {
        "aggressive": "Mạnh tay",
        "balanced": "Cân bằng",
        "conservative": "Cẩn thận"
      },
      "repaintOnly": "để vẽ lại một đoạn",
      "repaintStrength": "Cường độ vẽ lại",
      "resultSub": "cách xuất kết quả",
      "sde": "SDE: có yếu tố ngẫu nhiên",
      "sdeBaseWarn": "Với mô hình base, SDE cho ra nhiễu thay vì nhạc trong một lần thử (32 bước). Trên Turbo thì chạy được, với âm thanh tối hơn.",
      "shift": "Độ lệch lịch trình",
      "thinking": "Lập kế hoạch trước (thinking)",
      "tiled": "Giải mã theo từng mảnh",
      "turboSteps": "Turbo nhận 1 đến 8 bước: nhiều hơn sẽ bị cắt về 8",
      "wavCrossfade": "Mối nối trong âm thanh"
    },
    "modeDescribe": "Từ một mô tả",
    "modeLabel": "Bắt đầu từ đâu",
    "modeOwn": "Lời bài hát và phong cách riêng",
    "modelNote": "Turbo chạy 8 bước. Các mô hình khác mất nhiều thời gian hơn; tách hoặc thêm một phần không dùng được trên tất cả, và các tác vụ mô hình không làm được sẽ bị làm mờ ở tab Từ một bản nhạc.",
    "noLmBaseNote": "Base và SFT dựa vào mô hình đó để có giọng hát sạch: ở chế độ này giọng có thể nghe nhiễu và xa. Để có giọng hát, chuyển sang Lời bài hát và phong cách riêng rồi viết lời, hoặc chọn Turbo.",
    "noLmNote": "Trên card đồ họa này (8 GB trở xuống), ACE-Step không nạp mô hình ngôn ngữ của nó, nên mô tả của bạn được gửi tới mô hình như một prompt phong cách thuần, không có lời bài hát được viết sẵn.",
    "noVocal": "Không giọng hát",
    "noVocalHint": "Nhạc không lời: không cần lời bài hát, phong cách bên dưới quyết định âm nhạc.",
    "queuedStatus": "Trong hàng đợi, số bản: {n}",
    "refFile": "Tệp âm thanh tham chiếu",
    "refOff": "Bật lên để làm việc từ một bản nhạc có sẵn: cover, làm lại một đoạn, tách hoặc thêm một phần.",
    "removeLoraConfirm": "Xóa?",
    "removeLoraNamed": "Xóa LoRA {name}",
    "repaintOrder": "Điểm cuối của đoạn phải sau điểm đầu.",
    "simple": {
      "auto": "tự động",
      "fast": "nhanh {n}",
      "formatHint": "mp3 chiếm ít dung lượng hơn; wav và flac giữ âm thanh không suy hao.",
      "key": "Điệu thức",
      "keyHint": "Trưởng nghe sáng hơn, thứ nghe tối và buồn hơn. Chủ âm và các thang âm khác được chọn ở Thủ công.",
      "keyWish": "Với mô tả, mô hình tự chọn tông. Điệu thức chọn ở đây được gửi tới nó như một mong muốn.",
      "lengthHint": "Bản nhạc dài bao lâu.",
      "lengthWish": "Với mô tả, mô hình tự chọn độ dài. Độ dài chọn ở đây được gửi tới nó như một mong muốn, không phải đảm bảo.",
      "major": "trưởng",
      "medium": "vừa {n}",
      "minor": "thứ",
      "slow": "chậm {n}",
      "tempo": "Nhịp độ",
      "tempoHint": "Số phách mỗi phút. “Tự động” để mô hình quyết; con số chính xác được đặt ở Thủ công.",
      "tempoWish": "Với mô tả, mô hình tự chọn nhịp độ. Nhịp độ chọn ở đây được gửi tới nó như một mong muốn."
    },
    "tabChanged": "đã đổi",
    "tabs": {
      "ref": "Từ một bản nhạc",
      "song": "Bài hát",
      "tuning": "Tinh chỉnh"
    },
    "taskType": "Làm gì với bản nhạc",
    "taskUnsupported": "Mô hình này không hỗ trợ",
    "help": {
      "style": {
        "tips": [
          "Tối ưu là 5–9 thẻ: ít hơn thì mô hình tự điền chỗ trống, kết quả khó đoán hơn; nhiều hơn thì các thẻ bắt đầu xung đột nhau.",
          "Đặt thể loại và tâm trạng lên đầu — chúng định hình tính cách chung của bản nhạc nhiều hơn các thẻ còn lại.",
          "Đừng trộn các thẻ mâu thuẫn trong cùng một nhóm (ví dụ “aggressive” và “dreamy” cùng lúc) — mô hình hoặc bỏ qua một thẻ, hoặc kết quả sẽ lộn xộn.",
          "Nên viết thẻ bằng tiếng Anh — dữ liệu huấn luyện chủ yếu là tiếng Anh, nên độ chính xác cao hơn, kể cả khi lời bài hát bằng tiếng Việt.",
          "Nhịp độ đặt ở Tinh chỉnh (ở Đơn giản, hoặc con số chính xác ở Thủ công) đáng tin hơn thẻ văn bản như “120 bpm” trong phong cách: hãy dùng khi nhịp độ quan trọng."
        ]
      },
      "lyrics": {
        "tips": [
          "Khớp với độ dài bản nhạc: ~2 phút thường đủ cho 2 đoạn + 2 điệp khúc; với 3+ phút hãy thêm bridge và một hook thứ hai — lời quá dài so với thời lượng ngắn sẽ bị mô hình “nhồi nhét”.",
          "Các dòng ngắn (5–10 âm tiết) khớp với giai điệu dễ đoán hơn dòng dài — nếu một dòng quá dài, hãy tách thành hai.",
          "Điệp khúc lặp lại (văn bản giống hệt từng chữ trong mỗi [Chorus]) giúp mô hình giữ cùng một giai điệu cho nó suốt bản nhạc.",
          "Với bản nhạc hoàn toàn không lời, hãy đánh dấu “Không giọng hát” thay vì viết lời chỉ có [Interlude]: cách đó đáng tin hơn.",
          "Dấu câu (dấu phẩy, dấu ba chấm) ảnh hưởng đến cách ngắt câu và quãng nghỉ trong giọng hát — hãy dùng có chủ đích, không chỉ theo quy tắc chính tả."
        ]
      },
      "remix": {
        "unavailable": "Các kịch bản khả dụng phụ thuộc vào mô hình đã chọn — các tùy chọn không được hỗ trợ trong biểu mẫu sẽ bị làm mờ. Hãy thử mô hình khác (ở tab Bài hát hoặc trong Tinh chỉnh) nếu bạn cần một kịch bản cụ thể. Hãy tải tệp tham chiếu lên ở định dạng mà mô hình có thể trích âm thanh (wav/mp3/flac) — các tệp rất dài (vài phút) có thể làm thời gian xử lý tăng đáng kể."
      },
      "advanced": {
        "title": "Tinh chỉnh",
        "rows": [
          {
            "param": "Đơn giản và Thủ công",
            "what": "Đơn giản có vài lựa chọn dễ hiểu: số bước giải mã (không có ở Turbo), độ dài, nhịp độ (chậm 80, vừa 110, nhanh 140), điệu thức (trưởng hoặc thứ) và định dạng. Thủ công có mọi tham số theo nhóm, và bảng điều khiển hiện tất cả cùng lúc."
          },
          {
            "param": "Định dạng",
            "what": "Định dạng tệp đầu ra. mp3 gọn hơn và đủ để nghe; wav và flac không suy hao nhưng lớn hơn 5–10 lần."
          },
          {
            "param": "Nhịp độ, tông, nhịp",
            "what": "Các tham số âm nhạc tường minh. Để tự động, mô hình lấy chúng từ văn bản phong cách; chỉ đặt bằng tay khi cần độ chính xác (chẳng hạn để trộn với các bản nhạc khác). Nhịp là 2/4, 3/4, 4/4 hoặc 6/8. Với mô tả, mô hình tự chọn chúng: nhịp độ hay tông đặt ở đây được gửi tới nó như một mong muốn, còn nhịp thì để mô hình quyết."
          },
          {
            "param": "Ngôn ngữ giọng hát",
            "what": "Ngôn ngữ mà giọng hát được hát. Ở chế độ tự động, nó được lấy từ lời bài hát, có thể sai với lời ngắn hoặc mơ hồ: hãy đặt nếu giọng hát ra sai ngôn ngữ. Ngôn ngữ chọn bằng tay được giữ nguyên, mô hình ngôn ngữ không thay nó."
          },
          {
            "param": "Số bước giải mã",
            "what": "Số bước khuếch tán. Nhiều hơn có thể cho âm thanh sạch hơn nhưng tạo chậm hơn; quá một mức nào đó thì độ cải thiện hầu như không nghe ra. Turbo nhận 1 đến 8 (mặc định 8), mô hình SFT 50, mô hình base 32. Ở Đơn giản, Thêm sẽ gấp đôi số thông thường."
          },
          {
            "param": "Độ bám sát phong cách",
            "what": "Thang dẫn hướng: mô hình làm theo mô tả của bạn nghiêm ngặt đến đâu. Cao hơn thì theo thẻ phong cách chính xác hơn, nhưng giá trị rất cao làm âm thanh gắt và đầy tạp âm; thấp hơn thì tự nhiên hơn nhưng khó đoán hơn. Turbo không dùng nó. Mặc định là 7, khoảng hợp lý thường từ 3 đến 12."
          },
          {
            "param": "Seed",
            "what": "Dưới biểu mẫu, cạnh Tạo. Khi nhấn xúc xắc, mỗi bản nhận một seed ngẫu nhiên mới. Một con số với các cài đặt khác giữ nguyên gần như lặp lại kết quả: tiện để đổi một thẻ phong cách và so sánh."
          },
          {
            "param": "Mô hình",
            "what": "Turbo nhanh hơn nhưng đánh đổi chút chất lượng và không làm được mọi tác vụ ở tab Từ một bản nhạc; base và SFT chậm hơn nhưng chính xác và linh hoạt hơn. Mô hình được chọn ở tab Bài hát hoặc trong Thủ công."
          },
          {
            "param": "LoRA",
            "what": "Một phần bổ sung đã tinh chỉnh đặt lên trên mô hình, chẳng hạn cho một âm sắc giọng hát hay một thể loại phụ cụ thể. Cường độ của nó (0 đến 1) quyết định mức ảnh hưởng đến kết quả: 1 là hiệu ứng đầy đủ như tác giả adapter dự định, thấp hơn thì hòa vào nhẹ nhàng hơn. Adapter được thêm ở LoRA của tôi trong Thủ công, bằng tên và thư mục."
          }
        ],
        "footer": "Những gì bạn không đụng đến sẽ dùng mặc định của engine: bạn không cần đặt hết để có kết quả tốt. Đặt lại khôi phục các hàng của Tinh chỉnh và giữ nguyên mô hình và độ dài."
      }
    }
  },
  "aiPart": {
    "guide": {
      "scratch": [
        {
          "title": "Nhịp độ, tông, độ dài",
          "text": "Trong dự án trống, đặt BPM và “Tông”, còn độ dài tính bằng giây ở bảng bên. 64 ô nhịp ở 120 BPM là 128 giây."
        },
        {
          "title": "Bắt đầu bằng trống",
          "text": "“Thêm một phần”, nhạc cụ “Trống”. Các phần khác giữ nhịp theo trống, nên trống đi trước."
        },
        {
          "title": "Bass, rồi hòa âm",
          "text": "Bass, sau đó hợp âm: keyboard, pad. Giữ trống được đánh dấu trong danh sách rãnh mà mô hình nghe."
        },
        {
          "title": "Giai điệu và màu sắc",
          "text": "Lead, dàn dây, bộ gõ. Năm đến bảy phần là đủ; nhiều hơn thì bản mix sẽ chật chội."
        },
        {
          "title": "Chọn và đặt âm lượng",
          "text": "Giữ biến thể hay nhất của mỗi phần và hạ ngay xuống mức phù hợp."
        },
        {
          "title": "Dựng bài hát",
          "text": "Bật “Nam châm” và thước theo ô nhịp, cắt các phần bằng Dao và xóa các đoạn bằng Cục tẩy: đoạn mở đầu, phần chính, đoạn nghỉ không trống và bass, đoạn kết."
        }
      ],
      "scratchIntro": "Arranger có thể dựng một bản nhạc từ dự án trống. Các phần được thêm từng cái một và mỗi phần sau nghe những phần đã có, nên thứ tự rất quan trọng.",
      "scratchTitle": "Một bản nhạc từ con số không",
      "steps": [
        {
          "title": "Khởi động engine",
          "text": "Arranger chạy trên ACE-Step; vẽ lại, nối tiếp và cover cũng có thể chạy trên Stable Audio 3. Nếu engine đang dừng, bảng đề nghị khởi động nó chỉ bằng một nút, và khi đó engine đang ở trên GPU sẽ dừng."
        },
        {
          "title": "Đặt nhịp độ và tông",
          "text": "Trước phần đầu tiên, đặt BPM của dự án và “Tông”: chủ âm và thang âm. Mô hình nhận chúng trong mỗi yêu cầu. Đừng đổi nhịp độ sau các phần đầu: chúng sẽ lệch khỏi lưới."
        },
        {
          "title": "Chọn một chế độ",
          "text": "“Thêm một phần”, “Vẽ lại”, “Nối tiếp” hoặc “Cover”. Gợi ý cạnh công tắc nói trong một dòng mô hình sẽ làm gì."
        },
        {
          "title": "Mô tả điều bạn cần",
          "text": "Với phần mới, chọn nhạc cụ. Trong mô tả, nêu tên âm sắc và cách chơi. Hãy viết bằng ngôn ngữ của bạn: “Sang tiếng Anh” viết lại theo cách mô hình đọc tốt nhất. Dấu “?” cạnh ô mở ra các từ và ví dụ có sẵn."
        },
        {
          "title": "Đánh dấu những gì mô hình nghe",
          "text": "Mô hình tự điều chỉnh theo các rãnh được đánh dấu. Hãy giữ trống: mô hình bám theo lưới của chúng."
        },
        {
          "title": "Nói rõ ở đâu",
          "text": "Toàn bộ bản nhạc hoặc vùng vòng lặp: bật “Vòng lặp” và kéo vùng trên thước. “Vẽ lại” chỉ hoạt động trên vùng vòng lặp."
        },
        {
          "title": "Tạo và chọn",
          "text": "Các biến thể nằm trên các rãnh mới. “Nghe” chuyển sang một biến thể, “Giữ” xóa các biến thể còn lại."
        }
      ],
      "tips": [
        "Mô tả hiệu quả nhất bằng tiếng Anh, dưới dạng các cụm ngắn ngăn cách bằng dấu phẩy. Hãy viết bằng ngôn ngữ của bạn rồi nhấn “Sang tiếng Anh”; đọc kết quả và sửa nếu cần.",
        "Mô tả một phần, không phải cả bản nhạc: nhạc cụ chơi gì và nghe ra sao.",
        "Dựng bản nhạc theo từng bước: trống, rồi bass, rồi hòa âm, rồi giai điệu. Mỗi phần sau nghe các phần trước.",
        "Chưa hài lòng với một biến thể? Tạo lại: mỗi lần chạy dùng seed ngẫu nhiên mới.",
        "Sau mỗi phần mới, hãy đặt âm lượng của nó trước khi thêm phần kế tiếp: phần sau nghe bản mix như hiện tại.",
        "Khi các phần đã sẵn sàng, dựng bài hát từ chúng: cắt các rãnh theo ô nhịp bằng Dao (C) và xóa các đoạn bằng Cục tẩy (E), để các nhạc cụ vào lần lượt.",
        "Với giọng hát, gõ lời bài hát và kiểm tra “Ngôn ngữ giọng hát”: ở “Tự động” nó được đọc từ các chữ cái.",
        "ACE-Step cân mọi kết quả về -1 dBFS, nên một phần mới đến rất to: hãy hạ xuống bằng thanh trượt âm lượng của rãnh.",
        "Để hoàn thiện bản nhạc trong DAW khác, hãy xuất “Stem + Reaper” hoặc DAWproject.",
        "Vẽ lại, nối tiếp và cover cũng có thể chạy trên Stable Audio 3: chọn nó làm engine trong bảng. Nó điền vào và nối tiếp bằng cách nghe âm thanh quanh đoạn, trong vài giây, chỉ nhạc không lời. Thêm một phần vẫn do ACE-Step đảm nhiệm."
      ]
    },
    "toEnglish": "Sang tiếng Anh",
    "toEnglishBusy": "Đang viết…",
    "toEnglishDone": "Trợ lý đã viết lại bằng tiếng Anh; hãy sửa nếu cần.",
    "toEnglishFailed": "Trợ lý không viết được mô tả.",
    "toEnglishGpu": "Trợ lý prompt được đặt chạy trên GPU và sẽ gỡ mô hình khỏi bộ nhớ. Chuyển sang Tự động hoặc CPU ở trang Mô hình.",
    "toEnglishTitle": "Mô tả bằng bất kỳ ngôn ngữ nào: trợ lý prompt viết lại bằng tiếng Anh, cách mô hình hiểu tốt nhất",
    "toEnglishUndo": "Hoàn tác"
  },
  "create": {
    "closeTool": "Đóng",
    "deleteAsk": "Xóa?",
    "details": "Chi tiết",
    "download": "Tải xuống",
    "emptyAll": "Các bài hát của bạn sẽ xuất hiện ở đây",
    "emptyHint": "Chọn một engine, điền biểu mẫu hoặc viết một cụm từ ở dòng ý tưởng phía trên, rồi nhấn Tạo.",
    "emptyPeriod": "Không có gì được tạo trong khoảng thời gian này",
    "engine": "Engine",
    "engineTitle": "{name}: {status}",
    "engines": {
      "ace_step": "Nhanh, cover",
      "stable_audio": "Âm thanh và loop",
      "yue2": "Bài hát có giọng hát"
    },
    "failed": "Không thành công. Nạp nó vào biểu mẫu rồi nhấn Tạo lại.",
    "idea": {
      "chip": {
        "description": "Mô tả",
        "length": "Độ dài",
        "lyrics": "Lời bài hát",
        "style": "Phong cách",
        "tempo": "Nhịp độ và tông"
      },
      "describe": "Mô tả",
      "dismiss": "Bỏ qua",
      "formChanged": "Biểu mẫu đã bị thay đổi.",
      "noAssistant": "Trợ lý prompt chưa sẵn sàng: hãy tải mô hình của nó ở Mô hình và cài đặt (biểu tượng bánh răng trên thanh đầu trang).",
      "noAssistantLink": "Tải xuống ở Mô hình",
      "noAssistantNote": "Trợ lý prompt cần mô hình của nó.",
      "placeholder": {
        "ace_step": "Trong một cụm từ: bạn muốn nhạc gì",
        "stable_audio": "Trong một cụm từ: âm thanh gì cần vang lên",
        "yue2": "Trong một cụm từ: bài hát nói về điều gì"
      },
      "replaces": "Thay thế nội dung hiện có trong biểu mẫu",
      "settings": "Cài đặt",
      "stop": "Dừng",
      "stopping": "Đang dừng…",
      "undo": "Khôi phục nội dung trước đó",
      "write": "Viết lời bài hát và phong cách",
      "writeSa": "Viết mô tả",
      "writeShort": "Viết",
      "writing": "Trợ lý đang viết…",
      "written": "Đã đưa vào biểu mẫu bên dưới.",
      "writtenOther": "Đã đưa vào biểu mẫu {name}.",
      "saKind": "Viết",
      "saKinds": {
        "auto": "Tự động: theo ý tưởng",
        "music": "Bản nhạc",
        "instrument": "Nhạc cụ độc tấu",
        "one_shot": "Mẫu one-shot",
        "sfx": "Hiệu ứng âm thanh"
      }
    },
    "lessDetails": "Ít hơn",
    "live": {
      "failed": "Bản bị lỗi: {name}. {reason}",
      "queue": "Số bản trong hàng đợi: {n}",
      "ready": "Bản đã xong: {name}",
      "readyMany": "Số bản đã xong: {n}, {name}"
    },
    "loading": "Đang tải các bản nhạc…",
    "making": "Đang tạo",
    "menu": {
      "made": "Tạo {when}, dài {len}",
      "midi": "Sang MIDI",
      "rename": "Đổi tên",
      "stems": "Tách thành stem",
      "took": "mất {s} giây"
    },
    "models": "Mô hình",
    "more": "Chi tiết và thao tác",
    "pause": "Tạm dừng",
    "peek": {
      "copied": "Đã sao chép",
      "copy": "Sao chép",
      "lines": "{n} dòng",
      "lyrics": "Lời bài hát",
      "noLyrics": "Không có lời",
      "style": "Phong cách",
      "tags": "{n} thẻ"
    },
    "period": "Khoảng thời gian",
    "periodHint": {
      "all": "Mọi thứ đã tạo cho đến nay.",
      "today": "Các bản tạo hôm nay. Những bản gắn sao được gom vào Yêu thích trong thư viện.",
      "week": "Các bản của bảy ngày gần nhất."
    },
    "periods": {
      "all": "Tất cả",
      "today": "Hôm nay",
      "week": "7 ngày"
    },
    "play": "Phát",
    "position": "Vị trí trong bản nhạc",
    "queued": "Đang chờ",
    "reuse": "Nạp vào biểu mẫu",
    "reuseInForm": "Nạp vào biểu mẫu",
    "session": "Phiên",
    "showAll": "Hiện tất cả: {n}",
    "showMore": "Hiện thêm: {n}",
    "startAndCreate": "Khởi động {name} và tạo",
    "startFailed": "{name} không khởi động được.",
    "startingEngine": "Đang khởi động {name}…",
    "startsOnCreate": "{name} hiện không chạy. Nó khởi động khi bạn nhấn Tạo; bản đầu tiên sau khi khởi động mất nhiều thời gian hơn.",
    "startsOnCreateOther": "{other} đang giữ GPU. {name} khởi động khi bạn nhấn Tạo, và {other} sẽ dừng. Bản đầu tiên sau khi khởi động mất nhiều thời gian hơn.",
    "stop": "Dừng",
    "stopAsk": "Dừng?",
    "stopConfirm": "Nhấn lại để dừng: những gì đã tạo sẽ mất",
    "stopped": "Đã dừng.",
    "styleAndLyrics": "Phong cách và lời bài hát",
    "takeN": "Bản {n}",
    "takeTitle": "{title}, bản {n}",
    "takes": "Số bản: {n}",
    "toSession": "Vào danh sách phiên, số bản: {n}",
    "untitled": "Chưa đặt tên",
    "wholeLibrary": "Toàn bộ thư viện"
  },
  "favorite": {
    "add": "Thêm vào yêu thích",
    "remove": "Bỏ khỏi yêu thích"
  },
  "header": {
    "create": "Tạo",
    "desc": {
      "create": "Bài hát, nhạc không lời và âm thanh",
      "library": "Mọi bản nhạc: đã tạo, đã tải lên và từ trình chỉnh sửa"
    },
    "gpuFree": "GPU đang rảnh",
    "home": "Trang chủ",
    "languageCurrent": "Ngôn ngữ giao diện: {name}",
    "library": "Thư viện",
    "more": "Thêm: ngôn ngữ, mô hình, trợ giúp",
    "guide": {
      "mapTitle": "Các phần của ứng dụng",
      "map": {
        "idea": "Cách dễ nhất để bắt đầu, ngay trên trang chủ: một cụm từ rồi Sáng tác, và một mô hình ngôn ngữ cục bộ viết prompt cho engine. Chỉnh sửa nó rồi tạo bản nhạc.",
        "lora": "Tinh chỉnh ACE-Step bằng các bản nhạc của bạn: tải âm thanh lên, tự động gắn nhãn, kiểm tra chú thích, huấn luyện và xuất. Nó mở trên trang Tạo, dưới ACE-Step; adapter hoàn chỉnh xuất hiện trong biểu mẫu ACE-Step.",
        "yue": "Engine thứ hai: viết cả bài hát có giọng hát và có thể dựng quanh một giai điệu cho trước (tab Giai điệu, với SheetSage2). Nó cũng chuyển một bản nhạc sang MIDI."
      },
      "gpu": [
        "Các engine không thể cùng nằm trên GPU, nên mỗi lúc chỉ chạy một. Engine được chọn ở trang Tạo và khởi động khi bạn nhấn Tạo trong biểu mẫu của nó; engine đang chạy sẽ dừng.",
        "Lần khởi động đầu mất vài phút để mô hình nạp vào bộ nhớ video. Nút trạng thái trên thanh đầu trang cho biết engine nào đang ở trên GPU và bộ nhớ video đầy đến đâu; nhấp vào sẽ thấy ai giữ bao nhiêu bộ nhớ, nút Gỡ khỏi bộ nhớ và đường tới trang Mô hình.",
        "Gỡ khỏi bộ nhớ sẽ dừng việc tạo hoặc huấn luyện đang chạy, nên nút này sẽ hỏi trước."
      ],
      "steps": [
        {
          "title": "Mở ACE-Step",
          "text": "Vào Tạo và chọn ACE-Step. Nó khởi động ở lần nhấn Tạo đầu tiên; lần khởi động đầu mất vài phút."
        },
        {
          "title": "Mô tả bài hát",
          "text": "Ở tab Bài hát, Từ một mô tả: vài cụm từ là đủ, thể loại, tâm trạng, lời bài hát nói về gì. Chọn độ dài và số bản."
        },
        {
          "title": "Chọn bản hay nhất",
          "text": "Các bản xếp trong danh sách phiên cạnh biểu mẫu (bên dưới nó trên điện thoại). Mọi thứ tạo ra đều tự lưu vào thư viện."
        },
        {
          "title": "Tách thành stem",
          "text": "Giọng hát, trống, bass và phần còn lại chỉ một cú nhấp: Tách thành stem trong menu của một bản, tab Stem và nốt nhạc trong thư viện, hoặc ngay trong trình chỉnh sửa."
        },
        {
          "title": "Dựng trong trình chỉnh sửa",
          "text": "Sắp các stem lên rãnh, thêm các phần bằng AI arranger, chỉnh hiệu ứng."
        },
        {
          "title": "Xuất",
          "text": "Trộn ra WAV hoặc MP3, hoặc xuất các rãnh cùng dự án Reaper hoặc DAWproject."
        }
      ],
      "compare": [
        {
          "label": "Phù hợp nhất cho",
          "ace": "Bài hát và nhạc không lời nhanh, nhiều biến thể liên tiếp",
          "yue": "Cả một bài hát có giọng hát trong một lần",
          "sa3": "Nhạc không lời, hiệu ứng âm thanh và sample; lấp đầy và nối tiếp âm thanh trong trình chỉnh sửa"
        },
        {
          "label": "Làm việc từ một bản nhạc",
          "ace": "Cover, vẽ lại một đoạn, thêm một phần, tách một phần, nối tiếp",
          "yue": "Một bài hát theo giai điệu của bản nhạc khác: tab Giai điệu, với SheetSage2 hoặc tệp MIDI",
          "sa3": "Vẽ lại một đoạn, nối tiếp, cover theo phong cách khác (âm thanh sang âm thanh); không thêm phần lên bản mix"
        },
        {
          "label": "Phong cách riêng của bạn",
          "ace": "LoRA huấn luyện từ các bản nhạc của bạn",
          "yue": "Không",
          "sa3": "Không (dự kiến hỗ trợ LoRA)"
        },
        {
          "label": "Độ dài",
          "ace": "10 đến 300 giây, 1, 2 hoặc 4 bản mỗi lần",
          "yue": "Dài bằng thời gian lời bài hát cần, hoặc 1 đến 8 phút; 1 đến 4 bản mỗi lần",
          "sa3": "Tối đa 6 phút (medium) hoặc 2 phút (small); 1, 2 hoặc 4 bản mỗi lần, tính theo giây mỗi lần"
        },
        {
          "label": "MIDI",
          "ace": "Không",
          "yue": "Bản nhạc hoặc stem sang MIDI (MuScriptor)",
          "sa3": "Không"
        },
        {
          "label": "Giấy phép",
          "ace": "MIT: được dùng thương mại; hãy kiểm tra điều khoản hiện hành trước khi đăng",
          "yue": "Chỉ dùng phi thương mại",
          "sa3": "Stability AI Community License: miễn phí dưới 1 triệu USD mỗi năm; chỉ nhạc không lời, không giọng hát"
        }
      ]
    },
    "helpSections": {
      "idea": {
        "title": "Sáng tác từ một ý tưởng",
        "text": "Ở trang chủ, mô tả một bài hát, nhạc không lời hoặc âm thanh trong một, hai câu rồi chọn engine; ngôn ngữ lời bài hát và ai viết prompt nằm ở mục Thêm. Ở Sáng tác, trợ lý prompt, một mô hình Qwen3.5 cục bộ, viết prompt theo định dạng của engine: thẻ phong cách, lời bài hát chia theo đoạn, nhịp độ và tông. Chỉnh sửa nó, tạo, hoặc mở trong biểu mẫu của engine. Âm thanh bỏ qua trợ lý và đi thẳng tới Stable Audio. Ở trang Tạo, cùng ý tưởng đó nằm ở dòng ý tưởng phía trên biểu mẫu và ghi thẳng vào đó. Mô hình và thiết bị của trợ lý được đặt ở Mô hình và cài đặt."
      },
      "engines": {
        "text": "Ba engine tạo âm thanh, ACE-Step 1.5, YuE2-3B và Stable Audio 3, và chúng không thể cùng nằm trên một GPU, nên mỗi lúc chỉ chạy một. Chọn một engine ở trang Tạo: nó khởi động khi bạn nhấn Tạo, và engine đang chạy tự dừng. Đèn báo cho biết trạng thái; lần khởi động đầu có thể mất vài phút để mô hình nạp vào bộ nhớ video. Nút trạng thái trên thanh đầu trang cho thấy cái gì đang giữ GPU và có thể gỡ nó khỏi bộ nhớ."
      },
      "ace": {
        "text": "Ở tab Bài hát, mô tả âm nhạc bằng lời thường (Từ một mô tả) hoặc đưa thẻ phong cách và lời bài hát với các dấu [Verse] / [Chorus] (Lời bài hát và phong cách riêng), hoặc đánh dấu Không giọng hát. Ở tab Từ một bản nhạc, một bản nhạc tham chiếu giúp làm cover, vẽ lại một đoạn, tách hoặc thêm một phần, hoặc hoàn thiện một tác phẩm. Độ dài là 10-300 giây, với 1, 2 hoặc 4 bản mỗi lần. Tinh chỉnh có Đơn giản (số bước, độ dài, nhịp độ, điệu thức, định dạng) và Thủ công (mọi tham số); LoRA đã huấn luyện được bật ở đó, với cường độ từ 0 đến 1."
      },
      "yue": {
        "text": "YuE2-3B viết cả bài hát có giọng hát. Tab Bài hát chứa lời bài hát, phong cách, độ dài và chất lượng. Tab Giai điệu đặt kế hoạch giai điệu: Không có kế hoạch đi thẳng tới âm thanh, Theo một giai điệu giữ giai điệu đã cho và nghĩ ra phần đệm, Giai điệu và hợp âm viết trước một kế hoạch cho cả hai. SheetSage2 (Từ một bài hát…) ghi giai điệu của một bản nhạc thành bản nhạc ABC, bạn có thể chỉnh sửa và đưa lại cho YuE2."
      },
      "sa3": {
        "text": "Stable Audio 3 tạo nhạc không lời và hiệu ứng âm thanh từ mô tả chỉ trong vài giây: chọn Nhạc hoặc Âm thanh, mô tả theo cách một thư viện sample vẫn làm (thể loại, nhạc cụ, tâm trạng, nhịp độ, hoặc nguồn phát ra âm thanh và cách nó được tạo ra), đặt độ dài và số bản. Không có giọng hát. Cùng engine này phục vụ AI arranger và Sample của trình chỉnh sửa, nơi nó vẽ lại, nối tiếp và làm cover bằng cách nghe âm thanh ở hai phía của đoạn. Trọng số chính bị khóa quyền truy cập: hãy chấp nhận giấy phép trên Hugging Face, lưu token của bạn và tải một mô hình ở Mô hình và cài đặt."
      },
      "lora": {
        "text": "Huấn luyện LoRA nằm dưới ACE-Step trên trang Tạo, cạnh Tạo (trên điện thoại là một công tắc phía trên biểu mẫu). Huấn luyện cần ACE-Step đang chạy, và trang đề nghị khởi động nó. Nó dẫn qua toàn bộ quy trình tinh chỉnh: tải âm thanh lên, tự động gắn nhãn, xem lại và sửa mô tả, tiền xử lý, huấn luyện với tiến trình trực tiếp, và xuất. Adapter hoàn chỉnh được thêm vào danh sách LoRA trong biểu mẫu ACE-Step."
      },
      "stems": {
        "text": "Mọi bản nhạc đã lưu đều có thể tách thành bốn stem (giọng hát, trống, bass, phần còn lại) chỉ với một cú nhấp: Tách thành stem trong menu của một bản, tab Stem và nốt nhạc trong thư viện, hoặc một rãnh trong trình chỉnh sửa. Các stem có thể mở trong trình chỉnh sửa thành một dự án bốn rãnh hoàn chỉnh. Chuyển âm sang MIDI (MuScriptor) hoạt động trên bản mix đầy đủ hoặc một stem riêng; nó chạy trên engine YuE2, nên cần cài YuE2."
      },
      "arranger": {
        "text": "Nút “AI arranger” trong trình chỉnh sửa dựng một tác phẩm từng bước thay vì tạo nguyên bản. “Thêm một phần” viết một phần mới (trống, bass, pad, dàn dây, v.v.) lên các rãnh đã chọn, “Vẽ lại” viết lại một đoạn yếu, “Nối tiếp” kéo dài bản nhạc, “Cover” tạo phiên bản mới theo phong cách khác. Mỗi biến thể nằm trên một rãnh riêng: nghe, giữ cái hay nhất rồi chuyển sang phần tiếp theo. Các phần được thêm bởi mô hình ACE-Step base (khoảng 4,8 GB) hoặc phiên bản base XL lớn hơn (khoảng 20 GB, cần card 16 GB); cả hai đều tùy chọn, và nếu thiếu mô hình base thì arranger sẽ đề nghị cài đặt. Các chế độ khác chạy trên turbo, hoặc trên Stable Audio 3 khi bạn chọn nó làm engine: nó điền vào, nối tiếp và làm cover bằng cách nghe âm thanh xung quanh, chỉ nhạc không lời."
      },
      "sfx": {
        "text": "Nút “Sample” trong trình chỉnh sửa tạo one-shot (kick, hit, whoosh), loop theo nhịp độ dự án và texture (mưa, đám đông, drone) bằng Stable Audio 3, từ một mô tả ngắn. Kết quả xếp thành một dải: nghe trước, rồi thêm cái bạn thích vào rãnh mới hoặc vào rãnh đang chọn tại vị trí con trỏ phát. Loop được cắt theo trọn ô nhịp nhưng mô hình không đảm bảo mối nối liền mạch, nên hãy kiểm tra bằng cách phát lặp. “Xóa khỏi danh sách” xóa các âm thanh của tác vụ khỏi thư viện và ổ đĩa, trừ những âm thanh đang nằm trên một rãnh lúc đó."
      }
    }
  },
  "home": {
    "allTracks": "Toàn bộ thư viện",
    "compose": "Sáng tác",
    "composeHere": "Trợ lý viết prompt cho engine đã chọn; bạn có thể sửa trước khi tạo",
    "composeSound": "Trợ lý viết prompt âm thanh kèm độ dài, Stable Audio sẽ tạo nó",
    "engineLabel": "Engine",
    "engines": "Hoặc đi thẳng tới một engine",
    "firstText": "Mô tả một bài hát hoặc lấy một ví dụ:",
    "firstTitle": "Các bản nhạc của bạn sẽ xuất hiện ở đây",
    "guide": "Cách sáng tác hoạt động",
    "kind": {
      "instrumental": "Nhạc không lời",
      "song": "Bài hát có giọng hát",
      "sound": "Âm thanh"
    },
    "kindLabel": "Tạo gì",
    "lead": "Mọi thứ chạy trên máy tính này",
    "loading": "Đang tải các bản nhạc",
    "more": "Thêm",
    "needPhrase": "Hãy mô tả âm nhạc trước",
    "title": "Chúng ta tạo gì nào?",
    "phraseLabel": "Mô tả âm nhạc",
    "placeholderSound": "mưa rơi trên mái tôn vào ban đêm, gần và yên bình",
    "soundBySa3": "Âm thanh được tạo bởi Stable Audio",
    "soundMissing": "Stable Audio chưa được cài đặt"
  },
  "keyScale": {
    "hint": "ACE-Step chỉ biết trưởng và thứ. Với thang âm này nó nhận tông gần nhất ({key}) và tên thang âm trong mô tả: là gợi ý, không phải đảm bảo.",
    "mode": "Thang âm",
    "modes": {
      "blues": "Blues",
      "dorian": "Dorian",
      "double_harmonic": "Hòa âm kép",
      "harmonic_minor": "Thứ hòa thanh",
      "hungarian_minor": "Thứ Hungary",
      "locrian": "Locrian",
      "lydian": "Lydian",
      "major": "Trưởng (Ionian)",
      "major_pentatonic": "Ngũ cung trưởng",
      "melodic_minor": "Thứ giai điệu",
      "minor": "Thứ tự nhiên (Aeolian)",
      "minor_pentatonic": "Ngũ cung thứ",
      "mixolydian": "Mixolydian",
      "phrygian": "Phrygian",
      "phrygian_dominant": "Phrygian át"
    },
    "needTonic": "Hãy chọn chủ âm trước",
    "none": "Không có thang âm như vậy",
    "notSet": "chưa đặt",
    "search": "Gõ để tìm kiếm",
    "tonic": "Chủ âm"
  },
  "libraryPage": {
    "aiPart": "Một phần do AI arranger tạo",
    "collectionName": "Tên bộ sưu tập",
    "confirmDeleteCollection": "Xóa bộ sưu tập?",
    "cot": {
      "full": "giai điệu và hợp âm",
      "melody": "theo một giai điệu"
    },
    "delete": "Xóa",
    "deleteCollection": "Xóa bộ sưu tập (các bản nhạc vẫn còn)",
    "deleteFailed": "Không xóa được: {error}",
    "emptyCollection": "Mở một bản nhạc và thêm nó vào bộ sưu tập này ở tab Giới thiệu.",
    "emptyFavorites": "Đánh dấu bản nhạc bằng ngôi sao và nó sẽ hiện ở đây.",
    "emptyHere": "Ở đây chưa có gì",
    "emptyHint": "Các bản nhạc bạn tạo và tải lên được gom ở đây.",
    "facts": {
      "file": "Tệp",
      "madeIn": "Tạo trong",
      "melody": "Giai điệu",
      "model": "Mô hình"
    },
    "filters": {
      "all": "Tất cả bản nhạc",
      "favorites": "Yêu thích",
      "midi": "Nốt nhạc (MIDI)",
      "score": "Bản nhạc",
      "stems": "Stem",
      "today": "Hôm nay"
    },
    "filtersLabel": "Bộ lọc thư viện",
    "groups": {
      "collections": "Bộ sưu tập",
      "has": "Bản nhạc có gì",
      "origin": "Tạo bởi",
      "tags": "Thẻ"
    },
    "loadFailed": "Không tải được thư viện.",
    "newCollection": "+ Bộ sưu tập mới",
    "newest": "Mới nhất trước",
    "noCollections": "Chưa có bộ sưu tập nào: tạo cái đầu tiên bằng Bộ sưu tập mới.",
    "nothingFound": "Không tìm thấy gì",
    "nothingFoundHint": "Thử từ khác hoặc bộ lọc khác.",
    "oldest": "Cũ nhất trước",
    "order": "Thứ tự",
    "origins": {
      "editor": "Trình chỉnh sửa",
      "upload": "Đã tải lên"
    },
    "period": "Khoảng thời gian",
    "pick": "Chọn một bản nhạc: lời bài hát, phong cách, stem và nốt nhạc của nó hiện ở đây.",
    "renameCollection": "Đổi tên bộ sưu tập",
    "retry": "Thử lại",
    "reuseHint": "Mở Tạo với lời bài hát, phong cách và cài đặt này",
    "search": "Tiêu đề, phong cách hoặc một dòng lời bài hát",
    "showAll": "Hiện tất cả bản nhạc",
    "sub": {
      "editor": "Từ trình chỉnh sửa",
      "engine": "Không có mô tả",
      "upload": "Tệp đã tải lên"
    },
    "tabs": {
      "about": "Giới thiệu",
      "lyrics": "Lời bài hát",
      "parts": "Stem và nốt nhạc"
    },
    "take": "Bản {n}",
    "title": "Thư viện",
    "toCreate": "Tạo bản nhạc đầu tiên",
    "today": "Hôm nay",
    "yesterday": "Hôm qua",
    "bulk": {
      "addTag": "Thêm #{tag}",
      "clear": "Bỏ chọn (Esc)",
      "collected": "Đã thêm {n} bản nhạc vào «{name}» | Đã thêm {n} bản nhạc vào «{name}»",
      "collection": "Bộ sưu tập",
      "favorited": "Đã thêm {n} bản nhạc vào mục yêu thích | Đã thêm {n} bản nhạc vào mục yêu thích",
      "label": "Thao tác với các bản nhạc đã chọn",
      "newCollection": "Bộ sưu tập mới…",
      "noTags": "Chưa có thẻ nào: hãy nhập một thẻ và nhấn Enter.",
      "selectAll": "Chọn tất cả: {n}",
      "selectSong": "Chọn «{title}» cùng các bản thu: {n}",
      "selectTrack": "Chọn «{title}»",
      "selected": "Đã chọn: {n}",
      "tag": "Thẻ",
      "tagPlaceholder": "Thẻ mới, hoặc tìm thẻ",
      "tagged": "Đã thêm #{tag} vào {n} bản nhạc | Đã thêm #{tag} vào {n} bản nhạc",
      "uncollected": "Đã bỏ {n} bản nhạc khỏi «{name}» | Đã bỏ {n} bản nhạc khỏi «{name}»",
      "unfavorited": "Đã bỏ {n} bản nhạc khỏi mục yêu thích | Đã bỏ {n} bản nhạc khỏi mục yêu thích",
      "untagged": "Đã gỡ #{tag} khỏi {n} bản nhạc | Đã gỡ #{tag} khỏi {n} bản nhạc"
    },
    "emptyTag": "Thêm thẻ này cho một bản nhạc ở tab Giới thiệu, hoặc cho nhiều bản cùng lúc từ thanh chọn.",
    "tags": {
      "add": "Thêm thẻ và nhấn Enter",
      "added": "Đã thêm thẻ #{tag}",
      "confirmDelete": "Xóa thẻ?",
      "delete": "Gỡ thẻ khỏi mọi bản nhạc",
      "remove": "Gỡ thẻ #{tag}",
      "removed": "Đã gỡ thẻ #{tag}",
      "rename": "Đổi tên thẻ"
    },
    "trash": {
      "confirmEmpty": "Xóa vĩnh viễn tất cả?",
      "confirmPurge": "Xóa vĩnh viễn?",
      "deleted": "Đã xóa: {when}",
      "dismiss": "Ẩn thông báo",
      "emptied": "Thùng rác đã trống",
      "empty": "Dọn thùng rác",
      "emptyHere": "Thùng rác trống",
      "emptyHint": "Các bản nhạc đã xóa nằm ở đây 30 ngày, phòng khi bạn muốn lấy lại.",
      "loadFailed": "Không tải được thùng rác: {error}",
      "moveHint": "Chuyển bản nhạc vào thùng rác: có thể khôi phục từ đó trong 30 ngày",
      "moved": "Đã chuyển {n} bản nhạc vào thùng rác | Đã chuyển {n} bản nhạc vào thùng rác",
      "note": "Các bản nhạc trong thùng rác sẽ bị xóa vĩnh viễn sau 30 ngày.",
      "purge": "Xóa vĩnh viễn",
      "purged": "Đã xóa vĩnh viễn {n} bản nhạc | Đã xóa vĩnh viễn {n} bản nhạc",
      "restore": "Khôi phục",
      "restored": "Đã khôi phục {n} bản nhạc | Đã khôi phục {n} bản nhạc",
      "title": "Thùng rác",
      "undo": "Hoàn tác"
    }
  },
  "midiPanel": {
    "betterWithVocals": "Hoạt động trên bản mix đầy đủ; để có giai điệu chính xác, hãy tách bản nhạc thành stem và nhận dạng giọng hát trước.",
    "scoreEmpty": "MIDI không có nốt nào để tạo bản nhạc.",
    "scoreFromFull": "từ bản mix đầy đủ",
    "scoreFromStems": "giai điệu từ giọng hát, phần đệm từ bass và phần còn lại",
    "scoreFromVocals": "giai điệu từ giọng hát",
    "scoreInserted": "Bản nhạc đã nằm trong biểu mẫu YuE2 ({from}).",
    "toScore": "Sang bản nhạc YuE2",
    "toScoreHint": "Chuyển các nốt thành bản nhạc ABC cho YuE2 và đặt vào biểu mẫu của nó: giọng hát thành giai điệu, bass và phần còn lại thành phần đệm và hợp âm."
  },
  "miniWave": {
    "percent": "{n}%",
    "timeOf": "{pos} trên {total}"
  },
  "models": {
    "check": "Kiểm tra",
    "checkBad": "Bị hỏng hoặc thiếu: {files}. Hãy tải lại phần này.",
    "checkFailed": "Không kiểm tra được: {error}",
    "checkOffline": "Không kết nối được tới Hugging Face, nên chỉ so sánh kích thước.",
    "checkOkHash": "Cả {n} tệp đều nguyên vẹn; {h} tệp khớp với SHA-256 mà Hugging Face liệt kê.",
    "checkOkRecord": "Cả {n} tệp đều khớp với bản ghi theo kích thước.",
    "checkOkSize": "Cả {n} tệp đều nguyên vẹn (kiểm tra theo kích thước và cấu trúc; không có danh sách checksum để so sánh).",
    "checkOutdated": "Nguyên vẹn, nhưng kho hiện có phiên bản mới hơn của: {files}. Hãy tải lại để lấy nó.",
    "checkTitle": "Kiểm tra các tệp có nguyên vẹn không",
    "checking": "Đang kiểm tra…",
    "parts": {
      "yue2-bf16": {
        "name": "YuE2 bf16",
        "text": "Mô hình chưa lượng tử hóa. Cần nhiều bộ nhớ video hơn q8_0 (nhiều nhất trong ba bản)."
      }
    },
    "reinstall": "Tải lại",
    "reinstallAsk": "Tải lại {gb} GB?",
    "reinstallNamed": "Tải lại {name}",
    "reinstallNo": "Giữ lại",
    "reinstallTitle": "Tải xuống lại và thay thế các tệp",
    "reinstallYes": "Tải lại",
    "yue2": {
      "noSettings": "Độ chính xác q8_0, q4_0 hoặc bf16 được chọn cho mỗi lần tạo trong biểu mẫu YuE2, ở mục Chất lượng."
    }
  },
  "params": {
    "changed": "Đã đổi",
    "consoleNote": "Các giá trị đặt bằng tay được đánh dấu. Phần còn lại dùng mặc định.",
    "consoleTitle": "Bảng điều khiển {name}",
    "default": "Mặc định: {v}",
    "quick": "Chọn nhanh: {group}",
    "reset": "Về mặc định",
    "resetOne": "Đặt {name} về mặc định",
    "simple": {
      "more": "Thêm: {n}",
      "normal": "Thường dùng: {n}",
      "steps": "Số bước giải mã",
      "stepsHint": "Nhiều bước hơn thì lâu hơn."
    }
  },
  "player": {
    "close": "Đóng trình phát",
    "label": "Trình phát",
    "next": "Bản nhạc kế tiếp",
    "prev": "Bản nhạc trước (về đầu bản nhạc, nếu đang phát)"
  },
  "presets": {
    "button": "Preset",
    "confirmDelete": "Nhấp lại để xóa {name}",
    "deleteAsk": "Xóa?",
    "deleteOne": "Xóa preset {name}",
    "none": "Chưa lưu preset nào.",
    "saveCurrent": "Lưu biểu mẫu thành preset",
    "title": "Preset: các bộ cài đặt đã lưu của biểu mẫu"
  },
  "resources": {
    "ramOf": "RAM {used} trên {total} GB",
    "state": {
      "error": "{model} báo lỗi",
      "running": "{model} đang chạy",
      "starting": "{model} đang khởi động",
      "stopping": "{model} đang dừng"
    },
    "vramOf": "Bộ nhớ video {used} trên {total} GB",
    "holder": {
      "cover": "Ảnh bìa (Z-Image Turbo)"
    }
  },
  "sa3Gen": {
    "badGuidanceWindow": "Dẫn hướng dừng ở mức nhiễu cao hơn mức bắt đầu: hạ “dừng ở” hoặc tăng “bắt đầu ở”.",
    "formTabs": "Các phần của biểu mẫu",
    "kindLabel": "Loại âm thanh",
    "lengthFromRef": "Bản nhạc tham chiếu quyết định độ dài:",
    "lengthOwn": "riêng: {v}",
    "lengthSeconds": "{n} giây",
    "manual": {
      "apg": "Tỷ lệ APG",
      "autoTags": "Thẻ dịch vụ",
      "cfg": "Độ bám sát mô tả",
      "cfgStartsAt": "Dẫn hướng bắt đầu ở mức nhiễu",
      "cfgStopsAt": "Dẫn hướng dừng ở mức nhiễu",
      "chunked": "Giải mã theo khúc",
      "chunkedAuto": "Tự động",
      "duration": "Độ dài",
      "fromRef": "do bản nhạc tham chiếu quyết định",
      "guidanceSub": "mô tả điều khiển âm thanh thế nào; mức nhiễu giảm từ 1 về 0 trong lúc chạy",
      "guidanceTitle": "Dẫn hướng",
      "needCfg": "khi Độ bám sát mô tả không bằng 1",
      "needTwo": "với hai biến thể trở lên",
      "negative": "Điều cần tránh",
      "normThreshold": "Giới hạn cho một bước dẫn hướng",
      "off": "Không",
      "on": "Có",
      "padding": "Dư địa độ dài",
      "perVariant": "Một mô tả cho mỗi biến thể",
      "resultSub": "độ dài và mô tả",
      "resultTitle": "Kết quả",
      "sampler": "Bộ lấy mẫu",
      "samplerAuto": "mặc định (pingpong)",
      "samplerAutoBase": "mặc định của mô hình",
      "samplerLoud": "To hơn bình thường và bị méo: trong một lần thử, 1-2% âm thanh chạm trần.",
      "samplerQuiet": "Nhỏ hơn bình thường khoảng 7 dB.",
      "samplerSub": "cách tính từng bước",
      "samplerTitle": "Bộ lấy mẫu",
      "scalePhi": "Làm dịu dẫn hướng",
      "textOnly": "chỉ khi không có bản nhạc tham chiếu",
      "trim": "Cắt khoảng lặng ở đầu"
    },
    "modelsAfterStart": "Danh sách mô hình hiện khi engine đang chạy.",
    "queuedNote": "Số bản trong hàng đợi: {n}",
    "ref": {
      "modeLabel": "Làm gì với bản tham chiếu",
      "off": "Bật lên để làm việc từ một bản nhạc có sẵn: làm lại, làm lại một đoạn hoặc nối tiếp."
    },
    "simple": {
      "tagsOff": "Không thêm",
      "tagsOn": "Thêm"
    },
    "submitKind": {
      "music": "Tạo nhạc",
      "sfx": "Tạo một âm thanh"
    },
    "tabChanged": "đã đổi",
    "tabs": {
      "ref": "Từ một bản nhạc",
      "sound": "Mô tả",
      "tuning": "Tinh chỉnh"
    },
    "advancedHint": "Xúc xắc cạnh seed làm nó ngẫu nhiên trở lại; một con số lặp lại âm thanh đó. Các mô hình hậu huấn luyện được chỉnh cho 8 bước và độ bám sát 1; Điều cần tránh và nhóm Dẫn hướng chỉ hoạt động khi Độ bám sát mô tả không bằng 1.",
    "advancedHintBase": "Một checkpoint base: nó bắt đầu ở 50 bước và độ bám sát 7, nên Điều cần tránh có tác dụng; hãy thử “poor quality” ở đó.",
    "help": {
      "tips": [
        "Nhạc: thể loại, nhạc cụ và âm sắc của từng cái, tâm trạng và năng lượng, nhịp độ theo BPM.",
        "Âm thanh: cái gì tạo ra nó, nó xảy ra thế nào và trong bao lâu, micro đặt ở đâu và phòng nghe ra sao.",
        "Các thẻ có ích: TrackType: Music, VocalType: Instrumental, Genre: Funk, Instruments: Guitar, Saxophone; TrackType: Instrument cho phần solo; TrackType: SFX cho một âm thanh.",
        "Không có giọng hát: mô hình làm nhạc không lời; prompt giọng hát cùng lắm chỉ cho ra texture không lời.",
        "Gõ một seed để lặp lại kết quả; khi nhấn xúc xắc, mỗi bản nhận một seed mới."
      ]
    },
    "translateBtn": "Chỉ dịch",
    "translateHint": "Stable Audio chỉ hiểu tiếng Anh: trợ lý có thể viết prompt tiếng Anh từ văn bản của bạn, hoặc chỉ dịch nó.",
    "translateNoAssistant": "Trợ lý prompt chưa sẵn sàng: hãy tải mô hình của nó trong mục Mô hình.",
    "translateRunning": "Đang dịch…",
    "translateStopping": "Đang dừng…",
    "translateStop": "Dừng",
    "translateDone": "Đã dịch sang tiếng Anh.",
    "translateUndo": "Hoàn lại",
    "composeBtn": "Viết prompt",
    "composeTitle": "Trợ lý viết lại mô tả bằng bất kỳ ngôn ngữ nào thành prompt cho Stable Audio: thể loại, nhạc cụ, âm sắc, nhịp độ và độ dài",
    "composeRunning": "Đang viết prompt…",
    "composeDone": "Prompt cho Stable Audio đã xong."
  },
  "tagInput": {
    "cleared": "Đã xóa tất cả thẻ",
    "removeTag": "Xóa {tag}",
    "removed": "Đã xóa {tag}",
    "restored": "Đã khôi phục các thẻ",
    "undo": "Hoàn tác",
    "undoTitle": "Khôi phục các thẻ đã xóa"
  },
  "yueGen": {
    "help": {
      "advanced": {
        "choices": [
          "Chất lượng (tab Bài hát): Bản nháp là mô hình q4_0, Bình thường là q8_0, Cuối cùng là bf16 với 32 bước giải mã và độ bám sát phong cách 1,2.",
          "Độ dài (tab Bài hát): số phút chuyển thành Không ngắn hơn và Không dài hơn; mô hình tạo 25 token cho mỗi giây âm thanh.",
          "Giọng hát: Đều hơn là Độ táo bạo 0,85, Táo bạo hơn là 1,1.",
          "Lặp lại: Ít hơn là Phạt lặp 1,3 với Bộ nhớ lặp 80.",
          "Bản nhạc: Cẩn thận hơn là Độ táo bạo của bản nhạc 0,55."
        ],
        "choicesIntro": "Chúng đặt cùng các giá trị như những cách chỉnh bên dưới, chỉ bằng một cú nhấp.",
        "choicesTitle": "Các lựa chọn trong các tab",
        "title": "Tinh chỉnh",
        "lead": "Bạn có thể để yên các mục này: những gì bạn không đổi sẽ dùng mặc định của engine, hiện trên mỗi hàng ở Thủ công. Chúng quan trọng khi một bản nhạc cứ ra sai: bị cắt cụt, lặp vòng, lệch tông. Tìm trường hợp của bạn bên dưới và nhấn Áp dụng: các con số phù hợp tự vào các ô.",
        "fixes": [
          {
            "id": "cutoff",
            "problem": "Bản nhạc bị cắt trước khi lời kết thúc",
            "fix": "Không dài hơn: 12000 token, trần độ dài khoảng 8 phút thay vì 6."
          },
          {
            "id": "offbrief",
            "problem": "Âm thanh không khớp với các thẻ",
            "fix": "Độ bám sát phong cách: 1,2, để mô hình làm theo mô tả nghiêm ngặt hơn. Nếu vẫn không được, vấn đề nằm ở chính các thẻ."
          },
          {
            "id": "loop",
            "problem": "Một cụm cứ lặp đi lặp lại",
            "fix": "Phạt lặp 1,3 và Bộ nhớ lặp 80: phạt lặp mạnh hơn và nhớ lâu hơn."
          },
          {
            "id": "offkey",
            "problem": "Nốt lạc tông, vỡ giọng, nhiễu",
            "fix": "Độ táo bạo 0,85 và 32 bước giải mã: bớt táo bạo, thêm lượt dựng âm thanh."
          },
          {
            "id": "melody",
            "problem": "Giai điệu rời rạc",
            "fix": "Nếu kế hoạch đang tắt, nó chuyển sang Giai điệu và hợp âm (kế hoạch bạn đã chọn thì giữ nguyên), và Bản nhạc chuyển sang Cẩn thận hơn (Độ táo bạo của bản nhạc 0,55), để bản nhạc được viết thận trọng hơn. Hoặc lấy giai điệu từ một bài hát ở tab Giai điệu: bản nhạc đã cho thay thế kế hoạch, và khi đó chỉ lựa chọn kế hoạch mới quan trọng."
          },
          {
            "id": "same",
            "problem": "Mọi bản nghe giống nhau",
            "fix": "Bật seed ngẫu nhiên. Nếu chưa đủ, Độ táo bạo 1,1."
          },
          {
            "id": "final",
            "problem": "Tôi muốn bản dựng cuối cùng",
            "fix": "Chất lượng: Cuối cùng, mô hình bf16 (khi đã tải), 32 bước và độ bám sát phong cách 1,2. Hãy tạo 2–3 bản và giữ bản tốt nhất."
          }
        ],
        "fieldsIntro": "Dưới mỗi ô là một thang các giá trị điển hình: vạch phía trên là mặc định cho âm thanh, vạch phía dưới là mặc định cho bản nhạc (chỉ khi có kế hoạch giai điệu và chưa có bản nhạc cho trước). Bản nhạc cần sự chặt chẽ, âm thanh cần sức sống, vì vậy mặc định khác nhau.",
        "groups": [
          {
            "title": "Độ chính xác và chất lượng",
            "fields": [
              {
                "key": "cfg_scale",
                "name": "Độ bám sát phong cách (CFG)",
                "text": "Mô hình nghe lời các thẻ phong cách đến đâu. Giống như âm lượng giọng bạn trong tai một nhạc công: nhỏ thì họ chơi tự do hơn, to thì sát yêu cầu hơn, nhưng cứng hơn.",
                "left": "tự do hơn",
                "right": "sát thẻ hơn",
                "when": "1,2 nếu âm thanh gần như không khớp với mô tả. Trên 1,5 — tạp âm và âm thanh “nhựa”."
              },
              {
                "key": "num_inference_steps",
                "name": "Số bước giải mã",
                "text": "Số lượt mô hình chạy để biến kế hoạch của nó thành âm thanh hoàn chỉnh. Giống như các lớp sơn: 8 là phác nhanh, 32 là lớp hoàn thiện sạch sẽ.",
                "left": "nhanh hơn",
                "right": "sạch hơn",
                "when": "8 cho bản nháp, 32 cho bản cuối. Sự khác biệt khó nghe ra (khoảng 4 giây mỗi bản trên RTX 4080); quá 32 âm thanh chỉ thay đổi chứ không tốt hơn."
              }
            ]
          },
          {
            "title": "Tính cách của phần trình diễn",
            "fields": [
              {
                "key": "temperature",
                "name": "Độ táo bạo (temperature)",
                "text": "Độ táo bạo của mô hình (tối thiểu 0,01: bằng không sẽ làm engine dừng). Thấp — chơi “đúng sách”, đều và dễ đoán; cao — ứng tấu, lúc xuất sắc, lúc lạc tông.",
                "left": "đều hơn",
                "right": "táo bạo hơn",
                "when": "Lạc tông: 0,85. Mọi bản giống nhau: 1,1. Bản nhạc lạ: 0,5–0,6 cho bản nhạc."
              },
              {
                "key": "repetition_penalty",
                "name": "Phạt lặp",
                "text": "Mức phạt khi lặp lại điều đã chơi. Càng cao, mô hình càng tránh “đĩa nhạc bị kẹt”. Với bản nhạc, nó gần bằng 1,0 — lặp lại là bình thường trong ký âm.",
                "left": "cho phép lặp",
                "right": "không lặp",
                "when": "Lặp vòng: 1,3. Dưới 1,1 có nguy cơ lặp đơn điệu."
              }
            ]
          },
          {
            "title": "Độ dài bản nhạc",
            "fields": [
              {
                "key": "min_tokens",
                "name": "Không ngắn hơn",
                "text": "Mô hình không thể kết thúc trước mức này. Khoảng 25 đơn vị mỗi giây: 200 ≈ 8 giây âm thanh.",
                "left": "có thể ngắn",
                "right": "không trước",
                "when": "Bản nhạc kết thúc trước khi hát hết: hãy tăng lên."
              },
              {
                "key": "max_tokens",
                "name": "Không dài hơn",
                "text": "Trần độ dài. 9000 ≈ 6 phút bài hát; biểu mẫu nhận đến 15000. Nhiều hơn — chờ lâu hơn và tốn thêm bộ nhớ GPU.",
                "left": "ngắn hơn",
                "right": "dài hơn",
                "when": "Bị cắt giữa câu: 12000."
              }
            ]
          }
        ],
        "rareIntro": "Các mục này thay đổi cùng những thứ như Độ táo bạo hay Phạt lặp, chỉ tinh vi hơn. Thường để yên.",
        "rare": [
          {
            "key": "top_p",
            "name": "Ngưỡng cắt lựa chọn hiếm (top-p)",
            "text": "Mô hình xét bao nhiêu lựa chọn “hợp lý” ở mỗi bước: 1 — tất cả, 0,5 — chỉ những lựa chọn hiển nhiên nhất."
          },
          {
            "key": "top_k",
            "name": "Số ứng viên (top-k)",
            "text": "Giới hạn cứng số lựa chọn trong mỗi lần chọn. Bộ lọc thứ hai bên cạnh ngưỡng cắt lựa chọn hiếm."
          },
          {
            "key": "penalty_window",
            "name": "Bộ nhớ lặp",
            "text": "Mô hình nhớ ngược lại bao xa những gì nó đã chơi khi tính mức phạt lặp. 50 ≈ 2 giây âm thanh. Tăng lên 80 khi bị lặp vòng."
          }
        ]
      },
      "melody": {
        "lead": "YuE2 có thể hát lời theo một giai điệu bạn đưa. Bản nhạc ABC chứa nó: các nốt được viết dưới dạng văn bản. Từ bản nhạc theo định dạng mà ứng dụng viết, bài hát ra cùng tông, cùng các nốt hát và cùng độ dài: trong thử nghiệm của chúng tôi, các nốt khớp 93–99 %.",
        "roll": [
          "Nghe phát bản nhạc trên piano. Nhấp hoặc kéo trên roll để chọn điểm bắt đầu, ⏮ quay về đầu.",
          "Nốt màu hồng là giọng hát (Vocal), nốt màu xanh là phần đệm (Ins). Số ô nhịp và hợp âm chạy dọc phía trên.",
          "Ctrl + con lăn chuột để thu phóng, ⤢ mở cửa sổ lớn với ba quãng tám phím đàn.",
          "Bản nhạc cho thấy cùng bản nhạc đó trên khuông; nhấp vào một nốt để phát nó."
        ],
        "rollTitle": "Roll và các nốt",
        "sources": [
          "Từ một bài hát… — chọn một tệp âm thanh và SheetSage2 ghi lại giai điệu và hợp âm của nó. Bài hát có giọng hát rõ cho kết quả tốt nhất.",
          "Nhập MIDI — bè cao nhất trở thành giai điệu, các kênh khác là phần đệm và hợp âm, và tông được tự tìm ra. Hãy để giai điệu giọng hát trên một rãnh riêng.",
          "Piano — chọn độ dài và nhấn phím (bên dưới, bên trái roll, hoặc trên bàn phím MIDI): các nốt nối tiếp nhau.",
          "Từ một bản nhạc: Sang MIDI trong menu của một bản, hoặc tab Stem và nốt nhạc trong thư viện, rồi Sang bản nhạc YuE2. Giọng hát thành giai điệu, bass và phần còn lại thành phần đệm."
        ],
        "sourcesTitle": "Giai điệu đến từ đâu",
        "tips": [
          "Một nốt cho một âm tiết: một dòng 8 âm tiết cần khoảng 8 nốt.",
          "Bài hát dài bằng các nốt: 8 ô nhịp 4/4 ở 100 BPM khoảng 20 giây.",
          "Theo một giai điệu: mô hình giữ giai điệu của bạn và tự nghĩ ra phần đệm; Giai điệu và hợp âm: nó dựng cả hai từ bản nhạc.",
          "Tông hay nhịp độ trong phong cách không có tác dụng: chúng lấy từ các nốt.",
          "Chỉ sửa văn bản ABC bằng tay nếu bạn biết định dạng: mô hình đọc tốt nhất cách bố trí mà ứng dụng viết (bè Vocal và Ins)."
        ],
        "tipsTitle": "Để có kết quả sát",
        "title": "Giai điệu và bản nhạc ABC"
      },
      "style": {
        "tips": [
          "Tối ưu là 5–8 thẻ — nhiều hơn bắt đầu xung đột, ít hơn cho kết quả khó đoán hơn.",
          "Viết thẻ bằng tiếng Anh, nhưng bắt đầu bằng ngôn ngữ của bài hát (Russian, English, Spanish…): các ví dụ của chính engine đều làm vậy, và các luồng ý tưởng sẽ tự thêm cho bạn.",
          "Với kế hoạch giai điệu (Theo một giai điệu hoặc Giai điệu và hợp âm), phong cách vẫn quan trọng: nó quyết định âm sắc và phần hòa âm phối khí, còn giai điệu đến từ bản nhạc ABC."
        ]
      },
      "lyrics": {
        "tips": [
          "Với kế hoạch giai điệu, nhịp điệu của các dòng nên gần khớp với bản nhạc ABC (số âm tiết mỗi ô nhịp); nếu không, mô hình phải kéo giãn hoặc nén các từ cho vừa giai điệu.",
          "Các dòng ngắn khớp với giai điệu dễ đoán hơn dòng dài.",
          "Lặp lại điệp khúc từng chữ trong mỗi [Chorus] — việc này giữ cùng một đường giai điệu cho nó suốt bản nhạc."
        ]
      },
      "cot": {
        "title": "Kế hoạch giai điệu",
        "intro": "Kế hoạch giai điệu quyết định liệu mô hình có viết một kế hoạch âm nhạc trước âm thanh hay không, và cách nó dùng bản nhạc ABC ở tab Giai điệu.",
        "melodyNote": "Đưa giai điệu vào bản nhạc ABC dưới kế hoạch: Từ một bài hát… (SheetSage2), tệp MIDI hoặc piano. Nếu không có bản nhạc, mô hình tự viết kế hoạch chỉ có giai điệu.",
        "precisionNote": "Độ chính xác của mô hình (q8_0, q4_0, bf16) không liên quan đến kế hoạch: Chất lượng ở tab Bài hát đặt nó. q4_0 tiết kiệm bộ nhớ video với chút giảm chất lượng, bất kể kế hoạch.",
        "abcFooter": "Cách dễ nhất là không viết ABC từ đầu mà lấy từ một bài hát bằng Từ một bài hát… (SheetSage2), rồi chỉnh tay các ô nhịp cần thiết."
      }
    },
    "length": {
      "auto": "Tự động",
      "autoHint": "Dài bằng thời gian lời bài hát cần, tối đa khoảng 6 phút.",
      "hint": "Khoảng {n} phút: lời ngắn hơn được hát và chơi tiếp đến độ dài đó, lời dài hơn bị cắt ở đó.",
      "label": "Độ dài",
      "minutes": "{n} phút",
      "ownHint": "Đặt bằng tay ở Tinh chỉnh (Min / Max token)."
    },
    "lines": "Số dòng: {n}",
    "linesAbout": "Số dòng: {n}, khoảng {time}",
    "linesAboutHint": "Ước tính từ các bài hát trước của bạn: khoảng {s} giây một dòng. Cho độ dài Tự động.",
    "manual": {
      "abcGiven": "bản nhạc từ tab Giai điệu",
      "changed": "Đã đổi {n} trên {total}",
      "console": "Bảng điều khiển: mọi nhóm cùng lúc",
      "consoleTitle": "Bảng điều khiển YuE2",
      "done": "Xong",
      "groups": {
        "character": {
          "sub": "giọng hát và âm nhạc",
          "title": "Tính cách"
        },
        "length": {
          "sub": "25 token mỗi giây",
          "title": "Độ dài"
        },
        "repeats": {
          "sub": "chống lặp vòng",
          "title": "Lặp lại"
        },
        "score": {
          "sub": "cách mô hình viết kế hoạch giai điệu",
          "title": "Bản nhạc"
        },
        "sound": {
          "sub": "mô hình và giải mã",
          "title": "Âm thanh"
        }
      },
      "manual": "Thủ công",
      "params": {
        "cfg": "Độ bám sát phong cách",
        "max_tokens": "Không dài hơn",
        "min_tokens": "Không ngắn hơn",
        "penalty_window": "Bộ nhớ lặp",
        "precision": "Độ chính xác mô hình",
        "repetition_penalty": "Phạt lặp",
        "steps": "Số bước giải mã",
        "temperature": "Độ táo bạo",
        "top_k": "Số ứng viên",
        "top_p": "Ngưỡng cắt lựa chọn hiếm"
      },
      "reset": "Đặt lại",
      "resetAll": "Đặt lại tất cả",
      "seconds": "{n} giây",
      "seedRandom": "ngẫu nhiên",
      "sends": "Gửi tới engine",
      "sendsRest": "Các giá trị đặt bằng tay được đánh dấu. Những gì không có trong dòng này để engine dùng mặc định.",
      "simple": "Đơn giản"
    },
    "perf": {
      "manualNow": "(hiện đặt bằng tay)",
      "repeats": {
        "hint": "Ít hơn, khi một cụm cứ lặp đi lặp lại.",
        "label": "Lặp lại",
        "options": {
          "fewer": "Ít hơn",
          "normal": "Bình thường"
        }
      },
      "score": {
        "hint": "Cẩn thận hơn, khi giai điệu lan man: mô hình viết bản nhạc thận trọng hơn.",
        "label": "Bản nhạc",
        "options": {
          "careful": "Cẩn thận hơn",
          "normal": "Bình thường"
        }
      },
      "temperature": {
        "hint": "Đều hơn: ít nốt lạc và vỡ giọng hơn. Táo bạo hơn: các bản khác nhau nhiều hơn.",
        "label": "Giọng hát",
        "options": {
          "normal": "Bình thường",
          "steady": "Đều hơn",
          "varied": "Táo bạo hơn"
        }
      }
    },
    "planLabel": "Kế hoạch giai điệu",
    "planNames": {
      "full": "Giai điệu và hợp âm",
      "melody": "Theo một giai điệu",
      "off": "Không có kế hoạch"
    },
    "qualityHints": {
      "draft": "Mô hình {model} tốn ít bộ nhớ video hơn, âm thanh mộc hơn một chút: để thử ý tưởng.",
      "final": "Mô hình {model}, 32 bước giải mã và bám sát thẻ phong cách hơn (CFG 1,2): cho bản hoàn chỉnh. Hãy tạo 2–3 bản và giữ bản tốt nhất. bf16 cần nhiều bộ nhớ video hơn q8_0 (tệp 7,3 GB so với 4,3 GB).",
      "normal": "Mô hình {model} với cài đặt thông thường: âm thanh tốt mà không phải chờ lâu.",
      "own": "Độ chính xác, số bước và CFG đặt bằng tay."
    },
    "qualityLabel": "Chất lượng",
    "qualityNames": {
      "draft": "Bản nháp",
      "final": "Cuối cùng",
      "normal": "Bình thường",
      "own": "Riêng"
    },
    "queued": "Trong hàng đợi, số bản: {n}",
    "scoreGivenNote": "Bản nhạc đã cho thay thế kế hoạch, nên việc lấy mẫu bản nhạc không có tác dụng và không được gửi.",
    "sections": {
      "bridge": "+ Bridge",
      "chorus": "+ Chorus",
      "outro": "+ Outro",
      "verse": "+ Verse"
    },
    "tabs": {
      "changed": "Khác với mặc định",
      "melody": "Giai điệu",
      "song": "Bài hát",
      "tuning": "Tinh chỉnh"
    },
    "takes": "Số bản",
    "tuningTitle": "Cài đặt trình diễn"
  },
  "acePage": {
    "openTrainingPage": "Mở huấn luyện LoRA"
  },
  "library": {
    "noTracks": "Thư viện chưa có bản nhạc nào. Hãy tải một tệp lên ở trên hoặc tạo bản nhạc ở Tạo."
  },
  "notInstalled": {
    "stableAudio": {
      "text": "Stable Audio 3 tạo nhạc không lời và hiệu ứng âm thanh, và vận hành tính năng vẽ lại, nối tiếp và cover của trình chỉnh sửa. Nó đã bị bỏ ra khi cài đặt. Sau khi cài, hãy tải một mô hình ở Mô hình và cài đặt hoặc ngay trong biểu mẫu của Stable Audio."
    }
  },
  "idea": {
    "guide": {
      "lead": "Một cụm từ vào, một bản nhạc ra, ngay trên trang chủ. Bạn mô tả một bài hát, nhạc không lời hoặc âm thanh bằng lời của mình, một mô hình ngôn ngữ cục bộ viết prompt theo định dạng của engine đã chọn, bạn chỉnh sửa nếu muốn, và engine tạo bản nhạc.",
      "steps": [
        {
          "title": "Mô tả ý tưởng",
          "text": "Một, hai câu: bài hát nói về gì, tâm trạng, ai hát, ở đâu và khi nào. Với nhạc không lời: thể loại, nhạc cụ và tâm trạng."
        },
        {
          "title": "Chọn loại và engine",
          "text": "Bài hát có giọng hát, nhạc không lời hoặc âm thanh, rồi ACE-Step, YuE2 hoặc Stable Audio 3. Engine không tạo được loại đó thì không chọn được; âm thanh luôn thuộc về Stable Audio."
        },
        {
          "title": "Sáng tác",
          "text": "Nhấn Sáng tác: trợ lý viết prompt ngay dưới cụm từ và cho thấy giai đoạn, phần trăm và văn bản khi nó dài ra. Bạn có thể dừng nó. Âm thanh bỏ qua bước này: Sáng tác mở biểu mẫu của Stable Audio cùng cụm từ."
        },
        {
          "title": "Chỉnh sửa prompt",
          "text": "Thẻ, lời bài hát, nhịp độ, tông và độ dài có thể đổi ngay trong các ô."
        },
        {
          "title": "Tạo",
          "text": "Tạo đưa các bản vào hàng đợi của engine, engine khởi động khi đến lượt, và mở Tạo: các bản hiện trong danh sách phiên, đặt tên theo ý tưởng."
        }
      ],
      "writer": [
        "Trợ lý prompt là một mô hình ngôn ngữ cục bộ, Qwen3.5. Nó bám sát ý tưởng và viết lời bài hát bằng ngôn ngữ của ý tưởng hoặc ngôn ngữ bạn chọn. Mô hình của nó được tải ở trang Mô hình.",
        "Với ACE-Step, mô hình ngôn ngữ riêng của ACE-Step cũng có thể viết prompt khi engine đang chạy. Nhanh hơn, thường 5–20 giây, nhưng hay lạc khỏi ý tưởng hơn.",
        "Ngôn ngữ lời bài hát mặc định được lấy từ các chữ cái của ý tưởng; bạn có thể chọn nó ở mục Thêm, và cả ai viết prompt. Ở trang Tạo nó nằm trong Cài đặt của dòng ý tưởng."
      ],
      "after": [
        "Một bản khác viết lại prompt từ cùng ý tưởng.",
        "Mở trong biểu mẫu đưa prompt vào biểu mẫu của engine ở trang Tạo, cùng mọi cài đặt của nó.",
        "Ý tưởng và prompt vẫn còn khi bạn rời trang hoặc tải lại. Sau Tạo chúng được xóa để chuẩn bị cho ý tưởng tiếp theo; Đặt lại xóa chúng bằng tay.",
        "Ở trang Tạo, cùng ý tưởng đó nằm ở dòng ý tưởng phía trên biểu mẫu: Viết đưa lời bài hát và phong cách thẳng vào biểu mẫu (Mô tả, với Stable Audio), và Khôi phục nội dung trước đó đưa biểu mẫu về như cũ."
      ],
      "tips": [
        "Cụ thể hơn lời chung chung: “chuyến tàu đêm rời một thị trấn nhỏ” cho nhiều hơn “một bài hát buồn”.",
        "Muốn một thể loại, giọng hát hay nhạc cụ nhất định? Hãy nêu tên chúng trong ý tưởng.",
        "Hãy đọc lời bài hát trước khi tạo: một mô hình nhỏ không phải lúc nào cũng làm đúng vần và nhịp.",
        "Không phải âm thanh bạn muốn? Thử engine khác với cùng ý tưởng: prompt được viết lại theo định dạng của nó.",
        "Mưa, một cú đánh, tiếng bước chân là âm thanh, không phải nhạc: chọn Âm thanh, và cụm từ đi thẳng vào biểu mẫu của Stable Audio. Với Nhạc không lời và Stable Audio 3, trợ lý tự nhận ra rằng cần một âm thanh; ACE-Step sẽ tạo một bản nhạc từ ý tưởng như vậy."
      ]
    }
  },
  "sa3Weights": {
    "allOnModels": "Mọi mô hình, các checkpoint base và cài đặt đều ở trang Mô hình"
  },
  "autoTitle": {
    "accept": "Dùng",
    "another": "Cái khác",
    "bulk": "Gợi ý tên",
    "bulkDone": "Đã đặt tên {n} bản nhạc | Đã đặt tên {n} bản nhạc",
    "bulkFailed": "Đã đặt tên {n}, rồi dừng lại: {error} | Đã đặt tên {n}, rồi dừng lại: {error}",
    "bulkHint": "Trợ lý lần lượt đặt tên cho từng bản nhạc đã chọn; Hoàn tác sẽ khôi phục tên cũ.",
    "bulkStopped": "Đã dừng: đặt tên {n}/{total}",
    "bulkUndone": "Đã khôi phục tên cũ | Đã khôi phục tên cũ: {n}",
    "cancel": "Hủy",
    "failed": "Không nghĩ ra được tên: {error}",
    "noAssistant": "Trợ lý prompt chưa sẵn sàng: hãy tải mô hình của nó trong Mô hình.",
    "progress": "Đang đặt tên {done}/{total}",
    "stop": "Dừng",
    "suggest": "Gợi ý một tên",
    "working": "Đang nghĩ tên…"
  },
  "covers": {
    "alt": "Ảnh bìa của {title}",
    "another": "Ảnh bìa khác",
    "bulk": "Tạo ảnh bìa",
    "bulkDone": "Đã tạo {n} ảnh bìa | Đã tạo {n} ảnh bìa",
    "bulkFailed": "{n} ảnh không thành công",
    "bulkHint": "Một ảnh bìa cho mỗi bản nhạc đã chọn, lần lượt từng cái; bản nhạc đã có ảnh bìa sẽ nhận ảnh mới.",
    "bulkProgress": "Ảnh bìa: {done}/{total}",
    "cancel": "Hủy",
    "describe": "Bức ảnh thể hiện gì",
    "describeHint": "Một cảnh trong vài từ; tiếng Anh cho kết quả tốt nhất. Chữ trong ảnh được tự động tránh.",
    "dismiss": "Bỏ qua",
    "edit": "Sửa mô tả…",
    "enable": "Tạo ảnh bìa album cho các bản nhạc",
    "enableHint": "Thêm một bức ảnh cho mọi bài hát trong thư viện, trình phát và phiên. Tắt: không có ảnh bìa và không có nút ảnh bìa ở bất kỳ đâu.",
    "engine": "Ảnh bìa (Z-Image Turbo)",
    "failed": "Ảnh bìa không thành công: {error}",
    "fromAssistant": "Từ ý tưởng của trợ lý cho bản nhạc này.",
    "installed": "đã cài đặt",
    "loadingPrompt": "Đang đọc mô tả…",
    "make": "Tạo ảnh bìa",
    "making": "Đang tạo ảnh bìa…",
    "makingPct": "Đang tạo ảnh bìa… {pct}%",
    "model": "Mô hình: Z-Image Turbo, {gb} GB",
    "notInstalled": "chưa cài đặt",
    "notInstalledHint": "Mô hình ảnh bìa chưa có trên máy này. Hãy cài bằng trình cài đặt (phần Ảnh bìa) hoặc script thiết lập.",
    "onButton": "Ảnh bìa chỉ được tạo khi bạn bấm nút: trong chi tiết bản nhạc ở thư viện, hoặc cho các bản nhạc đã chọn. Mỗi ảnh mất 5 đến 10 giây; trong lúc đó GPU chuyển sang mô hình ảnh bìa, và bài hát tiếp theo sẽ tải lại engine của nó.",
    "parts": {
      "main": "Trọng số Z-Image Turbo",
      "server": "Máy chủ ảnh (stable-diffusion.cpp)"
    },
    "queued": "Đang chờ trong hàng đợi…",
    "remove": "Xóa ảnh bìa",
    "removeConfirm": "Có, xóa",
    "stop": "Dừng",
    "title": "Ảnh bìa",
    "draw": "Vẽ",
    "withAssistant": "Làm bằng trợ lý",
    "withAssistantHint": "Trợ lý prompt viết mô tả từ văn bản của bạn (bằng bất kỳ ngôn ngữ nào) hoặc, khi ô trống, từ bài hát; bạn có thể sửa trước khi vẽ.",
    "putBack": "Khôi phục",
    "anyLanguageHint": "Viết bằng bất kỳ ngôn ngữ nào: trợ lý sẽ biến nó thành mô tả mà mô hình hình ảnh hiểu được.",
    "fromSaved": "Mô tả đã dùng để vẽ bìa gần nhất.",
    "noAssistant": "Trợ lý prompt chưa sẵn sàng: hãy tải mô hình của nó trong Mô hình.",
    "describing": "Đang mô tả hình ảnh…",
    "describingPct": "Đang mô tả hình ảnh… {pct}%",
    "describeFailed": "Trợ lý không mô tả được hình ảnh: {error}",
    "bulkDescribing": "Đang mô tả {done}/{total}",
    "starting": "Đang khởi động mô hình ảnh…"
  },
  "takeCompare": {
    "best": "★ Tốt nhất",
    "failed": "Không tải được",
    "keep": "Giữ bản tốt nhất, chuyển các bản còn lại vào thùng rác",
    "keepConfirm": "Chuyển {n} bản vào thùng rác? | Chuyển {n} bản vào thùng rác?",
    "keepNeedStar": "Gắn sao cho bản tốt nhất để giữ lại.",
    "keepTooMany": "Chỉ gắn sao cho một bản: bản cần giữ.",
    "keepWill": "Giữ {take}; bản còn lại vào thùng rác. | Giữ {take}; {n} bản còn lại vào thùng rác.",
    "kept": "Đã giữ {take}; {n} bản đã chuyển vào thùng rác. | Đã giữ {take}; {n} bản đã chuyển vào thùng rác.",
    "keys": "1–4 chọn bản · Dấu cách phát/tạm dừng · ←/→ 5 giây · Esc đóng",
    "loading": "Đang tải…",
    "loadingAll": "đang tải các bản…",
    "newestOf": "{shown} bản mới nhất trong {total} bản",
    "nowHearing": "Đang phát: {take}",
    "open": "So sánh",
    "openTitle": "So sánh các bản của bài hát này, A/B",
    "position": "{at}/{total}",
    "restored": "Đã khôi phục {n} bản | Đã khôi phục {n} bản",
    "seed": "seed {seed}",
    "seek": "Vị trí",
    "takes": "Các bản",
    "tileLabel": "{letter}, bản {n}",
    "title": "So sánh các bản"
  }
}
