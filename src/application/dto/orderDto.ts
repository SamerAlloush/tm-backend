export interface OrderDto {
  id: string;
  userId: string;
  productIds: string[];
  total: number;
  status: string;
} 