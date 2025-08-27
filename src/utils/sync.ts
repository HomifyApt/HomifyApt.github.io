import { List, FurnitureItem, AppData, APP_STORAGE_KEY } from '../types/furniture';
import * as db from './database';
import supabase from './supabase';

const APP_ID = import.meta.env.VITE_APP_KEY;

// Sync a single list between localStorage and database
export async function syncList(listId: string, localList: List): Promise<List> {
  // Try to get the list from database by handle first
  const { data: existingLists, error: searchError } = await supabase
    .from('collections')
    .select()
    .eq('handle', localList.handle)
    .eq('app_id', APP_ID);

  if (searchError) {
    console.error('Error searching for list:', searchError);
    return localList;
  }

  // If list exists by handle, use that instead of creating new
  if (existingLists && existingLists.length > 0) {
    const dbList = {
      id: existingLists[0].collection_id,
      handle: existingLists[0].handle,
      displayName: existingLists[0].display_name,
      items: [],
      createdAt: new Date(existingLists[0].created_at),
      updatedAt: new Date(existingLists[0].updated_at),
    };

    // Sync items
    const mergedItems = await syncItems(dbList.id, localList.items, dbList.items);
    
    // Update list metadata if local is newer
    if (localList.updatedAt > dbList.updatedAt) {
      await db.updateList(dbList.id, localList.displayName);
      return {
        ...localList,
        id: dbList.id,
        items: mergedItems
      };
    }
    
    return {
      ...dbList,
      items: mergedItems
    };
  }

  // List doesn't exist in DB, create it
  const newList = await db.createList(localList.displayName, localList.handle);
  if (!newList) {
    return localList; // If DB creation fails, return local version
  }
  
  // Create all items in DB
  for (const item of localList.items) {
    await db.createItem(newList.id, {
      title: item.title,
      url: item.url,
      price: item.price,
      status: item.status
    });
  }
  
  return {
    ...localList,
    id: newList.id
  };
}

// Sync items between localStorage and database
async function syncItems(listId: string, localItems: FurnitureItem[], dbItems: FurnitureItem[]): Promise<FurnitureItem[]> {
  const mergedItems: FurnitureItem[] = [];
  const processedIds = new Set<string>();

  // Create a map of DB items for quick lookup
  const dbItemsMap = new Map(dbItems.map(item => [item.id, item]));
  
  // Process local items
  for (const localItem of localItems) {
    const dbItem = dbItemsMap.get(localItem.id);
    
    if (!dbItem) {
      // Item exists only locally, create in DB
      const newItem = await db.createItem(listId, {
        title: localItem.title,
        url: localItem.url,
        price: localItem.price,
        status: localItem.status
      });
      if (newItem) {
        mergedItems.push(newItem);
      } else {
        mergedItems.push(localItem);
      }
    } else {
      // Item exists in both places
      if (localItem.updatedAt > dbItem.updatedAt) {
        // Local is newer, update DB
        await db.updateItem(localItem.id, {
          title: localItem.title,
          url: localItem.url,
          price: localItem.price,
          status: localItem.status
        });
        mergedItems.push(localItem);
      } else {
        // DB is newer or same
        mergedItems.push(dbItem);
      }
    }
    
    processedIds.add(localItem.id);
  }
  
  // Add any items that exist only in DB
  for (const dbItem of dbItems) {
    if (!processedIds.has(dbItem.id)) {
      mergedItems.push(dbItem);
    }
  }
  
  return mergedItems;
}

// Sync all lists in localStorage with database
export async function syncAllLists(): Promise<void> {
  try {
    // Get local data
    const savedData = localStorage.getItem(APP_STORAGE_KEY);
    if (!savedData) return;
    
    const localData: AppData = JSON.parse(savedData);
    
    // Get all lists from DB
    const dbLists = await db.getAllLists();
    const dbListsMap = new Map(dbLists.map(list => [list.id, list]));
    
    // Sync each local list
    for (const [listId, localList] of Object.entries(localData.lists)) {
      const syncedList = await syncList(listId, localList);
      localData.lists[listId] = syncedList;
    }
    
    // Add any lists that exist only in DB
    for (const dbList of dbLists) {
      if (!localData.lists[dbList.id]) {
        localData.lists[dbList.id] = dbList;
      }
    }
    
    // Update localStorage with synced data
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(localData));
  } catch (error) {
    console.error('Error syncing lists:', error);
  }
}

// Utility function to sync after local changes
export async function syncAfterLocalUpdate(listId: string): Promise<void> {
  try {
    const savedData = localStorage.getItem(APP_STORAGE_KEY);
    if (!savedData) return;
    
    const localData: AppData = JSON.parse(savedData);
    const localList = localData.lists[listId];
    
    if (localList) {
      const syncedList = await syncList(listId, localList);
      localData.lists[listId] = syncedList;
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(localData));
    }
  } catch (error) {
    console.error('Error syncing after local update:', error);
  }
} 