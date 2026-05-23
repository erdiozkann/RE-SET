import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('--- Testing blog_posts table columns ---');
  // Try to select the specific columns we suspect are missing
  const { data: blogData, error: blogError } = await supabase
    .from('blog_posts')
    .select('id, title, category, read_time, featured, status')
    .limit(1);

  if (blogError) {
    if (blogError.message.includes('column')) {
      console.error('❌ CONFIRMED: Column mismatch in blog_posts!');
      console.error('Error message:', blogError.message);
    } else {
      console.error('❌ blog_posts fetch failed for another reason:', blogError.message);
    }
  } else {
    console.log('✅ blog_posts columns verified successfully!');
  }

  console.log('\n--- Testing users table columns ---');
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, name, role')
    .limit(1);

  if (userError) {
    console.error('❌ users fetch failed:', userError.message);
  } else {
    console.log('✅ users columns verified successfully!');
  }
}

checkSchema();
