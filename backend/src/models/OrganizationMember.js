import mongoose from 'mongoose';

const organizationMemberSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'analyst'],
      default: 'member',
    },
    status: {
      type: String,
      enum: ['active', 'invited', 'suspended'],
      default: 'active',
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

organizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

export default mongoose.model('OrganizationMember', organizationMemberSchema);
