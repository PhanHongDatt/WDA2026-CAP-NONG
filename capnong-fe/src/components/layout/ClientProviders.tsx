"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import QueryProvider from "@/components/layout/QueryProvider";
import { ToastProvider } from "@/components/ui/Toast";
import ServiceWorkerRegistration from "@/components/layout/ServiceWorkerRegistration";
import NetworkStatus from "@/components/ui/NetworkStatus";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import type { ReactNode } from "react";

/**
 * ClientProviders — wraps all client-side providers
 * Cần tách ra vì layout.tsx là Server Component
 */
export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <ServiceWorkerRegistration />
            <NetworkStatus />
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
