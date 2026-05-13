import { Star, Quote } from "lucide-react";

const ITEMS = [
  {
    quote:
      "I had 14 collections holding my score in the 500s. After three months with Credit Removers, 11 were gone and my score jumped over 130 points. Mortgage approved.",
    name: "Marcus T.",
    role: "Homeowner, Atlanta GA",
  },
  {
    quote:
      "They explained every step in plain English. No pressure, no upsells. I paid the $1,000 upfront, saved 20%, and watched my reports get cleaned round by round.",
    name: "Jessica R.",
    role: "Small Business Owner, Austin TX",
  },
  {
    quote:
      "Years of medical bills and a wrongful late from a closed account were dragging me down. Credit Removers handled every dispute and kept me posted weekly.",
    name: "David L.",
    role: "Nurse, Chicago IL",
  },
];

export function Testimonials() {
  return (
    <section className="bg-[var(--color-paper-soft)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-[var(--color-ink)]">What Our Clients Say</h2>
          <p className="mt-4 text-lg text-[var(--color-stone-600)]">
            Real results from real people who took control of their credit.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ITEMS.map((t) => (
            <figure key={t.name} className="card-soft p-7 relative">
              <Quote size={28} className="text-[var(--color-accent)]/20 absolute top-5 right-5" aria-hidden />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="fill-[var(--color-accent)] text-[var(--color-accent)]" />
                ))}
              </div>
              <blockquote className="text-[var(--color-stone-700)] leading-relaxed text-sm">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-5 pt-4 border-t border-[var(--color-stone-200)]">
                <div className="text-sm font-semibold text-[var(--color-ink)]">{t.name}</div>
                <div className="text-xs text-[var(--color-stone-500)]">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
