"use client";

import { useEffect, useRef, useState } from "react";
import { AppFrame, PageHeader } from "../components/app-frame";
import { useLearning } from "../components/learning-state";

export default function WritingPage() {
  return (
    <AppFrame>
      <Writing />
    </AppFrame>
  );
}

function Writing() {
  const { data, level, setProgress } = useLearning();
  const [writingSymbol, setWritingSymbol] = useState(data.writing[0]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setWritingSymbol(data.writing[0]);
  }, [data.writing, level]);

  useEffect(() => {
    drawGuide(writingSymbol);
  }, [writingSymbol]);

  function drawGuide(symbol: string) {
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
  }

  function setupDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.setPointerCapture(event.pointerId);
    const point = getCanvasPoint(canvas, event.clientX, event.clientY);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }

  function drawStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    if (event.buttons !== 1) return;
    const canvas = event.currentTarget;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const point = getCanvasPoint(canvas, event.clientX, event.clientY);
    ctx.lineTo(point.x, point.y);
    ctx.lineWidth = 15;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#172033";
    ctx.stroke();
  }

  return (
    <>
      <PageHeader
        eyebrow="Output"
        title={`${level} writing studio`}
        text="Choose a kana or kanji, trace the faint guide, then repeat until your hand remembers the shape."
        action={<div className="copy-target">{writingSymbol}</div>}
      />

      <section className="panel writing-panel">
        <div className="symbol-grid">
          {data.writing.map((symbol) => (
            <button className={writingSymbol === symbol ? "active" : ""} key={symbol} onClick={() => setWritingSymbol(symbol)} type="button">
              {symbol}
            </button>
          ))}
        </div>
        <canvas
          aria-label="Writing practice canvas"
          height={520}
          onPointerDown={setupDrawing}
          onPointerMove={drawStroke}
          ref={canvasRef}
          width={520}
        />
        <div className="control-row two">
          <button onClick={() => drawGuide(writingSymbol)} type="button">Clear</button>
          <button className="success-button" onClick={() => setProgress((current) => ({ ...current, writing: current.writing + 1 }))} type="button">
            Mark complete
          </button>
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
