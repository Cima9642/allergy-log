import mongoose from 'mongoose';

// Define the array of oil types
const OIL_TYPES = [
    'Peanut',
    'Canola',
    'Vegetable',
    'Olive',
    'Coconut',
    'Sunflower',
    'Sesame',
    'Avocado',
    'Grapeseed',
    'Walnut',
    'Almond',
    'Corn',
    'Soybean',
    'Mixed/Other'
];

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Restaurant name is required'],
        trim: true,
    },
    oilType: {
        type: String,
        required: [true, 'Oil type is required'],
        enum: {
            values: OIL_TYPES,
            message: '{VALUE} is not a valid oil type'
        }
    },
    submittedDate: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamp: true
});

export default mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
