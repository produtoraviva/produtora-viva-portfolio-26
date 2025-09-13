import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Video, Eye, BarChart3, TrendingUp, Grid3X3, RefreshCw } from 'lucide-react';

interface PortfolioStats {
  totalItems: number;
  publishedItems: number;
  draftItems: number;
  photoCount: number;
  videoCount: number;
  featuredCount: number;
  homepageFeaturedCount: number;
  categoriesCount: number;
  subcategoriesCount: number;
}

interface CategoryStats {
  name: string;
  count: number;
}

export function PortfolioVisualizer() {
  const [stats, setStats] = useState<PortfolioStats>({
    totalItems: 0,
    publishedItems: 0,
    draftItems: 0,
    photoCount: 0,
    videoCount: 0,
    featuredCount: 0,
    homepageFeaturedCount: 0,
    categoriesCount: 0,
    subcategoriesCount: 0
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      
      // Load portfolio items stats
      const { data: items, error: itemsError } = await supabase
        .from('portfolio_items')
        .select('*');

      if (itemsError) throw itemsError;

      // Load categories stats
      const { data: categories, error: categoriesError } = await supabase
        .from('portfolio_categories')
        .select('*')
        .eq('is_active', true);

      if (categoriesError) throw categoriesError;

      // Load subcategories stats
      const { data: subcategories, error: subcategoriesError } = await supabase
        .from('portfolio_subcategories')
        .select('*')
        .eq('is_active', true);

      if (subcategoriesError) throw subcategoriesError;

      // Calculate stats
      const portfolioStats: PortfolioStats = {
        totalItems: items?.length || 0,
        publishedItems: items?.filter(item => item.publish_status === 'published').length || 0,
        draftItems: items?.filter(item => item.publish_status === 'draft').length || 0,
        photoCount: items?.filter(item => item.media_type === 'photo').length || 0,
        videoCount: items?.filter(item => item.media_type === 'video').length || 0,
        featuredCount: items?.filter(item => item.is_featured).length || 0,
        homepageFeaturedCount: items?.filter(item => item.homepage_featured).length || 0,
        categoriesCount: categories?.length || 0,
        subcategoriesCount: subcategories?.length || 0
      };

      // Calculate category distribution
      const categoryMap = new Map();
      categories?.forEach(cat => {
        categoryMap.set(cat.id, cat.name);
      });

      const categoryDistribution = new Map();
      items?.forEach(item => {
        if (item.category && item.publish_status === 'published') {
          const categoryName = categoryMap.get(item.category) || 'Sem categoria';
          categoryDistribution.set(categoryName, (categoryDistribution.get(categoryName) || 0) + 1);
        }
      });

      const categoryStatsArray: CategoryStats[] = Array.from(categoryDistribution.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setStats(portfolioStats);
      setCategoryStats(categoryStatsArray);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Carregando estatísticas...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Visualização do Portfólio</h2>
          <p className="text-muted-foreground">Estatísticas e insights do seu portfólio</p>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Grid3X3 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Itens</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Publicados</p>
                <p className="text-2xl font-bold text-green-500">{stats.publishedItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Camera className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Fotos</p>
                <p className="text-2xl font-bold text-blue-500">{stats.photoCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Video className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Vídeos</p>
                <p className="text-2xl font-bold text-purple-500">{stats.videoCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Distribuição por Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Publicados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{stats.publishedItems}</span>
                  <Badge variant="secondary">
                    {stats.totalItems > 0 ? Math.round((stats.publishedItems / stats.totalItems) * 100) : 0}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Rascunhos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{stats.draftItems}</span>
                  <Badge variant="secondary">
                    {stats.totalItems > 0 ? Math.round((stats.draftItems / stats.totalItems) * 100) : 0}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Em Destaque</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{stats.featuredCount}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>Destaque Homepage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{stats.homepageFeaturedCount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Distribuição por Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryStats.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma categoria com itens publicados.</p>
              ) : (
                categoryStats.slice(0, 6).map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: `hsl(${(index * 60) % 360}, 70%, 50%)`
                        }}
                      ></div>
                      <span className="text-sm truncate">{category.name}</span>
                    </div>
                    <Badge variant="outline">{category.count}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.categoriesCount}</p>
              <p className="text-sm text-muted-foreground">Categorias Ativas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.subcategoriesCount}</p>
              <p className="text-sm text-muted-foreground">Subcategorias Ativas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {stats.totalItems > 0 ? Math.round((stats.publishedItems / stats.totalItems) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Taxa de Publicação</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}