<template>
    <li class='widget'
        :class='{dim}'
        :style='style'
    >
        <h1>{{ title }}</h1>
        <font-awesome-icon
            class='icon'
            transform='left-4'
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
import { faDoorClosed, faDoorOpen, faQuestion } from '@fortawesome/free-solid-svg-icons';
library.add(faDoorClosed, faDoorOpen, faQuestion);
export default {
    name: 'contact-widget',
    mixins: [ Widget ],
    components: {
        BatteryIndicator,
        FontAwesomeIcon
    },
    computed: {
        icon () {
            if (this.state === 'closed') return 'door-closed';
            else if (this.state === 'open') return 'door-open';
            else return 'question';
        }
    },
    data () {
        return {
            style: {
                backgroundColor: 'hotpink'
            }
        };
    }
};
</script>
