import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { Plus, Trash2, Users, Shield, Mail, Calendar } from 'lucide-react';
import SiteSettingsManager from './SiteSettingsManager';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_login_at?: string;
  role: 'admin' | 'collaborator';
}

export function AccountManager() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCollaboratorDialogOpen, setIsCollaboratorDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAdmin();

  // Form state for new admin
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    full_name: '',
  });

  // Form state for new collaborator
  const [newCollaborator, setNewCollaborator] = useState({
    email: '',
    password: '',
    full_name: '',
  });

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    try {
      setIsLoading(true);
      
      // Get all users with roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;
      
      // Get profiles for these users
      const userIds = rolesData?.map(r => r.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Get auth users data
      const { data: authData } = await supabase.auth.admin.listUsers();
      const authUsers = authData?.users || [];
      
      // Combine data
      const combinedUsers = profilesData?.map(profile => {
        const roleData = rolesData?.find(r => r.user_id === profile.id);
        const authUser = authUsers.find(u => u.id === profile.id);
        
        return {
          id: profile.id,
          email: authUser?.email || '',
          full_name: profile.full_name,
          created_at: profile.created_at,
          last_login_at: profile.last_login_at,
          role: roleData?.role || 'collaborator'
        } as AdminUser;
      }) || [];
      
      setAdminUsers(combinedUsers);
    } catch (error) {
      console.error('Error loading admin users:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar contas de administrador.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.full_name) {
      toast({
        title: 'Erro',
        description: 'Todos os campos são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Creating admin user with data:', { email: newAdmin.email, full_name: newAdmin.full_name });
      
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: newAdmin.email,
          password: newAdmin.password,
          full_name: newAdmin.full_name,
          role: 'admin'
        },
      });

      console.log('Create admin response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Erro ao criar conta');
      }

      if (data?.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }

      toast({
        title: 'Sucesso',
        description: 'Nova conta de administrador criada com sucesso!',
      });

      setNewAdmin({ email: '', password: '', full_name: '' });
      setIsDialogOpen(false);
      loadAdminUsers();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar conta de administrador.',
        variant: 'destructive',
      });
    }
  };

  const deleteAdmin = async (adminId: string) => {
    if (adminId === currentUser?.id) {
      toast({
        title: 'Erro',
        description: 'Você não pode excluir sua própria conta.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Similar to creation, we need to use service role for deletion
      const { error } = await supabase.functions.invoke('delete-admin-user', {
        body: { admin_id: adminId },
      });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Conta de administrador excluída com sucesso!',
      });
      
      loadAdminUsers();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir conta de administrador.',
        variant: 'destructive',
      });
    }
  };

  const createCollaborator = async () => {
    if (!newCollaborator.email || !newCollaborator.password || !newCollaborator.full_name) {
      toast({
        title: 'Erro',
        description: 'Todos os campos são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Creating collaborator with data:', { email: newCollaborator.email, full_name: newCollaborator.full_name });
      
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: newCollaborator.email,
          password: newCollaborator.password,
          full_name: newCollaborator.full_name,
          role: 'collaborator'
        },
      });

      console.log('Create collaborator response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Erro ao criar conta');
      }

      if (data?.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }

      toast({
        title: 'Sucesso',
        description: 'Nova conta de colaborador criada com sucesso!',
      });

      setNewCollaborator({ email: '', password: '', full_name: '' });
      setIsCollaboratorDialogOpen(false);
      loadAdminUsers();
    } catch (error: any) {
      console.error('Error creating collaborator:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar conta de colaborador.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Primeiro acesso';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Gerenciamento de Contas
          </h2>
          <p className="text-muted-foreground">
            Gerencie as contas de administrador do sistema
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Conta Admin
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Criar Nova Conta de Administrador
              </DialogTitle>
              <DialogDescription>
                Crie uma nova conta para acessar o painel administrativo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={newAdmin.full_name}
                  onChange={(e) => setNewAdmin(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Digite o email"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Digite a senha"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={createAdmin}>
                Criar Conta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isCollaboratorDialogOpen} onOpenChange={setIsCollaboratorDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Conta Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Criar Nova Conta de Colaborador
              </DialogTitle>
              <DialogDescription>
                Colaboradores têm os mesmos direitos dos administradores, exceto gerenciar contas.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="collab_full_name">Nome Completo</Label>
                <Input
                  id="collab_full_name"
                  value={newCollaborator.full_name}
                  onChange={(e) => setNewCollaborator(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div>
                <Label htmlFor="collab_email">Email</Label>
                <Input
                  id="collab_email"
                  type="email"
                  value={newCollaborator.email}
                  onChange={(e) => setNewCollaborator(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Digite o email"
                />
              </div>
              <div>
                <Label htmlFor="collab_password">Senha</Label>
                <Input
                  id="collab_password"
                  type="password"
                  value={newCollaborator.password}
                  onChange={(e) => setNewCollaborator(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Digite a senha"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCollaboratorDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={createCollaborator}>
                Criar Colaborador
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Admins</p>
                <p className="text-2xl font-bold">{adminUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contas Ativas</p>
                <p className="text-2xl font-bold">{adminUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Última Criação</p>
                <p className="text-sm font-medium">
                  {adminUsers.length > 0 
                    ? formatDate(adminUsers[0].created_at) 
                    : 'Nenhuma'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Contas de Administrador
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : adminUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma conta encontrada</h3>
              <p className="text-muted-foreground">
                Crie uma nova conta de administrador para começar.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </TableHead>
                  <TableHead>Nome Completo</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Criado em
                    </div>
                  </TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.email}</TableCell>
                    <TableCell>{admin.full_name}</TableCell>
                    <TableCell>{formatDate(admin.created_at)}</TableCell>
                    <TableCell>{formatDate(admin.last_login_at)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={admin.role === 'admin' ? 'default' : 'secondary'} 
                        className="capitalize"
                      >
                        {admin.role === 'admin' ? '👑 Admin' : '🤝 Colaborador'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="flex items-center gap-1 w-fit">
                        <Shield className="h-3 w-3" />
                        Ativo
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {admin.id === currentUser?.id && (
                          <Badge variant="outline" className="text-xs">
                            Você
                          </Badge>
                        )}
                        {admin.id !== currentUser?.id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Conta de Administrador</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a conta de "{admin.full_name}"? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteAdmin(admin.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Site Settings Section */}
      <SiteSettingsManager />
    </div>
  );
}