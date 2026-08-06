```javascript
const express = require('express');
const bodyParser = require('body-parser');
const userProfileRoutes = require('./routes/userProfileRoutes');
const { userProfileUpdateValidation } = require('./validators/userProfileValidator');

const app = express();

app.use(bodyParser.json());

// Integrate user profile routes with validation middleware
app.use('/api', userProfileUpdateValidation, userProfileRoutes);

module.exports = app;
```