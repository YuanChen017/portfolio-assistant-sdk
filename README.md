# portfolio-assistant-sdk

AI chatbot widget for portfolio sites. One component gives visitors a floating chat button to ask questions about your background or get job-match analysis from your resume.

```bash
npm install portfolio-assistant-sdk
```

---

## Using the widget in your portfolio

### 1. Install

```bash
npm install portfolio-assistant-sdk pdfjs-dist
```

### 2. Put your resume in `public/`

```
your-portfolio/
└── public/
    └── resume.pdf
```

### 3. Get a free API key

Sign up at **console.groq.com** → API Keys (free, no credit card).

Add to your `.env`:
```
VITE_GROQ_API_KEY=gsk_your-key-here
```

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

No CSS import needed — styles inject automatically.

---

## Config

| Prop | Type | Description |
|---|---|---|
| `ownerName` | `string` | Your name — used in the AI system prompt |
| `assistantName` | `string` | Chatbot display name |
| `resumePdfUrl` | `string` | Path to your PDF, e.g. `'/resume.pdf'` |
| `resumeText` | `string` | Resume as plain text (alternative to PDF) |
| `apiKey` | `string` | LLM provider API key |
| `model` | `string` | Model ID (see below) |
| `position` | `'bottom-right' \| 'bottom-left'` | Widget position |
| `primaryColor` | `string` | Accent color hex (default `#C0392B`) |
| `apiBaseUrl` | `string` | Custom endpoint for a backend proxy |

**Supported models**

| Provider | Model ID | Cost |
|---|---|---|
| Groq | `llama-3.3-70b-versatile` | Free |
| Groq | `llama3-8b-8192` | Free |
| Google Gemini | `gemini-2.0-flash` | Free tier |
| Anthropic Claude | `claude-opus-4-7` | Paid |
| OpenAI | `gpt-4o-mini` | Paid |

---

## Publishing a new version (for SDK maintainer)

```bash
npm run build
git add -A
git commit -m "v1.0.1 — describe change"
git push
```

Then on GitHub → **Releases** → **Draft a new release** → tag `v1.0.1` → **Publish release**.

GitHub Actions automatically runs `npm publish` on every release.

---

## First-time setup (deploy this repo)

### 1. Create the GitHub repo

Go to **github.com/new**:
- Name: `portfolio-assistant-sdk`
- Visibility: **Public**
- Don't add README or .gitignore (already exist)

### 2. Create an npm account and token

- Sign up at **npmjs.com**
- Go to **Access Tokens** → **Generate New Token** → type **Automation**
- Copy the token

### 3. Add the npm token to GitHub

In the GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
- Name: `NPM_TOKEN`
- Value: paste your npm token

### 4. Push and publish

```bash
cd ~/Desktop/portfolio-assistant-sdk
npm run build

git add src/ demo/ dist/ public/ package.json vite.config.ts \
        tsconfig.json tsconfig.app.json tsconfig.node.json \
        index.html .gitignore .env.example README.md \
        .github/

git commit -m "v1.0.0 — initial release"
git tag v1.0.0

git remote add origin https://github.com/YuanChen/portfolio-assistant-sdk.git
git push -u origin master
git push origin v1.0.0
```

Then on GitHub → **Releases** → **Draft a new release** → choose tag `v1.0.0` → **Publish release**.

GitHub Actions will build and run `npm publish` automatically. After ~1 minute, anyone can install it:

```bash
npm install portfolio-assistant-sdk
```

---

## Local dev / demo

```bash
git clone https://github.com/YuanChen/portfolio-assistant-sdk.git
cd portfolio-assistant-sdk
npm install
cp .env.example .env   # paste your Groq API key
npm run dev            # http://localhost:5173
```
