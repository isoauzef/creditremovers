import { ShieldCheck, Award, Zap } from "lucide-react";

const CARDS = [
  {
    icon: ShieldCheck,
    title: "100% FCRA Compliant",
    body: "We use only legal, federally protected dispute methods. No shortcuts, no black-hat tactics — ever.",
  },
  {
    icon: Award,
    title: "Permanent Removal",
    body: "Once removed, negative items are gone for good. We work all three bureaus until your file is clean.",
  },
  {
    icon: Zap,
    title: "Fast Results",
    body: "Bureaus must respond within 30 days. Most clients see their first round of updates in 30–45 days.",
  },
];

export function HowItWorks() {
  return (
    <section id="why" className="bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-0 pb-12 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-[var(--color-ink)]">Why Choose Credit Removers?</h2>
          <p className="mt-4 text-lg text-[var(--color-stone-600)]">
            We're the trusted leader in credit repair with a proven track record.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CARDS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card-soft p-8 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--color-paper-soft)] flex items-center justify-center mb-5">
                <Icon size={26} className="text-[var(--color-accent)]" />
              </div>
              <h3 className="text-[var(--color-ink)] mb-3">{title}</h3>
              <p className="text-[var(--color-stone-600)] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
