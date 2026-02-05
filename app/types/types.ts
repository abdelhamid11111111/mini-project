

export interface Categories {
  id: number;
  name: string;
}

export interface Category{
  id: number;
  name: string
}

export interface Products {
  id: number;
  name: string;
  description: string;
  image?: string; // Add this line
  createdAt: string
  category: Category
  categoryId: number; 
}

export interface PaginationInfo {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPage: number;
  totalItems: number;
  currentPage: number;
  itemPerPage: number
}

export interface apiRes {
  data: Products[],
  Pagination: PaginationInfo
}