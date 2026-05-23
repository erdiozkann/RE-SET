import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.rpc('get_column_names', { table_name: 'blog_posts' });
  
  if (error) {
    // If RPC doesn't exist, try querying directly from information_schema (if permissions allow)
    // or just try to insert a fake record and see the error.
    console.log('RPC failed, trying manual column detection');
    const { data: cols, error: colError } = await supabase.from('blog_posts').select('*').limit(0);
    if (colError) {
      console.error('Manual fetch error:', colError);
    } else {
      // In some cases, select * with limit 0 returns headers if table exists
      // But usually we need a row.
      console.log('Select * limit 0 results:', cols);
    }
  } else {
    console.log('Columns from RPC:', data);
  }

  // Alternative: fetch one row and check keys
  const { data: row } = await supabase.from('blog_posts').select('*').limit(1).maybeSingle();
  if (row) {
    console.log('Row keys:', Object.keys(row));
  } else {
    console.log('No rows found in blog_posts');
  }
}

run();
