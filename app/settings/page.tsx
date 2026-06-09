import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>RBAC Settings</CardTitle><CardDescription>Role access is enforced on every API route and screen.</CardDescription></CardHeader>
          <CardContent className="grid gap-2">
            {["Employee", "Reporting Manager", "Finance", "Finance Head", "Founder/CEO", "Admin"].map((role) => <div key={role} className="flex justify-between rounded-lg border p-3"><span>{role}</span><Badge>Enabled</Badge></div>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Controls</CardTitle><CardDescription>Finance rules that prevent unauthorized payment release.</CardDescription></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>No PO = No Invoice Processing</p>
            <p>Receipt must be Complete before payment scheduling</p>
            <p>Budget exceed blocks approval unless Finance Head overrides</p>
            <p>Duplicate invoice, missing GST and PO overage warnings are mandatory</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
