import { useState, useEffect, useCallback } from "react";
import { useAdminAuth } from "../../hooks/useAdmin";
import { Save, RefreshCw, ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";

/* ── types ────────────────────────────────────────────────────── */
type SectionData = Record<string, any>;
type PageDataMap = Record<string, SectionData>;

/* ── page / section list ─────────────────────────────────────── */
const PAGES = [
  {
    page: "homepage",
    label: "Homepage",
    sections: ["hero", "statistics", "howItWorks", "leadForm", "security", "faq", "crossNav", "footer"],
  },
  {
    page: "checkout",
    label: "Checkout Page",
    sections: ["plans", "trust", "auth"],
  },
  {
    page: "media",
    label: "Media Library (images)",
    sections: ["assets"],
  },
];

/* ── field schema registry ───────────────────────────────────── */
type FT = "text" | "textarea" | "number" | "string-list" | "obj-list" | "image";
type FieldDef = { type: FT; label: string; fields?: Record<string, { type: "text" | "textarea" | "number"; label: string }>; itemLabel?: string; help?: string };
type Schema = Record<string, FieldDef>;

const t = (label: string): FieldDef => ({ type: "text", label });
const ta = (label: string): FieldDef => ({ type: "textarea", label });
const n = (label: string): FieldDef => ({ type: "number", label });
const sl = (label: string): FieldDef => ({ type: "string-list", label });
const img = (label: string, help?: string): FieldDef => ({ type: "image", label, help });
const ol = (label: string, itemLabel: string, fields: Record<string, { type: "text" | "textarea" | "number"; label: string }>): FieldDef => ({
  type: "obj-list",
  label,
  itemLabel,
  fields,
});

const SCHEMAS: Record<string, Schema> = {
  "homepage/hero": {
    eyebrow: t("Eyebrow"),
    headline: t("Headline (use *word* for italic accent)"),
    subheading: ta("Subheading"),
    primaryCta: t("Primary CTA Label"),
    secondaryCta: t("Secondary CTA Label"),
    kpis: ol("KPI Badges", "KPI", { value: { type: "text", label: "Value" }, label: { type: "text", label: "Label" } }),
  },
  "homepage/statistics": {
    eyebrow: t("Eyebrow"),
    heading: t("Heading"),
    stats: ol("Stats", "Stat", { value: { type: "number", label: "Value" }, suffix: { type: "text", label: "Suffix (e.g. +, days)" }, label: { type: "text", label: "Label" } }),
  },
  "homepage/howItWorks": {
    eyebrow: t("Eyebrow"),
    heading: t("Heading"),
    subheading: ta("Subheading"),
    steps: ol("Steps", "Step", { title: { type: "text", label: "Title" }, body: { type: "textarea", label: "Body" } }),
  },
  "homepage/leadForm": {
    eyebrow: t("Eyebrow"),
    heading: t("Heading"),
    subheading: ta("Subheading"),
    submitLabel: t("Submit Button Text"),
    successTitle: t("Success Title"),
    successBody: ta("Success Body"),
  },
  "homepage/security": {
    eyebrow: t("Eyebrow"),
    heading: t("Heading"),
    pillars: ol("Pillars", "Pillar", { title: { type: "text", label: "Title" }, body: { type: "textarea", label: "Body" } }),
  },
  "homepage/faq": {
    eyebrow: t("Eyebrow"),
    heading: t("Heading"),
    items: ol("FAQs", "FAQ", { question: { type: "text", label: "Question" }, answer: { type: "textarea", label: "Answer" } }),
  },
  "homepage/crossNav": {
    cards: ol("Cross-Nav Cards", "Card", { eyebrow: { type: "text", label: "Eyebrow" }, title: { type: "text", label: "Title" }, body: { type: "textarea", label: "Body" }, ctaLabel: { type: "text", label: "CTA Label" }, ctaHref: { type: "text", label: "CTA Href" } }),
  },
  "homepage/footer": {
    tagline: ta("Tagline"),
    contactEmail: t("Contact Email"),
    contactPhone: t("Contact Phone"),
    legalDisclaimer: ta("Legal Disclaimer"),
  },
  "checkout/plans": {
    eyebrow: t("Eyebrow"),
    heading: t("Heading"),
    subheading: ta("Subheading"),
    monthlyTitle: t("Monthly Plan Title"),
    monthlyDescription: ta("Monthly Description"),
    upfrontTitle: t("Upfront Plan Title"),
    upfrontDescription: ta("Upfront Description"),
  },
  "checkout/trust": {
    heading: t("Heading"),
    points: sl("Trust Points"),
  },
  "checkout/auth": {
    heading: t("Heading"),
    bodyTemplate: ta("Authorization Body Template (placeholders: {fullName}, {date}, {address})"),
    consentLabel: ta("Consent Checkbox Label"),
  },

  // ── Media library — every image slot site-wide ──────────────
  "media/assets": {
    navLogo:             img("Header Logo",                   "Shown in the top navigation on every page (use a transparent PNG/SVG for best results)"),
    footerLogo:          img("Footer Logo",                   "Shown in the dark footer (the site auto-inverts dark/light)"),
    homeHero:            img("Homepage — Hero portrait",      "Right-side image on the homepage hero"),
    homeSecurity:        img("Homepage — Security banner",    "Bank-vault / security visual"),
    homeSocialProof:     img("Homepage — Social proof bg",    "Wide cream-paper texture background"),
    homeFaq:             img("Homepage — FAQ decoration",      "Editorial still-life beside the FAQ block"),
    checkoutHero:        img("Checkout — Hero",                "Editorial flat-lay above the checkout form"),
    checkoutStep1:       img("Checkout — Step 1 (Submit)",     "Process step #1 illustration"),
    checkoutStep2:       img("Checkout — Step 2 (Dispute)",    "Process step #2 illustration"),
    checkoutStep3:       img("Checkout — Step 3 (Pay)",        "Process step #3 illustration"),
    checkoutSecurity:    img("Checkout — Security visual",     "Leather portfolio / wax seal still-life"),
    newsHero:            img("News — List page hero",          "Wide private-library hero on /news"),
    newsArticleFallback: img("News — Default article cover",   "Used when an article has no cover image set"),
    accountLoginBg:      img("Account — Login background",     "Travertine wall image behind the customer login form"),
    accountEmpty:        img("Account — Empty dashboard art",  "Shown when the customer has no rounds yet"),
    errorPage:           img("404 / error page",               "Image for the not-found page"),
    paperTexture:        img("Global paper texture overlay",   "Subtle grain overlay (used as CSS background)"),
  },
};

/* ── main component ──────────────────────────────────────────── */
export default function ContentManager() {
  const { token } = useAdminAuth();
  const [pageData, setPageData] = useState<Record<string, PageDataMap>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editData, setEditData] = useState<SectionData>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const results: Record<string, PageDataMap> = {};
      for (const p of PAGES) {
        const res = await fetch(`/api/admin/page-content/${p.page}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) results[p.page] = await res.json();
      }
      setPageData(results);
    } catch {} finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const selectSection = (page: string, section: string) => {
    const key = `${page}/${section}`;
    if (expanded === key) { setExpanded(null); return; }
    setExpanded(key);
    const content = pageData[page]?.[section];
    setEditData(content && typeof content === "object" ? JSON.parse(JSON.stringify(content)) : {});
    setMsg("");
  };

  const set = useCallback((path: string, value: any) => {
    setEditData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (obj[keys[i]] === undefined) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const handleSave = async () => {
    if (!expanded || !token) return;
    const [page, section] = expanded.split("/");
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/page-content/${page}/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: editData }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMsg("Saved!");
      loadAll();
    } catch (e: any) {
      setMsg(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Manager</h1>
          <p className="text-sm text-slate-400 mt-1">Edit section content for all pages — each field is individually editable.</p>
        </div>
        <button onClick={loadAll} disabled={loading} className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="h-40 rounded-xl bg-slate-800 animate-pulse" />
      ) : (
        <div className="space-y-4">
          {PAGES.map((p) => (
            <div key={p.page} className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/80">
                <h2 className="text-base font-semibold text-white">{p.label}</h2>
              </div>
              <div className="divide-y divide-slate-800">
                {p.sections.map((section) => {
                  const key = `${p.page}/${section}`;
                  const isOpen = expanded === key;
                  const schema = SCHEMAS[key];
                  return (
                    <div key={section}>
                      <button onClick={() => selectSection(p.page, section)} className="flex w-full items-center justify-between px-5 py-3 text-sm text-left hover:bg-slate-800/50 transition">
                        <span className="font-medium text-slate-200">{section}</span>
                        {isOpen ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 space-y-4">
                          {schema ? (
                            Object.entries(schema).map(([fieldKey, fieldDef]) => (
                              <FieldRenderer key={fieldKey} fieldKey={fieldKey} def={fieldDef} data={editData} set={set} />
                            ))
                          ) : (
                            <FallbackEditor data={editData} onChange={setEditData} />
                          )}
                          <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">
                              <Save size={16} /> {saving ? "Saving..." : "Save Section"}
                            </button>
                            {msg && <span className={`text-sm ${msg === "Saved!" ? "text-emerald-400" : "text-red-400"}`}>{msg}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Field renderers
   ═══════════════════════════════════════════════════════════════ */

const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none";

function FieldRenderer({ fieldKey, def, data, set }: { fieldKey: string; def: FieldDef; data: SectionData; set: (path: string, val: any) => void }) {
  const value = data[fieldKey];

  if (def.type === "text") {
    return (
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">{def.label}</label>
        <input value={value ?? ""} onChange={(e) => set(fieldKey, e.target.value)} className={inputCls} />
      </div>
    );
  }

  if (def.type === "textarea") {
    return (
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">{def.label}</label>
        <textarea value={value ?? ""} onChange={(e) => set(fieldKey, e.target.value)} rows={3} className={inputCls + " resize-y"} />
      </div>
    );
  }

  if (def.type === "number") {
    return (
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">{def.label}</label>
        <input type="number" value={value ?? 0} onChange={(e) => set(fieldKey, Number(e.target.value))} className={inputCls + " max-w-xs"} />
      </div>
    );
  }

  if (def.type === "image") {
    return (
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">{def.label}</label>
        {def.help && <p className="text-[11px] text-slate-500 mb-2">{def.help}</p>}
        <ImagePicker value={value} onChange={(v) => set(fieldKey, v)} />
      </div>
    );
  }

  if (def.type === "string-list") {
    const items: string[] = Array.isArray(value) ? value : [];
    const upd = (i: number, v: string) => { const n = [...items]; n[i] = v; set(fieldKey, n); };
    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-400">{def.label}</label>
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-xs text-slate-600 mt-2.5 w-5 shrink-0 text-right">{i + 1}.</span>
            <input value={item} onChange={(e) => upd(i, e.target.value)} className={inputCls + " flex-1"} />
            <button onClick={() => set(fieldKey, items.filter((_, idx) => idx !== i))} className="mt-1.5 text-red-400 hover:text-red-300 shrink-0"><Trash2 size={15} /></button>
          </div>
        ))}
        <button onClick={() => set(fieldKey, [...items, ""])} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"><Plus size={14} /> Add item</button>
      </div>
    );
  }

  if (def.type === "obj-list" && def.fields) {
    const items: any[] = Array.isArray(value) ? value : [];
    const fieldEntries = Object.entries(def.fields);

    // Case studies stats have a `text` field that's actually an array
    const isCaseStudyStats = fieldEntries.length === 1 && fieldEntries[0][0] === "text";

    const upd = (i: number, k: string, v: any) => {
      const next = items.map((it, idx) => (idx === i ? { ...it, [k]: v } : it));
      set(fieldKey, next);
    };

    const emptyItem = () => {
      const obj: Record<string, any> = {};
      for (const [k, fd] of fieldEntries) {
        if (isCaseStudyStats && k === "text") obj[k] = [];
        else if (fd.type === "number") obj[k] = 0;
        else obj[k] = "";
      }
      return obj;
    };

    return (
      <div className="space-y-3">
        <label className="block text-xs font-medium text-slate-400">{def.label}</label>
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{def.itemLabel} #{i + 1}</span>
              <button onClick={() => set(fieldKey, items.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
            </div>
            {isCaseStudyStats ? (
              <CaseStudyStatLines lines={Array.isArray(item.text) ? item.text : []} onChange={(lines) => upd(i, "text", lines)} />
            ) : (
              fieldEntries.map(([k, fd]) => (
                <div key={k}>
                  <label className="block text-xs text-slate-500 mb-0.5">{fd.label}</label>
                  {fd.type === "textarea" ? (
                    <textarea value={item[k] ?? ""} onChange={(e) => upd(i, k, e.target.value)} rows={2} className={inputCls + " resize-y"} />
                  ) : fd.type === "number" ? (
                    <input type="number" value={item[k] ?? 0} onChange={(e) => upd(i, k, Number(e.target.value))} className={inputCls + " max-w-xs"} />
                  ) : (
                    <input value={item[k] ?? ""} onChange={(e) => upd(i, k, e.target.value)} className={inputCls} />
                  )}
                </div>
              ))
            )}
          </div>
        ))}
        <button onClick={() => set(fieldKey, [...items, emptyItem()])} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
          <Plus size={14} /> Add {def.itemLabel}
        </button>
      </div>
    );
  }

  return null;
}

/* Image picker — file upload + manual URL */
function ImagePicker({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const { token } = useAdminAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setBusy(true); setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const j = await res.json();
      onChange(j.path);
    } catch (ex: any) {
      setErr(ex.message || "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex gap-3 items-start">
      <div className="shrink-0 w-32 h-32 rounded-md border border-slate-700 bg-slate-800 overflow-hidden flex items-center justify-center">
        {value ? (
          <img
            src={value}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <span className="text-xs text-slate-600">no image</span>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/example.jpg"
          className={inputCls}
        />
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs text-slate-200 cursor-pointer">
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            {busy ? "Uploading…" : "Upload new file"}
          </label>
          {value && (
            <button type="button" onClick={() => onChange("")} className="text-xs text-red-400 hover:text-red-300">Clear</button>
          )}
          {err && <span className="text-xs text-red-400">{err}</span>}
        </div>
      </div>
    </div>
  );
}

/* Case study stats have text as string[] */
function CaseStudyStatLines({ lines, onChange }: { lines: string[]; onChange: (v: string[]) => void }) {
  const upd = (i: number, v: string) => { const n = [...lines]; n[i] = v; onChange(n); };
  return (
    <div className="space-y-1.5">
      <label className="block text-xs text-slate-500">Text Lines</label>
      {lines.map((line, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input value={line} onChange={(e) => upd(i, e.target.value)} className={inputCls + " flex-1"} />
          <button onClick={() => onChange(lines.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={() => onChange([...lines, ""])} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"><Plus size={14} /> Add line</button>
    </div>
  );
}

/* Fallback for sections with no schema */
function FallbackEditor({ data, onChange }: { data: SectionData; onChange: (v: SectionData) => void }) {
  const [raw, setRaw] = useState(JSON.stringify(data, null, 2));
  useEffect(() => { setRaw(JSON.stringify(data, null, 2)); }, [data]);
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">Raw JSON (no schema available)</label>
      <textarea
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          try { onChange(JSON.parse(e.target.value)); } catch {}
        }}
        rows={14}
        className={inputCls + " font-mono resize-y"}
      />
    </div>
  );
}
