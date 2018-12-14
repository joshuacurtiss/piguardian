<template>
    <li class='widget'
        :class='{dim}'
        :style='style'
        @click='click'
    >
        <h1>{{ title }}</h1>
        <font-awesome-icon
            class='icon'
            transform='left-2'
            :icon='["fas",icon]'
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
import { faLock, faLockOpen, faExclamation, faQuestion } from '@fortawesome/free-solid-svg-icons';
library.add(faLock, faLockOpen, faExclamation, faQuestion);
export default {
    name: 'lock-widget',
    mixins: [ Widget ],
    components: {
        BatteryIndicator,
        FontAwesomeIcon
    },
    computed: {
        icon () {
            if (this.state === 'locked') return 'lock';
            else if (this.state === 'unlocked') return 'lock-open';
            else if (this.state === 'unknown') return 'exclamation';
            else return 'question';
        }
    },
    data () {
        return {
            style: {
                backgroundColor: 'green'
            }
        };
    },
    methods: {
        click () {
            this.$emit('change', this.value, this.state === 'lock' ? 'unlock' : 'lock');
        }
    }
};
</script>
