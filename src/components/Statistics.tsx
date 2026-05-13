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
    <section ref={ref} className="bg-[var(--color-paper-soft)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 text-center">
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
    <div>
      <div className="text-4xl md:text-5xl font-bold text-[var(--color-accent)] tabular-nums">
        {prefix}{v.toLocaleString()}{suffix}
      </div>
      <div className="mt-3 text-base font-semibold text-[var(--color-ink)]">{label}</div>
      <div className="mt-1 text-sm text-[var(--color-stone-500)]">{caption}</div>
    </div>
  );
}

export default Statistics;
