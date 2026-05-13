const STEPS = [
  {
    n: "01",
    title: "Free file review",
    body: "Submit a brief inquiry. A senior analyst evaluates your three-bureau profile and outlines a candid, no-obligation strategy within one business day.",
  },
  {
    n: "02",
    title: "Secure intake",
    body: "Become a client through our encrypted onboarding. SSN handled with AWS KMS. Documents stored in SSE-KMS — never on the public internet.",
  },
  {
    n: "03",
    title: "Disciplined disputes",
    body: "We file precise, by-the-letter challenges to inaccurate, outdated and unverifiable items. Bureaus respond within 30 days; we adapt round-by-round.",
  },
  {
    n: "04",
    title: "Reported progress",
    body: "Every round, we publish your bureau scores, deletions and remaining items to your private dashboard. Quiet, measurable forward motion.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[var(--color-paper)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-28">
        <div className="max-w-2xl mb-16">
          <div className="eyebrow mb-4">The process</div>
          <h2 className="font-serif text-[var(--color-ink)]">A method, not a marketing funnel.</h2>
          <p className="mt-5 text-[var(--color-stone-700)] leading-relaxed">
            Credit repair, done correctly, is a craft of patience and precision. Here is the
            same sequence we’ve refined across thousands of files.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--color-stone-200)] border border-[var(--color-stone-200)]">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-[var(--color-paper)] p-5 md:p-12">
              <div className="font-serif text-[var(--color-gold)] text-3xl mb-6">{s.n}</div>
              <h3 className="font-serif text-xl md:text-2xl text-[var(--color-ink)] mb-4">
                {s.title}
              </h3>
              <p className="text-sm text-[var(--color-stone-700)] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
