"use client";

import * as React from "react";
import {
  AGENTS,
  CLAIMS,
  CLIENTS,
  MEMBERS,
  PAYMENTS,
  POLICIES,
} from "@/lib/demo-data";
import type {
  Agent,
  Claim,
  Client,
  Payment,
  Policy,
  PolicyMember,
} from "@/lib/types";

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export type DataContextValue = {
  agents: Agent[];
  clients: Client[];
  policies: Policy[];
  members: PolicyMember[];
  payments: Payment[];
  claims: Claim[];
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
};

const DataContext = React.createContext<DataContextValue | undefined>(
  undefined
);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = React.useState<Agent[]>(() => clone(AGENTS));
  const [clients, setClients] = React.useState<Client[]>(() => clone(CLIENTS));
  const [policies, setPolicies] = React.useState<Policy[]>(() =>
    clone(POLICIES)
  );
  const [members, setMembers] = React.useState<PolicyMember[]>(() =>
    clone(MEMBERS)
  );
  const [payments, setPayments] = React.useState<Payment[]>(() =>
    clone(PAYMENTS)
  );
  const [claims, setClaims] = React.useState<Claim[]>(() => clone(CLAIMS));

  const addClient = React.useCallback((client: Client) => {
    setClients((prev) => [...prev, client]);
  }, []);

  const addPolicy = React.useCallback(
    (policy: Policy, newMembers?: PolicyMember[]) => {
      setPolicies((prev) => [...prev, policy]);
      if (newMembers?.length) {
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

  const value = React.useMemo(
    () => ({
      agents,
      clients,
      policies,
      members,
      payments,
      claims,
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
    }),
    [
      agents,
      clients,
      policies,
      members,
      payments,
      claims,
      addClient,
      addPolicy,
      addPayment,
      addClaim,
      addAgent,
      addMembers,
      updatePolicy,
      updatePayment,
      updateClaim,
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
