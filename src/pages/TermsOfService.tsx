import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function TermsOfService() {
  const lastUpdated = "May 1, 2026";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navigation />
      <main className="container mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-medium">Legal</p>
        <h1 className="font-serif text-4xl sm:text-5xl mt-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mt-3">Last updated: {lastUpdated}</p>

        <div className="prose prose-slate mt-10 max-w-none text-base leading-relaxed">
          <p>
            These Terms of Service (“Terms”) govern your use of{" "}
            <Link to="/" className="text-emerald-700 hover:underline">creditremovers.com</Link>{" "}
            and the credit-repair services provided by Credit Removers (“we,” “us,” “our”).
            By signing up you acknowledge you have read, understood, and accepted these Terms.
          </p>

          <h2 className="font-serif text-2xl mt-10 mb-3">1. Eligibility</h2>
          <p>You must be at least 18 years old, a U.S. resident, and able to enter into a binding contract.</p>

          <h2 className="font-serif text-2xl mt-10 mb-3">2. Services</h2>
          <p>
            We are a credit-repair organization regulated by the Credit Repair Organizations Act
            (CROA), 15 U.S.C. § 1679 et seq. Our service consists of:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Reviewing your three-bureau credit reports;</li>
            <li>Identifying inaccurate, unverifiable, or obsolete items as defined by the FCRA;</li>
            <li>Drafting and submitting dispute, validation, and goodwill correspondence on your behalf;</li>
            <li>Tracking results and providing monthly progress reports.</li>
          </ul>

          <h2 className="font-serif text-2xl mt-10 mb-3">3. Your Right to Cancel (CROA)</h2>
          <p>
            <strong>You may cancel this contract without penalty or obligation at any time before
            midnight of the third business day after the date on which you signed the contract.</strong>
            To cancel, send a written cancellation notice to{" "}
            <a href="mailto:support@creditremovers.com" className="text-emerald-700 hover:underline">support@creditremovers.com</a>.
          </p>

          <h2 className="font-serif text-2xl mt-10 mb-3">4. Fees & Billing</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Monthly Plan:</strong> Six (6) monthly payments of $400.00 USD billed on the same day each month for six consecutive months. The subscription cancels automatically at the end of month six.</li>
            <li><strong>Upfront Plan:</strong> A single payment of $2,000.00 USD covering the full six-month engagement.</li>
            <li>Fees are charged only after we have performed services in compliance with CROA § 1679b. Initial payments are processed once your authorization is on file and we have begun work.</li>
            <li>Failed monthly payments suspend the program; the account is restored once the balance is brought current. Repeated non-payment may result in termination.</li>
          </ul>

          <h2 className="font-serif text-2xl mt-10 mb-3">5. No Guarantees of Results</h2>
          <p>
            <strong>We do not guarantee any specific outcome.</strong> Credit reporting agencies and
            furnishers — not Credit Removers — control whether items are deleted, updated, or left in
            place. Score movements depend on many factors including your spending, balances, and
            credit history. Past results shown on the site are not predictive of your individual case.
          </p>

          <h2 className="font-serif text-2xl mt-10 mb-3">6. Your Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Provide accurate, complete information and a copy of a current government-issued ID and proof of address.</li>
            <li>Sign the bureau authorization that lets us correspond on your behalf.</li>
            <li>Forward any correspondence you receive from credit bureaus or creditors within seven (7) days.</li>
            <li>Refrain from disputing the same items independently while we are working them.</li>
          </ul>

          <h2 className="font-serif text-2xl mt-10 mb-3">7. Consumer Credit File Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Dispute inaccurate information yourself, free of charge, with each credit bureau.</li>
            <li>Obtain a free copy of your credit report at <a href="https://www.annualcreditreport.com" target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">annualcreditreport.com</a>.</li>
            <li>Sue a credit repair organization that violates the CROA.</li>
            <li>Cancel your contract within three business days of signing without penalty.</li>
          </ul>

          <h2 className="font-serif text-2xl mt-10 mb-3">8. Termination</h2>
          <p>
            Either party may terminate the engagement at any time on written notice. Pre-paid fees
            covering work not yet performed are refunded on a prorated basis. Termination does not
            extinguish either party’s liability for actions taken before the termination date.
          </p>

          <h2 className="font-serif text-2xl mt-10 mb-3">9. Disclaimers & Limitation of Liability</h2>
          <p>
            The service is provided “as is” without warranty of any kind. To the fullest extent
            permitted by law, our aggregate liability arising out of or related to these Terms shall
            not exceed the fees you paid us during the six (6) months preceding the event giving rise
            to the claim. Nothing in these Terms limits any liability that cannot be limited under
            applicable law (including under CROA).
          </p>

          <h2 className="font-serif text-2xl mt-10 mb-3">10. Governing Law & Disputes</h2>
          <p>
            These Terms are governed by the laws of the State of Delaware, without regard to conflict
            of laws principles. Any dispute will be resolved in the state or federal courts located
            in Delaware, except where consumer-protection law provides otherwise.
          </p>

          <h2 className="font-serif text-2xl mt-10 mb-3">11. Changes</h2>
          <p>
            We may modify these Terms with reasonable notice. Material changes that increase your
            obligations will not apply to your existing engagement unless you affirmatively accept them.
          </p>

          <h2 className="font-serif text-2xl mt-10 mb-3">12. Contact</h2>
          <p>
            <a href="mailto:support@creditremovers.com" className="text-emerald-700 hover:underline">support@creditremovers.com</a>
          </p>
        </div>

        <div className="mt-12">
          <Link to="/" className="text-sm text-emerald-700 hover:underline">← Back to home</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
