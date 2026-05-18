import { z } from "zod";

export const newClientFormSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  document_type: z.enum(["Passport", "ID", "Proof of Residence"]),
  passport_number: z.string().min(1, "Document number is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  phone: z.string().min(1, "Phone number is required"),
  whatsapp_number: z.string().optional(),
  address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City or town is required"),
  province: z.string().min(1, "Province is required"),
  email: z.string().refine(
    (v) => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    "Enter a valid email address"
  ),
});

export type NewClientFormValues = z.infer<typeof newClientFormSchema>;
