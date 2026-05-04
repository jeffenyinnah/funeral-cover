"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import { AGENTS } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AlertCircle } from "lucide-react";

export default function AdminClaimsPage() {
  const router = useRouter();
  const { claims, policies, agents } = useData();
  const mergedAgents = agents.length ? agents : AGENTS;

  const rows = claims.map((c) => {
    const p = policies.find((x) => x.id === c.policy_id);
    const agentName =
      mergedAgents.find((a) => a.id === p?.agent_id)?.name ?? "—";
    return {
      id: c.id,
      claim_ref: c.id,
      policy_no: p?.policy_number ?? "—",
      deceased: c.deceased_name,
      relationship: c.relationship,
      cause: c.cause_of_death,
      date_of_death: c.date_of_death,
      status: c.status,
      payout: c.claim_amount,
      agent: agentName,
      _c: c,
    };
  });

  const columns: Column<(typeof rows)[0]>[] = [
    { header: "Claim Ref", accessorKey: "claim_ref" },
    { header: "Policy No.", accessorKey: "policy_no" },
    { header: "Deceased", accessorKey: "deceased" },
    { header: "Relationship", accessorKey: "relationship" },
    { header: "Cause", accessorKey: "cause" },
    { header: "Date of Death", accessorKey: "date_of_death" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (r) => <StatusBadge status={r._c.status} type="claim" />,
    },
    {
      header: "Payout",
      accessorKey: "payout",
      cell: (r) => formatCurrency(r._c.claim_amount),
    },
    { header: "Agent", accessorKey: "agent" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Claims</h1>
      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={rows as unknown as Record<string, unknown>[]}
        onRowClick={(row) => {
          const r = row as unknown as (typeof rows)[0];
          router.push(`/admin/claims/${r.id}`);
        }}
        emptyContent={
          <EmptyState icon={AlertCircle} title="No claims" description="No claim records." />
        }
      />
    </div>
  );
}
