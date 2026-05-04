"use client";

import * as React from "react";
import { differenceInMonths } from "date-fns";
import { toast } from "sonner";
import type { Claim, Client, Policy } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { BRAND_PRIMARY } from "@/lib/branding";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const stages = [
  "submitted",
  "under_review",
  "approved",
  "paid",
] as const;

function minMonths(cause: Claim["cause_of_death"]): number {
  if (cause === "Natural") return 6;
  if (cause === "Accidental") return 1;
  return 24;
}

export function ClaimDetailContent({
  claim,
  policy,
  client,
  isAdmin,
  onApprove,
  onReject,
  onDismiss,
}: {
  claim: Claim;
  policy: Policy;
  client: Client;
  isAdmin?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  /** Called after successful reject (e.g. close drawer) */
  onDismiss?: () => void;
}) {
  const [docs, setDocs] = React.useState<Record<string, boolean>>({});
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");

  const inception = new Date(policy.inception_date + "T12:00:00");
  const death = new Date(claim.date_of_death + "T12:00:00");
  const elapsed = Math.max(0, differenceInMonths(death, inception));
  const required = minMonths(claim.cause_of_death);
  const eligible = elapsed >= required;

  const idx = stages.indexOf(
    claim.status === "rejected"
      ? "submitted"
      : claim.status === "paid"
        ? "paid"
        : (stages.find((s) => s === claim.status) ?? "submitted")
  );

  return (
    <>
      <div className="space-y-6 pb-8">
        <section className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
          <p className="font-medium">{policy.policy_number}</p>
          <p className="text-muted-foreground">{client.full_name}</p>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Deceased details</h3>
          <dl className="space-y-1 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{claim.deceased_name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Relationship</dt>
              <dd>{claim.relationship}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Cause</dt>
              <dd>
                <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {claim.cause_of_death}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Date of death</dt>
              <dd>{claim.date_of_death}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Payout</dt>
              <dd className="font-semibold">
                {formatCurrency(claim.claim_amount)}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Eligibility</h3>
          {eligible ? (
            <div className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 p-3 text-sm text-emerald-800">
              Policy started {policy.inception_date}. {elapsed} months elapsed.
              Minimum for {claim.cause_of_death}: {required} months.{" "}
              <strong>ELIGIBLE TO CLAIM.</strong>
            </div>
          ) : (
            <div className="rounded-lg border border-red-600/40 bg-red-500/10 p-3 text-sm text-red-800">
              Policy started {policy.inception_date}. Only {elapsed} months
              elapsed. Minimum for {claim.cause_of_death}: {required} months.{" "}
              <strong>NOT ELIGIBLE.</strong>
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Documents checklist</h3>
          <ul className="space-y-2 text-sm">
            <DocRow
              id="ingwe"
              label="Ingwe Life claim form"
              checked={!!docs.ingwe}
              onChecked={(v) => setDocs((d) => ({ ...d, ingwe: v }))}
            />
            <DocRow
              id="bi5"
              label="BI-5 Computerised death certificate (certified copy)"
              checked={!!docs.bi5}
              onChecked={(v) => setDocs((d) => ({ ...d, bi5: v }))}
            />
            <DocRow
              id="dec"
              label="Deceased's ID/passport (certified copy)"
              checked={!!docs.dec}
              onChecked={(v) => setDocs((d) => ({ ...d, dec: v }))}
            />
            <DocRow
              id="mem"
              label="Main member's ID (certified copy)"
              checked={!!docs.mem}
              onChecked={(v) => setDocs((d) => ({ ...d, mem: v }))}
            />
            <DocRow
              id="bi1663"
              label="BI1663"
              checked={!!docs.bi1663}
              onChecked={(v) => setDocs((d) => ({ ...d, bi1663: v }))}
            />
            {claim.cause_of_death === "Accidental" && (
              <DocRow
                id="sap"
                label="SAP Report"
                checked={!!docs.sap}
                onChecked={(v) => setDocs((d) => ({ ...d, sap: v }))}
              />
            )}
            <DocRow
              id="app"
              label="Original application form"
              checked={!!docs.app}
              onChecked={(v) => setDocs((d) => ({ ...d, app: v }))}
            />
          </ul>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold">Status timeline</h3>
          <ol className="relative ms-2 space-y-4 border-s border-border ps-6">
            {stages.map((stage, i) => {
              const done =
                claim.status === "paid"
                  ? true
                  : claim.status === "rejected"
                    ? stage === "submitted"
                    : i < idx ||
                      (i === idx &&
                        ["submitted", "under_review", "approved"].includes(
                          claim.status
                        ));
              const current =
                claim.status === stage ||
                (claim.status === "under_review" && stage === "under_review");
              return (
                <li key={stage} className="text-sm">
                  <span
                    className={cn(
                      "absolute -start-[5px] mt-1.5 size-2.5 rounded-full border-2 border-background",
                      done && "bg-emerald-500",
                      current && "animate-pulse",
                      !done && !current && "bg-muted-foreground/30"
                    )}
                    style={
                      current
                        ? {
                            backgroundColor: BRAND_PRIMARY,
                            boxShadow: `0 0 0 4px ${BRAND_PRIMARY}33`,
                          }
                        : undefined
                    }
                  />
                  <span className="capitalize">
                    {stage.replace("_", " ")}
                  </span>
                  {stage === "submitted" && claim.submitted_at && (
                    <span className="block text-xs text-muted-foreground">
                      {claim.submitted_at}
                    </span>
                  )}
                  {stage === "under_review" && claim.reviewed_at && (
                    <span className="block text-xs text-muted-foreground">
                      {claim.reviewed_at}
                    </span>
                  )}
                  {stage === "paid" && claim.paid_at && (
                    <span className="block text-xs text-muted-foreground">
                      {claim.paid_at}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {claim.status === "rejected" && claim.rejection_reason && (
          <div className="rounded-lg border border-red-600/50 bg-red-500/10 p-3 text-sm text-red-800">
            {claim.rejection_reason}
          </div>
        )}

        {isAdmin &&
          (claim.status === "submitted" || claim.status === "under_review") && (
            <div className="flex gap-2">
              <Button
                type="button"
                className="flex-1 bg-emerald-600 hover:bg-emerald-600/90"
                onClick={() => {
                  onApprove?.(claim.id);
                  toast.success("Claim approved");
                }}
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={() => setRejectOpen(true)}
              >
                Reject
              </Button>
            </div>
          )}
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this claim?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Provide a reason. This cannot be undone.
          </p>
          <Input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!rejectReason.trim()}
              onClick={() => {
                if (!rejectReason.trim()) {
                  toast.error("Rejection reason is required");
                  return;
                }
                onReject?.(claim.id, rejectReason.trim());
                toast.success("Claim rejected");
                setRejectOpen(false);
                onDismiss?.();
              }}
            >
              Reject claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DocRow({
  id,
  label,
  checked,
  onChecked,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChecked: (v: boolean) => void;
}) {
  return (
    <li className="flex items-start gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onChecked(v === true)}
      />
      <Label htmlFor={id} className="font-normal leading-snug">
        {label}
      </Label>
    </li>
  );
}
