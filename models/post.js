const mongoose = require('mongoose');

// const postSchema = new mongoose.Schema({
//   name: {type:String},
//   priority: {type: Number}
// });

const commentSchema = new mongoose.Schema({
  author : { type: mongoose.ObjectId, ref: 'User'},
  postedAt : Date,
  message : String
});

const postSchema = new mongoose.Schema({
  author: { type: mongoose.ObjectId, ref: 'User'},
  message: String,
  imageUrl : String,
  tags: [String],
  postedAt: Date,
  likes: Number,
  comments: [commentSchema]
});

module.exports = mongoose.model('Post', postSchema);