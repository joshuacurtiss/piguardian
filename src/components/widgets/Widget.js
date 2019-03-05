export default {
    computed: {
        battery () {
            return this.value.battery;
        },
        level () {
            return this.value.level;
        },
        details () {
            return null;
        },
        dim () {
            return ['off', 'locked', 'not present', 'closed'].includes(this.state);
        },
        on () {
            return ['on', 'unlocked', 'present', 'open'].includes(this.state);
        },
        state () {
            return this.value.value;
        },
        title () {
            return this.value.name;
        }
    },
    data () {
        return {
            style: {
                backgroundColor: 'dimgray'
            }
        };
    },
    props: {
        value: {
            type: Object,
            default: function () {
                return {
                    id: null,
                    device: null,
                    name: 'Untitled',
                    capability: null,
                    level: null,
                    value: null,
                    battery: null
                };
            }
        }
    }
};
