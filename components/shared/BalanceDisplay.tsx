"use client";

import { AlertTriangle, TriangleAlert } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function BalanceDisplay({
  balance,
  totalPremium,
}: {
  balance: number;
  totalPremium: number;
}) {
  const p = Math.max(totalPremium, 1);

  if (balance >= 0) {
    const label = balance === 0 ? formatCurrency(0) : formatCurrency(balance);
    return (
      <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
        {label}
        {balance === 0 && (
          <span className="text-xs font-normal text-muted-foreground">
            Up to date
          </span>
        )}
      </span>
    );
  }

  const owed = Math.abs(balance);
  const amount = (
    <span className="font-medium tabular-nums">
      {"\u2212"}
      {formatCurrency(owed)}
    </span>
  );

  if (owed <= p) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1 text-amber-600">
        {amount}
        <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
        <span className="text-xs">1 month overdue</span>
      </span>
    );
  }

  if (owed <= p * 2) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1 text-red-600">
        {amount}
        <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
        <span className="text-xs">At risk of lapsing</span>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1 font-semibold text-red-600">
      {amount}
      <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
      <span className="text-xs uppercase tracking-wide">LAPSED</span>
    </span>
  );
}
