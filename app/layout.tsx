import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Musashi_Kana JLPT Studio",
  description: "A rich JLPT N5 and N4 learning workspace with flashcards, drills, reading, writing, and quizzes."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
