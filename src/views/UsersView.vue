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

// Modal
const showModal  = ref(false)
const modalMode  = ref('create')
const editingId  = ref(null)
const saving     = ref(false)
const form = ref({ username: '', email: '', password: '' })

// Confirm
const showConfirm  = ref(false)
const deletingItem = ref(null)

const columns = [
  { key: 'id',       label: 'ID'       },
  { key: 'username', label: 'Username' },
  { key: 'email',    label: 'E-Mail'   },
  { label: 'Aktionen', slot: 'actions' },
]

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return items.value
  return items.value.filter(r =>
    r.username.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
  )
})

async function load() {
  loading.value = true
  try { items.value = await api.getUsers() }
  catch (e) { toast('Fehler: ' + e.message, 'error') }
  finally { loading.value = false }
}

function openCreate() {
  modalMode.value = 'create'
  editingId.value = null
  form.value = { username: '', email: '', password: '' }
  showModal.value = true
}

function openEdit(row) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = { username: row.username, email: row.email, password: '' }
  showModal.value = true
}

async function save() {
  const { username, email, password } = form.value
  if (!username || !email || (modalMode.value === 'create' && !password)) {
    toast('Pflichtfelder ausfüllen.', 'error'); return
  }
  saving.value = true
  try {
    if (modalMode.value === 'edit') {
      const body = { username, email }
      if (password) body.password = password
      await api.updateUser(editingId.value, body)
      toast('User aktualisiert.', 'success')
    } else {
      await api.createUser({ username, email, password })
      toast('User erstellt.', 'success')
    }
    showModal.value = false
    load()
  } catch (e) { toast('Fehler: ' + e.message, 'error') }
  finally { saving.value = false }
}

function requestDelete(row) {
  deletingItem.value = row
  showConfirm.value  = true
}

async function confirmDelete() {
  try {
    await api.deleteUser(deletingItem.value.id)
    toast('User gelöscht.', 'success')
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
        <h1>Users</h1>
        <p>Benutzerkonten verwalten (ohne Passwort-Hash).</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">＋ Neuer User</button>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Alle Benutzer</h3>
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

    <!-- Create / Edit Modal -->
    <AppModal v-if="showModal" :title="modalMode === 'create' ? 'Neuen User erstellen' : 'User bearbeiten'" @close="showModal = false">
      <div class="form-group">
        <label>Username *</label>
        <input v-model="form.username" maxlength="16" placeholder="z.B. john_doe" />
      </div>
      <div class="form-group">
        <label>E-Mail *</label>
        <input v-model="form.email" type="email" maxlength="128" placeholder="z.B. john@example.com" />
      </div>
      <div class="form-group">
        <label>Passwort {{ modalMode === 'edit' ? '(leer lassen = unverändert)' : '*' }}</label>
        <input v-model="form.password" type="password" maxlength="256" placeholder="Passwort" />
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="showModal = false">Abbrechen</button>
        <button class="btn btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'Speichern…' : (modalMode === 'create' ? 'Erstellen' : 'Speichern') }}
        </button>
      </template>
    </AppModal>

    <!-- Confirm Delete -->
    <ConfirmDialog
      v-if="showConfirm"
      :label="deletingItem?.username"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>
