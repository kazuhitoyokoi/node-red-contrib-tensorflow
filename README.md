node-red-contrib-tensorflow
================

Node-RED nodes for pre-trained TensorFlow models

<img src='https://raw.githubusercontent.com/kazuhitoyokoi/node-red-contrib-tensorflow/master/samples/flow.png' width='600'>

Example of object detection

## Install

To install the stable version use the `Menu - Manage palette - Install` 
option and search for `node-red-contrib-tensorflow`, or run the following 
command in your Node-RED user directory, typically `~/.node-red`

    npm install node-red-contrib-tensorflow

## TensorFlow Models
- [Object Detection](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd) -- The node to identify objects in an image
- [MediaPipe Handpose](https://github.com/tensorflow/tfjs-models/tree/master/handpose) -- The node to detect fingers in a hand
- [MobileNet](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet) -- The node to classify images with MobileNet
- [PoseNet Model](https://github.com/tensorflow/tfjs-models/tree/master/posenet) -- The node to estimate human pose

## Known issue
- Conflict with other TensorFlow.js modules

  See the details: https://github.com/kazuhitoyokoi/node-red-contrib-tensorflow/issues/3

## License

Apache-2.0
