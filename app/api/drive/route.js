import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToDrive } from "@/lib/drive/upload";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file     = formData.get("file");
    const purpose  = formData.get("purpose") || "proof"; // "proof" | "campaign" | "gallery"

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Proof uploads (donation payment screenshots) are public — no auth needed
    // Campaign/gallery uploads are admin-only
    if (purpose !== "proof") {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (!profile || profile.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Validate file type — images only
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, or WEBP images are allowed." }, { status: 400 });
    }

    // Validate file size — max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 5MB." }, { status: 400 });
    }

    const buffer   = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;
    const name     = `${purpose}-${Date.now()}-${file.name}`;

    const result = await uploadToDrive({ name, mimeType, buffer });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Drive upload error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
