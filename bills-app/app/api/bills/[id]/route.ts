import { NextRequest } from "next/server";
import { sql } from "../../../../src/lib/db";
import { requireIdentity } from "../../../../cursor/identity";

export const dynamic = "force-dynamic";

interface Bill {
  id: number;
  owner: string;
  name: string;
  amount: number;
  due_date: string;
  month: number;
  year: number;
  is_recurring: boolean;
  is_paid: boolean;
  paid_at: string | null;
  receipt_url: string | null;
  notification_days: number;
  created_at: string;
  updated_at: string;
}

function isValidReceiptUrl(url: string | null): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url, "http://example.com");
    const scheme = parsed.protocol.slice(0, -1);
    return scheme === "http" || scheme === "https";
  } catch {
    return false;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;

  const body = await request.json();
  const id = params.id;

  if (body.receipt_url !== undefined && !isValidReceiptUrl(body.receipt_url)) {
    return Response.json({ error: "Invalid receipt URL scheme" }, { status: 400 });
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (body.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(body.name);
  }
  if (body.amount !== undefined) {
    updates.push(`amount = $${paramIndex++}`);
    values.push(body.amount);
  }
  if (body.due_date !== undefined) {
    updates.push(`due_date = $${paramIndex++}`);
    values.push(body.due_date);
  }
  if (body.is_recurring !== undefined) {
    updates.push(`is_recurring = $${paramIndex++}`);
    values.push(body.is_recurring);
  }
  if (body.is_paid !== undefined) {
    updates.push(`is_paid = $${paramIndex++}`);
    values.push(body.is_paid);
    if (body.is_paid) {
      updates.push(`paid_at = $${paramIndex++}`);
      values.push(new Date().toISOString());
    }
  }
  if (body.receipt_url !== undefined) {
    updates.push(`receipt_url = $${paramIndex++}`);
    values.push(body.receipt_url);
  }
  if (body.notification_days !== undefined) {
    updates.push(`notification_days = $${paramIndex++}`);
    values.push(body.notification_days);
  }

  updates.push(`updated_at = $${paramIndex++}`);
  values.push(new Date().toISOString());

  values.push(identity.sub);
  values.push(id);

  const result = await sql<Bill>(
    `update bills set ${updates.join(", ")}
     where owner = $${paramIndex++} and id = $${paramIndex++}
     returning *`,
    values
  );

  if (result.length === 0) {
    return Response.json({ error: "Bill not found" }, { status: 404 });
  }

  return Response.json(result[0], {
    headers: { "cache-control": "private, no-store" }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;

  const id = params.id;

  const result = await sql(
    "delete from bills where owner = $1 and id = $2 returning id",
    [identity.sub, id]
  );

  if (result.length === 0) {
    return Response.json({ error: "Bill not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
