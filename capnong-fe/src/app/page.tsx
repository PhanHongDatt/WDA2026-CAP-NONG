"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Root page — role-based + mode-based redirect
 * - Guest → /home
 * - Buyer → /home
 * - Admin → /admin
 * - Farmer SELL Mode → /dashboard
 * - Farmer BUY Mode → /home
 */
export default function RootPage() {
  const { isLoggedIn, isFarmer, isHtxManager, isHtxMember, isAdmin, isSellMode } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/home");
    } else if (isAdmin) {
      router.replace("/admin");
    } else if ((isFarmer || isHtxManager || isHtxMember) && isSellMode) {
      router.replace("/dashboard");
    } else {
      router.replace("/home");
    }
  }, [isLoggedIn, isFarmer, isHtxManager, isHtxMember, isAdmin, isSellMode, router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}
