const mongoose = require('mongoose');

const notificationSchema = ({
  domain: {
    type: String,
    enum: ['post liked', 'commented on post', 'post shared', 'unfriend']
  },
  id: mongoose.ObjectId // Can be either postId or userId(domain:unfriend)
});


const requestSchema = ({
  domain: {
    type: String,
    enum: ['recieved, sent']
  },
  userId: mongoose.ObjectId, // for received request
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined']
  },
  date: Date
});

const userSchema = new mongoose.Schema({
  credentials: {
    email: String,
    passwordHash: String,
  },
  name: String,
  image: String,
  profile: {
    highSchool: [String],
    college: [String],
    homeTown: String,
    currentCity: String,
    workExperience: [String],
    contactInfo: {
      email: [String],
      phone: [String],
    },
    gender: { type: String, enum: ['male', 'female', 'other']},
    birthDate: Date,
  },
  friends: [{type: mongoose.ObjectId, ref: 'User'}],
  posts: [{type: mongoose.ObjectId, ref: 'Post'}],
  requests: [requestSchema],
  notifications: [notificationSchema],
  savedPosts: [{type: mongoose.ObjectId, ref: 'Post'}],
  liked: [{type: mongoose.ObjectId, ref: 'Post'}]
});

module.exports = mongoose.model('User', userSchema);