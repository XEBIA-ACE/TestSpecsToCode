```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Method to set password
userSchema.methods.setPassword = function (password) {
  this.password = bcrypt.hashSync(password, 10);
};

// Pre-save hook to hash password if modified or new
userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
```