var jimp = require('jimp');
var canvas = require('canvas');
var cocoSsd = require('@tensorflow-models/coco-ssd');
var handpose = require('@tensorflow-models/handpose');
var posenet = require('@tensorflow-models/posenet');

module.exports = function (RED) {
    RED.httpAdmin.get("/models/:name", function (req, res) {
        var options = { root: __dirname + '/models/', dotfiles: 'deny' };
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
                canvas.loadImage(buffer).then(function (image) {
                    var cv = canvas.createCanvas(image.width, image.height);
                    cv.getContext('2d').drawImage(image, 0, 0);
                    /* cocoSsd.load().then(function (model) {
                        model.detect(cv).then(function (result) {
                            console.log(result);
                        });
                    });
                    handpose.load().then(function (model) {
                        model.estimateHands(cv).then(function (result) {
                            console.log(result);
                        });
                    }); */
                    posenet.load({ modelUrl: 'http://localhost:1880/models/model-stride16.json' }).then(function (model) {
                    //posenet.load().then(function (model) {
                        model.estimateSinglePose(cv).then(function (result) {
                            msg.payload = result;
                            node.send(msg);
                            node.status({});
                        });
                    });
                });
            });
        });
    }
    RED.nodes.registerType("posenet", PosenetNode);
}
