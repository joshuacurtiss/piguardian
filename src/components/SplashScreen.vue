<template>
    <div id='splash' :class='containerClass'>
        <img alt="Pi Guardian logo" class='flipX' src="../assets/logo.png">
        <h1 class='fadeUp'>{{ title }}</h1>
        <transition name='fade'>
            <div v-show='message' class='message' v-html='message' />
        </transition>
    </div>
</template>

<script>
export default {
    name: 'SplashScreen',
    props: {
        title: String,
        message: String,
        done: Boolean
    },
    computed: {
        containerClass () {
            return this.done ? 'flipY' : '';
        }
    }
};
</script>

<style scoped>
#splash {
    position: absolute;
    background-color: black;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    text-align: center;
    padding-top: 37vh;
}
img {
    height: 25vh;
}
h1 {
    color: #e89d31;
    margin: 0;
    opacity: 0;
}
.message {
    margin-top: 2vh;
}
/* Flip logo horizontally, then raise it up */
.flipX{
    opacity:0;
    animation: flipX 2s ease-in 0s forwards;
}
@keyframes flipX {
    0% {
        opacity:0;
        transform: perspective(240px) rotateY(90deg);
    }
    20% {
        opacity:1;
        transform: perspective(240px) rotateY(-11deg);
    }
    25% {
        opacity:1;
        transform: perspective(240px) rotateY(11deg);
    }
    30% {
        opacity:1;
        transform: perspective(240px) rotateY(0);
    }
    70% {
        opacity:1;
        margin:0;
    }
    100% {
        opacity:1;
        margin-top:-8vh;
    }
}
/* Simple fade transition */
.fade-enter-active, .fade-leave-active {
    transition: opacity 1s;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}
/* Fade in the message while bringing it up closer to logo */
.fadeUp{
    animation: fadeUp 600ms ease-out 1.4s forwards;
}
@keyframes fadeUp {
    0% {opacity:0; margin-top: 10vh;}
    100% {opacity:1; margin-top: 1vh;}
}
/* The whole container flips vertically to disappear */
.flipY{
    animation: flipY 600ms ease-out 0.5s forwards;
}
@keyframes flipY {
    25% {
        transform: perspective(240px) rotateX(-15deg);
    }
    50% {
        transform: perspective(240px) rotateX(-15deg);
        opacity:1;
    }
    100% {
        opacity:0;
        transform: perspective(240px) rotateX(90deg);
    }
}
</style>
