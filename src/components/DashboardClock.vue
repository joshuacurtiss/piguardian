<template>
    <span>
        {{ formattedDateTime }}
    </span>
</template>

<script>
import moment from 'moment';
export default {
    name: 'dashboard-clock',
    data () {
        return {
            dt: moment(),
            timeout: null
        };
    },
    computed: {
        formattedDateTime () {
            return this.dt.format('ddd, MMM D, h:mma');
        },
        msToNextMin () {
            return 60000 - this.dt % 60000;
        }
    },
    methods: {
        updateClock () {
            this.dt = moment();
            this.timeout = setTimeout(this.updateClock, this.msToNextMin);
        }
    },
    mounted () {
        this.updateClock();
    }
};
</script>
