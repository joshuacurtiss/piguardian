<template>
    <div id='app'>
        <dashboard />
        <splash-screen
            msg='Welcome to Pi Guardian'
            :done='ready'
        />
        <clock
            :active='showClock'
            @click='showClock=false'
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
            showClock: false
        };
    },
    methods: {
        handleAlarm () {
            console.log('Alarm!');
        }
    },
    mounted () {
        setTimeout(() => {
            this.ready = true;
        }, 2600);
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
