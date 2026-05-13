import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useMediaSrc } from "../hooks/useMedia";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/news", label: "News" },
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
      className={`sticky top-0 z-40 transition-colors duration-200 ${
        scrolled
          ? "bg-[var(--color-paper)]/95 backdrop-blur border-b border-[var(--color-stone-200)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-24 md:h-28 flex items-center justify-between">
        <Link to="/" className="flex items-center" aria-label="Credit Removers home">
          <img src={logoSrc} alt="Credit Removers" className="h-16 md:h-20 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm tracking-wide text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/checkout"
            className="text-sm tracking-wide px-5 py-2.5 rounded-md border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] btn-press transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/account"
            className="text-sm tracking-wide px-5 py-2.5 rounded-md bg-[var(--color-ink)] text-[var(--color-paper)] btn-press"
          >
            {authed ? "My Account" : "Login"}
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden p-2 -mr-2"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--color-stone-200)] bg-[var(--color-paper)]">
          <nav className="px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-base">{l.label}</a>
            ))}
            <Link to="/checkout" className="text-base">Get Started</Link>
            <Link to="/account" className="text-base font-medium">
              {authed ? "My Account" : "Login"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navigation;
