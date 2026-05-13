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
    <section id="what-we-remove" className="bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-[var(--color-ink)]">Items We Remove</h2>
          <p className="mt-4 text-lg text-[var(--color-stone-600)]">
            We dispute every category of derogatory item permitted under the FCRA —
            from a single late payment to a public-record judgment.
          </p>
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {ITEMS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="card-soft flex items-center gap-2 md:gap-3 px-1.5 md:px-5 py-4 hover:border-[var(--color-accent)] hover:shadow-md transition-all min-w-0"
            >
              <span className="w-10 h-10 rounded-full bg-[var(--color-paper-soft)] flex items-center justify-center shrink-0">
                <Icon size={18} className="text-[var(--color-accent)]" aria-hidden />
              </span>
              <span className="text-sm font-medium text-[var(--color-ink)] leading-snug min-w-0">{label}</span>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-sm text-[var(--color-stone-500)]">
          …and much more, case by case.
        </p>
      </div>
    </section>
  );
}

export default WhatWeRemove;
