import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListItem } from "./ListItem";
import { AddItemDialog } from "./AddItemDialog";
import { EditHeaderDialog } from "./EditHeaderDialog";
import { Plus, Edit3, ArrowLeft } from "lucide-react";
import { FurnitureItem, ItemStatus } from "../types/furniture";

interface ListPageProps {
  listId: string;
  onBack: () => void;
}

export function ListPage({ listId, onBack }: ListPageProps) {
  const [displayHeader, setDisplayHeader] = useState(listId);
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);

  // Load items from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem(`furnilist-${listId}`);
    const savedHeader = localStorage.getItem(`furnilist-header-${listId}`);
    
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
    if (savedHeader) {
      setDisplayHeader(savedHeader);
    }
  }, [listId]);

  // Save items to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(`furnilist-${listId}`, JSON.stringify(items));
  }, [items, listId]);

  // Save header to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`furnilist-header-${listId}`, displayHeader);
  }, [displayHeader, listId]);

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

        {/* Add Item Button */}
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Furniture Item
        </Button>
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
        onUpdateHeader={setDisplayHeader}
      />
    </div>
  );
}