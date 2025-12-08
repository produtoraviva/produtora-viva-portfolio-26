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
  ChevronRight,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole?: 'admin' | 'collaborator';
}

const menuItems = [
  { id: 'portfolio', label: 'Portfólio', icon: Image, description: 'Gerenciar itens' },
  { id: 'upload', label: 'Upload', icon: Upload, description: 'Enviar mídia' },
  { id: 'categories', label: 'Categorias', icon: Folder, description: 'Organizar' },
  { id: 'homepage-bg', label: 'Fundo Home', icon: Home, description: 'Background' },
  { id: 'visualizer', label: 'Métricas', icon: BarChart3, description: 'Estatísticas' },
  { id: 'testimonials', label: 'Depoimentos', icon: MessageSquare, description: 'Avaliações' },
  { id: 'services', label: 'Serviços', icon: Briefcase, description: 'Ofertas' },
  { id: 'faq', label: 'FAQ', icon: HelpCircle, description: 'Perguntas' },
];

const adminOnlyItems = [
  { id: 'accounts', label: 'Contas', icon: Users, description: 'Usuários' },
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
        className="fixed top-[72px] left-4 z-50 lg:hidden shadow-lg bg-card"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-[57px] left-0 h-[calc(100vh-57px)] bg-card border-r border-border z-40 transition-all duration-300 shadow-sm",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          isCollapsed ? "lg:w-16" : "lg:w-56"
        )}
      >
        {/* Collapse Toggle (Desktop only) */}
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 top-6 h-6 w-6 rounded-full border shadow-md bg-card hidden lg:flex z-50"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        {/* Menu Items */}
        <nav className="p-3 space-y-1 overflow-y-auto h-full">
          {allItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                  isCollapsed && "lg:justify-center lg:px-2"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn(
                  "flex-shrink-0 transition-transform",
                  isActive ? "h-4.5 w-4.5" : "h-4 w-4"
                )} />
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <span className="font-medium">{item.label}</span>
                    {!isActive && (
                      <p className="text-xs text-muted-foreground/70 hidden lg:block">
                        {item.description}
                      </p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}