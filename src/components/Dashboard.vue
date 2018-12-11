<template>
    <transition name="zoom">
        <div v-show='active' class='dashboard'>
            <header>
                <div class='datetime'>
                    <dashboard-clock />
                </div>
                <div class='title'>
                    {{ title }}
                </div>
                <div class='info'>
                    Organize by:
                    <toggle-button
                        v-model='orgCustom'
                        :height='20'
                        :width='67'
                        :color='{checked: "#1970d4", unchecked: "#db8411", disabled: "#CCCCCC"}'
                        :labels='{checked: "Custom", unchecked: "Device"}'
                    />
                </div>
            </header>
            <main>
                <transition name='fade'>
                    <swipe v-show='!orgCustom' ref='deviceScreens' :auto='0' @change='handleChangeScreen'>
                        <swipe-item v-for='i in activeDeviceScreenKeys' :key='i'>
                            <div v-if='Array.isArray(activeDeviceScreens[i])'>
                                <ul>
                                    <component
                                        v-for="deviceId in activeDeviceScreens[i]"
                                        :key='deviceId'
                                        v-bind:is='getWidgetForDevice(devicesById[deviceId])'
                                        v-model='devicesById[deviceId]'
                                    ></component>
                                </ul>
                            </div>
                            <div v-else-if='typeof activeDeviceScreens[i] === "Object" && componentExists(activeDeviceScreens[i].component || "")'>
                                <component
                                    v-bind:is='activeDeviceScreens[i].object'
                                ></component>
                            </div>
                            <div v-else>
                                {{ activeDeviceScreens[i] }}
                            </div>
                        </swipe-item>
                    </swipe>
                </transition>
                <transition name='fade'>
                    <swipe v-show='orgCustom' ref='customScreens' :auto='0' @change='handleChangeScreen'>
                        <swipe-item v-for='i in activeCustomScreenKeys' :key='i'>
                            <div v-if='Array.isArray(activeCustomScreens[i])'>
                                <ul>
                                    <component
                                        v-for="deviceId in activeCustomScreens[i]"
                                        :key='deviceId'
                                        v-bind:is='getWidgetForDevice(devicesById[deviceId])'
                                        v-model='devicesById[deviceId]'
                                    ></component>
                                </ul>
                            </div>
                            <div v-else-if='typeof activeCustomScreens[i] === "Object" && componentExists(activeCustomScreens[i].component || "")'>
                                <component
                                    v-bind:is='activeCustomScreens[i].object'
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
                <img class="logo" src="../assets/logo.png" />
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
// Widgets
import ContactWidget from './widgets/ContactWidget.vue';
import LockWidget from './widgets/LockWidget.vue';
import PresenceWidget from './widgets/PresenceWidget.vue';
import SwitchWidget from './widgets/SwitchWidget.vue';
import UnknownWidget from './widgets/UnknownWidget.vue';
// Miscellaneous
import electron from 'electron';
import { Swipe, SwipeItem } from 'vue-swipe';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCog, faTh, faPowerOff } from '@fortawesome/free-solid-svg-icons';
library.add(faCog, faTh, faPowerOff);
const CAPABILITIES = {
    'contact': {
        component: 'ContactWidget',
        name: 'Doors/Windows'
    },
    'lock': {
        component: 'LockWidget',
        name: 'Locks'
    },
    'presence': {
        component: 'PresenceWidget',
        name: 'People'
    },
    'switch': {
        component: 'SwitchWidget',
        name: 'Lights/Switches'
    }
};
export default {
    name: 'dashboard',
    components: {
        ContactWidget,
        DashboardClock,
        DashboardEventBubble,
        FontAwesomeIcon,
        LockWidget,
        PresenceWidget,
        Swipe,
        SwipeItem,
        SwitchWidget,
        UnknownWidget
    },
    props: {
        active: Boolean
    },
    data () {
        return {
            activeScreenIndex: 0,
            devices: [],
            events: [],
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
            return this.activeScreenKeys[this.activeScreenIndex];
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
            if (this.orgCustom || !CAPABILITIES[this.activeScreenKey]) return this.activeScreenKey;
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
            this.activeScreenIndex = 0;
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
            this.activeScreenIndex = index;
        },
        getWidgetForDevice (dev) {
            if (dev && dev.capability && CAPABILITIES[dev.capability]) return CAPABILITIES[dev.capability].component;
            else return 'UnknownWidget';
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
        quit () {
            window.close();
        }
    },
    mounted () {
        this.handleChangeScreen(0);
        // Refresh all devices on a given interval
        setInterval(this.loadDevices, window.settings.dashboard.refreshInterval);
        // IPC
        electron.ipcRenderer.on('device-update', (event, data) => {
            // If we have a valid comment, put it in the event bubble.
            if (data.comment) {
                this.addEvent(data.comment);
            }
            // If we can find the device, update it.
            if (this.devicesById[data.device.id]) {
                this.devicesById[data.device.id] = data.device;
            }
        });
    }
};
</script>

<style src='vue-swipe/dist/vue-swipe.css'></style>
<style src='./widgets/Widget.css'></style>
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
}
header .info {
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
