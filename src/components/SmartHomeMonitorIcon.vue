<template>
    <font-awesome-layers fixed-width @click='$emit(`click`)'>
        <font-awesome-icon icon='circle' />
        <font-awesome-icon icon='home' transform='shrink-4' />
        <font-awesome-icon icon='square-full' transform='shrink-12 down-3.25' />
        <font-awesome-icon icon='circle-notch' spin v-show='loading' transform='shrink-11 down-2' />
        <font-awesome-icon :icon='shmIcon' v-show='!loading' class='shmicon' transform='shrink-10.5 down-1.9' />
    </font-awesome-layers>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';
import { faCircle, faCircleNotch, faHome, faLock, faQuestion, faSquareFull, faUnlock, faUser } from '@fortawesome/free-solid-svg-icons';
library.add(faCircle, faCircleNotch, faHome, faLock, faQuestion, faSquareFull, faUnlock, faUser);
export default {
    name: 'smart-home-monitor-icon',
    components: {
        FontAwesomeIcon,
        FontAwesomeLayers
    },
    props: {
        'loading': {
            type: Boolean,
            default: false
        },
        'mode': {
            required: true
        }
    },
    computed: {
        shmIcon () {
            if (this.mode === 'off') return ['fas', 'unlock'];
            else if (this.mode === 'away') return ['fas', 'lock'];
            else if (this.mode === 'stay') return ['fas', 'user'];
            else return ['fas', 'question'];
        }
    }
};
</script>

<style scoped>
svg[data-icon="home"], svg[data-icon="square-full"] {
    color: #fafafa;
}
svg[data-icon="circle"], .shmicon {
    color: #f3961c;
}
svg[data-icon="circle-notch"] {
    color: #777;
}
</style>
