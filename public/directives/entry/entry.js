(function () {

  var app = angular.module('somusicApp');

  app.directive('somusicEntry', function() {

    return {
      restrict: 'E',
      scope: {
        entry: '=',
        hero: '=',
      },
      controller: ['$scope', function($scope) {
        $scope.updatePlayer = function() {
          $scope.$bus.publish({
            channel: 'entries',
            topic: 'entry.select',
            data: $scope.entry
          });
        }
      }],
      templateUrl: 'directives/entry/entry.html',
      css: 'directives/entry/entry.css'
    };
  });
})();
