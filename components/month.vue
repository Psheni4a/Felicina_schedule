<template>
  <p :class="{ h1: true, double: isRange }">{{ month }}</p>
</template>

<script>
export default {
  props: {
    events: {
      type: Array,
      required: true
    }
  },
  computed: {
    month() {
      if (!this.events.length) return ''
      const months = [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь'
      ]
      const dates = this.validDates
      if (!dates.length) return ''

      const start = dates[0]
      const end = dates[dates.length - 1]
      const startName = months[start.getMonth()]
      const endName = months[end.getMonth()]
      const startYear = start.getFullYear()
      const endYear = end.getFullYear()

      if (startYear === endYear) {
        return startName === endName
          ? `${startName} ${startYear}`
          : `${startName} - ${endName} ${startYear}`
      }
      return `${startName} ${startYear} - ${endName} ${endYear}`
    },
    isRange() {
      if (!this.validDates.length) return false
      const start = this.validDates[0]
      const end = this.validDates[this.validDates.length - 1]
      return start.getFullYear() !== end.getFullYear() || start.getMonth() !== end.getMonth()
    },
    validDates() {
      return this.events
        .map(event => this.parseDate(event.dateISO))
        .filter(date => date instanceof Date && !isNaN(date))
        .sort((a, b) => a - b)
    }
  },
  methods: {
    parseDate(dateISO) {
      const [day, month, year] = dateISO.split('.')
      return new Date(Number(year), Number(month) - 1, Number(day))
    }
  }
}
</script>

<style scoped></style>