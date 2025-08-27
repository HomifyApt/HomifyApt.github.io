import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditDisplayNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDisplayName: string;
  onUpdateDisplayName: (newDisplayName: string) => void;
}

export function EditDisplayNameDialog({ 
  open, 
  onOpenChange, 
  currentDisplayName, 
  onUpdateDisplayName 
}: EditDisplayNameDialogProps) {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (open) {
      setDisplayName(currentDisplayName);
    }
  }, [open, currentDisplayName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) return;

    onUpdateDisplayName(displayName.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit List Name</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="e.g., Living Room Furniture"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoFocus
              required
            />
            <p className="text-sm text-muted-foreground">
              This changes only the display name, not the sharing code.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!displayName.trim()}
              className="flex-1 gradient-warm"
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}