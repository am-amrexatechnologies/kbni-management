<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import * as api from '@/api'

const router   = useRouter()
const auth     = useAuthStore()

const navItems = [
  { path: '/dashboard',  icon: '📊', label: 'Dashboard'         },
  { path: '/users',      icon: '👤', label: 'Users'             },
  { path: '/anime',      icon: '🎌', label: 'Anime'             },
  { path: '/characters', icon: '🦸', label: 'Anime Characters'  },
  { path: '/chat',       icon: '💬', label: 'Chat'              },
  { path: '/ratings',    icon: '⭐', label: 'Character Ratings' },
]

async function handleLogout() {
  try { await api.logout() } catch {}
  auth.clear()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>🗄️ DB Admin</h2>
      <p>Turso Database Panel</p>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-label">Übersicht</div>
      <router-link
        v-for="item in navItems.slice(0,1)" :key="item.path"
        :to="item.path" custom v-slot="{ navigate, isActive }"
      >
        <button :class="['nav-item', { active: isActive }]" @click="navigate">
          <span class="icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </button>
      </router-link>

      <div class="nav-section-label">Tabellen</div>
      <router-link
        v-for="item in navItems.slice(1)" :key="item.path"
        :to="item.path" custom v-slot="{ navigate, isActive }"
      >
        <button :class="['nav-item', { active: isActive }]" @click="navigate">
          <span class="icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </button>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="user-chip">
        <div class="avatar">{{ auth.initials }}</div>
        <div class="info">
          <div class="name">{{ auth.user?.username }}</div>
          <div class="role">Admin</div>
        </div>
      </div>
      <button class="nav-item" style="margin-top:4px" @click="handleLogout">
        <span class="icon">🚪</span><span>Logout</span>
      </button>
    </div>
  </aside>
</template>
