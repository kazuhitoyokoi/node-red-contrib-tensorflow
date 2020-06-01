var fs = require('fs');
var helper = require('node-red-node-test-helper');
var tensorflowNode = require('../tensorflow.js');

describe('tensorflow nodes', function () {
    afterEach(function () {
        helper.unload();
    });

    describe('cocossd node', function () {
        it('should be loaded', function (done) {
            var flow = [{ id: 'n1', type: 'cocossd', name: 'test name' }];
            helper.load(tensorflowNode, flow, function () {
                var n1 = helper.getNode('n1');
                n1.should.have.property('name', 'test name');
                done();
            });
        });

        it('should have result', function (done) {
            var flow = [{ id: 'n1', type: 'cocossd', wires: [['n2']] },
                        { id: 'n2', type: 'helper' }];
            helper.load(tensorflowNode, flow, function () {
                var n2 = helper.getNode('n2');
                var n1 = helper.getNode('n1');
                n2.on("input", function (msg) {
                    console.log('msg.payload = ' + msg.payload);
                    msg.should.have.property('payload', 'person');
                    done();
                });
                setTimeout(function () {
                    n1.receive({ payload: fs.readFileSync('./samples/yokoi.jpg') });
                }, 20000);
            });
        });
    });

    describe('handpose node', function () {
        it('should be loaded', function (done) {
            var flow = [{ id: 'n1', type: 'handpose', name: 'test name' }];
            helper.load(tensorflowNode, flow, function () {
                var n1 = helper.getNode('n1');
                n1.should.have.property('name', 'test name');
                done();
            });
        });
    });

    describe('mobilenet node', function () {
        it('should be loaded', function (done) {
            var flow = [{ id: 'n1', type: 'mobilenet', name: 'test name' }];
            helper.load(tensorflowNode, flow, function () {
                var n1 = helper.getNode('n1');
                n1.should.have.property('name', 'test name');
                done();
            });
        });
    });

    describe('posenet node', function () {
        it('should be loaded', function (done) {
            var flow = [{ id: 'n1', type: 'posenet', name: 'test name' }];
            helper.load(tensorflowNode, flow, function () {
                var n1 = helper.getNode('n1');
                n1.should.have.property('name', 'test name');
                done();
            });
        });
    });
});
