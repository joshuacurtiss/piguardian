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
        this.speaking = {};
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
     * Use this method to initiate speech. It returns a speaking session token.
     * @param {string} text The text to be spoken.
     * @param {function} cb Callback function.
     */
    speak (text, cb) {
        const token = this.generateSpeakingToken(text);
        this.speaking[token] = true;
        this.handleSpeak(text, token, cb);
        return token;
    }
    /**
     * This method does the whole shebang. It downloads/plays the speech.
     * @param {string} text The text to be spoken.
     * @param {function} cb Callback function.
     */
    handleSpeak (text, token, cb) {
        // First separate out text into smaller snippets
        const snippets = splitSentences(text);
        // Download all audio snippets at once
        Promise.all(snippets.map(snippet => new Promise(async resolve => {
            snippet = snippet
                .replace(/[[\]]/g, '') // Eliminate [brackts]
                .replace(/["\u201C\u201D]/g, ''); // Eliminate "double-quotes"
            const speechPath = this.convertToPath(snippet);
            // If file does not exist, go request it
            if (!fs.existsSync(speechPath)) {
                const speechUri = this.convertToUri(snippet);
                console.log(`Download "${speechUri}"`);
                await this.download(speechUri, speechPath);
            }
            // Resolve promise with the file path. So we'll end with an array of audio files to play.
            resolve(speechPath);
        }))).then(async paths => {
            // Then play all the audio files once at a time in succession.
            for (const path of paths) {
                // Only proceed if the speaking token still exists.
                if (this.speaking[token]) {
                    console.log(`Speak: "${path}"`);
                    await this.play(path, token);
                }
            }
            delete this.speaking[token];
            if (cb) cb();
        });
    }
    /**
     * Stops the speech of an existing speaking session.
     * @param {string} token The speaking session token to stop.
     */
    stop (token) {
        const audio = this.speaking[token];
        delete this.speaking[token];
        try {
            audio.kill();
        } catch (exc) {
            console.error(exc);
        }
    }
    /**
     * Generate a speaking session token.
     * @param {string} str String of speech text, to help generate the speech token.
     */
    generateSpeakingToken (str) {
        const dt = new Date().getTime();
        return this.hashCode(dt + str);
    }
    /**
     * Return the hash code of a string.
     * @param {string} str The string to be hashed
     */
    hashCode (str) {
        return str.split('').reduce((prevHash, currVal) =>
            (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0, 0);
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
     * @param {string} token The speaking session token for this speech.
     */
    play (path, token) {
        return new Promise((resolve, reject) => {
            this.speaking[token] = player.play(path, err => {
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
