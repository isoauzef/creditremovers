import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { useMedia, useMediaSrc } from "../hooks/useMedia";
import {
  Check, Lock, ShieldCheck, ArrowRight, Plus, Minus, Copy, Sparkles, Info, X,
} from "lucide-react";

type Plan = "monthly" | "upfront";
type Step = "plan" | "personal" | "documents" | "payment" | "success";

interface Pricing {
  monthlyAmountCents: number;
  monthlyMonths: number;
  upfrontAmountCents: number;
  upfrontSavingsLabel: string;
}

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME",
  "MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA",
  "RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  dateOfBirth: string;
  ssn: string;
  signatureName: string;
  signatureDate: string;
}

const INITIAL: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zip: "",
  dateOfBirth: "",
  ssn: "",
  signatureName: "",
  signatureDate: new Date().toISOString().slice(0, 10),
};

export default function CreditRemoversCheckout() {
  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      <Navigation />
      <CheckoutHero />
      <CheckoutKPI />
      <ProcessSteps />
      <CheckoutFAQ />
      <FinalCTA />
      <CheckoutFlow />
      <Footer />
    </div>
  );
}

// ── Hero ────────────────────────────────────────────────────────
function CheckoutHero() {
  const heroImg = useMediaSrc("checkoutHero");
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-12 md:pt-20 pb-12 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <h1 className="text-[var(--color-ink)] tracking-tight font-bold text-[40px] leading-[46px] md:text-[52px] md:leading-[58px]">
              Remove Negative Items From Your<br />
              <span className="text-[var(--color-accent)]">Credit For Only $400 / mo</span>
            </h1>
            <div className="mt-4 text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] font-semibold">
              3-Month Program
            </div>
            <p className="mt-5 text-lg md:text-xl text-[var(--color-stone-600)] max-w-2xl leading-relaxed">
              Enroll in minutes — no risk, no obligation, no charge until disputes are sent.
              Senior analysts file federally protected challenges with all three bureaus and
              adjust round by round until your file is clean.
            </p>
            <div className="mt-8">
              <a href="#signup" className="btn-primary">Get Started</a>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 max-w-xl">
              {[
                "98% Success Rate",
                "100% FCRA Compliant",
                "Results in 30 Days",
                "Money-Back Guarantee",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-[var(--color-stone-700)]">
                  <Check size={16} className="text-[var(--color-accent)] shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </div>

          {heroImg && (
            <div className="lg:col-span-5">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl">
                <img src={heroImg} alt="" className="w-full h-full object-cover" loading="eager" decoding="async" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── KPI strip ───────────────────────────────────────────────────
function CheckoutKPI() {
  const KPI = [
    { v: "98%",      l: "Success Rate" },
    { v: "100%",     l: "FCRA Compliant" },
    { v: "30 Days",  l: "First Round" },
    { v: "$0",       l: "If Nothing Removed" },
  ];
  return (
    <section className="bg-[var(--color-paper-soft)] border-y border-[var(--color-stone-200)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {KPI.map((k) => (
            <div key={k.l}>
              <div className="text-3xl md:text-4xl font-bold text-[var(--color-accent)] tabular-nums">{k.v}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.15em] text-[var(--color-stone-500)]">{k.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How it works ────────────────────────────────────────────────
function ProcessSteps() {
  const m = useMedia();
  const steps = [
    {
      n: 1,
      title: "Submit Your Information",
      body: "A short, encrypted intake — personal details plus optional ID and proof of address. Your SSN is sealed with AWS KMS the moment it leaves your browser.",
      img: m.checkoutStep1,
    },
    {
      n: 2,
      title: "We Dispute The Negative Items",
      body: "A senior analyst reviews your three-bureau profile and files precise, federally protected challenges. Bureaus respond within 30 days; we adjust round by round.",
      img: m.checkoutStep2,
    },
    {
      n: 3,
      title: "Pay Only If It Works",
      body: "3-month program: $400 × 3 ($1,200) or one-time $1,000 (save 20%). Either plan auto-closes at month three. If we cannot remove items, you receive a full refund.",
      img: m.checkoutStep3,
    },
  ];
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-[var(--color-ink)]">How It Works</h2>
          <p className="mt-4 text-lg text-[var(--color-stone-600)]">
            Three simple steps to a cleaner credit report.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="card-soft p-7">
              {s.img && (
                <div className="aspect-[3/2] mb-5 overflow-hidden rounded-lg">
                  <img src={s.img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-sm font-bold">
                  {s.n}
                </span>
                <h3 className="text-[var(--color-ink)]">{s.title}</h3>
              </div>
              <p className="text-[var(--color-stone-600)] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Checkout FAQ ────────────────────────────────────────────────
function CheckoutFAQ() {
  const ITEMS = [
    {
      q: "How does the Credit Access & Inclusion Act help my score?",
      a: "Thanks to the newly passed Credit Access and Inclusion Act, we add the positive payment history from your cell phone, utilities, rent and insurance to all three credit bureaus — instantly raising your score the moment that data lands on your file. Eligibility is based on monthly recurring bills you already pay.",
      defaultOpen: true,
    },
    {
      q: "What is included in the 3-month program?",
      a: "We file disputes with Equifax, Experian and TransUnion every 30 days for three full cycles. Bureaus must legally respond within 30 days of each round. Most clients see meaningful progress by the second round.",
    },
    {
      q: "What is the difference between the monthly and upfront plan?",
      a: "Same exact program, same exact service. Monthly is $400 × 3 ($1,200 total). Upfront is a single $1,000 payment — saving you 20% ($200). Either plan auto-closes after month three.",
    },
    {
      q: "What if you can't remove anything?",
      a: "If we don't remove a single item from your reports, you don't pay. That's the entire premise of our money-back guarantee.",
    },
    {
      q: "How do you protect my information?",
      a: "Your SSN is encrypted with AWS KMS envelope encryption — a unique data key per record, wrapped by a master key we never see. ID and utility uploads (if provided) are stored in AWS S3 with SSE-KMS. Every internal access is logged.",
    },
    {
      q: "Do I need to upload my ID and a bill to get started?",
      a: "No. Uploads are optional at checkout — you can skip both and add them later from your client dashboard. You can even snap them with your phone camera once logged in.",
    },
  ];
  return (
    <section className="bg-[var(--color-paper-soft)]">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-[var(--color-ink)]">Frequently Asked Questions</h2>
        </div>
        <div className="border-t border-[var(--color-stone-200)]">
          {ITEMS.map((it, i) => <FAQRow key={i} {...it} />)}
        </div>
      </div>
    </section>
  );
}

function FAQRow({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--color-stone-200)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base md:text-lg font-semibold text-[var(--color-ink)]">{q}</span>
        <span className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center text-[var(--color-stone-600)]">
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      {open && <div className="pb-5 pr-12 text-[var(--color-stone-600)] leading-relaxed">{a}</div>}
    </div>
  );
}

// ── Final CTA banner ────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="bg-[var(--color-accent)] text-white">
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-16 text-center">
        <h2 className="text-white">Ready To Take Control Of Your Credit?</h2>
        <p className="mt-4 text-lg text-white/90">
          Join thousands of clients who have improved their credit with our help. Start your
          journey to better credit today.
        </p>
        <div className="mt-7">
          <a
            href="#signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[var(--color-accent)] font-semibold hover:bg-white/90 transition-colors"
          >
            Get Started Now <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Sign-up Flow ────────────────────────────────────────────────
function CheckoutFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("plan");
  const [plan, setPlan] = useState<Plan>("monthly");
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [idDoc, setIdDoc] = useState<File | null>(null);
  const [billDoc, setBillDoc] = useState<File | null>(null);

  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/checkout/pricing").then((r) => r.json()).then(setPricing).catch(() => {});
    fetch("/api/stripe-publishable-key")
      .then((r) => r.json())
      .then((d) => { if (d.publishableKey) setStripePromise(loadStripe(d.publishableKey)); })
      .catch(() => {});
  }, []);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submitApplication() {
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      // Auto-fill signature fields server-side will expect from this typed-name signature
      if (!form.signatureName) fd.set("signatureName", `${form.firstName} ${form.lastName}`.trim());
      fd.append("paymentPlan", plan);
      fd.append("authConsent", "true");
      if (idDoc) fd.append("idDoc", idDoc);
      if (billDoc) fd.append("billDoc", billDoc);

      const res = await fetch("/api/checkout/submit", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Could not submit application.");
      }
      const { submissionId: id } = await res.json();
      setSubmissionId(id);

      const endpoint =
        plan === "upfront"
          ? "/api/checkout/create-payment-intent"
          : "/api/checkout/create-subscription";
      const payRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: id }),
      });
      if (!payRes.ok) {
        const j = await payRes.json().catch(() => ({}));
        throw new Error(j.message || "Could not initialize payment.");
      }
      const { clientSecret } = await payRes.json();
      if (!clientSecret) throw new Error("Payment not configured. Please contact support.");
      setStripeClientSecret(clientSecret);
      setStep("payment");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function autoCreateAccount(): Promise<void> {
    if (!submissionId) return;
    try {
      await fetch("/api/customer/signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.phone.replace(/[^0-9]/g, ""),
          firstName: form.firstName,
          lastName: form.lastName,
          checkoutSubmissionId: submissionId,
          mustChangePassword: true,
        }),
      });
    } catch {
      // ignore — user can still log in via reset
    }
  }

  return (
    <section id="signup" className="bg-white scroll-mt-24 border-t border-[var(--color-stone-200)]">
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-[var(--color-ink)]">Sign Up &amp; Get Started</h2>
          <p className="mt-3 text-[var(--color-stone-600)]">
            Four short steps. About five minutes. No charge until your file is reviewed.
          </p>
        </div>
        <Stepper step={step} />

        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 rounded-md">
            {error}
          </div>
        )}

        {step === "plan" && pricing && (
          <PlanStep
            plan={plan} setPlan={setPlan} pricing={pricing}
            onContinue={() => { setError(null); setStep("personal"); }}
          />
        )}

        {step === "personal" && (
          <PersonalStep
            form={form} update={update}
            onBack={() => setStep("plan")}
            onContinue={() => { setError(null); setStep("documents"); }}
          />
        )}

        {step === "documents" && (
          <DocumentsStep
            idDoc={idDoc} setIdDoc={setIdDoc}
            billDoc={billDoc} setBillDoc={setBillDoc}
            onBack={() => setStep("personal")}
            onContinue={submitApplication}
            submitting={submitting}
          />
        )}

        {step === "payment" && stripeClientSecret && stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret, appearance: stripeAppearance }}>
            <PaymentStep
              plan={plan} pricing={pricing}
              onBack={() => setStep("documents")}
              onSuccess={async () => { await autoCreateAccount(); setStep("success"); }}
            />
          </Elements>
        )}

        {step === "success" && (
          <SuccessStep
            email={form.email}
            phone={form.phone.replace(/[^0-9]/g, "")}
            onGoToDashboard={() => navigate("/account")}
          />
        )}
      </div>
    </section>
  );
}

const stripeAppearance = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#0F5132",
    colorText: "#0F172A",
    colorBackground: "#FFFFFF",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "8px",
  },
};

// ── Stepper ─────────────────────────────────────────────────────
const STEPS_ORDER: { key: Step; label: string }[] = [
  { key: "plan",      label: "Plan" },
  { key: "personal",  label: "Personal" },
  { key: "documents", label: "Documents" },
  { key: "payment",   label: "Payment" },
  { key: "success",   label: "Done" },
];

function Stepper({ step }: { step: Step }) {
  const idx = STEPS_ORDER.findIndex((s) => s.key === step);
  return (
    <div className="mb-10 flex flex-wrap gap-3 md:gap-2 items-center text-xs">
      {STEPS_ORDER.map((s, i) => {
        const active = i === idx;
        const done = i < idx;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <span className={`h-7 w-7 rounded-full flex items-center justify-center font-semibold ${
              done ? "bg-[var(--color-accent)] text-white" :
              active ? "bg-[var(--color-ink)] text-white" :
              "bg-[var(--color-paper-soft)] text-[var(--color-stone-500)]"
            }`}>
              {done ? <Check size={12} /> : <span className="tabular-nums">{i + 1}</span>}
            </span>
            <span className={`uppercase tracking-wider ${
              done ? "text-[var(--color-stone-500)]" :
              active ? "text-[var(--color-ink)] font-semibold" :
              "text-[var(--color-stone-400)]"
            }`}>
              {s.label}
            </span>
            {i < STEPS_ORDER.length - 1 && <span className="hidden md:inline mx-2 text-[var(--color-stone-300)]">·</span>}
          </div>
        );
      })}
    </div>
  );
}

// ── Plan Step ───────────────────────────────────────────────────
function PlanStep({
  plan, setPlan, pricing, onContinue,
}: { plan: Plan; setPlan: (p: Plan) => void; pricing: Pricing; onContinue: () => void }) {
  const monthly = pricing.monthlyAmountCents / 100;
  const upfront = pricing.upfrontAmountCents / 100;
  const total = monthly * pricing.monthlyMonths;
  return (
    <div>
      <h3 className="text-[var(--color-ink)] mb-2">Choose Your Plan</h3>
      <p className="text-[var(--color-stone-600)] mb-8">Same exact 3-month program — pick the cadence that fits your budget.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <PlanCard
          selected={plan === "monthly"}
          onClick={() => setPlan("monthly")}
          title="Monthly"
          price={`$${monthly.toLocaleString()}`}
          unit={`per month · ${pricing.monthlyMonths} months`}
          subtext={`$${total.toLocaleString()} total`}
          features={[
            `Auto-cancels after month ${pricing.monthlyMonths}`,
            "Cancel anytime, no fees",
            "First round within 30 days",
            "Three-bureau coverage",
          ]}
        />
        <PlanCard
          selected={plan === "upfront"}
          onClick={() => setPlan("upfront")}
          title="Pay In Full"
          highlight
          price={`$${upfront.toLocaleString()}`}
          unit="single payment"
          subtext={pricing.upfrontSavingsLabel}
          features={[
            "Save 20% vs monthly",
            "Priority queue placement",
            "All rounds included",
            "Three-bureau coverage",
          ]}
        />
      </div>

      <div className="flex justify-end">
        <button onClick={onContinue} className="btn-primary">Continue</button>
      </div>
    </div>
  );
}

function PlanCard({
  selected, onClick, title, price, unit, subtext, features, highlight,
}: {
  selected: boolean; onClick: () => void; title: string; price: string; unit: string;
  subtext?: string; features: string[]; highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-7 rounded-2xl border-2 transition-all relative ${
        selected
          ? "border-[var(--color-accent)] bg-[var(--color-paper-soft)] shadow-md"
          : "border-[var(--color-stone-200)] bg-white hover:border-[var(--color-stone-400)]"
      }`}
    >
      {highlight && (
        <span className="absolute -top-3 right-6 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold uppercase tracking-wider">
          <Sparkles size={10} /> Save 20%
        </span>
      )}
      <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-stone-500)] mb-3">{title}</div>
      <div className="text-4xl font-bold text-[var(--color-ink)] tabular-nums">{price}</div>
      <div className="mt-1 text-sm text-[var(--color-stone-500)]">{unit}</div>
      {subtext && <div className="mt-1 text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wider">{subtext}</div>}
      <ul className="mt-5 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-stone-700)]">
            <Check size={14} className="text-[var(--color-accent)] mt-1 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

// ── Personal Step (merged identity) ─────────────────────────────
function PersonalStep({
  form, update, onBack, onContinue,
}: { form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void; onBack: () => void; onContinue: () => void }) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.ssn.replace(/[^0-9]/g, "").length !== 9) return;
    onContinue();
  }
  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-[var(--color-ink)] mb-2">Your Information</h3>
      <p className="text-[var(--color-stone-600)] mb-6">All fields encrypted in transit and at rest.</p>

      <div className="flex items-start gap-3 bg-[var(--color-paper-soft)] border border-[var(--color-stone-200)] rounded-md p-4 mb-8">
        <Lock size={16} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
        <p className="text-sm text-[var(--color-stone-700)] leading-relaxed">
          Your SSN is encrypted with AWS KMS — staff see only the last four digits.
          Required by federal law for all credit-repair clients (CROA §1679b).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <Input label="First name" value={form.firstName} onChange={(v) => update("firstName", v)} required autoComplete="given-name" />
        <Input label="Last name"  value={form.lastName}  onChange={(v) => update("lastName", v)}  required autoComplete="family-name" />
        <Input label="Email"      type="email" value={form.email} onChange={(v) => update("email", v)} required autoComplete="email" />
        <Input label="Phone"      type="tel"   value={form.phone} onChange={(v) => update("phone", v)} required autoComplete="tel" />
        <Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={(v) => update("dateOfBirth", v)} required />
        <Input label="Social Security Number" value={form.ssn} onChange={(v) => update("ssn", v.replace(/[^0-9]/g, "").slice(0, 9))} required placeholder="9 digits" />
        <Input label="Address line 1" value={form.addressLine1} onChange={(v) => update("addressLine1", v)} required autoComplete="address-line1" className="md:col-span-2" />
        <Input label="Address line 2 (optional)" value={form.addressLine2} onChange={(v) => update("addressLine2", v)} autoComplete="address-line2" className="md:col-span-2" />
        <Input label="City"  value={form.city}  onChange={(v) => update("city", v)}  required autoComplete="address-level2" />
        <Select label="State" value={form.state} onChange={(v) => update("state", v)} required>
          <option value="">Select…</option>
          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Input label="ZIP" value={form.zip} onChange={(v) => update("zip", v)} required autoComplete="postal-code" />
      </div>

      <StepNav onBack={onBack} continueLabel="Continue" />
    </form>
  );
}

// ── Documents Step (both optional with skip) ────────────────────
function DocumentsStep({
  idDoc, setIdDoc, billDoc, setBillDoc, onBack, onContinue, submitting,
}: {
  idDoc: File | null; setIdDoc: (f: File | null) => void;
  billDoc: File | null; setBillDoc: (f: File | null) => void;
  onBack: () => void; onContinue: () => void; submitting: boolean;
}) {
  return (
    <div>
      <h3 className="text-[var(--color-ink)] mb-2">Documents <span className="text-sm font-normal text-[var(--color-stone-500)]">(Optional)</span></h3>
      <p className="text-[var(--color-stone-600)] mb-6">
        You can upload now, or skip and add them later from your dashboard — your phone camera works too.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileField
          label="Government-Issued ID"
          file={idDoc}
          onChange={setIdDoc}
          accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif"
          hint="Driver's license, state ID, or passport — front side."
        />
        <FileField
          label="Proof Of Address"
          file={billDoc}
          onChange={setBillDoc}
          accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif"
          hint="A utility, phone, rent or insurance bill dated within 60 days."
          examplesTitle="What counts as proof of address?"
          examples={[
            "Mobile or landline phone bill",
            "Rent payment receipt or lease",
            "Utility — electricity, gas, water, waste",
            "Telecom — cable, satellite, television",
            "Internet bill",
            "Insurance (home, auto or life — monthly only)",
          ]}
        />
      </div>

      <div className="mt-6 text-sm text-[var(--color-stone-500)]">
        Both documents are optional. You can finish checkout without them.
      </div>

      <StepNav
        onBack={onBack}
        continueLabel={submitting ? "Submitting…" : "Continue To Payment"}
        onContinue={onContinue}
        disabled={submitting}
      />
    </div>
  );
}

function FileField({
  label, file, onChange, accept, hint, examples, examplesTitle,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
  accept: string;
  hint?: string;
  examples?: string[];
  examplesTitle?: string;
}) {
  const [showExamples, setShowExamples] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-sm font-semibold text-[var(--color-ink)]">{label}</span>
        {examples && examples.length > 0 && (
          <button
            type="button"
            onClick={() => setShowExamples((v) => !v)}
            className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
            aria-expanded={showExamples}
          >
            <Info size={12} />
            {showExamples ? "Hide" : "What counts?"}
          </button>
        )}
      </div>
      {examples && showExamples && (
        <div className="mb-3 border border-[var(--color-stone-200)] bg-[var(--color-paper-soft)] rounded-md p-4 relative">
          <button
            type="button"
            onClick={() => setShowExamples(false)}
            className="absolute top-2 right-2 text-[var(--color-stone-500)] hover:text-[var(--color-ink)]"
            aria-label="Close"
          >
            <X size={14} />
          </button>
          {examplesTitle && <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-stone-600)] mb-3 pr-6">{examplesTitle}</div>}
          <ul className="space-y-1.5 text-xs text-[var(--color-stone-700)]">
            {examples.map((ex) => (
              <li key={ex} className="flex items-start gap-2">
                <Check size={12} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
                <span>{ex}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="border-2 border-dashed border-[var(--color-stone-300)] hover:border-[var(--color-accent)] transition-colors rounded-lg px-5 py-8 cursor-pointer relative text-center">
        <input
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="text-sm text-[var(--color-ink)]">
          {file ? (
            <span className="font-medium">{file.name}</span>
          ) : (
            <span className="text-[var(--color-stone-500)]">Click to upload or drop a file</span>
          )}
        </div>
      </div>
      {hint && <p className="mt-2 text-xs text-[var(--color-stone-500)]">{hint}</p>}
      {file && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-2 text-xs text-[var(--color-stone-500)] hover:text-[var(--color-ink)]"
        >
          Remove
        </button>
      )}
    </div>
  );
}

// ── Payment Step ────────────────────────────────────────────────
function PaymentStep({
  plan, pricing, onBack, onSuccess,
}: { plan: Plan; pricing: Pricing | null; onBack: () => void; onSuccess: () => void | Promise<void> }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + "/checkout?paid=1" },
      redirect: "if_required",
    });

    if (confirmErr) {
      setError(confirmErr.message || "Payment failed.");
      setSubmitting(false);
      return;
    }
    await onSuccess();
  }

  const monthlyAmt = (pricing?.monthlyAmountCents ?? 0) / 100;
  const monthlyMonths = pricing?.monthlyMonths ?? 3;
  const summary =
    plan === "upfront"
      ? `One-time payment of $${((pricing?.upfrontAmountCents ?? 0) / 100).toLocaleString()}`
      : `$${monthlyAmt.toLocaleString()} today, then $${monthlyAmt.toLocaleString()} each month for ${monthlyMonths - 1} more cycles`;

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-[var(--color-ink)] mb-2">Payment</h3>
      <p className="text-[var(--color-stone-600)] mb-6">{summary}</p>

      <div className="bg-white border border-[var(--color-stone-200)] rounded-lg p-6 mb-6">
        <PaymentElement />
      </div>

      <div className="mb-6 flex items-center gap-2 text-xs text-[var(--color-stone-500)]">
        <ShieldCheck size={14} className="text-[var(--color-accent)]" />
        Card data handled directly by Stripe — never touches our servers.
      </div>

      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}

      <StepNav
        onBack={onBack}
        continueLabel={submitting ? "Processing…" : "Confirm Payment"}
        disabled={!stripe || submitting}
      />
    </form>
  );
}

// ── Success Step ────────────────────────────────────────────────
function SuccessStep({
  email, phone, onGoToDashboard,
}: { email: string; phone: string; onGoToDashboard: () => void }) {
  const [copied, setCopied] = useState<"u" | "p" | null>(null);

  function copy(text: string, which: "u" | "p") {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[var(--color-accent)] text-white mb-6">
        <Check size={32} />
      </div>
      <h3 className="text-[var(--color-ink)] mb-3">Payment Confirmed</h3>
      <p className="text-[var(--color-stone-600)] mb-8 max-w-xl mx-auto">
        Welcome aboard. Your senior analyst will review your file within one business day.
        We've created your client account — here are your login credentials:
      </p>

      <div className="max-w-md mx-auto bg-[var(--color-paper-soft)] border border-[var(--color-stone-200)] rounded-xl p-6 mb-8 text-left">
        <CredRow label="Username (Email)" value={email} copied={copied === "u"} onCopy={() => copy(email, "u")} />
        <div className="my-3 border-t border-[var(--color-stone-200)]" />
        <CredRow label="Password (Your Phone Number)" value={phone} copied={copied === "p"} onCopy={() => copy(phone, "p")} />
        <p className="mt-4 text-xs text-[var(--color-stone-500)]">
          You'll be prompted to set a new password the first time you log in.
        </p>
      </div>

      <button onClick={onGoToDashboard} className="btn-primary">
        Go To My Dashboard <ArrowRight size={16} className="ml-1" />
      </button>
    </div>
  );
}

function CredRow({
  label, value, copied, onCopy,
}: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-[var(--color-stone-500)] mb-1">{label}</div>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-mono font-semibold text-[var(--color-ink)] break-all">{value}</div>
        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
        >
          <Copy size={12} />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

// ── Generic UI ──────────────────────────────────────────────────
function Input({
  label, value, onChange, type = "text", required, autoComplete, placeholder, className = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; autoComplete?: string; placeholder?: string; className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
        {label}{required && <span className="text-[var(--color-accent)] ml-1">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full bg-white border border-[var(--color-stone-300)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 outline-none rounded-md px-3 py-2 text-sm"
      />
    </label>
  );
}

function Select({
  label, value, onChange, required, children,
}: { label: string; value: string; onChange: (v: string) => void; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
        {label}{required && <span className="text-[var(--color-accent)] ml-1">*</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-white border border-[var(--color-stone-300)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 outline-none rounded-md px-3 py-2 text-sm"
      >
        {children}
      </select>
    </label>
  );
}

function StepNav({
  onBack, continueLabel, onContinue, disabled,
}: { onBack: () => void; continueLabel: string; onContinue?: () => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 mt-10 pt-6 border-t border-[var(--color-stone-200)]">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-[var(--color-stone-600)] hover:text-[var(--color-ink)]"
      >
        ← Back
      </button>
      <button
        type={onContinue ? "button" : "submit"}
        onClick={onContinue}
        disabled={disabled}
        className="btn-primary disabled:opacity-60"
      >
        {continueLabel}
      </button>
    </div>
  );
}
