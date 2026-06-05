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
const editingId  = ref(null)
const saving     = ref(false)
const form = ref({ id: '', animename: '' })
const showConfirm  = ref(false)
const deletingItem = ref(null)

const columns = [
  { key: 'id',        label: 'ID'         },
  { key: 'animename', label: 'Anime-Name' },
  { label: 'Aktionen', slot: 'actions'   },
]

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return items.value
  return items.value.filter(r =>
    String(r.id).includes(q) || r.animename.toLowerCase().includes(q)
  )
})

async function load() {
  loading.value = true
  try { items.value = await api.getAnime() }
  catch (e) { toast('Fehler: ' + e.message, 'error') }
  finally { loading.value = false }
}

function openCreate() {
  modalMode.value = 'create'
  editingId.value = null
  form.value = { id: '', animename: '' }
  showModal.value = true
}

function openEdit(row) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = { id: row.id, animename: row.animename }
  showModal.value = true
}

async function save() {
  if (!form.value.animename.trim()) {
    toast('Anime-Name ist erforderlich.', 'error'); return
  }
  saving.value = true
  try {
    if (modalMode.value === 'edit') {
      await api.updateAnime(editingId.value, { animename: form.value.animename })
      toast('Anime aktualisiert.', 'success')
    } else {
      const body = { animename: form.value.animename }
      if (form.value.id) body.id = Number(form.value.id)
      await api.createAnime(body)
      toast('Anime erstellt.', 'success')
    }
    showModal.value = false
    load()
  } catch (e) { toast('Fehler: ' + e.message, 'error') }
  finally { saving.value = false }
}

function requestDelete(row) { deletingItem.value = row; showConfirm.value = true }

async function confirmDelete() {
  try {
    await api.deleteAnime(deletingItem.value.id)
    toast('Anime gelöscht.', 'success')
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
        <h1>Anime</h1>
        <p>Anime-Einträge verwalten.</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">＋ Neuer Anime</button>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Alle Anime</h3>
        <div class="search-bar">
          <input v-model="search" type="search" placeholder="Suchen…" />
          <button class="btn btn-ghost btn-sm" @click="load">🔄</button>
        </div>
      </div>
      <DataTable :columns="columns" :rows="filtered" :loading="loading">
        <template #actions="{ row }">
          <div class="actions-cell">
            <button class="btn btn-icon edit"   @click="openEdit(row)"      title="Bearbeiten">✏️</button>
            <button class="btn btn-icon delete" @click="requestDelete(row)" title="Löschen">🗑️</button>
          </div>
        </template>
      </DataTable>
    </div>

    <AppModal v-if="showModal" :title="modalMode === 'create' ? 'Neuen Anime erstellen' : 'Anime bearbeiten'" @close="showModal = false">
      <div v-if="modalMode === 'create'" class="form-group">
        <label>ID <span style="color:var(--text-muted);font-weight:400">(optional, leer = auto)</span></label>
        <input v-model="form.id" type="number" placeholder="z.B. 101" />
      </div>
      <div class="form-group">
        <label>Anime-Name *</label>
        <input v-model="form.animename" placeholder="z.B. Naruto" />
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
      :label="deletingItem?.animename"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>
