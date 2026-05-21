import type { Metadata } from "next";
import "./globals.css";
import { LearningProvider } from "./components/learning-state";

export const metadata: Metadata = {
  title: "Musashi_Kana JLPT Studio",
  description:
    "A rich JLPT N5 and N4 learning workspace with flashcards, drills, reading, writing, and quizzes."
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LearningProvider>
          {children}
        </LearningProvider>
      </body>
    </html>
  );
}
