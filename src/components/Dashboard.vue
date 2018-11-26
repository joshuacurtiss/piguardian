<template>
    <transition name="fade">
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
                        v-model='orgByRoomOrType'
                        :height='20'
                        :width='64'
                        :color='{checked: "#1970d4", unchecked: "#db8411", disabled: "#CCCCCC"}'
                        :labels='{checked: "Room", unchecked: "Device"}'
                    />
                </div>
            </header>
            <main />
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
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCog, faTh, faPowerOff } from '@fortawesome/free-solid-svg-icons';
library.add(faCog, faTh, faPowerOff);
export default {
    name: 'dashboard',
    components: {
        DashboardClock,
        DashboardEventBubble,
        FontAwesomeIcon
    },
    props: {
        active: Boolean
    },
    data () {
        return {
            events: [],
            orgByRoomOrType: false,
            title: 'Starting up...'
        };
    },
    computed: {
        topActiveEvent () {
            if (this.activeEvents.length) return this.activeEvents[0];
        },
        activeEvents () {
            return this.events.filter(evt => evt.active);
        }
    },
    methods: {
        addEvent (message) {
            this.events.push(new Event(message));
        }
    },
    mounted () {
    }
};
</script>

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
main {
    margin: 1vh 1vw;
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
.fade-enter-active, .fade-leave-active {
    transition: transform 0.3s ease 0.8s;
}
.fade-enter, .fade-leave-to {
    transform: scale(1.3,1.3);
}
</style>
