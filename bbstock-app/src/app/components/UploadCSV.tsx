'use client';

import { useRef } from 'react';

type UploadCSVProps = {
  onRows: (rows: Record<string, string>[]) => void;
  accept?: string;
  label?: string;
};

export default function UploadCSV({ onRows, accept = '.csv', label = 'Importar CSV' }: UploadCSVProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function parseCsv(text: string) {
    // parser simples e robusto o suficiente (sem aspas aninhadas complexas)
    const lines = text.replace(/\r/g, '').split('\n').filter(Boolean);
    if (!lines.length) return [];
    const sep = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ','; // detecta ; vs ,
    const headers = lines[0].split(sep).map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const cells = line.split(sep).map((c) => c.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = cells[i] ?? '';
      });
      return obj;
    });
    return rows;
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCsv(text);
    onRows(rows);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        id="upload-csv-input"
      />
      <label
        htmlFor="upload-csv-input"
        className="inline-flex items-center gap-2 rounded-lg border border-[#DDE7FF] px-4 py-2 text-[#0F2C93] hover:bg-white cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F2C93" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {label}
      </label>
    </div>
  );
}