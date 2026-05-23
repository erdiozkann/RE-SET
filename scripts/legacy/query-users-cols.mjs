import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  await supabase.auth.signInWithPassword({
    email: process.env.VITE_DEMO_EMAIL,
    password: process.env.VITE_DEMO_PASSWORD
  });

  console.log('--- Checking in auth.users ---');
  const authQuery = `
    SELECT id, email, confirmed_at, created_at 
    FROM auth.users 
    WHERE email = 'aumutozkann@gmail.com'
  `;
  const { data: authData } = await supabase.rpc('exec_query', { query_text: authQuery });
  console.log('Auth Users table record:', authData);

  console.log('\n--- Checking in public.users ---');
  const publicQuery = `
    SELECT id, email, role, approved 
    FROM public.users 
    WHERE email = 'aumutozkann@gmail.com'
  `;
  const { data: publicData } = await supabase.rpc('exec_query', { query_text: publicQuery });
  console.log('Public Users table record:', publicData);
}

run();
