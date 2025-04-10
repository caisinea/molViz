const fs = require('fs');
const path = require('path');
const sass = require('sass');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Compile SCSS to CSS
const result = sass.compile(path.join('node_modules', 'molstar', 'lib', 'mol-plugin-ui', 'skin', 'light.scss'));
fs.writeFileSync(path.join('dist', 'molstar.css'), result.css);

// Copy PDB file
fs.copyFileSync(path.join('src', 'hexokinase.pdb'), path.join('dist', 'hexokinase.pdb'));

// Copy HTML file
fs.copyFileSync(path.join('src', 'index.html'), path.join('dist', 'index.html')); 