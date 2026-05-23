import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  console.log('--- Checking podcast_episodes ---');
  const testPodcast = {
    title: 'Schema Check TEST',
    description: 'Checking for columns...',
    audio_url: 'https://test.com/audio.mp3',
    duration: '10:00',
    date: new Date().toISOString().split('T')[0],
    episode: '1',
    category: 'Test',
    image: 'https://test.com/img.jpg'
  };

  const { data, error } = await supabase
    .from('podcast_episodes')
    .insert([testPodcast])
    .select();

  if (error) {
    console.log('🔴 PODCAST SCHEMA ERROR:', error.message);
  } else {
    console.log('✅ PODCAST SCHEMA OK');
    if (data && data[0]) {
      await supabase.from('podcast_episodes').delete().eq('id', data[0].id);
    }
  }
}

check();
