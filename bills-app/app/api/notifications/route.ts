import { NextRequest } from "next/server";
import { sql } from "../../../src/lib/db";

export const dynamic = "force-dynamic";

interface Bill {
  id: number;
  name: string;
  amount: number;
  due_date: string;
  notification_days: number;
}

export async function GET(request: NextRequest) {
  const owner = "user"; // Will use real identity later
  
  const today = new Date();
  const checkUntil = new Date();
  checkUntil.setDate(today.getDate() + 7);

  const bills = await sql<Bill>(
    `select id, name, amount, due_date, notification_days
     from bills
     where owner = $1
       and is_paid = false
       and due_date >= $2
       and due_date <= $3
     order by due_date asc`,
    [owner, today.toISOString().split("T")[0], checkUntil.toISOString().split("T")[0]]
  );

  const notifications = bills
    .filter((bill) => {
      const dueDate = new Date(bill.due_date);
      const notifyDate = new Date(dueDate);
      notifyDate.setDate(dueDate.getDate() - bill.notification_days);
      return notifyDate <= today;
    })
    .map((bill) => ({
      id: bill.id,
      title: "Bill Due Soon",
      message: `${bill.name} - $${Number(bill.amount).toFixed(2)} due on ${new Date(bill.due_date).toLocaleDateString()}`,
      dueDate: bill.due_date,
    }));

  return Response.json(notifications);
}
