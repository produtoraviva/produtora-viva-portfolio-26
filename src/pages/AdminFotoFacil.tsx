import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FotoFacilCategoriesManager } from '@/components/admin/FotoFacilCategoriesManager';
import { FotoFacilEventsManager } from '@/components/admin/FotoFacilEventsManager';
import { FotoFacilPhotosManager } from '@/components/admin/FotoFacilPhotosManager';
import { FotoFacilSalesManager } from '@/components/admin/FotoFacilSalesManager';
import { FotoFacilBannersManager } from '@/components/admin/FotoFacilBannersManager';
import FotoFacilDiscountsManager from '@/components/admin/FotoFacilDiscountsManager';
import { FotoFacilFooterManager } from '@/components/admin/FotoFacilFooterManager';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Folder, Calendar, Image, ShoppingCart, ImageIcon, TrendingDown, Settings, Camera } from 'lucide-react';

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

  const tabs = [
    { id: 'categories', label: 'Categorias', icon: Folder, description: 'Gerencie as categorias de eventos' },
    { id: 'events', label: 'Eventos', icon: Calendar, description: 'Crie e edite eventos de fotos' },
    { id: 'photos', label: 'Fotos', icon: Image, description: 'Upload e gestão de fotos' },
    { id: 'banners', label: 'Banners', icon: ImageIcon, description: 'Banners da página inicial' },
    { id: 'discounts', label: 'Descontos', icon: TrendingDown, description: 'Descontos e cupons' },
    { id: 'footer', label: 'Configurações', icon: Settings, description: 'Rodapé e configurações gerais' },
    { id: 'sales', label: 'Vendas', icon: ShoppingCart, description: 'Histórico de vendas' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  FOTOFÁCIL
                </h1>
                <p className="text-gray-500">Painel de Gestão da Loja de Fotos</p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
              <TabsList className="flex flex-wrap gap-1 w-full h-auto bg-transparent p-0">
                {tabs.map(tab => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-600 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-gray-100 data-[state=active]:hover:bg-emerald-500"
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <TabsContent value="categories" className="m-0">
                <FotoFacilCategoriesManager />
              </TabsContent>
              <TabsContent value="events" className="m-0">
                <FotoFacilEventsManager />
              </TabsContent>
              <TabsContent value="photos" className="m-0">
                <FotoFacilPhotosManager />
              </TabsContent>
              <TabsContent value="banners" className="m-0">
                <FotoFacilBannersManager />
              </TabsContent>
              <TabsContent value="discounts" className="m-0">
                <FotoFacilDiscountsManager />
              </TabsContent>
              <TabsContent value="footer" className="m-0">
                <FotoFacilFooterManager />
              </TabsContent>
              <TabsContent value="sales" className="m-0">
                <FotoFacilSalesManager />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
