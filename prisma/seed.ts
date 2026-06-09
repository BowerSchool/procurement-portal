import { PrismaClient, Role, VendorStatus, VendorType, DepartmentName, Priority, PurchaseRequestStatus, PurchaseOrderStatus, ReceiptStatus, BillStatus, RecurringFrequency } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const departments = await Promise.all(
    Object.values(DepartmentName).map((name) =>
      prisma.department.upsert({
        where: { name },
        update: {},
        create: { name }
      })
    )
  );

  const financeDept = departments.find((department) => department.name === "FINANCE")!;
  const growthDept = departments.find((department) => department.name === "GROWTH")!;
  const studentDept = departments.find((department) => department.name === "STUDENT_EXPERIENCE")!;

  const users = await Promise.all([
    prisma.user.upsert({ where: { email: "employee@bower.edu" }, update: {}, create: { name: "Aarav Employee", email: "employee@bower.edu", role: Role.EMPLOYEE, departmentId: growthDept.id } }),
    prisma.user.upsert({ where: { email: "manager@bower.edu" }, update: {}, create: { name: "Meera Manager", email: "manager@bower.edu", role: Role.REPORTING_MANAGER, departmentId: growthDept.id } }),
    prisma.user.upsert({ where: { email: "finance@bower.edu" }, update: {}, create: { name: "Dev Finance", email: "finance@bower.edu", role: Role.FINANCE, departmentId: financeDept.id } }),
    prisma.user.upsert({ where: { email: "finance-head@bower.edu" }, update: {}, create: { name: "Nisha Finance Head", email: "finance-head@bower.edu", role: Role.FINANCE_HEAD, departmentId: financeDept.id } }),
    prisma.user.upsert({ where: { email: "founder@bower.edu" }, update: {}, create: { name: "Bower Founder", email: "founder@bower.edu", role: Role.FOUNDER_CEO, departmentId: studentDept.id } }),
    prisma.user.upsert({ where: { email: "admin@bower.edu" }, update: {}, create: { name: "Portal Admin", email: "admin@bower.edu", role: Role.ADMIN, departmentId: financeDept.id } })
  ]);

  const [employee, manager, finance, financeHead, founder] = users;
  await prisma.user.update({ where: { id: employee.id }, data: { managerId: manager.id } });

  const growthBudget = await prisma.departmentBudget.upsert({
    where: { departmentId_budgetHead_fiscalYear: { departmentId: growthDept.id, budgetHead: "Marketing Campaigns", fiscalYear: 2026 } },
    update: {},
    create: { departmentId: growthDept.id, budgetHead: "Marketing Campaigns", fiscalYear: 2026, allocated: 2500000, committedSpend: 840000, actualSpend: 410000 }
  });

  const facultyVendor = await prisma.vendor.upsert({
    where: { vendorCode: "VEN-2026-0001" },
    update: {},
    create: {
      vendorCode: "VEN-2026-0001",
      name: "Bower Faculty Collective",
      type: VendorType.FACULTY,
      gstNumber: "29ABCDE1234F1Z5",
      panNumber: "ABCDE1234F",
      contactPerson: "Rhea Iyer",
      mobile: "+91 98765 43210",
      email: "billing@facultycollective.in",
      bankName: "HDFC Bank",
      accountNumber: "50100222334455",
      ifscCode: "HDFC0001234",
      beneficiaryName: "Bower Faculty Collective",
      status: VendorStatus.ACTIVE
    }
  });

  const campaignVendor = await prisma.vendor.upsert({
    where: { vendorCode: "VEN-2026-0002" },
    update: {},
    create: {
      vendorCode: "VEN-2026-0002",
      name: "Launchpad Growth Studio",
      type: VendorType.MARKETING,
      gstNumber: "27FGHIJ6789K1Z2",
      panNumber: "FGHIJ6789K",
      contactPerson: "Kabir Sethi",
      mobile: "+91 99887 76655",
      email: "finance@launchpadgrowth.in",
      bankName: "ICICI Bank",
      accountNumber: "112233445566",
      ifscCode: "ICIC0000987",
      beneficiaryName: "Launchpad Growth Studio",
      status: VendorStatus.UNDER_REVIEW
    }
  });

  const pr = await prisma.purchaseRequest.upsert({
    where: { requestNumber: "PR-2026-00001" },
    update: {},
    create: {
      requestNumber: "PR-2026-00001",
      departmentId: growthDept.id,
      requesterId: employee.id,
      vendorId: campaignVendor.id,
      expenseCategory: "Marketing Campaigns",
      budgetId: growthBudget.id,
      description: "June founder-led admissions campaign",
      businessJustification: "Drive qualified applications for the entrepreneurship cohort.",
      amount: 450000,
      gstAmount: 81000,
      totalAmount: 531000,
      requiredDate: new Date("2026-06-20"),
      priority: Priority.CRITICAL,
      status: PurchaseRequestStatus.SUBMITTED
    }
  });

  await prisma.approvalStep.createMany({
    data: [
      { purchaseRequestId: pr.id, level: "REPORTING_MANAGER", approverId: manager.id, sequence: 1, status: "PENDING" },
      { purchaseRequestId: pr.id, level: "FINANCE_HEAD", approverId: financeHead.id, sequence: 2, status: "PENDING" }
    ],
    skipDuplicates: true
  });

  const po = await prisma.purchaseOrder.upsert({
    where: { poNumber: "PO-2026-00001" },
    update: {},
    create: {
      poNumber: "PO-2026-00001",
      vendorId: facultyVendor.id,
      purchaseRequestId: pr.id,
      amount: 220000,
      gst: 39600,
      total: 259600,
      deliverables: "Faculty masterclasses and mentoring sessions",
      startDate: new Date("2026-06-15"),
      endDate: new Date("2026-07-15"),
      paymentTerms: "50% advance, 50% on completion",
      dueDate: new Date("2026-06-18"),
      status: PurchaseOrderStatus.APPROVED,
      createdById: finance.id
    }
  });

  await prisma.purchaseReceipt.deleteMany({ where: { purchaseOrderId: po.id } });
  await prisma.purchaseReceipt.create({
    data: {
      purchaseOrderId: po.id,
      vendorId: facultyVendor.id,
      receiptDate: new Date("2026-06-30"),
      receivedById: manager.id,
      deliverablesReceived: "First two faculty sessions completed",
      supportingDocuments: ["/uploads/receipts/faculty-session-proof.pdf"],
      status: ReceiptStatus.PARTIAL
    }
  });

  await prisma.vendorBill.upsert({
    where: { vendorId_invoiceNumber: { vendorId: facultyVendor.id, invoiceNumber: "BFC-2026-118" } },
    update: {},
    create: {
      invoiceNumber: "BFC-2026-118",
      invoiceDate: new Date("2026-06-30"),
      vendorId: facultyVendor.id,
      purchaseOrderId: po.id,
      invoiceAmount: 110000,
      gst: 19800,
      totalAmount: 129800,
      dueDate: new Date("2026-07-07"),
      invoicePdfUrl: "/uploads/invoices/bfc-2026-118.pdf",
      status: BillStatus.ON_HOLD
    }
  });

  await prisma.recurringBill.create({
    data: {
      vendorId: facultyVendor.id,
      name: "WeWork Rent",
      frequency: RecurringFrequency.MONTHLY,
      amount: 375000,
      gst: 67500,
      nextDueDate: new Date("2026-07-01")
    }
  });

  await prisma.auditTrail.create({
    data: {
      userId: finance.id,
      entityType: "VendorBill",
      entityId: "BFC-2026-118",
      action: "BILL_HELD_RECEIPT_INCOMPLETE",
      oldValue: { status: "SUBMITTED" },
      newValue: { status: "ON_HOLD", reason: "Receipt not complete" },
      ipAddress: "10.0.0.42"
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
