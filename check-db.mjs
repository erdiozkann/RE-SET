import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const checks = [
  { table: 'hero_contents', mode: 'head' },
  { table: 'about_contents', mode: 'head' },
  { table: 'contact_info', mode: 'head' },
  { table: 'services', mode: 'head' },
  { table: 'methods', mode: 'head' },
  { table: 'appointments', mode: 'head' },
  { table: 'users', mode: 'head' },
  { table: 'clients', mode: 'head' },
  { table: 'reviews', mode: 'head' },
  { table: 'blog_posts', mode: 'head' },
];

async function checkTable({ table }) {
  const { error, count } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error(`FAIL ${table}: ${error.message} (${error.code || 'no-code'})`);
    return false;
  }

  console.log(`OK ${table}: count=${count ?? 'unknown'}`);
  return true;
}

async function run() {
  console.log('Supabase backend diagnostics started');
  console.log(`URL: ${supabaseUrl}`);

  // Try to sign in as admin first
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.VITE_DEMO_EMAIL,
    password: process.env.VITE_DEMO_PASSWORD
  });

  if (authError) {
    console.log('⚠️ Authentication failed, checking as public/anon...');
  } else {
    console.log(`🔑 Authenticated as ${process.env.VITE_DEMO_EMAIL}`);
  }

  const results = await Promise.all(checks.map(checkTable));
  const failures = results.filter((ok) => !ok).length;

  if (failures > 0) {
    console.error(`Diagnostics finished with ${failures} failure(s).`);
    process.exit(1);
  }

  console.log('Diagnostics finished successfully.');
}

run().catch((error) => {
  console.error('Unexpected diagnostics error:', error);
  process.exit(1);
});
