'use strict';
/**
 * @ngdoc overview
 * @name oncokb
 * @description
 * # oncokb
 *
 * Main module of the application.
 */
var OncoKB = {};
var gapi = window.gapi;

// Global variables
OncoKB.global = {};
// OncoKB.global.genes
// OncoKB.global.alterations
// OncoKB.global.tumorTypes
// OncoKB.global.treeEvidence
// OncoKB.global.processedData

// Variables for tree tab
OncoKB.tree = {};
// processedData

// OncoKB configurations, reading from config.json
// All contents here are pointing to few examples files.
OncoKB.config = {
    clientId: '', // Your client ID from google developer console
    scopes: [
        'https://www.googleapis.com/auth/plus.profile.emails.read',
        'https://www.googleapis.com/auth/drive.file'
    ],
    folderId: '0BzBfo69g8fP6NkgtWGZxd0NjcWs', // Example folder
    userRoles: {
        public: 1,
        user: 2,
        curator: 4,
        admin: 8
    },
    backupFolderId: '0BzBfo69g8fP6LWozVE56Mk1RYkU',  // Example backup folder
    users: '', // The google spreadsheet ID which used to manage the user info. Please share this file to the service email address with view permission.
    apiLink: 'legacy-api/',
    curationLink: 'legacy-api/',
    oncoTreeLink: 'http://oncotree.mskcc.org/oncotree/api/',
    oncoTreeVersion: 'oncotree_2017_06_21',
    testing: true
};
OncoKB.backingUp = false;
function getString(string) {
    if(!string || !_.isString(string)) {
        return '';
    }
    var tmp = window.document.createElement('DIV');
    var processdStr = string.replace(/(\r\n|\n|\r)/gm, '');
    var processdStr = processdStr.replace(/<style>.*<\/style>/i, '');
    tmp.innerHTML = processdStr;
    /* eslint new-cap: 0*/
    var _string = tmp.textContent || tmp.innerText || S(string).stripTags().s;
    string = S(_string).collapseWhitespace().s;
    string = string.replace(/<!--.*-->/g, '');
    return string;
}
OncoKB.utils = {
    getString: getString
};
OncoKB.keyMappings = {type: {TSG: '', OCG: ''}};

OncoKB.initialize = function() {
    firebase.initializeApp(OncoKB.config.firebaseConfig);
};

var oncokbApp = angular.module('oncokbApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap',
    'localytics.directives',
    'dialogs.main',
    'dialogs.default-translations',
    'RecursionHelper',
    'angularFileUpload',
    'xml',
    'contenteditable',
    'datatables',
    'datatables.bootstrap',
    'localytics.directives',
    'ui.sortable',
    'firebase'
])
    .value('user', {
        name: '',
        email: '',
        photoURL: ''
    })
    .value('OncoKB', OncoKB)
    // This is used for typeahead
    .constant('SecretEmptyKey', '[$empty$]')
    .constant('gapi', window.gapi)
    .constant('loadingScreen', window.loadingScreen)
    .constant('S', window.S)
    .constant('_', window._)
    .constant('Levenshtein', window.Levenshtein)
    .constant('XLSX', window.XLSX)
    .constant('PDF', window.jsPDF)
    .constant('gapi', window.gapi)
    .constant('Tree', window.Tree)
    .constant('UUIDjs', window.UUIDjs)
    .config(function($provide, $locationProvider, $routeProvider, $sceProvider, dialogsProvider, $animateProvider, x2jsProvider, config) {
        var access = config.accessLevels;

        // $locationProvider.html5Mode(true);
        $routeProvider
            .when('/', {
                templateUrl: 'views/welcome.html',
                access: access.public,
                internalUse: false
            })
            .when('/tree', {
                templateUrl: 'views/tree.html',
                controller: 'TreeCtrl',
                access: access.admin,
                internalUse: true
            })
            .when('/variant', {
                templateUrl: 'views/variant.html',
                controller: 'VariantCtrl',
                reloadOnSearch: false,
                access: access.admin,
                internalUse: true
            })
            .when('/tools', {
                templateUrl: 'views/tools.html',
                controller: 'ToolsCtrl',
                access: access.admin,
                internalUse: true
            })
            .when('/genes', {
                templateUrl: 'views/genes.html',
                controller: 'GenesCtrl',
                access: access.curator,
                internalUse: false
            })
            .when('/gene/:geneName', {
                templateUrl: 'views/gene.html',
                controller: 'GeneCtrl',
                access: access.curator,
                internalUse: false
            })
            .when('/feedback', {
                templateUrl: 'views/feedback.html',
                // controller: 'FeedbackCtrl',
                access: access.admin,
                internalUse: true
            })
            .when('/queues', {
                templateUrl: 'views/queues.html',
                access: access.curator
            })
            .otherwise({
                redirectTo: '/'
            });

        dialogsProvider.useBackdrop(true);
        dialogsProvider.useEscClose(true);
        dialogsProvider.useCopy(false);
        dialogsProvider.setSize('sm');

        $animateProvider.classNameFilter(/^((?!(fa-spinner)).)*$/);

        x2jsProvider.config = {
            /*
             escapeMode               : true|false - Escaping XML characters. Default is true from v1.1.0+
             attributePrefix          : '<string>' - Prefix for XML attributes in JSon model. Default is '_'
             arrayAccessForm          : 'none'|'property' - The array access form (none|property). Use this property if you want X2JS generates an additional property <element>_asArray to access in array form for any XML element. Default is none from v1.1.0+
             emptyNodeForm            : 'text'|'object' - Handling empty nodes (text|object) mode. When X2JS found empty node like <test></test> it will be transformed to test : '' for 'text' mode, or to Object for 'object' mode. Default is 'text'
             enableToStringFunc       : true|false - Enable/disable an auxiliary function in generated JSON objects to print text nodes with text/cdata. Default is true
             arrayAccessFormPaths     : [] - Array access paths. Use this option to configure paths to XML elements always in 'array form'. You can configure beforehand paths to all your array elements based on XSD or your knowledge. Every path could be a simple string (like 'parent.child1.child2'), a regex (like /.*\.child2/), or a custom function. Default is empty
             skipEmptyTextNodesForObj : true|false - Skip empty text tags for nodes with children. Default is true.
             stripWhitespaces         : true|false - Strip whitespaces (trimming text nodes). Default is true.
             datetimeAccessFormPaths  : [] - Datetime access paths. Use this option to configure paths to XML elements for 'datetime form'. You can configure beforehand paths to all your array elements based on XSD or your knowledge. Every path could be a simple string (like 'parent.child1.child2'), a regex (like /.*\.child2/), or a custom function. Default is empty
             */
            attributePrefix: '$'
        };

        $provide.decorator('$exceptionHandler', function($delegate, $injector) {
            return function(exception, cause) {
                var $rootScope = $injector.get('$rootScope');
                $rootScope.addError({
                    message: 'Exception',
                    reason: exception,
                    case: cause
                });
                // $rootScope.$emit('oncokbError', {message: 'Exception', reason: exception, case: cause});
                if (!config.production && exception && exception.name !== 'DocumentClosedError') {
                    $delegate(exception, cause);
                }
            };
        });

        $sceProvider.enabled(false);
    });

angular.module('oncokbApp').run(
    ['$timeout', '$rootScope', '$location', 'loadingScreen', 'config', 'DatabaseConnector', 'dialogs', 'stringUtils', 'mainUtils', 'userFire',
        function($timeout, $rootScope, $location, loadingScreen, config, DatabaseConnector, dialogs, stringUtils, mainUtils, userFire) {
            $rootScope.errors = [];
            $rootScope.internal = true;

            $rootScope.isDesiredGene = true;

            $rootScope.user = {
                role: config.userRoles.public
            };

            $rootScope.meta = {
                levelsDesc: {
                    '0': 'FDA-approved drug in this indication irrespective of gene/variant biomarker',
                    '1': 'FDA-recognized biomarker predictive of response to an FDA-approved drug in this indication',
                    '2A': 'Standard of care biomarker predictive of response to an FDA-approved drug in this indication',
                    '2B': 'Standard of care biomarker predictive of response to an FDA-approved drug in another indication but not standard of care for this indication',
                    '3A': 'Compelling clinical evidence supports the biomarker as being predictive of response to a drug in this indication but neither biomarker and drug are standard of care',
                    '3B': 'Compelling clinical evidence supports the biomarker as being predictive of response to a drug in another indication but neither biomarker and drug are standard of care',
                    '4': 'Compelling biological evidence supports the biomarker as being predictive of response to a drug but neither biomarker and drug are standard of care',
                    'R1': 'Standard of care biomarker predictive of resistance to an FDA-approved drug in this indication',
                    'R2': 'Not NCCN compendium-listed biomarker, but clinical evidence linking this biomarker to drug resistance',
                    'R3': 'Not NCCN compendium-listed biomarker, but preclinical evidence potentially linking this biomarker to drug resistance'
                },
                levelsDescHtml: {
                    '0': '<span>FDA-approved drug in this indication irrespective of gene/variant biomarker</span>',
                    '1': '<span><b>FDA-recognized</b> biomarker predictive of response to an <b>FDA-approved</b> drug <b>in this indication</b></span>',
                    '2A': '<span><b>Standard of care</b> biomarker predictive of response to an <b>FDA-approved</b> drug <b>in this indication</b></span>',
                    '2B': '<span><b>Standard of care</b> biomarker predictive of response to an <b>FDA-approved</b> drug <b>in another indication</b> but not standard of care for this indication</span>',
                    '3A': '<span><b>Compelling clinical evidence</b> supports the biomarker as being predictive of response to a drug <b>in this indication</b> but neither biomarker and drug are standard of care</span>',
                    '3B': '<span><b>Compelling clinical evidence</b> supports the biomarker as being predictive of response to a drug <b>in another indication</b> but neither biomarker and drug are standard of care</span>',
                    '4': '<span><b>Compelling biological evidence</b> supports the biomarker as being predictive of response to a drug but neither biomarker and drug are standard of care</span>',
                    'R1': '<span><b>Standard of care</b> biomarker predictive of <b>resistance</b> to an <b>FDA-approved</b> drug <b>in this indication</b></span>',
                    'R2': '<span>Not NCCN compendium-listed biomarker, but clinical evidence linking this biomarker to drug resistance</span>',
                    'R3': '<span>Not NCCN compendium-listed biomarker, but preclinical evidence potentially linking this biomarker to drug resistance</span>'
                },
                colorsByLevel: {
                    Level_1: '#33A02C',
                    Level_2A: '#1F78B4',
                    Level_2B: '#80B1D3',
                    Level_3A: '#984EA3',
                    Level_3B: '#BE98CE',
                    Level_4: '#424242',
                    Level_R1: '#EE3424',
                    Level_R2: '#F79A92',
                    Level_R3: '#FCD6D3'
                }
            };

            $rootScope.addError = function(error) {
                $rootScope.errors.push(error);
            };

            // Error loading the document, likely due revoked access. Redirect back to home/install page
            $rootScope.$on('$routeChangeError', function() {
                $location.url('/');
            });

            $rootScope.$on('$routeChangeStart', function(event, next) {
                if (!$rootScope.isSignedIn) {
                    $location.path('/');
                }                
            });
            // Other unidentify error
            $rootScope.$on('oncokbError', function(event, data) {
                var subject = 'OncoKB Bug.  Case Number:' + stringUtils.getCaseNumber() + ' ' + data.reason;
                var content = 'User: ' + JSON.stringify($rootScope.user) + '\n\nError message - reason:\n' + data.message;
                mainUtils.notifyDeveloper(subject, content);
            });

            //$rootScope.$watch('internal', function(n) {
            //    if (!n && $rootScope.user.role === OncoKB.config.userRoles.admin) {
            //        dialogs.notify('Notification', 'Please notice the website can not connect to internal network. All admin features will not be available at this moment.');
            //    }
            //});
        }]);

/**
 * Bootstrap the app
 */
(function(_, gapi, angular, $) {
    /**
     * Get OncoKB configurations
     */
    function fetchData() {
        var initInjector = angular.injector(['ng']);
        var $http = initInjector.get('$http');

        $http.get('data/config.json').then(function(response) {
            if (_.isObject(response.data)) {
                OncoKB.config = $.extend(true, OncoKB.config, response.data);
                OncoKB.config.accessLevels = {
                    public: OncoKB.config.userRoles.public | OncoKB.config.userRoles.user | OncoKB.config.userRoles.curator | OncoKB.config.userRoles.admin,
                    user: OncoKB.config.accessLevels.public,
                    curator: OncoKB.config.userRoles.curator | OncoKB.config.userRoles.admin,
                    admin: OncoKB.config.userRoles.admin
                };
                OncoKB.initialize();
                oncokbApp.constant('config', OncoKB.config);
                bootstrapApplication();
            }
        }, function() {
            console.error('Failed to load JSON configuration file.');
        });
    }

    /**
     * Bootstrap Angular application
     */
    function bootstrapApplication() {
        angular.element(document).ready(function() {
            angular.bootstrap(document, ['oncokbApp']);
        });
    }

    fetchData();
})(window._, window.gapi, window.angular, window.jQuery);
