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

  // Query triggers on auth.users
  console.log('--- Triggers on auth.users ---');
  const triggerQuery = `
    SELECT tgname, tgenabled, proname, lanname, prosrc, rolname as owner
    FROM pg_trigger 
    JOIN pg_proc ON pg_proc.oid = tgfoid 
    JOIN pg_language ON pg_language.oid = prolang
    JOIN pg_roles ON pg_roles.oid = proowner
    WHERE tgrelid = 'auth.users'::regclass
  `;
  
  const { data: triggers, error: triggerError } = await supabase.rpc('exec_query', { query_text: triggerQuery });
  if (triggerError) {
    console.error('Failed to run exec_query RPC:', triggerError.message);
  } else {
    console.log('Triggers:', triggers);
  }

  // Query policies on public.users
  console.log('\n--- Policies on public.users ---');
  const policyQuery = `
    SELECT policyname, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'users'
  `;
  const { data: policies } = await supabase.rpc('exec_query', { query_text: policyQuery });
  console.log('Policies:', policies);

  // Check users table schema & constraints
  console.log('\n--- Constraints on public.users ---');
  const constraintQuery = `
    SELECT conname, pg_get_constraintdef(oid) 
    FROM pg_constraint 
    WHERE conrelid = 'public.users'::regclass
  `;
  const { data: constraints } = await supabase.rpc('exec_query', { query_text: constraintQuery });
  console.log('Constraints:', constraints);

  // Run insert simulation
  console.log('\n--- Running Insert Simulation ---');
  const testId = '00000000-0000-0000-0000-' + Math.floor(Math.random() * 100000000000).toString().padStart(12, '0');
  const testEmail = `simulate_trigger_${Date.now()}@example.com`;
  const simQuery = `
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
  const { data: simResult } = await supabase.rpc('exec_query', { query_text: simQuery });
  console.log('Simulation result:', simResult);

  if (simResult && simResult.error) {
    console.log('❌ Database returned error during simulate insert:', simResult.error);
  } else if (simResult && simResult.length > 0) {
    console.log('✅ Insert simulation succeeded! Cleaning up...');
    await supabase.rpc('exec_query', { 
      query_text: `DELETE FROM public.users WHERE id = '${testId}'::uuid` 
    });
    console.log('🧹 Cleanup completed.');
  } else {
    console.log('⚠️ No result from simulation');
  }
}

run();
