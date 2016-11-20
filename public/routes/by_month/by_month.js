(function () {

  var app = angular.module('somusicApp');

  app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('by_month', {
      url: '/by_month/:year/:month',
      templateUrl: 'routes/by_month/by_month.html',
      css: 'routes/by_month/by_month.css'
    });
  });

  app.controller('ByMonthController', ['$scope', '$state', '$stateParams', 'RankingService', function ($scope, $state, $stateParams, RankingService) {
    console.log("ByMonthController()");
    var controller = this;
    controller.rankings = RankingService.newEmptyRanking();
    $scope.title = moment($stateParams.year + "-" + $stateParams.month, "YYYY-MM").format("MMMM YYYY");

    console.log('Looking for ranking', $stateParams.year, $stateParams.month);
    RankingService.tracksByMonth($stateParams.year, $stateParams.month).then(function(data) {
     console.log('Received ranking', data);
     controller.rankings = data;
    });
  }]);

})();
