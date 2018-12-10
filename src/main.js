import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './App.vue';
import ToggleButton from 'vue-js-toggle-button';
import Settings from './model/Settings';
import path from 'path';
import { remote } from 'electron';

const APPDATADIR = remote.app.getPath('userData');
const SETTINGSPATH = path.join(APPDATADIR, 'state.json');

window.settings = new Settings(SETTINGSPATH);

Vue.config.productionTip = false;
Vue.use(ToggleButton);
Vue.use(VueResource);

new Vue({
    render: h => h(App)
}).$mount('#app');
