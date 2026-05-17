"use client";

import * as React from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { useData } from "@/context/DataContext";
import { calculateAnnualPremium, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BRAND_PRIMARY } from "@/lib/branding";
import type { Plan } from "@/lib/types";

const benefits = [
  "Grocery Benefit",
  "Airtime",
  "Meat Benefit",
  "Bus Hire",
  "Casket",
] as const;

type EditDraft = {
  single_premium: string;
  family_premium: string;
  cover_amount: string;
};

function toDraft(p: Plan): EditDraft {
  return {
    single_premium: String(p.single_premium),
    family_premium: String(p.family_premium),
    cover_amount: String(p.cover_amount),
  };
}

export default function AdminPlansPage() {
  const { plans, updatePlan } = useData();
  const [mode, setMode] = React.useState<"monthly" | "annual">("monthly");
  const [familyView, setFamilyView] = React.useState(false);
  const [editPlan, setEditPlan] = React.useState<Plan | null>(null);
  const [draft, setDraft] = React.useState<EditDraft>({ single_premium: "", family_premium: "", cover_amount: "" });

  const tumelo = plans.filter((p) => p.product_line === "Tumelo Nations Plan");
  const uha = plans.filter((p) => p.product_line === "Uhambolwethu Funeral Cover");

  function openEdit(plan: Plan) {
    setEditPlan(plan);
    setDraft(toDraft(plan));
  }

  function saveEdit() {
    if (!editPlan) return;
    const single = parseFloat(draft.single_premium);
    const family = parseFloat(draft.family_premium);
    const cover = parseFloat(draft.cover_amount);
    if (isNaN(single) || single <= 0 || isNaN(family) || family <= 0 || isNaN(cover) || cover <= 0) {
      toast.error("All values must be positive numbers");
      return;
    }
    updatePlan(editPlan.id, { single_premium: single, family_premium: family, cover_amount: cover });
    toast.success(`${editPlan.tier} updated`);
    setEditPlan(null);
  }

  function PlanCards({ planList }: { planList: Plan[] }) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {planList.map((plan) => {
          const base = familyView ? plan.family_premium : plan.single_premium;
          const prem = mode === "monthly" ? base : calculateAnnualPremium(base);
          return (
            <Card key={plan.id} className="min-w-[200px] max-w-[220px] shrink-0 border-border">
              <CardContent className="space-y-2 p-4 text-sm">
                <div className="flex items-start justify-between gap-1">
                  <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-dm-serif), serif" }}>
                    {plan.tier}
                  </p>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7 shrink-0"
                    onClick={() => openEdit(plan)}
                    title="Edit plan"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {familyView ? "Family premium" : "Single premium"}
                </p>
                <p className="text-lg font-semibold">{formatCurrency(prem)}</p>
                <p className="text-2xl font-bold" style={{ color: BRAND_PRIMARY }}>
                  {formatCurrency(plan.cover_amount)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {plan.waiting_period_natural}m waiting (natural) · {plan.waiting_period_accidental}m (accidental)
                </p>
                <div className="flex flex-wrap gap-1">
                  {benefits.map((b) => (
                    <Badge key={b} variant="secondary" className="text-[10px]">
                      {b}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plans & pricing</h1>
          <p className="text-sm text-muted-foreground">Click the pencil icon on any plan to edit premiums and cover.</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "monthly" ? "default" : "outline"}
            className={mode === "monthly" ? "bg-[#1892ff] text-white" : ""}
            onClick={() => setMode("monthly")}
          >
            Monthly
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "annual" ? "default" : "outline"}
            className={mode === "annual" ? "bg-[#1892ff] text-white" : ""}
            onClick={() => setMode("annual")}
          >
            Annual
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Premiums show:</span>
        <Button type="button" size="sm" variant={!familyView ? "secondary" : "outline"} onClick={() => setFamilyView(false)}>
          Single
        </Button>
        <Button type="button" size="sm" variant={familyView ? "secondary" : "outline"} onClick={() => setFamilyView(true)}>
          Family
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tumelo Nations Plan</h2>
        <PlanCards planList={tumelo} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Uhambolwethu Funeral Cover</h2>
        <PlanCards planList={uha} />
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Extended family add-ons</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Monthly Add-on</TableHead>
                <TableHead>Cover Amount</TableHead>
                <TableHead>Max Age</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { addon: 70, cover: 2000 },
                { addon: 220, cover: 5000 },
                { addon: 250, cover: 10000 },
                { addon: 299, cover: 15000 },
              ].map((row) => (
                <TableRow key={row.addon}>
                  <TableCell>{formatCurrency(row.addon)}</TableCell>
                  <TableCell>{formatCurrency(row.cover)}</TableCell>
                  <TableCell>84</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Maximum 4 extended members per policy</p>
      </section>

      <details className="rounded-lg border border-border p-4">
        <summary className="cursor-pointer text-sm font-semibold">Key terms</summary>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Cover ceases after 2 consecutive missed payments</li>
          <li>Claims must be submitted within 3 months of date of death</li>
          <li>Suicide: 24-month waiting period applies</li>
          <li>Re-joining after lapse: new 6-month waiting period</li>
          <li>Premiums payable by the 7th of each month</li>
          <li>Members may join aged 18–65 (extended family up to 84)</li>
        </ul>
      </details>

      {/* Edit plan dialog */}
      <Dialog open={!!editPlan} onOpenChange={(o) => { if (!o) setEditPlan(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit — {editPlan?.tier}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Single premium (R/month)</Label>
              <Input
                type="number"
                min={1}
                value={draft.single_premium}
                onChange={(e) => setDraft((d) => ({ ...d, single_premium: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Family premium (R/month)</Label>
              <Input
                type="number"
                min={1}
                value={draft.family_premium}
                onChange={(e) => setDraft((d) => ({ ...d, family_premium: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cover amount (R)</Label>
              <Input
                type="number"
                min={1}
                value={draft.cover_amount}
                onChange={(e) => setDraft((d) => ({ ...d, cover_amount: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditPlan(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveEdit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
