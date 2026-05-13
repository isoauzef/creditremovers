const LOGOS = ["Forbes", "Bloomberg", "TechCrunch", "Yahoo Finance", "USA Today", "MarketWatch"];

export function FeaturedIn() {
  return (
    <section className="bg-[var(--color-paper-soft)] border-y border-[var(--color-stone-200)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-14">
        <div className="text-center text-xs uppercase tracking-[0.2em] text-[var(--color-stone-500)] mb-6">
          As featured in
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-10 md:gap-x-14 gap-y-4 opacity-70">
          {LOGOS.map((l) => (
            <span key={l} className="text-lg md:text-xl font-semibold text-[var(--color-stone-600)] tracking-tight">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedIn;
