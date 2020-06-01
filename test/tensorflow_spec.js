var helper = require('node-red-node-test-helper');
var tensorflowNode = require('../tensorflow.js');

describe('cocossd node', function () {
    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [{ id: 'n1', type: 'cocossd', name: 'test name' }];
        helper.load(tensorflowNode, flow, function () {
            var n1 = helper.getNode("n1");
            n1.should.have.property('name', 'test name');
            done();
        });
    });
});

describe('handpose node', function () {
    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [{ id: 'n1', type: 'handpose', name: 'test name' }];
        helper.load(tensorflowNode, flow, function () {
            var n1 = helper.getNode("n1");
            n1.should.have.property('name', 'test name');
            done();
        });
    });
});

describe('mobilenet node', function () {
    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [{ id: 'n1', type: 'mobilenet', name: 'test name' }];
        helper.load(tensorflowNode, flow, function () {
            var n1 = helper.getNode("n1");
            n1.should.have.property('name', 'test name');
            done();
        });
    });
});

describe('posenet node', function () {
    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [{ id: 'n1', type: 'posenet', name: 'test name' }];
        helper.load(tensorflowNode, flow, function () {
            var n1 = helper.getNode("n1");
            n1.should.have.property('name', 'test name');
            done();
        });
    });
});
