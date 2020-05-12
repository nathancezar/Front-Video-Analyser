import Vue from 'vue'
import axios from 'axios'
import Buefy from 'buefy'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import App from './App'
import router from './router'
import store from './store'
import pyComm from './pyComm'

// import bulma
import 'bulma/css/bulma.css'
import 'buefy/dist/buefy.css'

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.use(Buefy, {
  defaultIconComponent: 'font-awesome-icon',
  defaultIconPack: 'fas'
})

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.prototype.$PyComm = pyComm

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
