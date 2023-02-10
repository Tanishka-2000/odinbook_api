# Odinbook REST API
A node application that serves REST APIs for the [Odinbook](https://github.com/Tanishka-2000/odinbook) project.

## Table of Contents
+ [General Info](#general-info)
+ [Technologies](#technologies)
+ [Setup](#setup)
+ [How to Use](#how-to-use)
+ [Features](#features)

## General Info
This project is a part of JAMstack architecture. It provides backend service for a facebook-clone project i.e. [Odinbook](https://github.com/Tanishka-2000/odinbook). This project provide APIs for login and signin to the app, using passport module at the users
route. All the other APIs instead of login/signin are in a protected route and user needs to authenticate his/her request before
getting response from those APIs. This application uses json web token for authentication.

## Technologies
+ Node
+ Express
+ Mongodb
+ Passport
+ Json Web Token

## Setup
To run this project locally
```
# clone this repository
git clone https://github.com/Tanishka-2000/odinbook_api.git

# Go into the repository
cd odinbook_api

# Install dependencies
npm install

```
You need to add two environment variables to run this project
1. MONGODB_URL - Its value must be equal to your database URL (either local or cloud database).
2. JWT_SECRET - Its value can be any random string, it is used to encrypt you json web tokens.

Once they are added
```
# Start your project
npm start

# Or start using nodemon
npm run dev 
```

## How to Use
You can test the APIs using [Postman](https://www.postman.com/) or using command line or any other platform
to test APIs.
+ Login routes are accessed on .../api/login (get) or .../api/login (post)
+ Signup routes are accessed on .../api/signup (get) or .../api/signup (post)
+ After login/signup, a token(jwt) is provied in response which needs to be send in the headers object of the request
  as authentication. For example 
  {headers: {
    Authentication: Bearer token
  }
  }
  > token need to be replaced by the token string recieved in the response.
+ Rest of the APIs are accessed on .../protected/... route. For example
  - accessing user's friends - .../protected/friends.

## Features
+ Login/Signup Route (/login or /signup)
  - Any user can access login or signin route and get their json web token once logged in used to access protected route.
  - Users passwords are encrypted using 'bcrypt' module.
  - For an incomplete request or data, proper error code and message is provided.
+ Only users with authentication token, can access protected routes (/protected).
> + To see the complete list of protected APIs, go to api/protected.js file.
> + To see the models used in this project, go to models folder.