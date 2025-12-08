import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown, X, Camera, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  type?: string;
}

interface CategoryMultiSelectProps {
  categories: Category[];
  selectedCategories: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function CategoryMultiSelect({
  categories,
  selectedCategories,
  onChange,
  placeholder = 'Selecionar categorias...'
}: CategoryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const photoCategories = categories.filter(c => c.type === 'photo');
  const videoCategories = categories.filter(c => c.type === 'video');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onChange([...selectedCategories, categoryId]);
    }
  };

  const handleSelectAll = (type: 'photo' | 'video') => {
    const typeCategories = type === 'photo' ? photoCategories : videoCategories;
    const typeIds = typeCategories.map(c => c.id);
    const allSelected = typeIds.every(id => selectedCategories.includes(id));
    
    if (allSelected) {
      onChange(selectedCategories.filter(id => !typeIds.includes(id)));
    } else {
      const newSelected = [...new Set([...selectedCategories, ...typeIds])];
      onChange(newSelected);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const getSelectedText = () => {
    if (selectedCategories.length === 0) return placeholder;
    if (selectedCategories.length === 1) {
      const cat = categories.find(c => c.id === selectedCategories[0]);
      return cat?.name || '1 selecionada';
    }
    return `${selectedCategories.length} categorias`;
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full h-10 justify-between font-normal"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{getSelectedText()}</span>
        <div className="flex items-center gap-1">
          {selectedCategories.length > 0 && (
            <X
              className="h-4 w-4 opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
            />
          )}
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </div>
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 shadow-lg animate-in fade-in-0 zoom-in-95">
          <div className="max-h-[300px] overflow-y-auto space-y-4">
            {/* Fotos */}
            {photoCategories.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Camera className="h-4 w-4" />
                    Fotos
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleSelectAll('photo')}
                  >
                    {photoCategories.every(c => selectedCategories.includes(c.id)) ? 'Desmarcar' : 'Marcar'} todas
                  </Button>
                </div>
                <div className="space-y-1 pl-1">
                  {photoCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer"
                      onClick={() => handleToggle(category.id)}
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleToggle(category.id)}
                      />
                      <Label className="cursor-pointer text-sm font-normal flex-1">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vídeos */}
            {videoCategories.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Video className="h-4 w-4" />
                    Vídeos
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleSelectAll('video')}
                  >
                    {videoCategories.every(c => selectedCategories.includes(c.id)) ? 'Desmarcar' : 'Marcar'} todas
                  </Button>
                </div>
                <div className="space-y-1 pl-1">
                  {videoCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer"
                      onClick={() => handleToggle(category.id)}
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleToggle(category.id)}
                      />
                      <Label className="cursor-pointer text-sm font-normal flex-1">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
