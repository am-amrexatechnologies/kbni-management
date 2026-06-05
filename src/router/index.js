import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
  {
    path: '/',
    component: () => import('@/views/AppLayout.vue'),
    children: [
      { path: '',          redirect: '/dashboard' },
      { path: 'dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'users',     component: () => import('@/views/UsersView.vue')     },
      { path: 'anime',     component: () => import('@/views/AnimeView.vue')     },
      { path: 'characters',component: () => import('@/views/CharactersView.vue')},
      { path: 'chat',      component: () => import('@/views/ChatView.vue')      },
      { path: 'ratings',   component: () => import('@/views/RatingsView.vue')   },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) return '/login'
  if (to.path === '/login' && auth.isLoggedIn) return '/dashboard'
})

export default router
