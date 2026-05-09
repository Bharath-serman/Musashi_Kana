# Minato JLPT Studio

Minato JLPT Studio is a Next.js learning app for JLPT N5 and N4 practice. It includes focused study rooms for vocabulary flashcards, grammar, reading, writing, quizzes, and a guided roadmap.

## Features

- N5 and N4 study tracks with separate learning content.
- Dashboard with study progress, task tracking, and quick navigation.
- Flashcards for vocabulary and kanji recall.
- Grammar notes with examples and study tips.
- Reading passages with translations and comprehension questions.
- Writing practice screen for kana and kanji drills.
- Checkpoint quiz for quick review.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- ESLint
- Lucide React icons

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
npm run dev
```

Runs the app locally in development mode.

```bash
npm run build
```

Builds the app for production.

```bash
npm run lint
```

Runs ESLint across the project.

```bash
npm run typecheck
```

Runs TypeScript type checking without emitting files.

## Project Structure

```text
app/
  components/      Shared layout and learning state components
  flashcards/      Vocabulary and kanji flashcards
  grammar/         Grammar study room
  quiz/            Checkpoint quiz
  reading/         Reading practice
  roadmap/         Study roadmap
  writing/         Writing practice
  data.ts          N5 and N4 course content
public/
  study-scene.png  Dashboard visual asset
```

## Notes

The app stores study progress in the browser, so progress is local to the device and browser profile being used.
