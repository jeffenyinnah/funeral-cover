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

const activity = [
  {
    time: "2026-05-04 09:12",
    agent: "Tomás Manhiça",
    action: "Issued policy",
    client: "Maria Zandamela",
    amount: formatCurrency(340),
  },
  {
    time: "2026-05-03 14:40",
    agent: "Beatriz Cossa",
    action: "Recorded payment",
    client: "Domingos Chauque",
    amount: formatCurrency(179),
  },
  {
    time: "2026-05-02 11:05",
    agent: "Tomás Manhiça",
    action: "Submitted claim",
    client: "Armindo Matsinhe",
    amount: "—",
  },
  {
    time: "2026-05-01 08:55",
    agent: "Tomás Manhiça",
    action: "Issued policy",
    client: "Hélder Tembe",
    amount: formatCurrency(409),
  },
  {
    time: "2026-04-30 16:22",
    agent: "Beatriz Cossa",
    action: "Recorded payment",
    client: "Graça Abuque",
    amount: formatCurrency(479),
  },
  {
    time: "2026-04-29 10:18",
    agent: "Tomás Manhiça",
    action: "Issued policy",
    client: "Ana Macuácua",
    amount: formatCurrency(269),
  },
  {
    time: "2026-04-28 15:02",
    agent: "Tomás Manhiça",
    action: "Submitted claim",
    client: "Armindo Matsinhe",
    amount: "—",
  },
  {
    time: "2026-04-27 09:30",
    agent: "Beatriz Cossa",
    action: "Recorded payment",
    client: "Felicidade Lopes",
    amount: formatCurrency(209),
  },
  {
    time: "2026-04-26 13:44",
    agent: "Tomás Manhiça",
    action: "Issued policy",
    client: "Armindo Matsinhe",
    amount: formatCurrency(929),
  },
  {
    time: "2026-04-25 12:10",
    agent: "Tomás Manhiça",
    action: "Recorded payment",
    client: "Maria Zandamela",
    amount: formatCurrency(340),
  },
];

export default function AdminDashboardPage() {
  const { policies, payments, claims, agents } = useData();

  const active = policies.filter((p) => p.status === "active").length;
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const premiumsMonth = payments
    .filter((p) => p.status === "confirmed" && p.month_covered === ym)
    .reduce((s, p) => s + p.amount, 0);
  const pendingClaims = claims.filter((c) => c.status === "submitted").length;
  const arrears = policies.filter((p) => p.account_balance < 0).length;

  const barData = [
    { month: "Dec", amount: 4200 },
    { month: "Jan", amount: 5100 },
    { month: "Feb", amount: 4800 },
    { month: "Mar", amount: 6200 },
    { month: "Apr", amount: 7100 },
    { month: "May", amount: 3900 },
  ];

  const pieData = [
    { name: "active", value: policies.filter((p) => p.status === "active").length },
    { name: "pending", value: policies.filter((p) => p.status === "pending").length },
    { name: "lapsed", value: policies.filter((p) => p.status === "lapsed").length },
    { name: "cancelled", value: policies.filter((p) => p.status === "cancelled").length },
  ];
  const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#9ca3af"];

  const fixLeaderboard = agents.map((a, i) => {
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
      trend: "neutral" as const,
    };
  });

  const activityCols: Column<(typeof activity)[0]>[] = [
    { header: "Time", accessorKey: "time" },
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
        <MetricCard
          title="Pending claims"
          value={pendingClaims}
          icon={AlertCircle}
        />
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
          data={fixLeaderboard as unknown as Record<string, unknown>[]}
        />
      </div>
    </div>
  );
}
