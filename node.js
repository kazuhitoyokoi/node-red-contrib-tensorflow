var jimp = require('jimp');
var streamBuffers = require('stream-buffers');
var pureimage = require('pureimage');
var cocoSsd = require('@tensorflow-models/coco-ssd');
var mobilenet = require('@tensorflow-models/mobilenet');
var posenet = require('@tensorflow-models/posenet');

module.exports = function (RED) {
    RED.httpAdmin.get("/models/:dir/:name", function (req, res) {
        var options = { root: __dirname + '/models/' + req.params.dir, dotfiles: 'deny' };
        res.sendFile(req.params.name, options);
    });

    function PosenetNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function (msg) {
            node.status({ fill: "green", shape: "dot", text: "analyzing..." });
            jimp.read(msg.payload).then(function (data) {
                return data.getBufferAsync(jimp.MIME_PNG);
            }).then(function (buffer) {
                var rsb = new streamBuffers.ReadableStreamBuffer();
                rsb.put(buffer);
                pureimage.decodePNGFromStream(rsb).then(function (image) {
                    var cv = pureimage.make(image.width, image.height);
                    cv.getContext('2d').drawImage(image, 0, 0);
                    /*cocoSsd.load({
                        modelUrl: 'http://localhost:' + RED.settings.uiPort + '/models/coco-ssd/model.json'
                    }).then(function (model) {
                        model.detect(cv).then(function (result) {
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
                        });
                    });*/
                    /*mobilenet.load({
                        version: 1,
                        alpha: 1.0,
                        modelUrl: 'http://localhost:' + RED.settings.uiPort + '/models/mobilenet/model.json',
                        inputRange: [0, 1]
                    }).then(function (model) {
                        model.classify(cv).then(function (result) {
                            if (result && 0 < result.length && result[0].className) {
                                msg.payload = result[0].className.split(', ');
                            } else {
                                msg.payload = null;
                            }
                            msg.details = result;
                            node.send(msg);
                            node.status({});
                        });
                    });*/
                    posenet.load({
                        modelUrl: 'http://localhost:' + RED.settings.uiPort + '/models/posenet/model-stride16.json'
                    }).then(function (model) {
                        model.estimateSinglePose(cv).then(function (result) {
                            msg.details = result;
                            var pose = {};
                            for (var i = 0; i < result.keypoints.length; i++) {
                                if (result.keypoints[i].score > 0.6) {
                                    pose[result.keypoints[i].part] = result.keypoints[i].position;
                                }
                            }
                            if (pose.leftShoulder && pose.rightShoulder) {
                                pose['center'] = { x: (pose.leftShoulder.x + pose.rightShoulder.x)/2,
                                                   y: (pose.leftShoulder.y + pose.rightShoulder.y)/2 };
                            }
                            if (true) {
                                msg.payload = pose;
                                var cv2 = pureimage.make(image.width, image.height);
                                var ctx = cv2.getContext('2d');
                                ctx.drawImage(image, 0, 0);
                                ctx.strokeStyle = 'rgb(255, 111, 0)';
                                ctx.lineWidth = 6;

                                try { ctx.drawLine({ start: pose.nose, end: pose.leftEye }); } catch (e) {}
                                try { ctx.drawLine({ start: pose.leftEye, end: pose.leftEar }); } catch (e) {}
                                try { ctx.drawLine({ start: pose.nose, end: pose.rightEye }); } catch (e) {}
                                try { ctx.drawLine({ start: pose.rightEye, end: pose.rightEar }); } catch (e) {}
                                try { ctx.drawLine({ start: pose.nose, end: pose.center }); } catch (e) {}
                                try { ctx.drawLine({ start: pose.leftShoulder, end: pose.rightShoulder }); } catch (e) {}
                                try { ctx.drawLine({ start: pose.leftShoulder, end: pose.leftElbow }); } catch (e) {}
                                try { ctx.drawLine({ start: pose.leftElbow, end: pose.leftWrist }); } catch (e) {}
                                try { ctx.drawLine({ start: pose.rightShoulder, end: pose.rightElbow }); } catch (e) {}
                                try { ctx.drawLine({ start: pose.rightElbow, end: pose.rightWrist }); } catch (e) {}
                                try { ctx.drawLine({ start: pose.center, end: pose.leftHip }); } catch (e) {}
                                try { ctx.drawLine({ start: pose.leftHip, end: pose.leftKnee }); } catch (e) {}
                                try { ctx.drawLine({ start: pose.leftKnee, end: pose.leftAnkle }); } catch (e) {}
                                try { ctx.drawLine({ start: pose.center, end: pose.rightHip }); } catch (e) {}
                                try { ctx.drawLine({ start: pose.rightHip, end: pose.rightKnee }); } catch (e) {}
                                try { ctx.drawLine({ start: pose.rightKnee, end: pose.rightAnkle }); } catch (e) {}

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
                        });
                    });
                });
            });
        });
    }
    RED.nodes.registerType("posenet", PosenetNode);
};
