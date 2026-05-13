import { useEffect, useState } from "react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { useMediaSrc } from "../hooks/useMedia";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

interface Submission {
  id: number;
  paymentPlan: "monthly" | "upfront";
  paymentStatus: string;
  monthsBilled: number;
  totalPaidCents: number;
  createdAt: string;
}

interface Round {
  id: number;
  roundNumber: number;
  summaryDate: string;
  previousSummaryDate: string | null;

  equifaxScore: number | null;
  equifaxPrevScore: number | null;
  experianScore: number | null;
  experianPrevScore: number | null;
  transunionScore: number | null;
  transunionPrevScore: number | null;

  disputesDeletedThisRound: number;
  disputesDeletedLastRound: number;
  disputesDeletedGrandTotal: number;

  ongoingDisputesThisRound: number;
  ongoingDisputesLastRound: number;
  ongoingDisputesGrandTotal: number;

  undisputedNegativeThisRound: number;
  undisputedNegativeLastRound: number;
  undisputedNegativeGrandTotal: number;

  updatedToPositiveThisRound: number;
  updatedToPositiveLastRound: number;
  updatedToPositiveGrandTotal: number;

  newItemsAddedThisRound: number;
  newItemsAddedLastRound: number;
  newItemsAddedGrandTotal: number;

  notes: string | null;
}

interface DashboardData {
  user: User;
  submissions: Submission[];
  rounds: Round[];
}

export default function CustomerAccount() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    fetch("/api/customer/dashboard", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) { setAuthed(false); return null; }
        setAuthed(true);
        return r.json();
      })
      .then((d) => { if (d) setData(d); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20">
        {loading ? (
          <div className="text-[var(--color-stone-600)]">Loading…</div>
        ) : !authed ? (
          <LoginForm onSuccess={() => window.location.reload()} />
        ) : data ? (
          <Dashboard data={data} />
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const bg = useMediaSrc("accountLoginBg");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "login") {
        const r = await fetch("/api/customer/login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          throw new Error(j.message || "Sign in failed");
        }
        onSuccess();
      } else {
        await fetch("/api/customer/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        setForgotSent(true);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative max-w-md mx-auto pt-12">
      {bg && (
        <div className="absolute -inset-x-6 -top-12 bottom-0 -z-10 overflow-hidden rounded-md" aria-hidden>
          <img src={bg} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-paper)] via-[var(--color-paper)]/80 to-[var(--color-paper)]" />
        </div>
      )}
      <div className="eyebrow mb-3">Client Portal</div>
      <h1 className="font-serif text-3xl mb-8 text-[var(--color-ink)]">
        {mode === "login" ? "Sign in to your dashboard" : "Reset your password"}
      </h1>

      {forgotSent ? (
        <p className="text-[var(--color-stone-700)]">
          If an account with that email exists, we’ve sent a reset link.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          {mode === "login" && (
            <Field label="Password" type="password" value={password} onChange={setPassword} required />
          )}

          {error && <p className="text-sm text-[#9b2c2c]">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3.5 rounded-md bg-[var(--color-ink)] text-[var(--color-paper)] btn-press text-sm tracking-wide disabled:opacity-60"
          >
            {submitting ? "Working…" : mode === "login" ? "Sign In" : "Send Reset Link"}
          </button>

          <div className="text-sm text-center">
            {mode === "login" ? (
              <button type="button" onClick={() => setMode("forgot")} className="text-[var(--color-accent)] hover:underline">
                Forgot your password?
              </button>
            ) : (
              <button type="button" onClick={() => setMode("login")} className="text-[var(--color-accent)] hover:underline">
                Back to sign in
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label, type = "text", value, onChange, required,
}: { label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.18em] text-[var(--color-stone-600)] mb-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-transparent border-0 border-b border-[var(--color-stone-300)] focus:border-[var(--color-ink)] outline-none px-0 py-2 text-base"
      />
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────
function Dashboard({ data }: { data: DashboardData }) {
  const { user, submissions, rounds } = data;
  const submission = submissions[0];
  const [activeRoundId, setActiveRoundId] = useState<number | null>(rounds[0]?.id ?? null);
  const round = rounds.find((r) => r.id === activeRoundId) || rounds[0] || null;
  const emptyArt = useMediaSrc("accountEmpty");

  async function handleLogout() {
    await fetch("/api/customer/logout", { method: "POST", credentials: "include" });
    window.location.reload();
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-6 mb-12 pb-6 border-b border-[var(--color-stone-200)]">
        <div>
          <div className="eyebrow mb-2">Client Dashboard</div>
          <h1 className="font-serif text-3xl md:text-4xl text-[var(--color-ink)]">
            Welcome back, {user.firstName || user.email.split("@")[0]}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {submission && <PlanBadge submission={submission} />}
          <button onClick={handleLogout} className="text-sm text-[var(--color-stone-700)] hover:text-[var(--color-ink)] underline-offset-4 hover:underline">
            Sign out
          </button>
        </div>
      </header>

      {rounds.length === 0 ? (
        <div className="bg-[var(--color-stone-50)] border border-[var(--color-stone-200)] p-10 text-center">
          {emptyArt && (
            <img src={emptyArt} alt="" className="mx-auto mb-8 w-40 h-40 object-cover rounded-md" loading="lazy" decoding="async" />
          )}
          <h2 className="font-serif text-2xl mb-3">Your first round is in motion.</h2>
          <p className="text-[var(--color-stone-700)] max-w-xl mx-auto">
            Disputes have been filed. The bureaus have 30 days to respond. Your senior analyst will publish your first
            round summary here as soon as the responses are received.
          </p>
        </div>
      ) : (
        <>
          {rounds.length > 1 && (
            <div className="mb-8 flex items-center gap-3">
              <label className="text-xs uppercase tracking-[0.18em] text-[var(--color-stone-600)]">Round</label>
              <select
                value={activeRoundId ?? ""}
                onChange={(e) => setActiveRoundId(Number(e.target.value))}
                className="bg-transparent border-b border-[var(--color-stone-300)] focus:border-[var(--color-ink)] outline-none px-0 py-1.5 text-sm"
              >
                {rounds.map((r) => (
                  <option key={r.id} value={r.id}>
                    Round {r.roundNumber} · {new Date(r.summaryDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {round && (
            <>
              <CreditScoreSummary round={round} />
              <ChangesSinceLastReport round={round} />
              {round.notes && (
                <section className="mt-12 bg-[var(--color-stone-50)] border border-[var(--color-stone-200)] p-8">
                  <div className="eyebrow mb-3">Analyst notes</div>
                  <p className="text-[var(--color-stone-800)] leading-relaxed whitespace-pre-line">{round.notes}</p>
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function PlanBadge({ submission }: { submission: Submission }) {
  const status = submission.paymentStatus;
  const label =
    submission.paymentPlan === "upfront"
      ? "Paid in Full"
      : status === "completed"
      ? "Program Completed"
      : `Month ${submission.monthsBilled} of 6`;
  return (
    <span className="text-xs uppercase tracking-[0.18em] px-3 py-1.5 border border-[var(--color-gold)] text-[var(--color-stone-800)] rounded-sm">
      {label}
    </span>
  );
}

// ── Credit Score Summary (3 bureau cards) ───────────────────────
const BUREAUS: { key: "equifax" | "experian" | "transunion"; label: string; abbr: string }[] = [
  { key: "equifax",    label: "Equifax",     abbr: "EQ" },
  { key: "experian",   label: "Experian",    abbr: "EX" },
  { key: "transunion", label: "TransUnion",  abbr: "TU" },
];

function CreditScoreSummary({ round }: { round: Round }) {
  return (
    <section className="mb-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="eyebrow mb-2">Credit Score Summary</div>
          <h2 className="font-serif text-2xl text-[var(--color-ink)]">Round {round.roundNumber}</h2>
        </div>
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-stone-600)] text-right">
          As of {new Date(round.summaryDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--color-stone-200)] border border-[var(--color-stone-200)]">
        {BUREAUS.map((b) => {
          const score = (round as any)[`${b.key}Score`] as number | null;
          const prev  = (round as any)[`${b.key}PrevScore`] as number | null;
          const delta = score != null && prev != null ? score - prev : null;
          return (
            <div key={b.key} className="bg-[var(--color-paper)] p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)]">{b.label}</span>
                <span className="text-xs text-[var(--color-stone-600)]">{b.abbr}</span>
              </div>
              <div className="font-serif text-6xl text-[var(--color-ink)] tabular-nums leading-none">
                {score ?? "—"}
              </div>
              <ScoreArc score={score} />
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-[var(--color-stone-600)]">Prev: <span className="text-[var(--color-stone-800)] tabular-nums">{prev ?? "—"}</span></span>
                {delta != null && (
                  <span className={`font-medium tabular-nums ${delta > 0 ? "text-[var(--color-accent)]" : delta < 0 ? "text-[#9b2c2c]" : "text-[var(--color-stone-600)]"}`}>
                    {delta > 0 ? "+" : ""}{delta}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ScoreArc({ score }: { score: number | null }) {
  const min = 300, max = 850;
  const pct = score != null ? Math.max(0, Math.min(1, (score - min) / (max - min))) : 0;
  // semicircle arc: radius 60, stroke 6
  const r = 60;
  const c = Math.PI * r; // half circle length
  const dash = pct * c;
  return (
    <svg viewBox="0 0 140 80" className="w-full mt-3" aria-hidden>
      <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="var(--color-stone-200)" strokeWidth="4" />
      <path
        d="M 10 70 A 60 60 0 0 1 130 70"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="4"
        strokeDasharray={`${dash} ${c}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Changes Since Last Report ───────────────────────────────────
const CATEGORIES: { key: string; label: string }[] = [
  { key: "disputesDeleted",      label: "Disputes Deleted" },
  { key: "ongoingDisputes",      label: "On-Going Disputes" },
  { key: "undisputedNegative",   label: "Un-Disputed Negative" },
  { key: "updatedToPositive",    label: "Updated to Positive" },
  { key: "newItemsAdded",        label: "New Items Added" },
];

function ChangesSinceLastReport({ round }: { round: Round }) {
  return (
    <section>
      <div className="eyebrow mb-2">Changes Since Last Report</div>
      <h2 className="font-serif text-2xl text-[var(--color-ink)] mb-6">Round-over-round movement</h2>

      <div className="overflow-x-auto border border-[var(--color-stone-200)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-stone-50)] border-b border-[var(--color-stone-200)]">
              <th className="text-left py-4 px-5 text-xs uppercase tracking-[0.18em] text-[var(--color-stone-700)] font-normal">Category</th>
              <th className="text-right py-4 px-5 text-xs uppercase tracking-[0.18em] text-[var(--color-stone-700)] font-normal">This Round</th>
              <th className="text-right py-4 px-5 text-xs uppercase tracking-[0.18em] text-[var(--color-stone-700)] font-normal">Last Round</th>
              <th className="text-right py-4 px-5 text-xs uppercase tracking-[0.18em] text-[var(--color-stone-700)] font-normal">Grand Total</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((c) => {
              const thisR = (round as any)[`${c.key}ThisRound`] as number;
              const lastR = (round as any)[`${c.key}LastRound`] as number;
              const total = (round as any)[`${c.key}GrandTotal`] as number;
              return (
                <tr key={c.key} className="border-b border-[var(--color-stone-200)] last:border-0">
                  <td className="py-5 px-5 font-serif text-base text-[var(--color-ink)]">{c.label}</td>
                  <td className="py-5 px-5 text-right tabular-nums text-[var(--color-stone-800)]">{thisR}</td>
                  <td className="py-5 px-5 text-right tabular-nums text-[var(--color-stone-600)]">{lastR}</td>
                  <td className="py-5 px-5 text-right tabular-nums text-[var(--color-ink)] font-medium">{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
