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
import SplashScreen from './components/SplashScreen.vue';
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
            if (window.settings) {
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
        this.registerClient();
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
