const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/', (req, res) => {
  return res.json(req.user);
});

router.get('/users', (req, res) => {
  User.findOne({_id: req.user._id}, 'friends', (err, user) => {
    User.find({_id : {$nin : [req.user._id, ...user.friends]}}, '_id name image', (err, users) => {
      res.json(users);
    })
  })
});

module.exports = router;