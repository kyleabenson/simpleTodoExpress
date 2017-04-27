var express = require('express');
var app = express();
var stream = process.stdout;
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
  }
}

var db = null,
    dbDetails = new Object();


var initDb = function(callback) {
  if (mongoURL == null) return;
  if (mongoose == null) return;

  db = mongoose.createConnection(mongoURL);

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



initDb(function(err){
    console.log('Error connecting to Mongo. Message:\n'+err);
  });

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);
