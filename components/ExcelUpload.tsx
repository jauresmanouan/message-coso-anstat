"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";

export interface ParsedCandidate {
  nom: string;
  prenom: string;
  telephone: string;
}

// Reconnait les colonnes quelle que soit la casse / les accents.
function pick(row: Record<string, unknown>, keys: string[]): string {
  for (const k of Object.keys(row)) {
    const norm = k
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim();
    if (keys.includes(norm)) return String(row[k] ?? "").trim();
  }
  return "";
}

export function ExcelUpload({
  onParsed,
}: {
  onParsed: (rows: ParsedCandidate[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function handleFile(file: File) {
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

      const rows: ParsedCandidate[] = json
        .map((r) => ({
          nom: pick(r, ["nom", "name", "lastname"]),
          prenom: pick(r, ["prenom", "firstname", "prénom"]),
          telephone: pick(r, [
            "telephone",
            "tel",
            "phone",
            "numero",
            "numéro",
            "mobile",
            "contact",
          ]),
        }))
        .filter((r) => r.telephone);

      if (!rows.length) {
        setError(
          "Aucune ligne valide. Colonnes attendues : nom, prenom, telephone.",
        );
        return;
      }
      setFileName(file.name);
      onParsed(rows);
    } catch {
      setError("Impossible de lire le fichier. Format Excel/CSV attendu.");
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-white px-6 py-12 text-center transition-colors hover:border-orange hover:bg-orange-soft"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-soft text-orange-dark group-hover:bg-orange group-hover:text-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {fileName || "Importer un fichier Excel"}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Colonnes : nom · prénom · téléphone — .xlsx, .xls, .csv
          </p>
        </div>
      </button>
      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
