<template>
    <div class='level-indicator'>
        <span v-show='value'>{{value}}%</span>
    </div>
</template>

<script>
export default {
    name: 'level-indicator',
    props: {
        value: Number
    }
};
</script>

<style scoped>
.level-indicator {
    float: right;
}
</style>
