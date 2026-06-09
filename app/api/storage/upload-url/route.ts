import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";

const allowedBuckets = [
  "vendor-documents",
  "purchase-request-attachments",
  "purchase-receipts",
  "vendor-invoices",
  "purchase-orders"
] as const;

const uploadSchema = z.object({
  bucket: z.enum(allowedBuckets),
  fileName: z.string().min(1),
  entityId: z.string().min(1)
});

export async function POST(request: Request) {
  const user = await currentUser();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 500 });

  const data = uploadSchema.parse(await request.json());
  const safeFileName = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${data.entityId}/${Date.now()}-${safeFileName}`;
  const { data: upload, error } = await supabase.storage.from(data.bucket).createSignedUploadUrl(path);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    bucket: data.bucket,
    path,
    signedUrl: upload.signedUrl,
    token: upload.token,
    requestedBy: user.email
  });
}
