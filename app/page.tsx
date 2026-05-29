"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { ExcelUpload, type ParsedCandidate } from "@/components/ExcelUpload";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [message, setMessage] = useState(
    "Bonjour {prenom}, bienvenue dans le programme COSO.",
  );
  const [candidates, setCandidates] = useState<ParsedCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const charCount = message.length;
  const segments = Math.max(1, Math.ceil(charCount / 160));

  async function handleSubmit() {
    setError("");
    if (!candidates.length) return setError("Importe d'abord un fichier.");
    if (!message.trim()) return setError("Écris un message.");
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, candidates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      router.push(`/campagnes/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <Header />

      <div className="mt-10 grid gap-6 lg:grid-cols-5">
        {/* Colonne gauche : import + récap */}
        <div className="space-y-6 lg:col-span-2">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              1. Liste des candidats
            </label>
            <ExcelUpload onParsed={setCandidates} />
          </div>

          {candidates.length > 0 && (
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Destinataires</p>
                <span className="rounded-full bg-orange-soft px-2.5 py-0.5 text-xs font-bold text-orange-dark">
                  {candidates.length}
                </span>
              </div>
              <div className="mt-3 max-h-56 space-y-1.5 overflow-y-auto pr-1">
                {candidates.slice(0, 50).map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-xs"
                  >
                    <span className="font-medium">
                      {c.prenom} {c.nom}
                    </span>
                    <span className="text-muted">{c.telephone}</span>
                  </div>
                ))}
                {candidates.length > 50 && (
                  <p className="pt-1 text-center text-xs text-muted">
                    + {candidates.length - 50} autres…
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Colonne droite : message + envoi */}
        <div className="space-y-6 lg:col-span-3">
          <Card>
            <label className="mb-2 block text-sm font-semibold">
              Nom de la campagne
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Convocation session 1"
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-orange"
            />

            <label className="mb-2 mt-5 block text-sm font-semibold">
              2. Message SMS
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full resize-none rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-orange"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted">
              <span>
                Variables :{" "}
                <code className="rounded bg-zinc-100 px-1">{"{prenom}"}</code>{" "}
                <code className="rounded bg-zinc-100 px-1">{"{nom}"}</code>
              </span>
              <span>
                {charCount} car. · {segments} SMS
              </span>
            </div>
          </Card>

          {error && (
            <p className="text-sm font-medium text-red-600">{error}</p>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Préparation…" : "Préparer l'envoi →"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange text-lg font-extrabold text-white">
          C
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight">COSO · SMS</h1>
          <p className="text-xs text-muted">
            Envoi & suivi des messages aux candidats
          </p>
        </div>
      </div>
      <a
        href="/campagnes"
        className="text-sm font-semibold text-orange-dark hover:underline"
      >
        Campagnes →
      </a>
    </header>
  );
}
