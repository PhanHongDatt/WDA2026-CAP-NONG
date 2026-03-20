"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import type { ReactNode } from "react";

/**
 * ClientProviders — wraps all client-side providers
 * Cần tách ra vì layout.tsx là Server Component
 */
export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}
