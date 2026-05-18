export type DocumentType = "Passport" | "ID" | "Proof of Residence";

export type ProductLine =
  | "Tumelo Nations Plan"
  | "Uhambolwethu Funeral Cover";

export type TumeloTier =
  | "Zinc"
  | "Zinc Plus"
  | "Copper"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum";

export type UhambolwethuTier =
  | "Copper"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum";

export type PlanTier = TumeloTier | UhambolwethuTier;

export interface Plan {
  id: string;
  product_line: ProductLine;
  tier: PlanTier;
  single_premium: number;
  family_premium: number;
  cover_amount: number;
  waiting_period_natural: number;
  waiting_period_accidental: number;
}

export interface Client {
  id: string;
  full_name: string;
  passport_number: string;
  date_of_birth: string;
  nationality: string;
  phone: string;
  whatsapp_number: string;
  address: string;
  city: string;
  province: string;
  email?: string;
  document_type?: DocumentType;
  created_by: string;
  created_at: string;
}

export type MemberRelationship =
  | "Spouse"
  | "Child"
  | "Parent"
  | "Sibling"
  | "Extended Family";

export type AddonCost = 70 | 220 | 250 | 299;
export type MemberCoverAmount = 2000 | 5000 | 10000 | 15000;

export interface PolicyMember {
  id: string;
  policy_id: string;
  full_name: string;
  relationship: MemberRelationship;
  date_of_birth: string;
  id_or_passport: string;
  document_type?: DocumentType;
  addon_cost: AddonCost;
  cover_amount: MemberCoverAmount;
  cover_percentage: number;
  status: "active" | "inactive";
}

export interface Policy {
  id: string;
  policy_number: string;
  client_id: string;
  product_line: string;
  tier: string;
  premium_type: "monthly" | "annual";
  base_premium: number;
  members_premium: number;
  total_premium: number;
  account_balance: number;
  status: "pending" | "active" | "lapsed" | "cancelled";
  inception_date: string;
  cover_start_date: string;
  agent_id: string;
  created_at: string;
  next_of_kin_name?: string;
  next_of_kin_relationship?: string;
  next_of_kin_phone?: string;
}

export interface Payment {
  id: string;
  policy_id: string;
  amount: number;
  payment_date: string;
  method: "M-Pesa" | "Manual";
  mpesa_reference?: string;
  status: "confirmed" | "pending" | "failed";
  month_covered: string;
  notes?: string;
}

export type CauseOfDeath = "Natural" | "Accidental" | "Suicide";

export interface Claim {
  id: string;
  policy_id: string;
  member_id?: string;
  deceased_name: string;
  relationship: string;
  cause_of_death: CauseOfDeath;
  date_of_death: string;
  status:
    | "submitted"
    | "under_review"
    | "approved"
    | "paid"
    | "rejected";
  claim_amount: number;
  submitted_at: string;
  reviewed_at?: string;
  paid_at?: string;
  rejection_reason?: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  created_at: string;
}
