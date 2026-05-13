import {
  Clock,
  AlertTriangle,
  FileWarning,
  CreditCard,
  Search,
  UserX,
  Archive,
  CalendarX,
  PauseCircle,
  Home,
  Car,
  Scale,
  Gavel,
  Landmark,
} from "lucide-react";

const ITEMS = [
  { icon: Clock,         label: "Late Payments" },
  { icon: AlertTriangle, label: "Delinquencies" },
  { icon: FileWarning,   label: "Collections" },
  { icon: CreditCard,    label: "Charge-offs" },
  { icon: Search,        label: "Hard Inquiries" },
  { icon: UserX,         label: "Unrecognized Accounts" },
  { icon: Archive,       label: "Closed Accounts" },
  { icon: CalendarX,     label: "Outdated Accounts" },
  { icon: PauseCircle,   label: "Inactive Accounts" },
  { icon: Home,          label: "Foreclosures" },
  { icon: Car,           label: "Repossessions" },
  { icon: Scale,         label: "Tax Liens" },
  { icon: Landmark,      label: "Bankruptcies" },
  { icon: Gavel,         label: "Judgments" },
];

export function WhatWeRemove() {
  return (
    <section id="what-we-remove" className="bg-[var(--color-paper)] border-t border-[var(--color-stone-200)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4">
            <div className="eyebrow mb-4">What we remove</div>
            <h2 className="font-serif text-[var(--color-ink)] mb-6">
              The marks holding your score down.
            </h2>
            <p className="text-[var(--color-stone-700)] leading-relaxed">
              We dispute every category of derogatory item permitted under the FCRA — from a single
              late payment to a public-record judgment. If it’s inaccurate, unverifiable or
              improperly reported on your Equifax, Experian or TransUnion file, it’s on the table.
            </p>
            <p className="mt-6 text-sm text-[var(--color-stone-600)]">
              … and much more, case by case.
            </p>
          </div>

          <ul className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-px bg-[var(--color-stone-200)] border border-[var(--color-stone-200)] rounded-md overflow-hidden">
            {ITEMS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="bg-[var(--color-paper)] flex items-center gap-3 px-5 py-5 hover:bg-[var(--color-stone-50)] transition-colors"
              >
                <Icon size={18} className="text-[var(--color-gold)] shrink-0" aria-hidden />
                <span className="text-sm text-[var(--color-ink)] leading-snug">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default WhatWeRemove;
