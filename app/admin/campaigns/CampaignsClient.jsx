"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { PlusCircle, Edit2, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const EMPTY = {
  title: "", slug: "", description: "", goal_amount: "", cover_image_url: "",
  category: "general", active: true, featured: false, location: "", end_date: "",
};

function slugify(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export default function CampaignsClient({ initialCampaigns }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [modal, setModal]         = useState(null); // null | "create" | campaign object
  const [form, setForm]           = useState(EMPTY);
  const [isPending, start]        = useTransition();
  const supabase = createClient();

  const openCreate = () => { setForm({ ...EMPTY }); setModal("create"); };
  const openEdit   = (c)  => { setForm({ ...c, goal_amount: String(c.goal_amount), end_date: c.end_date?.split("T")[0] || "" }); setModal(c); };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => {
      const updated = { ...f, [name]: type === "checkbox" ? checked : value };
      if (name === "title" && modal === "create") updated.slug = slugify(value);
      return updated;
    });
  };

  const handleSave = async () => {
    if (!form.title || !form.goal_amount) { toast.error("Title and goal amount are required."); return; }
    start(async () => {
      const payload = {
        title: form.title, slug: form.slug || slugify(form.title), description: form.description,
        goal_amount: Number(form.goal_amount), cover_image_url: form.cover_image_url,
        category: form.category, active: form.active, featured: form.featured,
        location: form.location, end_date: form.end_date || null,
      };
      if (modal === "create") {
        const { data, error } = await supabase.from("campaigns").insert(payload).select().single();
        if (error) { toast.error(error.message); return; }
        setCampaigns(prev => [data, ...prev]);
        toast.success("Campaign created!");
      } else {
        const { data, error } = await supabase.from("campaigns").update(payload).eq("id", modal.id).select().single();
        if (error) { toast.error(error.message); return; }
        setCampaigns(prev => prev.map(c => c.id === data.id ? data : c));
        toast.success("Campaign updated!");
      }
      setModal(null);
    });
  };

  const handleToggle = async (campaign) => {
    const { data, error } = await supabase.from("campaigns").update({ active: !campaign.active }).eq("id", campaign.id).select().single();
    if (error) { toast.error(error.message); return; }
    setCampaigns(prev => prev.map(c => c.id === data.id ? data : c));
    toast.success(`Campaign ${data.active ? "activated" : "deactivated"}.`);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this campaign? This cannot be undone.")) return;
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setCampaigns(prev => prev.filter(c => c.id !== id));
    toast.success("Campaign deleted.");
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-headline-lg text-primary">Campaigns</h1>
          <p className="text-body-md text-on-surface-variant">Manage all fundraiser campaigns</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <PlusCircle className="w-4 h-4" /> New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
        {campaigns.map(c => {
          const pct = Math.min(100, Math.round((c.current_amount / c.goal_amount) * 100)) || 0;
          return (
            <div key={c.id} className="card flex flex-col">
              <div className="relative h-44 overflow-hidden">
                {c.cover_image_url ? (
                  <Image src={c.cover_image_url} alt={c.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-surface-container flex items-center justify-center text-on-surface-variant text-caption">No Image</div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`badge ${c.active ? "bg-primary-fixed text-on-primary-fixed" : "badge-rejected"}`}>
                    {c.active ? "Active" : "Inactive"}
                  </span>
                  {c.featured && <span className="badge bg-secondary text-on-secondary">Featured</span>}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-headline font-semibold text-on-surface mb-1 line-clamp-2">{c.title}</h3>
                <p className="text-caption text-on-surface-variant capitalize mb-3">{c.category} · {c.location || "—"}</p>
                <div className="mt-auto">
                  <div className="flex justify-between text-caption mb-1">
                    <span>₹{Number(c.current_amount).toLocaleString("en-IN")}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="progress-bar mb-3"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-surface-container rounded-lg text-label-md hover:bg-surface-container-high transition-colors">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => handleToggle(c)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-surface-container rounded-lg text-label-md hover:bg-surface-container-high transition-colors">
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-primary/60 z-50 flex items-start justify-center p-4 pt-10 overflow-auto" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-headline text-headline-md text-primary">{modal === "create" ? "New Campaign" : "Edit Campaign"}</h2>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-on-surface-variant" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="form-label">Title *</label>
                <input name="title" className="form-input" value={form.title} onChange={handleChange} />
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
                <input name="goal_amount" type="number" className="form-input" value={form.goal_amount} onChange={handleChange} />
              </div>
              <div>
                <label className="form-label">Location</label>
                <input name="location" className="form-input" value={form.location} onChange={handleChange} />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Cover Image URL</label>
                <input name="cover_image_url" className="form-input text-sm" value={form.cover_image_url} onChange={handleChange} placeholder="https://... or /photos/..." />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input name="end_date" type="date" className="form-input" value={form.end_date} onChange={handleChange} />
              </div>
              <div className="flex flex-col gap-3 pt-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="text-secondary" />
                  <span className="text-body-md">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="text-secondary" />
                  <span className="text-body-md">Featured on homepage</span>
                </label>
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input h-28 resize-none" value={form.description} onChange={handleChange} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 py-3 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={isPending} className="btn-primary flex-1 justify-center disabled:opacity-60">
                {isPending ? "Saving..." : modal === "create" ? "Create Campaign" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
