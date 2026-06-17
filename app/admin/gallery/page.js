import { createClient } from "@/lib/supabase/server";
import GalleryClient from "./GalleryClient";

export const metadata = { title: "Gallery Management" };

export default async function AdminGalleryPage() {
  const supabase = createClient();
  const { data: galleryData } = await supabase
    .from("gallery_items")
    .select("*")
    .order("sort_order", { ascending: true });
  const gallery = galleryData ?? [];
  return <GalleryClient initialItems={gallery} />;
}
