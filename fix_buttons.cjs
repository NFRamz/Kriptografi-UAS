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
    
    // Fix text on colored backgrounds
    // Find bg-primary ... text-gray-900
    content = content.replace(/(bg-(?:primary|accent|gradient-[a-z]+|green-[0-9]+|red-[0-9]+)[^"]*?)text-gray-900/g, '$1text-white');
    // For text-black we should also make it text-white if it's on primary/accent
    content = content.replace(/(bg-(?:primary|accent|gradient-[a-z]+|green-[0-9]+|red-[0-9]+)[^"]*?)text-black/g, '$1text-white');

    // Remove text-gray-900 from elements that have primary colors
    content = content.replace(/text-primary text-gray-900/g, 'text-primary');
    content = content.replace(/text-accent text-gray-900/g, 'text-accent');
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Button text colors restored to white where appropriate.');
