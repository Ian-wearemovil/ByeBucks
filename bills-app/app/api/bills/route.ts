import { NextRequest } from "next/server";
import { sql } from "../../../src/lib/db";

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const owner = "user"; // Will use real identity later

  if (!month || !year) {
    return Response.json({ error: "Month and year required" }, { status: 400 });
  }

  const bills = await sql<Bill>(
    "select * from bills where owner = $1 and month = $2 and year = $3 order by due_date asc",
    [owner, parseInt(month), parseInt(year)]
  );

  return Response.json(bills, {
    headers: { "cache-control": "private, no-store" }
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, amount, due_date, month, year, is_recurring, notification_days } = body;
  const owner = "user"; // Will use real identity later

  if (!name || !amount || !due_date || !month || !year) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await sql<Bill>(
    `insert into bills (owner, name, amount, due_date, month, year, is_recurring, notification_days)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning *`,
    [owner, name, amount, due_date, month, year, is_recurring || false, notification_days || 3]
  );

  return Response.json(result[0], {
    status: 201,
    headers: { "cache-control": "private, no-store" }
  });
}
