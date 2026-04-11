"use client";

import { useAuth } from "@/contexts/AuthContext";
import CoopPoolCard from "@/components/ui/CoopPoolCard";
import type { CoopPool } from "@/types/order";

/**
 * CoopPoolSection — Only visible to HTX members/managers
 * Guest and Buyer cannot see cooperative pool data
 */
export default function CoopPoolSection({ pool }: { pool: CoopPool }) {
  const { isLoggedIn, isHtxMember, isHtxManager } = useAuth();

  // Only show for HTX members and managers
  if (!isLoggedIn || (!isHtxMember && !isHtxManager)) {
    return null;
  }

  return <CoopPoolCard pool={pool} />;
}
