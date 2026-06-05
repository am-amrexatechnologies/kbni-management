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
const form = ref({ username: '', text: '', type: '', timeposted: '' })
const showConfirm  = ref(false)
const deletingItem = ref(null)

const typeColors = { message: 'badge-blue', system: 'badge-orange', info: 'badge-green' }

const columns = [
  { key: 'id',         label: 'ID'         },
  { key: 'username',   label: 'Username'   },
  { label: 'Text',       slot: 'text'      },
  { label: 'Typ',        slot: 'type'      },
  { key: 'timeposted', label: 'Gepostet am'},
  { label: 'Aktionen',   slot: 'actions'   },
]

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return items.value
  return items.value.filter(r =>
    r.username.toLowerCase().includes(q) ||
    (r.text ?? '').toLowerCase().includes(q) ||
    (r.type ?? '').toLowerCase().includes(q)
  )
})

async function load() {
  loading.value = true
  try { items.value = await api.getChat() }
  catch (e) { toast('Fehler: ' + e.message, 'error') }
  finally { loading.value = false }
}

function openCreate() {
  modalMode.value = 'create'
  editingId.value = null
  form.value = { username: '', text: '', type: '', timeposted: new Date().toISOString() }
  showModal.value = true
}

function openEdit(row) {
  modalMode.value = 'edit'
  editingId.value = row.id
  form.value = { username: row.username, text: row.text ?? '', type: row.type ?? '', timeposted: row.timeposted }
  showModal.value = true
}

async function save() {
  saving.value = true
  try {
    if (modalMode.value === 'edit') {
      await api.updateChat(editingId.value, {
        text: form.value.text || null,
        type: form.value.type || null,
      })
      toast('Nachricht aktualisiert.', 'success')
    } else {
      if (!form.value.username || !form.value.timeposted) {
        toast('Username und Zeitstempel sind Pflichtfelder.', 'error')
        saving.value = false; return
      }
      await api.createChat({
        username:   form.value.username,
        text:       form.value.text       || null,
        type:       form.value.type       || null,
        timeposted: form.value.timeposted,
      })
      toast('Nachricht erstellt.', 'success')
    }
    showModal.value = false
    load()
  } catch (e) { toast('Fehler: ' + e.message, 'error') }
  finally { saving.value = false }
}

function requestDelete(row) { deletingItem.value = row; showConfirm.value = true }

async function confirmDelete() {
  try {
    await api.deleteChat(deletingItem.value.id)
    toast('Nachricht gelöscht.', 'success')
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
        <h1>Chat</h1>
        <p>Chatnachrichten lesen, erstellen und moderieren.</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">＋ Neue Nachricht</button>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>Alle Nachrichten</h3>
        <div class="search-bar">
          <input v-model="search" type="search" placeholder="Suchen…" />
          <button class="btn btn-ghost btn-sm" @click="load">🔄</button>
        </div>
      </div>
      <DataTable :columns="columns" :rows="filtered" :loading="loading">
        <template #text="{ row }">
          <span :title="row.text">{{ (row.text ?? '').slice(0, 60) }}{{ (row.text ?? '').length > 60 ? '…' : '' }}</span>
        </template>
        <template #type="{ row }">
          <span v-if="row.type" :class="['badge', typeColors[row.type] ?? 'badge-gray']">{{ row.type }}</span>
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
      :title="modalMode === 'create' ? 'Neue Nachricht erstellen' : 'Nachricht bearbeiten'"
      @close="showModal = false"
    >
      <div class="form-group">
        <label>Username *</label>
        <input v-model="form.username" maxlength="16" :disabled="modalMode === 'edit'" placeholder="z.B. john_doe" />
      </div>
      <div class="form-group">
        <label>Text</label>
        <textarea v-model="form.text" maxlength="512" placeholder="Nachrichteninhalt…" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Typ</label>
          <select v-model="form.type">
            <option value="">— kein Typ —</option>
            <option value="message">message</option>
            <option value="system">system</option>
            <option value="info">info</option>
          </select>
        </div>
        <div v-if="modalMode === 'create'" class="form-group">
          <label>Zeitstempel *</label>
          <input v-model="form.timeposted" placeholder="ISO-8601 Zeitstempel" />
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
      :label="`Nachricht #${deletingItem?.id}`"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>
