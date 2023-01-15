const express = require('express');
const cors = require('cors');


const app = express();

app.get('/', (req, res) => {
  res.send('Welcome to odinBook');
});

app.listen(3000, () => console.log('app listening on post 3000'));