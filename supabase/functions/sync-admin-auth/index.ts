import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, password, admin_user_id } = await req.json()

    if (!email || !password || !admin_user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if auth user already exists
    const { data: existingAuthUser } = await supabaseClient.auth.admin.listUsers()
    const authUserExists = existingAuthUser.users.find(u => u.email === email)

    if (authUserExists) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Auth user already exists',
          user_id: authUserExists.id
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to create auth user' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the old admin user data before deleting
    const { data: oldAdmin, error: fetchError } = await supabaseClient
      .from('admin_users')
      .select('*')
      .eq('id', admin_user_id)
      .single()

    if (fetchError || !oldAdmin) {
      console.error('Error fetching admin user:', fetchError)
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ error: 'Admin user not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Delete the old admin_users record
    const { error: deleteError } = await supabaseClient
      .from('admin_users')
      .delete()
      .eq('id', admin_user_id)

    if (deleteError) {
      console.error('Error deleting old admin user:', deleteError)
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ error: 'Failed to delete old admin user' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create new admin_users record with the Supabase Auth user ID
    const { error: insertError } = await supabaseClient
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email: oldAdmin.email,
        password_hash: oldAdmin.password_hash,
        full_name: oldAdmin.full_name,
        user_type: oldAdmin.user_type,
        last_login_at: oldAdmin.last_login_at
      })

    if (insertError) {
      console.error('Error creating new admin user:', insertError)
      // Clean up: delete the auth user if admin_users insert fails
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ error: 'Failed to create new admin user' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        user_id: authData.user.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in sync-admin-auth function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
