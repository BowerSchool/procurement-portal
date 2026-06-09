import { NextResponse } from "next/server";
import { z } from "zod";
import { ApprovalLevel, Priority, Role } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { assertPermission, canSeeAll } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { approvalMatrix, nextRequestNumber } from "@/lib/workflows";

const requestSchema = z.object({
  departmentId: z.string(),
  vendorId: z.string(),
  expenseCategory: z.string(),
  budgetId: z.string(),
  description: z.string(),
  businessJustification: z.string(),
  amount: z.number().positive(),
  gstAmount: z.number().min(0),
  requiredDate: z.string(),
  priority: z.nativeEnum(Priority)
});

export async function GET() {
  const user = await currentUser();
  const purchaseRequests = await prisma.purchaseRequest.findMany({
    where: canSeeAll(user.role) ? {} : { requesterId: user.id },
    include: { vendor: true, department: true, approvals: { orderBy: { sequence: "asc" }, include: { approver: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(purchaseRequests);
}

export async function POST(request: Request) {
  const user = await currentUser();
  assertPermission(user.role, "pr:create");
  const data = requestSchema.parse(await request.json());
  const totalAmount = data.amount + data.gstAmount;
  const last = await prisma.purchaseRequest.findFirst({ orderBy: { createdAt: "desc" }, select: { requestNumber: true } });
  const route = approvalMatrix(totalAmount);

  const approverRoles: Record<ApprovalLevel, Role> = {
    REPORTING_MANAGER: "REPORTING_MANAGER",
    FINANCE: "FINANCE",
    FINANCE_HEAD: "FINANCE_HEAD",
    FOUNDER_CEO: "FOUNDER_CEO"
  };
  const managers = await prisma.user.findMany({ where: { role: { in: Object.values(approverRoles) } } });
  const approverFor = (level: ApprovalLevel) => managers.find((candidate) => candidate.role === approverRoles[level])?.id ?? user.id;

  const pr = await prisma.purchaseRequest.create({
    data: {
      ...data,
      requesterId: user.id,
      requestNumber: nextRequestNumber(last?.requestNumber ?? null),
      totalAmount,
      requiredDate: new Date(data.requiredDate),
      status: "SUBMITTED",
      approvals: {
        create: route.map((level, index) => ({
          level,
          sequence: index + 1,
          approverId: approverFor(level)
        }))
      }
    },
    include: { approvals: true }
  });

  await prisma.auditTrail.create({ data: { userId: user.id, entityType: "PurchaseRequest", entityId: pr.id, action: "PR_SUBMITTED", newValue: pr } });
  return NextResponse.json(pr, { status: 201 });
}
