const STORAGE_KEY = 'pas-resume-v1';

export function saveResume(text: string): void {
  localStorage.setItem(STORAGE_KEY, text);
}

export function loadResume(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function clearResume(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export async function extractTextFromUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch resume PDF (${res.status})`);
  const buffer = await res.arrayBuffer();
  return extractPDFBuffer(buffer);
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'text/plain') {
    return readAsText(file);
  }
  if (file.type === 'application/pdf') {
    return extractPDFText(file);
  }
  throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

async function extractPDFText(file: File): Promise<string> {
  return extractPDFBuffer(await file.arrayBuffer());
}

async function extractPDFBuffer(buffer: ArrayBuffer): Promise<string> {
  let pdfjs: typeof import('pdfjs-dist');
  try {
    pdfjs = await import('pdfjs-dist');
  } catch {
    throw new Error(
      'PDF support requires pdfjs-dist. Run: npm install pdfjs-dist\n' +
      'Or paste your resume text instead.',
    );
  }

  pdfjs.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pages.push(content.items.map((item: any) => item.str).join(' '));
  }
  return pages.join('\n').trim();
}
