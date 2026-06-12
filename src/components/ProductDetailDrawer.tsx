import { useState, useEffect } from "react";
import { 
  X, 
  ExternalLink, 
  Star, 
  Edit3, 
  Trash2, 
  Check, 
  ArrowLeft,
  ShoppingBag,
  Camera,
  Loader2
} from "lucide-react";
import { Product } from "../types";

interface ProductDetailDrawerProps {
  product: Product | null;
  onClose: () => void;
  onUpdateProduct: (product: Product) => Promise<boolean>;
  onDeleteProduct: (id: string) => Promise<boolean>;
  isOwnerMode: boolean;
}

export default function ProductDetailDrawer({
  product,
  onClose,
  onUpdateProduct,
  onDeleteProduct,
  isOwnerMode,
}: ProductDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Editable Form states
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [url, setUrl] = useState("");

  // Sync state with product selection
  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setPrice(product.price);
      setCategory(product.category);
      setImage(product.image);
      setDescription(product.description);
      setFeaturesText(product.features.join("\n"));
      setUrl(product.url);
      setIsEditing(false);
    }
  }, [product]);

  if (!product) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    
    const updatedProduct: Product = {
      ...product,
      title,
      price: Number(price),
      category,
      image,
      description,
      features: featuresText.split("\n").filter(f => f.trim() !== ""),
      url,
    };

    const success = await onUpdateProduct(updatedProduct);
    setIsSaving(false);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.title}"?`)) {
      setIsDeleting(true);
      const success = await onDeleteProduct(product.id);
      setIsDeleting(false);
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      
      {/* Semi-transparent dark blur backdrop */}
      <div 
        className="absolute inset-0 bg-[#151513]/40 backdrop-blur-sm transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Drawer content box - Elegant slide-over */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[#E6DFD5] animate-slide-over overflow-hidden">
        
        {/* Header toolbar */}
        <header className="px-6 py-4 border-b border-[#E6DFD5] flex items-center justify-between bg-[#FDFDFB]">
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="p-1.5 text-luxury-muted hover:text-luxury-charcoal transition-all rounded-sm"
              title="Đóng chi tiết"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-[10px] uppercase font-mono tracking-widest text-luxury-muted border-l border-[#E6DFD5] pl-4">
              {isEditing ? "Chỉnh sửa tủ đồ" : "Chi tiết lưu trữ"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isOwnerMode ? (
              isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 bg-luxury-gold text-white px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all duration-300 rounded-sm hover:bg-luxury-gold-dark"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Lưu
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-[#E6DFD5] text-luxury-muted hover:text-luxury-charcoal text-xs font-mono tracking-wider uppercase transition-all duration-300 rounded-sm bg-white"
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-mono tracking-wider text-luxury-charcoal hover:bg-luxury-stone hover:text-luxury-gold border border-[#E6DFD5] rounded-sm transition-all duration-300 uppercase"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Sửa
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-1 px-4 py-2 text-xs font-mono tracking-wider text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 rounded-sm transition-all duration-300 uppercase"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Xóa
                  </button>
                </>
              )
            ) : (
              <span className="text-[10px] bg-luxury-gold/10 text-luxury-gold-dark px-3 py-1 rounded-full font-mono tracking-wider uppercase font-semibold">
                An tâm mua sắm ✨
              </span>
            )}
          </div>
        </header>

        {/* Dynamic content scroll area */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Main Visual Image Banner */}
          {!isEditing && (
            <div className="relative h-96 w-full bg-luxury-stone overflow-hidden border-b border-[#E6DFD5]">
              <img
                src={image || "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000"}
                alt={title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              
              {/* Floating label inside banner */}
              <div className="absolute bottom-6 left-6 text-white">
                <span className="bg-luxury-gold text-[#151513] font-mono uppercase tracking-[0.2em] text-[8px] px-2.5 py-1 font-semibold rounded-sm border border-luxury-gold mr-3">
                  {category}
                </span>
                <span className="bg-black/30 backdrop-blur-sm font-mono uppercase tracking-[0.1em] text-[9px] px-2.5 py-1 rounded-sm border border-white/20">
                  Shopee Verified
                </span>
              </div>
            </div>
          )}

          {/* Detailed Read / Write view */}
          <div className="p-6 lg:p-8 space-y-6">
            {isEditing ? (
              <div className="space-y-5 animate-fade-in text-sm">
                
                {/* Title input */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-muted mb-1.5 font-medium">
                    Tên sản phẩm tuyển chọn
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-luxury-stone border border-[#E6DFD5] focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/20 outline-none transition-all rounded-sm text-luxury-charcoal"
                    placeholder="Nhập tên sản phẩm cao cấp..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price input */}
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-muted mb-1.5 font-medium">
                      Mức giá (VND)
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-luxury-stone border border-[#E6DFD5] focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/20 outline-none transition-all rounded-sm font-mono text-luxury-charcoal"
                      placeholder="Ví dụ: 850000"
                    />
                  </div>

                  {/* Category select */}
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-muted mb-1.5 font-medium">
                      Phân loại lưu trữ
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-luxury-stone border border-[#E6DFD5] focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/20 outline-none transition-all rounded-sm text-luxury-charcoal"
                    >
                      <option value="Thời trang">Thời trang</option>
                      <option value="Đồ điện tử">Đồ điện tử</option>
                      <option value="Mỹ phẩm">Mỹ phẩm</option>
                      <option value="Phòng khách">Phòng khách</option>
                      <option value="Đồ gia dụng">Đồ gia dụng</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                {/* Shopee URL */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-muted mb-1.5 font-medium">
                    Liên kết sản phẩm Shopee (Đầy đủ)
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-luxury-stone border border-[#E6DFD5] focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/20 outline-none transition-all rounded-sm font-mono text-xs text-luxury-charcoal"
                    placeholder="https://shopee.vn/..."
                  />
                </div>

                {/* Image URL input */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-muted mb-1.5 font-medium flex items-center justify-between">
                    <span>Đường dẫn hình ảnh trực quan</span>
                    <span className="text-[9px] lowercase font-normal italic text-[#C5A880]">Gợi ý từ Unsplash để tối ưu thẩm mỹ</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-luxury-stone border border-[#E6DFD5] focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/20 outline-none transition-all rounded-sm text-xs font-mono text-luxury-charcoal"
                      placeholder="https://images.unsplash.com/..."
                    />
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-luxury-muted">
                      <Camera className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Description textbox */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-muted mb-1.5 font-medium">
                    Mô tả nghệ thuật (Description)
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-luxury-stone border border-[#E6DFD5] focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/20 outline-none transition-all rounded-sm text-luxury-charcoal leading-relaxed resize-none"
                    placeholder="Mô tả kỹ lưỡng tinh tế về sản phẩm..."
                  />
                </div>

                {/* Features list text input */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-muted mb-1.5 font-medium flex justify-between">
                    <span>Đặc tính ưu việt thầm lặng</span>
                    <span className="text-[8px] italic tracking-wide text-luxury-muted font-normal lowercase">(Mỗi gạch đầu dòng một dòng mới)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    className="w-full px-4 py-2.5 bg-luxury-stone border border-[#E6DFD5] focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/20 outline-none transition-all rounded-sm text-xs font-mono text-luxury-charcoal leading-relaxed resize-none"
                    placeholder="Gia công thủ công cao cấp&#10;Bảo hành 2 năm..."
                  />
                </div>

              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Title & Reviews */}
                <div className="border-b border-[#E6DFD5]/40 pb-5">
                  <h1 className="font-serif text-2xl lg:text-3xl font-semibold leading-snug tracking-tight text-luxury-charcoal">
                    {product.title}
                  </h1>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center text-amber-400">
                      <Star className="w-4 h-4 fill-current stroke-current" />
                      <span className="font-mono text-xs font-semibold ml-1.5 text-luxury-charcoal">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-[#E6DFD5] font-mono">|</span>
                    <span className="text-xs font-mono text-luxury-muted">
                      Đã ghi nhận {product.reviewCount} đánh giá thật
                    </span>
                  </div>
                </div>

                {/* Price Label Block */}
                <div className="bg-luxury-stone p-5 border border-[#E6DFD5]/35 flex items-center justify-between rounded-sm">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-luxury-muted block">
                      Đơn giá thị trường
                    </span>
                    <span className="text-xl font-mono font-bold text-luxury-gold-dark mt-1 block">
                      {product.price.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  
                  {/* Purchase Link Action */}
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-luxury-gold hover:bg-luxury-gold-dark text-white px-5 py-3 transition-all duration-300 rounded-sm text-xs font-mono uppercase tracking-widest shadow-lg shadow-luxury-gold/15"
                  >
                    <span>Xem Trên Shopee</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Elaborate Description */}
                <div className="space-y-2">
                  <h3 className="text-[11px] uppercase font-mono tracking-widest text-luxury-muted font-bold">
                    Cảm hứng thiết kế
                  </h3>
                  <p className="text-luxury-charcoal leading-relaxed text-[14px]">
                    {product.description || "Chưa có văn bản mô tả cụ thể về sản phẩm này."}
                  </p>
                </div>

                {/* Exquisite Features list */}
                {product.features && product.features.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-[11px] uppercase font-mono tracking-widest text-luxury-muted font-bold">
                      Đặc tính ưu việt thầm lặng
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-luxury-muted">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start">
                          <span className="text-luxury-gold font-bold mt-0.5 shrink-0">✦</span>
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Aesthetic stamp banner */}
                <div className="p-8 border border-dashed border-[#E6DFD5] text-center rounded-sm bg-luxury-cream">
                  <ShoppingBag className="w-5 h-5 mx-auto text-luxury-gold/70 mb-3" />
                  <p className="text-[10px] font-mono tracking-widest uppercase text-luxury-muted">
                    Sản phẩm lưu trữ cá nhân kỹ thuật số
                  </p>
                  <p className="text-[9px] font-mono tracking-wider text-luxury-muted/70 lowercase mt-1">
                    Được bảo vệ và lưu hành nội bộ • {new Date(product.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
