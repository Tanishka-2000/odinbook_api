const async = require('async');
const User = require('./models/user');
const Post = require('./models/post');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

const users = [];
const posts = [];

function createRandomUser(){
  const sex = faker.name.sexType();
  const firstName = faker.name.firstName(sex);
  const lastName = faker.name.lastName();
  const email = faker.helpers.unique(faker.internet.email, [
    firstName,
    lastName,
  ]);

  const hash = bcrypt.hashSync(firstName, 10);

  return {
    credentials: {
      email: email,
      passwordHash: hash,
    },
    name: `${firstName} ${lastName}`,
    image: faker.image.avatar(),
    profile: {
      homeTown: faker.address.city(),
      currentCity: faker.address.city(),
      workExperience: [faker.name.jobType()],
      contactInfo: {
        phone: [faker.phone.number('+91 ### ### ####')],
      },
      gender: faker.helpers.arrayElement(['male', 'female', 'other']),
      birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
    }
  }
}

function createRandomPost(){
  return{
    message: faker.lorem.sentence(15),
    imageUrl : faker.image.people(500, 700),
    tags: [faker.lorem.word(), faker.lorem.word()],
    postedAt: faker.date.between('2023-01-01T00:00:00.000Z', '2023-01-22T00:00:00.000Z'),
    likes: faker.random.numeric(2)
  }
}

Array.from({ length: 10 }).forEach(() => {
  users.push(createRandomUser());
});

Array.from({ length: 25 }).forEach(() => {
  posts.push(createRandomPost());
});

function storeUser(user, callback) {
  User.create({
    ...user
  }, callback);
}

function storePost(post, callback) {
  Post.create({
    ...post
  }, callback);
}

async.each(users, storeUser, err => {
  if(err) return console.log(err);
  console.log('complete storing users');
})

async.each(posts, storePost, err => {
  if(err) return console.log(err);
  console.log('complete storing posts');
})