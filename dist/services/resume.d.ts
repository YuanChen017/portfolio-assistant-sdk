export declare function saveResume(text: string): void;
export declare function loadResume(): string | null;
export declare function clearResume(): void;
export declare function extractTextFromUrl(url: string): Promise<string>;
export declare function extractTextFromFile(file: File): Promise<string>;
