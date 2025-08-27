import { v4 as uuidv4 } from 'uuid';

export type ItemStatus = 'pending' | 'ordered' | 'received' | 'deleted';

export interface FurnitureItem {
  id: string;
  title: string;
  url?: string;
  price?: number;
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  id: string; // UUID
  handle: string; // Previously header, used for joining lists
  displayName: string; // Display friendly name
  items: FurnitureItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AppData {
  lists: { [key: string]: List };
}

export const APP_STORAGE_KEY = 'homifyapt-local';

// Utility function to generate UUID
export function generateUUID(): string {
  return uuidv4();
}