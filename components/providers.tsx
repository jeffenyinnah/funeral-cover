"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <DataProvider>
          {children}
          <Toaster richColors position="top-center" />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
