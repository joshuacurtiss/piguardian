<template>
    <div id='splash'>
        <img alt="Pi Guardian logo" src="../assets/logo.png">
        <h1>{{ msg }}</h1>
    </div>
</template>

<script>
export default {
    name: 'SplashScreen',
    props: {
        msg: String
    }
}
</script>

<style scoped>
#splash {
    text-align: center;
}
img {
    height: 25vh;
    margin-top: 35vh;
}
h1 {
    color: #e89d31;
    margin: 0;
}
</style>
