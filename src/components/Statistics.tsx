import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 12000, suffix: "+", label: "Items Removed", caption: "Across all three bureaus" },
  { value: 1000,  suffix: "+", label: "People Served",  caption: "Restored credit access" },
  { value: 30,    suffix: " days", label: "Avg. First Round", caption: "From dispute filed to update" },
  { value: 0,     prefix: "$",  label: "If Not Removed", caption: "Money-back guarantee" },
];

function useCountUp(target: number, run: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return value;
}

export function Statistics() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-[var(--color-paper)] border-y border-[var(--color-stone-200)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-24">
        <div className="eyebrow mb-4">By the numbers</div>
        <h2 className="font-serif text-[var(--color-ink)] max-w-2xl mb-16">
          Quiet, consistent results — measured, not advertised.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
          {STATS.map((s) => <StatCard key={s.label} {...s} run={visible} />)}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  value, suffix = "", prefix = "", label, caption, run,
}: { value: number; suffix?: string; prefix?: string; label: string; caption: string; run: boolean }) {
  const v = useCountUp(value, run);
  return (
    <div className="border-l border-[var(--color-stone-300)] pl-6">
      <div className="font-serif text-4xl md:text-5xl text-[var(--color-ink)] tabular-nums">
        {prefix}{v.toLocaleString()}{suffix}
      </div>
      <div className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--color-stone-700)]">{label}</div>
      <div className="mt-1 text-sm text-[var(--color-stone-600)]">{caption}</div>
    </div>
  );
}

export default Statistics;
