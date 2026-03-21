"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import type { Shop } from "@/types/shop";

interface FarmCardProps {
  shop: Shop;
}

/**
 * FarmCard — matching home.html template exactly (lines 316-330)
 */
export default function FarmCard({ shop }: FarmCardProps) {
  return (
    <Link
      href={`/shops/${shop.slug}`}
      className="bg-white border border-gray-100 p-6 rounded-xl flex items-center gap-4 hover:border-primary transition-colors cursor-pointer shadow-sm"
    >
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden shrink-0">
        <Image
          src={shop.avatar_url || ""}
          alt={shop.name}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div>
        <h3 className="font-bold text-gray-900">{shop.name}</h3>
        <p className="text-xs text-gray-500">
          {shop.province} •{" "}
          <span className="text-yellow-500">★ {shop.average_rating}</span>
        </p>
        <p className="text-xs font-medium text-primary mt-1">
          {shop.years_experience} năm kinh nghiệm
        </p>
      </div>

      {/* CTA */}
      <button type="button" className="ml-auto text-primary text-sm font-bold border border-primary px-3 py-1 rounded-md hover:bg-green-50 transition-colors shrink-0">
        Ghé thăm
      </button>
    </Link>
  );
}
