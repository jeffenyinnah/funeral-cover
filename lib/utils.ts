import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  const abs = Math.abs(rounded);
  const formatted = abs.toLocaleString("en-ZA", {
    maximumFractionDigits: 0,
    useGrouping: true,
  });
  return `R ${formatted}`;
}

export function calculateCoverStartDate(inceptionDate: string): string {
  const d = new Date(inceptionDate + "T12:00:00");
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().slice(0, 10);
}

/**
 * Thresholds use monthly premium: 1 month overdue → warning, 2 → danger, 3+ → lapsed.
 * Pass the policy's monthly-equivalent premium (total_premium for monthly policies).
 */
export function getBalanceStatus(
  balance: number,
  monthlyPremium: number
): "good" | "warning" | "danger" | "lapsed" {
  const p = Math.max(monthlyPremium, 1);
  if (balance >= 0) return "good";
  const owed = Math.abs(balance);
  if (owed <= p) return "warning";
  if (owed <= 2 * p) return "danger";
  return "lapsed";
}

function randomDigits(count: number): string {
  let s = "";
  for (let i = 0; i < count; i++) {
    s += Math.floor(Math.random() * 10).toString();
  }
  return s;
}

const MPESA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomMpesaChar(): string {
  return MPESA_CHARS[Math.floor(Math.random() * MPESA_CHARS.length)]!;
}

export function generatePolicyNumber(): string {
  return `COV-2026-${randomDigits(4)}`;
}

export function generateMpesaReference(): string {
  let s = "QK";
  for (let i = 0; i < 8; i++) s += randomMpesaChar();
  return s;
}

export function calculateAnnualPremium(monthlyPremium: number): number {
  return monthlyPremium * 11;
}
