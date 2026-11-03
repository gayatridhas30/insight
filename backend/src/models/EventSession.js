import mongoose from 'mongoose';

const eventSessionSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    speakerName: {
      type: String,
      default: '',
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    roomOrLink: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('EventSession', eventSessionSchema);
