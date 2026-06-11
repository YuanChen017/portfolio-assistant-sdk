export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}
export interface WidgetConfig {
    /** Portfolio owner's name shown in system prompt */
    ownerName?: string;
    /** Chatbot display name */
    assistantName?: string;
    /** Pre-loaded resume text — skips the upload screen entirely */
    resumeText?: string;
    /** URL to a PDF resume — fetched and parsed automatically on load */
    resumePdfUrl?: string;
    /** LLM provider API key */
    apiKey?: string;
    /** Override default API endpoint (e.g. a backend proxy) */
    apiBaseUrl?: string;
    /** Model ID to use */
    model?: string;
    /** Widget position (default: bottom-right) */
    position?: 'bottom-right' | 'bottom-left';
    /** Primary accent color hex (default: #C0392B) */
    primaryColor?: string;
}
