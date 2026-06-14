import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToDrive } from "@/lib/drive/upload";

export async function POST(request) {
  try {
    // Admin-only
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer   = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "image/jpeg";
    const name     = file.name || `upload-${Date.now()}`;

    const result = await uploadToDrive({ name, mimeType, buffer });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Drive upload error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
