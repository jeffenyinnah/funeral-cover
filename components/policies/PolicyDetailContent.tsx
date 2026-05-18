"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { Claim, Client, Payment, Policy, PolicyMember } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { BRAND_PRIMARY } from "@/lib/branding";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BalanceDisplay } from "@/components/shared/BalanceDisplay";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, UserPlus, CreditCard, AlertCircle, Edit2, XCircle } from "lucide-react";

export function PolicyDetailContent({
  policy,
  client,
  members,
  payments,
  claims,
  claimsBasePath,
}: {
  policy: Policy;
  client: Client;
  members: PolicyMember[];
  payments: Payment[];
  claims: Claim[];
  claimsBasePath?: string;
}) {
  const { plans, agents, updatePolicy } = useData();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const plan = plans.find(
    (p) => p.product_line === policy.product_line && p.tier === policy.tier
  );
  const principalCover = plan?.cover_amount ?? 0;

  // Edit policy dialog
  const [editOpen, setEditOpen] = React.useState(false);
  const [editDraft, setEditDraft] = React.useState({
    status: policy.status,
    agent_id: policy.agent_id,
    inception_date: policy.inception_date,
    cover_start_date: policy.cover_start_date,
  });

  const openEdit = () => {
    setEditDraft({
      status: policy.status,
      agent_id: policy.agent_id,
      inception_date: policy.inception_date,
      cover_start_date: policy.cover_start_date,
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    updatePolicy(policy.id, editDraft);
    toast.success("Policy updated");
    setEditOpen(false);
  };

  // Cancel policy dialog
  const [cancelOpen, setCancelOpen] = React.useState(false);

  const confirmCancel = () => {
    updatePolicy(policy.id, { status: "cancelled" });
    toast.success("Policy cancelled");
    setCancelOpen(false);
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-1 py-1 md:px-0">
          {/* Client details */}
          <section>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              Client details
            </h3>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              <Detail label="Name" value={client.full_name} />
              <Detail
                label={client.document_type ?? "Passport"}
                value={client.passport_number}
              />
              <Detail label="Phone" value={client.phone} />
              <Detail label="City" value={client.city} />
              <Detail label="Province" value={client.province} />
              <Detail label="Nationality" value={client.nationality} />
            </dl>
          </section>

          {/* Policy details */}
          <section>
            <p
              className="mb-2 text-2xl font-semibold"
              style={{
                fontFamily: "var(--font-dm-serif), serif",
                color: BRAND_PRIMARY,
              }}
            >
              {policy.policy_number}
            </p>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              Policy details
            </h3>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              <Detail label="Product" value={policy.product_line} />
              <Detail label="Tier" value={policy.tier} />
              <Detail
                label="Premium type"
                value={policy.premium_type === "monthly" ? "Monthly" : "Annual"}
              />
              <Detail
                label="Base premium"
                value={formatCurrency(policy.base_premium)}
              />
              <Detail
                label="Members premium"
                value={formatCurrency(policy.members_premium)}
              />
              <Detail
                label="Total premium"
                value={formatCurrency(policy.total_premium)}
              />
              <Detail
                label="Principal cover"
                value={formatCurrency(principalCover)}
              />
              <Detail label="Inception" value={policy.inception_date} />
              <Detail label="Cover start" value={policy.cover_start_date} />
              <div className="col-span-2">
                <span className="text-muted-foreground">Status </span>
                <StatusBadge status={policy.status} type="policy" />
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Balance </span>
                <BalanceDisplay
                  balance={policy.account_balance}
                  totalPremium={policy.total_premium}
                />
              </div>
              {policy.next_of_kin_name && (
                <>
                  <Detail label="Next of kin" value={policy.next_of_kin_name} />
                  <Detail
                    label="NOK relationship"
                    value={policy.next_of_kin_relationship ?? ""}
                  />
                  <Detail
                    label="NOK phone"
                    value={policy.next_of_kin_phone ?? ""}
                  />
                </>
              )}
            </dl>
          </section>

          {/* Members */}
          <section>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              Members
            </h3>
            {members.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title="No members"
                description="Add dependants to this policy from the policy list when supported."
              />
            ) : (
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Rel.</TableHead>
                      <TableHead>DOB</TableHead>
                      <TableHead>Doc Type</TableHead>
                      <TableHead>Doc No.</TableHead>
                      <TableHead>Cover</TableHead>
                      <TableHead>+ / mo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>{m.full_name}</TableCell>
                        <TableCell>{m.relationship}</TableCell>
                        <TableCell>{m.date_of_birth}</TableCell>
                        <TableCell>{m.document_type ?? "—"}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {m.id_or_passport}
                        </TableCell>
                        <TableCell>{formatCurrency(m.cover_amount)}</TableCell>
                        <TableCell>{formatCurrency(m.addon_cost)}</TableCell>
                        <TableCell>{m.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <Button
              type="button"
              variant="link"
              className="mt-1 h-auto px-0"
              style={{ color: BRAND_PRIMARY }}
              onClick={() => toast.info("Add member flow opens from policy issuance.")}
            >
              Add Member
            </Button>
          </section>

          {/* Payment history */}
          <section>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              Payment history
            </h3>
            {payments.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="No payments"
                description="Record the first premium payment for this policy."
              />
            ) : (
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Ref</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.payment_date}</TableCell>
                        <TableCell>{formatCurrency(p.amount)}</TableCell>
                        <TableCell>{p.method}</TableCell>
                        <TableCell className="max-w-[100px] truncate font-mono text-xs">
                          {p.mpesa_reference ?? "—"}
                        </TableCell>
                        <TableCell>{p.month_covered}</TableCell>
                        <TableCell>
                          <StatusBadge status={p.status} type="payment" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <Button
              type="button"
              variant="link"
              className="mt-1 h-auto px-0"
              style={{ color: BRAND_PRIMARY }}
              onClick={() => toast.info("Use Record Payment on the Payments page.")}
            >
              Record Payment
            </Button>
          </section>

          {/* Claims */}
          <section>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
              Claims
            </h3>
            {claims.length === 0 ? (
              <EmptyState
                icon={AlertCircle}
                title="No claims"
                description="Claims submitted for this policy appear here."
              />
            ) : (
              <ul className="space-y-2">
                {claims.map((c) => (
                  <li key={c.id}>
                    {claimsBasePath ? (
                      <Link
                        href={`${claimsBasePath}/${c.id}`}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/60"
                      >
                        <span>{c.deceased_name}</span>
                        <StatusBadge status={c.status} type="claim" />
                      </Link>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm">
                        <span>{c.deceased_name}</span>
                        <StatusBadge status={c.status} type="claim" />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Footer actions */}
        <div className="flex shrink-0 flex-wrap gap-2 border-t border-border bg-background/95 p-3 backdrop-blur supports-backdrop-filter:bg-background/80">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() =>
              window.open(
                `/certificate/${policy.policy_number}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            <FileText className="size-4" />
            Print Certificate
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => toast.info("Add member from issuance or contact admin.")}
          >
            <UserPlus className="size-4" />
            Add Member
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => toast.info("Record payments under Payments.")}
          >
            <CreditCard className="size-4" />
            Record Payment
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => toast.info("Submit a claim from the Claims page.")}
          >
            <AlertCircle className="size-4" />
            Submit Claim
          </Button>

          {/* Admin-only actions */}
          {isAdmin && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={openEdit}
              >
                <Edit2 className="size-4" />
                Edit Policy
              </Button>
              {policy.status !== "cancelled" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={() => setCancelOpen(true)}
                >
                  <XCircle className="size-4" />
                  Cancel Policy
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Policy Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Policy — {policy.policy_number}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={editDraft.status}
                onValueChange={(v) =>
                  setEditDraft((d) => ({ ...d, status: v as Policy["status"] }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="lapsed">Lapsed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assigned Agent</Label>
              <Select
                value={editDraft.agent_id}
                onValueChange={(v) =>
                  setEditDraft((d) => ({ ...d, agent_id: v }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} — {a.branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Inception Date</Label>
              <Input
                type="date"
                value={editDraft.inception_date}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, inception_date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cover Start Date</Label>
              <Input
                type="date"
                value={editDraft.cover_start_date}
                onChange={(e) =>
                  setEditDraft((d) => ({ ...d, cover_start_date: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[#1892ff] text-white hover:bg-[#1892ff]/90"
              onClick={saveEdit}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Policy Confirmation */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel policy?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Cancel policy <strong>{policy.policy_number}</strong>? This cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelOpen(false)}
            >
              Back
            </Button>
            <Button type="button" variant="destructive" onClick={confirmCancel}>
              Confirm cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </>
  );
}
