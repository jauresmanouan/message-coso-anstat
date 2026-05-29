// Briques UI de base — minimalistes, réutilisables partout.
import React from "react";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-white p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "dark";
}) {
  const styles = {
    primary:
      "bg-orange text-white hover:bg-orange-dark disabled:opacity-50 disabled:cursor-not-allowed",
    dark: "bg-foreground text-white hover:bg-black/80 disabled:opacity-50",
    ghost: "bg-transparent text-foreground border border-border hover:bg-orange-soft",
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 h-11 text-sm font-semibold transition-colors ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-zinc-100 text-zinc-600",
    sent: "bg-blue-50 text-blue-600",
    delivered: "bg-green-50 text-green-700",
    failed: "bg-red-50 text-red-600",
  };
  const label: Record<string, string> = {
    pending: "En attente",
    sent: "Envoyé",
    delivered: "Livré",
    failed: "Échec",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        map[status] ?? "bg-zinc-100 text-zinc-600"
      }`}
    >
      {label[status] ?? status}
    </span>
  );
}

export function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <Card className={accent ? "bg-orange-soft border-orange/20" : ""}>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p
        className={`mt-1 text-3xl font-extrabold tracking-tight ${
          accent ? "text-orange-dark" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </Card>
  );
}
