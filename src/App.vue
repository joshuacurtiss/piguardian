<template>
    <div id='app'>
        <splash-screen 
            msg='Welcome to Pi Guardian' 
            :done='ready'
        />
    </div>
</template>

<script>
import SplashScreen from './components/SplashScreen.vue'

export default {
    name: 'app',
    components: {
        SplashScreen
    },
    data() {
        return {
            ready: false
        }
    },
    mounted() {
        setTimeout(()=>{
            this.ready=true;
        },2644);
    }
}
</script>

<style>
body {
    font-family: "Avenir Next", Arial, Helvetica, sans-serif;
    background-color:black;
    margin: 0;
}
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #eee;
}
</style>
