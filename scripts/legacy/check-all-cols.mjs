import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  console.log('--- Logging in to check schema ---');
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.VITE_DEMO_EMAIL,
    password: process.env.VITE_DEMO_PASSWORD
  });

  if (authError) {
    console.error('Auth error:', authError.message);
    return;
  }

  console.log('--- Checking blog_posts ---');
  const { data: bData, error: bError } = await supabase.from('blog_posts').select('*').limit(1);
  if (bError) {
     console.log('🔴 BLOG_POSTS SCHEMA ERROR:', bError.message);
  } else {
     console.log('✅ BLOG_POSTS columns:', bData.length > 0 ? Object.keys(bData[0]) : 'Table empty but exists');
  }

  console.log('--- Checking podcast_episodes ---');
  const { data: pData, error: pError } = await supabase.from('podcast_episodes').select('*').limit(1);
  if (pError) {
     console.log('🔴 PODCAST_EPISODES SCHEMA ERROR:', pError.message);
  } else {
     console.log('✅ PODCAST_EPISODES columns:', pData.length > 0 ? Object.keys(pData[0]) : 'Table empty but exists');
  }
}

check();
