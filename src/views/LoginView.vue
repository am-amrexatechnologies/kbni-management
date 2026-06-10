<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import * as api from '@/api'

const router = useRouter()
const auth   = useAuthStore()

const username = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = 'Bitte Username und Passwort eingeben.'
    return
  }
  loading.value = true
  error.value   = ''
  try {
    const res = await api.adminLogin(username.value, password.value)
    auth.setUser(res.user)
    router.push('/dashboard')
  } catch (e) {
    if (e.status === 403) {
      error.value = 'Kein Zugriff: Dein Account hat keine Admin-Berechtigung.'
    } else if (e.status === 401) {
      error.value = 'Falscher Username oder falsches Passwort.'
    } else {
      error.value = 'Anmeldung fehlgeschlagen: ' + e.message
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-screen">
    <div class="login-card">
      <div class="login-logo">
        <div class="login-logo-icon">🗄️</div>
        <h1>DB Admin Panel</h1>
        <p>Melde dich an, um fortzufahren.</p>
      </div>

      <div class="form-group">
        <label>Username</label>
        <input
          v-model="username"
          type="text"
          autocomplete="username"
          placeholder="Dein Username"
          @keydown.enter="handleLogin"
        />
      </div>

      <div class="form-group">
        <label>Passwort</label>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="Dein Passwort"
          @keydown.enter="handleLogin"
        />
      </div>

      <div v-if="error" class="login-error">{{ error }}</div>

      <button
        class="btn btn-primary"
        style="width:100%;justify-content:center;padding:11px"
        :disabled="loading"
        @click="handleLogin"
      >
        {{ loading ? 'Anmelden…' : 'Anmelden' }}
      </button>
    </div>
  </div>
</template>
