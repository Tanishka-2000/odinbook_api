const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.post('/signup', 
// username must be an email
body('username')
.isEmail().
normalizeEmail().
withMessage('must be an email')
.custom(value => {
  return User.findOne({name: value}).then(user => {
    if (user) {
      return Promise.reject('E-mail already in use');
    }
  });
}),
// password must be at least 5 chars long
body('password')
.trim()
.isLength({ min: 5 })
.withMessage('must be at least 5 characters long'),

(req, res) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(req.body);
    return res.status(400).json({ errors: errors.array() });
  }

  // generating hash from password
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if(err) return res.status(500).json(err);

    User.create({
      name: req.body.username,
      password: hash,
      friends: [],
      posts: []
    },(err, user) => {
      if(err) return res.json(err);
      const token = jwt.sign({sid: user._id}, process.env.JWT_SECRET);
      res.json({user, token});
    }); 
  });   
}
);

router.post('/login',
// username must be an email
body('username').isEmail().normalizeEmail().withMessage('must be an email'),
// password must be at least 5 chars long
body('password').trim().isLength({ min: 5 }).withMessage('must be at least 5 characters long'),
(req, res) => {

  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

  User.findOne({name: req.body.username}, (err, user) => {
    if(!user) return res.status(400).json('no such user exist');
    
    bcrypt.compare(req.body.password, user.password, (err, result) => {
      console.log(result);
      if(!result) return res.status(400).json({msg: 'incorrect password', user});

      const token = jwt.sign({sid: user._id}, process.env.JWT_SECRET);
      res.json({token});
    });
  })
});

module.exports = router;