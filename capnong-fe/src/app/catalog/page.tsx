"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { MOCK_SEASONAL_PRODUCTS, MOCK_NEW_PRODUCTS } from "@/lib/mock-data";
import { CATEGORIES, REGIONS } from "@/lib/constants";

const ALL_PRODUCTS = [...MOCK_SEASONAL_PRODUCTS, ...MOCK_NEW_PRODUCTS];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá: Thấp đến Cao" },
  { value: "price-desc", label: "Giá: Cao đến Thấp" },
  { value: "popular", label: "Phổ biến nhất" },
];

const SEASONS = [
  { value: "all", label: "Tất cả mùa" },
  { value: "in-season", label: "Trong mùa" },
  { value: "upcoming", label: "Sắp thu hoạch" },
  { value: "year-round", label: "Quanh năm" },
];

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts =
    activeCategory === "all"
      ? ALL_PRODUCTS
      : ALL_PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-6">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={
              activeCategory === cat.id
                ? "whitespace-nowrap rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm"
                : "whitespace-nowrap rounded-full bg-white border border-border px-5 py-2 text-sm font-medium hover:border-primary transition-colors"
            }
          >
            <span className="mr-1">{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Filter Toggle Mobile */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden flex items-center gap-2 mb-4 text-sm font-medium text-foreground-muted border border-border rounded-lg px-4 py-2"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Bộ lọc
        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
      </button>

      {/* Filters Row */}
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 ${showFilters ? "block" : "hidden md:grid"}`}>
        {/* Region */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
            Khu vực
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="rounded-xl border-border bg-white text-sm focus:border-primary focus:ring-primary py-2.5 px-3"
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Season */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
            Mùa vụ
          </label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="rounded-xl border-border bg-white text-sm focus:border-primary focus:ring-primary py-2.5 px-3"
          >
            {SEASONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
            Sắp xếp
          </label>
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="rounded-xl border-border bg-white text-sm focus:border-primary focus:ring-primary py-2.5 px-3"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-foreground-muted">
          Tìm thấy{" "}
          <span className="font-bold text-foreground">
            {filteredProducts.length}
          </span>{" "}
          sản phẩm nông sản sạch
        </p>
        <div className="h-px flex-1 bg-border ml-4 hidden sm:block" />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} variant="latest" />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-12 flex flex-col items-center gap-4">
        <button className="group flex items-center gap-2 rounded-xl bg-white border-2 border-primary/20 px-8 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-md shadow-primary/5">
          Xem thêm sản phẩm
          <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
        </button>
        <p className="text-xs text-foreground-muted">
          Hiển thị {filteredProducts.length} trên {ALL_PRODUCTS.length} sản phẩm
        </p>
      </div>
    </div>
  );
}
