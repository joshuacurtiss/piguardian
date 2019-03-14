import fs from 'fs';
import https from 'https';
import path from 'path';
import splitSentences from 'splitsentences';
import PlaySound from 'play-sound';

const player = new PlaySound();
const EXT = 'mp3';

export default class Speech {
    /**
     * Constructor.
     * @param {string} uri The Google TTS URI to use.
     * @param {string} cacheDir Path to store that saved audio files.
     * @param {number} purgeAgeDays Number of days old a cached file should be before it is purged.
     */
    constructor (uri, cacheDir, purgeAgeDays = 90) {
        this.uri = uri;
        this.cacheDir = cacheDir;
        // On instantiation, make sure directory exists and purge old audio files.
        const extRegex = new RegExp('\\.' + EXT + '$', 'i');
        const purgeDateMs = new Date().getTime() - purgeAgeDays * 24 * 60 * 60 * 1000;
        fs.mkdir(this.cacheDir, { recursive: true }, err => {
            if (err) console.log('TTS cache dir already exists.');
            fs.readdir(this.cacheDir, (err, files) => {
                if (err) console.error(err);
                files.filter(filename => filename.match(extRegex)).forEach(filename => {
                    const fullpath = path.join(this.cacheDir, filename);
                    fs.stat(fullpath, (err, stats) => {
                        if (err) console.error(err);
                        if (stats.birthtimeMs < purgeDateMs) {
                            fs.unlink(fullpath, err => {
                                if (err) console.error(err);
                            });
                        }
                    });
                });
            });
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
            if (!fs.existsSync(speechPath)) {
                const speechUri = this.convertToUri(snippet);
                console.log(`Download "${speechUri}"`);
                await this.download(speechUri, speechPath);
            }
            console.log(`Speak: "${snippet}"`);
            await this.play(speechPath);
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
     * Convert text to a file path. Filename for text is converted to lowercase,
     * punctuation removed, trimmed, and non-alphanumeric chars subbed to dash.
     * @param {string} text The text to be converted.
     */
    convertToPath (text) {
        return path.join(
            this.cacheDir,
            text.toLowerCase().replace(/[!?,.;:'"]/g, '').trim().replace(/[^A-Za-z0-9]/g, '-') + '.' + EXT
        );
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
