var fs = require('fs');
var rp = require('request-promise');
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
    urls: ['https://storage.googleapis.com/tfjs-models/savedmodel/posenet/mobilenet/float/075/model-stride16.json',
           'https://storage.googleapis.com/tfjs-models/savedmodel/posenet/mobilenet/float/075/group1-shard1of2.bin',
           'https://storage.googleapis.com/tfjs-models/savedmodel/posenet/mobilenet/float/075/group1-shard2of2.bin']
}];

(async () => {
    try { fs.mkdirSync(__dirname + '/models'); } catch (e) {}
    for (var i = 0; i < models.length; i++) {
        var model = models[i];
        try { fs.mkdirSync(__dirname + '/models/' + model.name); } catch (e) {}
            for (var j = 0; j < model.urls.length; j++) {
                var flag = true;
                for (var k = 0; flag && k < 8; k++) {
                try {
                    console.log('Downloading: ' + model.name + ', ' + model.urls[j]);
                    var response = await rp.get({ url: model.urls[j], encoding: null });
                    var file = model.urls[j].split('/').slice(-1)[0];
                    fs.writeFileSync(__dirname + '/models/' + model.name + '/' + file, Buffer.from(response));
                    console.log('Downloaded: ' + model.name + ', ' + model.urls[j]);
                    flag = false;
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }
})();
