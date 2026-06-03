import { course } from "../../data";
import type { Grammar, Level } from "../../data";

export type LessonChart = {
  headers: string[];
  rows: string[][];
};

export type GrammarLesson = {
  topic: string;
  title: string;
  brief: string;
  notes: string[];
  examples: { jp: string; en: string }[];
  chart?: LessonChart;
};

const lessonLibrary: Record<Level, Record<string, GrammarLesson>> = {
  N5: {
    "A は B です": {
      topic: "Topic particle は",
      title: "Topic statement",
      brief: "Use this pattern to introduce or identify something in a polite sentence.",
      notes: [
        "`は` marks the topic, the thing you are talking about.",
        "`です` adds polite sentence ending tone.",
        "This is one of the core patterns for self-introduction and basic descriptions."
      ],
      examples: [
        { jp: "私は学生です。", en: "I am a student." },
        { jp: "これは本です。", en: "This is a book." }
      ],
      chart: {
        headers: ["Part", "Role", "Example"],
        rows: [
          ["A", "topic", "私"],
          ["は", "topic marker", "は"],
          ["B", "identity / description", "学生"],
          ["です", "polite ending", "です"]
        ]
      }
    },
    "N を Vます": {
      topic: "Object particle を",
      title: "Direct object marker",
      brief: "Use `を` before the noun that receives the action of the verb.",
      notes: [
        "`を` often appears with actions like eat, read, drink, watch, or write.",
        "The verb usually comes at the end of the sentence.",
        "This particle is pronounced `o` in speech."
      ],
      examples: [
        { jp: "パンを食べます。", en: "I eat bread." },
        { jp: "本を読みます。", en: "I read a book." }
      ],
      chart: {
        headers: ["Noun", "Particle", "Verb"],
        rows: [
          ["パン", "を", "食べます"],
          ["本", "を", "読みます"]
        ]
      }
    },
    "Place へ 行きます": {
      topic: "Direction particle へ",
      title: "Movement toward a place",
      brief: "Use `へ` with movement verbs when someone goes toward a destination.",
      notes: [
        "`へ` shows direction more than exact location.",
        "It is read as `e` when used as a particle.",
        "Common movement verbs are `行きます`, `来ます`, and `帰ります`."
      ],
      examples: [
        { jp: "学校へ行きます。", en: "I go to school." },
        { jp: "駅へ行きます。", en: "I go to the station." }
      ],
      chart: {
        headers: ["Destination", "Particle", "Movement verb"],
        rows: [
          ["学校", "へ", "行きます"],
          ["駅", "へ", "行きます"]
        ]
      }
    },
    "Time に Vます": {
      topic: "Time particle に",
      title: "Specific time marker",
      brief: "Use `に` when the action happens at a specific clock time or date.",
      notes: [
        "Use it with exact times like `七時`, `月曜日`, or `一月一日`.",
        "Do not usually use `に` with vague time words like `今日` or `毎日`.",
        "This pattern helps place routines on a timeline."
      ],
      examples: [
        { jp: "七時に起きます。", en: "I wake up at seven." },
        { jp: "月曜日に勉強します。", en: "I study on Monday." }
      ],
      chart: {
        headers: ["Time expression", "Particle", "Action"],
        rows: [
          ["七時", "に", "起きます"],
          ["月曜日", "に", "勉強します"]
        ]
      }
    },
    "N じゃありません": {
      topic: "Negative noun form",
      title: "Polite negative noun sentence",
      brief: "Use this to say that something is not a noun category or identity.",
      notes: [
        "This is the negative partner of `N は B です`.",
        "It is common in polite speech and beginner conversation.",
        "You can use it for identity, job, nationality, or category."
      ],
      examples: [
        { jp: "先生じゃありません。", en: "I am not a teacher." },
        { jp: "日本人じゃありません。", en: "I am not Japanese." }
      ],
      chart: {
        headers: ["Positive", "Negative"],
        rows: [
          ["学生です", "学生じゃありません"],
          ["先生です", "先生じゃありません"]
        ]
      }
    },
    "い-adj + N": {
      topic: "い-adjective modifier",
      title: "Noun description with い-adjectives",
      brief: "Place an `い` adjective directly before a noun to describe it.",
      notes: [
        "Keep the final `い` when the adjective is before a noun.",
        "This is one of the fastest ways to build natural simple phrases.",
        "Many common beginner descriptions use this pattern."
      ],
      examples: [
        { jp: "新しい本です。", en: "It is a new book." },
        { jp: "大きいかばんです。", en: "It is a big bag." }
      ],
      chart: {
        headers: ["Adjective", "Noun", "Phrase"],
        rows: [
          ["新しい", "本", "新しい本"],
          ["大きい", "かばん", "大きいかばん"]
        ]
      }
    }
  },
  N4: {
    "Vて います": {
      topic: "て-form ongoing state",
      title: "Ongoing action and resulting state",
      brief: "Use `て います` for actions in progress and for some continuing states.",
      notes: [
        "For active actions, it often means `am doing`.",
        "With some verbs, it describes a current state like living, knowing, or wearing.",
        "The `て` form links the verb to the helper pattern."
      ],
      examples: [
        { jp: "今、本を読んでいます。", en: "I am reading a book now." },
        { jp: "東京に住んでいます。", en: "I live in Tokyo." }
      ],
      chart: {
        headers: ["Base idea", "Pattern", "Meaning"],
        rows: [
          ["読む", "読んでいます", "am reading"],
          ["住む", "住んでいます", "live / am living"]
        ]
      }
    },
    "Vた ことがあります": {
      topic: "Experience form",
      title: "Experience pattern",
      brief: "Use this to talk about having had an experience before.",
      notes: [
        "Put the verb in plain past form before `ことがあります`.",
        "It expresses experience, not simple past time.",
        "This is useful for travel, food, and activities."
      ],
      examples: [
        { jp: "京都へ行ったことがあります。", en: "I have been to Kyoto." },
        { jp: "すしを食べたことがあります。", en: "I have eaten sushi." }
      ],
      chart: {
        headers: ["Verb", "Past plain", "Experience form"],
        rows: [
          ["行く", "行った", "行ったことがあります"],
          ["食べる", "食べた", "食べたことがあります"]
        ]
      }
    },
    "Vないで ください": {
      topic: "Negative request",
      title: "Polite prohibition",
      brief: "Use this pattern to ask someone politely not to do something.",
      notes: [
        "Make the verb negative first, then add `で ください`.",
        "The tone is polite but still direct enough for signs and instructions.",
        "It is common in public notices and classroom rules."
      ],
      examples: [
        { jp: "ここで写真を撮らないでください。", en: "Please do not take photos here." },
        { jp: "入らないでください。", en: "Please do not enter." }
      ],
      chart: {
        headers: ["Verb", "Negative", "Request form"],
        rows: [
          ["撮る", "撮らない", "撮らないでください"],
          ["入る", "入らない", "入らないでください"]
        ]
      }
    },
    "Vる つもりです": {
      topic: "Intention form",
      title: "Intention",
      brief: "Use `つもりです` to show a clear intention or plan to do something.",
      notes: [
        "The verb before it is usually dictionary form for future intention.",
        "It sounds firmer than a casual idea or wish.",
        "This is common when explaining plans."
      ],
      examples: [
        { jp: "来年、日本へ行くつもりです。", en: "I intend to go to Japan next year." },
        { jp: "今夜、勉強するつもりです。", en: "I plan to study tonight." }
      ],
      chart: {
        headers: ["Verb", "Pattern", "Meaning"],
        rows: [
          ["行く", "行くつもりです", "intend to go"],
          ["勉強する", "勉強するつもりです", "intend to study"]
        ]
      }
    },
    "A ので B": {
      topic: "Reason pattern ので",
      title: "Reason with a softer tone",
      brief: "Use `ので` to connect a reason and result with a softer explanatory feel.",
      notes: [
        "It often sounds gentler and more explanatory than `から`.",
        "Put the reason before `ので`, then the result after it.",
        "It is common in polite explanations and excuses."
      ],
      examples: [
        { jp: "雨なので、家にいます。", en: "Because it is raining, I stay home." },
        { jp: "テストがあるので、勉強します。", en: "Because I have a test, I study." }
      ],
      chart: {
        headers: ["Reason", "Connector", "Result"],
        rows: [
          ["雨だ", "ので", "家にいます"],
          ["テストがある", "ので", "勉強します"]
        ]
      }
    },
    "Vながら": {
      topic: "Simultaneous actions",
      title: "Two actions at once",
      brief: "Use `ながら` when one person does two actions at the same time.",
      notes: [
        "The main action usually comes in the second half.",
        "The verb before `ながら` changes to the stem form.",
        "This pattern is common for everyday routines."
      ],
      examples: [
        { jp: "音楽を聞きながら勉強します。", en: "I study while listening to music." },
        { jp: "歩きながら話します。", en: "I talk while walking." }
      ],
      chart: {
        headers: ["Stem form", "Connector", "Main action"],
        rows: [
          ["聞き", "ながら", "勉強します"],
          ["歩き", "ながら", "話します"]
        ]
      }
    }
  }
};

export function slugifyGrammar(pattern: string) {
  return pattern
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getGrammarTopics(level: Level) {
  return course[level].grammar.map((topic, index) => {
    const lesson = lessonLibrary[level][topic.pattern];
    return {
      ...topic,
      slug: slugifyGrammar(lesson?.topic ?? `${topic.pattern}-${index + 1}`)
    };
  });
}

export function getGrammarTopicBySlug(level: Level, slug: string) {
  return getGrammarTopics(level).find((topic) => topic.slug === slug);
}

export function getGrammarTopicBySlugAny(slug: string) {
  for (const level of ["N5", "N4"] as Level[]) {
    const topic = getGrammarTopicBySlug(level, slug);
    if (topic) {
      return { level, topic };
    }
  }

  return null;
}

export function getGrammarLesson(level: Level, topic: Grammar) {
  return lessonLibrary[level][topic.pattern] ?? {
    topic: topic.meaning,
    title: topic.meaning,
    brief: topic.tip,
    notes: [topic.tip],
    examples: [{ jp: topic.example, en: "Study this structure in context." }]
  };
}
