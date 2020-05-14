var fs = require('fs');
var superagent = require('superagent');
var urls = [
    'https://storage.googleapis.com/tfjs-models/savedmodel/posenet/mobilenet/float/075/model-stride16.json',
    'https://storage.googleapis.com/tfjs-models/savedmodel/posenet/mobilenet/float/075/group1-shard1of2.bin',
    'https://storage.googleapis.com/tfjs-models/savedmodel/posenet/mobilenet/float/075/group1-shard2of2.bin'
];

for (var i = 0; i < urls.length; i++) {
    superagent.get(urls[i]).responseType('blob').end(function (err, res) {
        var file = res.req.path.split('/').slice(-1)[0];
        fs.writeFileSync(__dirname + '/models/' + file, res.body);
    });
}
