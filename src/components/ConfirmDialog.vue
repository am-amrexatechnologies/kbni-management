<script setup>
defineProps({ label: String })
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <AppModal title="Löschen bestätigen" @close="emit('cancel')">
    <p class="confirm-text">
      Soll <strong>{{ label }}</strong> wirklich gelöscht werden?
      Diese Aktion kann nicht rückgängig gemacht werden.
    </p>
    <template #footer>
      <button class="btn btn-ghost" @click="emit('cancel')">Abbrechen</button>
      <button class="btn btn-danger" @click="emit('confirm')">Löschen</button>
    </template>
  </AppModal>
</template>

<script>
import AppModal from './AppModal.vue'
export default { components: { AppModal } }
</script>
