export interface Category {
  id: string;
  name: string;
  imageUrl?: string | null;
  sortOrder?: number | null;
}

export interface ProductImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  promoPrice?: number | string | null;
  images?: ProductImage[];
  categoryId?: string | null;
  isAvailable?: boolean;
}

export interface CompanyBranchAddress {
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
}

export interface CompanyBranch {
  name: string;
  isMain: boolean;
  address: CompanyBranchAddress | null;
}

export interface RestaurantSummary {
  id: string;
  tradeName: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  cuisineType?: string | null;
}

export interface CompanyDetail {
  id: string;
  tradeName: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  branches?: CompanyBranch[];
}

export interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string | null;
}

export interface CompanyReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: { user: { name: string } };
}

export interface MyReview {
  id: string;
  orderId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}
