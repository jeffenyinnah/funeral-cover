"use client";

import * as React from "react";
import { toast } from "sonner";
import type { Client, Policy, PolicyMember } from "@/lib/types";
import { findPlanByProductAndTier } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

function formatDob(iso: string) {
  try {
    return format(new Date(iso + "T12:00:00"), "dd MMM yyyy");
  } catch {
    return iso;
  }
}

export function CertificatePageContent({
  policy,
  client,
  members,
}: {
  policy: Policy;
  client: Client;
  members: PolicyMember[];
}) {
  const plan = findPlanByProductAndTier(policy.product_line, policy.tier);
  const coverAmount = plan?.cover_amount ?? 0;
  const generatedAt = React.useMemo(() => new Date(), []);
  const systemId = policy.id.replace(/\D/g, "").slice(-6).padStart(6, "0");
  const payDigits = policy.id.replace(/\D/g, "").slice(0, 8) || "00000000";
  const certificateUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/certificate/${policy.policy_number}`
      : `/certificate/${policy.policy_number}`;

  const handleDownload = React.useCallback(() => {
    window.print();
  }, []);

  const handleCopyLink = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(certificateUrl);
      toast.info("Certificate link copied!");
    } catch {
      toast.error("Could not copy certificate link");
    }
  }, [certificateUrl]);

  const handleShareEmail = React.useCallback(() => {
    const subject = encodeURIComponent(
      `Policy Certificate ${policy.policy_number}`
    );
    const body = encodeURIComponent(
      `Hello,\n\nPlease find the policy certificate for ${client.full_name} here:\n${certificateUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [certificateUrl, client.full_name, policy.policy_number]);

  const handleShareWhatsApp = React.useCallback(() => {
    const text = encodeURIComponent(
      `Policy certificate for ${client.full_name}: ${certificateUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }, [certificateUrl, client.full_name]);

  return (
    <div className="bg-zinc-950 p-3 sm:p-5 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex w-full max-w-[794px] flex-wrap justify-end gap-2 print:hidden">
        <Button type="button" variant="outline" onClick={handleDownload}>
          Download PDF
        </Button>
        <Button type="button" variant="outline" onClick={handleShareEmail}>
          Share via Email
        </Button>
        <Button type="button" variant="outline" onClick={handleShareWhatsApp}>
          Share via WhatsApp
        </Button>
        <Button type="button" variant="outline" onClick={handleCopyLink}>
          Copy Link
        </Button>
      </div>

      <div className="relative mx-auto min-h-[1123px] w-full max-w-[794px] rounded-sm bg-white p-6 text-black shadow-xl sm:p-10 print:min-h-0 print:max-w-none print:rounded-none print:p-8 print:shadow-none">
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

          <header className="relative z-[1] border-b border-black/20 pb-4">
            <div className="flex items-start justify-between gap-4">
              <img
                src="/dei.png"
                alt="Dei-Sta Funeral Services"
                className="h-12 w-auto shrink-0 object-contain sm:h-14"
              />
              <div className="text-right text-xs leading-snug sm:text-sm">
                <p className="font-semibold">Dei-Sta Funeral Services</p>
                <p>45 Protea Avenue, Heidelberg, Gauteng 1441</p>
                <p className="mt-2">Tel: 010 157 1081</p>
                <p>Cell: 078 131 3749</p>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-black/80">
              Dei-Sta Funeral Services is a Juristic Representative under Ingwe
              Life (PTY) FSP 46004 and underwritten by African Unity Life Ltd,
              a licensed life insurer FSP 8447.
            </p>
          </header>

          <div className="relative z-[1] mt-4 space-y-4 text-sm">
            <div className="border-b border-black/20 pb-3 text-center">
              <p className="font-serif text-xl font-semibold">
                Policy Schedule for {client.full_name}
              </p>
              <p className="text-xs italic text-black/60">
                This document has been generated on{" "}
                {format(generatedAt, "dd-MM-yyyy 'at' HH:mm")}
              </p>
              <p className="text-xs italic text-black/60">
                * Age and cover status displayed is calculated as of this date
                and time and may vary thereafter.
              </p>
            </div>

            <section>
              <h4 className="mb-2 border-b border-black/15 pb-1 font-semibold">
                Principal details
              </h4>
              <div className="grid grid-cols-1 gap-6 text-xs sm:grid-cols-2">
                <dl className="space-y-1">
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <dt className="font-semibold">Company code:</dt>
                    <dd>188</dd>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <dt className="font-semibold">System ID:</dt>
                    <dd>{systemId}</dd>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <dt className="font-semibold">Name:</dt>
                    <dd>{client.full_name}</dd>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <dt className="font-semibold">ID/Passport:</dt>
                    <dd>{client.passport_number}</dd>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <dt className="font-semibold">Date of birth:</dt>
                    <dd>{formatDob(client.date_of_birth)}</dd>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <dt className="font-semibold">Email:</dt>
                    <dd>{client.email?.trim() ? client.email : "No details found"}</dd>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <dt className="font-semibold">Cellphone No.:</dt>
                    <dd>{client.phone}</dd>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <dt className="font-semibold">WhatsApp No.:</dt>
                    <dd>{client.whatsapp_number || "No details found"}</dd>
                  </div>
                </dl>

                <dl className="space-y-1">
                  <div className="grid grid-cols-[130px_1fr] gap-2">
                    <dt className="font-semibold">Account balance:</dt>
                    <dd>R 0.00</dd>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] gap-2">
                    <dt className="font-semibold">Assigned package:</dt>
                    <dd>{policy.product_line}</dd>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] gap-2">
                    <dt className="font-semibold">Package min/max:</dt>
                    <dd>18-64 years</dd>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] gap-2">
                    <dt className="font-semibold">Waiting period:</dt>
                    <dd>6 months for natural causes</dd>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] gap-2">
                    <dt className="font-semibold">Base premium rate:</dt>
                    <dd>{formatCurrency(policy.base_premium)}</dd>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] gap-2">
                    <dt className="font-semibold">Dependant add cost:</dt>
                    <dd>{formatCurrency(policy.members_premium)}</dd>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] gap-2">
                    <dt className="font-semibold">Monthly premium:</dt>
                    <dd className="font-semibold">
                      {formatCurrency(policy.total_premium)}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[130px_1fr] gap-2">
                    <dt className="font-semibold">Cover amount:</dt>
                    <dd className="font-semibold">{formatCurrency(coverAmount)}</dd>
                  </div>
                </dl>
              </div>
            </section>

            <section>
              <h4 className="mb-2 border-b border-black/15 pb-1 font-semibold">
                Policy details
              </h4>
              <dl className="grid grid-cols-1 gap-y-1 text-xs sm:grid-cols-2 sm:gap-x-6">
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="font-semibold">Policy number:</dt>
                  <dd>{policy.policy_number}</dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="font-semibold">Inception date:</dt>
                  <dd>{formatDob(policy.inception_date)}</dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="font-semibold">Cover start date:</dt>
                  <dd>{formatDob(policy.cover_start_date)}</dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="font-semibold">Cover status:</dt>
                  <dd className="capitalize">{policy.status}</dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="font-semibold">Assigned branch:</dt>
                  <dd>Dei Sta Funerals</dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="font-semibold">Underwriter:</dt>
                  <dd>African Unity Life Ltd</dd>
                </div>
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

            <footer className="border-t border-black/20 pt-4 text-center text-[10px] text-black/70">
              <img
                src="/Britam.png"
                alt="Britam"
                className="mx-auto mb-2 h-10 w-auto object-contain"
              />
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
    </div>
  );
}
