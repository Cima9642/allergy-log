import mongoose from 'mongoose';

const OIL_TYPES = ['Peanut','Canola','Vegetable','Olive','Coconut','Sunflower','Sesame','Avocado','Grapeseed','Walnut','Almond','Corn','Soybean','Mixed/Other'];

const restaurantSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Restaurant name is required'], 
    trim: true,
    lowercase: true,
    index: true
  },
  
  // ===== VERIFICATION VOTES =====
  votes: [
    {
      oilType: {
        type: String,
        enum: OIL_TYPES,
        required: true
      },
      ipAddress: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  
  // ===== VERIFICATION STATUS =====
  verified: {
    type: Boolean,
    default: false
  },
  
  // ===== CONSENSUS OIL TYPE =====
  consensusOilType: {
    type: String,
    enum: OIL_TYPES
  },
  
  // ===== TIMESTAMPS =====
  submittedDate: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

export default mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);