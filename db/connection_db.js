import dbRootPasswd from './dbSecret.js';
import createPool from 'arangojs'

let pool;

try {
   pool = await createPool({
    url: 'http://localhost:8529',
    databaseName: 'watchwise',
    auth: { username: 'root', password: dbRootPasswd },
    max: 5, 
    min: 1, 
    idleTimeoutMillis: 86400000, 
    connectionTimeoutMillis: 360000, 
  });
} catch(err) {
  console.log(err);
}

export default pool;