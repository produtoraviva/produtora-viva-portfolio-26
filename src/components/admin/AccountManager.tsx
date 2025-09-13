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
import { Plus, Trash2, Users, Shield, Mail, Calendar, Key } from 'lucide-react';
import bcrypt from 'bcryptjs';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_login_at?: string;
}

export function AccountManager() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAdmin();

  // Form state for new admin
  const [newAdmin, setNewAdmin] = useState({
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
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, full_name, created_at, last_login_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminUsers(data || []);
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
      // Hash the password
      const passwordHash = await bcrypt.hash(newAdmin.password, 10);
      
      // For admin creation, we need to use the service role
      // Since RLS is blocking insertions, we'll call an Edge Function
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: newAdmin.email,
          password_hash: passwordHash,
          full_name: newAdmin.full_name,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Nova conta de administrador criada com sucesso!',
      });

      // Reset form and close dialog
      setNewAdmin({ email: '', password: '', full_name: '' });
      setIsDialogOpen(false);
      loadAdminUsers();
    } catch (error) {
      console.error('Error creating admin:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar conta de administrador.',
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
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
    </div>
  );
}