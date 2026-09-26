/**
 * Mock transaction data for dashboard UI development.
 * Replace with real API/DB calls when the backend pipeline is ready.
 */

export type Category =
  | "Food & Dining"
  | "Groceries"
  | "Shopping"
  | "Transport"
  | "Bills & Utilities"
  | "Entertainment"
  | "Health"
  | "Travel"
  | "Other";

export type TransactionType = "debit" | "credit" | "refund";
export type TransactionStatus = "auto" | "review" | "edited";

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  currency: "INR";
  txn_date: string; // ISO date string YYYY-MM-DD
  category: Category;
  transaction_type: TransactionType;
  confidence: number;
  status: TransactionStatus;
  source_snippet: string;
}

// Current month: September 2026
export const MOCK_TRANSACTIONS: Transaction[] = [
  // --- September 2026 ---
  {
    id: "txn-001",
    merchant: "Swiggy",
    amount: 450,
    currency: "INR",
    txn_date: "2026-09-24",
    category: "Food & Dining",
    transaction_type: "debit",
    confidence: 0.97,
    status: "auto",
    source_snippet: "Your order from Swiggy has been placed. Amount: ₹450",
  },
  {
    id: "txn-002",
    merchant: "Zomato",
    amount: 320,
    currency: "INR",
    txn_date: "2026-09-23",
    category: "Food & Dining",
    transaction_type: "debit",
    confidence: 0.95,
    status: "auto",
    source_snippet: "Zomato order confirmed. Total: ₹320",
  },
  {
    id: "txn-003",
    merchant: "Amazon",
    amount: 1899,
    currency: "INR",
    txn_date: "2026-09-22",
    category: "Shopping",
    transaction_type: "debit",
    confidence: 0.99,
    status: "auto",
    source_snippet: "Your Amazon.in order #405-1234567 for ₹1,899 has been placed.",
  },
  {
    id: "txn-004",
    merchant: "BMTC",
    amount: 50,
    currency: "INR",
    txn_date: "2026-09-22",
    category: "Transport",
    transaction_type: "debit",
    confidence: 0.88,
    status: "auto",
    source_snippet: "UPI payment of ₹50 to BMTC confirmed.",
  },
  {
    id: "txn-005",
    merchant: "Namma Metro",
    amount: 35,
    currency: "INR",
    txn_date: "2026-09-21",
    category: "Transport",
    transaction_type: "debit",
    confidence: 0.93,
    status: "auto",
    source_snippet: "Metro card recharge ₹35 successful.",
  },
  {
    id: "txn-006",
    merchant: "BigBasket",
    amount: 2340,
    currency: "INR",
    txn_date: "2026-09-20",
    category: "Groceries",
    transaction_type: "debit",
    confidence: 0.96,
    status: "auto",
    source_snippet: "BigBasket order delivered. Amount paid: ₹2,340",
  },
  {
    id: "txn-007",
    merchant: "Netflix",
    amount: 649,
    currency: "INR",
    txn_date: "2026-09-19",
    category: "Entertainment",
    transaction_type: "debit",
    confidence: 0.99,
    status: "auto",
    source_snippet: "Netflix subscription renewed for ₹649.",
  },
  {
    id: "txn-008",
    merchant: "Airtel",
    amount: 399,
    currency: "INR",
    txn_date: "2026-09-18",
    category: "Bills & Utilities",
    transaction_type: "debit",
    confidence: 0.98,
    status: "auto",
    source_snippet: "Airtel postpaid bill of ₹399 paid successfully.",
  },
  {
    id: "txn-009",
    merchant: "Ola",
    amount: 210,
    currency: "INR",
    txn_date: "2026-09-18",
    category: "Transport",
    transaction_type: "debit",
    confidence: 0.91,
    status: "auto",
    source_snippet: "Ola ride payment ₹210 debited via UPI.",
  },
  {
    id: "txn-010",
    merchant: "Apollo Pharmacy",
    amount: 875,
    currency: "INR",
    txn_date: "2026-09-17",
    category: "Health",
    transaction_type: "debit",
    confidence: 0.82,
    status: "review",
    source_snippet: "Apollo order delivered. Total: ₹875",
  },
  {
    id: "txn-011",
    merchant: "Flipkart",
    amount: 3299,
    currency: "INR",
    txn_date: "2026-09-16",
    category: "Shopping",
    transaction_type: "debit",
    confidence: 0.97,
    status: "auto",
    source_snippet: "Flipkart order confirmed. Pay on delivery: ₹3,299",
  },
  {
    id: "txn-012",
    merchant: "PVR Cinemas",
    amount: 480,
    currency: "INR",
    txn_date: "2026-09-15",
    category: "Entertainment",
    transaction_type: "debit",
    confidence: 0.94,
    status: "auto",
    source_snippet: "PVR booking confirmed. 2 tickets x ₹240 = ₹480",
  },
  {
    id: "txn-013",
    merchant: "BESCOM",
    amount: 1240,
    currency: "INR",
    txn_date: "2026-09-14",
    category: "Bills & Utilities",
    transaction_type: "debit",
    confidence: 0.99,
    status: "auto",
    source_snippet: "BESCOM electricity bill of ₹1,240 paid.",
  },
  {
    id: "txn-014",
    merchant: "MakeMyTrip",
    amount: 5800,
    currency: "INR",
    txn_date: "2026-09-13",
    category: "Travel",
    transaction_type: "debit",
    confidence: 0.93,
    status: "auto",
    source_snippet: "Flight booking BLR → DEL confirmed. Amount: ₹5,800",
  },
  {
    id: "txn-015",
    merchant: "Dunzo",
    amount: 145,
    currency: "INR",
    txn_date: "2026-09-12",
    category: "Groceries",
    transaction_type: "debit",
    confidence: 0.87,
    status: "auto",
    source_snippet: "Dunzo delivery order ₹145 completed.",
  },
  {
    id: "txn-016",
    merchant: "Rapido",
    amount: 75,
    currency: "INR",
    txn_date: "2026-09-11",
    category: "Transport",
    transaction_type: "debit",
    confidence: 0.9,
    status: "auto",
    source_snippet: "Rapido bike ride payment ₹75 received.",
  },
  {
    id: "txn-017",
    merchant: "Cult.fit",
    amount: 1800,
    currency: "INR",
    txn_date: "2026-09-10",
    category: "Health",
    transaction_type: "debit",
    confidence: 0.96,
    status: "auto",
    source_snippet: "Cult.fit monthly membership renewed. ₹1,800 debited.",
  },
  {
    id: "txn-018",
    merchant: "Spotify",
    amount: 119,
    currency: "INR",
    txn_date: "2026-09-09",
    category: "Entertainment",
    transaction_type: "debit",
    confidence: 0.99,
    status: "auto",
    source_snippet: "Spotify Premium renewed for ₹119.",
  },
  {
    id: "txn-019",
    merchant: "Amazon",
    amount: 499,
    currency: "INR",
    txn_date: "2026-09-08",
    category: "Shopping",
    transaction_type: "refund",
    confidence: 0.98,
    status: "auto",
    source_snippet: "Refund of ₹499 from Amazon for returned item.",
  },
  {
    id: "txn-020",
    merchant: "HDFC Bank",
    amount: 250,
    currency: "INR",
    txn_date: "2026-09-07",
    category: "Bills & Utilities",
    transaction_type: "debit",
    confidence: 0.72,
    status: "review",
    source_snippet: "HDFC credit card annual fee ₹250 debited.",
  },
  {
    id: "txn-021",
    merchant: "Meesho",
    amount: 650,
    currency: "INR",
    txn_date: "2026-09-06",
    category: "Shopping",
    transaction_type: "debit",
    confidence: 0.85,
    status: "auto",
    source_snippet: "Meesho order delivered. ₹650 paid via UPI.",
  },
  {
    id: "txn-022",
    merchant: "Swiggy Instamart",
    amount: 580,
    currency: "INR",
    txn_date: "2026-09-05",
    category: "Groceries",
    transaction_type: "debit",
    confidence: 0.94,
    status: "auto",
    source_snippet: "Swiggy Instamart order delivered. ₹580 charged.",
  },
  {
    id: "txn-023",
    merchant: "BookMyShow",
    amount: 360,
    currency: "INR",
    txn_date: "2026-09-04",
    category: "Entertainment",
    transaction_type: "debit",
    confidence: 0.96,
    status: "auto",
    source_snippet: "BookMyShow event tickets booked. ₹360 paid.",
  },
  {
    id: "txn-024",
    merchant: "Practo",
    amount: 300,
    currency: "INR",
    txn_date: "2026-09-03",
    category: "Health",
    transaction_type: "debit",
    confidence: 0.89,
    status: "auto",
    source_snippet: "Practo online consultation fee ₹300 paid.",
  },
  {
    id: "txn-025",
    merchant: "Uber",
    amount: 195,
    currency: "INR",
    txn_date: "2026-09-02",
    category: "Transport",
    transaction_type: "debit",
    confidence: 0.95,
    status: "auto",
    source_snippet: "Uber ride payment of ₹195 processed.",
  },
  {
    id: "txn-026",
    merchant: "Zepto",
    amount: 420,
    currency: "INR",
    txn_date: "2026-09-01",
    category: "Groceries",
    transaction_type: "debit",
    confidence: 0.92,
    status: "auto",
    source_snippet: "Zepto order ₹420 delivered in 10 mins.",
  },
];

// ─── Derived helpers ─────────────────────────────────────────────────────────

/** All categories from the PRD canonical list */
export const CATEGORIES: Category[] = [
  "Food & Dining",
  "Groceries",
  "Shopping",
  "Transport",
  "Bills & Utilities",
  "Entertainment",
  "Health",
  "Travel",
  "Other",
];

line_items: [
  { item_name: "Wireless Optical Mouse", price: 499.00, quantity: 1 },
  { item_name: "64GB MicroSD Card", price: 750.00, quantity: 1 },
]

/** Category → accent color (for pie chart and badges) */
export const CATEGORY_COLORS: Record<Category, string> = {
  "Food & Dining": "#f97316",
  Groceries: "#22c55e",
  Shopping: "#8b5cf6",
  Transport: "#3b82f6",
  "Bills & Utilities": "#ef4444",
  Entertainment: "#ec4899",
  Health: "#14b8a6",
  Travel: "#f59e0b",
  Other: "#6b7280",
};

/** Format a number as INR currency string */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Compute total spend (debits only) for the current calendar month */
export function getMonthlyTotal(transactions: Transaction[]): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  return transactions
    .filter((t) => {
      if (t.transaction_type !== "debit") return false;
      const d = new Date(t.txn_date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Aggregate spend by category (debits only) for a list of transactions */
export function getCategoryBreakdown(
  transactions: Transaction[]
): { category: Category; amount: number; color: string }[] {
  const map = new Map<Category, number>();
  for (const t of transactions) {
    if (t.transaction_type === "debit") {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      color: CATEGORY_COLORS[category],
    }));
}
