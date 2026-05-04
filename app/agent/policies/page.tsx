"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/utils";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BalanceDisplay } from "@/components/shared/BalanceDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";

export default function AgentPoliciesPage() {
  const router = useRouter();
  const { agentId } = useAuth();
  const { policies, clients } = useData();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<string>("all");

  const aid = agentId ?? "agent-1";
  const mine = policies.filter((p) => p.agent_id === aid);

  const filtered = mine.filter((p) => {
    const c = clients.find((x) => x.id === p.client_id);
    const name = c?.full_name.toLowerCase() ?? "";
    const matchesQ =
      !q.trim() ||
      p.policy_number.toLowerCase().includes(q.toLowerCase()) ||
      name.includes(q.toLowerCase());
    const matchesS = status === "all" || p.status === status;
    return matchesQ && matchesS;
  });

  const rows = filtered.map((p) => {
    const c = clients.find((x) => x.id === p.client_id);
    return {
      id: p.id,
      policy_number: p.policy_number,
      client_name: c?.full_name ?? "—",
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
    { header: "Plan", accessorKey: "plan" },
    { header: "Tier", accessorKey: "tier" },
    {
      header: "Total Premium",
      accessorKey: "total_premium",
      cell: (r) => <span>{formatCurrency(r._policy.total_premium)}</span>,
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
  ];

  const active = mine.filter((p) => p.status === "active").length;
  const pending = mine.filter((p) => p.status === "pending").length;
  const arrears = mine.filter((p) => p.account_balance < 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">My Policies</h1>
        <Button asChild className="bg-[#1892ff] font-semibold text-white">
          <Link href="/agent/policies/new">Issue New Policy</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-sm">
            <p className="text-muted-foreground">Active</p>
            <p className="text-2xl font-semibold">{active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-sm">
            <p className="text-muted-foreground">Pending</p>
            <p className="text-2xl font-semibold">{pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-sm">
            <p className="text-muted-foreground">In Arrears</p>
            <p className="text-2xl font-semibold">{arrears}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search policies…"
          className="max-w-md flex-1"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
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
          router.push(`/agent/policies/${r.id}`);
        }}
        emptyContent={
          <EmptyState
            icon={FileText}
            title="No policies match"
            description="Try another status or search term."
            actionLabel="Issue New Policy"
            onAction={() => (window.location.href = "/agent/policies/new")}
          />
        }
      />
    </div>
  );
}
