const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const CONNECTION_URL = process.env.MONGODB_URL; 
mongoose.set('strictQuery', true);

mongoose.connect(CONNECTION_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Mongoose connection started!'))
.catch(error => console.log(`mongoose connection interrupted ${error}`));


const app = express();

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

// app.get('/', (req, res) => {
//   res.send('Welcome to odinBook');
// });

// app.get('/get-data', (req,res) => {
//   res.send([{id: 1, name:'jake'}, {id: 1, name:'kevin'}, {id: 3, name:'sarah'}])
// });

// app.get('/post-data', (req, res) => {
//   res.send('data posted');
// });

// app.get('/update-data', (req, res) => {
//   Post.findByIdAndUpdate('63c5262e5bd9dc944b5fc599', {priority: 10}, {}, (err, post) => {
//     res.send('updated');
//   });
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`app listening on post ${PORT}`));


// mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
//   .catch((error) => console.log(`${error} did not connect`));

// mongodb+srv://user01:user01@cluster0.zmx5uqq.mongodb.net/?retryWrites=true&w=majority

// User.find({name:'john'})
// .populate('posts')
// .populate({
//   path:'friends',
//   populate: {
//     path: 'posts',
//     options: {
//       sort: {
//         'priority' : -1
//       },
//       limit: 1
//     }
//   },
// })
// .exec((err, user) => {
//   res.send(user);
// })

//push to array

// PersonModel.update(
//   { _id: person._id }, 
//   { $addToSet: { friends: friend } }
// );

// person.friends.push(friend);
// person.save(done);
// or

// PersonModel.update(
//     { _id: person._id }, 
//     { $push: { friends: friend } },
//     done
// );