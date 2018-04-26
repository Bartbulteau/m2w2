var express = require('express');
var router = express.Router();

// set-up database
var mongoose = require('mongoose');
mongoose.connect('mongodb://bart:20BarT01@ds255329.mlab.com:55329/m2w');
var db = mongoose.connection;

// check connection
db.once('open', function () {
    console.log('Connected to MongoDB');
});

db.on('error', function (err) {
    console.log(err);
});

// bring in model
var Message = require('../models/message');


/* Default GET */
router.get('/', function(req,res, next) {
  res.send('M2W: Please go to /api/messages to get messages');
});

/* GET all messages. */
router.get('/messages', function(req, res, next) {
  Message.find({}, (err, messages) => {
    if (err) {
      console.log('ERROR /!\\ : ');
      console.log(err);
      res.send(err);
    }
    else {
      res.json(messages);
    }
  });
});

/* POST one message */
router.post('/message', function(req, res, next) {
  var message = new Message();
  message.content = req.body.content;
  message.author = req.body.author;

  // save message to db
  message.save(err => {
    // check if it works
    // if it doesn't, send the error
    if (err) {
      console.log(err);
      res.send(err);
    }
    // if it does, send the messages
    else {
      Message.find({}, (err, messages) => {
        if (err) {
          console.log('ERROR /!\\ : ');
          console.log(err);
          res.send(err);
        }
        else {
          res.json(messages);
        }
      });
    }
  });
});

/* DELETE message with id */
router.delete('/message/:id', function(req, res, next) {
  var query = {_id: req.params.id};

  Message.remove(query, err => {
    // check if it works
    // if it doesn't, send the error
    if (err) {
      console.log(err);
      res.send(err);
    }
    // if it does, send the messages
    else {
      Message.find({}, (err, messages) => {
        if (err) {
          console.log('ERROR /!\\ : ');
          console.log(err);
          res.send(err);
        }
        else {
          res.json(messages);
        }
      });
    }
  });
});
  

module.exports = router;
