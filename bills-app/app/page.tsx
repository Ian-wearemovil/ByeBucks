"use client";

import { useState, useEffect } from "react";

interface Bill {
  id: number;
  name: string;
  amount: number;
  due_date: string;
  month: number;
  year: number;
  is_recurring: boolean;
  is_paid: boolean;
  receipt_url: string | null;
  notification_days: number;
}

export default function Home() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBills();
    checkNotifications();
    const notificationInterval = setInterval(checkNotifications, 60000 * 60);
    return () => clearInterval(notificationInterval);
  }, [currentMonth, currentYear]);

  const checkNotifications = async () => {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const response = await fetch("/api/notifications");
        const notifications = await response.json();
        
        notifications.forEach((notif: any) => {
          new Notification(notif.title, {
            body: notif.message,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
          });
        });
      } catch (error) {
        console.error("Failed to check notifications:", error);
      }
    }
  };

  const loadBills = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/bills?month=${currentMonth}&year=${currentYear}`
      );
      const data = await response.json();
      setBills(data);
    } catch (error) {
      console.error("Failed to load bills:", error);
    }
    setLoading(false);
  };

  const handleAddBill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const bill = {
      name: formData.get("name"),
      amount: parseFloat(formData.get("amount") as string),
      due_date: formData.get("due_date"),
      month: currentMonth,
      year: currentYear,
      is_recurring: formData.get("is_recurring") === "on",
      notification_days: parseInt(formData.get("notification_days") as string) || 3,
    };

    try {
      const response = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bill),
      });

      if (response.ok) {
        setShowAddModal(false);
        loadBills();
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      console.error("Failed to add bill:", error);
    }
  };

  const handleTogglePaid = async (bill: Bill) => {
    try {
      await fetch(`/api/bills/${bill.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_paid: !bill.is_paid }),
      });
      loadBills();
    } catch (error) {
      console.error("Failed to update bill:", error);
    }
  };

  const handleUploadReceipt = async (billId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (uploadResponse.ok) {
        const { url } = await uploadResponse.json();
        await fetch(`/api/bills/${billId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receipt_url: url }),
        });
        loadBills();
      }
    } catch (error) {
      console.error("Failed to upload receipt:", error);
    }
  };

  const handleDeleteBill = async (billId: number) => {
    if (!confirm("Delete this bill?")) return;
    
    try {
      await fetch(`/api/bills/${billId}`, { method: "DELETE" });
      loadBills();
    } catch (error) {
      console.error("Failed to delete bill:", error);
    }
  };

  const changeMonth = (delta: number) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const totalAmount = bills.reduce((sum, bill) => sum + Number(bill.amount), 0);
  const paidAmount = bills
    .filter((b) => b.is_paid)
    .reduce((sum, bill) => sum + Number(bill.amount), 0);
  const unpaidAmount = totalAmount - paidAmount;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>Bills Tracker</h1>
        <button 
          className="install-button"
          id="install-button"
          style={{ display: "none" }}
        >
          Install App
        </button>
      </header>

      <div className="month-selector">
        <button onClick={() => changeMonth(-1)} className="nav-button">←</button>
        <h2>{monthNames[currentMonth - 1]} {currentYear}</h2>
        <button onClick={() => changeMonth(1)} className="nav-button">→</button>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-label">Total</div>
          <div className="summary-value">${totalAmount.toFixed(2)}</div>
        </div>
        <div className="summary-card paid">
          <div className="summary-label">Paid</div>
          <div className="summary-value">${paidAmount.toFixed(2)}</div>
        </div>
        <div className="summary-card unpaid">
          <div className="summary-label">Unpaid</div>
          <div className="summary-value">${unpaidAmount.toFixed(2)}</div>
        </div>
      </div>

      <div className="bills-list">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : bills.length === 0 ? (
          <div className="empty-state">No bills for this month</div>
        ) : (
          bills.map((bill) => (
            <div key={bill.id} className={`bill-card ${bill.is_paid ? "paid" : ""}`}>
              <div className="bill-header">
                <div>
                  <h3>{bill.name}</h3>
                  {bill.is_recurring && <span className="recurring-badge">Recurring</span>}
                </div>
                <div className="bill-amount">${Number(bill.amount).toFixed(2)}</div>
              </div>
              <div className="bill-details">
                <div>Due: {new Date(bill.due_date).toLocaleDateString()}</div>
                <div>Remind: {bill.notification_days} days before</div>
              </div>
              <div className="bill-actions">
                <button
                  onClick={() => handleTogglePaid(bill)}
                  className={`action-button ${bill.is_paid ? "unpay" : "pay"}`}
                >
                  {bill.is_paid ? "Mark Unpaid" : "Mark Paid"}
                </button>
                {bill.is_paid && !bill.receipt_url && (
                  <label className="action-button upload">
                    Upload Receipt
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadReceipt(bill.id, file);
                      }}
                    />
                  </label>
                )}
                {bill.receipt_url && (
                  <a
                    href={bill.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-button view"
                  >
                    View Receipt
                  </a>
                )}
                <button
                  onClick={() => handleDeleteBill(bill.id)}
                  className="action-button delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="fab" onClick={() => setShowAddModal(true)}>+</button>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Bill</h2>
            <form onSubmit={handleAddBill}>
              <div className="form-group">
                <label>Bill Name</label>
                <input type="text" name="name" required />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input type="number" name="amount" step="0.01" required />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" name="due_date" required />
              </div>
              <div className="form-group">
                <label>Reminder (days before)</label>
                <input type="number" name="notification_days" defaultValue="3" min="0" />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" name="is_recurring" />
                  Recurring bill
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit">Add Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
