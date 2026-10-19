// Разбор недельного плана мероприятий (.docx) в строки Google-листа
// (dateISO, time, title, subtitle, hidden). Описания сверяются с уже
// заполненным листом: для знакомых мероприятий берётся их последняя форма.

const WEEKDAYS = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье']
const LONG_LINE = 55
const BREAK_AT = 52
const RECENT_DAYS = 7

// ---------- чтение .docx ----------

// .docx — это zip. Достаём word/document.xml без библиотек: ищем запись
// в центральном каталоге и распаковываем её встроенным DecompressionStream.
export async function readDocxXml(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer)
  const view = new DataView(arrayBuffer)
  let eocd = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) throw new Error('Файл не похож на .docx')
  const count = view.getUint16(eocd + 10, true)
  let p = view.getUint32(eocd + 16, true)
  const decoder = new TextDecoder()
  for (let n = 0; n < count; n++) {
    const method = view.getUint16(p + 10, true)
    const size = view.getUint32(p + 20, true)
    const nameLen = view.getUint16(p + 28, true)
    const extraLen = view.getUint16(p + 30, true)
    const commentLen = view.getUint16(p + 32, true)
    const local = view.getUint32(p + 42, true)
    const name = decoder.decode(bytes.subarray(p + 46, p + 46 + nameLen))
    if (name === 'word/document.xml') {
      const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true)
      const data = bytes.subarray(start, start + size)
      if (method === 0) return decoder.decode(data)
      const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
      return new Response(stream).text()
    }
    p += 46 + nameLen + extraLen + commentLen
  }
  throw new Error('В файле нет word/document.xml — это точно .docx?')
}

function decodeXml(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
}

function paragraphs(xml) {
  const result = []
  const re = /<w:p(?:\s[^>]*)?\/>|<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g
  let m
  while ((m = re.exec(xml))) {
    const body = m[1] || ''
    let text = ''
    const runRe = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>/g
    let r
    while ((r = runRe.exec(body))) text += r[1] !== undefined ? decodeXml(r[1]) : ' '
    const highlighted = /<w:highlight\s/.test(body) || /<w:shd[^>]*w:fill="(?!auto|FFFFFF)[0-9A-F]{6}"/i.test(body)
    result.push({ text: text.replace(/\s+/g, ' ').trim(), highlighted })
  }
  return result
}

function rowsOf(tableXml) {
  return [...tableXml.matchAll(/<w:tr(?:\s[^>]*)?>([\s\S]*?)<\/w:tr>/g)].map(r =>
    [...r[1].matchAll(/<w:tc(?:\s[^>]*)?>([\s\S]*?)<\/w:tc>/g)].map(c => paragraphs(c[1]))
  )
}

// ---------- даты ----------

const pad = n => String(n).padStart(2, '0')
const fmtDate = d => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
function parseDate(s) {
  const m = s && s.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null
}
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

// ---------- время ----------

const TIME_LINE = /^(\d{1,2}[:.]\d{2}(?:\s*[-–—,;]\s*\d{1,2}[:.]\d{2})*)\s*(\([^)]*\))?\s*(.*)$/

export function normalizeTime(raw) {
  return raw
    .replace(/(\d{1,2})\.(\d{2})/g, '$1:$2')
    .split(/\s*[,;]\s*/)
    .map(part => part.replace(/\s*[-–—]\s*/g, '-'))
    .join(', ')
}
const firstMinutes = t => {
  const m = t.match(/(\d{1,2}):(\d{2})/)
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0
}

// ---------- разбор плана ----------

export function extractPlan(xml) {
  const warnings = []
  const tableMatch = xml.match(/<w:tbl>[\s\S]*?<\/w:tbl>/)
  if (!tableMatch) throw new Error('В плане не найдена таблица')
  const rows = rowsOf(tableMatch[0])
  const header = rows[0].map(cell => cell.map(p => p.text).join(' '))

  // Дату понедельника выбираем голосованием: заголовок плана и каждая
  // колонка «день недели + дата». Так переживаем опечатки вроде 17.09 вместо 17.10.
  const outside = paragraphs(xml.replace(/<w:tbl>[\s\S]*?<\/w:tbl>/g, '')).map(p => p.text).join(' ')
  const votes = new Map()
  const vote = d => d && votes.set(fmtDate(d), (votes.get(fmtDate(d)) || 0) + 1)
  const titleStart = parseDate((outside.match(/\d{1,2}\.\d{1,2}\.\d{4}/) || [])[0])
  vote(titleStart)
  const columnDay = header.map((h, i) => {
    const idx = WEEKDAYS.findIndex(w => h.toLowerCase().includes(w))
    return idx >= 0 ? idx : i
  })
  header.forEach((h, i) => {
    const d = parseDate(h)
    if (d) vote(addDays(d, -columnDay[i]))
  })
  const best = [...votes.entries()].sort((a, b) => b[1] - a[1])[0]
  if (!best) throw new Error('Не удалось определить даты недели')
  const monday = parseDate(best[0])

  const days = header.map((h, i) => {
    const date = fmtDate(addDays(monday, columnDay[i]))
    const written = parseDate(h)
    if (written && fmtDate(written) !== date) {
      warnings.push(`В шапке плана стоит ${fmtDate(written)}, по дню недели это ${date}`)
    }
    return { date, events: [] }
  })

  for (const row of rows.slice(1)) {
    row.forEach((cell, col) => {
      const day = days[col]
      if (!day) return
      let current = null
      for (const p of cell) {
        if (!p.text) continue
        const m = p.text.match(TIME_LINE)
        if (m && (m[2] || !m[3])) {
          current = { time: normalizeTime(m[1]), lines: [], highlighted: p.highlighted }
          day.events.push(current)
          if (m[3]) current.lines.push(m[3])
        } else if (current) {
          current.lines.push(p.text)
          current.highlighted = current.highlighted || p.highlighted
        } else {
          warnings.push(`${day.date}: текст без времени пропущен — «${p.text}»`)
        }
      }
    })
  }
  for (const day of days) {
    for (const ev of day.events) ev.text = ev.lines.join(' ').replace(/\s+/g, ' ').trim()
  }
  return { monday: fmtDate(monday), days, warnings }
}

// ---------- сверка с листом ----------

const SEP = /[\s\u00a0«»"“”„@.\-\u2010\u2011–—:;,!?…()]+/
export const textKey = s =>
  (s || '').toLowerCase().replace(/ё/g, 'е').split(SEP).filter(Boolean).join(' ')
const tokens = s => textKey(s).split(' ').filter(Boolean)
// Грубая основа слова: первые 5 букв, чтобы «живопись» и «живописи» совпадали.
const stems = s => tokens(s).map(t => t.slice(0, 5))

function splitAge(s) {
  const re = /(^|[\s,])(\d{1,2})\s?\+(?=$|[\s,.;])/
  const m = (s || '').match(re)
  if (!m) return { base: (s || '').trim(), age: '' }
  const base = (s.slice(0, m.index) + m[1] + s.slice(m.index + m[0].length))
    .replace(/\s+,/g, ',')
    .replace(/[\s,]+$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
  return { base, age: `${m[2]}+` }
}

const isMulti = t => /[,;]/.test(t || '')

// Справочник по листу: для каждого названия — строки от свежих к старым.
export function buildIndex(sheetRows) {
  const byTitle = new Map()
  const subtitleForms = new Map()
  const sorted = [...sheetRows].sort((a, b) => {
    const da = parseDate(a.dateISO), db = parseDate(b.dateISO)
    const diff = (db ? db.getTime() : 0) - (da ? da.getTime() : 0)
    if (diff) return diff
    return (a.hidden === '1') - (b.hidden === '1')
  })
  for (const row of sorted) {
    const k = textKey(row.title)
    if (!k) continue
    if (!byTitle.has(k)) byTitle.set(k, [])
    byTitle.get(k).push(row)
    const sub = splitAge(row.subtitle.replace(/\s+$/, '')).base
    const sk = textKey(sub)
    if (sk && !subtitleForms.has(sk)) subtitleForms.set(sk, sub.trim())
  }
  const keys = [...byTitle.keys()]
  const byStems = new Map()
  for (const k of keys) {
    const sk = stems(k).join(' ')
    if (!byStems.has(sk)) byStems.set(sk, k)
  }
  return { byTitle, keys, byStems, subtitleForms }
}

const rowTime = r => (parseDate(r.dateISO) || new Date(0)).getTime()

// Строки мероприятия от свежих к старым; при равенстве — с тем же видом
// времени (один сеанс или несколько), т.к. от этого зависит перенос @.
function rowsFor(index, key, time) {
  const rows = index.byTitle.get(key) || []
  return [...rows].sort((a, b) => rowTime(b) - rowTime(a) || (isMulti(a.time) !== isMulti(time)) - (isMulti(b.time) !== isMulti(time)))
}

// Описание из плана почти целиком входит в описание из листа: план часто
// пишет обрывками («Лекция», «с мастер-классом и дегустацией чая»).
function similar(planText, sheetText) {
  const ta = new Set(stems(planText)), tb = new Set(stems(sheetText))
  if (!ta.size) return false
  return [...ta].filter(t => tb.has(t)).length / ta.size >= 0.75
}

// Описание: точное совпадение среди строк последней недели, иначе самая свежая
// строка, где описание почти то же (план часто пишет обрывками), иначе план.
function pickSubtitle(rows, rest, time) {
  const base = r => splitAge(r.subtitle.replace(/\s+$/, '')).base.trim()
  if (!rows.length) return null
  const newest = rowTime(rows[0])
  const recent = rows
    .filter(r => newest - rowTime(r) <= RECENT_DAYS * 864e5)
    .sort((a, b) => (isMulti(a.time) !== isMulti(time)) - (isMulti(b.time) !== isMulti(time)) || rowTime(b) - rowTime(a))
  if (!rest) return { text: base(recent[0]), how: 'empty' }
  const exact = recent.find(r => textKey(base(r)) === textKey(rest))
  if (exact) return { text: base(exact), how: 'exact', row: exact }
  const close = rows.find(r => base(r) && similar(rest, base(r)))
  if (close) return { text: base(close), how: textKey(base(close)) === textKey(rest) ? 'exact' : 'close', row: close }
  return { text: null, how: 'none', last: base(rows[0]) }
}

// Конец n-го слова в исходной строке (слова считаются так же, как в textKey).
function offsetAfterWords(s, n) {
  const re = /[^\s«»"“”„@.\-–—:;,!?…()]+/g
  let m, count = 0
  while ((m = re.exec(s))) if (++count === n) return m.index + m[0].length
  return s.length
}

function quotedSegments(s) {
  const segs = []
  let depth = 0, start = -1
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '«') { if (depth++ === 0) start = i }
    else if (s[i] === '»' && depth > 0 && --depth === 0) segs.push({ start, end: i + 1, text: s.slice(start, i + 1) })
  }
  return segs
}

const cleanRest = s =>
  s.replace(/^[\s.,:;»"–—-]+/, '').replace(/[\s.,;]+$/, '').replace(/\s{2,}/g, ' ').trim()
const capitalize = s => (s ? s[0].toUpperCase() + s.slice(1) : s)

function similarity(a, b) {
  const ta = new Set(a.split(' ')), tb = new Set(b.split(' '))
  const common = [...ta].filter(t => tb.has(t)).length
  return common / Math.max(ta.size, tb.size)
}

function knownKey(text, index) {
  const k = textKey(text)
  if (index.byTitle.has(k)) return { key: k, exact: true }
  const viaStems = index.byStems.get(stems(text).join(' '))
  return viaStems ? { key: viaStems, exact: false } : null
}

function mostRecent(index, keys) {
  const latest = k => Math.max(...index.byTitle.get(k).map(rowTime))
  return keys.sort((a, b) => latest(b) - latest(a) || b.length - a.length)[0]
}

function resolveTitle(text, index) {
  const segs = quotedSegments(text)
  // 1. Текст без кавычек в начале начинается с известного названия
  //    («Музейное занятие с химиком», «Открытое кормление обитателей выставки «…»»).
  if (!text.startsWith('«')) {
    const tk = textKey(text)
    const hits = index.keys.filter(k => tk === k || tk.startsWith(k + ' '))
    if (hits.length) {
      const k = mostRecent(index, hits)
      return { key: k, exact: true, rest: text.slice(offsetAfterWords(text, k.split(' ').length)) }
    }
  }
  // 2. Известное название в кавычках (в начале или внутри: «Игра-стратегия по выставке «…»»).
  for (const seg of segs) {
    const known = knownKey(seg.text, index)
    if (known) return { ...known, planTitle: seg.text, rest: text.slice(0, seg.start) + ' ' + text.slice(seg.end) }
  }
  // 3. Новое название.
  let title, rest
  if (segs.length) {
    title = segs[0].text
    rest = text.slice(0, segs[0].start) + ' ' + text.slice(segs[0].end)
  } else {
    const dot = text.search(/\.\s/)
    title = `«${(dot >= 0 ? text.slice(0, dot) : text).trim()}»`
    rest = dot >= 0 ? text.slice(dot + 1) : ''
  }
  return { key: null, title, rest }
}

// Перенос @ в длинной строке: на последней естественной границе
// (перед «…», «в рамках», «на выставку», «из цикла»), чтобы первая часть
// была не длиннее BREAK_AT; иначе — на последнем пробеле до BREAK_AT.
function autoBreak(s) {
  if (s.length <= LONG_LINE || s.includes('@')) return { text: s, broke: false }
  const cut = i => ({ text: s.slice(0, i).trimEnd() + '@' + s.slice(i).trimStart(), broke: true })
  const natural = [...s.matchAll(/\s(?=«|в рамках|на выставку|из цикла|с мастер|для )/g)]
    .map(m => m.index)
    .filter(i => i >= 15 && i <= BREAK_AT)
  if (natural.length) return cut(natural[natural.length - 1])
  const space = s.lastIndexOf(' ', BREAK_AT)
  return space > 15 ? cut(space) : { text: s, broke: false }
}

export function convertEvent(date, ev, index) {
  const flags = []
  const { base: text, age } = splitAge(ev.text)
  const t = resolveTitle(text, index)
  const rest = capitalize(cleanRest(t.rest))
  let title, subtitle

  if (t.key) {
    const rows = rowsFor(index, t.key, ev.time)
    title = rows[0].title.trim()
    if (!title.includes('«')) title = `«${title}»`
    const flat = s => s.replace(/@/g, ' ').replace(/\s+/g, ' ').trim()
    if (!t.exact) {
      flags.push({ level: 'info', text: `Название приведено к листу; в плане: ${t.planTitle}` })
    } else if (t.planTitle && flat(t.planTitle) !== flat(title)) {
      // Те же слова, другая пунктуация: оставляем форму из листа, но показываем разницу.
      flags.push({ level: 'info', text: `Название из листа; в плане: ${t.planTitle}` })
    }
    const sub = pickSubtitle(rows, rest, ev.time)
    // Перенос @ зависит от ширины колонки времени: «12:00, 15:00» шире «15:00».
    if (sub.row && sub.text && isMulti(sub.row.time) !== isMulti(ev.time) && sub.text.includes('@')) {
      sub.text = autoBreak(sub.text.replace(/@/g, ' ')).text
    }
    if (sub.how === 'empty' || sub.how === 'exact') {
      subtitle = sub.text
      if (sub.how === 'empty' && sub.text) flags.push({ level: 'info', text: 'В плане нет описания, взято из листа' })
    } else if (sub.how === 'close') {
      subtitle = sub.text
      flags.push({ level: 'info', text: `Описание из листа; в плане: «${rest}»` })
    } else {
      subtitle = index.subtitleForms.get(textKey(rest)) || rest
      flags.push({ level: 'warn', text: `Описание из плана; в листе было: «${sub.last || '—'}»` })
    }
  } else {
    title = t.title
    subtitle = index.subtitleForms.get(textKey(rest)) || rest
    flags.push({ level: 'warn', text: 'Новое мероприятие — проверьте название и описание' })
    const tk = textKey(title)
    const near = index.keys
      .map(k => ({ k, s: similarity(tk, k) }))
      .filter(x => x.s >= 0.6)
      .sort((a, b) => b.s - a.s)[0]
    if (near) flags.push({ level: 'warn', text: `Похоже на ${index.byTitle.get(near.k)[0].title.trim()} из листа` })
    if (title.length > LONG_LINE && !title.includes('@')) {
      flags.push({ level: 'warn', text: 'Длинное название — нужен ли @?' })
    }
  }

  if (!index.subtitleForms.has(textKey(subtitle))) {
    const b = autoBreak(subtitle)
    subtitle = b.text
    if (b.broke) flags.push({ level: 'info', text: 'Перенос @ поставлен автоматически' })
    else if (subtitle.length > LONG_LINE && !subtitle.includes('@')) {
      flags.push({ level: 'warn', text: 'Длинное описание — нужен ли @?' })
    }
  }
  if (age) subtitle = subtitle ? `${subtitle}, ${age}` : age
  if (ev.highlighted) flags.push({ level: 'info', text: 'В плане выделено цветом' })

  return { dateISO: date, time: ev.time, title, subtitle, hidden: '', flags, source: ev.text }
}

export function convertPlan(plan, sheetRows) {
  const index = buildIndex(sheetRows)
  const events = []
  for (const day of plan.days) {
    const converted = day.events.map((ev, i) => ({ ...convertEvent(day.date, ev, index), order: i }))
    converted.sort((a, b) => firstMinutes(a.time) - firstMinutes(b.time) || a.order - b.order)
    events.push(...converted)
  }
  return events.map(({ order, ...e }) => e)
}

// Новый лист целиком: неделя сверху, остальные строки скрыты. Для каждого
// мероприятия недели «забираем» его открытую строку прошлой недели или
// заготовку на ту же дату, чтобы лист не разрастался дублями.
export function buildSheet(sheetRows, weekRows) {
  const used = new Set()
  for (const w of weekRows) {
    const k = textKey(w.title)
    const i = sheetRows.findIndex(
      (r, idx) => !used.has(idx) && textKey(r.title) === k && (r.hidden !== '1' || r.dateISO === w.dateISO)
    )
    if (i >= 0) used.add(i)
  }
  const strip = ({ dateISO, time, title, subtitle, hidden }) => ({ dateISO, time, title, subtitle, hidden })
  return [
    ...weekRows.map(r => strip({ ...r, hidden: '' })),
    ...sheetRows.filter((_, i) => !used.has(i)).map(r => strip({ ...r, hidden: '1' }))
  ]
}

const COLUMNS = ['dateISO', 'time', 'title', 'subtitle', 'hidden']

export function toCsv(rows) {
  const q = v => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
  return [COLUMNS.join(','), ...rows.map(r => COLUMNS.map(c => q(r[c] ?? '')).join(','))].join('\r\n')
}

// Для вставки в Google Sheets: HTML-таблица (Sheets её понимает лучше всего) и TSV.
export function toClipboard(rows, withHeader = false) {
  const esc = v => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const body = rows.map(r => `<tr>${COLUMNS.map(c => `<td>${esc(r[c] ?? '')}</td>`).join('')}</tr>`).join('')
  const head = withHeader ? `<tr>${COLUMNS.map(c => `<td>${c}</td>`).join('')}</tr>` : ''
  const tsvCell = v => (/[\t\n"]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
  const tsv = [...(withHeader ? [COLUMNS.join('\t')] : []), ...rows.map(r => COLUMNS.map(c => tsvCell(r[c] ?? '')).join('\t'))].join('\n')
  return { html: `<table>${head}${body}</table>`, text: tsv }
}
