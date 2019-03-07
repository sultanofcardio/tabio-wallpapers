#!/usr/bin/env node

"use strict";

const { Image } = require('./models');
const fs = require('fs');
const url = 'http://prod-tab2017-media.gladly.io/';

Image.parseUrl(url).then(images => {
    images.sort(function(a,b){
        return b.lastModified - a.lastModified;
    });

    fs.writeFileSync(__dirname + '/images.json', JSON.stringify(images) , 'utf-8');
    if(!fs.existsSync(__dirname + '/displayed_images.json')){
        fs.writeFileSync(__dirname + '/displayed_images.json', '[]' , 'utf-8');
    }
}).catch(err => {
    console.log(err);
});
