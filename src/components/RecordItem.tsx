import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EditItemDialog } from "./EditItemDialog";
import { ExternalLink, Trash2, Check, Package } from "lucide-react";
import { FurnitureRecord } from "../types/furniture";

interface RecordItemProps {
  record: FurnitureRecord;
  onUpdate: (updates: Partial<FurnitureRecord>) => void;
  onDelete: () => void;
  isPending: boolean;
}

export function RecordItem({ record, onUpdate, onDelete, isPending }: RecordItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [swipeAction, setSwipeAction] = useState<'none' | 'right' | 'left'>('none');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'status' | 'revert' | null>(null);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const isMouseDown = useRef(false);

  const getWebsiteDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  const handleDragStart = (clientX: number) => {
    startX.current = clientX;
    currentX.current = clientX;
    isDragging.current = false;
    
    // Long press for edit
    longPressTimer.current = setTimeout(() => {
      if (!isDragging.current) {
        setIsEditOpen(true);
      }
    }, 500);
  };

  const handleDragMove = (clientX: number) => {
    if (!cardRef.current) return;
    
    currentX.current = clientX;
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

  const handleDragEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (!cardRef.current || !isDragging.current) return;

    const deltaX = currentX.current - startX.current;
    
    // Reset transform
    cardRef.current.style.transform = '';
    cardRef.current.style.backgroundColor = '';
    
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0 && record.status !== 'received') {
        // Right swipe - change status to next state
        // pending -> ordered
        // ordered -> received
        // received -> disabled
        setSwipeAction('right');
        setConfirmAction('status');
        setShowConfirmDialog(true);
      } else if (deltaX < 0) {
        // Left swipe
        // pending -> deleted
        // ordered -> pending
        // received -> ordered
        setSwipeAction('left');
        setConfirmAction('status');
        setShowConfirmDialog(true);
      }
    }
    
    isDragging.current = false;
    isMouseDown.current = false;
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDown.current = true;
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current) return;
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isMouseDown.current) return;
    handleDragEnd();
  };

  // Handle mouse leaving the element
  const handleMouseLeave = () => {
    if (isMouseDown.current) {
      handleDragEnd();
    }
  };

  useEffect(() => {
    // Add global mouse up handler to handle cases where mouse is released outside the element
    const handleGlobalMouseUp = () => {
      if (isMouseDown.current) {
        handleDragEnd();
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const handleConfirmAction = () => {
    if (confirmAction === 'status') {
      if (swipeAction === 'right') {
        // Right swipe transitions
        if (record.status === 'pending') {
          onUpdate({ status: 'ordered' });
        } else if (record.status === 'ordered') {
          onUpdate({ status: 'received' });
        }
      } else if (swipeAction === 'left') {
        // Left swipe transitions
        if (record.status === 'pending') {
          onUpdate({ status: 'deleted' });
        } else if (record.status === 'ordered') {
          onUpdate({ status: 'pending' });
        } else if (record.status === 'received') {
          onUpdate({ status: 'ordered' });
        }
      }
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
    setSwipeAction('none');
  };

  const getActionText = () => {
    if (swipeAction === 'right') {
      if (record.status === 'pending') return 'mark this record as ordered';
      if (record.status === 'ordered') return 'mark this record as received';
    } else if (swipeAction === 'left') {
      if (record.status === 'pending') return 'delete this record';
      if (record.status === 'ordered') return 'change this record back to pending';
      if (record.status === 'received') return 'change this record back to ordered';
    }
    return 'update this record';
  };

  return (
    <>
      <Card
        ref={cardRef}
        className="p-4 cursor-pointer touch-target border-l-4 border-l-transparent hover:border-l-primary/30 transition-all duration-200"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground text-base leading-tight">
                {record.title}
              </h3>
              {record.status === 'received' && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <Package className="w-3 h-3 mr-1" />
                  Received
                </Badge>
              )}
              {record.status === 'ordered' && (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  <Check className="w-3 h-3 mr-1" />
                  Ordered
                </Badge>
              )}
            </div>
            
            {record.url && (
              <div className="flex items-center gap-1 mb-2">
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm text-accent-foreground bg-accent/20 px-2 py-1 rounded">
                  {getWebsiteDomain(record.url)}
                </span>
              </div>
            )}
          </div>
          
          {record.price && (
            <div className="text-right">
              <span className="text-lg font-semibold text-primary">
                €{record.price}
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
        item={record}
        onUpdateItem={onUpdate}
      />
    </>
  );
}