"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, FileText, UserPlus, CreditCard, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/utils";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NewClientForm } from "@/components/clients/NewClientForm";
import { Card, CardContent } from "@/components/ui/card";

export default function AgentDashboardPage() {
  const router = useRouter();
  const { agentId } = useAuth();
  const { policies, payments, claims, clients, addClient } = useData();
  const [registerOpen, setRegisterOpen] = React.useState(false);
  const [payOpen, setPayOpen] = React.useState(false);

  const mine = policies.filter((p) => p.agent_id === agentId);
  const myPolicyIds = new Set(mine.map((p) => p.id));

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const activeCount = mine.filter((p) => p.status === "active").length;

  const premiumsMonth = payments
    .filter(
      (p) =>
        p.status === "confirmed" &&
        p.month_covered === ym &&
        myPolicyIds.has(p.policy_id)
    )
    .reduce((s, p) => s + p.amount, 0);

  const arrears = mine.filter((p) => p.account_balance < 0).length;

  const pendingClaims = claims.filter(
    (c) =>
      c.status === "submitted" && myPolicyIds.has(c.policy_id)
  ).length;

  const recent = [...mine]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back — here is your portfolio at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Active policies"
          value={activeCount}
          icon={FileText}
          color="brand"
        />
        <MetricCard
          title="Premiums this month"
          value={formatCurrency(premiumsMonth)}
          icon={CreditCard}
          color="green"
        />
        <MetricCard
          title="Clients in arrears"
          value={arrears}
          icon={Users}
          color="red"
        />
        <MetricCard
          title="Pending claims"
          value={pendingClaims}
          icon={AlertCircle}
          color="default"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          className="bg-[#1892ff] font-semibold text-white hover:bg-[#1892ff]/90"
          onClick={() => setRegisterOpen(true)}
        >
          <UserPlus className="size-4" />
          Register New Client
        </Button>
        <Button asChild variant="secondary">
          <Link href="/agent/policies/new">
            <FileText className="size-4" />
            Issue New Policy
          </Link>
        </Button>
        <Button variant="outline" onClick={() => setPayOpen(true)}>
          <CreditCard className="size-4" />
          Record Payment
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <h2 className="mb-3 font-semibold">Recent policies</h2>
          <ul className="divide-y divide-border text-sm">
            {recent.map((p) => {
              const c = clients.find((x) => x.id === p.client_id);
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2"
                >
                  <span className="font-mono text-xs">{p.policy_number}</span>
                  <span>{c?.full_name ?? "—"}</span>
                  <span className="text-muted-foreground">
                    {p.product_line} · {p.tier}
                  </span>
                  <StatusBadge status={p.status} type="policy" />
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Register new client</DialogTitle>
          </DialogHeader>
          <NewClientForm
            agentId={agentId ?? "agent-1"}
            onCreated={(client) => {
              addClient(client);
              toast.success("Client registered");
              setRegisterOpen(false);
              router.push("/agent/clients");
            }}
            onCancel={() => setRegisterOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Open the Payments page for the full payment form with M-Pesa
            simulation.
          </p>
          <Button asChild>
            <Link href="/agent/payments" onClick={() => setPayOpen(false)}>
              Go to Payments
            </Link>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
