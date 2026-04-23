const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatMessage = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
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

module.exports = mongoose.model('ChatMessage', ChatMessage);