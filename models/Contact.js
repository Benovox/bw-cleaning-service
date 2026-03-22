const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s'-]+$/.test(v); // Allows letters, spaces, apostrophes, hyphens
      },
      message: 'Name contains invalid characters'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
      'Please enter a valid email address'
    ],
    maxlength: [100, 'Email cannot exceed 100 characters']
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(v);
      },
      message: 'Please enter a valid phone number (e.g., +1234567890)'
    }
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    minlength: [10, 'Message must be at least 10 characters'],
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
    trim: true
  },
  date: { 
    type: Date, 
    default: Date.now,
    immutable: true // Prevents modification after creation
  },
  status: {
    type: String,
    enum: ['new', 'read', 'archived'],
    default: 'new'
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add index for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ date: -1 });
contactSchema.index({ status: 1 });

module.exports = mongoose.model('Contact', contactSchema);