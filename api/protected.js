const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
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

// ---------current user routes-------- //
router.get('/friends', (req, res) => {
  User.findOne({_id: req.user._id}, 'friends')
  .populate('friends', 'name image')
  .exec((err, user) => {
    res.json(user.friends);
  })
});

router.get('/about', (req, res) => {
  User.findOne({_id: req.user._id}, 'name image profile posts')
  .populate('posts')
  .exec((err, user) => {
    res.json(user);
  });
});

router.get('/saved-posts', (req, res) => {
  User.findOne({_id: req.user._id}, 'savedPosts')
  .populate({
    path:'savedPosts',
    populate: {
      path: 'author',
      select: 'name image'
    }
  })
  .exec((err, user) => {
    res.json(user.savedPosts);
  });
});

router.post('/saved-posts', (req, res) => {
  User.updateOne({_id: req.user._id}, {$push: {savedPosts: req.body.postId}}, (err) => {
    res.status(200).send();
  });
});


// ---------user routes----------//

router.get('/users', (req, res) => {
  User.findOne({_id: req.user._id}, 'friends', (err, user) => {
    User.find({_id : {$nin : [req.user._id, ...user.friends]}}, 'name image', (err, users) => {
      res.json(users);
    })
  })
});

router.get('/users/:userId', (req, res) => {
  User.findOne({_id: req.params.userId}, 'name image profile posts')
  .populate('posts')
  .exec((err, user) => {
    res.json(user);
  });
});

router.get('/users/:userId/friends', (req, res) => {
  User.findOne({_id: req.params.userId}, 'friends')
  .populate('friends', 'name image')
  .exec((err, user) => {
    res.json(user.friends);
  });
});

// ---------posts route --------------//

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

router.post('/posts/:postId/like', async (req, res) => {
  
  // check if user has already liked this post
  const user = await User.findById(req.user._id, 'liked').lean();
  const alreadyLiked = user.liked.some(post => post.equals(req.params.postId));
  
  if(alreadyLiked){
    User.updateOne({_id: req.user._id}, {$pull: {liked : req.params.postId}}, (err) => {
      Post.updateOne({_id: req.params.postId}, {$inc: {likes: -1}}, (err) => {
        res.status(200).send();
      })
    })
  }else{
    User.updateOne({_id: req.user._id}, {$addToSet: {liked : req.params.postId}}, (err) => {
      Post.updateOne({_id: req.params.postId}, {$inc: {likes: 1}}, (err) => {
        res.status(200).send();
      })
   })
  }
});

router.get('/posts/:postId/comments', (req, res) => {
  Post.findOne({_id: req.params.postId}, 'comments')
  .populate({
    path: 'comments',
    options: {
      sort : {postedAt: -1}
    },
    limit: 5,
    populate : {
      path: 'author',
      select: 'name image'
    }
  })
  .exec((err, post) => {
    res.json(post.comments);
  })
})

router.post('/posts/:postId/comments', async(req, res) => {
  const comment = {
    author: req.user._id,
    postedAt: Date.now(),
    message: req.body.message
  }
  Post.updateOne({_id: req.params.postId}, {$push: {comments: comment}},{upsert: true}, (err, post) => {
    res.status(200).send(post);
  })
});

module.exports = router;
