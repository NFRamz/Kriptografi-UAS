const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Text colors
    content = content.replace(/text-white/g, 'text-gray-900');
    content = content.replace(/text-gray-400/g, 'text-gray-600');
    content = content.replace(/text-gray-300/g, 'text-gray-700');
    
    // Backgrounds
    content = content.replace(/bg-black\/[0-9]+/g, 'bg-white');
    content = content.replace(/bg-black/g, 'bg-white');
    content = content.replace(/bg-white\/5/g, 'bg-gray-50');
    content = content.replace(/bg-white\/10/g, 'bg-gray-100');
    content = content.replace(/bg-white\/20/g, 'bg-gray-200');
    
    // Borders
    content = content.replace(/border-white\/10/g, 'border-gray-200');
    content = content.replace(/border-white\/20/g, 'border-gray-300');
    content = content.replace(/border-white\/5/g, 'border-gray-100');
    
    // Glows and specific colors
    content = content.replace(/text-green-400/g, 'text-green-600');
    content = content.replace(/bg-green-500\/20/g, 'bg-green-100');
    content = content.replace(/bg-green-500\/10/g, 'bg-green-50');
    content = content.replace(/text-red-500/g, 'text-red-600');
    content = content.replace(/bg-red-500\/5/g, 'bg-red-50');
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Class replacement complete.');
