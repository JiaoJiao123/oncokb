'use strict';

/**
 * @ngdoc service
 * @name oncokbApp.importer
 * @description
 * # importer
 * Service in the oncokbApp.
 */
angular.module('oncokbApp')
    .service('importer', function importer($timeout, documents, S, storage, OncoKB, $q, _, stringUtils) {
        var self = this;
        self.docs = [];
        self.docsL = 0;
        self.newFolder = '';
        self.parentFolder = OncoKB.config.backupFolderId; //backup folder under knowledgebase
        self.status = {
            backupIndex: -1,
            migrateIndex: -1
        };

        function backup(callback) {
            if (self.parentFolder) {
                if (!angular.isFunction(callback)) {
                    callback = undefined;
                }

                createFolder().then(function (result) {
                    if (result && result.error) {
                        console.error('Create folder failed.', result);
                        if (callback) {
                            callback();
                        }
                    } else {
                        // var docs = documents.get({title: 'BRAF'});
                        self.docs = documents.get();
                        self.docsL = self.docs.length;
                        copyData(0, callback);
                    }
                });
            } else {
                console.log('Backup folder ID needed.');
            }
        }

        function createFolder() {
            var deferred = $q.defer();

            storage.requireAuth(true).then(function (result) {
                if (result && !result.error) {
                    storage.createFolder(self.parentFolder).then(function (result) {
                        if (result.id) {
                            self.newFolder = result.id;
                            deferred.resolve(result);
                        } else {
                            deferred.reject(result);
                        }
                    });
                }
            });

            return deferred.promise;
        }

        function copyData(index, callback) {
            if (index < self.docs.length) {
                var doc = self.docs[index];
                copyFileData(self.newFolder, doc.id, doc.title, index).then(function () {
                    if((index+1)%50 === 0){
                        console.log("copied another 50 genes, waiting 5s...");
                        $timeout(function () {
                                    copyData(++index, callback);
                                }, 5000, false);
                    }else{
                         copyData(++index, callback);
                    }
                });
            } else {
                if (callback) {
                    callback();
                }
                console.log('finished');
            }
        }

        function migrate() {
            var destinationFolderId = '';
            var deferred = $q.defer();

            destinationFolderId = '0BzBfo69g8fP6RmczanJFSVlNSjA';

            if (destinationFolderId) {
                self.newFolder = destinationFolderId;
                self.docs = documents.get();
                self.docsL = self.docs.length;

                //copy foler permissions
                //assignPermission(OncoKB.config.folderId, self.newFolder)
                //    .then(function(result){
                //      if(result && result.error){
                //        console.log('Error when assigning folder permissions', result);
                //      }else{
                migrateOneFileProcess(0, deferred);
                //}
                //});
            } else {
                createFolder().then(function (result) {
                    if (result && result.error) {
                        console.log('Unable create folder.', result);
                    } else {
                        self.docs = documents.get();
                        self.docsL = self.docs.length;

                        //copy foler permissions
                        assignPermission(OncoKB.config.folderId, self.newFolder)
                            .then(function (result) {
                                if (result && result.error) {
                                    console.log('Error when assigning folder permissions', result);
                                } else {
                                    migrateOneFileProcess(0, deferred);
                                }
                            });
                    }
                });
            }

            return deferred.promise;
        }

        function migrateOneFileProcess(docIndex, deferred) {
            if (docIndex < self.docsL) {
                var doc = self.docs[docIndex];
                copyFileData(self.newFolder, doc.id, doc.title, docIndex)
                    .then(function (result) {
                        if (result && result.error) {
                            console.log(result);
                            migrateOneFileProcess(++docIndex, deferred);
                        } else {
                            assignPermission(doc.id, result.id)
                                .then(function (result) {
                                    if (result && result.error) {
                                        console.log('error', result);
                                    } else {
                                        migrateOneFileProcess(++docIndex, deferred);
                                    }
                                });
                        }
                    });
            } else {
                console.log('Migrating finished.');
                deferred.resolve();
            }
        }

        function assignPermission(oldDocId, newDocId) {
            var deferred = $q.defer();
            console.log('\t Giving permissions');
            storage.getPermission(oldDocId).then(function (result) {
                if (result && result.error) {
                    deferred.reject(result);
                } else {
                    assignIndividualPermission(newDocId, result.items, 0, deferred);
                    //var promises = [];
                    //promises = result.items.forEach(function(permission, i){
                    //  if(permission.id && permission.emailAddress && permission.role && permission.type && permission.role !== 'owner'){
                    //    promises.push();
                    //  }
                    //});
                    //$q.all(promises).then(function(){
                    //  deferred.resolve();
                    //});
                }
            });
            return deferred.promise;
        }

        function assignIndividualPermission(newDocId, items, itemIndex, deferred) {
            if (itemIndex < items.length) {
                var permission = items[itemIndex];
                console.log('\t\t\tp-', itemIndex + 1);
                if (permission.id && permission.emailAddress && permission.role && permission.type && permission.role !== 'owner') {
                    storage.insertPermission(newDocId, permission.emailAddress, permission.type, permission.role).then(function () {
                        //$timeout(function () {
                        assignIndividualPermission(newDocId, items, ++itemIndex, deferred);
                        //}, 100);
                    });
                } else {
                    console.log('\t\t\tskip-', permission);
                    //$timeout(function () {
                    assignIndividualPermission(newDocId, items, ++itemIndex, deferred);
                    //}, 100);
                }
            } else {
                deferred.resolve();
                console.log('\t\tAll permissions are assigned.');
            }
        }

        function createVUSItem(vusItem, vusModel, model) {
            var vus = model.create(OncoKB.VUSItem);

            vus.name.setText(vusItem.name);
            _.each(vusItem.time, function (time) {
                var timeStamp = model.create(OncoKB.TimeStampWithCurator);
                timeStamp.value.setText(time.value);
                timeStamp.by.name.setText(time.by.name);
                timeStamp.by.email.setText(time.by.email);
                vus.time.push(timeStamp);
            });
            
            if(vusItem.nameComments) {
                _.each(vusItem.nameComments, function(comment) {
                    var _comment = model.create('Comment');
                    _comment.date.setText(comment.date);
                    _comment.userName.setText(comment.userName);
                    _comment.email.setText(comment.email);
                    _comment.content.setText(comment.content);
                    _comment.resolved.setText(comment.resolved);
                    vus.name_comments.push(_comment);
                });
            }
            vusModel.push(vus);
        }

        function copyFileData(folderId, fileId, fileTitle, docIndex) {
            var deferred = $q.defer();
            storage.requireAuth(true).then(function () {
                storage.createDocument(fileTitle, folderId).then(function (file) {
                    console.log('Created file ', fileTitle, docIndex + 1);
                    storage.getRealtimeDocument(fileId).then(function (realtime) {
                        if (realtime && realtime.error) {
                            console.log('did not get realtime document.');
                        } else {
                            console.log('\t Copying');
                            var gene = realtime.getModel().getRoot().get('gene');
                            var vus = realtime.getModel().getRoot().get('vus');
                            if (gene) {
                                var geneData = stringUtils.getGeneData(gene);
                                var vusData = stringUtils.getVUSFullData(vus);
                                storage.getRealtimeDocument(file.id).then(function (newRealtime) {
                                    var model = createModel(newRealtime.getModel());
                                    var geneModel = model.getRoot().get('gene');
                                    var vusModel = model.getRoot().get('vus');

                                    model.beginCompoundOperation();
                                    for (var key in geneData) {
                                        if (geneModel[key]) {
                                            geneModel = setValue(model, geneModel, geneData[key], key);
                                        }
                                    }

                                    if (vusData) {
                                        _.each(vusData, function (vusItem) {
                                            createVUSItem(vusItem, vusModel, newRealtime.getModel());
                                        });
                                    }
                                    model.endCompoundOperation();
                                    console.log('\t Done.');
                                    $timeout(function () {
                                        deferred.resolve(file);
                                    }, 500, false);
                                });
                            } else {
                                console.log('\t\tNo gene model.');
                                $timeout(function () {
                                    deferred.resolve(file);
                                }, 500, false);
                            }
                        }
                    });
                });
            });
            return deferred.promise;
        }

        function setValue(rootModel, model, value, key) {
            if (angular.isString(value)) {
                if (model[key] && model[key].type) {
                    model[key].setText(value);
                }else if(model.type === 'Map'){
                    model.set(key, value);
                } else {
                    console.log('Unknown key', key);
                }
            } else if (angular.isArray(value)) {
                value.forEach(function (e) {
                    var _datum;
                    switch (key) {
                        case 'curators':
                            _datum = rootModel.create('Curator');
                            break;
                        case 'mutations':
                            _datum = rootModel.create('Mutation');
                            break;
                        case 'transcripts':
                            _datum = rootModel.create('ISOForm');
                            break;
                        case 'tumors':
                            _datum = rootModel.create('Tumor');
                            break;
                        case 'TI':
                            _datum = rootModel.create('TI');
                            break;
                        case 'treatments':
                            _datum = rootModel.create('Treatment');
                            break;
                        case 'cancerTypes':
                            _datum = rootModel.create('CancerType');
                            break;
                        case 'trials':
                            _datum = e;
                            break;
                        default:
                            break;
                    }

                    if (key.indexOf('_comments') !== -1) {
                        _datum = rootModel.create('Comment');
                    }

                    if (key === 'TI') {
                        _datum.types.set('status', e.status);
                        _datum.types.set('type', e.type);
                        delete e.status;
                        delete e.type;
                    }
                    if (key !== 'trials') {
                        for (var _key in e) {
                            _datum = setValue(rootModel, _datum, e[_key], _key);
                        }
                    }
                    model[key].push(_datum);
                });
            } else if (angular.isObject(value)) {
                var _datum;
                switch (key) {
                    case 'nccn':
                        _datum = rootModel.create('NCCN');
                        break;
                    case 'effect':
                        _datum = rootModel.create('ME');
                        break;
                    case 'interactAlts':
                        _datum = rootModel.create('InteractAlts');
                        break;
                    case 'type':
                        _datum = rootModel.createMap(OncoKB.keyMappings['type']);
                        break;    
                }

                if (key.indexOf('_eStatus') !== -1) {
                    for (var _key in value) {
                        model[key].set(_key, value[_key]);
                    }
                } else if (key.indexOf('_timeStamp') !== -1) {
                    for (var _key in value) {
                        _datum = rootModel.create('TimeStamp');
                        _datum.value.setText(value[_key].value || '');
                        _datum.by.setText(value[_key].by || '');
                        model[key].set(_key, _datum);
                    }
                } else {
                    for (var _key in value) {
                        _datum = setValue(rootModel, _datum, value[_key], _key);
                    }
                    model[key] = _datum;
                }
            } else {
                console.log('Error value type.');
            }
            return model;
        }

        function createModel(model) {
            model = createGeneModel(model);
            model = createVUSModel(model);
            return model;
        }

        function createGeneModel(model) {
            if (!model.getRoot().get('gene')) {
                var gene = model.create('Gene');
                model.getRoot().set('gene', gene);
            }
            return model;
        }

        function createVUSModel(model) {
            if (!model.getRoot().get('vus')) {
                var vus = model.createList();
                model.getRoot().set('vus', vus);
            }
            return model;
        }

        return {
            backup: backup,
            migrate: migrate
        };
    });