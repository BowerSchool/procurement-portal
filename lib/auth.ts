import { Role } from "@prisma/client";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function currentUser() {
  const headerStore = await headers();
  const email = headerStore.get("x-user-email") ?? "finance@bower.edu";
  const roleOverride = headerStore.get("x-user-role") as Role | null;
  const user = await prisma.user.findUnique({ where: { email }, include: { department: true, team: true } });

  if (user) {
    return roleOverride ? { ...user, role: roleOverride } : user;
  }

  return {
    id: "demo-user",
    name: "Demo Finance User",
    email,
    role: roleOverride ?? Role.FINANCE,
    departmentId: null,
    department: null,
    team: [],
    managerId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
