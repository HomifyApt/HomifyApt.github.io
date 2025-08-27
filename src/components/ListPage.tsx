import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListItem } from "./ListItem";
import { AddItemDialog } from "./AddItemDialog";
import { EditDisplayNameDialog } from "./EditDisplayNameDialog";
import { PriceChartDialog } from "./PriceChartDialog";
import { Plus, Edit3, ArrowLeft, Euro } from "lucide-react";
import { FurnitureItem, ItemStatus, AppData, List, APP_STORAGE_KEY, generateUUID } from "../types/furniture";
import { RecordItem } from './RecordItem';
import { syncAfterLocalUpdate } from '../utils/sync';

interface ListPageProps {
  listId: string; // This is now the handle
  onBack: () => void;
  onHeaderUpdate: (newDisplayName: string) => void;
  onContentUpdate: () => void;
}

export function ListPage({ listId, onBack, onHeaderUpdate, onContentUpdate }: ListPageProps) {
  const [displayName, setDisplayName] = useState(listId);
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDisplayNameOpen, setIsEditDisplayNameOpen] = useState(false);
  const [isPriceChartOpen, setIsPriceChartOpen] = useState(false);

  // Load items from localStorage on mount
  useEffect(() => {
    try {
      console.log('Storage key being used:', APP_STORAGE_KEY);
      const savedData = localStorage.getItem(APP_STORAGE_KEY);
      console.log('Loading data:', savedData);
      
      let appData: AppData;
      if (savedData) {
        appData = JSON.parse(savedData);
        console.log('Successfully parsed existing data:', appData);
      } else {
        appData = { lists: {} };
        console.log('Initializing new app data');
      }
      
      const currentList = appData.lists[listId];
      if (currentList) {
        console.log('Found existing list:', currentList);
        setItems(currentList.items);
        setDisplayName(currentList.displayName);
      } else {
        // Initialize new list with UUID but don't save yet
        // The sync operation will handle saving to both localStorage and DB
        const newList: List = {
          id: generateUUID(),
          handle: listId,
          displayName: listId,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setItems([]);
        setDisplayName(listId);
        
        // Trigger sync which will properly create the list in both places
        syncAfterLocalUpdate(listId).catch(error => {
          console.error('Error syncing with database:', error);
        });
      }
    } catch (error) {
      console.error('Error in load effect:', error);
    }
  }, [listId]);

  // Save items to localStorage and sync with database whenever items or displayName changes
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(APP_STORAGE_KEY);
      let appData: AppData = savedData ? JSON.parse(savedData) : { lists: {} };
      
      // Update the list in local storage
      const existingList = appData.lists[listId];
      appData.lists[listId] = {
        id: existingList?.id || generateUUID(),
        handle: listId,
        displayName: displayName,
        items: items,
        createdAt: existingList?.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      console.log('About to save data:', {
        key: APP_STORAGE_KEY,
        data: appData
      });
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appData));
      
      // Verify the save
      const verifyData = localStorage.getItem(APP_STORAGE_KEY);
      console.log('Verified saved data:', verifyData);

      // Sync with database
      syncAfterLocalUpdate(listId).catch(error => {
        console.error('Error syncing with database:', error);
      });
    } catch (error) {
      console.error('Error in save effect:', error);
    }
  }, [items, displayName, listId]);

  const handleAddItem = (newItem: Omit<FurnitureItem, 'id' | 'status'>) => {
    const item: FurnitureItem = {
      ...newItem,
      id: generateUUID(),
      status: 'pending' as ItemStatus,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setItems(prev => [item, ...prev]);
  };

  const handleUpdateItem = (itemId: string, updates: Partial<FurnitureItem>) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, ...updates, updatedAt: new Date() } : item
      )
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Filter out deleted items first, then categorize the remaining items
  const activeItems = items.filter(item => item.status !== 'deleted');
  const pendingItems = activeItems.filter(item => item.status === 'pending');
  const orderedItems = activeItems.filter(item => item.status === 'ordered');
  const receivedItems = activeItems.filter(item => item.status === 'received');

  // Update the saveItems function to trigger onContentUpdate
  const saveItems = (newItems: FurnitureItem[]) => {
    try {
      const savedData = localStorage.getItem(APP_STORAGE_KEY);
      let appData: AppData = savedData ? JSON.parse(savedData) : { lists: {} };
      
      appData.lists[listId] = {
        ...appData.lists[listId],
        items: newItems
      };
      
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appData));
      setItems(newItems);
      onContentUpdate();
    } catch (error) {
      console.error('Error saving items:', error);
    }
  };

  // Update the handleHeaderUpdate function to trigger onHeaderUpdate
  const handleDisplayNameUpdate = (newDisplayName: string) => {
    try {
      const savedData = localStorage.getItem(APP_STORAGE_KEY);
      let appData: AppData = savedData ? JSON.parse(savedData) : { lists: {} };
      
      appData.lists[listId] = {
        ...appData.lists[listId],
        displayName: newDisplayName
      };
      
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appData));
      setDisplayName(newDisplayName);
      onHeaderUpdate(newDisplayName);
    } catch (error) {
      console.error('Error updating display name:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-primary-foreground hover:bg-primary-foreground/20 p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{displayName}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditDisplayNameOpen(true)}
                className="text-primary-foreground hover:bg-primary-foreground/20 p-1"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-primary-foreground/80 text-sm">Code: {listId}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            size="lg"
          >
            <Plus className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => setIsPriceChartOpen(true)}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            size="lg"
          >
            <Euro className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pending" className="text-base">
              Pending ({pendingItems.length})
            </TabsTrigger>
            <TabsTrigger value="ordered" className="text-base">
              Ordered ({orderedItems.length + receivedItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3">
            {pendingItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8" />
                </div>
                <p className="text-lg font-medium">No pending items</p>
                <p className="text-sm">Add your first furniture item to get started</p>
              </div>
            ) : (
              pendingItems.map(item => (
                <ListItem
                  key={item.id}
                  item={item}
                  onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                  onDelete={() => handleDeleteItem(item.id)}
                  isPending={true}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="ordered" className="space-y-3">
            {orderedItems.length === 0 && receivedItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8" />
                </div>
                <p className="text-lg font-medium">No ordered items</p>
                <p className="text-sm">Items will appear here when you order them</p>
              </div>
            ) : (
              <>
                {/* Ordered items first */}
                {orderedItems.map(item => (
                  <ListItem
                    key={item.id}
                    item={item}
                    onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                    onDelete={() => handleDeleteItem(item.id)}
                    isPending={false}
                  />
                ))}
                {/* Received items last */}
                {receivedItems.map(item => (
                  <ListItem
                    key={item.id}
                    item={item}
                    onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                    onDelete={() => handleDeleteItem(item.id)}
                    isPending={false}
                  />
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddItem={handleAddItem}
      />

      <EditDisplayNameDialog
        open={isEditDisplayNameOpen}
        onOpenChange={setIsEditDisplayNameOpen}
        currentDisplayName={displayName}
        onUpdateDisplayName={handleDisplayNameUpdate}
      />

      <PriceChartDialog
        open={isPriceChartOpen}
        onOpenChange={setIsPriceChartOpen}
        items={items}
      />
    </div>
  );
}