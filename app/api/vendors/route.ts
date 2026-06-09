import { NextResponse } from "next/server";
import { z } from "zod";
import { VendorStatus, VendorType } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { assertPermission, can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

const vendorSchema = z.object({
  name: z.string().min(2),
  type: z.nativeEnum(VendorType),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  contactPerson: z.string().min(2),
  mobile: z.string().min(8),
  email: z.string().email(),
  bankName: z.string().min(2),
  accountNumber: z.string().min(6),
  ifscCode: z.string().min(6),
  beneficiaryName: z.string().min(2),
  status: z.nativeEnum(VendorStatus).default("UNDER_REVIEW")
});

export async function GET() {
  const user = await currentUser();
  if (!can(user.role, "vendor:read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const vendors = await prisma.vendor.findMany({ orderBy: { createdAt: "desc" }, include: { documents: true } });
  return NextResponse.json(vendors);
}

export async function POST(request: Request) {
  const user = await currentUser();
  assertPermission(user.role, "vendor:write");
  const data = vendorSchema.parse(await request.json());
  const count = await prisma.vendor.count();
  const vendor = await prisma.vendor.create({
    data: {
      ...data,
      vendorCode: `VEN-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`
    }
  });
  await prisma.auditTrail.create({ data: { userId: user.id, entityType: "Vendor", entityId: vendor.id, action: "VENDOR_CREATED", newValue: vendor } });
  return NextResponse.json(vendor, { status: 201 });
}
