import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle } from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleResults, setVisibleResults] = useState(6); // Quantidade inicial de resultados visíveis

  const faqs = [
    {
      question: "Qual é o prazo de entrega das fotos e vídeos?",
      answer: "As fotos são entregues em até 15 dias úteis após o evento, com prévia no mesmo dia. Os vídeos cinematográficos ficam prontos em até 30 dias úteis. Casos urgentes podem ser negociados com taxa adicional."
    },
    {
      question: "Vocês atendem eventos fora de Foz do Iguaçu?",
      answer: "Sim! Atendemos toda a região tríplice fronteira. Para eventos fora de Foz do Iguaçu e Ciudad del Este, cobramos taxa de deslocamento que varia conforme a distância. Entre em contato para orçamento personalizado."
    },
    {
      question: "É possível fazer alterações no pacote contratado?",
      answer: "Claro! Nossos pacotes são flexíveis. Você pode adicionar serviços como drone, making of, ensaio extra, álbuns adicionais, etc. Também criamos pacotes personalizados conforme sua necessidade."
    },
    {
      question: "Quantos profissionais estarão no meu evento?",
      answer: "Depende do pacote escolhido e do porte do evento. Geralmente: 1-2 fotógrafos para eventos pequenos, 2-3 para médios e até 4 profissionais para grandes eventos. Sempre garantimos cobertura completa."
    },
    {
      question: "As fotos são editadas? Como recebo o material?",
      answer: "Sim! Todas as fotos passam por tratamento profissional (cor, luz, contraste). Você recebe via galeria online para download, com opção de pendrive/HD adicional. Vídeos são entregues em HD/4K."
    },
    {
      question: "Vocês fazem ensaio pré-wedding?",
      answer: "Sim! O ensaio pré-wedding está incluso na maioria dos pacotes de casamento. É uma ótima oportunidade para nos conhecermos melhor e você se acostumar com a câmera."
    },
    {
      question: "E se chover no dia do evento ao ar livre?",
      answer: "Temos experiência com eventos em qualquer clima! Levamos equipamentos de proteção e sabemos aproveitar até mesmo a chuva para criar fotos únicas e românticas. O show não pode parar!"
    },
    {
      question: "Vocês têm seguro dos equipamentos?",
      answer: "Sim, todos nossos equipamentos são segurados. Além disso, sempre levamos equipamentos reserva para garantir que nada comprometa a cobertura do seu evento especial."
    },
    // Perguntas adicionais
    {
      question: "Qual é o valor mínimo para contratar os serviços?",
      answer: "Nossos valores variam conforme o tipo de evento e serviços inclusos. Temos pacotes a partir de R$ 1.500 para eventos pequenos. Entre em contato para um orçamento personalizado."
    },
    {
      question: "Vocês trabalham em feriados e finais de semana?",
      answer: "Sim! A maioria dos nossos eventos acontece em finais de semana e feriados. Trabalhamos normalmente nestes dias, sem cobrança adicional de taxa."
    },
    {
      question: "É possível agendar uma reunião antes do evento?",
      answer: "Claro! Sempre marcamos uma reunião prévia, presencial ou online, para alinharmos todos os detalhes, conhecer o local e suas preferências. Essa reunião está inclusa no serviço."
    },
    {
      question: "Vocês fazem eventos em outros países?",
      answer: "Sim, atendemos toda a região tríplice fronteira (Brasil, Argentina e Paraguai). Para eventos fora da região, incluímos hospedagem e transporte no orçamento. Solicite seu orçamento personalizado."
    },
    {
      question: "Qual é a política de cancelamento?",
      answer: "Cancelamentos até 30 dias do evento: reembolso de 80%. De 15 a 29 dias: 50%. Menos de 15 dias: apenas em casos de força maior. Reagendamentos são permitidos uma vez sem custo."
    },
    {
      question: "Vocês fornecem maquiagem e cabelo para ensaios?",
      answer: "Não fornecemos serviços de beleza, mas temos parcerias com excelentes profissionais. Podemos indicar maquiadoras e cabeleireiras que já trabalham conosco."
    },
    {
      question: "É possível escolher as fotos que vão ser editadas?",
      answer: "Nós fazemos uma pré-seleção das melhores fotos e editamos todas elas. Porém, você pode solicitar edição de fotos específicas adicionais por uma taxa simbólica."
    },
    {
      question: "Vocês trabalham com contrato?",
      answer: "Sim, sempre trabalhamos com contrato detalhado especificando todos os serviços, prazos, valores e condições. Isso garante segurança para ambas as partes."
    },
    {
      question: "Qual é o estilo de fotografia de vocês?",
      answer: "Nosso estilo é natural e espontâneo, capturando momentos genuínos. Também fazemos poses dirigidas quando necessário. Adaptamos nosso estilo ao perfil de cada cliente."
    },
    {
      question: "Vocês fazem vídeo ao vivo (streaming)?",
      answer: "Sim! Oferecemos serviço de transmissão ao vivo para eventos corporativos, casamentos e celebrações. O serviço inclui múltiplas câmeras e transmissão profissional."
    },
    {
      question: "É possível personalizar os álbuns de fotos?",
      answer: "Sim! Oferecemos álbuns personalizados com capa, contracapa e layout exclusivos. Você pode escolher fotos, textos e até mesmo o tipo de papel."
    },
    {
      question: "Vocês fazem sessão de fotos para pets?",
      answer: "Sim! Fazemos ensaios com pets, seja sozinhos ou junto com a família. Temos experiência e paciência para capturar os melhores momentos dos seus animais de estimação."
    },
    {
      question: "Qual é o formato de entrega dos vídeos?",
      answer: "Entregamos os vídeos em alta resolução (HD/4K) nos formatos MP4 e MOV. Também fornecemos versões otimizadas para redes sociais quando solicitado."
    },
    {
      question: "Vocês fazem edição especial para redes sociais?",
      answer: "Sim! Além do material principal, criamos conteúdo otimizado para Instagram, Facebook e TikTok, incluindo stories, reels e posts no formato adequado."
    },
    {
      question: "É possível fazer pagamento parcelado?",
      answer: "Sim! Aceitamos pagamento parcelado em até 12x no cartão de crédito ou em 3x no PIX com desconto de 5%. Também fazemos parcelamento personalizado para grandes eventos."
    },
    {
      question: "Vocês oferecem desconto para múltiplos eventos?",
      answer: "Sim! Para clientes que contratam mais de um evento (exemplo: ensaio + casamento + lua de mel) oferecemos descontos progressivos que podem chegar a 20%."
    },
    {
      question: "Qual equipamento vocês utilizam?",
      answer: "Utilizamos câmeras profissionais Canon e Sony, drones DJI licenciados, iluminação LED profissional e equipamentos de áudio de alta qualidade. Tudo sempre com backup."
    },
    {
      question: "Vocês fazem fotos aéreas com drone?",
      answer: "Sim! Temos pilotos certificados pela ANAC e drones licenciados. Fazemos fotos e vídeos aéreos espetaculares, sempre respeitando as normas de segurança."
    },
    {
      question: "É possível acompanhar o andamento da edição?",
      answer: "Claro! Enviamos prévias durante o processo de edição e você pode solicitar ajustes. Mantemos comunicação constante até a entrega final."
    },
    {
      question: "Vocês fazem eventos noturnos?",
      answer: "Sim! Temos equipamentos especializados para fotografia noturna e em baixa luminosidade. Eventos noturnos são nossa especialidade, com resultados incríveis."
    },
    {
      question: "Como funciona a entrega das fotos em alta resolução?",
      answer: "Todas as fotos editadas são entregues em alta resolução via galeria online com download ilimitado. Opcionalmente, fornecemos pendrive ou HD físico."
    },
    {
      question: "Vocês fazem cobertura de eventos esportivos?",
      answer: "Sim! Temos experiência em eventos esportivos, competições, corridas e campeonatos. Utilizamos equipamentos específicos para capturar ação em alta velocidade."
    },
    {
      question: "É possível contratar apenas para cerimônia religiosa?",
      answer: "Claro! Oferecemos pacotes específicos apenas para cerimônias religiosas, com duração de 2-3 horas e entrega das fotos editadas em até 10 dias."
    },
    {
      question: "Vocês trabalham com fotografia de produto?",
      answer: "Sim! Fazemos fotografia de produtos para e-commerce, catálogos e materiais publicitários. Temos estúdio próprio com iluminação profissional."
    },
    {
      question: "Qual é o prazo para receber o orçamento?",
      answer: "Enviamos orçamentos detalhados em até 24 horas após o primeiro contato. Para eventos mais complexos, pode levar até 48 horas para montarmos uma proposta completa."
    },
    {
      question: "Vocês fazem backup das fotos durante o evento?",
      answer: "Sim! Fazemos backup em tempo real durante o evento usando cartões duplos e armazenamento em nuvem. Suas memórias estão sempre seguras conosco."
    },
    {
      question: "É possível incluir outros serviços no pacote?",
      answer: "Sim! Podemos incluir DJ, decoração, buffet e outros serviços através de nossos parceiros confiáveis. Oferecemos um pacote completo para seu evento."
    },
    {
      question: "Vocês fazem sessão de fotos newborn?",
      answer: "Sim! Fazemos ensaios newborn em estúdio ou domiciliar, com toda segurança e carinho que o momento requer. Temos props e acessórios apropriados."
    },
    {
      question: "Como garantem a qualidade das fotos?",
      answer: "Todas as fotos passam por tratamento profissional individual: correção de cor, contraste, luminosidade e retoque quando necessário. Garantimos a melhor qualidade."
    },
    {
      question: "Vocês atendem eventos corporativos pequenos?",
      answer: "Sim! Atendemos desde pequenas reuniões até grandes convenções. Temos pacotes específicos para cada porte de evento corporativo."
    },
    {
      question: "É possível ter as fotos no mesmo dia do evento?",
      answer: "Para eventos especiais, oferecemos entrega expressa das melhores fotos em até 6 horas após o evento, com taxa adicional de urgência."
    },
    {
      question: "Vocês fazem time-lapse de eventos?",
      answer: "Sim! Criamos time-lapses de montagem, evento completo ou momentos específicos. É uma forma única de mostrar a evolução do seu evento."
    },
    {
      question: "Qual é a experiência da equipe?",
      answer: "Nossa equipe tem mais de 8 anos de experiência, já realizamos mais de 500 eventos e temos certificações em fotografia profissional e pilotagem de drone."
    },
    {
      question: "Vocês fazem edição em preto e branco?",
      answer: "Sim! Oferecemos versões em preto e branco das fotos, além das coloridas. Também fazemos edições temáticas e filtros personalizados conforme solicitação."
    },
    {
      question: "Como é feita a seleção das fotos?",
      answer: "Fazemos uma curadoria criteriosa, selecionando as melhores fotos baseadas em qualidade técnica, expressão e momento. Descartamos fotos tremidas, desfocadas ou repetitivas."
    },
    {
      question: "Vocês trabalham em eventos ao ar livre?",
      answer: "Sim! Temos experiência em eventos externos, com equipamentos resistentes a intempéries. Sabemos lidar com iluminação natural e condições climáticas variadas."
    },
    {
      question: "É possível fazer alterações no cronograma no dia do evento?",
      answer: "Sim, somos flexíveis e nos adaptamos a mudanças de cronograma. Nossa equipe está preparada para ajustar a cobertura conforme necessário."
    },
    {
      question: "Vocês fazem vídeo institucional para empresas?",
      answer: "Sim! Criamos vídeos institucionais, de apresentação de produtos, depoimentos de clientes e conteúdo para marketing digital das empresas."
    },
    {
      question: "Qual é o diferencial de vocês no mercado?",
      answer: "Nosso diferencial é a combinação de técnica profissional, equipamentos de ponta, atendimento personalizado e preços justos. Focamos na experiência completa do cliente."
    },
    {
      question: "Vocês fazem fotos para documentos?",
      answer: "Não fazemos fotos para documentos. Nosso foco é em eventos, ensaios e fotografia artística. Podemos indicar estúdios especializados em fotos 3x4 e documentos."
    },
    {
      question: "Como posso ver trabalhos anteriores similares ao meu evento?",
      answer: "Temos um portfólio completo no site e redes sociais. Também podemos enviar trabalhos específicos similares ao seu evento para você avaliar nosso estilo."
    },
    {
      question: "Vocês oferecem curso de fotografia?",
      answer: "Ocasionalmente oferecemos workshops e cursos básicos de fotografia. Siga nossas redes sociais para ficar por dentro das próximas turmas e datas."
    }
  ];

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
    // Sem busca: mostrar apenas as primeiras 8 FAQs originais
    displayedFaqs = faqs.slice(0, 8);
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
          {displayedFaqs.length > 0 ? (
            <>
              <Accordion type="single" collapsible className="space-y-4">
                {displayedFaqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
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
              href="https://wa.me/5511999999999?text=Olá! Tenho algumas dúvidas sobre os serviços."
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