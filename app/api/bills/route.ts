import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { assertPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { validateInvoice } from "@/lib/workflows";

const billSchema = z.object({
  invoiceNumber: z.string(),
  invoiceDate: z.string(),
  vendorId: z.string(),
  purchaseOrderId: z.string(),
  invoiceAmount: z.number().positive(),
  gst: z.number().min(0),
  dueDate: z.string(),
  invoicePdfUrl: z.string()
});

export async function GET() {
  const user = await currentUser();
  assertPermission(user.role, "bill:write");
  const bills = await prisma.vendorBill.findMany({ include: { vendor: true, purchaseOrder: { include: { receipts: true } } }, orderBy: { dueDate: "asc" } });
  return NextResponse.json(bills);
}

export async function POST(request: Request) {
  const user = await currentUser();
  assertPermission(user.role, "bill:write");
  const data = billSchema.parse(await request.json());
  const po = await prisma.purchaseOrder.findUnique({ where: { id: data.purchaseOrderId }, include: { receipts: true } });
  if (!po) return NextResponse.json({ error: "No PO = No Invoice Processing" }, { status: 400 });

  const existingInvoices = await prisma.vendorBill.findMany({ select: { invoiceNumber: true, vendorId: true } });
  const receiptComplete = po.receipts.some((receipt) => receipt.status === "COMPLETE");
  const validation = validateInvoice({ ...data, poTotal: Number(po.total), existingInvoices, receiptComplete });

  const bill = await prisma.vendorBill.create({
    data: {
      ...data,
      invoiceDate: new Date(data.invoiceDate),
      dueDate: new Date(data.dueDate),
      totalAmount: data.invoiceAmount + data.gst,
      status: validation.canProcess ? "PENDING_APPROVAL" : "ON_HOLD",
      duplicateRisk: validation.duplicateInvoice,
      exceedsPo: validation.amountExceedsPo,
      missingGst: validation.missingGst
    }
  });

  await prisma.auditTrail.create({ data: { userId: user.id, entityType: "VendorBill", entityId: bill.id, action: validation.canProcess ? "INVOICE_SUBMITTED" : "INVOICE_HELD", newValue: { bill, validation } } });
  return NextResponse.json({ bill, validation }, { status: 201 });
}
