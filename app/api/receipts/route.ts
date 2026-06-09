import { NextResponse } from "next/server";
import { z } from "zod";
import { ReceiptStatus } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { assertPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

const receiptSchema = z.object({
  purchaseOrderId: z.string(),
  vendorId: z.string(),
  receiptDate: z.string(),
  deliverablesReceived: z.string(),
  supportingDocuments: z.array(z.string()).default([]),
  status: z.nativeEnum(ReceiptStatus)
});

export async function POST(request: Request) {
  const user = await currentUser();
  assertPermission(user.role, "receipt:write");
  const data = receiptSchema.parse(await request.json());
  const receipt = await prisma.purchaseReceipt.create({
    data: {
      ...data,
      receiptDate: new Date(data.receiptDate),
      receivedById: user.id
    }
  });
  await prisma.auditTrail.create({ data: { userId: user.id, entityType: "PurchaseReceipt", entityId: receipt.id, action: `RECEIPT_${data.status}`, newValue: receipt } });
  return NextResponse.json(receipt, { status: 201 });
}
