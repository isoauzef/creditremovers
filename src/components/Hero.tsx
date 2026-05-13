import { Link } from "react-router-dom";
import { Check, ShieldCheck } from "lucide-react";
import { useMediaSrc } from "../hooks/useMedia";

const TRUST = [
  "98% Success Rate",
  "3-Bureau Coverage",
  "No Win, No Fee",
  "Results in 30 Days",
];

export function Hero() {
  const heroImg = useMediaSrc("homeHero");
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-12 md:pt-20 pb-12 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <h1 className="text-[var(--color-ink)] tracking-tight font-bold text-[40px] leading-[46px] md:text-[52px] md:leading-[58px]">
              Take Control of<br />
              <span className="text-[var(--color-accent)]">Your Credit Legally</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-[var(--color-stone-600)] max-w-2xl leading-relaxed">
              We permanently remove negative items from your Equifax, Experian and TransUnion
              reports — using federal consumer protections and incentives to boost your credit score.
            </p>

            <div className="mt-8 flex flex-row flex-nowrap gap-2 md:gap-3">
              <Link to="/checkout" className="btn-primary whitespace-nowrap">
                Get Started
              </Link>
              <a href="#lead-form" className="btn-secondary whitespace-nowrap">
                Free Consultation
              </a>
            </div>

            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 max-w-xl">
              {TRUST.map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-[var(--color-stone-700)]">
                  <Check size={16} className="text-[var(--color-accent)] shrink-0" />
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-2 text-xs text-[var(--color-stone-500)]">
              <ShieldCheck size={14} className="text-[var(--color-accent)]" />
              Bank-grade encryption · KMS-protected uploads
            </div>
          </div>

          {heroImg && (
            <div className="lg:col-span-5">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl">
                <img
                  src={heroImg}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Hero;
