import { useState } from "react";
import { useAdminApi, useAdminFetch, useAdminUpload, type NewsArticle } from "../../hooks/useAdmin";
import { Plus, Edit3, Trash2, RefreshCw, Eye, EyeOff, X, Upload, Loader2 } from "lucide-react";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 200);

type Form = Partial<NewsArticle>;

const empty: Form = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  author: "",
  published: false,
};

export default function NewsManager() {
  const { data, loading, reload } = useAdminApi<NewsArticle[]>("/api/admin/news");
  const adminFetch = useAdminFetch();
  const upload = useAdminUpload();
  const [editing, setEditing] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  const open = (article?: NewsArticle) => {
    setErr("");
    setEditing(article ? { ...article } : { ...empty });
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title || !editing.excerpt || !editing.content) {
      setErr("Title, excerpt and content are required.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const slug = (editing.slug && editing.slug.trim()) || slugify(editing.title!);
      const payload = { ...editing, slug };
      if (editing.id) {
        await adminFetch(`/api/admin/news/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch(`/api/admin/news`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setEditing(null);
      reload();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this article?")) return;
    await adminFetch(`/api/admin/news/${id}`, { method: "DELETE" });
    reload();
  };

  const togglePublish = async (a: NewsArticle) => {
    await adminFetch(`/api/admin/news/${a.id}`, {
      method: "PUT",
      body: JSON.stringify({ published: !a.published, publishedAt: !a.published ? new Date().toISOString() : a.publishedAt }),
    });
    reload();
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await upload(file);
      setEditing((p) => (p ? { ...p, coverImageUrl: res.path } : p));
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">News Articles</h1>
          <p className="text-sm text-slate-400 mt-1">{data?.length ?? 0} articles</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reload} disabled={loading} className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button onClick={() => open()} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-500">
            <Plus size={16} /> New Article
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              <th className="px-4 py-3 text-left font-medium text-slate-400">Title</th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">Author</th>
              <th className="px-4 py-3 text-left font-medium text-slate-400">Published</th>
              <th className="px-4 py-3 text-right font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {!data?.length ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">{loading ? "Loading..." : "No articles yet."}</td></tr>
            ) : (
              data.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 text-white font-medium">{a.title}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{a.slug}</td>
                  <td className="px-4 py-3 text-slate-300">{a.author || "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublish(a)} className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs ${a.published ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700 text-slate-400"}`}>
                      {a.published ? <Eye size={12} /> : <EyeOff size={12} />}
                      {a.published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => open(a)} className="rounded p-1.5 text-slate-300 hover:bg-slate-800" title="Edit"><Edit3 size={15} /></button>
                      <button onClick={() => remove(a.id)} className="rounded p-1.5 text-red-400 hover:bg-red-500/10" title="Delete"><Trash2 size={15} /></button>
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
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{editing.id ? "Edit Article" : "New Article"}</h2>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title">
                <input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inputCss} />
              </Field>
              <Field label="Slug (auto-generated from title if blank)">
                <input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder={editing.title ? slugify(editing.title) : ""} className={inputCss + " font-mono"} />
              </Field>
              <Field label="Author">
                <input value={editing.author || ""} onChange={(e) => setEditing({ ...editing, author: e.target.value })} className={inputCss} />
              </Field>
              <Field label="Cover Image URL">
                <div className="flex gap-2">
                  <input value={editing.coverImageUrl || ""} onChange={(e) => setEditing({ ...editing, coverImageUrl: e.target.value })} className={inputCss} />
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer hover:bg-slate-700">
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    <span className="text-xs">Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                  </label>
                </div>
                {editing.coverImageUrl && <img src={editing.coverImageUrl} alt="" className="mt-2 h-32 rounded-lg object-cover" />}
              </Field>
            </div>

            <Field label="Excerpt (1–2 sentences shown on the index)">
              <textarea value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} rows={2} className={inputCss} />
            </Field>

            <Field label="Content (paragraphs separated by blank lines)">
              <textarea value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={14} className={inputCss + " font-mono text-xs"} />
            </Field>

            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked, publishedAt: e.target.checked ? new Date().toISOString() : editing.publishedAt })} />
              Published
            </label>

            {err && <p className="text-sm text-red-400">{err}</p>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
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
