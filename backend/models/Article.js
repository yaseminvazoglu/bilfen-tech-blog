const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'Genel' },
  author: { type: String, required: true },
  likes: { type: Number, default: 0 },
  comments: [commentSchema],
  imageUrl: { type: String, default: '' }, // YENİ: Kapak fotoğrafı yolu
  publishDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Article', articleSchema);