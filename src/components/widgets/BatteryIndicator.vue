<template>
    <font-awesome-icon
        v-show='batteryValid'
        :icon='batteryIcon'
    />
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBatteryEmpty, faBatteryFull, faBatteryQuarter, faBatteryHalf, faBatteryThreeQuarters } from '@fortawesome/free-solid-svg-icons';
library.add(faBatteryEmpty, faBatteryFull, faBatteryQuarter, faBatteryHalf, faBatteryThreeQuarters);
export default {
    name: 'battery-indicator',
    components: {
        FontAwesomeIcon
    },
    props: {
        value: Number
    },
    computed: {
        batteryIcon () {
            let icon = 'battery-';
            if (this.value > 80) icon += 'full';
            else if (this.value > 60) icon += 'three-quarters';
            else if (this.value > 40) icon += 'half';
            else if (this.value > 20) icon += 'quarter';
            else icon += 'empty';
            return icon;
        },
        batteryValid () {
            return this.value !== null && this.value !== undefined;
        }
    }
};
</script>
