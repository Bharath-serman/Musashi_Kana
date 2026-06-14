"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppFrame, PageHeader } from "../../components/app-frame";
import { useLearning } from "../../components/learning-state";
import { course } from "../../data";

type KanaSection = {
  title: string;
  symbols: string[];
};

type Point = {
  x: number;
  y: number;
};

type StrokeKind = "horizontal" | "vertical" | "diagonal" | "curve" | "loop";

const passingScore = 30;
const hiragana = ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と", "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ", "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "を", "ん"];
const katakana = ["ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ", "サ", "シ", "ス", "セ", "ソ", "タ", "チ", "ツ", "テ", "ト", "ナ", "ニ", "ヌ", "ネ", "ノ", "ハ", "ヒ", "フ", "ヘ", "ホ", "マ", "ミ", "ム", "メ", "モ", "ヤ", "ユ", "ヨ", "ラ", "リ", "ル", "レ", "ロ", "ワ", "ヲ", "ン"];

const hiraganaRomaji: Record<string, string> = {
  "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
  "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
  "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so",
  "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
  "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
  "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
  "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
  "や": "ya", "ゆ": "yu", "よ": "yo",
  "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
  "わ": "wa", "を": "wo", "ん": "n"
};

const katakanaRomaji: Record<string, string> = {
  "ア": "a", "イ": "i", "ウ": "u", "エ": "e", "オ": "o",
  "カ": "ka", "キ": "ki", "ク": "ku", "ケ": "ke", "コ": "ko",
  "サ": "sa", "シ": "shi", "ス": "su", "セ": "se", "ソ": "so",
  "タ": "ta", "チ": "chi", "ツ": "tsu", "テ": "te", "ト": "to",
  "ナ": "na", "ニ": "ni", "ヌ": "nu", "ネ": "ne", "ノ": "no",
  "ハ": "ha", "ヒ": "hi", "フ": "fu", "ヘ": "he", "ホ": "ho",
  "マ": "ma", "ミ": "mi", "ム": "mu", "メ": "me", "モ": "mo",
  "ヤ": "ya", "ユ": "yu", "ヨ": "yo",
  "ラ": "ra", "リ": "ri", "ル": "ru", "レ": "re", "ロ": "ro",
  "ワ": "wa", "ヲ": "wo", "ン": "n"
};

const getKanjiRomaji = (symbol: string): string => {
  const kanjiItem = [...course.N5.kanji, ...course.N4.kanji].find(item => item.front === symbol);
  if (kanjiItem) {
    const reading = kanjiItem.reading.split("・")[0].split("/")[0].trim();
    return reading;
  }
  return symbol;
};

const getRomaji = (symbol: string): string => {
  if (hiraganaRomaji[symbol]) return hiraganaRomaji[symbol];
  if (katakanaRomaji[symbol]) return katakanaRomaji[symbol];
  return getKanjiRomaji(symbol);
};

export default function WritingPage() {
  return (
    <AppFrame>
      <Writing />
    </AppFrame>
  );
}

function Writing() {
  const { level, setProgress } = useLearning();
  const writingSections = useMemo(() => buildWritingSections(level), [level]);
  const [activeSectionTitle, setActiveSectionTitle] = useState(writingSections[0].title);
  const [writingSymbol, setWritingSymbol] = useState(writingSections[0].symbols[0]);
  const [completedSymbols, setCompletedSymbols] = useState<Set<string>>(() => new Set());
  const [completedSectionTitle, setCompletedSectionTitle] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error" | "idle"; text: string }>({
    tone: "idle",
    text: "Draw the character, then check your accuracy."
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Point[][]>([]);
  const activeStrokeRef = useRef<Point[] | null>(null);

  const activeSection = useMemo(
    () => writingSections.find((section) => section.symbols.includes(writingSymbol)) ?? writingSections[0],
    [writingSections, writingSymbol]
  );
  const visibleSection = writingSections.find((section) => section.title === activeSectionTitle) ?? writingSections[0];

  useEffect(() => {
    setActiveSectionTitle(writingSections[0].title);
    setWritingSymbol(writingSections[0].symbols[0]);
    setCompletedSectionTitle(null);
    setFeedback({ tone: "idle", text: "Draw the character, then check your accuracy." });
  }, [writingSections]);

  const drawGuide = useCallback((symbol: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.font = "360px 'Yu Gothic', 'Meiryo', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(41, 62, 102, 0.57)";
    ctx.fillText(symbol, canvas.width / 2, canvas.height / 2 + 10);
    ctx.restore();
  }, []);

  const clearCanvas = useCallback((symbol = writingSymbol) => {
    strokesRef.current = [];
    activeStrokeRef.current = null;
    drawGuide(symbol);
  }, [drawGuide, writingSymbol]);

  useEffect(() => {
    clearCanvas(writingSymbol);
  }, [clearCanvas, writingSymbol]);

  function selectSymbol(symbol: string) {
    setWritingSymbol(symbol);
    setFeedback({ tone: "idle", text: "Draw the character, then check your accuracy." });
  }

  function selectSection(section: KanaSection) {
    setActiveSectionTitle(section.title);
    setWritingSymbol(section.symbols[0]);
    setCompletedSectionTitle(null);
    setFeedback({ tone: "idle", text: "Draw the character, then check your accuracy." });
  }

  function setupDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.setPointerCapture(event.pointerId);
    const point = getCanvasPoint(canvas, event.clientX, event.clientY);
    const stroke = [point];
    strokesRef.current.push(stroke);
    activeStrokeRef.current = stroke;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }

  function drawStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    if (event.buttons !== 1 || !activeStrokeRef.current) return;
    const canvas = event.currentTarget;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const point = getCanvasPoint(canvas, event.clientX, event.clientY);
    activeStrokeRef.current.push(point);
    ctx.lineTo(point.x, point.y);
    ctx.lineWidth = 17;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#fffb002a";  //Writing Stroke Color.
    ctx.stroke();
  }

  function finishStroke() {
    activeStrokeRef.current = null;
  }

  function checkAccuracy() {
    if (strokesRef.current.length === 0) {
      setFeedback({ tone: "error", text: "Draw the character first, then check it." });
      return;
    }

    const score = measureAccuracy(writingSymbol, strokesRef.current);

    if (score >= passingScore) {
      const alreadyCompleted = completedSymbols.has(writingSymbol);
      const nextCompleted = new Set(completedSymbols);
      nextCompleted.add(writingSymbol);
      setCompletedSymbols(nextCompleted);
      if (!alreadyCompleted) {
        const isHiragana = hiragana.includes(writingSymbol);
        const isKatakana = katakana.includes(writingSymbol);
        setProgress((current) => ({
          ...current,
          writing: current.writing + 1,
          dailyActions: {
            ...current.dailyActions,
            writing: current.dailyActions.writing + 1,
            ...(isHiragana ? { hiraganaLearned: current.dailyActions.hiraganaLearned + 1 } : {}),
            ...(isKatakana ? { katakanaLearned: current.dailyActions.katakanaLearned + 1 } : {})
          }
        }));
      }
      const isSectionComplete = visibleSection.symbols.every((symbol) => nextCompleted.has(symbol));

      if (isSectionComplete) {
        setFeedback({ tone: "success", text: `${score}% accuracy. ${visibleSection.title} complete.` });
        setCompletedSectionTitle(visibleSection.title);
        return;
      }

      setFeedback({ tone: "success", text: `${score}% accuracy. Nice match. Moving to the next character.` });

      const nextSymbol = findNextSymbol(writingSymbol, nextCompleted, visibleSection.symbols);
      window.setTimeout(() => {
        setWritingSymbol(nextSymbol);
        setFeedback({ tone: "idle", text: "Draw the character, then check your accuracy." });
      }, 700);
      return;
    }

    setFeedback({ tone: "error", text: `${score}% accuracy. Aim for ${passingScore}% or higher, then try again.` });
  }

  return (
    <>
      <PageHeader
        eyebrow="Output"
        title={`${level} writing practice`}  //Title of the page.
        text={level === "N5"
          ? "Practice Hiragana, Katakana, and your N5 kanji set. Draw over the guide, check accuracy, and complete each slot once your shape matches well enough."
          : "Practice the N4 kanji set here. Draw over the guide, check accuracy, and complete each slot once your shape matches well enough."}
        action={<div className="copy-target">{writingSymbol}</div>}
      />

      <section className="panel writing-panel">
        {completedSectionTitle ? (
          <div className="completion-modal" role="dialog" aria-modal="true" aria-labelledby="section-complete-title">
            <div className="completion-modal-card">
              <span>Section complete</span>
              <h2 id="section-complete-title">You finished {completedSectionTitle}</h2>
              <p>
                {writingSections.length > 1
                  ? "Your character slots are saved in green. Switch tabs whenever you want to start the next set."
                  : "Your character slots are saved in green. You can keep reviewing this set whenever you want."}
              </p>
              <button onClick={() => setCompletedSectionTitle(null)} type="button">Keep practicing</button>
            </div>
          </div>
        ) : null}

        <div className="kana-tabs" role="tablist" aria-label="Kana sections">
          {writingSections.map((section) => (
            <button
              aria-selected={activeSectionTitle === section.title}
              className={activeSectionTitle === section.title ? "active" : ""}
              key={section.title}
              onClick={() => selectSection(section)}
              role="tab"
              type="button"
            >
              {section.title}
            </button>
          ))}
        </div>

        <section className="kana-section">
          <div className="symbol-grid">
            {visibleSection.symbols.map((symbol) => {
              const isCompleted = completedSymbols.has(symbol);
              const isActive = writingSymbol === symbol;
              const romaji = getRomaji(symbol);
              return (
                <button
                  className={`${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                  key={symbol}
                  onClick={() => selectSymbol(symbol)}
                  type="button"
                >
                  <span className="symbol-character">{symbol}</span>
                  <span className="symbol-romaji">{romaji}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="writing-workspace">
          <div>
            <canvas
              aria-label="Writing practice canvas"
              height={520}
              onPointerCancel={finishStroke}
              onPointerDown={setupDrawing}
              onPointerLeave={finishStroke}
              onPointerMove={drawStroke}
              onPointerUp={finishStroke}
              ref={canvasRef}
              width={520}
            />
            <div className="control-row two">
              <button
                onClick={() => {
                  clearCanvas();
                  setFeedback({ tone: "idle", text: "Canvas cleared. Draw it again when ready." });
                }}
                type="button"
              >
                Clear
              </button>
              <button className="success-button" onClick={checkAccuracy} type="button">
                Mark complete
              </button>
            </div>
            <p className={`accuracy-feedback ${feedback.tone}`}>{feedback.text}</p>
          </div>
          <aside className="stroke-order-card" aria-label={`${writingSymbol} stroke order`}>
            <StrokeOrderVisualizer symbol={writingSymbol} sectionTitle={activeSection.title} />
            <p className="stroke-order-note">Build the character in order, one boxed stroke at a time.</p>
          </aside>
        </div>
      </section>
    </>
  );
}

function StrokeOrderVisualizer({ symbol, sectionTitle }: { symbol: string; sectionTitle: string }) {
  const [paths, setPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSvg() {
      setLoading(true);
      try {
        const hex = symbol.charCodeAt(0).toString(16).padStart(5, "0");
        const url = `https://cdn.jsdelivr.net/gh/kanjivg/kanjivg@master/kanji/${hex}.svg`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("SVG not found");
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "image/svg+xml");
        const pathElements = Array.from(doc.querySelectorAll("path"));
        const dValues = pathElements.map((p) => p.getAttribute("d") || "");
        setPaths(dValues);
      } catch (err) {
        setPaths([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSvg();
  }, [symbol]);

  if (loading) {
    return (
      <div className="stroke-order-board">
        <div className="stroke-order-loading">Fetching stroke data for {symbol}...</div>
      </div>
    );
  }

  if (paths.length === 0) {
    return (
      <div className="stroke-order-board">
        <div className="stroke-order-error">Visual stroke guide unavailable for {symbol}</div>
      </div>
    );
  }

  return (
    <>
      <span>{sectionTitle}</span>
      <h2>{symbol} stroke order</h2>
      <div className="stroke-order-board">
        <div className="stroke-step-preview final hero">
          <svg viewBox="0 0 109 109" className="stroke-order-svg">
            {paths.map((p, j) => (
              <path key={`hero-${j}`} d={p} className="stroke-path past" style={{ stroke: "#4169e1", strokeWidth: 3.5 }} />
            ))}
          </svg>
        </div>
        {paths.map((path, i) => (
          <div key={i} className="stroke-step-preview">
            <span className="stroke-step-number">{i + 1}</span>
            <svg viewBox="0 0 109 109" className="stroke-order-svg">
              {paths.map((p, j) => (
                <path key={`ghost-${j}`} d={p} className="stroke-path ghost" />
              ))}
              {/* ONLY the Current stroke for this box */}
              <path d={paths[i]} className="stroke-path current" />
            </svg>
          </div>
        ))}
      </div>
    </>
  );
}

function getCanvasPoint(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * canvas.width,
    y: ((clientY - rect.top) / rect.height) * canvas.height
  };
}

function findNextSymbol(currentSymbol: string, completedSymbols: Set<string>, symbols: string[]) {
  const currentIndex = symbols.indexOf(currentSymbol);
  for (let offset = 1; offset <= symbols.length; offset += 1) {
    const candidate = symbols[(currentIndex + offset) % symbols.length];
    if (!completedSymbols.has(candidate)) return candidate;
  }
  return currentSymbol;
}

function buildWritingSections(level: "N5" | "N4") {
  if (level === "N5") {
    return [
      { title: "Hiragana", symbols: hiragana },
      { title: "Katakana", symbols: katakana },
      { title: "N5 Kanji", symbols: uniqueSymbols([...course.N5.kanji.map((item) => item.front), ...course.N5.writing.filter(isKanjiLike)]) }
    ];
  }

  return [
    { title: "N4 Kanji", symbols: uniqueSymbols(course.N4.writing.filter(isKanjiLike)) }
  ];
}

function uniqueSymbols(symbols: string[]) {
  return [...new Set(symbols)];
}

function isKanjiLike(symbol: string) {
  return !hiragana.includes(symbol) && !katakana.includes(symbol);
}

function measureAccuracy(symbol: string, strokes: Point[][]) {
  const size = 520;
  const targetCanvas = document.createElement("canvas");
  const drawingCanvas = document.createElement("canvas");
  targetCanvas.width = size;
  targetCanvas.height = size;
  drawingCanvas.width = size;
  drawingCanvas.height = size;

  const targetCtx = targetCanvas.getContext("2d");
  const drawingCtx = drawingCanvas.getContext("2d");
  if (!targetCtx || !drawingCtx) return 0;

  targetCtx.font = "360px 'Yu Gothic', 'Meiryo', sans-serif";
  targetCtx.textAlign = "center";
  targetCtx.textBaseline = "middle";
  targetCtx.fillStyle = "#000";
  targetCtx.fillText(symbol, size / 2, size / 2 + 10);

  drawingCtx.lineWidth = 34;
  drawingCtx.lineCap = "round";
  drawingCtx.lineJoin = "round";
  drawingCtx.strokeStyle = "#000";
  strokes.forEach((stroke) => {
    if (stroke.length === 0) return;
    drawingCtx.beginPath();
    drawingCtx.moveTo(stroke[0].x, stroke[0].y);
    stroke.slice(1).forEach((point) => drawingCtx.lineTo(point.x, point.y));
    drawingCtx.stroke();
  });

  const targetPixels = targetCtx.getImageData(0, 0, size, size).data;
  const drawingPixels = drawingCtx.getImageData(0, 0, size, size).data;
  let targetCount = 0;
  let drawingCount = 0;
  let overlapCount = 0;

  for (let index = 3; index < targetPixels.length; index += 16) {
    const isTarget = targetPixels[index] > 40;
    const isDrawing = drawingPixels[index] > 40;
    if (isTarget) targetCount += 1;
    if (isDrawing) drawingCount += 1;
    if (isTarget && isDrawing) overlapCount += 1;
  }

  if (targetCount === 0 || drawingCount === 0) return 0;

  const coverage = overlapCount / targetCount;
  const precision = overlapCount / drawingCount;
  const rawScore = Math.min(100, (precision * 0.55 + coverage * 0.45) * 100);

  if (coverage < 0.12) return Math.min(45, Math.round(rawScore));
  if (precision < 0.45) return Math.min(55, Math.round(rawScore));

  return Math.round(rawScore);
}
