```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: 'yourDatabaseUser',
  host: 'localhost',
  database: 'yourDatabaseName',
  password: 'yourDatabasePassword',
  port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
```