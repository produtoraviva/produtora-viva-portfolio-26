import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Star, MessageSquare, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface Metrics {
  total: number;
  approved: number;
  pending: number;
  averageRating: number;
  byRating: { rating: number; count: number }[];
  recentCount: number;
}

export function TestimonialsMetrics() {
  const [metrics, setMetrics] = useState<Metrics>({
    total: 0,
    approved: 0,
    pending: 0,
    averageRating: 0,
    byRating: [],
    recentCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);

      // Get all testimonials
      const { data: allTestimonials, error: allError } = await supabase
        .from('testimonials')
        .select('*');

      if (allError) throw allError;

      // Get approved testimonials
      const { data: approvedTestimonials, error: approvedError } = await supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'approved');

      if (approvedError) throw approvedError;

      // Get pending testimonials
      const { data: pendingTestimonials, error: pendingError } = await supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Get recent testimonials (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentTestimonials, error: recentError } = await supabase
        .from('testimonials')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (recentError) throw recentError;

      // Calculate average rating
      const totalRating = allTestimonials?.reduce((sum, t) => sum + (t.rating || 0), 0) || 0;
      const avgRating = allTestimonials && allTestimonials.length > 0 
        ? totalRating / allTestimonials.length 
        : 0;

      // Count by rating
      const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: allTestimonials?.filter(t => t.rating === rating).length || 0
      }));

      setMetrics({
        total: allTestimonials?.length || 0,
        approved: approvedTestimonials?.length || 0,
        pending: pendingTestimonials?.length || 0,
        averageRating: avgRating,
        byRating: ratingCounts,
        recentCount: recentTestimonials?.length || 0
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Métricas de Depoimentos</h2>
      
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-3xl font-bold text-foreground">{metrics.total}</p>
            </div>
            <MessageSquare className="w-10 h-10 text-primary/60" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aprovados</p>
              <p className="text-3xl font-bold text-foreground">{metrics.approved}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500/60" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-3xl font-bold text-foreground">{metrics.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500/60" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
              <p className="text-3xl font-bold text-foreground">{metrics.recentCount}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-500/60" />
          </div>
        </Card>
      </div>

      {/* Rating Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Avaliação Média
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold text-primary">
              {metrics.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < Math.round(metrics.averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribuição por Estrelas</h3>
          <div className="space-y-3">
            {metrics.byRating.map(({ rating, count }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-24">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{
                      width: `${metrics.total > 0 ? (count / metrics.total) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
