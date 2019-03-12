<template>
    <div class="dailyscriptureContainer" v-html="content"></div>
</template>

<script>
import cheerio from 'cheerio';
const DATEKEY = 'piguardian.dailyscripture.date';
const CONTENTKEY = 'piguardian.dailyscripture.content';
export default {
    name: 'daily-scripture-screen',
    data () {
        return {
            content: 'Loading...'
        };
    },
    props: ['value'],
    computed: {
        uri () {
            return this.value.uri;
        }
    },
    mounted () {
        var date = new Date();
        var dateFmt = date.getFullYear() + '/' + date.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric'
        });
        if (localStorage[DATEKEY] === dateFmt && localStorage[CONTENTKEY]) {
            this.content = localStorage[CONTENTKEY];
        } else {
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
    padding: 5vh 0 3vh;
}
.dailyscriptureContainer a {
    pointer-events: none;
    cursor: default;
    color: white;
    text-decoration: none;
}
</style>
