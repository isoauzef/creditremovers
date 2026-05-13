import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useMediaSrc } from "../hooks/useMedia";

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
    a: "Bureaus have 30 days to respond to each dispute. Most clients see their first round of updates within 30–45 days. Comprehensive cleanups typically run 4–6 months.",
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
  const img = useMediaSrc("homeFaq");
  return (
    <section id="faq" className="bg-[var(--color-paper)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {img && (
            <div className="lg:col-span-4 lg:sticky lg:top-28">
              <div className="aspect-[3/4] overflow-hidden rounded-md border border-[var(--color-stone-200)]">
                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
              </div>
            </div>
          )}
          <div className={img ? "lg:col-span-8" : "lg:col-span-12 max-w-4xl mx-auto"}>
            <div className="eyebrow mb-4">Questions, answered plainly</div>
            <h2 className="font-serif text-[var(--color-ink)] mb-12">Frequently Asked Questions</h2>
            <div className="border-t border-[var(--color-stone-300)]">
              {ITEMS.map((it, i) => <Row key={i} {...it} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--color-stone-300)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-6 py-6 text-left"
        aria-expanded={open}
      >
        <span className="font-serif text-lg md:text-xl text-[var(--color-ink)]">{q}</span>
        <span className="shrink-0 text-[var(--color-stone-600)]">
          {open ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>
      {open && (
        <div className="pb-6 pr-10 text-[var(--color-stone-700)] leading-relaxed">{a}</div>
      )}
    </div>
  );
}

export default FAQ;
