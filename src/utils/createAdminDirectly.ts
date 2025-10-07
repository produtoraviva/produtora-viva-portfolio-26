import { supabase } from "@/integrations/supabase/client";

export async function createAdminDirectly() {
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
      return { success: false, error };
    }

    console.log('Admin criado com sucesso:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erro inesperado:', error);
    return { success: false, error };
  }
}

// Para executar no console do navegador:
// import { createAdminDirectly } from './src/utils/createAdminDirectly'
// createAdminDirectly().then(result => console.log('Resultado:', result))
