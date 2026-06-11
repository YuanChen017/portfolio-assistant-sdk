import { Message, WidgetConfig } from '../types';
export declare function streamChat(messages: Message[], resumeText: string, config: WidgetConfig, onChunk: (delta: string) => void, onDone: () => void, onError: (err: string) => void): Promise<void>;
