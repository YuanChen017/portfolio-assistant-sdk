(function(h,e){typeof exports=="object"&&typeof module<"u"?e(exports,require("react/jsx-runtime"),require("react")):typeof define=="function"&&define.amd?define(["exports","react/jsx-runtime","react"],e):(h=typeof globalThis<"u"?globalThis:h||self,e(h.PortfolioAssistantSDK={},h.ReactJSXRuntime,h.React))})(this,(function(h,e,r){"use strict";const Y="https://api.groq.com/openai/v1/chat/completions",U="llama-3.3-70b-versatile";function $(a,n){return`You are an AI portfolio assistant for ${a}.

Your ONLY purpose is to answer questions about ${a} based on the resume provided below.

STRICT RULES:
1. Only answer questions about ${a}'s professional background, skills, experience, education, and projects.
2. If asked about anything unrelated (weather, general knowledge, politics, other people, etc.), respond ONLY with: "I'm here to answer questions about ${a}'s professional background and qualifications. Please ask about their skills, experience, education, or how they might fit a role."
3. JOB MATCH REQUESTS: If the user pastes a job description or asks about job fit, you MUST respond with:
   - A match percentage (0–100%) based on skills, experience, and requirement alignment
   - Section: "✅ Matching Qualifications" — bullet list of matching items
   - Section: "📈 Areas to Develop" — any gaps (if none, say so)
   - Section: "💼 Overall Recommendation" — one of: Strong Match / Good Match / Partial Match / Not a Match, with a brief reason
4. Be honest and accurate. Never invent information not found in the resume.
5. Be professional, encouraging, and concise.

${a}'s Resume:
---
${n}
---`}async function L(a,n,p,t,d,o){var y,c,x,b;const l=p.apiKey,u=p.ownerName||"the owner",g=p.model||U,f=p.apiBaseUrl||Y;if(!l){o("No API key provided. Get a free key at console.groq.com");return}const m=[{role:"system",content:$(u,n)},...a.map(i=>({role:i.role,content:i.content}))];try{const i=await fetch(f,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${l}`},body:JSON.stringify({model:g,messages:m,stream:!0,max_tokens:1200,temperature:.6})});if(!i.ok){const _=await i.text();o(`API error ${i.status}: ${_}`);return}const k=(y=i.body)==null?void 0:y.getReader();if(!k){o("Streaming not supported");return}const B=new TextDecoder;let S="";for(;;){const{done:_,value:T}=await k.read();if(_)break;S+=B.decode(T,{stream:!0});const E=S.split(`
`);S=E.pop()??"";for(const F of E){const P=F.trim();if(!P.startsWith("data: "))continue;const M=P.slice(6);if(M==="[DONE]"){d();return}try{const v=(b=(x=(c=JSON.parse(M).choices)==null?void 0:c[0])==null?void 0:x.delta)==null?void 0:b.content;v&&t(v)}catch{}}}d()}catch(i){o(i instanceof Error?i.message:"Network error")}}const j="pas-resume-v1";function I(a){localStorage.setItem(j,a)}function W(){return localStorage.getItem(j)}function q(){localStorage.removeItem(j)}async function H(a){const n=await fetch(a);if(!n.ok)throw new Error(`Failed to fetch resume PDF (${n.status})`);const p=await n.arrayBuffer();return D(p)}async function K(a){if(a.type==="text/plain")return G(a);if(a.type==="application/pdf")return J(a);throw new Error("Unsupported file type. Please upload a PDF or TXT file.")}function G(a){return new Promise((n,p)=>{const t=new FileReader;t.onload=d=>{var o;return n(((o=d.target)==null?void 0:o.result)||"")},t.onerror=()=>p(new Error("Failed to read file")),t.readAsText(a)})}async function J(a){return D(await a.arrayBuffer())}async function D(a){let n;try{n=await import("pdfjs-dist")}catch{throw new Error(`PDF support requires pdfjs-dist. Run: npm install pdfjs-dist
Or paste your resume text instead.`)}n.GlobalWorkerOptions.workerSrc=`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${n.version}/pdf.worker.min.mjs`;const p=await n.getDocument({data:a}).promise,t=[];for(let d=1;d<=p.numPages;d++){const l=await(await p.getPage(d)).getTextContent();t.push(l.items.map(u=>u.str).join(" "))}return t.join(`
`).trim()}const V=`/* Portfolio Assistant SDK — Widget Styles
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
`,O="pas-widget-styles";function Q(){r.useEffect(()=>{if(!document.getElementById(O)){const a=document.createElement("style");a.id=O,a.textContent=V,document.head.appendChild(a)}},[])}function C(){return Math.random().toString(36).slice(2,9)}function X({text:a}){const n=a.split(`
`);return e.jsx(e.Fragment,{children:n.map((p,t)=>{const d=p.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);return e.jsxs("span",{children:[d.map((o,l)=>o.startsWith("**")&&o.endsWith("**")?e.jsx("strong",{children:o.slice(2,-2)},l):o.startsWith("`")&&o.endsWith("`")?e.jsx("code",{children:o.slice(1,-1)},l):o),t<n.length-1&&e.jsx("br",{})]},t)})})}function Z({onResumeSaved:a}){const[n,p]=r.useState("initial"),[t,d]=r.useState(""),[o,l]=r.useState(!1),[u,g]=r.useState(""),f=r.useRef(null);async function m(c){var b;const x=(b=c.target.files)==null?void 0:b[0];if(x){l(!0),g("");try{const i=await K(x);if(!i.trim())throw new Error("Could not extract text. Try pasting instead.");I(i),a(i)}catch(i){g(i instanceof Error?i.message:"Failed to read file")}finally{l(!1),f.current&&(f.current.value="")}}}function y(){if(!t.trim()){g("Please paste your resume text first.");return}I(t.trim()),a(t.trim())}return e.jsxs("div",{className:"pas-upload",children:[e.jsx("div",{className:"pas-upload__icon",children:"📄"}),e.jsx("h3",{className:"pas-upload__title",children:"Set Up Your Assistant"}),e.jsx("p",{className:"pas-upload__sub",children:"Upload your resume so I can answer questions about your background and evaluate job matches."}),n==="initial"?e.jsxs("div",{className:"pas-upload__actions",children:[e.jsx("input",{ref:f,type:"file",accept:".pdf,.txt",style:{display:"none"},onChange:m}),e.jsx("button",{className:"pas-upload__btn pas-upload__btn--primary",onClick:()=>{var c;return(c=f.current)==null?void 0:c.click()},disabled:o,children:o?"⏳ Processing…":"📤 Upload Resume (PDF / TXT)"}),e.jsx("button",{className:"pas-upload__btn pas-upload__btn--secondary",onClick:()=>p("paste"),children:"✏️ Paste Resume Text"})]}):e.jsxs("div",{className:"pas-upload__paste-area",children:[e.jsx("textarea",{className:"pas-upload__textarea",placeholder:"Paste your full resume text here…",value:t,onChange:c=>d(c.target.value),rows:9,autoFocus:!0}),e.jsxs("div",{className:"pas-upload__paste-actions",children:[e.jsx("button",{className:"pas-upload__btn pas-upload__btn--ghost",onClick:()=>p("initial"),children:"← Back"}),e.jsx("button",{className:"pas-upload__btn pas-upload__btn--primary",onClick:y,children:"Save & Start"})]})]}),u&&e.jsxs("p",{className:"pas-upload__error",children:["⚠ ",u]})]})}function R({msg:a,streaming:n}){return e.jsxs("div",{className:`pas-msg pas-msg--${a.role}`,children:[a.role==="assistant"&&e.jsx("div",{className:"pas-msg__avatar",children:"⚔"}),e.jsx("div",{className:"pas-msg__bubble",children:a.content===""&&n?e.jsxs("span",{className:"pas-loading-dots",children:[e.jsx("span",{}),e.jsx("span",{}),e.jsx("span",{})]}):e.jsx(X,{text:a.content})})]})}function ee({config:a={}}){Q();const[n,p]=r.useState(!1),[t,d]=r.useState(()=>a.resumeText??W()),[o,l]=r.useState([]),[u,g]=r.useState(""),[f,m]=r.useState(!1),[y,c]=r.useState(null),[x,b]=r.useState(""),i=r.useRef(null),k=r.useRef(null),B=a.primaryColor||"#C0392B";r.useEffect(()=>{t||!a.resumePdfUrl||H(a.resumePdfUrl).then(s=>{I(s),d(s)}).catch(()=>{})},[]);const S=a.position||"bottom-right",_=a.assistantName||"Yuan AI";r.useEffect(()=>{n&&t&&o.length===0&&l([{id:C(),role:"assistant",content:`你好！Hi! I'm ${_}. Your resume is loaded — ask me anything about your background, skills, or experience.

💼 Tip: paste a job description and ask "How well do I match this role?" to get a match analysis!`,timestamp:new Date}])},[n,t]),r.useEffect(()=>{var s;(s=i.current)==null||s.scrollIntoView({behavior:"smooth"})},[o]),r.useEffect(()=>{n&&t&&setTimeout(()=>{var s;return(s=k.current)==null?void 0:s.focus()},80)},[n,t]),r.useEffect(()=>{const s=v=>{v.key==="Escape"&&n&&p(!1)};return document.addEventListener("keydown",s),()=>document.removeEventListener("keydown",s)},[n]);const T=r.useCallback(async()=>{const s=u.trim();if(!s||f||!t)return;const v={id:C(),role:"user",content:s,timestamp:new Date},A=C(),ae={id:A,role:"assistant",content:"",timestamp:new Date};l(N=>[...N,v,ae]),g(""),m(!0),c(A),b(""),await L([...o,v],t,a,N=>{l(z=>z.map(w=>w.id===A?{...w,content:w.content+N}:w))},()=>{m(!1),c(null)},N=>{b(N),m(!1),c(null),l(z=>z.filter(w=>w.id!==A))})},[u,f,t,o,a]);function E(s){s.key==="Enter"&&!s.shiftKey&&(s.preventDefault(),T())}function F(s){d(s),l([{id:C(),role:"assistant",content:`✅ Resume loaded! I'm ready.

Try asking:
• "What are my strongest technical skills?"
• "Summarise my work experience"
• Paste a job description → "How well do I match this role?"`,timestamp:new Date}])}function P(){q(),d(a.resumeText??null),l([]),b("")}const M={"--pas-accent":B};return e.jsxs("div",{className:`pas-widget pas-widget--${S}`,style:M,children:[e.jsxs("button",{className:`pas-btn${n?" pas-btn--open":""}`,onClick:()=>p(s=>!s),"aria-label":n?"Close assistant":"Open portfolio assistant",children:[!n&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"pas-btn__pulse","aria-hidden":!0}),e.jsx("span",{className:"pas-btn__pulse pas-btn__pulse--2","aria-hidden":!0})]}),e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:"pas-btn__icon","aria-hidden":!0,children:n?e.jsx("path",{d:"M18 6L6 18M6 6l12 12"}):e.jsx("path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"})})]}),e.jsxs("div",{className:`pas-popup${n?" pas-popup--visible":" pas-popup--hidden"}`,role:"dialog","aria-label":`${_} chat`,"aria-hidden":!n,children:[e.jsxs("div",{className:"pas-popup__header",children:[e.jsx("div",{className:"pas-popup__avatar",children:"⚔"}),e.jsxs("div",{className:"pas-popup__header-info",children:[e.jsx("div",{className:"pas-popup__title",children:_}),e.jsx("div",{className:"pas-popup__subtitle",children:t?"● Ready to chat":"○ Upload resume to start"})]}),e.jsxs("div",{className:"pas-popup__header-actions",children:[t&&e.jsx("button",{className:"pas-popup__icon-btn",onClick:P,title:"Change resume","aria-label":"Change resume",children:e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",width:"14",height:"14",children:[e.jsx("path",{d:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"}),e.jsx("polyline",{points:"14 2 14 8 20 8"}),e.jsx("line",{x1:"16",y1:"13",x2:"8",y2:"13"}),e.jsx("line",{x1:"16",y1:"17",x2:"8",y2:"17"})]})}),e.jsx("button",{className:"pas-popup__icon-btn pas-popup__close",onClick:()=>p(!1),title:"Close","aria-label":"Close chat",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",width:"14",height:"14",children:e.jsx("path",{d:"M18 6L6 18M6 6l12 12"})})})]})]}),t?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"pas-popup__body",children:[e.jsx("div",{className:"pas-popup__messages",children:o.map(s=>e.jsx(R,{msg:s,streaming:s.id===y},s.id))}),x&&e.jsxs("div",{className:"pas-api-error",children:["⚠ ",x]}),e.jsx("div",{ref:i})]}),e.jsxs("div",{className:"pas-popup__footer",children:[e.jsxs("div",{className:"pas-input__row",children:[e.jsx("textarea",{ref:k,className:"pas-input__field",placeholder:"Ask about my background, or paste a job description…",value:u,onChange:s=>g(s.target.value),onKeyDown:E,disabled:f,rows:1,"aria-label":"Message input"}),e.jsx("button",{className:"pas-input__send",onClick:T,disabled:f||!u.trim(),"aria-label":"Send message",children:e.jsx("svg",{viewBox:"0 0 24 24",fill:"currentColor",width:"14",height:"14",children:e.jsx("path",{d:"M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"})})})]}),e.jsx("p",{className:"pas-input__hint",children:"Enter to send · Shift+Enter for newline"})]})]}):e.jsx(Z,{onResumeSaved:F})]})]})}h.ChatWidget=ee,Object.defineProperty(h,Symbol.toStringTag,{value:"Module"})}));
//# sourceMappingURL=portfolio-assistant-sdk.umd.cjs.map
