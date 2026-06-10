import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(sessionStorage.getItem('admin_user') || 'null'))

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin    = computed(() => user.value?.role === 'admin')
  const initials   = computed(() => user.value?.username?.[0]?.toUpperCase() ?? '?')

  function setUser(u) {
    user.value = u
    sessionStorage.setItem('admin_user', JSON.stringify(u))
  }

  function clear() {
    user.value = null
    sessionStorage.removeItem('admin_user')
  }

  return { user, isLoggedIn, isAdmin, initials, setUser, clear }
})
