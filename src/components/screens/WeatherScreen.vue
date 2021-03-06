<template>
    <div class="weatherContainer">
        <div v-if='!loaded' class='loadingIndicator'>
            <font-awesome-icon
                icon="circle-notch"
                transform="left-3"
                spin
            />
            Loading...
        </div>
        <main v-show='loaded'>
            <h1>Current Weather</h1>
            <h2>{{ current.name }}</h2>
            <p class='cond'>
                <img :src='iconSvg(current.icon)' />
                <br />
                {{ current.main }}
            </p>
            <p class='temp'>
                {{ current.temp }}º
                {{ tempUnit }}
            </p>
            <p class='asof'>
                Last updated {{ current.dt }}.
            </p>
        </main>
        <table>
        <tbody>
            <tr v-for='day in forecast' :key='day.dt'>
                <td><img :src='iconUrl(day.icon)' /></td>
                <td>{{ day.dt }}</td>
                <td>{{ day.temp }}º {{ tempUnit }}</td>
                <td>{{ day.description }}</td>
            </tr>
        </tbody>
        </table>
    </div>
</template>

<script>
import expirePlugin from 'store/plugins/expire';
import store from 'store/dist/store.modern';
import moment from 'moment';
import icons from '../../assets/weather';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
library.add(faCircleNotch);
store.addPlugin(expirePlugin);
const CHECKINTERVAL = 60006;
const FORECASTKEY = 'piguardian.weather.forecast';
const CURRENTKEY = 'piguardian.weather.current';
const CURRENTEXPIRATION = 10 * 60 * 1000; // 10min
const FORECASTEXPIRATION = 6 * 60 * 60 * 1000; // 6hr
export default {
    name: 'weather-screen',
    components: {
        FontAwesomeIcon
    },
    data () {
        return {
            config: Object.assign({
                'apiKey': null,
                'apiUri': 'https://api.openweathermap.org/data/2.5/',
                'iconUri': 'https://openweathermap.org/img/w/',
                'requestFocusTime': null,
                'units': 'imperial',
                'zipCode': null
            }, this.value),
            current: {
                'name': null,
                'temp': null,
                'dt': null,
                'description': null,
                'main': null,
                'icon': null
            },
            forecast: []
        };
    },
    props: [
        'value',
        'active'
    ],
    watch: {
        active (newval) {
            if (newval) this.load();
        },
        value (newvalue) {
            Object.assign(this.config, newvalue);
            this.load();
        }
    },
    computed: {
        loaded () {
            return this.current.name && this.current.temp && this.current.dt;
        },
        ready () {
            return this.config.apiKey && this.config.zipCode;
        },
        tempUnit () {
            const units = this.config.units.toLowerCase();
            if (units === 'imperial') return 'F';
            if (units === 'metric') return 'C';
            if (units === 'kelvin') return 'K';
            return '';
        }
    },
    methods: {
        iconUrl (code) {
            return this.config.iconUri + code + '.png';
        },
        iconSvg (code) {
            return icons[code];
        },
        load () {
            if (!this.active && moment().format('h:mma') === this.config.requestFocusTime) this.$emit('requestFocus');
            if (!this.active) return; // Don't load data if the screen is not active.
            const newCurrent = store.get(CURRENTKEY);
            if (newCurrent) {
                this.current = newCurrent;
            } else if (this.ready) {
                console.log('Loading fresh weather data!');
                this.$http.get(this.config.apiUri + 'weather', {
                    params: {
                        zip: this.config.zipCode,
                        units: this.config.units,
                        appid: this.config.apiKey
                    }
                }).then(response => {
                    if (response.body) {
                        const data = response.body;
                        this.current = {
                            'name': data.name,
                            'temp': Math.floor(data.main.temp),
                            'dt': moment(data.dt * 1000).format('h:mma'),
                            'description': data.weather[0].description || '',
                            'main': data.weather[0].main || '',
                            'icon': data.weather[0].icon || ''
                        };
                        store.set(CURRENTKEY, this.current, moment() + CURRENTEXPIRATION);
                    }
                }).catch(exception => {
                    console.error(exception);
                });
            }
            const newForecast = store.get(FORECASTKEY);
            if (newForecast) {
                this.forecast = newForecast;
            } else if (this.ready) {
                console.log('Loading fresh forecast data!');
                this.$http.get(this.config.apiUri + 'forecast', {
                    params: {
                        zip: this.config.zipCode,
                        units: this.config.units,
                        appid: this.config.apiKey
                    }
                }).then(response => {
                    if (response.body) {
                        this.forecast = response.body.list.map(day => {
                            return {
                                'dt': moment(day.dt * 1000).format('ddd M/D, ha'),
                                'temp': Math.floor(day.main.temp),
                                'description': day.weather[0].description,
                                'main': day.weather[0].main,
                                'icon': day.weather[0].icon
                            };
                        });
                        store.set(FORECASTKEY, this.forecast, moment() + FORECASTEXPIRATION);
                    }
                }).catch(exception => {
                    console.error(exception);
                });
            }
        }
    },
    mounted () {
        this.load();
        setInterval(this.load, CHECKINTERVAL);
    }
};
</script>

<style scoped>
.loadingIndicator {
    font-size: 5vh;
    text-align: center;
    margin-top: 33vh;
}
h1 {
    margin: 5vh 0 2vh;
    font-size: 7vh;
}
h2 {
    font-size: 5vh;
    margin: 0;
}
.cond img {
    height: 41vh;
    margin: -9vh 0 -9vh;
}
.temp {
    font-size: 12vh;
    margin: 3vh 0 0;
}
.asof {
    font-size: 2vh;
}
main {
    float: left;
    width: 40vw;
    height: 75vh;
    margin: 0 3vw;
    text-align: center;
    user-select: none;
}
table {
    width: 51vw;
}
table tbody {
    display: block;
    overflow-y: scroll;
    height: 75vh;
    user-select: none;
}
table td {
    padding-right: 1vw;
}
table img {
    margin: -7px 0 -11px 0;
}
::-webkit-scrollbar {
    width: 0px;
}
</style>
