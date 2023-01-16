const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

router.post('/signup', 
// username must be an email
body('username')
.isEmail().
normalizeEmail().
withMessage('must be an email')
.custom(value => {
  return User.findOne({email: value}).then(user => {
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
    return res.status(400).json({ errors: errors.array() });
  }

  User.create({
    name: req.body.username,
    password: req.body.password,
    friends: [],
    posts: []
  },(err, user) => {
    if(err) return res.json(err);
    // res.json(user);
    const token = jwt.sign({sid: user._id}, 'secret');
    res.json({user, token});
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
    // password need to be encrypted
    if(user.password !== req.body.password) return res.status(400).json({msg: 'incorrect password', user});

    const token = jwt.sign({sid: user._id},'secret');
    res.json({token});
  })
});

module.exports = router;