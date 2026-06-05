<script setup>
defineProps({ icon: String, color: String, value: [String, Number], label: String })
</script>

<template>
  <div class="stat-card">
    <div :class="['stat-icon', color]">{{ icon }}</div>
    <div class="stat-info">
      <div class="value">{{ value ?? '…' }}</div>
      <div class="label">{{ label }}</div>
    </div>
  </div>
</template>
