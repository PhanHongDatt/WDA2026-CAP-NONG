"use client";

import Link from "next/link";
import { LayoutGrid, Apple, Carrot, Wheat, Nut, Leaf, ShoppingBasket } from "lucide-react";

import { CATEGORIES } from "@/lib/constants";

const CategoryIcon = ({ id, className }: { id: string, className?: string }) => {
  switch (id) {
    case "ALL": return <LayoutGrid className={className} />;
    case "FRUIT": return <Apple className={className} />;
    case "VEGETABLE": return <Carrot className={className} />;
    case "GRAIN": return <Wheat className={className} />;
    case "TUBER": return <Nut className={className} />;
    case "HERB": return <Leaf className={className} />;
    case "OTHER": return <ShoppingBasket className={className} />;
    default: return <LayoutGrid className={className} />;
  }
};

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
                <span className="group-hover:scale-110 transition-transform text-primary/80 group-hover:text-primary">
                  <CategoryIcon id={cat.id} className="w-8 h-8" />
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
