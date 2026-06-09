import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { budgets, cashflow, upcomingPayments } from "@/lib/demo-data";
import { money } from "@/lib/utils";

export default function FinanceDashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader><CardDescription>Unauthorized payment blocks</CardDescription><CardTitle className="text-3xl">23</CardTitle></CardHeader><CardContent><Badge variant="red">Active controls</Badge></CardContent></Card>
          <Card><CardHeader><CardDescription>Future liabilities</CardDescription><CardTitle className="text-3xl">{money(22600000)}</CardTitle></CardHeader><CardContent><Badge variant="amber">90 day view</Badge></CardContent></Card>
          <Card><CardHeader><CardDescription>Finance overrides</CardDescription><CardTitle className="text-3xl">2</CardTitle></CardHeader><CardContent><Badge variant="violet">Finance Head only</Badge></CardContent></Card>
        </section>
        <section className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Liability Forecast</CardTitle><CardDescription>Finance visibility into future cash requirements.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {cashflow.map((item) => <div key={item.label}><div className="mb-2 flex justify-between text-sm"><span>{item.label}</span><span>{money(item.amount)}</span></div><Progress value={(item.amount / 22600000) * 100} /></div>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Payment Release Queue</CardTitle><CardDescription>Only approved invoices with complete receipts can be scheduled.</CardDescription></CardHeader>
            <CardContent>
              <Table><TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Invoice</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>
                {upcomingPayments.map((payment) => <TableRow key={payment.invoice}><TableCell>{payment.vendor}</TableCell><TableCell>{payment.invoice}</TableCell><TableCell>{money(payment.amount)}</TableCell><TableCell>{payment.status}</TableCell></TableRow>)}
              </TableBody></Table>
            </CardContent>
          </Card>
        </section>
        <Card>
          <CardHeader><CardTitle>Budget Gatekeeping</CardTitle><CardDescription>Approval blocking and override queue.</CardDescription></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {budgets.map((budget) => {
              const used = Math.round(((budget.actual + budget.committed) / budget.allocated) * 100);
              return <div key={budget.department} className="rounded-lg border p-4"><div className="mb-2 flex justify-between text-sm"><span className="font-medium">{budget.department}</span><span>{used}%</span></div><Progress value={used} /><p className="mt-2 text-xs text-muted-foreground">{money(budget.remaining)} remaining</p></div>;
            })}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
