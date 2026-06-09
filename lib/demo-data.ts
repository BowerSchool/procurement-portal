export const dashboardKpis = [
  { label: "Total Outstanding Payables", value: 18425000, tone: "red" },
  { label: "Payments Due This Week", value: 3275000, tone: "amber" },
  { label: "Payments Due This Month", value: 10980000, tone: "amber" },
  { label: "Approved POs", value: 64, tone: "green" },
  { label: "Pending Approvals", value: 18, tone: "amber" },
  { label: "Overdue Invoices", value: 7, tone: "red" },
  { label: "Vendor Count", value: 142, tone: "green" },
  { label: "Budget Utilization %", value: 71, tone: "green" }
];

export const upcomingPayments = [
  { vendor: "Bower Faculty Collective", invoice: "BFC-2026-118", amount: 129800, dueDate: "2026-06-12", priority: "Critical", days: 3, status: "On Hold" },
  { vendor: "WeWork India", invoice: "WW-0626-410", amount: 442500, dueDate: "2026-06-15", priority: "Critical", days: 6, status: "Scheduled" },
  { vendor: "Launchpad Growth Studio", invoice: "LGS-9901", amount: 531000, dueDate: "2026-06-18", priority: "Critical", days: 9, status: "Pending Approval" },
  { vendor: "CloudOps Software", invoice: "COS-7781", amount: 212400, dueDate: "2026-06-22", priority: "High", days: 13, status: "Approved" },
  { vendor: "Campus Security Services", invoice: "CSS-2049", amount: 168000, dueDate: "2026-06-28", priority: "Normal", days: 19, status: "Submitted" }
];

export const cashflow = [
  { label: "Current Week", amount: 3275000 },
  { label: "Next Week", amount: 2680000 },
  { label: "30 Days", amount: 10980000 },
  { label: "60 Days", amount: 16350000 },
  { label: "90 Days", amount: 22600000 }
];

export const budgets = [
  { department: "Growth", allocated: 2500000, committed: 840000, actual: 410000, remaining: 1250000 },
  { department: "Operations", allocated: 1800000, committed: 710000, actual: 520000, remaining: 570000 },
  { department: "Student Experience", allocated: 3200000, committed: 1750000, actual: 870000, remaining: 580000 },
  { department: "Admissions", allocated: 2200000, committed: 960000, actual: 680000, remaining: 560000 },
  { department: "HR", allocated: 900000, committed: 210000, actual: 380000, remaining: 310000 },
  { department: "Finance", allocated: 650000, committed: 120000, actual: 180000, remaining: 350000 },
  { department: "Leadership", allocated: 1400000, committed: 740000, actual: 410000, remaining: 250000 }
];

export const vendors = [
  { id: "VEN-2026-0001", name: "Bower Faculty Collective", type: "Faculty", status: "Active", gst: "29ABCDE1234F1Z5", documents: "Complete" },
  { id: "VEN-2026-0002", name: "Launchpad Growth Studio", type: "Marketing", status: "Under Review", gst: "27FGHIJ6789K1Z2", documents: "Contract pending" },
  { id: "VEN-2026-0003", name: "WeWork India", type: "Infrastructure", status: "Active", gst: "29AAACW1234Q1Z8", documents: "Lease renewal due" },
  { id: "VEN-2026-0004", name: "CloudOps Software", type: "Technology", status: "Active", gst: "06AACCC9876M1Z4", documents: "Complete" }
];

export const purchaseRequests = [
  { number: "PR-2026-00001", department: "Growth", requester: "Aarav Employee", vendor: "Launchpad Growth Studio", total: 531000, priority: "Critical", status: "Submitted", route: "Manager + Finance Head" },
  { number: "PR-2026-00002", department: "Student Experience", requester: "Rhea Mentor", vendor: "Bower Faculty Collective", total: 259600, priority: "Critical", status: "Manager Approved", route: "Manager + Finance Head" },
  { number: "PR-2026-00003", department: "Operations", requester: "Ishaan Ops", vendor: "Campus Security Services", total: 168000, priority: "Medium", status: "Finance Approved", route: "Manager + Finance Head" }
];

export const founderMetrics = [
  { label: "Total Commitments", value: 42700000 },
  { label: "Future Liabilities", value: 22600000 },
  { label: "Monthly Cash Requirement", value: 10980000 },
  { label: "Budget Variance", value: -8 }
];
