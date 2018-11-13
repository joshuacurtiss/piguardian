<template>
    <div id='app'>
        <splash-screen msg='Welcome to Pi Guardian' />
    </div>
</template>

<script>
import SplashScreen from './components/SplashScreen.vue'

export default {
    name: 'app',
    components: {
        SplashScreen
    }
}
</script>

<style>
body {
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
