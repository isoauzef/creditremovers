import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminApi, useAdminFetch, type CheckoutSubmission } from "../../hooks/useAdmin";
import { Trash2, RefreshCw, ChevronDown, ChevronUp, Eye, Download, XCircle, ShieldOff } from "lucide-react";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch { return iso; }
}
const fmtMoney = (cents: number) => `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_COLOR: Record<string, string> = {
  pending:    "bg-slate-500/20 text-slate-300",
  active:     "bg-emerald-500/20 text-emerald-300",
  paid:       "bg-emerald-500/20 text-emerald-300",
  past_due:   "bg-amber-500/20 text-amber-300",
  completed:  "bg-blue-500/20 text-blue-300",
  canceled:   "bg-red-500/20 text-red-300",
  failed:     "bg-red-500/20 text-red-300",
};

export default function CheckoutSubmissions() {
  const { data, loading, reload, mutate } = useAdminApi<CheckoutSubmission[]>("/api/admin/checkout-submissions");
  const adminFetch = useAdminFetch();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [revealedSsn, setRevealedSsn] = useState<Record<number, string>>({});

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this checkout? This will also delete uploaded ID/utility documents.")) return;
    await mutate("DELETE", undefined, `/${id}`);
    reload();
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel the Stripe subscription for this client?")) return;
    try {
      await adminFetch(`/api/admin/checkout-submissions/${id}/cancel`, { method: "POST" });
      reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRevealSsn = async (id: number) => {
    if (!confirm("Reveal the full SSN? This action will be recorded in the PII audit log.")) return;
    try {
      const res = await adminFetch(`/api/admin/checkout-submissions/${id}/decrypt-ssn`, { method: "POST" });
      setRevealedSsn((prev) => ({ ...prev, [id]: res.ssn }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDownload = async (id: number, field: "idDoc" | "billDoc") => {
    try {
      const res = await adminFetch(`/api/admin/checkout-submissions/${id}/download/${field}`);
      if (res?.url) {
        window.open(res.url, "_blank");
      } else {
        // local mode returns a stream; trigger via direct href + Auth header isn't possible — open new tab won't work for streamed.
        // Workaround: use fetch with auth, then blob download.
        const token = localStorage.getItem("adminJwt");
        const r = await fetch(`/api/admin/checkout-submissions/${id}/download/${field}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const blob = await r.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = field === "idDoc" ? "id-document" : "utility-bill";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Checkout Submissions</h1>
          <p className="text-sm text-slate-400 mt-1">
            {data?.length ?? 0} signed-up clients. SSN is encrypted at rest (KMS envelope encryption).
          </p>
        </div>
        <button
          onClick={reload}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                <th className="px-4 py-3 text-left font-medium text-slate-400">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Email</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Paid</th>
                <th className="px-4 py-3 text-right font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {!data?.length ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">{loading ? "Loading..." : "No submissions yet."}</td></tr>
              ) : (
                data.map((s) => {
                  const expanded = expandedId === s.id;
                  return (
                    <RowGroup
                      key={s.id}
                      s={s}
                      expanded={expanded}
                      ssn={revealedSsn[s.id]}
                      onToggle={() => setExpandedId(expanded ? null : s.id)}
                      onDelete={() => handleDelete(s.id)}
                      onCancel={() => handleCancel(s.id)}
                      onRevealSsn={() => handleRevealSsn(s.id)}
                      onDownload={(field) => handleDownload(s.id, field)}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RowGroup({ s, expanded, ssn, onToggle, onDelete, onCancel, onRevealSsn, onDownload }: {
  s: CheckoutSubmission;
  expanded: boolean;
  ssn?: string;
  onToggle: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onRevealSsn: () => void;
  onDownload: (field: "idDoc" | "billDoc") => void;
}) {
  const statusClass = STATUS_COLOR[s.paymentStatus] || "bg-slate-500/20 text-slate-300";
  return (
    <>
      <tr className="hover:bg-slate-800/50 cursor-pointer" onClick={onToggle}>
        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{formatDate(s.createdAt)}</td>
        <td className="px-4 py-3 text-white font-medium">{s.firstName} {s.lastName}</td>
        <td className="px-4 py-3 text-slate-300">{s.email}</td>
        <td className="px-4 py-3 text-slate-300 capitalize">{s.paymentPlan}</td>
        <td className="px-4 py-3">
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
            {s.paymentStatus}
          </span>
        </td>
        <td className="px-4 py-3 text-slate-300">{fmtMoney(s.totalPaidCents)}{s.paymentPlan === "monthly" && <span className="text-slate-500"> ({s.monthsBilled}/6)</span>}</td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="rounded p-1.5 text-red-400 hover:bg-red-500/10"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="px-6 py-4 bg-slate-800/30">
            <div className="grid gap-4 lg:grid-cols-2">
              <section className="space-y-2">
                <h3 className="text-xs uppercase tracking-wide text-slate-500">Personal</h3>
                <Detail label="Phone" value={s.phone} />
                <Detail label="Date of Birth" value={s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString() : "—"} />
                <Detail label="Address" value={`${s.addressLine1}${s.addressLine2 ? `, ${s.addressLine2}` : ""}, ${s.city}, ${s.state} ${s.zip}`} />
              </section>

              <section className="space-y-2">
                <h3 className="text-xs uppercase tracking-wide text-slate-500">Sensitive (KMS-encrypted)</h3>
                <div>
                  <p className="text-slate-500 text-xs">SSN</p>
                  {ssn ? (
                    <p className="text-emerald-300 mt-0.5 font-mono">{ssn.replace(/(\d{3})(\d{2})(\d{4})/, "$1-$2-$3")}</p>
                  ) : (
                    <button onClick={onRevealSsn} className="mt-1 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20">
                      <Eye size={14} /> Reveal SSN (audited) — Last 4: {s.ssnLast4 || "—"}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {s.idDocS3Key && (
                    <button onClick={() => onDownload("idDoc")} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700">
                      <Download size={14} /> ID Document
                    </button>
                  )}
                  {s.billDocS3Key && (
                    <button onClick={() => onDownload("billDoc")} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700">
                      <Download size={14} /> Utility Bill
                    </button>
                  )}
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-xs uppercase tracking-wide text-slate-500">Authorization</h3>
                <Detail label="Signed by" value={s.signatureName || "—"} />
                <Detail label="Signed on" value={s.signatureDate ? formatDate(s.signatureDate) : "—"} />
                <Detail label="Consent" value={s.authConsent ? "✓ Granted" : "✗ Not granted"} />
              </section>

              <section className="space-y-2">
                <h3 className="text-xs uppercase tracking-wide text-slate-500">Payment</h3>
                <Detail label="Stripe Subscription" value={s.stripeSubscriptionId || "—"} />
                <Detail label="Stripe Schedule" value={s.stripeSubscriptionScheduleId || "—"} />
                <Detail label="Customer Account" value={s.customerUserId ? `#${s.customerUserId}` : "Not linked"} />
                <div className="flex flex-wrap gap-2 pt-2">
                  {s.customerUserId && (
                    <Link to={`/admin/customers/${s.customerUserId}`} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20">
                      Manage Credit Rounds →
                    </Link>
                  )}
                  {(s.stripeSubscriptionId || s.stripeSubscriptionScheduleId) && s.paymentStatus !== "canceled" && s.paymentStatus !== "completed" && (
                    <button onClick={onCancel} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20">
                      <XCircle size={14} /> Cancel Subscription
                    </button>
                  )}
                  {!s.idDocS3Key && !s.billDocS3Key && !s.ssnLast4 && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-500">
                      <ShieldOff size={14} /> No PII on file
                    </span>
                  )}
                </div>
              </section>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-500 text-xs">{label}</p>
      <p className="text-slate-200 mt-0.5 break-words">{value}</p>
    </div>
  );
}
