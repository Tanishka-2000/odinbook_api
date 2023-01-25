const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');

// index route
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
});

// posts route

router.post('/posts', (req, res) => {
  Post.create({
    author: req.user._id,
    message: req.body.message,
    imageUrl: req.body.imageUrl,
    tags: req.body.tags.split(' '),
    postedAt: Date.now(),
    likes: 0
  }, (err, post) => {
    User.updateOne({_id: req.user._id}, {$push: {posts : post._id}}, (err) => {
      res.status(200).send();
    });
  });
});

// router.post('/posts/:postId/like', async (req, res) => {
//   // check if user has already liked this post
//   const user = await User.findById(req.user._id, 'friends').lean();
//   console.log(typeof user.friends[0]);
//   res.json(true);
// });

module.exports = router;
