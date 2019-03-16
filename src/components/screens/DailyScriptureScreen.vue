<template>
    <div class="dailyscriptureContainer">
        <font-awesome-icon
            icon="volume-up"
            :mask="['fas', 'comment']"
            transform="shrink-8 left-0.3 up-0.5"
            v-show='ready'
            @click="read"
        />
        <div v-show='!ready' class='loadingIndicator'>
            <font-awesome-icon
                icon="circle-notch"
                transform="left-3"
                spin
            />
            Loading...
        </div>
        <p class="themeScrp" v-html="themeScrp" ref="themeScrp" />
        <div v-html="content" ref="content" />
    </div>
</template>

<script>
import cheerio from 'cheerio';
import moment from 'moment';
import ScriptureUtil from 'scripture';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faVolumeUp, faCircleNotch, faComment } from '@fortawesome/free-solid-svg-icons';
library.add(faVolumeUp, faCircleNotch, faComment);
const DATEKEY = 'piguardian.dailyscripture.date';
const SCRPKEY = 'piguardian.dailyscripture.themescrp';
const CONTENTKEY = 'piguardian.dailyscripture.content';
export default {
    name: 'daily-scripture-screen',
    components: {
        FontAwesomeIcon
    },
    data () {
        return {
            themeScrp: null,
            content: null,
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
        ready () {
            return this.themeScrp && this.content;
        },
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
            if (localStorage[DATEKEY] === dateFmt && localStorage[CONTENTKEY] && localStorage[SCRPKEY]) {
                this.themeScrp = localStorage[SCRPKEY];
                this.content = localStorage[CONTENTKEY];
            } else {
                this.download(dateFmt);
            }
        },
        convertReadable (content) {
            // Put spaces around dashes
            content = content.replace(/[—-]/g, ' $& ');
            // Pause for parentheses
            content = content.replace(/[)(]/g, ' . ');
            // Find scriptures and sub out their full version
            const util = new ScriptureUtil();
            let scriptures = util.parseScripturesWithIndex(content);
            scriptures.reverse(); // Always process results in reverse when modifying strings
            scriptures.forEach(scripture => {
                content = content.substring(0, scripture.index) +
                    scripture.obj.toString() +
                    content.substring(scripture.index + scripture.match.length);
            });
            return content;
        },
        download (dateFmt) {
            console.log('Download the Daily Scripture...');
            this.$http.get(this.uri + dateFmt).then(response => {
                if (response.body) {
                    const $ = cheerio.load(response.body);
                    this.themeScrp = $('.themeScrp').html().trim();
                    this.content = $('.bodyTxt').html().trim();
                    localStorage[DATEKEY] = dateFmt;
                    localStorage[CONTENTKEY] = this.content;
                    localStorage[SCRPKEY] = this.themeScrp;
                }
            }).catch((exception) => {
                console.error(exception);
            });
        },
        read () {
            const themeScrp = this.convertReadable(this.$refs.themeScrp.textContent.trim());
            const content = this.convertReadable(this.$refs.content.textContent.trim());
            window.speech.speak(
                'Daily text for ' +
                moment(localStorage[DATEKEY]).format('dddd, MMMM Do. ') +
                'Theme scripture. ' +
                themeScrp + ' ' + content
            );
        }
    },
    mounted () {
        this.check();
    }
};
</script>

<style scoped>
.loadingIndicator {
    font-size: 5vh;
    text-align: center;
    margin-top: 33vh;
}
.dailyscriptureContainer {
    font-size: 1.1em;
    padding: 0 8vw;
}
.dailyscriptureContainer .themeScrp {
    padding: 3vh 0 1vh;
}
.dailyscriptureContainer > svg {
    float:right;
    cursor: pointer;
    margin: 3vh -5vw 0 3vw;
    font-size: 10vh;
}
</style>
<style>
.dailyscriptureContainer a {
    pointer-events: none;
    cursor: default;
    color: white;
    text-decoration: none;
}
</style>
