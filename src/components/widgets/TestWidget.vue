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
            <font-awesome-icon
                v-show='batteryValid'
                :icon='batteryIcon'
            />
            {{ details }}
        </div>
    </li>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faLightbulb, faBatteryEmpty, faBatteryFull, faBatteryQuarter, faBatteryHalf, faBatteryThreeQuarters } from '@fortawesome/free-solid-svg-icons';
library.add(faLightbulb, faBatteryEmpty, faBatteryFull, faBatteryQuarter, faBatteryHalf, faBatteryThreeQuarters);
export default {
    name: 'base-widget',
    components: {
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
    computed: {
        batteryIcon () {
            if (!this.batteryValid) return null;
            let icon = 'battery-';
            if (this.battery > 80) icon += 'full';
            else if (this.battery > 60) icon += 'three-quarters';
            else if (this.battery > 40) icon += 'half';
            else if (this.battery > 20) icon += 'quarter';
            else icon += 'empty';
            return icon;
        },
        batteryValid () {
            return this.battery !== null && this.battery !== undefined;
        }
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
