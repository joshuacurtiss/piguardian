import Vue from 'vue';
import VueResource from 'vue-resource';
import App from './App.vue';
import ToggleButton from 'vue-js-toggle-button';

Vue.config.productionTip = false;
Vue.use(ToggleButton);
Vue.use(VueResource);

new Vue({
    render: h => h(App)
}).$mount('#app');
