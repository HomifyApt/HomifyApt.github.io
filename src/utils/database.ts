import { List, FurnitureItem, ItemStatus } from '../types/furniture';
import supabase from './supabase';

const APP_ID = import.meta.env.VITE_APP_KEY;

// Collection (List) CRUD operations
export async function createList(displayName: string, handle: string): Promise<List | null> {
  const { data, error } = await supabase
    .from('collections')
    .insert({
      app_id: APP_ID,
      display_name: displayName,
      handle: handle,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating list:', error);
    return null;
  }

  return {
    id: data.collection_id,
    handle: data.handle,
    displayName: data.display_name,
    items: [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function getList(listId: string): Promise<List | null> {
  // First get the collection
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .select()
    .eq('collection_id', listId)
    .eq('app_id', APP_ID)
    .single();

  if (collectionError) {
    console.error('Error fetching list:', collectionError);
    return null;
  }

  // Then get all records for this collection
  const { data: records, error: recordsError } = await supabase
    .from('records')
    .select()
    .eq('collection_id', listId);

  if (recordsError) {
    console.error('Error fetching records:', recordsError);
    return null;
  }

  return {
    id: collection.collection_id,
    handle: collection.handle,
    displayName: collection.display_name,
    items: records.map(record => ({
      id: record.record_id,
      title: record.title,
      url: record.url,
      price: record.price,
      status: record.status as ItemStatus,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    })),
    createdAt: new Date(collection.created_at),
    updatedAt: new Date(collection.updated_at),
  };
}

export async function getAllLists(): Promise<List[]> {
  const { data: collections, error: collectionsError } = await supabase
    .from('collections')
    .select()
    .eq('app_id', APP_ID);

  if (collectionsError) {
    console.error('Error fetching lists:', collectionsError);
    return [];
  }

  // Get all records for these collections
  const { data: records, error: recordsError } = await supabase
    .from('records')
    .select()
    .in('collection_id', collections.map(c => c.collection_id));

  if (recordsError) {
    console.error('Error fetching records:', recordsError);
    return [];
  }

  // Group records by collection_id
  const recordsByCollection = records.reduce((acc, record) => {
    if (!acc[record.collection_id]) {
      acc[record.collection_id] = [];
    }
    acc[record.collection_id].push(record);
    return acc;
  }, {} as Record<string, any[]>);

  return collections.map(collection => ({
    id: collection.collection_id,
    handle: collection.handle,
    displayName: collection.display_name,
    items: (recordsByCollection[collection.collection_id] || []).map(record => ({
      id: record.record_id,
      title: record.title,
      url: record.url,
      price: record.price,
      status: record.status as ItemStatus,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    })),
    createdAt: new Date(collection.created_at),
    updatedAt: new Date(collection.updated_at),
  }));
}

export async function updateList(listId: string, displayName: string): Promise<boolean> {
  const { error } = await supabase
    .from('collections')
    .update({ display_name: displayName })
    .eq('collection_id', listId)
    .eq('app_id', APP_ID);

  if (error) {
    console.error('Error updating list:', error);
    return false;
  }

  return true;
}

export async function deleteList(listId: string): Promise<boolean> {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('collection_id', listId)
    .eq('app_id', APP_ID);

  if (error) {
    console.error('Error deleting list:', error);
    return false;
  }

  return true;
}

// Record (Item) CRUD operations
export async function createItem(
  listId: string,
  item: { title: string; url?: string; price?: number; status?: ItemStatus }
): Promise<FurnitureItem | null> {
  const { data, error } = await supabase
    .from('records')
    .insert({
      collection_id: listId,
      title: item.title,
      url: item.url,
      price: item.price,
      status: item.status || 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating item:', error);
    return null;
  }

  return {
    id: data.record_id,
    title: data.title,
    url: data.url,
    price: data.price,
    status: data.status as ItemStatus,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateItem(
  itemId: string,
  updates: { title?: string; url?: string; price?: number; status?: ItemStatus }
): Promise<boolean> {
  const { error } = await supabase
    .from('records')
    .update(updates)
    .eq('record_id', itemId);

  if (error) {
    console.error('Error updating item:', error);
    return false;
  }

  return true;
}

export async function deleteItem(itemId: string): Promise<boolean> {
  const { error } = await supabase
    .from('records')
    .delete()
    .eq('record_id', itemId);

  if (error) {
    console.error('Error deleting item:', error);
    return false;
  }

  return true;
}

// Utility function to get a list by handle
export async function getListByHandle(handle: string): Promise<List | null> {
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .select()
    .eq('handle', handle)
    .eq('app_id', APP_ID)
    .single();

  if (collectionError) {
    console.error('Error fetching list by handle:', collectionError);
    return null;
  }

  return getList(collection.collection_id);
} 