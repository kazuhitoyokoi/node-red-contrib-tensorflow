var fs = require('fs');
var superagent = require('superagent');
var models = [{
    name: 'mobilenet',
    urls: ['https://storage.googleapis.com/tfhub-tfjs-modules/google/imagenet/mobilenet_v1_100_224/classification/1/model.json',
           'https://storage.googleapis.com/tfhub-tfjs-modules/google/imagenet/mobilenet_v1_100_224/classification/1/group1-shard1of5',
           'https://storage.googleapis.com/tfhub-tfjs-modules/google/imagenet/mobilenet_v1_100_224/classification/1/group1-shard2of5',
           'https://storage.googleapis.com/tfhub-tfjs-modules/google/imagenet/mobilenet_v1_100_224/classification/1/group1-shard3of5',
           'https://storage.googleapis.com/tfhub-tfjs-modules/google/imagenet/mobilenet_v1_100_224/classification/1/group1-shard4of5',
           'https://storage.googleapis.com/tfhub-tfjs-modules/google/imagenet/mobilenet_v1_100_224/classification/1/group1-shard5of5']
}, {
    name: 'coco-ssd',
    urls: ['https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json',
           'https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/group1-shard1of5',
           'https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/group1-shard2of5',
           'https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/group1-shard3of5',
           'https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/group1-shard4of5',
           'https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/group1-shard5of5']
}, {
    name: 'posenet',
    urls: ['https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/group1-shard5of5',
           'https://storage.googleapis.com/tfjs-models/savedmodel/posenet/mobilenet/float/075/model-stride16.json',
           'https://storage.googleapis.com/tfjs-models/savedmodel/posenet/mobilenet/float/075/group1-shard1of2.bin',
           'https://storage.googleapis.com/tfjs-models/savedmodel/posenet/mobilenet/float/075/group1-shard2of2.bin']
}];

try { fs.mkdirSync(__dirname + '/models'); } catch (e) {}
models.forEach(function (model) {
    try { fs.mkdirSync(__dirname + '/models/' + model.name); } catch (e) {}
    for (var i = 0; i < model.urls.length; i++) {
        superagent.get(model.urls[i]).responseType('blob').end(function (err, res) {
            if (!err) {
                var file = res.req.path.split('/').slice(-1)[0];
                fs.writeFileSync(__dirname + '/models/' + model.name + '/' + file, res.body);
            } else {
                console.log(err);
            }
        });
    }
});
