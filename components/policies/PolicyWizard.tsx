"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { PLANS } from "@/lib/demo-data";
import type { Client, Plan, Policy, PolicyMember } from "@/lib/types";
import type { MemberRelationship } from "@/lib/types";
import {
  calculateAnnualPremium,
  calculateCoverStartDate,
  formatCurrency,
  generatePolicyNumber,
} from "@/lib/utils";
import { BRAND_PRIMARY } from "@/lib/branding";
import { newClientFormSchema, type NewClientFormValues } from "@/lib/schemas/new-client";
import { SA_PROVINCES } from "@/lib/provinces";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { MpesaSimulator } from "@/components/mpesa/MpesaSimulator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const COVER_LEVELS = [
  { label: "R 2,000 cover — R 70/month", addon: 70 as const, cover: 2000 as const },
  { label: "R 5,000 cover — R 220/month", addon: 220 as const, cover: 5000 as const },
  { label: "R 10,000 cover — R 250/month", addon: 250 as const, cover: 10000 as const },
  { label: "R 15,000 cover — R 299/month", addon: 299 as const, cover: 15000 as const },
];

type WizardMember = Omit<PolicyMember, "policy_id" | "id" | "status"> & {
  tempId: string;
};

function newTempId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function PolicyWizard() {
  const router = useRouter();
  const { agentId } = useAuth();
  const { clients, addClient, addPolicy } = useData();

  const [step, setStep] = React.useState(1);
  const [clientTab, setClientTab] = React.useState<"existing" | "new">(
    "existing"
  );
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [clientSearch, setClientSearch] = React.useState("");
  const [selectedPlan, setSelectedPlan] = React.useState<Plan | null>(null);
  const [productLine, setProductLine] = React.useState<
    "Tumelo Nations Plan" | "Uhambolwethu Funeral Cover"
  >("Tumelo Nations Plan");
  const [premiumType, setPremiumType] = React.useState<"monthly" | "annual">(
    "monthly"
  );
  const [members, setMembers] = React.useState<WizardMember[]>([]);
  const [mpesaReference, setMpesaReference] = React.useState<string | null>(
    null
  );
  const [policyNumber] = React.useState(() => generatePolicyNumber());
  const [successOpen, setSuccessOpen] = React.useState(false);

  const form = useForm<NewClientFormValues>({
    resolver: zodResolver(newClientFormSchema),
    defaultValues: {
      full_name: "",
      passport_number: "",
      date_of_birth: "",
      nationality: "Mozambican",
      phone: "",
      whatsapp_number: "",
      address: "",
      city: "",
      province: "",
      email: "",
    },
    mode: "onSubmit",
  });

  const filteredClients = React.useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.passport_number.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [clients, clientSearch]);

  const linePlans = React.useMemo(
    () => PLANS.filter((p) => p.product_line === productLine),
    [productLine]
  );

  const baseMonthly = selectedPlan?.single_premium ?? 0;
  const membersMonthly = members.reduce((s, m) => s + m.addon_cost, 0);
  const totalMonthly = baseMonthly + membersMonthly;
  const totalAnnual =
    calculateAnnualPremium(baseMonthly) +
    members.reduce((s, m) => s + calculateAnnualPremium(m.addon_cost), 0);

  const totalDue = premiumType === "monthly" ? totalMonthly : totalAnnual;

  const inceptionDate = React.useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );
  const coverStartDate = React.useMemo(
    () => calculateCoverStartDate(inceptionDate),
    [inceptionDate]
  );

  const clientForSummary = selectedClient;

  const goStep2 = async () => {
    if (clientTab === "existing") {
      if (!selectedClient) {
        toast.error("Select a client to continue");
        return;
      }
      setStep(2);
      return;
    }
    const ok = await form.trigger();
    if (!ok) return;
    const v = form.getValues();
    const id = newTempId();
    const phoneDigits = v.phone.replace(/\D/g, "").replace(/^258/, "");
    const waDigits = v.whatsapp_number
      ? v.whatsapp_number.replace(/\D/g, "").replace(/^258/, "")
      : phoneDigits;
    const newClient: Client = {
      id: `client-${id}`,
      full_name: v.full_name,
      passport_number: v.passport_number,
      date_of_birth: v.date_of_birth,
      nationality: v.nationality,
      phone: `+258${phoneDigits}`,
      whatsapp_number: `+258${waDigits}`,
      address: v.address,
      city: v.city,
      province: v.province,
      email: v.email?.trim() || undefined,
      created_by: agentId ?? "agent-1",
      created_at: inceptionDate,
    };
    addClient(newClient);
    setSelectedClient(newClient);
    setStep(2);
  };

  const [memberDraft, setMemberDraft] = React.useState({
    full_name: "",
    relationship: "Spouse" as MemberRelationship,
    date_of_birth: "",
    coverKey: "220" as "70" | "220" | "250" | "299",
  });

  const coverByKey = COVER_LEVELS.find(
    (c) => String(c.addon) === memberDraft.coverKey
  )!;

  const addMemberRow = () => {
    if (members.length >= 4) return;
    if (!memberDraft.full_name.trim() || !memberDraft.date_of_birth) {
      toast.error("Enter member name and date of birth");
      return;
    }
    setMembers((prev) => [
      ...prev,
      {
        tempId: newTempId(),
        full_name: memberDraft.full_name.trim(),
        relationship: memberDraft.relationship,
        date_of_birth: memberDraft.date_of_birth,
        id_or_passport: "Pending",
        addon_cost: coverByKey.addon,
        cover_amount: coverByKey.cover,
        cover_percentage: Math.min(100, Math.round((coverByKey.cover / 50000) * 100)),
      },
    ]);
    setMemberDraft({
      full_name: "",
      relationship: "Spouse",
      date_of_birth: "",
      coverKey: "220",
    });
  };

  const removeMember = (tempId: string) => {
    setMembers((prev) => prev.filter((m) => m.tempId !== tempId));
  };

  const issuePolicy = () => {
    if (!selectedClient || !selectedPlan) {
      toast.error("Missing client or plan");
      return;
    }
    const policyId = `policy-${newTempId()}`;
    const policy: Policy = {
      id: policyId,
      policy_number: policyNumber,
      client_id: selectedClient.id,
      product_line: selectedPlan.product_line,
      tier: selectedPlan.tier,
      premium_type: premiumType,
      base_premium: baseMonthly,
      members_premium: membersMonthly,
      total_premium: totalDue,
      account_balance: 0,
      status: "active",
      inception_date: inceptionDate,
      cover_start_date: coverStartDate,
      agent_id: agentId ?? "agent-1",
      created_at: inceptionDate,
    };
    const savedMembers: PolicyMember[] = members.map((m) => ({
      id: `member-${newTempId()}`,
      policy_id: policyId,
      full_name: m.full_name,
      relationship: m.relationship,
      date_of_birth: m.date_of_birth,
      id_or_passport: m.id_or_passport,
      addon_cost: m.addon_cost,
      cover_amount: m.cover_amount,
      cover_percentage: m.cover_percentage,
      status: "active",
    }));
    addPolicy(policy, savedMembers);
    toast.success("Policy issued successfully");
    setSuccessOpen(true);
  };

  const progress = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <div className="mb-2 flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {(
            [
              ["Client", 1],
              ["Plan", 2],
              ["Members", 3],
              ["Payment", 4],
            ] as const
          ).map(([label, n]) => (
            <button
              key={label}
              type="button"
              onClick={() => n < step && setStep(n)}
              className={cn(
                "flex items-center gap-1 rounded-full border px-3 py-1 transition-colors",
                step === n &&
                  "border-[#1892ff] bg-[#1892ff]/15 font-medium text-[#1892ff]",
                step > n && "border-emerald-600/40 text-emerald-700",
                step < n && "border-border text-muted-foreground"
              )}
            >
              {step > n ? <Check className="size-3.5" /> : null}
              {n}. {label}
            </button>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <Tabs
            value={clientTab}
            onValueChange={(v) => {
              const t = v as "existing" | "new";
              setClientTab(t);
              if (t === "new") setSelectedClient(null);
            }}
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="existing">Existing Client</TabsTrigger>
              <TabsTrigger value="new">New Client</TabsTrigger>
            </TabsList>
            <TabsContent value="existing" className="mt-4 space-y-4">
              <Input
                placeholder="Search by name, passport, or city…"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedClient(c)}
                    className={cn(
                      "flex w-full flex-col rounded-md px-3 py-2 text-left text-sm hover:bg-muted",
                      selectedClient?.id === c.id && "bg-[#1892ff]/15 ring-1 ring-[#1892ff]"
                    )}
                  >
                    <span className="font-medium">{c.full_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.passport_number} · {c.city}
                    </span>
                  </button>
                ))}
              </div>
              {selectedClient && (
                <Card>
                  <CardContent className="space-y-1 p-4 text-sm">
                    <p>
                      <span className="text-muted-foreground">Name:</span>{" "}
                      {selectedClient.full_name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Passport:</span>{" "}
                      {selectedClient.passport_number}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Phone:</span>{" "}
                      {selectedClient.phone}
                    </p>
                    <p>
                      <span className="text-muted-foreground">City:</span>{" "}
                      {selectedClient.city}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="new" className="mt-4 space-y-4">
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <Field
                  label="Full Name"
                  error={form.formState.errors.full_name?.message}
                >
                  <Input {...form.register("full_name")} aria-invalid={!!form.formState.errors.full_name} />
                </Field>
                <Field
                  label="Passport / ID Number"
                  error={form.formState.errors.passport_number?.message}
                >
                  <Input {...form.register("passport_number")} />
                </Field>
                <Field
                  label="Date of Birth"
                  error={form.formState.errors.date_of_birth?.message}
                >
                  <Input type="date" {...form.register("date_of_birth")} />
                </Field>
                <Field
                  label="Nationality"
                  error={form.formState.errors.nationality?.message}
                >
                  <Input {...form.register("nationality")} />
                </Field>
                <Field label="Phone" error={form.formState.errors.phone?.message}>
                  <div className="flex rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                    <span className="flex items-center border-r border-input bg-muted/50 px-2.5 text-xs text-muted-foreground">
                      +258
                    </span>
                    <Input
                      className="border-0 focus-visible:ring-0"
                      placeholder="84 000 0000"
                      {...form.register("phone")}
                    />
                  </div>
                </Field>
                <Field
                  label="WhatsApp (optional)"
                  error={form.formState.errors.whatsapp_number?.message}
                >
                  <div className="flex rounded-lg border border-input">
                    <span className="flex items-center border-r border-input bg-muted/50 px-2.5 text-xs text-muted-foreground">
                      +258
                    </span>
                    <Input
                      className="border-0 focus-visible:ring-0"
                      {...form.register("whatsapp_number")}
                    />
                  </div>
                </Field>
                <Field
                  label="Street Address"
                  error={form.formState.errors.address?.message}
                  className="md:col-span-2"
                >
                  <Input {...form.register("address")} />
                </Field>
                <Field label="City / Town" error={form.formState.errors.city?.message}>
                  <Input {...form.register("city")} />
                </Field>
                <Field
                  label="Province"
                  error={form.formState.errors.province?.message}
                >
                  <Select
                    value={form.watch("province")}
                    onValueChange={(v) => form.setValue("province", v, { shouldValidate: true })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {SA_PROVINCES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field
                  label="Email (optional)"
                  error={form.formState.errors.email?.message}
                  className="md:col-span-2"
                >
                  <Input type="email" {...form.register("email")} />
                </Field>
              </form>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end">
            <Button type="button" onClick={() => void goStep2()}>
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={productLine === "Tumelo Nations Plan" ? "default" : "outline"}
                  className={cn(
                    productLine === "Tumelo Nations Plan" &&
                      "bg-[#1892ff] text-white hover:bg-[#1892ff]/90"
                  )}
                  onClick={() => {
                    setProductLine("Tumelo Nations Plan");
                    setSelectedPlan(null);
                  }}
                >
                  Tumelo Nations Plan
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    productLine === "Uhambolwethu Funeral Cover"
                      ? "default"
                      : "outline"
                  }
                  className={cn(
                    productLine === "Uhambolwethu Funeral Cover" &&
                      "bg-[#1892ff] text-white hover:bg-[#1892ff]/90"
                  )}
                  onClick={() => {
                    setProductLine("Uhambolwethu Funeral Cover");
                    setSelectedPlan(null);
                  }}
                >
                  Uhambolwethu Funeral Cover
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={premiumType === "monthly" ? "secondary" : "ghost"}
                  onClick={() => setPremiumType("monthly")}
                >
                  Monthly
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={premiumType === "annual" ? "secondary" : "ghost"}
                  onClick={() => setPremiumType("annual")}
                >
                  Annual
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {linePlans.map((plan) => {
                const selected = selectedPlan?.id === plan.id;
                const prem =
                  premiumType === "monthly"
                    ? plan.single_premium
                    : calculateAnnualPremium(plan.single_premium);
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={cn(
                      "relative flex w-full flex-col gap-2 rounded-xl border-2 p-4 text-left transition-colors md:flex-row md:items-center md:justify-between",
                      selected
                        ? "border-[#1892ff] bg-[#1892ff]/10"
                        : "border-border hover:border-[#1892ff]/40"
                    )}
                  >
                    {selected && (
                      <Check
                        className="absolute right-3 top-3 size-5 text-[#1892ff]"
                        aria-hidden
                      />
                    )}
                    <div>
                      <p
                        className="text-xl"
                        style={{
                          fontFamily: "var(--font-dm-serif), ui-serif, Georgia, serif",
                        }}
                      >
                        {plan.tier}
                      </p>
                      <p className="text-2xl font-semibold" style={{ color: BRAND_PRIMARY }}>
                        {formatCurrency(plan.cover_amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{formatCurrency(prem)}</p>
                      <p className="text-xs text-muted-foreground">
                        per {premiumType === "monthly" ? "month" : "year"}
                      </p>
                    </div>
                    <p className="w-full text-xs text-muted-foreground md:col-span-2 md:w-auto">
                      Waiting period: {plan.waiting_period_natural} months natural /{" "}
                      {plan.waiting_period_accidental} month accidental
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
          <SummaryCard
            title="Policy Summary"
            clientName={clientForSummary?.full_name}
            plan={selectedPlan}
            premiumType={premiumType}
            baseMonthly={baseMonthly}
            membersMonthly={membersMonthly}
            totalMonthly={totalMonthly}
            totalAnnual={totalAnnual}
          />
          <div className="flex justify-between lg:col-span-3">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              type="button"
              disabled={!selectedPlan}
              onClick={() => setStep(3)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {members.length < 4 ? (
              <div className="space-y-3 rounded-xl border border-border p-4">
                <h3 className="font-medium">Add a Member</h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <Input
                    placeholder="Full name"
                    value={memberDraft.full_name}
                    onChange={(e) =>
                      setMemberDraft((d) => ({ ...d, full_name: e.target.value }))
                    }
                  />
                  <Select
                    value={memberDraft.relationship}
                    onValueChange={(v) =>
                      setMemberDraft((d) => ({
                        ...d,
                        relationship: v as MemberRelationship,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        [
                          "Spouse",
                          "Child",
                          "Parent",
                          "Sibling",
                          "Extended Family",
                        ] as MemberRelationship[]
                      ).map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={memberDraft.date_of_birth}
                    onChange={(e) =>
                      setMemberDraft((d) => ({
                        ...d,
                        date_of_birth: e.target.value,
                      }))
                    }
                  />
                  <Select
                    value={memberDraft.coverKey}
                    onValueChange={(v) =>
                      setMemberDraft((d) => ({
                        ...d,
                        coverKey: v as typeof memberDraft.coverKey,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COVER_LEVELS.map((c) => (
                        <SelectItem key={c.addon} value={String(c.addon)}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="secondary" onClick={addMemberRow}>
                  Add Member
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Maximum 4 members reached
              </p>
            )}
            <div className="space-y-2">
              {members.map((m) => (
                <div
                  key={m.tempId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{m.full_name}</span>
                  <span className="text-muted-foreground">{m.relationship}</span>
                  <span>{formatCurrency(m.cover_amount)}</span>
                  <span>+{formatCurrency(m.addon_cost)}/mo</span>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => removeMember(m.tempId)}
                    aria-label="Remove member"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <SummaryCard
            title="Policy Summary"
            clientName={clientForSummary?.full_name}
            plan={selectedPlan}
            premiumType={premiumType}
            baseMonthly={baseMonthly}
            membersMonthly={membersMonthly}
            totalMonthly={totalMonthly}
            totalAnnual={totalAnnual}
            members={members}
          />
          <div className="flex justify-between lg:col-span-3">
            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(4)}>
                Skip
              </Button>
              <Button type="button" onClick={() => setStep(4)}>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && selectedClient && selectedPlan && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 p-6 text-sm">
              <p
                className="text-2xl font-semibold"
                style={{
                  fontFamily: "var(--font-dm-serif), serif",
                  color: BRAND_PRIMARY,
                }}
              >
                {policyNumber}
              </p>
              <p>
                <span className="text-muted-foreground">Client:</span>{" "}
                {selectedClient.full_name}, {selectedClient.passport_number}
              </p>
              <p>
                <span className="text-muted-foreground">Plan:</span>{" "}
                {selectedPlan.product_line} — {selectedPlan.tier}
              </p>
              <p>
                <span className="text-muted-foreground">Dependants:</span>{" "}
                {members.length}
              </p>
              <p>
                <span className="text-muted-foreground">Cover amount:</span>{" "}
                <strong>{formatCurrency(selectedPlan.cover_amount)}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">Inception:</span>{" "}
                {inceptionDate}
              </p>
              <p>
                <span className="text-muted-foreground">Cover start:</span>{" "}
                {coverStartDate}
              </p>
              <p className="text-xs text-muted-foreground">
                Waiting period: 6 months natural / 1 month accidental
              </p>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <MpesaSimulator
              amount={totalDue}
              phone={selectedClient.phone}
              onSuccess={(ref) => setMpesaReference(ref)}
            />
            {mpesaReference && (
              <Button
                type="button"
                className="w-full font-semibold text-white"
                style={{ backgroundColor: BRAND_PRIMARY }}
                onClick={issuePolicy}
              >
                Issue Policy & Generate Certificate
              </Button>
            )}
          </div>
          <div className="flex justify-start lg:col-span-2">
            <Button type="button" variant="ghost" onClick={() => setStep(3)}>
              Back
            </Button>
          </div>
        </div>
      )}

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <Check className="size-6" />
              Policy Issued Successfully!
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-lg" style={{ color: BRAND_PRIMARY }}>
            {policyNumber}
          </p>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setSuccessOpen(false);
                window.open(
                  `/certificate/${policyNumber}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            >
              Download Certificate
            </Button>
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                setSuccessOpen(false);
                router.push("/agent/policies");
              }}
            >
              Go to Policies
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  children,
  error,
  className,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SummaryCard({
  title,
  clientName,
  plan,
  premiumType,
  baseMonthly,
  membersMonthly,
  totalMonthly,
  totalAnnual,
  members,
}: {
  title: string;
  clientName?: string;
  plan: Plan | null;
  premiumType: "monthly" | "annual";
  baseMonthly: number;
  membersMonthly: number;
  totalMonthly: number;
  totalAnnual: number;
  members?: WizardMember[];
}) {
  return (
    <Card className="h-fit lg:sticky lg:top-6">
      <CardContent className="space-y-3 p-4 text-sm">
        <h3 className="font-semibold">{title}</h3>
        <p>
          <span className="text-muted-foreground">Client:</span>{" "}
          {clientName ?? "—"}
        </p>
        <p>
          <span className="text-muted-foreground">Plan:</span>{" "}
          {plan?.product_line ?? "—"}
        </p>
        <p>
          <span className="text-muted-foreground">Tier:</span> {plan?.tier ?? "—"}
        </p>
        <p>
          <span className="text-muted-foreground">Premium type:</span>{" "}
          {premiumType === "monthly" ? "Monthly" : "Annual"}
        </p>
        <p>
          <span className="text-muted-foreground">Base premium:</span>{" "}
          {formatCurrency(baseMonthly)}
        </p>
        {members && members.length > 0 ? (
          <>
            <ul className="space-y-1 text-xs">
              {members.map((m) => (
                <li key={m.tempId}>
                  + {m.full_name} ({m.relationship}): {formatCurrency(m.addon_cost)}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              Members subtotal: {formatCurrency(membersMonthly)}
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">Members: (none yet)</p>
        )}
        <hr className="border-border" />
        <p className="text-base font-semibold">
          Total:{" "}
          {formatCurrency(premiumType === "monthly" ? totalMonthly : totalAnnual)}{" "}
          / {premiumType === "monthly" ? "month" : "year"}
        </p>
      </CardContent>
    </Card>
  );
}
