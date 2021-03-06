'use strict';

describe('Directive: eStatus', function () {

  // load the directive's module
  beforeEach(module('oncokbApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<e-status></e-status>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the eStatus directive');
  }));
});
