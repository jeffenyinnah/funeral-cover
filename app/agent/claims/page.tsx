"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import type { Claim } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

export default function AgentClaimsPage() {
  const router = useRouter();
  const { agentId } = useAuth();
  const { claims, policies, clients, members, addClaim } = useData();
  const [modal, setModal] = React.useState(false);
  const [policyId, setPolicyId] = React.useState("");
  const [who, setWho] = React.useState("");
  const [cause, setCause] = React.useState<Claim["cause_of_death"]>("Natural");
  const [dod, setDod] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const aid = agentId ?? "agent-1";
  const mine = policies.filter((p) => p.agent_id === aid);
  const myIds = new Set(mine.map((p) => p.id));

  const rows = claims
    .filter((c) => myIds.has(c.policy_id))
    .map((c) => {
      const p = policies.find((x) => x.id === c.policy_id);
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
  ];

  const pol = mine.find((p) => p.id === policyId);
  const client = pol ? clients.find((c) => c.id === pol.client_id) : null;
  const polMembers = pol ? members.filter((m) => m.policy_id === pol.id) : [];

  const whoOptions =
    !pol || !client
      ? []
      : [
          {
            value: `principal:${client.id}`,
            label: `Principal — ${client.full_name}`,
          },
          ...polMembers.map((m) => ({
            value: `member:${m.id}`,
            label: `${m.full_name} (${m.relationship})`,
          })),
        ];

  const submitClaim = () => {
    if (!policyId || !who || !dod) {
      toast.error("Complete all required fields");
      return;
    }
    const [kind, idVal] = who.split(":");
    const memberId = kind === "member" ? idVal : undefined;
    const deceased =
      kind === "principal"
        ? client!.full_name
        : polMembers.find((m) => m.id === idVal)?.full_name ?? "";
    const relationship =
      kind === "principal"
        ? "Principal"
        : polMembers.find((m) => m.id === idVal)?.relationship ?? "";
    const cid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
    const claim: Claim = {
      id: `claim-${cid}`,
      policy_id: policyId,
      member_id: memberId,
      deceased_name: deceased,
      relationship,
      cause_of_death: cause,
      date_of_death: dod,
      status: "submitted",
      claim_amount: pol?.total_premium ? pol.total_premium * 10 : 0,
      submitted_at: new Date().toISOString(),
    };
    addClaim(claim);
    toast.info("Claim submitted", { description: notes || undefined });
    setModal(false);
    setPolicyId("");
    setWho("");
    setDod("");
    setNotes("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Claims</h1>
        <Button
          className="bg-[#1892ff] font-semibold text-white"
          onClick={() => setModal(true)}
        >
          Submit Claim
        </Button>
      </div>

      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={rows as unknown as Record<string, unknown>[]}
        onRowClick={(row) => {
          const r = row as unknown as (typeof rows)[0];
          router.push(`/agent/claims/${r.id}`);
        }}
        emptyContent={
          <EmptyState
            icon={AlertCircle}
            title="No claims"
            description="Claims for your policies will appear here."
          />
        }
      />

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit claim</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Policy</Label>
              <Select value={policyId} onValueChange={(v) => { setPolicyId(v); setWho(""); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select policy" />
                </SelectTrigger>
                <SelectContent>
                  {mine.map((p) => {
                    const c = clients.find((x) => x.id === p.client_id);
                    return (
                      <SelectItem key={p.id} value={p.id}>
                        {p.policy_number} — {c?.full_name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Who passed away</Label>
              <Select value={who} onValueChange={setWho} disabled={!policyId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {whoOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cause of death</Label>
              <Select
                value={cause}
                onValueChange={(v) => setCause(v as Claim["cause_of_death"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Natural">Natural</SelectItem>
                  <SelectItem value="Accidental">Accidental</SelectItem>
                  <SelectItem value="Suicide">Suicide</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date of death</Label>
              <Input type="date" value={dod} onChange={(e) => setDod(e.target.value)} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button type="button" className="w-full" onClick={submitClaim}>
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
