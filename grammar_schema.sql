-- Create grammar lessons table
CREATE TABLE grammar_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL,
  pattern TEXT NOT NULL,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  brief TEXT NOT NULL,
  notes JSONB NOT NULL,
  examples JSONB NOT NULL,
  chart JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert N5 Grammar Data
INSERT INTO grammar_lessons (level, pattern, topic, title, brief, notes, examples, chart) VALUES
(
  'N5',
  'A は B です',
  'Topic particle は',
  'Topic statement',
  'Use this pattern to introduce or identify something in a polite sentence.',
  $$["は marks the topic, the thing you are talking about.", "です adds polite sentence ending tone.", "This is one of the core patterns for self-introduction and basic descriptions."]$$,
  $$[{"jp": "私は学生です。", "en": "I am a student."}, {"jp": "これは本です。", "en": "This is a book."}]$$,
  $${"headers": ["Part", "Role", "Example"], "rows": [["A", "topic", "私"], ["は", "topic marker", "は"], ["B", "identity / description", "学生"], ["です", "polite ending", "です"]]}$$
),
(
  'N5',
  'N を Vます',
  'Object particle を',
  'Direct object marker',
  'Use `を` before the noun that receives the action of the verb.',
  $$["を often appears with actions like eat, read, drink, watch, or write.", "The verb usually comes at the end of the sentence.", "This particle is pronounced `o` in speech."]$$,
  $$[{"jp": "パンを食べます。", "en": "I eat bread."}, {"jp": "本を読みます。", "en": "I read a book."}]$$,
  $${"headers": ["Noun", "Particle", "Verb"], "rows": [["パン", "を", "食べます"], ["本", "を", "読みます"]]}$$
),
(
  'N5',
  'Place へ 行きます',
  'Direction particle へ',
  'Movement toward a place',
  'Use `へ` with movement verbs when someone goes toward a destination.',
  $$["へ shows direction more than exact location.", "It is read as `e` when used as a particle.", "Common movement verbs are `行きます`, `来ます`, and `帰ります`."]$$,
  $$[{"jp": "学校へ行きます。", "en": "I go to school."}, {"jp": "駅へ行きます。", "en": "I go to the station."}]$$,
  $${"headers": ["Destination", "Particle", "Movement verb"], "rows": [["学校", "へ", "行きます"], ["駅", "へ", "行きます"]]}$$
),
(
  'N5',
  'Time に Vます',
  'Time particle に',
  'Specific time marker',
  'Use `に` when the action happens at a specific clock time or date.',
  $$["Use it with exact times like `七時`, `月曜日`, or `一月一日`.", "Do not usually use `に` with vague time words like `今日` or `毎日`.", "This pattern helps place routines on a timeline."]$$,
  $$[{"jp": "七時に起きます。", "en": "I wake up at seven."}, {"jp": "月曜日に勉強します。", "en": "I study on Monday."}]$$,
  $${"headers": ["Time expression", "Particle", "Action"], "rows": [["七時", "に", "起きます"], ["月曜日", "に", "勉強します"]]}$$
),
(
  'N5',
  'N じゃありません',
  'Negative noun form',
  'Polite negative noun sentence',
  'Use this to say that something is not a noun category or identity.',
  $$["This is the negative partner of `N は B です`.", "It is common in polite speech and beginner conversation.", "You can use it for identity, job, nationality, or category."]$$,
  $$[{"jp": "先生じゃありません。", "en": "I am not a teacher."}, {"jp": "日本人じゃありません。", "en": "I am not Japanese."}]$$,
  $${"headers": ["Positive", "Negative"], "rows": [["学生です", "学生じゃありません"], ["先生です", "先生じゃありません"]]}$$
),
(
  'N5',
  'い-adj + N',
  'い-adjective modifier',
  'Noun description with い-adjectives',
  'Place an `い` adjective directly before a noun to describe it.',
  $$["Keep the final `い` when the adjective is before a noun.", "This is one of the fastest ways to build natural simple phrases.", "Many common beginner descriptions use this pattern."]$$,
  $$[{"jp": "新しい本です。", "en": "It is a new book."}, {"jp": "大きいかばんです。", "en": "It is a big bag."}]$$,
  $${"headers": ["Adjective", "Noun", "Phrase"], "rows": [["新しい", "本", "新しい本"], ["大きい", "かばん", "大きいかばん"]]}$$
);

-- Insert N4 Grammar Data
INSERT INTO grammar_lessons (level, pattern, topic, title, brief, notes, examples, chart) VALUES
(
  'N4',
  'Vて います',
  'て-form ongoing state',
  'Ongoing action and resulting state',
  'Use `て います` for actions in progress and for some continuing states.',
  $$["For active actions, it often means `am doing`.", "With some verbs, it describes a current state like living, knowing, or wearing.", "The `て` form links the verb to the helper pattern."]$$,
  $$[{"jp": "今、本を読んでいます。", "en": "I am reading a book now."}, {"jp": "東京に住んでいます。", "en": "I live in Tokyo."}]$$,
  $${"headers": ["Base idea", "Pattern", "Meaning"], "rows": [["読む", "読んでいます", "am reading"], ["住む", "住んでいます", "live / am living"]]}$$
),
(
  'N4',
  'Vた ことがあります',
  'Experience form',
  'Experience pattern',
  'Use this to talk about having had an experience before.',
  $$["Put the verb in plain past form before `ことがあります`.", "It expresses experience, not simple past time.", "This is useful for travel, food, and activities."]$$,
  $$[{"jp": "京都へ行ったことがあります。", "en": "I have been to Kyoto."}, {"jp": "すしを食べたことがあります。", "en": "I have eaten sushi."}]$$,
  $${"headers": ["Verb", "Past plain", "Experience form"], "rows": [["行く", "行った", "行ったことがあります"], ["食べる", "食べた", "食べたことがあります"]]}$$
),
(
  'N4',
  'Vないで ください',
  'Negative request',
  'Polite prohibition',
  'Use this pattern to ask someone politely not to do something.',
  $$["Make the verb negative first, then add `で ください`.", "The tone is polite but still direct enough for signs and instructions.", "It is common in public notices and classroom rules."]$$,
  $$[{"jp": "ここで写真を撮らないでください。", "en": "Please do not take photos here."}, {"jp": "入らないでください。", "en": "Please do not enter."}]$$,
  $${"headers": ["Verb", "Negative", "Request form"], "rows": [["撮る", "撮らない", "撮らないでください"], ["入る", "入らない", "入らないでください"]]}$$
),
(
  'N4',
  'Vる つもりです',
  'Intention form',
  'Intention',
  'Use `つもりです` to show a clear intention or plan to do something.',
  $$["The verb before it is usually dictionary form for future intention.", "It sounds firmer than a casual idea or wish.", "This is common when explaining plans."]$$,
  $$[{"jp": "来年、日本へ行くつもりです。", "en": "I intend to go to Japan next year."}, {"jp": "今夜、勉強するつもりです。", "en": "I plan to study tonight."}]$$,
  $${"headers": ["Verb", "Pattern", "Meaning"], "rows": [["行く", "行くつもりです", "intend to go"], ["勉強する", "勉強するつもりです", "intend to study"]]}$$
),
(
  'N4',
  'A ので B',
  'Reason pattern ので',
  'Reason with a softer tone',
  'Use `ので` to connect a reason and result with a softer explanatory feel.',
  $$["It often sounds gentler and more explanatory than `から`.", "Put the reason before `ので`, then the result after it.", "It is common in polite explanations and excuses."]$$,
  $$[{"jp": "雨なので、家にいます。", "en": "Because it is raining, I stay home."}, {"jp": "テストがあるので、勉強します。", "en": "Because I have a test, I study."}]$$,
  $${"headers": ["Reason", "Connector", "Result"], "rows": [["雨だ", "ので", "家にいます"], ["テストがある", "ので", "勉強します"]]}$$
),
(
  'N4',
  'Vながら',
  'Simultaneous actions',
  'Two actions at once',
  'Use `ながら` when one person does two actions at the same time.',
  $$["The main action usually comes in the second half.", "The verb before `ながら` changes to the stem form.", "This pattern is common for everyday routines."]$$,
  $$[{"jp": "音楽を聞きながら勉強します。", "en": "I study while listening to music."}, {"jp": "歩きながら話します。", "en": "I talk while walking."}]$$,
  $${"headers": ["Stem form", "Connector", "Main action"], "rows": [["聞き", "ながら", "勉強します"], ["歩き", "ながら", "話します"]]}$$
);
