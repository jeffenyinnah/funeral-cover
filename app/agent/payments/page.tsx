"use client";

import * as React from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import type { Payment } from "@/lib/types";
import { formatCurrency, generateMpesaReference } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MpesaSimulator } from "@/components/mpesa/MpesaSimulator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard } from "lucide-react";

export default function AgentPaymentsPage() {
  const { agentId } = useAuth();
  const { policies, clients, payments, addPayment, updatePolicy } = useData();
  const [open, setOpen] = React.useState(false);
  const [policyId, setPolicyId] = React.useState<string>("");
  const [amount, setAmount] = React.useState("");
  const [month, setMonth] = React.useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [method, setMethod] = React.useState<"M-Pesa" | "Manual">("M-Pesa");
  const [manualRef, setManualRef] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [mpesaRef, setMpesaRef] = React.useState<string | null>(null);

  const aid = agentId ?? "agent-1";
  const mine = policies.filter((p) => p.agent_id === aid);
  const myIds = new Set(mine.map((p) => p.id));

  const rows = payments
    .filter((p) => myIds.has(p.policy_id))
    .map((p) => {
      const pol = policies.find((x) => x.id === p.policy_id);
      const c = pol ? clients.find((x) => x.id === pol.client_id) : null;
      return {
        id: p.id,
        reference: p.id,
        policy_number: pol?.policy_number ?? "—",
        client: c?.full_name ?? "—",
        amount: p.amount,
        month_covered: p.month_covered,
        method: p.method,
        mpesa_reference: p.mpesa_reference ?? "—",
        status: p.status,
        payment_date: p.payment_date,
        _p: p,
      };
    });

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const collected = rows
    .filter((r) => r._p.status === "confirmed" && r._p.month_covered === ym)
    .reduce((s, r) => s + r._p.amount, 0);
  const overdue = mine.filter((p) => p.account_balance < 0).length;
  const atRisk = mine.filter((p) => {
    const owed = Math.abs(p.account_balance);
    return p.account_balance < 0 && owed > p.total_premium && owed <= 2 * p.total_premium;
  }).length;

  const selectedPolicy = mine.find((p) => p.id === policyId);

  const submit = () => {
    if (!policyId || !amount) {
      toast.error("Select a policy and amount");
      return;
    }
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
    const pay: Payment = {
      id: `pay-${id}`,
      policy_id: policyId,
      amount: Number(amount),
      payment_date: new Date().toISOString().slice(0, 10),
      method,
      mpesa_reference:
        method === "M-Pesa"
          ? (mpesaRef ?? generateMpesaReference())
          : manualRef.trim() || "MANUAL",
      status: "confirmed",
      month_covered: month,
      notes: notes.trim() || undefined,
    };
    addPayment(pay);
    const pol = policies.find((p) => p.id === policyId);
    if (pol) {
      updatePolicy(policyId, {
        account_balance: pol.account_balance + Number(amount),
      });
    }
    toast.success("Payment recorded");
    setOpen(false);
    setPolicyId("");
    setMpesaRef(null);
    setNotes("");
  };

  const columns: Column<(typeof rows)[0]>[] = [
    { header: "Reference", accessorKey: "reference" },
    { header: "Policy No.", accessorKey: "policy_number" },
    { header: "Client", accessorKey: "client" },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (r) => formatCurrency(r._p.amount),
    },
    { header: "Month", accessorKey: "month_covered" },
    { header: "Method", accessorKey: "method" },
    { header: "M-Pesa Ref", accessorKey: "mpesa_reference" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (r) => <StatusBadge status={r._p.status} type="payment" />,
    },
    { header: "Date", accessorKey: "payment_date" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <Button
          className="bg-[#1892ff] font-semibold text-white"
          onClick={() => {
            setPolicyId("");
            setAmount("");
            setMpesaRef(null);
            setNotes("");
            setManualRef("");
            setOpen(true);
          }}
        >
          Record Payment
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-sm">
            <p className="text-muted-foreground">Collected this month</p>
            <p className="text-xl font-semibold">{formatCurrency(collected)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-sm">
            <p className="text-muted-foreground">Overdue policies</p>
            <p className="text-xl font-semibold">{overdue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-sm">
            <p className="text-muted-foreground">At risk of lapsing</p>
            <p className="text-xl font-semibold">{atRisk}</p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={rows as unknown as Record<string, unknown>[]}
        emptyContent={
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            description="Record a premium payment to see it listed here."
            actionLabel="Record Payment"
            onAction={() => {
              setPolicyId("");
              setAmount("");
              setMpesaRef(null);
              setNotes("");
              setManualRef("");
              setOpen(true);
            }}
          />
        }
      />

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setPolicyId("");
            setAmount("");
            setMpesaRef(null);
            setNotes("");
            setManualRef("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Policy</Label>
              <Select
                value={policyId}
                onValueChange={(id) => {
                  setPolicyId(id);
                  const p = mine.find((x) => x.id === id);
                  if (p) setAmount(String(p.total_premium));
                }}
              >
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
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Month covered</Label>
              <Input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
            <div>
              <Label>Method</Label>
              <Select
                value={method}
                onValueChange={(v) => setMethod(v as "M-Pesa" | "Manual")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {method === "M-Pesa" && selectedPolicy && (
              <MpesaSimulator
                amount={Number(amount) || 0}
                phone={
                  clients.find((c) => c.id === selectedPolicy.client_id)
                    ?.phone ?? "+258840000000"
                }
                onSuccess={(ref) => setMpesaRef(ref)}
              />
            )}
            {method === "Manual" && (
              <div>
                <Label>Reference</Label>
                <Input
                  value={manualRef}
                  onChange={(e) => setManualRef(e.target.value)}
                />
              </div>
            )}
            <div>
              <Label>Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button type="button" className="w-full" onClick={submit}>
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
