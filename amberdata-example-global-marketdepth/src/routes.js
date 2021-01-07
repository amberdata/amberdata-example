import Home from './views/Home.vue'
import About from './views/About.vue'
import NotFound from './views/NotFound.vue'

export let routes = [
  { path: '/', component: Home, meta: { title: 'Home' } },
  { path: '/about', component: About, meta: { title: 'About' } },
  { path: '/:path(.*)', component: NotFound }
]
