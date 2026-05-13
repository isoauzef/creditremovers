import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "./ui/dialog";

const SCORE_RANGES = ["Below 580", "580–619", "620–659", "660–699", "700–739", "740+", "Not sure"];
const NEG_ITEMS = ["1–3", "4–7", "8–12", "13+", "Not sure"];
const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME",
  "MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA",
  "RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

export function LeadForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = new FormData(e.currentTarget);
      const payload = Object.fromEntries(data.entries());
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, source: "homepage" }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Could not submit. Please try again.");
      }
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="lead-form" className="bg-[var(--color-paper)] border-t border-[var(--color-stone-200)]">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 md:py-28">
        <div className="max-w-2xl mb-12">
          <div className="eyebrow mb-4">Free Consultation</div>
          <h2 className="font-serif text-[var(--color-ink)]">
            Tell us what’s on your report.
          </h2>
          <p className="mt-5 text-[var(--color-stone-700)] leading-relaxed">
            A senior file analyst will review your situation within one business day and
            outline a candid path forward — at no cost or obligation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
          <Field label="First name" name="firstName" required autoComplete="given-name" />
          <Field label="Last name" name="lastName" required autoComplete="family-name" />
          <Field label="Email" name="email" type="email" required autoComplete="email" />
          <Field label="Phone" name="phone" type="tel" required autoComplete="tel" />

          <SelectField label="State" name="state">
            <option value="">Select…</option>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectField>

          <SelectField label="Estimated credit score" name="creditScoreRange">
            <option value="">Select…</option>
            {SCORE_RANGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectField>

          <SelectField label="Negative items on report" name="negativeItemsCount">
            <option value="">Select…</option>
            {NEG_ITEMS.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectField>

          <Field label="What would you like us to know?" name="notes" />

          <div className="md:col-span-2 pt-2">
            {error && (
              <p className="mb-4 text-sm text-[#9b2c2c]" role="alert">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-8 py-3.5 rounded-md bg-[var(--color-ink)] text-[var(--color-paper)] btn-press text-sm tracking-wide disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Request Consultation"}
            </button>
            <p className="mt-4 text-xs text-[var(--color-stone-600)] max-w-xl">
              By submitting, you agree to be contacted by Credit Removers regarding your inquiry.
              We never sell your information.
            </p>
          </div>
        </form>
      </div>

      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent className="bg-[var(--color-paper)] border-[var(--color-stone-200)]">
          <DialogHeader>
            <DialogTitle className="font-serif">Thank you.</DialogTitle>
            <DialogDescription className="text-[var(--color-stone-700)] pt-2">
              A senior analyst will review your file and reach out within one business day.
              Look out for an email from <strong>hello@creditremovers.com</strong>.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Field({
  label, name, type = "text", required, autoComplete,
}: { label: string; name: string; type?: string; required?: boolean; autoComplete?: string }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.18em] text-[var(--color-stone-600)] mb-2">
        {label}{required && <span className="text-[var(--color-accent)] ml-1">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        autoComplete={autoComplete}
        className="w-full bg-transparent border-0 border-b border-[var(--color-stone-300)] focus:border-[var(--color-ink)] outline-none px-0 py-2 text-base"
      />
    </label>
  );
}

function SelectField({
  label, name, children,
}: { label: string; name: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.18em] text-[var(--color-stone-600)] mb-2">
        {label}
      </span>
      <select
        name={name}
        className="w-full bg-transparent border-0 border-b border-[var(--color-stone-300)] focus:border-[var(--color-ink)] outline-none px-0 py-2 text-base"
      >
        {children}
      </select>
    </label>
  );
}

export default LeadForm;
