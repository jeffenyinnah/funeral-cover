"use client";

import * as React from "react";
import { toast } from "sonner";
import type { Client, Policy, PolicyMember } from "@/lib/types";
import { findPlanByProductAndTier } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

function formatDob(iso: string) {
  try {
    return format(new Date(iso + "T12:00:00"), "dd MMM yyyy");
  } catch {
    return iso;
  }
}

export function CertificateModal({
  policy,
  client,
  members,
  isOpen,
  onClose,
}: {
  policy: Policy;
  client: Client;
  members: PolicyMember[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const plan = findPlanByProductAndTier(policy.product_line, policy.tier);
  const coverAmount = plan?.cover_amount ?? 0;
  const generatedAt = React.useMemo(() => new Date(), []);
  const systemId = policy.id.replace(/\D/g, "").slice(-6).padStart(6, "0");
  const payDigits = policy.id.replace(/\D/g, "").slice(0, 8) || "00000000";

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton
        className="max-h-[90vh] max-w-[680px] overflow-y-auto bg-zinc-950 p-4 sm:p-6"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Policy certificate</DialogTitle>
        </DialogHeader>

        <div className="relative mx-auto max-w-[640px] rounded-lg bg-white p-6 text-black shadow-xl">
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg"
            aria-hidden
          >
            <span
              className="select-none text-[120px] font-bold"
              style={{
                color: "#00000008",
                transform: "rotate(-45deg)",
              }}
            >
              DEMO
            </span>
          </div>

          <header className="relative z-[1] flex gap-3 border-b border-black/20 pb-4">
            <svg
              width="40"
              height="48"
              viewBox="0 0 40 48"
              className="shrink-0 text-black"
              aria-hidden
            >
              <path
                fill="currentColor"
                d="M20 2L4 10v14c0 11 8 20 16 22 8-2 16-11 16-22V10L20 2zm0 8a6 6 0 016 6v4H14v-4a6 6 0 016-6z"
              />
            </svg>
            <div className="min-w-0 flex-1 text-sm leading-snug">
              <p className="text-lg font-bold">Britam Funeral Services</p>
              <p>Partnered with Dei-Sta Funeral Services</p>
              <p>45 Protea Avenue, Heidelberg, Gauteng 1441</p>
              <p>Tel: 010 157 1081 | Cell: 078 131 3749</p>
              <p className="mt-2 text-center text-xs">
                Underwritten by African Unity Life Ltd, FSP 8447
              </p>
              <p className="text-center text-xs">
                Administered by Ingwe Life (PTY) FSP 46004
              </p>
            </div>
          </header>

          <div className="relative z-[1] mt-4 space-y-4 text-sm">
            <div className="border-b border-black/20 pb-3 text-center">
              <p className="font-serif text-lg font-semibold">
                Policy Schedule for {client.full_name}
              </p>
              <p className="text-xs text-black/70">
                Generated on: {format(generatedAt, "dd MMM yyyy HH:mm")}
              </p>
            </div>

            <section>
              <h4 className="mb-2 border-b border-black/15 pb-1 font-semibold">
                Principal details
              </h4>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <dt className="text-black/70">Company Code</dt>
                <dd>188</dd>
                <dt className="text-black/70">System ID</dt>
                <dd>{systemId}</dd>
                <dt className="text-black/70">Name</dt>
                <dd>{client.full_name}</dd>
                <dt className="text-black/70">ID/Passport No.</dt>
                <dd>{client.passport_number}</dd>
                <dt className="text-black/70">Date of Birth</dt>
                <dd>{formatDob(client.date_of_birth)}</dd>
                <dt className="text-black/70">Cellphone</dt>
                <dd>{client.phone}</dd>
                <dt className="text-black/70">WhatsApp</dt>
                <dd>{client.whatsapp_number}</dd>
                <dt className="text-black/70">Email</dt>
                <dd>{client.email?.trim() ? client.email : "Not provided"}</dd>
                <dt className="text-black/70">Address</dt>
                <dd>{client.address}</dd>
                <dt className="text-black/70">City/Town</dt>
                <dd>{client.city}</dd>
                <dt className="text-black/70">Province</dt>
                <dd>{client.province}</dd>
                <dt className="text-black/70">Nationality</dt>
                <dd>{client.nationality}</dd>
              </dl>
            </section>

            <section>
              <h4 className="mb-2 border-b border-black/15 pb-1 font-semibold">
                Policy details
              </h4>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <dt className="text-black/70">Policy Number</dt>
                <dd className="font-bold">{policy.policy_number}</dd>
                <dt className="text-black/70">Status</dt>
                <dd>
                  <StatusBadge status={policy.status} type="policy" />
                </dd>
                <dt className="text-black/70">Inception Date</dt>
                <dd>{formatDob(policy.inception_date)}</dd>
                <dt className="text-black/70">Cover Start Date</dt>
                <dd>{formatDob(policy.cover_start_date)}</dd>
                <dt className="text-black/70">Product Line</dt>
                <dd>{policy.product_line}</dd>
                <dt className="text-black/70">Plan Tier</dt>
                <dd>{policy.tier}</dd>
                <dt className="text-black/70">Premium Type</dt>
                <dd>
                  {policy.premium_type === "monthly" ? "Monthly" : "Annual"}
                </dd>
                <dt className="text-black/70">Waiting Period</dt>
                <dd>6 months (natural) / 1 month (accidental)</dd>
                <dt className="text-black/70">Base Premium</dt>
                <dd>{formatCurrency(policy.base_premium)}</dd>
                <dt className="text-black/70">Members Premium</dt>
                <dd>{formatCurrency(policy.members_premium)}</dd>
                <dt className="text-black/70">Monthly Premium</dt>
                <dd className="font-bold">{formatCurrency(policy.total_premium)}</dd>
                <dt className="text-black/70">Cover Amount</dt>
                <dd className="text-lg font-bold">{formatCurrency(coverAmount)}</dd>
              </dl>
            </section>

            <section>
              <h4 className="mb-2 font-semibold">Active Dependants</h4>
              {members.filter((m) => m.status === "active").length === 0 ? (
                <p className="text-xs">No active dependants on this policy</p>
              ) : (
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-black/20 text-left">
                      <th className="py-1 pr-2">Name</th>
                      <th className="py-1 pr-2">Relationship</th>
                      <th className="py-1 pr-2">DOB</th>
                      <th className="py-1 pr-2">Cover</th>
                      <th className="py-1">Add-on</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members
                      .filter((m) => m.status === "active")
                      .map((m) => (
                        <tr key={m.id} className="border-b border-black/10">
                          <td className="py-1 pr-2">{m.full_name}</td>
                          <td className="py-1 pr-2">{m.relationship}</td>
                          <td className="py-1 pr-2">{formatDob(m.date_of_birth)}</td>
                          <td className="py-1 pr-2">
                            {formatCurrency(m.cover_amount)}
                          </td>
                          <td className="py-1">{formatCurrency(m.addon_cost)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="border-t border-black/20 pt-3 text-xs">
              <p>Pay@ No.: 1168 3188 {payDigits}</p>
              <p>M-Pesa: Registered to {client.phone}</p>
              <p>Direct Debit: Not activated on policy</p>
            </section>

            <footer className="border-t border-black/20 pt-3 text-center text-[10px] text-black/70">
              <p>
                Ingwe Life is a Cat 4 Authorised Financial Service Provider FSP
                46004
              </p>
              <p>
                Ref: ps/188/{policy.id} | Page 1 of 1 |{" "}
                {format(generatedAt, "dd MMM yyyy")}
              </p>
            </footer>
          </div>
        </div>

        <div className="relative z-[1] mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-white/30 text-white hover:bg-white/10"
            onClick={() => toast.info("PDF download coming soon")}
          >
            Download PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-white/30 text-white hover:bg-white/10"
            onClick={async () => {
              const url = `https://britamfuneral.app/certificate/${policy.policy_number}`;
              try {
                await navigator.clipboard.writeText(url);
                toast.info("Certificate link copied!");
              } catch {
                toast.error("Could not copy link");
              }
            }}
          >
            Share Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
