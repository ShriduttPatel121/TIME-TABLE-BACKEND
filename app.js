const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());



// setting the CORS header
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE')
    next();
});

//routes will be here


// if no route found, send 404 not found response
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});


// spacial error middleware
  app.use((error, req, res, next) => {
    
    //response has already been sent, if that is a case, then just forward the error, so we do not send response 2 time whci will cause a exception
    if (res.headerSent) {
      return next(error);
    }

    res.status(error.code || 500)
    res.json({message: error.message || 'An unknown error occurred!'});
  });

// connection string for the database connection which is on cloud
  const MONGODB_URI = 'mongodb+srv://ShriduttPatel:RYBxFXmrhLJxNDYG@node-shop-pgh1l.mongodb.net/TimeTable'
  //spinup the server
  mongoose.connect(MONGODB_URI)
  .then(result => {
      console.log('connected');
      app.listen(8080);
  })
  .catch(error => {
      console.log(error);
  });