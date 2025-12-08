import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EditMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  onSave: (newTitle: string) => void;
  mediaType?: 'photo' | 'video';
}

export function EditMediaDialog({
  open,
  onOpenChange,
  initialTitle,
  onSave,
  mediaType = 'photo'
}: EditMediaDialogProps) {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle, open]);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim());
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mediaType === 'photo' ? '📷' : '🎥'} Editar Mídia
          </DialogTitle>
          <DialogDescription>
            Atualize as informações desta mídia
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="media-title">Título</Label>
            <Input
              id="media-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite o título..."
              autoFocus
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
