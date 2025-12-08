import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminProvider } from "./hooks/useAdmin";
import { FotoFacilCartProvider } from "./contexts/FotoFacilCartContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Index from "./pages/Index";
import PortfolioPage from "./pages/PortfolioPage";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminFotoFacil from "./pages/AdminFotoFacil";
import SubmitTestimonial from "./pages/SubmitTestimonial";
import FotoFacil from "./pages/FotoFacil";
import FotoFacilCart from "./pages/FotoFacilCart";
import FotoFacilDelivery from "./pages/FotoFacilDelivery";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AdminProvider>
          <FotoFacilCartProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/depoimento" element={<SubmitTestimonial />} />
                <Route path="/fotofacil" element={<FotoFacil />} />
                <Route path="/fotofacil/carrinho" element={<FotoFacilCart />} />
                <Route path="/fotofacil/entrega/:orderId/:token" element={<FotoFacilDelivery />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/fotofacil" element={<AdminFotoFacil />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </FotoFacilCartProvider>
        </AdminProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
