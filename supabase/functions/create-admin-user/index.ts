import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'
import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

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

    const { email, password, full_name, user_type = 'admin' } = await req.json()

    if (!email || !password || !full_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if email already exists in admin_users
    const { data: existingUser } = await supabaseClient
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Email already exists in admin_users' }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Try to create user in Supabase Auth
    let authData = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    // If user already exists in Auth, try to get the existing user
    if (authData.error && authData.error.message.includes('already been registered')) {
      console.log('User already exists in Auth, fetching existing user...')
      
      // List users with this email
      const { data: users, error: listError } = await supabaseClient.auth.admin.listUsers()
      
      if (listError) {
        console.error('Error listing users:', listError)
        return new Response(
          JSON.stringify({ error: 'Failed to verify existing user' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      const existingAuthUser = users.users.find(u => u.email === email)
      
      if (!existingAuthUser) {
        return new Response(
          JSON.stringify({ error: 'Email exists but user not found' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      // Use the existing auth user
      authData = { data: { user: existingAuthUser }, error: null }
    } else if (authData.error) {
      console.error('Error creating auth user:', authData.error)
      return new Response(
        JSON.stringify({ error: 'Failed to create auth user' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Hash the password for storage
    const password_hash = await hash(password);

    // Get the user ID from the auth data
    const userId = authData.data?.user?.id
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Failed to get user ID' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create admin user record with the same ID as auth user
    const { data, error } = await supabaseClient
      .from('admin_users')
      .insert({
        id: userId,
        email,
        password_hash,
        full_name,
        user_type
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating admin user:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create admin user' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ data }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in create-admin-user function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})