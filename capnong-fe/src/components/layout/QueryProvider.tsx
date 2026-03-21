"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/**
 * QueryProvider — React Query with ISR-aware caching (Paper #2)
 *
 * staleTime: 60s — matches ISR revalidate interval
 * gcTime: 5m — keep unused data in memory for 5 min
 * retry: 1 — retry failed requests once
 * refetchOnWindowFocus: false — avoid unnecessary refetches on tab switch
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,       // 60s — data "fresh" for 1 min
            gcTime: 5 * 60 * 1000,      // 5m — garbage collect after 5 min
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
