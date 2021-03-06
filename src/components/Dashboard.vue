<template>
    <transition name="zoom">
        <div v-show='active' class='dashboard'>
            <header>
                <div class='datetime'>
                    <dashboard-clock />
                </div>
                <transition name="slidetitle">
                    <div v-show='title' class='title'>
                        {{ title }}
                    </div>
                </transition>
                <div class='info'>
                    Organize by:
                    <toggle-button
                        v-model='orgCustom'
                        :height='20'
                        :width='67'
                        :sync='true'
                        :disabled='freezeUI'
                        :color='{checked: "#1970d4", unchecked: "#db8411", disabled: "#CCCCCC"}'
                        :labels='{checked: "Custom", unchecked: "Device"}'
                    />
                </div>
            </header>
            <main>
                <transition name='fade'>
                    <swipe v-show='!orgCustom' ref='deviceScreens' :speed='100' :auto='0' :disabled='freezeUI' @change='handleChangeScreen'>
                        <swipe-item>
                            <springboard-screen
                                :screens='activeDeviceScreens'
                                @requestFocus='lastSwipeTime=0;setFocus(false,$event);'
                            />
                        </swipe-item>
                        <swipe-item v-for='i in activeDeviceScreenKeys' :key='i'>
                            <div v-if='Array.isArray(activeDeviceScreens[i])'>
                                <ul>
                                    <component
                                        v-for="deviceId in activeDeviceScreens[i]"
                                        :key='deviceId'
                                        :emphasis='emphasis[deviceId]'
                                        v-bind:is='getWidgetForDevice(devicesById[deviceId])'
                                        v-model='devicesById[deviceId]'
                                        @change='updateDevice'
                                        @event='addEvent($event)'
                                        @requestFreezeUI='freezeUI=$event'
                                        @requestFocus='setFocus(false,i)'
                                    ></component>
                                </ul>
                            </div>
                            <div v-else-if='typeof activeDeviceScreens[i] === "object" && componentExists(activeDeviceScreens[i].component || "")'>
                                <component
                                    v-bind:is='activeDeviceScreens[i].component'
                                    v-model='activeDeviceScreens[i]'
                                    :active='!orgCustom && activeDeviceScreenKeys[activeScreenIndex]===i'
                                    @event='addEvent($event)'
                                    @requestFreezeUI='freezeUI=$event'
                                    @requestFocus='setFocus(false,i)'
                                ></component>
                            </div>
                            <div v-else>
                                {{ activeDeviceScreens[i] }}
                            </div>
                        </swipe-item>
                    </swipe>
                </transition>
                <transition name='fade'>
                    <swipe v-show='orgCustom' ref='customScreens' :speed='100' :auto='0' :disabled='freezeUI' @change='handleChangeScreen'>
                        <swipe-item>
                            <springboard-screen
                                :screens='activeCustomScreens'
                                @requestFocus='lastSwipeTime=0;setFocus(true,$event);'
                            />
                        </swipe-item>
                        <swipe-item v-for='i in activeCustomScreenKeys' :key='i'>
                            <div v-if='Array.isArray(activeCustomScreens[i])'>
                                <ul>
                                    <component
                                        v-for="deviceId in activeCustomScreens[i]"
                                        :key='deviceId'
                                        :emphasis='emphasis[deviceId]'
                                        v-bind:is='getWidgetForDevice(devicesById[deviceId])'
                                        v-model='devicesById[deviceId]'
                                        @change='updateDevice'
                                        @event='addEvent($event)'
                                        @requestFreezeUI='freezeUI=$event'
                                        @requestFocus='setFocus(true,i)'
                                    ></component>
                                </ul>
                            </div>
                            <div v-else-if='typeof activeCustomScreens[i] === "object" && componentExists(activeCustomScreens[i].component || "")'>
                                <component
                                    v-bind:is='activeCustomScreens[i].component'
                                    v-model='activeCustomScreens[i]'
                                    :active='orgCustom && activeCustomScreenKeys[activeScreenIndex]===i'
                                    @event='addEvent($event)'
                                    @requestFreezeUI='freezeUI=$event'
                                    @requestFocus='setFocus(true,i)'
                                ></component>
                            </div>
                            <div v-else>
                                {{ activeCustomScreens[i] }}
                            </div>
                        </swipe-item>
                    </swipe>
                </transition>
            </main>
            <footer>
                <img
                    class="logo"
                    src="../assets/logo.png"
                    @click="handleClickLogo"
                />
                <dashboard-event-bubble
                    v-model='topActiveEvent'
                    @done='topActiveEvent.active=false'
                />
                <font-awesome-icon
                    icon='cog'
                    class='btn'
                    @click='addEvent("Not implemented yet!")'
                />
                <font-awesome-icon
                    icon='th'
                    class='btn'
                    @click='addEvent("Not implemented yet!")'
                />
                <font-awesome-icon
                    icon='power-off'
                    class='btn'
                    @click='quit'
                />
            </footer>
        </div>
    </transition>
</template>

<script>
// Dashboard elements
import DashboardClock from './DashboardClock.vue';
import DashboardEventBubble from './DashboardEventBubble.vue';
import Event from '../model/Event';
// Screens
import DailyScriptureScreen from './screens/DailyScriptureScreen.vue';
import SmartHomeMonitorScreen from './screens/SmartHomeMonitorScreen.vue';
import SpringboardScreen from './screens/SpringboardScreen.vue';
import WeatherScreen from './screens/WeatherScreen.vue';
// Widgets
import ContactWidget from './widgets/ContactWidget.vue';
import LockWidget from './widgets/LockWidget.vue';
import PresenceWidget from './widgets/PresenceWidget.vue';
import SwitchWidget from './widgets/SwitchWidget.vue';
import UnknownWidget from './widgets/UnknownWidget.vue';
// Miscellaneous
import electron from 'electron';
import CAPABILITIES from '../model/Capabilities';
import PlaySound from 'play-sound';
import { Swipe, SwipeItem } from 'vue-swipe';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCog, faTh, faPowerOff } from '@fortawesome/free-solid-svg-icons';
library.add(faCog, faTh, faPowerOff);
const sleep = m => new Promise(r => setTimeout(r, m)); // eslint-disable-line promise/param-names
const player = new PlaySound();
export default {
    name: 'dashboard',
    components: {
        ContactWidget,
        DailyScriptureScreen,
        DashboardClock,
        DashboardEventBubble,
        FontAwesomeIcon,
        LockWidget,
        PresenceWidget,
        SmartHomeMonitorScreen,
        SpringboardScreen,
        Swipe,
        SwipeItem,
        SwitchWidget,
        UnknownWidget,
        WeatherScreen
    },
    props: {
        active: Boolean
    },
    data () {
        return {
            activeScreenIndex: 0,
            freezeUI: false,
            devices: [],
            emphasis: {},
            events: [],
            lastSwipeTime: 0,
            orgCustom: false
        };
    },
    computed: {
        devicesById () {
            const obj = {};
            this.devices.forEach(dev => {
                obj[dev.id] = dev;
            });
            return obj;
        },
        customScreens () {
            return window.settings.dashboard.customScreens;
        },
        deviceScreens () {
            return window.settings.dashboard.deviceScreens;
        },
        topActiveEvent () {
            if (this.activeEvents.length) return this.activeEvents[0];
            else return null;
        },
        activeEvents () {
            return this.events.filter(evt => evt.active);
        },
        activeScreensName () {
            return this.orgCustom ? 'customScreens' : 'deviceScreens';
        },
        activeScreens () {
            const screens = this[this.activeScreensName];
            return this.filterActiveScreens(screens);
        },
        activeScreenKey () {
            return this.activeScreenKeys[this.activeScreenIndex - 1];
        },
        activeScreenKeys () {
            return Object.keys(this.activeScreens);
        },
        activeCustomScreens () {
            return this.filterActiveScreens(this.customScreens);
        },
        activeDeviceScreens () {
            return this.filterActiveScreens(this.deviceScreens);
        },
        activeCustomScreenKeys () {
            return Object.keys(this.activeCustomScreens);
        },
        activeDeviceScreenKeys () {
            return Object.keys(this.activeDeviceScreens);
        },
        title () {
            if (!CAPABILITIES[this.activeScreenKey]) return this.activeScreenKey;
            else return CAPABILITIES[this.activeScreenKey].name;
        }
    },
    watch: {
        active (newval) {
            if (newval === true) {
                this.loadDevices();
            }
        },
        orgCustom (newval) {
            this.lastSwipeTime = new Date().getTime();
            this.activeScreenIndex = 0;
            this.$emit('activity');
            this.$refs[this.activeScreensName].goto(0);
        }
    },
    methods: {
        addEvent (message) {
            this.events.push(new Event(message));
        },
        componentExists (name) {
            return Object.keys(this.$options.components).includes(name);
        },
        filterActiveScreens (screens) {
            let obj = {};
            Object.keys(screens).forEach(key => {
                const item = screens[key];
                // If it is an array but not empty, or some other truthy value... add it.
                if ((Array.isArray(item) && item.length) || (Array.isArray(item) === false && item)) obj[key] = item;
            });
            return obj;
        },
        handleChangeScreen (index) {
            this.lastSwipeTime = new Date().getTime();
            this.activeScreenIndex = index;
            this.$emit('activity');
        },
        handleClickLogo () {
            if (this.activeScreenIndex) {
                this.lastSwipeTime = 0;
                this.setFocus(this.orgCustom, 0);
            } else {
                this.addEvent(`Hi! I'm Pi Guardian v${window.version}!`);
            }
        },
        getWidgetForDevice (dev) {
            if (dev && dev.capability && CAPABILITIES[dev.capability]) return CAPABILITIES[dev.capability].component;
            else return 'UnknownWidget';
        },
        async setFocus (custom, key) {
            const now = new Date().getTime();
            console.log(`Requested focus to ${custom ? 'Custom' : 'Devices'} - ${key}.`);
            if (this.freezeUI) {
                console.log('Request denied because Freeze UI is on.');
                return;
            }
            if (now - this.lastSwipeTime < window.settings.dashboard.swipeCooldown) {
                console.log('Request denied because the swipe cooldown is not done.');
                return;
            }
            if (this.orgCustom === custom && this.activeScreenKey === key) {
                console.log('Request denied because I am already on the right screen.');
                return;
            }
            if (this.orgCustom !== custom) {
                this.orgCustom = custom;
                await sleep(777);
            }
            const $activeSwipeContainer = this.$refs[this.activeScreensName];
            const newIndex = this.activeScreenKeys.indexOf(key) + 1; // Because 1st screen is always springboard.
            while (newIndex !== this.activeScreenIndex) {
                const keyslen = this.activeScreenKeys.length + 1;
                // Calculate if it is faster to go forward or backward. Go fastest route.
                let diffForward = newIndex - this.activeScreenIndex + keyslen;
                if (diffForward >= keyslen) diffForward -= keyslen;
                let diffBackward = this.activeScreenIndex - newIndex + keyslen;
                if (diffBackward >= keyslen) diffBackward -= keyslen;
                if (diffForward <= diffBackward) $activeSwipeContainer.next();
                else $activeSwipeContainer.prev();
                await sleep(200);
            };
        },
        /**
         * Loads all devices and their status.
         */
        loadDevices () {
            if (window.settings.smartthingsIsConfigured) {
                this.$http.get(window.settings.smartthings.uri + '/devices', {
                    headers: {
                        'Authorization': 'Bearer ' + window.settings.smartthings.token
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
         * Sends command to SmartThings to update a device.
         * @param device {object} The device to update.
         * @param newvalue The new value to set the device to.
         */
        updateDevice (device, newvalue) {
            this.$http.post(window.settings.smartthings.uri + '/devices/' + device.id, {
                action: newvalue
            }, {
                headers: {
                    'Authorization': 'Bearer ' + window.settings.smartthings.token
                }
            });
        },
        /**
         * Emphasize a given widget by assigning its deviceId to the emphasis object.
         * @param deviceId {string} The Device ID.
         */
        async emphasize (deviceId) {
            this.$set(this.emphasis, deviceId, true);
            await sleep(5000);
            this.$set(this.emphasis, deviceId, false);
        },
        quit () {
            window.close();
        }
    },
    mounted () {
        this.handleChangeScreen(0);
        // Refresh all devices on a given interval
        setInterval(this.loadDevices, window.settings.dashboard.refreshInterval);
        // IPC
        electron.ipcRenderer.on('device-update', async (event, data) => {
            // If we have a valid comment, put it in the event bubble and do chime/speech notification.
            if (data.comment) {
                this.addEvent(data.comment);
                const devspec = window.settings.dashboard.notifications[data.device.capability];
                const valspec = devspec ? devspec[data.value] : null;
                if (valspec) {
                    player.play(valspec.chime, err => {
                        if (err) console.log(`Could not play chime: ${err}`);
                        if (valspec.speech && !window.settings.isNoSpeechTime(valspec.noSpeechTime)) window.speech.speak(data.comment);
                    });
                }
            }
            // If we can find the device, update it.
            if (this.devicesById[data.device.id]) {
                this.devicesById[data.device.id] = data.device;
            }
            // Find the org/screen of this device. Because we will swipe to it.
            let newOrgCustom = this.orgCustom;
            let newKey;
            let orgs = [
                window.settings.dashboard.deviceScreens,
                window.settings.dashboard.customScreens
            ];
            // Search first the org we're on. So if they're on custom, swap the two orgs in the array.
            if (this.orgCustom) orgs.reverse();
            orgs.some(screens => {
                newKey = Object.keys(screens).find(key => {
                    const screen = screens[key];
                    // It's a match if this screen is an array of widgets, and one of them has this ID!
                    return Array.isArray(screen) && screen.includes(data.device.id);
                });
                // If we found it, stop looking. Otherwise, switch to other org and search again.
                if (newKey) return true;
                else newOrgCustom = !newOrgCustom;
            });
            // If we did find one, set focus to it.
            if (newKey && (this.orgCustom !== newOrgCustom || this.activeScreenKey !== newKey)) {
                await this.setFocus(newOrgCustom, newKey);
                await sleep(222);
            }
            this.emphasize(data.device.id);
        });
        electron.ipcRenderer.on('message', (event, data) => {
            // If we have a valid comment, put it in the event bubble.
            if (data.comment) {
                this.addEvent(data.comment);
            }
            // If we have a valid message, speak it.
            if (data.message) {
                player.play(window.settings.dashboard.notifications.message.chime, err => {
                    if (err) console.log(`Could not play chime: ${err}`);
                    window.speech.speak(data.message);
                });
            }
        });
    }
};
</script>

<style src='vue-swipe/dist/vue-swipe.css'></style>
<style src='./widgets/Widget.css'></style>
<style src='../styles/tada.css'></style>
<style>
/* Swipe Customizations */
.mint-swipe-indicator {
    background: #555;
    opacity: 0.5;
    margin: 0 0.75vw;
}
</style>
<style scoped>
.dashboard {
    height: 100vh;
    overflow: hidden;
    margin: 0;
    padding: 0;
}
/* Header */
header {
    height: 5vh;
    user-select: none;
}
header div {
    font-size: 3vh;
    width: 28vw;
    float: left;
    padding: 0.7vh 1vw 0;
}
header .title {
    text-align: center;
    width: 37.5vw;
    background: #333;
    border-right: 1px solid #444;
    border-left: 1px solid #444;
    border-bottom: 1px solid #444;
    border-bottom-left-radius: 2vh;
    border-bottom-right-radius: 2vh;
    transition: transform 0.3s ease;
}
.slidetitle-enter, .slidetitle-leave-to {
    transform: translateY(-5vh);
}
header .info {
    float: right;
    text-align: right;
}
/* Main Content */
main {
    margin: 1vh 1vw;
}
.mint-swipe {
    position: absolute;
    height: 84vh;
    width: 98vw;
}
ul {
    margin: 0;
    padding: 0;
}
/* Control Board (where user controls stuff) */
footer {
    background: #333;
    border-top: 1px solid #444;
    color: white;
    overflow: hidden;
    position: absolute;
    text-align: right;
    line-height: 9vh;
    height: 9vh;
    width: 100vw;
    bottom: 0;
    user-select: none;
}
footer .logo {
    height: 6vh;
    position: absolute;
    margin-top: 1.5vh;
    left: 2vw;
}
footer .btn {
    background-color: #444;
    border: 1px solid #484848;
    margin-top: 1vh;
    margin-right: 2.5vw;
    padding: 5px;
    border-radius: 50%;
    cursor: pointer;
}
footer .btn:hover {
    background-color: #666;
}
footer .btn:active {
    background-color: #888;
}
/* Transitions */
.zoom-enter-active, .zoom-leave-active {
    transition: transform 0.3s ease 0.8s;
}
.zoom-enter, .zoom-leave-to {
    transform: scale(1.5,1.5);
}
.fade-enter-active {
    transition: all 0.3s ease 0.3s;
}
.fade-leave-active{
    transition: all 0.3s ease;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
    transform: translateY(5vh);
}
</style>
