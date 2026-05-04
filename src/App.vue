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
//        const response = await fetch('https://api.sheetbest.com/sheets/8d0203ba-cf19-4af2-8a57-9105573d5f58')
//        const data = await response.json()
                const data = 
                  [
  { dateISO: "05.05.2026", time: "12:00", title: "«Русская кавалерия в Отечественной войне 1812 года и Заграничных походах 1813-1814 гг.»", subtitle: "Бесплатная экскурсия по входному билету на выставку", hidden: "" },
  { dateISO: "05.05.2026", time: "14:00", title: "«Война и судьбы»", subtitle: "Тематическая экскурсия", hidden: "" },
  { dateISO: "05.05.2026", time: "15:00", title: "«Фрида Кало. Да здравствует жизнь!»", subtitle: "Бесплатная тематическая экскурсия по входному билету", hidden: "" },
  { dateISO: "05.05.2026", time: "15:00", title: "«Золото сарматов: Искусство древних мастеров»", subtitle: "Бесплатная тематическая экскурсия по входному билету", hidden: "" },
  { dateISO: "06.05.2026", time: "12:00", title: "«Русская кавалерия в Отечественной войне 1812 года и Заграничных походах 1813-1814 гг.»", subtitle: "Бесплатная экскурсия по входному билету на выставку", hidden: "" },
  { dateISO: "06.05.2026", time: "12:00", title: "«От храма к храму»", subtitle: "Пешеходная экскурсия, 12+", hidden: "" },
  { dateISO: "06.05.2026", time: "14:00", title: "«Война и судьбы»", subtitle: "Тематическая экскурсия", hidden: "" },
  { dateISO: "06.05.2026", time: "15:00", title: "«Фрида Кало. Да здравствует жизнь!»", subtitle: "Бесплатная тематическая экскурсия по входному билету", hidden: "" },
  { dateISO: "06.05.2026", time: "15:00", title: "«Золото сарматов: Искусство древних мастеров»", subtitle: "Бесплатная тематическая экскурсия по входному билету", hidden: "" },
  { dateISO: "06.05.2026", time: "15:00", title: "«Победный май»", subtitle: "Мастер-класс по созданию открытки", hidden: "" },
  { dateISO: "06.05.2026", time: "16:00", title: "«Подвиги древних героев»", subtitle: "Экскурсия-спектакль", hidden: "" },
  { dateISO: "07.05.2026", time: "11:00", title: "«Музейные сокровища»", subtitle: "Игра-путешествие по музею", hidden: "" },
  { dateISO: "07.05.2026", time: "12:00", title: "«Екатеринодар - град казачий: краснодарская улица Красная»", subtitle: "Пешеходная экскурсия, 12+", hidden: "" },
  { dateISO: "07.05.2026", time: "12:00", title: "«Русская кавалерия в Отечественной войне 1812 года и Заграничных походах 1813-1814 гг.»", subtitle: "Бесплатная экскурсия по входному билету на выставку", hidden: "" },
  { dateISO: "07.05.2026", time: "14:00", title: "«Война и судьбы»", subtitle: "Тематическая экскурсия", hidden: "" },
  { dateISO: "07.05.2026", time: "15:00", title: "«Фрида Кало. Да здравствует жизнь!»", subtitle: "Бесплатная тематическая экскурсия по входному билету", hidden: "" },
  { dateISO: "07.05.2026", time: "15:00", title: "«Золото сарматов: Искусство древних мастеров»", subtitle: "Бесплатная тематическая экскурсия по входному билету", hidden: "" },
  { dateISO: "07.05.2026", time: "15:00", title: "«Победный май»", subtitle: "Мастер-класс по созданию рисунка на деревянной основе", hidden: "" },
  { dateISO: "07.05.2026", time: "15:00", title: "«Школа экскурсовода»", subtitle: "Занятие в рамках культурно-просветительского проекта", hidden: "" },
  { dateISO: "08.05.2026", time: "11:00", title: "«Победный май»", subtitle: "Мастер-класс по созданию открытки", hidden: "" },
  { dateISO: "08.05.2026", time: "12:00", title: "«Прорыв»", subtitle: "Экскурсия–спектакль", hidden: "" },
  { dateISO: "08.05.2026", time: "12:00", title: "«Русская кавалерия в Отечественной войне 1812 года и Заграничных походах 1813-1814 гг.»", subtitle: "Бесплатная экскурсия по входному билету на выставку", hidden: "" },
  { dateISO: "08.05.2026", time: "13:00", title: "«Музейные сокровища»", subtitle: "Игра-путешествие по музею", hidden: "" },
  { dateISO: "08.05.2026", time: "14:00", title: "«Война и судьбы»", subtitle: "Тематическая экскурсия", hidden: "" },
  { dateISO: "08.05.2026", time: "14:00", title: "«Победный май»", subtitle: "Мастер-класс по созданию рисунка на деревянной основе", hidden: "" },
  { dateISO: "08.05.2026", time: "15:00", title: "«Фрида Кало. Да здравствует жизнь!»", subtitle: "Бесплатная тематическая экскурсия по входному билету", hidden: "" },
  { dateISO: "08.05.2026", time: "15:00", title: "«Золото сарматов: Искусство древних мастеров»", subtitle: "Бесплатная тематическая экскурсия по входному билету", hidden: "" },
  { dateISO: "08.05.2026", time: "15:00", title: "«Бородинский хлеб. При чем тут поле?»", subtitle: "Авторская лекция", hidden: "" },
  { dateISO: "08.05.2026", time: "15:00", title: "«Война глазами женщин»", subtitle: "Литературно-музыкальная гостиная", hidden: "" },
  { dateISO: "09.05.2026", time: "11:00", title: "«Победный май»", subtitle: "Мастер-класс по созданию открытки", hidden: "" },
  { dateISO: "09.05.2026", time: "12:00", title: "«Прорыв»", subtitle: "Экскурсия–спектакль", hidden: "" },
  { dateISO: "09.05.2026", time: "12:00", title: "«Русская кавалерия в Отечественной войне 1812 года и Заграничных походах 1813-1814 гг.»", subtitle: "Бесплатная экскурсия по входному билету на выставку", hidden: "" },
  { dateISO: "09.05.2026", time: "15:00", title: "«Победный май»", subtitle: "Мастер-класс по созданию рисунка на деревянной основе", hidden: "" },
  { dateISO: "09.05.2026", time: "15:00", title: "«Фрида Кало. Да здравствует жизнь!»", subtitle: "Бесплатная тематическая экскурсия по входному билету", hidden: "" },
  { dateISO: "09.05.2026", time: "16:00", title: "«Война и судьбы»", subtitle: "Тематическая экскурсия", hidden: "" },
  { dateISO: "10.05.2026", time: "11:00", title: "«Чудеса в решете: роспись деревянного изделия. Кубанский пейзаж»", subtitle: "Творческий мастер-класс", hidden: "" },
  { dateISO: "10.05.2026", time: "11:00", title: "«Война и судьбы»", subtitle: "Тематическая экскурсия", hidden: "" },
  { dateISO: "10.05.2026", time: "12:00", title: "«Русская кавалерия в Отечественной войне 1812 года и Заграничных походах 1813-1814 гг.»", subtitle: "Бесплатная экскурсия по входному билету на выставку", hidden: "" },
  { dateISO: "10.05.2026", time: "12:00, 15:00", title: "«Фрида Кало. Да здравствует жизнь!»", subtitle: "Бесплатная тематическая экскурсия по входному билету", hidden: "" },
  { dateISO: "10.05.2026", time: "15:00", title: "«Золото сарматов: Искусство древних мастеров»", subtitle: "Бесплатная тематическая экскурсия по входному билету", hidden: "" },
  { dateISO: "10.05.2026", time: "15:00", title: "«Чудеса в решете: роспись деревянного изделия. Кубанский пейзаж»", subtitle: "Творческий мастер-класс", hidden: "" },
  { dateISO: "10.05.2026", time: "15:00", title: "«Я видел это»", subtitle: "Пешеходная экскурсия, 12+", hidden: "" },
  { dateISO: "29.04.2026", time: "15:00", title: "«Международные связи Краснодара: история и современность побратимства»", subtitle: "Пешеходная экскурсия, 12+", hidden: "1" },
  { dateISO: "30.04.2026", time: "16:00", title: "«Чудеса в решете: роспись деревянного изделия»", subtitle: "Творческий мастер-класс", hidden: "1" },
  { dateISO: "01.05.2026", time: "11:00", title: "«Мир. Труд. Май»", subtitle: "Мастер-класс по созданию творческой поделки Творческий мастер-класс", hidden: "1" },
  { dateISO: "01.05.2026", time: "12:00", title: "«Кино: страна советов»", subtitle: "Авторская экскурсия Светланы Катуниной", hidden: "1" },
  { dateISO: "01.05.2026", time: "13:00", title: "«День в музее»", subtitle: "Обзорная экскурсия", hidden: "1" },
  { dateISO: "01.05.2026", time: "13:00", title: "«Музейные сокровища»", subtitle: "Игра-путешествие по музею", hidden: "1" },
  { dateISO: "01.05.2026", time: "14:00", title: "«Краснодар-советский»", subtitle: "Пешеходная экскурсия", hidden: "1" },
  { dateISO: "01.05.2026", time: "14:00", title: "«Партсобрание: Кубань в девятой пятилетке - цифры, факты, успехи»", subtitle: "Интерактивное мероприятие", hidden: "1" },
  { dateISO: "01.05.2026", time: "15:00", title: "«Первые в космосе»", subtitle: "Тематическая экскурсия", hidden: "1" },
  { dateISO: "01.05.2026", time: "15:00", title: "«Мир. Труд. Май»", subtitle: "Мастер-класс по созданию творческой поделки Творческий мастер-класс", hidden: "1" },
  { dateISO: "02.05.2026", time: "11:00", title: "«Мир. Труд. Май»", subtitle: "Мастер-класс по созданию творческой поделки Творческий мастер-класс", hidden: "1" },
  { dateISO: "02.05.2026", time: "13:00", title: "«Первые в космосе»", subtitle: "Тематическая экскурсия", hidden: "1" },
  { dateISO: "02.05.2026", time: "14:00", title: "«В старинном доме с лестницей витой»", subtitle: "Тематическая экскурсия по дому Богарсуковых", hidden: "1" },
  { dateISO: "02.05.2026", time: "15:00", title: "«Мир. Труд. Май»", subtitle: "Мастер-класс по созданию творческой поделки Творческий мастер-класс", hidden: "1" },
  { dateISO: "02.05.2026", time: "15:00", title: "«От варяжского меча до сабли степи: воинское дело Древней Руси»", subtitle: "Авторская лекция члена военно-исторического клуба «Золотой вепрь» Кирилла Стружкина", hidden: "1" },
  { dateISO: "02.05.2026", time: "15:00", title: "«Золотой код сарматов»", subtitle: "Авторская экскурсия Светланы Катуниной", hidden: "1" },
  { dateISO: "03.05.2026", time: "11:00", title: "«Чайные сцены Михаила Булгакова»", subtitle: "Литературный завтрак", hidden: "1" },
  { dateISO: "03.05.2026", time: "11:00", title: "«Мир. Труд. Май»", subtitle: "Мастер-класс по созданию творческой поделки Творческий мастер-класс", hidden: "1" },
  { dateISO: "03.05.2026", time: "12:00", title: "«Искусство на стыке культур. Влияние искусства античности на культуру кочевых племен Северного Причерноморья»", subtitle: "Лекция в рамках проекта «Путешествие в историю искусства»", hidden: "1" },
  { dateISO: "03.05.2026", time: "14:00", title: "«Первые в космосе»", subtitle: "Тематическая экскурсия", hidden: "1" },
  { dateISO: "03.05.2026", time: "15:00", title: "«Краснодар-советский»", subtitle: "Пешеходная экскурсия", hidden: "1" },
  { dateISO: "03.05.2026", time: "15:00", title: "«Богомолы-насекомые с другой планеты»", subtitle: "Бесплатная тематическая экскурсия по входному билету", hidden: "1" },
  { dateISO: "25.04.2026", time: "16:00", title: "«Открытое кормление ящериц и богомолов»", subtitle: "По входному билету на выставку", hidden: "1" },
  { dateISO: "26.04.2026", time: "16:00", title: "«ПРОприроду непостижимых народов»", subtitle: "Интерактивное мероприятие в рамках просветительского проекта «Караван историй о природе и народах»", hidden: "1" },
  { dateISO: "17.04.2026", time: "12:00", title: "«Екатеринодар – град казачий: Краснодарская улица Красная»", subtitle: "Пешеходная экскурсия", hidden: "1" },
  { dateISO: "16.04.2026", time: "15:00", title: "«От храма к храму»", subtitle: "Пешеходная экскурсия", hidden: "1" },
  { dateISO: "15.04.2026", time: "11:00", title: "«Мир природы»", subtitle: "Познавательная игра для детей", hidden: "1" },
  { dateISO: "29.04.2026", time: "15:00", title: "Просмотр фильма в рамках Фестиваля Правильного кино.", subtitle: "Фильм: Культурный код Россия 2.0: киномозаика традиционных духовно-нравственных ценностей", hidden: "1" }
]
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
