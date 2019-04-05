<template>
    <li class='widget'
        :class='{dim, "tada": emphasis}'
        :style='style'
    >
        <h1>{{ title }}</h1>
        <font-awesome-icon
            class='icon'
            :icon='["fas","question"]'
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
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
library.add(faQuestion);
export default {
    name: 'unknown-widget',
    mixins: [ Widget ],
    components: { BatteryIndicator, FontAwesomeIcon }
};
</script>
