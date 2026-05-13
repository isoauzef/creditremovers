import { useMemo, useState } from "react";
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

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;
  creditScoreRange: string;
  negativeItemsCount: string;
  notes: string;
};

const INITIAL: FormState = {
  firstName: "", lastName: "", email: "", phone: "",
  state: "", creditScoreRange: "", negativeItemsCount: "", notes: "",
};

export function LeadForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const progress = useMemo(() => (step === 1 ? 33 : step === 2 ? 66 : 100), [step]);

  const canNext1 = !!(form.firstName && form.lastName && form.email && form.phone);
  const canNext2 = !!(form.state && form.creditScoreRange && form.negativeItemsCount);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "homepage" }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Could not submit. Please try again.");
      }
      setSuccess(true);
      setForm(INITIAL);
      setStep(1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="lead-form" className="bg-[var(--color-paper-soft)] border-t border-[var(--color-stone-200)]">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] font-semibold mb-3">
            Free Consultation
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-ink)]">
            Tell us what's on your report
          </h2>
          <p className="mt-4 text-[var(--color-stone-700)] max-w-xl mx-auto">
            A senior file analyst will review your situation within one business day —
            at no cost or obligation.
          </p>
        </div>

        <div className="card-soft p-6 md:p-10">
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--color-stone-600)] mb-2">
              <span>Step {step} of 3</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-[var(--color-stone-200)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-accent)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <h3 className="text-lg font-semibold text-[var(--color-ink)]">Your details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="First name" value={form.firstName} onChange={set("firstName")} autoComplete="given-name" required />
                  <Field label="Last name" value={form.lastName} onChange={set("lastName")} autoComplete="family-name" required />
                  <Field label="Email" type="email" value={form.email} onChange={set("email")} autoComplete="email" required />
                  <Field label="Phone" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" required />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="text-lg font-semibold text-[var(--color-ink)]">Quick context</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <SelectField label="State" value={form.state} onChange={set("state")}>
                    <option value="">Select…</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </SelectField>
                  <SelectField label="Estimated credit score" value={form.creditScoreRange} onChange={set("creditScoreRange")}>
                    <option value="">Select…</option>
                    {SCORE_RANGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </SelectField>
                  <div className="md:col-span-2">
                    <SelectField label="Negative items on report" value={form.negativeItemsCount} onChange={set("negativeItemsCount")}>
                      <option value="">Select…</option>
                      {NEG_ITEMS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </SelectField>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h3 className="text-lg font-semibold text-[var(--color-ink)]">Anything else?</h3>
                <label className="block">
                  <span className="block text-xs uppercase tracking-[0.18em] text-[var(--color-stone-600)] mb-2">
                    What would you like us to know? <span className="opacity-60">(optional)</span>
                  </span>
                  <textarea
                    value={form.notes}
                    onChange={(e) => set("notes")(e.target.value)}
                    rows={4}
                    className="w-full border border-[var(--color-stone-300)] rounded-md focus:border-[var(--color-accent)] outline-none px-4 py-3 text-base bg-white"
                  />
                </label>

                <div className="rounded-md bg-[var(--color-paper-soft)] border border-[var(--color-stone-200)] p-4 text-sm text-[var(--color-stone-700)]">
                  <div className="font-semibold text-[var(--color-ink)] mb-1">Quick recap</div>
                  <div>{form.firstName} {form.lastName} · {form.email} · {form.phone}</div>
                  <div className="mt-1 text-[var(--color-stone-600)]">
                    {form.state} · Score {form.creditScoreRange} · {form.negativeItemsCount} negative items
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-sm text-[#9b2c2c]" role="alert">{error}</p>}

            <div className="flex items-center justify-between pt-2">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                  className="text-sm text-[var(--color-stone-700)] hover:text-[var(--color-ink)] underline"
                >
                  ← Back
                </button>
              ) : <span />}

              {step < 3 ? (
                <button
                  type="button"
                  disabled={(step === 1 && !canNext1) || (step === 2 && !canNext2)}
                  onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Request Consultation"}
                </button>
              )}
            </div>

            <p className="text-xs text-[var(--color-stone-600)]">
              By submitting, you agree to be contacted by Credit Removers regarding your inquiry.
              We never sell your information.
            </p>
          </form>
        </div>
      </div>

      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent className="bg-[var(--color-paper)] border-[var(--color-stone-200)]">
          <DialogHeader>
            <DialogTitle>Thank you.</DialogTitle>
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
  label, type = "text", value, onChange, required, autoComplete,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; required?: boolean; autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.18em] text-[var(--color-stone-600)] mb-2">
        {label}{required && <span className="text-[var(--color-accent)] ml-1">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        className="w-full border border-[var(--color-stone-300)] rounded-md focus:border-[var(--color-accent)] outline-none px-4 py-3 text-base bg-white"
      />
    </label>
  );
}

function SelectField({
  label, value, onChange, children,
}: {
  label: string; value: string;
  onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.18em] text-[var(--color-stone-600)] mb-2">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-[var(--color-stone-300)] rounded-md focus:border-[var(--color-accent)] outline-none px-4 py-3 text-base bg-white"
      >
        {children}
      </select>
    </label>
  );
}

export default LeadForm;
