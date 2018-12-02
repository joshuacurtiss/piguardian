<template>
    <li class='widget'
        :class='{dim, x2}'
        :style='style'
    >
        <h1>{{ title }}</h1>
        <font-awesome-icon
            class='icon'
            :icon='["fas","lightbulb"]'
        />
        <div class='details'>
            <battery-indicator v-model='battery' />
            {{ details }}
        </div>
    </li>
</template>

<script>
import BatteryIndicator from './BatteryIndicator.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
library.add(faLightbulb);
export default {
    name: 'base-widget',
    components: {
        BatteryIndicator,
        FontAwesomeIcon
    },
    data () {
        return {
            style: {
                backgroundColor: 'maroon'
            },
            battery: 88.3,
            title: 'Untitled',
            details: 'Stuff'
        };
    },
    props: {
        value: {},
        dim: Boolean,
        x2: Boolean
    }
};
</script>

<style scoped>
</style>
