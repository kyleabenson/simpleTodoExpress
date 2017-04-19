var express = require('express');
var app = express();
var stream = process.stdout;
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

mongoose.connect('mongodb://app_test:test@10.11.217.162:27017/todos');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
// var todos = [{text: "Buy milk"}, {text:"Pick up drycleaning"},{text:"Feed dog"}]

app.route('/api/todos')
  .get(function(request, response, next){
    Todo.find(function(err, todos_list) {
           // if there is an error retrieving, send the error. nothing after res.send(err) will execute
           if (err) response.send(err);
           response.json(todos_list); // return all todos in JSON format
       });
  })
  .post(function(request, response, next){
    Todo.create({
        text: request.body.text,
        completed: false
    }, function(err, todo){
      if (err)
        response.send(err);
        Todo.find(function(err, todos_list){
          if (err){
            response.send(err);
          }

          response.json(todos_list);
        });
    });

  })

app.route('/api/todos/:todo_id')
  .delete(function(request, response, next){
      Todo.remove({ _id: request.params.todo_id}, function(err){
          if (err) response.send(err);
          Todo.find(function(err, todos_list){
            if (err){
              response.send(err);
            }
            response.json(todos_list);
          });
      });
  })
  .post(function(request, response, next){
    console.log(request);
    Todo.findByIdAndUpdate({_id: request.params.todo_id},{ $set: {completed: request.query}}, function(err, todo){
      if (err) return handleError(err);
      Todo.find(function(err, todos_list){
        if (err){
          response.send(err);
        }
        response.json(todos_list);
      });

    });
  })

var Todo = mongoose.model('todo', {
        text : String,
        completed: Boolean
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);
