const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/', (req, res) => {
  return res.json(req.user);
});

router.get('/users', (req, res) => {
  User.find({_id : {$ne : req.user._id}}, '_id name image', (err, users) => {
    res.json(users);
  })
});

module.exports = router;