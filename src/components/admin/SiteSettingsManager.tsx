import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MessageCircle, Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string;
}

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;
      
      const settingsMap = new Map();
      (data || []).forEach((setting: SiteSetting) => {
        settingsMap.set(setting.setting_key, setting.setting_value);
      });
      
      setSettings(settingsMap);
    } catch (error) {
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações do site.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          setting_key: key, 
          setting_value: value 
        }, { 
          onConflict: 'setting_key' 
        });

      if (error) throw error;
      
      setSettings(prev => new Map(prev.set(key, value)));
      
      toast({
        title: "Configuração atualizada",
        description: "A configuração foi salva com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const updates = [
      { key: 'contact_phone', value: formData.get('contact_phone') as string },
      { key: 'contact_phone_secondary', value: formData.get('contact_phone_secondary') as string },
      { key: 'contact_email', value: formData.get('contact_email') as string },
      { key: 'whatsapp_number', value: formData.get('whatsapp_number') as string },
      { key: 'whatsapp_international', value: formData.get('whatsapp_international') as string },
      { key: 'instagram_url', value: formData.get('instagram_url') as string },
      { key: 'facebook_url', value: formData.get('facebook_url') as string },
      { key: 'youtube_url', value: formData.get('youtube_url') as string },
      { key: 'tiktok_url', value: formData.get('tiktok_url') as string },
      { key: 'linkedin_url', value: formData.get('linkedin_url') as string },
    ];

    try {
      setSaving(true);
      
      for (const update of updates) {
        await updateSetting(update.key, update.value);
      }
      
      toast({
        title: "Configurações atualizadas",
        description: "Todas as configurações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar configurações",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Configurações de Contato e Redes Sociais
          </CardTitle>
          <CardDescription>
            Configure as informações de contato e links das redes sociais que aparecem no site
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações de Contato */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Informações de Contato
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Telefone de Contato Principal</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    type="tel"
                    placeholder="(45) 99999-9999"
                    defaultValue={settings.get('contact_phone') || ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    Aparece no rodapé e na seção de contato
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_phone_secondary">Telefone de Contato Secundário</Label>
                  <Input
                    id="contact_phone_secondary"
                    name="contact_phone_secondary"
                    type="tel"
                    placeholder="(45) 98888-8888"
                    defaultValue={settings.get('contact_phone_secondary') || ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    Aparece no rodapé e na seção de contato (opcional)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email de Contato</Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    placeholder="contato@exemplo.com"
                    defaultValue={settings.get('contact_email') || ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    Aparece no rodapé e na seção de contato
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number">Número do WhatsApp (Brasil)</Label>
                  <Input
                    id="whatsapp_number"
                    name="whatsapp_number"
                    type="tel"
                    placeholder="5545999999999"
                    defaultValue={settings.get('whatsapp_number') || ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    Para clientes do Brasil. Formato: código do país + DDD + número (ex: 5545999887766). Usado no botão WhatsApp flutuante e formulário de contato.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_international">Número do WhatsApp Internacional</Label>
                  <Input
                    id="whatsapp_international"
                    name="whatsapp_international"
                    type="tel"
                    placeholder="595981123456"
                    defaultValue={settings.get('whatsapp_international') || ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    Para Paraguay e outros países. Formato: código do país + número (ex: 595981234567). Usado automaticamente quando cliente seleciona país diferente de Brasil no formulário.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Redes Sociais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Redes Sociais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram_url" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram_url"
                    name="instagram_url"
                    type="url"
                    placeholder="https://instagram.com/seu_perfil"
                    defaultValue={settings.get('instagram_url') || ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="facebook_url" className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook_url"
                    name="facebook_url"
                    type="url"
                    placeholder="https://facebook.com/sua_pagina"
                    defaultValue={settings.get('facebook_url') || ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="youtube_url" className="flex items-center gap-2">
                    <Youtube className="h-4 w-4" />
                    YouTube
                  </Label>
                  <Input
                    id="youtube_url"
                    name="youtube_url"
                    type="url"
                    placeholder="https://youtube.com/@seu_canal"
                    defaultValue={settings.get('youtube_url') || ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin_url"
                    name="linkedin_url"
                    type="url"
                    placeholder="https://linkedin.com/in/seu_perfil"
                    defaultValue={settings.get('linkedin_url') || ''}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tiktok_url" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  TikTok
                </Label>
                <Input
                  id="tiktok_url"
                  name="tiktok_url"
                  type="url"
                  placeholder="https://tiktok.com/@seu_perfil"
                  defaultValue={settings.get('tiktok_url') || ''}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview das Configurações</CardTitle>
          <CardDescription>
            Veja como as informações aparecerão no site
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <h4 className="font-medium mb-2">Contato</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  <div className="flex flex-col">
                    <span>{settings.get('contact_phone') || 'Telefone não configurado'}</span>
                    {settings.get('contact_phone_secondary') && (
                      <span className="text-xs">{settings.get('contact_phone_secondary')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  {settings.get('contact_email') || 'Email não configurado'}
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-3 w-3" />
                  WhatsApp (Brasil): {settings.get('whatsapp_number') || 'Não configurado'}
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-3 w-3" />
                  WhatsApp (Internacional): {settings.get('whatsapp_international') || 'Não configurado'}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Redes Sociais</h4>
              <div className="flex gap-2">
                {settings.get('instagram_url') && (
                  <a href={settings.get('instagram_url')} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {settings.get('facebook_url') && (
                  <a href={settings.get('facebook_url')} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {settings.get('youtube_url') && (
                  <a href={settings.get('youtube_url')} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Youtube className="h-4 w-4" />
                  </a>
                )}
                {settings.get('linkedin_url') && (
                  <a href={settings.get('linkedin_url')} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {!settings.get('instagram_url') && !settings.get('facebook_url') && !settings.get('youtube_url') && !settings.get('linkedin_url') && (
                  <span className="text-muted-foreground text-sm">Nenhuma rede social configurada</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}