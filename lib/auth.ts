import { Role } from "@prisma/client";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSupabaseAuthClient } from "@/lib/supabase";

export async function currentUser() {
  const headerStore = await headers();
  const roleOverride = process.env.NODE_ENV !== "production" ? (headerStore.get("x-user-role") as Role | null) : null;
  const authHeader = headerStore.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  let email = process.env.NODE_ENV !== "production" ? headerStore.get("x-user-email") ?? "finance@bower.edu" : null;

  if (bearerToken) {
    const supabase = createSupabaseAuthClient();
    const { data } = supabase ? await supabase.auth.getUser(bearerToken) : { data: { user: null } };
    email = data.user?.email ?? email;
  }

  if (!email && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_REQUIRED");
  }

  const resolvedEmail = email ?? "finance@bower.edu";
  const user = await prisma.user.findUnique({ where: { email: resolvedEmail }, include: { department: true, team: true } });

  if (user) {
    return roleOverride ? { ...user, role: roleOverride } : user;
  }

  return {
    id: "demo-user",
    name: "Demo Finance User",
    email: resolvedEmail,
    role: roleOverride ?? Role.FINANCE,
    departmentId: null,
    department: null,
    team: [],
    managerId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
