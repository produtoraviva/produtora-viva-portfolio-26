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
  History
} from 'lucide-react';
import { PortfolioManager } from '@/components/admin/PortfolioManager';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { EditHistory } from '@/components/admin/EditHistory';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { PortfolioVisualizer } from '@/components/admin/PortfolioVisualizer';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  media_type: 'photo' | 'video';
  file_url: string;
  thumbnail_url?: string;
  category: 'casamento' | 'aniversario' | 'corporativo' | 'familia';
  subcategory?: string;
  publish_status: 'draft' | 'published' | 'hidden';
  is_featured: boolean;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'hidden': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Rascunho';
      case 'hidden': return 'Oculto';
      default: return status;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'casamento': return 'Casamento';
      case 'aniversario': return 'Aniversário';
      case 'corporativo': return 'Corporativo';
      case 'familia': return 'Família';
      default: return category;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Bem-vindo, {user?.full_name}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="portfolio">Gerenciar Portfólio</TabsTrigger>
            <TabsTrigger value="upload">Upload de Mídia</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="visualizer">Visualização</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros e Busca</CardTitle>
                <CardDescription>
                  Use os filtros abaixo para encontrar itens específicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Input
                      placeholder="Buscar por título..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="casamento">Casamento</SelectItem>
                      <SelectItem value="aniversario">Aniversário</SelectItem>
                      <SelectItem value="corporativo">Corporativo</SelectItem>
                      <SelectItem value="familia">Família</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="hidden">Oculto</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterMediaType} onValueChange={setFilterMediaType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="photo">Foto</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

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

          <TabsContent value="visualizer">
            <PortfolioVisualizer />
          </TabsContent>

          <TabsContent value="history">
            <EditHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}