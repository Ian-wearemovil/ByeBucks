import { NextRequest } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { requireIdentity } from "../../../cursor/identity";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf"
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"];

export async function POST(request: NextRequest) {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return Response.json({ error: "Invalid file type" }, { status: 400 });
    }

    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return Response.json({ error: "Invalid file extension" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const safeBasename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}-${identity.sub.replace(/[^a-zA-Z0-9]/g, "_")}-${safeBasename}`;
    const filepath = join(uploadsDir, filename);
    
    await writeFile(filepath, buffer);

    return Response.json({ 
      url: `/uploads/${filename}`,
      filename 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
