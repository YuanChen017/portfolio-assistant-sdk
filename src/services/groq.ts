import type { Message, WidgetConfig } from '../types';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

function buildSystemPrompt(ownerName: string, resumeText: string): string {
  return `You are an AI portfolio assistant for ${ownerName}.

Your ONLY purpose is to answer questions about ${ownerName} based on the resume provided below.

STRICT RULES:
1. Only answer questions about ${ownerName}'s professional background, skills, experience, education, and projects.
2. If asked about anything unrelated (weather, general knowledge, politics, other people, etc.), respond ONLY with: "I'm here to answer questions about ${ownerName}'s professional background and qualifications. Please ask about their skills, experience, education, or how they might fit a role."
3. JOB MATCH REQUESTS: If the user pastes a job description or asks about job fit, you MUST respond with:
   - A match percentage (0–100%) based on skills, experience, and requirement alignment
   - Section: "✅ Matching Qualifications" — bullet list of matching items
   - Section: "📈 Areas to Develop" — any gaps (if none, say so)
   - Section: "💼 Overall Recommendation" — one of: Strong Match / Good Match / Partial Match / Not a Match, with a brief reason
4. Be honest and accurate. Never invent information not found in the resume.
5. Be professional, encouraging, and concise.

${ownerName}'s Resume:
---
${resumeText}
---`;
}

export async function streamChat(
  messages: Message[],
  resumeText: string,
  config: WidgetConfig,
  onChunk: (delta: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
): Promise<void> {
  const apiKey = config.apiKey;
  const ownerName = config.ownerName || 'the owner';
  const model = config.model || DEFAULT_MODEL;
  const url = config.apiBaseUrl || GROQ_URL;

  if (!apiKey) {
    onError('No API key provided. Get a free key at console.groq.com');
    return;
  }

  const requestMessages = [
    { role: 'system', content: buildSystemPrompt(ownerName, resumeText) },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: requestMessages,
        stream: true,
        max_tokens: 1200,
        temperature: 0.6,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      onError(`API error ${res.status}: ${body}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) { onError('Streaming not supported'); return; }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') { onDone(); return; }
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) onChunk(delta);
        } catch { /* skip malformed chunk */ }
      }
    }
    onDone();
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Network error');
  }
}
