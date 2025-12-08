import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const Footer = () => {
  const { settings, loading } = useSiteSettings();
  const { config } = useSiteConfig();

  if (loading) {
    return (
      <footer id="contact" className="bg-background py-20 px-4 text-center border-t border-border">
        <div className="animate-pulse">
          <div className="h-12 bg-muted rounded w-64 mx-auto mb-8"></div>
        </div>
      </footer>
    );
  }

  return (
    <footer id="contact" className="bg-secondary py-20 px-4 text-center border-t border-border">
      <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase mb-8 tracking-tighter">
        Vamos Criar?
      </h2>
      
      <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm md:text-xl font-light uppercase tracking-[0.2em] text-muted-foreground">
        {settings.instagram_url && (
          <a 
            href={settings.instagram_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors duration-300"
          >
            Instagram
          </a>
        )}
        {settings.contact_email && (
          <a 
            href={`mailto:${settings.contact_email}`}
            className="hover:text-foreground transition-colors duration-300"
          >
            Email
          </a>
        )}
        {settings.youtube_url && (
          <a 
            href={settings.youtube_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors duration-300"
          >
            YouTube
          </a>
        )}
        {settings.whatsapp_number && (
          <a 
            href={`https://wa.me/${settings.whatsapp_number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors duration-300"
          >
            WhatsApp
          </a>
        )}
      </div>

      <div className="mt-20 text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
        &copy; {new Date().getFullYear()} {config.company_name || 'Rubens Photofilm'}. Todos os direitos reservados.
      </div>
    </footer>
  );
};

export default Footer;
