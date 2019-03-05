import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './App.vue';
import ToggleButton from 'vue-js-toggle-button';
import Settings from './model/Settings';
import path from 'path';
import { remote } from 'electron';
import Speech from './util/Speech';

const APPDATADIR = remote.app.getPath('userData');
const SETTINGSPATH = path.join(APPDATADIR, 'state.json');
const TTSCACHEDIR = path.join(APPDATADIR, 'ttscache');

window.settings = new Settings(SETTINGSPATH);
window.speech = new Speech(window.settings.tts.uri, TTSCACHEDIR);

Vue.config.productionTip = false;
Vue.use(ToggleButton);
Vue.use(VueResource);

new Vue({
    render: h => h(App)
}).$mount('#app');
