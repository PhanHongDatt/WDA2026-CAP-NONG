"use client";

import React, { useState, useEffect, useRef } from "react";
import { Product } from "@/types/product";
import { X, Sparkles, Image as ImageIcon, Trash2, GripVertical, Loader2 } from "lucide-react";
import { apiProductService, updateProduct, deleteProductImage, uploadProductImages, updateProductImageSort } from "@/services/api/product";
import { refineDescription } from "@/services/api/ai";
import { useToast } from "@/components/ui/Toast";

interface ProductEditModalProps {
  productId: string;
  onClose: () => void;
  onSaved: () => void;
  hideQuantity?: boolean;
}

export default function ProductEditModal({ productId, onClose, onSaved, hideQuantity = false }: ProductEditModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refining, setRefining] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("FRUIT");
  const [unitCode, setUnitCode] = useState("KG");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [farmingMethod, setFarmingMethod] = useState("TRADITIONAL");

  // Images state
  const [images, setImages] = useState<{ id: string; url: string; file?: File; preview?: string }[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  
  // Drag and drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const loadProduct = async () => {
    try {
      const p = await apiProductService.getById(productId);
      if (p) {
        setName(p.name);
        setCategory(p.category || "FRUIT");
        setUnitCode(p.unit?.code || "KG");
        setPrice(String(p.price_per_unit));
        setQty(String(p.available_quantity));
        setDescription(p.description || "");
        setLocation(p.location_detail || "");
        setFarmingMethod(p.farming_method || "TRADITIONAL");

        if (p.image_objects && p.image_objects.length > 0) {
          setImages(p.image_objects.map((img: {id: string, url: string}) => ({ id: img.id, url: img.url })));
        }
      }
    } catch (err) {
      showToast("error", "Không thể tải cấu hình sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleRefineAI = async () => {
    if (!description.trim()) {
      showToast("warning", "Vui lòng nhập một ít mô tả cơ bản trước khi dùng AI tối ưu.");
      return;
    }
    setRefining(true);
    try {
      const res = await refineDescription(description, name);
      setDescription(res.refinedText);
      showToast("success", "Đã tối ưu mô tả bằng AI!");
    } catch (err) {
      showToast("error", "Lỗi gửi yêu cầu AI. Vui lòng thử lại sau.");
    } finally {
      setRefining(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: `temp-${Math.random()}`,
        url: "",
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages([...images, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    const img = images[idx];
    if (img.id && !img.id.startsWith("temp-")) {
      setDeletedImageIds([...deletedImageIds, img.id]);
    }
    const newImages = [...images];
    newImages.splice(idx, 1);
    setImages(newImages);
  };

  /* HTML5 Drag & Drop Reordering */
  const onDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIdx];
    newImages.splice(draggedIdx, 1);
    newImages.splice(idx, 0, draggedItem);

    setDraggedIdx(idx);
    setImages(newImages);
  };

  const onDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleSave = async () => {
    if (!name || !price || !qty) {
      showToast("error", "Vui lòng nhập Tên, Giá và Khối lượng.");
      return;
    }
    setSaving(true);
    try {
      // 1. Update text fields
      await updateProduct(productId, {
        name,
        category,
        unitCode,
        pricePerUnit: Number(price),
        availableQuantity: Number(qty),
        description,
        locationDetail: location,
        farmingMethod,
      });

      // 2. Delete old images
      for (const imgId of deletedImageIds) {
        try {
          await deleteProductImage(productId, imgId);
        } catch (e) {
          console.error("Lỗi xóa ảnh", imgId, e);
        }
      }

      // 3. Upload new images
      const newFiles = images.filter(i => i.file).map(i => i.file as File);
      if (newFiles.length > 0) {
        await uploadProductImages(productId, newFiles);
      }

      // 4. Update sort order for remaining existing images
      const existingImageIds = images.filter(i => !i.file).map(i => i.id);
      if (existingImageIds.length > 0) {
        await updateProductImageSort(productId, existingImageIds);
      }

      showToast("success", "Cập nhật sản phẩm thành công!");
      onSaved();
    } catch (err) {
      showToast("error", "Có lỗi xảy ra khi lưu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl animate-in fade-in transition-all">
      <div className="bg-white dark:bg-surface w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-gray-200 dark:border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-border">
          <h2 className="text-xl font-black text-gray-900 dark:text-foreground">Sửa Sản Phẩm</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-surface-hover dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Column: text inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tên sản phẩm *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-background border border-gray-200 dark:border-border rounded-xl focus:ring-2 focus:ring-primary" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Giá / Đơn vị *</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-background border border-gray-200 dark:border-border rounded-xl focus:ring-2 focus:ring-primary" placeholder="Ví dụ: 50000" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Đơn vị *</label>
                    <select value={unitCode} onChange={(e) => setUnitCode(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-background border border-gray-200 dark:border-border rounded-xl focus:ring-2 focus:ring-primary text-gray-900 border-gray-300">
                      <option value="KG">Kg</option>
                      <option value="BOX">Thùng / Hộp</option>
                      <option value="BUNCH">Nải / Buồng</option>
                      <option value="BOTTLE">Chai</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {!hideQuantity && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Khối lượng sẵn có *</label>
                    <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-background border border-gray-200 dark:border-border rounded-xl focus:ring-2 focus:ring-primary" />
                  </div>
                  )}
                  <div className={hideQuantity ? "col-span-2" : ""}>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Danh mục</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-background border border-gray-200 dark:border-border rounded-xl text-gray-900 border-gray-300 focus:ring-2 focus:ring-primary">
                      <option value="FRUIT">Trái cây</option>
                      <option value="VEGETABLE">Rau củ</option>
                      <option value="GRAIN">Ngũ cốc</option>
                      <option value="TUBER">Củ</option>
                      <option value="HERB">Thảo mộc</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Khu vực / Tỉnh</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-background border border-gray-200 dark:border-border rounded-xl focus:ring-2 focus:ring-primary" placeholder="Ví dụ: Bến Tre" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phương thức *</label>
                    <select value={farmingMethod} onChange={(e) => setFarmingMethod(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-background border border-gray-200 dark:border-border rounded-xl text-gray-900 border-gray-300 focus:ring-2 focus:ring-primary">
                      <option value="TRADITIONAL">Truyền thống</option>
                      <option value="ORGANIC">Hữu cơ</option>
                      <option value="VIETGAP">VietGAP</option>
                      <option value="GLOBALGAP">GlobalGAP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Mô tả sản phẩm</label>
                    <button 
                      type="button" 
                      onClick={handleRefineAI}
                      disabled={refining}
                      className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1.5 rounded-full hover:shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {refining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      Tối ưu bằng AI
                    </button>
                  </div>
                  <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-background border border-gray-200 dark:border-border rounded-xl focus:ring-2 focus:ring-primary resize-none text-sm leading-relaxed" placeholder="Chia sẻ thêm về sản phẩm của bạn..." />
                </div>
              </div>

              {/* Right Column: Images */}
              <div className="space-y-4">
                <div className="flex flex-col h-full bg-gray-50/50 dark:bg-surface-hover border border-gray-200 dark:border-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-foreground">Hình ảnh ({images.length}/10)</h3>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-white dark:bg-background text-gray-800 border border-gray-200 dark:border-border text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                      <ImageIcon className="w-4 h-4 text-primary" /> Thêm ảnh
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileSelect} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div 
                        key={img.id}
                        draggable
                        onDragStart={() => onDragStart(idx)}
                        onDragOver={(e) => onDragOver(e, idx)}
                        onDragEnd={onDragEnd}
                        className={`group relative aspect-square rounded-xl bg-gray-200 dark:bg-gray-800 overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-transform ${draggedIdx === idx ? "border-primary scale-105 shadow-xl opacity-80" : "border-transparent"}`}
                      >
                        <img 
                          src={img.preview || img.url} 
                          alt="Product" 
                          className="w-full h-full object-cover" 
                        />
                        {/* Overlay with buttons */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                          <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors shadow-sm">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <GripVertical className="w-6 h-6 text-white/50" />
                        </div>
                      </div>
                    ))}
                    
                    {/* Empty slots for visual cue */}
                    {images.length === 0 && (
                      <div className="col-span-2 sm:col-span-3 flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Chưa có ảnh nào</p>
                      </div>
                    )}
                  </div>
                  <p className="mt-4 text-xs text-gray-500 text-center">Có thể kéo thả để sắp xếp vị trí hiển thị (Giao diện).</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-background border-t border-gray-200 dark:border-border flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={saving} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
            Hủy
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</> : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
