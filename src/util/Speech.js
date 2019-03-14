import fs from 'fs';
import https from 'https';
import path from 'path';
import splitSentences from 'splitsentences';
import PlaySound from 'play-sound';

const player = new PlaySound();

export default class Speech {
    /**
     * Constructor.
     * @param {string} uri The Google TTS URI to use.
     * @param {string} cacheDir Path to store that saved audio files.
     */
    constructor (uri, cacheDir) {
        this.uri = uri;
        this.cacheDir = cacheDir;
        // On instantiation we make sure the directory exists.
        fs.mkdir(this.cacheDir, { recursive: true }, err => {
            if (err) console.log('TTS cache dir already exists.');
        });
        return this;
    }
    /**
     * This method does the whole shebang. It downloads/plays the speech.
     * @param {string} text The text to be spoken.
     */
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
    /**
     * Convert text to a Google TTS URI to generate the speech.
     * @param {string} text The text to be converted.
     */
    convertToUri (text) {
        return this.uri + encodeURIComponent(text);
    }
    /**
     * Convert text to a file path.
     * @param {string} text The text to be converted.
     */
    convertToPath (text) {
        return path.join(this.cacheDir, text.toLowerCase().trim().replace(/[!?,.;:'"]/g, '').replace(/[^A-Za-z0-9]/g, '-') + '.mp3');
    }
    /**
     * This method plays an audio file, and returns a promise.
     * @param {string} path The file to be played.
     */
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
    /**
     * This method downloads a URL to a path, and returns a promise.
     * @param {string} url The URL to download.
     * @param {string} dest The path to save the audio file.
     */
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
