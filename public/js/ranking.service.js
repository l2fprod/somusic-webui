(function () {
  angular.module('somusicApp')
    .service('RankingService', ['$http', '$q', RankingService]);

  function RankingService($http, $q) {
    console.log('RankingService loading...');
    return {
      get: function(startDate, endDate) {
        var deferred = $q.defer();

        $http.get("/api/1/ranking/" + startDate).success(function (data) {
          deferred.resolve(data);
        }).error(function () {
          deferred.reject();
        });
        return deferred.promise;
      }
    }
  }

})();
