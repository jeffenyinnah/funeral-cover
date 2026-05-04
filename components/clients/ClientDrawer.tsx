"use client";

import type { Client, Policy } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ClientDetailContent } from "@/components/clients/ClientDetailContent";

export function ClientDrawer({
  open,
  onOpenChange,
  client,
  policies,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  policies: Policy[];
}) {
  if (!client) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-[520px]">
        <SheetHeader>
          <SheetTitle>{client.full_name}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <ClientDetailContent
            client={client}
            policies={policies}
            policyBasePath="/agent/policies"
            issuePolicyHref="/agent/policies/new"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
