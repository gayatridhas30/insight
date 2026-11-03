import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide organization name'],
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    logo: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['college', 'club', 'company', 'ngo', 'other'],
      default: 'college',
    },
    website: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Organization', organizationSchema);
