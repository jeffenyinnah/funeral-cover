"use client";

import type { Claim, Client, Policy } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ClaimDetailContent } from "@/components/claims/ClaimDetailContent";

export function ClaimDrawer({
  open,
  onOpenChange,
  claim,
  policy,
  client,
  isAdmin,
  onApprove,
  onReject,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: Claim | null;
  policy: Policy | null;
  client: Client | null;
  isAdmin?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
}) {
  if (!claim || !policy || !client) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="flex w-full flex-col overflow-y-auto sm:max-w-[520px]"
        showCloseButton
      >
        <SheetHeader>
          <SheetTitle>Claim</SheetTitle>
        </SheetHeader>
        <div className="mt-2 px-1">
          <ClaimDetailContent
            claim={claim}
            policy={policy}
            client={client}
            isAdmin={isAdmin}
            onApprove={onApprove}
            onReject={onReject}
            onDismiss={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
