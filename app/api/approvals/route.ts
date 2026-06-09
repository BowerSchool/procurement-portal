import { NextResponse } from "next/server";
import { z } from "zod";
import { ApprovalStatus } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const approvalSchema = z.object({
  approvalStepId: z.string(),
  status: z.nativeEnum(ApprovalStatus),
  comments: z.string().min(1, "Comments are mandatory")
});

export async function POST(request: Request) {
  const user = await currentUser();
  const data = approvalSchema.parse(await request.json());
  const step = await prisma.approvalStep.findUnique({ where: { id: data.approvalStepId }, include: { purchaseRequest: { include: { approvals: true } } } });
  if (!step || (step.approverId !== user.id && user.role !== "ADMIN")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.approvalStep.update({
    where: { id: step.id },
    data: { status: data.status, comments: data.comments, actedAt: new Date() }
  });

  const allSteps = await prisma.approvalStep.findMany({ where: { purchaseRequestId: step.purchaseRequestId } });
  const allApproved = allSteps.every((approval) => approval.id === step.id ? data.status === "APPROVED" : approval.status === "APPROVED");
  const rejected = data.status === "REJECTED" || data.status === "SENT_BACK";

  await prisma.purchaseRequest.update({
    where: { id: step.purchaseRequestId },
    data: { status: rejected ? "REJECTED" : allApproved ? "FINANCE_APPROVED" : step.level === "REPORTING_MANAGER" ? "MANAGER_APPROVED" : step.purchaseRequest.status }
  });

  await prisma.auditTrail.create({ data: { userId: user.id, entityType: "ApprovalStep", entityId: step.id, action: `APPROVAL_${data.status}`, oldValue: step, newValue: updated } });
  return NextResponse.json(updated);
}
