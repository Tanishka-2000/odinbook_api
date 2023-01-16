const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {type:String},
  password: {type: String},
  friends: [{type: mongoose.ObjectId, ref:'User' }],
  posts: [{type: mongoose.ObjectId, ref:'Post' }],
});

module.exports = mongoose.model('User', userSchema);