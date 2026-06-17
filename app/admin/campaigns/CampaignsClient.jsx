"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import {
  PlusCircle, Edit2, Trash2, ToggleLeft, ToggleRight,
  X, Upload, Clock, BadgeCheck, Eye, EyeOff,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const EMPTY = {
  title: "", slug: "", description: "", goal_amount: "", current_amount: "0", cover_image_url: "",
  category: "general", active: true, featured: false, location: "",
  start_date: "", end_date: "",
  is_fundraiser: false, urgency_label: "Limited Time",
  poster_url: "", poster_drive_id: "",
  // ── New fields ──────────────────────────────────────────────────────────────
  show_public_stats: false,   // when true: show raised ₹ / goal / progress bar publicly
  is_completed:      false,   // when true: show "Mission Completed" badge, hide amounts
  // ────────────────────────────────────────────────────────────────────────────
};

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function daysLeft(end) {
  if (!end) return null;
  return Math.ceil((new Date(end) - new Date()) / (1000 * 60 * 60 * 24));
}

export default function CampaignsClient({ initialCampaigns }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [isPending, start]        = useTransition();
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const openCreate = () => { setForm({ ...EMPTY }); setModal("create"); };
  const openEdit   = (c) => {
    setForm({
      ...EMPTY, ...c,
      goal_amount:       String(c.goal_amount || ""),
      current_amount:    String(c.current_amount || "0"),
      start_date:        c.start_date?.split("T")[0] || "",
      end_date:          c.end_date?.split("T")[0] || "",
      show_public_stats: Boolean(c.show_public_stats),
      is_completed:      Boolean(c.is_completed),
    });
    setModal(c);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => {
      const updated = { ...f, [name]: type === "checkbox" ? checked : value };
      if (name === "title" && modal === "create") updated.slug = slugify(value);
      // If marking as completed, auto-hide public stats
      if (name === "is_completed" && checked) updated.show_public_stats = false;
      return updated;
    });
  };

  const handleImageUpload = async (e, field = "cover_image_url") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("purpose", "campaign");
      const res  = await fetch("/api/drive", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      if (field === "poster_url") {
        setForm(f => ({ ...f, poster_url: data.viewUrl, poster_drive_id: data.fileId }));
      } else {
        setForm(f => ({ ...f, cover_image_url: data.viewUrl }));
      }
      toast.success("Image uploaded ✓");
    } catch (err) { toast.error(err.message); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title || !form.goal_amount) { toast.error("Title and goal amount are required."); return; }
    if (form.is_fundraiser && !form.end_date) { toast.error("Fundraisers require an end date."); return; }
    if (form.current_amount !== "" && Number(form.current_amount) < 0) {
      toast.error("Received amount cannot be negative.");
      return;
    }
    start(async () => {
      const payload = {
        title:             form.title,
        slug:              form.slug || slugify(form.title),
        description:       form.description,
        goal_amount:       Number(form.goal_amount),
        cover_image_url:   form.cover_image_url,
        category:          form.category,
        active:            form.active,
        featured:          form.featured,
        location:          form.location,
        start_date:        form.start_date || null,
        end_date:          form.end_date || null,
        is_fundraiser:     form.is_fundraiser,
        urgency_label:     form.urgency_label || "Limited Time",
        poster_url:        form.poster_url || null,
        poster_drive_id:   form.poster_drive_id || null,
        // ── Visibility controls ──────────────────────────────────────────────
        show_public_stats: form.show_public_stats,
        is_completed:      form.is_completed,
        // ────────────────────────────────────────────────────────────────────
      };

      if (modal === "create") {
        // New campaigns always start at 0 raised — there's nothing to
        // manually set yet, current_amount only matters once a campaign
        // already exists and needs a correction (e.g. cash donations).
        const { data, error } = await supabase.from("campaigns").insert(payload).select().single();
        if (error) { toast.error(error.message); return; }
        setCampaigns(prev => [data, ...prev]);
        toast.success("Campaign created!");
      } else {
        // Edits can manually correct current_amount — e.g. to add cash
        // donations that didn't go through the online donate flow.
        payload.current_amount = Number(form.current_amount || 0);
        const { data, error } = await supabase.from("campaigns").update(payload).eq("id", modal.id).select().single();
        if (error) { toast.error(error.message); return; }
        setCampaigns(prev => prev.map(c => c.id === modal.id ? data : c));
        toast.success("Campaign updated!");
      }
      setModal(null);
    });
  };

  const handleToggle = async (c) => {
    const { data, error } = await supabase.from("campaigns").update({ active: !c.active }).eq("id", c.id).select().single();
    if (error) { toast.error(error.message); return; }
    setCampaigns(prev => prev.map(x => x.id === c.id ? data : x));
    toast.success(`Campaign ${data.active ? "activated" : "deactivated"}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this campaign? This cannot be undone.")) return;
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setCampaigns(prev => prev.filter(c => c.id !== id));
    toast.success("Campaign deleted.");
  };

  const regular     = campaigns.filter(c => !c.is_fundraiser);
  const fundraisers = campaigns.filter(c => c.is_fundraiser);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Campaigns</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Manage campaigns and time-limited fundraisers
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <PlusCircle className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* ── Fundraisers ── */}
      {fundraisers.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-secondary" />
            <h2 className="font-headline-md text-headline-md text-primary">Active Fundraisers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
            {fundraisers.map(c => {
              const pct  = Math.min(100, Math.round((c.current_amount / c.goal_amount) * 100)) || 0;
              const days = daysLeft(c.end_date);
              return (
                <div key={c.id} className="card flex flex-col border-secondary/30">
                  <div className="relative h-44 overflow-hidden">
                    {c.poster_url || c.cover_image_url ? (
                      <Image src={c.poster_url || c.cover_image_url} alt={c.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-surface-container flex items-center justify-center text-on-surface-variant font-caption text-caption">No Poster</div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-1 flex-wrap">
                      <span className="badge bg-secondary text-on-secondary">{c.urgency_label || "Limited Time"}</span>
                      {c.is_completed && <span className="badge bg-primary-fixed text-on-primary-fixed">Completed</span>}
                    </div>
                    {days !== null && !c.is_completed && (
                      <div className="absolute top-3 right-3">
                        <span className={`badge ${days <= 2 ? "bg-error text-on-error" : "bg-primary text-on-primary"}`}>
                          {days > 0 ? `${days}d left` : "Ended"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-1 line-clamp-2">{c.title}</h3>
                    {/* Stats visibility indicator */}
                    <div className="flex items-center gap-2 mb-2">
                      {c.show_public_stats && !c.is_completed ? (
                        <span className="flex items-center gap-1 text-caption text-secondary"><Eye className="w-3 h-3" /> Stats visible</span>
                      ) : (
                        <span className="flex items-center gap-1 text-caption text-on-surface-variant"><EyeOff className="w-3 h-3" /> Stats hidden</span>
                      )}
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant mb-3">
                      {c.start_date ? new Date(c.start_date).toLocaleDateString("en-IN") : "—"} → {c.end_date ? new Date(c.end_date).toLocaleDateString("en-IN") : "Open"}
                    </p>
                    <div className="mt-auto">
                      <div className="flex justify-between font-caption text-caption mb-1">
                        <span>₹{Number(c.current_amount).toLocaleString("en-IN")}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="progress-bar mb-3"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-surface-container rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => handleToggle(c)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-surface-container rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                          {c.active ? <ToggleRight className="w-3 h-3 text-secondary" /> : <ToggleLeft className="w-3 h-3" />}
                          {c.active ? "Pause" : "Resume"}
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 bg-error-container/30 text-on-error-container rounded-lg hover:bg-error-container transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Regular campaigns ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
        {regular.map(c => {
          const pct = Math.min(100, Math.round((c.current_amount / c.goal_amount) * 100)) || 0;
          return (
            <div key={c.id} className="card flex flex-col">
              <div className="relative h-44 overflow-hidden">
                {c.cover_image_url ? (
                  <Image src={c.cover_image_url} alt={c.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-surface-container flex items-center justify-center text-on-surface-variant font-caption text-caption">No Image</div>
                )}
                <div className="absolute top-3 right-3 flex gap-1 flex-wrap justify-end">
                  {c.is_completed
                    ? <span className="badge bg-primary-fixed text-on-primary-fixed flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Done</span>
                    : <span className={`badge ${c.active ? "bg-primary-fixed text-on-primary-fixed" : "badge-rejected"}`}>{c.active ? "Active" : "Inactive"}</span>
                  }
                  {c.featured && <span className="badge bg-secondary text-on-secondary">Featured</span>}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-1 line-clamp-2">{c.title}</h3>
                <p className="font-caption text-caption text-on-surface-variant capitalize mb-1">{c.category} · {c.location || "—"}</p>
                {/* Stats visibility indicator */}
                <div className="flex items-center gap-1 mb-3">
                  {c.show_public_stats && !c.is_completed ? (
                    <span className="flex items-center gap-1 text-caption text-secondary"><Eye className="w-3 h-3" /> Stats visible to public</span>
                  ) : (
                    <span className="flex items-center gap-1 text-caption text-on-surface-variant"><EyeOff className="w-3 h-3" /> Stats hidden from public</span>
                  )}
                </div>
                <div className="mt-auto">
                  <div className="flex justify-between font-caption text-caption mb-1">
                    <span>₹{Number(c.current_amount).toLocaleString("en-IN")}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="progress-bar mb-3"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-surface-container rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => handleToggle(c)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-surface-container rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                      {c.active ? <ToggleRight className="w-3 h-3 text-secondary" /> : <ToggleLeft className="w-3 h-3" />}
                      {c.active ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 bg-error-container/30 text-on-error-container rounded-lg hover:bg-error-container transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Create / Edit Modal ── */}
      {modal && (
        <div
          className="fixed inset-0 bg-primary/60 z-50 flex items-start justify-center p-4 pt-10 overflow-auto"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant max-w-xl w-full p-8 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-headline-md text-headline-md text-primary">
                {modal === "create" ? "New Campaign" : "Edit Campaign"}
              </h2>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-on-surface-variant" /></button>
            </div>

            {/* Fundraiser toggle */}
            <label className="flex items-center gap-3 p-3 bg-secondary-fixed/30 rounded-lg cursor-pointer border border-secondary/20">
              <input type="checkbox" name="is_fundraiser" checked={form.is_fundraiser} onChange={handleChange} className="text-secondary w-4 h-4" />
              <div>
                <span className="font-label-md text-label-md text-primary block">Time-Limited Fundraiser</span>
                <span className="font-caption text-caption text-on-surface-variant">Shows countdown timer, accepts a poster</span>
              </div>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="form-label">Title *</label>
                <input name="title" className="form-input" value={form.title} onChange={handleChange} placeholder="e.g. Eid Food Drive 2026" />
              </div>
              <div>
                <label className="form-label">Slug (URL)</label>
                <input name="slug" className="form-input text-sm font-mono" value={form.slug} onChange={handleChange} />
              </div>
              <div>
                <label className="form-label">Category</label>
                <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                  {["general","medical","food","grocery","education","orphanage"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Goal Amount (₹) *</label>
                <input name="goal_amount" type="number" onWheel={e => e.target.blur()} className="form-input" value={form.goal_amount} onChange={handleChange} />
              </div>
              {modal !== "create" && (
                <div>
                  <label className="form-label flex items-center gap-1.5">
                    Received Amount (₹)
                    <span className="font-caption text-caption text-on-surface-variant font-normal">— manual override</span>
                  </label>
                  <input name="current_amount" type="number" min="0" onWheel={e => e.target.blur()} className="form-input" value={form.current_amount} onChange={handleChange} />
                  <p className="font-caption text-caption text-on-surface-variant mt-1">
                    Normally updates automatically when donations are approved. Edit this directly to add cash or offline donations — the progress bar and percentage recalculate immediately.
                  </p>
                </div>
              )}
              <div>
                <label className="form-label">Location</label>
                <input name="location" className="form-input" value={form.location} onChange={handleChange} placeholder="e.g. Visakhapatnam" />
              </div>

              {/* Cover image */}
              <div className="sm:col-span-2">
                <label className="form-label">Cover Image</label>
                <div className="flex gap-2">
                  <input name="cover_image_url" className="form-input flex-1 text-sm" value={form.cover_image_url} onChange={handleChange} placeholder="Paste URL or upload →" />
                  <label className="btn-primary cursor-pointer whitespace-nowrap">
                    <Upload className="w-4 h-4" />
                    {uploading ? "Uploading…" : "Upload"}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, "cover_image_url")} disabled={uploading} />
                  </label>
                </div>
                {form.cover_image_url && (
                  <div className="mt-2 relative h-24 w-full rounded-lg overflow-hidden border border-outline-variant">
                    <Image src={form.cover_image_url} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              {/* Fundraiser-specific fields */}
              {form.is_fundraiser && (
                <>
                  <div>
                    <label className="form-label">Start Date</label>
                    <input name="start_date" type="date" className="form-input" value={form.start_date} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="form-label">End Date *</label>
                    <input name="end_date" type="date" className="form-input" value={form.end_date} onChange={handleChange} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Urgency Label</label>
                    <input name="urgency_label" className="form-input" value={form.urgency_label} onChange={handleChange} placeholder="e.g. Ramadan Drive · 3 Days Only" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Fundraiser Poster</label>
                    <div className="flex gap-2">
                      <input name="poster_url" className="form-input flex-1 text-sm" value={form.poster_url} onChange={handleChange} placeholder="Paste URL or upload →" />
                      <label className="btn-primary cursor-pointer whitespace-nowrap">
                        <Upload className="w-4 h-4" />
                        {uploading ? "Uploading…" : "Upload Poster"}
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, "poster_url")} disabled={uploading} />
                      </label>
                    </div>
                    {form.poster_url && (
                      <div className="mt-2 relative h-32 w-full rounded-lg overflow-hidden border border-outline-variant">
                        <Image src={form.poster_url} alt="Poster preview" fill className="object-contain bg-surface-container" />
                      </div>
                    )}
                  </div>
                </>
              )}

              {!form.is_fundraiser && (
                <div>
                  <label className="form-label">End Date (optional)</label>
                  <input name="end_date" type="date" className="form-input" value={form.end_date} onChange={handleChange} />
                </div>
              )}

              {/* ── Visibility & Status checkboxes ───────────────────────────── */}
              <div className="sm:col-span-2 space-y-3 pt-2 border-t border-outline-variant/30">
                <p className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Visibility & Status</p>

                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-outline-variant/40 hover:bg-surface-container/50 transition-colors">
                  <input
                    type="checkbox" name="is_completed" checked={form.is_completed}
                    onChange={handleChange} className="mt-0.5 text-secondary w-4 h-4 flex-shrink-0"
                  />
                  <div>
                    <span className="font-body-md text-body-md text-on-surface block">Mark as Completed</span>
                    <span className="font-caption text-caption text-on-surface-variant">
                      Shows "Mission Completed" badge publicly. Hides all amounts. Donate button still visible.
                    </span>
                  </div>
                </label>

                <label className={[
                  "flex items-start gap-3 cursor-pointer p-3 rounded-lg border transition-colors",
                  form.is_completed
                    ? "opacity-40 pointer-events-none border-outline-variant/20"
                    : "border-outline-variant/40 hover:bg-surface-container/50",
                ].join(" ")}>
                  <input
                    type="checkbox" name="show_public_stats" checked={form.show_public_stats}
                    onChange={handleChange} disabled={form.is_completed}
                    className="mt-0.5 text-secondary w-4 h-4 flex-shrink-0"
                  />
                  <div>
                    <span className="font-body-md text-body-md text-on-surface block">Show fundraising details to public</span>
                    <span className="font-caption text-caption text-on-surface-variant">
                      Displays raised amount, goal, and progress bar on the public campaign page.
                      Leave unchecked to hide all numbers.
                    </span>
                  </div>
                </label>
              </div>
              {/* ─────────────────────────────────────────────────────────────── */}

              <div className="flex flex-col gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="text-secondary" />
                  <span className="font-body-md text-body-md">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="text-secondary" />
                  <span className="font-body-md text-body-md">Featured on homepage</span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input h-28 resize-none" value={form.description} onChange={handleChange} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 py-3 border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isPending || uploading} className="btn-primary flex-1 justify-center disabled:opacity-60">
                {isPending ? "Saving…" : modal === "create" ? "Create" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
