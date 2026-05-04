"use client";

import * as React from "react";
import { toast } from "sonner";
import { useData } from "@/context/DataContext";
import type { Agent } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Users } from "lucide-react";

const BRANCHES = [
  "Johannesburg",
  "Pretoria",
  "Durban",
  "Cape Town",
  "Other",
] as const;

export default function AdminAgentsPage() {
  const { agents, policies, payments, claims, addAgent } = useData();
  const [open, setOpen] = React.useState(false);
  const [detail, setDetail] = React.useState<Agent | null>(null);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    branch: "Johannesburg",
  });

  const rows = agents.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    phone: a.phone,
    branch: a.branch,
    policies: policies.filter((p) => p.agent_id === a.id).length,
    premiums: formatCurrency(
      payments
        .filter((p) => {
          const pol = policies.find((x) => x.id === p.policy_id);
          return pol?.agent_id === a.id && p.status === "confirmed";
        })
        .reduce((s, p) => s + p.amount, 0)
    ),
    joined: a.created_at,
    _a: a,
  }));

  const columns: Column<(typeof rows)[0]>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { header: "Phone", accessorKey: "phone" },
    { header: "Branch", accessorKey: "branch" },
    { header: "Policies", accessorKey: "policies" },
    { header: "Premiums", accessorKey: "premiums" },
    { header: "Joined", accessorKey: "joined" },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (r) => (
        <Button type="button" size="sm" variant="outline" onClick={() => setDetail(r._a)}>
          View
        </Button>
      ),
    },
  ];

  const save = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
    const agent: Agent = {
      id: `agent-${id}`,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.startsWith("+258")
        ? form.phone
        : `+258${form.phone.replace(/\D/g, "").replace(/^258/, "")}`,
      branch: form.branch,
      created_at: new Date().toISOString().slice(0, 10),
    };
    addAgent(agent);
    toast.success("Agent created");
    setOpen(false);
    setForm({ name: "", email: "", password: "", phone: "", branch: "Johannesburg" });
  };

  const agentPolicies = detail
    ? policies.filter((p) => p.agent_id === detail.id)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
        <Button
          className="bg-[#1892ff] font-semibold text-white"
          onClick={() => setOpen(true)}
        >
          Create Agent
        </Button>
      </div>

      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={rows as unknown as Record<string, unknown>[]}
        emptyContent={
          <EmptyState icon={Users} title="No agents" description="Create your first agent." />
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create agent</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Full name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <Label>Password (mock)</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div>
              <Label>Phone (+258)</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label>Branch</Label>
              <Select
                value={form.branch}
                onValueChange={(v) => setForm((f) => ({ ...f, branch: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRANCHES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" onClick={save}>
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-[520px]">
          <SheetHeader>
            <SheetTitle>{detail?.name}</SheetTitle>
          </SheetHeader>
          {detail && (
            <div className="mt-4 space-y-4 text-sm">
              <p>{detail.email}</p>
              <p>{detail.phone}</p>
              <p>{detail.branch}</p>
              <h3 className="font-semibold">Policies</h3>
              <ul className="space-y-1">
                {agentPolicies.map((p) => (
                  <li key={p.id} className="rounded border border-border px-2 py-1 font-mono text-xs">
                    {p.policy_number}
                  </li>
                ))}
              </ul>
              <h3 className="font-semibold">Claims</h3>
              <p className="text-muted-foreground">
                {claims.filter((c) => agentPolicies.some((p) => p.id === c.policy_id)).length}{" "}
                claims linked
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
