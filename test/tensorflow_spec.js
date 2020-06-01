var tensorflowNode = require('../tensorflow.js');
var fs = require('fs');
var helper = require('node-red-node-test-helper');

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
                    console.log('msg.payload = ' + JSON.stringify(msg.payload));
                    msg.should.have.property('payload', 'person');
                    done();
                });
                setTimeout(function () {
                    n1.receive({ payload: fs.readFileSync('./samples/yokoi.jpg') });
                }, 30000);
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

        it('should have result', function (done) {
            var flow = [{ id: 'n1', type: 'mobilenet', wires: [['n2']] },
                        { id: 'n2', type: 'helper' }];
            helper.load(tensorflowNode, flow, function () {
                var n2 = helper.getNode('n2');
                var n1 = helper.getNode('n1');
                n2.on("input", function (msg) {
                    console.log('msg.payload = ' + JSON.stringify(msg.payload));
                    msg.should.have.property('payload', ['suit', 'suit of clothes']);
                    done();
                });
                setTimeout(function () {
                    n1.receive({ payload: fs.readFileSync('./samples/yokoi.jpg') });
                }, 30000);
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

        it('should have result', function (done) {
            var flow = [{ id: 'n1', type: 'posenet', wires: [['n2']] },
                        { id: 'n2', type: 'helper' }];
            helper.load(tensorflowNode, flow, function () {
                var n2 = helper.getNode('n2');
                var n1 = helper.getNode('n1');
                n2.on("input", function (msg) {
                    console.log('msg.payload = ' + JSON.stringify(msg.payload));
                    msg.should.have.property('payload', {
                        nose: { x: 279.8517126239227, y: 315.6404763307089 },
                        leftEye: { x: 339.40865489202713, y: 260.4071526731498 },
                        rightEye: { x: 237.3576722497606, y: 255.88562608414585 },
                        leftEar: { x: 433.2652916815494, y: 308.92149127411005 },
                        rightShoulder: { x: 66.64864482953854, y: 589.8049531335496 }
                    });
                    done();
                });
                setTimeout(function () {
                    n1.receive({ payload: fs.readFileSync('./samples/yokoi.jpg') });
                }, 30000);
            });
        });
    });
});
