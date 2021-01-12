import { createApp } from 'vue'
import { createStore } from 'vuex'
import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import './tailwind.css'
import App from './App.vue'
import { routes } from './routes.js'
import storage from './store'
import web3data from './utils/web3data'
import OrderBook from './utils/orderbook'

let app = createApp(App)

const store = createStore(storage)

let router = createRouter({
  history: createWebHistory(),
  routes: import.meta.hot ? [] : routes,
})

if (import.meta.hot) {
  let removeRoutes = []

  for (let route of routes) {
    removeRoutes.push(router.addRoute(route))
  }

  import.meta.hot.accept('./routes.js', ({ routes }) => {
    for (let removeRoute of removeRoutes) removeRoute()
    removeRoutes = []
    for (let route of routes) {
      removeRoutes.push(router.addRoute(route))
    }
    router.replace('')
  })
}

app.use(router)
app.use(store)
app.use(VueAxios, axios)
app.use(web3data, store)
app.use(OrderBook)

app.mount('#app')
