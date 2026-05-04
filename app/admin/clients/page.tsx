"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchInput } from "@/components/shared/SearchInput";
import { UserCircle } from "lucide-react";
import { AGENTS as AGENTS_SEED } from "@/lib/demo-data";

export default function AdminClientsPage() {
  const router = useRouter();
  const { clients, agents } = useData();
  const [q, setQ] = React.useState("");

  const mergedAgents = agents.length ? agents : AGENTS_SEED;

  const filtered = clients.filter((c) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (
      c.full_name.toLowerCase().includes(s) ||
      c.passport_number.toLowerCase().includes(s)
    );
  });

  const rows = filtered.map((c) => ({
    id: c.id,
    full_name: c.full_name,
    passport_number: c.passport_number,
    phone: c.phone,
    city: c.city,
    province: c.province,
    agent:
      mergedAgents.find((a) => a.id === c.created_by)?.name ?? c.created_by,
    registered: c.created_at,
  }));

  const columns: Column<(typeof rows)[0]>[] = [
    { header: "Full Name", accessorKey: "full_name" },
    { header: "Passport No.", accessorKey: "passport_number" },
    { header: "Phone", accessorKey: "phone" },
    { header: "City", accessorKey: "city" },
    { header: "Province", accessorKey: "province" },
    { header: "Agent", accessorKey: "agent" },
    { header: "Registered", accessorKey: "registered" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">All clients</h1>
      <SearchInput value={q} onChange={setQ} placeholder="Search…" className="max-w-md" />
      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={rows as unknown as Record<string, unknown>[]}
        onRowClick={(row) => {
          const r = row as unknown as (typeof rows)[0];
          router.push(`/admin/clients/${r.id}`);
        }}
        emptyContent={
          <EmptyState icon={UserCircle} title="No clients" description="No records match your search." />
        }
      />
    </div>
  );
}
