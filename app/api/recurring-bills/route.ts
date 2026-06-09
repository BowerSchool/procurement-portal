import { NextResponse } from "next/server";
import { z } from "zod";
import { RecurringFrequency } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { assertPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

const recurringSchema = z.object({
  vendorId: z.string(),
  name: z.string(),
  frequency: z.nativeEnum(RecurringFrequency),
  amount: z.number().positive(),
  gst: z.number().min(0),
  nextDueDate: z.string(),
  notifyDaysBefore: z.number().int().default(7)
});

export async function GET() {
  const user = await currentUser();
  assertPermission(user.role, "bill:write");
  return NextResponse.json(await prisma.recurringBill.findMany({ include: { vendor: true }, orderBy: { nextDueDate: "asc" } }));
}

export async function POST(request: Request) {
  const user = await currentUser();
  assertPermission(user.role, "bill:write");
  const data = recurringSchema.parse(await request.json());
  const recurring = await prisma.recurringBill.create({
    data: {
      ...data,
      nextDueDate: new Date(data.nextDueDate)
    }
  });
  await prisma.auditTrail.create({ data: { userId: user.id, entityType: "RecurringBill", entityId: recurring.id, action: "RECURRING_BILL_CREATED", newValue: recurring } });
  return NextResponse.json(recurring, { status: 201 });
}
