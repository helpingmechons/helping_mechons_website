"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { PlusCircle, Edit2, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const EMPTY = { title: "", description: "", image_url: "", category: "general", location: "", event_date: "", featured: false, sort_order: 0 };
const CATEGORIES = ["general","medical","food","grocery","education","orphanage"];

export default function GalleryClient({ initialItems }) {
  const [items, setItems]     = useState(initialItems);
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [filter, setFilter]   = useState("all");
  const [isPending, start]    = useTransition();
  const supabase = createClient();

  const filtered = filter === "all" ? items : items.filter(i => i.category === filter);

  const openCreate = () => { setForm({ ...EMPTY }); setModal("create"); };
  const openEdit   = (item) => { setForm({ ...item, event_date: item.event_date?.split("T")[0] || "" }); setModal(item); };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.title || !form.image_url) { toast.error("Title and image URL are required."); return; }
    start(async () => {
      const payload = { title: form.title, description: form.description, image_url: form.image_url, category: form.category, location: form.location, event_date: form.event_date || null, featured: form.featured, sort_order: Number(form.sort_order) };
      if (modal === "create") {
        const { data, error } = await supabase.from("gallery_items").insert(payload).select().single();
        if (error) { toast.error(error.message); return; }
        setItems(prev => [...prev, data]);
        toast.success("Gallery item added!");
      } else {
        const { data, error } = await supabase.from("gallery_items").update(payload).eq("id", modal.id).select().single();
        if (error) { toast.error(error.message); return; }
        setItems(prev => prev.map(i => i.id === data.id ? data : i));
        toast.success("Gallery item updated!");
      }
      setModal(null);
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this gallery item?")) return;
    const { error } = await supabase.from("gallery_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Deleted.");
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-headline text-headline-lg text-primary">Gallery</h1>
          <p className="text-body-md text-on-surface-variant">Manage photos displayed on the public website</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><PlusCircle className="w-4 h-4" /> Add Photo</button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-full text-label-md capitalize transition-all ${filter === c ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="card overflow-hidden group relative">
            <div className="relative h-40">
              <Image src={item.image_url} alt={item.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => openEdit(item)} className="p-2 bg-white rounded-lg shadow text-on-surface hover:bg-surface-container-high transition-colors"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-error-container rounded-lg shadow text-on-error-container hover:opacity-80 transition-opacity"><Trash2 className="w-4 h-4" /></button>
              </div>
              {item.featured && <span className="absolute top-2 left-2 badge bg-secondary text-on-secondary">Featured</span>}
            </div>
            <div className="p-3">
              <p className="text-body-md font-medium text-on-surface truncate">{item.title}</p>
              <p className="text-caption text-on-surface-variant capitalize">{item.category}{item.location ? ` · ${item.location}` : ""}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-primary/60 z-50 flex items-start justify-center p-4 pt-10 overflow-auto" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-headline-md text-primary">{modal === "create" ? "Add Gallery Item" : "Edit Item"}</h2>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-on-surface-variant" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Title *</label>
                <input name="title" className="form-input" value={form.title} onChange={handleChange} />
              </div>
              <div>
                <label className="form-label">Image URL * (/photos/... or https://...)</label>
                <input name="image_url" className="form-input text-sm" value={form.image_url} onChange={handleChange} />
                {form.image_url && (
                  <div className="relative h-32 rounded-lg overflow-hidden mt-2">
                    <Image src={form.image_url} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Category</label>
                  <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Location</label>
                  <input name="location" className="form-input" value={form.location} onChange={handleChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Event Date</label>
                  <input name="event_date" type="date" className="form-input" value={form.event_date} onChange={handleChange} />
                </div>
                <div>
                  <label className="form-label">Sort Order</label>
                  <input name="sort_order" type="number" onWheel={e => e.target.blur()} className="form-input" value={form.sort_order} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input h-20 resize-none" value={form.description} onChange={handleChange} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="text-secondary" />
                <span className="text-body-md">Featured (appears prominently)</span>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 py-3 border border-outline-variant rounded-lg text-on-surface-variant">Cancel</button>
              <button onClick={handleSave} disabled={isPending} className="btn-primary flex-1 justify-center disabled:opacity-60">
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
