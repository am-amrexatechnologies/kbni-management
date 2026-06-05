import { reactive } from 'vue'

const toasts = reactive([])

export function useToast() {
  function toast(message, type = 'info') {
    const id = Date.now() + Math.random()
    toasts.push({ id, message, type })
    setTimeout(() => {
      const idx = toasts.findIndex(t => t.id === id)
      if (idx !== -1) toasts.splice(idx, 1)
    }, 3500)
  }
  return { toasts, toast }
}
