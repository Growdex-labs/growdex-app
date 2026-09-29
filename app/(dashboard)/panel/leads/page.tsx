"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Download, LayoutGrid, List, Loader2, Mail, Phone, Plus, RefreshCw, Search, SlidersHorizontal, Trash2, TrendingUp, Users, X } from "lucide-react";
import { PanelLayout } from "../components/panel-layout";
import { createLead, deleteLead, fetchLeads, fetchLeadSummary, LEAD_STATUSES, syncMetaInstantFormLeads, updateLead, type Lead, type LeadStatus, type LeadSummary } from "@/lib/leads";

const STATUS_LABEL: Record<LeadStatus, string> = { new: "New", contacted: "Contacted", qualified: "Qualified", converted: "Converted", lost: "Lost" };
const STATUS_STYLE: Record<LeadStatus, string> = {
  new: "bg-blue-50 text-blue-700", contacted: "bg-amber-50 text-amber-700",
  qualified: "bg-violet-50 text-violet-700", converted: "bg-emerald-50 text-emerald-700",
  lost: "bg-gray-100 text-gray-600",
};
const EMPTY_SUMMARY: LeadSummary = { total: 0, new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0, totalValue: 0 };
const initials = (name: string) => name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
const formatValue = (lead: Lead) => new Intl.NumberFormat(undefined, { style: "currency", currency: lead.currency || "USD", maximumFractionDigits: 0 }).format(lead.value);

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [view, setView] = useState<"list" | "board">("list");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingMeta, setSyncingMeta] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, totals] = await Promise.all([
        fetchLeads({ search: search || undefined, status: status === "all" ? undefined : status }),
        fetchLeadSummary(),
      ]);
      setLeads(list.leads);
      setSummary(totals);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not load leads.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { void load(); }, [load]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      await createLead({
        name: String(data.get("name") ?? "").trim(), email: String(data.get("email") ?? "").trim(),
        company: String(data.get("company") ?? "").trim() || undefined,
        phone: String(data.get("phone") ?? "").trim() || undefined,
        source: String(data.get("source") ?? "manual").trim(),
        campaignId: String(data.get("campaignId") ?? "").trim() || undefined,
        value: Number(data.get("value") || 0), currency: String(data.get("currency") || "USD"),
      });
      setShowAdd(false);
      await load();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not add lead.");
    } finally { setSaving(false); }
  };

  const handleStatus = async (lead: Lead, nextStatus: LeadStatus) => {
    const previous = lead.status;
    setLeads((rows) => rows.map((row) => row.id === lead.id ? { ...row, status: nextStatus } : row));
    setSelected((current) => current?.id === lead.id ? { ...current, status: nextStatus } : current);
    try {
      const saved = await updateLead(lead.id, { status: nextStatus });
      setLeads((rows) => rows.map((row) => row.id === saved.id ? saved : row));
      void fetchLeadSummary().then(setSummary);
    } catch (failure) {
      setLeads((rows) => rows.map((row) => row.id === lead.id ? { ...row, status: previous } : row));
      setError(failure instanceof Error ? failure.message : "Could not update lead.");
    }
  };

  const handleEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      const saved = await updateLead(editing.id, {
        name: String(data.get("name") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
        company: String(data.get("company") ?? "").trim(),
        phone: String(data.get("phone") ?? "").trim(),
        source: String(data.get("source") ?? "").trim(),
        campaignId: String(data.get("campaignId") ?? "").trim(),
        value: Number(data.get("value") || 0),
        currency: String(data.get("currency") || "USD"),
      });
      setLeads((rows) => rows.map((row) => row.id === saved.id ? saved : row));
      setSelected(saved);
      setEditing(null);
      void fetchLeadSummary().then(setSummary);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not update lead.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lead: Lead) => {
    if (!window.confirm(`Delete ${lead.name}? This cannot be undone.`)) return;
    setSaving(true);
    try { await deleteLead(lead.id); setSelected(null); await load(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Could not delete lead."); }
    finally { setSaving(false); }
  };

  const handleMetaSync = async () => {
    setSyncingMeta(true);
    setSyncMessage(null);
    setError(null);
    try {
      const result = await syncMetaInstantFormLeads();
      setSyncMessage(
        result.imported || result.updated
          ? `Meta sync complete: ${result.imported} imported and ${result.updated} updated.`
          : "Meta forms are up to date. No new submissions were found.",
      );
      await load();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not sync Meta leads.");
    } finally {
      setSyncingMeta(false);
    }
  };

  const exportCsv = () => {
    const rows = [["Name", "Company", "Email", "Phone", "Source", "Campaign", "Status", "Value"], ...leads.map((lead) => [lead.name, lead.company || "", lead.email, lead.phone || "", lead.source || "", lead.campaign?.name || lead.campaignId || "", STATUS_LABEL[lead.status], String(lead.value)])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = Object.assign(document.createElement("a"), { href: url, download: "growdex-leads.csv" });
    anchor.click(); URL.revokeObjectURL(url);
  };

  return <PanelLayout>
    <main className="min-h-full bg-[#f7f7f5] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm text-gray-500">Workspace / Leads centre</p><h1 className="mt-2 text-3xl font-gilroy-bold text-gray-950">Leads centre</h1><p className="mt-2 text-sm text-gray-500">Capture, organise and move every prospect towards conversion.</p></div>
          <div className="flex flex-wrap gap-2"><button onClick={() => void handleMetaSync()} disabled={syncingMeta} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm disabled:opacity-50"><RefreshCw className={`size-4 ${syncingMeta ? "animate-spin" : ""}`} />{syncingMeta ? "Syncing Meta…" : "Sync Meta leads"}</button><button onClick={exportCsv} disabled={!leads.length} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm disabled:opacity-40"><Download className="size-4" />Export</button><button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-xl bg-[#292929] px-4 py-2.5 text-sm text-white"><Plus className="size-4" />Add lead</button></div>
        </header>

        {error && <div role="alert" className="mt-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button onClick={() => setError(null)} aria-label="Dismiss"><X className="size-4" /></button></div>}
        {syncMessage && <div role="status" className="mt-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><span>{syncMessage}</span><button onClick={() => setSyncMessage(null)} aria-label="Dismiss"><X className="size-4" /></button></div>}

        <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total leads" value={summary.total} note="All captured prospects" icon={<Users />} />
          <Metric label="New" value={summary.new} note="Waiting for first contact" icon={<Plus />} />
          <Metric label="Qualified" value={summary.qualified} note="Ready for follow-up" icon={<TrendingUp />} />
          <Metric label="Pipeline value" value={new Intl.NumberFormat(undefined, { notation: "compact", style: "currency", currency: "USD" }).format(summary.totalValue)} note={`${summary.converted} converted`} icon={<TrendingUp />} />
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b p-5 lg:flex-row lg:items-center lg:justify-between">
            <div><h2 className="text-lg font-gilroy-semibold">All leads</h2><p className="text-xs text-gray-500">{leads.length} records shown</p></div>
            <div className="flex flex-col gap-2 sm:flex-row"><label className="flex items-center gap-2 rounded-xl border bg-gray-50 px-3 sm:w-72"><Search className="size-4 text-gray-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search leads..." className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><label className="flex items-center gap-2 rounded-xl border px-3 text-sm"><SlidersHorizontal className="size-4" /><select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus | "all")} className="h-10 bg-transparent outline-none"><option value="all">All statuses</option>{LEAD_STATUSES.map((item) => <option key={item} value={item}>{STATUS_LABEL[item]}</option>)}</select></label><div className="flex rounded-xl border p-1"><button onClick={() => setView("list")} aria-label="List view" className={`rounded-lg p-2 ${view === "list" ? "bg-gray-900 text-white" : "text-gray-400"}`}><List className="size-4" /></button><button onClick={() => setView("board")} aria-label="Board view" className={`rounded-lg p-2 ${view === "board" ? "bg-gray-900 text-white" : "text-gray-400"}`}><LayoutGrid className="size-4" /></button></div></div>
          </div>
          {loading ? <div className="flex h-64 items-center justify-center"><Loader2 className="size-7 animate-spin text-gray-400" /></div> : !leads.length ? <div className="py-20 text-center"><Users className="mx-auto size-8 text-gray-300" /><p className="mt-3 font-gilroy-semibold">No leads found</p><p className="mt-1 text-sm text-gray-500">Add your first lead or change the current filters.</p></div> : view === "list" ? <LeadTable leads={leads} onSelect={setSelected} onStatus={handleStatus} /> : <LeadBoard leads={leads} onSelect={setSelected} />}
        </section>
      </div>
    </main>

    {showAdd && <Modal title="Add a new lead" description="Save a prospect to your Growdex pipeline." onClose={() => setShowAdd(false)}><form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2"><Field label="Full name" name="name" required /><Field label="Work email" name="email" type="email" required /><Field label="Company" name="company" /><Field label="Phone number" name="phone" /><Field label="Source" name="source" placeholder="Instagram, referral..." /><Field label="Campaign ID" name="campaignId" /><Field label="Value" name="value" type="number" min="0" step="0.01" /><label className="text-sm text-gray-600">Currency<select name="currency" className="mt-1.5 h-11 w-full rounded-xl border px-3"><option>USD</option><option>NGN</option><option>GBP</option><option>EUR</option></select></label><div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={() => setShowAdd(false)} className="rounded-xl border px-4 py-2.5 text-sm">Cancel</button><button disabled={saving} className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm text-white disabled:opacity-50">{saving && <Loader2 className="size-4 animate-spin" />}Add lead</button></div></form></Modal>}
    {selected && <Modal title={selected.name} description={`${selected.company || "Independent"} · ${formatDate(selected.createdAt)}`} onClose={() => setSelected(null)}><div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4"><span className="flex size-12 items-center justify-center rounded-full bg-violet-100 font-gilroy-semibold text-violet-700">{initials(selected.name)}</span><div><p className="font-gilroy-semibold">{selected.name}</p><p className="text-sm text-gray-500">{formatValue(selected)}</p></div></div><div className="mt-5 space-y-3 text-sm"><a href={`mailto:${selected.email}`} className="flex items-center gap-3"><Mail className="size-4 text-gray-400" />{selected.email}</a>{selected.phone && <a href={`tel:${selected.phone}`} className="flex items-center gap-3"><Phone className="size-4 text-gray-400" />{selected.phone}</a>}</div><label className="mt-6 block text-sm text-gray-500">Pipeline status<select value={selected.status} onChange={(e) => void handleStatus(selected, e.target.value as LeadStatus)} className="mt-2 h-11 w-full rounded-xl border px-3">{LEAD_STATUSES.map((item) => <option key={item} value={item}>{STATUS_LABEL[item]}</option>)}</select></label><div className="mt-6 flex items-center justify-between"><button onClick={() => { setEditing(selected); setSelected(null); }} className="rounded-xl border px-4 py-2.5 text-sm">Edit details</button><button disabled={saving} onClick={() => void handleDelete(selected)} className="flex items-center gap-2 text-sm text-red-600"><Trash2 className="size-4" />Delete lead</button></div></Modal>}
    {editing && <Modal title="Edit lead" description="Update this prospect's contact and pipeline details." onClose={() => setEditing(null)}><form onSubmit={handleEdit} className="grid gap-4 sm:grid-cols-2"><Field label="Full name" name="name" defaultValue={editing.name} required /><Field label="Work email" name="email" type="email" defaultValue={editing.email} required /><Field label="Company" name="company" defaultValue={editing.company ?? ""} /><Field label="Phone number" name="phone" defaultValue={editing.phone ?? ""} /><Field label="Source" name="source" defaultValue={editing.source ?? ""} /><Field label="Campaign ID" name="campaignId" defaultValue={editing.campaignId ?? ""} /><Field label="Value" name="value" type="number" min="0" step="0.01" defaultValue={editing.value} /><label className="text-sm text-gray-600">Currency<select name="currency" defaultValue={editing.currency || "USD"} className="mt-1.5 h-11 w-full rounded-xl border px-3"><option>USD</option><option>NGN</option><option>GBP</option><option>EUR</option></select></label><div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={() => setEditing(null)} className="rounded-xl border px-4 py-2.5 text-sm">Cancel</button><button disabled={saving} className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm text-white disabled:opacity-50">{saving && <Loader2 className="size-4 animate-spin" />}Save changes</button></div></form></Modal>}
  </PanelLayout>;
}

function Metric({ label, value, note, icon }: { label: string; value: string | number; note: string; icon: React.ReactNode }) { return <article className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex justify-between"><div><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-3xl font-gilroy-bold">{value}</p></div><span className="flex size-10 items-center justify-center rounded-xl bg-[#fff5ad] [&>svg]:size-5">{icon}</span></div><p className="mt-4 text-xs text-gray-500">{note}</p></article>; }
function LeadTable({ leads, onSelect, onStatus }: { leads: Lead[]; onSelect: (lead: Lead) => void; onStatus: (lead: Lead, status: LeadStatus) => void }) { return <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead><tr className="border-b bg-gray-50 text-xs uppercase text-gray-400"><th className="px-5 py-3 font-medium">Lead</th><th className="px-5 py-3 font-medium">Source</th><th className="px-5 py-3 font-medium">Campaign</th><th className="px-5 py-3 font-medium">Value</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Added</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id} className="border-b last:border-0 hover:bg-gray-50"><td className="px-5 py-4"><button onClick={() => onSelect(lead)} className="flex items-center gap-3 text-left"><span className="flex size-10 items-center justify-center rounded-full bg-violet-100 text-sm text-violet-700">{initials(lead.name)}</span><span><b className="block font-gilroy-semibold">{lead.name}</b><small className="text-gray-500">{lead.email}</small></span></button></td><td className="px-5 py-4 text-sm text-gray-600">{lead.source || "—"}</td><td className="px-5 py-4 text-sm text-gray-600">{lead.campaign?.name || "—"}</td><td className="px-5 py-4 text-sm font-gilroy-semibold">{formatValue(lead)}</td><td className="px-5 py-4"><select value={lead.status} onChange={(e) => onStatus(lead, e.target.value as LeadStatus)} aria-label={`Status for ${lead.name}`} className={`rounded-full px-3 py-1 text-xs outline-none ${STATUS_STYLE[lead.status]}`}>{LEAD_STATUSES.map((item) => <option key={item} value={item}>{STATUS_LABEL[item]}</option>)}</select></td><td className="px-5 py-4 text-sm text-gray-500">{formatDate(lead.createdAt)}</td></tr>)}</tbody></table></div>; }
function LeadBoard({ leads, onSelect }: { leads: Lead[]; onSelect: (lead: Lead) => void }) { return <div className="grid min-w-[1100px] grid-cols-5 gap-3 overflow-x-auto bg-gray-50 p-4">{LEAD_STATUSES.map((status) => <div key={status}><div className="mb-3 flex justify-between text-sm font-gilroy-semibold"><span>{STATUS_LABEL[status]}</span><span>{leads.filter((lead) => lead.status === status).length}</span></div><div className="space-y-3">{leads.filter((lead) => lead.status === status).map((lead) => <button key={lead.id} onClick={() => onSelect(lead)} className="w-full rounded-xl border bg-white p-4 text-left shadow-sm"><p className="font-gilroy-semibold">{lead.name}</p><p className="mt-1 truncate text-xs text-gray-500">{lead.company || lead.email}</p><p className="mt-3 text-sm font-gilroy-semibold">{formatValue(lead)}</p></button>)}</div></div>)}</div>; }
function Modal({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: React.ReactNode }) { return <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex justify-between"><div><h2 className="text-xl font-gilroy-bold">{title}</h2><p className="mt-1 text-sm text-gray-500">{description}</p></div><button onClick={onClose} aria-label="Close"><X className="size-5" /></button></div><div className="mt-6">{children}</div></div></div>; }
function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="text-sm text-gray-600">{label}<input {...props} className="mt-1.5 h-11 w-full rounded-xl border px-3 outline-none focus:border-gray-500" /></label>; }
