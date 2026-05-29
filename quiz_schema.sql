-- Create quiz_questions table
-- Each question belongs to a level (N5 or N4) and has a prompt, up to 4 choices, and the correct answer.
-- The app shuffles choices at runtime — store them in their natural order here.

CREATE TABLE quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('N5', 'N4')),
  prompt TEXT NOT NULL,
  choice_1 TEXT NOT NULL,
  choice_2 TEXT NOT NULL,
  choice_3 TEXT NOT NULL,
  choice_4 TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read quiz questions (public read)
CREATE POLICY "Allow public read" ON quiz_questions
  FOR SELECT USING (true);

-- Seed with existing N5 questions
INSERT INTO quiz_questions (level, prompt, choice_1, choice_2, choice_3, choice_4, answer) VALUES
  ('N5', '学生 means...', 'student', 'teacher', 'station', 'library', 'student'),
  ('N5', 'Which particle marks a direct object?', 'を', 'へ', 'に', 'は', 'を'),
  ('N5', '水をください means...', 'Please give me water', 'I go to water', 'Water is big', 'Today is water', 'Please give me water'),
  ('N5', '駅へ行きます means...', 'I go to the station', 'I eat at the station', 'The station is big', 'I read a station', 'I go to the station');

-- Seed with existing N4 questions
INSERT INTO quiz_questions (level, prompt, choice_1, choice_2, choice_3, choice_4, answer) VALUES
  ('N4', 'Vたことがあります expresses...', 'experience', 'prohibition', 'comparison', 'location', 'experience'),
  ('N4', '予約が必要です means...', 'A reservation is necessary', 'The station is far', 'I compare reservations', 'Please do not reserve', 'A reservation is necessary'),
  ('N4', 'Which form fits: 音楽を聞き___勉強します。', 'ながら', 'ので', 'つもり', 'こと', 'ながら'),
  ('N4', '雨なので、家にいます means...', 'Because it is raining, I stay home', 'Although it rains, I go home', 'I intend to rain', 'Please do not rain', 'Because it is raining, I stay home');
