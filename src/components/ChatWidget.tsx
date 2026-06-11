import { useState, useEffect, useRef, useCallback } from 'react';
import type { Message, WidgetConfig } from '../types';
import { streamChat } from '../services/groq';
import {
  loadResume,
  saveResume,
  clearResume,
  extractTextFromFile,
  extractTextFromUrl,
} from '../services/resume';
import cssRaw from '../styles/widget.css?raw';

// ── Style injection ────────────────────────────────────────────────────────────
const STYLE_ID = 'pas-widget-styles';
function useInjectStyles() {
  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement('style');
      el.id = STYLE_ID;
      el.textContent = cssRaw;
      document.head.appendChild(el);
    }
  }, []);
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ── Simple markdown renderer (bold, code, line breaks) ───────────────────────
function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, li) => {
        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return (
          <span key={li}>
            {parts.map((part, pi) => {
              if (part.startsWith('**') && part.endsWith('**'))
                return <strong key={pi}>{part.slice(2, -2)}</strong>;
              if (part.startsWith('`') && part.endsWith('`'))
                return <code key={pi}>{part.slice(1, -1)}</code>;
              return part;
            })}
            {li < lines.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

// ── Upload / Setup view ───────────────────────────────────────────────────────
function UploadView({
  onResumeSaved,
}: {
  onResumeSaved: (text: string) => void;
}) {
  const [mode, setMode] = useState<'initial' | 'paste'>('initial');
  const [pasteText, setPasteText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const text = await extractTextFromFile(file);
      if (!text.trim()) throw new Error('Could not extract text. Try pasting instead.');
      saveResume(text);
      onResumeSaved(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function handlePasteSave() {
    if (!pasteText.trim()) { setError('Please paste your resume text first.'); return; }
    saveResume(pasteText.trim());
    onResumeSaved(pasteText.trim());
  }

  return (
    <div className="pas-upload">
      <div className="pas-upload__icon">📄</div>
      <h3 className="pas-upload__title">Set Up Your Assistant</h3>
      <p className="pas-upload__sub">
        Upload your resume so I can answer questions about your background
        and evaluate job matches.
      </p>

      {mode === 'initial' ? (
        <div className="pas-upload__actions">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
          <button
            className="pas-upload__btn pas-upload__btn--primary"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            {busy ? '⏳ Processing…' : '📤 Upload Resume (PDF / TXT)'}
          </button>
          <button
            className="pas-upload__btn pas-upload__btn--secondary"
            onClick={() => setMode('paste')}
          >
            ✏️ Paste Resume Text
          </button>
        </div>
      ) : (
        <div className="pas-upload__paste-area">
          <textarea
            className="pas-upload__textarea"
            placeholder="Paste your full resume text here…"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={9}
            autoFocus
          />
          <div className="pas-upload__paste-actions">
            <button
              className="pas-upload__btn pas-upload__btn--ghost"
              onClick={() => setMode('initial')}
            >
              ← Back
            </button>
            <button
              className="pas-upload__btn pas-upload__btn--primary"
              onClick={handlePasteSave}
            >
              Save &amp; Start
            </button>
          </div>
        </div>
      )}

      {error && <p className="pas-upload__error">⚠ {error}</p>}
    </div>
  );
}

// ── Chat message bubble ───────────────────────────────────────────────────────
function MessageBubble({ msg, streaming }: { msg: Message; streaming: boolean }) {
  return (
    <div className={`pas-msg pas-msg--${msg.role}`}>
      {msg.role === 'assistant' && <div className="pas-msg__avatar">⚔</div>}
      <div className="pas-msg__bubble">
        {msg.content === '' && streaming ? (
          <span className="pas-loading-dots">
            <span />
            <span />
            <span />
          </span>
        ) : (
          <RichText text={msg.content} />
        )}
      </div>
    </div>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────
export function ChatWidget({ config = {} }: { config?: WidgetConfig }) {
  useInjectStyles();

  const [isOpen, setIsOpen] = useState(false);
  const [resume, setResume] = useState<string | null>(
    () => config.resumeText ?? loadResume(),
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [apiError, setApiError] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const accentColor = config.primaryColor || '#C0392B';

  // Auto-load resume from PDF URL on mount
  useEffect(() => {
    if (resume || !config.resumePdfUrl) return;
    extractTextFromUrl(config.resumePdfUrl)
      .then((text) => { saveResume(text); setResume(text); })
      .catch(() => { /* fall through to manual upload */ });
  }, []);
  const position = config.position || 'bottom-right';
  const assistantName = config.assistantName || 'Yuan AI';

  // Welcome message when chat opens with resume loaded
  useEffect(() => {
    if (isOpen && resume && messages.length === 0) {
      setMessages([{
        id: uid(),
        role: 'assistant',
        content:
          `你好！Hi! I'm ${assistantName}. Your resume is loaded — ask me anything about ` +
          `your background, skills, or experience.\n\n` +
          `💼 Tip: paste a job description and ask "How well do I match this role?" to get a match analysis!`,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, resume]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && resume) setTimeout(() => inputRef.current?.focus(), 80);
  }, [isOpen, resume]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) setIsOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || !resume) return;

    const userMsg: Message = { id: uid(), role: 'user', content: text, timestamp: new Date() };
    const assistantId = uid();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '', timestamp: new Date() };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setLoading(true);
    setStreamingId(assistantId);
    setApiError('');

    await streamChat(
      [...messages, userMsg],
      resume,
      config,
      (chunk) => {
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: m.content + chunk } : m),
        );
      },
      () => { setLoading(false); setStreamingId(null); },
      (err) => {
        setApiError(err);
        setLoading(false);
        setStreamingId(null);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      },
    );
  }, [input, loading, resume, messages, config]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function handleResumeSaved(text: string) {
    setResume(text);
    setMessages([{
      id: uid(),
      role: 'assistant',
      content:
        `✅ Resume loaded! I'm ready.\n\n` +
        `Try asking:\n` +
        `• "What are my strongest technical skills?"\n` +
        `• "Summarise my work experience"\n` +
        `• Paste a job description → "How well do I match this role?"`,
      timestamp: new Date(),
    }]);
  }

  function handleChangeResume() {
    clearResume();
    setResume(config.resumeText ?? null);
    setMessages([]);
    setApiError('');
  }

  const cssVars = { '--pas-accent': accentColor } as React.CSSProperties;

  return (
    <div className={`pas-widget pas-widget--${position}`} style={cssVars}>
      {/* ── Floating button ── */}
      <button
        className={`pas-btn${isOpen ? ' pas-btn--open' : ''}`}
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Close assistant' : 'Open portfolio assistant'}
      >
        {!isOpen && (
          <>
            <span className="pas-btn__pulse" aria-hidden />
            <span className="pas-btn__pulse pas-btn__pulse--2" aria-hidden />
          </>
        )}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pas-btn__icon"
          aria-hidden
        >
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          )}
        </svg>
      </button>

      {/* ── Popup ── */}
      <div
        className={`pas-popup${isOpen ? ' pas-popup--visible' : ' pas-popup--hidden'}`}
        role="dialog"
        aria-label={`${assistantName} chat`}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="pas-popup__header">
          <div className="pas-popup__avatar">⚔</div>
          <div className="pas-popup__header-info">
            <div className="pas-popup__title">{assistantName}</div>
            <div className="pas-popup__subtitle">
              {resume ? '● Ready to chat' : '○ Upload resume to start'}
            </div>
          </div>
          <div className="pas-popup__header-actions">
            {resume && (
              <button
                className="pas-popup__icon-btn"
                onClick={handleChangeResume}
                title="Change resume"
                aria-label="Change resume"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </button>
            )}
            <button
              className="pas-popup__icon-btn pas-popup__close"
              onClick={() => setIsOpen(false)}
              title="Close"
              aria-label="Close chat"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body — upload view or chat view */}
        {!resume ? (
          <UploadView onResumeSaved={handleResumeSaved} />
        ) : (
          <>
            <div className="pas-popup__body">
              <div className="pas-popup__messages">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    streaming={msg.id === streamingId}
                  />
                ))}
              </div>
              {apiError && (
                <div className="pas-api-error">⚠ {apiError}</div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="pas-popup__footer">
              <div className="pas-input__row">
                <textarea
                  ref={inputRef}
                  className="pas-input__field"
                  placeholder="Ask about my background, or paste a job description…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  rows={1}
                  aria-label="Message input"
                />
                <button
                  className="pas-input__send"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
              <p className="pas-input__hint">Enter to send · Shift+Enter for newline</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
