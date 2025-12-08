import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FotoFacilCategoriesManager } from '@/components/admin/FotoFacilCategoriesManager';
import { FotoFacilEventsManager } from '@/components/admin/FotoFacilEventsManager';
import { FotoFacilPhotosManager } from '@/components/admin/FotoFacilPhotosManager';
import { FotoFacilSalesManager } from '@/components/admin/FotoFacilSalesManager';
import { FotoFacilBannersManager } from '@/components/admin/FotoFacilBannersManager';
import { FotoFacilCouponsManager } from '@/components/admin/FotoFacilCouponsManager';
import { FotoFacilFooterManager } from '@/components/admin/FotoFacilFooterManager';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Folder, Calendar, Image, ShoppingCart, ImageIcon, Ticket, FileText } from 'lucide-react';

export default function AdminFotoFacil() {
  const { user, logout, isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('categories');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        activeTab="fotofacil" 
        onTabChange={(tab) => {
          if (tab === 'fotofacil') return;
          navigate('/admin');
          setTimeout(() => {
            const event = new CustomEvent('admin-tab-change', { detail: tab });
            window.dispatchEvent(event);
          }, 100);
        }}
        userRole={user?.role}
        onLogout={handleLogout}
      />

      <main className="transition-all duration-300 p-4 md:p-6 lg:p-8 lg:ml-56 pt-20 lg:pt-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">FOTOFÁCIL</h1>
            <p className="text-muted-foreground">Gerencie sua loja de fotos</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-7 w-full max-w-4xl">
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                <span className="hidden sm:inline">Categorias</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Eventos</span>
              </TabsTrigger>
              <TabsTrigger value="photos" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Fotos</span>
              </TabsTrigger>
              <TabsTrigger value="banners" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Banners</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                <span className="hidden sm:inline">Cupons</span>
              </TabsTrigger>
              <TabsTrigger value="footer" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Rodapé</span>
              </TabsTrigger>
              <TabsTrigger value="sales" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Vendas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="categories">
              <FotoFacilCategoriesManager />
            </TabsContent>
            <TabsContent value="events">
              <FotoFacilEventsManager />
            </TabsContent>
            <TabsContent value="photos">
              <FotoFacilPhotosManager />
            </TabsContent>
            <TabsContent value="banners">
              <FotoFacilBannersManager />
            </TabsContent>
            <TabsContent value="coupons">
              <FotoFacilCouponsManager />
            </TabsContent>
            <TabsContent value="footer">
              <FotoFacilFooterManager />
            </TabsContent>
            <TabsContent value="sales">
              <FotoFacilSalesManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}