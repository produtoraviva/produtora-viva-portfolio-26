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

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  let displayedFaqs;
  const initialResults = 6;
  const incrementStep = 5;
  
  if (!searchTerm) {
    displayedFaqs = faqs;
  } else {
    displayedFaqs = filteredFaqs.slice(0, visibleResults);
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setVisibleResults(initialResults);
  };

  const showMoreResults = () => {
    setVisibleResults(prev => prev + incrementStep);
  };

  const remainingResults = Math.max(0, filteredFaqs.length - visibleResults);
  const nextBatchSize = Math.min(incrementStep, remainingResults);

  return (
    <section id="faq" className="max-w-[1600px] mx-auto px-4 py-24 border-t border-border">
      {/* Header */}
      <div className="grid lg:grid-cols-2 gap-16 mb-16">
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-4">
            FAQ
          </p>
          <h2 className="text-3xl md:text-5xl font-light uppercase tracking-tighter">
            Dúvidas
            <br />
            <span className="text-muted-foreground">Frequentes</span>
          </h2>
        </div>
        
        <div className="flex flex-col justify-end">
          <p className="text-muted-foreground mb-6">
            Esclarecemos as principais dúvidas sobre nossos serviços.
          </p>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar dúvidas..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-background border-border focus:border-foreground rounded-none text-base"
            />
          </div>
          
          {searchTerm && (
            <p className="text-xs text-muted-foreground mt-3 font-mono">
              {filteredFaqs.length > 0 
                ? `${filteredFaqs.length} resultado(s)`
                : "Nenhum resultado encontrado"
              }
            </p>
          )}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border border-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayedFaqs.length > 0 ? (
          <>
            <Accordion type="single" collapsible className="space-y-0 divide-y divide-border border-y border-border">
              {displayedFaqs.map((faq) => (
                <AccordionItem 
                  key={faq.id} 
                  value={`item-${faq.id}`}
                  className="border-0 px-0"
                >
                  <AccordionTrigger className="text-left font-normal text-base hover:no-underline py-6 [&[data-state=open]]:text-foreground text-muted-foreground hover:text-foreground transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-sm">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            {searchTerm && remainingResults > 0 && (
              <div className="mt-8">
                <button
                  onClick={showMoreResults}
                  className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors duration-300 border-b border-muted-foreground hover:border-foreground pb-1"
                >
                  Ver mais {nextBatchSize} resultado(s)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma dúvida encontrada.
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-16 pt-16 border-t border-border max-w-2xl">
        <h3 className="text-xl font-bold uppercase tracking-tight mb-4">
          Ainda tem dúvidas?
        </h3>
        <p className="text-muted-foreground mb-6">
          Nossa equipe está pronta para esclarecer qualquer questão.
        </p>
        <div className="flex flex-wrap gap-4">
          <a 
            href={`https://wa.me/${settings.whatsapp_number || '5545999887766'}?text=${encodeURIComponent('Olá! Tenho algumas dúvidas sobre os serviços.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20BA5C] text-white px-6 py-3 text-xs uppercase tracking-[0.15em] font-bold transition-colors"
          >
            WhatsApp
          </a>
          <button 
            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="border border-foreground text-foreground hover:bg-foreground hover:text-background px-6 py-3 text-xs uppercase tracking-[0.15em] font-bold transition-colors"
          >
            Formulário
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
