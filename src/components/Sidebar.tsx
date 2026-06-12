import { 
  ShoppingBag, 
  Smartphone, 
  Sparkles, 
  Home, 
  Coffee, 
  Layers, 
  Search,
  Plus
} from "lucide-react";
import { Category } from "../types";

interface SidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  productCounts: Record<string, number>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Sidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  productCounts,
  searchQuery,
  onSearchChange,
}: SidebarProps) {
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "ShoppingBag": return <ShoppingBag className="w-4 h-4" />;
      case "Smartphone": return <Smartphone className="w-4 h-4" />;
      case "Sparkles": return <Sparkles className="w-4 h-4" />;
      case "Home": return <Home className="w-4 h-4" />;
      case "Coffee": return <Coffee className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const totalCount = Object.values(productCounts).reduce((a, b) => a + b, 0);

  return (
    <aside className="w-full md:w-80 flex flex-col border-r border-[#E6DFD5] p-6 lg:p-8 shrink-0 md:h-[calc(100vh-80px)] md:sticky md:top-20 bg-[#FDFDFB]">
      
      {/* Search Bar - Aesthetic and minimal */}
      <div className="relative mb-8">
        <span className="absolute inset-y-0 left-3 flex items-center pr-2 pointer-events-none text-luxury-muted">
          <Search className="w-4 h-4 stroke-[1.5]" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm sản phẩm, thương hiệu..."
          className="w-full pl-10 pr-4 py-2.5 bg-luxury-stone text-sm border-0 border-b border-[#E6DFD5] focus:border-luxury-gold focus:ring-0 transition-all duration-300 placeholder-luxury-muted/70 text-luxury-charcoal uppercase tracking-widest text-[10px]"
        />
      </div>

      {/* Category Section Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] uppercase font-mono tracking-[0.25em] text-luxury-muted">
          Danh mục tủ đồ
        </h3>
      </div>

      {/* Categories List */}
      <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1">
        
        {/* All Products Item */}
        <button
          onClick={() => onSelectCategory("all")}
          className={`w-full flex items-center justify-between px-4 py-3 text-xs tracking-wider uppercase transition-all duration-300 font-mono ${
            selectedCategory === "all"
              ? "bg-luxury-stone border-l-2 border-luxury-gold text-luxury-charcoal font-medium pl-5"
              : "text-luxury-muted hover:text-luxury-charcoal hover:bg-luxury-stone/40 border-l-2 border-transparent"
          }`}
        >
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 stroke-[1.5]" />
            <span className="text-[11px]">Tất cả sản phẩm</span>
          </div>
          <span className="text-[10px] bg-luxury-beige/30 text-luxury-muted px-2 py-0.5 rounded-full font-mono font-normal">
            {totalCount}
          </span>
        </button>

        {/* Dynamic Items */}
        {categories.map((category) => {
          const count = productCounts[category.name] || 0;
          const isSelected = selectedCategory === category.name;

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.name)}
              className={`w-full flex items-center justify-between px-4 py-3 text-xs tracking-wider uppercase transition-all duration-300 font-mono ${
                isSelected
                  ? "bg-luxury-stone border-l-2 border-luxury-gold text-luxury-charcoal font-medium pl-5"
                  : "text-luxury-muted hover:text-luxury-charcoal hover:bg-luxury-stone/40 border-l-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                {getIcon(category.icon)}
                <span className="text-[11px]">{category.name}</span>
              </div>
              <span className="text-[10px] bg-luxury-beige/30 text-luxury-muted px-2 py-0.5 rounded-full font-mono font-normal">
                {count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Aesthetic block at bottom */}
      <div className="mt-8 border-t border-[#E6DFD5]/70 pt-6 text-center">
        <p className="text-[10px] font-mono tracking-widest text-luxury-muted uppercase">
          Curated & Archived
        </p>
        <p className="text-[9px] font-mono tracking-widest text-[#C5A880] uppercase mt-1">
          Shopee Link Organizer
        </p>
      </div>

    </aside>
  );
}
