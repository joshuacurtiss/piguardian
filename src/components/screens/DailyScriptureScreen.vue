<template>
    <div class="dailyscriptureContainer" v-html="content"></div>
</template>

<script>
import cheerio from 'cheerio';
import moment from 'moment';
const DATEKEY = 'piguardian.dailyscripture.date';
const CONTENTKEY = 'piguardian.dailyscripture.content';
export default {
    name: 'daily-scripture-screen',
    data () {
        return {
            content: 'Loading...',
            timer: null
        };
    },
    props: {
        value: {
            type: Object,
            default: function () {}
        }
    },
    computed: {
        uri () {
            return this.value.uri || 'https://wol.jw.org/en/wol/dt/r1/lp-e/';
        }
    },
    methods: {
        check () {
            console.log('Checking Daily Scripture...');
            const bufferms = 1500;
            const dateFmt = moment().format('YYYY/M/D');
            const timeToTomorrow = moment().endOf('day').valueOf() - moment().valueOf() + bufferms;
            clearTimeout(this.timer);
            this.timer = setTimeout(this.check, timeToTomorrow);
            if (localStorage[DATEKEY] === dateFmt && localStorage[CONTENTKEY]) {
                this.content = localStorage[CONTENTKEY];
            } else {
                this.download(dateFmt);
            }
        },
        download (dateFmt) {
            console.log('Download the Daily Scripture...');
            this.$http.get(this.uri + dateFmt).then(response => {
                if (response.body) {
                    const $ = cheerio.load(response.body);
                    this.content = $('.itemData').html();
                    localStorage[DATEKEY] = dateFmt;
                    localStorage[CONTENTKEY] = this.content;
                }
            }).catch((exception) => {
                console.error(exception);
            });
        }
    },
    mounted () {
        this.check();
    }
};
</script>

<style>
.dailyscriptureContainer {
    font-size: 1.1em;
    padding: 0 8vw;
}
.dailyscriptureContainer header {
    display: none;
}
.dailyscriptureContainer .themeScrp {
    padding: 3vh 0;
}
.dailyscriptureContainer a {
    pointer-events: none;
    cursor: default;
    color: white;
    text-decoration: none;
}
</style>
