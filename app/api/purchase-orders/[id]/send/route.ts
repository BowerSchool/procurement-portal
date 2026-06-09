import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { assertPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  assertPermission(user.role, "po:write");
  const { id } = await params;
  const po = await prisma.purchaseOrder.findUnique({ where: { id }, include: { vendor: true } });
  if (!po) return NextResponse.json({ error: "PO not found" }, { status: 404 });

  await prisma.purchaseOrder.update({ where: { id }, data: { status: "SENT", sentAt: new Date() } });
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "PO_GENERATED",
      title: `PO sent to ${po.vendor.name}`,
      message: `${po.poNumber} was queued for email delivery to ${po.vendor.email}.`
    }
  });
  await prisma.auditTrail.create({ data: { userId: user.id, entityType: "PurchaseOrder", entityId: id, action: "PO_EMAIL_SENT", newValue: { vendorEmail: po.vendor.email } } });
  return NextResponse.json({ sent: true, vendorEmail: po.vendor.email });
}
