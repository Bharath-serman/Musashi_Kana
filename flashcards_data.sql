-- Add type column to flashcards table
ALTER TABLE flashcards ADD COLUMN type TEXT;

-- Insert N5 Flashcards
INSERT INTO flashcards (level, type, front, reading, meaning, example, note) VALUES
-- Vocab
('N5', 'vocab', 'こんにちは', 'konnichiwa', 'hello', 'こんにちは。いい天気ですね。', 'Daytime greeting.'),
('N5', 'vocab', '学生', 'がくせい / gakusei', 'student', '私は学生です。', 'Common identity noun.'),
('N5', 'vocab', '水', 'みず / mizu', 'water', '水をください。', 'Useful request word.'),
('N5', 'vocab', '行きます', 'いきます / ikimasu', 'to go', '学校へ行きます。', 'Often pairs with へ.'),
('N5', 'vocab', '大きい', 'おおきい / ookii', 'big', '大きいかばんです。', 'い-adjective.'),
('N5', 'vocab', '今日', 'きょう / kyou', 'today', '今日は休みです。', 'Time expression.'),
('N5', 'vocab', '友だち', 'ともだち / tomodachi', 'friend', '友だちと話します。', 'と means with.'),
('N5', 'vocab', '食べます', 'たべます / tabemasu', 'to eat', 'パンを食べます。', 'る-verb polite form.'),
-- Kanji
('N5', 'kanji', '日', 'にち・ひ', 'sun; day', '日曜日に休みます。', 'Appears in days of week.'),
('N5', 'kanji', '月', 'げつ・つき', 'moon; month', '月曜日に会います。', 'Also month counter.'),
('N5', 'kanji', '人', 'ひと・じん', 'person', 'あの人は先生です。', 'Nationality suffix uses じん.'),
('N5', 'kanji', '山', 'やま', 'mountain', '山が見えます。', 'Simple pictographic kanji.'),
('N5', 'kanji', '川', 'かわ', 'river', '川のそばにあります。', 'Three flowing strokes.'),
('N5', 'kanji', '本', 'ほん', 'book; origin', '本を読みます。', 'Also appears in 日本.'),
-- Numbers
('N5', 'numbers', '一', 'いち', 'one', '一人がいます。', 'Basic number'),
('N5', 'numbers', '二', 'に', 'two', '二時です。', 'Basic number'),
-- Particles
('N5', 'particles', 'は', 'wa', 'topic marker', 'これは本です。', 'Grammar particle'),
('N5', 'particles', 'を', 'o', 'object marker', '水を飲みます。', 'Grammar particle');

-- Insert N4 Flashcards
INSERT INTO flashcards (level, type, front, reading, meaning, example, note) VALUES
-- Vocab
('N4', 'vocab', '予定', 'よてい / yotei', 'plan; schedule', '週末の予定があります。', 'Useful for plans.'),
('N4', 'vocab', '説明します', 'せつめいします / setsumei shimasu', 'to explain', '先生が文法を説明します。', 'する-verb.'),
('N4', 'vocab', '必要', 'ひつよう / hitsuyou', 'necessary', '予約が必要です。', 'Often takes が.'),
('N4', 'vocab', '比べます', 'くらべます / kurabemasu', 'to compare', '二つの答えを比べます。', 'Transitive verb.'),
('N4', 'vocab', '特に', 'とくに / tokuni', 'especially', '漢字が特に難しいです。', 'Adverbial emphasis.'),
('N4', 'vocab', '習慣', 'しゅうかん / shuukan', 'habit', '毎日読む習慣があります。', 'Study routine word.'),
('N4', 'vocab', '間に合います', 'まにあいます / maniaimasu', 'to be on time', '電車に間に合いました。', 'Pairs with に.'),
('N4', 'vocab', '残念', 'ざんねん / zannen', 'unfortunate', '残念ですが、行けません。', 'Common polite phrase.'),
-- Kanji
('N4', 'kanji', '駅', 'えき', 'station', '駅で友だちを待っています。', 'Transport kanji.'),
('N4', 'kanji', '店', 'みせ', 'shop', '新しい店が開きました。', 'Everyday place.'),
('N4', 'kanji', '病', 'びょう', 'illness', '病院へ行きました。', 'Part of 病院.'),
('N4', 'kanji', '強', 'つよい・きょう', 'strong', '強い雨が降っています。', 'い-adjective root.'),
('N4', 'kanji', '弱', 'よわい', 'weak', '漢字が少し弱いです。', 'Opposite of 強い.'),
('N4', 'kanji', '運', 'はこぶ・うん', 'carry; luck', '荷物を運びます。', 'Appears in 運動.'),
-- Numbers
('N4', 'numbers', '三', 'さん', 'three', '三日です。', 'Basic number'),
('N4', 'numbers', '四', 'よん / し', 'four', '四時です。', 'Basic number'),
-- Particles
('N4', 'particles', 'で', 'de', 'location/method marker', '駅で待ちます。', 'Grammar particle'),
('N4', 'particles', 'と', 'to', 'with marker', '友だちと話します。', 'Grammar particle');
