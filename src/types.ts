export interface Product {
  id: string;
  url: string;
  title: string;
  price: number; // in VND
  image: string;
  category: string;
  description: string;
  features: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // lucide icon name
}

export interface ExtractResult {
  title: string;
  price: number;
  category: string;
  image: string;
  description: string;
  features: string[];
  rating: number;
  reviewCount: number;
}
