import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  await supabase.auth.signInWithPassword({
    email: process.env.VITE_DEMO_EMAIL,
    password: process.env.VITE_DEMO_PASSWORD
  });

  console.log('--- Checking youtube_videos ---');
  const { data, error } = await supabase.from('youtube_videos').select('*').limit(1);
  if (error) {
     console.log('🔴 YOUTUBE SCHEMA ERROR:', error.message);
  } else {
     console.log('✅ YOUTUBE columns:', data.length > 0 ? Object.keys(data[0]) : 'Table empty but exists');
  }
}

check();
