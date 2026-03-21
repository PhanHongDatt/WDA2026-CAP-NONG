"use client";

import Link from "next/link";

const CATEGORIES = [
  { emoji: "🍊", name: "Trái cây", slug: "trai-cay" },
  { emoji: "🥬", name: "Rau củ", slug: "rau-cu" },
  { emoji: "🐟", name: "Thủy sản", slug: "thuy-san" },
  { emoji: "🥩", name: "Thịt tươi", slug: "thit-tuoi" },
  { emoji: "🧄", name: "Gia vị", slug: "gia-vi" },
  { emoji: "🏔️", name: "Đặc sản vùng miền", slug: "dac-san" },
  { emoji: "🌾", name: "Gạo & Ngũ cốc", slug: "gao-ngu-coc" },
  { emoji: "🍄", name: "Nấm", slug: "nam" },
  { emoji: "🍯", name: "Mật ong", slug: "mat-ong" },
  { emoji: "🌱", name: "Rau mầm", slug: "rau-mam" },
];

export default function CategoryGrid() {
  return (
    <section className="mb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-700 mb-4 uppercase tracking-wide">
            Danh mục
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/catalog?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-50 hover:border-primary/30 hover:bg-green-50/50 transition-all group cursor-pointer"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {cat.emoji}
                </span>
                <span className="text-xs text-gray-600 font-medium text-center leading-tight group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
