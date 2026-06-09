"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, Download, FileText, IndianRupee, Mail, Plus, Send, ShieldAlert, Truck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { budgets as seedBudgets, cashflow as seedCashflow, purchaseRequests as seedPurchaseRequests, upcomingPayments as seedPayments, vendors as seedVendors } from "@/lib/demo-data";
import { money } from "@/lib/utils";

type Vendor = {
  id: string;
  name: string;
  type: string;
  status: string;
  gst: string;
  pan: string;
  contactPerson: string;
  mobile: string;
  email: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  beneficiary: string;
  documents: string;
};

type PurchaseRequest = {
  number: string;
  department: string;
  requester: string;
  vendor: string;
  total: number;
  amount: number;
  gst: number;
  priority: string;
  status: string;
  route: string;
  description: string;
  justification: string;
  budgetHead: string;
};

type Payment = {
  vendor: string;
  invoice: string;
  amount: number;
  dueDate: string;
  priority: string;
  days: number;
  status: string;
};

type PurchaseOrder = {
  po: string;
  vendor: string;
  pr: string;
  total: number;
  deliverables: string;
  status: string;
  receiptStatus: "Partial" | "Complete";
  sent: boolean;
};

type AuditItem = {
  user: string;
  action: string;
  oldValue: string;
  newValue: string;
  ip: string;
};

const emptyVendor: Vendor = {
  id: "",
  name: "",
  type: "Marketing",
  status: "Under Review",
  gst: "",
  pan: "",
  contactPerson: "",
  mobile: "",
  email: "",
  bankName: "",
  accountNumber: "",
  ifsc: "",
  beneficiary: "",
  documents: "GST Certificate, PAN Card, Cancelled Cheque"
};

const emptyPr: PurchaseRequest = {
  number: "",
  department: "Growth",
  requester: "Aarav Employee",
  vendor: "Launchpad Growth Studio",
  total: 0,
  amount: 0,
  gst: 0,
  priority: "Medium",
  status: "Submitted",
  route: "Manager + Finance",
  description: "",
  justification: "",
  budgetHead: "Marketing Campaigns"
};

function tone(value: string) {
  if (["Critical", "Overdue", "Blocked", "On Hold", "Rejected"].includes(value)) return "red";
  if (["High", "Pending Approval", "Under Review", "Submitted", "Partial"].includes(value)) return "amber";
  return "green";
}

function approvalRoute(total: number) {
  if (total <= 100000) return "Manager + Finance";
  if (total <= 500000) return "Manager + Finance Head";
  return "Manager + Finance Head + Founder";
}

function csvDownload(filename: string, rows: object[]) {
  const normalized = rows.length ? rows.map((row) => row as Record<string, unknown>) : [{ report: "No data" }];
  const headers = Object.keys(normalized[0]);
  const csv = [headers.join(","), ...normalized.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function fieldClass() {
  return "h-10 rounded-md border border-input bg-background px-3 text-sm";
}

function Modal({ title, description, children, onClose }: { title: string; description: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-lg border bg-card shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ProcurementPortal() {
  const [darkMode, setDarkMode] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>(seedVendors.map((vendor) => ({ ...emptyVendor, ...vendor, pan: "ABCDE1234F", contactPerson: "Finance Desk", mobile: "+91 98765 43210", email: "billing@example.com", bankName: "HDFC Bank", accountNumber: "50100222334455", ifsc: "HDFC0001234", beneficiary: vendor.name })));
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(seedPurchaseRequests.map((request) => ({ ...emptyPr, ...request, amount: Math.round(request.total / 1.18), gst: request.total - Math.round(request.total / 1.18), description: "Procurement request", justification: "Required for business continuity." })));
  const [payments, setPayments] = useState<Payment[]>(seedPayments);
  const [budgets, setBudgets] = useState(seedBudgets);
  const [cashflow] = useState(seedCashflow);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    { po: "PO-2026-00001", vendor: "Bower Faculty Collective", pr: "PR-2026-00002", total: 259600, deliverables: "Faculty masterclasses and mentoring sessions", status: "Approved", receiptStatus: "Partial", sent: false }
  ]);
  const [recurringBills, setRecurringBills] = useState(["WeWork Rent - Monthly", "Internet - Monthly", "Software Subscriptions - Annual", "Electricity - Monthly", "Security Services - Monthly"]);
  const [audit, setAudit] = useState<AuditItem[]>([
    { user: "Dev Finance", action: "BILL_HELD_RECEIPT_INCOMPLETE", oldValue: "Submitted", newValue: "On Hold", ip: "10.0.0.42" },
    { user: "Meera Manager", action: "PR_APPROVED", oldValue: "Submitted", newValue: "Manager Approved", ip: "10.0.0.18" }
  ]);
  const [modal, setModal] = useState<"vendor" | "pr" | "po" | "recurring" | "invoice" | null>(null);
  const [toast, setToast] = useState("Ready");
  const [vendorForm, setVendorForm] = useState<Vendor>(emptyVendor);
  const [prForm, setPrForm] = useState<PurchaseRequest>(emptyPr);
  const [recurringName, setRecurringName] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");

  const kpis = useMemo(() => {
    const outstanding = payments.filter((payment) => payment.status !== "Paid").reduce((sum, payment) => sum + payment.amount, 0);
    const pending = purchaseRequests.filter((request) => !["Finance Approved", "Rejected", "PO Created"].includes(request.status)).length;
    const overdue = payments.filter((payment) => payment.days < 0 || payment.status === "Overdue").length;
    const budgetAllocated = budgets.reduce((sum, budget) => sum + budget.allocated, 0);
    const budgetUsed = budgets.reduce((sum, budget) => sum + budget.actual + budget.committed, 0);
    return [
      { label: "Total Outstanding Payables", value: outstanding, tone: "red" },
      { label: "Payments Due This Week", value: payments.filter((payment) => payment.days <= 7 && payment.status !== "Paid").reduce((sum, payment) => sum + payment.amount, 0), tone: "amber" },
      { label: "Payments Due This Month", value: payments.reduce((sum, payment) => sum + payment.amount, 0), tone: "amber" },
      { label: "Approved POs", value: purchaseOrders.filter((po) => po.status !== "Draft").length, tone: "green" },
      { label: "Pending Approvals", value: pending, tone: "amber" },
      { label: "Overdue Invoices", value: overdue, tone: overdue ? "red" : "green" },
      { label: "Vendor Count", value: vendors.length, tone: "green" },
      { label: "Budget Utilization %", value: Math.round((budgetUsed / budgetAllocated) * 100), tone: "green" }
    ];
  }, [payments, purchaseOrders, purchaseRequests, vendors, budgets]);

  function log(action: string, oldValue: string, newValue: string) {
    setAudit((items) => [{ user: "Demo Finance User", action, oldValue, newValue, ip: "10.0.0.51" }, ...items]);
    setToast(action.replaceAll("_", " "));
  }

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    setToast(next ? "Dark mode enabled" : "Light mode enabled");
  }

  function submitVendor() {
    if (!vendorForm.name || !vendorForm.gst || !vendorForm.email || !vendorForm.accountNumber) {
      setToast("Vendor name, GST, email and bank account are required");
      return;
    }
    const vendor = { ...vendorForm, id: `VEN-2026-${String(vendors.length + 1).padStart(4, "0")}` };
    setVendors((items) => [vendor, ...items]);
    setVendorForm(emptyVendor);
    setModal(null);
    log("VENDOR_CREATED", "None", vendor.name);
  }

  function submitPurchaseRequest() {
    if (!prForm.vendor || !prForm.description || !prForm.justification || prForm.amount <= 0) {
      setToast("Vendor, description, justification and amount are required");
      return;
    }
    const gst = Math.round(prForm.amount * 0.18);
    const total = prForm.amount + gst;
    const request = {
      ...prForm,
      number: `PR-2026-${String(purchaseRequests.length + 1).padStart(5, "0")}`,
      gst,
      total,
      route: approvalRoute(total),
      status: "Submitted"
    };
    setPurchaseRequests((items) => [request, ...items]);
    setBudgets((items) => items.map((budget) => budget.department === request.department ? { ...budget, committed: budget.committed + total, remaining: Math.max(0, budget.remaining - total) } : budget));
    setPrForm(emptyPr);
    setModal(null);
    log("PR_SUBMITTED", "Draft", `${request.number} routed to ${request.route}`);
  }

  function approvePr(number: string) {
    setPurchaseRequests((items) => items.map((request) => request.number === number ? { ...request, status: request.status === "Submitted" ? "Manager Approved" : "Finance Approved" } : request));
    log("PR_APPROVED", number, "Next approval stage");
  }

  function rejectPr(number: string) {
    setPurchaseRequests((items) => items.map((request) => request.number === number ? { ...request, status: "Rejected" } : request));
    log("PR_REJECTED", number, "Rejected with comments");
  }

  function createPoFromPr(request: PurchaseRequest) {
    if (request.status !== "Finance Approved") {
      setToast("PR must be Finance Approved before PO creation");
      return;
    }
    const po: PurchaseOrder = {
      po: `PO-2026-${String(purchaseOrders.length + 1).padStart(5, "0")}`,
      vendor: request.vendor,
      pr: request.number,
      total: request.total,
      deliverables: request.description,
      status: "Approved",
      receiptStatus: "Partial",
      sent: false
    };
    setPurchaseOrders((items) => [po, ...items]);
    setPurchaseRequests((items) => items.map((item) => item.number === request.number ? { ...item, status: "PO Created" } : item));
    log("PO_GENERATED", request.number, po.po);
  }

  function markReceiptComplete(poNumber: string) {
    setPurchaseOrders((items) => items.map((po) => po.po === poNumber ? { ...po, receiptStatus: "Complete" } : po));
    setPayments((items) => items.map((payment) => payment.status === "On Hold" ? { ...payment, status: "Pending Approval" } : payment));
    log("RECEIPT_COMPLETE", "Partial", poNumber);
  }

  function sendPo(poNumber: string) {
    setPurchaseOrders((items) => items.map((po) => po.po === poNumber ? { ...po, status: "Sent", sent: true } : po));
    log("PO_EMAIL_SENT", poNumber, "Vendor email queued");
  }

  function downloadPo(po: PurchaseOrder) {
    csvDownload(`${po.po}.csv`, [{ po: po.po, vendor: po.vendor, pr: po.pr, total: po.total, deliverables: po.deliverables, status: po.status }]);
    log("PO_DOWNLOADED", po.po, "CSV generated");
  }

  function scheduleBatch() {
    const blocked = payments.filter((payment) => payment.status === "On Hold").length;
    setPayments((items) => items.map((payment) => payment.status === "Approved" ? { ...payment, status: "Scheduled" } : payment));
    log("PAYMENT_BATCH_SCHEDULED", `${blocked} held`, "Approved invoices scheduled");
  }

  function addRecurring() {
    if (!recurringName.trim()) {
      setToast("Recurring bill name is required");
      return;
    }
    setRecurringBills((items) => [`${recurringName.trim()} - Monthly`, ...items]);
    setRecurringName("");
    setModal(null);
    log("RECURRING_BILL_CREATED", "None", recurringName.trim());
  }

  const filteredVendors = vendors.filter((vendor) => `${vendor.name} ${vendor.gst} ${vendor.type} ${vendor.status}`.toLowerCase().includes(vendorSearch.toLowerCase()));

  return (
    <AppShell darkMode={darkMode} onToggleTheme={toggleTheme} onNewPurchaseRequest={() => setModal("pr")}>
      <div className="space-y-8">
        <div className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">Status: {toast}</div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardHeader className="pb-2">
                <CardDescription>{kpi.label}</CardDescription>
                <CardTitle className="text-2xl">{kpi.label.includes("%") ? `${kpi.value}%` : kpi.value > 1000 ? money(kpi.value) : kpi.value}</CardTitle>
              </CardHeader>
              <CardContent><Badge variant={kpi.tone as "red" | "amber" | "green"}>{kpi.tone === "red" ? "Needs action" : kpi.tone === "amber" ? "Watch" : "Controlled"}</Badge></CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div><CardTitle>Cashflow Forecast</CardTitle><CardDescription>Week-wise projected payouts and 30/60/90 day liabilities.</CardDescription></div>
              <Button variant="outline" size="sm" onClick={() => csvDownload("cashflow-forecast.csv", cashflow)}><Download className="h-4 w-4" /> Forecast</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {cashflow.map((item) => <div key={item.label} className="grid gap-2"><div className="flex items-center justify-between text-sm"><span className="font-medium">{item.label}</span><span>{money(item.amount)}</span></div><Progress value={Math.min(100, (item.amount / 22600000) * 100)} /></div>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Payment Priority Dashboard</CardTitle><CardDescription>Auto-categorized by vendor type, category, SLA and compliance exposure.</CardDescription></CardHeader>
            <CardContent className="grid gap-3">
              {["Critical: Faculty, student experience, compliance, government fees, campaigns", "High: Consultants and SLA vendors", "Normal: General purchases"].map((item) => <div key={item} className="flex items-center gap-3 rounded-lg border p-3"><span className={`h-3 w-3 rounded-full ${item.startsWith("Critical") ? "bg-red-500" : item.startsWith("High") ? "bg-amber-500" : "bg-emerald-500"}`} /><p className="text-sm">{item}</p></div>)}
            </CardContent>
          </Card>
        </section>

        <section id="bills" className="grid gap-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div><CardTitle>Upcoming Payments</CardTitle><CardDescription>No PO, incomplete receipt, duplicate invoice, and GST warnings are enforced before scheduling.</CardDescription></div>
              <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setModal("invoice")}>Submit Invoice</Button><Button size="sm" onClick={scheduleBatch}><IndianRupee className="h-4 w-4" /> Schedule Batch</Button></div>
            </CardHeader>
            <CardContent>
              <Table><TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Invoice Number</TableHead><TableHead>Amount</TableHead><TableHead>Due Date</TableHead><TableHead>Priority</TableHead><TableHead>Days</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>{payments.map((payment) => <TableRow key={payment.invoice}><TableCell className="font-medium">{payment.vendor}</TableCell><TableCell>{payment.invoice}</TableCell><TableCell>{money(payment.amount)}</TableCell><TableCell>{payment.dueDate}</TableCell><TableCell><Badge variant={tone(payment.priority) as "red" | "amber" | "green"}>{payment.priority}</Badge></TableCell><TableCell>{payment.days}</TableCell><TableCell><Badge variant={tone(payment.status) as "red" | "amber" | "green"}>{payment.status}</Badge></TableCell></TableRow>)}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        <section id="vendors">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div><CardTitle>Vendor Management</CardTitle><CardDescription>Vendor master with GST, PAN, banking, documents, status controls and payment block flag.</CardDescription></div>
              <Button size="sm" onClick={() => setModal("vendor")}><Plus className="h-4 w-4" /> Add Vendor</Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid gap-3 md:grid-cols-4"><Input placeholder="Search vendors, GST, type, status" value={vendorSearch} onChange={(event) => setVendorSearch(event.target.value)} /></div>
              <Table><TableHeader><TableRow><TableHead>Vendor ID</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>GST</TableHead><TableHead>Documents</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>{filteredVendors.map((vendor) => <TableRow key={vendor.id}><TableCell>{vendor.id}</TableCell><TableCell className="font-medium">{vendor.name}</TableCell><TableCell>{vendor.type}</TableCell><TableCell>{vendor.gst}</TableCell><TableCell>{vendor.documents}</TableCell><TableCell><Badge variant={tone(vendor.status) as "red" | "amber" | "green"}>{vendor.status}</Badge></TableCell></TableRow>)}</TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        <section id="purchase-requests" className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4"><div><CardTitle>Purchase Requests</CardTitle><CardDescription>Employees must submit PRs before vendor engagement. Approval routing is automatic.</CardDescription></div><Button size="sm" onClick={() => setModal("pr")}><Plus className="h-4 w-4" /> New PR</Button></CardHeader>
            <CardContent>
              <Table><TableHeader><TableRow><TableHead>PR</TableHead><TableHead>Department</TableHead><TableHead>Vendor</TableHead><TableHead>Total</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>{purchaseRequests.map((request) => <TableRow key={request.number}><TableCell className="font-medium">{request.number}</TableCell><TableCell>{request.department}</TableCell><TableCell>{request.vendor}</TableCell><TableCell>{money(request.total)}</TableCell><TableCell><Badge variant={tone(request.priority) as "red" | "amber" | "green"}>{request.priority}</Badge></TableCell><TableCell>{request.status}</TableCell><TableCell className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => approvePr(request.number)}>Approve</Button><Button variant="outline" size="sm" onClick={() => rejectPr(request.number)}>Reject</Button><Button size="sm" onClick={() => createPoFromPr(request)}>Create PO</Button></TableCell></TableRow>)}</TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Approval Matrix</CardTitle><CardDescription>Comments are mandatory for approve, reject, send back and hold actions.</CardDescription></CardHeader>
            <CardContent className="space-y-3">{["<= Rs 25,000: Manager + Finance", "Rs 25,001 - Rs 1,00,000: Manager + Finance", "Rs 1,00,001 - Rs 5,00,000: Manager + Finance Head", "Above Rs 5,00,000: Manager + Finance Head + Founder"].map((rule) => <div key={rule} className="flex items-center gap-3 rounded-lg border p-3 text-sm"><CheckCircle2 className="h-4 w-4 text-primary" />{rule}</div>)}</CardContent>
          </Card>
        </section>

        <section id="purchase-orders" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {purchaseOrders.map((po) => <Card key={po.po}><CardHeader><CardTitle>{po.po}</CardTitle><CardDescription>{po.vendor} linked to {po.pr}</CardDescription></CardHeader><CardContent className="space-y-3"><Badge variant={tone(po.status) as "red" | "amber" | "green"}>{po.status}</Badge><p className="text-sm text-muted-foreground">{money(po.total)} | Receipt: {po.receiptStatus}</p><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => downloadPo(po)}><FileText className="h-4 w-4" /> PDF</Button><Button variant="outline" size="sm" onClick={() => sendPo(po.po)}><Send className="h-4 w-4" /> Email</Button></div></CardContent></Card>)}
        </section>

        <section id="receipts" className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Purchase Receipts</CardTitle><CardDescription>Finance cannot process payment unless the linked receipt is marked Complete.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {purchaseOrders.map((po) => <div key={po.po} className={`rounded-lg border p-4 text-sm ${po.receiptStatus === "Complete" ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"}`}><Truck className="mb-2 h-4 w-4" />{po.po} receipt is {po.receiptStatus}. {po.receiptStatus !== "Complete" && "Payment remains blocked."}<div className="mt-3"><Button size="sm" onClick={() => markReceiptComplete(po.po)} disabled={po.receiptStatus === "Complete"}>Mark Complete</Button></div></div>)}
            </CardContent>
          </Card>
          <Card id="recurring">
            <CardHeader className="flex flex-row items-start justify-between gap-4"><div><CardTitle>Recurring Bills</CardTitle><CardDescription>Monthly, quarterly and annual bills auto-generate with Finance notifications 7 days before due.</CardDescription></div><Button size="sm" onClick={() => setModal("recurring")}>Add</Button></CardHeader>
            <CardContent className="grid gap-3">{recurringBills.map((bill) => <div key={bill} className="flex items-center justify-between rounded-lg border p-3 text-sm"><span>{bill}</span><Badge variant="violet">Auto-generate</Badge></div>)}</CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader><CardTitle>Finance Calendar</CardTitle><CardDescription>Invoice due dates, rent payments, recurring bills, contract renewals and GST deadlines.</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-7 gap-2 text-center text-xs">{Array.from({ length: 35 }, (_, index) => <div key={index} className={`min-h-16 rounded-md border p-2 ${[6, 12, 18, 24, 28].includes(index) ? "bg-primary/10 text-primary" : "bg-card"}`}><span className="font-semibold">{index + 1}</span>{[6, 12, 18, 24, 28].includes(index) && <p className="mt-1">Due</p>}</div>)}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Budget Control</CardTitle><CardDescription>Approvals are blocked if budget is exceeded unless Finance Head applies an override.</CardDescription></CardHeader>
            <CardContent className="space-y-4">{budgets.map((budget) => { const used = Math.round(((budget.committed + budget.actual) / budget.allocated) * 100); return <div key={budget.department} className="space-y-2"><div className="flex items-center justify-between text-sm"><span className="font-medium">{budget.department}</span><span>{used}% used</span></div><Progress value={used} /><div className="flex items-center justify-between text-xs text-muted-foreground"><span>Remaining {money(budget.remaining)} of {money(budget.allocated)}</span>{used > 90 && <Button size="sm" variant="outline" onClick={() => log("FINANCE_OVERRIDE_APPLIED", budget.department, "Budget override allowed")}>Override</Button>}</div></div>; })}</CardContent>
          </Card>
        </section>

        <section id="reports" className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {["Procurement Report", "Vendor Spend Report", "Payment Forecast Report", "Budget Utilization Report", "Aging Report"].map((report) => <Card key={report}><CardHeader><CardTitle>{report}</CardTitle><CardDescription>Excel and PDF export ready.</CardDescription></CardHeader><CardContent><Button variant="outline" size="sm" onClick={() => csvDownload(`${report.toLowerCase().replaceAll(" ", "-")}.csv`, audit.map((item) => ({ report, action: item.action, user: item.user })))}><Download className="h-4 w-4" /> Export</Button></CardContent></Card>)}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader><CardTitle>Notifications</CardTitle><CardDescription>Email and in-app triggers.</CardDescription></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><p><Mail className="mr-2 inline h-4 w-4" /> PR submitted, approved or rejected</p><p><CalendarDays className="mr-2 inline h-4 w-4" /> Payment due in 7 days or overdue</p><p><ShieldAlert className="mr-2 inline h-4 w-4" /> Budget threshold or vendor document risk</p></CardContent></Card>
          <Card className="md:col-span-2"><CardHeader><CardTitle>Audit Trail</CardTitle><CardDescription>Every action logs user, timestamp, action, old value, new value and IP address.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Old</TableHead><TableHead>New</TableHead><TableHead>IP</TableHead></TableRow></TableHeader><TableBody>{audit.map((item, index) => <TableRow key={`${item.action}-${index}`}><TableCell>{item.user}</TableCell><TableCell>{item.action}</TableCell><TableCell>{item.oldValue}</TableCell><TableCell>{item.newValue}</TableCell><TableCell>{item.ip}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        </section>
      </div>

      {modal === "vendor" && <Modal title="Create Vendor Master" description="Capture vendor, GST, PAN, contact, banking and document status." onClose={() => setModal(null)}><div className="grid gap-3 md:grid-cols-2"><Input placeholder="Vendor Name" value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} /><select className={fieldClass()} value={vendorForm.type} onChange={(e) => setVendorForm({ ...vendorForm, type: e.target.value })}>{["Marketing", "Faculty", "Consultant", "Travel", "Technology", "Infrastructure", "Events", "Other"].map((item) => <option key={item}>{item}</option>)}</select><Input placeholder="GST Number" value={vendorForm.gst} onChange={(e) => setVendorForm({ ...vendorForm, gst: e.target.value })} /><Input placeholder="PAN Number" value={vendorForm.pan} onChange={(e) => setVendorForm({ ...vendorForm, pan: e.target.value })} /><Input placeholder="Contact Person" value={vendorForm.contactPerson} onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })} /><Input placeholder="Mobile" value={vendorForm.mobile} onChange={(e) => setVendorForm({ ...vendorForm, mobile: e.target.value })} /><Input placeholder="Email" value={vendorForm.email} onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })} /><Input placeholder="Bank Name" value={vendorForm.bankName} onChange={(e) => setVendorForm({ ...vendorForm, bankName: e.target.value })} /><Input placeholder="Account Number" value={vendorForm.accountNumber} onChange={(e) => setVendorForm({ ...vendorForm, accountNumber: e.target.value })} /><Input placeholder="IFSC Code" value={vendorForm.ifsc} onChange={(e) => setVendorForm({ ...vendorForm, ifsc: e.target.value })} /><Input placeholder="Beneficiary Name" value={vendorForm.beneficiary} onChange={(e) => setVendorForm({ ...vendorForm, beneficiary: e.target.value })} /><select className={fieldClass()} value={vendorForm.status} onChange={(e) => setVendorForm({ ...vendorForm, status: e.target.value })}>{["Active", "Blocked", "Under Review"].map((item) => <option key={item}>{item}</option>)}</select><div className="md:col-span-2 flex justify-end gap-2"><Button variant="outline" onClick={() => setModal(null)}>Cancel</Button><Button onClick={submitVendor}>Save Vendor</Button></div></div></Modal>}

      {modal === "pr" && <Modal title="New Purchase Request" description="Create a PR before engaging any vendor. Routing is calculated automatically." onClose={() => setModal(null)}><div className="grid gap-3 md:grid-cols-2"><select className={fieldClass()} value={prForm.department} onChange={(e) => setPrForm({ ...prForm, department: e.target.value })}>{["Growth", "Operations", "Student Experience", "Admissions", "HR", "Finance", "Leadership"].map((item) => <option key={item}>{item}</option>)}</select><select className={fieldClass()} value={prForm.vendor} onChange={(e) => setPrForm({ ...prForm, vendor: e.target.value })}>{vendors.map((vendor) => <option key={vendor.id}>{vendor.name}</option>)}</select><Input placeholder="Expense Category" value={prForm.budgetHead} onChange={(e) => setPrForm({ ...prForm, budgetHead: e.target.value })} /><select className={fieldClass()} value={prForm.priority} onChange={(e) => setPrForm({ ...prForm, priority: e.target.value })}>{["Critical", "High", "Medium", "Low"].map((item) => <option key={item}>{item}</option>)}</select><Input placeholder="Amount before GST" type="number" value={prForm.amount || ""} onChange={(e) => setPrForm({ ...prForm, amount: Number(e.target.value) })} /><Input placeholder="Required Date" type="date" /><Input className="md:col-span-2" placeholder="Description" value={prForm.description} onChange={(e) => setPrForm({ ...prForm, description: e.target.value })} /><Input className="md:col-span-2" placeholder="Business Justification" value={prForm.justification} onChange={(e) => setPrForm({ ...prForm, justification: e.target.value })} /><div className="md:col-span-2 rounded-lg border p-3 text-sm text-muted-foreground">GST auto-calculated at 18%. Route preview: {approvalRoute(prForm.amount + Math.round(prForm.amount * 0.18))}</div><div className="md:col-span-2 flex justify-end gap-2"><Button variant="outline" onClick={() => setModal(null)}>Cancel</Button><Button onClick={submitPurchaseRequest}>Submit PR</Button></div></div></Modal>}

      {modal === "recurring" && <Modal title="Create Recurring Bill" description="Automatically generate recurring liabilities and notify Finance seven days before due date." onClose={() => setModal(null)}><div className="grid gap-3"><Input placeholder="Recurring bill name" value={recurringName} onChange={(e) => setRecurringName(e.target.value)} /><select className={fieldClass()}><option>Monthly</option><option>Quarterly</option><option>Annual</option></select><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setModal(null)}>Cancel</Button><Button onClick={addRecurring}>Create</Button></div></div></Modal>}

      {modal === "invoice" && <Modal title="Submit Vendor Invoice" description="Invoice processing requires PO, GST, valid amount and complete receipt." onClose={() => setModal(null)}><div className="space-y-4"><div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"><AlertTriangle className="mb-2 h-4 w-4" /> Demo validation: invoices without a complete receipt will be placed On Hold automatically.</div><div className="grid gap-3 md:grid-cols-2"><Input placeholder="Invoice Number" /><select className={fieldClass()}>{purchaseOrders.map((po) => <option key={po.po}>{po.po}</option>)}</select><Input placeholder="Invoice Amount" type="number" /><Input placeholder="GST Amount" type="number" /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setModal(null)}>Cancel</Button><Button onClick={() => { setPayments((items) => [{ vendor: purchaseOrders[0]?.vendor ?? "New Vendor", invoice: `INV-${items.length + 1}`, amount: 118000, dueDate: "2026-07-15", priority: "High", days: 25, status: purchaseOrders[0]?.receiptStatus === "Complete" ? "Pending Approval" : "On Hold" }, ...items]); setModal(null); log("INVOICE_SUBMITTED", "None", "Validation applied"); }}>Submit Invoice</Button></div></div></Modal>}
    </AppShell>
  );
}
