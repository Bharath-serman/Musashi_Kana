export type Level = "N5" | "N4";

export type Card = {
  front: string;
  reading: string;
  meaning: string;
  example: string;
  note: string;
};

export type Grammar = {
  pattern: string;
  meaning: string;
  example: string;
  tip: string;
};

export type QuizQuestion = {
  prompt: string;
  choices: string[];
  answer: string;
};

export const course = {
  N5: {
    theme: "Foundation",
    headline: "Build a clean N5 base",
    description:
      "Learn the kana, high-frequency vocabulary, essential kanji, beginner grammar, and short reading patterns that make N5 stop feeling scattered.",
    mission: "Today: 20 flashcards, 1 reading passage, 8 writing reps, 1 checkpoint quiz.",
    stats: {
      words: 680,
      kanji: 103,
      grammar: 42,
      readings: 18
    },
    roadmap: [
      ["Kana control", "Read and write hiragana and katakana without hesitation."],
      ["Core vocabulary", "Master people, places, food, numbers, time, weather, and common verbs."],
      ["Sentence grammar", "Use です, ます, particles, adjectives, negatives, questions, and time markers."],
      ["Reading rhythm", "Identify who, where, when, and what happened in simple diary-style text."]
    ],
    vocab: [
      { front: "こんにちは", reading: "konnichiwa", meaning: "hello", example: "こんにちは。いい天気ですね。", note: "Daytime greeting." },
      { front: "学生", reading: "がくせい / gakusei", meaning: "student", example: "私は学生です。", note: "Common identity noun." },
      { front: "水", reading: "みず / mizu", meaning: "water", example: "水をください。", note: "Useful request word." },
      { front: "行きます", reading: "いきます / ikimasu", meaning: "to go", example: "学校へ行きます。", note: "Often pairs with へ." },
      { front: "大きい", reading: "おおきい / ookii", meaning: "big", example: "大きいかばんです。", note: "い-adjective." },
      { front: "今日", reading: "きょう / kyou", meaning: "today", example: "今日は休みです。", note: "Time expression." },
      { front: "友だち", reading: "ともだち / tomodachi", meaning: "friend", example: "友だちと話します。", note: "と means with." },
      { front: "食べます", reading: "たべます / tabemasu", meaning: "to eat", example: "パンを食べます。", note: "る-verb polite form." }
    ],
    kanji: [
      { front: "日", reading: "にち・ひ", meaning: "sun; day", example: "日曜日に休みます。", note: "Appears in days of week." },
      { front: "月", reading: "げつ・つき", meaning: "moon; month", example: "月曜日に会います。", note: "Also month counter." },
      { front: "人", reading: "ひと・じん", meaning: "person", example: "あの人は先生です。", note: "Nationality suffix uses じん." },
      { front: "山", reading: "やま", meaning: "mountain", example: "山が見えます。", note: "Simple pictographic kanji." },
      { front: "川", reading: "かわ", meaning: "river", example: "川のそばにあります。", note: "Three flowing strokes." },
      { front: "本", reading: "ほん", meaning: "book; origin", example: "本を読みます。", note: "Also appears in 日本." }
    ],
    grammar: [
      { pattern: "A は B です", meaning: "A is B.", example: "私は学生です。", tip: "は marks the topic, not always the subject." },
      { pattern: "N を Vます", meaning: "Marks the direct object.", example: "パンを食べます。", tip: "Use を before the action verb." },
      { pattern: "Place へ 行きます", meaning: "Go toward a place.", example: "駅へ行きます。", tip: "へ is pronounced e as a particle." },
      { pattern: "Time に Vます", meaning: "Marks a specific time.", example: "七時に起きます。", tip: "Do not use に with vague time like 今日." },
      { pattern: "N じゃありません", meaning: "Negative of です.", example: "先生じゃありません。", tip: "Polite spoken negative." },
      { pattern: "い-adj + N", meaning: "Describe a noun directly.", example: "新しい本です。", tip: "Keep い before the noun." }
    ],
    reading: {
      title: "A morning at school",
      japanese:
        "私は毎朝七時に起きます。水を飲んで、パンを食べます。八時に学校へ行きます。学校で日本語を勉強します。友だちと昼ごはんを食べます。",
      translation:
        "I wake up at seven every morning. I drink water and eat bread. At eight I go to school. At school I study Japanese. I eat lunch with my friend.",
      questions: [
        ["何時に起きますか。", "七時"],
        ["どこへ行きますか。", "学校"],
        ["何を勉強しますか。", "日本語"]
      ]
    },
    writing: ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ", "日", "月", "人", "本"],
    quiz: [
      { prompt: "学生 means...", choices: ["student", "teacher", "station", "library"], answer: "student" },
      { prompt: "Which particle marks a direct object?", choices: ["を", "へ", "に", "は"], answer: "を" },
      { prompt: "水をください means...", choices: ["Please give me water", "I go to water", "Water is big", "Today is water"], answer: "Please give me water" },
      { prompt: "駅へ行きます means...", choices: ["I go to the station", "I eat at the station", "The station is big", "I read a station"], answer: "I go to the station" }
    ]
  },
  N4: {
    theme: "Expansion",
    headline: "Turn N4 into usable Japanese",
    description:
      "Practice verb forms, connected grammar, stronger kanji recognition, longer reading passages, and output drills that prepare you for N4-style questions.",
    mission: "Today: review te-form, read one notice, write 10 kanji reps, complete grammar checkpoint.",
    stats: {
      words: 1500,
      kanji: 300,
      grammar: 78,
      readings: 30
    },
    roadmap: [
      ["Verb forms", "Master plain form, te-form, nai-form, ta-form, and common combinations."],
      ["Grammar links", "Use because, although, while, before, after, intention, ability, and requests."],
      ["Kanji growth", "Review N5 kanji while adding common verbs, adjectives, places, and time words."],
      ["Reading stamina", "Read notices, messages, short essays, and everyday explanations with context clues."]
    ],
    vocab: [
      { front: "予定", reading: "よてい / yotei", meaning: "plan; schedule", example: "週末の予定があります。", note: "Useful for plans." },
      { front: "説明します", reading: "せつめいします / setsumei shimasu", meaning: "to explain", example: "先生が文法を説明します。", note: "する-verb." },
      { front: "必要", reading: "ひつよう / hitsuyou", meaning: "necessary", example: "予約が必要です。", note: "Often takes が." },
      { front: "比べます", reading: "くらべます / kurabemasu", meaning: "to compare", example: "二つの答えを比べます。", note: "Transitive verb." },
      { front: "特に", reading: "とくに / tokuni", meaning: "especially", example: "漢字が特に難しいです。", note: "Adverbial emphasis." },
      { front: "習慣", reading: "しゅうかん / shuukan", meaning: "habit", example: "毎日読む習慣があります。", note: "Study routine word." },
      { front: "間に合います", reading: "まにあいます / maniaimasu", meaning: "to be on time", example: "電車に間に合いました。", note: "Pairs with に." },
      { front: "残念", reading: "ざんねん / zannen", meaning: "unfortunate", example: "残念ですが、行けません。", note: "Common polite phrase." }
    ],
    kanji: [
      { front: "駅", reading: "えき", meaning: "station", example: "駅で友だちを待っています。", note: "Transport kanji." },
      { front: "店", reading: "みせ", meaning: "shop", example: "新しい店が開きました。", note: "Everyday place." },
      { front: "病", reading: "びょう", meaning: "illness", example: "病院へ行きました。", note: "Part of 病院." },
      { front: "強", reading: "つよい・きょう", meaning: "strong", example: "強い雨が降っています。", note: "い-adjective root." },
      { front: "弱", reading: "よわい", meaning: "weak", example: "漢字が少し弱いです。", note: "Opposite of 強い." },
      { front: "運", reading: "はこぶ・うん", meaning: "carry; luck", example: "荷物を運びます。", note: "Appears in 運動." }
    ],
    grammar: [
      { pattern: "Vて います", meaning: "Ongoing action or resulting state.", example: "今、本を読んでいます。", tip: "Also describes wearing, living, knowing." },
      { pattern: "Vた ことがあります", meaning: "Have experienced doing something.", example: "京都へ行ったことがあります。", tip: "Use past plain form before こと." },
      { pattern: "Vないで ください", meaning: "Please do not do something.", example: "ここで写真を撮らないでください。", tip: "Polite prohibition." },
      { pattern: "Vる つもりです", meaning: "Intend to do something.", example: "来年、日本へ行くつもりです。", tip: "Stronger than casually thinking." },
      { pattern: "A ので B", meaning: "Because A, B.", example: "雨なので、家にいます。", tip: "Softer than から in many contexts." },
      { pattern: "Vながら", meaning: "Do two actions at the same time.", example: "音楽を聞きながら勉強します。", tip: "Main action comes after ながら clause." }
    ],
    reading: {
      title: "A weekend plan",
      japanese:
        "土曜日に友だちと図書館で勉強するつもりです。来週テストがあるので、文法を復習しなければなりません。勉強したあとで、駅の近くの店で昼ごはんを食べます。",
      translation:
        "On Saturday I intend to study with a friend at the library. Because there is a test next week, I have to review grammar. After studying, we will eat lunch at a shop near the station.",
      questions: [
        ["どこで勉強するつもりですか。", "図書館"],
        ["どうして文法を復習しますか。", "来週テストがあるので"],
        ["勉強したあとで何をしますか。", "昼ごはんを食べます"]
      ]
    },
    writing: ["駅", "店", "病", "院", "強", "弱", "運", "動", "教", "室", "質", "問", "答", "習", "漢", "説", "明", "予", "定"],
    quiz: [
      { prompt: "Vたことがあります expresses...", choices: ["experience", "prohibition", "comparison", "location"], answer: "experience" },
      { prompt: "予約が必要です means...", choices: ["A reservation is necessary", "The station is far", "I compare reservations", "Please do not reserve"], answer: "A reservation is necessary" },
      { prompt: "Which form fits: 音楽を聞き___勉強します。", choices: ["ながら", "ので", "つもり", "こと"], answer: "ながら" },
      { prompt: "雨なので、家にいます means...", choices: ["Because it is raining, I stay home", "Although it rains, I go home", "I intend to rain", "Please do not rain"], answer: "Because it is raining, I stay home" }
    ]
  }
} satisfies Record<Level, {
  theme: string;
  headline: string;
  description: string;
  mission: string;
  stats: Record<string, number>;
  roadmap: string[][];
  vocab: Card[];
  kanji: Card[];
  grammar: Grammar[];
  reading: {
    title: string;
    japanese: string;
    translation: string;
    questions: string[][];
  };
  writing: string[];
  quiz: QuizQuestion[];
}>;
