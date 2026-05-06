"use client";

import { useState, useEffect } from "react";
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

/**
 * Map slug từ URL (?category=rau-cu) → BE enum (VEGETABLE)
 * Cũng xử lý trường hợp URL đã đúng BE enum (VEGETABLE)
 */
function mapCategoryParam(param: string | null): string {
  if (!param) return "ALL";
  const upper = param.toUpperCase().replace(/-/g, "_");
  const validBE = ["FRUIT", "VEGETABLE", "GRAIN", "TUBER", "HERB", "OTHER"];
  if (validBE.includes(upper)) return upper;
  // Slug mapping (cho URL thân thiện)
  const slugMap: Record<string, string> = {
    "trai-cay": "FRUIT",
    "rau-cu": "VEGETABLE",
    "gao-ngu-coc": "GRAIN",
    "khoai-cu": "TUBER",
    "gia-vi-thao-moc": "HERB",
    "dac-san-khac": "OTHER",
  };
  return slugMap[param.toLowerCase()] || "ALL";
}

/** Map UI sort → BE sort param */
function mapSortParam(sort: string): string {
  switch (sort) {
    case "price-asc": return "pricePerUnit,asc";
    case "price-desc": return "pricePerUnit,desc";
    case "popular": return "soldCount,desc";
    case "rating": return "averageRating,desc";
    default: return "createdAt,desc";
  }
}

/** Map UI season → BE status */
function mapSeasonParam(season: string): string | undefined {
  switch (season) {
    case "in-season": return "IN_SEASON";
    case "upcoming": return "UPCOMING";
    case "year-round": return "OFF_SEASON";
    default: return undefined;
  }
}

const ITEMS_PER_PAGE = 20;

export default function CatalogPage() {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get("q") || "";
  const queryCategory = searchParams.get("category") || "";

  const [activeCategory, setActiveCategory] = useState(() => mapCategoryParam(queryCategory));
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(querySearch);
  const [isLoading, setIsLoading] = useState(true);

  // Sync URL query → local search
  useEffect(() => {
    setSearchTerm(querySearch);
  }, [querySearch]);

  // Sync URL category → activeCategory (khi user navigate từ trang khác)
  useEffect(() => {
    setActiveCategory(mapCategoryParam(queryCategory));
  }, [queryCategory]);

  // Gọi API thực sự mỗi khi filter/page thay đổi
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const result = await productService.search({
          keyword: searchTerm.trim() || undefined,
          category: activeCategory !== "ALL" ? activeCategory : undefined,
          status: mapSeasonParam(selectedSeason),
          sort: mapSortParam(selectedSort),
          page: currentPage - 1, // BE dùng 0-index
          size: ITEMS_PER_PAGE,
        });
        setProducts(result.content);
        setTotalElements(result.total_elements);
        setTotalPages(result.total_pages);
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
        setProducts([]);
        setTotalElements(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [activeCategory, selectedSort, selectedSeason, searchTerm, currentPage]);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, selectedSort, selectedSeason, searchTerm]);

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

      {/* Category Pills — dùng BE enum values (FRUIT, VEGETABLE...) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide mb-4">
        {CATEGORIES.map((cat) => (
          <button
            type="button"
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
      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden flex items-center gap-2 mb-4 text-sm font-medium text-foreground-muted border border-border rounded-lg px-4 py-2"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Bộ lọc
        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
      </button>

      {/* Filters Row */}
      <div
        className={`bg-white dark:bg-background py-3 -mx-4 px-4 border-b border-border/50 mb-6 ${
          showFilters ? "block" : "hidden md:block"
        }`}
      >
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
          {isLoading ? (
            <span className="animate-pulse">Đang tải sản phẩm...</span>
          ) : (
            <>
              Tìm thấy <span className="font-bold text-foreground">{totalElements}</span> sản phẩm nông sản sạch
            </>
          )}
        </p>
        <div className="h-px flex-1 bg-border ml-4 hidden sm:block" />
      </div>

      {/* Product Grid */}
      {isLoading ? (
        /* Skeleton loading */
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-surface animate-pulse h-64" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 product-grid-section">
          {products.map((product) => (
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
          Trang {currentPage}/{totalPages || 1} — {totalElements} sản phẩm
        </p>
      </div>
    </div>
  );
}
