const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Please add an author'],
    trim: true,
    maxlength: [100, 'Author name cannot be more than 100 characters']
  },
  genre: {
    type: String,
    required: [true, 'Please add a genre'],
    enum: [
      'Fiction', 
      'Non-fiction', 
      'Science Fiction', 
      'Fantasy', 
      'Mystery', 
      'Thriller', 
      'Romance', 
      'Horror', 
      'Biography', 
      'History', 
      'Children', 
      'Young Adult',
      'Science',
      'Self-Help',
      'Other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  publishedYear: {
    type: Number,
    min: [0, 'Published year cannot be negative'],
    max: [new Date().getFullYear(), 'Published year cannot be in the future']
  },
  isbn: {
    type: String,
    match: [/^(?:\d[- ]?){9}[\dXx]$/, 'Please enter a valid ISBN'],
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for title and author for efficient searching
BookSchema.index({ title: 'text', author: 'text' });

// Virtual field for average rating
BookSchema.virtual('averageRating', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'book',
  justOne: false,
  options: { sort: { createdAt: -1 } },
  match: { rating: { $exists: true } },
  pipeline: [
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' }
      }
    }
  ]
});

 
BookSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'book',
  justOne: false,
  options: { sort: { createdAt: -1 } }
});

module.exports = mongoose.model('Book', BookSchema);