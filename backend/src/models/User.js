import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'host', 'participant'],
      default: 'host',
      index: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      default: '',
    },
    preferences: {
      language: {
        type: String,
        default: 'en',
        enum: ['en', 'hi', 'mr'],
      },
      theme: {
        type: String,
        default: 'light',
        enum: ['light', 'dark'],
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export default mongoose.model('User', userSchema);
