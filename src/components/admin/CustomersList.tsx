import { Link } from "react-router-dom";
import { useAdminApi, type CustomerUser } from "../../hooks/useAdmin";
import { RefreshCw, ArrowRight } from "lucide-react";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(iso));
  } catch { return iso; }
}

export default function CustomersList() {
  const { data, loading, reload } = useAdminApi<CustomerUser[]>("/api/admin/customers");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-sm text-slate-400 mt-1">{data?.length ?? 0} active customer accounts</p>
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              <th className="px-4 py-3 text-left font-medium text-slate-400">Name</th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">Email</th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">Joined</th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">Last Login</th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">Submissions</th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">Rounds</th>
              <th className="px-4 py-3 text-right font-medium text-slate-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {!data?.length ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">{loading ? "Loading..." : "No customers yet."}</td></tr>
            ) : (
              data.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-white font-medium">{c.firstName} {c.lastName}</td>
                  <td className="px-4 py-3 text-slate-300">{c.email}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(c.lastLoginAt)}</td>
                  <td className="px-4 py-3 text-slate-300">{c._count?.checkoutSubmissions ?? 0}</td>
                  <td className="px-4 py-3 text-slate-300">{c._count?.creditRounds ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/customers/${c.id}`} className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm">
                      Manage <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
