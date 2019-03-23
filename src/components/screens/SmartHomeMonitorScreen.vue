<template>
    <div class="shmContainer">
        <div class='iconContainer'>
            <font-awesome-layers>
                <font-awesome-icon
                    icon='home'
                />
                <font-awesome-icon
                    icon='square-full'
                    class='doorfiller'
                />
                <font-awesome-icon
                    :icon='shmIcon'
                    class='shmicon'
                />
            </font-awesome-layers>
        </div>
        <p>
            {{ shmDescription }}
        </p>
    </div>
</template>

<script>
import electron from 'electron';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';
import { faHome, faLock, faQuestion, faSquareFull, faUnlock, faUser } from '@fortawesome/free-solid-svg-icons';
library.add(faHome, faLock, faQuestion, faSquareFull, faUnlock, faUser);
export default {
    name: 'smart-home-monitor-screen',
    components: {
        FontAwesomeIcon,
        FontAwesomeLayers
    },
    data () {
        return {
            shm: null
        };
    },
    computed: {
        shmDescription () {
            if (this.shm === 'off') return 'Disarmed';
            else if (this.shm === 'away') return 'Armed (Away)';
            else if (this.shm === 'stay') return 'Armed (Stay)';
            else return 'Loading...';
        },
        shmIcon () {
            if (this.shm === 'off') return ['fas', 'unlock'];
            else if (this.shm === 'away') return ['fas', 'lock'];
            else if (this.shm === 'stay') return ['fas', 'user'];
            else return ['fas', 'question'];
        }
    },
    methods: {
        load () {
            console.log('Loading SHM status...');
            this.$http.get(window.settings.smartthings.uri + '/shm', {
                headers: {
                    'Authorization': 'Bearer ' + window.settings.smartthings.token
                }
            }).then(response => {
                if (response.body) this.shm = response.body.value;
            }).catch((exception) => {
                console.error(exception);
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
.iconContainer {
    width: 30vw;
    height: 50vh;
    background-color: #f3961c;
    color: #fafafa;
    border-radius: 50%;
    margin-left: 32.5vw;
    margin-top: 6vh;
    font-size: 40vh;
    padding: 3vh 0 0 3vw;
}
.doorfiller {
    font-size: 13vh;
    margin: 24.5vh 0 0 10vw !important;
}
.shmicon {
    color: #f3961c !important;
    font-size: 18vh;
    margin: 17vh 0 0 8.9vw !important;
}
p {
    text-align: center;
    font-size: 6vh;
    margin-top: 5vh;
    font-weight: bold;
}
</style>
