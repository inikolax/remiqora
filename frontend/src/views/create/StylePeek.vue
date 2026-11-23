<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CopyIcon from '../../components/shared/icons/CopyIcon.vue'
import CheckIcon from '../../components/shared/icons/CheckIcon.vue'

/** A small card over the list with a song's whole style and its words; the list under it does not move. */
const props = defineProps<{ styleText: string; lyrics: string }>()
const { t } = useI18n()

const tags = computed(() => props.styleText.split(',').map((x) => x.trim()).filter(Boolean))
const lines = computed(() => props.lyrics.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  .map((l) => ({ text: /^\[.*\]$/.test(l) ? l.slice(1, -1) : l, section: /^\[.*\]$/.test(l) })))
const sung = computed(() => lines.value.filter((l) => !l.section).length)

const copied = ref<'style' | 'lyrics' | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null
async function copy(what: 'style' | 'lyrics'): Promise<void> {
  try {
    await navigator.clipboard.writeText(what === 'style' ? props.styleText : props.lyrics)
    copied.value = what
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { copied.value = null }, 1500)
  } catch {
    // no clipboard (an insecure context): the text can still be selected by hand
  }
}
// tabindex -1 on the card: opened from the menu, the focus moves into it (TakeRow)
const COPY_BTN = 'ms-auto flex h-6 w-6 items-center justify-center rounded-md text-text-dim hover:bg-panel hover:text-text'
</script>

<template>
  <div class="w-[min(26rem,calc(100vw-2rem))] rounded-xl border border-border bg-panel-2 px-3 py-2.5 shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent1/60" role="dialog" :aria-label="t('create.styleAndLyrics')" tabindex="-1">
    <template v-if="styleText">
      <div class="flex items-center gap-2 text-xs text-text-dim">
        <span class="font-semibold text-text">{{ t('create.peek.style') }}</span>{{ t('create.peek.tags', { n: tags.length }) }}
        <button type="button" :class="COPY_BTN" :title="copied === 'style' ? t('create.peek.copied') : t('create.peek.copy')" :aria-label="t('create.peek.copy')" @click="copy('style')">
          <CheckIcon v-if="copied === 'style'" class="h-3.5 w-3.5 text-status-done" /><CopyIcon v-else class="h-3.5 w-3.5" />
        </button>
      </div>
      <p class="mt-1 text-[12.5px] leading-normal text-text">
        <template v-for="(tag, i) in tags" :key="i">{{ tag }}<span v-if="i < tags.length - 1" class="text-text-dim">, </span></template>
      </p>
    </template>
    <div v-if="styleText" class="-mx-3 my-2 h-px bg-border"></div>
    <div class="flex items-center gap-2 text-xs text-text-dim">
      <span class="font-semibold text-text">{{ t('create.peek.lyrics') }}</span><template v-if="sung">{{ t('create.peek.lines', { n: sung }) }}</template>
      <button v-if="sung" type="button" :class="COPY_BTN" :title="copied === 'lyrics' ? t('create.peek.copied') : t('create.peek.copy')" :aria-label="t('create.peek.copy')" @click="copy('lyrics')">
        <CheckIcon v-if="copied === 'lyrics'" class="h-3.5 w-3.5 text-status-done" /><CopyIcon v-else class="h-3.5 w-3.5" />
      </button>
    </div>
    <div v-if="sung" class="mt-1 max-h-44 overflow-y-auto pe-1 text-[12.5px] leading-relaxed text-text" tabindex="0">
      <template v-for="(l, i) in lines" :key="i">
        <span v-if="l.section" class="mt-1 block text-[11px] text-text-dim first:mt-0">{{ l.text }}</span>
        <span v-else class="block" dir="auto">{{ l.text }}</span>
      </template>
    </div>
    <p v-else class="mt-1 text-xs text-text-dim">{{ t('create.peek.noLyrics') }}</p>
  </div>
</template>
