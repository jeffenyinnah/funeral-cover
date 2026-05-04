"use client";

import Link from "next/link";
import type { Client, Policy } from "@/lib/types";
import { BRAND_PRIMARY } from "@/lib/branding";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BalanceDisplay } from "@/components/shared/BalanceDisplay";
import { Button } from "@/components/ui/button";

export function ClientDetailContent({
  client,
  policies,
  policyBasePath,
  issuePolicyHref,
}: {
  client: Client;
  policies: Policy[];
  /** e.g. "/agent/policies" */
  policyBasePath: string;
  issuePolicyHref: string;
}) {
  return (
    <div className="space-y-6 text-sm">
      <dl className="grid grid-cols-2 gap-2 md:max-w-2xl">
        <dt className="text-muted-foreground">Passport</dt>
        <dd>{client.passport_number}</dd>
        <dt className="text-muted-foreground">DOB</dt>
        <dd>{client.date_of_birth}</dd>
        <dt className="text-muted-foreground">Phone</dt>
        <dd>{client.phone}</dd>
        <dt className="text-muted-foreground">WhatsApp</dt>
        <dd>{client.whatsapp_number}</dd>
        <dt className="text-muted-foreground">Email</dt>
        <dd>{client.email ?? "—"}</dd>
        <dt className="text-muted-foreground">Address</dt>
        <dd className="col-span-2">{client.address}</dd>
        <dt className="text-muted-foreground">City</dt>
        <dd>{client.city}</dd>
        <dt className="text-muted-foreground">Province</dt>
        <dd>{client.province}</dd>
        <dt className="text-muted-foreground">Nationality</dt>
        <dd>{client.nationality}</dd>
      </dl>

      <div>
        <h3 className="mb-2 font-semibold">Policies</h3>
        <ul className="space-y-2">
          {policies.map((p) => (
            <li key={p.id}>
              <Link
                href={`${policyBasePath}/${p.id}`}
                className="block rounded-lg border border-border px-3 py-2 text-xs transition-colors hover:bg-muted/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono">{p.policy_number}</span>
                  <StatusBadge status={p.status} type="policy" />
                </div>
                <p className="text-muted-foreground">
                  {p.product_line} · {p.tier}
                </p>
                <BalanceDisplay
                  balance={p.account_balance}
                  totalPremium={p.total_premium}
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Button
        asChild
        className="w-full font-semibold text-white"
        style={{ backgroundColor: BRAND_PRIMARY }}
      >
        <Link href={issuePolicyHref}>Issue Policy for this Client</Link>
      </Button>
    </div>
  );
}
