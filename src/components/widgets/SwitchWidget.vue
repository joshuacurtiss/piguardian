<template>
    <li class='widget'
        :class='{dim}'
        :style='style'
        v-long-press="1300"
        @click='click'
        @long-press-start="longPress"
    >
        <h1>{{ title }}</h1>
        <font-awesome-icon
            class='icon'
            :icon='["fas","lightbulb"]'
        />
        <div class='details'>
            <level-indicator v-show='on' v-model='level' />
            <battery-indicator v-model='battery' />
            {{ details }}
        </div>
    </li>
</template>

<script>
import BatteryIndicator from './BatteryIndicator.vue';
import LevelIndicator from './LevelIndicator.vue';
import LongPress from 'vue-directive-long-press';
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
        FontAwesomeIcon,
        LevelIndicator
    },
    directives: {
        'long-press': LongPress
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
        },
        longPress () {
            console.log(`Long press on ${this.title}.`);
        }
    }
};
</script>
