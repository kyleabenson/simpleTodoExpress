// var app = angular.module('todo', []);
//
//
// function mainController($scope, $http) {
//     $scope.formData = {};
//
//     // when landing on the page, get all todos and show them
//     $http.get('/api/todos')
//         .success(function(data) {
//             $scope.todos = data;
//             console.log(data);
//         })
//         .error(function(data) {
//             console.log('Error: ' + data);
//         });
// }

var app = angular.module('todo', []);

function mainController($scope, $http){
  //$scope.formData = {};

// get current todos_list from node
  $http.get('/api/todos')
    .success(function(data){
      $scope.todos = data;
      console.log(data);
    })
    .error(function(data){
      console.log('Error: ' + data);
    });

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
