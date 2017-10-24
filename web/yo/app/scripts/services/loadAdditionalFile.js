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
    .service('loadAdditionalFile', function loadFile($route, $location, $q, storage, documents) {
        storage.retrieveAdditional().then(function(result) {
            if (result && (result.error || !_.isArray(result) || result.length === 0)) {
                dialogs.error('Error', 'Fail to retrieve meta file! Please stop editing and contact the developer!');
                var sendTo = 'dev.oncokb@gmail.com';
                var subject = 'Fail to retrieve meta file';
                var content;
                if (_.isArray(result) && result.length === 0) {
                    content = 'There is no meta file inside the Meta folder';
                } else {
                    content = 'System error is ' + JSON.stringify(result.error);
                }
                MainUtils.sendEmail(sendTo, subject, content);
            } else {
                Documents.setAdditionalDocs(result);
                var meta = Documents.getAdditionalDoc('meta');
                storage.getMetaRealtimeDocument(meta.id).then(function(metaRealtime) {
                    if (metaRealtime && metaRealtime.error) {
                        dialogs.error('Error', 'Fail to get meta document! Please stop editing and contact the developer!');
                    } else {
                        $rootScope.metaRealtime = metaRealtime;
                        $rootScope.metaModel = metaRealtime.getModel();
                        $rootScope.metaData = metaRealtime.getModel().getRoot().get('review');
                        processMeta();
                    }
                });
            }
        });
        return {

        }
    });
