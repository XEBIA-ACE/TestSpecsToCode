/**
 * Server entry point
 */

'use strict';

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`User_Management service listening on port ${PORT}`);
});
