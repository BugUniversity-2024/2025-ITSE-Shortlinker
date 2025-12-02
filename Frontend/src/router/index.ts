import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 页面组件
import HomePage from '@/views/home/HomePage.vue'
import LoginPage from '@/views/auth/LoginPage.vue'
import RegisterPage from '@/views/auth/RegisterPage.vue'
import DashboardPage from '@/views/dashboard/DashboardPage.vue'
import LinkListPage from '@/views/links/LinkListPage.vue'
import LinkCreatePage from '@/views/links/LinkCreatePage.vue'
import LinkDetailPage from '@/views/links/LinkDetailPage.vue'
import AnalyticsPage from '@/views/analytics/AnalyticsPage.vue'
import ProfilePage from '@/views/settings/ProfilePage.vue'
import TeamListPage from '@/views/teams/TeamListPage.vue'
import LandingPageEditor from '@/views/landing-pages/LandingPageEditor.vue'

const routes: RouteRecordRaw[] = [
  // 公开页面
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { requiresGuest: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresGuest: true }
  },

  // 需要认证的页面
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/links',
    name: 'LinkList',
    component: LinkListPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/analytics',
    name: 'Analytics',
    component: AnalyticsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/teams',
    name: 'Teams',
    component: TeamListPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/generator',
    name: 'LinkGenerator',
    component: LinkCreatePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },

  // 链接详情页
  {
    path: '/dashboard/links/:id',
    name: 'LinkDetail',
    component: LinkDetailPage,
    meta: { requiresAuth: true },
    props: true
  },

  // 落地页编辑
  {
    path: '/links/:id/landing',
    name: 'LandingPageEditor',
    component: LandingPageEditor,
    meta: { requiresAuth: true },
    props: true
  },

  // 短链接重定向（放在最后，作为兜底路由）
  {
    path: '/:shortCode',
    name: 'Redirect',
    component: () => import('@/views/redirect/RedirectPage.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  // 需要认证但未登录
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 已登录用户访问 guest 页面（如登录页）
  if (to.meta.requiresGuest && userStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  next()
})

export default router

// 类型声明
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresGuest?: boolean
  }
}
