<template>
    <div class="shmContainer">
        <smart-home-monitor-icon
            :mode='shm'
            :loading='loading'
            class='shmIcon'
        />
        <p>
            {{ shmDescription }}
        </p>
    </div>
</template>

<script>
import electron from 'electron';
import SmartHomeMonitorIcon from '../SmartHomeMonitorIcon.vue';
export default {
    name: 'smart-home-monitor-screen',
    components: {
        SmartHomeMonitorIcon
    },
    data () {
        return {
            shm: null,
            loading: false
        };
    },
    computed: {
        shmDescription () {
            if (this.shm === 'off') return 'Disarmed';
            else if (this.shm === 'away') return 'Armed (Away)';
            else if (this.shm === 'stay') return 'Armed (Stay)';
            else return 'Loading...';
        }
    },
    methods: {
        load () {
            console.log('Loading SHM status...');
            this.loading = true;
            this.$http.get(window.settings.smartthings.uri + '/shm', {
                headers: {
                    'Authorization': 'Bearer ' + window.settings.smartthings.token
                }
            }).then(response => {
                if (response.body) this.shm = response.body.value;
            }).catch((exception) => {
                console.error(exception);
            }).finally(() => {
                this.loading = false;
            });
        }
    },
    mounted () {
        this.load();
        // IPC
        electron.ipcRenderer.on('shm-update', (event, data) => {
            this.shm = data.value;
            this.$emit('event', `Smart Home Monitor set to "${this.shm}".`);
        });
    }
};
</script>

<style scoped>
.shmContainer {
    margin-top: 6vh;
    text-align: center;
}
.shmIcon {
    font-size: 56vh;
}
p {
    font-size: 6vh;
    margin-top: 3vh;
    font-weight: bold;
}
</style>
