import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

export function CreateAdminButton() {
  const [isCreating, setIsCreating] = useState(false);

  const createNewAdmin = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: 'rubensvieira.email@gmail.com',
          password: '121212',
          full_name: 'Rubens Vieira',
          user_type: 'admin'
        }
      });

      if (error) {
        console.error('Erro ao criar admin:', error);
        toast.error(`Erro ao criar administrador: ${error.message}`);
        return;
      }

      console.log('Admin criado com sucesso:', data);
      toast.success('Administrador Rubens Vieira criado com sucesso!');
      
      // Recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado ao criar administrador');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={createNewAdmin}
      disabled={isCreating}
      variant="default"
      size="lg"
      className="gap-2"
    >
      {isCreating ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Criando...
        </>
      ) : (
        <>
          <UserPlus className="h-5 w-5" />
          Criar Admin: Rubens Vieira
        </>
      )}
    </Button>
  );
}
