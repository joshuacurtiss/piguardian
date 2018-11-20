<template>
    <div class='dashboard'>
        <header>
            Header
        </header>
        <main>
            Tiles go here!
            <br /><br />
        </main>
        <footer>
            <img class="logo" src="../assets/logo.png" />
            <div class="eventcontainer">
                <!--
                <transition-group name='event-slide' tag='div'>
                    <div v-show='activeEvents.length' class="eventcomment">{{ activeEvents[0].toString() }}</div>
                </transition-group>
                -->
            </div>
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
</template>

<script>
import Event from '../model/Event';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCog, faTh, faPowerOff } from '@fortawesome/free-solid-svg-icons';
const EVENTDELAY = 6000;
library.add(faCog, faTh, faPowerOff);
export default {
    name: 'dashboard',
    components: {
        FontAwesomeIcon
    },
    props: {
    },
    data () {
        return {
            events: []
        };
    },
    computed: {
        activeEvents () {
            return this.events.filter(evt => evt.active);
        }
    },
    watch: {
        events () {
            this.checkEvents();
        }
    },
    methods: {
    },
    mounted () {
    }
};
</script>

<style scoped>
.dashboard {
    background-color: #111;
    height: 100vh;
    overflow: hidden;
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
/* Event Notifications */
.eventcontainer {
    position: absolute;
    left: 7vw;
    width: 50vw;
    padding: 1.8vh 0;
}
.eventcomment {
    position: relative;
    background: #f3961c;
    color: white;
    padding: 0 0.75vw;
    font-size: 2.75vh;
    line-height: 5vh;
    border: 1px solid #d98619;
    border-radius: 6px;
    text-align: left;
    margin-bottom: 2vh;
}
.eventcomment:after, .eventcomment:before {
    right: 100%;
    top: 50%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
}
.eventcomment:after {
    border-color: rgba(243, 150, 28, 0);
    border-right-color: #f3961c;
    border-width: 6px;
    margin-top: -6px;
}
.eventcomment:before {
    border-color: rgba(217, 134, 25, 0);
    border-right-color: #d98619;
    border-width: 7px;
    margin-top: -7px;
}
.event-slide-enter-active, .event-slide-leave-active {
  transition: margin-top .4s ease-out;
}
.event-slide-enter {
    margin-top: 7vh;
}
.event-slide-leave-to {
    margin-top: -7vh;
    height: 0;
}
.event-slide-enter-to, .event-slide-leave {
    margin-top: 0px;
    height: 5vh;
}
</style>
