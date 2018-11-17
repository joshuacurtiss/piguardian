<template>
    <transition name="fade">
        <div v-show='active' class='clock' @click='handleClick'>
            <h1 v-html='formattedDate' />
            <h2 v-html='formattedTime' :class='animationClass' />
        </div>
    </transition>
</template>

<script>
import moment from 'moment';
export default {
    name: 'Clock',
    props: {
        active: Boolean
    },
    data () {
        return {
            animationClass: 'rubberBand',
            dt: moment(),
            timeout: null
        };
    },
    computed: {
        formattedDate () {
            return this.dt.format('dddd, MMMM, D, YYYY');
        },
        formattedTime () {
            return this.dt.format('h:mma');
        },
        msToNextMin () {
            return 60000 - this.dt % 60000;
        }
    },
    watch: {
        active (newval) {
            if (newval) this.updateClock();
            else clearTimeout(this.timeout);
        }
    },
    methods: {
        updateClock () {
            if (this.active) {
                this.dt = moment();
                this.animationClass = 'rubberBand';
                this.timeout = setTimeout(this.updateClock, this.msToNextMin);
                setTimeout(() => {
                    this.animationClass = '';
                }, 2000);
            }
        },
        handleClick () {
            this.$emit('click');
        }
    }
};
</script>

<style scoped>
.clock {
    position: absolute;
    top: 0;
    height: 100vh;
    width: 100vw;
    background-color: #000;
    color: white;
    text-align: center;
    z-index: 999;
}
.clock h1 {
    font-size: 6vh;
    font-weight: normal;
    margin: 15vh 0 11vh 0;
}
.clock h2 {
    font-size: 32vh;
    margin: 10vh 0;
    animation-duration: 1s;
    animation-fill-mode: both;
    animation-iteration-count: 1;
}
/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity .3s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.rubberBand {animation-name: rubberBand;}
@keyframes rubberBand {
    from {transform: scale3d(1, 1, 1);}
    30% {transform: scale3d(1.25, 0.75, 1);}
    40% {transform: scale3d(0.75, 1.25, 1);}
    50% {transform: scale3d(1.15, 0.85, 1);}
    65% {transform: scale3d(.95, 1.05, 1);}
    75% {transform: scale3d(1.05, .95, 1);}
    to {transform: scale3d(1, 1, 1);}
}
</style>
