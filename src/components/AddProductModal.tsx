import React, { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  Loader2, 
  Check, 
  Link, 
  FileText, 
  Tag, 
  DollarSign, 
  Image as ImageIcon,
  Plus,
  HelpCircle
} from "lucide-react";
import { Product, Category, ExtractResult } from "../types";

interface AddProductModalProps {
  onClose: () => void;
  onAddProduct: (product: Omit<Product, "id" | "createdAt">) => Promise<boolean>;
  categories: Category[];
  onAddCategory: (name: string) => Promise<Category | null>;
}

export default function AddProductModal({ onClose, onAddProduct, categories, onAddCategory }: AddProductModalProps) {
  const [shopeeUrl, setShopeeUrl] = useState("");
  const [userHint, setUserHint] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states - fully editable by the user
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number>(250000);
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [featuresText, setFeaturesText] = useState("");

  // Inline dynamic category adding state inside modal
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Set default category on mount/load
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  // Automatic Link Detection & Extraction helper (Auto updates Cover, Description, price)
  useEffect(() => {
    // We check if it is a valid shopee or any http url
    const isUrl = shopeeUrl.startsWith("http://") || shopeeUrl.startsWith("https://");
    const hasEnoughLength = shopeeUrl.length > 15;
    
    if (isUrl && hasEnoughLength) {
      const delayDebounce = setTimeout(() => {
        triggerAutoExtraction();
      }, 1000); // Wait 1 second after typing stops to pull automatically
      return () => clearTimeout(delayDebounce);
    }
  }, [shopeeUrl]);

  const triggerAutoExtraction = async () => {
    if (isExtracting) return;
    setIsExtracting(true);

    try {
      const response = await fetch("/api/extract-shopee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: shopeeUrl, userHint }),
      });

      if (response.ok) {
        const data: ExtractResult = await response.json();
        
        // Auto-populate state seamlessly
        setTitle(data.title || "");
        setPrice(data.price || 250000);
        
        // Match with known categories or fallback to inputted category
        if (data.category) {
          setCategory(data.category);
        }
        
        setImage(data.image || "");
        setDescription(data.description || "");
        setFeaturesText(data.features ? data.features.join("\n") : "");
      }
    } catch (error) {
      console.error("Auto extraction error:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCatName.trim()) return;
    setIsAddingCat(true);
    try {
      const added = await onAddCategory(newCatName.trim());
      if (added) {
        setCategory(added.name);
        setNewCatName("");
        setShowNewCatInput(false);
      }
    } catch (err) {
      console.error("Failed to add category:", err);
    } finally {
      setIsAddingCat(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shopeeUrl.trim() || !image.trim()) {
      alert("Vui lòng điền các thông tin cơ bản: Tên sản phẩm, link Shopee, và hình ảnh.");
      return;
    }

    setIsSaving(true);
    
    const newProduct: Omit<Product, "id" | "createdAt"> = {
      url: shopeeUrl,
      title: title.trim(),
      price: Number(price) || 0,
      image: image.trim(),
      category: category || "Khác",
      description: description.trim(),
      features: featuresText.split("\n").filter(f => f.trim() !== ""),
      rating: 4.8 + Math.round(Math.random() * 2) / 10,
      reviewCount: 35 + Math.floor(Math.random() * 115),
    };

    const success = await onAddProduct(newProduct);
    setIsSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in p-4 overflow-y-auto">
      
      {/* Semi-transparent dark overlay */}
      <div 
        className="absolute inset-0 bg-[#151513]/55 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Main Form Container */}
      <div className="relative bg-[#FDFDFB] w-full max-w-2xl border border-[#E6DFD5] shadow-2xl flex flex-col z-10 rounded-sm overflow-hidden my-4 max-h-[92vh]">
        
        {/* Modal Header */}
        <header className="px-6 py-4.5 border-b border-[#E6DFD5] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-600 animate-pulse" />
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-luxury-charcoal font-bold">
              Thêm sản phẩm tham khảo 
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-luxury-muted hover:text-orange-600 transition-all p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSaveProduct} className="overflow-y-auto p-6 md:p-8 space-y-5">
          
          {/* Quick Notice about Auto-Fill */}
          <div className="bg-orange-50 border border-orange-100 p-3.5 rounded-sm flex items-start gap-2.5 text-xs">
            <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div className="text-orange-950">
              <strong className="block font-semibold">Tự động hóa bằng AI của bạn ⚡</strong>
              Khi bạn dán đường dẫn mua hàng Shopee vào ô dưới đây, hệ thống sẽ tự động quét thông tin, nạp ảnh thực tế, giá bán và đặc điểm nổi bật trong nháy mắt!
            </div>
          </div>

          {/* Shopee URL field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#C25A2A] block font-bold">
              Đường dẫn liên kết Shopee *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-luxury-muted">
                <Link className="w-4 h-4" />
              </span>
              <input
                type="url"
                required
                value={shopeeUrl}
                onChange={(e) => setShopeeUrl(e.target.value)}
                placeholder="Dán link sản phẩm Shopee tại đây (ví dụ: https://shopee.vn/...)"
                className="w-full pl-10 pr-12 py-3 bg-luxury-stone border border-[#E6DFD5] focus:border-orange-600 focus:ring-1 focus:ring-orange-600/20 outline-none font-mono text-xs rounded-sm text-luxury-charcoal"
              />
              
              {isExtracting && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] text-orange-700 bg-orange-100/60 px-2.5 py-1 rounded-sm font-mono animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin text-orange-600" />
                  AI quét dữ liệu...
                </span>
              )}
            </div>
            <p className="text-[10px] text-luxury-muted font-sans italic">
              Đường link hợp lệ bắt đầu bằng https://. Cập nhật được hình ảnh và giá chính xác ngay khi nhập xong.
            </p>
          </div>

          {/* Hint optional descriptor to help AI guide Unsplash */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-widest text-luxury-muted block font-semibold">
              Gợi ý từ khóa để tìm ảnh đẹp (Không bắt buộc)
            </label>
            <input
              type="text"
              value={userHint}
              onChange={(e) => setUserHint(e.target.value)}
              placeholder="ví dụ: gối ngủ em bé màu hồng nhạt, bình uống nước bằng nhựa PP..."
              className="w-full px-4 py-2 bg-luxury-stone border border-[#E6DFD5] text-xs rounded-sm outline-none text-luxury-charcoal"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-[#E6DFD5]/50 my-6"></div>

          {/* Main editable block */}
          <div className="space-y-4">
            
            {/* Title field */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-muted mb-1 font-semibold">
                Tên sản phẩm giới thiệu
              </label>
              <input
                type="text"
                required
                placeholder="Nhập tên sản phẩm dễ mến..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#E6DFD5] outline-none focus:border-orange-600 text-xs rounded-sm text-luxury-charcoal font-medium"
              />
            </div>

            {/* Grid of Price & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Cash Price */}
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-muted mb-1 font-semibold">
                  Giá tham khảo (VNĐ)
                </label>
                <input
                  type="number"
                  required
                  placeholder="250000"
                  value={price || ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-[#E6DFD5] outline-none focus:border-orange-600 text-xs rounded-sm text-luxury-charcoal font-mono"
                />
              </div>

              {/* Dynamic Categorization dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-muted font-semibold">
                    Nhóm phân loại
                  </label>
                  
                  {/* Inline link to add category */}
                  <button
                    type="button"
                    onClick={() => setShowNewCatInput(!showNewCatInput)}
                    className="text-[10px] text-orange-600 hover:underline font-mono uppercase bg-transparent border-none p-0 cursor-pointer"
                  >
                    {showNewCatInput ? "[Đóng]" : "+ Thêm phân loại"}
                  </button>
                </div>

                {showNewCatInput ? (
                  <div className="flex gap-1.5 animate-fade-in">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="ví dụ: Đồ ăn dặm"
                      className="flex-1 px-3 py-1.5 border border-orange-200 outline-none text-xs rounded-sm bg-orange-50/30 text-luxury-charcoal"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      disabled={isAddingCat || !newCatName.trim()}
                      className="bg-orange-600 text-white px-2.5 py-1.5 text-[10px] font-mono tracking-wider uppercase rounded-sm hover:bg-orange-700 disabled:opacity-50"
                    >
                      {isAddingCat ? <Loader2 className="w-3 h-3 animate-spin" /> : "Thêm"}
                    </button>
                  </div>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#E6DFD5] outline-none focus:border-orange-600 text-xs rounded-sm text-luxury-charcoal"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

            </div>

            {/* Visual Cover Image input accompanied by live responsive thumbnail */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-muted font-semibold">
                Đường dẫn hình ảnh trực quan (URL)
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="url"
                  required
                  placeholder="URL hình ảnh tuyệt đẹp (Unsplash, Shopee, v.v.)"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-[#E6DFD5] outline-none focus:border-orange-600 text-xs rounded-sm font-mono text-luxury-charcoal"
                />
                
                {image && (
                  <div className="w-12 h-12 rounded-sm border border-[#E6DFD5] overflow-hidden shrink-0 bg-luxury-stone">
                    <img 
                      src={image} 
                      alt="Thumbnail product" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Fallback
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=100";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Description Paragraph */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-[#C25A2A] mb-1 font-bold">
                Giới thiệu nổi bật sản phẩm (Màu nâu cam sáng trong danh sách)
              </label>
              <textarea
                rows={3}
                required
                placeholder="Câu nói ngắn giới thiệu sản phẩm thật thu hút và thân thiện dành cho các mẹ..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-[#E6DFD5] outline-none focus:border-orange-600 text-xs rounded-sm text-luxury-charcoal leading-relaxed resize-none"
              />
            </div>

            {/* Key bullet-points feature list */}
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-muted mb-1 font-semibold flex justify-between">
                <span>Thông tin chi tiết điền dưới sản phẩm (Mỗi đặc điểm một dòng)</span>
                <span className="text-[8px] lowercase italic font-normal text-luxury-muted/70">(Ví dụ: Chất liệu 100% cotton tự nhiên)</span>
              </label>
              <textarea
                rows={3}
                placeholder="An toàn cho làn da của bé sơ sinh&#10;Có thể tháo rời giặt giũ dễ dàng&#10;Xuất xứ: Việt Nam xuất khẩu"
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-[#E6DFD5] outline-none focus:border-orange-600 text-xs rounded-sm font-mono text-luxury-charcoal leading-relaxed resize-none"
              />
            </div>

          </div>

          {/* Submitting Actions footer */}
          <div className="pt-5 border-t border-[#E6DFD5]/40 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-[#E6DFD5] text-luxury-muted hover:text-luxury-charcoal text-xs font-mono uppercase tracking-widest rounded-sm bg-white transition-all duration-300"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 text-xs font-mono tracking-widest uppercase transition-all duration-300 rounded-sm shadow-md font-bold"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Lưu trữ & Đăng tải
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
