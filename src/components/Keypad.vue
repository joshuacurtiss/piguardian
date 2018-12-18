<template>
    <transition name="slide-fade">
        <div v-show='active' class='keypad'>
            <div :class='"countdown " + (alarm ? "alarm" : "")'>
                <font-awesome-icon
                    icon='bell'
                    fixed-width
                />
                <div v-show='!alarm'>
                    {{ currCountdown }}
                </div>
            </div>
            <form :class='{"shake":passcodeFull && !passcodeValid}'>
                <h1>Enter Passcode</h1>
                <div class="passcodeui">
                    <font-awesome-icon
                        v-for='index in maxlength'
                        :key='index'
                        style='padding: 0 0.8vw;'
                        :icon='passcode.length>=index ? ["fas","circle"] : ["far","circle"]'
                    />
                </div>
                <button type="button" @click='addDigit(1)'>1 <div>&nbsp;</div></button>
                <button type="button" @click='addDigit(2)'>2 <div>abc</div></button>
                <button type="button" @click='addDigit(3)'>3 <div>def</div></button>
                <button type="button" @click='addDigit(4)'>4 <div>ghi</div></button>
                <button type="button" @click='addDigit(5)'>5 <div>jkl</div></button>
                <button type="button" @click='addDigit(6)'>6 <div>mno</div></button>
                <button type="button" @click='addDigit(7)'>7 <div>pqrs</div></button>
                <button type="button" @click='addDigit(8)'>8 <div>tuv</div></button>
                <button type="button" @click='addDigit(9)'>9 <div>wxyz</div></button>
                <button type="button" @click='clearDigits()' class='function'>clear</button>
                <button type="button" @click='addDigit(0)'>0</button>
                <button type="button" @click='deleteDigit()' class='function'>delete</button>
            </form>
            <audio :src="warnSoundUrl" loop="true" ref="warn"></audio>
            <audio :src="alarmSoundUrl" loop="true" ref="alarm"></audio>
        </div>
    </transition>
</template>

<script>
import electron from 'electron';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBell, faCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle as faCircleThin } from '@fortawesome/free-regular-svg-icons';
library.add(faBell, faCircle, faCircleThin);

export default {
    name: 'Keypad',
    components: {
        FontAwesomeIcon
    },
    props: {
        active: Boolean
    },
    computed: {
        alarm () {
            return this.currCountdown === 0;
        },
        maxlength () {
            return window.settings.keypad.passcodeLength;
        },
        passcodeFull () {
            return this.passcode.length >= window.settings.keypad.passcodeLength;
        },
        passcodeSettings () {
            return window.settings.keypad.passcodes[this.passcode];
        },
        passcodeValid () {
            return window.settings.keypad.passcodes.hasOwnProperty(this.passcode);
        },
        alarmSoundUrl () {
            return 'file://' + window.settings.keypad.alarmSound;
        },
        warnSoundUrl () {
            return 'file://' + window.settings.keypad.warnSound;
        }
    },
    data () {
        return {
            currCountdown: 0,
            passcode: ''
        };
    },
    methods: {
        addDigit (digit) {
            if (!this.passcodeFull) { this.passcode += digit.toString(); }
        },
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
        },
        clearDigits () {
            this.passcode = '';
        },
        deleteDigit () {
            if (this.passcode.length) { this.passcode = this.passcode.substr(0, this.passcode.length - 1); }
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
    }
};
</script>

<style scoped>
.keypad {
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
.shake {
    animation: shake 0.9s cubic-bezier(.36,.07,.19,.97) both;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
}
@keyframes shake {
    10%, 90% {transform: translate3d(-2px, 0, 0);}
    20%, 80% {transform: translate3d(3px, 0, 0);}
    30%, 50%, 70% {transform: translate3d(-6px, 0, 0);}
    40%, 60% {transform: translate3d(6px, 0, 0);}
}
.countdown {
    position: absolute;
    text-align: center;
    top: 7vh;
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
.keypad form {
    width: 250px;
    border-radius: 10px;
    background-color: rgba(245, 245, 245, 0.9);
    box-shadow: 5px 5px 8px darkred;
    margin-top: 2.5%;
    margin-left: 57%;
}
.keypad form h1 {
    font-size: 18px;
    font-weight: normal;
    text-align: center;
    padding: 15px 0 0 0;
    margin: 0;
}
.keypad .passcodeui {
    margin: 12px 0 10px 0;
    text-align: center;
}
.keypad .passcodeui i {
    letter-spacing: 9px;
}
.keypad button {
    border-radius: 50%;
    border: 1px solid #ccc;
    background-color: #e2e2e2;
    margin: 10px;
    width: 60px;
    height: 60px;
    font-size: 24px;
}
.keypad button:focus {
    outline: 0;
}
.keypad button:active {
    background-color: #ccc;
}
.keypad button.function {
    font-size: 12px;
    background-color: transparent;
    padding-top: -5px;
    border:0;
}
.keypad button div {
    font-size: 8px;
    margin-top: -2px;
    text-transform: uppercase;
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
