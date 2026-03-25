"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SlidersHorizontal, ChevronDown, ChevronRight, Home } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import Pagination from "@/components/ui/Pagination";
import { productService } from "@/services";
import type { Product } from "@/types/product";
import { CATEGORIES, REGIONS } from "@/lib/constants";

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá: Thấp → Cao" },
  { value: "price-desc", label: "Giá: Cao → Thấp" },
  { value: "popular", label: "Phổ biến nhất" },
  { value: "rating", label: "Đánh giá cao" },
];

const SEASONS = [
  { value: "all", label: "Tất cả mùa" },
  { value: "in-season", label: "Trong mùa" },
  { value: "upcoming", label: "Sắp thu hoạch" },
  { value: "year-round", label: "Quanh năm" },
];

const ITEMS_PER_PAGE = 12;

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get("q") || "";

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(querySearch);

  // Sync URL query → local search
  useEffect(() => {
    setSearchTerm(querySearch);
  }, [querySearch]);

  useEffect(() => {
    async function load() {
      const [seasonal, newP] = await Promise.all([
        productService.getSeasonalProducts(),
        productService.getNewProducts(),
      ]);
      /* Deduplicate by id */
      const map = new Map<string, Product>();
      [...seasonal, ...newP].forEach((p) => map.set(p.id, p));
      setAllProducts(Array.from(map.values()));
    }
    load();
  }, []);

  /* Filter + Sort (memoized) */
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.shop?.name?.toLowerCase().includes(q)
      );
    }

    // Category
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Sort
    switch (selectedSort) {
      case "price-asc":
        result.sort((a, b) => a.price_per_unit - b.price_per_unit);
        break;
      case "price-desc":
        result.sort((a, b) => b.price_per_unit - a.price_per_unit);
        break;
      case "popular":
        result.sort((a, b) => b.sold_count - a.sold_count);
        break;
      case "rating":
        result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case "newest":
      default:
        // Keep original order (newest first from API)
        break;
    }

    return result;
  }, [allProducts, activeCategory, selectedSort, searchTerm]);

  /* Pagination */
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, selectedSort, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted mb-6">
        <Link href="/home" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">Danh mục</span>
        {searchTerm && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary font-medium">&quot;{searchTerm}&quot;</span>
          </>
        )}
      </nav>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide mb-4">
        {CATEGORIES.map((cat) => (
          <button type="button"
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={
              activeCategory === cat.id
                ? "whitespace-nowrap rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm"
                : "whitespace-nowrap rounded-full bg-white dark:bg-surface border border-border px-5 py-2 text-sm font-medium hover:border-primary transition-colors"
            }
          >
            <span className="mr-1">{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      {/* Filter Toggle Mobile */}
      <button type="button"
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden flex items-center gap-2 mb-4 text-sm font-medium text-foreground-muted border border-border rounded-lg px-4 py-2"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Bộ lọc
        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
      </button>

      {/* Filters Row — sticky on desktop */}
      <div className={`sticky top-[73px] z-30 bg-white dark:bg-background py-3 -mx-4 px-4 border-b border-border/50 mb-6 ${showFilters ? "block" : "hidden md:block"}`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Region */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="filter-region" className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
              Khu vực
            </label>
            <select
              id="filter-region"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="rounded-xl border border-border bg-white dark:bg-surface text-sm focus:border-primary focus:ring-primary py-2.5 px-3"
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
            <label htmlFor="filter-season" className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
              Mùa vụ
            </label>
            <select
              id="filter-season"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="rounded-xl border border-border bg-white dark:bg-surface text-sm focus:border-primary focus:ring-primary py-2.5 px-3"
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
            <label htmlFor="filter-sort" className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
              Sắp xếp
            </label>
            <select
              id="filter-sort"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="rounded-xl border border-border bg-white dark:bg-surface text-sm focus:border-primary focus:ring-primary py-2.5 px-3"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
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
      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg font-bold text-foreground mb-2">Không tìm thấy sản phẩm</p>
          <p className="text-sm text-foreground-muted">
            {searchTerm ? `Không có kết quả cho "${searchTerm}"` : "Thử thay đổi bộ lọc"}
          </p>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-10 flex flex-col items-center gap-3">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        <p className="text-xs text-foreground-muted">
          Trang {currentPage}/{totalPages || 1} — {filteredProducts.length} sản phẩm
        </p>
      </div>
    </div>
  );
}
