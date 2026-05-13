import { useAdminApi, type AuditLog } from "../../hooks/useAdmin";
import { RefreshCw, ShieldAlert } from "lucide-react";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch { return iso; }
}

const ACTION_COLOR: Record<string, string> = {
  decrypt: "bg-amber-500/20 text-amber-300",
  download: "bg-blue-500/20 text-blue-300",
  view: "bg-slate-500/20 text-slate-300",
};

export default function AuditLogs() {
  const { data, loading, reload } = useAdminApi<AuditLog[]>("/api/admin/audit-logs");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-amber-400" size={24} />
          <div>
            <h1 className="text-2xl font-bold text-white">PII Access Audit Log</h1>
            <p className="text-sm text-slate-400 mt-1">
              Every SSN reveal and document download is recorded here. {data?.length ?? 0} events.
            </p>
          </div>
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
                <th className="px-4 py-3 text-left font-medium text-slate-400">When</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Admin</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Client</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Field</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">Action</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">IP</th>
                <th className="px-4 py-3 text-left font-medium text-slate-400">User Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {!data?.length ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">{loading ? "Loading..." : "No audit events yet."}</td></tr>
              ) : (
                data.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3 text-white">{log.adminUser?.email || `#${log.adminUserId}`}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {log.checkoutSubmission ? `${log.checkoutSubmission.firstName} ${log.checkoutSubmission.lastName}` : `#${log.checkoutSubmissionId}`}
                      <span className="block text-xs text-slate-500">{log.checkoutSubmission?.email}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{log.field}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ACTION_COLOR[log.action] || "bg-slate-700 text-slate-300"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{log.ip || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate" title={log.userAgent || ""}>{log.userAgent || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
