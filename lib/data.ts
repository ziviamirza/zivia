import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { sellers } from "@/data/sellers";
import type { Category, Product, Seller } from "@/types";

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getSellerById(id: string): Seller | undefined {
  return sellers.find((s) => s.id === id);
}

export function getSellerBySlug(slug: string): Seller | undefined {
  return sellers.find((s) => s.slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsBySellerId(sellerId: string): Product[] {
  return products.filter((p) => p.sellerId === sellerId);
}

export function getRelatedProducts(
  product: Product,
  limit = 4,
): Product[] {
  return products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.categoryId === product.categoryId || p.sellerId === product.sellerId),
    )
    .slice(0, limit);
}

export function getFeaturedProducts(limit = 4): Product[] {
  return products.filter((p) => p.featured).slice(0, limit);
}

export function getNewArrivals(limit = 4): Product[] {
  return products.filter((p) => p.isNew).slice(0, limit);
}

export function getTopSellers(limit = 4): Seller[] {
  return sellers.slice(0, limit);
}
