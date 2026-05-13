import { TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CaseStudies() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="eyebrow mb-3 text-[var(--color-accent)]">Case Study</div>
          <h2 className="text-[var(--color-ink)]">Real Results, Real Approvals</h2>
        </div>

        <div className="max-w-4xl mx-auto card-soft p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-1 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-paper-soft)] mb-4">
                <TrendingUp size={28} className="text-[var(--color-accent)]" />
              </div>
              <div className="text-5xl font-bold text-[var(--color-accent)] tabular-nums">
                540<span className="text-[var(--color-stone-400)] mx-1">→</span>720
              </div>
              <div className="mt-2 text-sm font-medium text-[var(--color-stone-600)]">
                Score increase in 90 days
              </div>
            </div>

            <div className="md:col-span-2 md:border-l md:border-[var(--color-stone-200)] md:pl-10">
              <h3 className="text-[var(--color-ink)] mb-3">From Denied to Approved</h3>
              <p className="text-[var(--color-stone-600)] leading-relaxed mb-4">
                A first-time homebuyer came to us with 23 negative items across three bureaus —
                old collections, two late payments and a duplicate charge-off. Within 90 days we
                had removed 19 items, his score climbed 180 points, and his mortgage application
                was approved at a competitive rate.
              </p>
              <ul className="space-y-1.5 text-sm text-[var(--color-stone-700)] mb-6">
                <li>• 19 of 23 negative items permanently removed</li>
                <li>• Mortgage approved within 60 days of program completion</li>
                <li>• Saved over $84,000 in interest over the loan term</li>
              </ul>
              <Link to="/checkout" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
                Start your case <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CaseStudies;
