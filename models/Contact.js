const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/.+\@.+\..+/, 'Please enter a valid email']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required']
    },
    message: {
        type: String,
        required: [true, 'Message is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add this line to help with debugging
contactSchema.pre('save', function(next) {
    console.log('Saving contact:', this);
    next();
});

module.exports = mongoose.model('Contact', contactSchema, 'contacts');