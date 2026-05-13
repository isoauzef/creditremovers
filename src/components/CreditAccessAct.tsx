import { Smartphone, Zap, Home as HomeIcon, ShieldCheck, ArrowUpRight, ScrollText } from "lucide-react";

const BUREAUS = ["Experian", "Equifax", "TransUnion"] as const;

const BILLS = [
  {
    icon: Smartphone,
    name: "Cell phone",
    detail: "Monthly mobile and landline payments",
  },
  {
    icon: Zap,
    name: "Utilities",
    detail: "Electricity, gas, water and waste",
  },
  {
    icon: HomeIcon,
    name: "Rent",
    detail: "On-time rent reported to all three bureaus",
  },
  {
    icon: ShieldCheck,
    name: "Insurance",
    detail: "Auto, home and life (monthly policies)",
  },
];

export function CreditAccessAct() {
  return (
    <section className="relative bg-[var(--color-ink)] text-[var(--color-paper)] overflow-hidden">
      {/* Subtle texture / gold rule */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)]/60 to-transparent" aria-hidden />
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(176,141,87,0.6) 0, transparent 40%), radial-gradient(circle at 85% 70%, rgba(176,141,87,0.4) 0, transparent 45%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LEFT — Editorial */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3 mb-8">
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/5 text-[var(--color-gold)] text-[10px] tracking-[0.22em] uppercase font-medium"
              >
                <ScrollText size={11} />
                Federal Law · Now in effect
              </span>
            </div>

            <div className="eyebrow text-[var(--color-gold)] mb-5">
              The Credit Access and Inclusion Act
            </div>

            <h2 className="font-serif tracking-tight text-[var(--color-paper)] leading-[1.05] text-[clamp(2.25rem,4.5vw,3.5rem)]">
              The bills you already pay
              <br />
              <em className="not-italic text-[var(--color-gold)]">are now building</em> your credit.
            </h2>

            <p className="mt-8 text-lg text-[var(--color-stone-300)] leading-relaxed max-w-xl">
              Thanks to the newly passed{" "}
              <span className="text-[var(--color-paper)] underline decoration-[var(--color-gold)]/60 underline-offset-4">
                Credit Access and Inclusion Act
              </span>
              , we add the positive payment history from your cell phone, utilities,
              rent and insurance to all three credit bureaus — instantly raising your score
              the moment that data lands on your file.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--color-stone-700)]/40 border border-[var(--color-stone-700)]/40 rounded-md overflow-hidden">
              {[
                { k: "01", l: "Verify enrolled bills" },
                { k: "02", l: "Report 24 months of history" },
                { k: "03", l: "Score reflects within days" },
              ].map((s) => (
                <div key={s.k} className="bg-[var(--color-ink)] p-5">
                  <div className="font-serif text-[var(--color-gold)] text-xl mb-2">{s.k}</div>
                  <div className="text-sm text-[var(--color-stone-200)] leading-snug">{s.l}</div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-xs text-[var(--color-stone-500)] max-w-xl leading-relaxed">
              Eligibility based on monthly recurring payments. Reporting is opt-in and only
              positive history is submitted. Health insurance and non-monthly policies excluded.
            </p>
          </div>

          {/* RIGHT — Ledger / status panel */}
          <div className="lg:col-span-6">
            <div className="relative">
              {/* outer frame */}
              <div className="border border-[var(--color-stone-700)]/60 rounded-md bg-[var(--color-ink)]/40 backdrop-blur-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-stone-700)]/60">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
                    <span className="text-[10px] tracking-[0.22em] uppercase text-[var(--color-stone-400)]">
                      Positive Reporting · Live
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase text-[var(--color-stone-500)]">
                    {BUREAUS.map((b) => (
                      <span key={b} className="px-2 py-0.5 border border-[var(--color-stone-700)] rounded text-[var(--color-stone-300)]">
                        {b.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>

                <ul className="divide-y divide-[var(--color-stone-700)]/40">
                  {BILLS.map(({ icon: Icon, name, detail }) => (
                    <li
                      key={name}
                      className="flex items-center gap-5 px-6 py-5 hover:bg-[var(--color-stone-900)]/30 transition-colors"
                    >
                      <div className="w-10 h-10 shrink-0 rounded-full border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 flex items-center justify-center text-[var(--color-gold)]">
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-serif text-lg text-[var(--color-paper)]">{name}</div>
                        <div className="text-xs text-[var(--color-stone-400)] mt-0.5 truncate">{detail}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {BUREAUS.map((b) => (
                          <span
                            key={b}
                            title={b}
                            className="w-2 h-2 rounded-full bg-[var(--color-gold)] shadow-[0_0_8px_rgba(176,141,87,0.6)]"
                          />
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-stone-700)]/60 bg-[var(--color-stone-900)]/30">
                  <div>
                    <div className="text-[10px] tracking-[0.22em] uppercase text-[var(--color-stone-500)] mb-1">
                      Average impact
                    </div>
                    <div className="font-serif text-2xl text-[var(--color-paper)] tabular-nums">
                      +<span className="text-[var(--color-gold)]">37</span> pts
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--color-gold)]">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
              </div>

              {/* outer gold accent */}
              <div className="absolute -inset-px rounded-md pointer-events-none border border-[var(--color-gold)]/10" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
