<script>

import Event from '../components/event.vue'
import Month from '../components/month.vue'
import html2canvas from 'html2canvas'

export default {
  components: {
    Event,
    Month
  },
  data() {
    return {
      events: [],
      fontSize: 23
    }
  },
  async mounted() {
    await this.loadEvents()
    this.applyFontSize()
  },
  computed: {
    rows() {
      return Math.ceil(this.events.length / 3)
    },
    gridRows() {
      return `repeat(${this.rows}, 1fr)`
    },
    blankEvents() {
      const remainder = this.events.length % 3
      return remainder === 0 ? 0 : 3 - remainder
    }
  },
  methods: {
    async loadEvents() {
      try {
        const sheetId = '1s41VA87rQ_1kecpIxGRmQ3Q2wegeGdXOyCLXy3tnfew'
        const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`
        const response = await fetch(sheetUrl)

        if (!response.ok) {
          throw new Error(`Google Sheet request failed: ${response.status} ${response.statusText}`)
        }

        const csvText = await response.text()
        const data = this.parseCsv(csvText)

        this.events = data
          .filter(event => event.hidden !== '1')
          .map(event => ({
            ...event,
            title: event.title,
            subtitle: event.subtitle
          }))
      } catch (error) {
        console.error('Failed to load events:', error)
      }
    },
    parseCsv(csvText) {
      const text = csvText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      const rows = []
      let current = ''
      let row = []
      let inQuote = false

      for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const nextChar = text[i + 1]

        if (inQuote) {
          if (char === '"') {
            if (nextChar === '"') {
              current += '"'
              i += 1
            } else {
              inQuote = false
            }
          } else {
            current += char
          }
        } else {
          if (char === '"') {
            inQuote = true
          } else if (char === ',') {
            row.push(current)
            current = ''
          } else if (char === '\n') {
            row.push(current)
            rows.push(row)
            row = []
            current = ''
          } else {
            current += char
          }
        }
      }

      if (current !== '' || row.length > 0) {
        row.push(current)
        rows.push(row)
      }

      if (rows.length === 0) {
        return []
      }

      const header = rows[0].map(cell => cell.trim())
      return rows.slice(1).map(rowData => {
        const item = {}
        header.forEach((column, index) => {
          item[column] = (rowData[index] || '').trim()
        })
        return item
      })
    },
    getRowColor(index) {
      const row = index % this.rows
      return row % 2 === 0 ? 'white' : '#d9dada'
    },
    applyFontSize() {
      document.documentElement.style.fontSize = `${this.fontSize}px`
    },
    async takeScreenshot() {
      try {
        const canvas = await html2canvas(document.querySelector('.table_wrap'))
        const link = document.createElement('a')
        link.download = 'screenshot.png'
        link.href = canvas.toDataURL()
        link.click()
      } catch (error) {
        console.error('Screenshot failed:', error)
      }
    }
  }
}

</script>

<template>
      <div class="table_wrap">
      <div class="table_head">
        <div class="header_item">
          <div class="">
            <p class="h2">МУЗЕЙ ИМЕНИ<br />ФЕЛИЦЫНА</p>
            <Month :events="events" />
          </div>
          <p class="h3">АФИША<br />МЕРОПРИЯТИЙ</p>
        </div>
        <div class="header_item peshie">
          <span>пешеходные экскурсии</span><br />
          по будням и выходным
        </div>
        <div class="header_item">
          <img class="pushkin" src="/assets/images/pushkin.png" alt="" />
          <img class="buildings" src="/assets/images/buildings.png" alt="" />
          <p class="zapis">ЗАПИСЬ ПО ТЕЛЕФОНУ:<br />8 (861) 267-16-21<br />8 (918) 411-83-07<br />8 (861)-262-40-86</p>
        </div>
      </div>
      <ul :style="{ gridTemplateRows: gridRows }">
        <event
          v-for="(event, index) in events"
          :key="event.title"
          :event="event"
          :index="index"
          :row-count="rows"
        />
        <li
          v-for="n in blankEvents"
          :key="`blank-${n}`"
          class="blank"
          :style="{ backgroundColor: getRowColor(events.length + n - 1) }"
        ></li>
      </ul>
    </div>
    <div class="control_panel">
      <button @click="takeScreenshot">Скриншот</button>
      <label class="font_control">
        <input
          type="number"
          min="12"
          max="32"
          step="1"
          v-model.number="fontSize"
          @input="applyFontSize"
        />
        <span>Шрифт</span>
      </label>
    </div>
  </template>

<style scoped>
.control_panel {
  position: fixed;
  top: 20px;
  left: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 1000;
}

.control_panel button, .control_panel .font_control{
  width: 80px;
  height: 80px;
  padding: 0;
  background-color: #a2282b;
  color: transparent;
  border: none;
  border-radius: 8px;
  font-size: 23px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.6s ease;
  opacity: 0.3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control_panel:hover button, .control_panel:hover .font_control{
  opacity: 1;
  color: white;
  background-color: #8a1f22;
  transform: scale(1.05);
  width: 400px;
}

.control_panel:hover button {
  padding: 1rem 2rem;
}

.control_panel:hover .font_control input {
  opacity: 1;
  transition: opacity 0.3s ease;
}

.font_control {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  background-color: #a2282b;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  height: 80px;
}

.font_control input {
  width: 70px;
  height: 48px;
  border-radius: 8px;
  border: none;
  padding: 0 10px;
  text-align: center;
  opacity: 0;
}

.font_control input:focus {
  outline: 2px solid rgba(255, 255, 255, 0.8);
}
</style>
