"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { Claim, Client, Payment, Policy, PolicyMember } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useData } from "@/context/DataContext";
import { BRAND_PRIMARY } from "@/lib/branding";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BalanceDisplay } from "@/components/shared/BalanceDisplay";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, UserPlus, CreditCard, AlertCircle } from "lucide-react";

export function PolicyDetailContent({
  policy,
  client,
  members,
  payments,
  claims,
  claimsBasePath,
}: {
  policy: Policy;
  client: Client;
  members: PolicyMember[];
  payments: Payment[];
  claims: Claim[];
  /** e.g. "/agent/claims" — when set, each claim row links to detail page */
  claimsBasePath?: string;
}) {
  const { plans } = useData();
  const plan = plans.find((p) => p.product_line === policy.product_line && p.tier === policy.tier);
  const principalCover = plan?.cover_amount ?? 0;

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-1 py-1 md:px-0">
          <section>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              Client details
            </h3>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              <Detail label="Name" value={client.full_name} />
              <Detail label="Passport" value={client.passport_number} />
              <Detail label="Phone" value={client.phone} />
              <Detail label="City" value={client.city} />
              <Detail label="Province" value={client.province} />
              <Detail label="Nationality" value={client.nationality} />
            </dl>
          </section>

          <section>
            <p
              className="mb-2 text-2xl font-semibold"
              style={{
                fontFamily: "var(--font-dm-serif), serif",
                color: BRAND_PRIMARY,
              }}
            >
              {policy.policy_number}
            </p>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              Policy details
            </h3>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              <Detail label="Product" value={policy.product_line} />
              <Detail label="Tier" value={policy.tier} />
              <Detail
                label="Premium type"
                value={policy.premium_type === "monthly" ? "Monthly" : "Annual"}
              />
              <Detail
                label="Base premium"
                value={formatCurrency(policy.base_premium)}
              />
              <Detail
                label="Members premium"
                value={formatCurrency(policy.members_premium)}
              />
              <Detail
                label="Total premium"
                value={formatCurrency(policy.total_premium)}
              />
              <Detail
                label="Principal cover"
                value={formatCurrency(principalCover)}
              />
              <Detail label="Inception" value={policy.inception_date} />
              <Detail label="Cover start" value={policy.cover_start_date} />
              <div className="col-span-2">
                <span className="text-muted-foreground">Status </span>
                <StatusBadge status={policy.status} type="policy" />
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Balance </span>
                <BalanceDisplay
                  balance={policy.account_balance}
                  totalPremium={policy.total_premium}
                />
              </div>
            </dl>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              Members
            </h3>
            {members.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title="No members"
                description="Add dependants to this policy from the policy list when supported."
              />
            ) : (
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Rel.</TableHead>
                      <TableHead>DOB</TableHead>
                      <TableHead>Cover</TableHead>
                      <TableHead>+ / mo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>{m.full_name}</TableCell>
                        <TableCell>{m.relationship}</TableCell>
                        <TableCell>{m.date_of_birth}</TableCell>
                        <TableCell>
                          {formatCurrency(m.cover_amount)}
                        </TableCell>
                        <TableCell>{formatCurrency(m.addon_cost)}</TableCell>
                        <TableCell>{m.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <Button
              type="button"
              variant="link"
              className="mt-1 h-auto px-0"
              style={{ color: BRAND_PRIMARY }}
              onClick={() =>
                toast.info("Add member flow opens from policy issuance.")
              }
            >
              Add Member
            </Button>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              Payment history
            </h3>
            {payments.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="No payments"
                description="Record the first premium payment for this policy."
              />
            ) : (
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Ref</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.payment_date}</TableCell>
                        <TableCell>{formatCurrency(p.amount)}</TableCell>
                        <TableCell>{p.method}</TableCell>
                        <TableCell className="max-w-[100px] truncate font-mono text-xs">
                          {p.mpesa_reference ?? "—"}
                        </TableCell>
                        <TableCell>{p.month_covered}</TableCell>
                        <TableCell>
                          <StatusBadge status={p.status} type="payment" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <Button
              type="button"
              variant="link"
              className="mt-1 h-auto px-0"
              style={{ color: BRAND_PRIMARY }}
              onClick={() =>
                toast.info("Use Record Payment on the Payments page.")
              }
            >
              Record Payment
            </Button>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              Claims
            </h3>
            {claims.length === 0 ? (
              <EmptyState
                icon={AlertCircle}
                title="No claims"
                description="Claims submitted for this policy appear here."
              />
            ) : (
              <ul className="space-y-2">
                {claims.map((c) => (
                  <li key={c.id}>
                    {claimsBasePath ? (
                      <Link
                        href={`${claimsBasePath}/${c.id}`}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/60"
                      >
                        <span>{c.deceased_name}</span>
                        <StatusBadge status={c.status} type="claim" />
                      </Link>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm">
                        <span>{c.deceased_name}</span>
                        <StatusBadge status={c.status} type="claim" />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 border-t border-border bg-background/95 p-3 backdrop-blur supports-backdrop-filter:bg-background/80">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() =>
              window.open(
                `/certificate/${policy.policy_number}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            <FileText className="size-4" />
            Print Certificate
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() =>
              toast.info("Add member from issuance or contact admin.")
            }
          >
            <UserPlus className="size-4" />
            Add Member
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => toast.info("Record payments under Payments.")}
          >
            <CreditCard className="size-4" />
            Record Payment
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => toast.info("Submit a claim from the Claims page.")}
          >
            <AlertCircle className="size-4" />
            Submit Claim
          </Button>
        </div>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </>
  );
}
