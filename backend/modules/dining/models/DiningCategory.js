import mongoose from 'mongoose';

const diningCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String, // URL
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const DiningCategory = mongoose.model('DiningCategory', diningCategorySchema);
export default DiningCategory;
