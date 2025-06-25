import { createRouter, createWebHistory } from 'vue-router'
import MapView from '../views/MapView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: MapView
        },
        {
            path: '/analysis',
            name: 'analysis',
            component: () => import('../views/Analysis.vue')
        },
        {
            path: '/statistics',
            name: 'statistics',
            component: () => import('../views/Statistics.vue')
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('../views/Settings.vue')
        }
    ]
})

export default router