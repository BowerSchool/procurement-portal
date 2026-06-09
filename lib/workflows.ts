import { ApprovalLevel, Priority, VendorBill } from "@prisma/client";

export function approvalMatrix(totalAmount: number): ApprovalLevel[] {
  if (totalAmount <= 25000) return ["REPORTING_MANAGER", "FINANCE"];
  if (totalAmount <= 100000) return ["REPORTING_MANAGER", "FINANCE"];
  if (totalAmount <= 500000) return ["REPORTING_MANAGER", "FINANCE_HEAD"];
  return ["REPORTING_MANAGER", "FINANCE_HEAD", "FOUNDER_CEO"];
}

export function paymentPriority(category: string, vendorType: string, priority?: Priority) {
  const criticalCategories = ["Faculty Payments", "Student Experience", "Compliance", "Government Fees", "Marketing Campaigns"];
  if (priority === "CRITICAL" || criticalCategories.includes(category) || vendorType === "FACULTY") return "Critical";
  if (["CONSULTANT", "TECHNOLOGY", "INFRASTRUCTURE"].includes(vendorType)) return "High";
  return "Normal";
}

export function validateInvoice(input: {
  invoiceNumber: string;
  vendorId: string;
  invoiceAmount: number;
  gst: number;
  poTotal: number;
  existingInvoices: Pick<VendorBill, "invoiceNumber" | "vendorId">[];
  receiptComplete: boolean;
}) {
  return {
    duplicateInvoice: input.existingInvoices.some((invoice) => invoice.vendorId === input.vendorId && invoice.invoiceNumber === input.invoiceNumber),
    amountExceedsPo: input.invoiceAmount + input.gst > input.poTotal,
    missingGst: input.gst <= 0,
    receiptIncomplete: !input.receiptComplete,
    canProcess: input.receiptComplete && input.gst > 0 && input.invoiceAmount + input.gst <= input.poTotal
  };
}

export function nextPoNumber(lastNumber: string | null, year = new Date().getFullYear()) {
  const serial = lastNumber ? Number(lastNumber.split("-").at(-1)) + 1 : 1;
  return `PO-${year}-${String(serial).padStart(5, "0")}`;
}

export function nextRequestNumber(lastNumber: string | null, year = new Date().getFullYear()) {
  const serial = lastNumber ? Number(lastNumber.split("-").at(-1)) + 1 : 1;
  return `PR-${year}-${String(serial).padStart(5, "0")}`;
}
