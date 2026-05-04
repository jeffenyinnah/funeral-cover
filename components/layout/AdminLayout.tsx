"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "./Sidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (role !== "admin") {
      router.replace("/");
    }
  }, [role, router]);

  if (role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <p className="text-sm text-muted-foreground">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="admin" currentPath={pathname ?? ""} />
      <main className="min-w-0 flex-1 overflow-x-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
