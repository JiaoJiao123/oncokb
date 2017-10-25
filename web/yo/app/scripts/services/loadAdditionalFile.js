/**
 * Created by jiaojiao on 10/24/17.
 */
'use strict';

/**
 * @ngdoc service
 * @name oncokb.loadFile
 * @description
 * # loadFile
 * Service in the oncokb.
 */
angular.module('oncokbApp')
    .service('loadAdditionalFile', function loadAdditionalFile($rootScope, $q, storage, mainUtils, documents, dialogs) {
        return function(type) {
            function loadMeta() {
                var metaDefer = $q.defer();
                var meta = documents.getAdditionalDoc('meta');
                storage.getMetaRealtimeDocument(meta.id).then(function(metaRealtime) {
                    if (metaRealtime && metaRealtime.error) {
                        dialogs.error('Error', 'Fail to get meta document! Please stop editing and contact the developer!');
                        metaDefer.error('Fail to load meta file');
                    } else {
                        $rootScope.metaRealtime = metaRealtime;
                        $rootScope.metaModel = metaRealtime.getModel();
                        $rootScope.metaData = metaRealtime.getModel().getRoot().get('review');
                        metaDefer.resolve('success');
                    }
                });
                return metaDefer;
            }

            function loadQueues() {
                var queuesDefer = $q.defer();
                var queuesDoc = documents.getAdditionalDoc('queues');
                storage.getMetaRealtimeDocument(queuesDoc.id).then(function(queuesRealtime) {
                    if (queuesRealtime && queuesRealtime.error) {
                        dialogs.error('Error', 'Fail to get queues document! Please stop editing and contact the developer!');
                        queuesDefer.error('Fail to load queues file');
                    } else {
                        $rootScope.queuesRealtime = queuesRealtime;
                        $rootScope.queuesModel = queuesRealtime.getModel();
                        $rootScope.queuesData = queuesRealtime.getModel().getRoot().get('queues');
                        queuesDefer.resolve('success');
                    }
                });
                return queuesDefer;
            }
            var deferred = $q.defer();
            storage.retrieveAdditional().then(function(result) {
                if (!result || result.error || !_.isArray(result) || result.length !== 2) {
                    dialogs.error('Error', 'Fail to retrieve additional files! Please stop editing and contact the developer!');
                    var sendTo = 'dev.oncokb@gmail.com';
                    var subject = 'Fail to retrieve meta file';
                    var content = 'The additional files are not correctly located. Please double check. ';
                    if (result && result.error) {
                        content += 'System error is ' + JSON.stringify(result.error);
                    }
                    mainUtils.sendEmail(sendTo, subject, content);
                    deferred.error(result);
                } else {
                    documents.setAdditionalDocs(result);
                    var apiCalls = [];
                    if (type === 'all' || type === 'meta') {
                        apiCalls.push(loadMeta);
                    }
                    if (type === 'all' || type === 'queues') {
                        apiCalls.push(loadQueues);
                    }
                    if (apiCalls.length > 0) {
                        $q.all(apiCalls)
                            .then(function(result) {
                                deferred.resolve('success');
                            }, function(error) {
                                deferred.error('fail to load specified files');
                            });
                    } else {
                        deferred.resolve('success');
                    }

                }
            });
            return deferred.promise;
        }
    });
