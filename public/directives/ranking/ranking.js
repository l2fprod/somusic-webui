(function () {

  var app = angular.module('somusicApp');

  app.directive('somusicRanking', function() {

    return {
      restrict: 'E',
      scope: {
        ranking: '=',
      },
      templateUrl: 'directives/ranking/ranking.html',
      css: 'directives/ranking/ranking.css'
    };
  });
})();
