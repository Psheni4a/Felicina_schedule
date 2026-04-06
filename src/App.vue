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
      events: []
    }
  },
  async mounted() {
    await this.loadEvents()
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
        const response = await fetch('https://api.sheetbest.com/sheets/8d0203ba-cf19-4af2-8a57-9105573d5f58')
        const data = await response.json()
        this.events = data.filter(event => event.hidden !== "1").map(event => ({
          ...event,
          title: event.title,
//            .replace('.', '.@'),
          subtitle: event.subtitle
        }))
      } catch (error) {
        console.error('Failed to load events:', error)
      }
    },
    getRowColor(index) {
      const row = index % this.rows
      return row % 2 === 0 ? 'white' : '#d9dada'
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
          по будням: 14:00, 15:00,<br />
          суббота: 11:00, воскресенье: 15:00
        </div>
        <div class="header_item">
          <img class="pushkin" src="/assets/images/pushkin.png" alt="" />
          <img class="buildings" src="/assets/images/buildings.png" alt="" />
          <p class="zapis">ЗАПИСЬ ПО ТЕЛЕФОНУ:<br />8 (861) 267 16 21<br />8 (861) 262 40 86</p>
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
    <button @click="takeScreenshot">Скриншот</button>
  </template>

<style scoped>
button {
  position: fixed;
  top: 20px;
  left: 30px;
  width: 80px;
  height: 80px;
  padding: 0;
  background-color: #a2282b;
  color: transparent;
  border: none;
  border-radius: 8px;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.6s ease;
  opacity: 0.3;
  display: flex;
  align-items: center;
  justify-content: center;
}

button:hover {
  opacity: 1;
  color: white;
  background-color: #8a1f22;
  transform: scale(1.05);
  width: 20rem;
  padding: 1rem 2rem;
}
</style>
