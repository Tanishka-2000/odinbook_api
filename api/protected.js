const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  if(req.user) return res.json(req.user);
  res.json({msg: 'no user attached'});
});

module.exports = router;