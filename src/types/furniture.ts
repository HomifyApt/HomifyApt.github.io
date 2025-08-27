export type ItemStatus = 'pending' | 'ordered' | 'received';

export interface FurnitureItem {
  id: string;
  title: string;
  url?: string;
  price?: number;
  status: ItemStatus;
}