"use client";

import Link from "next/link";

import { CATEGORIES } from "@/lib/constants";
import { LeafIcon } from "@/components/ui/icons/LeafIcon";

/**
 * Category card data — mỗi item có màu nền riêng, ảnh transparent, và màu saber border
 */
const CATEGORY_STYLES: Record<string, { bg: string; saber: string; img: string }> = {
  FRUIT:     { bg: "#FFF3E0", saber: "#FF9800", img: "/images/categories/fruit.png" },
  VEGETABLE: { bg: "#E8F5E9", saber: "#4CAF50", img: "/images/categories/vegetable.png" },
  GRAIN:     { bg: "#FFF8E1", saber: "#FFC107", img: "/images/categories/grain.png" },
  TUBER:     { bg: "#EFEBE9", saber: "#8D6E63", img: "/images/categories/tuber.png" },
  HERB:      { bg: "#E0F2F1", saber: "#26A69A", img: "/images/categories/herb.png" },
  OTHER:     { bg: "#F3E5F5", saber: "#AB47BC", img: "/images/categories/other.png" },
};



export default function CategoryGrid() {
  const items = CATEGORIES.filter((c) => c.id !== "ALL");

  return (
    <section className="category-section" id="category">
      <h2 className="category-section-title journey-title">
        <span className="journey-title-text">
          Danh mục{" "}
          <span className="journey-title-highlight">
            nông sản
            {/* Paint-stroke underline */}
            <svg
              className="journey-paint-stroke"
              viewBox="0 0 120 12"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2 8 C20 3, 40 10, 60 6 S100 3, 118 7"
                stroke="var(--color-primary, #2E7D32)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                opacity="0.35"
              />
            </svg>
          </span>
        </span>
        <LeafIcon />
      </h2>

      <div className="category-grid">
        {items.map((cat) => {
          const style = CATEGORY_STYLES[cat.id] ?? CATEGORY_STYLES.OTHER;

          return (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.id}`}
              className="saber-card"
              style={
                {
                  "--saber-color": style.saber,
                  "--card-bg": style.bg,
                } as React.CSSProperties
              }
            >
              {/* Saber border wrapper — overflow:hidden clips the rotating disc */}
              <div className="saber-card-border" aria-hidden="true" />

              <div className="saber-card-inner">
                {/* Image — overflows upward beyond card boundary */}
                <div className="saber-card-img-wrap">
                  <img
                    src={style.img}
                    alt={cat.label}
                    className="saber-card-img"
                    loading="lazy"
                  />
                </div>

                {/* Title */}
                <span className="saber-card-title">{cat.label.toUpperCase()}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
