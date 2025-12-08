import { useState } from 'react';
import { 
  Menu, 
  X, 
  Image, 
  Upload, 
  Folder, 
  Home, 
  BarChart3, 
  MessageSquare, 
  Briefcase, 
  HelpCircle, 
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole?: 'admin' | 'collaborator';
}

const menuItems = [
  { id: 'portfolio', label: 'Portfólio', icon: Image },
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'categories', label: 'Categorias', icon: Folder },
  { id: 'homepage-bg', label: 'Fundo Home', icon: Home },
  { id: 'visualizer', label: 'Métricas', icon: BarChart3 },
  { id: 'testimonials', label: 'Depoimentos', icon: MessageSquare },
  { id: 'services', label: 'Serviços', icon: Briefcase },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
];

const adminOnlyItems = [
  { id: 'accounts', label: 'Contas', icon: Users },
];

export function AdminSidebar({ activeTab, onTabChange, userRole }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const allItems = userRole === 'admin' 
    ? [...menuItems, ...adminOnlyItems] 
    : menuItems;

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-20 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-[73px] left-0 h-[calc(100vh-73px)] bg-card border-r border-border z-30 transition-all duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          isCollapsed ? "lg:w-16" : "lg:w-56"
        )}
      >
        {/* Collapse Toggle (Desktop only) */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-4 h-6 w-6 rounded-full border bg-card hidden lg:flex"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        {/* Menu Items */}
        <nav className="p-4 space-y-1">
          {allItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}