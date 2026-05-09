"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppFrame, PageHeader } from "../components/app-frame";
import { useLearning } from "../components/learning-state";
import { course } from "../data";

type KanaSection = {
  title: string;
  symbols: string[];
};

type Point = {
  x: number;
  y: number;
};

type StrokeKind = "horizontal" | "vertical" | "diagonal" | "curve" | "loop";

const passingScore = 60;
const hiragana = ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と", "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ", "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り", "る", "れ", "ろ", "わ", "を", "ん"];
const katakana = ["ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ", "サ", "シ", "ス", "セ", "ソ", "タ", "チ", "ツ", "テ", "ト", "ナ", "ニ", "ヌ", "ネ", "ノ", "ハ", "ヒ", "フ", "ヘ", "ホ", "マ", "ミ", "ム", "メ", "モ", "ヤ", "ユ", "ヨ", "ラ", "リ", "ル", "レ", "ロ", "ワ", "ヲ", "ン"];

const strokeOrders: Record<string, string[]> = {
  あ: ["Left curved vertical stroke.", "Top horizontal stroke.", "Large looping stroke through the center."],
  い: ["Left curved down stroke.", "Shorter right curved down stroke."],
  う: ["Small top stroke.", "Main curved stroke from upper left around to the right."],
  え: ["Small top stroke.", "Horizontal stroke, then sweep down and right."],
  お: ["Horizontal stroke.", "Vertical stroke with lower loop.", "Small right-side dot."],
  か: ["Left vertical curve with hook.", "Upper-right angled stroke.", "Small right-side stroke."],
  き: ["Top horizontal stroke.", "Second horizontal stroke.", "Long curved lower stroke."],
  く: ["Single angled stroke from upper right to lower right through the left point."],
  け: ["Left vertical stroke.", "Right horizontal stroke.", "Right vertical curve."],
  こ: ["Upper horizontal stroke.", "Lower horizontal stroke."],
  さ: ["Top horizontal stroke.", "Middle horizontal stroke.", "Lower curved stroke."],
  し: ["Single long stroke curving from top left to lower right."],
  す: ["Top horizontal stroke.", "Vertical stroke through the center, looping at the bottom."],
  せ: ["Long horizontal stroke.", "Left vertical stroke.", "Right vertical stroke with turn."],
  そ: ["Top angled stroke.", "Long sweeping curve across and down."],
  た: ["Left horizontal stroke.", "Left vertical stroke.", "Upper-right horizontal stroke.", "Lower-right horizontal stroke."],
  ち: ["Top horizontal stroke.", "Curved stroke down and around to the right."],
  つ: ["Single curved stroke from left to right."],
  て: ["Single stroke across, down, then sweeping left."],
  と: ["Short diagonal stroke.", "Long curved lower stroke."],
  な: ["Left horizontal stroke.", "Left vertical stroke.", "Right diagonal stroke.", "Looping lower-right stroke."],
  に: ["Left vertical stroke.", "Upper-right horizontal stroke.", "Lower-right horizontal stroke."],
  ぬ: ["Left curved stroke.", "Large looping stroke crossing through the center."],
  ね: ["Left vertical stroke.", "Right looping stroke with final sweep."],
  の: ["Single circular stroke starting near the top."],
  は: ["Left vertical stroke.", "Right horizontal stroke.", "Right vertical stroke with loop."],
  ひ: ["Single wide curved stroke from left to right."],
  ふ: ["Small top stroke.", "Left lower stroke.", "Right lower stroke.", "Center sweeping stroke."],
  へ: ["Single angled roof stroke."],
  ほ: ["Left vertical stroke.", "Top horizontal stroke.", "Middle horizontal stroke.", "Right vertical loop."],
  ま: ["Top horizontal stroke.", "Middle horizontal stroke.", "Vertical stroke with lower loop."],
  み: ["Upper curved stroke.", "Long sweeping stroke around the lower side."],
  む: ["Left vertical stroke.", "Looping middle stroke.", "Small right-side stroke."],
  め: ["Left curved stroke.", "Large crossing loop stroke."],
  も: ["Horizontal stroke.", "Second horizontal stroke.", "Vertical curved stroke."],
  や: ["Short left stroke.", "Main stroke through the center.", "Small upper-right stroke."],
  ゆ: ["Left vertical curve.", "Large right loop stroke."],
  よ: ["Top horizontal stroke.", "Vertical stroke with lower curve."],
  ら: ["Small top stroke.", "Main curved lower stroke."],
  り: ["Left short down stroke.", "Right longer down stroke."],
  る: ["Angled top stroke continuing into a lower loop."],
  れ: ["Left vertical stroke.", "Right zig-zag stroke with final sweep."],
  ろ: ["Angled top stroke continuing into a lower curve."],
  わ: ["Left vertical stroke.", "Right looping stroke."],
  を: ["Top horizontal stroke.", "Middle angled stroke.", "Lower sweeping stroke."],
  ん: ["Single stroke curving down, up, then right."],
  ア: ["Top horizontal stroke with downward turn.", "Down-left diagonal stroke."],
  イ: ["Long left-falling diagonal stroke.", "Vertical stroke."],
  ウ: ["Small top stroke.", "Outer angled frame.", "Inner vertical stroke."],
  エ: ["Top horizontal stroke.", "Center vertical stroke.", "Bottom horizontal stroke."],
  オ: ["Top horizontal stroke.", "Vertical stroke with hook.", "Left-falling diagonal stroke."],
  カ: ["Top horizontal stroke with downward turn.", "Diagonal stroke down left."],
  キ: ["Top horizontal stroke.", "Second horizontal stroke.", "Vertical stroke."],
  ク: ["Short upper stroke.", "Long diagonal stroke down left."],
  ケ: ["Short upper-left stroke.", "Top horizontal stroke.", "Long vertical stroke."],
  コ: ["Top horizontal stroke with right side.", "Bottom horizontal stroke."],
  サ: ["Left vertical stroke.", "Right vertical stroke.", "Top horizontal stroke."],
  シ: ["Short upper-left stroke.", "Short middle-left stroke.", "Long sweeping lower stroke."],
  ス: ["Top angled stroke.", "Long diagonal crossing stroke."],
  セ: ["Horizontal stroke.", "Vertical stroke with turn."],
  ソ: ["Short left stroke.", "Long right diagonal stroke."],
  タ: ["Short top stroke.", "Outer diagonal stroke.", "Inner diagonal stroke."],
  チ: ["Top horizontal stroke.", "Middle horizontal stroke.", "Vertical stroke."],
  ツ: ["Short upper-left stroke.", "Short middle-left stroke.", "Long right diagonal stroke."],
  テ: ["Top horizontal stroke.", "Middle horizontal stroke.", "Vertical stroke."],
  ト: ["Vertical stroke.", "Short right diagonal stroke."],
  ナ: ["Horizontal stroke.", "Vertical stroke."],
  ニ: ["Top horizontal stroke.", "Bottom horizontal stroke."],
  ヌ: ["Top angled stroke.", "Long crossing diagonal stroke."],
  ネ: ["Small top stroke.", "Center angled stroke.", "Vertical stroke.", "Right diagonal stroke."],
  ノ: ["Single diagonal stroke down left."],
  ハ: ["Left diagonal stroke.", "Right diagonal stroke."],
  ヒ: ["Horizontal stroke.", "Vertical stroke with lower turn."],
  フ: ["Top horizontal stroke with downward angle."],
  ヘ: ["Single angled roof stroke."],
  ホ: ["Top horizontal stroke.", "Vertical stroke.", "Left small diagonal.", "Right small diagonal."],
  マ: ["Top angled frame stroke.", "Inner diagonal stroke."],
  ミ: ["Top diagonal stroke.", "Middle diagonal stroke.", "Bottom diagonal stroke."],
  ム: ["Diagonal stroke down left.", "Bottom angled stroke."],
  メ: ["Short diagonal stroke.", "Long crossing diagonal stroke."],
  モ: ["Top horizontal stroke.", "Middle horizontal stroke.", "Vertical stroke with turn."],
  ヤ: ["Short left stroke.", "Main angled stroke.", "Vertical stroke."],
  ユ: ["Top horizontal stroke with right side.", "Bottom horizontal stroke."],
  ヨ: ["Top horizontal stroke with right side.", "Middle horizontal stroke.", "Bottom horizontal stroke."],
  ラ: ["Top horizontal stroke.", "Lower horizontal stroke with diagonal finish."],
  リ: ["Left vertical stroke.", "Right vertical stroke."],
  ル: ["Left vertical stroke.", "Right stroke with lower sweep."],
  レ: ["Vertical stroke with lower sweep right."],
  ロ: ["Top and sides box stroke.", "Bottom horizontal stroke."],
  ワ: ["Top horizontal stroke with right side.", "Long diagonal stroke down left."],
  ヲ: ["Top horizontal stroke with right side.", "Middle horizontal stroke.", "Lower diagonal stroke."],
  ン: ["Short upper-left stroke.", "Long lower sweeping stroke."]
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
    ctx.fillStyle = "rgba(20, 27, 40, 0.08)";
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
    ctx.strokeStyle = "#172033";
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
        setProgress((current) => ({ ...current, writing: current.writing + 1 }));
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
        title={`${level} writing studio`}
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
              return (
                <button
                  className={`${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                  key={symbol}
                  onClick={() => selectSymbol(symbol)}
                  type="button"
                >
                  {symbol}
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
            <span>{activeSection.title}</span>
            <h2>{writingSymbol} stroke order</h2>
            <div className="stroke-order-board">
              <div className="stroke-step-preview final hero">
                <span className="stroke-step-glyph">{writingSymbol}</span>
              </div>
              {(strokeOrders[writingSymbol] ?? ["Follow the guide from top to bottom.", "Keep the final shape inside the faint character."]).map((step, index) => (
                <div className="stroke-step-preview" key={`${writingSymbol}-${index + 1}`}>
                  <span className="stroke-step-number">{index + 1}</span>
                  <StrokeMark kind={getStrokeKind(step)} />
                </div>
              ))}
            </div>
            <p className="stroke-order-note">Build the character in order, one boxed stroke at a time.</p>
          </aside>
        </div>
      </section>
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

function getStrokeKind(step: string) {
  const lower = step.toLowerCase();
  if (lower.includes("loop")) return "loop";
  if (lower.includes("curve")) return "curve";
  if (lower.includes("diagonal") || lower.includes("angled")) return "diagonal";
  if (lower.includes("vertical")) return "vertical";
  return "horizontal";
}

function StrokeMark({ kind }: { kind: StrokeKind }) {
  return (
    <svg aria-hidden="true" className="stroke-mark-svg" viewBox="0 0 100 100">
      {kind === "horizontal" ? <path d="M18 48 L82 48" /> : null}
      {kind === "vertical" ? <path d="M50 18 L50 82" /> : null}
      {kind === "diagonal" ? <path d="M72 18 L28 82" /> : null}
      {kind === "curve" ? <path d="M70 22 Q36 32 34 74" /> : null}
      {kind === "loop" ? <path d="M62 24 Q30 26 28 56 Q28 78 50 78 Q72 78 72 56 Q72 42 60 38" /> : null}
    </svg>
  );
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
