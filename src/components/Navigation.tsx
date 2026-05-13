import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useMediaSrc } from "../hooks/useMedia";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#why",          label: "Why Us" },
  { href: "/#faq",          label: "FAQ" },
  { href: "/news",          label: "News" },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState(false);
  const location = useLocation();
  const logoSrc = useMediaSrc("navLogo");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/customer/me", { credentials: "include" })
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, [location.pathname]);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${
        scrolled ? "shadow-[0_1px_0_0_var(--color-stone-200)]" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center" aria-label="Credit Removers home">
          <img src={logoSrc} alt="Credit Removers" className="h-[48px] md:h-[58px] w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-[var(--color-stone-700)] hover:text-[var(--color-ink)] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/account"
            className="text-sm font-medium text-[var(--color-stone-700)] hover:text-[var(--color-ink)] transition-colors"
          >
            {authed ? "My Account" : "Login"}
          </Link>
          <Link to="/checkout" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden p-2 -mr-2 text-[var(--color-ink)]"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--color-stone-200)] bg-white">
          <nav className="px-6 py-5 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-base text-[var(--color-stone-700)]">{l.label}</a>
            ))}
            <Link to="/account" className="text-base text-[var(--color-stone-700)]">
              {authed ? "My Account" : "Login"}
            </Link>
            <Link to="/checkout" className="btn-primary w-full text-sm mt-2">
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navigation;
