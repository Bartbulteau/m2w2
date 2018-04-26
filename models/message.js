// set up message structure

var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
});

var Message = module.exports = mongoose.model('Message', messageSchema);