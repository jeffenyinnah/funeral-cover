"use client";

import * as React from "react";
import type { Claim, Client, Payment, Policy, PolicyMember } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PolicyDetailContent } from "@/components/policies/PolicyDetailContent";

export function PolicyDrawer({
  open,
  onOpenChange,
  policy,
  client,
  members,
  payments,
  claims,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: Policy | null;
  client: Client | null;
  members: PolicyMember[];
  payments: Payment[];
  claims: Claim[];
}) {
  if (!policy || !client) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="flex w-full flex-col p-0 sm:max-w-[520px]"
        showCloseButton
      >
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle>Policy details</SheetTitle>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
          <PolicyDetailContent
            policy={policy}
            client={client}
            members={members}
            payments={payments}
            claims={claims}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
