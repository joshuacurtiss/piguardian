import fs from 'fs-extra';

export default class Settings {
    constructor (path) {
        this.path = path;
        Object.assign(this, DEFAULTS);
        this.load();
        return this;
    }
    load () {
        try {
            if (this.path.length) {
                const state = fs.readJsonSync(this.path);
                Object.assign(this, state);
            }
        } catch (e) {
            console.error('Failed while trying to load settings!', e);
        }
    }
    save () {
        try {
            if (this.path.length) {
                const state = {};
                Object.keys(DEFAULTS).forEach(key => {
                    state[key] = this[key];
                });
                fs.writeJsonSync(this.path, state);
            }
        } catch (e) {
            console.error('Failed while trying to save settings!', e);
        }
    }
}

const DEFAULTS = {
    'keypad': {
        'alarmSound': null,
        'countdown': 60,
        'passcodeLength': 4,
        'passcodes': {
            '1234': { 'name': 'Default', 'action': null }
        },
        'warnSound': null
    },
    'server': {
        'address': null,
        'port': 31415
    },
    'smartthings': {
        'uri': null,
        'token': null
    },
    'dashboard': {
        'refreshInterval': 3600000,
        'ttsUri': 'http://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=En-us&q=',
        'customScreens': {
            'My Devices': []
        },
        'deviceScreens': {}
    }
};
