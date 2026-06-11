const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testColumn(col) {
  const { data, error } = await supabase.from('reading_questions').select(col).limit(1);
  console.log(`Checking column: ${col}`);
  console.log('Success?', !error);
  if (error) {
    console.log('Error Code:', error.code);
    console.log('Error Message:', error.message);
  }
  console.log('------------------');
}

async function run() {
  await testColumn('passage_id');
  await testColumn('reading_passage_id');
  await testColumn('passageId');
}

run().catch(console.error);
