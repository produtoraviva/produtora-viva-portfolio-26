import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Edit } from 'lucide-react';
import { PortfolioManager } from '@/components/admin/PortfolioManager';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { HomepageBackgroundManager } from '@/components/admin/HomepageBackgroundManager';
import { PortfolioVisualizer } from '@/components/admin/PortfolioVisualizer';
import { AccountManager } from '@/components/admin/AccountManager';
import { FAQManager } from '@/components/admin/FAQManager';
import { TestimonialsManager } from '@/components/admin/TestimonialsManager';
import { TestimonialsMetrics } from '@/components/admin/TestimonialsMetrics';
import ServicesManager from '@/components/admin/ServicesManager';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { cn } from '@/lib/utils';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  media_type: 'photo' | 'video';
  file_url: string;
  thumbnail_url?: string;
  category: string;
  subcategory?: string;
  publish_status: 'draft' | 'published' | 'hidden';
  is_featured: boolean;
  homepage_featured: boolean;
  display_order: number;
  location?: string;
  date_taken?: string;
  file_size?: number;
  dimensions?: { width: number; height: number } | null;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const { user, logout, isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('portfolio');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    loadPortfolioItems();
  }, [isAuthenticated, navigate]);

  const loadPortfolioItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw error;
      }

      const items = (data || []).map(item => ({
        ...item,
        media_type: item.media_type as 'photo' | 'video',
        category: item.category as string,
        publish_status: item.publish_status as 'draft' | 'published' | 'hidden',
        dimensions: item.dimensions as { width: number; height: number } | null
      }));
      
      setPortfolioItems(items);
      setFilteredItems(items);
    } catch (error) {
      console.error('Error loading portfolio items:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar itens do portfólio.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'portfolio':
        return (
          <PortfolioManager
            items={filteredItems}
            viewMode={viewMode}
            onItemsChange={loadPortfolioItems}
          />
        );
      case 'upload':
        return <MediaUploader onUploadComplete={loadPortfolioItems} />;
      case 'categories':
        return <CategoryManager />;
      case 'homepage-bg':
        return <HomepageBackgroundManager />;
      case 'visualizer':
        return <PortfolioVisualizer />;
      case 'testimonials':
        return (
          <div className="space-y-6">
            <TestimonialsMetrics />
            <TestimonialsManager />
          </div>
        );
      case 'services':
        return <ServicesManager />;
      case 'faq':
        return <FAQManager />;
      case 'accounts':
        return user?.role === 'admin' ? <AccountManager /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 md:space-y-2 pl-12 lg:pl-0">
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
                <div className="p-2 md:p-3 bg-primary/10 rounded-xl">
                  <Edit className="h-5 w-5 md:h-8 md:w-8 text-primary" />
                </div>
                <span className="hidden sm:inline">Painel Administrativo</span>
                <span className="sm:hidden">Admin</span>
              </h1>
              <p className="text-sm md:text-lg text-muted-foreground">
                Olá, <span className="font-semibold text-foreground">{user?.full_name}</span>
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'portfolio') {
            loadPortfolioItems();
          }
        }}
        userRole={user?.role}
      />

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 p-4 md:p-8",
        "lg:ml-56" // Match sidebar width
      )}>
        {renderContent()}
      </main>
    </div>
  );
}
