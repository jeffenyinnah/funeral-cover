"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/context/DataContext";
import { CertificatePageContent } from "@/components/policies/CertificateModal";

export default function CertificatePage() {
  const params = useParams<{ policyNumber: string }>();
  const policyNumber = decodeURIComponent(params.policyNumber ?? "");
  const { policies, clients, members } = useData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const bundle = useMemo(() => {
    const policy = policies.find((p) => p.policy_number === policyNumber);
    if (!policy) return null;
    const client = clients.find((c) => c.id === policy.client_id);
    if (!client) return null;
    const policyMembers = members.filter((m) => m.policy_id === policy.id);
    return { policy, client, policyMembers };
  }, [clients, members, policies, policyNumber]);

  // Wait for client mount so DataContext has had a chance to merge
  // localStorage records before declaring a policy not found.
  if (!mounted) {
    return null;
  }

  if (!bundle) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="text-xl font-semibold">Certificate not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not find a certificate for policy number: {policyNumber}
        </p>
      </div>
    );
  }

  return (
    <CertificatePageContent
      policy={bundle.policy}
      client={bundle.client}
      members={bundle.policyMembers}
    />
  );
}
