<script setup>
defineProps({
  columns: Array,   // [{ key, label, slot? }]
  rows:    Array,
  loading: Boolean,
})
</script>

<template>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.label">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="loading-row">
            <td style="padding:40px;text-align:center;color:var(--text-muted)">
              <span class="spinner"></span>Lade Daten…
            </td>
          </td>
        </tr>
        <tr v-else-if="!rows.length">
          <td :colspan="columns.length" class="empty-state">Keine Einträge gefunden.</td>
        </tr>
        <template v-else>
          <tr v-for="row in rows" :key="row.id ?? JSON.stringify(row)">
            <td v-for="col in columns" :key="col.label" :title="col.key ? String(row[col.key] ?? '') : ''">
              <slot :name="col.slot ?? col.key" :row="row">
                {{ row[col.key] ?? '—' }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
