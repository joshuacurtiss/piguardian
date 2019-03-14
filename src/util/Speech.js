import fs from 'fs';
import https from 'https';
import path from 'path';
import splitSentences from 'splitsentences';
import PlaySound from 'play-sound';

const player = new PlaySound();

export default class Speech {
    constructor (uri, cacheDir) {
        this.uri = uri;
        this.cacheDir = cacheDir;
        fs.mkdir(this.cacheDir, { recursive: true }, err => {
            if (err) console.log('TTS cache dir already exists.');
        });
        return this;
    }
    async speak (text) {
        const snippets = splitSentences(text);
        for (let snippet of snippets) {
            const speechPath = this.convertToPath(snippet);
            if (fs.existsSync(speechPath)) {
                console.log(`Speak: "${snippet}"`);
                await this.play(speechPath);
            } else {
                const speechUri = this.convertToUri(snippet);
                console.log(`Download "${speechUri}" and speak: "${snippet}"`);
                await this.download(speechUri, speechPath);
                await this.play(speechPath);
            }
        };
    }
    convertToUri (text) {
        return this.uri + encodeURIComponent(text);
    }
    convertToPath (text) {
        return path.join(this.cacheDir, text.toLowerCase().trim().replace(/[!?,.;:'"]/g, '').replace(/[^A-Za-z0-9]/g, '-') + '.mp3');
    }
    play (path) {
        return new Promise(function (resolve, reject) {
            player.play(path, err => {
                if (err) {
                    console.log(`Could not play speech: ${path}`);
                    reject(Error(err));
                } else {
                    resolve();
                }
            });
        });
    }
    download (url, dest) {
        return new Promise(function (resolve, reject) {
            const file = fs.createWriteStream(dest);
            https.get(url, function (response) {
                response.pipe(file);
                file.on('finish', function () {
                    file.close(resolve);
                });
            }).on('error', function (err) {
                console.error(err);
                fs.unlink(dest);
                reject(Error(err.message));
            });
        });
    }
}
