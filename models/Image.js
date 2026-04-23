const mongoose = require("mongoose");
/**
 * Image Schema
 * This schema defines the structure for an image document in MongoDB.
 * It includes fields for image URL, public ID, alt text, and the user who created it.
 */

const imageSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true,
        unique: true
    },
    alt: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Image", imageSchema);
