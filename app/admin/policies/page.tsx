"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useData } from "@/context/DataContext";
import { AGENTS } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchInput } from "@/components/shared/SearchInput";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BalanceDisplay } from "@/components/shared/BalanceDisplay";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Policy } from "@/lib/types";
import { FileText } from "lucide-react";

export default function AdminPoliciesPage() {
  const router = useRouter();
  const { policies, clients, agents, updatePolicy } = useData();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [pendingStatus, setPendingStatus] = React.useState<Policy["status"] | null>(
    null
  );
  const [pendingPolicyId, setPendingPolicyId] = React.useState<string | null>(
    null
  );

  const mergedAgents = agents.length ? agents : AGENTS;

  const filtered = policies.filter((p) => {
    const c = clients.find((x) => x.id === p.client_id);
    const s = q.trim().toLowerCase();
    const matchesQ =
      !s ||
      p.policy_number.toLowerCase().includes(s) ||
      (c?.full_name.toLowerCase().includes(s) ?? false);
    const matchesS = status === "all" || p.status === status;
    return matchesQ && matchesS;
  });

  const rows = filtered.map((p) => {
    const c = clients.find((x) => x.id === p.client_id);
    const agentName =
      mergedAgents.find((a) => a.id === p.agent_id)?.name ?? p.agent_id;
    return {
      id: p.id,
      policy_number: p.policy_number,
      client_name: c?.full_name ?? "—",
      agent: agentName,
      plan: p.product_line,
      tier: p.tier,
      total_premium: p.total_premium,
      account_balance: p.account_balance,
      status: p.status,
      cover_start: p.cover_start_date,
      _policy: p,
    };
  });

  const columns: Column<(typeof rows)[0]>[] = [
    { header: "Policy No.", accessorKey: "policy_number" },
    { header: "Client Name", accessorKey: "client_name" },
    { header: "Agent", accessorKey: "agent" },
    { header: "Plan", accessorKey: "plan" },
    { header: "Tier", accessorKey: "tier" },
    {
      header: "Total Premium",
      accessorKey: "total_premium",
      cell: (r) => formatCurrency(r._policy.total_premium),
    },
    {
      header: "Account Balance",
      accessorKey: "account_balance",
      cell: (r) => (
        <BalanceDisplay
          balance={r._policy.account_balance}
          totalPremium={r._policy.total_premium}
        />
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (r) => <StatusBadge status={r._policy.status} type="policy" />,
    },
    { header: "Cover Start", accessorKey: "cover_start" },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Select
            value={r._policy.status}
            onValueChange={(v) => {
              const next = v as Policy["status"];
              if (next === "cancelled") {
                setPendingPolicyId(r._policy.id);
                setPendingStatus(next);
                setCancelOpen(true);
                return;
              }
              updatePolicy(r._policy.id, { status: next });
              toast.success("Policy status updated");
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="lapsed">Lapsed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">All policies</h1>
      <div className="flex flex-wrap gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search…" className="max-w-md flex-1" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="lapsed">Lapsed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={rows as unknown as Record<string, unknown>[]}
        onRowClick={(row) => {
          const r = row as unknown as (typeof rows)[0];
          router.push(`/admin/policies/${r.id}`);
        }}
        emptyContent={
          <EmptyState icon={FileText} title="No policies" description="No policies match filters." />
        }
      />

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel policy?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {pendingPolicyId &&
              `Cancel policy ${
                policies.find((p) => p.id === pendingPolicyId)?.policy_number
              }? This cannot be undone.`}
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCancelOpen(false)}>
              Back
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (pendingPolicyId && pendingStatus) {
                  updatePolicy(pendingPolicyId, { status: pendingStatus });
                  toast.success("Policy cancelled");
                }
                setCancelOpen(false);
              }}
            >
              Confirm cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
