// Copies ../templates into ./app so the templates resolve their imports from this folder's
// node_modules, laid out as they would be in a target app.
const fs = require('node:fs');
const path = require('node:path');

const dest = path.join(__dirname, 'app');
fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(path.join(__dirname, '..', 'templates'), dest, { recursive: true });
