"use client";

import { useState, useMemo } from "react";
import {
  type Transaction,
  type Category,
  CATEGORIES,
  CATEGORY_COLORS,
  formatINR,
} from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
}

type SortKey = "txn_date" | "amount" | "merchant";
type SortDir = "asc" | "desc";

const STATUS_STYLES: Record<Transaction["status"], string> = {
  auto: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  review: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  edited: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
};

const TYPE_STYLES: Record<Transaction["transaction_type"], string> = {
  debit: "text-red-500 dark:text-red-400",
  credit: "text-emerald-600 dark:text-emerald-400",
  refund: "text-blue-500 dark:text-blue-400",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [typeFilter, setTypeFilter] = useState<Transaction["transaction_type"] | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("txn_date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    let list = transactions;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.merchant.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.source_snippet.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      list = list.filter((t) => t.category === categoryFilter);
    }

    if (typeFilter !== "all") {
      list = list.filter((t) => t.transaction_type === typeFilter);
    }

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "txn_date") {
        cmp = a.txn_date.localeCompare(b.txn_date);
      } else if (sortKey === "amount") {
        cmp = a.amount - b.amount;
      } else if (sortKey === "merchant") {
        cmp = a.merchant.localeCompare(b.merchant);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [transactions, search, categoryFilter, typeFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const SortIcon = ({ k }: { k: SortKey }) => (
    <ArrowUpDown
      className={`ml-1 inline-block h-3.5 w-3.5 shrink-0 transition-opacity ${
        sortKey === k ? "opacity-100" : "opacity-30"
      }`}
    />
  );

  return (
    <div className="space-y-4">
      {/* ── Filters ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="txn-search"
            placeholder="Search merchant or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select
          value={categoryFilter}
          onValueChange={(v: string | null) => setCategoryFilter((v ?? "all") as Category | "all")}
        >
          <SelectTrigger id="category-filter" className="w-full sm:w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[c] }}
                  />
                  {c}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={typeFilter}
          onValueChange={(v: string | null) =>
            setTypeFilter((v ?? "all") as Transaction["transaction_type"] | "all")
          }
        >
          <SelectTrigger id="type-filter" className="w-full sm:w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="debit">Debit</SelectItem>
            <SelectItem value="credit">Credit</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Result count ── */}
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {transactions.length} transactions
      </p>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                className="cursor-pointer select-none whitespace-nowrap"
                onClick={() => toggleSort("txn_date")}
              >
                Date <SortIcon k="txn_date" />
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("merchant")}
              >
                Merchant <SortIcon k="merchant" />
              </TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort("amount")}
              >
                Amount <SortIcon k="amount" />
              </TableHead>
              <TableHead className="hidden lg:table-cell text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  No transactions match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow key={t.id} className="group">
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(t.txn_date)}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{t.merchant}</span>
                    {/* Show category inline on small screens */}
                    <span className="mt-0.5 flex items-center gap-1.5 sm:hidden">
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: CATEGORY_COLORS[t.category],
                        }}
                      />
                      <span className="text-xs text-muted-foreground">{t.category}</span>
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[t.category] }}
                      />
                      {t.category}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className={`text-xs font-medium capitalize ${TYPE_STYLES[t.transaction_type]}`}>
                      {t.transaction_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-semibold tabular-nums ${
                        t.transaction_type === "debit"
                          ? "text-foreground"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {t.transaction_type === "debit" ? "−" : "+"}
                      {formatINR(t.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-center">
                    <Badge
                      variant="outline"
                      className={`text-[0.65rem] capitalize ${STATUS_STYLES[t.status]}`}
                    >
                      {t.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
