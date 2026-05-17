"use client";

import * as React from "react";
import {
  AGENTS,
  CLAIMS,
  CLIENTS,
  MEMBERS,
  PAYMENTS,
  PLANS,
  POLICIES,
} from "@/lib/demo-data";
import type {
  Agent,
  Claim,
  Client,
  Payment,
  Plan,
  Policy,
  PolicyMember,
} from "@/lib/types";

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

const SK = {
  clients: "funeral_clients_v1",
  policies: "funeral_policies_v1",
  members: "funeral_members_v1",
  plans: "funeral_plans_v1",
} as const;

function loadStored<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function appendStored<T extends { id: string }>(key: string, items: T[]): void {
  if (typeof window === "undefined") return;
  try {
    const existing = loadStored<T>(key);
    const existingIds = new Set(existing.map((e) => e.id));
    const next = [...existing, ...items.filter((i) => !existingIds.has(i.id))];
    localStorage.setItem(key, JSON.stringify(next));
  } catch {}
}

export type DataContextValue = {
  agents: Agent[];
  clients: Client[];
  policies: Policy[];
  members: PolicyMember[];
  payments: Payment[];
  claims: Claim[];
  plans: Plan[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  addClient: (client: Client) => void;
  addPolicy: (policy: Policy, newMembers?: PolicyMember[]) => void;
  addPayment: (payment: Payment) => void;
  addClaim: (claim: Claim) => void;
  addAgent: (agent: Agent) => void;
  addMembers: (members: PolicyMember[]) => void;
  updatePolicy: (id: string, patch: Partial<Policy>) => void;
  updatePayment: (id: string, patch: Partial<Payment>) => void;
  updateClaim: (id: string, patch: Partial<Claim>) => void;
  updatePlan: (id: string, patch: Partial<Plan>) => void;
};

const DataContext = React.createContext<DataContextValue | undefined>(
  undefined
);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = React.useState<Agent[]>(() => clone(AGENTS));

  const [clients, setClients] = React.useState<Client[]>(() => clone(CLIENTS));
  const [policies, setPolicies] = React.useState<Policy[]>(() => clone(POLICIES));
  const [members, setMembers] = React.useState<PolicyMember[]>(() => clone(MEMBERS));

  const [payments, setPayments] = React.useState<Payment[]>(() =>
    clone(PAYMENTS)
  );
  const [claims, setClaims] = React.useState<Claim[]>(() => clone(CLAIMS));
  const [plans, setPlans] = React.useState<Plan[]>(() => clone(PLANS));

  // Merge user-created records from localStorage after client mount.
  // Cannot run in the useState initializer because Next.js SSR runs that
  // on the server where window/localStorage are unavailable, and React
  // does not re-run the initializer during hydration.
  React.useEffect(() => {
    const demoClientIds = new Set(CLIENTS.map((c) => c.id));
    const sc = loadStored<Client>(SK.clients).filter((c) => !demoClientIds.has(c.id));
    if (sc.length) {
      setClients((prev) => {
        const ids = new Set(prev.map((c) => c.id));
        return [...prev, ...sc.filter((c) => !ids.has(c.id))];
      });
    }

    const demoPolicyIds = new Set(POLICIES.map((p) => p.id));
    const sp = loadStored<Policy>(SK.policies).filter((p) => !demoPolicyIds.has(p.id));
    if (sp.length) {
      setPolicies((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...sp.filter((p) => !ids.has(p.id))];
      });
    }

    const demoMemberIds = new Set(MEMBERS.map((m) => m.id));
    const sm = loadStored<PolicyMember>(SK.members).filter((m) => !demoMemberIds.has(m.id));
    if (sm.length) {
      setMembers((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        return [...prev, ...sm.filter((m) => !ids.has(m.id))];
      });
    }

    // Plans: if edited plans exist in storage, replace defaults entirely
    const storedPlans = loadStored<Plan>(SK.plans);
    if (storedPlans.length) {
      setPlans(storedPlans);
    }
  }, []);

  const addClient = React.useCallback((client: Client) => {
    appendStored(SK.clients, [client]);
    setClients((prev) => [...prev, client]);
  }, []);

  const addPolicy = React.useCallback(
    (policy: Policy, newMembers?: PolicyMember[]) => {
      appendStored(SK.policies, [policy]);
      setPolicies((prev) => [...prev, policy]);
      if (newMembers?.length) {
        appendStored(SK.members, newMembers);
        setMembers((prev) => [...prev, ...newMembers]);
      }
    },
    []
  );

  const addPayment = React.useCallback((payment: Payment) => {
    setPayments((prev) => [...prev, payment]);
  }, []);

  const addClaim = React.useCallback((claim: Claim) => {
    setClaims((prev) => [...prev, claim]);
  }, []);

  const addAgent = React.useCallback((agent: Agent) => {
    setAgents((prev) => [...prev, agent]);
  }, []);

  const addMembers = React.useCallback((newMembers: PolicyMember[]) => {
    setMembers((prev) => [...prev, ...newMembers]);
  }, []);

  const updatePolicy = React.useCallback((id: string, patch: Partial<Policy>) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  }, []);

  const updatePayment = React.useCallback(
    (id: string, patch: Partial<Payment>) => {
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
    },
    []
  );

  const updateClaim = React.useCallback((id: string, patch: Partial<Claim>) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  }, []);

  const updatePlan = React.useCallback((id: string, patch: Partial<Plan>) => {
    setPlans((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(SK.plans, JSON.stringify(next));
        }
      } catch {}
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({
      agents,
      clients,
      policies,
      members,
      payments,
      claims,
      plans,
      setAgents,
      addClient,
      addPolicy,
      addPayment,
      addClaim,
      addAgent,
      addMembers,
      updatePolicy,
      updatePayment,
      updateClaim,
      updatePlan,
    }),
    [
      agents,
      clients,
      policies,
      members,
      payments,
      claims,
      plans,
      addClient,
      addPolicy,
      addPayment,
      addClaim,
      addAgent,
      addMembers,
      updatePolicy,
      updatePayment,
      updateClaim,
      updatePlan,
    ]
  );

  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  );
}

export function useData() {
  const ctx = React.useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
