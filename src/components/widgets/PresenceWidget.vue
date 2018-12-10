<template>
    <li class='widget'
        :class='{dim}'
        :style='style'
    >
        <h1>{{ title }}</h1>
        <font-awesome-icon
            class='icon'
            transform='left-2'
            :icon='["fas", icon]'
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
import { faUser, faQuestion } from '@fortawesome/free-solid-svg-icons';
library.add(faUser, faQuestion);
export default {
    name: 'presence-widget',
    mixins: [ Widget ],
    components: {
        BatteryIndicator,
        FontAwesomeIcon
    },
    computed: {
        icon () {
            if (this.state.indexOf('present') >= 0) return 'user';
            else return 'question';
        }
    },
    data () {
        return {
            style: {
                backgroundColor: 'darkblue'
            }
        };
    }
};
</script>
