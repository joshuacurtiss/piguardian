<template>
    <div class="shmContainer" :class='{"wide": editMode && !newshmCountdown}'>
        <!-- Current State Screen (not in 'edit' mode) -->
        <div v-if='!editMode'>
            <smart-home-monitor-icon
                :mode='shm'
                :loading='loading'
                class='shmIcon'
                @click='enableEditMode'
            />
            <p>
                {{ shmDescription }}
            </p>
        </div>
        <!-- Countdown Screen (the countdown is greater than zero) -->
        <div v-else-if='newshmCountdown' class='countdownContainer'>
            <div class='countdownIconContainer'>
                <smart-home-monitor-icon
                    :mode='newshm'
                    class='shmIcon'
                />
                <p>
                    {{ MODES[newshm] }} in {{ newshmCountdown }} sec.
                </p>
            </div>
            <ul>
                <li @click='addCountdownTime'>
                    <font-awesome-icon
                        icon='hourglass'
                        transform='grow-30 down-20 right-11'
                    />
                    <label>+30 seconds</label>
                </li>
                <li @click='cancelCountdown'>
                    <font-awesome-icon
                        icon='ban'
                        transform='grow-30 down-20 right-11'
                    />
                    <label>Cancel</label>
                </li>
            </ul>
        </div>
        <!-- Change State Screen -->
        <div v-else>
            <ul :class='{"wide": shm===newshm}'>
                <li v-for='key in Object.keys(MODES)'
                    :key='key'
                    :class='{"selected": key===newshm}'
                    @click='handleNewShmClick(key)'
                >
                    <smart-home-monitor-icon :mode='key' />
                    <label>
                        {{ MODES[key] }}
                        <span v-if='ARMINGMODES.includes(key)'>
                            in {{ config.armDelaySecs }} sec.
                        </span>
                    </label>
                </li>
            </ul>
            <keypad
                v-model='passcode'
                :class='{
                    "shake": passcodeFull && !passcodeValid,
                }'
                :maxlength='passcodeLength'
            />
        </div>
    </div>
</template>

<script>
import electron from 'electron';
import Keypad from '../Keypad.vue';
import { Passcode as PasscodeMixin } from '../../mixins/Passcode';
import SmartHomeMonitorIcon from '../SmartHomeMonitorIcon.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBan, faHourglass } from '@fortawesome/free-solid-svg-icons';
library.add(faBan, faHourglass);
const sleep = m => new Promise(r => setTimeout(r, m)); // eslint-disable-line promise/param-names
const ARMINGMODES = ['away', 'stay'];
const MODES = {
    'off': 'Disarmed',
    'away': 'Armed (Away)',
    'stay': 'Armed (Stay)'
};
export default {
    name: 'smart-home-monitor-screen',
    mixins: [
        PasscodeMixin
    ],
    components: {
        FontAwesomeIcon,
        Keypad,
        SmartHomeMonitorIcon
    },
    data () {
        return {
            ARMINGMODES,
            MODES,
            config: Object.assign({
                armDelaySecs: 60
            }, this.value),
            shm: null,
            loading: false,
            editMode: false,
            newshm: null,
            newshmCountdown: 0
        };
    },
    props: [
        'value'
    ],
    computed: {
        shmDescription () {
            if (MODES.hasOwnProperty(this.shm)) return MODES[this.shm];
            else return 'Loading...';
        }
    },
    watch: {
        value (newvalue) {
            console.log('originally: ', this.config);
            console.log('i need to merge: ', newvalue);
            Object.assign(this.config, newvalue);
        },
        editMode (newval) {
            this.$emit('requestFreezeUI', newval);
        },
        passcode (newval) {
            if (this.passcodeValid) {
                this.setNewShm();
            }
            if (this.passcodeFull) {
                setTimeout(() => {
                    this.passcode = '';
                }, 999);
            }
        }
    },
    methods: {
        handleNewShmClick (newval) {
            if (newval === this.shm) this.editMode = false;
            else this.newshm = newval;
        },
        enableEditMode () {
            this.newshm = this.shm;
            this.newshmCountdown = 0;
            this.editMode = true;
        },
        async setNewShm () {
            if (ARMINGMODES.includes(this.newshm)) {
                // Handle countdown
                this.newshmCountdown = this.config.armDelaySecs;
                while (this.newshmCountdown > 0) {
                    await sleep(1000);
                    if (this.newshmCountdown > 0) this.newshmCountdown -= 1;
                };
            }
            if (this.newshm !== this.shm) {
                this.shm = null;
                this.loading = true;
                this.editMode = false;
                this.$http.post(window.settings.smartthings.uri + '/shm', {
                    'value': this.newshm
                }, {
                    headers: {
                        'Authorization': 'Bearer ' + window.settings.smartthings.token
                    }
                });
            }
        },
        addCountdownTime () {
            const max = this.config.armDelaySecs * 2;
            this.newshmCountdown += 30;
            if (this.newshmCountdown > max) this.newshmCountdown = max;
        },
        cancelCountdown () {
            this.newshm = this.shm;
            this.newshmCountdown = 0;
            this.editMode = false;
        },
        load () {
            console.log('Loading SHM status...');
            this.loading = true;
            this.$http.get(window.settings.smartthings.uri + '/shm', {
                headers: {
                    'Authorization': 'Bearer ' + window.settings.smartthings.token
                }
            }).then(response => {
                if (response.body) this.shm = response.body.value;
            }).catch((exception) => {
                console.error(exception);
            }).finally(() => {
                this.loading = false;
            });
        }
    },
    mounted () {
        this.load();
        // IPC
        electron.ipcRenderer.on('shm-update', (event, data) => {
            this.shm = data.value;
            this.loading = false;
            this.$emit('event', `Smart Home Monitor set to "${this.shm}".`);
            this.$emit('requestFocus');
        });
    }
};
</script>

<style scoped src="../../styles/shake.css"></style>
<style scoped>
.shmContainer {
    text-align: center;
}
.shmContainer.wide {
    width: 150vw;
}
/* Current Display */
.shmIcon {
    margin-top: 6vh;
    font-size: 56vh;
}
p {
    font-size: 6vh;
    margin-top: 3vh;
    font-weight: bold;
}
/* List items (used as buttons on this screen) */
ul {
    float: left;
    list-style: none;
    width: 45vw;
    text-align: left;
    margin: 7.5vh 0 0 7vw;
    padding: 0;
    transition: all 0.6s ease;
}
ul.wide {
    width: 70vw;
    margin: 7.5vh 15vw;
}
ul li {
    cursor: pointer;
    padding: 2.5vh 1vw;
    margin: 2.5vh 0;
    border-radius: 10px;
    background-color: #333;
    transition: background-color 0.4s ease;
}
ul li.selected {
    background-color: #ccc;
    color: black;
}
ul li div {
    float: left;
    font-size: 12vh;
    margin: 0 2vw
}
ul li svg {
    float: left;
    margin: 0 2vw;
}
ul li svg[data-icon="ban"] {
    color: red;
}
ul li label {
    display: block;
    line-height: 12vh;
    font-size: 4vh;
}
/* Countdown */
.countdownIconContainer {
    float: left;
    width: 45vw;
    margin-left: 7vw;
}
.countdownContainer ul {
    margin-top: 10vh;
    width: 30vw;
}
.countdownContainer li label {
    margin-left: 10vw;
}
</style>
<!-- Some CSS to adjust keypad, mostly cannot be scoped so we group it here. -->
<style>
.shmContainer form {
    float: left;
    margin-left: 9vw;
}
.shmContainer form .function {
    color: white;
}
.shmContainer form button {
    width: 55px;
    height: 55px;
    margin: 9px;
}
</style>
