import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  display_order: number;
}

const FAQ = () => {
  const { settings } = useSiteSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleResults, setVisibleResults] = useState(6);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faq_items')
        .select('id, question, answer, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar FAQs baseado na busca
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica para mostrar FAQs
  let displayedFaqs;
  const initialResults = 6;
  const incrementStep = 5;
  
  if (!searchTerm) {
    // Sem busca: mostrar todas as FAQs do banco
    displayedFaqs = faqs;
  } else {
    // Com busca: mostrar resultados baseado na quantidade visível
    displayedFaqs = filteredFaqs.slice(0, visibleResults);
  }

  // Reset quantidade visível quando a busca muda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setVisibleResults(initialResults);
  };

  // Função para mostrar mais resultados
  const showMoreResults = () => {
    setVisibleResults(prev => prev + incrementStep);
  };

  // Calcular quantos resultados faltam mostrar
  const remainingResults = Math.max(0, filteredFaqs.length - visibleResults);
  const nextBatchSize = Math.min(incrementStep, remainingResults);

  return (
    <section id="faq" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            FAQ
          </Badge>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Dúvidas <span className="bg-gradient-primary bg-clip-text text-transparent">Frequentes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Esclarecemos as principais dúvidas sobre nossos serviços. 
            Não encontrou sua pergunta? Use a busca abaixo!
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar dúvidas..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 bg-card border-border focus:border-primary/50"
            />
          </div>
          
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-4">
              {filteredFaqs.length > 0 
                ? `${filteredFaqs.length} resultado(s) encontrado(s)${filteredFaqs.length > visibleResults ? ` - Mostrando ${visibleResults} de ${filteredFaqs.length}` : ''}`
                : "Nenhum resultado encontrado. Tente outros termos ou entre em contato conosco."
              }
            </p>
          )}
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayedFaqs.length > 0 ? (
            <>
              <Accordion type="single" collapsible className="space-y-4">
                {displayedFaqs.map((faq) => (
                  <AccordionItem 
                    key={faq.id} 
                    value={`item-${faq.id}`}
                    className="border border-border rounded-lg px-6 bg-card/50 hover:bg-card transition-colors"
                  >
                    <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {/* Botão Ver Mais para resultados de busca */}
              {searchTerm && remainingResults > 0 && (
                <div className="text-center mt-8">
                  <button
                    onClick={showMoreResults}
                    className="inline-flex flex-col items-center justify-center bg-primary/10 hover:bg-primary/20 text-primary px-6 py-3 rounded-lg font-medium transition-colors border border-primary/30"
                  >
                    <span>Ver mais {nextBatchSize} resultado(s)</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Mostrando {displayedFaqs.length} resultado(s) de {filteredFaqs.length} encontrados
                    </span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                Nenhuma dúvida encontrada com esses termos.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Tente buscar por outros termos ou entre em contato conosco diretamente.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 p-8 bg-muted/30 rounded-2xl max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ainda tem dúvidas?
          </h3>
          <p className="text-muted-foreground mb-6">
            Nossa equipe está pronta para esclarecer qualquer questão e 
            criar o orçamento perfeito para seu evento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={`https://wa.me/${settings.whatsapp_number || '5545999887766'}?text=${encodeURIComponent('Olá! Tenho algumas dúvidas sobre os serviços. 🤔')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              WhatsApp
            </a>
            <a 
              href="#contact"
              className="inline-flex items-center justify-center border border-primary/30 hover:bg-primary/10 text-foreground px-6 py-3 rounded-lg font-medium transition-colors"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Formulário de Contato
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;