const fs = require('fs');

async function applySakuraTheme() {
  const filePath = 'c:/Users/Hp/Desktop/N5N4/Codex_Test/app/globals.css';
  let buffer = fs.readFileSync(filePath);
  
  // Check encoding by looking for BOM or just try parsing as utf8 and utf16le
  let content = buffer.toString('utf8');
  if (content.includes('\0')) {
    content = buffer.toString('utf16le');
  }

  // 1. Replace variables in :root
  content = content.replace(
    /--ink: #141b28;/,
    '--ink: #2a1f26;'
  ).replace(
    /--muted: #667085;/,
    '--muted: #857078;'
  ).replace(
    /--line: #d8dee8;/,
    '--line: #f2e3e8;'
  ).replace(
    /--soft: #f3f6fa;/,
    '--soft: #fdf8fa;'
  ).replace(
    /--panel: #fbfcff;/,
    '--panel: #fffbfc;'
  ).replace(
    /--blue: #2557d6;/,
    '--blue: #e88ba1;'
  ).replace(
    /--blue-dark: #153a98;/,
    '--blue-dark: #c96078;'
  ).replace(
    /--red: #d84d43;/,
    '--red: #d84d63;'
  ).replace(
    /--shadow: 0 20px 60px rgba\(20, 27, 40, 0\.11\);/,
    '--shadow: 0 20px 60px rgba(42, 31, 38, 0.09);'
  );

  // 2. Replace body background with cinematic animated theme
  const bodyRegex = /body\s*\{[\s\S]*?line-height:\s*1\.5;\s*\}/;
  const newBody = `body {
  margin: 0;
  background: 
    linear-gradient(180deg, rgba(255, 255, 255, 0.6), rgba(253, 248, 250, 0.85)),
    linear-gradient(-45deg, #fce4ec, #f8bbd0, #fff0f5, #ffcdd2);
  background-size: 400% 400%;
  animation: cinematic-bg 20s ease infinite;
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.5;
}

@keyframes cinematic-bg {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`;
  content = content.replace(bodyRegex, newBody);

  // 3. Replace all remaining rgba matching the old colors to the new rgb values
  // Old blue: 37, 87, 214 -> New sakura blue/pink: 232, 139, 161
  content = content.replace(/37,\s*87,\s*214/g, '232, 139, 161');
  
  // Old red: 216, 77, 67 -> New red: 216, 77, 99
  content = content.replace(/216,\s*77,\s*67/g, '216, 77, 99');

  // Old ink rgba: 20, 27, 40 -> New ink rgba: 42, 31, 38
  content = content.replace(/20,\s*27,\s*40/g, '42, 31, 38');

  // Save back using original encoding (mostly likely UTF-8 without BOM if the tool saved it before, but let's just write as utf8)
  fs.writeFileSync(filePath, content, 'utf8');
}

applySakuraTheme().catch(console.error);
