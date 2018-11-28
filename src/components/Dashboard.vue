<template>
    <transition name="zoom">
        <div v-show='active' class='dashboard'>
            <header>
                <div class='datetime'>
                    <dashboard-clock />
                </div>
                <div class='title'>
                    {{ activeScreenKey }}
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
                            {{ activeDeviceScreens[i] }}
                        </swipe-item>
                    </swipe>
                </transition>
                <transition name='fade'>
                    <swipe v-show='orgCustom' ref='customScreens' :auto='0' @change='handleChangeScreen'>
                        <swipe-item v-for='i in activeCustomScreenKeys' :key='i'>
                            {{ activeCustomScreens[i] }}
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
                />
                <font-awesome-icon
                    icon='th'
                    class='btn'
                />
                <font-awesome-icon
                    icon='power-off'
                    class='btn'
                />
            </footer>
        </div>
    </transition>
</template>

<script>
import DashboardClock from './DashboardClock.vue';
import DashboardEventBubble from './DashboardEventBubble.vue';
import Event from '../model/Event';
import { Swipe, SwipeItem } from 'vue-swipe';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCog, faTh, faPowerOff } from '@fortawesome/free-solid-svg-icons';
library.add(faCog, faTh, faPowerOff);
export default {
    name: 'dashboard',
    components: {
        DashboardClock,
        DashboardEventBubble,
        FontAwesomeIcon,
        Swipe,
        SwipeItem
    },
    props: {
        active: Boolean
    },
    data () {
        return {
            activeScreenIndex: 0,
            customScreens: {
                // TODO: Eventually remove this sample data
                'Weather': 'My weather screen.',
                'Living Room': [
                    'blah', 'hello', 'another'
                ],
                'Dining Room': [
                    'hiya', 'bye', 'bubbazinga'
                ]
            },
            deviceScreens: {
                // TODO: Eventually remove this sample data
                'Lights/Switches': [
                    'one', 'two', 'three'
                ],
                'Weather': 'My weather screen',
                'Doors/Windows': [
                    'Front Door', 'Back Door'
                ],
                'Locks': [
                    'Front Deadbolt', 'Back Deadbolt'
                ],
                'Sensors': [],
                'People': [
                    'Josh', 'KD'
                ]
            },
            events: [],
            orgCustom: false
        };
    },
    computed: {
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
        }
    },
    watch: {
        orgCustom (newval) {
            this.activeScreenIndex = 0;
            this.$refs[this.activeScreensName].goto(0);
        }
    },
    methods: {
        addEvent (message) {
            this.events.push(new Event(message));
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
        }
    },
    mounted () {
        this.handleChangeScreen(0);
    }
};
</script>

<style src='vue-swipe/dist/vue-swipe.css'></style>
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
