import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'data', 'admin.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }

  db.all('SELECT email, name FROM users', (err, rows) => {
    if (err) {
      console.error('Error querying users:', err);
    } else {
      console.log('Users in database:');
      if (rows && rows.length > 0) {
        rows.forEach(row => {
          console.log(`  - ${row.email} (${row.name})`);
        });
      } else {
        console.log('  No users found');
      }
    }
    db.close();
    process.exit(0);
  });
});
