import { Link } from 'react-router-dom';
import { Camera, Shield, CreditCard, Mail, Phone } from 'lucide-react';

const FotoFacilFooter = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* Trust Badges */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-sm text-gray-300">Compra Segura</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-sm text-gray-300">Pagamento PIX</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-sm text-gray-300">Fotos em Alta Resolução</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-sm text-gray-300">Download Imediato</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-black tracking-tight mb-4">FOTOFÁCIL</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Sua plataforma de fotos de eventos. Encontre e compre suas fotos de forma rápida e segura.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-300">Links Úteis</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/fotofacil" className="text-gray-400 hover:text-white transition-colors">
                  Página Inicial
                </Link>
              </li>
              <li>
                <Link to="/fotofacil/minhas-fotos" className="text-gray-400 hover:text-white transition-colors">
                  Baixar Minhas Fotos
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Voltar ao Site Principal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-300">Contato</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>contato@fotofacil.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+55 (11) 99999-9999</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} FotoFácil. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FotoFacilFooter;