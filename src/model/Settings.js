import fs from 'fs-extra';

export default class Settings {
    constructor (path) {
        this.path = path;
        Object.assign(this, DEFAULTS);
        this.load();
        return this;
    }
    get ready () {
        return this.smartthingsIsConfigured && this.serverIsConfigured;
    }
    get smartthingsIsConfigured () {
        return (this.smartthings.uri && this.smartthings.token);
    }
    get serverIsConfigured () {
        return (this.server.address && this.server.port);
    }
    load () {
        try {
            if (this.path.length) {
                // Some code expects this to be synchronous. Check things before changing this.
                const state = fs.readJsonSync(this.path);
                Object.assign(this, state);
            }
        } catch (e) {
            console.error('Failed while trying to load settings!', e.message);
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
            console.error('Failed while trying to save settings!', e.message);
        }
    }
}

const DEFAULTS = {
    'windowOptions': {
        'fullscreen': true,
        'backgroundColor': '#000000',
        'autoHideMenuBar': true,
        'alwaysOnTop': true,
        'width': 800,
        'height': 480,
        'webPreferences': {
            'webSecurity': false
        }
    },
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
    'tts': {
        'lang': 'en-US',
        'volume': 0.7,
        'voice': 'Samantha'
    },
    'dashboard': {
        'refreshInterval': 3600000,
        'notifications': {
            'message': {
                'chime': null
            },
            'contact': {
                'open': {
                    'chime': null,
                    'speech': false
                },
                'closed': {
                    'chime': null,
                    'speech': false
                }
            },
            'presence': {
                'present': {
                    'chime': null,
                    'speech': false
                },
                'not present': {
                    'chime': null,
                    'speech': false
                }
            }
        },
        'customScreens': {
            'My Devices': []
        },
        'deviceScreens': {}
    }
};
