import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  MOCK_TRANSACTIONS,
  getMonthlyTotal,
  getCategoryBreakdown,
  formatINR,
} from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { TransactionTable } from "@/components/dashboard/transaction-table";
import { TrendingUp, Wallet, LayoutGrid, AlertCircle } from "lucide-react";

export default async function DashboardPage() {
  // ── Auth (unchanged) ──────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : null;

  if (error || !data?.claims) {
    redirect("/login");
  }

  // ── Derived data (mock) ───────────────────────────────────────────────────
  const monthlyTotal = getMonthlyTotal(MOCK_TRANSACTIONS);
  const categoryBreakdown = getCategoryBreakdown(MOCK_TRANSACTIONS);
  const reviewCount = MOCK_TRANSACTIONS.filter((t) => t.status === "review").length;
  const txnCount = MOCK_TRANSACTIONS.filter((t) => t.transaction_type === "debit").length;

  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <main className="min-h-screen bg-background">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight text-foreground">
              SpendMirror
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:block">{email}</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase text-muted-foreground">
              {email ? email[0] : "U"}
            </span>
          </div>
        </div>
      </header>

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{monthLabel}</p>
        </div>

        {/* ── Summary cards ───────────────────────────────────────────────── */}
        <section aria-label="Summary" className="grid gap-4 sm:grid-cols-3">
          {/* Total spent this month */}
          <Card className="sm:col-span-1">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent This Month
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {formatINR(monthlyTotal)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {txnCount} debit transaction{txnCount !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          {/* Top category */}
          <Card className="sm:col-span-1">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Top Category
              </CardTitle>
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {categoryBreakdown[0] ? (
                <>
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {categoryBreakdown[0].category}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatINR(categoryBreakdown[0].amount)} spent
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">No data</p>
              )}
            </CardContent>
          </Card>

          {/* Review queue */}
          <Card className="sm:col-span-1">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Needs Review
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {reviewCount}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Low-confidence extraction{reviewCount !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* ── Chart + breakdown ────────────────────────────────────────────── */}
        <section
          aria-label="Category breakdown"
          className="grid gap-4 lg:grid-cols-5"
        >
          {/* Pie chart */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Spending by category for {monthLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryPieChart data={categoryBreakdown} />
            </CardContent>
          </Card>

          {/* Category list */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>By Category</CardTitle>
              <CardDescription>Ranked by spend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryBreakdown.map((entry, i) => {
                const pct = monthlyTotal
                  ? Math.round((entry.amount / monthlyTotal) * 100)
                  : 0;
                return (
                  <div key={entry.category}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium text-foreground">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        {entry.category}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {formatINR(entry.amount)}
                      </span>
                    </div>
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${entry.category}: ${pct}%`}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: entry.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>

        {/* ── Transactions ─────────────────────────────────────────────────── */}
        <section aria-label="Transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                Search, filter, and sort your spending history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={MOCK_TRANSACTIONS} />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
