
var app = angular.module('todo', []);

function mainController($scope, $http){

// get current todos_list from node
  $http.get('/api/todos')
    .success(function(data){
      $scope.todos = data;
      console.log(data);
    })
    .error(function(data){
      console.log('Error: ' + data);
    });

// Post a new todo based on form data
  $scope.createTodo = function(){
      $http.post('/api/todos', $scope.formData)
        .success(function(data){
          $scope.formData = {};
          $scope.todos = data;
          console.log(data);
        })
    };

// Delete a todo
  $scope.deleteTodo = function(id){
    $http.delete('/api/todos/' + id)
      .success(function(data){
        $scope.todos = data;
        console.log(data);
      })
      .error(function(data){
        console.log('Error: ' + data);
      });
  }
// Change value of completion
  $scope.completeTodo = function(id, completed){
    $http.post('/api/todos/' + id +'?' + completed)
      .success(function(data){
        $scope.todos = data;
      })
      .error(function(data){
        console.log('Error: ' + data);
      });
  }

}
