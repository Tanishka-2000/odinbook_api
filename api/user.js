const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.post('/signup', 
// username must be an email
body('email')
.isEmail().
normalizeEmail().
withMessage('must be an email')
.custom(value => {
  return User.findOne({'credentials.email': value}).then(user => {
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
    // console.log(req.body);
    return res.status(400).json({ errors: errors.array() });
  }

  // generating hash from password
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if(err) return res.status(500).json(err);

    // correct schema
    User.create({
      credentials: {
        email: req.body.email,
        passwordHash: hash
      },
      name: req.body.name,
    },
    (err, user) => {
      if(err) return res.json(err);
      const token = jwt.sign({sid: user._id}, process.env.JWT_SECRET);
      res.json({token, name:user.name});
    }); 
  });   
}
);

router.post('/login',
// username must be an email
body('email')
.isEmail()
//.normalizeEmail() uncomment it later when done with fake data
.withMessage('must be an email'),
// password must be at least 5 chars long
body('password')
.trim()
.isLength({ min: 5 })
.withMessage('must be at least 5 characters long'),

(req, res) => {

  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
  // console.log(req.body.email);
  User.findOne({'credentials.email': req.body.email}, '_id credentials name image', (err, user) => {
    if(!user) return res.status(400).json('no such user exist');
    
    bcrypt.compare(req.body.password, user.credentials.passwordHash, (err, result) => {
      
      if(!result) return res.status(400).json({msg: 'incorrect password'});

      const token = jwt.sign({sid: user._id}, process.env.JWT_SECRET);
      res.json({token, name:user.name, image:user.image});
    });
  })
});

module.exports = router;