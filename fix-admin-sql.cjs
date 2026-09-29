const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server', 'src', 'routes', 'admin.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Fix the double-quoted string literal "cancelled" in the dashboard SQL
// SQLite treats "cancelled" (double quotes) as a column name, not string literal
// We need single quotes inside the SQL
const before = `'SELECT COUNT(*) as c FROM registrations WHERE status != "cancelled"'`;
const after  = '`SELECT COUNT(*) as c FROM registrations WHERE status != \'cancelled\'`';

if (content.includes(before)) {
  content = content.replace(before, after);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: Fixed dashboard SQL string literal');
} else {
  console.log('Pattern not found, checking raw content...');
  const line14 = content.split('\n')[13];
  console.log('Line 14 raw:', JSON.stringify(line14));
}
