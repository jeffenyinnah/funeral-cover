"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { SearchInput } from "@/components/shared/SearchInput";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { NewClientForm } from "@/components/clients/NewClientForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";

export default function AgentClientsPage() {
  const router = useRouter();
  const { agentId } = useAuth();
  const { clients, policies, addClient } = useData();
  const [q, setQ] = React.useState("");
  const [registerOpen, setRegisterOpen] = React.useState(false);

  const aid = agentId ?? "agent-1";
  const myPolicyClientIds = new Set(
    policies.filter((p) => p.agent_id === aid).map((p) => p.client_id)
  );

  const rows = clients.filter(
    (c) => c.created_by === aid || myPolicyClientIds.has(c.id)
  );

  const filtered = rows.filter((c) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (
      c.full_name.toLowerCase().includes(s) ||
      c.passport_number.toLowerCase().includes(s)
    );
  });

  const tableRows = filtered.map((c) => {
    const policyCount = policies.filter(
      (p) => p.client_id === c.id && p.agent_id === aid
    ).length;
    return {
      id: c.id,
      full_name: c.full_name,
      passport_number: c.passport_number,
      phone: c.phone,
      city: c.city,
      province: c.province,
      policies: policyCount,
      registered: c.created_at,
    };
  });

  const columns: Column<(typeof tableRows)[0]>[] = [
    { header: "Full Name", accessorKey: "full_name" },
    { header: "Passport No.", accessorKey: "passport_number" },
    { header: "Phone", accessorKey: "phone" },
    { header: "City", accessorKey: "city" },
    { header: "Province", accessorKey: "province" },
    { header: "Policies", accessorKey: "policies" },
    { header: "Registered", accessorKey: "registered" },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row) => (
        <Button type="button" size="icon-sm" variant="ghost" asChild>
          <Link href={`/agent/clients/${row.id}`} aria-label="Open client details">
            <ExternalLink className="size-4" />
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">My Clients</h1>
        <Button
          className="bg-[#1892ff] font-semibold text-white hover:bg-[#1892ff]/90"
          onClick={() => setRegisterOpen(true)}
        >
          Register New Client
        </Button>
      </div>

      <SearchInput
        value={q}
        onChange={setQ}
        placeholder="Search by name or passport…"
        className="max-w-md"
      />

      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={tableRows as unknown as Record<string, unknown>[]}
        onRowClick={(row) => {
          const r = row as unknown as (typeof tableRows)[0];
          router.push(`/agent/clients/${r.id}`);
        }}
        emptyContent={
          <EmptyState
            icon={Users}
            title="No clients found"
            description="Adjust your search or register a new client."
            actionLabel="Register New Client"
            onAction={() => setRegisterOpen(true)}
          />
        }
      />

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Register new client</DialogTitle>
          </DialogHeader>
          <NewClientForm
            agentId={aid}
            onCreated={(client) => {
              addClient(client);
              toast.success("Client registered");
              setRegisterOpen(false);
            }}
            onCancel={() => setRegisterOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
