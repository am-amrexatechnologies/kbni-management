<script setup>
import { ref, computed, onMounted } from 'vue'
import DataTable    from '@/components/DataTable.vue'
import AppModal     from '@/components/AppModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useToast } from '@/composables/useToast'
import * as api from '@/api'

const { toast } = useToast()

const items     = ref([])
const animeList = ref([])
const loading   = ref(false)
const search    = ref('')
const showModal  = ref(false)
const modalMode  = ref('create')
const editingId  = ref(null)
const saving     = ref(false)
const form = ref({ name: '', lastname: '', age: '', animeid: '' })
const showConfirm  = ref(false)
const deletingItem = ref(null)

const columns = [
  { key: 'id',       label: 'ID'       },
  { key: 'name',     label: 'Vorname'  },
  { key: 'lastname', label: 'Nachname' },
  { key: 'age',      label: 'Alter'    },
  { label: 'Anime',    slot: 'anime'   },
  { label: 'Aktionen', slot: 'actions' },
]

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return items.value
  return items.value.filter(r =>
    (r.name ?? '').toLowerCase().includes(q) ||
    (r.lastname ?? '').toLowerCase().includes(q)
  )
})

function animeName(id) {
  return animeList.value.find(a => a.id === id)?.animename ?? null
}

async function load() {
  loading.value = true
  try {
    [items.value, animeList.value] = await Promise.all([
      api.getCharacters(), api.getAnime()
    ])
  } catch (e) { toast('Fehler: ' + e.message, 'error') }
  finally { loading.value = false }
}

function openCreate() {
  modalMode.value = 'create'
  editingId.value = null
  form.value = { name: '', lastname: '', age: '', animeid: '' }
  showModal.value = true
}

function openEdit(row) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = {
    name:     row.name     ?? '',
    lastname: row.lastname ?? '',
    age:      row.age      ?? '',
    animeid:  row.animeid  ?? '',
  }
  showModal.value = true
}

async function save() {
  saving.value = true
  const body = {
    name:     form.value.name     || null,
    lastname: form.value.lastname || null,
    age:      form.value.age      ? Number(form.value.age)     : null,
    animeid:  form.value.animeid  ? Number(form.value.animeid) : null,
  }
  try {
    if (modalMode.value === 'edit') {
      await api.updateCharacter(editingId.value, body)
      toast('Charakter aktualisiert.', 'success')
    } else {
      await api.createCharacter(body)
      toast('Charakter erstellt.', 'success')
    }
    showModal.value = false
    load()
  } catch (e) { toast('Fehler: ' + e.message, 'error') }
  finally { saving.value = false }
}

function requestDelete(row) { deletingItem.value = row; showConfirm.value = true }

async function confirmDelete() {
  try {
    await api.deleteCharacter(deletingItem.value.id)
    toast('Charakter gelöscht.', 'success')
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
        <h1>Anime Characters</h1>
        <p>Anime-Charaktere verwalten inkl. Anime-Zuordnung.</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">＋ Neuer Charakter</button>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Alle Charaktere</h3>
        <div class="search-bar">
          <input v-model="search" type="search" placeholder="Name suchen…" />
          <button class="btn btn-ghost btn-sm" @click="load">🔄</button>
        </div>
      </div>
      <DataTable :columns="columns" :rows="filtered" :loading="loading">
        <template #anime="{ row }">
          <span v-if="animeName(row.animeid)" class="badge badge-blue">{{ animeName(row.animeid) }}</span>
          <span v-else-if="row.animeid" style="color:var(--text-muted)">ID {{ row.animeid }}</span>
          <span v-else style="color:var(--text-muted)">—</span>
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
      :title="modalMode === 'create' ? 'Neuen Charakter erstellen' : 'Charakter bearbeiten'"
      @close="showModal = false"
    >
      <div class="form-row">
        <div class="form-group">
          <label>Vorname</label>
          <input v-model="form.name" placeholder="z.B. Naruto" />
        </div>
        <div class="form-group">
          <label>Nachname</label>
          <input v-model="form.lastname" placeholder="z.B. Uzumaki" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Alter</label>
          <input v-model="form.age" type="number" placeholder="z.B. 16" />
        </div>
        <div class="form-group">
          <label>Anime</label>
          <select v-model="form.animeid">
            <option value="">— keiner —</option>
            <option v-for="a in animeList" :key="a.id" :value="a.id">
              {{ a.animename }}
            </option>
          </select>
        </div>
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
      :label="`${deletingItem?.name ?? ''} ${deletingItem?.lastname ?? ''}`.trim() || `Charakter #${deletingItem?.id}`"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>
