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

async function checkTable(tableName: string) {
    console.log(`Checking table: ${tableName}...`);
    const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error(`❌ Error accessing ${tableName}:`, error.message, error.code);
    } else {
        console.log(`✅ ${tableName}: Accessible. Count: ${count}`);
        if (count === 0) {
            console.warn(`⚠️  ${tableName} is empty! This might be why the site is blank.`);
        }
    }
}

async function runDiagnostics() {
    console.log('--- Supabase Diagnostics ---');
    console.log(`URL: ${supabaseUrl}`);

    await checkTable('hero_contents');
    await checkTable('about_contents');
    await checkTable('contact_info');
    await checkTable('services');
    await checkTable('methods');

    console.log('--- End Diagnostics ---');
}

runDiagnostics();
