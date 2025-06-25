import { createRouter, createWebHistory } from 'vue-router';
import { getCurrentUser } from '../utils/auth';
import MainLayout from '../layouts/MainLayout.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: { title: '数据总览' }
      },
      {
        path: 'map',
        name: 'Map',
        component: () => import('../views/Map.vue'),
        meta: { title: '地图展示' }
      },
      {
        path: 'analysis',
        name: 'Analysis',
        component: () => import('../views/Analysis.vue'),
        meta: { title: '数据分析' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue'),
        meta: { title: '系统设置' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: { title: '个人信息' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 导航守卫
router.beforeEach((to, from, next) => {
  const user = getCurrentUser();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !user) {
    next('/login');
  } else if (to.path === '/login' && user) {
    next('/');
  } else {
    next();
  }
});

export default router;