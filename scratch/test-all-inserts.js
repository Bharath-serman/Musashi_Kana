const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

async function testInsert(table, record) {
  const { data, error } = await supabase.from(table).insert([record]).select();
  console.log(`Table: ${table}`);
  console.log('Data:', data);
  console.log('Error:', error);
  console.log('------------------');
  if (data && data.length > 0) {
    // Clean up
    const { error: delError } = await supabase.from(table).delete().eq('id', data[0].id);
    console.log(`Clean up ${table}:`, delError ? 'failed' : 'success');
  }
}

async function run() {
  await testInsert('quiz_questions', { level: 'N5', prompt: 'test prompt', choice_1: 'a', choice_2: 'b', choice_3: 'c', choice_4: 'd', answer: 'a' });
  await testInsert('flashcards', { level: 'N5', front: 'test front', reading: 'test read', meaning: 'test mean', example: 'test ex', note: 'test note', type: 'vocab' });
  await testInsert('grammar_lessons', { level: 'N5', pattern: 'test pat', topic: 'test top', title: 'test title', brief: 'test brief', notes: ['note'], examples: [{ jp: 'jp', en: 'en' }], chart: { headers: ['h'], rows: [['r']] } });
  await testInsert('reading_passages', { level: 'N5', title: 'test title', japanese: 'test jp', translation: 'test trans' });
}

run().catch(console.error);
