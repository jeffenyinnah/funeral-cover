"use client";

import * as React from "react";
import { PLANS } from "@/lib/demo-data";
import { calculateAnnualPremium, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BRAND_PRIMARY } from "@/lib/branding";

const benefits = [
  "Grocery Benefit",
  "Airtime",
  "Meat Benefit",
  "Bus Hire",
  "Casket",
] as const;

export default function AdminPlansPage() {
  const [mode, setMode] = React.useState<"monthly" | "annual">("monthly");
  const [familyView, setFamilyView] = React.useState(false);

  const tumelo = PLANS.filter((p) => p.product_line === "Tumelo Nations Plan");
  const uha = PLANS.filter(
    (p) => p.product_line === "Uhambolwethu Funeral Cover"
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Plans & pricing</h1>
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
        <Button
          type="button"
          size="sm"
          variant={familyView ? "secondary" : "outline"}
          onClick={() => setFamilyView(false)}
        >
          Single
        </Button>
        <Button
          type="button"
          size="sm"
          variant={familyView ? "outline" : "secondary"}
          onClick={() => setFamilyView(true)}
        >
          Family
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tumelo Nations Plan</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {tumelo.map((plan) => {
            const base = familyView ? plan.family_premium : plan.single_premium;
            const prem =
              mode === "monthly" ? base : calculateAnnualPremium(base);
            return (
              <Card
                key={plan.id}
                className="min-w-[200px] max-w-[220px] shrink-0 border-border"
              >
                <CardContent className="space-y-2 p-4 text-sm">
                  <p
                    className="text-lg font-semibold"
                    style={{ fontFamily: "var(--font-dm-serif), serif" }}
                  >
                    {plan.tier}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {familyView ? "Family premium" : "Single premium"}
                  </p>
                  <p className="text-lg font-semibold">{formatCurrency(prem)}</p>
                  <p className="text-2xl font-bold" style={{ color: BRAND_PRIMARY }}>
                    {formatCurrency(plan.cover_amount)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    6 months waiting (natural) · 1 month (accidental)
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
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Uhambolwethu Funeral Cover</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {uha.map((plan) => {
            const base = familyView ? plan.family_premium : plan.single_premium;
            const prem =
              mode === "monthly" ? base : calculateAnnualPremium(base);
            return (
              <Card
                key={plan.id}
                className="min-w-[200px] max-w-[220px] shrink-0 border-border"
              >
                <CardContent className="space-y-2 p-4 text-sm">
                  <p
                    className="text-lg font-semibold"
                    style={{ fontFamily: "var(--font-dm-serif), serif" }}
                  >
                    {plan.tier}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {familyView ? "Family premium" : "Single premium"}
                  </p>
                  <p className="text-lg font-semibold">{formatCurrency(prem)}</p>
                  <p className="text-2xl font-bold" style={{ color: BRAND_PRIMARY }}>
                    {formatCurrency(plan.cover_amount)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    6 months waiting (natural) · 1 month (accidental)
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
              <TableRow>
                <TableCell>{formatCurrency(70)}</TableCell>
                <TableCell>{formatCurrency(2000)}</TableCell>
                <TableCell>84</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{formatCurrency(220)}</TableCell>
                <TableCell>{formatCurrency(5000)}</TableCell>
                <TableCell>84</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{formatCurrency(250)}</TableCell>
                <TableCell>{formatCurrency(10000)}</TableCell>
                <TableCell>84</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{formatCurrency(299)}</TableCell>
                <TableCell>{formatCurrency(15000)}</TableCell>
                <TableCell>84</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Maximum 4 extended members per policy
        </p>
      </section>

      <details className="rounded-lg border border-border p-4">
        <summary className="cursor-pointer text-sm font-semibold">
          Key terms
        </summary>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Cover ceases after 2 consecutive missed payments</li>
          <li>Claims must be submitted within 3 months of date of death</li>
          <li>Suicide: 24-month waiting period applies</li>
          <li>Re-joining after lapse: new 6-month waiting period</li>
          <li>Premiums payable by the 7th of each month</li>
          <li>Members may join aged 18–65 (extended family up to 84)</li>
        </ul>
      </details>
    </div>
  );
}
