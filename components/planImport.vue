<template>
  <div class="plan_import">
    <div class="plan_head">
      <label class="file_button">
        Выбрать план (.docx)
        <input type="file" accept=".docx" @change="onFile" />
      </label>
      <span v-if="fileName" class="file_name">{{ fileName }}</span>
      <button class="close" @click="$emit('close')">Закрыть</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <ul v-if="warnings.length" class="warnings">
      <li v-for="w in warnings" :key="w">{{ w }}</li>
    </ul>

    <template v-if="week.length">
      <p class="hint">
        {{ week.length }} мероприятий, проверить: {{ warnCount }}.
        Поля можно править прямо в таблице, «@» — перенос строки.
      </p>
      <table>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Время</th>
            <th>Название</th>
            <th>Описание</th>
            <th>Что проверить</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in week" :key="i" :class="{ warn: row.flags.some(f => f.level === 'warn') }">
            <td><input v-model="row.dateISO" class="short" /></td>
            <td><input v-model="row.time" class="short" /></td>
            <td><textarea v-model="row.title" rows="2"></textarea></td>
            <td><textarea v-model="row.subtitle" rows="2"></textarea></td>
            <td class="flags">
              <p v-for="f in row.flags" :key="f.text" :class="f.level">{{ f.text }}</p>
              <p class="source" :title="row.source">План: {{ row.source }}</p>
            </td>
            <td><button class="remove" title="Убрать строку" @click="week.splice(i, 1)">×</button></td>
          </tr>
        </tbody>
      </table>

      <div class="actions">
        <button @click="$emit('preview', week)">Показать на афише</button>
        <button :disabled="!sheetOk" @click="copy(true)">Скопировать весь лист</button>
        <button @click="copy(false)">Скопировать только неделю</button>
        <button @click="download">Скачать CSV</button>
      </div>
      <p class="hint">
        «Весь лист»: неделя сверху, остальные строки с hidden=1. В Google-таблице выделите ячейку A2 и вставьте (Ctrl+V).
        <span v-if="!sheetOk" class="error">Лист не загрузился полностью — копируйте только неделю.</span>
      </p>
      <p v-if="copied" class="ok">{{ copied }}</p>
    </template>
  </div>
</template>

<script>
import { readDocxXml, extractPlan, convertPlan, buildSheet, toCsv, toClipboard } from '../src/planParser.js'

export default {
  props: {
    sheetRows: {
      type: Array,
      required: true
    }
  },
  emits: ['close', 'preview'],
  data() {
    return {
      fileName: '',
      week: [],
      warnings: [],
      error: '',
      copied: ''
    }
  },
  computed: {
    warnCount() {
      return this.week.filter(r => r.flags.some(f => f.level === 'warn')).length
    },
    // gviz отдаёт пустые ячейки, если не смог прочитать тип столбца;
    // тогда перезаписывать лист целиком опасно.
    sheetOk() {
      return this.sheetRows.length > 0 && this.sheetRows.every(r => !r.title || (r.dateISO && r.time))
    }
  },
  methods: {
    async onFile(e) {
      const file = e.target.files[0]
      if (!file) return
      this.fileName = file.name
      this.error = ''
      this.copied = ''
      try {
        const xml = await readDocxXml(await file.arrayBuffer())
        const plan = extractPlan(xml)
        this.warnings = plan.warnings
        this.week = convertPlan(plan, this.sheetRows)
      } catch (err) {
        console.error(err)
        this.error = err.message
        this.week = []
      }
    },
    rows(full) {
      return full ? buildSheet(this.sheetRows, this.week) : this.week
    },
    async copy(full) {
      const { html, text } = toClipboard(this.rows(full))
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' })
          })
        ])
      } catch {
        await navigator.clipboard.writeText(text)
      }
      this.copied = full ? 'Весь лист скопирован' : 'Строки недели скопированы'
    },
    download() {
      const blob = new Blob(['﻿' + toCsv(buildSheet(this.sheetRows, this.week))], { type: 'text/csv' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `afisha_${this.week[0]?.dateISO || 'week'}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
    }
  }
}
</script>

<style scoped>
.plan_import {
  position: fixed;
  inset: 0;
  z-index: 2000;
  overflow: auto;
  background: white;
  padding: 24px 32px;
  font-size: 16px;
  font-family: 'Unbounded', sans-serif;
}
.plan_head,
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.file_button,
.plan_import button {
  background-color: #a2282b;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font: inherit;
  cursor: pointer;
}
.plan_import button:disabled {
  opacity: 0.4;
  cursor: default;
}
.file_button input {
  display: none;
}
.close {
  margin-left: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}
th,
td {
  border-bottom: 1px solid #d9dada;
  padding: 6px;
  vertical-align: top;
  text-align: left;
}
tr.warn {
  background: #fdf1e6;
}
input,
textarea {
  width: 100%;
  box-sizing: border-box;
  font: inherit;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px;
}
.short {
  width: 9em;
}
textarea {
  min-width: 18em;
  resize: vertical;
}
.flags {
  font-size: 12px;
  max-width: 22em;
}
.flags p {
  margin: 0 0 4px;
}
.flags .warn,
.error {
  color: #a2282b;
}
.flags .info {
  color: #666;
}
.flags .source {
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.plan_import .remove {
  padding: 2px 10px;
  background: #d9dada;
  color: #333;
}
.warnings {
  /* глобальный стиль ul делает из списка сетку афиши высотой 1500px */
  display: block;
  height: auto;
  margin: 0 0 12px;
  padding-left: 20px;
  list-style: disc;
  color: #a2282b;
}
.warnings li {
  height: auto;
}
.hint {
  color: #555;
  font-size: 14px;
}
.ok {
  color: #2e7d32;
}
</style>
