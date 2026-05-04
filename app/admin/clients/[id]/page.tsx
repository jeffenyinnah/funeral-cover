"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useData } from "@/context/DataContext";
import { ClientDetailContent } from "@/components/clients/ClientDetailContent";
import { Button } from "@/components/ui/button";

export default function AdminClientDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const { clients, policies } = useData();

  const client = clients.find((c) => c.id === id);
  if (!client) notFound();

  const clientPolicies = policies.filter((p) => p.client_id === client.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/admin/clients" className="gap-1">
          <ArrowLeft className="size-4" />
          Back to clients
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {client.full_name}
        </h1>
        <p className="text-sm text-muted-foreground">Client details</p>
      </div>
      <ClientDetailContent
        client={client}
        policies={clientPolicies}
        policyBasePath="/admin/policies"
        issuePolicyHref="/admin/policies"
      />
    </div>
  );
}
