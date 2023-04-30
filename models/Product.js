import mongoose, { Mongoose } from "mongoose";

const Schema = mongoose.Schema ({
    title: {
        type: String,
    },
    thumbnail: {
        type: String,
    },
    price: {
        type: Number,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Number,
    },
    updatedAt: {
        type: Number,
    }
}, 
{
    timestamps: { curentTime: () => Math.floor(Date.now() / 1000) }
})

Schema.virtual('category', {
    ref: 'category',
    localField: 'categoryId',
    foreignField: '_id',
})

export default mongoose.model('Product', Schema);