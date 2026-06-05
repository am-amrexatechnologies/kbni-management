<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StatCard from '@/components/StatCard.vue'
import * as api from '@/api'

const router = useRouter()
const stats  = ref({ users: null, anime: null, characters: null, chat: null, ratings: null })

onMounted(async () => {
  try {
    const [users, anime, chars, chat, ratings] = await Promise.all([
      api.getUsers(), api.getAnime(), api.getCharacters(), api.getChat(), api.getRatings()
    ])
    stats.value = {
      users:      users.length,
      anime:      anime.length,
      characters: chars.length,
      chat:       chat.length,
      ratings:    ratings.length,
    }
  } catch {}
})

const cards = [
  { key: 'users',      icon: '👤', color: 'blue',   label: 'Users',              route: '/users'      },
  { key: 'anime',      icon: '🎌', color: 'orange',  label: 'Anime',              route: '/anime'      },
  { key: 'characters', icon: '🦸', color: 'green',   label: 'Characters',         route: '/characters' },
  { key: 'chat',       icon: '💬', color: 'pink',    label: 'Chatnachrichten',    route: '/chat'       },
  { key: 'ratings',    icon: '⭐', color: 'teal',    label: 'Character Ratings',  route: '/ratings'    },
]
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Übersicht über alle Tabellen in der Turso-Datenbank.</p>
      </div>
    </div>

    <div class="stats-grid">
      <StatCard
        v-for="c in cards" :key="c.key"
        :icon="c.icon" :color="c.color"
        :value="stats[c.key]" :label="c.label"
      />
    </div>

    <div class="card">
      <div class="card-header"><h3>Schnellnavigation</h3></div>
      <div class="quick-nav">
        <button
          v-for="c in cards" :key="c.key"
          class="btn btn-ghost"
          style="justify-content:center;padding:14px"
          @click="router.push(c.route)"
        >
          {{ c.icon }} {{ c.label }} verwalten
        </button>
      </div>
    </div>
  </div>
</template>
