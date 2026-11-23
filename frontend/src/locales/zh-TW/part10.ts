// Strings added after the first translation (machine-translated from en, 743 keys);
// merged into the other parts key by key (see ../mergeParts).
export default {
  "aceGen": {
    "addLora": "新增 LoRA",
    "cfgIntervalOrder": "引導“起點”必須小於“終點”。",
    "lengthAskedNote": "時長會作為期望值交給模型。再次點選已選項，則交由模型決定。",
    "lengthByModelNote": "根據描述生成時，模型會自己決定時長。在這裡選一個即可指定。",
    "loraName": "LoRA 名稱",
    "loraPath": "LoRA 轉接器資料夾",
    "manual": {
      "adg": "自適應引導 (ADG)",
      "balancedOnly": "僅限“平衡”模式",
      "baseOnly": "僅限 base 和 SFT 模型",
      "bpm": "速度",
      "cfgEnd": "引導終點（佔進度的比例）",
      "cfgStart": "引導起點（佔進度的比例）",
      "cotCaption": "擴寫描述",
      "cotCaptionHint": "開啟後，語言模型可能會在生成音樂前改寫你的風格文字。",
      "cotLanguage": "檢測語言",
      "cotLanguagePicked": "關閉：保留你選擇的語言",
      "coverNoise": "與原曲混合的噪聲",
      "coverRepaintOnly": "用於翻唱或重繪",
      "infer": "解碼方式",
      "latentCrossfade": "模型內部的銜接",
      "length": "時長",
      "lmCfg": "貼合提示的程度",
      "lmNegative": "要避免的內容",
      "lmSub": "編寫歌曲規劃並補全缺失的內容",
      "lmTitle": "語言模型",
      "loraScale": "LoRA 強度",
      "metaByModel": "由模型根據描述決定",
      "musicSub": "事先已知的歌曲資訊",
      "musicTitle": "音樂",
      "myLoras": "我的 LoRA：{n}",
      "needRef": "需要參考曲目",
      "noLm": "ACE-Step 在這塊 GPU 上不載入它",
      "noLmWithRef": "使用參考曲目時不啟用",
      "ode": "ODE：結果完全可重複",
      "off": "關",
      "pickLora": "請先選擇 LoRA",
      "refSub": "翻唱與重繪",
      "refTitle": "參考曲目",
      "repaintMode": "重繪模式",
      "repaintModes": {
        "aggressive": "大膽",
        "balanced": "平衡",
        "conservative": "謹慎"
      },
      "repaintOnly": "用於重繪某一段",
      "repaintStrength": "重繪強度",
      "resultSub": "如何輸出",
      "sde": "SDE：帶隨機性",
      "sdeBaseWarn": "在 base 模型上，SDE 在測試中（32 步）生成的是噪聲而非音樂。在 Turbo 上可用，聲音偏暗。",
      "shift": "調度偏移",
      "thinking": "先做規劃（思考）",
      "tiled": "分塊解碼",
      "turboSteps": "Turbo 支援 1 到 8 步：超出的會被截為 8",
      "wavCrossfade": "音訊中的銜接"
    },
    "modeDescribe": "根據描述",
    "modeLabel": "從什麼開始",
    "modeOwn": "自己的歌詞和風格",
    "modelNote": "Turbo 用 8 步。其他模型耗時更長；並非所有模型都支援抽出或新增聲部，模型做不了的任務會在“從曲目”標籤頁中變灰。",
    "noLmBaseNote": "Base 和 SFT 依靠該模型獲得乾淨的人聲：在這種模式下，聲音可能嘈雜、發遠。需要人聲時，請切換到“自己的歌詞和風格”並寫好歌詞，或選擇 Turbo。",
    "noLmNote": "在這塊顯示卡（8 GB 或更少）上，ACE-Step 不載入它的語言模型，因此你的描述會作為普通風格提示交給模型，不會生成歌詞。",
    "noVocal": "無人聲",
    "noVocalHint": "純音樂：不需要歌詞，音樂由下方的風格決定。",
    "queuedStatus": "已在隊列中，版本數：{n}",
    "refFile": "參考音訊檔案",
    "refOff": "開啟後可基於現成曲目工作：翻唱、重做某一段、抽出或新增一個聲部。",
    "removeLoraConfirm": "移除？",
    "removeLoraNamed": "移除 LoRA {name}",
    "repaintOrder": "範圍的終點必須在起點之後。",
    "simple": {
      "auto": "自動",
      "fast": "快 {n}",
      "formatHint": "mp3 佔用空間更小；wav 和 flac 為無損音質。",
      "key": "調式",
      "keyHint": "大調聽起來更明亮，小調更暗、更憂傷。主音和其他音階可在“手動”中選擇。",
      "keyWish": "根據描述生成時，模型會自己選調。在這裡選的調式會作為期望值交給它。",
      "lengthHint": "曲目的時長。",
      "lengthWish": "根據描述生成時，模型會自己決定時長。在這裡選的會作為期望值交給它，不保證一定如此。",
      "major": "大調",
      "medium": "中速 {n}",
      "minor": "小調",
      "slow": "慢 {n}",
      "tempo": "速度",
      "tempoHint": "每分鐘節拍數。“自動”交由模型決定；精確數值在“手動”中設定。",
      "tempoWish": "根據描述生成時，模型會自己決定速度。在這裡選的會作為期望值交給它。"
    },
    "tabChanged": "已更改",
    "tabs": {
      "ref": "從曲目",
      "song": "歌曲",
      "tuning": "調節"
    },
    "taskType": "對曲目做什麼",
    "taskUnsupported": "此模型不支援",
    "help": {
      "style": {
        "tips": [
          "最合適的是 5–9 個標籤：太少，模型會自己補空白，結果更難預料；太多，標籤之間就會互相衝突。",
          "把曲風和情緒放在最前面——它們對整首曲子的整體性格影響比其他標籤更大。",
          "不要在同一類別裡混用相互矛盾的標籤（比如同時寫“激進”和“夢幻”）——模型要麼忽略其中一個，要麼結果會變得混亂。",
          "標籤最好用英文寫——訓練數據以英文為主，所以更準確，即使歌詞是俄語的也一樣。",
          "在“調節”中設定的速度（“簡單”裡選，或在“手動”裡填精確數值）比風格裡寫的“120 bpm”這類文字標籤更可靠：速度重要時就用它。"
        ]
      },
      "lyrics": {
        "tips": [
          "與曲目時長匹配：2 分鐘左右通常夠放 2 段主歌加 2 段副歌；3 分鐘以上就加一段橋段和第二個 hook——歌詞對短時長來說太長，會被模型“硬塞”進去。",
          "短句（5–10 個音節）比長句更容易貼合旋律——如果一行太長，就拆成兩行。",
          "重複的副歌（每個 [Chorus] 裡的文字一字不差）有助於模型在整首曲子裡為它保持同一段旋律。",
          "完全是純音樂時，請勾選“無人聲”，而不是寫一份只有 [Interlude] 的歌詞：這樣更可靠。",
          "標點（逗號、省略號）會影響人聲的斷句和停頓——請有意識地使用，而不只是按拼寫規則。"
        ]
      },
      "remix": {
        "unavailable": "可用的場景取決於所選的模型——表單裡不支援的選項會變灰。如果需要某個特定場景，可以換一個模型（在“歌曲”標籤頁或“調節”中）。請上傳模型能提取音訊的格式的參考檔案（wav/mp3/flac）——很長的檔案（幾分鐘）會明顯增加處理時間。"
      },
      "advanced": {
        "title": "調節",
        "rows": [
          {
            "param": "簡單和手動",
            "what": "“簡單”只有幾個樸素的選項：解碼步數（Turbo 上沒有）、時長、速度（慢 80、中速 110、快 140）、調式（大調或小調）和格式。“手動”按分組列出所有參數，控制台一次顯示全部。"
          },
          {
            "param": "格式",
            "what": "輸出檔案的格式。mp3 更小，聽歌足夠；wav 和 flac 是無損的，但體積大 5–10 倍。"
          },
          {
            "param": "速度、調、拍號",
            "what": "明確的音樂參數。留在自動時，模型會從風格文字中取得；只有需要精確時才手動設定（比如要和其他曲目混音）。拍號為 2/4、3/4、4/4 或 6/8。根據描述生成時，模型會自己選擇：在這裡設的速度或調會作為期望值交給它，拍號則由它決定。"
          },
          {
            "param": "人聲語言",
            "what": "人聲演唱所用的語言。自動時取自歌詞，歌詞很短或有歧義時可能判斷錯：如果人聲的語言不對，就手動設定。手動選擇的語言會被保留，語言模型不會替換它。"
          },
          {
            "param": "解碼步數",
            "what": "擴散的步數。更多可能讓音訊更乾淨，但生成更慢；超過某個點後，提升幾乎聽不出來。Turbo 支援 1 到 8（預設 8），SFT 模型 50，base 模型 32。在“簡單”裡，“更多”是常用步數的兩倍。"
          },
          {
            "param": "貼合風格的程度",
            "what": "引導強度：模型有多嚴格地遵循你的描述。越高，越精確地遵循風格標籤，但過高的值會讓聲音刺耳、瑕疵增多；越低越自然，但更難預料。Turbo 不使用它。預設值為 7，合理範圍通常是 3 到 12。"
          },
          {
            "param": "Seed",
            "what": "在表單下方，“建立”旁邊。按下骰子後，每個版本都會使用新的隨機 seed。固定一個數字、其他設定不變時，結果幾乎會重現：適合改動一個風格標籤再對比。"
          },
          {
            "param": "模型",
            "what": "Turbo 更快，但音質略有犧牲，並且不是“從曲目”標籤頁裡的所有任務都能做；base 和 SFT 更慢，但更精確、更靈活。模型在“歌曲”標籤頁或“手動”中選擇。"
          },
          {
            "param": "LoRA",
            "what": "疊加在模型之上的微調附加模塊，比如用於某種特定的人聲音色或子流派。它的強度（0 到 1）決定對結果的影響程度：1 是轉接器作者想要的完整效果，更低則融入得更柔和。轉接器在“手動”的“我的 LoRA”裡透過名稱和資料夾新增。"
          }
        ],
        "footer": "你沒動的項都使用引擎的預設值：不必全部設定也能得到好結果。“重置”會恢復調節自己的各項，而不改動模型和時長。"
      }
    }
  },
  "aiPart": {
    "guide": {
      "scratch": [
        {
          "title": "速度、調、時長",
          "text": "在空工程中，在面板裡設定 BPM、“調”以及以秒為單位的時長。120 BPM 下 64 小節是 128 秒。"
        },
        {
          "title": "先從鼓開始",
          "text": "“新增聲部”，樂器選“鼓”。其他聲部的節奏以鼓為準，所以鼓放在最前面。"
        },
        {
          "title": "先貝斯，再和聲",
          "text": "先貝斯，再和弦：鍵盤、pad。在模型能聽到的軌道列表中保持勾選鼓。"
        },
        {
          "title": "旋律與色彩",
          "text": "主音、弦樂、打擊樂。五到七個聲部就夠了；再多，混音會變得擁擠。"
        },
        {
          "title": "挑選並調好音量",
          "text": "每個聲部留下最好的版本，並立刻把它調到合適的音量。"
        },
        {
          "title": "搭出整首歌",
          "text": "開啟“吸附”和小節標尺，用刀具切開聲部，用橡皮擦刪掉片段：前奏、主體、沒有鼓和貝斯的間奏、尾聲。"
        }
      ],
      "scratchIntro": "編曲助手可以從空工程開始做一首曲子。聲部一個一個新增，後面的每一個都會聽到已有的聲部，所以順序很重要。",
      "scratchTitle": "從零開始做一首曲子",
      "steps": [
        {
          "title": "啟動引擎",
          "text": "編曲助手執行在 ACE-Step 上；重繪、續寫和翻唱也可以用 Stable Audio 3 執行。如果引擎已停止，面板會提供一個按鈕來啟動它，此時 GPU 上的引擎會停止。"
        },
        {
          "title": "設定速度和調",
          "text": "在新增第一個聲部之前，設定工程的 BPM 和“調”：主音和音階。模型每次請求都會拿到它們。新增了前幾個聲部之後不要再改速度：它們會偏離網格。"
        },
        {
          "title": "選擇模式",
          "text": "“新增聲部”、“重繪”、“續寫”或“翻唱”。開關旁邊的提示用一句話說明模型會做什麼。"
        },
        {
          "title": "描述你需要的",
          "text": "新聲部要選樂器。描述裡寫出聲音和演奏方式。可以用你自己的語言寫：“轉成英文”會把它改寫成模型最容易讀懂的形式。字段旁的“?”會開啟詞匯和現成的示例。"
        },
        {
          "title": "勾選模型能聽到的",
          "text": "模型會配合勾選的軌道。請保持勾選鼓：模型會跟隨它們的網格。"
        },
        {
          "title": "指定位置",
          "text": "整首曲子或迴圈區域：開啟“迴圈”，並在標尺上拖出區域。“重繪”只作用於迴圈區域。"
        },
        {
          "title": "生成並選擇",
          "text": "各版本會落在新的軌道上。“試聽”切換到某個版本，“保留”會移除其他版本。"
        }
      ],
      "tips": [
        "描述用英文效果最好，寫成逗號分隔的短語。用你自己的語言寫，再點選“轉成英文”；讀一讀結果，需要時修改。",
        "描述一個聲部，而不是整首曲子：樂器演奏什麼、聽起來怎樣。",
        "分步搭建曲子：鼓，然後貝斯，然後和聲，然後旋律。後面的每個聲部都會聽到前面的。",
        "對某個版本不滿意？再生成一次：每次執行都使用新的隨機 seed。",
        "每新增一個新聲部，先調好它的音量，再新增下一個：下一個聲部聽到的是當前的混音。",
        "聲部都做好後，用它們搭出整首歌：用刀具 (C) 按小節切開軌道，用橡皮擦 (E) 刪掉片段，讓樂器一個接一個進來。",
        "做人聲時，輸入歌詞並檢查“人聲語言”：設為“自動”時是根據字母判斷的。",
        "ACE-Step 會把每個結果的電平調到 -1 dBFS，所以新聲部進來時會很響：用軌道音量滑塊把它調低。",
        "要在其他 DAW 裡完成曲子，請匯出“分軌 + Reaper”或 DAWproject。",
        "重繪、續寫和翻唱也可以用 Stable Audio 3 執行：在面板裡把它選為引擎。它透過聆聽範圍周圍的音訊來補全和續寫，只需幾秒，僅限純音樂。新增聲部仍由 ACE-Step 負責。"
      ]
    },
    "toEnglish": "轉成英文",
    "toEnglishBusy": "正在寫…",
    "toEnglishDone": "已由助手改寫成英文；需要的話可以再改。",
    "toEnglishFailed": "助手沒能寫出描述。",
    "toEnglishGpu": "提示詞助手被設為在 GPU 上執行，這會解除安裝當前模型。請在“模型”頁面把它改為“自動”或 CPU。",
    "toEnglishTitle": "用任何語言描述都行：提示詞助手會把它改寫成英文，這是模型最容易讀懂的形式",
    "toEnglishUndo": "撤銷"
  },
  "create": {
    "closeTool": "關閉",
    "deleteAsk": "刪除？",
    "details": "詳情",
    "download": "下載",
    "emptyAll": "你的歌曲會顯示在這裡",
    "emptyHint": "選擇引擎，填寫表單，或在上方的創意欄裡寫一句話，然後點選“建立”。",
    "emptyPeriod": "這段時間內沒有生成任何內容",
    "engine": "引擎",
    "engineTitle": "{name}：{status}",
    "engines": {
      "ace_step": "快速，可翻唱",
      "stable_audio": "音效與迴圈",
      "yue2": "帶人聲的歌曲"
    },
    "failed": "沒有成功。請載入表單後再次點選“建立”。",
    "idea": {
      "chip": {
        "description": "描述",
        "length": "時長",
        "lyrics": "歌詞",
        "style": "風格",
        "tempo": "速度和調"
      },
      "describe": "描述",
      "dismiss": "忽略",
      "formChanged": "表單已更改。",
      "noAssistant": "提示詞助手尚未就緒：請在“模型與設定”（頂部的齒輪）中下載它的模型。",
      "noAssistantLink": "到“模型”中下載",
      "noAssistantNote": "提示詞助手需要它的模型。",
      "placeholder": {
        "ace_step": "用一句話說說：你想要什麼音樂",
        "stable_audio": "用一句話說說：想聽到什麼聲音",
        "yue2": "用一句話說說：這首歌講什麼"
      },
      "replaces": "會替換表單中現有的內容",
      "settings": "設定",
      "stop": "停止",
      "stopping": "正在停止…",
      "undo": "恢復原來的內容",
      "write": "寫歌詞和風格",
      "writeSa": "寫描述",
      "writeShort": "寫",
      "writing": "助手正在寫…",
      "written": "已填入下方表單。",
      "writtenOther": "已填入 {name} 表單。",
      "saKind": "寫什麼",
      "saKinds": {
        "auto": "自動：依照想法",
        "music": "音樂曲目",
        "instrument": "獨奏樂器",
        "one_shot": "單次取樣",
        "sfx": "音效"
      }
    },
    "lessDetails": "收起",
    "live": {
      "failed": "版本失敗：{name}。{reason}",
      "queue": "隊列中的版本：{n}",
      "ready": "版本已完成：{name}",
      "readyMany": "已完成的版本：{n}，{name}"
    },
    "loading": "正在載入曲目…",
    "making": "生成中",
    "menu": {
      "made": "生成於 {when}，時長 {len}",
      "midi": "轉為 MIDI",
      "rename": "重命名",
      "stems": "拆分為分軌",
      "took": "用時 {s} 秒"
    },
    "models": "模型",
    "more": "詳情與操作",
    "pause": "暫停",
    "peek": {
      "copied": "已複製",
      "copy": "複製",
      "lines": "{n} 行",
      "lyrics": "歌詞",
      "noLyrics": "沒有歌詞",
      "style": "風格",
      "tags": "{n} 個標籤"
    },
    "period": "時間段",
    "periodHint": {
      "all": "迄今生成的全部內容。",
      "today": "今天生成的版本。加星標的會收進曲庫的“收藏”。",
      "week": "最近七天的版本。"
    },
    "periods": {
      "all": "全部",
      "today": "今天",
      "week": "7 天"
    },
    "play": "播放",
    "position": "曲目中的位置",
    "queued": "排隊中",
    "reuse": "載入表單",
    "reuseInForm": "載入表單",
    "session": "會話",
    "showAll": "顯示全部：{n}",
    "showMore": "顯示更多：{n}",
    "startAndCreate": "啟動 {name} 並建立",
    "startFailed": "{name} 沒有啟動。",
    "startingEngine": "正在啟動 {name}…",
    "startsOnCreate": "{name} 目前沒有執行。點選“建立”時才會啟動；啟動後的第一個版本會更慢。",
    "startsOnCreateOther": "{other} 正佔用 GPU。點選“建立”時 {name} 會啟動，{other} 會停止。啟動後的第一個版本會更慢。",
    "stop": "停止",
    "stopAsk": "停止？",
    "stopConfirm": "再點選一次即可停止：已生成的部分會丟失",
    "stopped": "已停止。",
    "styleAndLyrics": "風格與歌詞",
    "takeN": "版本 {n}",
    "takeTitle": "{title}，版本 {n}",
    "takes": "版本數：{n}",
    "toSession": "到會話列表，版本數：{n}",
    "untitled": "未命名",
    "wholeLibrary": "整個曲庫"
  },
  "favorite": {
    "add": "加入收藏",
    "remove": "取消收藏"
  },
  "header": {
    "create": "建立",
    "desc": {
      "create": "歌曲、純音樂和音效",
      "library": "所有曲目：生成的、上傳的和來自編輯器的"
    },
    "gpuFree": "GPU 空閒",
    "home": "首頁",
    "languageCurrent": "界面語言：{name}",
    "library": "曲庫",
    "more": "更多：語言、模型、幫助",
    "guide": {
      "mapTitle": "應用的各個部分",
      "map": {
        "idea": "最簡單的入口，就在首頁：一句話加“創作”，本地語言模型會為引擎寫好提示詞。修改後即可生成曲目。",
        "lora": "用你自己的曲目微調 ACE-Step：上傳音訊、自動標注、檢查描述、訓練並匯出。它位於“建立”頁面的 ACE-Step 下；訓練好的轉接器會出現在 ACE-Step 表單裡。",
        "yue": "第二個引擎：寫出帶人聲的完整歌曲，並能圍繞給定的旋律來創作（“旋律”標籤頁，配合 SheetSage2）。它還能把曲目轉成 MIDI。"
      },
      "gpu": [
        "這些引擎無法同時放進 GPU，所以一次只執行一個。在“建立”頁面選擇引擎，在它的表單裡點選“建立”時啟動；正在執行的那個會停止。",
        "第一次啟動要幾分鐘，模型需要載入視訊記憶體。頂部的狀態按鈕會顯示 GPU 上的引擎以及視訊記憶體的佔用情況；點選可檢視誰佔了多少視訊記憶體，還有“解除安裝”按鈕和通往“模型”的入口。",
        "解除安裝會中斷正在進行的生成或訓練，所以按鈕會先確認。"
      ],
      "steps": [
        {
          "title": "開啟 ACE-Step",
          "text": "進入“建立”並選擇 ACE-Step。第一次點選“建立”時它才會啟動；第一次啟動需要幾分鐘。"
        },
        {
          "title": "描述歌曲",
          "text": "在“歌曲”標籤頁選“根據描述”：寫幾句話就夠了，說明曲風、情緒和歌詞的內容。再選時長和版本數。"
        },
        {
          "title": "挑出最好的版本",
          "text": "各版本會排在表單旁邊的會話列表裡（手機上在表單下方）。所有生成的內容都會自動儲存到曲庫。"
        },
        {
          "title": "拆分為分軌",
          "text": "一鍵得到人聲、鼓、貝斯和其他：在版本菜單裡選“拆分為分軌”，或用曲庫裡的“分軌與音符”標籤頁，也可以直接在編輯器裡操作。"
        },
        {
          "title": "在編輯器裡搭建",
          "text": "把分軌擺到各條軌道上，用 AI 編曲助手新增聲部，設定效果。"
        },
        {
          "title": "匯出",
          "text": "混音匯出為 WAV 或 MP3，或者連同 Reaper 工程或 DAWproject 一起匯出各條軌道。"
        }
      ],
      "compare": [
        {
          "label": "最適合",
          "ace": "快速出歌和純音樂，連續生成多個版本",
          "yue": "一次生成帶人聲的完整歌曲",
          "sa3": "純音樂、音效和取樣；在編輯器中補全和延續音訊"
        },
        {
          "label": "基於現有曲目",
          "ace": "翻唱、重繪一段、新增聲部、抽出聲部、續寫",
          "yue": "按另一首曲目的旋律寫歌：“旋律”標籤頁，配合 SheetSage2 或 MIDI 檔案",
          "sa3": "重繪一段、續寫、換風格翻唱（音訊到音訊）；不能在混音之上加聲部"
        },
        {
          "label": "你自己的風格",
          "ace": "用你的曲目訓練的 LoRA",
          "yue": "不支援",
          "sa3": "不支援（計劃支援 LoRA）"
        },
        {
          "label": "時長",
          "ace": "10 到 300 秒，每次執行 1、2 或 4 個版本",
          "yue": "取決於歌詞，或 1 到 8 分鐘；每次執行 1 到 4 個版本",
          "sa3": "最長 6 分鐘（medium）或 2 分鐘（small）；每次執行 1、2 或 4 個版本，按秒計"
        },
        {
          "label": "MIDI",
          "ace": "不支援",
          "yue": "曲目或分軌轉 MIDI (MuScriptor)",
          "sa3": "不支援"
        },
        {
          "label": "許可",
          "ace": "MIT：允許商用；發布前請檢視最新條款",
          "yue": "僅限非商業用途",
          "sa3": "Stability AI Community License：年收入低於 100 萬美元免費；僅限純音樂，無人聲"
        }
      ]
    },
    "helpSections": {
      "idea": {
        "title": "從創意開始創作",
        "text": "在首頁用一兩句話描述一首歌、一段純音樂或一個音效，再選引擎；歌詞語言和由誰來寫提示詞在“更多”裡。點選“創作”後，提示詞助手（本地的 Qwen3.5 模型）會按引擎的格式寫出提示詞：風格標籤、分段的歌詞、速度和調。你可以修改、生成，或在引擎的表單裡開啟。音效不經過助手，直接交給 Stable Audio。在“建立”頁面，同樣的創意欄位於表單上方，寫出的內容會直接填入表單。助手的模型和設備在“模型與設定”中設定。"
      },
      "engines": {
        "text": "共有三個引擎生成音訊：ACE-Step 1.5、YuE2-3B 和 Stable Audio 3，它們無法同時放進一塊 GPU，所以一次只執行一個。在“建立”頁面選擇引擎：點選“建立”時它才啟動，正在執行的那個會自動停止。指示燈顯示它的狀態；第一次啟動可能要幾分鐘，模型需要載入視訊記憶體。頂部的狀態按鈕會顯示誰佔用了 GPU，並可以解除安裝它。"
      },
      "ace": {
        "text": "在“歌曲”標籤頁，可以用大白話描述音樂（根據描述），也可以給出風格標籤和帶 [Verse] / [Chorus] 標記的歌詞（自己的歌詞和風格），或者勾選“無人聲”。在“從曲目”標籤頁，參考曲目可用於翻唱、重繪一段、抽出或新增聲部，或把一首作品補完。時長為 10-300 秒，每次執行 1、2 或 4 個版本。“調節”裡有“簡單”（步數、時長、速度、調式、格式）和“手動”（所有參數）；訓練好的 LoRA 在那裡啟用，強度為 0 到 1。"
      },
      "yue": {
        "text": "YuE2-3B 寫出帶人聲的完整歌曲。“歌曲”標籤頁裡有歌詞、風格、時長和質量。“旋律”標籤頁設定旋律規劃：“無規劃”直接生成音訊，“跟隨旋律”保留給定的旋律並自己編伴奏，“旋律和和弦”會先寫出兩者的規劃。SheetSage2（從歌曲…）能把曲目的旋律寫成 ABC 樂譜，你可以編輯它，再交回給 YuE2。"
      },
      "sa3": {
        "text": "Stable Audio 3 根據描述，幾秒鐘內就能做出純音樂和音效：選“音樂”或“音效”，像取樣庫那樣描述它（曲風、樂器、情緒、速度，或者聲音的來源和產生方式），再設定時長和版本數。它沒有人聲。編輯器裡的 AI 編曲助手和“取樣”也用同一個引擎，它會透過聆聽範圍兩側的音訊來重繪、續寫和翻唱。主要權重需要授權：請在 Hugging Face 上接受許可，儲存你的令牌，再到“模型與設定”下載模型。"
      },
      "lora": {
        "text": "LoRA 訓練位於“建立”頁面的 ACE-Step 之下，在“生成”旁邊（手機上是表單上方的開關）。訓練需要 ACE-Step 在執行，頁面會提示啟動它。它帶你走完整個微調流程：上傳音訊、自動標注、檢查並編輯描述、預處理、訓練（實時顯示進度）和匯出。訓練好的轉接器會加入 ACE-Step 表單裡的 LoRA 列表。"
      },
      "stems": {
        "text": "任何已儲存的曲目都可以一鍵拆分為四個分軌（人聲、鼓、貝斯、其他）：在版本菜單裡選“拆分為分軌”，或用曲庫裡的“分軌與音符”標籤頁，也可以在編輯器裡操作某條軌道。分軌可以在編輯器裡作為現成的四軌工程開啟。MIDI 轉錄 (MuScriptor) 可用於完整混音或單個分軌；它執行在 YuE2 引擎上，所以必須安裝 YuE2。"
      },
      "arranger": {
        "text": "編輯器裡的“AI 編曲助手”按鈕是一步步搭建曲子，而不是整首生成。“新增聲部”會在所選軌道之上寫一個新聲部（鼓、貝斯、pad、弦樂等），“重繪”會重寫較弱的一段，“續寫”讓曲子繼續往下，“翻唱”會做出另一種風格的新版本。每個版本都放在自己的軌道上：試聽，留下最好的，再進入下一個聲部。聲部由 ACE-Step base 模型（約 4.8 GB）或它更大的 XL base 版本（約 20 GB，需要 16 GB 顯示卡）新增；兩者都是可選的，沒有 base 模型時，編曲助手會提示安裝。其他模式使用 turbo 執行，若你把 Stable Audio 3 選為引擎，則用它執行：它透過聆聽周圍的音訊來補全、續寫和翻唱，僅限純音樂。"
      },
      "sfx": {
        "text": "編輯器裡的“取樣”按鈕用 Stable Audio 3，根據一句簡短的描述做出單次音效（底鼓、擊打聲、嗖聲）、符合工程速度的迴圈以及氛圍素材（雨聲、人群、持續低音）。結果排成一排：先試聽，再把喜歡的加到新軌道，或加到所選軌道的播放頭位置。迴圈會按整小節裁切，但模型不保證無縫銜接，所以請迴圈播放檢查。“從列表中移除”會從曲庫和磁碟中刪除該任務的聲音，當時放在軌道上的除外。"
      }
    }
  },
  "home": {
    "allTracks": "整個曲庫",
    "compose": "創作",
    "composeHere": "助手會為所選引擎寫好提示詞；生成前你可以修改",
    "composeSound": "助理寫出含長度的音效提示詞，由 Stable Audio 生成",
    "engineLabel": "引擎",
    "engines": "或直接進入某個引擎",
    "firstText": "描述一首歌，或選一個示例：",
    "firstTitle": "你的曲目會顯示在這裡",
    "guide": "創作是怎麼進行的",
    "kind": {
      "instrumental": "純音樂",
      "song": "帶人聲的歌曲",
      "sound": "音效"
    },
    "kindLabel": "要做什麼",
    "lead": "一切都在這台電腦上執行",
    "loading": "正在載入曲目",
    "more": "更多",
    "needPhrase": "請先描述音樂",
    "title": "我們來做什麼？",
    "phraseLabel": "描述音樂",
    "placeholderSound": "夜裡雨點打在鐵皮屋頂上，近而平靜",
    "soundBySa3": "音效由 Stable Audio 生成",
    "soundMissing": "未安裝 Stable Audio"
  },
  "keyScale": {
    "hint": "ACE-Step 只認識大調和小調。對這個音階，它會得到最接近的調（{key}），並在描述中帶上音階名稱：只是提示，不保證效果。",
    "mode": "音階",
    "modes": {
      "blues": "布魯斯",
      "dorian": "多利亞",
      "double_harmonic": "雙和聲",
      "harmonic_minor": "和聲小調",
      "hungarian_minor": "匈牙利小調",
      "locrian": "洛克利亞",
      "lydian": "利底亞",
      "major": "大調（伊奧尼亞）",
      "major_pentatonic": "大調五聲",
      "melodic_minor": "旋律小調",
      "minor": "自然小調（愛奧利亞）",
      "minor_pentatonic": "小調五聲",
      "mixolydian": "混合利底亞",
      "phrygian": "弗裡幾亞",
      "phrygian_dominant": "弗裡幾亞屬音"
    },
    "needTonic": "請先選主音",
    "none": "沒有這種音階",
    "notSet": "未設定",
    "search": "輸入以搜索",
    "tonic": "主音"
  },
  "libraryPage": {
    "aiPart": "AI 編曲助手生成的聲部",
    "collectionName": "合集名稱",
    "confirmDeleteCollection": "移除這個合集？",
    "cot": {
      "full": "旋律和和弦",
      "melody": "跟隨旋律"
    },
    "delete": "刪除",
    "deleteCollection": "移除合集（其中的曲目會保留）",
    "deleteFailed": "無法刪除：{error}",
    "emptyCollection": "開啟一首曲目，在它的“關於”標籤頁中把它加入這個合集。",
    "emptyFavorites": "給曲目加星標，它就會出現在這裡。",
    "emptyHere": "這裡還沒有內容",
    "emptyHint": "你生成和上傳的曲目會匯集在這裡。",
    "facts": {
      "file": "檔案",
      "madeIn": "生成用時",
      "melody": "旋律",
      "model": "模型"
    },
    "filters": {
      "all": "所有曲目",
      "favorites": "收藏",
      "midi": "音符 (MIDI)",
      "score": "樂譜",
      "stems": "分軌",
      "today": "今天"
    },
    "filtersLabel": "曲庫篩選",
    "groups": {
      "collections": "合集",
      "has": "曲目包含",
      "origin": "來源",
      "tags": "標籤"
    },
    "loadFailed": "無法載入曲庫。",
    "newCollection": "+ 新建合集",
    "newest": "最新的在前",
    "noCollections": "還沒有合集：點選“新建合集”建立第一個。",
    "nothingFound": "沒有找到",
    "nothingFoundHint": "換個詞或換個篩選條件試試。",
    "oldest": "最早的在前",
    "order": "排序",
    "origins": {
      "editor": "編輯器",
      "upload": "上傳"
    },
    "period": "時間段",
    "pick": "選擇一首曲目：它的歌詞、風格、分軌和音符會顯示在這裡。",
    "renameCollection": "重命名合集",
    "retry": "重試",
    "reuseHint": "用這些歌詞、風格和設定開啟“建立”",
    "search": "標題、風格或一句歌詞",
    "showAll": "顯示所有曲目",
    "sub": {
      "editor": "來自編輯器",
      "engine": "沒有描述",
      "upload": "上傳的檔案"
    },
    "tabs": {
      "about": "關於",
      "lyrics": "歌詞",
      "parts": "分軌與音符"
    },
    "take": "版本 {n}",
    "title": "曲庫",
    "toCreate": "生成第一首曲目",
    "today": "今天",
    "yesterday": "昨天",
    "bulk": {
      "addTag": "新增 #{tag}",
      "clear": "取消選取（Esc）",
      "collected": "已將 {n} 首曲目加入「{name}」 | 已將 {n} 首曲目加入「{name}」",
      "collection": "合集",
      "favorited": "已將 {n} 首曲目加入收藏 | 已將 {n} 首曲目加入收藏",
      "label": "對所選曲目的操作",
      "newCollection": "新增合集…",
      "noTags": "還沒有標籤：輸入一個並按 Enter。",
      "selectAll": "全選：{n}",
      "selectSong": "選取「{title}」及其所有版本：{n}",
      "selectTrack": "選取「{title}」",
      "selected": "已選取：{n}",
      "tag": "標籤",
      "tagPlaceholder": "新標籤，或搜尋",
      "tagged": "已為 {n} 首曲目加上 #{tag} | 已為 {n} 首曲目加上 #{tag}",
      "uncollected": "已將 {n} 首曲目從「{name}」移出 | 已將 {n} 首曲目從「{name}」移出",
      "unfavorited": "已將 {n} 首曲目移出收藏 | 已將 {n} 首曲目移出收藏",
      "untagged": "已從 {n} 首曲目移除 #{tag} | 已從 {n} 首曲目移除 #{tag}"
    },
    "emptyTag": "可在曲目的「關於」分頁為單一曲目加上此標籤，或透過選取列一次為多首曲目加上。",
    "tags": {
      "add": "新增標籤並按 Enter",
      "added": "已新增標籤 #{tag}",
      "confirmDelete": "刪除此標籤？",
      "delete": "從所有曲目移除此標籤",
      "remove": "移除標籤 #{tag}",
      "removed": "已移除標籤 #{tag}",
      "rename": "重新命名標籤"
    },
    "trash": {
      "confirmEmpty": "全部永久刪除？",
      "confirmPurge": "永久刪除？",
      "deleted": "刪除時間：{when}",
      "dismiss": "隱藏提示",
      "emptied": "資源回收筒已清空",
      "empty": "清空資源回收筒",
      "emptyHere": "資源回收筒是空的",
      "emptyHint": "已刪除的曲目會在此保留 30 天，以便你找回。",
      "loadFailed": "無法載入資源回收筒：{error}",
      "moveHint": "將曲目移入資源回收筒：30 天內可從那裡還原",
      "moved": "已將 {n} 首曲目移入資源回收筒 | 已將 {n} 首曲目移入資源回收筒",
      "note": "資源回收筒中的曲目將在 30 天後永久刪除。",
      "purge": "永久刪除",
      "purged": "已永久刪除 {n} 首曲目 | 已永久刪除 {n} 首曲目",
      "restore": "還原",
      "restored": "已還原 {n} 首曲目 | 已還原 {n} 首曲目",
      "title": "資源回收筒",
      "undo": "復原"
    }
  },
  "midiPanel": {
    "betterWithVocals": "基於完整混音處理；要得到準確的旋律，請先把曲目拆分成分軌並識別人聲。",
    "scoreEmpty": "這個 MIDI 裡沒有可用來做樂譜的音符。",
    "scoreFromFull": "來自完整混音",
    "scoreFromStems": "旋律來自人聲，伴奏來自貝斯和其餘部分",
    "scoreFromVocals": "旋律來自人聲",
    "scoreInserted": "樂譜已放入 YuE2 表單（{from}）。",
    "toScore": "轉為 YuE2 樂譜",
    "toScoreHint": "把音符轉成供 YuE2 使用的 ABC 樂譜並放入它的表單：人聲成為旋律，貝斯和其餘部分成為伴奏與和弦。"
  },
  "miniWave": {
    "percent": "{n}%",
    "timeOf": "{pos} / {total}"
  },
  "models": {
    "check": "檢查",
    "checkBad": "已損壞或缺失：{files}。請重新下載這一部分。",
    "checkFailed": "無法檢查：{error}",
    "checkOffline": "無法連接 Hugging Face，所以只比較了檔案大小。",
    "checkOkHash": "全部 {n} 個檔案完整；其中 {h} 個與 Hugging Face 列出的 SHA-256 一致。",
    "checkOkRecord": "全部 {n} 個檔案的大小都與記錄一致。",
    "checkOkSize": "全部 {n} 個檔案完整（按大小和結構檢查；沒有可供對照的校驗和列表）。",
    "checkOutdated": "檔案完整，但倉庫裡已有較新的版本：{files}。重新下載即可獲取。",
    "checkTitle": "檢查檔案是否完整",
    "checking": "正在檢查…",
    "parts": {
      "yue2-bf16": {
        "name": "YuE2 bf16",
        "text": "未量化的模型。比 q8_0 需要更多視訊記憶體（三者中最多）。"
      }
    },
    "reinstall": "重新下載",
    "reinstallAsk": "再下載 {gb} GB？",
    "reinstallNamed": "重新下載 {name}",
    "reinstallNo": "保留",
    "reinstallTitle": "重新下載並替換檔案",
    "reinstallYes": "重新下載",
    "yue2": {
      "noSettings": "q8_0、q4_0 或 bf16 精確度在 YuE2 表單裡透過“質量”為每次生成選擇。"
    }
  },
  "params": {
    "changed": "已更改",
    "consoleNote": "手動設定的值會被標出。其餘的使用預設值。",
    "consoleTitle": "{name} 控制台",
    "default": "預設：{v}",
    "quick": "快速選擇：{group}",
    "reset": "恢復預設",
    "resetOne": "把 {name} 恢復為預設值",
    "simple": {
      "more": "更多：{n}",
      "normal": "常用：{n}",
      "steps": "解碼步數",
      "stepsHint": "步數越多，耗時越長。"
    }
  },
  "player": {
    "close": "關閉播放器",
    "label": "播放器",
    "next": "下一首",
    "prev": "上一首（如果已在播放中，則回到開頭）"
  },
  "presets": {
    "button": "預設",
    "confirmDelete": "再點選一次即可刪除 {name}",
    "deleteAsk": "刪除？",
    "deleteOne": "刪除預設 {name}",
    "none": "還沒有儲存的預設。",
    "saveCurrent": "把表單儲存為預設",
    "title": "預設：儲存好的表單設定組合"
  },
  "resources": {
    "ramOf": "記憶體 {used} / {total} GB",
    "state": {
      "error": "{model} 報告了錯誤",
      "running": "{model} 正在執行",
      "starting": "{model} 正在啟動",
      "stopping": "{model} 正在停止"
    },
    "vramOf": "視訊記憶體 {used} / {total} GB",
    "holder": {
      "cover": "封面（Z-Image Turbo）"
    }
  },
  "sa3Gen": {
    "badGuidanceWindow": "引導在比起點更高的噪聲水平處就停止了：請調低“停止於”或調高“開始於”。",
    "formTabs": "表單的各個部分",
    "kindLabel": "音訊類型",
    "lengthFromRef": "時長由參考曲目決定：",
    "lengthOwn": "自定：{v}",
    "lengthSeconds": "{n} 秒",
    "manual": {
      "apg": "APG 佔比",
      "autoTags": "輔助標籤",
      "cfg": "貼合描述的程度",
      "cfgStartsAt": "引導開始的噪聲水平",
      "cfgStopsAt": "引導停止的噪聲水平",
      "chunked": "分段解碼",
      "chunkedAuto": "自動",
      "duration": "時長",
      "fromRef": "由參考曲目決定",
      "guidanceSub": "描述如何引導聲音；執行過程中噪聲水平從 1 降到 0",
      "guidanceTitle": "引導",
      "needCfg": "當“貼合描述的程度”不是 1 時",
      "needTwo": "需要兩個或更多版本",
      "negative": "要避免的內容",
      "normThreshold": "單步引導的上限",
      "off": "否",
      "on": "是",
      "padding": "時長餘量",
      "perVariant": "每個版本單獨的描述",
      "resultSub": "時長和描述",
      "resultTitle": "結果",
      "sampler": "取樣器",
      "samplerAuto": "預設 (pingpong)",
      "samplerAutoBase": "模型的預設值",
      "samplerLoud": "比平時更響並被削波：測試中有 1-2% 的聲音觸到了上限。",
      "samplerQuiet": "比平時安靜約 7 dB。",
      "samplerSub": "每一步如何計算",
      "samplerTitle": "取樣器",
      "scalePhi": "弱化引導",
      "textOnly": "僅在沒有參考曲目時",
      "trim": "裁掉開頭的靜音"
    },
    "modelsAfterStart": "引擎執行後才會顯示模型列表。",
    "queuedNote": "隊列中的版本：{n}",
    "ref": {
      "modeLabel": "對參考曲目做什麼",
      "off": "開啟後可基於現成曲目工作：重做、重繪某一段，或接著往下寫。"
    },
    "simple": {
      "tagsOff": "不新增",
      "tagsOn": "新增"
    },
    "submitKind": {
      "music": "建立音樂",
      "sfx": "建立音效"
    },
    "tabChanged": "已更改",
    "tabs": {
      "ref": "從曲目",
      "sound": "描述",
      "tuning": "調節"
    },
    "advancedHint": "seed 旁的骰子會讓它再次隨機；固定一個數字則重複那個聲音。後訓練的模型針對 8 步和貼合度 1 調校；“要避免的內容”和“引導”分組只在“貼合描述的程度”不是 1 時起作用。",
    "advancedHintBase": "這是 base 檢查點：它從 50 步和貼合度 7 開始，所以“要避免的內容”有效；可以在那裡試試 \"poor quality\"。",
    "help": {
      "tips": [
        "音樂：曲風、樂器及各自的音色、情緒和力度、以 BPM 表示的速度。",
        "音效：是什麼發出的、怎麼發生的、持續多久、麥克風在哪裡、房間聽起來如何。",
        "標籤有幫助：TrackType: Music、VocalType: Instrumental、Genre: Funk、Instruments: Guitar, Saxophone；獨奏聲部用 TrackType: Instrument；音效用 TrackType: SFX。",
        "沒有人聲：模型做的是純音樂；人聲提示最多只會得到沒有歌詞的氛圍音色。",
        "輸入 seed 可重複結果；按下骰子後，每個版本都會使用新的 seed。"
      ]
    },
    "translateBtn": "僅翻譯",
    "translateHint": "Stable Audio 只懂英文：助理可以依你的文字寫出英文提示詞，或只做翻譯。",
    "translateNoAssistant": "提示詞助理尚未就緒：請在「模型」頁面下載它的模型。",
    "translateRunning": "翻譯中…",
    "translateStopping": "正在停止…",
    "translateStop": "停止",
    "translateDone": "已翻譯成英文。",
    "translateUndo": "還原原文",
    "composeBtn": "撰寫提示詞",
    "composeTitle": "助理會把任何語言的描述改寫成 Stable Audio 的提示詞：曲風、樂器、音色、速度和長度",
    "composeRunning": "正在撰寫提示詞…",
    "composeDone": "Stable Audio 提示詞已寫好。"
  },
  "tagInput": {
    "cleared": "已清除所有標籤",
    "removeTag": "移除 {tag}",
    "removed": "已移除 {tag}",
    "restored": "標籤已恢復",
    "undo": "撤銷",
    "undoTitle": "找回被清除的標籤"
  },
  "yueGen": {
    "help": {
      "advanced": {
        "choices": [
          "質量（“歌曲”標籤頁）：草稿是 q4_0 模型，標準是 q8_0，最終是 bf16，32 個解碼步，貼合風格程度 1.2。",
          "時長（“歌曲”標籤頁）：分鐘數會轉為“不短於”和“不長於”；模型每秒聲音生成 25 個 token。",
          "演唱：更穩是“大膽度”0.85，更大膽是 1.1。",
          "重複：更少是“重複懲罰”1.3 加“重複記憶”80。",
          "樂譜：更謹慎是樂譜“大膽度” 0.55。"
        ],
        "choicesIntro": "它們設定的值與下面的修正方案相同，只需一次點選。",
        "choicesTitle": "各標籤頁中的選項",
        "title": "調節",
        "lead": "這些可以不去動：你沒改的項都使用引擎的預設值，在“手動”裡每一行都會顯示。當曲子總是出問題時才用得上：被截斷、迴圈、跑調。在下面找到你的情況，點選“應用”：合適的數值會自動填入各個字段。",
        "fixes": [
          {
            "id": "cutoff",
            "problem": "歌詞還沒唱完，曲子就斷了",
            "fix": "不長於：12000 個 token，時長上限約為 8 分鐘，而不是 6 分鐘。"
          },
          {
            "id": "offbrief",
            "problem": "聲音與標籤不符",
            "fix": "貼合風格的程度：1.2，讓模型更嚴格地遵循描述。如果還是沒用，問題出在標籤本身。"
          },
          {
            "id": "loop",
            "problem": "同一句反復迴圈",
            "fix": "重複懲罰 1.3 和重複記憶 80：對重複的懲罰更強，對它們的記憶更長。"
          },
          {
            "id": "offkey",
            "problem": "跑調、嗓音破音、雜音",
            "fix": "大膽度 0.85 和 32 個解碼步：膽子小一點，算繪音訊的遍數多一點。"
          },
          {
            "id": "melody",
            "problem": "旋律不連貫",
            "fix": "如果規劃是關閉的，就切換為“旋律和和弦”（你已選的規劃保持不變），並把“樂譜”設為“更謹慎”（樂譜大膽度 0.55），讓樂譜寫得更小心。或者在“旋律”標籤頁從一首歌裡取旋律：給定的樂譜會取代規劃，此時只有規劃的選擇才有意義。"
          },
          {
            "id": "same",
            "problem": "所有版本聽起來都一樣",
            "fix": "開啟隨機 seed。如果還不夠，把大膽度設為 1.1。"
          },
          {
            "id": "final",
            "problem": "我想要最終算繪",
            "fix": "質量：最終，bf16 模型（已下載時），32 步，貼合風格程度 1.2。生成 2–3 個版本，留下最好的。"
          }
        ],
        "fieldsIntro": "每個字段下方有一條典型值的刻度：上方的標記是音訊的預設值，下方的標記是樂譜的預設值（僅在有旋律規劃且沒有給定樂譜時）。樂譜需要嚴謹，音訊需要生氣，所以預設值不同。",
        "groups": [
          {
            "title": "準確度與質量",
            "fields": [
              {
                "key": "cfg_scale",
                "name": "貼合風格的程度 (CFG)",
                "text": "模型有多聽話地遵循風格標籤。就像你的聲音在樂手耳中的音量：小聲一點——他們演奏得更自由，大聲一點——更貼合要求，但更僵硬。",
                "left": "更自由",
                "right": "更嚴格貼合標籤",
                "when": "聲音幾乎不符合描述時用 1.2。高於 1.5——會出現瑕疵和“塑膠感”的聲音。"
              },
              {
                "key": "num_inference_steps",
                "name": "解碼步數",
                "text": "模型把規劃變成成品音訊要走多少遍。就像刷漆的層數：8 是快速的草稿，32 是乾淨的最後一層。",
                "left": "更快",
                "right": "更乾淨",
                "when": "草稿用 8，成品用 32。差別幾乎聽不出來（RTX 4080 上每首曲子約 4 秒）；超過 32 只會改變聲音，不會更好。"
              }
            ]
          },
          {
            "title": "演繹的性格",
            "fields": [
              {
                "key": "temperature",
                "name": "大膽度 (temperature)",
                "text": "模型的大膽程度（至少 0.01：零會讓引擎停止）。低——“照本宣科”，平穩可預料；高——即興發揮，有時精彩，有時跑調。",
                "left": "更穩",
                "right": "更大膽",
                "when": "跑調：0.85。所有版本都一樣：1.1。樂譜怪怪的：樂譜用 0.5–0.6。"
              },
              {
                "key": "repetition_penalty",
                "name": "重複懲罰",
                "text": "對重複已經演奏過的內容的懲罰。越高，模型越用力避免“卡帶”。對樂譜來說它接近 1.0——樂譜記法裡重複是正常的。",
                "left": "允許重複",
                "right": "不重複",
                "when": "迴圈：1.3。低於 1.1 有出現單調迴圈的風險。"
              }
            ]
          },
          {
            "title": "曲目時長",
            "fields": [
              {
                "key": "min_tokens",
                "name": "不短於",
                "text": "模型在此之前不能結束。大約每秒 25 個單位：200 ≈ 8 秒音訊。",
                "left": "可以很短",
                "right": "不早於",
                "when": "曲子在唱完之前就結束了：調高它。"
              },
              {
                "key": "max_tokens",
                "name": "不長於",
                "text": "時長上限。9000 ≈ 6 分鐘的歌；表單最多接受 15000。更多——等待更久，佔用更多 GPU 記憶體。",
                "left": "更短",
                "right": "更長",
                "when": "在句子中間被截斷：12000。"
              }
            ]
          }
        ],
        "rareIntro": "它們改變的東西與“大膽度”或“重複懲罰”相同，只是更精細。通常不去動它們。",
        "rare": [
          {
            "key": "top_p",
            "name": "冷門選擇截斷 (top-p)",
            "text": "模型在每一步考慮多少個“合理”的選項：1——全部，0.5——只考慮最明顯的。"
          },
          {
            "key": "top_k",
            "name": "候選數 (top-k)",
            "text": "每次選擇中選項數量的硬性上限。與冷門選擇截斷並用的第二道過濾。"
          },
          {
            "key": "penalty_window",
            "name": "重複記憶",
            "text": "模型計算重複懲罰時，記得多久之前演奏過的內容。50 ≈ 2 秒音訊。出現迴圈時調到 80。"
          }
        ]
      },
      "melody": {
        "lead": "YuE2 可以按你給的旋律來演唱歌詞。ABC 樂譜用來儲存旋律：用文字寫成的音符。用應用程式產生的格式的樂譜，出來的歌曲調相同、演唱的音符相同、時長也相同：在我們的測試中，音符吻合度為 93–99 %。",
        "roll": [
          "“試聽”會用鋼琴彈奏樂譜。在捲簾上點選或拖動可選擇起點，⏮ 回到開頭。",
          "粉色音符是人聲（Vocal），藍色是伴奏（Ins）。小節號和和弦顯示在頂部。",
          "Ctrl + 滑鼠滾輪可縮放，⤢ 開啟帶三個八度琴鍵的大窗口。",
          "“五線譜”以五線譜形式顯示同一份樂譜；點選音符即可播放。"
        ],
        "rollTitle": "捲簾與音符",
        "sources": [
          "從歌曲… — 選擇一個音訊檔案，SheetSage2 會寫出它的旋律和和弦。人聲清晰的歌曲效果最好。",
          "匯入 MIDI — 最高的聲部成為旋律，其他通道成為伴奏和和弦，調會自動識別。請把人聲旋律單獨放在一條軌道上。",
          "鋼琴 — 選一個時長並按鍵（下方、捲簾左側，或用 MIDI 鍵盤）：音符會依次寫入。",
          "從曲目：在版本的菜單裡選“轉為 MIDI”，或用曲庫裡的“分軌與音符”標籤頁，再選“轉為 YuE2 樂譜”。人聲成為旋律，貝斯和其餘部分成為伴奏。"
        ],
        "sourcesTitle": "旋律從哪裡來",
        "tips": [
          "一個音節對一個音符：8 個音節的一行大約需要 8 個音符。",
          "歌曲有多長，取決於音符：100 BPM 下 8 小節 4/4 拍約 20 秒。",
          "跟隨旋律：模型保留你的旋律並自己編伴奏；旋律和和弦：模型根據樂譜同時生成兩者。",
          "風格裡寫的調或速度不起作用：它們取自音符。",
          "只有熟悉格式時才手動編輯 ABC 文字：模型最擅長讀應用程式產生的版式（Vocal 和 Ins 聲部）。"
        ],
        "tipsTitle": "想要貼近原曲",
        "title": "旋律與 ABC 樂譜"
      },
      "style": {
        "tips": [
          "最合適的是 5–8 個標籤——更多會開始衝突，更少則結果更難預料。",
          "標籤用英文寫，但先寫歌曲的語言（Russian、English、Spanish…）：引擎自己的示例都是這樣，創意流程也會替你加上。",
          "有旋律規劃（跟隨旋律或旋律和和弦）時，風格依然重要：它決定音色和編曲，而旋律來自 ABC 樂譜。"
        ]
      },
      "lyrics": {
        "tips": [
          "有旋律規劃時，歌詞每行的節奏應大致與 ABC 樂譜（每小節的音節數）相符；否則模型就得拉長或壓縮字詞來適應旋律。",
          "短句比長句更容易貼合旋律。",
          "每個 [Chorus] 裡的副歌都一字不差地重複——這能讓它在整首曲子裡保持同一條旋律線。"
        ]
      },
      "cot": {
        "title": "旋律規劃",
        "intro": "旋律規劃決定模型是否在生成音訊之前先寫一份音樂規劃，以及如何使用“旋律”標籤頁裡的 ABC 樂譜。",
        "melodyNote": "把旋律以 ABC 樂譜的形式放在規劃下面：從歌曲…（SheetSage2）、MIDI 檔案或鋼琴。沒有樂譜時，模型會寫出它自己的、只有旋律的規劃。",
        "precisionNote": "模型精確度（q8_0、q4_0、bf16）與規劃無關：由“歌曲”標籤頁的“質量”決定。無論哪種規劃，q4_0 都能以少量音質為代價節省視訊記憶體。",
        "abcFooter": "最省事的做法不是從頭寫 ABC，而是用“從歌曲…”(SheetSage2) 從一首歌裡取得，再手動修改你需要的小節。"
      }
    },
    "length": {
      "auto": "自動",
      "autoHint": "取決於歌詞有多長，最多約 6 分鐘。",
      "hint": "約 {n} 分鐘：較短的歌詞會唱完並繼續演奏到該時長，較長的歌詞會在此處被截斷。",
      "label": "時長",
      "minutes": "{n} 分鐘",
      "ownHint": "在“調節”中手動設定（最少 / 最多 token）。"
    },
    "lines": "行數：{n}",
    "linesAbout": "行數：{n}，約 {time}",
    "linesAboutHint": "根據你之前的歌曲估算：每行約 {s} 秒。用於“自動”時長。",
    "manual": {
      "abcGiven": "來自“旋律”標籤頁的樂譜",
      "changed": "已更改 {n} / {total}",
      "console": "控制台：一次顯示所有分組",
      "consoleTitle": "YuE2 控制台",
      "done": "完成",
      "groups": {
        "character": {
          "sub": "人聲與音樂",
          "title": "性格"
        },
        "length": {
          "sub": "每秒 25 個 token",
          "title": "時長"
        },
        "repeats": {
          "sub": "防止迴圈",
          "title": "重複"
        },
        "score": {
          "sub": "模型如何編寫旋律規劃",
          "title": "樂譜"
        },
        "sound": {
          "sub": "模型與解碼",
          "title": "音質"
        }
      },
      "manual": "手動",
      "params": {
        "cfg": "貼合風格的程度",
        "max_tokens": "不長於",
        "min_tokens": "不短於",
        "penalty_window": "重複記憶",
        "precision": "模型精確度",
        "repetition_penalty": "重複懲罰",
        "steps": "解碼步數",
        "temperature": "大膽度",
        "top_k": "候選數",
        "top_p": "冷門選擇截斷"
      },
      "reset": "重置",
      "resetAll": "全部重置",
      "seconds": "{n} 秒",
      "seedRandom": "隨機",
      "sends": "發送給引擎",
      "sendsRest": "手動設定的值會被標出。這一行裡沒有的項都使用引擎預設值。",
      "simple": "簡單"
    },
    "perf": {
      "manualNow": "（目前為手動設定）",
      "repeats": {
        "hint": "更少：當同一句反復迴圈時選它。",
        "label": "重複",
        "options": {
          "fewer": "更少",
          "normal": "標準"
        }
      },
      "score": {
        "hint": "更謹慎：當旋律東拉西扯時選它，模型會更小心地寫樂譜。",
        "label": "樂譜",
        "options": {
          "careful": "更謹慎",
          "normal": "標準"
        }
      },
      "temperature": {
        "hint": "更穩：跑調和嗓音破音更少。更大膽：各版本之間差別更大。",
        "label": "演唱",
        "options": {
          "normal": "標準",
          "steady": "更穩",
          "varied": "更大膽"
        }
      }
    },
    "planLabel": "旋律規劃",
    "planNames": {
      "full": "旋律和和弦",
      "melody": "跟隨旋律",
      "off": "無規劃"
    },
    "qualityHints": {
      "draft": "{model} 模型佔用視訊記憶體更少，聲音略顯樸素：適合試想法。",
      "final": "{model} 模型，32 個解碼步，更貼合風格標籤（CFG 1.2）：適合成品。生成 2–3 個版本，留下最好的。bf16 比 q8_0 需要更多視訊記憶體（檔案 7.3 GB，對比 4.3 GB）。",
      "normal": "{model} 模型，常規設定：音質好，也不用久等。",
      "own": "精確度、步數和 CFG 手動設定。"
    },
    "qualityLabel": "質量",
    "qualityNames": {
      "draft": "草稿",
      "final": "最終",
      "normal": "標準",
      "own": "自定義"
    },
    "queued": "已在隊列中，版本數：{n}",
    "scoreGivenNote": "給定的樂譜會取代規劃，所以樂譜取樣不起作用，也不會發送。",
    "sections": {
      "bridge": "+ Bridge",
      "chorus": "+ Chorus",
      "outro": "+ Outro",
      "verse": "+ Verse"
    },
    "tabs": {
      "changed": "與預設值不同",
      "melody": "旋律",
      "song": "歌曲",
      "tuning": "調節"
    },
    "takes": "版本數",
    "tuningTitle": "性能設定"
  },
  "acePage": {
    "openTrainingPage": "開啟 LoRA 訓練"
  },
  "library": {
    "noTracks": "曲庫裡還沒有曲目。請在上方上傳檔案，或在“建立”中生成曲目。"
  },
  "notInstalled": {
    "stableAudio": {
      "text": "Stable Audio 3 能做出純音樂和音效，並驅動編輯器的重繪、續寫和翻唱。安裝時它被略過了。安裝之後，請在“模型與設定”裡，或直接在 Stable Audio 的表單裡下載模型。"
    }
  },
  "idea": {
    "guide": {
      "lead": "輸入一句話，得到一首曲子，就在首頁。你用自己的話描述一首歌、一段純音樂或一個音效，本地語言模型按所選引擎的格式寫出提示詞，你可以按需修改，然後由引擎生成曲目。",
      "steps": [
        {
          "title": "描述創意",
          "text": "一兩句話：歌講什麼、情緒、誰來唱、在哪裡什麼時候。純音樂則寫曲風、樂器和情緒。"
        },
        {
          "title": "選類型和引擎",
          "text": "帶人聲的歌曲、純音樂或音效，再選 ACE-Step、YuE2 或 Stable Audio 3。做不了這種類型的引擎無法選擇；音效始終交給 Stable Audio。"
        },
        {
          "title": "創作",
          "text": "點選“創作”：助手會在這句話的正下方寫出提示詞，並隨著文字增長顯示階段、百分比和內容。你可以中途停止。音效會跳過這一步：“創作”會帶著這句話開啟 Stable Audio 的表單。"
        },
        {
          "title": "修改提示詞",
          "text": "標籤、歌詞、速度、調和時長都可以直接在字段裡修改。"
        },
        {
          "title": "生成",
          "text": "“生成”會把各版本放入引擎的隊列，輪到它們時隊列會啟動引擎，並開啟“建立”：各版本會出現在會話列表裡，以這個創意命名。"
        }
      ],
      "writer": [
        "提示詞助手是一個本地語言模型，Qwen3.5。它緊扣創意，並用創意的語言或你選的語言寫歌詞。它的模型在“模型”頁面下載。",
        "對於 ACE-Step，引擎執行時，ACE-Step 自己的語言模型也可以寫提示詞。它更快，通常 5–20 秒，但更容易偏離創意。",
        "歌詞語言預設取自創意的文字；你可以在“更多”裡選擇，由誰來寫提示詞也在那裡。在“建立”頁面，它位於創意欄的“設定”下。"
      ],
      "after": [
        "再來一個版本會用同一個創意重新寫提示詞。",
        "“在表單中開啟”會把提示詞連同所有設定放入“建立”頁面上引擎的表單。",
        "離開頁面或重新整理後，創意和提示詞仍會保留。“生成”之後它們會被清空，為下一個創意讓位；“重置”可以手動清空。",
        "在“建立”頁面，同樣的創意欄位於表單上方：“寫”會把歌詞和風格直接填入表單（Stable Audio 則是“描述”），“恢復原來的內容”會還原表單。"
      ],
      "tips": [
        "具體比籠統好：“一列夜裡駛出小鎮的火車”比“一首悲傷的歌”給出的資訊更多。",
        "想要特定的曲風、嗓音或樂器？在創意裡寫出來。",
        "生成前先讀讀歌詞：小模型不一定總能把押韻和節奏做對。",
        "不是你想要的聲音？對同一個創意換一個引擎試試：提示詞會按它的格式重寫。",
        "雨聲、一次撞擊、腳步聲是音效，不是音樂：選“音效”，這句話會直接進入 Stable Audio 的表單。選擇“純音樂”和 Stable Audio 3 時，助手會自己判斷是否需要音效；ACE-Step 則會用這樣的創意生成一首曲子。"
      ]
    }
  },
  "sa3Weights": {
    "allOnModels": "所有模型、base 檢查點和設定都在“模型”頁面"
  },
  "autoTitle": {
    "accept": "採用",
    "another": "換一個",
    "bulk": "建議標題",
    "bulkDone": "已為 {n} 首曲目命名 | 已為 {n} 首曲目命名",
    "bulkFailed": "已命名 {n} 首，隨後中斷：{error} | 已命名 {n} 首，隨後中斷：{error}",
    "bulkHint": "助手會依序為所選曲目命名；按「撤銷」可恢復原標題。",
    "bulkStopped": "已停止：已命名 {n}/{total} 首",
    "bulkUndone": "已恢復原標題 | 已恢復原標題：{n} 首",
    "cancel": "取消",
    "failed": "想不出標題：{error}",
    "noAssistant": "提示詞助手尚未就緒：請在「模型」中下載它的模型。",
    "progress": "正在命名 {done}/{total}",
    "stop": "停止",
    "suggest": "建議標題",
    "working": "正在想標題…"
  },
  "covers": {
    "alt": "{title} 的封面",
    "another": "換一張封面",
    "bulk": "製作封面",
    "bulkDone": "已製作 {n} 張封面 | 已製作 {n} 張封面",
    "bulkFailed": "{n} 張未成功",
    "bulkHint": "為每首所選曲目依序製作一張封面；已有封面的曲目會得到新的封面。",
    "bulkProgress": "封面：{done}/{total}",
    "cancel": "取消",
    "describe": "畫面內容",
    "describeHint": "用幾個詞描述一個場景；英文效果最好。畫面中的文字會自動避免。",
    "dismiss": "關閉",
    "edit": "編輯描述…",
    "enable": "為曲目製作專輯封面",
    "enableHint": "為資料庫、播放器和工作階段中的每首歌加上一張圖片。關閉後：任何地方都不會出現封面和封面按鈕。",
    "engine": "封面（Z-Image Turbo）",
    "failed": "封面未成功：{error}",
    "fromAssistant": "來自助手對這首曲目的構想。",
    "installed": "已安裝",
    "loadingPrompt": "正在讀取描述…",
    "make": "製作封面",
    "making": "正在製作封面…",
    "makingPct": "正在製作封面… {pct}%",
    "model": "模型：Z-Image Turbo，{gb} GB",
    "notInstalled": "未安裝",
    "notInstalledHint": "這台電腦上沒有封面模型。請用安裝程式（「封面」部分）或安裝指令碼進行安裝。",
    "onButton": "只有在你按下按鈕時才會製作封面：在資料庫中曲目的詳細資料裡，或針對所選曲目。每張需要 5 到 10 秒；這段時間 GPU 會切換到封面模型，下一首歌再重新載入它的引擎。",
    "parts": {
      "main": "Z-Image Turbo 權重",
      "server": "影像伺服器（stable-diffusion.cpp）"
    },
    "queued": "正在佇列中等待…",
    "remove": "移除封面",
    "removeConfirm": "是，移除",
    "stop": "停止",
    "title": "封面",
    "draw": "繪製",
    "withAssistant": "用助理產生",
    "withAssistantHint": "提示詞助理會根據你的文字（任何語言）寫出描述；輸入框為空時則根據歌曲來寫。繪製前可以修改。",
    "putBack": "還原原文",
    "anyLanguageHint": "可以用任何語言書寫：助理會把它變成圖像模型能理解的描述。",
    "fromSaved": "上一張封面所用的描述。",
    "noAssistant": "提示詞助理尚未就緒：請在「模型」中下載它的模型。",
    "describing": "正在描述畫面…",
    "describingPct": "正在描述畫面… {pct}%",
    "describeFailed": "助理無法描述畫面：{error}",
    "bulkDescribing": "正在描述 {done}/{total}",
    "starting": "正在啟動影像模型…"
  },
  "takeCompare": {
    "best": "★ 最佳",
    "failed": "無法載入",
    "keep": "保留最佳版本，其餘移到資源回收筒",
    "keepConfirm": "將 {n} 個版本移到資源回收筒？ | 將 {n} 個版本移到資源回收筒？",
    "keepNeedStar": "為最佳版本加上星號即可保留它。",
    "keepTooMany": "只為一個版本加星號：要保留的那個。",
    "keepWill": "保留 {take}；另一個移到資源回收筒。 | 保留 {take}；其餘 {n} 個移到資源回收筒。",
    "kept": "已保留 {take}；{n} 個版本已移到資源回收筒。 | 已保留 {take}；{n} 個版本已移到資源回收筒。",
    "keys": "1–4 選擇版本 · 空白鍵 播放/暫停 · ←/→ 5 秒 · Esc 關閉",
    "loading": "正在載入…",
    "loadingAll": "正在載入各版本…",
    "newestOf": "共 {total} 個版本中最新的 {shown} 個",
    "nowHearing": "正在播放：{take}",
    "open": "比較",
    "openTitle": "比較這首歌的各個版本，A/B",
    "position": "{at}/{total}",
    "restored": "已恢復 {n} 個版本 | 已恢復 {n} 個版本",
    "seed": "種子 {seed}",
    "seek": "位置",
    "takes": "版本",
    "tileLabel": "{letter}，版本 {n}",
    "title": "比較版本"
  }
}
