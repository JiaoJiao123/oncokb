/**
 * Created by jiaojiao on 10/24/17.
 */
'use strict';

/**
 * @ngdoc service
 * @name oncokb.additionalFile
 * @description
 * # Additional Files, currently including meta and queues.
 * Service in the oncokb.
 */
angular.module('oncokbApp')
    .service('additionalFile', function additionalFile($rootScope, $q, mainUtils, dialogs, $timeout, DatabaseConnector) {
        function load(types) {
            function loadMeta() {
                var metaDefer = $q.defer();
                if ($rootScope.metaData) {
                    metaDefer.resolve('success');
                } else {
                    var ref = firebase.database().ref('Meta');
                    ref.on('value', function(doc) {
                        $rootScope.metaData = doc.val();
                        metaDefer.resolve('success');
                    }, function(error) {
                        metaDefer.reject('Fail to load queues file');
                    });
                }
                return metaDefer.promise;
            }
            function loadQueues() {
                var queuesDefer = $q.defer();
                var ref = firebase.database().ref('Queues');
                ref.on('value', function(doc) {
                    $rootScope.firebaseQueues = doc.val();
                    queuesDefer.resolve('success');
                }, function(error) {
                    queuesDefer.reject('Fail to load queues file');
                });
                return queuesDefer.promise;
            }
            /**
             * Loop through api calls recorded in the meta file and update it to database every 5 mins
             * **/
            function synchronizeData() {
                var hugoSymbols = $rootScope.apiData.keys();
                _.each(hugoSymbols, function(hugoSymbol) {
                    if ($rootScope.apiData.get(hugoSymbol).has('vus')) {
                        updateByType('vus', hugoSymbol, $rootScope.apiData.get(hugoSymbol).get('vus').get('data'));
                    }
                    // TODO
                    // updateByType('priority', hugoSymbol, $rootScope.apiData.get(hugoSymbol).get('priority'));
                    // updateByType('drug', hugoSymbol, $rootScope.apiData.get(hugoSymbol).get('drug'));
                });
                $timeout(function() {
                    synchronizeData();
                }, 300000);
            }
            function updateByType(type, hugoSymbol, data) {
                if (type === 'vus') {
                    DatabaseConnector.updateVUS(hugoSymbol, data, function() {
                        $rootScope.apiData.get(hugoSymbol).delete('vus');
                    });
                } else if (type === 'priority') {
                    // TODO
                } else if (type === 'drug') {
                    // TODO
                }
            }
            var deferred = $q.defer();
            var apiCalls = [];
            if (types.indexOf('all') !== -1  || types.indexOf('meta') !== -1) {
                apiCalls.push(loadMeta());
            }
            if (types.indexOf('all') !== -1 || types.indexOf('queues') !== -1) {
                apiCalls.push(loadQueues());
            }
            if (apiCalls.length > 0) {
                $q.all(apiCalls)
                    .then(function(result) {
                        deferred.resolve('success');
                    }, function(error) {
                        deferred.reject('fail to load specified files');
                    });
            } else {
                deferred.resolve('success');
            }
            return deferred.promise;
        }
        return {
            load: load
        }
    });
