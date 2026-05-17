"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/utils";
import { MetricCard } from "@/components/shared/MetricCard";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { FileText, CreditCard, AlertCircle, Users } from "lucide-react";
import { BRAND_PRIMARY } from "@/lib/branding";

export default function AdminDashboardPage() {
  const { policies, payments, claims, agents, clients } = useData();

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const active = policies.filter((p) => p.status === "active").length;
  const premiumsMonth = payments
    .filter((p) => p.status === "confirmed" && p.month_covered === ym)
    .reduce((s, p) => s + p.amount, 0);
  const pendingClaims = claims.filter((c) => c.status === "submitted").length;
  const arrears = policies.filter((p) => p.account_balance < 0).length;

  // Last 6 months of confirmed premiums derived from real payment data
  const barData = React.useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const amount = payments
        .filter((p) => p.status === "confirmed" && p.month_covered === key)
        .reduce((s, p) => s + p.amount, 0);
      return { month: d.toLocaleString("default", { month: "short" }), amount };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments]);

  const pieData = [
    { name: "active", value: policies.filter((p) => p.status === "active").length },
    { name: "pending", value: policies.filter((p) => p.status === "pending").length },
    { name: "lapsed", value: policies.filter((p) => p.status === "lapsed").length },
    { name: "cancelled", value: policies.filter((p) => p.status === "cancelled").length },
  ];
  const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#9ca3af"];

  // Activity feed derived from real policies, payments, and claims
  type ActivityRow = { time: string; agent: string; action: string; client: string; amount: string };
  const activity = React.useMemo<ActivityRow[]>(() => {
    const rows: ActivityRow[] = [];

    for (const p of policies) {
      const c = clients.find((x) => x.id === p.client_id);
      const a = agents.find((x) => x.id === p.agent_id);
      rows.push({
        time: p.created_at,
        agent: a?.name ?? p.agent_id,
        action: "Issued policy",
        client: c?.full_name ?? "—",
        amount: formatCurrency(p.total_premium),
      });
    }

    for (const p of payments) {
      if (p.status !== "confirmed") continue;
      const pol = policies.find((x) => x.id === p.policy_id);
      const c = clients.find((x) => x.id === pol?.client_id);
      const a = agents.find((x) => x.id === pol?.agent_id);
      rows.push({
        time: p.payment_date,
        agent: a?.name ?? "—",
        action: "Recorded payment",
        client: c?.full_name ?? "—",
        amount: formatCurrency(p.amount),
      });
    }

    for (const c of claims) {
      const pol = policies.find((x) => x.id === c.policy_id);
      const a = agents.find((x) => x.id === pol?.agent_id);
      rows.push({
        time: c.submitted_at.slice(0, 10),
        agent: a?.name ?? "—",
        action: "Submitted claim",
        client: c.deceased_name,
        amount: "—",
      });
    }

    return rows.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 10);
  }, [policies, payments, claims, clients, agents]);

  const leaderboard = agents.map((a, i) => {
    const pols = policies.filter((p) => p.agent_id === a.id);
    const prem = payments
      .filter(
        (p) =>
          pols.some((x) => x.id === p.policy_id) &&
          p.status === "confirmed" &&
          p.month_covered === ym
      )
      .reduce((s, p) => s + p.amount, 0);
    return {
      rank: i + 1,
      name: a.name,
      branch: a.branch,
      policies: pols.filter((p) => p.created_at.slice(0, 7) === ym).length,
      premiums: formatCurrency(prem),
      trend: "—",
    };
  });

  const activityCols: Column<ActivityRow>[] = [
    { header: "Date", accessorKey: "time" },
    { header: "Agent", accessorKey: "agent" },
    { header: "Action", accessorKey: "action" },
    { header: "Client", accessorKey: "client" },
    { header: "Amount", accessorKey: "amount" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
        <p className="text-sm text-muted-foreground">All agents and portfolios.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total active policies" value={active} icon={FileText} color="brand" />
        <MetricCard
          title="Premiums this month"
          value={formatCurrency(premiumsMonth)}
          icon={CreditCard}
          color="green"
        />
        <MetricCard title="Pending claims" value={pendingClaims} icon={AlertCircle} />
        <MetricCard title="Policies in arrears" value={arrears} icon={Users} color="red" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold">Premiums collected (6 months)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(v) =>
                    typeof v === "number" ? formatCurrency(v) : String(v ?? "")
                  }
                />
                <Bar dataKey="amount" fill={BRAND_PRIMARY} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border p-4">
          <h2 className="mb-3 text-sm font-semibold">Policy status breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {pieData.map((_, i) => (
                    <Cell key={pieData[i]!.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold">Recent activity</h2>
        <DataTable
          columns={activityCols as Column<Record<string, unknown>>[]}
          data={activity as unknown as Record<string, unknown>[]}
        />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold">Top agents</h2>
        <DataTable
          columns={
            [
              { header: "Rank", accessorKey: "rank" },
              { header: "Agent Name", accessorKey: "name" },
              { header: "Branch", accessorKey: "branch" },
              { header: "Policies This Month", accessorKey: "policies" },
              { header: "Premiums Collected", accessorKey: "premiums" },
              { header: "Trend", accessorKey: "trend" },
            ] as Column<Record<string, unknown>>[]
          }
          data={leaderboard as unknown as Record<string, unknown>[]}
        />
      </div>
    </div>
  );
}
