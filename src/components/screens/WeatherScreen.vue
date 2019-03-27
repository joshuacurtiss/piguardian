<template>
    <div class="weatherContainer">
        <main>
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
store.addPlugin(expirePlugin);
const FORECASTKEY = 'piguardian.weather.forecast';
const CURRENTKEY = 'piguardian.weather.current';
const CURRENTEXPIRATION = 10 * 60 * 1000; // 10min
const FORECASTEXPIRATION = 6 * 60 * 60 * 1000; // 6hr
export default {
    name: 'weather-screen',
    components: {},
    data () {
        return {
            config: Object.assign({
                'apiKey': null,
                'apiUri': 'https://api.openweathermap.org/data/2.5/',
                'iconUri': 'https://openweathermap.org/img/w/',
                'units': 'imperial',
                'zipCode': null
            }, this.value),
            current: {
                'name': 'No data!',
                'temp': 0,
                'dt': 'never',
                'description': '',
                'main': '',
                'icon': ''
            },
            forecast: []
        };
    },
    props: [
        'value'
    ],
    watch: {
        value (newvalue) {
            Object.assign(this.config, newvalue);
            this.load();
        }
    },
    computed: {
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
        setInterval(this.load, 60006);
    }
};
</script>

<style scoped>
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
