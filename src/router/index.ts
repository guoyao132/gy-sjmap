import { createRouter, createWebHistory } from 'vue-router'
import {GyMapRouter, GySjmapRouter} from '../docs'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/GyHome.vue'),
    },
    {
      path: '/gysjmap',
      name: 'GySjmap',
      redirect: {name: 'U-Gy-GySjmap-Install'},
      component: () => import('@/views/GySjmap.vue'),
      children: GySjmapRouter,
    },
  ]
})

export default router
