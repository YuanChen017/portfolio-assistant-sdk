import { jsxs as r, Fragment as z, jsx as a } from "react/jsx-runtime";
import { useState as f, useRef as F, useEffect as k, useCallback as L } from "react";
const W = "https://api.groq.com/openai/v1/chat/completions", q = "llama-3.3-70b-versatile";
function H(e, n) {
  return `You are an AI portfolio assistant for ${e}.

Your ONLY purpose is to answer questions about ${e} based on the resume provided below.

STRICT RULES:
1. Only answer questions about ${e}'s professional background, skills, experience, education, and projects.
2. If asked about anything unrelated (weather, general knowledge, politics, other people, etc.), respond ONLY with: "I'm here to answer questions about ${e}'s professional background and qualifications. Please ask about their skills, experience, education, or how they might fit a role."
3. JOB MATCH REQUESTS: If the user pastes a job description or asks about job fit, you MUST respond with:
   - A match percentage (0–100%) based on skills, experience, and requirement alignment
   - Section: "✅ Matching Qualifications" — bullet list of matching items
   - Section: "📈 Areas to Develop" — any gaps (if none, say so)
   - Section: "💼 Overall Recommendation" — one of: Strong Match / Good Match / Partial Match / Not a Match, with a brief reason
4. Be honest and accurate. Never invent information not found in the resume.
5. Be professional, encouraging, and concise.

${e}'s Resume:
---
${n}
---`;
}
async function K(e, n, i, s, d, o) {
  var w, c, g, h;
  const l = i.apiKey, u = i.ownerName || "the owner", m = i.model || q, b = i.apiBaseUrl || W;
  if (!l) {
    o("No API key provided. Get a free key at console.groq.com");
    return;
  }
  const x = [
    { role: "system", content: H(u, n) },
    ...e.map((p) => ({ role: p.role, content: p.content }))
  ];
  try {
    const p = await fetch(b, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${l}`
      },
      body: JSON.stringify({
        model: m,
        messages: x,
        stream: !0,
        max_tokens: 1200,
        temperature: 0.6
      })
    });
    if (!p.ok) {
      const _ = await p.text();
      o(`API error ${p.status}: ${_}`);
      return;
    }
    const N = (w = p.body) == null ? void 0 : w.getReader();
    if (!N) {
      o("Streaming not supported");
      return;
    }
    const I = new TextDecoder();
    let C = "";
    for (; ; ) {
      const { done: _, value: T } = await N.read();
      if (_) break;
      C += I.decode(T, { stream: !0 });
      const M = C.split(`
`);
      C = M.pop() ?? "";
      for (const R of M) {
        const P = R.trim();
        if (!P.startsWith("data: ")) continue;
        const A = P.slice(6);
        if (A === "[DONE]") {
          d();
          return;
        }
        try {
          const v = (h = (g = (c = JSON.parse(A).choices) == null ? void 0 : c[0]) == null ? void 0 : g.delta) == null ? void 0 : h.content;
          v && s(v);
        } catch {
        }
      }
    }
    d();
  } catch (p) {
    o(p instanceof Error ? p.message : "Network error");
  }
}
const Y = "pas-resume-v1";
function D(e) {
  localStorage.setItem(Y, e);
}
function G() {
  return localStorage.getItem(Y);
}
function V() {
  localStorage.removeItem(Y);
}
async function J(e) {
  const n = await fetch(e);
  if (!n.ok) throw new Error(`Failed to fetch resume PDF (${n.status})`);
  const i = await n.arrayBuffer();
  return U(i);
}
async function Q(e) {
  if (e.type === "text/plain")
    return X(e);
  if (e.type === "application/pdf")
    return Z(e);
  throw new Error("Unsupported file type. Please upload a PDF or TXT file.");
}
function X(e) {
  return new Promise((n, i) => {
    const s = new FileReader();
    s.onload = (d) => {
      var o;
      return n(((o = d.target) == null ? void 0 : o.result) || "");
    }, s.onerror = () => i(new Error("Failed to read file")), s.readAsText(e);
  });
}
async function Z(e) {
  return U(await e.arrayBuffer());
}
async function U(e) {
  let n;
  try {
    n = await import("pdfjs-dist");
  } catch {
    throw new Error(
      `PDF support requires pdfjs-dist. Run: npm install pdfjs-dist
Or paste your resume text instead.`
    );
  }
  n.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${n.version}/pdf.worker.min.mjs`;
  const i = await n.getDocument({ data: e }).promise, s = [];
  for (let d = 1; d <= i.numPages; d++) {
    const l = await (await i.getPage(d)).getTextContent();
    s.push(l.items.map((u) => u.str).join(" "));
  }
  return s.join(`
`).trim();
}
const ee = `/* Portfolio Assistant SDK — Widget Styles
   Prefix: .pas-   Design: Chinese ink / sword aesthetic
   All layout is scoped to .pas-widget so it won't conflict with host pages. */

/* ── CSS variables (defaults, overridable via --pas-accent inline style) ──── */
.pas-widget {
  --pas-accent:       #C0392B;
  --pas-accent-hover: #A93226;
  --pas-accent-dim:   rgba(192, 57, 43, 0.10);
  --pas-bg:           #FAF7F0;
  --pas-surface:      rgba(250, 247, 240, 0.97);
  --pas-text:         #1A1A2E;
  --pas-muted:        #6B6B8A;
  --pas-border:       rgba(26, 26, 46, 0.12);
  --pas-border-md:    rgba(26, 26, 46, 0.20);
  --pas-shadow:       0 8px 32px rgba(26, 26, 46, 0.18);
  --pas-shadow-lg:    0 16px 48px rgba(26, 26, 46, 0.22);
  --pas-radius:       14px;
  --pas-radius-sm:    8px;
  --pas-font: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
              "Microsoft YaHei", "Noto Sans SC", sans-serif;
  --pas-ease: 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  --pas-w: 360px;
  --pas-h: 520px;
}

/* ── Root container ─────────────────────────────────────────────────────────── */
.pas-widget {
  position: fixed;
  z-index: 9999;
  font-family: var(--pas-font);
  font-size: 14px;
  line-height: 1.5;
  color: var(--pas-text);
}
.pas-widget *, .pas-widget *::before, .pas-widget *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.pas-widget--bottom-right { bottom: 24px; right: 24px; }
.pas-widget--bottom-left  { bottom: 24px; left:  24px; }

/* ── Floating button ─────────────────────────────────────────────────────────── */
.pas-btn {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--pas-accent);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(192, 57, 43, 0.40), var(--pas-shadow);
  transition: background var(--pas-ease), transform var(--pas-ease), box-shadow var(--pas-ease);
  outline: none;
}
.pas-btn:hover {
  background: var(--pas-accent-hover);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 28px rgba(192, 57, 43, 0.50), var(--pas-shadow-lg);
}
.pas-btn:active   { transform: translateY(0) scale(0.96); }
.pas-btn--open    { background: var(--pas-accent-hover); }
.pas-btn:focus-visible { outline: 2px solid var(--pas-accent); outline-offset: 3px; }

.pas-btn__icon {
  width: 24px; height: 24px;
  color: #fff;
  flex-shrink: 0;
  transition: transform var(--pas-ease), opacity var(--pas-ease);
}

/* Pulse rings (hidden when open) */
.pas-btn__pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(192, 57, 43, 0.35);
  animation: pas-pulse 2.4s ease-out infinite;
  pointer-events: none;
}
.pas-btn__pulse--2    { animation-delay: 0.8s; }
.pas-btn--open .pas-btn__pulse { display: none; }

@keyframes pas-pulse {
  0%   { transform: scale(1);    opacity: 0.6; }
  70%  { transform: scale(1.45); opacity: 0;   }
  100% { transform: scale(1.45); opacity: 0;   }
}

/* ── Chat popup ─────────────────────────────────────────────────────────────── */
.pas-popup {
  position: absolute;
  width: var(--pas-w);
  height: var(--pas-h);
  background: var(--pas-surface);
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  border: 1px solid var(--pas-border);
  border-radius: var(--pas-radius);
  box-shadow: var(--pas-shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: opacity var(--pas-ease), transform var(--pas-ease);
}
.pas-widget--bottom-right .pas-popup { bottom: 68px; right: 0; transform-origin: bottom right; }
.pas-widget--bottom-left  .pas-popup { bottom: 68px; left:  0; transform-origin: bottom left;  }

.pas-popup--visible { opacity: 1; transform: scale(1) translateY(0);    pointer-events: all; }
.pas-popup--hidden  { opacity: 0; transform: scale(0.94) translateY(8px); pointer-events: none; }

/* ── Header ─────────────────────────────────────────────────────────────────── */
.pas-popup__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 14px;
  background: linear-gradient(135deg, var(--pas-accent) 0%, #8B1A1A 100%);
  color: #fff;
  flex-shrink: 0;
}
.pas-popup__avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.18);
  border: 1.5px solid rgba(255,255,255,0.32);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
}
.pas-popup__header-info { flex: 1; min-width: 0; }
.pas-popup__title    { font-size: 14px; font-weight: 600; letter-spacing: 0.02em; line-height: 1.2; }
.pas-popup__subtitle { font-size: 11px; opacity: 0.75; margin-top: 1px; }

.pas-popup__header-actions { display: flex; gap: 3px; flex-shrink: 0; }
.pas-popup__icon-btn {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: transparent; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.80);
  transition: background var(--pas-ease), color var(--pas-ease);
  outline: none;
}
.pas-popup__icon-btn:hover    { background: rgba(255,255,255,0.15); color: #fff; }
.pas-popup__icon-btn:focus-visible { outline: 2px solid rgba(255,255,255,0.5); outline-offset: 1px; }

/* ── Upload view ────────────────────────────────────────────────────────────── */
.pas-upload {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 24px;
  text-align: center;
  background: var(--pas-bg);
  gap: 10px;
}
.pas-upload__icon  { font-size: 38px; line-height: 1; }
.pas-upload__title { font-size: 16px; font-weight: 700; color: var(--pas-text); }
.pas-upload__sub   { font-size: 12.5px; color: var(--pas-muted); line-height: 1.55; max-width: 260px; }

.pas-upload__actions {
  display: flex; flex-direction: column; gap: 8px;
  width: 100%; margin-top: 6px;
}
.pas-upload__btn {
  width: 100%; padding: 10px 16px; border-radius: var(--pas-radius-sm);
  font-size: 13px; font-family: var(--pas-font);
  cursor: pointer; border: none;
  transition: background var(--pas-ease), transform var(--pas-ease), border-color var(--pas-ease);
  outline: none;
}
.pas-upload__btn:focus-visible { outline: 2px solid var(--pas-accent); outline-offset: 1px; }
.pas-upload__btn:active { transform: scale(0.98); }
.pas-upload__btn--primary {
  background: var(--pas-accent); color: #fff;
  font-weight: 600;
}
.pas-upload__btn--primary:hover:not(:disabled) { background: var(--pas-accent-hover); }
.pas-upload__btn--primary:disabled { opacity: 0.55; cursor: not-allowed; }
.pas-upload__btn--secondary {
  background: transparent; color: var(--pas-text);
  border: 1.5px solid var(--pas-border-md);
}
.pas-upload__btn--secondary:hover { background: var(--pas-accent-dim); border-color: rgba(192,57,43,0.28); }
.pas-upload__btn--ghost {
  background: transparent; color: var(--pas-muted);
  border: 1px solid var(--pas-border);
  width: auto; flex-shrink: 0;
}
.pas-upload__btn--ghost:hover { color: var(--pas-text); }

.pas-upload__paste-area { display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 6px; }
.pas-upload__textarea {
  width: 100%; border: 1.5px solid var(--pas-border-md); border-radius: var(--pas-radius-sm);
  background: #fff; color: var(--pas-text);
  font-size: 12.5px; font-family: var(--pas-font); line-height: 1.5;
  padding: 10px 12px; resize: none; outline: none;
}
.pas-upload__textarea:focus { border-color: rgba(192,57,43,0.40); box-shadow: 0 0 0 3px rgba(192,57,43,0.08); }
.pas-upload__textarea::placeholder { color: var(--pas-muted); }
.pas-upload__paste-actions { display: flex; gap: 8px; justify-content: flex-end; }
.pas-upload__error { font-size: 12px; color: #B03A2E; background: rgba(176,58,46,0.08); padding: 7px 12px; border-radius: var(--pas-radius-sm); width: 100%; text-align: left; }

/* ── Messages body ──────────────────────────────────────────────────────────── */
.pas-popup__body {
  flex: 1;
  overflow-y: auto; overflow-x: hidden;
  padding: 12px 12px 8px;
  background: var(--pas-bg);
  scroll-behavior: smooth;
}
.pas-popup__body::-webkit-scrollbar { width: 4px; }
.pas-popup__body::-webkit-scrollbar-thumb { background: var(--pas-border-md); border-radius: 4px; }

.pas-popup__messages { display: flex; flex-direction: column; gap: 10px; }

/* ── Message bubbles ────────────────────────────────────────────────────────── */
.pas-msg {
  display: flex;
  align-items: flex-end;
  gap: 7px;
  max-width: 100%;
  animation: pas-msg-in 0.22s ease;
}
@keyframes pas-msg-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.pas-msg--user      { flex-direction: row-reverse; align-self: flex-end; max-width: 88%; }
.pas-msg--assistant { align-self: flex-start; max-width: 88%; }

.pas-msg__avatar {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--pas-accent), #8B1A1A);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(192,57,43,0.28);
}

.pas-msg__bubble {
  padding: 9px 12px; border-radius: var(--pas-radius);
  font-size: 13px; line-height: 1.6;
  word-break: break-word; overflow-wrap: break-word;
}
.pas-msg--user .pas-msg__bubble {
  background: var(--pas-accent); color: #fff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 8px rgba(192,57,43,0.28);
}
.pas-msg--assistant .pas-msg__bubble {
  background: #fff; color: var(--pas-text);
  border-bottom-left-radius: 4px;
  border: 1px solid var(--pas-border);
  box-shadow: 0 2px 8px rgba(26,26,46,0.06);
}
.pas-msg__bubble strong { font-weight: 600; }
.pas-msg__bubble code {
  font-family: "Fira Code", "JetBrains Mono", monospace;
  font-size: 11.5px;
  background: rgba(26,26,46,0.07);
  padding: 1px 5px; border-radius: 4px;
}
.pas-msg--user .pas-msg__bubble code { background: rgba(255,255,255,0.22); }

/* ── Loading dots ───────────────────────────────────────────────────────────── */
.pas-loading-dots {
  display: flex; align-items: center; gap: 4px;
  padding: 2px 0;
}
.pas-loading-dots span {
  display: block;
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--pas-accent);
  animation: pas-bounce 1.2s ease-in-out infinite;
}
.pas-loading-dots span:nth-child(1) { animation-delay: 0s; }
.pas-loading-dots span:nth-child(2) { animation-delay: 0.18s; }
.pas-loading-dots span:nth-child(3) { animation-delay: 0.36s; }

@keyframes pas-bounce {
  0%, 60%, 100% { transform: translateY(0);   opacity: 0.4; }
  30%            { transform: translateY(-5px); opacity: 1;   }
}

/* ── API error ─────────────────────────────────────────────────────────────── */
.pas-api-error {
  margin: 8px 0;
  padding: 8px 12px; border-radius: var(--pas-radius-sm);
  background: rgba(176,58,46,0.08); color: #B03A2E;
  font-size: 12px; line-height: 1.4;
}

/* ── Input footer ───────────────────────────────────────────────────────────── */
.pas-popup__footer {
  padding: 10px 12px 12px;
  background: var(--pas-surface);
  border-top: 1px solid var(--pas-border);
  flex-shrink: 0;
}
.pas-input__row {
  display: flex; align-items: flex-end; gap: 8px;
  background: var(--pas-bg);
  border: 1.5px solid var(--pas-border-md);
  border-radius: var(--pas-radius);
  padding: 8px 10px 8px 12px;
  transition: border-color var(--pas-ease), box-shadow var(--pas-ease);
}
.pas-input__row:focus-within {
  border-color: rgba(192,57,43,0.38);
  box-shadow: 0 0 0 3px rgba(192,57,43,0.09);
}
.pas-input__field {
  flex: 1; border: none; background: transparent; resize: none; outline: none;
  font-size: 13px; font-family: var(--pas-font); color: var(--pas-text);
  line-height: 1.5; min-height: 20px; max-height: 80px; overflow-y: auto;
  padding: 0;
}
.pas-input__field::placeholder { color: var(--pas-muted); opacity: 0.75; }
.pas-input__send {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--pas-accent); border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
  transition: background var(--pas-ease), transform var(--pas-ease), opacity var(--pas-ease);
  outline: none;
}
.pas-input__send:hover:not(:disabled) { background: var(--pas-accent-hover); transform: scale(1.08); }
.pas-input__send:active:not(:disabled) { transform: scale(0.95); }
.pas-input__send:disabled { opacity: 0.38; cursor: not-allowed; }
.pas-input__send:focus-visible { outline: 2px solid var(--pas-accent); outline-offset: 2px; }

.pas-input__hint {
  font-size: 10.5px; color: var(--pas-muted); opacity: 0.6;
  text-align: right; margin-top: 5px; line-height: 1.3;
}

/* ── Mobile ─────────────────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .pas-widget--bottom-right,
  .pas-widget--bottom-left {
    bottom: 16px;
    right: 16px;
    left: auto;
  }
  .pas-widget--bottom-left { left: 16px; right: auto; }
  .pas-popup {
    --pas-w: calc(100vw - 32px);
    --pas-h: min(520px, calc(100dvh - 96px));
    right: 0 !important;
    left: 0 !important;
  }
}
`, O = "pas-widget-styles";
function ae() {
  k(() => {
    if (!document.getElementById(O)) {
      const e = document.createElement("style");
      e.id = O, e.textContent = ee, document.head.appendChild(e);
    }
  }, []);
}
function E() {
  return Math.random().toString(36).slice(2, 9);
}
function ne({ text: e }) {
  const n = e.split(`
`);
  return /* @__PURE__ */ a(z, { children: n.map((i, s) => {
    const d = i.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return /* @__PURE__ */ r("span", { children: [
      d.map((o, l) => o.startsWith("**") && o.endsWith("**") ? /* @__PURE__ */ a("strong", { children: o.slice(2, -2) }, l) : o.startsWith("`") && o.endsWith("`") ? /* @__PURE__ */ a("code", { children: o.slice(1, -1) }, l) : o),
      s < n.length - 1 && /* @__PURE__ */ a("br", {})
    ] }, s);
  }) });
}
function te({
  onResumeSaved: e
}) {
  const [n, i] = f("initial"), [s, d] = f(""), [o, l] = f(!1), [u, m] = f(""), b = F(null);
  async function x(c) {
    var h;
    const g = (h = c.target.files) == null ? void 0 : h[0];
    if (g) {
      l(!0), m("");
      try {
        const p = await Q(g);
        if (!p.trim()) throw new Error("Could not extract text. Try pasting instead.");
        D(p), e(p);
      } catch (p) {
        m(p instanceof Error ? p.message : "Failed to read file");
      } finally {
        l(!1), b.current && (b.current.value = "");
      }
    }
  }
  function w() {
    if (!s.trim()) {
      m("Please paste your resume text first.");
      return;
    }
    D(s.trim()), e(s.trim());
  }
  return /* @__PURE__ */ r("div", { className: "pas-upload", children: [
    /* @__PURE__ */ a("div", { className: "pas-upload__icon", children: "📄" }),
    /* @__PURE__ */ a("h3", { className: "pas-upload__title", children: "Set Up Your Assistant" }),
    /* @__PURE__ */ a("p", { className: "pas-upload__sub", children: "Upload your resume so I can answer questions about your background and evaluate job matches." }),
    n === "initial" ? /* @__PURE__ */ r("div", { className: "pas-upload__actions", children: [
      /* @__PURE__ */ a(
        "input",
        {
          ref: b,
          type: "file",
          accept: ".pdf,.txt",
          style: { display: "none" },
          onChange: x
        }
      ),
      /* @__PURE__ */ a(
        "button",
        {
          className: "pas-upload__btn pas-upload__btn--primary",
          onClick: () => {
            var c;
            return (c = b.current) == null ? void 0 : c.click();
          },
          disabled: o,
          children: o ? "⏳ Processing…" : "📤 Upload Resume (PDF / TXT)"
        }
      ),
      /* @__PURE__ */ a(
        "button",
        {
          className: "pas-upload__btn pas-upload__btn--secondary",
          onClick: () => i("paste"),
          children: "✏️ Paste Resume Text"
        }
      )
    ] }) : /* @__PURE__ */ r("div", { className: "pas-upload__paste-area", children: [
      /* @__PURE__ */ a(
        "textarea",
        {
          className: "pas-upload__textarea",
          placeholder: "Paste your full resume text here…",
          value: s,
          onChange: (c) => d(c.target.value),
          rows: 9,
          autoFocus: !0
        }
      ),
      /* @__PURE__ */ r("div", { className: "pas-upload__paste-actions", children: [
        /* @__PURE__ */ a(
          "button",
          {
            className: "pas-upload__btn pas-upload__btn--ghost",
            onClick: () => i("initial"),
            children: "← Back"
          }
        ),
        /* @__PURE__ */ a(
          "button",
          {
            className: "pas-upload__btn pas-upload__btn--primary",
            onClick: w,
            children: "Save & Start"
          }
        )
      ] })
    ] }),
    u && /* @__PURE__ */ r("p", { className: "pas-upload__error", children: [
      "⚠ ",
      u
    ] })
  ] });
}
function se({ msg: e, streaming: n }) {
  return /* @__PURE__ */ r("div", { className: `pas-msg pas-msg--${e.role}`, children: [
    e.role === "assistant" && /* @__PURE__ */ a("div", { className: "pas-msg__avatar", children: "⚔" }),
    /* @__PURE__ */ a("div", { className: "pas-msg__bubble", children: e.content === "" && n ? /* @__PURE__ */ r("span", { className: "pas-loading-dots", children: [
      /* @__PURE__ */ a("span", {}),
      /* @__PURE__ */ a("span", {}),
      /* @__PURE__ */ a("span", {})
    ] }) : /* @__PURE__ */ a(ne, { text: e.content }) })
  ] });
}
function ie({ config: e = {} }) {
  ae();
  const [n, i] = f(!1), [s, d] = f(
    () => e.resumeText ?? G()
  ), [o, l] = f([]), [u, m] = f(""), [b, x] = f(!1), [w, c] = f(null), [g, h] = f(""), p = F(null), N = F(null), I = e.primaryColor || "#C0392B";
  k(() => {
    s || !e.resumePdfUrl || J(e.resumePdfUrl).then((t) => {
      D(t), d(t);
    }).catch(() => {
    });
  }, []);
  const C = e.position || "bottom-right", _ = e.assistantName || "Yuan AI";
  k(() => {
    n && s && o.length === 0 && l([{
      id: E(),
      role: "assistant",
      content: `你好！Hi! I'm ${_}. Your resume is loaded — ask me anything about your background, skills, or experience.

💼 Tip: paste a job description and ask "How well do I match this role?" to get a match analysis!`,
      timestamp: /* @__PURE__ */ new Date()
    }]);
  }, [n, s]), k(() => {
    var t;
    (t = p.current) == null || t.scrollIntoView({ behavior: "smooth" });
  }, [o]), k(() => {
    n && s && setTimeout(() => {
      var t;
      return (t = N.current) == null ? void 0 : t.focus();
    }, 80);
  }, [n, s]), k(() => {
    const t = (v) => {
      v.key === "Escape" && n && i(!1);
    };
    return document.addEventListener("keydown", t), () => document.removeEventListener("keydown", t);
  }, [n]);
  const T = L(async () => {
    const t = u.trim();
    if (!t || b || !s) return;
    const v = { id: E(), role: "user", content: t, timestamp: /* @__PURE__ */ new Date() }, j = E(), $ = { id: j, role: "assistant", content: "", timestamp: /* @__PURE__ */ new Date() };
    l((S) => [...S, v, $]), m(""), x(!0), c(j), h(""), await K(
      [...o, v],
      s,
      e,
      (S) => {
        l(
          (B) => B.map((y) => y.id === j ? { ...y, content: y.content + S } : y)
        );
      },
      () => {
        x(!1), c(null);
      },
      (S) => {
        h(S), x(!1), c(null), l((B) => B.filter((y) => y.id !== j));
      }
    );
  }, [u, b, s, o, e]);
  function M(t) {
    t.key === "Enter" && !t.shiftKey && (t.preventDefault(), T());
  }
  function R(t) {
    d(t), l([{
      id: E(),
      role: "assistant",
      content: `✅ Resume loaded! I'm ready.

Try asking:
• "What are my strongest technical skills?"
• "Summarise my work experience"
• Paste a job description → "How well do I match this role?"`,
      timestamp: /* @__PURE__ */ new Date()
    }]);
  }
  function P() {
    V(), d(e.resumeText ?? null), l([]), h("");
  }
  const A = { "--pas-accent": I };
  return /* @__PURE__ */ r("div", { className: `pas-widget pas-widget--${C}`, style: A, children: [
    /* @__PURE__ */ r(
      "button",
      {
        className: `pas-btn${n ? " pas-btn--open" : ""}`,
        onClick: () => i((t) => !t),
        "aria-label": n ? "Close assistant" : "Open portfolio assistant",
        children: [
          !n && /* @__PURE__ */ r(z, { children: [
            /* @__PURE__ */ a("span", { className: "pas-btn__pulse", "aria-hidden": !0 }),
            /* @__PURE__ */ a("span", { className: "pas-btn__pulse pas-btn__pulse--2", "aria-hidden": !0 })
          ] }),
          /* @__PURE__ */ a(
            "svg",
            {
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "2",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              className: "pas-btn__icon",
              "aria-hidden": !0,
              children: n ? /* @__PURE__ */ a("path", { d: "M18 6L6 18M6 6l12 12" }) : /* @__PURE__ */ a("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" })
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ r(
      "div",
      {
        className: `pas-popup${n ? " pas-popup--visible" : " pas-popup--hidden"}`,
        role: "dialog",
        "aria-label": `${_} chat`,
        "aria-hidden": !n,
        children: [
          /* @__PURE__ */ r("div", { className: "pas-popup__header", children: [
            /* @__PURE__ */ a("div", { className: "pas-popup__avatar", children: "⚔" }),
            /* @__PURE__ */ r("div", { className: "pas-popup__header-info", children: [
              /* @__PURE__ */ a("div", { className: "pas-popup__title", children: _ }),
              /* @__PURE__ */ a("div", { className: "pas-popup__subtitle", children: s ? "● Ready to chat" : "○ Upload resume to start" })
            ] }),
            /* @__PURE__ */ r("div", { className: "pas-popup__header-actions", children: [
              s && /* @__PURE__ */ a(
                "button",
                {
                  className: "pas-popup__icon-btn",
                  onClick: P,
                  title: "Change resume",
                  "aria-label": "Change resume",
                  children: /* @__PURE__ */ r("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", width: "14", height: "14", children: [
                    /* @__PURE__ */ a("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
                    /* @__PURE__ */ a("polyline", { points: "14 2 14 8 20 8" }),
                    /* @__PURE__ */ a("line", { x1: "16", y1: "13", x2: "8", y2: "13" }),
                    /* @__PURE__ */ a("line", { x1: "16", y1: "17", x2: "8", y2: "17" })
                  ] })
                }
              ),
              /* @__PURE__ */ a(
                "button",
                {
                  className: "pas-popup__icon-btn pas-popup__close",
                  onClick: () => i(!1),
                  title: "Close",
                  "aria-label": "Close chat",
                  children: /* @__PURE__ */ a("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", width: "14", height: "14", children: /* @__PURE__ */ a("path", { d: "M18 6L6 18M6 6l12 12" }) })
                }
              )
            ] })
          ] }),
          s ? /* @__PURE__ */ r(z, { children: [
            /* @__PURE__ */ r("div", { className: "pas-popup__body", children: [
              /* @__PURE__ */ a("div", { className: "pas-popup__messages", children: o.map((t) => /* @__PURE__ */ a(
                se,
                {
                  msg: t,
                  streaming: t.id === w
                },
                t.id
              )) }),
              g && /* @__PURE__ */ r("div", { className: "pas-api-error", children: [
                "⚠ ",
                g
              ] }),
              /* @__PURE__ */ a("div", { ref: p })
            ] }),
            /* @__PURE__ */ r("div", { className: "pas-popup__footer", children: [
              /* @__PURE__ */ r("div", { className: "pas-input__row", children: [
                /* @__PURE__ */ a(
                  "textarea",
                  {
                    ref: N,
                    className: "pas-input__field",
                    placeholder: "Ask about my background, or paste a job description…",
                    value: u,
                    onChange: (t) => m(t.target.value),
                    onKeyDown: M,
                    disabled: b,
                    rows: 1,
                    "aria-label": "Message input"
                  }
                ),
                /* @__PURE__ */ a(
                  "button",
                  {
                    className: "pas-input__send",
                    onClick: T,
                    disabled: b || !u.trim(),
                    "aria-label": "Send message",
                    children: /* @__PURE__ */ a("svg", { viewBox: "0 0 24 24", fill: "currentColor", width: "14", height: "14", children: /* @__PURE__ */ a("path", { d: "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" }) })
                  }
                )
              ] }),
              /* @__PURE__ */ a("p", { className: "pas-input__hint", children: "Enter to send · Shift+Enter for newline" })
            ] })
          ] }) : /* @__PURE__ */ a(te, { onResumeSaved: R })
        ]
      }
    )
  ] });
}
export {
  ie as ChatWidget
};
//# sourceMappingURL=portfolio-assistant-sdk.js.map
