const fs = require('fs');
const path = require('path');
const https = require('https');

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

const url = env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/?apikey=' + env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Fetching OpenAPI spec from PostgREST...');
https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const spec = JSON.parse(data);
      fs.writeFileSync(path.join(__dirname, 'openapi-spec.json'), JSON.stringify(spec, null, 2));
      console.log('Saved openapi-spec.json successfully!');
      
      const definitions = spec.definitions || spec.components?.schemas;
      if (definitions) {
        console.log('\n--- Reading Questions Schema ---');
        console.log(JSON.stringify(definitions.reading_questions, null, 2));
        
        console.log('\n--- Reading Passages Schema ---');
        console.log(JSON.stringify(definitions.reading_passages, null, 2));

        console.log('\n--- Quiz Questions Schema ---');
        console.log(JSON.stringify(definitions.quiz_questions, null, 2));

        console.log('\n--- Flashcards Schema ---');
        console.log(JSON.stringify(definitions.flashcards, null, 2));

        console.log('\n--- Grammar Lessons Schema ---');
        console.log(JSON.stringify(definitions.grammar_lessons, null, 2));
      } else {
        console.log('Could not find definitions in spec:', Object.keys(spec));
      }
    } catch (err) {
      console.error('Error parsing JSON:', err.message);
      console.log('Data sample:', data.slice(0, 500));
    }
  });
}).on('error', (err) => {
  console.error('Request error:', err.message);
});
