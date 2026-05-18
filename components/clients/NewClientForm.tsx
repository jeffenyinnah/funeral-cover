"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Client, DocumentType } from "@/lib/types";
import { newClientFormSchema, type NewClientFormValues } from "@/lib/schemas/new-client";

const DOCUMENT_TYPES: DocumentType[] = ["Passport", "ID", "Proof of Residence"];
import { SA_PROVINCES } from "@/lib/provinces";
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
import { cn } from "@/lib/utils";

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

export function NewClientForm({
  agentId,
  onCreated,
  onCancel,
}: {
  agentId: string;
  onCreated: (client: Client) => void;
  onCancel?: () => void;
}) {
  const form = useForm<NewClientFormValues>({
    resolver: zodResolver(newClientFormSchema),
    defaultValues: {
      full_name: "",
      document_type: "Passport" as DocumentType,
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

  const submit = form.handleSubmit((v) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
    const phoneDigits = v.phone.replace(/\D/g, "").replace(/^258/, "");
    const waDigits = v.whatsapp_number
      ? v.whatsapp_number.replace(/\D/g, "").replace(/^258/, "")
      : phoneDigits;
    const today = new Date().toISOString().slice(0, 10);
    const client: Client = {
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
      document_type: v.document_type as DocumentType,
      created_by: agentId,
      created_at: today,
    };
    onCreated(client);
  });

  return (
    <form className="grid max-h-[70vh] gap-3 overflow-y-auto md:grid-cols-2" onSubmit={submit}>
      <Field label="Full Name" error={form.formState.errors.full_name?.message}>
        <Input {...form.register("full_name")} />
      </Field>
      <Field
        label="Document Type"
        error={form.formState.errors.document_type?.message}
      >
        <Select
          value={form.watch("document_type") ?? "Passport"}
          onValueChange={(v) =>
            form.setValue("document_type", v as DocumentType, { shouldValidate: true })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPES.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field
        label="Document Number"
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
      <Field label="Nationality" error={form.formState.errors.nationality?.message}>
        <Input {...form.register("nationality")} />
      </Field>
      <Field label="Phone" error={form.formState.errors.phone?.message}>
        <div className="flex rounded-lg border border-input">
          <span className="flex items-center border-r border-input bg-muted/50 px-2.5 text-xs text-muted-foreground">
            +258
          </span>
          <Input
            className="border-0 focus-visible:ring-0"
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
      <Field label="Province" error={form.formState.errors.province?.message}>
        <Select
          value={form.watch("province")}
          onValueChange={(val) =>
            form.setValue("province", val, { shouldValidate: true })
          }
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
      <div className="flex flex-wrap justify-end gap-2 md:col-span-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">Save client</Button>
      </div>
    </form>
  );
}
