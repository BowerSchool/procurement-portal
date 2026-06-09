import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { assertPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { nextPoNumber } from "@/lib/workflows";

const poSchema = z.object({
  purchaseRequestId: z.string(),
  deliverables: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  paymentTerms: z.string(),
  dueDate: z.string()
});

export async function POST(request: Request) {
  const user = await currentUser();
  assertPermission(user.role, "po:write");
  const data = poSchema.parse(await request.json());
  const pr = await prisma.purchaseRequest.findUnique({ where: { id: data.purchaseRequestId }, include: { vendor: true } });
  if (!pr || pr.status !== "FINANCE_APPROVED") return NextResponse.json({ error: "PR must be fully approved before PO creation" }, { status: 400 });

  const last = await prisma.purchaseOrder.findFirst({ orderBy: { createdAt: "desc" }, select: { poNumber: true } });
  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber: nextPoNumber(last?.poNumber ?? null),
      purchaseRequestId: pr.id,
      vendorId: pr.vendorId,
      amount: pr.amount,
      gst: pr.gstAmount,
      total: pr.totalAmount,
      deliverables: data.deliverables,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      paymentTerms: data.paymentTerms,
      dueDate: new Date(data.dueDate),
      status: "APPROVED",
      pdfUrl: `/api/purchase-orders/${pr.id}/pdf`,
      createdById: user.id
    }
  });
  await prisma.purchaseRequest.update({ where: { id: pr.id }, data: { status: "PO_CREATED" } });
  await prisma.auditTrail.create({ data: { userId: user.id, entityType: "PurchaseOrder", entityId: po.id, action: "PO_GENERATED", newValue: po } });
  return NextResponse.json(po, { status: 201 });
}
