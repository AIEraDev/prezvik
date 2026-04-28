"use client";

import { useState } from "react";

const PLACEHOLDER =
  'Create a 6-slide presentation about the rise of AI in healthcare for hospital executives. Include an overview of current AI applications, key statistics on cost savings and diagnostic accuracy, a comparison of leading AI tools, implementation challenges, and a roadmap for adoption over the next 3 years. Tone: professional, data-driven.';

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [theme, setTheme] = useState("executive");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, theme }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Unknown error");

      const bytes = Uint8Array.from(atob(data.file), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.fileName || "presentation.pptx";
      a.click();
      URL.revokeObjectURL(url);
      setStatus({ ok: true, msg: "✓ Ready — download started" });
    } catch (e) {
      setStatus({ ok: false, msg: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ background: "#0D1B2A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}
    >
      <div style={{ width: "100%", maxWidth: 640 }}>
        <h1 style={{ color: "#fff", fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>Prezvik</h1>
        <p style={{ color: "#94a3b8", marginBottom: "2rem", fontSize: "1.1rem" }}>Transform words into slides</p>

        <label style={{ color: "#cbd5e1", fontSize: "0.875rem", display: "block", marginBottom: "0.5rem" }}>Prompt</label>
        <textarea
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={PLACEHOLDER}
          style={{
            width: "100%",
            background: "#1e2d3d",
            border: "1px solid #334155",
            borderRadius: 8,
            color: "#f1f5f9",
            padding: "0.75rem",
            fontSize: "0.95rem",
            resize: "vertical",
            marginBottom: "1rem",
            boxSizing: "border-box",
          }}
        />

        <label style={{ color: "#cbd5e1", fontSize: "0.875rem", display: "block", marginBottom: "0.5rem" }}>Theme</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          style={{
            width: "100%",
            background: "#1e2d3d",
            border: "1px solid #334155",
            borderRadius: 8,
            color: "#f1f5f9",
            padding: "0.65rem 0.75rem",
            fontSize: "0.95rem",
            marginBottom: "1.5rem",
            boxSizing: "border-box",
          }}
        >
          <option value="executive">Executive</option>
          <option value="minimal">Minimal</option>
          <option value="bold">Bold</option>
        </select>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          style={{
            width: "100%",
            padding: "0.85rem",
            borderRadius: 8,
            border: "none",
            background: loading ? "#334155" : "#6C5CE7",
            color: "#fff",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
            opacity: !prompt.trim() ? 0.5 : 1,
          }}
        >
          {loading ? "Generating…" : "Generate Presentation"}
        </button>

        {status && (
          <p
            style={{
              marginTop: "1rem",
              color: status.ok ? "#4ade80" : "#f87171",
              fontSize: "0.9rem",
            }}
          >
            {status.msg}
          </p>
        )}
      </div>
    </div>
  );
}
