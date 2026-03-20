"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Mic, Sparkles, Calendar, MapPin } from "lucide-react";
import VoiceRecorder from "@/components/ui/VoiceRecorder";
import AIRefiner from "@/components/ui/AIRefiner";

export default function NewProductPage() {
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Quay lại Dashboard"
        >
          <ArrowLeft className="w-5 h-5 text-foreground-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground">
            Đăng sản phẩm mới
          </h1>
          <p className="text-sm text-foreground-muted">
            Điền thông tin sản phẩm hoặc dùng giọng nói AI
          </p>
        </div>
      </div>

      {/* AI Voice Input */}
      <div className="mb-8">
        <VoiceRecorder />
      </div>

      {/* Form */}
      <form className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-lg">Thông tin cơ bản</h3>
          <div>
            <label htmlFor="new-product-name" className="block text-sm font-medium mb-2">
              Tên sản phẩm *
            </label>
            <input
              id="new-product-name"
              type="text"
              placeholder="Ví dụ: Xoài Cát Hòa Lộc Tiền Giang"
              className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Mô tả sản phẩm *
            </label>
            <AIRefiner
              value={description}
              onAccept={(text) => setDescription(text)}
              placeholder="Mô tả chi tiết về sản phẩm, nguồn gốc, đặc điểm nổi bật..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="new-product-price" className="block text-sm font-medium mb-2">Giá *</label>
              <div className="relative">
                <input
                  id="new-product-price"
                  type="number"
                  placeholder="95000"
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-foreground-muted">
                  đ
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="new-product-unit" className="block text-sm font-medium mb-2">
                Đơn vị tính *
              </label>
              <select id="new-product-unit" className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                <option>Kg</option>
                <option>Trái</option>
                <option>Khay</option>
                <option>Bó</option>
                <option>Hộp</option>
              </select>
            </div>
            <div>
              <label htmlFor="new-product-qty" className="block text-sm font-medium mb-2">
                Sản lượng *
              </label>
              <input
                id="new-product-qty"
                type="number"
                placeholder="500"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="new-product-category" className="block text-sm font-medium mb-2">Danh mục</label>
            <select id="new-product-category" className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option>Trái cây</option>
              <option>Rau củ</option>
              <option>Ngũ cốc & Hạt</option>
              <option>Thủy hải sản</option>
              <option>Gia vị & Thảo mộc</option>
              <option>Thịt & Trứng</option>
            </select>
          </div>
        </div>

        {/* Image Upload Area */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-lg">Hình ảnh sản phẩm</h3>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="w-10 h-10 text-foreground-muted mx-auto mb-3" />
            <p className="font-medium text-sm">
              Kéo thả hoặc nhấn để tải ảnh lên
            </p>
            <p className="text-xs text-foreground-muted mt-1">
              PNG, JPG, WEBP • Tối đa 5MB • Tối đa 6 ảnh
            </p>
          </div>
        </div>

        {/* Traceability */}
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Thông tin truy xuất
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-product-location" className="block text-sm font-medium mb-2">
                Địa điểm canh tác
              </label>
              <input
                id="new-product-location"
                type="text"
                placeholder="Ví dụ: Tiền Giang"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>
            <div>
              <label htmlFor="new-product-harvest" className="block text-sm font-medium mb-2">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Ngày thu hoạch (dự kiến)
              </label>
              <input
                id="new-product-harvest"
                type="date"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="new-product-farming" className="block text-sm font-medium mb-2">
              Phương thức canh tác
            </label>
            <select id="new-product-farming" className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option>Hữu cơ</option>
              <option>VietGAP</option>
              <option>GlobalGAP</option>
              <option>Canh tác truyền thống</option>
              <option>Thủy canh</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4 pb-8">
          <button
            type="button"
            className="flex-1 border border-border text-foreground-muted font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Lưu nháp
          </button>
          <button
            type="submit"
            className="flex-[2] bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20"
          >
            Đăng sản phẩm
          </button>
        </div>
      </form>
    </div>
  );
}
