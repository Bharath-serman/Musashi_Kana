"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type DarkSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
};

export default function DarkSelect({ value, onChange, options, required }: DarkSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          background: "rgba(0, 0, 0, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          padding: "14px",
          color: "white",
          fontSize: "1rem",
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          outline: "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "#e88ba1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(232, 139, 161, 0.15)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        <span>{selected?.label || "Select..."}</span>
        <ChevronDown size={16} style={{ color: "#b09ba4", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#1c1418",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "10px",
            padding: "4px",
            zIndex: 100,
            boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "none",
                background: opt.value === value ? "rgba(232, 139, 161, 0.15)" : "transparent",
                color: opt.value === value ? "#e88ba1" : "#f5f0f2",
                fontSize: "0.95rem",
                textAlign: "left",
                cursor: "pointer",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => { if (opt.value !== value) e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"; }}
              onMouseLeave={(e) => { if (opt.value !== value) e.currentTarget.style.background = "transparent"; }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {required && <input type="hidden" value={value} required />}
    </div>
  );
}
