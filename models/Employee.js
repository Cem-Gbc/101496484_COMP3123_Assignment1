const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: 50,
    },
    last_name: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: 100,
      match: [/^\S+@\S+\.\S+$/, 'Email is not valid'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
      maxlength: 50,
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      validate: {
        validator: (value) => value > 0,
        message: 'Salary must be a positive number',
      },
    },
    date_of_joining: {
      type: Date,
      required: [true, 'Date of joining is required'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      maxlength: 50,
    },
    // The user who created (owns) this employee.
    // It always comes from the logged-in user's JWT, never from the request body.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee must belong to a user'],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Index on { user, email }:
// - makes "find all employees of this user" fast
// - one user cannot add two employees with the same email
//   (two different users can each have an employee with the same email)
employeeSchema.index({ user: 1, email: 1 }, { unique: true });

// Hide the internal __v field in API responses
employeeSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Employee', employeeSchema);
