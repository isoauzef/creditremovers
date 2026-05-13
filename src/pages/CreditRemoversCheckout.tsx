import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import SignatureCanvas from "react-signature-canvas";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { SecurityBanner } from "../components/SecurityBanner";
import { Statistics } from "../components/Statistics";
import { WhatWeRemove } from "../components/WhatWeRemove";
import { CreditAccessAct } from "../components/CreditAccessAct";
import { useMedia, useMediaSrc } from "../hooks/useMedia";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "../components/ui/dialog";
import {
  Check, Lock, ShieldCheck, ArrowRight, Home as HomeIcon, Car, TrendingDown,
  HeartHandshake, Award, Sparkles, Info, X,
} from "lucide-react";

type Plan = "monthly" | "upfront";
type Step = "plan" | "personal" | "identity" | "auth" | "payment" | "success";

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
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <Navigation />
      <CheckoutHero />
      <AspirationsBand />
      <Statistics />
      <WhatWeRemove />
      <CreditAccessAct />
      <ProcessSteps />
      <PricingShowcase />
      <GuaranteeBanner />
      <CheckoutFlow />
      <SecurityBanner mediaKey="checkoutSecurity" />
      <Footer />
    </div>
  );
}

function CheckoutHero() {
  const heroImg = useMediaSrc("checkoutHero");
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-stone-200)]">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-paper)] to-[var(--color-stone-50)]" aria-hidden />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-10 md:pt-24 pb-12 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="eyebrow mb-6 inline-flex items-center gap-3">
              <span className="hairline-gold w-10" aria-hidden />
              Become a Client
            </div>
            <h1 className="font-serif text-[var(--color-ink)] tracking-tight text-[clamp(3rem,6vw,5rem)] leading-[1.04]">
              Your credit deserves a
              <br />
              <em className="not-italic text-[var(--color-accent)]">second chance</em>.
            </h1>
            <p className="mt-8 text-lg md:text-xl text-[var(--color-stone-700)] max-w-2xl leading-relaxed">
              Enroll in minutes — no risk, no obligation, no charge until disputes are sent.
              Senior analysts file precise, federally protected challenges with all three bureaus
              and adjust round by round until your file is clean.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#signup"
                className="inline-flex items-center gap-3 px-7 py-4 rounded-md bg-[var(--color-ink)] text-[var(--color-paper)] btn-press text-base tracking-wide"
              >
                Start Your Sign Up
                <ArrowRight size={18} />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center gap-3 px-7 py-4 rounded-md border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] btn-press text-base tracking-wide transition-colors"
              >
                See Pricing
              </a>
            </div>
            <div className="mt-8 flex items-center gap-3 text-sm text-[var(--color-stone-600)]">
              <ShieldCheck size={18} className="text-[var(--color-accent)]" />
              Money-back guarantee · KMS-encrypted intake · 6-month program, auto-closes
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

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl border-t border-[var(--color-stone-200)] pt-10">
          {[
            { v: "98%", l: "Success Rate" },
            { v: "100%", l: "FCRA Compliant" },
            { v: "30 Days", l: "To First Result" },
            { v: "$0", l: "If Nothing Removed" },
          ].map((k) => (
            <div key={k.l}>
              <div className="font-serif text-2xl md:text-3xl text-[var(--color-ink)]">{k.v}</div>
              <div className="mt-2 text-xs tracking-[0.18em] uppercase text-[var(--color-stone-600)]">{k.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AspirationsBand() {
  const items = [
    { icon: HomeIcon,       title: "Buy a home",          body: "Qualify for a mortgage at a rate that doesn’t punish your past." },
    { icon: Car,            title: "Finance a car",        body: "Walk into the dealership knowing the loan officer is on your side." },
    { icon: TrendingDown,   title: "Lower your interest", body: "Refinance cards and loans onto terms that actually let you breathe." },
    { icon: HeartHandshake, title: "Sleep at night",      body: "No more dread when a creditor’s envelope lands on the kitchen table." },
  ];
  return (
    <section className="bg-[var(--color-paper)] border-b border-[var(--color-stone-200)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-24">
        <div className="max-w-3xl mb-12">
          <div className="eyebrow mb-4">Improve your credit so you can…</div>
          <h2 className="font-serif text-[var(--color-ink)]">
            Take control of your financial future.
          </h2>
          <p className="mt-6 text-[var(--color-stone-700)] leading-relaxed">
            Removing inaccurate items isn’t the goal — it’s the door. Behind it: the loans,
            the leases, the lower rates and the quiet that come with a clean three-bureau file.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--color-stone-200)] border border-[var(--color-stone-200)] rounded-md overflow-hidden">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-[var(--color-paper)] p-7">
              <Icon size={22} className="text-[var(--color-gold)] mb-5" />
              <h3 className="font-serif text-xl text-[var(--color-ink)] mb-3">{title}</h3>
              <p className="text-sm text-[var(--color-stone-700)] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingShowcase() {
  return (
    <section id="pricing" className="bg-[var(--color-stone-50)] border-b border-[var(--color-stone-200)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="eyebrow mb-4">Two plans, one promise</div>
          <h2 className="font-serif text-[var(--color-ink)]">Pay on a schedule — or save 20% upfront.</h2>
          <p className="mt-6 text-[var(--color-stone-700)] leading-relaxed">
            Both plans cover the full six-month engagement. Either way, the program auto-closes
            at month six — no silent renewals, no surprise charges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          <div className="bg-[var(--color-paper)] border border-[var(--color-stone-200)] hover:border-[var(--color-ink)] transition-colors p-8 md:p-10 flex flex-col">
            <div className="eyebrow mb-3">Monthly</div>
            <div className="font-serif text-5xl md:text-6xl text-[var(--color-ink)] tabular-nums">
              $400<span className="text-2xl text-[var(--color-stone-500)] font-sans"> / mo</span>
            </div>
            <div className="mt-2 text-sm text-[var(--color-stone-600)]">× 6 months · $2,400 total</div>
            <ul className="mt-7 space-y-3 text-sm text-[var(--color-stone-700)]">
              {["Predictable monthly billing", "Auto-cancels after month 6", "Cancel anytime, no fees", "Money-back guarantee"].map((p) => (
                <li key={p} className="flex items-start gap-2"><Check size={16} className="text-[var(--color-accent)] mt-0.5" /><span>{p}</span></li>
              ))}
            </ul>
            <a href="#signup" className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] btn-press text-sm tracking-wide transition-colors">
              Choose Monthly <ArrowRight size={14} />
            </a>
          </div>

          <div className="relative bg-[var(--color-ink)] text-[var(--color-paper)] p-8 md:p-10 flex flex-col">
            <div className="absolute -top-3 left-8 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-gold)] text-[var(--color-ink)] text-[10px] font-semibold tracking-[0.18em] uppercase">
              <Sparkles size={11} /> Save 20%
            </div>
            <div className="eyebrow mb-3 text-[var(--color-gold)]">Upfront</div>
            <div className="font-serif text-5xl md:text-6xl tabular-nums">
              $2,000<span className="text-2xl text-[var(--color-stone-400)] font-sans"> total</span>
            </div>
            <div className="mt-2 text-sm text-[var(--color-stone-400)]">One payment · saves $400</div>
            <ul className="mt-7 space-y-3 text-sm text-[var(--color-stone-300)]">
              {["Lowest total cost", "Same 6-month program", "Full money-back guarantee", "No card on file after charge"].map((p) => (
                <li key={p} className="flex items-start gap-2"><Check size={16} className="text-[var(--color-gold)] mt-0.5" /><span>{p}</span></li>
              ))}
            </ul>
            <a href="#signup" className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-[var(--color-gold)] text-[var(--color-ink)] hover:opacity-90 btn-press text-sm tracking-wide">
              Choose Upfront <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function GuaranteeBanner() {
  return (
    <section className="bg-[var(--color-paper)] border-b border-[var(--color-stone-200)]">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 md:py-20">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12">
          <div className="shrink-0 w-16 h-16 rounded-full border border-[var(--color-gold)] flex items-center justify-center">
            <Award size={26} className="text-[var(--color-gold)]" />
          </div>
          <div className="flex-1">
            <div className="eyebrow mb-3">We’ve got you covered</div>
            <h2 className="font-serif text-[var(--color-ink)] text-3xl md:text-4xl">
              If we don’t remove a single item, you don’t pay.
            </h2>
            <p className="mt-5 text-[var(--color-stone-700)] leading-relaxed max-w-2xl">
              That’s the entire premise of our program. You’re only billed once disputes have
              been sent, and if zero items come off your three-bureau file, every dollar paid
              is returned. No fine print.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessSteps() {
  const m = useMedia();
  const steps = [
    { n: "01", title: "Submit your information", body: "A short, encrypted intake — personal details, government ID and a recent utility bill. Your SSN is sealed with AWS KMS the moment it leaves your browser.", img: m.checkoutStep1 },
    { n: "02", title: "We dispute the negative items", body: "A senior analyst reviews your three-bureau profile and files precise, federally protected challenges. Bureaus respond within 30 days; we adjust round by round.", img: m.checkoutStep2 },
    { n: "03", title: "Pay only if it works", body: "Monthly $400 × 6 or one-time $2,000. Either plan auto-closes at month six. If we cannot remove items, you receive a full refund.", img: m.checkoutStep3 },
  ];
  return (
    <section className="bg-[var(--color-paper)] border-b border-[var(--color-stone-200)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 md:py-20">
        <div className="eyebrow mb-4">How it works</div>
        <h2 className="font-serif text-[var(--color-ink)] max-w-2xl mb-12">A method, not a marketing funnel.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {steps.map((s) => (
            <div key={s.n} className="flex flex-col">
              {s.img && (
                <div className="aspect-[3/2] mb-6 overflow-hidden rounded-md border border-[var(--color-stone-200)]">
                  <img src={s.img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </div>
              )}
              <div className="font-serif text-[var(--color-gold)] text-2xl mb-3">{s.n}</div>
              <h3 className="font-serif text-xl text-[var(--color-ink)] mb-3">{s.title}</h3>
              <p className="text-sm text-[var(--color-stone-700)] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CheckoutFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("plan");
  const [plan, setPlan] = useState<Plan>("monthly");
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [idDoc, setIdDoc] = useState<File | null>(null);
  const [billDoc, setBillDoc] = useState<File | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>("");
  const [authConsent, setAuthConsent] = useState(false);

  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupOpen, setSignupOpen] = useState(false);

  // Load pricing + Stripe publishable key on mount
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

  // ── Submit application + uploads ──
  async function submitApplication() {
    setSubmitting(true);
    setError(null);
    try {
      if (!idDoc || !billDoc) throw new Error("Please upload both documents.");
      if (!signatureDataUrl) throw new Error("Please sign the authorization.");
      if (!authConsent) throw new Error("Please agree to the authorization.");

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("paymentPlan", plan);
      fd.append("signatureDataUrl", signatureDataUrl);
      fd.append("authConsent", "true");
      fd.append("idDoc", idDoc);
      fd.append("billDoc", billDoc);

      const res = await fetch("/api/checkout/submit", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Could not submit application.");
      }
      const { submissionId: id } = await res.json();
      setSubmissionId(id);

      // Create payment intent / subscription
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

  return (
    <section id="signup" className="bg-[var(--color-paper)] scroll-mt-24 border-t border-[var(--color-stone-200)]">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="text-center mb-10 md:mb-14">
          <div className="eyebrow mb-4">Sign up</div>
          <h2 className="font-serif text-[var(--color-ink)] text-4xl md:text-5xl">Let’s get to work.</h2>
          <p className="mt-5 text-[var(--color-stone-700)] max-w-xl mx-auto">
            Five short steps. About ten minutes. No charge until your file is reviewed and disputes are sent.
          </p>
        </div>
        <Stepper step={step} />

        {error && (
          <div className="mb-6 border border-[#9b2c2c]/30 bg-[#9b2c2c]/5 px-5 py-4 text-sm text-[#9b2c2c]">
            {error}
          </div>
        )}

        {step === "plan" && pricing && (
          <PlanStep
            plan={plan}
            setPlan={setPlan}
            pricing={pricing}
            onContinue={() => { setError(null); setStep("personal"); }}
          />
        )}

        {step === "personal" && (
          <PersonalStep
            form={form}
            update={update}
            onBack={() => setStep("plan")}
            onContinue={() => { setError(null); setStep("identity"); }}
          />
        )}

        {step === "identity" && (
          <IdentityStep
            form={form}
            update={update}
            idDoc={idDoc}
            setIdDoc={setIdDoc}
            billDoc={billDoc}
            setBillDoc={setBillDoc}
            onBack={() => setStep("personal")}
            onContinue={() => { setError(null); setStep("auth"); }}
          />
        )}

        {step === "auth" && (
          <AuthStep
            form={form}
            update={update}
            signatureDataUrl={signatureDataUrl}
            setSignatureDataUrl={setSignatureDataUrl}
            authConsent={authConsent}
            setAuthConsent={setAuthConsent}
            onBack={() => setStep("identity")}
            onContinue={submitApplication}
            submitting={submitting}
          />
        )}

        {step === "payment" && stripeClientSecret && stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret, appearance: stripeAppearance }}>
            <PaymentStep
              plan={plan}
              pricing={pricing}
              onBack={() => setStep("auth")}
              onSuccess={() => { setStep("success"); setSignupOpen(true); }}
            />
          </Elements>
        )}

        {step === "success" && (
          <SuccessStep onCreateAccount={() => setSignupOpen(true)} />
        )}
      </div>

      {submissionId && (
        <CreateAccountDialog
          open={signupOpen}
          onOpenChange={setSignupOpen}
          email={form.email}
          firstName={form.firstName}
          lastName={form.lastName}
          submissionId={submissionId}
          onCreated={() => navigate("/account")}
        />
      )}
    </section>
  );
}

const stripeAppearance = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#0F5132",
    colorText: "#0A1628",
    colorBackground: "#FBFAF7",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "6px",
  },
};

// ── Stepper ─────────────────────────────────────────────────────
const STEPS_ORDER: { key: Step; label: string }[] = [
  { key: "plan",     label: "Plan" },
  { key: "personal", label: "Personal" },
  { key: "identity", label: "Identity" },
  { key: "auth",     label: "Authorization" },
  { key: "payment",  label: "Payment" },
  { key: "success",  label: "Confirm" },
];

function Stepper({ step }: { step: Step }) {
  const idx = STEPS_ORDER.findIndex((s) => s.key === step);
  return (
    <div className="mb-12 flex flex-wrap gap-3 md:gap-2 items-center text-xs uppercase tracking-[0.16em]">
      {STEPS_ORDER.map((s, i) => {
        const active = i === idx;
        const done = i < idx;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <span className={`h-7 w-7 rounded-full border flex items-center justify-center ${
              done ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white" :
              active ? "border-[var(--color-ink)] text-[var(--color-ink)]" :
              "border-[var(--color-stone-300)] text-[var(--color-stone-500)]"
            }`}>
              {done ? <Check size={12} /> : <span className="tabular-nums">{i + 1}</span>}
            </span>
            <span className={done ? "text-[var(--color-stone-600)]" : active ? "text-[var(--color-ink)]" : "text-[var(--color-stone-500)]"}>
              {s.label}
            </span>
            {i < STEPS_ORDER.length - 1 && <span className="hidden md:inline mx-2 text-[var(--color-stone-300)]">—</span>}
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
  return (
    <div>
      <h2 className="font-serif text-3xl text-[var(--color-ink)] mb-3">Choose your plan</h2>
      <p className="text-[var(--color-stone-700)] mb-10">Both plans include the same disciplined process. Select the cadence that suits your situation.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <PlanCard
          selected={plan === "monthly"}
          onClick={() => setPlan("monthly")}
          eyebrow="Monthly"
          price={`$${monthly.toLocaleString()}`}
          unit={`per month · ${pricing.monthlyMonths} months`}
          features={[
            "Auto-cancels after 6 cycles",
            "Cancel anytime, prorated",
            "First round within 30 days",
            "Three-bureau coverage",
          ]}
        />
        <PlanCard
          selected={plan === "upfront"}
          onClick={() => setPlan("upfront")}
          eyebrow="Pay in Full"
          highlight
          price={`$${upfront.toLocaleString()}`}
          unit="single payment"
          badge={pricing.upfrontSavingsLabel}
          features={[
            `Save vs ${pricing.monthlyMonths}-month plan`,
            "Priority queue placement",
            "All rounds included",
            "Three-bureau coverage",
          ]}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onContinue}
          className="px-8 py-3.5 rounded-md bg-[var(--color-ink)] text-[var(--color-paper)] btn-press text-sm tracking-wide"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function PlanCard({
  selected, onClick, eyebrow, price, unit, features, highlight, badge,
}: {
  selected: boolean; onClick: () => void; eyebrow: string; price: string; unit: string;
  features: string[]; highlight?: boolean; badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-8 border transition-all relative ${
        selected
          ? "border-[var(--color-ink)] bg-[var(--color-paper)] shadow-[0_2px_0_0_var(--color-ink)]"
          : "border-[var(--color-stone-200)] bg-[var(--color-paper)] hover:border-[var(--color-stone-400)]"
      } ${highlight ? "" : ""}`}
    >
      {badge && (
        <span className="absolute top-6 right-6 text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)]">
          {badge}
        </span>
      )}
      <div className="eyebrow mb-4">{eyebrow}</div>
      <div className="font-serif text-4xl text-[var(--color-ink)] mb-1">{price}</div>
      <div className="text-sm text-[var(--color-stone-600)] mb-6">{unit}</div>
      <ul className="space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-stone-800)]">
            <Check size={14} className="text-[var(--color-accent)] mt-1 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

// ── Personal Step ───────────────────────────────────────────────
function PersonalStep({
  form, update, onBack, onContinue,
}: { form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void; onBack: () => void; onContinue: () => void }) {
  function handleSubmit(e: React.FormEvent) { e.preventDefault(); onContinue(); }
  return (
    <form onSubmit={handleSubmit}>
      <h2 className="font-serif text-3xl text-[var(--color-ink)] mb-3">Personal information</h2>
      <p className="text-[var(--color-stone-700)] mb-10">All fields encrypted in transit and at rest.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
        <Input label="First name" value={form.firstName} onChange={(v) => update("firstName", v)} required autoComplete="given-name" />
        <Input label="Last name"  value={form.lastName}  onChange={(v) => update("lastName", v)}  required autoComplete="family-name" />
        <Input label="Email"      type="email" value={form.email} onChange={(v) => update("email", v)} required autoComplete="email" />
        <Input label="Phone"      type="tel" value={form.phone}  onChange={(v) => update("phone", v)} required autoComplete="tel" />
        <Input label="Date of birth" type="date" value={form.dateOfBirth} onChange={(v) => update("dateOfBirth", v)} required />
        <div className="hidden md:block" />
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

// ── Identity Step ───────────────────────────────────────────────
function IdentityStep({
  form, update, idDoc, setIdDoc, billDoc, setBillDoc, onBack, onContinue,
}: {
  form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  idDoc: File | null; setIdDoc: (f: File | null) => void;
  billDoc: File | null; setBillDoc: (f: File | null) => void;
  onBack: () => void; onContinue: () => void;
}) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idDoc || !billDoc) return;
    if (form.ssn.replace(/[^0-9]/g, "").length !== 9) return;
    onContinue();
  }
  return (
    <form onSubmit={handleSubmit}>
      <h2 className="font-serif text-3xl text-[var(--color-ink)] mb-3">Identity verification</h2>
      <p className="text-[var(--color-stone-700)] mb-6">
        Required by federal law for all credit-repair clients (CROA §1679b).
        Your SSN is encrypted with AWS KMS — staff see only the last four digits.
      </p>

      <div className="bg-[var(--color-stone-50)] border border-[var(--color-stone-200)] p-6 mb-8 flex items-start gap-3">
        <Lock size={18} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
        <div className="text-sm text-[var(--color-stone-700)] leading-relaxed">
          Documents are uploaded to encrypted S3 storage with AWS KMS keys.
          They are never accessible by URL — only via short-lived authenticated links.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
        <Input
          label="Social Security Number"
          value={form.ssn}
          onChange={(v) => update("ssn", v.replace(/[^0-9]/g, "").slice(0, 9))}
          required
          placeholder="9 digits"
        />
        <div className="hidden md:block" />

        <FileField
          label="Government-issued ID"
          file={idDoc}
          onChange={setIdDoc}
          accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif"
          hint="Driver’s license, state ID, or passport — front side. PDF or image, up to 10MB."
        />
        <FileField
          label="Proof of address"
          file={billDoc}
          onChange={setBillDoc}
          accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif"
          hint="A recent bill in your name, dated within 60 days."
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

      <StepNav
        onBack={onBack}
        continueLabel="Continue"
        disabled={!idDoc || !billDoc || form.ssn.replace(/[^0-9]/g, "").length !== 9}
      />
    </form>
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
    <label className="block">
      <span className="flex items-center gap-2 mb-2">
        <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-stone-600)]">
          {label}<span className="text-[var(--color-accent)] ml-1">*</span>
        </span>
        {examples && examples.length > 0 && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setShowExamples((v) => !v); }}
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-stone-500)] hover:text-[var(--color-ink)] transition-colors"
            aria-expanded={showExamples}
          >
            <Info size={12} />
            {showExamples ? "Hide" : "What counts?"}
          </button>
        )}
      </span>
      {examples && showExamples && (
        <div className="mb-3 border border-[var(--color-stone-200)] bg-[var(--color-stone-50)] rounded-md p-4 relative">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setShowExamples(false); }}
            className="absolute top-2 right-2 text-[var(--color-stone-500)] hover:text-[var(--color-ink)]"
            aria-label="Close"
          >
            <X size={14} />
          </button>
          {examplesTitle && (
            <div className="eyebrow mb-3 pr-6">{examplesTitle}</div>
          )}
          <ul className="space-y-1.5 text-xs text-[var(--color-stone-700)]">
            {examples.map((ex) => (
              <li key={ex} className="flex items-start gap-2">
                <Check size={12} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
                <span>{ex}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-[var(--color-stone-500)] leading-relaxed">
            Must be in your name and dated within the last 60 days. Health insurance and policies that aren’t paid monthly don’t qualify.
          </p>
        </div>
      )}
      <div className="border border-dashed border-[var(--color-stone-300)] hover:border-[var(--color-ink)] transition-colors px-5 py-6 cursor-pointer relative">
        <input
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="text-sm text-[var(--color-ink)]">
          {file ? file.name : <span className="text-[var(--color-stone-600)]">Click to upload or drop a file</span>}
        </div>
      </div>
      {hint && <p className="mt-2 text-xs text-[var(--color-stone-600)]">{hint}</p>}
    </label>
  );
}

// ── Authorization Step ──────────────────────────────────────────
function AuthStep({
  form, update, signatureDataUrl, setSignatureDataUrl, authConsent, setAuthConsent,
  onBack, onContinue, submitting,
}: {
  form: FormState; update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  signatureDataUrl: string; setSignatureDataUrl: (s: string) => void;
  authConsent: boolean; setAuthConsent: (b: boolean) => void;
  onBack: () => void; onContinue: () => void; submitting: boolean;
}) {
  const sigRef = useRef<SignatureCanvas | null>(null);
  const fullName = useMemo(() => `${form.firstName} ${form.lastName}`.trim(), [form.firstName, form.lastName]);

  useEffect(() => {
    if (fullName && !form.signatureName) update("signatureName", fullName);
    if (!form.signatureDate) update("signatureDate", new Date().toISOString().slice(0, 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullName]);

  function handleSign() {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    setSignatureDataUrl(sigRef.current.getCanvas().toDataURL("image/png"));
  }
  function clearSig() {
    sigRef.current?.clear();
    setSignatureDataUrl("");
  }

  return (
    <div>
      <h2 className="font-serif text-3xl text-[var(--color-ink)] mb-3">Authorization</h2>
      <p className="text-[var(--color-stone-700)] mb-8">
        This authorizes Credit Removers to act on your behalf with the credit bureaus.
        You may rescind at any time.
      </p>

      <div className="border border-[var(--color-stone-200)] bg-[var(--color-stone-50)] p-6 md:p-8 mb-8 max-h-72 overflow-y-auto text-sm leading-relaxed text-[var(--color-stone-800)]">
        <p className="mb-4">
          I, <strong>{fullName || "[your name]"}</strong>, hereby authorize Credit Removers, LLC and its
          designated representatives to act as my agent in matters relating to the review,
          investigation, and dispute of inaccurate, outdated, or unverifiable information appearing
          on my consumer credit reports issued by Equifax, Experian, and TransUnion.
        </p>
        <p className="mb-4">
          I authorize Credit Removers to obtain copies of my credit reports, file dispute letters
          on my behalf, and communicate with credit reporting agencies, creditors, and collection
          agencies in connection with the foregoing, pursuant to my rights under the Fair Credit
          Reporting Act (15 U.S.C. §1681 et seq.) and the Credit Repair Organizations Act
          (15 U.S.C. §1679 et seq.).
        </p>
        <p className="mb-4">
          I understand that this authorization is effective as of the date below and remains in
          effect until revoked by me in writing. I may cancel any contract with Credit Removers
          within three (3) business days at no cost, in accordance with CROA §1679e.
        </p>
        <p>
          Dated this <strong>{form.signatureDate}</strong> at the address: <strong>{form.addressLine1}, {form.city}, {form.state} {form.zip}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7 mb-8">
        <Input label="Print full legal name" value={form.signatureName} onChange={(v) => update("signatureName", v)} required />
        <Input label="Date" type="date" value={form.signatureDate} onChange={(v) => update("signatureDate", v)} required />
      </div>

      <div className="mb-8">
        <span className="block text-xs uppercase tracking-[0.18em] text-[var(--color-stone-600)] mb-2">
          Signature<span className="text-[var(--color-accent)] ml-1">*</span>
        </span>
        <div className="border border-[var(--color-stone-300)] bg-white">
          <SignatureCanvas
            ref={(r) => { sigRef.current = r; }}
            onEnd={handleSign}
            canvasProps={{ className: "w-full h-40", style: { touchAction: "none" } }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-[var(--color-stone-600)]">Sign with mouse or finger.</span>
          <button type="button" onClick={clearSig} className="text-[var(--color-accent)] hover:underline">Clear</button>
        </div>
      </div>

      <label className="flex items-start gap-3 mb-8 cursor-pointer">
        <input
          type="checkbox"
          checked={authConsent}
          onChange={(e) => setAuthConsent(e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm text-[var(--color-stone-800)]">
          I have read and agree to the authorization above and the {" "}
          <Link to="/terms-of-service" className="underline">Terms of Service</Link> and {" "}
          <Link to="/privacy-policy" className="underline">Privacy Policy</Link>.
        </span>
      </label>

      <StepNav
        onBack={onBack}
        continueLabel={submitting ? "Encrypting & uploading…" : "Continue to Payment"}
        onContinue={onContinue}
        disabled={!signatureDataUrl || !authConsent || submitting}
      />
    </div>
  );
}

// ── Payment Step ────────────────────────────────────────────────
function PaymentStep({
  plan, pricing, onBack, onSuccess,
}: { plan: Plan; pricing: Pricing | null; onBack: () => void; onSuccess: () => void }) {
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
    onSuccess();
  }

  const summary =
    plan === "upfront"
      ? `One-time payment of $${((pricing?.upfrontAmountCents ?? 0) / 100).toLocaleString()}`
      : `$${((pricing?.monthlyAmountCents ?? 0) / 100).toLocaleString()} today, then $${((pricing?.monthlyAmountCents ?? 0) / 100).toLocaleString()} each month for ${(pricing?.monthlyMonths ?? 6) - 1} more cycles`;

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="font-serif text-3xl text-[var(--color-ink)] mb-3">Payment</h2>
      <p className="text-[var(--color-stone-700)] mb-8">{summary}</p>

      <div className="bg-[var(--color-paper)] border border-[var(--color-stone-200)] p-6 md:p-8 mb-6">
        <PaymentElement />
      </div>

      <div className="mb-6 flex items-center gap-2 text-xs text-[var(--color-stone-600)]">
        <ShieldCheck size={14} className="text-[var(--color-accent)]" />
        Card data handled directly by Stripe — never touches our servers.
      </div>

      {error && <p className="mb-4 text-sm text-[#9b2c2c]">{error}</p>}

      <StepNav
        onBack={onBack}
        continueLabel={submitting ? "Processing…" : "Confirm Payment"}
        disabled={!stripe || submitting}
      />
    </form>
  );
}

// ── Success Step ────────────────────────────────────────────────
function SuccessStep({ onCreateAccount }: { onCreateAccount: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[var(--color-accent)] text-white mb-6">
        <Check size={32} />
      </div>
      <h2 className="font-serif text-3xl text-[var(--color-ink)] mb-4">Payment confirmed.</h2>
      <p className="text-[var(--color-stone-700)] mb-8 max-w-xl mx-auto">
        Welcome aboard. Your senior analyst will review your file within one business day.
        Create your client account to track every round in your private dashboard.
      </p>
      <button
        onClick={onCreateAccount}
        className="px-8 py-3.5 rounded-md bg-[var(--color-ink)] text-[var(--color-paper)] btn-press text-sm tracking-wide"
      >
        Create Client Account
      </button>
    </div>
  );
}

// ── Create Account Dialog ───────────────────────────────────────
function CreateAccountDialog({
  open, onOpenChange, email, firstName, lastName, submissionId, onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  email: string;
  firstName: string;
  lastName: string;
  submissionId: number;
  onCreated: () => void;
}) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/customer/signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName, checkoutSubmissionId: submissionId }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.message || "Signup failed");
      }
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[var(--color-paper)] border-[var(--color-stone-200)]">
        <DialogHeader>
          <DialogTitle className="font-serif">Create your client account</DialogTitle>
          <DialogDescription className="text-[var(--color-stone-700)] pt-1">
            Set a password to access your dashboard at any time.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div>
            <span className="block text-xs uppercase tracking-[0.18em] text-[var(--color-stone-600)] mb-2">Email</span>
            <div className="text-sm text-[var(--color-stone-800)]">{email}</div>
          </div>
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            required
            placeholder="At least 8 characters"
          />
          {error && <p className="text-sm text-[#9b2c2c]">{error}</p>}
          <button
            type="submit"
            disabled={submitting || password.length < 8}
            className="w-full px-6 py-3 rounded-md bg-[var(--color-ink)] text-[var(--color-paper)] btn-press text-sm tracking-wide disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create Account & View Dashboard"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
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
      <span className="block text-xs uppercase tracking-[0.18em] text-[var(--color-stone-600)] mb-2">
        {label}{required && <span className="text-[var(--color-accent)] ml-1">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full bg-transparent border-0 border-b border-[var(--color-stone-300)] focus:border-[var(--color-ink)] outline-none px-0 py-2 text-base"
      />
    </label>
  );
}

function Select({
  label, value, onChange, required, children,
}: { label: string; value: string; onChange: (v: string) => void; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.18em] text-[var(--color-stone-600)] mb-2">
        {label}{required && <span className="text-[var(--color-accent)] ml-1">*</span>}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-transparent border-0 border-b border-[var(--color-stone-300)] focus:border-[var(--color-ink)] outline-none px-0 py-2 text-base"
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
    <div className="flex items-center justify-between gap-4 mt-12 pt-8 border-t border-[var(--color-stone-200)]">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-[var(--color-stone-700)] hover:text-[var(--color-ink)] underline-offset-4 hover:underline"
      >
        ← Back
      </button>
      <button
        type={onContinue ? "button" : "submit"}
        onClick={onContinue}
        disabled={disabled}
        className="px-8 py-3.5 rounded-md bg-[var(--color-ink)] text-[var(--color-paper)] btn-press text-sm tracking-wide disabled:opacity-60"
      >
        {continueLabel}
      </button>
    </div>
  );
}
