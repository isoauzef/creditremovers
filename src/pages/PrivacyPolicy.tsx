import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
  const lastUpdated = "May 1, 2026";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navigation />
      <main className="container mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-medium">Legal</p>
        <h1 className="text-4xl sm:text-5xl mt-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mt-3">Last updated: {lastUpdated}</p>

        <div className="prose prose-slate mt-10 max-w-none text-base leading-relaxed">
          <p>
            Credit Removers (“we,” “us,” or “our”) respects your privacy. This Policy explains what
            information we collect, how we use it, and the safeguards we apply when you use{" "}
            <Link to="/" className="text-emerald-700 hover:underline">creditremovers.com</Link>{" "}
            and our credit-repair services.
          </p>

          <h2 className="text-2xl mt-10 mb-3">1. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Identification:</strong> Full legal name, date of birth, current and prior addresses, government-issued ID, and Social Security Number.</li>
            <li><strong>Contact:</strong> Email address, phone number.</li>
            <li><strong>Financial:</strong> Credit reports from the three nationwide consumer reporting agencies (Equifax, Experian, TransUnion), tradeline data, payment information.</li>
            <li><strong>Authorization records:</strong> Electronic signatures, IP address (hashed), timestamps tied to your written authorization.</li>
            <li><strong>Site data:</strong> Standard log information (browser, pages visited) used to improve the service and prevent fraud.</li>
          </ul>

          <h2 className="text-2xl mt-10 mb-3">2. How We Use Your Information</h2>
          <p>We use your information solely to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Verify your identity (KYC) as required by federal law and the bureaus.</li>
            <li>Pull, analyze and dispute items on your credit reports on your behalf.</li>
            <li>Process payments and maintain your account.</li>
            <li>Communicate with you about your case.</li>
            <li>Comply with legal obligations including the Credit Repair Organizations Act (CROA), the Fair Credit Reporting Act (FCRA), and the Gramm-Leach-Bliley Act (GLBA).</li>
          </ul>
          <p className="mt-3">We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>

          <h2 className="text-2xl mt-10 mb-3">3. How We Protect Your Information</h2>
          <p>
            Sensitive personally identifiable information — including your Social Security Number,
            government-issued ID, and proof of address — is protected with bank-grade encryption:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>SSNs</strong> are never stored in plaintext. We apply <em>envelope encryption</em> using AWS Key Management Service (KMS): a unique data key encrypts each value, and that data key is itself encrypted with a customer-managed master key controlled by KMS hardware security modules. Only audited admin actions can decrypt — every decrypt is logged.</li>
            <li><strong>ID documents and utility bills</strong> are uploaded directly into a private Amazon S3 bucket configured with Server-Side Encryption using KMS (SSE-KMS). Public access is blocked at the bucket level. Access is granted only via short-lived (60-second) presigned URLs after a logged admin request.</li>
            <li><strong>Transport</strong> is always over TLS 1.2 or higher.</li>
            <li><strong>Audit log:</strong> Every reveal or download of sensitive data writes a tamper-evident record (admin user, timestamp, IP, user-agent).</li>
          </ul>

          <h2 className="text-2xl mt-10 mb-3">4. Bureau Authorization</h2>
          <p>
            Before we contact any credit reporting agency or furnisher on your behalf, you must
            provide a written, electronically signed authorization. You may revoke that authorization
            in writing at any time; revocation does not affect actions already taken in good faith
            under the prior authorization.
          </p>

          <h2 className="text-2xl mt-10 mb-3">5. Data Retention</h2>
          <p>
            We retain your records while you are an active client and for as long as legally required
            after the program ends (typically five years for CROA-related records). When permitted,
            we delete or anonymize your data on written request.
          </p>

          <h2 className="text-2xl mt-10 mb-3">6. Your Rights</h2>
          <p>
            Subject to federal and state law (including the CCPA where applicable), you may request
            access to, correction of, or deletion of your personal information. Send written requests
            to the contact address below. We respond within 30 days.
          </p>

          <h2 className="text-2xl mt-10 mb-3">7. Children</h2>
          <p>Our services are intended for individuals 18 years or older. We do not knowingly collect information from minors.</p>

          <h2 className="text-2xl mt-10 mb-3">8. Changes to This Policy</h2>
          <p>
            We may update this Policy from time to time. The “Last updated” date at the top of this
            page indicates when changes were made. Material changes will be communicated via email or
            a notice on the site.
          </p>

          <h2 className="text-2xl mt-10 mb-3">9. Contact</h2>
          <p>
            Questions or requests: <a href="mailto:privacy@creditremovers.com" className="text-emerald-700 hover:underline">privacy@creditremovers.com</a>.
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
