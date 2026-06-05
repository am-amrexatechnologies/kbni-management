<script setup>
import { useToast } from '@/composables/useToast'
const { toasts } = useToast()
const icons = { success: '✓', error: '✗', info: 'ℹ' }
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" :class="['toast', t.type]">
        <span>{{ icons[t.type] }}</span>
        <span>{{ t.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>
