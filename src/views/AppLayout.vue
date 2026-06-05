<script setup>
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<template>
  <div class="app-shell">
    <AppSidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>
