"use client";

import { Check, Palette, Sparkles } from "lucide-react";
import { themes, useTheme } from "@/components/theme-provider";

export function ThemePicker() {
  const { theme: activeTheme, setTheme } = useTheme();

  return <div>
    <div className="theme-picker-intro">
      <span className="metric-icon"><Palette size={17} /></span>
      <div>
        <h3 className="section-title">Make it feel like yours</h3>
        <p className="muted small" style={{ margin: "5px 0 0" }}>Choose a palette. Your choice is saved on this device and follows you around SpendSense.</p>
      </div>
    </div>
    <div className="theme-grid" role="group" aria-label="Color themes">
      {themes.map((option) => {
        const selected = activeTheme === option.id;
        return <button
          type="button"
          key={option.id}
          className={`theme-option ${selected ? "selected" : ""}`}
          aria-pressed={selected}
          onClick={() => setTheme(option.id)}
        >
          <span className="theme-preview" style={{ background: option.swatches[0] }}>
            <span className="theme-preview-sidebar" style={{ background: option.swatches[2] }} />
            <span className="theme-preview-card" style={{ background: option.swatches[2] }}>
              <span style={{ background: option.swatches[1] }} />
              <span />
              <span />
            </span>
            <span className="theme-preview-dot" style={{ background: option.swatches[1] }} />
            {selected && <span className="theme-selected-check"><Check size={13} /></span>}
          </span>
          <span className="theme-option-name">{option.name}</span>
          <span className="theme-option-mood">{option.mood}</span>
        </button>;
      })}
    </div>
    <div className="theme-note"><Sparkles size={14} /> Theme changes apply instantly and are saved locally. Your account data is unchanged.</div>
  </div>;
}
