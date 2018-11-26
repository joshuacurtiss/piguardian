<template>
    <div class="eventcontainer">
        <transition name='event-slide'>
            <div v-show='event && event.active' class='eventcomment'>
                {{ formattedTimestamp }}:
                {{ formattedMessage }}
            </div>
        </transition>
    </div>
</template>

<script>
const EVENTDELAY = 6000;
export default {
    name: 'dashboard-event-bubble',
    props: {
        value: Object
    },
    data () {
        return {
            event: null
        };
    },
    computed: {
        formattedTimestamp () {
            if (!this.event) return '';
            return this.event.timestamp ? this.event.timestamp.toLocaleString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
            }) : '';
        },
        formattedMessage () {
            if (!this.event) return '';
            return this.event.message ? this.event.message : '';
        }
    },
    watch: {
        value (value) {
            this.event = value;
            if (this.event && this.event.active) {
                setTimeout(() => {
                    this.event = null;
                    setTimeout(() => {
                        this.$emit('done');
                    }, 500);
                }, EVENTDELAY);
            }
        }
    }
};
</script>

<style scoped>
.eventcontainer {
    position: absolute;
    left: 7vw;
    width: 50vw;
    padding: 1.8vh 0;
}
.eventcomment {
    position: relative;
    background: #f3961c;
    color: white;
    padding: 0 0.75vw;
    font-size: 2.75vh;
    line-height: 5vh;
    border: 1px solid #d98619;
    border-radius: 6px;
    text-align: left;
    margin-bottom: 2vh;
}
.eventcomment:after, .eventcomment:before {
    right: 100%;
    top: 50%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
}
.eventcomment:after {
    border-color: rgba(243, 150, 28, 0);
    border-right-color: #f3961c;
    border-width: 6px;
    margin-top: -6px;
}
.eventcomment:before {
    border-color: rgba(217, 134, 25, 0);
    border-right-color: #d98619;
    border-width: 7px;
    margin-top: -7px;
}
.event-slide-enter-active, .event-slide-leave-active {
    transition-property: opacity, transform;
    transition: 0.4s ease-out;
}
.event-slide-enter {
    opacity: 0;
    transform: translateY(7vh);
}
.event-slide-leave-to {
    opacity: 0;
    transform: translateY(-7vh);
}
.event-slide-enter-to, .event-slide-leave {
    opacity: 1;
    height: 5vh;
}
</style>
