<template>
    <div>
        <p>
            Here are the voices this system has access to:
        </p>
        <p>
            <span v-for='(voice, i) in voices' :key='i'>
                <span class='nowrap'>{{voice.name}} ({{voice.lang}})</span><span v-if='i+1<voices.length'>,</span>&nbsp;
            </span>
        </p>
    </div>
</template>

<script>
export default {
    name: 'voice-screen',
    data () {
        return {
            voices: []
        };
    },
    mounted () {
    }
};
</script>

<style scoped>
    .nowrap {
        white-space: nowrap;
    }
</style>
