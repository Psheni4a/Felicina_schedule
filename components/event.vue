<template>
  <li :style="{ backgroundColor: rowColor }">
    <p>{{ getDow(event.dateISO) }}</p>
    <p>{{ formatDateShort(event.dateISO) }}<br />{{ event.time }}</p>
    <div>
        <p v-html="formatText(event.title)"></p>
        <p v-html="formatText(event.subtitle)"></p>
    </div>
  </li>
</template>

<script>
export default {
  props: {
    event: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    rowCount: {
      type: Number,
      required: true
    }
  },
  computed: {
    rowColor() {
      const row = this.index % this.rowCount
      return row % 2 === 0 ? 'white' : '#d9dada'
    }
  },
  methods: {
    getDow(dateISO) {
      const [day, month, year] = dateISO.split('.').map(Number)
      const date = new Date(year, month - 1, day)
      return date.toLocaleDateString('ru-RU', { weekday: 'short' })
    },
    formatDateShort(dateISO) {
      const [day, month, year] = dateISO.split('.').map(Number)
      const date = new Date(year, month - 1, day)
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    },
    formatText(text) {
      return text.replace(/@/g, '<br />')
    }
  }
}
</script>

<style scoped>
li {
  box-sizing: border-box;
  display: flex;
  flex-basis: 6.3em;
  padding-left: 40px;
  padding-top: 0.7em;
}
li > p {
  display: block;
  font-weight: bold;
}
li > p:nth-child(1) {
  font-size: 1.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2em;
  height: 2em;
  background-color: #a2282b;
  text-align: center;
  border-radius: 50%;
  margin-right: 20px;
  min-width: 2em;
  min-height: 2em;
  color: white;
  text-transform: uppercase;
  font-weight: 500;
  padding: 0.3em;
}
li > p:nth-child(2) {
  padding-right: 20px;
  min-width: 8.1em;
  line-height: 1.4;
}
li > div {
  display: block;
  padding-bottom: 15px;
  padding-right: 20px;
  min-width: 8em;
  min-height: 68px;
}
li > div > p:nth-child(1) {
  font-weight: bold;
}
li > div > p:nth-child(2) {
  font-weight: normal;
}
ul > li:nth-child(odd) {
  background-color: white;
}

ul > li:nth-child(even) {
  background-color: #d9dada;
}
</style>
