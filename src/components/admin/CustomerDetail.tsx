import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAdminFetch, type CreditRound } from "../../hooks/useAdmin";
import { ArrowLeft, Plus, Edit3, Trash2, X, Loader2 } from "lucide-react";

type CustomerDetail = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  lastLoginAt?: string | null;
  createdAt: string;
  checkoutSubmissions: Array<{
    id: number;
    paymentPlan: string;
    paymentStatus: string;
    monthsBilled: number;
    totalPaidCents: number;
    createdAt: string;
  }>;
  creditRounds: CreditRound[];
};

const fmtMoney = (c: number) => `$${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const todayDate = () => new Date().toISOString().slice(0, 10);

const emptyRound = (custId: number, nextNum: number): Partial<CreditRound> => ({
  customerUserId: custId,
  roundNumber: nextNum,
  summaryDate: todayDate(),
  previousSummaryDate: null,
  equifaxScore: 0, equifaxPrevScore: 0,
  experianScore: 0, experianPrevScore: 0,
  transunionScore: 0, transunionPrevScore: 0,
  disputesDeletedThisRound: 0, disputesDeletedLastRound: 0, disputesDeletedGrandTotal: 0,
  disputesOnGoingThisRound: 0, disputesOnGoingLastRound: 0, disputesOnGoingGrandTotal: 0,
  unDisputedNegativeThisRound: 0, unDisputedNegativeLastRound: 0, unDisputedNegativeGrandTotal: 0,
  updatedToPositiveThisRound: 0, updatedToPositiveLastRound: 0, updatedToPositiveGrandTotal: 0,
  newItemsAddedThisRound: 0, newItemsAddedLastRound: 0, newItemsAddedGrandTotal: 0,
  notes: "",
});

const CATEGORIES: Array<{ key: string; label: string }> = [
  { key: "disputesDeleted", label: "Disputes Deleted" },
  { key: "disputesOnGoing", label: "Disputes Ongoing" },
  { key: "unDisputedNegative", label: "Un-Disputed Negative" },
  { key: "updatedToPositive", label: "Updated to Positive" },
  { key: "newItemsAdded", label: "New Items Added" },
];

export default function CustomerDetail() {
  const { id } = useParams();
  const adminFetch = useAdminFetch();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<CreditRound> | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminFetch(`/api/admin/customers/${id}`);
      setCustomer(data);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const openNew = () => {
    if (!customer) return;
    const nextNum = (customer.creditRounds[0]?.roundNumber || 0) + 1;
    setEditing(emptyRound(customer.id, nextNum));
    setErr("");
  };

  const openEdit = (r: CreditRound) => {
    setEditing({ ...r, summaryDate: r.summaryDate.slice(0, 10), previousSummaryDate: r.previousSummaryDate ? r.previousSummaryDate.slice(0, 10) : null });
    setErr("");
  };

  const save = async () => {
    if (!editing || !customer) return;
    setSaving(true);
    setErr("");
    try {
      const payload = { ...editing };
      // Convert date strings to ISO
      if (payload.summaryDate && typeof payload.summaryDate === "string") {
        payload.summaryDate = new Date(payload.summaryDate).toISOString();
      }
      if (payload.previousSummaryDate && typeof payload.previousSummaryDate === "string") {
        payload.previousSummaryDate = new Date(payload.previousSummaryDate).toISOString();
      } else if (!payload.previousSummaryDate) {
        delete payload.previousSummaryDate;
      }
      if (editing.id) {
        await adminFetch(`/api/admin/credit-rounds/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch(`/api/admin/customers/${customer.id}/credit-rounds`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setEditing(null);
      load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (rid: number) => {
    if (!confirm("Delete this round?")) return;
    await adminFetch(`/api/admin/credit-rounds/${rid}`, { method: "DELETE" });
    load();
  };

  if (loading && !customer) {
    return <div className="flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={18} /> Loading…</div>;
  }
  if (!customer) return <p className="text-red-400">{err || "Customer not found"}</p>;

  return (
    <div className="space-y-6">
      <Link to="/admin/customers" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 text-sm">
        <ArrowLeft size={14} /> All Customers
      </Link>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-2">
        <h1 className="text-2xl font-bold text-white">{customer.firstName} {customer.lastName}</h1>
        <p className="text-sm text-slate-400">{customer.email}</p>
        <div className="grid gap-3 sm:grid-cols-3 text-xs text-slate-400 pt-2">
          <div>Joined: <span className="text-slate-200">{new Date(customer.createdAt).toLocaleDateString()}</span></div>
          <div>Last login: <span className="text-slate-200">{customer.lastLoginAt ? new Date(customer.lastLoginAt).toLocaleDateString() : "—"}</span></div>
          <div>Submissions: <span className="text-slate-200">{customer.checkoutSubmissions.length}</span></div>
        </div>
      </div>

      {customer.checkoutSubmissions.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Checkout Submissions</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 text-xs">
                <th className="py-1">Date</th><th>Plan</th><th>Status</th><th>Months</th><th>Paid</th>
              </tr>
            </thead>
            <tbody>
              {customer.checkoutSubmissions.map((s) => (
                <tr key={s.id} className="border-t border-slate-800">
                  <td className="py-2 text-slate-300">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="text-slate-300 capitalize">{s.paymentPlan}</td>
                  <td className="text-slate-300">{s.paymentStatus}</td>
                  <td className="text-slate-300">{s.paymentPlan === "monthly" ? `${s.monthsBilled} / 6` : "—"}</td>
                  <td className="text-slate-300">{fmtMoney(s.totalPaidCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Credit Report Rounds</h2>
        <button onClick={openNew} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-500">
          <Plus size={16} /> New Round
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              <th className="px-4 py-3 text-left font-medium text-slate-400">Round</th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">Summary Date</th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">Equifax</th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">Experian</th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">TransUnion</th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">Deleted</th>
              <th className="px-4 py-3 text-right font-medium text-slate-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {customer.creditRounds.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No rounds yet.</td></tr>
            ) : (
              customer.creditRounds.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-white font-medium">#{r.roundNumber}</td>
                  <td className="px-4 py-3 text-slate-300">{new Date(r.summaryDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-300">{r.equifaxScore} <span className="text-xs text-slate-500">(prev {r.equifaxPrevScore})</span></td>
                  <td className="px-4 py-3 text-slate-300">{r.experianScore} <span className="text-xs text-slate-500">(prev {r.experianPrevScore})</span></td>
                  <td className="px-4 py-3 text-slate-300">{r.transunionScore} <span className="text-xs text-slate-500">(prev {r.transunionPrevScore})</span></td>
                  <td className="px-4 py-3 text-slate-300">{r.disputesDeletedGrandTotal}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(r)} className="rounded p-1.5 text-slate-300 hover:bg-slate-800"><Edit3 size={15} /></button>
                      <button onClick={() => remove(r.id)} className="rounded p-1.5 text-red-400 hover:bg-red-500/10"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">{editing.id ? `Edit Round #${editing.roundNumber}` : `New Round #${editing.roundNumber}`}</h3>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Round Number"><NumInput value={editing.roundNumber} onChange={(v) => setEditing({ ...editing, roundNumber: v })} /></Field>
              <Field label="Summary Date">
                <input type="date" value={editing.summaryDate as string || ""} onChange={(e) => setEditing({ ...editing, summaryDate: e.target.value })} className={inputCss} />
              </Field>
              <Field label="Previous Summary Date">
                <input type="date" value={(editing.previousSummaryDate as string) || ""} onChange={(e) => setEditing({ ...editing, previousSummaryDate: e.target.value || null })} className={inputCss} />
              </Field>
            </div>

            <div className="rounded-lg border border-slate-800 p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Bureau Scores (300–850)</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <BureauPair name="Equifax" score={editing.equifaxScore} prev={editing.equifaxPrevScore}
                  onScore={(v) => setEditing({ ...editing, equifaxScore: v })}
                  onPrev={(v) => setEditing({ ...editing, equifaxPrevScore: v })} />
                <BureauPair name="Experian" score={editing.experianScore} prev={editing.experianPrevScore}
                  onScore={(v) => setEditing({ ...editing, experianScore: v })}
                  onPrev={(v) => setEditing({ ...editing, experianPrevScore: v })} />
                <BureauPair name="TransUnion" score={editing.transunionScore} prev={editing.transunionPrevScore}
                  onScore={(v) => setEditing({ ...editing, transunionScore: v })}
                  onPrev={(v) => setEditing({ ...editing, transunionPrevScore: v })} />
              </div>
            </div>

            <div className="rounded-lg border border-slate-800 p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Changes Since Last Report</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500">
                    <th className="text-left pb-2">Category</th>
                    <th className="px-2 pb-2">This Round</th>
                    <th className="px-2 pb-2">Last Round</th>
                    <th className="px-2 pb-2">Grand Total</th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map((c) => (
                    <tr key={c.key} className="border-t border-slate-800">
                      <td className="py-2 text-slate-200">{c.label}</td>
                      <td className="px-2 py-2"><NumInput value={(editing as any)[`${c.key}ThisRound`]} onChange={(v) => setEditing({ ...editing, [`${c.key}ThisRound`]: v })} /></td>
                      <td className="px-2 py-2"><NumInput value={(editing as any)[`${c.key}LastRound`]} onChange={(v) => setEditing({ ...editing, [`${c.key}LastRound`]: v })} /></td>
                      <td className="px-2 py-2"><NumInput value={(editing as any)[`${c.key}GrandTotal`]} onChange={(v) => setEditing({ ...editing, [`${c.key}GrandTotal`]: v })} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Field label="Notes">
              <textarea value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} rows={3} className={inputCss} />
            </Field>

            {err && <p className="text-sm text-red-400">{err}</p>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50">
                {saving ? "Saving..." : "Save Round"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCss = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

function NumInput({ value, onChange }: { value: any; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      value={value ?? 0}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={inputCss}
    />
  );
}

function BureauPair({ name, score, prev, onScore, onPrev }: {
  name: string; score: any; prev: any;
  onScore: (v: number) => void; onPrev: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-300">{name}</p>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Current</label>
        <NumInput value={score} onChange={onScore} />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Previous</label>
        <NumInput value={prev} onChange={onPrev} />
      </div>
    </div>
  );
}
