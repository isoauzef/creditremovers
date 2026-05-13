import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { useMediaSrc } from "../hooks/useMedia";

export function Hero() {
  const heroImg = useMediaSrc("homeHero");
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-paper)] to-[var(--color-stone-50)]" aria-hidden />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-8 md:pt-28 pb-10 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 max-w-3xl">
          <div className="eyebrow mb-6 inline-flex items-center gap-3">
            <span className="hairline-gold w-10" aria-hidden />
            Federally protected credit repair
          </div>

          <h1 className="font-serif text-[var(--color-ink)] tracking-tight text-[clamp(3rem,6vw,5rem)] leading-[1.04]">
            Take control of your credit legally</h1>

          <p className="mt-8 text-lg md:text-xl text-[var(--color-stone-700)] max-w-2xl leading-relaxed">
            We permanently remove negative items from your Equifax, Experian and TransUnion reports - using federal consumer protections & incentives to boost your credit score.     
          </p>

          <div className="mt-12 flex flex-wrap gap-4">
            <a
              href="#lead-form"
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-md bg-[var(--color-ink)] text-[var(--color-paper)] btn-press text-sm tracking-wide"
            >
              Free Consultation
              <ArrowRight size={16} />
            </a>
            <Link
              to="/checkout"
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-md border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] btn-press text-sm tracking-wide transition-colors"
            >
              Become a Client
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-3 text-sm text-[var(--color-stone-600)]">
            <ShieldCheck size={18} className="text-[var(--color-accent)]" />
            Bank-grade encryption · KMS-protected uploads · No hidden fees
          </div>
          </div>

          {heroImg && (
            <div className="lg:col-span-5">
              <div className="aspect-[4/5] overflow-hidden rounded-md bg-[var(--color-paper)]">
                <img
                  src={heroImg}
                  alt=""
                  className="w-full h-full object-cover hero-feather"
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
