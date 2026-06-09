import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { can, canSeeAll } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await currentUser();
  if (!can(user.role, "reports:read") && !can(user.role, "pr:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const where = canSeeAll(user.role) ? {} : { requesterId: user.id };
  const [vendorCount, pendingApprovals, approvedPos, overdueInvoices, bills, budgets] = await Promise.all([
    prisma.vendor.count(),
    prisma.approvalStep.count({ where: { status: "PENDING", approverId: canSeeAll(user.role) ? undefined : user.id } }),
    prisma.purchaseOrder.count({ where: { status: { in: ["APPROVED", "SENT", "ACCEPTED"] } } }),
    prisma.vendorBill.count({ where: { dueDate: { lt: new Date() }, status: { notIn: ["PAID"] } } }),
    prisma.vendorBill.findMany({ where: { status: { not: "PAID" } }, include: { vendor: true } }),
    prisma.departmentBudget.findMany()
  ]);

  const totalOutstanding = bills.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
  const budgetAllocated = budgets.reduce((sum, budget) => sum + Number(budget.allocated), 0);
  const budgetUsed = budgets.reduce((sum, budget) => sum + Number(budget.actualSpend) + Number(budget.committedSpend), 0);

  return NextResponse.json({
    scope: where,
    kpis: {
      totalOutstanding,
      pendingApprovals,
      approvedPos,
      overdueInvoices,
      vendorCount,
      budgetUtilization: budgetAllocated ? Math.round((budgetUsed / budgetAllocated) * 100) : 0
    },
    upcomingPayments: bills.map((bill) => ({
      vendor: bill.vendor.name,
      invoiceNumber: bill.invoiceNumber,
      amount: Number(bill.totalAmount),
      dueDate: bill.dueDate,
      status: bill.status
    }))
  });
}
