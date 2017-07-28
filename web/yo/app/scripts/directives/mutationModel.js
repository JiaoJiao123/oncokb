/**
 * Created by jiaojiao on 9/18/17.
 */
'use strict';

/**
 * @ngdoc directive
 * @name oncokb.directive:comments
 * @description
 * # comments
 */
angular.module('oncokbApp')
    .directive('mutationModel', function() {
        return {
            templateUrl: 'views/mutationModel.html',
            restrict: 'AE',
            scope: {
                type: '=',
                number: '='
            },
            replace: true,
            link: function postLink(scope, element, attrs) {
            },
            controller: function($scope) {
                $scope.type = 'pmid';
                $scope.id = '1';
            }
        };
    });
