"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useData } from "@/context/DataContext";
import { PolicyDetailContent } from "@/components/policies/PolicyDetailContent";
import { Button } from "@/components/ui/button";

export default function AdminPolicyDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const { policies, clients, members, payments, claims } = useData();

  const policy = policies.find((p) => p.id === id);
  if (!policy) notFound();

  const client = clients.find((c) => c.id === policy.client_id);
  if (!client) notFound();

  const polMembers = members.filter((m) => m.policy_id === policy.id);
  const polPayments = payments.filter((p) => p.policy_id === policy.id);
  const polClaims = claims.filter((c) => c.policy_id === policy.id);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/policies" className="gap-1">
          <ArrowLeft className="size-4" />
          Back to policies
        </Link>
      </Button>
      <h1 className="text-2xl font-semibold tracking-tight">Policy details</h1>
      <PolicyDetailContent
        policy={policy}
        client={client}
        members={polMembers}
        payments={polPayments}
        claims={polClaims}
        claimsBasePath="/admin/claims"
      />
    </div>
  );
}
