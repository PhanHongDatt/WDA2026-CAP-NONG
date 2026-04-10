"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Star, ChevronRight } from "lucide-react";
import FarmCard from "@/components/ui/FarmCard";
import { shopService } from "@/services";
import type { Shop } from "@/types/shop";

export default function AllShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await shopService.getFeaturedShops();
        setShops(data);
      } catch {
        setShops([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = search
    ? shops.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.province.toLowerCase().includes(search.toLowerCase())
      )
    : shops;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-foreground mb-2">
          Tất cả nhà cung cấp
        </h1>
        <p className="text-foreground-muted">
          Khám phá các nhà vườn, hợp tác xã uy tín trên Cạp Nông
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm nhà cung cấp..."
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 dark:bg-surface rounded-2xl h-64" />
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((shop) => (
            <FarmCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-foreground-muted">Không tìm thấy nhà cung cấp nào</p>
          <Link href="/home" className="text-primary font-bold text-sm mt-2 inline-block hover:underline">
            Quay lại trang chủ
          </Link>
        </div>
      )}
    </div>
  );
}
