const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead:{
        type: Boolean,
        default: false
    }
},{timestamps: true});

module.exports = mongoose.model('Chat', ChatSchema);