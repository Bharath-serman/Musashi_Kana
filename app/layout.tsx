import type { Metadata } from "next";
import { Inter, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { LearningProvider } from "./components/learning-state";
import { AuthProvider } from "./components/auth-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSerifJp = Noto_Serif_JP({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-noto-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Musashi_Kana ",
  description:
    "A rich JLPT N5 and N4 learning workspace with flashcards, drills, reading, writing, and quizzes."
};

const themeScript = `
  (function() {
    try {
      var t = localStorage.getItem('musashi-kana-theme');
      if (t === 'dark' || t === 'light') {
        document.documentElement.setAttribute('data-theme', t);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch(e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSerifJp.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AuthProvider>
          <LearningProvider>
            {children}
          </LearningProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

