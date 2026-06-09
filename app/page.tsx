import { AlertTriangle, CalendarDays, CheckCircle2, Download, FileText, IndianRupee, Mail, Plus, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { budgets, cashflow, dashboardKpis, purchaseRequests, upcomingPayments, vendors } from "@/lib/demo-data";
import { money } from "@/lib/utils";

function tone(priority: string) {
  if (["Critical", "Overdue", "Blocked", "On Hold"].includes(priority)) return "red";
  if (["High", "Pending Approval", "Under Review"].includes(priority)) return "amber";
  return "green";
}

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardKpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardHeader className="pb-2">
                <CardDescription>{kpi.label}</CardDescription>
                <CardTitle className="text-2xl">
                  {kpi.label.includes("%") ? `${kpi.value}%` : typeof kpi.value === "number" && kpi.value > 1000 ? money(kpi.value) : kpi.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={kpi.tone as "red" | "amber" | "green"}>{kpi.tone === "red" ? "Needs action" : kpi.tone === "amber" ? "Watch" : "Controlled"}</Badge>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Cashflow Forecast</CardTitle>
                <CardDescription>Week-wise projected payouts and 30/60/90 day liabilities.</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
                Forecast
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {cashflow.map((item) => (
                <div key={item.label} className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span>{money(item.amount)}</span>
                  </div>
                  <Progress value={Math.min(100, (item.amount / 22600000) * 100)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Priority Dashboard</CardTitle>
              <CardDescription>Auto-categorized by vendor type, category, SLA and compliance exposure.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {["Critical: Faculty, student experience, compliance, government fees, campaigns", "High: Consultants and SLA vendors", "Normal: General purchases"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border p-3">
                  <span className={`h-3 w-3 rounded-full ${item.startsWith("Critical") ? "bg-red-500" : item.startsWith("High") ? "bg-amber-500" : "bg-emerald-500"}`} />
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section id="bills" className="grid gap-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>No PO, incomplete receipt, duplicate invoice, and GST warnings are enforced before scheduling.</CardDescription>
              </div>
              <Button size="sm">
                <IndianRupee className="h-4 w-4" />
                Schedule Batch
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Days Remaining</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingPayments.map((payment) => (
                    <TableRow key={payment.invoice}>
                      <TableCell className="font-medium">{payment.vendor}</TableCell>
                      <TableCell>{payment.invoice}</TableCell>
                      <TableCell>{money(payment.amount)}</TableCell>
                      <TableCell>{payment.dueDate}</TableCell>
                      <TableCell><Badge variant={tone(payment.priority) as "red" | "amber" | "green"}>{payment.priority}</Badge></TableCell>
                      <TableCell>{payment.days}</TableCell>
                      <TableCell><Badge variant={tone(payment.status) as "red" | "amber" | "green"}>{payment.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        <section id="vendors" className="grid gap-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Vendor Management</CardTitle>
                <CardDescription>Vendor master with GST, PAN, banking, documents, status controls and payment block flag.</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Add Vendor
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid gap-3 md:grid-cols-4">
                <Input placeholder="Vendor name" />
                <Input placeholder="GST number" />
                <Input placeholder="Vendor type" />
                <Input placeholder="Status" />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>GST</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>{vendor.id}</TableCell>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell>{vendor.type}</TableCell>
                      <TableCell>{vendor.gst}</TableCell>
                      <TableCell>{vendor.documents}</TableCell>
                      <TableCell><Badge variant={tone(vendor.status) as "red" | "amber" | "green"}>{vendor.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        <section id="purchase-requests" className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Requests</CardTitle>
              <CardDescription>Employees must submit PRs before vendor engagement. Approval routing is automatic.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PR</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseRequests.map((request) => (
                    <TableRow key={request.number}>
                      <TableCell className="font-medium">{request.number}</TableCell>
                      <TableCell>{request.department}</TableCell>
                      <TableCell>{request.vendor}</TableCell>
                      <TableCell>{money(request.total)}</TableCell>
                      <TableCell><Badge variant={tone(request.priority) as "red" | "amber" | "green"}>{request.priority}</Badge></TableCell>
                      <TableCell>{request.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Approval Matrix</CardTitle>
              <CardDescription>Comments are mandatory for approve, reject, send back and hold actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {["<= Rs 25,000: Manager + Finance", "Rs 25,001 - Rs 1,00,000: Manager + Finance", "Rs 1,00,001 - Rs 5,00,000: Manager + Finance Head", "Above Rs 5,00,000: Manager + Finance Head + Founder"].map((rule) => (
                <div key={rule} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {rule}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section id="purchase-orders" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {["PO-2026-00001", "PO PDF Generation", "Email PO to Vendor", "ERP Release Queue"].map((item, index) => (
            <Card key={item}>
              <CardHeader>
                <CardTitle>{item}</CardTitle>
                <CardDescription>{index === 0 ? "Approved PO linked to PR-2026-00002." : "Finance-only controlled action."}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4" />
                  Open
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section id="receipts" className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Receipts</CardTitle>
              <CardDescription>Finance cannot process payment unless the linked receipt is marked Complete.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                <AlertTriangle className="mb-2 h-4 w-4" />
                PO-2026-00001 has partial receipt. Invoice BFC-2026-118 is automatically held.
              </div>
              <Button>Mark Complete</Button>
            </CardContent>
          </Card>
          <Card id="recurring">
            <CardHeader>
              <CardTitle>Recurring Bills</CardTitle>
              <CardDescription>Monthly, quarterly and annual bills auto-generate with Finance notifications 7 days before due.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {["WeWork Rent - Monthly", "Internet - Monthly", "Software Subscriptions - Annual", "Electricity - Monthly", "Security Services - Monthly"].map((bill) => (
                <div key={bill} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <span>{bill}</span>
                  <Badge variant="violet">Auto-generate</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Finance Calendar</CardTitle>
              <CardDescription>Invoice due dates, rent payments, recurring bills, contract renewals and GST deadlines.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-7 gap-2 text-center text-xs">
              {Array.from({ length: 35 }, (_, index) => (
                <div key={index} className={`min-h-16 rounded-md border p-2 ${[6, 12, 18, 24, 28].includes(index) ? "bg-primary/10 text-primary" : "bg-card"}`}>
                  <span className="font-semibold">{index + 1}</span>
                  {[6, 12, 18, 24, 28].includes(index) && <p className="mt-1">Due</p>}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Budget Control</CardTitle>
              <CardDescription>Approvals are blocked if budget is exceeded unless Finance Head applies an override.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgets.map((budget) => {
                const used = Math.round(((budget.committed + budget.actual) / budget.allocated) * 100);
                return (
                  <div key={budget.department} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{budget.department}</span>
                      <span>{used}% used</span>
                    </div>
                    <Progress value={used} />
                    <p className="text-xs text-muted-foreground">Remaining {money(budget.remaining)} of {money(budget.allocated)}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>

        <section id="reports" className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {["Procurement Report", "Vendor Spend Report", "Payment Forecast Report", "Budget Utilization Report", "Aging Report"].map((report) => (
            <Card key={report}>
              <CardHeader>
                <CardTitle>{report}</CardTitle>
                <CardDescription>Excel and PDF export ready.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Email and in-app triggers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><Mail className="mr-2 inline h-4 w-4" /> PR submitted, approved or rejected</p>
              <p><CalendarDays className="mr-2 inline h-4 w-4" /> Payment due in 7 days or overdue</p>
              <p><ShieldAlert className="mr-2 inline h-4 w-4" /> Budget threshold or vendor document risk</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Every action logs user, timestamp, action, old value, new value and IP address.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Old</TableHead><TableHead>New</TableHead><TableHead>IP</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Dev Finance</TableCell><TableCell>BILL_HELD_RECEIPT_INCOMPLETE</TableCell><TableCell>Submitted</TableCell><TableCell>On Hold</TableCell><TableCell>10.0.0.42</TableCell></TableRow>
                  <TableRow><TableCell>Meera Manager</TableCell><TableCell>PR_APPROVED</TableCell><TableCell>Submitted</TableCell><TableCell>Manager Approved</TableCell><TableCell>10.0.0.18</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
