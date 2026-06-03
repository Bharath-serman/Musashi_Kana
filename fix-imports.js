const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./app/[level]', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // For app/[level]/page.tsx
    if (filePath.replace(/\\/g, '/').endsWith('app/[level]/page.tsx')) {
      content = content.replace(/from "\.\/components/g, 'from "../components');
    }
    // For anything inside a subdirectory of app/[level] (e.g. app/[level]/flashcards/page.tsx)
    // Wait, the path will be app\[level]\flashcards\page.tsx
    // The depth is 4 (app, [level], flashcards, page.tsx). 
    // From app/[level]/flashcards, to reach app/components: ../../components
    else if (filePath.split(path.sep).length === 4) {
      content = content.replace(/from "\.\.\/components/g, 'from "../../components');
      content = content.replace(/from "\.\.\/lib/g, 'from "../../lib');
      content = content.replace(/from "\.\.\/data/g, 'from "../../data');
      content = content.replace(/from "\.\.\/grammar-content/g, 'from "../../grammar-content');
    }
    // For depth 5 e.g. app/[level]/grammar/[slug]/page.tsx
    else if (filePath.split(path.sep).length === 5) {
      content = content.replace(/from "\.\.\/\.\.\/components/g, 'from "../../../components');
      content = content.replace(/from "\.\.\/\.\.\/lib/g, 'from "../../../lib');
      content = content.replace(/from "\.\.\/\.\.\/data/g, 'from "../../../data');
      content = content.replace(/from "\.\.\/grammar-content/g, 'from "../../grammar-content'); // wait, grammar-content is in app/[level]/grammar, so from grammar/[slug] it is ../grammar-content. That remains correct!
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed imports in', filePath);
    }
  }
});
