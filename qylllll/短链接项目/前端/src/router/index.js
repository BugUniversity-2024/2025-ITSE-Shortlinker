import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 导入页面组件
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'
import LinkGenerator from '@/views/LinkGenerator.vue'
import Analytics from '@/views/Analytics.vue'
import Profile from '@/views/Profile.vue'
import ManageLinks from '@/views/ManageLinks.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresGuest: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/links',
    name: 'DashboardLinks',
    component: ManageLinks,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/analytics',
    name: 'DashboardAnalytics',
    component: Analytics,
    meta: { requiresAuth: true }
  },
  {
    path: '/generator',
    name: 'LinkGenerator',
    component: LinkGenerator,
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/:shortCode',
    name: 'Redirect',
    component: () => import('@/views/Redirect.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  console.log('路由守卫检查:', {
    to: to.path,
    from: from.path,
    isAuthenticated: authStore.isAuthenticated,
    token: !!authStore.token,
    storedToken: !!localStorage.getItem('auth_token'),
    requiresAuth: to.meta.requiresAuth,
    requiresGuest: to.meta.requiresGuest
  })
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('需要登录，重定向到登录页面')
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    console.log('已登录用户访问guest页面，重定向到dashboard')
    next('/dashboard')
  } else {
    console.log('路由守卫通过')
    next()
  }
})

export default router