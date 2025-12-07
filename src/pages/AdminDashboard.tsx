import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  LogOut, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload,
  Filter,
  Grid,
  List,
  RefreshCw
} from 'lucide-react';
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
  
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMediaType, setFilterMediaType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    loadPortfolioItems();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    filterItems();
  }, [searchTerm, filterCategory, filterStatus, filterMediaType, portfolioItems]);

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

      setPortfolioItems((data || []).map(item => ({
        ...item,
        media_type: item.media_type as 'photo' | 'video',
        category: item.category as 'casamento' | 'aniversario' | 'corporativo' | 'familia',
        publish_status: item.publish_status as 'draft' | 'published' | 'hidden',
        dimensions: item.dimensions as { width: number; height: number } | null
      })));
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

  const filterItems = () => {
    let filtered = portfolioItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.publish_status === filterStatus);
    }

    if (filterMediaType !== 'all') {
      filtered = filtered.filter(item => item.media_type === filterMediaType);
    }

    setFilteredItems(filtered);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const tabCount = user?.role === 'admin' ? 9 : 8;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 md:space-y-2">
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-8">
        <Tabs defaultValue="portfolio" className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className={`inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-${tabCount} h-auto md:h-12 mb-6 bg-card border shadow-sm rounded-lg p-1`}>
              <TabsTrigger 
                value="portfolio" 
                onClick={loadPortfolioItems}
                className="text-xs md:text-sm font-medium whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Portfólio
              </TabsTrigger>
              <TabsTrigger 
                value="upload"
                className="text-xs md:text-sm font-medium whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Upload
              </TabsTrigger>
              <TabsTrigger 
                value="categories"
                className="text-xs md:text-sm font-medium whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Categorias
              </TabsTrigger>  
              <TabsTrigger 
                value="homepage-bg"
                className="text-xs md:text-sm font-medium whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Fundo Home
              </TabsTrigger>
              <TabsTrigger 
                value="visualizer"
                className="text-xs md:text-sm font-medium whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Métricas
              </TabsTrigger>
              <TabsTrigger 
                value="testimonials"
                className="text-xs md:text-sm font-medium whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Depoimentos
              </TabsTrigger>
              <TabsTrigger 
                value="services"
                className="text-xs md:text-sm font-medium whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Serviços
              </TabsTrigger>
              <TabsTrigger 
                value="faq"
                className="text-xs md:text-sm font-medium whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                FAQ
              </TabsTrigger>
              {user?.role === 'admin' && (
                <TabsTrigger 
                  value="accounts"
                  className="text-xs md:text-sm font-medium whitespace-nowrap px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Contas
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="portfolio" className="space-y-6">
            {/* Portfolio Manager */}
            <PortfolioManager
              items={filteredItems}
              viewMode={viewMode}
              onItemsChange={loadPortfolioItems}
            />
          </TabsContent>

          <TabsContent value="upload">
            <MediaUploader onUploadComplete={loadPortfolioItems} />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>

          <TabsContent value="homepage-bg">
            <HomepageBackgroundManager />
          </TabsContent>

          <TabsContent value="visualizer">
            <PortfolioVisualizer />
          </TabsContent>

          <TabsContent value="testimonials" className="space-y-6">
            <TestimonialsMetrics />
            <TestimonialsManager />
          </TabsContent>

          <TabsContent value="services">
            <ServicesManager />
          </TabsContent>

          <TabsContent value="faq">
            <FAQManager />
          </TabsContent>

          {user?.role === 'admin' && (
            <TabsContent value="accounts">
              <AccountManager />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
