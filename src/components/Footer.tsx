import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";
import { useMediaSrc } from "../hooks/useMedia";

export function Footer() {
  const year = new Date().getFullYear();
  const logoSrc = useMediaSrc("footerLogo");
  return (
    <footer className="bg-[var(--color-paper-soft)] border-t border-[var(--color-stone-200)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <img src={logoSrc} alt="Credit Removers" className="h-10 md:h-12 w-auto mb-5" />
            <p className="text-sm text-[var(--color-stone-600)] max-w-sm leading-relaxed">
              Professional credit repair operating under the Fair Credit Reporting Act and the
              Credit Repair Organizations Act. We help you take control of your credit legally.
            </p>
          </div>

          <Col title="Company">
            <FootLink href="/#how-it-works">How It Works</FootLink>
            <FootLink href="/#why">Why Choose Us</FootLink>
            <FootLink href="/#faq">FAQ</FootLink>
            <FootLink to="/news">News</FootLink>
            <FootLink to="/checkout">Get Started</FootLink>
          </Col>

          <Col title="Contact Us">
            <li className="flex items-start gap-2 text-sm text-[var(--color-stone-600)]">
              <Mail size={14} className="mt-0.5 text-[var(--color-accent)]" />
              <a href="mailto:support@creditremovers.com" className="hover:text-[var(--color-ink)]">
                support@creditremovers.com
              </a>
            </li>
            <li className="flex items-start gap-2 text-sm text-[var(--color-stone-600)]">
              <MapPin size={14} className="mt-0.5 text-[var(--color-accent)]" />
              United States
            </li>
          </Col>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--color-stone-200)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-[var(--color-stone-500)]">
          <div>© {year} Credit Removers. All rights reserved.</div>
          <div className="flex gap-5">
            <Link to="/privacy-policy" className="hover:text-[var(--color-ink)]">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-[var(--color-ink)]">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold text-[var(--color-ink)] mb-4">{title}</div>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function FootLink({
  to, href, children,
}: { to?: string; href?: string; children: React.ReactNode }) {
  const cls = "text-sm text-[var(--color-stone-600)] hover:text-[var(--color-ink)] transition-colors";
  return (
    <li>
      {to ? <Link to={to} className={cls}>{children}</Link> : <a href={href} className={cls}>{children}</a>}
    </li>
  );
}

export default Footer;
