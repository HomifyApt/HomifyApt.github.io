import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListItem } from "./ListItem";
import { AddItemDialog } from "./AddItemDialog";
import { EditHeaderDialog } from "./EditHeaderDialog";
import { PriceChartDialog } from "./PriceChartDialog";
import { Plus, Edit3, ArrowLeft, Euro } from "lucide-react";
import { FurnitureItem, ItemStatus, AppData, List, APP_STORAGE_KEY } from "../types/furniture";

interface ListPageProps {
  listId: string;
  onBack: () => void;
  onHeaderUpdate: (newHeader: string) => void;
  onContentUpdate: () => void;
}

export function ListPage({ listId, onBack, onHeaderUpdate, onContentUpdate }: ListPageProps) {
  const [displayHeader, setDisplayHeader] = useState(listId);
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
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
        setDisplayHeader(currentList.header);
      } else {
        // Initialize new list
        appData.lists[listId] = {
          id: listId,
          header: listId,
          items: []
        };
        console.log('Created new list. Full data:', appData);
        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appData));
      }
    } catch (error) {
      console.error('Error in load effect:', error);
    }
  }, [listId]);

  // Save items to localStorage whenever items or header changes
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(APP_STORAGE_KEY);
      let appData: AppData = savedData ? JSON.parse(savedData) : { lists: {} };
      
      appData.lists[listId] = {
        id: listId,
        header: displayHeader,
        items: items
      };
      
      console.log('About to save data:', {
        key: APP_STORAGE_KEY,
        data: appData
      });
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appData));
      
      // Verify the save
      const verifyData = localStorage.getItem(APP_STORAGE_KEY);
      console.log('Verified saved data:', verifyData);
    } catch (error) {
      console.error('Error in save effect:', error);
    }
  }, [items, displayHeader, listId]);

  const handleAddItem = (newItem: Omit<FurnitureItem, 'id' | 'status'>) => {
    const item: FurnitureItem = {
      ...newItem,
      id: Date.now().toString(),
      status: 'pending' as ItemStatus,
    };
    setItems(prev => [item, ...prev]);
  };

  const handleUpdateItem = (itemId: string, updates: Partial<FurnitureItem>) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const pendingItems = items.filter(item => item.status === 'pending');
  const orderedItems = items.filter(item => item.status === 'ordered');
  const receivedItems = items.filter(item => item.status === 'received');

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
  const handleHeaderUpdate = (newHeader: string) => {
    try {
      const savedData = localStorage.getItem(APP_STORAGE_KEY);
      let appData: AppData = savedData ? JSON.parse(savedData) : { lists: {} };
      
      appData.lists[listId] = {
        ...appData.lists[listId],
        header: newHeader
      };
      
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appData));
      setDisplayHeader(newHeader);
      onHeaderUpdate(newHeader);
    } catch (error) {
      console.error('Error updating header:', error);
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
              <h1 className="text-xl font-semibold">{displayHeader}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditHeaderOpen(true)}
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

      <EditHeaderDialog
        open={isEditHeaderOpen}
        onOpenChange={setIsEditHeaderOpen}
        currentHeader={displayHeader}
        onUpdateHeader={handleHeaderUpdate}
      />

      <PriceChartDialog
        open={isPriceChartOpen}
        onOpenChange={setIsPriceChartOpen}
        items={items}
      />
    </div>
  );
}