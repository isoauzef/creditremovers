import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const CARDS = [
  {
    eyebrow: "Read",
    title: "Briefings & case notes",
    body: "Field-tested observations from our analysts on dispute strategy, FCRA updates and the credit bureaus’ shifting positions.",
    cta: "Visit the newsroom",
    to: "/news",
  },
  {
    eyebrow: "Begin",
    title: "Become a client",
    body: "Choose monthly or pay-in-full, complete your secure intake, and meet your assigned senior analyst within 24 hours.",
    cta: "Start your application",
    to: "/checkout",
  },
  {
    eyebrow: "Discuss",
    title: "Free consultation",
    body: "Tell us what’s on your report. A senior file analyst will review and respond candidly within one business day.",
    cta: "Request consultation",
    to: "/#lead-form",
  },
];

export function CrossNavCTA() {
  return (
    <section className="bg-[var(--color-stone-50)] border-y border-[var(--color-stone-200)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--color-stone-200)] border border-[var(--color-stone-200)]">
          {CARDS.map((c) => (
            <Link
              key={c.title}
              to={c.to}
              className="group bg-[var(--color-paper)] p-10 hover:bg-[var(--color-paper)] transition-colors flex flex-col justify-between min-h-[18rem]"
            >
              <div>
                <div className="eyebrow mb-5">{c.eyebrow}</div>
                <h3 className="font-serif text-2xl md:text-[1.6rem] text-[var(--color-ink)] mb-4">
                  {c.title}
                </h3>
                <p className="text-sm text-[var(--color-stone-700)] leading-relaxed">{c.body}</p>
              </div>
              <div className="mt-8 inline-flex items-center gap-2 text-sm tracking-wide text-[var(--color-accent)] group-hover:gap-3 transition-all">
                {c.cta} <ArrowUpRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CrossNavCTA;
