<template>
    <div id='splash' :class='containerClass'>
        <img alt="Pi Guardian logo" class='flipX' src="../assets/logo.png">
        <h1 class='fadeIn'>{{ msg }}</h1>
    </div>
</template>

<script>
export default {
    name: 'SplashScreen',
    props: {
        msg: String,
        done: Boolean
    },
    computed: {
        containerClass() {
            return this.done ? 'flipY' : '';
        }
    }
}
</script>

<style scoped>
#splash {
    text-align: center;
    margin-top: 37vh;
}
img {
    height: 25vh;
}
h1 {
    color: #e89d31;
    margin: 0;
    opacity: 0;
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
/* Fade in the message while bringing it in closer to logo */
.fadeIn{
    animation: fadeIn 600ms ease-out 1.4s forwards;
}
@keyframes fadeIn {
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
