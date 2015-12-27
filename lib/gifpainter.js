var expr = require('expr-tree')
var _ = require('lodash')
var Canvas = require('canvas')
var fs = require('fs')
var GIF = require('gifencoder')
gamma = require('gamma')
math = require('mathjs')


module.exports = {
  // the PICO8 color palette
  palette: [
    'rgb(0,0,0)',
    'rgb(29,43,83)',
    'rgb(129,37,83)',
    'rgb(0,135,81)',
    'rgb(171,82,54)',
    'rgb(95,87,79)',
    'rgb(194,195,199)',
    'rgb(255,241,232)',
    'rgb(255,0,77)',
    'rgb(255,163,0)',
    'rgb(255,255,39)',
    'rgb(0,231,86)',
    'rgb(41,173,255)',
    'rgb(131,118,156)',
    'rgb(255,119,168)',
    'rgb(255,204,170)'
  ],

  // outputs a stream
  toGIF: function(tree, params) {
    // default params
    params = params || { w:320, h:240 }

    // create variables
    var w = params.w
    var h = params.h
    var mod = function(x, y) { return x - y * Math.floor(x / y) }

    // init the gif encoder
    var encoder = new GIF(params.w, params.h)

    // stream the results as they are available
    var rs = encoder.createReadStream()

    // start drawing
    encoder.start();
    encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
    encoder.setDelay(100);  // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

    // use node-canvas
    var canvas = new Canvas(w, h);
    var ctx = canvas.getContext('2d');

    // get func
    var func = (expr.toFunction(tree, ['t', 'x', 'y']))

    // start drawing
    ctx.fillStyle = '#000';
    ctx.clearRect(0,0,w,h);
    var t = 0, x = 0, y = 0
    for(t = 0; t < 20; t++) {
        for(x = -w/2; x < w/2; x++) {
            for(y = -h/2; y < h/2; y++) {
                var id = mod(Math.abs(Math.floor( func(x, y, t) )), this.palette.length)
                ctx.fillStyle = (!isNaN(parseFloat(id)) && isFinite(id)) ? this.palette[id] : '#000'
                ctx.fillRect(x+(w/2), y+(h/2), 1, 1)
            }
        }
        console.log('t=' + (t+1) + '/20')
        encoder.addFrame(ctx)
    }
    // done drawing
    encoder.finish()

    // return stream
    return rs
  }
}
