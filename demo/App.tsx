import { ChatWidget } from "../src/components/ChatWidget";
import type { WidgetConfig } from "../src/types";

/**
 * Demo app — shows the widget on a minimal page.
 * Set VITE_OPENAI_API_KEY in a .env file to enable real AI responses.
 */
const config: WidgetConfig = {
  ownerName: "Yuan Chen",
  assistantName: "Yuan AI",
  resumePdfUrl: '/resume.pdf',
  apiKey: import.meta.env.VITE_GROQ_API_KEY as string | undefined,
  model: "llama-3.3-70b-versatile",
  position: "bottom-right",
  primaryColor: "#C0392B",
};

export default function App() {
  return (
    <div style={styles.page}>
      <header style={styles.nav}>
        <span style={styles.brand}>⚔ Yuan Chen</span>
      </header>

      <main style={styles.hero}>
        <p style={styles.hint}>
          👉 Click the{" "}
          <strong style={{ color: "#C0392B" }}>Message Chat bubble icon</strong>{" "}
          in the bottom-right to open the AI portfolio assistant.
          <br />
          Upload your resume → ask anything about your background or get job
          match analysis.
        </p>
      </main>

      {/* The entire SDK is just this one component */}
      <ChatWidget config={config} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#FAF7F0",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif',
    color: "#1A1A2E",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    height: 64,
    borderBottom: "1px solid rgba(26,26,46,0.10)",
    background: "rgba(250,247,240,0.9)",
    backdropFilter: "blur(12px)",
    position: "sticky" as const,
    top: 0,
    zIndex: 100,
  },
  brand: { fontWeight: 700, fontSize: 18 },
  links: { display: "flex", gap: 28, fontSize: 14, color: "#6B6B8A" },
  hero: {
    maxWidth: 640,
    margin: "120px auto 0",
    padding: "0 24px",
    textAlign: "center" as const,
  },
  eyebrow: {
    fontSize: 13,
    letterSpacing: "0.12em",
    color: "#C0392B",
    marginBottom: 12,
    fontWeight: 600,
  },
  heading: {
    fontSize: 40,
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
    marginBottom: 16,
  },
  sub: { fontSize: 16, color: "#6B6B8A", marginBottom: 40 },
  hint: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#6B6B8A",
    background: "rgba(192,57,43,0.06)",
    padding: "16px 20px",
    borderRadius: 12,
    border: "1px solid rgba(192,57,43,0.15)",
  },
};
