const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  name: {type:String},
  priority: {type: Number}
});

const Post = mongoose.model('Post', postSchema);