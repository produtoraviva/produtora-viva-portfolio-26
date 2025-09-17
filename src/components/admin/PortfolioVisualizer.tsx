import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Camera, Video, Eye, BarChart3, TrendingUp, Grid3X3, RefreshCw, 
  Star, Home, Calendar, Users, Clock, CheckCircle, AlertCircle,
  FileText, Database, Activity, Zap
} from 'lucide-react';

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
  avgItemsPerCategory: number;
  recentUploads: number;
  totalFileSize: number;
  avgRating: number;
  testimonialsCount: number;
  faqCount: number;
}

interface CategoryStats {
  name: string;
  count: number;
  percentage: number;
}

interface TimeStats {
  thisMonth: number;
  lastMonth: number;
  growth: number;
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
    subcategoriesCount: 0,
    avgItemsPerCategory: 0,
    recentUploads: 0,
    totalFileSize: 0,
    avgRating: 0,
    testimonialsCount: 0,
    faqCount: 0
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [timeStats, setTimeStats] = useState<TimeStats>({
    thisMonth: 0,
    lastMonth: 0,
    growth: 0
  });
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

      // Load testimonials stats
      const { data: testimonials, error: testimonialsError } = await supabase
        .from('testimonials')
        .select('rating, is_active');

      if (testimonialsError) throw testimonialsError;

      // Load FAQ stats
      const { data: faqs, error: faqsError } = await supabase
        .from('faq_items')
        .select('is_active');

      if (faqsError) throw faqsError;

      // Calculate recent uploads (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentItems = items?.filter(item => 
        new Date(item.created_at) >= thirtyDaysAgo
      ) || [];

      // Calculate time-based stats
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const thisMonthItems = items?.filter(item => 
        new Date(item.created_at) >= thisMonth
      ).length || 0;
      
      const lastMonthItems = items?.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= lastMonth && itemDate < thisMonth;
      }).length || 0;

      const growth = lastMonthItems > 0 ? 
        ((thisMonthItems - lastMonthItems) / lastMonthItems) * 100 : 0;

      // Calculate file sizes
      const totalFileSize = items?.reduce((total, item) => {
        return total + (item.file_size || 0);
      }, 0) || 0;

      // Calculate average rating
      const activeTestimonials = testimonials?.filter(t => t.is_active) || [];
      const avgRating = activeTestimonials.length > 0 ?
        activeTestimonials.reduce((sum, t) => sum + t.rating, 0) / activeTestimonials.length : 0;

      // Calculate portfolio stats
      const portfolioStats: PortfolioStats = {
        totalItems: items?.length || 0,
        publishedItems: items?.filter(item => item.publish_status === 'published').length || 0,
        draftItems: items?.filter(item => item.publish_status === 'draft').length || 0,
        photoCount: items?.filter(item => item.media_type === 'photo').length || 0,
        videoCount: items?.filter(item => item.media_type === 'video').length || 0,
        featuredCount: items?.filter(item => item.is_featured).length || 0,
        homepageFeaturedCount: items?.filter(item => item.homepage_featured).length || 0,
        categoriesCount: categories?.length || 0,
        subcategoriesCount: subcategories?.length || 0,
        avgItemsPerCategory: categories?.length > 0 ? 
          (items?.filter(item => item.publish_status === 'published').length || 0) / categories.length : 0,
        recentUploads: recentItems.length,
        totalFileSize: Math.round(totalFileSize / (1024 * 1024)), // Convert to MB
        avgRating: Math.round(avgRating * 10) / 10,
        testimonialsCount: activeTestimonials.length,
        faqCount: faqs?.filter(f => f.is_active).length || 0
      };

      // Calculate category distribution
      const categoryMap = new Map();
      categories?.forEach(cat => {
        categoryMap.set(cat.id, cat.name);
      });

      const categoryDistribution = new Map();
      const publishedItems = items?.filter(item => item.publish_status === 'published') || [];
      publishedItems.forEach(item => {
        if (item.category) {
          const categoryName = categoryMap.get(item.category) || 'Sem categoria';
          categoryDistribution.set(categoryName, (categoryDistribution.get(categoryName) || 0) + 1);
        }
      });

      const totalPublished = publishedItems.length;
      const categoryStatsArray: CategoryStats[] = Array.from(categoryDistribution.entries())
        .map(([name, count]) => ({ 
          name, 
          count,
          percentage: totalPublished > 0 ? Math.round((count / totalPublished) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      setStats(portfolioStats);
      setCategoryStats(categoryStatsArray);
      setTimeStats({
        thisMonth: thisMonthItems,
        lastMonth: lastMonthItems,
        growth: Math.round(growth)
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatFileSize = (mb: number) => {
    if (mb < 1024) return `${mb} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

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
          <h2 className="text-2xl font-bold">Métricas do Portfólio</h2>
          <p className="text-muted-foreground">Dashboard completo com estatísticas e insights detalhados</p>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Grid3X3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Itens</p>
                <p className="text-2xl font-bold text-blue-500">{stats.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Publicados</p>
                <p className="text-2xl font-bold text-green-500">{stats.publishedItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Fotos</p>
                <p className="text-2xl font-bold text-purple-500">{stats.photoCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Video className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Vídeos</p>
                <p className="text-2xl font-bold text-red-500">{stats.videoCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Quality Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Star className="h-4 w-4 text-amber-500" />
              <span>Qualidade do Conteúdo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Em Destaque</span>
              <Badge variant="outline">{stats.featuredCount}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Destaque Homepage</span>
              <Badge variant="outline">{stats.homepageFeaturedCount}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Taxa de Publicação</span>
              <Badge variant="secondary">
                {stats.totalItems > 0 ? Math.round((stats.publishedItems / stats.totalItems) * 100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Activity className="h-4 w-4 text-blue-500" />
              <span>Atividade Recente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Últimos 30 dias</span>
              <Badge variant="outline">{stats.recentUploads}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Este mês</span>
              <Badge variant="outline">{timeStats.thisMonth}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Crescimento</span>
              <Badge variant={timeStats.growth >= 0 ? "default" : "secondary"}>
                {timeStats.growth >= 0 ? '+' : ''}{timeStats.growth}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Database className="h-4 w-4 text-green-500" />
              <span>Armazenamento</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Espaço Total</span>
              <Badge variant="outline">{formatFileSize(stats.totalFileSize)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Média por Item</span>
              <Badge variant="outline">
                {stats.totalItems > 0 ? 
                  formatFileSize(Math.round(stats.totalFileSize / stats.totalItems)) : '0 MB'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Eficiência</span>
              <Badge variant="secondary">
                {stats.totalItems > 0 ? Math.round(stats.publishedItems / stats.totalItems * 100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span>Distribuição por Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma categoria com itens publicados.</p>
              ) : (
                categoryStats.slice(0, 8).map((category, index) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: `hsl(${(index * 45) % 360}, 65%, 55%)`
                          }}
                        ></div>
                        <span className="text-sm font-medium truncate">{category.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">{category.count}</Badge>
                        <Badge variant="secondary" className="text-xs">{category.percentage}%</Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${category.percentage}%`,
                          backgroundColor: `hsl(${(index * 45) % 360}, 65%, 55%)`
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Health */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Saúde do Conteúdo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Itens Publicados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-green-600">{stats.publishedItems}</span>
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    {stats.totalItems > 0 ? Math.round((stats.publishedItems / stats.totalItems) * 100) : 0}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Rascunhos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-yellow-600">{stats.draftItems}</span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                    {stats.totalItems > 0 ? Math.round((stats.draftItems / stats.totalItems) * 100) : 0}%
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Média por Categoria</span>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                  {Math.round(stats.avgItemsPerCategory * 10) / 10}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System & Engagement Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <span>Estrutura do Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Categorias Ativas</span>
              <Badge variant="outline">{stats.categoriesCount}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Subcategorias</span>
              <Badge variant="outline">{stats.subcategoriesCount}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cobertura</span>
              <Badge variant="secondary">
                {stats.categoriesCount > 0 ? 
                  Math.round((categoryStats.length / stats.categoriesCount) * 100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Users className="h-4 w-4 text-pink-500" />
              <span>Engajamento</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Depoimentos</span>
              <Badge variant="outline">{stats.testimonialsCount}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Avaliação Média</span>
              <div className="flex items-center space-x-1">
                <Badge variant="secondary">{stats.avgRating}</Badge>
                <Star className="h-3 w-3 fill-current text-amber-500" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">FAQs Ativas</span>
              <Badge variant="outline">{stats.faqCount}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Zap className="h-4 w-4 text-orange-500" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Velocidade de Pub.</span>
              <Badge variant="outline">
                {stats.recentUploads > 0 ? 
                  `${Math.round(stats.recentUploads / 30 * 7)}/sem` : '0/sem'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Consistência</span>
              <Badge variant={timeStats.growth >= 0 ? "default" : "secondary"}>
                {timeStats.growth >= 0 ? 'Crescendo' : 'Estável'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Otimização</span>
              <Badge variant="secondary">
                {stats.totalItems > 0 && stats.featuredCount > 0 ? 
                  Math.round((stats.featuredCount / stats.totalItems) * 100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}