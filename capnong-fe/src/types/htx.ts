// ─── HTX Types (khớp API Contract + Database design) ───

import type { UserSummary } from "./user";

export type HtxStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";

export interface HtxSummary {
  id: string;
  name: string;
  province: string;
  status: HtxStatus;
  total_members: number;
}

export interface Htx extends HtxSummary {
  official_code: string;
  ward: string;
  description?: string;
  document_url?: string;
  manager: UserSummary;
  htx_shop_slug?: string;
  created_at: string;
}

export interface HtxCreateRequest {
  name: string;
  official_code: string;    // 8-12 digits
  province: string;
  ward: string;
  description?: string;
  document_url?: string;
}

export interface HtxJoinRequest {
  htx_id: string;
  message?: string;
}

export interface HtxJoinRequestResponse {
  id: string;
  htx: HtxSummary;
  farmer: UserSummary;
  message?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note?: string;
  created_at: string;
}

export interface ProcessJoinRequest {
  action: "APPROVE" | "REJECT";
  note?: string;
}

export interface HtxShop {
  id: string;
  slug: string;         // htx-{official_code}
  name: string;
  htx: HtxSummary;
  province: string;
  ward: string;
  description?: string;
  avatar_url?: string;
  active_bundles_count: number;
  created_at: string;
}
