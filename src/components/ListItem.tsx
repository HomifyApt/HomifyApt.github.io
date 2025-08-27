import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EditItemDialog } from "./EditItemDialog";
import { ExternalLink, Trash2, Check, Package } from "lucide-react";
import { FurnitureItem } from "../types/furniture";

interface ListItemProps {
  item: FurnitureItem;
  onUpdate: (updates: Partial<FurnitureItem>) => void;
  onDelete: () => void;
  isPending: boolean;
}

export function ListItem({ item, onUpdate, onDelete, isPending }: ListItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [swipeAction, setSwipeAction] = useState<'none' | 'right' | 'left'>('none');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'status' | null>(null);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const longPressTimer = useRef<NodeJS.Timeout>();

  const getWebsiteDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    isDragging.current = false;
    
    // Long press for edit
    longPressTimer.current = setTimeout(() => {
      if (!isDragging.current) {
        setIsEditOpen(true);
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!cardRef.current) return;
    
    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    
    if (Math.abs(deltaX) > 10) {
      isDragging.current = true;
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    }

    if (isDragging.current) {
      const maxSwipe = 100;
      const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
      cardRef.current.style.transform = `translateX(${clampedDelta}px)`;
      
      if (clampedDelta > 50) {
        cardRef.current.style.backgroundColor = 'hsl(var(--success) / 0.1)';
      } else if (clampedDelta < -50) {
        cardRef.current.style.backgroundColor = 'hsl(var(--destructive) / 0.1)';
      } else {
        cardRef.current.style.backgroundColor = '';
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (!cardRef.current || !isDragging.current) return;

    const deltaX = currentX.current - startX.current;
    
    // Reset transform
    cardRef.current.style.transform = '';
    cardRef.current.style.backgroundColor = '';
    
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Right swipe - change status
        setSwipeAction('right');
        setConfirmAction('status');
        setShowConfirmDialog(true);
      } else {
        // Left swipe - delete
        setSwipeAction('left');
        setConfirmAction('delete');
        setShowConfirmDialog(true);
      }
    }
    
    isDragging.current = false;
  };

  const handleConfirmAction = () => {
    if (confirmAction === 'delete') {
      onDelete();
    } else if (confirmAction === 'status') {
      if (isPending) {
        onUpdate({ status: 'ordered' });
      } else if (item.status === 'ordered') {
        onUpdate({ status: 'received' });
      }
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
    setSwipeAction('none');
  };

  const getActionText = () => {
    if (confirmAction === 'delete') return 'delete this item';
    if (isPending) return 'mark this item as ordered';
    return 'mark this item as received';
  };

  return (
    <>
      <Card
        ref={cardRef}
        className="p-4 cursor-pointer touch-target border-l-4 border-l-transparent hover:border-l-primary/30 transition-all duration-200"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground text-base leading-tight">
                {item.title}
              </h3>
              {item.status === 'received' && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <Package className="w-3 h-3 mr-1" />
                  Received
                </Badge>
              )}
              {item.status === 'ordered' && (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  <Check className="w-3 h-3 mr-1" />
                  Ordered
                </Badge>
              )}
            </div>
            
            {item.url && (
              <div className="flex items-center gap-1 mb-2">
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm text-accent-foreground bg-accent/20 px-2 py-1 rounded">
                  {getWebsiteDomain(item.url)}
                </span>
              </div>
            )}
          </div>
          
          {item.price && (
            <div className="text-right">
              <span className="text-lg font-semibold text-primary">
                €{item.price}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {getActionText()}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {confirmAction === 'delete' ? 'Delete' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <EditItemDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        item={item}
        onUpdateItem={onUpdate}
      />
    </>
  );
}