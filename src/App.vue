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
    margin: 0;
    background-color:black;
    font-family: "Avenir Next", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #eee;
}
</style>
