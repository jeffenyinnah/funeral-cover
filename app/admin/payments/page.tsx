"use client";

import * as React from "react";
import { toast } from "sonner";
import { useData } from "@/context/DataContext";
import { AGENTS } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard } from "lucide-react";

export default function AdminPaymentsPage() {
  const { payments, policies, clients, agents, updatePayment } = useData();
  const mergedAgents = agents.length ? agents : AGENTS;

  const rows = payments.map((p) => {
    const pol = policies.find((x) => x.id === p.policy_id);
    const clientName =
      clients.find((c) => c.id === pol?.client_id)?.full_name ?? "—";
    const agentName =
      mergedAgents.find((a) => a.id === pol?.agent_id)?.name ?? "—";
    return {
      id: p.id,
      reference: p.id,
      policy_no: pol?.policy_number ?? "—",
      client: clientName,
      amount: p.amount,
      month: p.month_covered,
      method: p.method,
      mpesa: p.mpesa_reference ?? "—",
      status: p.status,
      date: p.payment_date,
      agent: agentName,
      _p: p,
    };
  });

  const columns: Column<(typeof rows)[0]>[] = [
    { header: "Reference", accessorKey: "reference" },
    { header: "Policy No.", accessorKey: "policy_no" },
    { header: "Client", accessorKey: "client" },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (r) => formatCurrency(r._p.amount),
    },
    { header: "Month", accessorKey: "month" },
    { header: "Method", accessorKey: "method" },
    { header: "M-Pesa Ref", accessorKey: "mpesa" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (r) => <StatusBadge status={r._p.status} type="payment" />,
    },
    { header: "Date", accessorKey: "date" },
    { header: "Agent", accessorKey: "agent" },
    {
      header: "Adjust",
      accessorKey: "id",
      cell: (r) =>
        r._p.status === "failed" ? (
          <Select
            value={r._p.status}
            onValueChange={(v) => {
              updatePayment(r._p.id, { status: v as typeof r._p.status });
              toast.success("Payment status updated");
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={rows as unknown as Record<string, unknown>[]}
        emptyContent={
          <EmptyState icon={CreditCard} title="No payments" description="No payment records." />
        }
      />
    </div>
  );
}
