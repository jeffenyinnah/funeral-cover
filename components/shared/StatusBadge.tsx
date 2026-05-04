"use client";

import { cn } from "@/lib/utils";

type BadgeType = "policy" | "payment" | "claim";

const dot = "inline-block size-1.5 shrink-0 rounded-full";

const policyMap: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-500" },
  pending: { label: "Pending", className: "bg-amber-500" },
  lapsed: { label: "Lapsed", className: "bg-red-500" },
  cancelled: { label: "Cancelled", className: "bg-zinc-400" },
};

const paymentMap: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "bg-emerald-500" },
  pending: { label: "Pending", className: "bg-amber-500" },
  failed: { label: "Failed", className: "bg-red-500" },
};

const claimMap: Record<string, { label: string; className: string }> = {
  submitted: { label: "Submitted", className: "bg-sky-500" },
  under_review: { label: "Under Review", className: "bg-amber-500" },
  approved: { label: "Approved", className: "bg-emerald-500" },
  paid: { label: "Paid", className: "bg-teal-500" },
  rejected: { label: "Rejected", className: "bg-red-500" },
};

export function StatusBadge({
  status,
  type,
}: {
  status: string;
  type: BadgeType;
}) {
  const map =
    type === "policy"
      ? policyMap
      : type === "payment"
        ? paymentMap
        : claimMap;
  const cfg = map[status] ?? {
    label: status,
    className: "bg-zinc-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium"
      )}
    >
      <span className={cn(dot, cfg.className)} aria-hidden />
      {cfg.label}
    </span>
  );
}
