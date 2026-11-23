<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SECTION_COLORS } from '../scoreUi'

/**
 * The notes help's small pictures, drawn inline (no images): a piano roll that says "higher is higher, longer is
 * longer", a bar ruler with its seconds, the two lanes, the written and the sung octave, the key's rows with the
 * pencil snapping, chords over bars, the parts against the lyrics' tags, and the simple view's contour. The colours
 * are the editor's own (vocal purple-pink, instrument teal, the dark grid), so a picture looks like what it explains.
 */
const props = defineProps<{ kind: 'roll' | 'bars' | 'lanes' | 'octave' | 'key' | 'chords' | 'parts' | 'simple' }>()
const { t, tm } = useI18n()
const f = (k: string): string => t(`notesHelp.fig.${k}`)
const gid = `nhf-${props.kind}-${Math.random().toString(36).slice(2, 7)}`

// ---- roll: two bars of eighths, notes as (row from the top, start cell, length in cells) ----
const ROLL = { x0: 34, y0: 8, cell: 21, row: 12, rows: 10, cells: 16 }
const rollNotes: [number, number, number][] = [[7, 0, 2], [5, 2, 2], [3, 4, 1], [2, 5, 3], [6, 10, 2], [4, 12, 4]]
const BLACK = new Set([1, 3, 6, 8]) // rows drawn as black keys
const rx = (cell: number): number => ROLL.x0 + cell * ROLL.cell
const ry = (row: number): number => ROLL.y0 + row * ROLL.row

// ---- key: eight rows of A minor from the top down (C … E); the scale's rows tinted, G# is off the key ----
const KEY_ROWS = ['C', 'B', 'A♯', 'A', 'G♯', 'G', 'F♯', 'F']
const IN_KEY = new Set(['G', 'F', 'E', 'D', 'C', 'B', 'A'])

// ---- chords: four bars of the A minor placeholder progression ----
const CHORDS = [{ n: 'Am', r: 'i' }, { n: 'F', r: 'VI' }, { n: 'C', r: 'III' }, { n: 'G', r: 'VII' }]
const PICK = ['Am', 'Dm', 'Em', 'F', 'G', 'C']

// ---- parts: the ribbon in the notes and the tags in the lyrics ----
const PARTS = computed(() => ([
  { type: 'intro', bars: 4, tag: '[Intro]' },
  { type: 'verse', bars: 8, tag: '[Verse]' },
  { type: 'chorus', bars: 8, tag: '[Chorus]' },
  { type: 'outro', bars: 4, tag: '[Outro]' },
] as const).map((p) => ({ ...p, name: t(`score.sectionTypes.${p.type}`), color: SECTION_COLORS[p.type] })))

// ---- simple: five syllables, the last one held over two notes ----
const syllables = computed(() => (tm('notesHelp.fig.syllables') as unknown[]).map((x) => String(x)))
const DOTS: { x: number; y: number; syl: number }[] = [
  { x: 50, y: 78, syl: 0 }, { x: 125, y: 62, syl: 1 }, { x: 200, y: 46, syl: 2 }, { x: 275, y: 30, syl: 3 }, { x: 340, y: 54, syl: 4 }, { x: 400, y: 70, syl: 4 },
]
const contour = DOTS.map((d) => `${d.x},${d.y}`).join(' ')
</script>

<template>
  <!-- music runs left to right whatever the page's direction -->
  <figure dir="ltr" class="m-0 w-full max-w-[520px] overflow-hidden rounded-lg border border-border/70 bg-[#14141b] p-2.5" aria-hidden="true">
    <!-- higher = higher, longer = longer -->
    <svg v-if="kind === 'roll'" viewBox="0 0 480 172" class="block h-auto w-full" font-family="inherit">
      <defs>
        <linearGradient :id="`${gid}-v`" x1="0" x2="1"><stop offset="0" stop-color="#a855f7" /><stop offset="1" stop-color="#ec4899" /></linearGradient>
      </defs>
      <g v-for="r in ROLL.rows" :key="`k${r}`">
        <rect x="4" :y="ry(r - 1)" width="26" :height="ROLL.row - 1" rx="2" :fill="BLACK.has(r - 1) ? '#24242e' : '#d6d6e0'" />
        <rect :x="ROLL.x0" :y="ry(r - 1)" :width="ROLL.cells * ROLL.cell" :height="ROLL.row" :fill="BLACK.has(r - 1) ? '#17171f' : '#1d1d26'" />
      </g>
      <line v-for="c in ROLL.cells + 1" :key="`c${c}`" :x1="rx(c - 1)" :x2="rx(c - 1)" :y1="ROLL.y0" :y2="ry(ROLL.rows)" :stroke="(c - 1) % 8 === 0 ? '#4a4a5c' : (c - 1) % 2 === 0 ? '#2c2c38' : '#22222c'" :stroke-width="(c - 1) % 8 === 0 ? 2 : 1" />
      <rect v-for="(n, i) in rollNotes" :key="`n${i}`" :x="rx(n[1]) + 1" :y="ry(n[0]) + 1" :width="n[2] * ROLL.cell - 2" :height="ROLL.row - 2" rx="3" :fill="`url(#${gid}-v)`" />
      <!-- higher / lower -->
      <path d="M 404 112 L 404 16" stroke="#d8b4fe" stroke-width="1.6" />
      <path d="M 398 24 L 404 14 L 410 24" fill="none" stroke="#d8b4fe" stroke-width="1.6" />
      <text x="412" y="22" font-size="11.5" fill="#e4e4ec">{{ f('higher') }}</text>
      <text x="412" y="112" font-size="11.5" fill="#9a9aab">{{ f('lower') }}</text>
      <!-- long note, short note, rest -->
      <path :d="`M ${rx(5)} 134 v 5 h ${3 * ROLL.cell} v -5`" fill="none" stroke="#d8b4fe" stroke-width="1.4" />
      <text :x="rx(5) + 1.5 * ROLL.cell" y="153" font-size="11.5" fill="#e4e4ec" text-anchor="middle">{{ f('longer') }}</text>
      <path :d="`M ${rx(4)} 134 v 5 h ${ROLL.cell} v -5`" fill="none" stroke="#9a9aab" stroke-width="1.2" />
      <text :x="rx(4) + ROLL.cell / 2" y="167" font-size="10.5" fill="#9a9aab" text-anchor="middle">{{ f('shorter') }}</text>
      <path :d="`M ${rx(8)} 134 v 5 h ${2 * ROLL.cell} v -5`" fill="none" stroke="#9a9aab" stroke-width="1.2" stroke-dasharray="3 2" />
      <text :x="rx(9)" y="167" font-size="11" fill="#9a9aab" text-anchor="middle">{{ f('pause') }}</text>
      <text :x="rx(16)" y="167" font-size="11" fill="#9a9aab" text-anchor="end">{{ f('time') }}</text>
    </svg>

    <!-- a bar and its seconds -->
    <svg v-else-if="kind === 'bars'" viewBox="0 0 480 120" class="block h-auto w-full">
      <rect x="40" y="22" width="100" height="30" fill="rgba(168,85,247,.22)" />
      <g v-for="b in 4" :key="`b${b}`">
        <text :x="40 + (b - 1) * 100 + 6" y="16" font-size="11" fill="#9a9aab">{{ b }}</text>
        <line v-for="q in 3" :key="`q${q}`" :x1="40 + (b - 1) * 100 + q * 25" :x2="40 + (b - 1) * 100 + q * 25" y1="38" y2="52" stroke="#4a4a5c" stroke-width="1" />
      </g>
      <rect x="40" y="22" width="400" height="30" fill="none" stroke="#3a3a4a" />
      <line v-for="b in 5" :key="`l${b}`" :x1="40 + (b - 1) * 100" :x2="40 + (b - 1) * 100" y1="22" y2="52" stroke="#6b6b82" stroke-width="2" />
      <circle v-for="q in 4" :key="`d${q}`" :cx="40 + (q - 1) * 25 + 12.5" cy="31" r="3.2" fill="#d8b4fe" />
      <path d="M 40 58 v 5 h 100 v -5" fill="none" stroke="#d8b4fe" stroke-width="1.4" />
      <text x="90" y="77" font-size="12" font-weight="600" fill="#e4e4ec" text-anchor="middle">{{ f('barTime') }}</text>
      <text x="90" y="93" font-size="10.5" fill="#9a9aab" text-anchor="middle">{{ f('beats') }}</text>
      <path d="M 40 100 v 5 h 400 v -5" fill="none" stroke="#6b6b82" stroke-width="1.2" />
      <text x="440" y="77" font-size="11.5" fill="#e4e4ec" text-anchor="end">{{ f('fourBars') }}</text>
      <text x="240" y="118" font-size="10.5" fill="#9a9aab" text-anchor="middle">{{ f('at') }}</text>
    </svg>

    <!-- the two lanes: the instrument plays where the voice rests -->
    <svg v-else-if="kind === 'lanes'" viewBox="0 0 480 150" class="block h-auto w-full">
      <defs>
        <linearGradient :id="`${gid}-v`" x1="0" x2="1"><stop offset="0" stop-color="#a855f7" /><stop offset="1" stop-color="#ec4899" /></linearGradient>
      </defs>
      <rect x="0" y="6" width="3" height="54" :fill="`url(#${gid}-v)`" />
      <rect x="0" y="68" width="3" height="54" fill="#2dd4bf" />
      <text x="10" y="37" font-size="12" font-weight="600" fill="#e4e4ec">{{ f('vocal') }}</text>
      <text x="10" y="99" font-size="12" font-weight="600" fill="#e4e4ec">{{ f('ins') }}</text>
      <rect x="96" y="6" width="380" height="54" fill="#1d1d26" />
      <rect x="96" y="68" width="380" height="54" fill="#1d1d26" />
      <line v-for="b in 5" :key="`l${b}`" :x1="96 + (b - 1) * 95" :x2="96 + (b - 1) * 95" y1="6" y2="122" stroke="#3a3a4a" stroke-width="2" />
      <!-- vocal: bars 2-3 -->
      <rect v-for="(n, i) in [[0, 30, 22], [24, 22, 18], [44, 14, 30], [96, 26, 20], [118, 18, 22], [142, 34, 44]]" :key="`v${i}`" :x="191 + n[0]" :y="n[1]" :width="n[2] - 2" height="9" rx="2.5" :fill="`url(#${gid}-v)`" />
      <!-- instrument: bar 1 and bar 4 -->
      <rect v-for="(n, i) in [[2, 96, 22], [26, 88, 22], [50, 80, 40]]" :key="`i${i}`" :x="96 + n[0]" :y="n[1]" :width="n[2] - 2" height="9" rx="2.5" fill="#2dd4bf" />
      <rect v-for="(n, i) in [[2, 84, 30], [34, 92, 22], [58, 100, 34]]" :key="`j${i}`" :x="381 + n[0]" :y="n[1]" :width="n[2] - 2" height="9" rx="2.5" fill="#2dd4bf" />
      <text x="143" y="140" font-size="11" fill="#9a9aab" text-anchor="middle">{{ f('intro') }}</text>
      <text x="286" y="140" font-size="11" fill="#e4e4ec" text-anchor="middle">{{ f('sing') }}</text>
      <text x="428" y="140" font-size="11" fill="#9a9aab" text-anchor="middle">{{ f('brk') }}</text>
    </svg>

    <!-- the written and the sung octave of a male voice -->
    <svg v-else-if="kind === 'octave'" viewBox="0 0 480 130" class="block h-auto w-full">
      <defs>
        <linearGradient :id="`${gid}-v`" x1="0" x2="1"><stop offset="0" stop-color="#a855f7" /><stop offset="1" stop-color="#ec4899" /></linearGradient>
      </defs>
      <line x1="40" x2="440" y1="30" y2="30" stroke="#2c2c38" />
      <line x1="40" x2="440" y1="92" y2="92" stroke="#2c2c38" />
      <text x="34" y="34" font-size="10.5" fill="#9a9aab" text-anchor="end">C5</text>
      <text x="34" y="96" font-size="10.5" fill="#9a9aab" text-anchor="end">C4</text>
      <rect x="70" y="24" width="120" height="12" rx="3" :fill="`url(#${gid}-v)`" />
      <text x="130" y="16" font-size="11.5" fill="#e4e4ec" text-anchor="middle">{{ f('written') }}</text>
      <path d="M 200 32 C 250 32, 250 90, 290 90" fill="none" stroke="#d8b4fe" stroke-width="1.5" stroke-dasharray="4 3" />
      <path d="M 282 85 L 292 90 L 282 95" fill="none" stroke="#d8b4fe" stroke-width="1.5" />
      <rect x="300" y="86" width="120" height="12" rx="3" fill="none" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="4 2" />
      <text x="360" y="114" font-size="11.5" fill="#e4e4ec" text-anchor="middle">{{ f('sung') }}</text>
      <text x="240" y="126" font-size="10.5" fill="#9a9aab" text-anchor="middle">{{ f('octaveNote') }}</text>
    </svg>

    <!-- the key's rows and the pencil snapping onto one -->
    <svg v-else-if="kind === 'key'" viewBox="0 0 480 132" class="block h-auto w-full">
      <defs>
        <linearGradient :id="`${gid}-v`" x1="0" x2="1"><stop offset="0" stop-color="#a855f7" /><stop offset="1" stop-color="#ec4899" /></linearGradient>
      </defs>
      <g v-for="(n, i) in KEY_ROWS" :key="n">
        <rect x="40" :y="6 + i * 15" width="280" height="14" :fill="IN_KEY.has(n) ? 'rgba(168,85,247,.18)' : '#17171f'" />
        <text x="32" :y="17 + i * 15" font-size="11" :fill="IN_KEY.has(n) ? '#e4e4ec' : '#6b6b82'" text-anchor="end">{{ n }}</text>
      </g>
      <!-- tried on G# (off the key), lands on G next to it (in key) -->
      <rect x="150" y="67" width="70" height="12" rx="3" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 2" />
      <path d="M 136 68 l 9 10 M 145 68 l -9 10" stroke="#ef4444" stroke-width="1.5" />
      <path d="M 224 73 C 250 73, 250 88, 226 88" fill="none" stroke="#d8b4fe" stroke-width="1.4" />
      <path d="M 232 84 L 225 88 L 232 92" fill="none" stroke="#d8b4fe" stroke-width="1.4" />
      <rect x="150" y="82" width="70" height="12" rx="3" :fill="`url(#${gid}-v)`" />
      <text x="332" y="77" font-size="12" fill="#fca5a5">{{ f('offKey') }}</text>
      <text x="332" y="93" font-size="12" fill="#e4e4ec">{{ f('snapped') }}</text>
      <rect x="332" y="110" width="16" height="12" fill="rgba(168,85,247,.18)" />
      <text x="354" y="120" font-size="11.5" fill="#9a9aab">{{ f('inKey') }}</text>
    </svg>

    <!-- chords: one a bar, the picker's fitting ones; Roman numerals for musicians -->
    <div v-else-if="kind === 'chords'" class="space-y-2.5 p-1">
      <p class="m-0 text-[11px] text-[#9a9aab]">{{ f('chordsTitle') }}</p>
      <div class="grid grid-cols-4 gap-1.5">
        <span v-for="(c, i) in CHORDS" :key="c.n" class="flex h-6 items-center gap-1.5 rounded-md border px-2 text-[12px] font-semibold" :class="i === 1 ? 'border-[#ec4899] bg-[#ec4899]/30 text-white' : 'border-[#ec4899]/30 bg-[#ec4899]/10 text-[#f9a8d4]'">
          {{ c.n }}<small class="font-mono text-[10px] font-medium opacity-70">{{ c.r }}</small>
        </span>
      </div>
      <div class="ms-[25%] w-fit rounded-lg border border-border bg-panel p-2">
        <p class="m-0 mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-[#9a9aab]">{{ f('picker') }}</p>
        <div class="flex flex-wrap gap-1">
          <span v-for="c in PICK" :key="c" class="rounded-md border px-2 py-0.5 text-[12px] font-semibold" :class="c === 'F' ? 'border-[#ec4899] text-[#f9a8d4]' : 'border-border text-text'">{{ c }}</span>
        </div>
      </div>
    </div>

    <!-- parts in the notes against the lyrics' tags -->
    <div v-else-if="kind === 'parts'" class="space-y-1.5 p-1">
      <p class="m-0 text-[11px] text-[#9a9aab]">{{ f('partsRibbon') }}</p>
      <div class="flex gap-[3px]">
        <span v-for="p in PARTS" :key="p.type" class="truncate rounded px-1.5 py-0.5 text-center text-[11px] font-semibold" :style="{ flex: p.bars, background: p.color[0], color: p.color[1] }">{{ p.name }}</span>
      </div>
      <div class="flex gap-[3px]" aria-hidden="true">
        <span v-for="p in PARTS" :key="p.type" class="flex justify-center" :style="{ flex: p.bars }"><span class="h-3 w-px bg-[#6b6b82]"></span></span>
      </div>
      <div class="flex gap-[3px]">
        <span v-for="p in PARTS" :key="p.type" class="truncate rounded border border-border bg-panel px-1 py-0.5 text-center font-mono text-[11px] text-text" :style="{ flex: p.bars }">{{ p.tag }}</span>
      </div>
      <p class="m-0 text-[11px] text-[#9a9aab]">{{ f('lyricsTags') }}</p>
    </div>

    <!-- the simple view: dots over syllables, the last syllable held -->
    <svg v-else viewBox="0 0 480 130" class="block h-auto w-full">
      <defs>
        <linearGradient :id="`${gid}-v`" x1="0" x2="1"><stop offset="0" stop-color="#a855f7" /><stop offset="1" stop-color="#ec4899" /></linearGradient>
      </defs>
      <text x="470" y="16" font-size="11" fill="#9a9aab" text-anchor="end">{{ f('counter') }}</text>
      <polyline :points="contour" fill="none" :stroke="`url(#${gid}-v)`" stroke-width="2" />
      <circle v-for="(d, i) in DOTS" :key="`d${i}`" :cx="d.x" :cy="d.y" r="6" fill="#e4e4ec" stroke="#a855f7" stroke-width="2.5" />
      <text v-for="(s, i) in syllables.slice(0, 4)" :key="`s${i}`" :x="DOTS[i].x" y="108" font-size="13" fill="#e4e4ec" text-anchor="middle">{{ s }}</text>
      <text x="370" y="108" font-size="13" fill="#e4e4ec" text-anchor="middle">{{ syllables[4] }}</text>
      <path d="M 334 92 v 4 h 72 v -4" fill="none" stroke="#d8b4fe" stroke-width="1.2" />
      <text x="370" y="124" font-size="10.5" fill="#d8b4fe" text-anchor="middle">{{ f('melisma') }}</text>
    </svg>
  </figure>
</template>
