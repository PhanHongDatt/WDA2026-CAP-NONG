"use client";

import Link from "next/link";

import { CATEGORIES } from "@/lib/constants";

export default function CategoryGrid() {
  return (
    <section className="mb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-700 mb-4 uppercase tracking-wide">
            Danh mục
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CATEGORIES.filter(c => c.id !== "ALL").map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog?category=${cat.id}`}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-50 hover:border-primary/30 hover:bg-green-50/50 transition-all group cursor-pointer"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <span className="text-xs text-gray-600 font-medium text-center leading-tight group-hover:text-primary transition-colors">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
