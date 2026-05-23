import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignUp() {
  const email = `testuser_${Date.now()}@gmail.com`;
  const password = 'TestPassword123!';
  const name = 'Test User';
  const phone = '05555555555';

  console.log(`Attempting signup with email: ${email}`);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone }
      }
    });

    if (error) {
      console.error('❌ Sign up failed!');
      console.error(JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Sign up succeeded!');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testSignUp();
