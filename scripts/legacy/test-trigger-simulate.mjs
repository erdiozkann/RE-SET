import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.VITE_DEMO_EMAIL,
    password: process.env.VITE_DEMO_PASSWORD
  });

  if (authError) {
    console.error('Auth error:', authError.message);
    return;
  }

  const testId = '00000000-0000-0000-0000-' + Math.floor(Math.random() * 100000000000).toString().padStart(12, '0');
  const testEmail = `simulate_trigger_${Date.now()}@example.com`;

  // CTE insert query
  const query = `
    WITH inserted AS (
      INSERT INTO public.users (id, email, name, role, approved, phone)
      VALUES (
        '${testId}'::uuid,
        '${testEmail}',
        'Simulate Trigger',
        'CLIENT',
        FALSE,
        '05555555555'
      )
      RETURNING *
    )
    SELECT id, email, name, role, approved, phone FROM inserted
  `;

  console.log(`Running CTE insert test with email: ${testEmail}...`);
  const { data, error } = await supabase.rpc('exec_query', { query_text: query });

  if (error) {
    console.error('RPC Error:', error);
  } else {
    console.log('Result:', data);
    if (data && data.error) {
      console.log('❌ Database returned error:', data.error);
    } else {
      console.log('✅ Insert simulation succeeded!');
      // Clean up the inserted test record
      const { error: deleteError } = await supabase.rpc('exec_query', { 
        query_text: `WITH deleted AS (DELETE FROM public.users WHERE id = '${testId}'::uuid RETURNING *) SELECT 1 FROM deleted` 
      });
      if (deleteError) {
        console.error('Cleanup failed:', deleteError);
      } else {
        console.log('🧹 Cleanup completed.');
      }
    }
  }
}

run();
