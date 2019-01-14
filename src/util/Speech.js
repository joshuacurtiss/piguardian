import fs from 'fs';
import https from 'https';
import path from 'path';
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
    speak (text) {
        console.log(`Speak: "${text}"`);
        const speechPath = this.convertToPath(text);
        if (fs.existsSync(speechPath)) {
            player.play(speechPath, err => {
                if (err) console.log(`Could not play speech: ${speechPath}`);
            });
        } else {
            const speechUri = this.convertToUri(text);
            this.download(speechUri, speechPath, () => {
                this.speak(text);
            });
        }
    }
    convertToUri (text) {
        return this.uri + encodeURIComponent(text);
    }
    convertToPath (text) {
        return path.join(this.cacheDir, text.toLowerCase().trim().replace(/[!?,.;:'"]/g, '').replace(/[^A-Za-z0-9]/g, '-') + '.mp3');
    }
    download (url, dest, cb) {
        var file = fs.createWriteStream(dest);
        https.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close(cb);
            });
        }).on('error', function (err) {
            console.error(err);
            fs.unlink(dest);
            if (cb) cb(err.message);
        });
    };
}
