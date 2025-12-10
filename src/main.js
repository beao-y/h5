import Vue from 'vue'
import App from './App.vue'
import 'normalize.css/normalize.css'
import router from './router'
import store from './store'
import Vant from 'vant'
import 'vant/lib/index.css'
import dayjs from 'dayjs'
import './style/app.css'
Vue.prototype.$dayjs = dayjs

// import './permission'

Vue.use(Vant)


Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
