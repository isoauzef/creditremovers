import { Link } from "react-router-dom";
import { useMediaSrc } from "../hooks/useMedia";

export function Footer() {
  const year = new Date().getFullYear();
  const logoSrc = useMediaSrc("footerLogo");
  return (
    <footer className="bg-[var(--color-ink)] text-[var(--color-paper)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <img src={logoSrc} alt="Credit Removers" className="h-16 md:h-20 w-auto mb-6 invert" />
            <p className="text-sm text-[var(--color-stone-300)] max-w-sm leading-relaxed">
              A credit-repair firm operating under the Fair Credit Reporting Act and the
              Credit Repair Organizations Act. Disciplined work. Plain language. No promises
              we can’t keep.
            </p>
          </div>

          <Col title="Company">
            <FootLink to="/news">News</FootLink>
            <FootLink href="/#how-it-works">How It Works</FootLink>
            <FootLink href="/#faq">FAQ</FootLink>
          </Col>

          <Col title="Get Started">
            <FootLink to="/checkout">Become a Client</FootLink>
            <FootLink href="/#lead-form">Free Consultation</FootLink>
            <FootLink to="/account">Client Login</FootLink>
          </Col>

          <Col title="Legal">
            <FootLink to="/privacy-policy">Privacy Policy</FootLink>
            <FootLink to="/terms-of-service">Terms of Service</FootLink>
          </Col>
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--color-stone-700)] text-xs text-[var(--color-stone-400)]">
          © {year} Credit Removers. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-gold)] mb-5">{title}</div>
      <ul className="flex flex-col gap-3 text-sm text-[var(--color-stone-300)]">{children}</ul>
    </div>
  );
}

function FootLink({
  to, href, children,
}: { to?: string; href?: string; children: React.ReactNode }) {
  return (
    <li>
      {to ? (
        <Link to={to} className="hover:text-[var(--color-paper)] transition-colors">{children}</Link>
      ) : (
        <a href={href} className="hover:text-[var(--color-paper)] transition-colors">{children}</a>
      )}
    </li>
  );
}

export default Footer;
