(function () {

  var app = angular.module('somusicApp');

  app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'routes/home/home.html',
      css: 'routes/home/home.css'
    });
  });

  app.controller('HomeController', ['$scope', '$state', 'RankingService', function ($scope, $state, RankingService) {
    console.log("HomeController()");
    var controller = this;
    controller.rankings = RankingService.newEmptyRanking();

    function getRanking(startDate, endDate) {
      console.log('Looking for ranking', startDate, endDate);
      RankingService.get(startDate, endDate).then(function(data) {
        console.log('Received ranking', data);
        controller.rankings = data;
      });
    }
    controller.yesterday = function() {
      getRanking(RankingService.getCurrentDate().subtract(1, 'day').format('YYYY-MM-DD'));
    };

    controller.today = function() {
      getRanking(RankingService.getCurrentDate().format('YYYY-MM-DD'), RankingService.getCurrentDate().format('YYYY-MM-DD'));
    };

    controller.thisWeek = function() {
      getRanking(RankingService.getCurrentDate().startOf('week').format('YYYY-MM-DD'), RankingService.getCurrentDate().endOf('week').format('YYYY-MM-DD'));
    };

    controller.thisMonth = function() {
      getRanking(RankingService.getCurrentDate().startOf('month').format('YYYY-MM-DD'), RankingService.getCurrentDate().endOf('month').format('YYYY-MM-DD'));
    };

    controller.thisYear = function() {
      getRanking(RankingService.getCurrentDate().startOf('year').format('YYYY-MM-DD'), RankingService.getCurrentDate().endOf('year').format('YYYY-MM-DD'));
    };

  }]);

})();
