<template>
    <li class='widget'
        :class='{dim}'
        :style='style'
        @click='click'
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
import Widget from './Widget';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
library.add(faLightbulb);
export default {
    name: 'switch-widget',
    mixins: [ Widget ],
    components: {
        BatteryIndicator,
        FontAwesomeIcon
    },
    data () {
        return {
            style: {
                backgroundColor: 'maroon'
            }
        };
    },
    methods: {
        click () {
            this.$emit('change', this.value, this.state === 'on' ? 'off' : 'on');
        }
    }
};
</script>
