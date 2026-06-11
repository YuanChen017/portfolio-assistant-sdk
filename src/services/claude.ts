import type { Message, WidgetConfig } from '../types';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-opus-4-7';

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
  const url = config.apiBaseUrl || ANTHROPIC_URL;

  if (!apiKey) {
    onError('No API key provided. Pass apiKey in the widget config.');
    return;
  }

  const systemPrompt = buildSystemPrompt(ownerName, resumeText);
  const requestMessages = messages.map((m) => ({ role: m.role, content: m.content }));

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1200,
        system: [
          {
            type: 'text',
            text: systemPrompt,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: requestMessages,
        stream: true,
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
    let eventType = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('event: ')) {
          eventType = trimmed.slice(7);
          continue;
        }

        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);

        if (eventType === 'message_stop') { onDone(); return; }
        if (eventType !== 'content_block_delta') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.delta?.type === 'text_delta' && parsed.delta?.text) {
            onChunk(parsed.delta.text);
          }
        } catch { /* skip malformed chunk */ }
      }
    }
    onDone();
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Network error');
  }
}
