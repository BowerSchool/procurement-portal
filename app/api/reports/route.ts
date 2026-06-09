import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { assertPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await currentUser();
  assertPermission(user.role, "reports:read");
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "payment-forecast";

  const [requests, bills, budgets, vendors] = await Promise.all([
    prisma.purchaseRequest.findMany({ include: { department: true, vendor: true } }),
    prisma.vendorBill.findMany({ include: { vendor: true } }),
    prisma.departmentBudget.findMany({ include: { department: true } }),
    prisma.vendor.findMany()
  ]);

  return NextResponse.json({
    type,
    generatedAt: new Date().toISOString(),
    exports: ["xlsx", "pdf"],
    procurementReport: requests.map((request) => ({ department: request.department.name, vendor: request.vendor.name, total: Number(request.totalAmount), status: request.status })),
    vendorSpendReport: vendors.map((vendor) => ({ vendor: vendor.name, bills: bills.filter((bill) => bill.vendorId === vendor.id).length, spend: bills.filter((bill) => bill.vendorId === vendor.id).reduce((sum, bill) => sum + Number(bill.totalAmount), 0) })),
    paymentForecastReport: bills.map((bill) => ({ vendor: bill.vendor.name, invoice: bill.invoiceNumber, amount: Number(bill.totalAmount), dueDate: bill.dueDate, status: bill.status })),
    budgetUtilizationReport: budgets.map((budget) => ({ department: budget.department.name, allocated: Number(budget.allocated), committed: Number(budget.committedSpend), actual: Number(budget.actualSpend) })),
    agingReport: {
      "0-30": bills.filter((bill) => bill.dueDate >= new Date(Date.now() - 30 * 86400000)).length,
      "31-60": 0,
      "61-90": 0,
      "90+": 0
    }
  });
}
