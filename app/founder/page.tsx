import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { budgets, founderMetrics, upcomingPayments, vendors } from "@/lib/demo-data";
import { money } from "@/lib/utils";

export default function FounderDashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          {founderMetrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader><CardDescription>{metric.label}</CardDescription><CardTitle className="text-2xl">{metric.label.includes("Variance") ? `${metric.value}%` : money(metric.value)}</CardTitle></CardHeader>
            </Card>
          ))}
        </section>
        <section className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Top Vendors</CardTitle><CardDescription>Top 20 vendor view for commitment concentration.</CardDescription></CardHeader>
            <CardContent>
              <Table><TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
                {vendors.map((vendor) => <TableRow key={vendor.id}><TableCell>{vendor.name}</TableCell><TableCell>{vendor.type}</TableCell><TableCell><Badge>{vendor.status}</Badge></TableCell></TableRow>)}
              </TableBody></Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Department Spending Ranking</CardTitle><CardDescription>Actual plus committed spend.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {budgets.sort((a, b) => b.actual + b.committed - (a.actual + a.committed)).map((budget, index) => (
                <div key={budget.department} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <span>{index + 1}. {budget.department}</span>
                  <span>{money(budget.actual + budget.committed)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
        <Card>
          <CardHeader><CardTitle>Approval Queue & Cash Burn Trend</CardTitle><CardDescription>Founder approvals and monthly cash requirement in one view.</CardDescription></CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Invoice</TableHead><TableHead>Amount</TableHead><TableHead>Priority</TableHead></TableRow></TableHeader><TableBody>
              {upcomingPayments.filter((payment) => payment.priority === "Critical").map((payment) => <TableRow key={payment.invoice}><TableCell>{payment.vendor}</TableCell><TableCell>{payment.invoice}</TableCell><TableCell>{money(payment.amount)}</TableCell><TableCell><Badge variant="red">{payment.priority}</Badge></TableCell></TableRow>)}
            </TableBody></Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
