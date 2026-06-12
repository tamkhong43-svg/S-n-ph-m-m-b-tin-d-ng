import { useState, useEffect } from "react";
import { 
  Plus, 
  Sparkles, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Clock, 
  Compass, 
  SlidersHorizontal,
  Baby,
  Search,
  Lock,
  Unlock,
  Home,
  ShoppingBag,
  Smartphone,
  Coffee,
  X
} from "lucide-react";
import { Product, Category } from "./types";
import ProductCard from "./components/ProductCard";
import ProductDetailDrawer from "./components/ProductDetailDrawer";
import AddProductModal from "./components/AddProductModal";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Floating Baby Categories status
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);

  // Owner Mode security states
  const [isOwnerMode, setIsOwnerMode] = useState<boolean>(false);
  const [showPinPrompt, setShowPinPrompt] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");

  // Real-time local clock
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " GMT+7");
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch products and categories on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        // Load products
        const resProd = await fetch("/api/products");
        if (resProd.ok) {
          const data = await resProd.json();
          setProducts(data);
        }
        // Load categories
        const resCat = await fetch("/api/categories");
        if (resCat.ok) {
          const data = await resCat.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to load initial dataset:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Inline dynamically created category handler
  const handleAddCategory = async (name: string): Promise<Category | null> => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon: "Layers" })
      });
      if (res.ok) {
        const newCat = await res.json();
        setCategories(prev => [...prev, newCat]);
        return newCat;
      }
    } catch (err) {
      console.error("Failed to create category:", err);
    }
    return null;
  };

  // Dynamic category deletion handler
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phân loại "${name}"? Các sản phẩm thuộc danh mục này sẽ giữ nguyên nhưng không còn lọc nhanh theo nút này.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
        if (selectedCategory === name) {
          setSelectedCategory("all");
        }
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  // Calculate dynamic product counts per category
  const productCounts = products.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalProductCount = products.length;

  // Helper to fetch matching category icon
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "ShoppingBag": return <ShoppingBag className="w-4 h-4 text-luxury-gold" />;
      case "Smartphone": return <Smartphone className="w-4 h-4 text-luxury-gold" />;
      case "Sparkles": return <Sparkles className="w-4 h-4 text-luxury-gold" />;
      case "Home": return <Home className="w-4 h-4 text-luxury-gold" />;
      case "Coffee": return <Coffee className="w-4 h-4 text-luxury-gold" />;
      default: return <Layers className="w-4 h-4 text-luxury-gold" />;
    }
  };

  // Handle Category Select
  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setCurrentPage(1); // reset page
    setIsCategoryOpen(false); // close compact baby selection panel
  };

  // Handle Search Input
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // reset page
  };

  // Filter products based on search & category
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination logic: Exactly 6 per page!
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Owner Mode Verification Handlers
  const handleToggleOwnerMode = () => {
    if (isOwnerMode) {
      setIsOwnerMode(false);
    } else {
      setShowPinPrompt(true);
      setPinInput("");
      setPinError("");
    }
  };

  const handleVerifyPinSubmit = (e: any) => {
    e.preventDefault();
    if (pinInput === "1234" || pinInput === "2026") {
      setIsOwnerMode(true);
      setShowPinPrompt(false);
      setPinError("");
    } else {
      setPinError("Mã PIN chưa chính xác (Mặc định: 1234)");
    }
  };

  // CRUD operation callbacks
  const handleAddProduct = async (draftProduct: Omit<Product, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftProduct)
      });
      if (res.ok) {
        const saved = await res.json();
        setProducts((prev) => [saved, ...prev]);
        setCurrentPage(1); // reset to first page to see the new item
        return true;
      }
    } catch (err) {
      console.error("Error adding product:", err);
    }
    return false;
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const res = await fetch(`/api/products/${updatedProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct)
      });
      if (res.ok) {
        const saved = await res.json();
        setProducts((prev) => prev.map((p) => p.id === saved.id ? saved : p));
        if (selectedProductForDetails?.id === saved.id) {
          setSelectedProductForDetails(saved);
        }
        return true;
      }
    } catch (err) {
      console.error("Error updating product:", err);
    }
    return false;
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        if (selectedProductForDetails?.id === id) {
          setSelectedProductForDetails(null);
        }
        if (currentPage > 1 && (filteredProducts.length - 1) <= (currentPage - 1) * ITEMS_PER_PAGE) {
          setCurrentPage(currentPage - 1);
        }
        return true;
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
    return false;
  };

  return (
    <div id="shopee-vault-app" className="min-h-screen flex flex-col bg-luxury-cream selection:bg-luxury-gold/20 selection:text-luxury-charcoal">
      
      {/* Top Friendly Header / Consumer Style Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E6DFD5] px-6 lg:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand identity - Soft, inviting style */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-serif font-bold text-base shadow-md">
            S
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-[0.05em] text-orange-700 uppercase leading-none">
              NHỮNG ĐỒ DÙNG MẸ TIN DÙNG
            </h1>
            <p className="text-[10px] font-sans text-luxury-muted font-medium tracking-wide mt-1 leading-none">
              Ý tưởng tham khảo & đồ dùng chất lượng cao cho mẹ và bé
            </p>
          </div>
        </div>

        {/* Search Input Built-in Header (highly responsive and consumer friendly) */}
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-3 flex items-center text-luxury-muted pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm sản phẩm yêu thích..."
            className="w-full pl-9 pr-4 py-2 bg-luxury-stone text-xs focus:ring-1 focus:ring-orange-600/30 border border-[#E6DFD5] outline-none rounded-sm text-luxury-charcoal"
          />
        </div>

        {/* Actions Segment: Owner Verification Switch and Add Products */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          
          {/* Subtle Owner Mode Toggle */}
          <button
            onClick={handleToggleOwnerMode}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-all duration-300 ${
              isOwnerMode 
                ? "bg-amber-100 text-amber-800 border border-amber-300 font-bold" 
                : "bg-luxury-stone text-luxury-muted border border-[#E6DFD5] hover:text-luxury-charcoal hover:bg-[#E6DFD5]/40"
            }`}
            title="Nhấn vào để thay đổi quyền chủ cửa hàng hoặc người xem thoải mái"
          >
            {isOwnerMode ? (
              <>
                <Unlock className="w-3 h-3 text-orange-600" />
                <span>Chủ kho (PIN Đã bật)</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 text-luxury-muted" />
                <span>Quyền chủ sở hữu</span>
              </>
            )}
          </button>

          {/* Add product action trigger - unlocked only in Owner mode */}
          {isOwnerMode && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 transition-all duration-300 rounded-sm text-[11px] font-mono uppercase tracking-wider font-semibold cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Thêm Sản Phẩm</span>
            </button>
          )}

        </div>

      </header>

      {/* Owner Mode Active Notification */}
      {isOwnerMode && (
        <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-6 text-center text-xs text-amber-800 font-mono tracking-wide">
          ✨ Bạn đang hoạt động dưới quyền <strong>Chủ sở hữu</strong>. Bạn có toàn quyền thêm sản phẩm mới kèm đường dẫn Shopee, hình ảnh và cập nhật thông tin chi tiết dưới mỗi sản phẩm.
        </div>
      )}

      {/* PIN entry dialog box overlay */}
      {showPinPrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleVerifyPinSubmit}
            className="bg-white border border-[#E6DFD5] p-6 max-w-sm w-full rounded-sm shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-luxury-charcoal flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-600" />
                Xác minh chủ sở hữu
              </h3>
              <button 
                type="button"
                onClick={() => setShowPinPrompt(false)}
                className="text-luxury-muted hover:text-luxury-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-luxury-muted leading-relaxed">
              Vui lòng nhập mã PIN chủ cửa hàng để kích hoạt quyền đăng tải/chỉnh sửa sản phẩm.
            </p>
            <div className="bg-orange-50 text-[10px] text-orange-800 p-2.5 rounded-sm font-mono">
              💡 Mã thử nghiệm: <strong className="underline">1234</strong> hoặc <strong>2026</strong>
            </div>

            <input
              type="password"
              placeholder="Nhập mã PIN của bạn..."
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full px-3 py-2 border border-[#E6DFD5] text-center font-mono rounded-sm outline-none focus:border-orange-600 tracking-widest text-sm text-luxury-charcoal"
              autoFocus
            />

            {pinError && (
              <p className="text-[11px] text-red-600 font-medium font-mono text-center">
                {pinError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 text-xs font-mono uppercase tracking-widest font-semibold rounded-sm transition-colors"
              >
                Kích hoạt
              </button>
              <button
                type="button"
                onClick={() => setShowPinPrompt(false)}
                className="flex-1 bg-luxury-stone hover:bg-luxury-stone/80 text-luxury-charcoal py-2 text-xs font-mono uppercase tracking-widest rounded-sm border border-[#E6DFD5] transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Baby Icon for Categories (Ẩn trong biểu tượng em bé, nhấn vào mới hiện) */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="flex items-center gap-2.5 bg-orange-600 hover:bg-orange-700 text-white px-5 py-3.5 shadow-2xl transition-all duration-300 rounded-full cursor-pointer focus:outline-none ring-4 ring-white/70"
          title="Nhấn vào để lọc danh mục sản phẩm của em bé và gia đình"
          id="btn-baby-categories"
        >
          <Baby className="w-5 h-5 text-white animate-pulse" />
          <span className="text-[11px] font-sans uppercase tracking-widest font-bold">
            Phân loại đồ dùng 🍼
          </span>
        </button>
        
        {isCategoryOpen && (
          <div className="absolute bottom-16 left-0 bg-white border border-[#E6DFD5] shadow-2xl p-4 w-72 rounded-sm text-sm animate-fade-in space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E6DFD5]/40 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C5A880]">Lọc theo nhóm</span>
              <button 
                onClick={() => setIsCategoryOpen(false)}
                className="text-luxury-muted hover:text-luxury-charcoal text-[10px] font-mono uppercase border border-[#E6DFD5] px-1.5 py-0.5 rounded-sm bg-luxury-stone"
              >
                Đóng
              </button>
            </div>

            {/* Custom Interactive selections */}
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              
              {/* All Option */}
              <button
                onClick={() => handleSelectCategory("all")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wide rounded-sm transition-all duration-200 ${
                  selectedCategory === "all"
                    ? "bg-orange-50 border-l-2 border-orange-600 text-orange-950 font-bold"
                    : "text-luxury-muted hover:bg-luxury-stone hover:text-luxury-charcoal"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-orange-400" />
                  <span>Tất cả sản phẩm</span>
                </span>
                <span className="font-mono text-[9px] bg-luxury-stone px-1.5 py-0.5 rounded-sm">
                  {totalProductCount}
                </span>
              </button>

              {/* Individual Categories Option */}
              {categories.map((cat) => {
                const count = productCounts[cat.name] || 0;
                const isSelected = selectedCategory === cat.name;

                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between group/cat hover:bg-luxury-stone/30 rounded-sm transition-all duration-200"
                  >
                    <button
                      onClick={() => handleSelectCategory(cat.name)}
                      className={`flex-1 flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wide rounded-sm transition-all duration-200 ${
                        isSelected
                          ? "bg-orange-50 border-l-2 border-orange-600 text-orange-950 font-bold"
                          : "text-luxury-muted hover:bg-luxury-stone hover:text-luxury-charcoal"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {getCategoryIcon(cat.icon)}
                        <span>{cat.name}</span>
                      </span>
                      <span className="font-mono text-[9px] bg-luxury-stone px-1.5 py-0.5 rounded-sm">
                        {count}
                      </span>
                    </button>

                    {/* Owner deletion switch inside baby drawer list */}
                    {isOwnerMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(cat.id, cat.name);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-sm mr-1.5 opacity-0 group-hover/cat:opacity-100 transition-opacity duration-200 cursor-pointer"
                        title={`Xóa danh mục ${cat.name}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        )}
      </div>

      {/* Main Content Split Space: Left sidebar removed so the grid is full width! */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col pb-12 px-6 lg:px-12 mt-6">
        
        {/* Product Catalog Grid Stage */}
        <main className="flex-1 flex flex-col justify-between min-h-[calc(100vh-100px)]">
          
          {/* Section title & count description */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-[#E6DFD5]/40 gap-4">
            <div>
              <h2 className="font-serif text-xl lg:text-2xl font-bold tracking-tight text-luxury-charcoal flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-orange-600" />
                {selectedCategory === "all" ? "Sản phẩm tốt dành cho bé và mẹ" : selectedCategory}
              </h2>
            </div>

            {/* Quick controls status info */}
            <div className="flex items-center gap-3">
              <span className="bg-luxury-stone text-luxury-muted text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 border border-[#E6DFD5]/40 rounded-sm flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
                Tổng hiển thị: {filteredProducts.length} món đồ tuyển chọn
              </span>
            </div>
          </div>

          {/* Loading status representation */}
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
              <p className="text-[11px] font-mono uppercase tracking-widest text-luxury-muted">
                Đang nạp bộ sưu tập được yêu mến...
              </p>
            </div>
          ) : paginatedProducts.length > 0 ? (
            <div className="flex-1 flex flex-col justify-between">
              
              {/* Responsive Elegant Grid columns of 3, 2 rows total = exactly 6 items! */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 min-h-[400px]">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetails={setSelectedProductForDetails}
                  />
                ))}
              </div>

              {/* Sophisticated Luxury Pagination Bar */}
              {totalPages > 1 && (
                <div className="mt-12 pt-6 border-t border-[#E6DFD5]/40 flex items-center justify-between">
                  
                  {/* Previous page pin */}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest px-4 py-2 border border-[#E6DFD5] transition-all rounded-sm ${
                      currentPage === 1
                        ? "text-luxury-muted/40 cursor-not-allowed bg-luxury-stone/30"
                        : "text-luxury-charcoal hover:bg-luxury-stone hover:text-orange-600 cursor-pointer"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Trước
                  </button>

                  {/* Elegant micro paginated dots */}
                  <div className="flex items-center gap-2.5">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = currentPage === pageNum;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 font-mono text-[11px] font-medium flex items-center justify-center rounded-sm transition-all duration-300 ${
                            isActive
                              ? "bg-orange-600 text-white shadow-md shadow-orange-600/10"
                              : "text-luxury-muted hover:text-luxury-charcoal hover:bg-luxury-stone"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next page pin */}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest px-4 py-2 border border-[#E6DFD5] transition-all rounded-sm ${
                      currentPage === totalPages
                        ? "text-luxury-muted/40 cursor-not-allowed bg-luxury-stone/30"
                        : "text-luxury-charcoal hover:bg-luxury-stone hover:text-orange-600 cursor-pointer"
                    }`}
                  >
                    Sau
                    <ChevronRight className="w-4 h-4" />
                  </button>

                </div>
              )}

            </div>
          ) : (
            
            /* No Results fallback card */
            <div className="flex-1 flex flex-col items-center justify-center py-24 text-center border border-dashed border-[#E6DFD5] bg-white rounded-sm">
              <Compass className="w-10 h-10 text-orange-600 mb-4 animate-bounce" />
              <h3 className="font-serif text-lg font-bold text-luxury-charcoal mb-1">
                Không tìm thấy mẫu sản phẩm phù hợp
              </h3>
              <p className="text-xs text-luxury-muted max-w-sm leading-relaxed mb-6">
                Chưa thấy món đồ nào khớp bộ lọc danh mục hoặc từ khóa của bạn. Đừng lo lắng, hãy thử quay lại ban đầu nhé!
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="text-[10px] font-mono uppercase tracking-widest text-[#C25A2A] hover:text-luxury-charcoal transition-colors border-b border-[#C25A2A] pb-0.5"
              >
                Trở lại bộ sưu tập đầy đủ
              </button>
            </div>
            
          )}

        </main>

      </div>

      {/* Slide-over details drawer with isOwnerMode bridge */}
      <ProductDetailDrawer
        product={selectedProductForDetails}
        onClose={() => setSelectedProductForDetails(null)}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        isOwnerMode={isOwnerMode}
      />

      {/* Automated Add Product with AI Modal */}
      {isAddModalOpen && (
        <AddProductModal
          onClose={() => setIsAddModalOpen(false)}
          onAddProduct={handleAddProduct}
          categories={categories}
          onAddCategory={handleAddCategory}
        />
      )}

      {/* Simplified friendly footer with Copyright metatada REMOVED */}
      <footer className="bg-white border-t border-[#E6DFD5] py-8 px-6 text-center text-luxury-muted/80 text-[10px] font-sans tracking-widest uppercase mt-auto">
        <p className="text-luxury-charcoal font-medium">BỘ SƯU TẬP SẢN PHẨM TUYỂN CHỌN DÀNH CHO CẢ GIA ĐÌNH VÀ BÉ YÊU</p>
        <p className="text-[9px] text-orange-600 mt-1.5 tracking-wider">CHIA SẺ SẢN PHẨM KHU KHÁNH - TIỆN ÍCH CHẤT LƯỢNG CAO CHO MỌI NGƯỜI</p>
      </footer>

    </div>
  );
}
