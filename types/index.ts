export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
};

export type Seller = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  avatar: string;
  whatsapp: string;
  instagram?: string;
  tiktok?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceAzn: number;
  image: string;
  sellerId: string;
  categoryId: string;
  featured: boolean;
  isNew: boolean;
};
