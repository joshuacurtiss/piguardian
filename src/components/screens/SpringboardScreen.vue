<template>
    <div class="SpringboardContainer">
        <div v-for='(item, key) of screens'
            :key='key'
            :style='{
                "height": buttonHeight + "vh",
                "line-height": buttonHeight + "vh"
            }'
            @click='$emit("requestFocus", key)'
            class='button'
        >
            <label>{{ title(key) }}</label>
            <!--
            <font-awesome-icon
                :icon='icon(key)'
                style='transform: rotate(-15deg); opacity: 0.1; font-size: 540%; margin-left: 5%; margin-top: -4%;'
            />
            -->
        </div>
    </div>
</template>

<script>
import CAPABILITIES from '../../model/Capabilities';
// import { library } from '@fortawesome/fontawesome-svg-core';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// import { faDoorClosed, faHome, faLightbulb, faLock, faTh, faUser } from '@fortawesome/free-solid-svg-icons';
// library.add(faDoorClosed, faHome, faLightbulb, faLock, faTh, faUser);
const ICONS = {
    'contact': 'door-closed',
    'lock': 'lock',
    'presence': 'user',
    'switch': 'lightbulb',
    'shm': 'home'
};
export default {
    name: 'springboard-screen',
    components: {
        // FontAwesomeIcon
    },
    props: [
        'screens'
    ],
    computed: {
        buttonHeight () {
            let height = 75 / Math.ceil(this.screenKeys.length / 2);
            return height - 2 - 2 - 3; // 2 padding top/bottom, 3 margin top
        },
        screenKeys () {
            return Object.keys(this.screens);
        }
    },
    methods: {
        icon (key) {
            return ICONS[key] || 'th';
        },
        title (key) {
            if (!CAPABILITIES[key]) return key;
            else return CAPABILITIES[key].name;
        }
    }
};
</script>

<style scoped>
    .button {
        float: left;
        width: 41vw;
        margin: 3vh 2vw 0;
        padding: 2vh 2vw;
        background-color: #333;
        cursor: pointer;
        border-radius: 10px;
        overflow: hidden;
    }
    .button label {
        display: block;
        position: absolute;
        /*
        margin-left: 6vw;
        width: 35vw;
        */
        width: 41vw;
        text-align: center;
        font-size: 1.2em;
        color: #ccc;
    }
</style>
