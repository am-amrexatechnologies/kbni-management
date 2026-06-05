<script setup>
import { ref, computed, onMounted } from 'vue'
import DataTable    from '@/components/DataTable.vue'
import AppModal     from '@/components/AppModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useToast } from '@/composables/useToast'
import * as api from '@/api'

const { toast } = useToast()

const items   = ref([])
const loading = ref(false)
const search  = ref('')
const showModal  = ref(false)
const modalMode  = ref('create')
const editingKey = ref(null) // { userId, charId }
const saving     = ref(false)
const form = ref({ user_id: '', character_id: '', rating: '' })
const showConfirm  = ref(false)
const deletingItem = ref(null)

function stars(n) {
  n = Math.max(0, Math.min(Number(n), 5))
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

const columns = [
  { key: 'user_id',      label: 'User-ID'            },
  { key: 'character_id', label: 'Charakter-ID'       },
  { label: 'Rating',       slot: 'rating'            },
  { key: 'updated_at',   label: 'Aktualisiert am'    },
  { label: 'Aktionen',     slot: 'actions'           },
]

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return items.value
  return items.value.filter(r =>
    String(r.user_id).includes(q) || String(r.character_id).includes(q)
  )
})

async function load() {
  loading.value = true
  try { items.value = await api.getRatings() }
  catch (e) { toast('Fehler: ' + e.message, 'error') }
  finally { loading.value = false }
}

function openCreate() {
  modalMode.value = 'create'
  editingKey.value = null
  form.value = { user_id: '', character_id: '', rating: '' }
  showModal.value = true
}

function openEdit(row) {
  modalMode.value = 'edit'
  editingKey.value = { userId: row.user_id, charId: row.character_id }
  form.value = { user_id: row.user_id, character_id: row.character_id, rating: row.rating }
  showModal.value = true
}

async function save() {
  const rating = Number(form.value.rating)
  if (!rating || rating < 1 || rating > 5) {
    toast('Rating muss zwischen 1 und 5 liegen.', 'error'); return
  }
  saving.value = true
  try {
    if (modalMode.value === 'edit') {
      await api.updateRating(editingKey.value.userId, editingKey.value.charId, { rating })
      toast('Rating aktualisiert.', 'success')
    } else {
      if (!form.value.user_id || !form.value.character_id) {
        toast('User-ID und Charakter-ID sind Pflichtfelder.', 'error')
        saving.value = false; return
      }
      await api.upsertRating({
        user_id:      Number(form.value.user_id),
        character_id: Number(form.value.character_id),
        rating,
      })
      toast('Rating gespeichert.', 'success')
    }
    showModal.value = false
    load()
  } catch (e) { toast('Fehler: ' + e.message, 'error') }
  finally { saving.value = false }
}

function requestDelete(row) { deletingItem.value = row; showConfirm.value = true }

async function confirmDelete() {
  try {
    await api.deleteRating(deletingItem.value.user_id, deletingItem.value.character_id)
    toast('Rating gelöscht.', 'success')
    showConfirm.value = false
    load()
  } catch (e) { toast('Fehler: ' + e.message, 'error') }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1>Character Ratings</h1>
        <p>Charakter-Bewertungen (1–5 Sterne) verwalten.</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">＋ Neues Rating</button>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Alle Bewertungen</h3>
        <div class="search-bar">
          <input v-model="search" type="search" placeholder="User-ID oder Charakter-ID…" />
          <button class="btn btn-ghost btn-sm" @click="load">🔄</button>
        </div>
      </div>
      <DataTable :columns="columns" :rows="filtered" :loading="loading">
        <template #rating="{ row }">
          <span style="color:#f59e0b;letter-spacing:1px" :title="`${row.rating}/5`">{{ stars(row.rating) }}</span>
          <span style="color:var(--text-muted);font-size:.8rem;margin-left:6px">{{ row.rating }}/5</span>
        </template>
        <template #actions="{ row }">
          <div class="actions-cell">
            <button class="btn btn-icon edit"   @click="openEdit(row)"      title="Bearbeiten">✏️</button>
            <button class="btn btn-icon delete" @click="requestDelete(row)" title="Löschen">🗑️</button>
          </div>
        </template>
      </DataTable>
    </div>

    <AppModal
      v-if="showModal"
      :title="modalMode === 'create' ? 'Neues Rating erstellen' : 'Rating bearbeiten'"
      @close="showModal = false"
    >
      <div class="form-row">
        <div class="form-group">
          <label>User-ID *</label>
          <input v-model="form.user_id" type="number" :disabled="modalMode === 'edit'" placeholder="User-ID" />
        </div>
        <div class="form-group">
          <label>Charakter-ID *</label>
          <input v-model="form.character_id" type="number" :disabled="modalMode === 'edit'" placeholder="Charakter-ID" />
        </div>
      </div>
      <div class="form-group">
        <label>Rating * (1–5)</label>
        <input v-model="form.rating" type="number" min="1" max="5" placeholder="1 bis 5" />
        <p class="form-hint">1 = sehr schlecht · 5 = ausgezeichnet</p>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="showModal = false">Abbrechen</button>
        <button class="btn btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'Speichern…' : (modalMode === 'create' ? 'Erstellen' : 'Speichern') }}
        </button>
      </template>
    </AppModal>

    <ConfirmDialog
      v-if="showConfirm"
      :label="`Rating von User ${deletingItem?.user_id} für Charakter ${deletingItem?.character_id}`"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>
