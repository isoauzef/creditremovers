import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const ITEMS = [
  {
    q: "Is credit repair legal?",
    a: "Yes. The Fair Credit Reporting Act (FCRA) gives every American the right to dispute inaccurate, outdated or unverifiable information on their credit reports. We file disputes on your behalf using these federal protections — nothing more, nothing less.",
  },
  {
    q: "What kinds of items can be removed?",
    a: "Late payments, collections, charge-offs, repossessions, bankruptcies, judgments, tax liens, identity-theft accounts and inquiries — provided they are inaccurate, unverifiable or improperly reported.",
  },
  {
    q: "How much does my score go up?",
    a: "Removing about 10 negative items per bureau (30 items total) on average raises credit scores by up to 150 points, depending on the kind of negative items removed.",
  },
  {
    q: "How long does it take?",
    a: "Bureaus have 30 days to respond to each dispute. Most clients see their first round of updates within 30–45 days. The full 3-month program covers most files.",
  },
  {
    q: "What if you can’t remove anything?",
    a: "If we don’t remove a single item from your reports, you don’t pay. That’s the entire premise of our money-back guarantee.",
  },
  {
    q: "How do you protect my information?",
    a: "Your SSN is encrypted with AWS KMS envelope encryption — a unique data key per record, wrapped by a master key we never see. ID and utility uploads are stored in AWS S3 with SSE-KMS. Every internal access is logged.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-white">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-[var(--color-ink)]">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-[var(--color-stone-600)]">
            Everything you need to know about our credit repair service.
          </p>
        </div>
        <div className="border-t border-[var(--color-stone-200)]">
          {ITEMS.map((it, i) => <Row key={i} {...it} />)}
        </div>
      </div>
    </section>
  );
}

function Row({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--color-stone-200)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base md:text-lg font-semibold text-[var(--color-ink)]">{q}</span>
        <span className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-paper-soft)] flex items-center justify-center text-[var(--color-stone-600)]">
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      {open && (
        <div className="pb-5 pr-12 text-[var(--color-stone-600)] leading-relaxed">{a}</div>
      )}
    </div>
  );
}

export default FAQ;
