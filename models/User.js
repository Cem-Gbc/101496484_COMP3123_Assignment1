const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// How much work bcrypt does when hashing (higher = slower = harder to crack)
const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true, // "Alice" and "alice" are the same user
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
      match: [/^\S+@\S+\.\S+$/, 'Email is not valid'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // never returned by queries unless we ask for it
    },
  },
  {
    // Mongoose fills created_at and updated_at automatically
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Hash the password before it is saved (only when it is new or changed)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

// Check a plain text password against the saved hash
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Never send the password hash (or __v) in API responses
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
