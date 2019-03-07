#!/usr/bin/env node

"use strict";

const { Image } = require('./models');
const fs = require('fs');

if(!fs.existsSync(__dirname + '/images.json')){
    // The scraper has not been run yet, need to run it firs
    runScript(__dirname + '/scraper.js', changeWallpaper);

} else changeWallpaper();

function changeWallpaper(){
    // Read the current images
    let images = JSON.parse(fs.readFileSync(__dirname + '/images.json', 'utf8'));
    let displayedImages = JSON.parse(fs.readFileSync(__dirname + '/displayed_images.json', 'utf8'));

    // Display the first image
    let unparsedImage = images.pop();
    while(unparsedImage !== undefined && displayedImages.includes(unparsedImage)){
        unparsedImage = images.pop();
    }

    if(unparsedImage === undefined){
        // Let's scrape again
        fs.unlink(__dirname + '/images.json', () => {});
        fs.unlink(__dirname + '/displayed_images.json', () => {});
        return runScript(__dirname + '/scraper.js', changeWallpaper);
    }

    let image = Image.parse(unparsedImage);
    console.log(`Setting wallpaper to ${image.url}`);
    image.save().then(() => image.setAsWallpaper());

    // Move to displayed images
    displayedImages.push(image);

// Update the file contents
    fs.writeFileSync(__dirname + '/images.json', JSON.stringify(images) , 'utf-8');
    fs.writeFileSync(__dirname + '/displayed_images.json', JSON.stringify(displayedImages) , 'utf-8');
}

function runScript(scriptPath, callback) {
    let childProcess = require('child_process');

    // keep track of whether callback has been invoked to prevent multiple invocations
    let invoked = false;

    let process = childProcess.fork(scriptPath);

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        console.log(err);
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        let err = code === 0 ? null : new Error('exit code ' + code);
        if(err) console.log(err);
        else callback();
    });

}
