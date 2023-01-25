const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');

router.get('/', (req, res) => {
  let posts = [];
  User.findOne({_id: req.user._id}, 'posts friends')
  .populate({
    path: 'posts',
    options: {
      sort : {postedAt: -1}
    },
    limit: 3,
    populate : {
      path: 'author',
      select: 'name image'
    }
  })
  .populate({
    path:'friends',
    select: 'posts',
    populate: {
      path: 'posts',
      options: {
        sort : {postedAt: -1},
      },
      limit: 3,
      populate: {
        path: 'author',
        select: 'name image'
      }
    },
  })
  .exec((err, user) => {
    posts = [...user.posts];
    user.friends.forEach(friend => {
      posts = [...posts, ...friend.posts];
    });
    res.json(posts);
    // res.json(user)
  })
});
;

router.get('/users', (req, res) => {
  User.findOne({_id: req.user._id}, 'friends', (err, user) => {
    User.find({_id : {$nin : [req.user._id, ...user.friends]}}, '_id name image', (err, users) => {
      res.json(users);
    })
  })
});

router.get('/friends', (req, res) => {
  User.findOne({_id: req.user._id}, 'friends')
  .populate('friends', '_id name image')
  .exec((err, user) => {
    res.json(user.friends);
  })
})

module.exports = router;