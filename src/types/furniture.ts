export type ItemStatus = 'pending' | 'ordered' | 'received' | 'deleted';

export interface FurnitureItem {
  id: string;
  title: string;
  url?: string;
  price?: number;
  status: ItemStatus;
}

export interface List {
  id: string;
  header: string;
  items: FurnitureItem[];
}

export interface AppData {
  lists: { [key: string]: List };
}

export const APP_STORAGE_KEY = 'homifyapt-local';