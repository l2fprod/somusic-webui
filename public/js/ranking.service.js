(function () {
  angular.module('somusicApp')
    .service('RankingService', ['$http', '$q', RankingService]);

  function RankingService($http, $q) {
    console.log('RankingService loading...');
    var self = this;

    self.currentDate = moment().startOf('day');

    return {
      newEmptyRanking: function() {
        var ranking = {};
        ranking.entries = _.range(50).map(function(value, index) {
          return {
            title: "...",
            artist: "...",
            image: "/images/empty.svg"
          }
        });
        return ranking;
      },
      getCurrentDate: function() {
        return moment(self.currentDate);
      },
      get: function(startDate, endDate) {
        var deferred = $q.defer();
        $http.get("/api/1/ranking/" + startDate + "/" + (endDate || startDate)).success(function (data) {
        //$http.get("/js/ranking.json").success(function (data) {
          deferred.resolve(data);
        }).error(function () {
          deferred.reject();
        });
        return deferred.promise;
      },
      tracksByMonth: function(year, month) {
        var deferred = $q.defer();
        $http.get("/api/1/ranking/tracks/" + year + "/" + month).success(function (data) {
        //$http.get("/js/ranking.json").success(function (data) {
          deferred.resolve(data);
        }).error(function () {
          deferred.reject();
        });
        return deferred.promise;
      }
    }
  }
})();
