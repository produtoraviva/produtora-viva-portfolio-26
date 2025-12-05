import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image, Video, CheckCircle, AlertCircle, Link, Plus } from 'lucide-react';
import { MediaSelector } from './MediaSelector';

interface FileWithPreview extends File {
  preview: string;
  id: string;
}

interface UrlItem {
  id: string;
  url: string;
  title: string;
  mediaType: 'photo' | 'video';
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
}

interface MediaUploaderProps {
  onUploadComplete: () => void;
  onMediaUploaded?: () => void;
}

export function MediaUploader({ onUploadComplete, onMediaUploaded }: MediaUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [urlItems, setUrlItems] = useState<UrlItem[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'uploading' | 'success' | 'error' }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const { toast } = useToast();

  const [defaultSettings, setDefaultSettings] = useState({
    title: '',
    description: '',
    location: '',
    date_taken: '',
    photo_category: '',
    video_category: '',
    photo_subcategory: '',
    video_subcategory: '',
    publish_status: 'draft' as const,
    is_featured: false,
    homepage_featured: false,
  });

  // Carregar categorias e subcategorias
  useEffect(() => {
    const loadCategoriesAndSubcategories = async () => {
      try {
        const { data: categoriesData } = await supabase
          .from('portfolio_categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order');
        
        const { data: subcategoriesData } = await supabase
          .from('portfolio_subcategories')
          .select('*')
          .eq('is_active', true)
          .order('display_order');
        
        setCategories(categoriesData || []);
        setSubcategories(subcategoriesData || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    
    loadCategoriesAndSubcategories();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => {
      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9)
      });
      return fileWithPreview;
    });
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
      'video/*': ['.mp4', '.webm', '.ogg', '.mov']
    },
    multiple: true,
    // No size limit for uploads
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const generateThumbnail = async (file: File): Promise<string | null> => {
    if (file.type.startsWith('image/')) {
      return null; // Use original image as thumbnail
    }
    
    if (file.type.startsWith('video/')) {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          video.currentTime = 1; // Get frame at 1 second
        };

        video.oncanplay = () => {
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(URL.createObjectURL(blob));
              } else {
                resolve(null);
              }
            }, 'image/jpeg', 0.8);
          } else {
            resolve(null);
          }
        };

        video.onerror = () => resolve(null);
        video.src = URL.createObjectURL(file);
      });
    }

    return null;
  };

  const uploadFile = async (file: FileWithPreview) => {
    try {
      setUploadStatus(prev => ({ ...prev, [file.id]: 'uploading' }));
      setUploadProgress(prev => ({ ...prev, [file.id]: 0 }));

      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      const filePath = `uploads/${fileName}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [file.id]: Math.min((prev[file.id] || 0) + Math.random() * 15, 90)
        }));
      }, 200);

      try {
        // Upload main file
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('portfolio-media')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw uploadError;
        }

        setUploadProgress(prev => ({ ...prev, [file.id]: 95 }));

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-media')
          .getPublicUrl(filePath);

        // Get file dimensions
        let dimensions = null;
        if (file.type.startsWith('image/')) {
          dimensions = await new Promise<{width: number, height: number}>((resolve) => {
            const img = document.createElement('img');
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => resolve({ width: 0, height: 0 });
            img.src = file.preview;
          });
        } else if (file.type.startsWith('video/')) {
          dimensions = await new Promise<{width: number, height: number}>((resolve) => {
            const video = document.createElement('video');
            video.onloadedmetadata = () => resolve({ width: video.videoWidth, height: video.videoHeight });
            video.onerror = () => resolve({ width: 0, height: 0 });
            video.src = file.preview;
          });
        }

        // Get next display order
        const { data: maxOrderData } = await supabase
          .from('portfolio_items')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1);

        const nextOrder = maxOrderData && maxOrderData.length > 0 
          ? maxOrderData[0].display_order + 1 
          : 0;

        // Determinar tipo de mídia
        const mediaType = file.type.startsWith('image/') ? 'photo' : 'video';
        
        // Determinar categoria e subcategoria baseado no tipo de mídia
        const category = mediaType === 'photo' ? defaultSettings.photo_category : defaultSettings.video_category;
        const subcategory = mediaType === 'photo' ? defaultSettings.photo_subcategory : defaultSettings.video_subcategory;

        // Insert into portfolio_items as uploaded media
        const { error: dbError } = await supabase
          .from('portfolio_items')
          .insert({
            title: defaultSettings.title || file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            description: defaultSettings.description || null,
            location: defaultSettings.location || null,
            date_taken: defaultSettings.date_taken || null,
            media_type: mediaType,
            file_url: publicUrl,
            category: category || null,
            subcategory: subcategory || null,
            item_status: 'uploaded', // Mark as uploaded media
            publish_status: defaultSettings.publish_status,
            is_featured: defaultSettings.is_featured,
            homepage_featured: defaultSettings.homepage_featured,
            display_order: nextOrder,
            file_size: file.size,
            dimensions: dimensions,
          });

        if (dbError) {
          console.error('Database insert error:', dbError);
          throw dbError;
        }

        clearInterval(progressInterval);
        setUploadStatus(prev => ({ ...prev, [file.id]: 'success' }));
        setUploadProgress(prev => ({ ...prev, [file.id]: 100 }));

      } catch (uploadError) {
        clearInterval(progressInterval);
        throw uploadError;
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(prev => ({ ...prev, [file.id]: 'error' }));
      toast({
        title: 'Erro no Upload',
        description: error instanceof Error ? error.message : `Erro ao fazer upload de ${file.name}`,
        variant: 'destructive',
      });
    }
  };

  const handleUploadAll = async () => {
    if (files.length === 0 && urlItems.length === 0) return;

    setIsUploading(true);
    
    try {
      // Upload files
      if (files.length > 0) {
        await Promise.all(files.map(file => uploadFile(file)));
      }
      
      // Upload URLs
      if (urlItems.length > 0) {
        await Promise.all(urlItems.filter(item => item.status === 'pending').map(item => uploadFromUrl(item)));
      }
      
      const totalItems = files.length + urlItems.filter(item => item.status === 'pending').length;
      
      toast({
        title: 'Upload Concluído',
        description: `${totalItems} ${totalItems === 1 ? 'item enviado' : 'itens enviados'} com sucesso!`,
      });

      // Clear files after successful upload
      files.forEach(file => URL.revokeObjectURL(file.preview));
      setFiles([]);
      setUrlItems([]);
      setUploadProgress({});
      setUploadStatus({});
      
      onUploadComplete();
      onMediaUploaded?.();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Detect media type from URL
  const detectMediaTypeFromUrl = (url: string): 'photo' | 'video' => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    const lowerUrl = url.toLowerCase();
    if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
      return 'video';
    }
    return 'photo';
  };

  // Add URL to upload queue
  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    
    // Validate URL
    try {
      new URL(urlInput);
    } catch {
      toast({
        title: 'URL Inválida',
        description: 'Por favor, insira uma URL válida.',
        variant: 'destructive',
      });
      return;
    }

    const mediaType = detectMediaTypeFromUrl(urlInput);
    const newItem: UrlItem = {
      id: Math.random().toString(36).substr(2, 9),
      url: urlInput.trim(),
      title: urlInput.split('/').pop()?.split('?')[0] || 'Mídia',
      mediaType,
      status: 'pending',
      progress: 0,
    };

    setUrlItems(prev => [...prev, newItem]);
    setUrlInput('');
  };

  // Upload from URL
  const uploadFromUrl = async (item: UrlItem) => {
    try {
      setUrlItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading' as const, progress: 10 } : i));

      // Get next display order
      const { data: maxOrderData } = await supabase
        .from('portfolio_items')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = maxOrderData && maxOrderData.length > 0 
        ? maxOrderData[0].display_order + 1 
        : 0;

      setUrlItems(prev => prev.map(i => i.id === item.id ? { ...i, progress: 50 } : i));

      // Determine category based on media type
      const category = item.mediaType === 'photo' ? defaultSettings.photo_category : defaultSettings.video_category;
      const subcategory = item.mediaType === 'photo' ? defaultSettings.photo_subcategory : defaultSettings.video_subcategory;

      // Insert directly with URL (no need to download and re-upload)
      const { error: dbError } = await supabase
        .from('portfolio_items')
        .insert({
          title: defaultSettings.title || item.title,
          description: defaultSettings.description || null,
          location: defaultSettings.location || null,
          date_taken: defaultSettings.date_taken || null,
          media_type: item.mediaType,
          file_url: item.url,
          thumbnail_url: item.mediaType === 'photo' ? item.url : null,
          category: category || null,
          subcategory: subcategory || null,
          item_status: 'uploaded',
          publish_status: defaultSettings.publish_status,
          is_featured: defaultSettings.is_featured,
          homepage_featured: defaultSettings.homepage_featured,
          display_order: nextOrder,
        });

      if (dbError) throw dbError;

      setUrlItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'success' as const, progress: 100 } : i));
    } catch (error) {
      console.error('URL upload error:', error);
      setUrlItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error' as const } : i));
      toast({
        title: 'Erro ao adicionar',
        description: error instanceof Error ? error.message : `Erro ao adicionar mídia de ${item.url}`,
        variant: 'destructive',
      });
    }
  };

  const removeUrlItem = (id: string) => {
    setUrlItems(prev => prev.filter(item => item.id !== id));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="h-8 w-8 text-purple-500" />;
    }
    return <Upload className="h-8 w-8 text-gray-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList>
          <TabsTrigger value="upload">Upload de Mídia</TabsTrigger>
          <TabsTrigger value="library">Biblioteca de Mídia</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Padrão</CardTitle>
              <CardDescription>
                Essas configurações serão aplicadas a todos os arquivos enviados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações Gerais */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Informações Gerais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="default-title">Título (Opcional)</Label>
                    <Input
                      id="default-title"
                      placeholder="Título para todas as mídias"
                      value={defaultSettings.title}
                      onChange={(e) => setDefaultSettings(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="default-location">Localização (Opcional)</Label>
                    <Input
                      id="default-location"
                      placeholder="Ex: São Paulo, SP"
                      value={defaultSettings.location}
                      onChange={(e) => setDefaultSettings(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="default-description">Descrição (Opcional)</Label>
                    <Textarea
                      id="default-description"
                      placeholder="Descrição para todas as mídias"
                      value={defaultSettings.description}
                      onChange={(e) => setDefaultSettings(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="default-date">Data (Opcional)</Label>
                    <Input
                      id="default-date"
                      type="date"
                      value={defaultSettings.date_taken}
                      onChange={(e) => setDefaultSettings(prev => ({ ...prev, date_taken: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Categorias para Fotos */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Categorias para Fotos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="photo-category">Categoria</Label>
                    <Select
                      value={defaultSettings.photo_category || "none"}
                      onValueChange={(value) => 
                        setDefaultSettings(prev => ({ 
                          ...prev, 
                          photo_category: value === "none" ? "" : value 
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {categories
                          .filter(category => category.type === 'photo')
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="photo-subcategory">Subcategoria</Label>
                    <Select
                      value={defaultSettings.photo_subcategory || "none"}
                      onValueChange={(value) => 
                        setDefaultSettings(prev => ({ 
                          ...prev, 
                          photo_subcategory: value === "none" ? "" : value 
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma subcategoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {subcategories
                          .filter(sub => !defaultSettings.photo_category || sub.category_id === defaultSettings.photo_category)
                          .map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Categorias para Vídeos */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Categorias para Vídeos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="video-category">Categoria</Label>
                    <Select
                      value={defaultSettings.video_category || "none"}
                      onValueChange={(value) => 
                        setDefaultSettings(prev => ({ 
                          ...prev, 
                          video_category: value === "none" ? "" : value 
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {categories
                          .filter(category => category.type === 'video')
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="video-subcategory">Subcategoria</Label>
                    <Select
                      value={defaultSettings.video_subcategory || "none"}
                      onValueChange={(value) => 
                        setDefaultSettings(prev => ({ 
                          ...prev, 
                          video_subcategory: value === "none" ? "" : value 
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma subcategoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {subcategories
                          .filter(sub => !defaultSettings.video_category || sub.category_id === defaultSettings.video_category)
                          .map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Status e Destaques */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Status e Destaques
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="default-status">Status de Publicação</Label>
                    <Select
                      value={defaultSettings.publish_status}
                      onValueChange={(value: any) => 
                        setDefaultSettings(prev => ({ ...prev, publish_status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                        <SelectItem value="hidden">Oculto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="default-featured"
                      checked={defaultSettings.is_featured}
                      onCheckedChange={(checked) => 
                        setDefaultSettings(prev => ({ ...prev, is_featured: checked }))
                      }
                    />
                    <Label htmlFor="default-featured">Item em Destaque</Label>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="default-homepage"
                      checked={defaultSettings.homepage_featured}
                      onCheckedChange={(checked) => 
                        setDefaultSettings(prev => ({ ...prev, homepage_featured: checked }))
                      }
                    />
                    <Label htmlFor="default-homepage">Destaque na Homepage</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload de Arquivos</CardTitle>
              <CardDescription>
                Arraste e solte ou clique para selecionar fotos e vídeos
              </CardDescription>
            </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">Solte os arquivos aqui...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">
                  Arraste e solte arquivos aqui, ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground">
                  Suporte para imagens (JPG, PNG, WebP, GIF) e vídeos (MP4, WebM, MOV)
                </p>
                <p className="text-sm text-muted-foreground">
                  Sem limite de tamanho
                </p>
              </div>
            )}
          </div>
            </CardContent>
          </Card>

          {/* URL Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Adicionar por URL
              </CardTitle>
              <CardDescription>
                Adicione imagens ou vídeos a partir de um link externo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                  className="flex-1"
                />
                <Button onClick={handleAddUrl} disabled={!urlInput.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                URLs de imagens (JPG, PNG, WebP) ou vídeos (MP4, WebM). As mesmas configurações padrão serão aplicadas.
              </p>

              {/* URL Items List */}
              {urlItems.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">URLs Adicionadas ({urlItems.length})</h4>
                  {urlItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      {item.mediaType === 'photo' ? (
                        <Image className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      ) : (
                        <Video className="h-5 w-5 text-purple-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.url}</p>
                        {item.status === 'uploading' && (
                          <Progress value={item.progress} className="h-1 mt-1" />
                        )}
                      </div>
                      {item.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {item.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                      {item.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUrlItem(item.id)}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Button */}
          {(files.length > 0 || urlItems.filter(i => i.status === 'pending').length > 0) && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {files.length > 0 && `${files.length} arquivo(s)`}
                      {files.length > 0 && urlItems.filter(i => i.status === 'pending').length > 0 && ' + '}
                      {urlItems.filter(i => i.status === 'pending').length > 0 && `${urlItems.filter(i => i.status === 'pending').length} URL(s)`}
                      {' pronto(s) para envio'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        files.forEach(file => URL.revokeObjectURL(file.preview));
                        setFiles([]);
                        setUrlItems([]);
                        setUploadProgress({});
                        setUploadStatus({});
                      }}
                      disabled={isUploading}
                    >
                      Limpar Todos
                    </Button>
                    <Button
                      onClick={handleUploadAll}
                      disabled={isUploading || (files.length === 0 && urlItems.filter(i => i.status === 'pending').length === 0)}
                    >
                      {isUploading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Enviando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Enviar Todos
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Arquivos Selecionados ({files.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {getFileIcon(file)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{file.name}</h4>
                          {getStatusIcon(uploadStatus[file.id])}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                        {uploadProgress[file.id] !== undefined && (
                          <div className="mt-2">
                            <Progress value={uploadProgress[file.id]} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {Math.round(uploadProgress[file.id])}%
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={file.preview}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <video
                            src={file.preview}
                            className="w-16 h-16 object-cover rounded"
                            muted
                          />
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="library">
          <MediaSelector 
            onSelect={(mediaItem) => {
              // Just show details for now, can be extended later
              console.log('Selected media:', mediaItem);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}