var jimp = require('jimp');
var streamBuffers = require('stream-buffers');
var pureimage = require('pureimage');
var cocossd = require('@tensorflow-models/coco-ssd');
var handpose = require('@tensorflow-models/handpose');
var mobilenet = require('@tensorflow-models/mobilenet');
var posenet = require('@tensorflow-models/posenet');

module.exports = function (RED) {
    RED.httpAdmin.get("/models/:dir/:name", function (req, res) {
        var options = { root: __dirname + '/models/' + req.params.dir, dotfiles: 'deny' };
        res.sendFile(req.params.name, options);
    });

    function CocossdNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var modelCocossd;

        setTimeout(function () {
            node.status({ fill: "green", shape: 'ring', text: 'loading model...' });
            cocossd.load({
                modelUrl: 'http://localhost:' + RED.settings.uiPort + '/models/coco-ssd/model.json'
            }).then(function (model) {
                modelCocossd = model;
                node.status({ fill: "green", shape: 'ring', text: 'model loaded' });
            }).catch(function (error) {
                cocossd.load().then(function (model2) {
                    modelCocossd = model2;
                    node.status({ fill: "green", shape: 'ring', text: 'model loaded' });
                }).catch(function (error2) {
                    node.error(error);
                    node.error(error2);
                    node.status({ fill: 'red', shape: 'ring', text: 'fail to load model' });
                });
            });
        }, 1000);

        node.on('input', function (msg) {
            node.status({ fill: "green", shape: 'dot', text: 'analyzing...' });
            jimp.read(msg.payload).then(function (data) {
                return data.getBufferAsync(jimp.MIME_PNG);
            }).then(function (buffer) {
                var rsb = new streamBuffers.ReadableStreamBuffer();
                rsb.put(buffer);
                pureimage.decodePNGFromStream(rsb).then(function (image) {
                    var cv = pureimage.make(image.width, image.height);
                    cv.getContext('2d').drawImage(image, 0, 0);
                    modelCocossd.detect(cv).then(function (result) {
                        msg.details = result;
                        if (0 < result.length) {
                            msg.payload = result[0].class
                            var cv2 = pureimage.make(image.width, image.height);
                            var ctx = cv2.getContext('2d');
                            ctx.drawImage(image, 0, 0);
                            ctx.strokeStyle = 'rgb(255, 111, 0)';
                            ctx.strokeRect(result[0].bbox[0], result[0].bbox[1], result[0].bbox[2], result[0].bbox[3]);
                            ctx.fillStyle = 'rgba(255, 111, 0, 0.5)';
                            ctx.fillRect(result[0].bbox[0], result[0].bbox[1], result[0].bbox[2], result[0].bbox[3]);
                            var wsb = new streamBuffers.WritableStreamBuffer({ initialSize: 1, incrementAmount: 1 });
                            pureimage.encodePNGToStream(cv2, wsb).then(function () {
                                msg.annotatedInput = wsb.getContents();
                                node.send(msg);
                                node.status({});
                            }).catch(function (error) {
                                node.error(error, msg);
                                node.status({ fill: 'red', shape: 'ring', text: error });
                            });
                        } else {
                            msg.annotatedInput = msg.payload;
                            msg.payload = null;
                            node.send(msg);
                            node.status({});
                        }
                    }, function (error) {
                        node.error(error, msg);
                        node.status({ fill: 'red', shape: 'ring', text: 'error' });
                    });
                });
            });
        });
    }

    RED.nodes.registerType("cocossd", CocossdNode);

    function HandposeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var modelHandpose;

        setTimeout(function () {
            node.status({ fill: "green", shape: 'ring', text: 'loading model...' });
            handpose.load().then(function (model) {
                modelHandpose = model;
                node.status({ fill: "green", shape: 'ring', text: 'model loaded' });
            }).catch(function (error) {
                node.error(error);
                node.status({ fill: 'red', shape: 'ring', text: 'fail to load model' });
            });
        }, 1000);

        node.on('input', function (msg) {
            node.status({ fill: "green", shape: 'dot', text: 'analyzing...' });
            jimp.read(msg.payload).then(function (data) {
                return data.getBufferAsync(jimp.MIME_PNG);
            }).then(function (buffer) {
                var rsb = new streamBuffers.ReadableStreamBuffer();
                rsb.put(buffer);
                pureimage.decodePNGFromStream(rsb).then(function (image) {
                    var cv = pureimage.make(image.width, image.height);
                    cv.getContext('2d').drawImage(image, 0, 0);
                    modelHandpose.estimateHands(cv).then(function (result) {
                        msg.details = result;
                        var position = {};
                        if (0 < result.length) {
                            position['palmBase'] = { x: result[0].landmarks[0][0],
                                                     y: result[0].landmarks[0][1] };
                            position['thumb'] = { x: result[0].landmarks[4][0],
                                                  y: result[0].landmarks[4][1] };
                            position['indexFinger'] = { x: result[0].landmarks[8][0],
                                                        y: result[0].landmarks[8][1] };
                            position['middleFinger'] = { x: result[0].landmarks[12][0],
                                                         y: result[0].landmarks[12][1] };
                            position['ringFinger'] = { x: result[0].landmarks[16][0],
                                                       y: result[0].landmarks[16][1] };
                            position['pinky'] = { x: result[0].landmarks[20][0],
                                                  y: result[0].landmarks[20][1] };
                        }
                        if (0 < Object.keys(position).length) {
                            msg.payload = position;
                            var cv2 = pureimage.make(image.width, image.height);
                            var ctx = cv2.getContext('2d');
                            ctx.drawImage(image, 0, 0);
                            ctx.strokeStyle = 'rgb(255, 111, 0)';
                            ctx.lineWidth = 6;
                            /* ctx.strokeRect(result[0].boundingBox.topLeft[0], 
                                           result[0].boundingBox.topLeft[1],
                                           result[0].boundingBox.bottomRight[0],
                                           result[0].boundingBox.bottomRight[1]);
                            ctx.fillStyle = 'rgba(255, 111, 0, 0.5)';
                            ctx.fillRect(result[0].boundingBox.topLeft[0], 
                                         result[0].boundingBox.topLeft[1],
                                         result[0].boundingBox.bottomRight[0],
                                         result[0].boundingBox.bottomRight[1]); */
                            
                            try { ctx.drawLine({ start: position.palmBase, end: position.thumb }); } catch (e) {}
                            try { ctx.drawLine({ start: position.palmBase, end: position.indexFinger }); } catch (e) {}
                            try { ctx.drawLine({ start: position.palmBase, end: position.middleFinger }); } catch (e) {}
                            try { ctx.drawLine({ start: position.palmBase, end: position.ringFinger }); } catch (e) {}
                            try { ctx.drawLine({ start: position.palmBase, end: position.pinky }); } catch (e) {}

                            var wsb = new streamBuffers.WritableStreamBuffer({ initialSize: 1, incrementAmount: 1 });
                            pureimage.encodePNGToStream(cv2, wsb).then(function () {
                                msg.annotatedInput = wsb.getContents();
                                node.send(msg);
                                node.status({});
                            }).catch(function (error) {
                                node.error(error, msg);
                                node.status({ fill: 'red', shape: 'ring', text: error });
                            });
                        } else {
                            msg.annotatedInput = msg.payload;
                            msg.payload = null;
                            node.send(msg);
                            node.status({});
                        }
                    }, function (error) {
                        node.error(error, msg);
                        node.status({ fill: 'red', shape: 'ring', text: 'error' });
                    });
                });
            });
        });
    }

    RED.nodes.registerType("handpose", HandposeNode);

    function MobilenetNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var modelMobilenet;

        setTimeout(function () {
            node.status({ fill: "green", shape: 'ring', text: 'loading model...' });
            mobilenet.load({
                version: 1,
                alpha: 1.0,
                modelUrl: 'http://localhost:' + RED.settings.uiPort + '/models/mobilenet/model.json',
                inputRange: [0, 1]
            }).then(function (model) {
                modelMobilenet = model;
                node.status({ fill: "green", shape: 'ring', text: 'model loaded' });
            }).catch(function (error) {
                mobilenet.load().then(function (model2) {
                    modelMobilenet = model2;
                    node.status({ fill: "green", shape: 'ring', text: 'model loaded' });
                }).catch(function (error2) {
                    node.error(error);
                    node.error(error2);
                    node.status({ fill: 'red', shape: 'ring', text: 'fail to load model' });
                });
            });
        }, 1000);

        node.on('input', function (msg) {
            node.status({ fill: "green", shape: 'dot', text: 'analyzing...' });
            jimp.read(msg.payload).then(function (data) {
                return data.getBufferAsync(jimp.MIME_PNG);
            }).then(function (buffer) {
                var rsb = new streamBuffers.ReadableStreamBuffer();
                rsb.put(buffer);
                pureimage.decodePNGFromStream(rsb).then(function (image) {
                    var cv = pureimage.make(image.width, image.height);
                    cv.getContext('2d').drawImage(image, 0, 0);
                    modelMobilenet.classify(cv).then(function (result) {
                        if (result && 0 < result.length && result[0].className) {
                            msg.payload = result[0].className.split(', ');
                        } else {
                            msg.payload = null;
                        }
                        msg.details = result;
                        node.send(msg);
                        node.status({});
                    }, function (error) {
                        node.error(error, msg);
                        node.status({ fill: 'red', shape: 'ring', text: 'error' });
                    });
                });
            });
        });
    }

    RED.nodes.registerType("mobilenet", MobilenetNode);

    function PosenetNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var modelPosenet;

        setTimeout(function () {
            node.status({ fill: "green", shape: 'ring', text: 'loading model...' });

            posenet.load({
                modelUrl: 'http://localhost:' + RED.settings.uiPort + '/models/posenet/model-stride16.json'
            }).then(function (model) {
                modelPosenet = model;
                node.status({ fill: "green", shape: 'ring', text: 'model loaded' });
            }).catch(function (error) {
                posenet.load().then(function (model2) {
                    modelPosenet = model2;
                    node.status({ fill: "green", shape: 'ring', text: 'model loaded' });
                }).catch(function (error2) {
                    node.error(error);
                    node.error(error2);
                    node.status({ fill: 'red', shape: 'ring', text: 'fail to load model' });
                });
            });
        }, 1000);

        node.on('input', function (msg) {
            node.status({ fill: "green", shape: 'dot', text: 'analyzing...' });
            jimp.read(msg.payload).then(function (data) {
                return data.getBufferAsync(jimp.MIME_PNG);
            }).then(function (buffer) {
                var rsb = new streamBuffers.ReadableStreamBuffer();
                rsb.put(buffer);
                pureimage.decodePNGFromStream(rsb).then(function (image) {
                    var cv = pureimage.make(image.width, image.height);
                    cv.getContext('2d').drawImage(image, 0, 0);
                    modelPosenet.estimateSinglePose(cv).then(function (result) {
                        msg.details = result;
                        var position = {};
                        for (var i = 0; i < result.keypoints.length; i++) {
                            if (result.keypoints[i].score > 0.6) {
                                position[result.keypoints[i].part] = result.keypoints[i].position;
                            }
                        }
                        if (position.leftShoulder && position.rightShoulder) {
                            position['center'] = { x: (position.leftShoulder.x + position.rightShoulder.x)/2,
                                                   y: (position.leftShoulder.y + position.rightShoulder.y)/2 };
                        }
                        if (0 < Object.keys(position).length) {
                            msg.payload = position;
                            var cv2 = pureimage.make(image.width, image.height);
                            var ctx = cv2.getContext('2d');
                            ctx.drawImage(image, 0, 0);
                            ctx.strokeStyle = 'rgb(255, 111, 0)';
                            ctx.lineWidth = 10;

                            try { ctx.drawLine({ start: position.nose, end: position.leftEye }); } catch (e) {}
                            try { ctx.drawLine({ start: position.leftEye, end: position.leftEar }); } catch (e) {}
                            try { ctx.drawLine({ start: position.nose, end: position.rightEye }); } catch (e) {}
                            try { ctx.drawLine({ start: position.rightEye, end: position.rightEar }); } catch (e) {}
                            try { ctx.drawLine({ start: position.nose, end: position.center }); } catch (e) {}
                            try { ctx.drawLine({ start: position.leftShoulder, end: position.rightShoulder }); } catch (e) {}
                            try { ctx.drawLine({ start: position.leftShoulder, end: position.leftElbow }); } catch (e) {}
                            try { ctx.drawLine({ start: position.leftElbow, end: position.leftWrist }); } catch (e) {}
                            try { ctx.drawLine({ start: position.rightShoulder, end: position.rightElbow }); } catch (e) {}
                            try { ctx.drawLine({ start: position.rightElbow, end: position.rightWrist }); } catch (e) {}
                            try { ctx.drawLine({ start: position.center, end: position.leftHip }); } catch (e) {}
                            try { ctx.drawLine({ start: position.leftHip, end: position.leftKnee }); } catch (e) {}
                            try { ctx.drawLine({ start: position.leftKnee, end: position.leftAnkle }); } catch (e) {}
                            try { ctx.drawLine({ start: position.center, end: position.rightHip }); } catch (e) {}
                            try { ctx.drawLine({ start: position.rightHip, end: position.rightKnee }); } catch (e) {}
                            try { ctx.drawLine({ start: position.rightKnee, end: position.rightAnkle }); } catch (e) {}

                            var wsb = new streamBuffers.WritableStreamBuffer({ initialSize: 1, incrementAmount: 1 });
                            pureimage.encodePNGToStream(cv2, wsb).then(function () {
                                msg.annotatedInput = wsb.getContents();
                                node.send(msg);
                                node.status({});
                            }).catch(function (error) {
                                node.error(error, msg);
                                node.status({ fill: 'red', shape: 'ring', text: error });
                            });
                        } else {
                            msg.annotatedInput = msg.payload;
                            msg.payload = null;
                            node.send(msg);
                            node.status({});
                        }
                    }, function (error) {
                        node.error(error, msg);
                        node.status({ fill: 'red', shape: 'ring', text: 'error' });
                    });
                });
            });
        });
    }

    RED.nodes.registerType("posenet", PosenetNode);
};
