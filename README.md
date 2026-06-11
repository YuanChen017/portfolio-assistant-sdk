# portfolio-assistant-sdk

AI chatbot widget for Yuan Chen's portfolio. Drop one component into any React site — it loads your resume PDF and lets visitors ask questions or get job match analysis.

---

## Deploy this repo to GitHub

Run these commands once to publish the SDK:

```bash
# 1. Build the dist (already done — commit it so GitHub installs work)
npm run build

# 2. Commit everything
git add src/ demo/ dist/ public/ package.json vite.config.ts \
        tsconfig.json tsconfig.app.json tsconfig.node.json \
        index.html .gitignore .env.example README.md
git commit -m "v1.0.0 — portfolio assistant SDK"

# 3. Tag the version
git tag v1.0.0

# 4. Create the GitHub repo (do this on github.com first, then:)
git remote add origin https://github.com/YuanChen/portfolio-assistant-sdk.git
git push -u origin master
git push origin v1.0.0
```

> Create the GitHub repo at **github.com/new** — name it `portfolio-assistant-sdk`, set it to **Public**, do NOT add a README (you already have one).

---

## Use it in your personal website

### 1. Install

```bash
npm install github:YuanChen/portfolio-assistant-sdk
npm install pdfjs-dist
```

### 2. Add your resume PDF

Copy your resume into your website's `public/` folder:

```
your-website/
└── public/
    └── resume.pdf
```

### 3. Add your API key

In your website's `.env`:

```bash
VITE_GROQ_API_KEY=gsk_your-key-here
```

Get a free key at **console.groq.com** → API Keys.

### 4. Add the widget

```tsx
import { ChatWidget } from 'portfolio-assistant-sdk';

export default function App() {
  return (
    <>
      {/* your existing page */}

      <ChatWidget
        config={{
          ownerName: 'Yuan Chen',
          assistantName: 'Yuan AI',
          resumePdfUrl: '/resume.pdf',
          apiKey: import.meta.env.VITE_GROQ_API_KEY,
          model: 'llama-3.3-70b-versatile',
          position: 'bottom-right',
          primaryColor: '#C0392B',
        }}
      />
    </>
  );
}
```

No CSS import needed — styles are injected automatically.

---

## Update the SDK

When you make changes to this repo:

```bash
npm run build
git add -A
git commit -m "v1.0.1 — describe your change"
git tag v1.0.1
git push && git push origin v1.0.1
```

Then in your website repo:

```bash
npm install github:YuanChen/portfolio-assistant-sdk
```

---

## Config options

| Prop | Type | Description |
|---|---|---|
| `ownerName` | `string` | Your name — used in the AI prompt |
| `assistantName` | `string` | Chatbot display name |
| `resumePdfUrl` | `string` | Path to your resume PDF (e.g. `'/resume.pdf'`) |
| `resumeText` | `string` | Resume as plain text (alternative to PDF) |
| `apiKey` | `string` | LLM provider API key |
| `model` | `string` | Model ID (see table below) |
| `position` | `'bottom-right' \| 'bottom-left'` | Widget position |
| `primaryColor` | `string` | Accent color hex (default `#C0392B`) |
| `apiBaseUrl` | `string` | Custom endpoint for a backend proxy |

**Models**

| Provider | Model ID | Cost |
|---|---|---|
| Groq | `llama-3.3-70b-versatile` | Free |
| Groq (faster) | `llama3-8b-8192` | Free |
| Google Gemini | `gemini-2.0-flash` | Free tier |
| Anthropic Claude | `claude-opus-4-7` | Paid |
| OpenAI | `gpt-4o-mini` | Paid |

---

## Local development

```bash
git clone https://github.com/YuanChen/portfolio-assistant-sdk.git
cd portfolio-assistant-sdk
npm install
cp .env.example .env    # add your API key
npm run dev             # http://localhost:5173
```
