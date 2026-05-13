import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useMediaSrc } from "../hooks/useMedia";

const BULLETS = [
  "Remove inaccurate negative items",
  "Three-bureau coverage (Equifax, Experian, TransUnion)",
  "FCRA-compliant disputes — 100% legal",
  "Add positive history via the Credit Access & Inclusion Act",
  "Increase approval odds for mortgages and auto loans",
  "Most files see results in 30 days",
];

export function BrandReputation() {
  const img = useMediaSrc("homeSocialProof");
  return (
    <section id="how-it-works" className="bg-[var(--color-paper-soft)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-[var(--color-ink)]">
              Building a Reputable<br />
              Credit Profile for Success
            </h2>
            <p className="mt-5 text-lg text-[var(--color-stone-600)] leading-relaxed">
              Your credit file shapes everything — the mortgage you qualify for, the rate on
              your car loan, the apartment you can lease. We help you take control of that
              narrative by removing inaccurate negatives and adding the positive history
              you've already earned.
            </p>

            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BULLETS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-[var(--color-stone-700)]">
                  <Check size={16} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 p-5 bg-white border-l-4 border-[var(--color-accent)] rounded-r-md">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-2">
                New Federal Law
              </div>
              <p className="text-sm text-[var(--color-stone-700)] leading-relaxed">
                Thanks to the newly passed <strong>Credit Access and Inclusion Act</strong>,
                we add the positive payment history from your cell phone, utilities, rent and
                insurance to all three credit bureaus — instantly raising your score the
                moment that data lands on your file.
              </p>
            </div>

            <div className="mt-8">
              <Link to="/checkout" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>

          {img && (
            <div className="order-first lg:order-last">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl">
                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default BrandReputation;
