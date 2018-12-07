<template>
    <div id='app'>
        <dashboard
            :active='ready'
        />
        <splash-screen
            msg='Welcome to Pi Guardian'
            :done='ready'
        />
        <clock
            :active='showClock'
            @click='resetClockTimeout()'
        />
        <keypad
            :maxlength='4'
            :countdown='30'
            :active='showAlarmKeypad'
            @input='showAlarmKeypad=false'
            @alarm='handleAlarm()'
        />
    </div>
</template>

<script>
import Clock from './components/Clock.vue';
import Dashboard from './components/Dashboard.vue';
import Keypad from './components/Keypad.vue';
import Settings from './model/Settings';
import SplashScreen from './components/SplashScreen.vue';
import path from 'path';
import { remote } from 'electron';
const APPDATADIR = remote.app.getPath('userData');
const SETTINGSPATH = path.join(APPDATADIR, 'state.json');
const settings = new Settings(SETTINGSPATH);
export default {
    name: 'app',
    components: {
        Clock,
        Dashboard,
        Keypad,
        SplashScreen
    },
    data () {
        return {
            devices: null,
            ready: false,
            showAlarmKeypad: false,
            showClock: false,
            showClockTimeout: null,
            showClockTimeoutLen: 600000 // 10 min
        };
    },
    watch: {
        showAlarmKeypad (value) {
            this.resetClockTimeout();
        }
    },
    methods: {
        checkReady () {
            if (this.devices) {
                this.ready = true;
                this.resetClockTimeout();
            } else {
                setTimeout(this.checkReady, 333);
            }
        },
        handleAlarm () {
            console.log('Alarm!');
        },
        resetClockTimeout () {
            this.showClock = false;
            clearTimeout(this.showClockTimeout);
            this.showClockTimeout = setTimeout(() => {
                this.showClock = true;
            }, this.showClockTimeoutLen);
        },
        /**
         * Loads all devices and their status.
         */
        loadDevices () {
            if (settings.smartthingsIsConfigured) {
                this.$http.get(settings.smartthings.uri + '/devices', {
                    headers: {
                        'Authorization': 'Bearer ' + settings.smartthings.token
                    }
                }).then(response => {
                    if (response.body) {
                        this.devices = response.body;
                        console.table(JSON.parse(JSON.stringify(this.devices)));
                    }
                }).catch((exception) => {
                    console.error(exception);
                });
            } else {
                console.error('SmartThings configurations are not complete. Skipping device load.');
            }
        },
        /**
         * Registers this client with SmartThings for event updates.
         */
        registerClient () {
            if (settings.serverIsConfigured && settings.smartthingsIsConfigured) {
                this.$http.post(settings.smartthings.uri + '/clienturi', {
                    'uri': `${settings.server.address}:${settings.server.port}/api`
                }, {
                    emulateJSON: true,
                    headers: {
                        'Authorization': 'Bearer ' + settings.smartthings.token
                    }
                }).then(response => {
                    console.log('Register client result: ', response.body);
                }).catch((exception) => {
                    console.error(exception);
                });
            } else {
                console.error('Configurations are not complete. Skipping client registration.');
            }
        }
    },
    mounted () {
        // Startup work
        this.registerClient();
        this.loadDevices();
        // Try to check for readiness after 2.6sec.
        // That's when the splash screen animation is complete.
        setTimeout(this.checkReady, 2600);
    }
};
</script>

<style>
body {
    margin: 0;
    background-color:black;
    font-family: "Avenir Next", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #eee;
    overflow: hidden;
}
</style>
