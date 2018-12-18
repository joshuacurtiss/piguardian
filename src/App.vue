<template>
    <div id='app'>
        <dashboard
            :active='ready'
        />
        <splash-screen
            title='Welcome to Pi Guardian'
            :message='splashMessage'
            :done='ready'
        />
        <clock
            :active='showClock'
            @click='resetClockTimeout()'
        />
        <keypad
            :active='showAlarmKeypad'
            @input='showAlarmKeypad=false'
        />
    </div>
</template>

<script>
import Clock from './components/Clock.vue';
import Dashboard from './components/Dashboard.vue';
import Keypad from './components/Keypad.vue';
import SplashScreen from './components/SplashScreen.vue';
import electron from 'electron';
import ip from 'ip';
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
            ready: false,
            splashMessage: '',
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
        startup () {
            this.registerClient();
        },
        checkReady () {
            if (window.settings.ready) {
                this.splashMessage = '';
                this.ready = true;
                this.resetClockTimeout();
                // Check initial state of intrusion. Display alarm keypad if it is on.
                this.$http.get(window.settings.smartthings.uri + '/shm/intrusion', {
                    headers: {
                        'Authorization': 'Bearer ' + window.settings.smartthings.token
                    }
                }).then(response => {
                    this.showAlarmKeypad = (response.body && response.body.value === 'on');
                });
            } else {
                // No configs. Show IP address to get started (or connect to network msg).
                const ipaddr = ip.address();
                if (ip.isEqual(ipaddr, '127.0.0.1')) this.splashMessage = 'Please connect your device to the network.';
                else this.splashMessage = `Open your browser to <span style='color:gold;text-decoration:underline;'>http://${ipaddr}:${window.settings.server.port}</span> to get set up!`;
                // Reload the settings and try startup again so that it will react automatically once settings are saved.
                window.settings.load();
                this.startup();
                // Try again in a little bit.
                setTimeout(this.checkReady, 1000);
            }
        },
        resetClockTimeout () {
            this.showClock = false;
            clearTimeout(this.showClockTimeout);
            this.showClockTimeout = setTimeout(() => {
                this.showClock = true;
            }, this.showClockTimeoutLen);
        },
        /**
         * Registers this client with SmartThings for event updates.
         */
        registerClient () {
            if (window.settings.serverIsConfigured && window.settings.smartthingsIsConfigured) {
                this.$http.post(window.settings.smartthings.uri + '/clienturi', {
                    'uri': `${window.settings.server.address}:${window.settings.server.port}/api`
                }, {
                    emulateJSON: true,
                    headers: {
                        'Authorization': 'Bearer ' + window.settings.smartthings.token
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
        this.startup();
        // Try to check for readiness after 2.6sec.
        // That's when the splash screen animation is complete.
        setTimeout(this.checkReady, 2600);
        // IPC
        electron.ipcRenderer.on('device-update', (event, data) => {
            this.resetClockTimeout();
        });
        electron.ipcRenderer.on('intrusion-update', (event, data) => {
            this.resetClockTimeout();
            this.showAlarmKeypad = (data.value === 'on');
        });
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
