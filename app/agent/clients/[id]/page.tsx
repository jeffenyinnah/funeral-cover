"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { ClientDetailContent } from "@/components/clients/ClientDetailContent";
import { Button } from "@/components/ui/button";

export default function AgentClientDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const { agentId } = useAuth();
  const { clients, policies } = useData();
  const aid = agentId ?? "agent-1";

  const client = clients.find((c) => c.id === id);
  if (!client) notFound();

  const myPolicyClientIds = new Set(
    policies.filter((p) => p.agent_id === aid).map((p) => p.client_id)
  );
  const allowed =
    client.created_by === aid || myPolicyClientIds.has(client.id);
  if (!allowed) notFound();

  const clientPolicies = policies.filter(
    (p) => p.client_id === client.id && p.agent_id === aid
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/agent/clients" className="gap-1">
            <ArrowLeft className="size-4" />
            Back to clients
          </Link>
        </Button>
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {client.full_name}
        </h1>
        <p className="text-sm text-muted-foreground">Client details</p>
      </div>
      <ClientDetailContent
        client={client}
        policies={clientPolicies}
        policyBasePath="/agent/policies"
        issuePolicyHref="/agent/policies/new"
      />
    </div>
  );
}
