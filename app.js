const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
// const compression = require('compression');
// const helmet = require('helmet');

const CONNECTION_URL = process.env.MONGODB_URL; 
mongoose.set('strictQuery', true);

mongoose.connect(CONNECTION_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Mongoose connection started!'))
.catch(error => console.log(`mongoose connection interrupted ${error}`));


const app = express();

// making production ready
// app.use(compression());
// app.use(helmet());

// configuring passport with jwt strategy
const passport = require('passport');
const jwtStrategy = require('./stratigies/jwt');
passport.use(jwtStrategy);


// using cors
app.use(cors());

// parsing form and json data
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// getting static files
app.use(express.static(path.join(__dirname, 'public')));

const userRouter = require('./api/user.js');
const protectedRouter = require('./api/protected.js');

app.use('/api', userRouter);
app.use('/protected', passport.authenticate('jwt', {session: false}) ,protectedRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`app listening on post ${PORT}`));

