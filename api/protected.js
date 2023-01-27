const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Post = require('../models/post');
const async = require('async');

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

router.put('/saved-posts', (req, res) => {
  User.updateOne({_id: req.user._id}, {$push: {savedPosts: req.body.postId}}, (err) => {
    res.status(200).send();
  });
});

router.put('/change-password', async (req, res) => {
  const user = await User.findOne({_id: req.user._id}, 'credentials');
  const result = await bcrypt.compareSync(req.body.old, user.credentials.passwordHash);

  if(!result) return res.status(400).json('Incorrect Password');

  bcrypt.hash(req.body.new, 10, (err, hash) => {

    User.updateOne({_id: req.user._id}, {'credentials.passwordHash': hash}, (err) => {
      res.status(200).send({oldHash: user.credentials.passwordHash, newHash: hash});
    }); 
  });
});


router.get('/requests', (req, res) => {
  User.findOne({_id: req.user._id}, 'requests', (err, user) => {
    res.json(user.requests);
  })
});

// to be implemented // how to send notifications
// router.get('/notifications', (req, res) => {
//   User.findOne({_id: req.user._id}, 'notifications', (err, user) => {
//     res.json(user.notifications);
//   })
// })

// add current city
router.put('/profile/currentCity', (req, res) => {
  User.updateOne({_id: req.user._id}, {'profile.currentCity' : req.body.city}, err => {
    res.status(200).send();
  })
});

// delete current city
router.delete('/profile/currentCity', (req, res) => {
  User.updateOne({_id: req.user._id}, {$unset: {'profile.currentCity' : 1}}, err => {
    res.status(200).send();
  })
});

// add home town
router.put('/profile/homeTown', (req, res) => {
  User.updateOne({_id: req.user._id}, {'profile.homeTown' : req.body.town}, err => {
    res.status(200).send();
  })
});

// delete home town
router.delete('/profile/homeTown', (req, res) => {
  User.updateOne({_id: req.user._id}, {$unset: {'profile.homeTown' : 1}}, err => {
    res.status(200).send();
  })
});

// add gender
router.put('/profile/gender', (req, res) => {
  if(!['male', 'female', 'other'].includes(req.body.gender)) return res.status(400).json('gender must be in "male/female/other"');
  User.updateOne({_id: req.user._id}, {'gender' : req.body.gender}, err => {
    res.status(200).send();
  })
});

// delete gender
router.delete('/profile/gender', (req, res) => {
  User.updateOne({_id: req.user._id}, {$unset: {gender: 1}}, err => {
    res.status(200).send();
  })
});


// add work experience
router.put('/profile/work-experience', (req, res) => {
  User.updateOne({_id: req.user._id}, {$push: {'profile.workExperience' : req.body.experience}}, err => {
    res.status(200).send();
  })
});

// delete work experience
router.delete('/profile/work-experience', (req, res) => {
  User.updateOne({_id: req.user._id}, {$pull: {'profile.workExperience' : req.body.experience}}, err => {
    res.status(200).send();
  })
});

// add high school
router.put('/profile/high-school', (req, res) => {
  User.updateOne({_id: req.user._id}, {$push: {'profile.highSchool' : req.body.school}}, err => {
    res.status(200).send();
  })
});

// delete high school
router.delete('/profile/high-school', (req, res) => {
  User.updateOne({_id: req.user._id}, {$pull: {'profile.highSchool' : req.body.school}}, err => {
    res.status(200).send();
  })
});

// add college
router.put('/profile/college', (req, res) => {
  User.updateOne({_id: req.user._id}, {$push: {'profile.college' : req.body.college}}, err => {
    res.status(200).send();
  })
});

// delete college
router.delete('/profile/college', (req, res) => {
  User.updateOne({_id: req.user._id}, {$pull: {'profile.college' : req.body.college}}, err => {
    res.status(200).send();
  })
});

// ---------users routes----------//

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

// need to test
router.post('/users/:userId/requests', (req, res) => {
  const sentRequest = {
    domain: 'sent',
    userId: req.params.userId,
    status:'pending',
    date: Date.now()
  }
  const recievedRequest = {
    domain: 'recieved',
    userId: req.user._id,
    date: Date.now()
  }
  async.parallel({
    send(callback){
      User.updateOne({_id: req.user._id}, {$push: {requests: sentRequest}}, callback)
    },
    recieved(callback){
      User.updateOne({_id: req.params.userId}, {$push: {requests: recievedRequest}}, callback)
    }
  }, 
  (err, result) => {
      if(err) return res.status(500).json(err);
      res.status(200).send();
    }
  )
});

// to be implemented -----had find a way to get only specific request
// router.post('/users/:userId/requests/requestId', (req, res) => {
//   if(!['accepted', 'declined'].includes(req.body.answer)) return res.status(400).json('reply must be either accepted or declined');
//   User.findOne({_id: req.user._id}, 'requests', (err, user) => {

//   })
// })

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

router.put('/posts/:postId/like', async (req, res) => {
  
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
