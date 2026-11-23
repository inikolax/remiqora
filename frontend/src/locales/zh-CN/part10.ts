// Strings added after the first translation (machine-translated from en, 743 keys);
// merged into the other parts key by key (see ../mergeParts).
export default {
  "aceGen": {
    "addLora": "添加 LoRA",
    "cfgIntervalOrder": "引导“起点”必须小于“终点”。",
    "lengthAskedNote": "时长会作为期望值交给模型。再次点击已选项，则交由模型决定。",
    "lengthByModelNote": "根据描述生成时，模型会自己决定时长。在这里选一个即可指定。",
    "loraName": "LoRA 名称",
    "loraPath": "LoRA 适配器文件夹",
    "manual": {
      "adg": "自适应引导 (ADG)",
      "balancedOnly": "仅限“平衡”模式",
      "baseOnly": "仅限 base 和 SFT 模型",
      "bpm": "速度",
      "cfgEnd": "引导终点（占进度的比例）",
      "cfgStart": "引导起点（占进度的比例）",
      "cotCaption": "扩写描述",
      "cotCaptionHint": "开启后，语言模型可能会在生成音乐前改写你的风格文字。",
      "cotLanguage": "检测语言",
      "cotLanguagePicked": "关闭：保留你选择的语言",
      "coverNoise": "与原曲混合的噪声",
      "coverRepaintOnly": "用于翻唱或重绘",
      "infer": "解码方式",
      "latentCrossfade": "模型内部的衔接",
      "length": "时长",
      "lmCfg": "贴合提示的程度",
      "lmNegative": "要避免的内容",
      "lmSub": "编写歌曲规划并补全缺失的内容",
      "lmTitle": "语言模型",
      "loraScale": "LoRA 强度",
      "metaByModel": "由模型根据描述决定",
      "musicSub": "事先已知的歌曲信息",
      "musicTitle": "音乐",
      "myLoras": "我的 LoRA：{n}",
      "needRef": "需要参考曲目",
      "noLm": "ACE-Step 在这块 GPU 上不加载它",
      "noLmWithRef": "使用参考曲目时不启用",
      "ode": "ODE：结果完全可重复",
      "off": "关",
      "pickLora": "请先选择 LoRA",
      "refSub": "翻唱与重绘",
      "refTitle": "参考曲目",
      "repaintMode": "重绘模式",
      "repaintModes": {
        "aggressive": "大胆",
        "balanced": "平衡",
        "conservative": "谨慎"
      },
      "repaintOnly": "用于重绘某一段",
      "repaintStrength": "重绘强度",
      "resultSub": "如何输出",
      "sde": "SDE：带随机性",
      "sdeBaseWarn": "在 base 模型上，SDE 在测试中（32 步）生成的是噪声而非音乐。在 Turbo 上可用，声音偏暗。",
      "shift": "调度偏移",
      "thinking": "先做规划（思考）",
      "tiled": "分块解码",
      "turboSteps": "Turbo 支持 1 到 8 步：超出的会被截为 8",
      "wavCrossfade": "音频中的衔接"
    },
    "modeDescribe": "根据描述",
    "modeLabel": "从什么开始",
    "modeOwn": "自己的歌词和风格",
    "modelNote": "Turbo 用 8 步。其他模型耗时更长；并非所有模型都支持抽出或添加声部，模型做不了的任务会在“从曲目”标签页中变灰。",
    "noLmBaseNote": "Base 和 SFT 依靠该模型获得干净的人声：在这种模式下，声音可能嘈杂、发远。需要人声时，请切换到“自己的歌词和风格”并写好歌词，或选择 Turbo。",
    "noLmNote": "在这块显卡（8 GB 或更少）上，ACE-Step 不加载它的语言模型，因此你的描述会作为普通风格提示交给模型，不会生成歌词。",
    "noVocal": "无人声",
    "noVocalHint": "纯音乐：不需要歌词，音乐由下方的风格决定。",
    "queuedStatus": "已在队列中，版本数：{n}",
    "refFile": "参考音频文件",
    "refOff": "开启后可基于现成曲目工作：翻唱、重做某一段、抽出或添加一个声部。",
    "removeLoraConfirm": "移除？",
    "removeLoraNamed": "移除 LoRA {name}",
    "repaintOrder": "范围的终点必须在起点之后。",
    "simple": {
      "auto": "自动",
      "fast": "快 {n}",
      "formatHint": "mp3 占用空间更小；wav 和 flac 为无损音质。",
      "key": "调式",
      "keyHint": "大调听起来更明亮，小调更暗、更忧伤。主音和其他音阶可在“手动”中选择。",
      "keyWish": "根据描述生成时，模型会自己选调。在这里选的调式会作为期望值交给它。",
      "lengthHint": "曲目的时长。",
      "lengthWish": "根据描述生成时，模型会自己决定时长。在这里选的会作为期望值交给它，不保证一定如此。",
      "major": "大调",
      "medium": "中速 {n}",
      "minor": "小调",
      "slow": "慢 {n}",
      "tempo": "速度",
      "tempoHint": "每分钟节拍数。“自动”交由模型决定；精确数值在“手动”中设置。",
      "tempoWish": "根据描述生成时，模型会自己决定速度。在这里选的会作为期望值交给它。"
    },
    "tabChanged": "已更改",
    "tabs": {
      "ref": "从曲目",
      "song": "歌曲",
      "tuning": "调节"
    },
    "taskType": "对曲目做什么",
    "taskUnsupported": "此模型不支持",
    "help": {
      "style": {
        "tips": [
          "最合适的是 5–9 个标签：太少，模型会自己补空白，结果更难预料；太多，标签之间就会互相冲突。",
          "把曲风和情绪放在最前面——它们对整首曲子的整体性格影响比其他标签更大。",
          "不要在同一类别里混用相互矛盾的标签（比如同时写“激进”和“梦幻”）——模型要么忽略其中一个，要么结果会变得混乱。",
          "标签最好用英文写——训练数据以英文为主，所以更准确，即使歌词是俄语的也一样。",
          "在“调节”中设置的速度（“简单”里选，或在“手动”里填精确数值）比风格里写的“120 bpm”这类文字标签更可靠：速度重要时就用它。"
        ]
      },
      "lyrics": {
        "tips": [
          "与曲目时长匹配：2 分钟左右通常够放 2 段主歌加 2 段副歌；3 分钟以上就加一段桥段和第二个 hook——歌词对短时长来说太长，会被模型“硬塞”进去。",
          "短句（5–10 个音节）比长句更容易贴合旋律——如果一行太长，就拆成两行。",
          "重复的副歌（每个 [Chorus] 里的文字一字不差）有助于模型在整首曲子里为它保持同一段旋律。",
          "完全是纯音乐时，请勾选“无人声”，而不是写一份只有 [Interlude] 的歌词：这样更可靠。",
          "标点（逗号、省略号）会影响人声的断句和停顿——请有意识地使用，而不只是按拼写规则。"
        ]
      },
      "remix": {
        "unavailable": "可用的场景取决于所选的模型——表单里不支持的选项会变灰。如果需要某个特定场景，可以换一个模型（在“歌曲”标签页或“调节”中）。请上传模型能提取音频的格式的参考文件（wav/mp3/flac）——很长的文件（几分钟）会明显增加处理时间。"
      },
      "advanced": {
        "title": "调节",
        "rows": [
          {
            "param": "简单和手动",
            "what": "“简单”只有几个朴素的选项：解码步数（Turbo 上没有）、时长、速度（慢 80、中速 110、快 140）、调式（大调或小调）和格式。“手动”按分组列出所有参数，控制台一次显示全部。"
          },
          {
            "param": "格式",
            "what": "输出文件的格式。mp3 更小，听歌足够；wav 和 flac 是无损的，但体积大 5–10 倍。"
          },
          {
            "param": "速度、调、拍号",
            "what": "明确的音乐参数。留在自动时，模型会从风格文字中取得；只有需要精确时才手动设置（比如要和其他曲目混音）。拍号为 2/4、3/4、4/4 或 6/8。根据描述生成时，模型会自己选择：在这里设的速度或调会作为期望值交给它，拍号则由它决定。"
          },
          {
            "param": "人声语言",
            "what": "人声演唱所用的语言。自动时取自歌词，歌词很短或有歧义时可能判断错：如果人声的语言不对，就手动设置。手动选择的语言会被保留，语言模型不会替换它。"
          },
          {
            "param": "解码步数",
            "what": "扩散的步数。更多可能让音频更干净，但生成更慢；超过某个点后，提升几乎听不出来。Turbo 支持 1 到 8（默认 8），SFT 模型 50，base 模型 32。在“简单”里，“更多”是常用步数的两倍。"
          },
          {
            "param": "贴合风格的程度",
            "what": "引导强度：模型有多严格地遵循你的描述。越高，越精确地遵循风格标签，但过高的值会让声音刺耳、伪影增多；越低越自然，但更难预料。Turbo 不使用它。默认值为 7，合理范围通常是 3 到 12。"
          },
          {
            "param": "Seed",
            "what": "在表单下方，“创建”旁边。按下骰子后，每个版本都会使用新的随机 seed。固定一个数字、其他设置不变时，结果几乎会重现：适合改动一个风格标签再对比。"
          },
          {
            "param": "模型",
            "what": "Turbo 更快，但音质略有牺牲，并且不是“从曲目”标签页里的所有任务都能做；base 和 SFT 更慢，但更精确、更灵活。模型在“歌曲”标签页或“手动”中选择。"
          },
          {
            "param": "LoRA",
            "what": "叠加在模型之上的微调附加模块，比如用于某种特定的人声音色或子流派。它的强度（0 到 1）决定对结果的影响程度：1 是适配器作者想要的完整效果，更低则融入得更柔和。适配器在“手动”的“我的 LoRA”里通过名称和文件夹添加。"
          }
        ],
        "footer": "你没动的项都使用引擎的默认值：不必全部设置也能得到好结果。“重置”会恢复调节自己的各项，而不改动模型和时长。"
      }
    }
  },
  "aiPart": {
    "guide": {
      "scratch": [
        {
          "title": "速度、调、时长",
          "text": "在空项目中，在面板里设置 BPM、“调”以及以秒为单位的时长。120 BPM 下 64 小节是 128 秒。"
        },
        {
          "title": "先从鼓开始",
          "text": "“添加声部”，乐器选“鼓”。其他声部的节奏以鼓为准，所以鼓放在最前面。"
        },
        {
          "title": "先贝斯，再和声",
          "text": "先贝斯，再和弦：键盘、pad。在模型能听到的轨道列表中保持勾选鼓。"
        },
        {
          "title": "旋律与色彩",
          "text": "主音、弦乐、打击乐。五到七个声部就够了；再多，混音会变得拥挤。"
        },
        {
          "title": "挑选并调好音量",
          "text": "每个声部留下最好的版本，并立刻把它调到合适的音量。"
        },
        {
          "title": "搭出整首歌",
          "text": "打开“磁吸”和小节标尺，用刀具切开声部，用橡皮擦删掉片段：前奏、主体、没有鼓和贝斯的间奏、尾声。"
        }
      ],
      "scratchIntro": "编曲助手可以从空项目开始做一首曲子。声部一个一个添加，后面的每一个都会听到已有的声部，所以顺序很重要。",
      "scratchTitle": "从零开始做一首曲子",
      "steps": [
        {
          "title": "启动引擎",
          "text": "编曲助手运行在 ACE-Step 上；重绘、续写和翻唱也可以用 Stable Audio 3 运行。如果引擎已停止，面板会提供一个按钮来启动它，此时 GPU 上的引擎会停止。"
        },
        {
          "title": "设置速度和调",
          "text": "在添加第一个声部之前，设置项目的 BPM 和“调”：主音和音阶。模型每次请求都会拿到它们。添加了前几个声部之后不要再改速度：它们会偏离网格。"
        },
        {
          "title": "选择模式",
          "text": "“添加声部”、“重绘”、“续写”或“翻唱”。开关旁边的提示用一句话说明模型会做什么。"
        },
        {
          "title": "描述你需要的",
          "text": "新声部要选乐器。描述里写出声音和演奏方式。可以用你自己的语言写：“转成英文”会把它改写成模型最容易读懂的形式。字段旁的“?”会打开词汇和现成的示例。"
        },
        {
          "title": "勾选模型能听到的",
          "text": "模型会配合勾选的轨道。请保持勾选鼓：模型会跟随它们的网格。"
        },
        {
          "title": "指定位置",
          "text": "整首曲子或循环区域：打开“循环”，并在标尺上拖出区域。“重绘”只作用于循环区域。"
        },
        {
          "title": "生成并选择",
          "text": "各版本会落在新的轨道上。“试听”切换到某个版本，“保留”会移除其他版本。"
        }
      ],
      "tips": [
        "描述用英文效果最好，写成逗号分隔的短语。用你自己的语言写，再点“转成英文”；读一读结果，需要时修改。",
        "描述一个声部，而不是整首曲子：乐器演奏什么、听起来怎样。",
        "分步搭建曲子：鼓，然后贝斯，然后和声，然后旋律。后面的每个声部都会听到前面的。",
        "对某个版本不满意？再生成一次：每次运行都使用新的随机 seed。",
        "每添加一个新声部，先调好它的音量，再添加下一个：下一个声部听到的是当前的混音。",
        "声部都做好后，用它们搭出整首歌：用刀具 (C) 按小节切开轨道，用橡皮擦 (E) 删掉片段，让乐器一个接一个进来。",
        "做人声时，输入歌词并检查“人声语言”：设为“自动”时是根据字母判断的。",
        "ACE-Step 会把每个结果的电平调到 -1 dBFS，所以新声部进来时会很响：用轨道音量滑块把它调低。",
        "要在其他 DAW 里完成曲子，请导出“分轨 + Reaper”或 DAWproject。",
        "重绘、续写和翻唱也可以用 Stable Audio 3 运行：在面板里把它选为引擎。它通过聆听范围周围的音频来补全和续写，只需几秒，仅限纯音乐。添加声部仍由 ACE-Step 负责。"
      ]
    },
    "toEnglish": "转成英文",
    "toEnglishBusy": "正在写…",
    "toEnglishDone": "已由助手改写成英文；需要的话可以再改。",
    "toEnglishFailed": "助手没能写出描述。",
    "toEnglishGpu": "提示词助手被设为在 GPU 上运行，这会卸载当前模型。请在“模型”页面把它改为“自动”或 CPU。",
    "toEnglishTitle": "用任何语言描述都行：提示词助手会把它改写成英文，这是模型最容易读懂的形式",
    "toEnglishUndo": "撤销"
  },
  "create": {
    "closeTool": "关闭",
    "deleteAsk": "删除？",
    "details": "详情",
    "download": "下载",
    "emptyAll": "你的歌曲会显示在这里",
    "emptyHint": "选择引擎，填写表单，或在上方的创意栏里写一句话，然后点“创建”。",
    "emptyPeriod": "这段时间内没有生成任何内容",
    "engine": "引擎",
    "engineTitle": "{name}：{status}",
    "engines": {
      "ace_step": "快速，可翻唱",
      "stable_audio": "音效与循环",
      "yue2": "带人声的歌曲"
    },
    "failed": "没有成功。请载入表单后再次点“创建”。",
    "idea": {
      "chip": {
        "description": "描述",
        "length": "时长",
        "lyrics": "歌词",
        "style": "风格",
        "tempo": "速度和调"
      },
      "describe": "描述",
      "dismiss": "忽略",
      "formChanged": "表单已更改。",
      "noAssistant": "提示词助手尚未就绪：请在“模型与设置”（顶部的齿轮）中下载它的模型。",
      "noAssistantLink": "到“模型”中下载",
      "noAssistantNote": "提示词助手需要它的模型。",
      "placeholder": {
        "ace_step": "用一句话说说：你想要什么音乐",
        "stable_audio": "用一句话说说：想听到什么声音",
        "yue2": "用一句话说说：这首歌讲什么"
      },
      "replaces": "会替换表单中现有的内容",
      "settings": "设置",
      "stop": "停止",
      "stopping": "正在停止…",
      "undo": "恢复原来的内容",
      "write": "写歌词和风格",
      "writeSa": "写描述",
      "writeShort": "写",
      "writing": "助手正在写…",
      "written": "已填入下方表单。",
      "writtenOther": "已填入 {name} 表单。",
      "saKind": "写什么",
      "saKinds": {
        "auto": "自动：根据想法",
        "music": "音乐曲目",
        "instrument": "独奏乐器",
        "one_shot": "单次采样",
        "sfx": "音效"
      }
    },
    "lessDetails": "收起",
    "live": {
      "failed": "版本失败：{name}。{reason}",
      "queue": "队列中的版本：{n}",
      "ready": "版本已完成：{name}",
      "readyMany": "已完成的版本：{n}，{name}"
    },
    "loading": "正在加载曲目…",
    "making": "生成中",
    "menu": {
      "made": "生成于 {when}，时长 {len}",
      "midi": "转为 MIDI",
      "rename": "重命名",
      "stems": "拆分为分轨",
      "took": "用时 {s} 秒"
    },
    "models": "模型",
    "more": "详情与操作",
    "pause": "暂停",
    "peek": {
      "copied": "已复制",
      "copy": "复制",
      "lines": "{n} 行",
      "lyrics": "歌词",
      "noLyrics": "没有歌词",
      "style": "风格",
      "tags": "{n} 个标签"
    },
    "period": "时间段",
    "periodHint": {
      "all": "迄今生成的全部内容。",
      "today": "今天生成的版本。加星标的会收进曲库的“收藏”。",
      "week": "最近七天的版本。"
    },
    "periods": {
      "all": "全部",
      "today": "今天",
      "week": "7 天"
    },
    "play": "播放",
    "position": "曲目中的位置",
    "queued": "排队中",
    "reuse": "载入表单",
    "reuseInForm": "载入表单",
    "session": "会话",
    "showAll": "显示全部：{n}",
    "showMore": "显示更多：{n}",
    "startAndCreate": "启动 {name} 并创建",
    "startFailed": "{name} 没有启动。",
    "startingEngine": "正在启动 {name}…",
    "startsOnCreate": "{name} 目前没有运行。点“创建”时才会启动；启动后的第一个版本会更慢。",
    "startsOnCreateOther": "{other} 正占用 GPU。点“创建”时 {name} 会启动，{other} 会停止。启动后的第一个版本会更慢。",
    "stop": "停止",
    "stopAsk": "停止？",
    "stopConfirm": "再点一次即可停止：已生成的部分会丢失",
    "stopped": "已停止。",
    "styleAndLyrics": "风格与歌词",
    "takeN": "版本 {n}",
    "takeTitle": "{title}，版本 {n}",
    "takes": "版本数：{n}",
    "toSession": "到会话列表，版本数：{n}",
    "untitled": "未命名",
    "wholeLibrary": "整个曲库"
  },
  "favorite": {
    "add": "加入收藏",
    "remove": "取消收藏"
  },
  "header": {
    "create": "创建",
    "desc": {
      "create": "歌曲、纯音乐和音效",
      "library": "所有曲目：生成的、上传的和来自编辑器的"
    },
    "gpuFree": "GPU 空闲",
    "home": "首页",
    "languageCurrent": "界面语言：{name}",
    "library": "曲库",
    "more": "更多：语言、模型、帮助",
    "guide": {
      "mapTitle": "应用的各个部分",
      "map": {
        "idea": "最简单的入口，就在首页：一句话加“创作”，本地语言模型会为引擎写好提示词。修改后即可生成曲目。",
        "lora": "用你自己的曲目微调 ACE-Step：上传音频、自动标注、检查描述、训练并导出。它位于“创建”页面的 ACE-Step 下；训练好的适配器会出现在 ACE-Step 表单里。",
        "yue": "第二个引擎：写出带人声的完整歌曲，并能围绕给定的旋律来创作（“旋律”标签页，配合 SheetSage2）。它还能把曲目转成 MIDI。"
      },
      "gpu": [
        "这些引擎无法同时放进 GPU，所以一次只运行一个。在“创建”页面选择引擎，在它的表单里点“创建”时启动；正在运行的那个会停止。",
        "第一次启动要几分钟，模型需要载入显存。顶部的状态按钮会显示 GPU 上的引擎以及显存的占用情况；点击可查看谁占了多少显存，还有“卸载”按钮和通往“模型”的入口。",
        "卸载会中断正在进行的生成或训练，所以按钮会先确认。"
      ],
      "steps": [
        {
          "title": "打开 ACE-Step",
          "text": "进入“创建”并选择 ACE-Step。第一次点“创建”时它才会启动；第一次启动需要几分钟。"
        },
        {
          "title": "描述歌曲",
          "text": "在“歌曲”标签页选“根据描述”：写几句话就够了，说明曲风、情绪和歌词的内容。再选时长和版本数。"
        },
        {
          "title": "挑出最好的版本",
          "text": "各版本会排在表单旁边的会话列表里（手机上在表单下方）。所有生成的内容都会自动保存到曲库。"
        },
        {
          "title": "拆分为分轨",
          "text": "一键得到人声、鼓、贝斯和其他：在版本菜单里选“拆分为分轨”，或用曲库里的“分轨与音符”标签页，也可以直接在编辑器里操作。"
        },
        {
          "title": "在编辑器里搭建",
          "text": "把分轨摆到各条轨道上，用 AI 编曲助手添加声部，设置效果。"
        },
        {
          "title": "导出",
          "text": "混音导出为 WAV 或 MP3，或者连同 Reaper 工程或 DAWproject 一起导出各条轨道。"
        }
      ],
      "compare": [
        {
          "label": "最适合",
          "ace": "快速出歌和纯音乐，连续生成多个版本",
          "yue": "一次生成带人声的完整歌曲",
          "sa3": "纯音乐、音效和采样；在编辑器中补全和延续音频"
        },
        {
          "label": "基于现有曲目",
          "ace": "翻唱、重绘一段、添加声部、抽出声部、续写",
          "yue": "按另一首曲目的旋律写歌：“旋律”标签页，配合 SheetSage2 或 MIDI 文件",
          "sa3": "重绘一段、续写、换风格翻唱（音频到音频）；不能在混音之上加声部"
        },
        {
          "label": "你自己的风格",
          "ace": "用你的曲目训练的 LoRA",
          "yue": "不支持",
          "sa3": "不支持（计划支持 LoRA）"
        },
        {
          "label": "时长",
          "ace": "10 到 300 秒，每次运行 1、2 或 4 个版本",
          "yue": "取决于歌词，或 1 到 8 分钟；每次运行 1 到 4 个版本",
          "sa3": "最长 6 分钟（medium）或 2 分钟（small）；每次运行 1、2 或 4 个版本，按秒计"
        },
        {
          "label": "MIDI",
          "ace": "不支持",
          "yue": "曲目或分轨转 MIDI (MuScriptor)",
          "sa3": "不支持"
        },
        {
          "label": "许可",
          "ace": "MIT：允许商用；发布前请查看最新条款",
          "yue": "仅限非商业用途",
          "sa3": "Stability AI Community License：年收入低于 100 万美元免费；仅限纯音乐，无人声"
        }
      ]
    },
    "helpSections": {
      "idea": {
        "title": "从创意开始创作",
        "text": "在首页用一两句话描述一首歌、一段纯音乐或一个音效，再选引擎；歌词语言和由谁来写提示词在“更多”里。点“创作”后，提示词助手（本地的 Qwen3.5 模型）会按引擎的格式写出提示词：风格标签、分段的歌词、速度和调。你可以修改、生成，或在引擎的表单里打开。音效不经过助手，直接交给 Stable Audio。在“创建”页面，同样的创意栏位于表单上方，写出的内容会直接填入表单。助手的模型和设备在“模型与设置”中设置。"
      },
      "engines": {
        "text": "共有三个引擎生成音频：ACE-Step 1.5、YuE2-3B 和 Stable Audio 3，它们无法同时放进一块 GPU，所以一次只运行一个。在“创建”页面选择引擎：点“创建”时它才启动，正在运行的那个会自动停止。指示灯显示它的状态；第一次启动可能要几分钟，模型需要载入显存。顶部的状态按钮会显示谁占用了 GPU，并可以卸载它。"
      },
      "ace": {
        "text": "在“歌曲”标签页，可以用大白话描述音乐（根据描述），也可以给出风格标签和带 [Verse] / [Chorus] 标记的歌词（自己的歌词和风格），或者勾选“无人声”。在“从曲目”标签页，参考曲目可用于翻唱、重绘一段、抽出或添加声部，或把一首作品补完。时长为 10-300 秒，每次运行 1、2 或 4 个版本。“调节”里有“简单”（步数、时长、速度、调式、格式）和“手动”（所有参数）；训练好的 LoRA 在那里启用，强度为 0 到 1。"
      },
      "yue": {
        "text": "YuE2-3B 写出带人声的完整歌曲。“歌曲”标签页里有歌词、风格、时长和质量。“旋律”标签页设置旋律规划：“无规划”直接生成音频，“跟随旋律”保留给定的旋律并自己编伴奏，“旋律和和弦”会先写出两者的规划。SheetSage2（从歌曲…）能把曲目的旋律写成 ABC 乐谱，你可以编辑它，再交回给 YuE2。"
      },
      "sa3": {
        "text": "Stable Audio 3 根据描述，几秒钟内就能做出纯音乐和音效：选“音乐”或“音效”，像采样库那样描述它（曲风、乐器、情绪、速度，或者声音的来源和产生方式），再设置时长和版本数。它没有人声。编辑器里的 AI 编曲助手和“采样”也用同一个引擎，它会通过聆听范围两侧的音频来重绘、续写和翻唱。主要权重需要授权：请在 Hugging Face 上接受许可，保存你的令牌，再到“模型与设置”下载模型。"
      },
      "lora": {
        "text": "LoRA 训练位于“创建”页面的 ACE-Step 之下，在“生成”旁边（手机上是表单上方的开关）。训练需要 ACE-Step 在运行，页面会提示启动它。它带你走完整个微调流程：上传音频、自动标注、检查并编辑描述、预处理、训练（实时显示进度）和导出。训练好的适配器会加入 ACE-Step 表单里的 LoRA 列表。"
      },
      "stems": {
        "text": "任何已保存的曲目都可以一键拆分为四个分轨（人声、鼓、贝斯、其他）：在版本菜单里选“拆分为分轨”，或用曲库里的“分轨与音符”标签页，也可以在编辑器里操作某条轨道。分轨可以在编辑器里作为现成的四轨工程打开。MIDI 转录 (MuScriptor) 可用于完整混音或单个分轨；它运行在 YuE2 引擎上，所以必须安装 YuE2。"
      },
      "arranger": {
        "text": "编辑器里的“AI 编曲助手”按钮是一步步搭建曲子，而不是整首生成。“添加声部”会在所选轨道之上写一个新声部（鼓、贝斯、pad、弦乐等），“重绘”会重写较弱的一段，“续写”让曲子继续往下，“翻唱”会做出另一种风格的新版本。每个版本都放在自己的轨道上：试听，留下最好的，再进入下一个声部。声部由 ACE-Step base 模型（约 4.8 GB）或它更大的 XL base 版本（约 20 GB，需要 16 GB 显卡）添加；两者都是可选的，没有 base 模型时，编曲助手会提示安装。其他模式使用 turbo 运行，若你把 Stable Audio 3 选为引擎，则用它运行：它通过聆听周围的音频来补全、续写和翻唱，仅限纯音乐。"
      },
      "sfx": {
        "text": "编辑器里的“采样”按钮用 Stable Audio 3，根据一句简短的描述做出单次音效（底鼓、击打声、嗖声）、符合项目速度的循环以及氛围素材（雨声、人群、持续低音）。结果排成一排：先试听，再把喜欢的加到新轨道，或加到所选轨道的播放头位置。循环会按整小节裁切，但模型不保证无缝衔接，所以请循环播放检查。“从列表中移除”会从曲库和磁盘中删除该任务的声音，当时放在轨道上的除外。"
      }
    }
  },
  "home": {
    "allTracks": "整个曲库",
    "compose": "创作",
    "composeHere": "助手会为所选引擎写好提示词；生成前你可以修改",
    "composeSound": "助手写出带时长的音效提示词，由 Stable Audio 生成",
    "engineLabel": "引擎",
    "engines": "或直接进入某个引擎",
    "firstText": "描述一首歌，或选一个示例：",
    "firstTitle": "你的曲目会显示在这里",
    "guide": "创作是怎么进行的",
    "kind": {
      "instrumental": "纯音乐",
      "song": "带人声的歌曲",
      "sound": "音效"
    },
    "kindLabel": "要做什么",
    "lead": "一切都在这台电脑上运行",
    "loading": "正在加载曲目",
    "more": "更多",
    "needPhrase": "请先描述音乐",
    "title": "我们来做什么？",
    "phraseLabel": "描述音乐",
    "placeholderSound": "夜里雨点打在铁皮屋顶上，近而平静",
    "soundBySa3": "音效由 Stable Audio 生成",
    "soundMissing": "未安装 Stable Audio"
  },
  "keyScale": {
    "hint": "ACE-Step 只认识大调和小调。对这个音阶，它会得到最接近的调（{key}），并在描述中带上音阶名称：只是提示，不保证效果。",
    "mode": "音阶",
    "modes": {
      "blues": "布鲁斯",
      "dorian": "多利亚",
      "double_harmonic": "双和声",
      "harmonic_minor": "和声小调",
      "hungarian_minor": "匈牙利小调",
      "locrian": "洛克利亚",
      "lydian": "利底亚",
      "major": "大调（伊奥尼亚）",
      "major_pentatonic": "大调五声",
      "melodic_minor": "旋律小调",
      "minor": "自然小调（爱奥利亚）",
      "minor_pentatonic": "小调五声",
      "mixolydian": "混合利底亚",
      "phrygian": "弗里几亚",
      "phrygian_dominant": "弗里几亚属音"
    },
    "needTonic": "请先选主音",
    "none": "没有这种音阶",
    "notSet": "未设置",
    "search": "输入以搜索",
    "tonic": "主音"
  },
  "libraryPage": {
    "aiPart": "AI 编曲助手生成的声部",
    "collectionName": "合集名称",
    "confirmDeleteCollection": "移除这个合集？",
    "cot": {
      "full": "旋律和和弦",
      "melody": "跟随旋律"
    },
    "delete": "删除",
    "deleteCollection": "移除合集（其中的曲目会保留）",
    "deleteFailed": "无法删除：{error}",
    "emptyCollection": "打开一首曲目，在它的“关于”标签页中把它加入这个合集。",
    "emptyFavorites": "给曲目加星标，它就会出现在这里。",
    "emptyHere": "这里还没有内容",
    "emptyHint": "你生成和上传的曲目会汇集在这里。",
    "facts": {
      "file": "文件",
      "madeIn": "生成用时",
      "melody": "旋律",
      "model": "模型"
    },
    "filters": {
      "all": "所有曲目",
      "favorites": "收藏",
      "midi": "音符 (MIDI)",
      "score": "乐谱",
      "stems": "分轨",
      "today": "今天"
    },
    "filtersLabel": "曲库筛选",
    "groups": {
      "collections": "合集",
      "has": "曲目包含",
      "origin": "来源",
      "tags": "标签"
    },
    "loadFailed": "无法加载曲库。",
    "newCollection": "+ 新建合集",
    "newest": "最新的在前",
    "noCollections": "还没有合集：点“新建合集”创建第一个。",
    "nothingFound": "没有找到",
    "nothingFoundHint": "换个词或换个筛选条件试试。",
    "oldest": "最早的在前",
    "order": "排序",
    "origins": {
      "editor": "编辑器",
      "upload": "上传"
    },
    "period": "时间段",
    "pick": "选择一首曲目：它的歌词、风格、分轨和音符会显示在这里。",
    "renameCollection": "重命名合集",
    "retry": "重试",
    "reuseHint": "用这些歌词、风格和设置打开“创建”",
    "search": "标题、风格或一句歌词",
    "showAll": "显示所有曲目",
    "sub": {
      "editor": "来自编辑器",
      "engine": "没有描述",
      "upload": "上传的文件"
    },
    "tabs": {
      "about": "关于",
      "lyrics": "歌词",
      "parts": "分轨与音符"
    },
    "take": "版本 {n}",
    "title": "曲库",
    "toCreate": "生成第一首曲目",
    "today": "今天",
    "yesterday": "昨天",
    "bulk": {
      "addTag": "添加 #{tag}",
      "clear": "取消选择（Esc）",
      "collected": "已将 {n} 首曲目添加到「{name}」 | 已将 {n} 首曲目添加到「{name}」",
      "collection": "合集",
      "favorited": "已将 {n} 首曲目加入收藏 | 已将 {n} 首曲目加入收藏",
      "label": "对所选曲目的操作",
      "newCollection": "新建合集…",
      "noTags": "还没有标签：输入一个并按 Enter。",
      "selectAll": "全选：{n}",
      "selectSong": "选择「{title}」及其所有版本：{n}",
      "selectTrack": "选择「{title}」",
      "selected": "已选择：{n}",
      "tag": "标签",
      "tagPlaceholder": "新标签，或搜索",
      "tagged": "已为 {n} 首曲目添加 #{tag} | 已为 {n} 首曲目添加 #{tag}",
      "uncollected": "已将 {n} 首曲目从「{name}」移出 | 已将 {n} 首曲目从「{name}」移出",
      "unfavorited": "已将 {n} 首曲目移出收藏 | 已将 {n} 首曲目移出收藏",
      "untagged": "已从 {n} 首曲目移除 #{tag} | 已从 {n} 首曲目移除 #{tag}"
    },
    "emptyTag": "可在曲目的“关于”标签页为单个曲目添加此标签，或通过选择栏一次为多个曲目添加。",
    "tags": {
      "add": "添加标签并按 Enter",
      "added": "已添加标签 #{tag}",
      "confirmDelete": "删除该标签？",
      "delete": "从所有曲目中移除该标签",
      "remove": "移除标签 #{tag}",
      "removed": "已移除标签 #{tag}",
      "rename": "重命名标签"
    },
    "trash": {
      "confirmEmpty": "全部永久删除？",
      "confirmPurge": "永久删除？",
      "deleted": "删除时间：{when}",
      "dismiss": "隐藏提示",
      "emptied": "回收站已清空",
      "empty": "清空回收站",
      "emptyHere": "回收站是空的",
      "emptyHint": "已删除的曲目会在此保留 30 天，以便你找回。",
      "loadFailed": "无法加载回收站：{error}",
      "moveHint": "将曲目移入回收站：30 天内可从回收站恢复",
      "moved": "已将 {n} 首曲目移入回收站 | 已将 {n} 首曲目移入回收站",
      "note": "回收站中的曲目将在 30 天后永久删除。",
      "purge": "永久删除",
      "purged": "已永久删除 {n} 首曲目 | 已永久删除 {n} 首曲目",
      "restore": "恢复",
      "restored": "已恢复 {n} 首曲目 | 已恢复 {n} 首曲目",
      "title": "回收站",
      "undo": "撤销"
    }
  },
  "midiPanel": {
    "betterWithVocals": "基于完整混音处理；要得到准确的旋律，请先把曲目拆分成分轨并识别人声。",
    "scoreEmpty": "这个 MIDI 里没有可用来做乐谱的音符。",
    "scoreFromFull": "来自完整混音",
    "scoreFromStems": "旋律来自人声，伴奏来自贝斯和其余部分",
    "scoreFromVocals": "旋律来自人声",
    "scoreInserted": "乐谱已放入 YuE2 表单（{from}）。",
    "toScore": "转为 YuE2 乐谱",
    "toScoreHint": "把音符转成供 YuE2 使用的 ABC 乐谱并放入它的表单：人声成为旋律，贝斯和其余部分成为伴奏与和弦。"
  },
  "miniWave": {
    "percent": "{n}%",
    "timeOf": "{pos} / {total}"
  },
  "models": {
    "check": "检查",
    "checkBad": "已损坏或缺失：{files}。请重新下载这一部分。",
    "checkFailed": "无法检查：{error}",
    "checkOffline": "无法连接 Hugging Face，所以只比较了文件大小。",
    "checkOkHash": "全部 {n} 个文件完整；其中 {h} 个与 Hugging Face 列出的 SHA-256 一致。",
    "checkOkRecord": "全部 {n} 个文件的大小都与记录一致。",
    "checkOkSize": "全部 {n} 个文件完整（按大小和结构检查；没有可供对照的校验和列表）。",
    "checkOutdated": "文件完整，但仓库里已有较新的版本：{files}。重新下载即可获取。",
    "checkTitle": "检查文件是否完整",
    "checking": "正在检查…",
    "parts": {
      "yue2-bf16": {
        "name": "YuE2 bf16",
        "text": "未量化的模型。比 q8_0 需要更多显存（三者中最多）。"
      }
    },
    "reinstall": "重新下载",
    "reinstallAsk": "再下载 {gb} GB？",
    "reinstallNamed": "重新下载 {name}",
    "reinstallNo": "保留",
    "reinstallTitle": "重新下载并替换文件",
    "reinstallYes": "重新下载",
    "yue2": {
      "noSettings": "q8_0、q4_0 或 bf16 精度在 YuE2 表单里通过“质量”为每次生成选择。"
    }
  },
  "params": {
    "changed": "已更改",
    "consoleNote": "手动设置的值会被标出。其余的使用默认值。",
    "consoleTitle": "{name} 控制台",
    "default": "默认：{v}",
    "quick": "快速选择：{group}",
    "reset": "恢复默认",
    "resetOne": "把 {name} 恢复为默认值",
    "simple": {
      "more": "更多：{n}",
      "normal": "常用：{n}",
      "steps": "解码步数",
      "stepsHint": "步数越多，耗时越长。"
    }
  },
  "player": {
    "close": "关闭播放器",
    "label": "播放器",
    "next": "下一首",
    "prev": "上一首（如果已在播放中，则回到开头）"
  },
  "presets": {
    "button": "预设",
    "confirmDelete": "再点一次即可删除 {name}",
    "deleteAsk": "删除？",
    "deleteOne": "删除预设 {name}",
    "none": "还没有保存的预设。",
    "saveCurrent": "把表单保存为预设",
    "title": "预设：保存好的表单设置组合"
  },
  "resources": {
    "ramOf": "内存 {used} / {total} GB",
    "state": {
      "error": "{model} 报告了错误",
      "running": "{model} 正在运行",
      "starting": "{model} 正在启动",
      "stopping": "{model} 正在停止"
    },
    "vramOf": "显存 {used} / {total} GB",
    "holder": {
      "cover": "封面（Z-Image Turbo）"
    }
  },
  "sa3Gen": {
    "badGuidanceWindow": "引导在比起点更高的噪声水平处就停止了：请调低“停止于”或调高“开始于”。",
    "formTabs": "表单的各个部分",
    "kindLabel": "音频类型",
    "lengthFromRef": "时长由参考曲目决定：",
    "lengthOwn": "自定：{v}",
    "lengthSeconds": "{n} 秒",
    "manual": {
      "apg": "APG 占比",
      "autoTags": "辅助标签",
      "cfg": "贴合描述的程度",
      "cfgStartsAt": "引导开始的噪声水平",
      "cfgStopsAt": "引导停止的噪声水平",
      "chunked": "分段解码",
      "chunkedAuto": "自动",
      "duration": "时长",
      "fromRef": "由参考曲目决定",
      "guidanceSub": "描述如何引导声音；运行过程中噪声水平从 1 降到 0",
      "guidanceTitle": "引导",
      "needCfg": "当“贴合描述的程度”不是 1 时",
      "needTwo": "需要两个或更多版本",
      "negative": "要避免的内容",
      "normThreshold": "单步引导的上限",
      "off": "否",
      "on": "是",
      "padding": "时长余量",
      "perVariant": "每个版本单独的描述",
      "resultSub": "时长和描述",
      "resultTitle": "结果",
      "sampler": "采样器",
      "samplerAuto": "默认 (pingpong)",
      "samplerAutoBase": "模型的默认值",
      "samplerLoud": "比平时更响并被削波：测试中有 1-2% 的声音触到了上限。",
      "samplerQuiet": "比平时安静约 7 dB。",
      "samplerSub": "每一步如何计算",
      "samplerTitle": "采样器",
      "scalePhi": "弱化引导",
      "textOnly": "仅在没有参考曲目时",
      "trim": "裁掉开头的静音"
    },
    "modelsAfterStart": "引擎运行后才会显示模型列表。",
    "queuedNote": "队列中的版本：{n}",
    "ref": {
      "modeLabel": "对参考曲目做什么",
      "off": "开启后可基于现成曲目工作：重做、重绘某一段，或接着往下写。"
    },
    "simple": {
      "tagsOff": "不添加",
      "tagsOn": "添加"
    },
    "submitKind": {
      "music": "创建音乐",
      "sfx": "创建音效"
    },
    "tabChanged": "已更改",
    "tabs": {
      "ref": "从曲目",
      "sound": "描述",
      "tuning": "调节"
    },
    "advancedHint": "seed 旁的骰子会让它再次随机；固定一个数字则重复那个声音。后训练的模型针对 8 步和贴合度 1 调校；“要避免的内容”和“引导”分组只在“贴合描述的程度”不是 1 时起作用。",
    "advancedHintBase": "这是 base 检查点：它从 50 步和贴合度 7 开始，所以“要避免的内容”有效；可以在那里试试 \"poor quality\"。",
    "help": {
      "tips": [
        "音乐：曲风、乐器及各自的音色、情绪和力度、以 BPM 表示的速度。",
        "音效：是什么发出的、怎么发生的、持续多久、麦克风在哪里、房间听起来如何。",
        "标签有帮助：TrackType: Music、VocalType: Instrumental、Genre: Funk、Instruments: Guitar, Saxophone；独奏声部用 TrackType: Instrument；音效用 TrackType: SFX。",
        "没有人声：模型做的是纯音乐；人声提示最多只会得到没有歌词的氛围音色。",
        "输入 seed 可重复结果；按下骰子后，每个版本都会使用新的 seed。"
      ]
    },
    "translateBtn": "仅翻译",
    "translateHint": "Stable Audio 只懂英语：助手可以根据你的文字写出英文提示词，或只做翻译。",
    "translateNoAssistant": "提示词助手尚未就绪：请在“模型”页面下载它的模型。",
    "translateRunning": "正在翻译…",
    "translateStopping": "正在停止…",
    "translateStop": "停止",
    "translateDone": "已翻译成英文。",
    "translateUndo": "恢复原文",
    "composeBtn": "编写提示词",
    "composeTitle": "助手会把任何语言的描述改写成 Stable Audio 的提示词：曲风、乐器、音色、速度和时长",
    "composeRunning": "正在编写提示词…",
    "composeDone": "Stable Audio 提示词已写好。"
  },
  "tagInput": {
    "cleared": "已清除所有标签",
    "removeTag": "移除 {tag}",
    "removed": "已移除 {tag}",
    "restored": "标签已恢复",
    "undo": "撤销",
    "undoTitle": "找回被清除的标签"
  },
  "yueGen": {
    "help": {
      "advanced": {
        "choices": [
          "质量（“歌曲”标签页）：草稿是 q4_0 模型，标准是 q8_0，最终是 bf16，32 个解码步，贴合风格程度 1.2。",
          "时长（“歌曲”标签页）：分钟数会转为“不短于”和“不长于”；模型每秒声音生成 25 个 token。",
          "演唱：更稳是“大胆度”0.85，更大胆是 1.1。",
          "重复：更少是“重复惩罚”1.3 加“重复记忆”80。",
          "乐谱：更谨慎是乐谱“大胆度” 0.55。"
        ],
        "choicesIntro": "它们设置的值与下面的修正方案相同，只需一次点击。",
        "choicesTitle": "各标签页中的选项",
        "title": "调节",
        "lead": "这些可以不去动：你没改的项都使用引擎的默认值，在“手动”里每一行都会显示。当曲子总是出问题时才用得上：被截断、循环、跑调。在下面找到你的情况，点“应用”：合适的数值会自动填入各个字段。",
        "fixes": [
          {
            "id": "cutoff",
            "problem": "歌词还没唱完，曲子就断了",
            "fix": "不长于：12000 个 token，时长上限约为 8 分钟，而不是 6 分钟。"
          },
          {
            "id": "offbrief",
            "problem": "声音与标签不符",
            "fix": "贴合风格的程度：1.2，让模型更严格地遵循描述。如果还是没用，问题出在标签本身。"
          },
          {
            "id": "loop",
            "problem": "同一句反复循环",
            "fix": "重复惩罚 1.3 和重复记忆 80：对重复的惩罚更强，对它们的记忆更长。"
          },
          {
            "id": "offkey",
            "problem": "跑调、嗓音破音、杂音",
            "fix": "大胆度 0.85 和 32 个解码步：胆子小一点，渲染音频的遍数多一点。"
          },
          {
            "id": "melody",
            "problem": "旋律不连贯",
            "fix": "如果规划是关闭的，就切换为“旋律和和弦”（你已选的规划保持不变），并把“乐谱”设为“更谨慎”（乐谱大胆度 0.55），让乐谱写得更小心。或者在“旋律”标签页从一首歌里取旋律：给定的乐谱会取代规划，此时只有规划的选择才有意义。"
          },
          {
            "id": "same",
            "problem": "所有版本听起来都一样",
            "fix": "打开随机 seed。如果还不够，把大胆度设为 1.1。"
          },
          {
            "id": "final",
            "problem": "我想要最终渲染",
            "fix": "质量：最终，bf16 模型（已下载时），32 步，贴合风格程度 1.2。生成 2–3 个版本，留下最好的。"
          }
        ],
        "fieldsIntro": "每个字段下方有一条典型值的刻度：上方的标记是音频的默认值，下方的标记是乐谱的默认值（仅在有旋律规划且没有给定乐谱时）。乐谱需要严谨，音频需要生气，所以默认值不同。",
        "groups": [
          {
            "title": "准确度与质量",
            "fields": [
              {
                "key": "cfg_scale",
                "name": "贴合风格的程度 (CFG)",
                "text": "模型有多听话地遵循风格标签。就像你的声音在乐手耳中的音量：小声一点——他们演奏得更自由，大声一点——更贴合要求，但更僵硬。",
                "left": "更自由",
                "right": "更严格贴合标签",
                "when": "声音几乎不符合描述时用 1.2。高于 1.5——会出现伪影和“塑料感”的声音。"
              },
              {
                "key": "num_inference_steps",
                "name": "解码步数",
                "text": "模型把规划变成成品音频要走多少遍。就像刷漆的层数：8 是快速的草稿，32 是干净的最后一层。",
                "left": "更快",
                "right": "更干净",
                "when": "草稿用 8，成品用 32。差别几乎听不出来（RTX 4080 上每首曲子约 4 秒）；超过 32 只会改变声音，不会更好。"
              }
            ]
          },
          {
            "title": "演绎的性格",
            "fields": [
              {
                "key": "temperature",
                "name": "大胆度 (temperature)",
                "text": "模型的大胆程度（至少 0.01：零会让引擎停止）。低——“照本宣科”，平稳可预料；高——即兴发挥，有时精彩，有时跑调。",
                "left": "更稳",
                "right": "更大胆",
                "when": "跑调：0.85。所有版本都一样：1.1。乐谱怪怪的：乐谱用 0.5–0.6。"
              },
              {
                "key": "repetition_penalty",
                "name": "重复惩罚",
                "text": "对重复已经演奏过的内容的惩罚。越高，模型越用力避免“卡带”。对乐谱来说它接近 1.0——乐谱记法里重复是正常的。",
                "left": "允许重复",
                "right": "不重复",
                "when": "循环：1.3。低于 1.1 有出现单调循环的风险。"
              }
            ]
          },
          {
            "title": "曲目时长",
            "fields": [
              {
                "key": "min_tokens",
                "name": "不短于",
                "text": "模型在此之前不能结束。大约每秒 25 个单位：200 ≈ 8 秒音频。",
                "left": "可以很短",
                "right": "不早于",
                "when": "曲子在唱完之前就结束了：调高它。"
              },
              {
                "key": "max_tokens",
                "name": "不长于",
                "text": "时长上限。9000 ≈ 6 分钟的歌；表单最多接受 15000。更多——等待更久，占用更多 GPU 内存。",
                "left": "更短",
                "right": "更长",
                "when": "在句子中间被截断：12000。"
              }
            ]
          }
        ],
        "rareIntro": "它们改变的东西与“大胆度”或“重复惩罚”相同，只是更精细。通常不去动它们。",
        "rare": [
          {
            "key": "top_p",
            "name": "冷门选择截断 (top-p)",
            "text": "模型在每一步考虑多少个“合理”的选项：1——全部，0.5——只考虑最明显的。"
          },
          {
            "key": "top_k",
            "name": "候选数 (top-k)",
            "text": "每次选择中选项数量的硬上限。与冷门选择截断并用的第二道过滤。"
          },
          {
            "key": "penalty_window",
            "name": "重复记忆",
            "text": "模型计算重复惩罚时，记得多久之前演奏过的内容。50 ≈ 2 秒音频。出现循环时调到 80。"
          }
        ]
      },
      "melody": {
        "lead": "YuE2 可以按你给的旋律来演唱歌词。ABC 乐谱用来保存旋律：用文本写成的音符。用应用生成的格式的乐谱，出来的歌曲调相同、演唱的音符相同、时长也相同：在我们的测试中，音符吻合度为 93–99 %。",
        "roll": [
          "“试听”会用钢琴弹奏乐谱。在卷帘上点击或拖动可选择起点，⏮ 回到开头。",
          "粉色音符是人声（Vocal），蓝色是伴奏（Ins）。小节号和和弦显示在顶部。",
          "Ctrl + 鼠标滚轮可缩放，⤢ 打开带三个八度琴键的大窗口。",
          "“五线谱”以五线谱形式显示同一份乐谱；点击音符即可播放。"
        ],
        "rollTitle": "卷帘与音符",
        "sources": [
          "从歌曲… — 选择一个音频文件，SheetSage2 会写出它的旋律和和弦。人声清晰的歌曲效果最好。",
          "导入 MIDI — 最高的声部成为旋律，其他通道成为伴奏和和弦，调会自动识别。请把人声旋律单独放在一条轨道上。",
          "钢琴 — 选一个时长并按键（下方、卷帘左侧，或用 MIDI 键盘）：音符会依次写入。",
          "从曲目：在版本的菜单里选“转为 MIDI”，或用曲库里的“分轨与音符”标签页，再选“转为 YuE2 乐谱”。人声成为旋律，贝斯和其余部分成为伴奏。"
        ],
        "sourcesTitle": "旋律从哪里来",
        "tips": [
          "一个音节对一个音符：8 个音节的一行大约需要 8 个音符。",
          "歌曲有多长，取决于音符：100 BPM 下 8 小节 4/4 拍约 20 秒。",
          "跟随旋律：模型保留你的旋律并自己编伴奏；旋律和和弦：模型根据乐谱同时生成两者。",
          "风格里写的调或速度不起作用：它们取自音符。",
          "只有熟悉格式时才手动编辑 ABC 文本：模型最擅长读应用生成的版式（Vocal 和 Ins 声部）。"
        ],
        "tipsTitle": "想要贴近原曲",
        "title": "旋律与 ABC 乐谱"
      },
      "style": {
        "tips": [
          "最合适的是 5–8 个标签——更多会开始冲突，更少则结果更难预料。",
          "标签用英文写，但先写歌曲的语言（Russian、English、Spanish…）：引擎自己的示例都是这样，创意流程也会替你加上。",
          "有旋律规划（跟随旋律或旋律和和弦）时，风格依然重要：它决定音色和编曲，而旋律来自 ABC 乐谱。"
        ]
      },
      "lyrics": {
        "tips": [
          "有旋律规划时，歌词每行的节奏应大致与 ABC 乐谱（每小节的音节数）相符；否则模型就得拉长或压缩字词来适应旋律。",
          "短句比长句更容易贴合旋律。",
          "每个 [Chorus] 里的副歌都一字不差地重复——这能让它在整首曲子里保持同一条旋律线。"
        ]
      },
      "cot": {
        "title": "旋律规划",
        "intro": "旋律规划决定模型是否在生成音频之前先写一份音乐规划，以及如何使用“旋律”标签页里的 ABC 乐谱。",
        "melodyNote": "把旋律以 ABC 乐谱的形式放在规划下面：从歌曲…（SheetSage2）、MIDI 文件或钢琴。没有乐谱时，模型会写出它自己的、只有旋律的规划。",
        "precisionNote": "模型精度（q8_0、q4_0、bf16）与规划无关：由“歌曲”标签页的“质量”决定。无论哪种规划，q4_0 都能以少量音质为代价节省显存。",
        "abcFooter": "最省事的做法不是从头写 ABC，而是用“从歌曲…”(SheetSage2) 从一首歌里取得，再手动修改你需要的小节。"
      }
    },
    "length": {
      "auto": "自动",
      "autoHint": "取决于歌词有多长，最多约 6 分钟。",
      "hint": "约 {n} 分钟：较短的歌词会唱完并继续演奏到该时长，较长的歌词会在此处被截断。",
      "label": "时长",
      "minutes": "{n} 分钟",
      "ownHint": "在“调节”中手动设置（最少 / 最多 token）。"
    },
    "lines": "行数：{n}",
    "linesAbout": "行数：{n}，约 {time}",
    "linesAboutHint": "根据你之前的歌曲估算：每行约 {s} 秒。用于“自动”时长。",
    "manual": {
      "abcGiven": "来自“旋律”标签页的乐谱",
      "changed": "已更改 {n} / {total}",
      "console": "控制台：一次显示所有分组",
      "consoleTitle": "YuE2 控制台",
      "done": "完成",
      "groups": {
        "character": {
          "sub": "人声与音乐",
          "title": "性格"
        },
        "length": {
          "sub": "每秒 25 个 token",
          "title": "时长"
        },
        "repeats": {
          "sub": "防止循环",
          "title": "重复"
        },
        "score": {
          "sub": "模型如何编写旋律规划",
          "title": "乐谱"
        },
        "sound": {
          "sub": "模型与解码",
          "title": "音质"
        }
      },
      "manual": "手动",
      "params": {
        "cfg": "贴合风格的程度",
        "max_tokens": "不长于",
        "min_tokens": "不短于",
        "penalty_window": "重复记忆",
        "precision": "模型精度",
        "repetition_penalty": "重复惩罚",
        "steps": "解码步数",
        "temperature": "大胆度",
        "top_k": "候选数",
        "top_p": "冷门选择截断"
      },
      "reset": "重置",
      "resetAll": "全部重置",
      "seconds": "{n} 秒",
      "seedRandom": "随机",
      "sends": "发送给引擎",
      "sendsRest": "手动设置的值会被标出。这一行里没有的项都使用引擎默认值。",
      "simple": "简单"
    },
    "perf": {
      "manualNow": "（目前为手动设置）",
      "repeats": {
        "hint": "更少：当同一句反复循环时选它。",
        "label": "重复",
        "options": {
          "fewer": "更少",
          "normal": "标准"
        }
      },
      "score": {
        "hint": "更谨慎：当旋律东拉西扯时选它，模型会更小心地写乐谱。",
        "label": "乐谱",
        "options": {
          "careful": "更谨慎",
          "normal": "标准"
        }
      },
      "temperature": {
        "hint": "更稳：跑调和嗓音破音更少。更大胆：各版本之间差别更大。",
        "label": "演唱",
        "options": {
          "normal": "标准",
          "steady": "更稳",
          "varied": "更大胆"
        }
      }
    },
    "planLabel": "旋律规划",
    "planNames": {
      "full": "旋律和和弦",
      "melody": "跟随旋律",
      "off": "无规划"
    },
    "qualityHints": {
      "draft": "{model} 模型占用显存更少，声音略显朴素：适合试想法。",
      "final": "{model} 模型，32 个解码步，更贴合风格标签（CFG 1.2）：适合成品。生成 2–3 个版本，留下最好的。bf16 比 q8_0 需要更多显存（文件 7.3 GB，对比 4.3 GB）。",
      "normal": "{model} 模型，常规设置：音质好，也不用久等。",
      "own": "精度、步数和 CFG 手动设置。"
    },
    "qualityLabel": "质量",
    "qualityNames": {
      "draft": "草稿",
      "final": "最终",
      "normal": "标准",
      "own": "自定义"
    },
    "queued": "已在队列中，版本数：{n}",
    "scoreGivenNote": "给定的乐谱会取代规划，所以乐谱采样不起作用，也不会发送。",
    "sections": {
      "bridge": "+ Bridge",
      "chorus": "+ Chorus",
      "outro": "+ Outro",
      "verse": "+ Verse"
    },
    "tabs": {
      "changed": "与默认值不同",
      "melody": "旋律",
      "song": "歌曲",
      "tuning": "调节"
    },
    "takes": "版本数",
    "tuningTitle": "性能设置"
  },
  "acePage": {
    "openTrainingPage": "打开 LoRA 训练"
  },
  "library": {
    "noTracks": "曲库里还没有曲目。请在上方上传文件，或在“创建”中生成曲目。"
  },
  "notInstalled": {
    "stableAudio": {
      "text": "Stable Audio 3 能做出纯音乐和音效，并驱动编辑器的重绘、续写和翻唱。安装时它被略过了。安装之后，请在“模型与设置”里，或直接在 Stable Audio 的表单里下载模型。"
    }
  },
  "idea": {
    "guide": {
      "lead": "输入一句话，得到一首曲子，就在首页。你用自己的话描述一首歌、一段纯音乐或一个音效，本地语言模型按所选引擎的格式写出提示词，你可以按需修改，然后由引擎生成曲目。",
      "steps": [
        {
          "title": "描述创意",
          "text": "一两句话：歌讲什么、情绪、谁来唱、在哪里什么时候。纯音乐则写曲风、乐器和情绪。"
        },
        {
          "title": "选类型和引擎",
          "text": "带人声的歌曲、纯音乐或音效，再选 ACE-Step、YuE2 或 Stable Audio 3。做不了这种类型的引擎无法选择；音效始终交给 Stable Audio。"
        },
        {
          "title": "创作",
          "text": "点“创作”：助手会在这句话的正下方写出提示词，并随着文字增长显示阶段、百分比和内容。你可以中途停止。音效会跳过这一步：“创作”会带着这句话打开 Stable Audio 的表单。"
        },
        {
          "title": "修改提示词",
          "text": "标签、歌词、速度、调和时长都可以直接在字段里修改。"
        },
        {
          "title": "生成",
          "text": "“生成”会把各版本放入引擎的队列，轮到它们时队列会启动引擎，并打开“创建”：各版本会出现在会话列表里，以这个创意命名。"
        }
      ],
      "writer": [
        "提示词助手是一个本地语言模型，Qwen3.5。它紧扣创意，并用创意的语言或你选的语言写歌词。它的模型在“模型”页面下载。",
        "对于 ACE-Step，引擎运行时，ACE-Step 自己的语言模型也可以写提示词。它更快，通常 5–20 秒，但更容易偏离创意。",
        "歌词语言默认取自创意的文字；你可以在“更多”里选择，由谁来写提示词也在那里。在“创建”页面，它位于创意栏的“设置”下。"
      ],
      "after": [
        "再来一个版本会用同一个创意重新写提示词。",
        "“在表单中打开”会把提示词连同所有设置放入“创建”页面上引擎的表单。",
        "离开页面或刷新后，创意和提示词仍会保留。“生成”之后它们会被清空，为下一个创意让位；“重置”可以手动清空。",
        "在“创建”页面，同样的创意栏位于表单上方：“写”会把歌词和风格直接填入表单（Stable Audio 则是“描述”），“恢复原来的内容”会还原表单。"
      ],
      "tips": [
        "具体比笼统好：“一列夜里驶出小镇的火车”比“一首悲伤的歌”给出的信息更多。",
        "想要特定的曲风、嗓音或乐器？在创意里写出来。",
        "生成前先读读歌词：小模型不一定总能把押韵和节奏做对。",
        "不是你想要的声音？对同一个创意换一个引擎试试：提示词会按它的格式重写。",
        "雨声、一次撞击、脚步声是音效，不是音乐：选“音效”，这句话会直接进入 Stable Audio 的表单。选择“纯音乐”和 Stable Audio 3 时，助手会自己判断是否需要音效；ACE-Step 则会用这样的创意生成一首曲子。"
      ]
    }
  },
  "sa3Weights": {
    "allOnModels": "所有模型、base 检查点和设置都在“模型”页面"
  },
  "autoTitle": {
    "accept": "采用",
    "another": "换一个",
    "bulk": "建议标题",
    "bulkDone": "已为 {n} 首曲目命名 | 已为 {n} 首曲目命名",
    "bulkFailed": "已命名 {n} 首，随后中断：{error} | 已命名 {n} 首，随后中断：{error}",
    "bulkHint": "助手会依次为所选曲目命名；点击“撤销”可恢复原标题。",
    "bulkStopped": "已停止：已命名 {n}/{total} 首",
    "bulkUndone": "已恢复原标题 | 已恢复原标题：{n} 首",
    "cancel": "取消",
    "failed": "想不出标题：{error}",
    "noAssistant": "提示词助手尚未就绪：请在“模型”中下载它的模型。",
    "progress": "正在命名 {done}/{total}",
    "stop": "停止",
    "suggest": "建议标题",
    "working": "正在想标题…"
  },
  "covers": {
    "alt": "{title} 的封面",
    "another": "换一张封面",
    "bulk": "制作封面",
    "bulkDone": "已制作 {n} 张封面 | 已制作 {n} 张封面",
    "bulkFailed": "{n} 张未成功",
    "bulkHint": "为每首所选曲目依次制作一张封面；已有封面的曲目会得到新的封面。",
    "bulkProgress": "封面：{done}/{total}",
    "cancel": "取消",
    "describe": "画面内容",
    "describeHint": "用几个词描述一个场景；英文效果最好。画面中的文字会自动避免。",
    "dismiss": "关闭",
    "edit": "编辑描述…",
    "enable": "为曲目制作专辑封面",
    "enableHint": "为资料库、播放器和会话中的每首歌添加一张图片。关闭后：任何地方都不会出现封面和封面按钮。",
    "engine": "封面（Z-Image Turbo）",
    "failed": "封面未成功：{error}",
    "fromAssistant": "来自助手对这首曲目的构思。",
    "installed": "已安装",
    "loadingPrompt": "正在读取描述…",
    "make": "制作封面",
    "making": "正在制作封面…",
    "makingPct": "正在制作封面… {pct}%",
    "model": "模型：Z-Image Turbo，{gb} GB",
    "notInstalled": "未安装",
    "notInstalledHint": "此电脑上没有封面模型。请用安装程序（“封面”部分）或安装脚本进行安装。",
    "onButton": "只有在你点击按钮时才会制作封面：在资料库中曲目的详情里，或针对所选曲目。每张需要 5 到 10 秒；这段时间 GPU 会切换到封面模型，下一首歌再重新加载它的引擎。",
    "parts": {
      "main": "Z-Image Turbo 权重",
      "server": "图像服务器（stable-diffusion.cpp）"
    },
    "queued": "正在队列中等待…",
    "remove": "移除封面",
    "removeConfirm": "是，移除",
    "stop": "停止",
    "title": "封面",
    "draw": "绘制",
    "withAssistant": "用助手生成",
    "withAssistantHint": "提示词助手会根据你的文字（任何语言）写出描述；输入框为空时则根据歌曲来写。绘制前可以修改。",
    "putBack": "恢复原文",
    "anyLanguageHint": "可以用任何语言书写：助手会把它变成图像模型能理解的描述。",
    "fromSaved": "上一张封面所用的描述。",
    "noAssistant": "提示词助手尚未就绪：请在“模型”中下载它的模型。",
    "describing": "正在描述画面…",
    "describingPct": "正在描述画面… {pct}%",
    "describeFailed": "助手无法描述画面：{error}",
    "bulkDescribing": "正在描述 {done}/{total}",
    "starting": "正在启动图像模型…"
  },
  "takeCompare": {
    "best": "★ 最佳",
    "failed": "无法加载",
    "keep": "保留最佳版本，其余移到回收站",
    "keepConfirm": "将 {n} 个版本移到回收站？ | 将 {n} 个版本移到回收站？",
    "keepNeedStar": "给最佳版本加星标即可保留它。",
    "keepTooMany": "只给一个版本加星标：要保留的那个。",
    "keepWill": "保留 {take}；另一个移到回收站。 | 保留 {take}；其余 {n} 个移到回收站。",
    "kept": "已保留 {take}；{n} 个版本已移到回收站。 | 已保留 {take}；{n} 个版本已移到回收站。",
    "keys": "1–4 选择版本 · 空格 播放/暂停 · ←/→ 5 秒 · Esc 关闭",
    "loading": "正在加载…",
    "loadingAll": "正在加载各版本…",
    "newestOf": "共 {total} 个版本中最新的 {shown} 个",
    "nowHearing": "正在播放：{take}",
    "open": "对比",
    "openTitle": "对比这首歌的各个版本，A/B",
    "position": "{at}/{total}",
    "restored": "已恢复 {n} 个版本 | 已恢复 {n} 个版本",
    "seed": "种子 {seed}",
    "seek": "位置",
    "takes": "版本",
    "tileLabel": "{letter}，版本 {n}",
    "title": "对比版本"
  }
}
