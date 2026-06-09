import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { hasSupabaseConfig } from "@/lib/supabase";

export async function GET() {
  const user = await currentUser();
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department?.name ?? null,
    supabaseConfigured: hasSupabaseConfig()
  });
}
