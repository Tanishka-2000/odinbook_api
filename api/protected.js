const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Post = require('../models/post');
const async = require('async');
// const {body, validationResult} = require('express-validator');

// index route
router.get('/', (req, res) => {
  let posts = [];
  User.findOne({_id: req.user._id}, 'posts friends liked')
  .populate({
    path: 'posts',
    select: 'message imageUrl tags author postedAt likes',
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
  .lean()
  .exec((err, user) => {
    posts = [...user.posts];
    user.friends.forEach(friend => {
      posts = [...posts, ...friend.posts];
    });
    posts.forEach(post => {
      if(user.liked.some(likedPost => likedPost.equals(post._id))) post.isLiked = true;
      else post.isLiked = false;
    })
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
  .populate({
    path: 'posts',
    select: 'message imageUrl tags author postedAt likes',
    options: {
      sort : {postedAt: -1}
    },
    populate : {
      path: 'author',
      select: 'name image'
    }
  })
  .exec((err, user) => {
    res.json(user);
  });
});

router.get('/profile', (req, res) => {
  User.findOne({_id: req.user._id}, 'profile', (err, user) => {
    res.json(user.profile);
  })
})

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
  User.updateOne({_id: req.user._id}, {$addToSet: {savedPosts: req.body.postId}}, (err) => {
    res.status(200).send();
  });
});

router.put('/change-password', async (req, res) => {
  const user = await User.findOne({_id: req.user._id}, 'credentials');
  const result = await bcrypt.compareSync(req.body.old, user.credentials.passwordHash);

  if(!result) return res.status(400).json('Incorrect Password');

  bcrypt.hash(req.body.new, 10, (err, hash) => {

    User.updateOne({_id: req.user._id}, {'credentials.passwordHash': hash}, (err) => {
      res.status(200).send(); //{oldHash: user.credentials.passwordHash, newHash: hash}
    }); 
  });
});


router.get('/requests', (req, res) => {
  User.findOne({_id: req.user._id}, 'requests')
  .populate({
    path: 'requests',
    populate: {
      path: 'userId',
      select: 'name image'
    }
  })
  .exec( (err, user) => {
    res.json(user.requests);
  })
});


router.get('/notifications', (req, res) => {
  User.findOne({_id: req.user._id}, 'notifications')
  .populate({
    path: 'notifications',
    populate: {
      path: 'userId',
      select: 'name'
    }
  })
  .exec((err, user) => {
    res.json(user.notifications);
  })
})

router.delete('/notifications/:notificationId', (req, res) => {
  User.updateOne({_id: req.user._id}, {$pull: {'notifications': {_id: req.params.notificationId}}}, (err) => {
    res.status(200).send();
  })
})

// add or change profile image
router.put('/image', (req, res) => {
  User.updateOne({_id: req.user._id}, {image: req.body.image}, err => {
    res.status(200).send();
  });
})

// add current city
router.put('/profile/currentCity', (req, res) => {
  User.updateOne({_id: req.user._id}, {'profile.currentCity' : req.body.city}, err => {
    res.status(200).send();
  })
});

// delete current city
// router.delete('/profile/currentCity', (req, res) => {
//   User.updateOne({_id: req.user._id}, {$unset: {'profile.currentCity' : 1}}, err => {
//     res.status(200).send();
//   })
// });

// add home town
router.put('/profile/homeTown', (req, res) => {
  User.updateOne({_id: req.user._id}, {'profile.homeTown' : req.body.town}, err => {
    res.status(200).send();
  })
});

// delete home town
// router.delete('/profile/homeTown', (req, res) => {
//   User.updateOne({_id: req.user._id}, {$unset: {'profile.homeTown' : 1}}, err => {
//     res.status(200).send();
//   })
// });

// add gender
router.put('/profile/gender', (req, res) => {
  if(!['male', 'female', 'other'].includes(req.body.gender)) return res.status(400).json('gender must be in "male/female/other"');
  User.updateOne({_id: req.user._id}, {'gender' : req.body.gender}, err => {
    res.status(200).send();
  })
});

// delete gender
// router.delete('/profile/gender', (req, res) => {
//   User.updateOne({_id: req.user._id}, {$unset: {gender: 1}}, err => {
//     res.status(200).send();
//   })
// });


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


// test both phone route and email route

// add phone
router.put('/profile/phone', (req, res) => {
  User.updateOne({_id: req.user._id}, {$push: {'profile.contactInfo.phone' : req.body.phone}}, err => {
    res.status(200).send();
  })
});

// delete phone
router.delete('/profile/phone', (req, res) => {
  User.updateOne({_id: req.user._id}, {$pull: {'profile.contactInfo.phone' : req.body.phone}}, err => {
    res.status(200).send();
  })
});

// add email
router.put('/profile/email', (req, res) => {
  User.updateOne({_id: req.user._id}, {$push: {'profile.contactInfo.email' : req.body.email}}, err => {
    res.status(200).send();
  })
});

// delete email
router.delete('/profile/email', (req, res) => {
  User.updateOne({_id: req.user._id}, {$pull: {'profile.contactInfo.email' : req.body.email}}, err => {
    res.status(200).send();
  })
});

// update date of birth
router.put('/profile/birthDate', (req, res) => {
  User.updateOne({_id: req.user._id}, {'profile.birthDate' : Date.parse(req.body.date)}, err => {
    res.status(200).send();
  })
});

// ---------users routes----------//

router.get('/users', (req, res) => {
  User.findOne({_id: req.user._id}, 'friends requests', (err, user) => {
    let requests = user.requests.map(request => request.userId)
    User.find({_id : {$nin : [req.user._id, ...user.friends, ...requests]}}, 'name image', (err, users) => {
      res.json(users);
    })
  })
});

router.get('/users/:userId', (req, res) => {
  User.findOne({_id: req.params.userId}, 'name image profile posts')
  .populate({
    path:'posts',
    populate: {
      path: 'author',
      select: 'name image'
    }
  })
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

// sending a friend request
router.post('/users/:userId/friendRequest', (req, res) => {

  User.findOne({_id: req.user._id}, 'friends requests', (err, user) => {
    const isFriend = user.friends.some(friend => friend.equals(req.params.userId));
    const isRequestPending  = user.requests.some(request =>  request.userId.equals(req.params.userId))
 
    if(isFriend) return res.status(400).json('Aready in friends list');
    if(isRequestPending) return res.status(400).json('Request already pending..');

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
});

// replying to friend request //need to be tested // send friend requests first
router.post('/requests/:requestId', (req, res) => {
  if(!['accepted', 'declined'].includes(req.body.answer)) return res.status(400).json('reply must be either accepted or declined');

  User.findOne({_id: req.user._id}, {requests: {$elemMatch: {_id: req.params.requestId}}}, (err, user) => {
    let request = user.requests[0];
    if(!request) return res.status(400).json('No such request exist');

    // checking if the request was sent or recieved
    if(request.domain === 'sent') return res.json('This request is ' + request.status)

    if(req.body.answer === 'accepted'){

      async.parallel({
        user(callback){
          User.updateOne({_id: req.user._id}, {$push: {friends: request.userId}, $pull: {requests: {_id: request._id}}},callback)
        },
        friend(callback){
          User.updateOne({_id: request.userId}, {$push: {friends: req.user._id}},callback)
        }
      },
      (err, result) => {
        if(err) return res.status(500).json(err);
        User.updateOne({_id: request.userId, "requests.userId": req.user._id}, {$set: {'requests.$.status': 'accepted'}}, (err, doc) => {
          res.status(204);
        })
      });

    }else{

      async.parallel({
        user(callback){
          User.updateOne({_id: req.user._id}, {$pull: {requests: {_id: request._id}}},callback)
        },
        friend(callback){
          User.updateOne({_id: request.userId, "requests.userId": req.user._id}, {$set: {'requests.$.status': 'declined'}}, callback)
        }
      },(err, result) => {
        if(err) return res.status(500).json(err);
        res.status(204).send();
      })   
    }
  })
});

router.delete('/requests/:requestId', (req, res) => {
  User.findOne({_id: req.user._id}, {requests: {$elemMatch: {_id: req.params.requestId}}}, (err, user) => {
    if(user.requests[0].status == 'pending') return res.status(400).json({msg: "couldn't delete pending request"})
    // res.json('request could be deleted')
    User.updateOne({_id: req.user._id}, {$pull: {requests: {_id: req.params.requestId}}},(err) => {
      res.status(200).send();
    })
  })
});

router.post('/users/:userId/unfriend', (req, res) => {
  User.findOne({_id: req.user._id}, 'friends', (err, user) => {

    const isFriend = user.friends.some(friendId => friendId.equals(req.params.userId));
    if(!isFriend) return res.status(400).json('not friend');

    const notification = {
      domain: 'unfriend',
      userId: req.user._id,
      postId:null
    };

    async.parallel({
      user(callback){
        User.updateOne({_id: req.user._id}, {$pull: {friends: req.params.userId}}, callback)
      },
      friend(callback){
        User.updateOne({_id: req.params.userId}, {$pull: {friends: req.user._id}, $push: {notifications: notification}}, callback)
      }
    },(err, result) => {
      if(err) return res.status(500).send();
      res.status(204).send();      
    })
  });
}); 

// ---------posts route --------------//

router.get('/posts/:postId', (req, res) => {
  Post.findOne({_id: req.params.postId})
  .select('message imageUrl tags author postedAt likes')
  .populate('author', 'name image')
  .exec((err, post) => {
    res.json(post);
  });
});

router.post('/posts', (req, res) => {
  if(!req.body.message.trim() || !req.body.imageUrl) return res.status(400).json({msg: 'Incomplete data'});

  Post.create({
    author: req.user._id,
    message: req.body.message,
    imageUrl: req.body.imageUrl,
    tags: req.body.tags ? req.body.tags.split(' ') : '',
    postedAt: Date.now(),
    likes: 0
  }, (err, post) => {
    User.updateOne({_id: req.user._id}, {$push: {posts : post._id}}, (err) => {
      // res.status(200).send();
      const postShared = {
        domain: 'post shared',
        userId: req.user._id,
        postId: post._id
      }

      User.findOne({_id: req.user._id}, 'friends', (err, user) => {
        User.updateMany({_id: {$in: user.friends}}, {$push: {notifications: postShared}}, (err) => {
          res.status(200).send();
        });
      })
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
  Post.updateOne({_id: req.params.postId}, {$push: {comments: comment}}, (err, post) => {
    // res.status(200).send(post);
    const commented = {
      domain: 'commented on post',
      userId: req.user._id,
      postId: req.params.postId
    }
    Post.findOne({_id: req.params.postId}, 'author', (err, post) => {
      User.updateOne({_id: post.author}, {$push: {notifications: commented}}, err => {
        res.status(200).send();
      });
    });
  });
});

module.exports = router;
