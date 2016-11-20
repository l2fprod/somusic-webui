/*global angular*/
(function () {

  // listen for request sent over XHR and automatically show/hide spinner
  angular.module('ngLoadingSpinner', [])
    .directive('spinner', ['$http', function ($http) {
      return {
        link: function (scope, elm, attrs) {
          scope.isLoading = function () {
            return $http.pendingRequests.length > 0;
          };
          scope.$watch(scope.isLoading, function (loading) {
            if (loading) {
              document.getElementById('loadingProgress').style.visibility = "visible";
            } else {
              document.getElementById('loadingProgress').style.visibility = "hidden";
            }
          });
        }
      };
    }]);

  // angular app initialization
  var app = angular.module('somusicApp', [
    'ngMaterial',
    'ngLoadingSpinner',
    'ui.router',
    'angularCSS',
  ]);

  app.config(function ($provide) {
    $provide.decorator('$rootScope', ['$delegate', function ($delegate) {
      Object.defineProperty($delegate.constructor.prototype, '$bus', {
        get: function() {
          var self = this;
          return {
            subscribe: function() {
              var sub = postal.subscribe.apply(postal, arguments);
              self.$on('$destroy',
                function() {
                  sub.unsubscribe();
                }
              );
            },
            publish: postal.publish.bind(postal),
          };
        },
        enumerable: false
        });
        return $delegate;
      }]);
  });

  app.controller('MainController', ['$scope', '$state', 'RankingService', function ($scope, $state, RankingService) {
    var controller = this;

    $scope.currentMonths = _.range(12).map(function(value, index) {
      return RankingService.getCurrentDate().subtract(index, 'months');
    });

    $scope.lightTheme = true;
    $scope.toggleLight = function() {
      $scope.lightTheme = !$scope.lightTheme;
      var theme = $scope.lightTheme ? 'css/somusic-light.css': 'css/somusic-dark.css'
      console.log('Theme', theme);
      document.getElementById("theme").href=theme;
      document.getElementById('spotifyPlayer').src =
        document.getElementById('spotifyPlayer').src.replace($scope.lightTheme ? "black" : "white",
      $scope.lightTheme ? "white" : "black");
    };

    $scope.$bus.subscribe({
      channel: 'entries',
      topic: 'entry.select',
      callback: function(data, envelope) {
        var url = data.link;
        if (url.indexOf("?")>=0) {
          url = url.substring(0, url.indexOf("?"));
        }
        url = url.replace("https://open.spotify.com/", "spotify:");
        url = url.replace("/",":");
        url = "https://embed.spotify.com/?theme=" + ($scope.lightTheme ? "white" : "black") + "&uri=" + encodeURIComponent(url);
        console.log('Setting song to', url);
        document.getElementById('spotifyPlayer').src = url;
      }
    });
  }]);

  app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
  });

})();
