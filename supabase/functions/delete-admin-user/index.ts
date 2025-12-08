import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { user_id, delete_all_except } = await req.json()

    // If delete_all_except is provided, delete all users except that email
    if (delete_all_except) {
      console.log('Deleting all users except:', delete_all_except);
      
      const { data: users, error: listError } = await supabaseClient.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error listing users:', listError);
        return new Response(
          JSON.stringify({ error: `Failed to list users: ${listError.message}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const usersToDelete = users.users.filter(u => u.email !== delete_all_except);
      console.log('Users to delete:', usersToDelete.length);

      const results = [];
      for (const user of usersToDelete) {
        console.log('Deleting user:', user.email);
        
        // Delete from profiles first
        await supabaseClient.from('profiles').delete().eq('id', user.id);
        
        // Delete from user_roles
        await supabaseClient.from('user_roles').delete().eq('user_id', user.id);
        
        // Delete from auth.users
        const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`Error deleting user ${user.email}:`, deleteError);
          results.push({ email: user.email, success: false, error: deleteError.message });
        } else {
          console.log(`Successfully deleted user: ${user.email}`);
          results.push({ email: user.email, success: true });
        }
      }

      return new Response(
        JSON.stringify({ success: true, deleted: results }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Single user deletion
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Deleting single user:', user_id);

    // Delete from profiles
    await supabaseClient.from('profiles').delete().eq('id', user_id);
    
    // Delete from user_roles
    await supabaseClient.from('user_roles').delete().eq('user_id', user_id);
    
    // Delete from auth.users
    const { error } = await supabaseClient.auth.admin.deleteUser(user_id);

    if (error) {
      console.error('Error deleting user:', error);
      return new Response(
        JSON.stringify({ error: `Failed to delete user: ${error.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('User deleted successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in delete-admin-user function:', error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message || 'Unknown error'}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})