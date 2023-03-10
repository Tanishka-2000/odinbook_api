const mongoose = require('mongoose');

const notificationSchema = ({
  domain: {
    type: String,
    enum: ['commented on post', 'post shared', 'unfriend']
  },
  userId: {type: mongoose.ObjectId, ref: 'User'},
  postId: {type: mongoose.ObjectId, ref: 'Post'} 
});


const requestSchema = ({
  domain: {
    type: String,
    enum: ['recieved, sent']
  },
  userId: {type: mongoose.ObjectId, ref: 'User'},
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
    facebookId: String
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