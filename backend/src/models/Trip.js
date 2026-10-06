import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  days: {
    type: Number,
    min: 1,
    max: 30,
    default: 3,
  },
  nights: {
    type: Number,
    min: 0,
    max: 29,
    default: 2,
  },
  travelers: {
    type: Number,
    min: 1,
    max: 20,
    default: 2,
  },
  budget: {
    type: Number,
    min: 1,
    max: 10000000,
    required: true,
  },
  status: {
    type: String,
    enum: ['planned', 'confirmed', 'draft'],
    default: 'planned',
  },
  image: {
    type: String,
    maxlength: 1000,
    default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400',
  },
  weather: {
    temp: { type: Number, default: 20 },
    condition: { type: String, default: 'Partly Cloudy' },
    icon: { type: String, default: '⛅' },
  },
  activities: {
    type: [{ type: String, trim: true, maxlength: 200 }],
    default: [],
  },
  travelStyle: {
    type: [{ type: String, trim: true, maxlength: 50 }],
    default: [],
  },
  notes: {
    type: String,
    maxlength: 2000,
    default: '',
  },
}, {
  timestamps: true,
  toJSON: {
    transform(_document, result) {
      result.id = result._id.toString();
      delete result._id;
      delete result.__v;
      delete result.userId;
    },
  },
});

tripSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Trip', tripSchema);
