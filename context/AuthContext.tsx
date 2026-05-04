"use client";

import * as React from "react";

export type AuthRole = "admin" | "agent" | null;

type AuthState = {
  role: AuthRole;
  agentId: string | null;
};

type AuthContextValue = AuthState & {
  login: (role: "admin" | "agent", agentId?: string) => void;
  logout: () => void;
};

const STORAGE_ROLE = "britam_funeral_role";
const STORAGE_AGENT = "britam_funeral_agent_id";

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);

function readStored(): AuthState {
  if (typeof window === "undefined") return { role: null, agentId: null };
  const role = window.localStorage.getItem(STORAGE_ROLE) as AuthRole;
  const storedAgent = window.localStorage.getItem(STORAGE_AGENT);
  if (role !== "admin" && role !== "agent") {
    return { role: null, agentId: null };
  }
  return {
    role,
    agentId: role === "agent" ? storedAgent : null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    role: null,
    agentId: null,
  });

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- rehydrate session from localStorage after mount
    setState(readStored());
  }, []);

  const login = React.useCallback((role: "admin" | "agent", agentId?: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_ROLE, role);
      if (role === "agent" && agentId) {
        window.localStorage.setItem(STORAGE_AGENT, agentId);
      } else {
        window.localStorage.removeItem(STORAGE_AGENT);
      }
    }
    setState({
      role,
      agentId: role === "agent" ? (agentId ?? null) : null,
    });
  }, []);

  const logout = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_ROLE);
      window.localStorage.removeItem(STORAGE_AGENT);
    }
    setState({ role: null, agentId: null });
  }, []);

  const value = React.useMemo(
    () => ({
      ...state,
      login,
      logout,
    }),
    [state, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
