const fs = require('fs');
const path = require('path');

const rnPkgPath = path.join(__dirname, '..', 'node_modules', 'react-native', 'package.json');
const polyfillPath = path.join(__dirname, '..', 'node_modules', 'react-native', 'rn-get-polyfills.js');

try {
  if (fs.existsSync(rnPkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(rnPkgPath, 'utf8'));
    if (pkg.exports && !pkg.exports['./rn-get-polyfills']) {
      pkg.exports['./rn-get-polyfills'] = './rn-get-polyfills.js';
      fs.writeFileSync(rnPkgPath, JSON.stringify(pkg, null, 2), 'utf8');
      console.log('✅ Patched react-native package.json exports');
    }
    if (!fs.existsSync(polyfillPath)) {
      fs.writeFileSync(polyfillPath, 'module.exports = () => [];\n', 'utf8');
      console.log('✅ Created react-native rn-get-polyfills.js');
    }
  }
} catch (e) {
  console.warn('⚠️ Warning patching react-native:', e);
}
