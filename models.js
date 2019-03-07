const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const wallpaper = require('wallpaper');
const progress = require('progress');

class Image {
    constructor(url, lastModified){
        this.url = url;
        this.lastModified = lastModified;
        this.name = this.url.split('/').pop();
        this.path = __dirname + '/images/' + this.name;
    }

    save(){
        return new Promise((resolve, reject) => {
            if(!fs.existsSync(__dirname + '/images')) {
                fs.mkdirSync(__dirname + '/images');
            }

            const http = require('http');
            const file = fs.createWriteStream(this.path);

            let req = http.get(this.url,  response => {
                let total = parseInt(response.headers['content-length']);
                let bar = new progress('[:bar] :percent :etas', {
                    complete: '=',
                    incomplete: ' ',
                    width: 20,
                    total: total
                });

                response.on('data', function (chunk) {
                    if(!bar.complete) bar.tick(chunk.length);
                });

                const { statusCode } = response;

                if(statusCode !== 200){
                    console.error(`Error: Unable to locate image ${this.url}.`);
                    if(fs.existsSync(this.path)) {
                        fs.unlink(this.path, () => reject());
                    } else reject();
                } else {
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve(this.path);
                    });
                }
            }).on('error', e => {
                console.error(`Error: Failed to load file ${this.name}. ${e.message}`);
                if(fs.existsSync(this.path)) {
                    fs.unlink(this.path, () => reject());
                } else reject();
            });

            req.on('socket', socket => {
                socket.setTimeout(10000); // Time out after 10 seconds
                socket.on('timeout', () => reject());
            });
        });
    }

    setAsWallpaper(){
        wallpaper.set(this.path).then(() => {
            setTimeout(() => {
                fs.unlink(this.path, () => {});
            }, 2000);
        });
    }

    static parse(json){
        return new Image(json.url, json.lastModified);
    }

    static parseUrl(url){
        return new Promise((resolve, reject) => {
            try {
                rp({url: url, timeout: 3000})
                    .then(xml => {
                        const $ = cheerio.load(xml);
                        let images = [];

                        // Parse this HTML for the classified entries
                        const contents = $('Contents');
                        for (let i = 0; i < contents.length; i++) {
                            let content = $(contents.get(i));
                            let imageUrl = content.find('Key').text();
                            let lastModified = new Date(content.find('LastModified').text());
                            if(/img\/backgrounds\/[A-z0-9]+.[a-z]{3}/.test(imageUrl)) {
                                let image = new Image(url + imageUrl, lastModified);
                                images.push(image);
                            }
                        }

                        resolve(images);
                    })
                    .catch(err => {
                        console.error(err);
                        reject(err);
                    });

            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    }
}

exports.Image = Image;
