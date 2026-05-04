"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { ClaimDetailContent } from "@/components/claims/ClaimDetailContent";
import { Button } from "@/components/ui/button";

export default function AgentClaimDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const { agentId } = useAuth();
  const { claims, policies, clients } = useData();
  const aid = agentId ?? "agent-1";

  const claim = claims.find((c) => c.id === id);
  if (!claim) notFound();

  const policy = policies.find((p) => p.id === claim.policy_id);
  if (!policy || policy.agent_id !== aid) notFound();

  const client = clients.find((c) => c.id === policy.client_id);
  if (!client) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/agent/claims" className="gap-1">
          <ArrowLeft className="size-4" />
          Back to claims
        </Link>
      </Button>
      <h1 className="text-2xl font-semibold tracking-tight">Claim details</h1>
      <ClaimDetailContent claim={claim} policy={policy} client={client} />
    </div>
  );
}
