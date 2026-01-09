const mongoose = require('mongoose');

const ReadingSchema = new mongoose.Schema(
  {
    CreatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'CreatedBy is required'],
    },
    diastolic: {
      type: Number,
      required: true,
    },
    systolic: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Reading', ReadingSchema);
