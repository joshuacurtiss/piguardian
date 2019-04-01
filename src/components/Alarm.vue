<template>
    <transition name="slide-fade">
        <div v-show='active' class='alarmContainer'>
            <div :class='"countdown " + (alarm ? "alarm" : "")'>
                <font-awesome-icon
                    icon='bell'
                    fixed-width
                />
                <div v-show='!alarm'>
                    {{ currCountdown }}
                </div>
            </div>
            <keypad
                v-model='passcode'
                :class='{
                    "shake": passcodeFull && !passcodeValid,
                    "keypad": true
                }'
                :maxlength='passcodeLength'
            />
            <audio :src="warnUrl" loop="true" ref="warn"></audio>
            <audio :src="alarmUrl" loop="true" ref="alarm"></audio>
        </div>
    </transition>
</template>

<script>
import electron from 'electron';
import Keypad from './Keypad.vue';
import { Passcode as PasscodeMixin } from '../mixins/Passcode';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
library.add(faBell);
export default {
    name: 'Alarm',
    mixins: [
        PasscodeMixin
    ],
    components: {
        FontAwesomeIcon,
        Keypad
    },
    props: {
        active: Boolean
    },
    computed: {
        alarm () {
            return this.currCountdown === 0;
        },
        alarmUrl () {
            return 'file://' + window.settings.keypad.alarm.chime;
        },
        warnUrl () {
            return 'file://' + window.settings.keypad.warn.chime;
        }
    },
    data () {
        return {
            currCountdown: 0
        };
    },
    methods: {
        checkCountdown () {
            if (this.active) {
                this.currCountdown -= 1;
                if (this.currCountdown > 0) {
                    setTimeout(this.checkCountdown, 1000);
                } else {
                    this.$refs.warn.pause();
                    this.$refs.alarm.play();
                }
            }
        }
    },
    watch: {
        active (newval) {
            if (newval) {
                this.currCountdown = window.settings.keypad.countdown + 1;
                this.passcode = '';
                this.checkCountdown();
                this.$refs.warn.play();
            } else {
                this.$refs.alarm.pause();
                this.$refs.warn.pause();
            }
        },
        passcode (newval) {
            if (this.passcodeValid) {
                // Passcode was right!
                if (this.passcodeSettings.action) this.$http.get(this.passcodeSettings.action);
                this.$http.post(window.settings.smartthings.uri + '/shm/intrusion', {
                    value: 'off'
                }, {
                    headers: {
                        'Authorization': 'Bearer ' + window.settings.smartthings.token
                    }
                });
                this.$emit('input', this.passcode);
            } else if (this.passcodeFull) {
                // Wrong. Shake your head and clear the passcode.
                setTimeout(() => {
                    this.passcode = '';
                }, 999);
            }
        }
    },
    beforeCreate () {
        // IPC
        electron.ipcRenderer.on('keypad-update', (event, data) => {
            this.passcode = (data.code || '').replace(/[^0-9]/g, '');
        });
    },
    mounted () {
        this.$refs.alarm.volume = window.settings.keypad.alarm.volume;
        this.$refs.warn.volume = window.settings.keypad.warn.volume;
    }
};
</script>

<style scoped src="../styles/shake.css"></style>
<style scoped>
.alarmContainer {
    position:absolute;
    top:0;
    left:0;
    width: 100vw;
    height: 100vh;
    color: #333;
    background-color: #ed1c24;
    z-index: 2;
}
.countdown.alarm {
  animation: alarmpulse 2s infinite;
}
@keyframes alarmpulse {
    0% {color: white;}
    50% {color: yellow;}
    100% {color: white;}
}
.countdown {
    position: absolute;
    text-align: center;
    top: 12vh;
    left: 1vw;
    width: 55vw;
    font-size: 66vh;
    text-align: center;
    color: white;
}
.countdown > div {
    position: absolute;
    top: 26vh;
    left: 1vw;
    width: 53vw;
    color: #333;
    font-size: 23vh;
}
.keypad {
    background-color: rgba(245, 245, 245, 0.9);
    box-shadow: 5px 5px 8px darkred;
    margin-top: 8vh;
    margin-left: 58vw;
}
/* Transition */
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(50vh);
  opacity: 0;
}
</style>
