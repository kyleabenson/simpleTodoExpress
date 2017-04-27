var express = require('express');
var app = express();
var stream = process.stdout;
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongo_port = process.env.MONGO_PORT || process.env.OPENSHIFT_MONGO_PORT || 27017,
    mongo_ip = process.env.MONGO_IP || process.env.OPENSHIFT_MONGO_IP;

var mongoURL = 'mongodb://127.0.0.1/test',
    mongoURLLabel = 'mongodb://127.0.0.1/test';

var db = null,
    dbDetails = new Object();


var initDb = function(callback) {
  if (mongoURL == null) return;
  if (mongoose == null) return;

  db = mongoose.createConnection(mongoURL);
  console.log('Connected to MongoDB at: %s', mongoURL);

};
// attempt initial setup of DB
initDb(function(err){});
var Todo = db.model('todo', {
                  text : String,
                  completed: Boolean
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
var todos = [{text: "Buy milk"}, {text:"Pick up drycleaning"},{text:"Feed dog"}];

app.route('/api/todos')
  .get(function(request, response, next){
    if (!db) {
      initDb(function(err){});
    }
    if (db){
      Todo.find(function(err, todos, callback) {
       if (err) response.send(err);
       response.json(todos); // return all todos in JSON format
      });
      console.log('after find');
    }
  })
  .post(function(request, response, next){
    Todo.create({
        text: request.body.text,
        completed: false
    }, function(err, todo){
      if (err)
        response.send(err);
        Todo.find(function(err, todos){
          if (err)
            response.send(err);

          response.json(todos);
        });
    });

  });

app.route('/api/todos/:todo_id')
  .delete(function(request, response, next){
      Todo.remove({ _id: request.params.todo_id}, function(err){
          if (err) response.send(err);
          Todo.find(function(err, todos){
            if (err){
              response.send(err);
            }
            response.json(todos);
          });
      });
  })
  .post(function(request, response, next){
    console.log(request);
    Todo.findByIdAndUpdate({_id: request.params.todo_id},{ $set: {completed: request.query}}, function(err, todo){
      if (err) return handleError(err);
      Todo.find(function(err, todos){
        if (err){
          response.send(err);
        }
        response.json(todos);
      });

    });
  })



// initDb(function(err){
//     console.log('Error connecting to Mongo. Message:\n'+err);
//   });

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);
