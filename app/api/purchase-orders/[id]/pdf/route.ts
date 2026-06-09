import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { assertPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  assertPermission(user.role, "po:write");
  const { id } = await params;
  const po = await prisma.purchaseOrder.findUnique({ where: { id }, include: { vendor: true, purchaseRequest: true } });
  if (!po) return NextResponse.json({ error: "PO not found" }, { status: 404 });

  const html = `
    <html>
      <body>
        <h1>Bower School of Entrepreneurship - Purchase Order</h1>
        <p><strong>PO Number:</strong> ${po.poNumber}</p>
        <p><strong>Vendor:</strong> ${po.vendor.name}</p>
        <p><strong>PR Number:</strong> ${po.purchaseRequest.requestNumber}</p>
        <p><strong>Deliverables:</strong> ${po.deliverables}</p>
        <p><strong>Total:</strong> ${po.total.toString()}</p>
        <p><strong>Payment Terms:</strong> ${po.paymentTerms}</p>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-disposition": `attachment; filename="${po.poNumber}.html"`
    }
  });
}
