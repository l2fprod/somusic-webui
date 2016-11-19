(function () {

  var app = angular.module('somusicApp');

  app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'home/home.html',
      css: 'home/home.css'
    });
  });

  app.controller('HomeController', ['$scope', '$state', 'RankingService', function ($scope, $state, RankingService) {
    console.log("HomeController()");
    var controller = this;
    controller.rankings = [];


    function getRanking(startDate, endDate) {
      console.log('Looking for ranking', startDate, endDate);
      RankingService.get(startDate, endDate).then(function(data) {
        console.log('Received ranking', data);
        controller.rankings = data;
      });
    }
    controller.today = function() {
      getRanking(moment().startOf('day').format('YYYY-MM-DD'), moment().endOf('day').format('YYYY-MM-DD'));
    };

    controller.thisWeek = function() {
      getRanking(moment().startOf('week').format('YYYY-MM-DD'), moment().endOf('week').format('YYYY-MM-DD'));
    };

    controller.thisMonth = function() {
      getRanking(moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').format('YYYY-MM-DD'));
    };

    controller.thisYear = function() {
      getRanking(moment().startOf('year').format('YYYY-MM-DD'), moment().endOf('year').format('YYYY-MM-DD'));
    };

  }]);

})();
