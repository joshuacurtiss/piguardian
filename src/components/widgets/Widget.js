export default {
    computed: {
        battery () {
            return this.value.battery;
        },
        details () {
            return null;
        },
        dim () {
            return ['off', 'locked', 'not present', 'closed'].includes(this.state);
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
                    value: null,
                    battery: null
                };
            }
        }
    }
};
