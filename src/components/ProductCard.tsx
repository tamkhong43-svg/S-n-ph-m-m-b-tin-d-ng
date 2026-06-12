import { ExternalLink, Star } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: string;
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export default function ProductCard({ product, onOpenDetails }: ProductCardProps) {
  
  // Format price helper
  const formatPrice = (value: number) => {
    return value.toLocaleString("vi-VN") + "đ";
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group bg-white border border-[#E6DFD5]/70 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-[#C5A880]/5 transition-all duration-500 rounded-sm relative"
    >
      
      {/* Category Tag on Card Corner */}
      <span className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[9px] font-mono tracking-[0.2em] uppercase text-luxury-charcoal border border-[#E6DFD5]/40 rounded-sm">
        {product.category}
      </span>

      {/* Shopee Tag */}
      <span className="absolute top-3 right-3 z-10 bg-[#FF5722] text-white px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase rounded-sm flex items-center gap-1 opacity-90">
        Shopee
      </span>

      {/* Image Container with Luxury Zoom Hover */}
      <div 
        onClick={() => onOpenDetails(product)}
        className="relative aspect-square w-full bg-luxury-stone overflow-hidden cursor-pointer group"
      >
        <img
          src={product.image || "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800"}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Hover overlay details button */}
        <div className="absolute inset-0 bg-luxury-charcoal/10 group-hover:bg-luxury-charcoal/20 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button className="bg-white text-luxury-charcoal uppercase tracking-widest text-[9px] font-mono px-4 py-2 hover:bg-luxury-gold hover:text-white transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 shadow-lg">
            Chi tiết sản phẩm
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        
        {/* Rating and Reviews */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex items-center text-amber-400">
            <Star className="w-3 h-3 fill-current stroke-current" />
            <span className="text-[10px] font-mono font-medium ml-1 text-luxury-charcoal">
              {product.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-[9px] font-mono text-luxury-muted">
            ({product.reviewCount} đánh giá)
          </span>
        </div>

        {/* Product Title - Playfair Display luxurious serif */}
        <h4 
          onClick={() => onOpenDetails(product)}
          className="font-serif text-[15px] font-semibold text-luxury-charcoal line-clamp-1 leading-relaxed group-hover:text-luxury-gold transition-colors duration-300 cursor-pointer"
        >
          {product.title}
        </h4>

        {/* Product Introduction - Bright Orange Brown */}
        <p className="text-[11px] text-[#C25A2A] font-medium line-clamp-2 mt-1 leading-relaxed min-h-[32px] font-sans">
          {product.description || "Thiết kế tối giản đầy tinh tế, mang lại phong thái sang trọng và thời thượng."}
        </p>

        {/* Divider */}
        <div className="w-10 h-[1px] bg-luxury-gold/30 my-2 group-hover:w-20 transition-all duration-500"></div>

        {/* Pricing & Shopee CTA */}
        <div className="flex items-center justify-between mt-auto pt-2">
          
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-mono tracking-widest text-luxury-muted">
              Đơn giá
            </span>
            <span className="font-mono text-xs font-semibold text-luxury-gold-dark tracking-normal mt-0.5">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Shopee action button */}
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-luxury-stone hover:bg-orange-600 hover:text-white text-luxury-charcoal border border-[#E6DFD5] px-3 py-1.5 transition-all duration-300 rounded-sm text-[10px] font-mono uppercase tracking-wider"
          >
            Tham khảo ngay
            <ExternalLink className="w-3 h-3" />
          </a>

        </div>

      </div>

    </div>
  );
}
